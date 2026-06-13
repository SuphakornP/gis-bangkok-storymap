import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature as topojsonFeature } from "topojson-client";
import * as turf from "@turf/turf";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT_DIR, "public", "data");
const DISTRICT_TOPO_PATH = path.join(DATA_DIR, "bangkok_district_topo.json");
const POI_PATH = path.join(DATA_DIR, "poi.geojson");
const METRICS_PATH = path.join(DATA_DIR, "district_metrics.json");
const MANIFEST_PATH = path.join(DATA_DIR, "data_manifest.json");

const SOURCE_BASE = "https://cityplangis.bangkok.go.th/cpdPortal/wp-content/uploads/2019/08";
const BOUNDARY_SOURCE_URL =
  "https://github.com/prasertcbs/thailand_gis/tree/main/bangkok/district";
const OVERPASS_ENDPOINT =
  process.env.OVERPASS_ENDPOINT || "https://overpass-api.de/api/interpreter";
const OVERPASS_BBOX = {
  south: 13.49,
  west: 100.32,
  north: 13.96,
  east: 100.95,
};
const CATEGORY_ORDER = ["transit", "park", "school", "hospital", "service"];
const ACCESS_RADIUS_METERS = [450, 900, 1350];

const scenarioProfiles = {
  1001: ["core", "mixed heritage", 58, 72],
  1002: ["core", "civic residential", 55, 68],
  1003: ["east", "agricultural edge", 67, 46],
  1004: ["core", "commercial core", 52, 84],
  1005: ["north", "residential", 49, 58],
  1006: ["east", "mixed residential", 61, 66],
  1007: ["core", "commercial core", 44, 88],
  1008: ["core", "mixed heritage", 54, 80],
  1009: ["east", "transit mixed-use", 68, 82],
  1010: ["east", "suburban mixed", 70, 52],
  1011: ["east", "logistics industrial", 82, 60],
  1012: ["core", "river mixed-use", 66, 73],
  1013: ["core", "commercial heritage", 62, 82],
  1014: ["core", "transit mixed-use", 48, 84],
  1015: ["west", "river residential", 63, 68],
  1016: ["west", "river heritage", 61, 62],
  1017: ["core", "mixed residential", 56, 76],
  1018: ["west", "river mixed-use", 59, 74],
  1019: ["west", "low-rise residential", 64, 48],
  1020: ["west", "river mixed-use", 60, 64],
  1021: ["west", "coastal ecological", 91, 55],
  1022: ["west", "residential mixed", 57, 60],
  1023: ["west", "suburban residential", 62, 49],
  1024: ["west", "industrial river", 72, 63],
  1025: ["west", "river residential", 58, 65],
  1026: ["core", "high-density residential", 52, 80],
  1027: ["east", "residential", 63, 58],
  1028: ["core", "commercial core", 50, 84],
  1029: ["north", "rail interchange", 55, 78],
  1030: ["north", "transit park", 48, 84],
  1031: ["core", "river mixed-use", 65, 70],
  1032: ["east", "suburban mixed", 66, 57],
  1033: ["core", "port mixed-use", 74, 86],
  1034: ["east", "residential mixed", 59, 63],
  1035: ["west", "residential", 61, 56],
  1036: ["north", "airport urban edge", 57, 58],
  1037: ["core", "transit commercial", 45, 86],
  1038: ["north", "residential mixed", 56, 64],
  1039: ["core", "commercial residential", 53, 87],
  1040: ["west", "suburban mixed", 58, 56],
  1041: ["north", "civic residential", 51, 61],
  1042: ["north", "suburban residential", 54, 49],
  1043: ["east", "residential", 60, 55],
  1044: ["east", "residential", 64, 53],
  1045: ["east", "residential mixed", 57, 64],
  1046: ["east", "canal suburban", 75, 50],
  1047: ["east", "transit industrial edge", 76, 82],
  1048: ["west", "green suburban", 55, 48],
  1049: ["west", "residential industrial", 66, 52],
  1050: ["west", "industrial residential", 67, 51],
};

