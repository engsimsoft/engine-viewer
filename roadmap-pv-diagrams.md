# Roadmap: PV-Diagrams Block Implementation

## 🎯 Цель проекта
Добавить блок **PV-Diagrams** в Engine Results Viewer для визуализации индикаторных диаграмм двигателя. Парсинг .pvd файлов, 3 типа диаграмм (P-V, Log P-V, P-α), auto-detection критического RPM, современный UI с ECharts.

## 📊 Текущий статус
- **Этап:** Этап 1 (Backend - Parser & API)
- **Прогресс:** 7/73 задач выполнено (10%)
- **Следующее:** API endpoints для .pvd файлов

---

## 🚀 Этапы разработки

### Этап 1: Backend - Parser & API (2-3 дня)
**Цель:** Backend умеет парсить .pvd файлы и отдавать данные через API

**1.1 PVD Parser:**
- [X] Создать `backend/src/parsers/formats/pvdParser.js` - базовая структура (30 мин)
- [X] Парсинг metadata (lines 1-17): RPM, cylinders, engineType, turbo config, firing order (1-2 часа)
- [X] Парсинг data (line 19+): 721 rows, deg + volume/pressure per cylinder (2-3 часа)
- [X] Тест parser с `test-data/V8/V8_2000.pvd` - проверить структуру output (1 час)
- [X] Обработка edge cases: 1-цилиндр (MOTO 250 V1) vs 8-цилиндров (V8) (1 час)

**1.2 Parser Registry:**
- [X] Зарегистрировать PvdParser в `backend/src/parsers/index.js` (15 мин)
- [X] Verify: запустить backend, проверить что parser загружается без ошибок (15 мин)

**1.3 API Endpoint:**
- [ ] Добавить endpoint `/api/project/:id/pvd-files` - список .pvd с peak pressure metadata (2-3 часа)
- [ ] Добавить endpoint `/api/files/:projectId/:filename` support для .pvd (или extend existing) (1-2 часа)
- [ ] Тест через curl: получить список .pvd, получить данные V8_2000.pvd (30 мин)

**Verify этап 1 (COMPREHENSIVE):**
- [ ] **Unit Tests:** Run test scripts - все parser тесты проходят (30 мин)
  - [X] `node backend/test-pvd-parser.js` - V8 (8-cyl) ✓
  - [X] `node backend/test-pvd-1cyl.js` - MOTO 250 (1-cyl) ✓
- [ ] **Backend Tests:** `npm test` (backend) - если есть automated tests (30 мин)
- [ ] **Integration Tests:** curl/Postman endpoints возвращают корректные данные (15 мин)
  - `/api/project/:id/pvd-files` - список .pvd с metadata
  - `/api/files/:projectId/:filename` - данные .pvd файла
- [ ] **Browser Tests (MCP Playwright):** если нужно UI тестирование
- [ ] **Code Quality:** eslint/prettier - код соответствует стандартам
- [ ] **Git Commit:** Stage 1 complete с описанием изменений

---

### Этап 2: Frontend - Types & Data Hooks (1 день)
**Цель:** TypeScript types готовы, hooks загружают данные из API

**2.1 TypeScript Types:**
- [ ] Добавить в `frontend/src/types/shared-types.ts`: (1 час)
  - `PVDMetadata` (rpm, cylinders, engineType, numTurbo, peakPressure, peakPressureAngle)
  - `PVDDataPoint` (deg, cylinders: [{volume, pressure}])
  - `PVDData` (metadata + data[])
  - `PVDFileInfo` (filename, rpm, peakPressure, peakPressureCylinder, peakPressureAngle)

**2.2 Data Hooks:**
- [ ] Create `frontend/src/hooks/usePVDFiles.ts` - fetch list of .pvd files with metadata (1-2 часа)
- [ ] Create `frontend/src/hooks/usePVDData.ts` - fetch specific .pvd file data (1-2 часа)
- [ ] Тест hooks: console.log данных, проверить структуру (30 мин)

**Verify этап 2 (COMPREHENSIVE):**
- [ ] **TypeScript:** `npm run typecheck` - нет ошибок типов (15 мин)
- [ ] **Unit Tests:** Hooks возвращают корректные данные в консоли (15 мин)
- [ ] **Integration:** Проверить в браузере DevTools - Network tab показывает API calls
- [ ] **Browser Tests (MCP Playwright):** если hooks используются в компонентах
- [ ] **Git Commit:** Stage 2 complete

---

