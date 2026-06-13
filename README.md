# Bangkok GIS Risk + Access Prototype

เอกสารนี้อัปเดตล่าสุดวันที่ 13 มิถุนายน 2026 และอ้างอิงสถานะปัจจุบันของ repo นี้

## ระบบนี้คืออะไร

ระบบนี้คือ prototype เว็บแผนที่เชิง GIS สำหรับกรุงเทพฯ ที่ใช้ทดสอบ workflow การซ้อนชั้นข้อมูลเมือง ได้แก่ ขอบเขตเขต, ความเสี่ยงน้ำท่วม, zoning, access ต่อบริการสำคัญ, POI และ story map รายพื้นที่

ระบบถูกออกแบบเป็น static-first map application: หน้าเว็บโหลดข้อมูล snapshot จาก `public/data/` แล้ว render ด้วย Leaflet/TopoJSON ใน browser โดยไม่เรียก Overpass API หรือ data API อื่นตอนผู้ใช้เปิดหน้าเว็บ

## มีเพื่ออะไร

- ใช้สาธิตว่า GIS data pipeline สามารถแปลงข้อมูลหลายแหล่งให้กลายเป็น map view ที่ทีม policy, planning หรือ data team อ่านร่วมกันได้อย่างไร
- ใช้เปรียบเทียบเขตกรุงเทพฯ 50 เขตในมุม flood scenario, zoning scenario, access score และ development pressure scenario
- ใช้เป็น sandbox สำหรับต่อข้อมูลจริงในอนาคต เช่น flood layer ของ กทม., zoning polygon ทางการ, complaint/sensor data, permit data หรือ network isochrone
- ใช้เป็นฐาน prototype สำหรับเล่าเรื่องพื้นที่ เช่น คลองเตย-พระโขนง-บางนา, ลาดกระบัง และบางขุนเทียน

หมายเหตุสำคัญ: ตอนนี้ flood, zoning และ development pressure ยังเป็น scenario layer สำหรับออกแบบ workflow ไม่ใช่ข้อมูลทางการ และไม่ควรใช้ตัดสินใจเชิงนโยบายหรือการลงทุนโดยตรง

## ทำอะไรได้

- แสดงแผนที่เขตกรุงเทพฯ 50 เขตบน basemap ของ CARTO/OSM
- เลือกโหมดการดูข้อมูลได้ 3 แบบ:
  - `Flood x Zoning`: ระบายสีเขตตาม flood exposure scenario และแสดง zoning label
  - `Accessibility proxy`: ระบายสีเขตตาม access score จาก OSM POI snapshot
  - `Bangkok story map`: focus พื้นที่ตัวอย่างสำหรับเล่าเรื่องเมือง 3 scenes
- ค้นหาเขตด้วยรหัสเขต, ชื่อไทย, ชื่ออังกฤษ หรือ zoning label
- คลิกเขตเพื่อดู inspector รายเขต เช่น flood score, accessibility score, development pressure score และ link PNG/PDF zoning map จาก BMA GIS
- เปิด/ปิด layer ได้ ได้แก่ flood fill, access rings และ POI markers
- แสดง POI จาก OpenStreetMap แยกหมวด transit, park, school, hospital และ service
- แสดง metadata ของ snapshot เช่น วันที่ generate และจำนวน POI ทั้งหมด
- refresh และ validate static data snapshot ผ่าน script ใน repo

## ข้อมูลใช้อะไรและใช้อย่างไร

### Snapshot ปัจจุบัน

ข้อมูล snapshot ปัจจุบันอยู่ใน `public/data/` และ metadata ล่าสุดอยู่ที่ `public/data/data_manifest.json`

- Generated at: `2026-06-13T15:33:40.631Z` หรือ 13 มิถุนายน 2026 เวลา 22:33 น. ตามเวลา Asia/Bangkok
- Districts: 50 เขต
- POI ทั้งหมด: 2,236 รายการ
- POI by category:
  - transit: 308
  - park: 506
  - school: 921
  - hospital: 421
  - service: 80
- Bounding box ที่ใช้ดึงข้อมูล POI: south `13.49`, west `100.32`, north `13.96`, east `100.95`

### แหล่งข้อมูล