function overpassQuery() {
  const bbox = `${OVERPASS_BBOX.south},${OVERPASS_BBOX.west},${OVERPASS_BBOX.north},${OVERPASS_BBOX.east}`;
  return `
    [out:json][timeout:90];
    (
      nwr["railway"="station"](${bbox});
      nwr["public_transport"="station"](${bbox});
      nwr["amenity"~"^(school|kindergarten|college|university|hospital|clinic|doctors|townhall)$"](${bbox});
      nwr["leisure"="park"](${bbox});
      nwr["office"="government"](${bbox});
    );
    out center tags;
  `;
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function districtCode(feature) {
  return String(feature.properties?.dcode || "").padStart(4, "0");
}

function cleanThaiDistrictName(name) {
  return String(name || "").replace(/^เขต/, "").trim();
}

function loadDistrictFeatureCollection(topology) {
  const collection = topojsonFeature(topology, topology.objects.data);
  collection.features.sort((a, b) => districtCode(a).localeCompare(districtCode(b)));
  return collection;
}

async function fetchOverpassElements() {
  const body = new URLSearchParams({ data: overpassQuery() });
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "bangkok-gis-risk-access/0.1 data refresh",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Overpass request failed: ${response.status} ${response.statusText} ${text.slice(0, 300)}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.elements)) {
    throw new Error("Overpass response did not include an elements array");
  }
  return payload.elements;
}

function serviceNameLooksRelevant(tags) {
  const text = [tags.name, tags["name:en"], tags.official_name, tags.operator]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /สำนักงานเขต|district office|bangkok|กรุงเทพ|bma|ศาลาว่าการ|city hall/.test(text);
}

function categoryFromTags(tags = {}) {
  if (tags.railway === "station" || tags.public_transport === "station") return "transit";
  if (tags.leisure === "park") return "park";
  if (["hospital", "clinic", "doctors"].includes(tags.amenity)) return "hospital";
  if (["school", "kindergarten", "college", "university"].includes(tags.amenity)) return "school";
  if (tags.amenity === "townhall") return "service";
  if (tags.office === "government" && serviceNameLooksRelevant(tags)) return "service";
  return null;
}

function elementCoordinates(element) {
  if (typeof element.lon === "number" && typeof element.lat === "number") {
    return [element.lon, element.lat];
  }
  if (typeof element.center?.lon === "number" && typeof element.center?.lat === "number") {
    return [element.center.lon, element.center.lat];
  }
  return null;
}

function displayName(tags = {}, category, osmId) {
  return (
    tags["name:en"] ||
    tags.name ||
    tags.official_name ||
    tags.operator ||
    `${category}-${osmId}`
  );
}

function findDistrict(pointFeature, districtFeatures) {
  return districtFeatures.find((district) => turf.booleanPointInPolygon(pointFeature, district));
}

function normalizePoi(elements, districtFeatures) {
  const seen = new Set();
  const features = [];

  for (const element of elements) {
    const tags = element.tags || {};
    const category = categoryFromTags(tags);
    const coordinates = elementCoordinates(element);
    if (!category || !coordinates) continue;

    const pointFeature = turf.point(coordinates);
    const district = findDistrict(pointFeature, districtFeatures);
    if (!district) continue;

    const id = `osm-${element.type}-${element.id}`;
    const categoryId = `${category}:${id}`;
    if (seen.has(categoryId)) continue;
    seen.add(categoryId);

    const code = districtCode(district);
    features.push({
      type: "Feature",
      id: categoryId,
      geometry: {
        type: "Point",
        coordinates: coordinates.map((value) => Number(value.toFixed(7))),
      },
      properties: {
        id: categoryId,
        name: displayName(tags, category, element.id),
        category,
        source: "OpenStreetMap",
        source_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        osm_type: element.type,
        osm_id: element.id,
        district_code: code,
        district_name: cleanThaiDistrictName(district.properties?.dname),
        tags: {
          amenity: tags.amenity,
          railway: tags.railway,
          public_transport: tags.public_transport,
          station: tags.station,
          leisure: tags.leisure,
          office: tags.office,
          operator: tags.operator,
          network: tags.network,
        },
      },
    });
  }

  features.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.properties.category) - CATEGORY_ORDER.indexOf(b.properties.category) ||
      a.properties.name.localeCompare(b.properties.name, "th") ||
      a.properties.id.localeCompare(b.properties.id),
  );

  return {
    type: "FeatureCollection",
    name: "bangkok_osm_poi_snapshot",
    features,
  };
}

function scoreFromDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return 0;
  if (distanceMeters <= 450) return 100;
  if (distanceMeters <= 900) return 82;
  if (distanceMeters <= 1350) return 66;
  if (distanceMeters <= 2500) return 42;
  if (distanceMeters <= 5000) return 22;
  return 8;
}

function emptyCategoryMap(value = 0) {
  return Object.fromEntries(CATEGORY_ORDER.map((category) => [category, value]));
}

function nearestDistancesFrom(pointFeature, poiFeatures) {
  const nearest = emptyCategoryMap(null);
  for (const category of CATEGORY_ORDER) {
    const distances = poiFeatures
      .filter((poi) => poi.properties.category === category)
      .map((poi) => turf.distance(pointFeature, poi, { units: "kilometers" }) * 1000)
      .sort((a, b) => a - b);
    nearest[category] = distances.length ? Math.round(distances[0]) : null;
  }
  return nearest;
}

function countWithinRadii(pointFeature, poiFeatures) {
  const counts = Object.fromEntries(
    ACCESS_RADIUS_METERS.map((radius) => [String(radius), emptyCategoryMap(0)]),
  );

  for (const poi of poiFeatures) {
    const distanceMeters = turf.distance(pointFeature, poi, { units: "kilometers" }) * 1000;
    for (const radius of ACCESS_RADIUS_METERS) {
      if (distanceMeters <= radius) {
        counts[String(radius)][poi.properties.category] += 1;
      }
    }
  }

  return counts;
}

function countsInsideDistrict(districtFeature, poiFeatures) {
  const counts = emptyCategoryMap(0);
  for (const poi of poiFeatures) {
    if (poi.properties.district_code === districtCode(districtFeature)) {
      counts[poi.properties.category] += 1;
    }
  }
  return counts;
}

function accessScore(nearestMeters, insideCounts) {
  const weighted =
    scoreFromDistance(nearestMeters.transit) * 0.3 +
    scoreFromDistance(nearestMeters.park) * 0.2 +
    scoreFromDistance(nearestMeters.school) * 0.2 +
    scoreFromDistance(nearestMeters.hospital) * 0.2 +
    scoreFromDistance(nearestMeters.service) * 0.1;

  const insideBonus = Math.min(
    10,
    insideCounts.transit * 1.8 +
      insideCounts.park * 1.2 +
      insideCounts.school * 0.35 +
      insideCounts.hospital * 0.8 +
      insideCounts.service * 1.2,
  );

  return Math.max(0, Math.min(100, Math.round(weighted + insideBonus)));
}

