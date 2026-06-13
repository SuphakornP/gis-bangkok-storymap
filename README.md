# Bangkok GIS Risk + Access Prototype

Interactive static prototype สำหรับ render ขอบเขตเขตกรุงเทพฯ เป็นแผนที่ และทดลอง
3 โจทย์:

1. **Flood x Zoning**: ซ้อน scenario flood exposure กับประเภทการใช้ประโยชน์ที่ดิน
2. **Accessibility map**: walking-distance proxy จาก OSM POI snapshot
3. **Bangkok story map**: เล่าเรื่องคลองเตย-พระโขนง-บางนา, ลาดกระบัง, บางขุนเทียน

## Data

- Boundary: `bangkok/district/bangkok_district_topo.json` from
  `prasertcbs/thailand_gis`
- Basemap: CARTO Positron tile service via Leaflet CDN
- POI: OpenStreetMap snapshot generated into `public/data/poi.geojson`
- Accessibility scores: generated into `public/data/district_metrics.json` as a
  straight-line walking-distance proxy, not a network isochrone
- Flood, zoning, development pressure scores: prototype scenario attributes, not official data
- District map/PDF links: BMA GIS map download URL pattern

## Data refresh

Refresh the static OSM/accessibility snapshot:

```bash
npm run data:refresh
npm run data:validate
```

The browser reads only static files from `public/data/`; it does not call
Overpass or other data APIs at page load.

## Run

Because the app fetches local JSON, use a local server:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4174
```

## Next data integration

1. Replace flood scenario scores with BMA flood layer or historical complaint/sensor data.
2. Replace zoning labels with official zoning polygons, or digitize from BMA zoning PDFs.
3. Replace circular accessibility rings with real network isochrones.
4. Add POI from OSM, GTFS, BMA service catalogs, hospitals, schools, and parks.
