const SOURCE_BASE =
  "https://cityplangis.bangkok.go.th/cpdPortal/wp-content/uploads/2019/08";

const LANGUAGE_STORAGE_KEY = "bangkok-gis-language";
const SUPPORTED_LANGUAGES = new Set(["th", "en"]);

const translations = {
  th: {
    documentTitle: "ต้นแบบ Bangkok GIS: Risk + Access",
    documentDescription:
      "Prototype แผนที่ Bangkok GIS สำหรับ district boundaries, flood x zoning scenario, accessibility rings และ story map.",
    languageToggle: {
      label: "เลือกภาษา",
    },
    aria: {
      controlPanel: "ตัวควบคุมแผนที่",
      mapStage: "แผนที่กรุงเทพฯ แบบโต้ตอบ",
      layerToggles: "Layer toggles",
      inspector: "รายละเอียดเขตที่เลือก",
    },
    brand: {
      eyebrow: "ต้นแบบ Bangkok GIS",
      titleFlood: "Flood",
      titleZoning: "Zoning",
      titleAccess: "Access",
      leadBoundary: "Bangkok district boundaries จาก prasertcbs/thailand_gis",
      leadSnapshot: "ใช้ static snapshot เพื่อซ้อน layer และสร้าง story map ของเมือง",
    },
    sections: {
      mode: "เลือกมุมมองแผนที่",
      search: "ค้นหาเขต",
      data: "ข้อมูลในต้นแบบ",
      story: "Story map",
      workflow: "Next GIS workflow",
    },
    search: {
      label: "ชื่อเขตหรือรหัส",
      placeholder: "บางนา, 1047, Khlong Toei",
    },
    dataNote: {
      boundaries: "District boundaries มาจาก TopoJSON จริง ส่วน POI และ accessibility proxy",
      snapshot: "มาจาก OpenStreetMap snapshot ส่วน flood exposure, zoning และ development pressure",
      scenario: "ยังเป็น scenario layer สำหรับออกแบบ workflow.",
      sourceLink: "แหล่งข้อมูล district boundaries กรุงเทพฯ",
    },
    topbar: {
      activeView: "มุมมองปัจจุบัน",
    },
    layers: {
      flood: "Flood",
      access: "Access proxy",
      poi: "POI",
    },
    downloads: {
      png: "PNG map",
      pdf: "PDF zoning",
    },
    story: {
      sceneCount: "3 stories",
    },
    workflow: {
      refresh: "Automate การดึง OSM POI เป็น static snapshot ก่อน render",
      flood: "แทนที่ scenario score ด้วย flood layer จาก BMA หรือ sensor/complaint data",
      zoning: "เชื่อมต่อ zoning polygon หรือ digitize จาก zoning PDF",
      isochrone: "คำนวณ isochrone ด้วย network graph แทน radius rings",
    },
    modes: {
      flood: {
        title: "Flood x Zoning",
        description: "ดูเขตที่ flood exposure สูงและใช้ประโยชน์ที่ดินเปราะบาง",
      },
      access: {
        title: "Accessibility proxy",
        description: "ดู access score จาก OSM POI snapshot ด้วยรัศมี 450/900/1350 เมตร",
      },
      story: {
        title: "Bangkok story map",
        description: "เล่าเรื่องคลองเตย-พระโขนง-บางนา, ลาดกระบัง, บางขุนเทียน",
      },
    },
    storyScenes: {
      "east-corridor": {
        title: "คลองเตย-พระโขนง-บางนา",
        description: "corridor เปลี่ยนผ่านจากท่าเรือและ mixed-use ไปสู่ transit / industrial edge",
      },
      "lat-krabang": {
        title: "ลาดกระบัง logistics edge",
        description:
          "เขตขนาดใหญ่ฝั่งตะวันออก เชื่อมสนามบินและ logistics network และมี flood exposure สูง",
      },
      "bang-khun-thian": {
        title: "บางขุนเทียน coastal risk",
        description: "ขอบเมืองชายฝั่ง สำหรับ story map เรื่อง flood exposure, land use และ ecosystem",
      },
    },
    units: {
      districts: "เขต",
      metersShort: " ม.",
      notAvailable: "ไม่มีข้อมูล",
    },
    risk: {
      veryHigh: "สูงมาก",
      high: "สูง",
      medium: "ปานกลาง",
      low: "ต่ำ",
    },
    legend: {
      accessTitle: "Accessibility proxy score",
      storyTitle: "Story focus",
      floodTitle: "Flood exposure scenario",
      accessRows: {
        veryHigh: "สูงมาก",
        high: "สูง",
        medium: "ปานกลาง",
        low: "ต่ำ",
        rings: "รัศมี 450/900/1350m",
      },
      storyRows: {
        focus: "เขตโฟกัส",
        other: "เขตอื่น",
        rings: "POI / service rings",
      },
      floodRows: {
        veryHigh: "เสี่ยงสูงมาก",
        high: "เสี่ยงสูง",
        medium: "ปานกลาง",
        low: "เสี่ยงต่ำ",
      },
    },
    poi: {
      transit: "transit",
      park: "park",
      school: "school",
      hospital: "hospital",
      service: "service",
    },
    metrics: {
      flood: "Flood exposure (scenario)",
      access: "Accessibility proxy (OSM)",
      pressure: "Development pressure (scenario)",
    },
    inspector: {
      districtPrefix: "เขต",
      unknownDistrict: "ไม่ทราบเขต",
      summary:
        "{english} · {zoning}. flood exposure และ zoning เป็น scenario; accessibility proxy อิงระยะเดินจาก OSM ({nearest}).",
    },
    freshness: {
      label: "Snapshot",
    },
    errors: {
      mapTitle: "โหลดแผนที่ไม่สำเร็จ",
      mapMessage:
        "ตรวจว่า static data snapshot มีครบ และเชื่อมต่อ CDN สำหรับ Leaflet/TopoJSON ได้",
      cdnUnavailable: "Leaflet หรือ TopoJSON CDN ไม่พร้อมใช้งาน",
      cannotLoad: "โหลด {label} ไม่สำเร็จ",
    },
  },
  en: {
    documentTitle: "Bangkok GIS Risk + Access Prototype",
    documentDescription:
      "Interactive Bangkok GIS prototype using district boundaries, flood x zoning scenarios, accessibility rings, and story-map views.",
    languageToggle: {
      label: "Choose language",
    },
    aria: {
      controlPanel: "Map controls",
      mapStage: "Bangkok interactive map",
      layerToggles: "Layer toggles",
      inspector: "Selected district details",
    },
    brand: {
      eyebrow: "Bangkok GIS prototype",
      titleFlood: "Flood",
      titleZoning: "Zoning",
      titleAccess: "Access",
      leadBoundary: "Bangkok district boundaries from prasertcbs/thailand_gis",
      leadSnapshot: "Static data snapshots layer urban risk, access, and story views",
    },
    sections: {
      mode: "Map view",
      search: "Search districts",
      data: "Prototype data",
      story: "Story map",
      workflow: "Next GIS workflow",
    },
    search: {
      label: "District name or code",
      placeholder: "Bang Na, 1047, Khlong Toei",
    },
    dataNote: {
      boundaries: "District boundaries come from real TopoJSON data. POI and accessibility proxy",
      snapshot: "come from an OpenStreetMap snapshot. Flood, zoning, and development pressure",
      scenario: "remain scenario layers for workflow design.",
      sourceLink: "Bangkok district source",
    },
    topbar: {
      activeView: "Active view",
    },
    layers: {
      flood: "Flood",
      access: "Access proxy",
      poi: "POI",
    },
    downloads: {
      png: "PNG map",
      pdf: "PDF zoning",
    },
    story: {
      sceneCount: "3 scenes",
    },
    workflow: {
      refresh: "Automate OSM POI extraction into a static snapshot before rendering",
      flood: "Replace scenario scores with a BMA flood layer or sensor/complaint data",
      zoning: "Connect zoning polygons or digitize them from planning PDFs",
      isochrone: "Calculate real isochrones with a network graph instead of radius rings",
    },
    modes: {
      flood: {
        title: "Flood x Zoning",
        description: "See districts with higher flood exposure and vulnerable land-use scenarios.",
      },
      access: {
        title: "Accessibility proxy",
        description: "View access scores from the OSM POI snapshot using 450/900/1350 m rings.",
      },
      story: {
        title: "Bangkok story map",
        description: "Explore Khlong Toei-Phra Khanong-Bang Na, Lat Krabang, and Bang Khun Thian.",
      },
    },
    storyScenes: {
      "east-corridor": {
        title: "Khlong Toei-Phra Khanong-Bang Na",
        description:
          "A transition corridor from port and mixed-use districts toward transit and industrial edges.",
      },
      "lat-krabang": {
        title: "Lat Krabang logistics edge",
        description:
          "A large eastern district linked to the airport and logistics network with high flood exposure.",
      },
      "bang-khun-thian": {
        title: "Bang Khun Thian coastal risk",
        description: "A coastal urban edge for flood, land-use, and ecosystem storytelling.",
      },
    },
    units: {
      districts: "districts",
      metersShort: " m",
      notAvailable: "n/a",
    },
    risk: {
      veryHigh: "Very high",
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    legend: {
      accessTitle: "Accessibility proxy score",
      storyTitle: "Story focus",
      floodTitle: "Flood exposure scenario",
      accessRows: {
        veryHigh: "Very high",
        high: "High",
        medium: "Medium",
        low: "Low",
        rings: "450/900/1350 m rings",
      },
      storyRows: {
        focus: "Story district",
        other: "Other district",
        rings: "POI / service rings",
      },
      floodRows: {
        veryHigh: "Very high risk",
        high: "High risk",
        medium: "Medium",
        low: "Low",
      },
    },
    poi: {
      transit: "Transit",
      park: "Park",
      school: "School",
      hospital: "Hospital",
      service: "Service",
    },
    metrics: {
      flood: "Flood exposure (scenario)",
      access: "Accessibility proxy (OSM)",
      pressure: "Development pressure (scenario)",
    },
    inspector: {
      districtPrefix: "",
      unknownDistrict: "Unknown district",
      summary:
        "{english} · {zoning}. Flood/zoning are scenarios; accessibility is an OSM walking-distance proxy ({nearest}).",
    },
    freshness: {
      label: "Snapshot",
    },
    errors: {
      mapTitle: "Map failed to load",
      mapMessage:
        "Check that the static data snapshot is complete and the Leaflet/TopoJSON CDN is reachable",
      cdnUnavailable: "Leaflet or TopoJSON CDN is unavailable",
      cannotLoad: "Cannot load {label}",
    },
  },
};

const modes = [
  { id: "flood" },
  { id: "access" },
  { id: "story" },
];

const storyScenes = [
  {
    id: "east-corridor",
    districts: ["1033", "1009", "1047"],
    center: [13.685, 100.607],
    zoom: 12,
  },
  {
    id: "lat-krabang",
    districts: ["1011"],
    center: [13.724, 100.775],
    zoom: 11,
  },
  {
    id: "bang-khun-thian",
    districts: ["1021"],
    center: [13.58, 100.43],
    zoom: 11,
  },
];

const state = {
  language: getInitialLanguage(),
  mode: "flood",
  query: "",
  selectedCode: "1047",
  activeStory: null,
  geojson: null,
  metrics: null,
  manifest: null,
  poi: [],
  featureLayer: null,
  accessLayer: null,
  poiLayer: null,
};

let map;

const els = {
  modeStack: document.querySelector("#modeStack"),
  districtSearch: document.querySelector("#districtSearch"),
  districtList: document.querySelector("#districtList"),
  featureCount: document.querySelector("#featureCount"),
  activeTitle: document.querySelector("#activeTitle"),
  legend: document.querySelector("#legend"),
  selectedCode: document.querySelector("#selectedCode"),
  selectedName: document.querySelector("#selectedName"),
  selectedSummary: document.querySelector("#selectedSummary"),
  metricStack: document.querySelector("#metricStack"),
  downloadPng: document.querySelector("#downloadPng"),
  downloadPdf: document.querySelector("#downloadPdf"),
  storyList: document.querySelector("#storyList"),
  dataFreshness: document.querySelector("#dataFreshness"),
  toggleFlood: document.querySelector("#toggleFlood"),
  toggleAccess: document.querySelector("#toggleAccess"),
  togglePoi: document.querySelector("#togglePoi"),
  langTh: document.querySelector("#langTh"),
  langEn: document.querySelector("#langEn"),
};

function getInitialLanguage() {
  try {
    const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(stored) ? stored : "th";
  } catch {
    return "th";
  }
}

function currentCopy() {
  return translations[state.language] || translations.th;
}

function readCopy(path, source = currentCopy()) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function translate(path) {
  return readCopy(path) ?? readCopy(path, translations.th) ?? "";
}

function languageLocale() {
  return state.language === "th" ? "th-TH" : "en-US";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(languageLocale());
}

function modeCopy(mode) {
  return currentCopy().modes[mode.id];
}

function storyCopy(scene) {
  return currentCopy().storyScenes[scene.id];
}

function updateLanguageToggle() {
  const isThai = state.language === "th";
  els.langTh.classList.toggle("is-active", isThai);
  els.langTh.setAttribute("aria-pressed", String(isThai));
  els.langEn.classList.toggle("is-active", !isThai);
  els.langEn.setAttribute("aria-pressed", String(!isThai));
}

function applyStaticTranslations() {
  document.documentElement.lang = state.language;
  document.title = currentCopy().documentTitle;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", currentCopy().documentDescription);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", translate(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
  });

  updateLanguageToggle();
}