| ข้อมูล | ไฟล์/ที่มา | ใช้ทำอะไร |
| --- | --- | --- |
| ขอบเขตเขตกรุงเทพฯ | `public/data/bangkok_district_topo.json` จาก `prasertcbs/thailand_gis` | ใช้สร้าง district polygon 50 เขต |
| POI | `public/data/poi.geojson` จาก OpenStreetMap ผ่าน Overpass API | ใช้แสดง marker และคำนวณ accessibility proxy |
| District metrics | `public/data/district_metrics.json` | รวมคะแนนและ metric รายเขตที่หน้าเว็บใช้ render |
| Data manifest | `public/data/data_manifest.json` | เก็บ metadata, source, จำนวน record และ note ของ snapshot |
| BMA map links | URL pattern ของ BMA GIS map download | ใช้ link ไปยัง PNG/PDF รายเขต |
| Basemap | CARTO Positron tile service พร้อม attribution OSM/CARTO | ใช้เป็นแผนที่พื้นหลัง |

### วิธีคำนวณ accessibility proxy

Accessibility score เป็น proxy score ไม่ใช่ route-based accessibility จริง วิธีปัจจุบันคือ:

1. หา centroid ของแต่ละเขต
2. คำนวณระยะทางเส้นตรงจาก centroid ไปยัง POI หมวด transit, park, school, hospital และ service
3. แปลงระยะใกล้สุดเป็นคะแนนด้วย threshold:
   - ไม่เกิน 450 เมตร = 100
   - ไม่เกิน 900 เมตร = 82
   - ไม่เกิน 1,350 เมตร = 66
   - ไม่เกิน 2,500 เมตร = 42
   - ไม่เกิน 5,000 เมตร = 22
   - ไกลกว่านั้น = 8
4. ถ่วงน้ำหนักคะแนนจาก POI แต่ละหมวด:
   - transit 30%
   - park 20%
   - school 20%
   - hospital 20%
   - service 10%
5. เพิ่ม bonus สูงสุด 10 คะแนนจากจำนวน POI ที่อยู่ในเขตนั้น

ข้อจำกัด: นี่เป็น straight-line walking-distance proxy จาก centroid ไม่ใช่ network isochrone, ไม่ใช้ถนนจริง, ไม่คิดทางเดินเท้า, คลอง, ทางรถไฟ, barrier หรือเวลาเดินจริง

### ข้อมูลที่ยังเป็น scenario

ข้อมูลต่อไปนี้ยังเป็นค่าจำลองใน prototype:

- `flood.score`: flood exposure scenario
- `zoning.label`: zoning scenario label
- `pressure.score`: development pressure scenario

ค่าเหล่านี้ถูกเก็บไว้เพื่อให้หน้าเว็บและ workflow ทำงานครบก่อนต่อข้อมูลจริง

## โครงสร้างโปรเจกต์

```text
app/
  layout.tsx               Next/vinext app shell
  page.tsx                 iframe wrapper ไปยัง static map
public/
  index-static.html        หน้า static map หลัก
  app.js                   logic ของ Leaflet map และ UI interaction
  styles.css               stylesheet ของ static map
  data/
    bangkok_district_topo.json
    poi.geojson
    district_metrics.json
    data_manifest.json
scripts/
  refresh-data.mjs         ดึง OSM POI และสร้าง metrics snapshot
  validate-data.mjs        ตรวจ schema/consistency ของ static data
worker/
  index.ts                 Cloudflare Worker entry สำหรับ vinext
```

## วิธีรัน

ติดตั้ง dependency:

```bash
npm ci
```

รัน dev server ของ app:

```bash
npm run dev
```

หรือ preview แบบ static ง่าย ๆ จาก root repo:

```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory public
```

แล้วเปิด:

```text
http://127.0.0.1:4174/index-static.html
```

หมายเหตุ: หน้า static map ต้องโหลด JSON local ผ่าน HTTP server ไม่ควรเปิดไฟล์ HTML ตรง ๆ ด้วย `file://`

## วิธี refresh และ validate data

Refresh static OSM/accessibility snapshot:

```bash
npm run data:refresh
```

Validate ว่าไฟล์ snapshot ครบ, จำนวนเขตถูกต้อง, POI อยู่ใน Bangkok bounds และ metric มี field ที่ frontend ต้องใช้:

```bash
npm run data:validate
```

หน้าเว็บอ่านเฉพาะไฟล์ static ใน `public/data/` ดังนั้นหลัง refresh สำเร็จควร commit ไฟล์ data ที่เปลี่ยนพร้อม README/changelog ที่เกี่ยวข้อง

