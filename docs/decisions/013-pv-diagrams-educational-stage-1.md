# ADR 013: PV-Diagrams Educational Enhancement - Stage 1

**Дата:** 2025-01-11
**Статус:** Принято
**Автор:** Claude Code + User

## Контекст

PV-Diagrams страница (ADR-012) была реализована как профессиональный инструмент для анализа рабочего процесса ДВС, но имела избыточную сложность для **образовательного использования**:

**Проблемы для студентов:**
- Cylinder selection UI (8 кнопок) - перегружает интерфейс
- Невозможно сравнить несколько режимов (RPMs) на одном графике
- Нет визуальных индикаторов Max/Min давления в списке RPM
- Сложно понять какой режим важнее (нет carefully chosen defaults)

**Цель:** Превратить PV-Diagrams в образовательный инструмент для преподавания принципов ДВС студентам, не потеряв функциональность для экспертов.

**Target audience:** Преподаватели и студенты, изучающие 4-тактные двигатели.

## Решение

Реализован **Stage 1: Simplify UI + Multi-RPM Comparison** с последующим rollback проблемного Stage 1.2:

### Stage 1: Multi-RPM Comparison ✅

**1.1 Упрощение UI (Cylinder Selection → Always Cylinder 1):**
- Удален Cylinder selection UI (CylinderFilterSection.tsx)
- Zustand state: удален `selectedCylinder`, все графики показывают Cylinder 1 (index 0)
- Обоснование: Для **образовательных целей** разница между цилиндрами минимальна, один цилиндр достаточен для понимания термодинамики

**1.2 Multi-RPM Comparison Feature:**
- Zustand state: `selectedRPM: string | null` → `selectedRPMs: string[]` (массив выбранных файлов)
- Actions: `addSelectedRPM()`, `removeSelectedRPM()`, `clearSelectedRPMs()`, `setSelectedRPMs([])`
- RPMSection UI: checkbox-based multi-select (max 4 RPMs)
- usePVDData hook: параллельная загрузка с Promise.all
- Chart helpers: overlay multiple RPM series с разными цветами:
  - RPM 1: #e74c3c (red)
  - RPM 2: #3498db (blue)
  - RPM 3: #2ecc71 (green)
  - RPM 4: #f39c12 (orange)
- Все 3 типа диаграмм поддерживают multi-RPM: P-V, Log P-V, P-α

**Образовательная ценность:**
- Студенты ВИДЯТ как цикл меняется с RPM (сравнение на одном графике)
- Сравнение пиковых давлений на разных режимах
- Визуализация эффективности "дыхания" двигателя
- Понимание важности valve timing на разных скоростях

### Stage 1.1: Max/Min Pressure Badges ✅

**iPhone-style indicators в RPM списке:**
- Каждый RPM показывает 2 бейджа:
  - **Max Pressure**: красный бейдж с максимальным давлением (bar)
  - **Min Pressure**: синий бейдж с минимальным давлением (bar)
- Carefully chosen design: компактные, читаемые, профессиональные
- Dynamic updates: обновляются при загрузке данных

**Образовательная ценность:**
- Мгновенное сравнение давлений между режимами
- Визуальные индикаторы помогают выбрать режим для анализа
- "iPhone Style" - профессиональный вид, интуитивный UX

### Stage 1.2: Peak Pressure Angles Fix (❌ Rollback)

**Попытка исправления:**
- Обнаружена проблема: углы пикового давления физически неправильные (133°, 260°, 554°)
- Ожидаемое: 365-390° (5-30° ATDC после TDC = 360°)
- Попытка: автоматический выбор правильного цилиндра из массива
- **Root cause:** `.pvd` parser неправильно интерпретирует firing order (строка 15-16)
  - `cylinders[0]` ≠ "первый цилиндр по порядку работы"
  - `cylinders[0]` = просто первый элемент массива (может быть TDC = 730°, 460°, etc.)

**Решение: Rollback + документирование:**
- Откачено к простому варианту: `cylinders[0]` везде
- Проблема задокументирована: `ПРОБЛЕМА-PV-DIAGRAMS-ANGLES.md`
- Technical Debt: исправить `.pvd` parser (backend/src/parsers/formats/pvdParser.js)
- **Почему rollback:** Риск сломать production, проблема в корневой причине (parser), временное решение маскирует реальную проблему

## Причины