function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.has(language) || language === state.language) return;
  state.language = language;
  try {
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Language selection still works for the current session if storage is unavailable.
  }
  applyStaticTranslations();
  if (map) render();
}

function scoreOrDefault(value, fallback = 50) {
  return Number.isFinite(value) ? value : fallback;
}

function getProfile(code) {
  const id = String(code).padStart(4, "0");
  const district = state.metrics?.districts?.[id];
  if (!district) {
    return {
      code: id,
      name: currentCopy().inspector.unknownDistrict,
      english: "Unknown",
      region: "unknown",
      zoning: "scenario pending",
      flood: 50,
      access: 50,
      pressure: 50,
      png: `${SOURCE_BASE}/${id}.png`,
      pdf: `${SOURCE_BASE}/${id}.pdf`,
      raw: null,
    };
  }

  return {
    code: id,
    name: district.name,
    english: district.english,
    region: district.region,
    zoning: district.zoning?.label || "scenario pending",
    flood: scoreOrDefault(district.flood?.score),
    access: scoreOrDefault(district.accessibility?.score),
    pressure: scoreOrDefault(district.pressure?.score),
    png: district.links?.png || `${SOURCE_BASE}/${id}.png`,
    pdf: district.links?.pdf || `${SOURCE_BASE}/${id}.pdf`,
    raw: district,
  };
}