## Codex automation ที่ตั้งไว้

มี Codex automation ชื่อ `Bangkok GIS Daily Data Refresh` และ id `bangkok-gis-daily-data-refresh` ตั้งไว้เป็น active cron automation สำหรับ workspace นี้

Automation นี้มีเป้าหมายเพื่อ keep static data snapshot ให้สดโดยไม่ต้องให้ browser เรียก Overpass API ตอนเปิดหน้าเว็บ งานจะรันทุกวันเวลา 08:00 ตาม timezone ของผู้ใช้/เครื่องที่ตั้ง automation ไว้ โดยทำงานใน worktree ของโปรเจกต์นี้

ลำดับงานที่ automation ทำ:

1. ทำงานเฉพาะใน workspace ของ repo นี้
2. ติดตั้ง dependency เฉพาะเมื่อจำเป็น
3. รัน `npm run data:refresh` เพื่อดึง OSM POI snapshot และสร้าง district metrics ใหม่
4. รัน `npm run data:validate` เพื่อตรวจความครบถ้วนของ data snapshot
5. รัน `npm run lint`
6. รัน `npm run build`
7. ตรวจ `git status --short`
8. ถ้ามี diff จะ commit เฉพาะเมื่อไฟล์ที่เปลี่ยนจำกัดอยู่ในกลุ่มที่อนุญาต ได้แก่ `public/data/`, `data/`, `package.json`, `package-lock.json`, `README.md`, `scripts/refresh-data.mjs` และ `scripts/validate-data.mjs`
9. ถ้าไฟล์เปลี่ยนนอกเหนือจาก allowlist ให้หยุดและ report แทนการ commit
10. ถ้า commit ได้ ให้ใช้ message รูปแบบ `Refresh Bangkok GIS data YYYY-MM-DD` โดยใช้วันที่ Bangkok ปัจจุบัน

Automation นี้ตั้งใจไม่ deploy production เอง หลังจบงานต้องรายงาน command results, POI counts, `generated_at`, commit SHA ถ้ามี commit และ validation/build failures ถ้ามี

## Terminology / Glossary

| คำศัพท์ | ความหมายในโปรเจกต์นี้ |
| --- | --- |
| GIS | Geographic Information System ระบบจัดเก็บ วิเคราะห์ และแสดงข้อมูลที่มีพิกัดหรือขอบเขตบนแผนที่ |
| Layer | ชั้นข้อมูลบนแผนที่ เช่น ขอบเขตเขต, POI, flood score, access ring |
| District boundary | polygon ขอบเขตเขตกรุงเทพฯ ใช้เป็นพื้นที่หลักในการ aggregate metric รายเขต |
| TopoJSON | format สำหรับเก็บ geometry ที่ลดความซ้ำของเส้นขอบ เหมาะกับ polygon boundary |
| GeoJSON | format JSON สำหรับข้อมูลภูมิสารสนเทศ เช่น point, line, polygon |
| POI | Point of Interest หรือจุดสนใจบนแผนที่ เช่น สถานีขนส่ง, สวน, โรงเรียน, โรงพยาบาล, หน่วยบริการรัฐ |
| OSM | OpenStreetMap แหล่งข้อมูลแผนที่เปิดที่ชุมชนช่วยกันแก้ไข |
| Overpass API | API สำหรับ query ข้อมูล OpenStreetMap ตาม tag และ bounding box |
| ODbL | Open Database License license ของ OpenStreetMap ต้องให้ attribution และเคารพเงื่อนไขการใช้ข้อมูล |
| Basemap | แผนที่พื้นหลัง เช่น ถนน น้ำ พื้นที่เมือง ที่ช่วยอ่านตำแหน่งของ layer หลัก |
| Scenario layer | ชั้นข้อมูลจำลองที่ใช้ทดสอบ workflow ก่อนต่อข้อมูลจริง |
| Flood exposure | คะแนนหรือชั้นข้อมูลที่แทนระดับ exposure ต่อความเสี่ยงน้ำท่วม ในตอนนี้ยังเป็น scenario |
| Zoning | การใช้ประโยชน์ที่ดิน/ผังเมือง ในตอนนี้เป็น label จำลองและมี link ไป PDF/PNG ของ BMA |
| Development pressure | คะแนนจำลองที่สื่อแรงกดดันการพัฒนาเมือง เช่น permit, land value หรือ building change ในอนาคต |
| Accessibility proxy | คะแนนเข้าถึงบริการสำคัญแบบประมาณการจากระยะเส้นตรงถึง POI ไม่ใช่ accessibility จริงตาม network |
| Isochrone | พื้นที่ที่เดินทางถึงได้ภายในเวลาหรือระยะทางที่กำหนดตาม network จริง เช่น เดิน 10 นาทีตามถนน |
| Centroid | จุดกึ่งกลางเชิงเรขาคณิตของ polygon เขต ใช้เป็นจุดเริ่มคำนวณระยะ POI ใน prototype นี้ |
| BBox / Bounding box | กรอบพิกัด south/west/north/east สำหรับจำกัดพื้นที่ query หรือ validate data |
| Static snapshot | ชุดข้อมูลที่ generate ไว้ล่วงหน้าและ serve เป็นไฟล์ static เพื่อให้ frontend โหลดเร็วและ reproducible |
| Access ring | วงกลมรัศมี 450/900/1350 เมตรรอบ POI ที่ใช้เป็น visual proxy ไม่ใช่เส้นทางเดินจริง |
| Codex automation | scheduled task ที่ Codex app รันให้ตามเวลาที่ตั้งไว้ เช่น refresh data snapshot รายวัน |
| Cron automation | automation แบบตั้งเวลาซ้ำสำหรับงานใน workspace แยกจาก thread สนทนาปกติ |
| Worktree | working copy แยกที่ automation ใช้รันงานและตรวจ diff ก่อน commit |

