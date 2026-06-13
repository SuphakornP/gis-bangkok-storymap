const SOURCE_BASE =
  "https://cityplangis.bangkok.go.th/cpdPortal/wp-content/uploads/2019/08";

const modes = [
  {
    id: "flood",
    title: "Flood x Zoning",
    description: "ดูเขตที่ flood exposure สูงและใช้ประโยชน์ที่ดินเปราะบาง",
  },
  {
    id: "access",
    title: "Accessibility proxy",
    description: "ดู access score จาก OSM POI snapshot ด้วยรัศมี 450/900/1350 เมตร",
  },
  {
    id: "story",
    title: "Bangkok story map",
    description: "เล่าเรื่องคลองเตย-พระโขนง-บางนา, ลาดกระบัง, บางขุนเทียน",
  },
];

const storyScenes = [
  {
    id: "east-corridor",
    title: "คลองเตย-พระโขนง-บางนา",
    districts: ["1033", "1009", "1047"],
    center: [13.685, 100.607],
    zoom: 12,
    description: "แนวเปลี่ยนผ่านจากท่าเรือและ mixed-use ไปสู่ transit/industrial edge",
  },
  {
    id: "lat-krabang",
    title: "ลาดกระบัง logistics edge",
    districts: ["1011"],
    center: [13.724, 100.775],
    zoom: 11,
    description: "พื้นที่ใหญ่ ฝั่งตะวันออก เชื่อมสนามบินและ logistics แต่ flood exposure สูง",
  },
  {
    id: "bang-khun-thian",
    title: "บางขุนเทียน coastal risk",
    districts: ["1021"],
    center: [13.58, 100.43],
    zoom: 11,
    description: "ขอบเมืองชายฝั่ง เหมาะกับ story น้ำท่วม-การใช้ที่ดิน-ระบบนิเวศ",
  },
];

const state = {
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
};

function scoreOrDefault(value, fallback = 50) {
  return Number.isFinite(value) ? value : fallback;
}

function getProfile(code) {
  const id = String(code).padStart(4, "0");
  const district = state.metrics?.districts?.[id];
  if (!district) {
    return {
      code: id,
      name: "ไม่ทราบเขต",
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
  if (score >= 70) return "สูง";
  if (score >= 55) return "กลาง";
  return "ต่ำ";
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
  if (!response.ok) throw new Error(`Cannot load ${label}`);
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
      layer.bindTooltip(`${profile.name}<br>${profile.english}`, {
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
  return {
    transit: "Transit",
    park: "Park",
    school: "School",
    hospital: "Hospital",
    service: "Service",
  }[type];
}

function renderModes() {
  els.modeStack.innerHTML = "";
  modes.forEach((mode) => {
    const button = document.createElement("button");
    button.className = "mode-button";
    button.classList.toggle("is-active", mode.id === state.mode);
    button.type = "button";
    button.innerHTML = `<strong>${mode.title}</strong><span>${mode.description}</span>`;
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

  els.featureCount.textContent = `${rows.length} เขต`;
  els.districtList.innerHTML = "";

  rows.forEach((profile) => {
    const button = document.createElement("button");
    button.className = "district-button";
    button.classList.toggle("is-active", profile.code === state.selectedCode);
    button.type = "button";
    button.innerHTML = `
      <span>
        <span class="district-code">${profile.code}</span>
        <strong>เขต${profile.name}</strong>
        <span>${profile.english} · ${profile.zoning}</span>
      </span>
      <span class="risk-pill pill-${riskClass(profile.flood)}">${riskLabel(profile.flood)}</span>
    `;
    button.addEventListener("click", () => selectDistrict(profile.code, { fit: true }));
    els.districtList.appendChild(button);
  });
}

function nearestSummary(accessibility) {
  const nearest = accessibility?.nearest_meters || {};
  return [
    ["transit", "transit"],
    ["park", "park"],
    ["school", "school"],
    ["hospital", "hospital"],
  ]
    .map(([key, label]) => {
      const value = nearest[key];
      return `${label} ${Number.isFinite(value) ? `${value.toLocaleString()}m` : "n/a"}`;
    })
    .join(" · ");
}

function renderInspector() {
  const profile = getProfile(state.selectedCode);
  const accessibility = profile.raw?.accessibility;
  els.selectedCode.textContent = profile.code;
  els.selectedName.textContent = `เขต${profile.name}`;
  els.selectedSummary.textContent = `${profile.english} · ${profile.zoning}. Flood/zoning เป็น scenario; accessibility เป็น OSM walking-distance proxy (${nearestSummary(
    accessibility,
  )}).`;
  els.downloadPng.href = profile.png;
  els.downloadPdf.href = profile.pdf;

  els.metricStack.innerHTML = [
    ["Flood exposure (scenario)", profile.flood, floodColor(profile.flood)],
    ["Accessibility proxy (OSM)", profile.access, accessColor(profile.access)],
    ["Development pressure (scenario)", profile.pressure, "#6952a3"],
  ]
    .map(
      ([label, value, color]) => `
        <div class="metric">
          <div class="metric-head"><span>${label}</span><span>${value}/100</span></div>
          <div class="metric-bar"><div class="metric-fill" style="width:${value}%;background:${color}"></div></div>
        </div>
      `,
    )
    .join("");
}

function renderStories() {
  els.storyList.innerHTML = "";
  storyScenes.forEach((scene) => {
    const button = document.createElement("button");
    button.className = "story-button";
    button.classList.toggle("is-active", scene.id === state.activeStory);
    button.type = "button";
    button.innerHTML = `<strong>${scene.title}</strong><span>${scene.description}</span>`;
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
  const title =
    state.mode === "access"
      ? "Accessibility proxy score"
      : state.mode === "story"
        ? "Story focus"
        : "Flood exposure scenario";
  const rows =
    state.mode === "access"
      ? [
          ["#185f7a", "สูงมาก"],
          ["#2f91a5", "สูง"],
          ["#79a85c", "กลาง"],
          ["#b24a43", "ต่ำ"],
          ["#23758b", "รัศมี 450/900/1350m"],
        ]
      : state.mode === "story"
        ? [
            ["#d45b3f", "เขตใน story"],
            ["#8fa098", "เขตอื่น"],
            ["#23758b", "POI / service rings"],
          ]
        : [
            ["#9d2f35", "เสี่ยงสูงมาก"],
            ["#d36b3d", "เสี่ยงสูง"],
            ["#d9a441", "กลาง"],
            ["#2c7f62", "ต่ำ"],
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
  const generated = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(state.manifest.generated_at));
  const counts = state.manifest.record_counts || {};
  els.dataFreshness.textContent = `Snapshot ${generated} · ${counts.poi_total?.toLocaleString() || 0} POI · OpenStreetMap/ODbL`;
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
  els.activeTitle.textContent = mode.title;

  if (state.featureLayer) {
    state.featureLayer.setStyle(districtStyle);
  }
  renderAccessLayers();
}

function showError(error) {
  document.querySelector(".map-stage").innerHTML = `
    <div class="map-error">
      <div>
        <strong>Map failed to load</strong>
        <p>${error.message}. ตรวจว่า static data snapshot มีครบ และเชื่อมต่อ CDN สำหรับ Leaflet/TopoJSON ได้</p>
      </div>
    </div>
  `;
}

async function init() {
  try {
    if (!window.L || !window.topojson) {
      throw new Error("Leaflet or TopoJSON CDN is unavailable");
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