function profiles() {
  return Object.keys(state.metrics?.districts || {})
    .map(getProfile)
    .sort((a, b) => a.code.localeCompare(b.code));
}

function riskClass(score) {
  if (score >= 70) return "high";
  if (score >= 55) return "med";
  return "low";
}

function riskLabel(score) {
  const labels = currentCopy().risk;
  if (score >= 70) return labels.high;
  if (score >= 55) return labels.medium;
  return labels.low;
}

function districtDisplayName(profile) {
  if (state.language === "en") return profile.english || profile.name;
  if (!profile.raw) return profile.name;
  return `${currentCopy().inspector.districtPrefix}${profile.name}`;
}

function districtSecondaryText(profile) {
  const thaiName = profile.raw
    ? `${translations.th.inspector.districtPrefix}${profile.name}`
    : profile.name;
  const alternateName = state.language === "en" ? thaiName : profile.english;
  return `${alternateName} · ${profile.zoning}`;
}

function districtTooltip(profile) {
  const thaiName = profile.raw
    ? `${translations.th.inspector.districtPrefix}${profile.name}`
    : profile.name;
  if (state.language === "en") return `${profile.english || profile.name}<br>${thaiName}`;
  return `${thaiName}<br>${profile.english || ""}`;
}

function modeColor(feature) {
  const profile = getProfile(feature.properties.dcode);
  if (state.mode === "access") return accessColor(profile.access);
  if (state.mode === "story") {
    const storyCodes = new Set(storyScenes.flatMap((scene) => scene.districts));
    return storyCodes.has(profile.code) ? "#d45b3f" : "#8fa098";
  }
  return floodColor(profile.flood);
}

