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
    title: "Accessibility map",
    description: "ดูการเข้าถึง transit, park, hospital และศูนย์บริการแบบ 5/10/15 นาที",
  },
  {
    id: "story",
    title: "Bangkok story map",
    description: "เล่าเรื่องคลองเตย-พระโขนง-บางนา, ลาดกระบัง, บางขุนเทียน",
  },
];

const districtProfiles = {
  1001: ["พระนคร", "Phra Nakhon", "core", "mixed heritage", 58, 82, 72],
  1002: ["ดุสิต", "Dusit", "core", "civic residential", 55, 76, 68],
  1003: ["หนองจอก", "Nong Chok", "east", "agricultural edge", 67, 38, 46],
  1004: ["บางรัก", "Bang Rak", "core", "commercial core", 52, 92, 84],
  1005: ["บางเขน", "Bang Khen", "north", "residential", 49, 62, 58],
  1006: ["บางกะปิ", "Bang Kapi", "east", "mixed residential", 61, 68, 66],
  1007: ["ปทุมวัน", "Pathum Wan", "core", "commercial core", 44, 96, 88],
  1008: ["ป้อมปราบศัตรูพ่าย", "Pom Prap Sattru Phai", "core", "mixed heritage", 54, 88, 80],
  1009: ["พระโขนง", "Phra Khanong", "east", "transit mixed-use", 68, 86, 82],
  1010: ["มีนบุรี", "Min Buri", "east", "suburban mixed", 70, 45, 52],
  1011: ["ลาดกระบัง", "Lat Krabang", "east", "logistics industrial", 82, 50, 60],
  1012: ["ยานนาวา", "Yan Nawa", "core", "river mixed-use", 66, 78, 73],
  1013: ["สัมพันธวงศ์", "Samphanthawong", "core", "commercial heritage", 62, 91, 82],
  1014: ["พญาไท", "Phaya Thai", "core", "transit mixed-use", 48, 91, 84],
  1015: ["ธนบุรี", "Thon Buri", "west", "river residential", 63, 73, 68],
  1016: ["บางกอกใหญ่", "Bangkok Yai", "west", "river heritage", 61, 66, 62],
  1017: ["ห้วยขวาง", "Huai Khwang", "core", "mixed residential", 56, 83, 76],
  1018: ["คลองสาน", "Khlong San", "west", "river mixed-use", 59, 79, 74],
  1019: ["ตลิ่งชัน", "Taling Chan", "west", "low-rise residential", 64, 45, 48],
  1020: ["บางกอกน้อย", "Bangkok Noi", "west", "river mixed-use", 60, 70, 64],
  1021: ["บางขุนเทียน", "Bang Khun Thian", "west", "coastal ecological", 91, 36, 55],
  1022: ["ภาษีเจริญ", "Phasi Charoen", "west", "residential mixed", 57, 63, 60],
  1023: ["หนองแขม", "Nong Khaem", "west", "suburban residential", 62, 44, 49],
  1024: ["ราษฎร์บูรณะ", "Rat Burana", "west", "industrial river", 72, 58, 63],
  1025: ["บางพลัด", "Bang Phlat", "west", "river residential", 58, 71, 65],
  1026: ["ดินแดง", "Din Daeng", "core", "high-density residential", 52, 85, 80],
  1027: ["บึงกุ่ม", "Bueng Kum", "east", "residential", 63, 57, 58],
  1028: ["สาทร", "Sathon", "core", "commercial core", 50, 92, 84],
  1029: ["บางซื่อ", "Bang Sue", "north", "rail interchange", 55, 83, 78],
  1030: ["จตุจักร", "Chatuchak", "north", "transit park", 48, 88, 84],
  1031: ["บางคอแหลม", "Bang Kho Laem", "core", "river mixed-use", 65, 74, 70],
  1032: ["ประเวศ", "Prawet", "east", "suburban mixed", 66, 50, 57],
  1033: ["คลองเตย", "Khlong Toei", "core", "port mixed-use", 74, 87, 86],
  1034: ["สวนหลวง", "Suan Luang", "east", "residential mixed", 59, 65, 63],
  1035: ["จอมทอง", "Chom Thong", "west", "residential", 61, 55, 56],
  1036: ["ดอนเมือง", "Don Mueang", "north", "airport urban edge", 57, 52, 58],
  1037: ["ราชเทวี", "Ratchathewi", "core", "transit commercial", 45, 93, 86],
  1038: ["ลาดพร้าว", "Lat Phrao", "north", "residential mixed", 56, 65, 64],
  1039: ["วัฒนา", "Watthana", "core", "commercial residential", 53, 93, 87],
  1040: ["บางแค", "Bang Khae", "west", "suburban mixed", 58, 54, 56],
  1041: ["หลักสี่", "Lak Si", "north", "civic residential", 51, 62, 61],
  1042: ["สายไหม", "Sai Mai", "north", "suburban residential", 54, 43, 49],
  1043: ["คันนายาว", "Khan Na Yao", "east", "residential", 60, 51, 55],
  1044: ["สะพานสูง", "Saphan Sung", "east", "residential", 64, 48, 53],
  1045: ["วังทองหลาง", "Wang Thonglang", "east", "residential mixed", 57, 67, 64],
  1046: ["คลองสามวา", "Khlong Sam Wa", "east", "canal suburban", 75, 39, 50],
  1047: ["บางนา", "Bang Na", "east", "transit industrial edge", 76, 79, 82],
  1048: ["ทวีวัฒนา", "Thawi Watthana", "west", "green suburban", 55, 37, 48],
  1049: ["ทุ่งครุ", "Thung Khru", "west", "residential industrial", 66, 46, 52],
  1050: ["บางบอน", "Bang Bon", "west", "industrial residential", 67, 43, 51],
};

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