### Этап 3: Frontend - Basic Chart Component (2-3 дня)
**Цель:** Один тип диаграммы (P-V Normal) работает с базовым UI

**3.1 Chart Component - P-V Normal:**
- [ ] Create `frontend/src/components/pv-diagrams/PVDiagramChart.tsx` (30 мин)
- [ ] ECharts config: Normal P-V (Volume x-axis, Pressure y-axis, linear) (2-3 часа)
- [ ] Series per cylinder: map data to ECharts format (1-2 часа)
- [ ] Color palette для цилиндров (8 цветов) (30 мин)
- [ ] Тест: отрендерить график с V8_2000.pvd, Cyl 1 (30 мин)

**3.2 Basic Controls:**
- [ ] Cylinder selector: dropdown (primary cylinder) (1-2 часа)
- [ ] RPM selector: dropdown (список .pvd файлов) (1 час)
- [ ] Связать controls с chartData: выбор RPM → загрузка .pvd → update chart (1-2 часа)

**3.3 Interactive Features:**
- [ ] ECharts tooltip: показать deg, volume, pressure на hover (1 час)
- [ ] ECharts legend: click to toggle cylinders visibility (30 мин)
- [ ] Zoom/pan: добавить dataZoom component (30 мин)

**Verify этап 3 (COMPREHENSIVE):**
- [ ] **Visual Test:** График рендерится для V8_2000.pvd, Cyl 1 (15 мин)
- [ ] **Interaction:** Dropdown RPM работает - переключение между файлами (15 мин)
- [ ] **Interaction:** Tooltip показывает данные на hover (15 мин)
- [ ] **Browser Tests (MCP Playwright):** Chart render + interactions
  - Open project → navigate to PV Diagrams
  - Verify chart visible, axes labeled, data plotted
  - Test RPM dropdown selection
  - Test tooltip on hover
- [ ] **TypeScript:** `npm run typecheck` - нет ошибок
- [ ] **Git Commit:** Stage 3 complete

---

### Этап 4: Frontend - Page & Advanced UI (2-3 дня)
**Цель:** Полноценная страница PVDiagramsPage с tab-based layout

**4.1 Create Page:**
- [ ] Create `frontend/src/pages/PVDiagramsPage.tsx` - базовая структура (30 мин)
- [ ] Routing: добавить route `/project/:id/pv-diagrams` в App.tsx (15 мин)
- [ ] Layout: header (project name + export), controls area, chart area (1 час)
- [ ] Тест: переход по URL работает, page загружается (15 мин)

**4.2 RPM Selection - Advanced:**
- [ ] Auto-detect peak pressure RPM из metadata (1 час)
- [ ] RPM dropdown: default select peak pressure RPM (1 час)
- [ ] Badge "🔴 Peak Pressure (85.7 bar) @ 18° ATDC" рядом с dropdown (1-2 часа)
- [ ] Dropdown items: show peak pressure per RPM в списке (1 час)

**4.3 Cylinder Selection - Advanced:**
- [ ] Collapsible "Add cylinders" panel с чекбоксами (2-3 часа)
- [ ] State: selectedCylinders array (boolean[]) (30 мин)
- [ ] "Select All" / "Clear" buttons (1 час)
- [ ] Sync с ECharts legend (клик на legend → update checkboxes) (1-2 часа)

**4.4 Tab-based Layout:**
- [ ] Tabs UI: "P-V Diagram", "Log P-V", "Pressure vs Angle" (1-2 часа)
- [ ] State: activeTab (string) (15 мин)
- [ ] Render разные chart configs based on activeTab (1 час)

**Verify этап 4 (COMPREHENSIVE):**
- [ ] **Visual Test:** Page доступна через navigation (15 мин)
- [ ] **Functionality:** Peak pressure RPM выбран по умолчанию (15 мин)
- [ ] **Interaction:** Tabs переключаются (график меняется) (15 мин)
- [ ] **Browser Tests (MCP Playwright):** Complete page flow
  - Navigate from project overview to PV Diagrams page
  - Verify peak pressure RPM selected by default
  - Verify badge shows peak pressure info
  - Test tab switching (P-V, Log P-V, P-α)
  - Test cylinder selection panel
- [ ] **TypeScript:** `npm run typecheck` - нет ошибок
- [ ] **Git Commit:** Stage 4 complete

---

### Этап 5: Frontend - Multiple Chart Types (2 дня)
**Цель:** Все 3 типа диаграмм работают