function floodColor(score) {
  if (score >= 80) return "#9d2f35";
  if (score >= 70) return "#d36b3d";
  if (score >= 60) return "#d9a441";
  if (score >= 50) return "#77a95d";
  return "#2c7f62";
}

function accessColor(score) {
  if (score >= 85) return "#185f7a";
  if (score >= 70) return "#2f91a5";
  if (score >= 55) return "#79a85c";
  if (score >= 45) return "#c08a35";
  return "#b24a43";
}

function districtStyle(feature) {
  const profile = getProfile(feature.properties.dcode);
  const isSelected = profile.code === state.selectedCode;
  const storyCodes = new Set(
    state.activeStory
      ? storyScenes.find((scene) => scene.id === state.activeStory)?.districts || []
      : storyScenes.flatMap((scene) => scene.districts),
  );
  const isStoryMuted = state.mode === "story" && !storyCodes.has(profile.code);
  return {
    color: isSelected ? "#17201b" : "#ffffff",
    fillColor: modeColor(feature),
    fillOpacity: isStoryMuted ? 0.14 : state.mode === "story" ? 0.68 : 0.58,
    opacity: isStoryMuted ? 0.45 : 0.95,
    weight: isSelected ? 3 : 1,
  };
}

function setupMap() {
  map = L.map("map", {
    center: [13.7563, 100.57],
    zoom: 10,
    zoomControl: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    zoomAnimation: false,
  });

  L.control.zoom({ position: "bottomright" }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
    attribution:
      '&copy; OpenStreetMap contributors &copy; CARTO | Boundary: prasertcbs/thailand_gis | POI: OpenStreetMap ODbL',
  }).addTo(map);
}