function buildDistrictMetrics(districtFeatures, poiCollection) {
  const districts = {};

  for (const district of districtFeatures) {
    const code = districtCode(district);
    const [region = "unknown", zoning = "scenario pending", flood = 50, pressure = 50] =
      scenarioProfiles[code] || [];
    const centroid = turf.centroid(district);
    const nearestMeters = nearestDistancesFrom(centroid, poiCollection.features);
    const insideCounts = countsInsideDistrict(district, poiCollection.features);
    const score = accessScore(nearestMeters, insideCounts);

    districts[code] = {
      code,
      name: cleanThaiDistrictName(district.properties?.dname),
      english: district.properties?.dname_e || "Unknown",
      area_sqm: district.properties?.AREA,
      region,
      zoning: {
        label: zoning,
        source: "prototype_scenario",
        note: "Scenario label retained until official BMA zoning polygons are digitized or connected.",
      },
      flood: {
        score: flood,
        source: "prototype_scenario",
        note: "Scenario score retained until BMA flood/raster data is converted into district metrics.",
      },
      accessibility: {
        score,
        source: "OpenStreetMap",
        methodology: "walking_distance_proxy",
        note: "Proxy score based on straight-line distance to OSM POI and POI counts in district; not a network isochrone.",
        nearest_meters: nearestMeters,
        counts_within_meters: countWithinRadii(centroid, poiCollection.features),
        poi_in_district: insideCounts,
      },
      pressure: {
        score: pressure,
        source: "prototype_scenario",
        note: "Scenario score retained until permit, land value, or building change data is connected.",
      },
      links: {
        png: `${SOURCE_BASE}/${code}.png`,
        pdf: `${SOURCE_BASE}/${code}.pdf`,
      },
    };
  }

  return {
    version: 1,
    generated_at: null,
    methodology: {
      accessibility:
        "Weighted straight-line distance proxy from district centroid to OSM transit, park, school, hospital, and service POIs, with a small bonus for POI counts inside the district.",
      flood: "Prototype scenario values only.",
      zoning: "Prototype scenario labels only.",
      development_pressure: "Prototype scenario values only.",
    },
    districts,
  };
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildManifest(poiCollection, districtMetrics) {
  return {
    version: 1,
    generated_at: null,
    sources: [
      {
        id: "osm",
        label: "OpenStreetMap via Overpass API",
        url: OVERPASS_ENDPOINT,
        license: "Open Database License (ODbL)",
      },
      {
        id: "bangkok_district_boundary",
        label: "Bangkok district TopoJSON from prasertcbs/thailand_gis",
        url: BOUNDARY_SOURCE_URL,
      },
      {
        id: "bma_map_download",
        label: "BMA GIS map download links for district PNG/PDF assets",
        url: "https://cityplangis.bangkok.go.th/cpdPortal/index.php/map-download/",
      },
    ],
    record_counts: {
      districts: Object.keys(districtMetrics.districts).length,
      poi_total: poiCollection.features.length,
      poi_by_category: countBy(poiCollection.features, (feature) => feature.properties.category),
    },
    bbox: OVERPASS_BBOX,
    notes: [
      "The website renders this static snapshot and does not call Overpass from the browser.",
      "Accessibility is a walking-distance proxy, not a routed network isochrone.",
      "Flood, zoning, and development pressure are still prototype scenario layers.",
    ],
  };
}

function comparablePayload(poiCollection, districtMetrics, manifest) {
  return JSON.stringify({
    poi: poiCollection.features,
    districts: districtMetrics.districts,
    counts: manifest.record_counts,
  });
}

async function preserveGeneratedAtIfUnchanged(poiCollection, districtMetrics, manifest) {
  const [oldPoi, oldMetrics, oldManifest] = await Promise.all([
    readJson(POI_PATH),
    readJson(METRICS_PATH),
    readJson(MANIFEST_PATH),
  ]);

  const oldComparable =
    oldPoi && oldMetrics && oldManifest
      ? comparablePayload(oldPoi, oldMetrics, oldManifest)
      : null;
  const newComparable = comparablePayload(poiCollection, districtMetrics, manifest);
  const generatedAt =
    oldComparable === newComparable && oldManifest?.generated_at
      ? oldManifest.generated_at
      : new Date().toISOString();

  poiCollection.generated_at = generatedAt;
  districtMetrics.generated_at = generatedAt;
  manifest.generated_at = generatedAt;

  return oldComparable === newComparable;
}

async function main() {
  const topology = await readJson(DISTRICT_TOPO_PATH);
  if (!topology) throw new Error(`Missing district topology at ${DISTRICT_TOPO_PATH}`);

  const districtCollection = loadDistrictFeatureCollection(topology);
  const elements = await fetchOverpassElements();
  const poiCollection = normalizePoi(elements, districtCollection.features);
  const districtMetrics = buildDistrictMetrics(districtCollection.features, poiCollection);
  const manifest = buildManifest(poiCollection, districtMetrics);
  const unchanged = await preserveGeneratedAtIfUnchanged(poiCollection, districtMetrics, manifest);

  await Promise.all([
    writeJson(POI_PATH, poiCollection),
    writeJson(METRICS_PATH, districtMetrics),
    writeJson(MANIFEST_PATH, manifest),
  ]);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        unchanged,
        generated_at: manifest.generated_at,
        districts: manifest.record_counts.districts,
        poi_total: manifest.record_counts.poi_total,
        poi_by_category: manifest.record_counts.poi_by_category,
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