**5.1 Log P-V Chart:**
- [ ] ECharts config для Log P-V: logarithmic axes (1-2 часа)
- [ ] Тест: переключение P-V → Log P-V работает (30 мин)

**5.2 P-α Chart (Pressure vs Angle):**
- [ ] ECharts config для P-α: Crank Angle (0-720°) x-axis, Pressure y-axis (1-2 часа)
- [ ] Map data: из {deg, cylinders[{volume, pressure}]} → {angle, pressure} series (1 час)
- [ ] Markers: TDC (0°, 360°, 720°), BDC (180°, 540°) как vertical lines (1-2 часа)
- [ ] Marker для peak pressure angle (жирная красная линия + label) (1 час)
- [ ] Тест: P-α график показывает давление по углу с markers (30 мин)

**Verify этап 5 (COMPREHENSIVE):**
- [ ] **Visual Test:** Все 3 tabs работают (Normal P-V, Log P-V, P-α) (30 мин)
- [ ] **Visual Test:** Markers видны на P-α графике (TDC, BDC, peak pressure) (15 мин)
- [ ] **Browser Tests (MCP Playwright):** Chart types verification
  - Test Normal P-V: linear axes, correct scale
  - Test Log P-V: logarithmic axes visible
  - Test P-α: markers present (TDC, BDC, peak), angle axis 0-720°
- [ ] **TypeScript:** `npm run typecheck` - нет ошибок
- [ ] **Git Commit:** Stage 5 complete

---

### Этап 6: Frontend - Polish & Metadata (1-2 дня)
**Цель:** Peak values, metadata, visual polish

**6.1 Peak Values Cards:**
- [ ] Component: PeakValuesCards (3 cards: Max P, Min P, Volume Range) (1-2 часа)
- [ ] Utility: `findPeakPressure(data)` - return {value, angle, cylinder} (1 час)
- [ ] Display под графиком: peak values обновляются при смене данных (1 час)

**6.2 Metadata Display:**
- [ ] Info badge: "🔧 V8 TURBO | 2 Turbos | ..." в header (1 час)
- [ ] Expandable panel: full engine config (click badge → modal/dropdown) (1-2 часа)
- [ ] Данные из .pvd metadata + .prt file (если нужно) (1 час)

**6.3 Export Functionality:**
- [ ] Reuse `useChartExport` hook from Performance (30 мин)
- [ ] Export button: PNG/SVG dropdown (1 час)
- [ ] Тест: экспорт графика в PNG (15 мин)

**6.4 Design Polish:**
- [ ] TailwindCSS styling: consistent spacing, colors, typography (2-3 часа)
- [ ] Responsive: mobile/tablet layout (2 часа)
- [ ] Loading states: skeleton loader while .pvd loading (1 час)
- [ ] Error states: если .pvd файл не найден (1 час)

**Verify этап 6 (COMPREHENSIVE):**
- [ ] **Visual Test:** Peak values отображаются корректно (15 мин)
- [ ] **Functionality:** Export работает (PNG/SVG скачивается) (15 мин)
- [ ] **Visual Test:** UI выглядит профессионально на desktop/mobile (30 мин)
- [ ] **Browser Tests (MCP Playwright):** Polish & responsiveness
  - Verify peak values cards display correct data
  - Test export button (PNG/SVG download)
  - Test responsive layout (resize browser window)
  - Verify loading states show while data fetching
  - Test error states (invalid file, network error)
- [ ] **TypeScript:** `npm run typecheck` - нет ошибок
- [ ] **Git Commit:** Stage 6 complete

---

### Этап 7: Integration & Testing (1 день)
**Цель:** Интеграция с проектом, финальные тесты

**7.1 Project Overview Integration:**
- [ ] Enable PV-Diagrams card в `ProjectOverviewPage.tsx` (line 49-54) (15 мин)
- [ ] Update card description если нужно (15 мин)
- [ ] Тест: клик на card → переход на /pv-diagrams (15 мин)

**7.2 Navigation:**
- [ ] Back button работает (пользуется existing routing) (15 мин)
- [ ] Breadcrumb если нужно (опционально) (30 мин)