const poi = [
  ["transit", "Siam", 13.7455, 100.5347],
  ["transit", "Asok / Sukhumvit", 13.737, 100.56],
  ["transit", "Bang Na", 13.6681, 100.6047],
  ["transit", "Mo Chit", 13.8026, 100.5538],
  ["transit", "Bang Wa", 13.7207, 100.4578],
  ["transit", "Lat Krabang ARL", 13.7278, 100.7487],
  ["park", "Lumphini Park", 13.7314, 100.5417],
  ["park", "Chatuchak Park", 13.8074, 100.5551],
  ["park", "Benjakitti Park", 13.7308, 100.5588],
  ["park", "Nong Bon Park", 13.684, 100.663],
  ["hospital", "Siriraj Hospital", 13.7563, 100.4852],
  ["hospital", "Chulalongkorn Hospital", 13.731, 100.5356],
  ["hospital", "Rajavithi Hospital", 13.7664, 100.534],
  ["hospital", "Bang Na Hospital", 13.6709, 100.6187],
  ["service", "Bangkok City Hall", 13.7563, 100.5018],
  ["service", "Khlong Toei District Office", 13.7137, 100.5717],
  ["service", "Lat Krabang District Office", 13.722, 100.78],
  ["service", "Bang Khun Thian District Office", 13.663, 100.435],
].map(([type, name, lat, lng]) => ({ type, name, lat, lng }));

const state = {
  mode: "flood",
  query: "",
  selectedCode: "1047",
  activeStory: null,
  geojson: null,
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
  toggleFlood: document.querySelector("#toggleFlood"),
  toggleAccess: document.querySelector("#toggleAccess"),
  togglePoi: document.querySelector("#togglePoi"),
};

function getProfile(code) {
  const [name, english, region, zoning, flood, access, pressure] =
    districtProfiles[code] || ["ไม่ทราบเขต", "Unknown", "core", "mixed", 50, 50, 50];
  return {
    code,
    name,
    english,
    region,
    zoning,
    flood,
    access,
    pressure,
    png: `${SOURCE_BASE}/${code}.png`,
    pdf: `${SOURCE_BASE}/${code}.pdf`,
  };
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
      '&copy; OpenStreetMap contributors &copy; CARTO | Boundary: prasertcbs/thailand_gis',
  }).addTo(map);
}

async function loadDistricts() {
  const response = await fetch("./data/bangkok_district_topo.json");
  if (!response.ok) throw new Error("Cannot load Bangkok district TopoJSON");
  const topology = await response.json();
  state.geojson = topojson.feature(topology, topology.objects.data);
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

function renderAccessLayers() {
  if (state.accessLayer) state.accessLayer.remove();
  if (state.poiLayer) state.poiLayer.remove();

  state.accessLayer = L.layerGroup();
  state.poiLayer = L.layerGroup();

  if (els.toggleAccess.checked) {
    poi
      .filter((item) => item.type === "transit" || item.type === "hospital")
      .forEach((item) => {
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
    poi.forEach((item) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="poi-marker poi-${item.type}">${poiGlyph(item.type)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([item.lat, item.lng], { icon })
        .bindTooltip(item.name, { direction: "top" })
        .addTo(state.poiLayer);
    });
    state.poiLayer.addTo(map);
  }
}

function poiGlyph(type) {
  return { transit: "T", park: "P", hospital: "H", service: "S" }[type];
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
  const rows = Object.keys(districtProfiles)
    .map(getProfile)
    .sort((a, b) => a.code.localeCompare(b.code))
    .filter((profile) =>
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

function renderInspector() {
  const profile = getProfile(state.selectedCode);
  els.selectedCode.textContent = profile.code;
  els.selectedName.textContent = `เขต${profile.name}`;
  els.selectedSummary.textContent = `${profile.english} · ${profile.zoning} · flood risk ${riskLabel(
    profile.flood,
  )}. ใช้เป็นจุดเริ่มต้นสำหรับ overlay กับข้อมูลจริง`;
  els.downloadPng.href = profile.png;
  els.downloadPdf.href = profile.pdf;

  els.metricStack.innerHTML = [
    ["Flood exposure", profile.flood, floodColor(profile.flood)],
    ["Accessibility", profile.access, accessColor(profile.access)],
    ["Development pressure", profile.pressure, "#6952a3"],
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
      ? "Accessibility score"
      : state.mode === "story"
        ? "Story focus"
        : "Flood exposure";
  const rows =
    state.mode === "access"
      ? [
          ["#185f7a", "สูงมาก"],
          ["#2f91a5", "สูง"],
          ["#79a85c", "กลาง"],
          ["#b24a43", "ต่ำ"],
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
        <p>${error.message}. ตรวจว่าเปิดผ่าน local server และเชื่อมต่อ CDN สำหรับ Leaflet/TopoJSON ได้</p>
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
    await loadDistricts();
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
