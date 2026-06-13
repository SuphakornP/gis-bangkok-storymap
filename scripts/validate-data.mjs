import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT_DIR, "public", "data");
const DISTRICT_TOPO_PATH = path.join(DATA_DIR, "bangkok_district_topo.json");
const POI_PATH = path.join(DATA_DIR, "poi.geojson");
const METRICS_PATH = path.join(DATA_DIR, "district_metrics.json");
const MANIFEST_PATH = path.join(DATA_DIR, "data_manifest.json");
const CATEGORIES = new Set(["transit", "park", "school", "hospital", "service"]);
const SCORE_FIELDS = ["flood", "accessibility", "pressure"];

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function inBangkokBounds([lng, lat]) {
  return lng >= 100.3 && lng <= 101 && lat >= 13.45 && lat <= 14;
}

function validateScore(score, label, issues) {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    issues.push(`${label} must be an integer from 0 to 100`);
  }
}

function boundaryCodes(topology, issues) {
  const geometries = topology?.objects?.data?.geometries;
  if (!Array.isArray(geometries)) {
    issues.push("boundary topology must include objects.data.geometries");
    return new Set();
  }

  if (geometries.length !== 50) {
    issues.push(`boundary must contain 50 districts, found ${geometries.length}`);
  }

  const codes = new Set();
  for (const geometry of geometries) {
    const code = String(geometry.properties?.dcode || "");
    if (!/^\d{4}$/.test(code)) issues.push(`boundary district has invalid dcode: ${code}`);
    if (codes.has(code)) issues.push(`boundary has duplicate dcode: ${code}`);
    codes.add(code);
  }
  return codes;
}

function validatePoi(poi, districtCodes, issues) {
  if (poi.type !== "FeatureCollection") issues.push("poi.geojson must be a FeatureCollection");
  if (!Array.isArray(poi.features)) issues.push("poi.geojson must include features array");
  if (!poi.generated_at) issues.push("poi.geojson must include generated_at");

  const ids = new Set();
  for (const [index, feature] of (poi.features || []).entries()) {
    const prefix = `POI feature ${index}`;
    const properties = feature.properties || {};
    const coordinates = feature.geometry?.coordinates;

    if (!properties.id) issues.push(`${prefix} missing properties.id`);
    if (ids.has(properties.id)) issues.push(`${prefix} duplicate id ${properties.id}`);
    ids.add(properties.id);
    if (!properties.name) issues.push(`${prefix} missing properties.name`);
    if (!CATEGORIES.has(properties.category)) {
      issues.push(`${prefix} has invalid category ${properties.category}`);
    }
    if (properties.source !== "OpenStreetMap") issues.push(`${prefix} source must be OpenStreetMap`);
    if (!properties.source_url) issues.push(`${prefix} missing source_url`);
    if (!districtCodes.has(String(properties.district_code))) {
      issues.push(`${prefix} has unknown district_code ${properties.district_code}`);
    }
    if (feature.geometry?.type !== "Point") issues.push(`${prefix} geometry must be Point`);
    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      !isFiniteNumber(coordinates[0]) ||
      !isFiniteNumber(coordinates[1]) ||
      !inBangkokBounds(coordinates)
    ) {
      issues.push(`${prefix} has invalid Bangkok coordinates`);
    }
  }
}

function validateMetrics(metrics, districtCodes, issues) {
  if (metrics.version !== 1) issues.push("district_metrics.json version must be 1");
  if (!metrics.generated_at) issues.push("district_metrics.json must include generated_at");
  if (!metrics.methodology) issues.push("district_metrics.json must include methodology");
  if (!metrics.districts || typeof metrics.districts !== "object") {
    issues.push("district_metrics.json must include districts object");
    return;
  }

  const metricCodes = Object.keys(metrics.districts);
  if (metricCodes.length !== 50) {
    issues.push(`district_metrics must contain 50 districts, found ${metricCodes.length}`);
  }

  for (const code of districtCodes) {
    const district = metrics.districts[code];
    if (!district) {
      issues.push(`district_metrics missing district ${code}`);
      continue;
    }
    if (district.code !== code) issues.push(`district ${code} code field mismatch`);
    if (!district.name) issues.push(`district ${code} missing name`);
    if (!district.english) issues.push(`district ${code} missing english`);
    if (!isFiniteNumber(district.area_sqm) || district.area_sqm <= 0) {
      issues.push(`district ${code} area_sqm must be positive`);
    }
    if (!district.region) issues.push(`district ${code} missing region`);
    if (!district.zoning?.label) issues.push(`district ${code} missing zoning.label`);
    if (!district.links?.png || !district.links?.pdf) issues.push(`district ${code} missing BMA links`);

    for (const field of SCORE_FIELDS) {
      validateScore(district[field]?.score, `district ${code} ${field}.score`, issues);
      if (!district[field]?.source) issues.push(`district ${code} ${field} missing source`);
    }

    const accessibility = district.accessibility;
    if (accessibility?.methodology !== "walking_distance_proxy") {
      issues.push(`district ${code} accessibility methodology must be walking_distance_proxy`);
    }
    for (const category of CATEGORIES) {
      const nearest = accessibility?.nearest_meters?.[category];
      if (nearest !== null && (!Number.isInteger(nearest) || nearest < 0)) {
        issues.push(`district ${code} accessibility.nearest_meters.${category} invalid`);
      }
      const inside = accessibility?.poi_in_district?.[category];
      if (!Number.isInteger(inside) || inside < 0) {
        issues.push(`district ${code} accessibility.poi_in_district.${category} invalid`);
      }
    }
  }
}

function validateManifest(manifest, metrics, poi, issues) {
  if (manifest.version !== 1) issues.push("data_manifest.json version must be 1");
  if (!manifest.generated_at) issues.push("data_manifest.json must include generated_at");
  if (!Array.isArray(manifest.sources) || manifest.sources.length < 2) {
    issues.push("data_manifest.json must include sources");
  }
  if (!manifest.record_counts) issues.push("data_manifest.json must include record_counts");
  if (manifest.record_counts?.districts !== Object.keys(metrics.districts || {}).length) {
    issues.push("manifest district count does not match metrics");
  }
  if (manifest.record_counts?.poi_total !== (poi.features || []).length) {
    issues.push("manifest POI count does not match poi.geojson");
  }
  for (const category of CATEGORIES) {
    const count = manifest.record_counts?.poi_by_category?.[category];
    if (!Number.isInteger(count) || count < 0) {
      issues.push(`manifest missing poi_by_category.${category}`);
    }
  }
}

async function main() {
  const issues = [];
  const [topology, poi, metrics, manifest] = await Promise.all([
    readJson(DISTRICT_TOPO_PATH),
    readJson(POI_PATH),
    readJson(METRICS_PATH),
    readJson(MANIFEST_PATH),
  ]);

  const districtCodes = boundaryCodes(topology, issues);
  validatePoi(poi, districtCodes, issues);
  validateMetrics(metrics, districtCodes, issues);
  validateManifest(manifest, metrics, poi, issues);

  if (issues.length) {
    console.error(`Data validation failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        districts: districtCodes.size,
        poi_total: poi.features.length,
        generated_at: manifest.generated_at,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