**7.3 Testing:**
- [ ] Тест с test-data/V8/*.pvd (13 файлов, 8 цилиндров) (30 мин)
- [ ] Тест с test-data/MOTO 250 V1/*.pvd (1 цилиндр) (30 мин)
- [ ] Edge cases: переключение между 1-cyl и 8-cyl проектами (30 мин)
- [ ] Verify: `npm run build` (frontend + backend) успешен (30 мин)
- [ ] Verify: `npm test` проходит (если есть unit tests) (30 мин)

**7.4 Documentation:**
- [ ] Update `CHANGELOG.md` - add v3.1 или v3.0.1 с PV-Diagrams feature (30 мин)
- [ ] Add comments в pvdParser.js (describe format) (30 мин)
- [ ] Update README если нужно (optional) (30 мин)
- [ ] Run `./scripts/check-doc-links.sh` - passes (15 мин)

**Verify этап 7 (COMPREHENSIVE - FINAL):**
- [ ] **Full E2E Test:** Полный user flow: Home → Project → PV-Diagrams → работает (30 мин)
- [ ] **Build:** `npm run build` (frontend + backend) успешен (15 мин)
- [ ] **Documentation:** Changelog, README, comments обновлены (15 мин)
- [ ] **Documentation Links:** `./scripts/check-doc-links.sh` - passes
- [ ] **Browser Tests (MCP Playwright):** Complete E2E flow
  - Open app → home page loads
  - Click project (V8) → overview page loads
  - Click PV-Diagrams card → PV page loads
  - Verify all 3 chart types work
  - Test with V8 (8-cyl): all RPMs work
  - Test with MOTO 250 (1-cyl): all RPMs work
  - Test navigation back to overview
- [ ] **Cross-project Test:** Switch between 1-cyl and 8-cyl projects
- [ ] **Performance:** Charts render in <500ms, no lag
- [ ] **TypeScript:** `npm run typecheck` - нет ошибок
- [ ] **Production Build:** Test production build locally
- [ ] **Git Commit:** FINAL - PV-Diagrams feature complete v3.1

---

## 📊 Summary
- **Total tasks:** 73 задачи
- **Estimated time:** 12-16 дней (при работе 3-4 часа в день)
- **или:** 6-8 дней (при работе 8 часов в день)

## 🎯 Success Criteria
- ✅ .pvd файлы парсятся корректно (backend)
- ✅ API возвращает список .pvd с peak pressure metadata
- ✅ Страница PVDiagramsPage доступна через navigation
- ✅ Peak pressure RPM выбран по умолчанию с badge
- ✅ 3 типа диаграмм работают (P-V, Log P-V, P-α)
- ✅ Cylinder selection (dropdown + add panel)
- ✅ Markers на P-α графике (TDC, BDC, peak pressure)
- ✅ Export PNG/SVG работает
- ✅ Build успешен, TypeScript без ошибок
- ✅ Тестировано с V8 (8 cyl) и MOTO 250 (1 cyl)

---

## 📝 Design Decisions

### UI Components:
- **Cylinder Selection:** Dropdown (primary) + collapsible "Add cylinders" panel (для сравнения)
- **RPM Selection:** Dropdown с auto-detection peak pressure RPM + badge + collapsible "Compare RPMs"
- **Chart Layout:** Tab-based (P-V, Log P-V, P-α) - clean switching
- **Peak Values:** 3 cards (Max P, Min P, Volume Range) - NO calculations (viewer only)
- **Metadata:** Collapsible info badge в header

### Technical:
- **Parser Pattern:** Registry pattern (как .det/.pou)
- **Chart Library:** ECharts (existing stack)
- **State:** React hooks + Zustand (global если нужно)
- **Styling:** TailwindCSS (consistency)
- **Export:** Reuse existing `useChartExport` hook

### Data Flow:
```
Backend: .pvd files → pvdParser → API endpoints
Frontend: hooks → components → ECharts
```

---

## 📝 Текущая сессия

**2025-01-10:**
- ✅ Обсуждение requirements и дизайна
- ✅ Roadmap создан
- ⏸️ Следующее: начать Этап 1 - PVD Parser

---

## 🔗 References
- [docs/file-formats/pvd-format.md](docs/file-formats/pvd-format.md) - PVD format spec
- [backend/src/parsers/formats/detParser.js](backend/src/parsers/formats/detParser.js) - Parser pattern reference
- [frontend/src/components/performance/ChartPreset1.tsx](frontend/src/components/performance/ChartPreset1.tsx) - Chart component pattern
- Test data: `test-data/V8/*.pvd`, `test-data/MOTO 250 V1/*.pvd`

---

**Notes:**
- English UI (international app)
- Viewer app - NO calculations (no integrals, no IMEP)
- Small changes + test after each step
- Read file BEFORE editing (technical requirement)