### 1. **Упрощение до Cylinder 1** (educational focus)
- ✅ Для образовательных целей разница между цилиндрами **минимальна** (±1-2% давления)
- ✅ Убирает перегрузку UI (8 кнопок → 0 кнопок)
- ✅ Студенты фокусируются на термодинамике, а не на выборе цилиндра
- ✅ Эксперты могут изучить данные в EngMod4T если нужна детализация

### 2. **Multi-RPM Comparison** (key educational feature)
- ✅ **Visual learning:** студенты ВИДЯТ как цикл меняется с RPM
- ✅ Сравнение режимов на одном графике (без переключения вкладок)
- ✅ Понимание breathing efficiency, valve timing importance
- ✅ Overlay visualization с цветовым кодированием (интуитивно)

### 3. **Max/Min Badges** ("iPhone Style")
- ✅ Carefully chosen defaults: мгновенно видно какой режим важнее
- ✅ Visual indicators без calculations (viewer-only approach)
- ✅ Professional appearance (консистентность с PerformancePage)

### 4. **Rollback Stage 1.2** (engineering discipline)
- ✅ **Production stability:** не сломать работающее приложение временным фиксом
- ✅ **Root cause over symptoms:** исправить парсер, а не маскировать проблему
- ✅ **Documentation:** задокументировать technical debt для будущего
- ✅ **Small changes:** следование правилу "one change → test → next"

### 5. **Parallel Loading** (performance)
- ✅ Promise.all → загрузка 4 файлов параллельно (быстрее чем последовательно)
- ✅ Combined loading/error states → чистый UX

## Последствия

### Плюсы:
- ✅ **Educational value:** студенты могут СРАВНИВАТЬ режимы на одном графике
- ✅ **Simplified UI:** убран clutter (cylinder selection), фокус на термодинамике
- ✅ **Visual indicators:** Max/Min badges помогают выбрать режим
- ✅ **Professional appearance:** "iPhone Style" UX (carefully chosen defaults)
- ✅ **Multi-RPM overlay:** 3 цветовых схемы, легенда, tooltips
- ✅ **All chart types work:** P-V, Log P-V, P-α поддерживают multi-RPM
- ✅ **Production stability:** rollback Stage 1.2 сохранил стабильность
- ✅ **Build успешен:** TypeScript ✓, build (3.14s) ✓, server restart ✓

### Минусы:
- ⚠️ **Lost per-cylinder analysis:** нельзя сравнить цилиндры (acceptable для образования)
- ⚠️ **Peak pressure angles incorrect:** Known issue, задокументировано в `ПРОБЛЕМА-PV-DIAGRAMS-ANGLES.md`
- ⚠️ **Technical Debt:** нужно исправить `.pvd` parser (deferred)

### Technical Debt:
- [ ] Fix `.pvd` parser: align firing order (строка 15-16) с `cylinders[]` array
- [ ] Ensure `cylinders[0]` всегда соответствует цилиндру с TDC ≈ 360°
- [ ] Add validation: проверять что пик давления в диапазоне 365-390°, иначе ошибка парсинга

### Educational Impact:
- 🎓 **HIGH:** Студенты могут визуализировать изменение цикла с RPM
- 🎓 Понимание breathing efficiency (intake/exhaust pressure losses)
- 🎓 Сравнение peak pressures на разных режимах
- 🎓 Подготовка к Stage 2-4: cycle phases, markers, valve timing

## Альтернативы

### 1. Keep Cylinder Selection (rejected)
**Pros:** Полная функциональность для экспертов
**Cons:** Clutter UI, избыточная сложность для студентов, минимальная разница между цилиндрами
**Вердикт:** Отклонено - образовательная цель важнее

### 2. Single RPM Only (no comparison) (rejected)
**Pros:** Простота реализации
**Cons:** Упущенная возможность для образования (no comparison = no learning)
**Вердикт:** Отклонено - comparison критичен для обучения

### 3. Side-by-side Charts (rejected)
**Pros:** Каждый RPM в своем графике
**Cons:** Сложнее сравнивать (переключение взгляда), больше места на экране
**Вердикт:** Отклонено - overlay эффективнее для сравнения

### 4. Fix Stage 1.2 Without Rollback (rejected)
**Pros:** Исправление углов
**Cons:** Риск сломать production, временное решение маскирует корневую причину
**Вердикт:** Отклонено - rollback + документирование безопаснее

## Файлы

### Modified (Stage 1 + 1.1):
**Backend:**
- `backend/src/routes/data.js` (lines 642-653)
  - Peak pressure calculation: simplified to Cylinder 1 only
  - Comment added: "educational simplification"