async function fetchJson(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(currentCopy().errors.cannotLoad.replace("{label}", label));
  }
  return response.json();
}

async function loadData() {
  const [topology, metrics, poiCollection, manifest] = await Promise.all([
    fetchJson("./data/bangkok_district_topo.json", "Bangkok district TopoJSON"),
    fetchJson("./data/district_metrics.json", "district metrics snapshot"),
    fetchJson("./data/poi.geojson", "POI snapshot"),
    fetchJson("./data/data_manifest.json", "data manifest"),
  ]);

  state.geojson = topojson.feature(topology, topology.objects.data);
  state.metrics = metrics;
  state.manifest = manifest;
  state.poi = (poiCollection.features || []).map((feature) => ({
    id: feature.properties.id,
    type: feature.properties.category,
    name: feature.properties.name,
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    districtCode: feature.properties.district_code,
    sourceUrl: feature.properties.source_url,
  }));
}

function renderFeatureLayer() {
  if (state.featureLayer) state.featureLayer.remove();

  state.featureLayer = L.geoJSON(state.geojson, {
    style: districtStyle,
    onEachFeature(feature, layer) {
      const profile = getProfile(feature.properties.dcode);
      layer.on({
        click: () => selectDistrict(profile.code, { fit: false }),
        mouseover: () => layer.setStyle({ weight: 3, color: "#17201b" }),
        mouseout: () => state.featureLayer.resetStyle(layer),
      });
      layer.bindTooltip(districtTooltip(profile), {
        sticky: true,
        direction: "top",
        opacity: 0.9,
      });
    },
  }).addTo(map);

  map.fitBounds(state.featureLayer.getBounds(), { padding: [28, 28] });
}

function accessRingPoi() {
  const ringCategories = new Set(["transit", "park", "hospital", "service"]);
  return state.poi.filter(
    (item) => ringCategories.has(item.type) && item.districtCode === state.selectedCode,
  );
}

function visiblePoi() {
  const selectedDistrictPoi = state.poi.filter((item) => item.districtCode === state.selectedCode);
  const cityTransitAnchors = state.poi
    .filter((item) => item.type === "transit")
    .slice(0, 160);
  const byId = new Map();

  [...selectedDistrictPoi, ...cityTransitAnchors].forEach((item) => byId.set(item.id, item));
  return [...byId.values()];
}

function renderAccessLayers() {
  if (state.accessLayer) state.accessLayer.remove();
  if (state.poiLayer) state.poiLayer.remove();

  state.accessLayer = L.layerGroup();
  state.poiLayer = L.layerGroup();

  if (els.toggleAccess.checked) {
    accessRingPoi().forEach((item) => {
      [
        [450, "#23758b", 0.07],
        [900, "#23758b", 0.045],
        [1350, "#23758b", 0.028],
      ].forEach(([radius, color, fillOpacity]) => {
        L.circle([item.lat, item.lng], {
          radius,
          color,
          weight: 1,
          opacity: 0.25,
          fillColor: color,
          fillOpacity,
        }).addTo(state.accessLayer);
      });
    });
    state.accessLayer.addTo(map);
  }

  if (els.togglePoi.checked) {
    visiblePoi().forEach((item) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="poi-marker poi-${item.type}">${poiGlyph(item.type)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([item.lat, item.lng], { icon })
        .bindTooltip(`${item.name}<br>${poiLabel(item.type)} · OSM`, { direction: "top" })
        .addTo(state.poiLayer);
    });
    state.poiLayer.addTo(map);
  }
}