## ข้อจำกัดที่ต้องรู้

- Flood, zoning และ development pressure ยังไม่ใช่ official data
- Accessibility score ใช้ระยะเส้นตรงจาก centroid จึงอาจคลาดเคลื่อนมากในเขตใหญ่หรือเขตที่มี barrier ทางกายภาพ
- ความครบถ้วนของ POI ขึ้นกับ OpenStreetMap snapshot ณ เวลาที่ refresh
- หน้าเว็บต้องเข้าถึง CDN ของ Leaflet และ TopoJSON เพื่อ render map
- ก่อนนำไปใช้เชิง production ต้องตรวจ license, attribution, data freshness และ methodology กับเจ้าของข้อมูล/ผู้เชี่ยวชาญ GIS

## Roadmap / Next data integration

1. แทน flood scenario score ด้วย BMA flood layer, historical complaint data, sensor data หรือ raster flood model
2. แทน zoning scenario label ด้วย official zoning polygon หรือ digitize จาก BMA zoning PDFs
3. แทน access rings ด้วย network isochrone จาก road/walk network
4. เพิ่ม POI จาก GTFS, BMA service catalogs, hospitals, schools, parks และแหล่งข้อมูลทางการ
5. เพิ่ม data provenance ต่อ district metric เพื่อให้ trace ได้ว่าคะแนนมาจาก source/version ใด

## Changelog

### 2026-06-13

- อัปเดต README ให้เป็นเอกสารหลักของระบบ อธิบายภาพรวม, เป้าหมาย, ความสามารถ, data pipeline, glossary และข้อจำกัดของข้อมูล
- เพิ่มรายละเอียด Codex automation `Bangkok GIS Daily Data Refresh` ที่รัน refresh/validate/lint/build รายวัน และ commit เฉพาะไฟล์ data/script ที่อยู่ใน allowlist
- Refresh data snapshot version 1 เมื่อ `2026-06-13T15:33:40.631Z`
- เพิ่ม/คงไว้ซึ่ง OSM POI snapshot จำนวน 2,236 รายการ แยกเป็น transit, park, school, hospital และ service
- เพิ่ม/คงไว้ซึ่ง district metrics สำหรับ 50 เขต พร้อม accessibility proxy, flood scenario, zoning scenario และ development pressure scenario
- เพิ่ม data refresh automation ผ่าน `npm run data:refresh`
- เพิ่ม data validation ผ่าน `npm run data:validate`
- เพิ่ม static-first map experience ที่โหลดข้อมูลจาก `public/data/` และไม่เรียก Overpass API ตอนเปิดหน้าเว็บ

### ก่อนหน้า

- Deploy Bangkok GIS prototype ด้วย vinext/Cloudflare Worker site shell
- เพิ่ม preview screenshot ของ site
- ขยาย `.gitignore` สำหรับไฟล์ build/runtime ที่ไม่ควร commit