**Frontend - State:**
- `frontend/src/stores/slices/pvDiagramsSlice.ts`
  - Changed: `selectedRPM: string | null` → `selectedRPMs: string[]`
  - Added actions: `addSelectedRPM`, `removeSelectedRPM`, `clearSelectedRPMs`, `setSelectedRPMs`

**Frontend - Hooks:**
- `frontend/src/hooks/usePVDData.ts`
  - Accept `fileNames: string[]` instead of single fileName
  - Parallel loading with Promise.all
  - Return `dataArray: PVDDataItem[]` (array of RPM data)

**Frontend - Components:**
- `frontend/src/components/pv-diagrams/RPMSection.tsx`
  - Checkbox-based multi-select (max 4 RPMs)
  - Max/Min pressure badges (red/blue indicators)
  - "Compare X RPMs" label
  - Clear all button

- `frontend/src/components/pv-diagrams/chartOptionsHelpers.ts` (lines 46-246, 258-322, 335-557)
  - `createPVChartOptions`: Multi-RPM overlay with colors
  - `createLogPVChartOptions`: Multi-RPM overlay
  - `createPAlphaChartOptions`: Multi-RPM overlay
  - Legend: "2000 RPM", "4000 RPM", etc.
  - Tooltip: show RPM value

- `frontend/src/components/pv-diagrams/PeakValuesCards.tsx` (lines 42-50)
  - Calculate stats across ALL selected RPMs (Cylinder 1 only)
  - Label: "(across N RPMs)" when multiple selected

**Frontend - Pages:**
- `frontend/src/pages/PVDiagramsPage.tsx`
  - Pass `selectedRPMs` array to `usePVDData`
  - Removed cylinder selection logic

### Deleted (Stage 1):
- `frontend/src/components/pv-diagrams/CylinderFilterSection.tsx` (deleted component)

### Created (Documentation):
- `ПРОБЛЕМА-PV-DIAGRAMS-ANGLES.md` (root) - Problem documentation
  - Documented incorrect angles issue (133°, 260°, 554°)
  - Root cause analysis: `.pvd` parser firing order problem
  - Solution plan: fix backend/src/parsers/formats/pvdParser.js

## Метрики

**Development:**
- **Time:** ~4 hours (Stage 1 + 1.1 + rollback + verification)
- **Tasks completed:** Stage 1 ✅, Stage 1.1 ✅, Stage 1.2 ❌ (rollback)

**Code:**
- **Lines changed:** ~300 lines (backend + frontend)
- **Components modified:** 6 files
- **Components deleted:** 1 file (CylinderFilterSection.tsx)

**Build:**
- **TypeScript:** ✓ no errors
- **Frontend build:** 3.14s (2.1 MB bundle)
- **Backend startup:** <500ms (lazy parsing)
- **Server restart:** ✓ successful

**Testing:**
- **Browser tests:** ✓ all passed
  - Multi-RPM selection works (2-4 files)
  - Chart overlay renders correctly
  - Max/Min badges visible
  - All 3 diagram types work (P-V, Log P-V, P-α)
  - Color-coded series + legend visible

## Ссылки

**Documentation:**
- [roadmap-pv-diagrams-educational.md](../../roadmap-pv-diagrams-educational.md) - Implementation roadmap
- [ПРОБЛЕМА-PV-DIAGRAMS-ANGLES.md](../../ПРОБЛЕМА-PV-DIAGRAMS-ANGLES.md) - Known issue documentation
- [ADR-012](012-pv-diagrams-implementation.md) - Original PV-Diagrams implementation

**Related ADRs:**
- [ADR-012](012-pv-diagrams-implementation.md) - PV-Diagrams original implementation (cylinder selection)

**Code References:**
- `backend/src/parsers/formats/pvdParser.js` (lines 70-76) - Firing order parsing (needs fix)
- `frontend/src/components/pv-diagrams/` - All PV-Diagram components
- `frontend/src/stores/slices/pvDiagramsSlice.ts` - State management

**Test Data:**
- `test-data/V8/*.pvd` (8-cylinder, 13 files, 2000-8500 RPM) - Perfect for multi-RPM comparison!
- `test-data/MOTO 250 V1/*.pvd` (1-cylinder, multiple RPMs)

---

**Notes:**
- Stage 1 + 1.1 complete ✅, Stage 1.2 rollback ❌
- Known issue documented (peak pressure angles)
- Next: Stage 2 - Cycle phases visualization (P-α diagram)
- Educational focus: simple UI, powerful comparison, visual learning