function poiGlyph(type) {
  return { transit: "T", park: "P", school: "E", hospital: "H", service: "S" }[type] || "?";
}

function poiLabel(type) {
  return currentCopy().poi[type] || type;
}

function renderModes() {
  els.modeStack.innerHTML = "";
  modes.forEach((mode) => {
    const content = modeCopy(mode);
    const button = document.createElement("button");
    button.className = "mode-button";
    button.classList.toggle("is-active", mode.id === state.mode);
    button.type = "button";
    button.innerHTML = `<strong>${content.title}</strong><span>${content.description}</span>`;
    button.addEventListener("click", () => {
      state.mode = mode.id;
      state.activeStory = mode.id === "story" ? state.activeStory || "east-corridor" : null;
      render();
      if (state.activeStory) flyToStory(state.activeStory);
    });
    els.modeStack.appendChild(button);
  });
}

function renderDistrictList() {
  const query = state.query.trim().toLowerCase();
  const rows = profiles().filter((profile) =>
    [profile.code, profile.name, profile.english, profile.zoning]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  els.featureCount.textContent = `${formatNumber(rows.length)} ${currentCopy().units.districts}`;
  els.districtList.innerHTML = "";

  rows.forEach((profile) => {
    const button = document.createElement("button");
    button.className = "district-button";
    button.classList.toggle("is-active", profile.code === state.selectedCode);
    button.type = "button";
    button.innerHTML = `
      <span>
        <span class="district-code">${profile.code}</span>
        <strong>${districtDisplayName(profile)}</strong>
        <span>${districtSecondaryText(profile)}</span>
      </span>
      <span class="risk-pill pill-${riskClass(profile.flood)}">${riskLabel(profile.flood)}</span>
    `;
    button.addEventListener("click", () => selectDistrict(profile.code, { fit: true }));
    els.districtList.appendChild(button);
  });
}

function nearestSummary(accessibility) {
  const nearest = accessibility?.nearest_meters || {};
  const labels = currentCopy().poi;
  const units = currentCopy().units;
  return [
    ["transit", labels.transit],
    ["park", labels.park],
    ["school", labels.school],
    ["hospital", labels.hospital],
  ]
    .map(([key, label]) => {
      const value = nearest[key];
      return `${label} ${
        Number.isFinite(value) ? `${formatNumber(value)}${units.metersShort}` : units.notAvailable
      }`;
    })
    .join(" · ");
}

function renderInspector() {
  const profile = getProfile(state.selectedCode);
  const accessibility = profile.raw?.accessibility;
  els.selectedCode.textContent = profile.code;
  els.selectedName.textContent = districtDisplayName(profile);
  els.selectedSummary.textContent = currentCopy()
    .inspector.summary.replace("{english}", profile.english)
    .replace("{zoning}", profile.zoning)
    .replace("{nearest}", nearestSummary(accessibility));
  els.downloadPng.href = profile.png;
  els.downloadPdf.href = profile.pdf;

  els.metricStack.innerHTML = [
    [currentCopy().metrics.flood, profile.flood, floodColor(profile.flood)],
    [currentCopy().metrics.access, profile.access, accessColor(profile.access)],
    [currentCopy().metrics.pressure, profile.pressure, "#6952a3"],
  ]
    .map(
      ([label, value, color]) => `
        <div class="metric">
          <div class="metric-head"><span>${label}</span><span>${formatNumber(value)}/100</span></div>
          <div class="metric-bar"><div class="metric-fill" style="width:${value}%;background:${color}"></div></div>
        </div>
      `,
    )
    .join("");
}

function renderStories() {
  els.storyList.innerHTML = "";
  storyScenes.forEach((scene) => {
    const content = storyCopy(scene);
    const button = document.createElement("button");
    button.className = "story-button";
    button.classList.toggle("is-active", scene.id === state.activeStory);
    button.type = "button";
    button.innerHTML = `<strong>${content.title}</strong><span>${content.description}</span>`;
    button.addEventListener("click", () => {
      state.mode = "story";
      state.activeStory = scene.id;
      state.selectedCode = scene.districts[0];
      render();
      flyToStory(scene.id);
    });
    els.storyList.appendChild(button);
  });
}

function renderLegend() {
  const legend = currentCopy().legend;
  const title =
    state.mode === "access"
      ? legend.accessTitle
      : state.mode === "story"
        ? legend.storyTitle
        : legend.floodTitle;
  const rows =
    state.mode === "access"
      ? [
          ["#185f7a", legend.accessRows.veryHigh],
          ["#2f91a5", legend.accessRows.high],
          ["#79a85c", legend.accessRows.medium],
          ["#b24a43", legend.accessRows.low],
          ["#23758b", legend.accessRows.rings],
        ]
      : state.mode === "story"
        ? [
            ["#d45b3f", legend.storyRows.focus],
            ["#8fa098", legend.storyRows.other],
            ["#23758b", legend.storyRows.rings],
          ]
        : [
            ["#9d2f35", legend.floodRows.veryHigh],
            ["#d36b3d", legend.floodRows.high],
            ["#d9a441", legend.floodRows.medium],
            ["#2c7f62", legend.floodRows.low],
          ];

  els.legend.innerHTML = `<strong>${title}</strong>${rows
    .map(
      ([color, label]) =>
        `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span>${label}</div>`,
    )
    .join("")}`;
}

function renderDataFreshness() {
  if (!els.dataFreshness || !state.manifest) return;
  const generated = new Intl.DateTimeFormat(languageLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(state.manifest.generated_at));
  const counts = state.manifest.record_counts || {};
  els.dataFreshness.textContent = `${currentCopy().freshness.label} ${generated} · ${formatNumber(
    counts.poi_total,
  )} POI · OpenStreetMap/ODbL`;
}

function selectDistrict(code, options = {}) {
  state.selectedCode = code;
  render();
  if (options.fit && state.featureLayer) {
    state.featureLayer.eachLayer((layer) => {
      if (layer.feature.properties.dcode === code) {
        map.fitBounds(layer.getBounds(), { padding: [80, 80], maxZoom: 13 });
      }
    });
  }
}

function flyToStory(storyId) {
  const scene = storyScenes.find((item) => item.id === storyId);
  if (!scene) return;
  map.flyTo(scene.center, scene.zoom, { duration: 0.8 });
}

function render() {
  renderModes();
  renderDistrictList();
  renderInspector();
  renderStories();
  renderLegend();
  renderDataFreshness();

  const mode = modes.find((item) => item.id === state.mode);
  els.activeTitle.textContent = modeCopy(mode).title;

  if (state.featureLayer) {
    state.featureLayer.setStyle(districtStyle);
    state.featureLayer.eachLayer((layer) => {
      const profile = getProfile(layer.feature.properties.dcode);
      layer.setTooltipContent(districtTooltip(profile));
    });
  }
  renderAccessLayers();
}

function showError(error) {
  document.querySelector(".map-stage").innerHTML = `
    <div class="map-error">
      <div>
        <strong>${currentCopy().errors.mapTitle}</strong>
        <p>${error.message}. ${currentCopy().errors.mapMessage}</p>
      </div>
    </div>
  `;
}

async function init() {
  try {
    applyStaticTranslations();
    if (!window.L || !window.topojson) {
      throw new Error(currentCopy().errors.cdnUnavailable);
    }
    setupMap();
    await loadData();
    renderFeatureLayer();
    render();
  } catch (error) {
    showError(error);
  }
}

els.districtSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderDistrictList();
});

[
  [els.langTh, "th"],
  [els.langEn, "en"],
].forEach(([button, language]) => {
  button.addEventListener("click", () => setLanguage(language));
});

[els.toggleFlood, els.toggleAccess, els.togglePoi].forEach((input) => {
  input.addEventListener("change", () => {
    if (input === els.toggleFlood && state.featureLayer) {
      state.featureLayer.setStyle((feature) => ({
        ...districtStyle(feature),
        fillOpacity: els.toggleFlood.checked ? districtStyle(feature).fillOpacity : 0.08,
      }));
    }
    renderAccessLayers();
  });
});

init();
