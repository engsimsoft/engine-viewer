# 📋 ROADMAP: Project Metadata Dashboard Implementation

**Created:** 5 ноября 2025
**Status:** 🚀 In Progress
**Based on:** PROJECT-METADATA-DASHBOARD-SPEC.md

---

## 🎯 Цель проекта

Внедрить систему управления проектами для инженера работающего с **~50 проектами в год**:

- ✅ Автоматическое извлечение metadata из `.prt` файлов
- ✅ Dashboard с умными фильтрами (Type, Intake, Exhaust, Cylinders)
- ✅ ID vs Display Name (файлы не трогаем, user редактирует названия)
- ✅ "iPhone quality" UI (минимализм, плавность, профессионализм)

---

## 📊 Текущий статус

- **Этап:** Phase 1 - Foundation & Backend
- **Прогресс:** 0/29 задач (0%)
- **Следующее:** Research & Planning → изучить best practices

---

## 🚀 Phase 1: Foundation & Backend (Неделя 1)

**Цель:** `.prt` parser работает, metadata структура готова, API обновлён

### 1.1 Research & Planning (2-3 часа)

- [ ] **Изучить документацию:** ECharts badge/tag components (WebFetch официальных docs)
- [ ] **Изучить best practices:** Radix UI Badge component patterns
- [ ] Изучить существующие parsers (detParser.js, pouParser.js) - паттерны и структура
- [ ] Прочитать docs/parsers-guide.md - правила добавления парсеров
- [X] Создать roadmap файл: `PROJECT-METADATA-DASHBOARD-ROADMAP.md`

### 1.2 Backend: .prt Parser (5-7 часов)

- [X] **Создать `backend/src/parsers/formats/prtParser.js`** (2-3 часа)
  - Parse project name (line 8: "4_Cyl_ITB engine")
  - Parse creation date/time (lines 12-13)
  - Parse Dat4T version (line 15)
  - Parse engine type: "Naturally Aspirated" → "NA" (line 36)
  - Parse cylinders count (line 38)
  - Parse configuration: "INLINE TYPE" → "inline" (line 39)
  - Parse specs: bore, stroke, compression ratio, max power RPM (lines 46-55)

- [X] **Implement Intake System detection** (1-2 часа)
  - Logic: parse "with no airboxes" → ITB
  - Logic: parse "with a common airbox or plenum" → IM
  - Extract throttles count (line 276)
  - Extract boxes/plenums count (line 277)

- [X] **Implement Exhaust System detection** (1 час)
  - Parse pattern: "4into2into1 manifold" (line 215)
  - Format output: "4into2into1" → "4-2-1"
  - Support: 4-2-1, 4-1, tri-y, 8-4-2-1

- [X] **Register parser in Registry** (30 min)
  - Update `backend/src/parsers/index.js`
  - Add: `globalRegistry.register('prt', PrtParser);`

- [X] **Test parser with all 4 .prt files** (1 час)
  - Test: 4_Cyl_ITB.prt (ITB detection)
  - Test: Vesta 1.6 IM.prt (IM detection)
  - Test: BMW M42.prt (exhaust pattern)
  - Verify all fields extracted correctly

**🔄 Checkpoint 1.2: .prt Parser Complete**

- [X] **Automated Testing:**
  - Run backend server (no errors)
  - Test parser manually with all 4 .prt files
  - Verify console output (all fields parsed correctly)

- [X] **Git Commit:** `feat: implement .prt parser with intake/exhaust detection`
  - Commit hash: 1efaa37
  - Phase 1.2 + 1.3 + 1.4 combined

- [ ] **Browser Testing Request (Vladimir):**
  - ⏸️ Not applicable (backend only, no UI changes yet)

### 1.3 Backend: Metadata Structure Update (3-4 часа)

- [X] **Update metadata schema** (1 час)
  - Split into "auto" (from .prt) + "manual" (user edits)
  - Add "version": "1.0"
  - Add "displayName" field (optional, default = ID)
  - Update TypeScript types in `shared-types.ts`

- [X] **Create migration script** (1-2 часа)
  - Script: `backend/src/scripts/migrateMetadata.js`
  - Read existing `.metadata/*.json` files
  - Convert to new structure (old → manual section)
  - Preserve user data (description, client, tags, status, notes, color)
  - Add backward compatibility (read old format if "manual" missing)

- [X] **Update `metadataService.js`** (1 час)
  - Implement merge logic: update "auto", preserve "manual"
  - Add timestamp "modified" on any change
  - Add validation for new structure

**🔄 Checkpoint 1.3: Metadata Structure Updated**

- [X] **Automated Testing:**
  - Run backend server (no errors)
  - Run migration script on test data
  - Verify new metadata structure in .metadata/ files
  - Test backward compatibility (read old format)

- [X] **Git Commit:** `feat: implement auto/manual metadata separation`
  - Commit hash: 1efaa37 (combined with Phase 1.2 + 1.4)

- [ ] **Browser Testing Request (Vladimir):**
  - ⏸️ Not applicable (backend only, no UI changes yet)

### 1.4 Backend: File Scanner & API Updates (2-3 часа)

- [X] **Update `fileScanner.js`** (1 час)
  - Include `.prt` files in scan (add to extensions array)
  - Parse .prt → extract "auto" metadata
  - Create/update `.metadata/<projectId>.json` with "auto" section
  - Add recursive directory scanning for subdirectory structure

- [X] **Update `GET /api/projects` endpoint** (1 час)
  - Merge "auto" + "manual" metadata
  - Return displayName (or ID if displayName empty)
  - Add filters support (query params: cylinders, type, intake, exhaust)

- [X] **Update `PATCH /api/projects/:id/metadata` endpoint** (1 час)
  - Only update "manual" section
  - Preserve "auto" section
  - Update "modified" timestamp

**🔄 Checkpoint 1.4: Backend APIs Updated**

- [X] **Automated Testing:**
  - Run backend server (no errors) ✅
  - Test GET /api/projects (verify auto+manual merge) ✅
  - Test GET /api/projects with filters (cylinders, type, intake, exhaust) ✅
  - Test PATCH /api/projects/:id/metadata (manual section only) ✅
  - Verify .prt files are scanned on startup ✅
  - Verify recursive scanning works with subdirectories ✅

- [X] **Git Commit:** `feat: update API endpoints with .prt metadata support`
  - Commit hash: 1efaa37 (combined with Phase 1.2 + 1.3)
  - Additional bugfixes: f3f5975

- [X] **Browser Testing Request (Vladimir):**
  **Чек-лист для тестирования:**
  1. Открыть http://localhost:5173
  2. Проверить что Dashboard загружается без ошибок
  3. Открыть Developer Console → Network tab
  4. Проверить GET /api/projects response:
     - Есть поле "auto" с данными из .prt
     - Есть поле "manual" с пользовательскими данными
     - displayName отображается (или ID если displayName пустой)
  5. Открыть любой проект → Edit Info → сохранить изменения
  6. Проверить что "manual" данные обновились, "auto" не изменились

  **Ожидаемый результат:** API работает, metadata структура правильная, изменения сохраняются
  **✅ TESTED BY VLADIMIR** - Working, но недостаёт engine badges на карточках

### 1.5 Backend Testing & Documentation (1-2 часа)

- [X] **Test API endpoints** (1 час)
  - Test: GET /api/projects with filters ✅
  - Test: PATCH metadata (manual section only) ✅
  - Verify "auto" metadata preserved ✅

- [X] **Run migration script on test data** (30 min)
  - Migrate existing metadata files ✅
  - Verify backward compatibility ✅

- [ ] **Document changes** (30 min) ⚠️ MISSING
  - Update `docs/architecture.md` (metadata structure)
  - Create ADR: `docs/decisions/005-prt-parser-metadata-separation.md`

**🔄 Checkpoint 1.5: Phase 1 Complete**

- [X] **Automated Testing:**
  - Run full test suite (if exists) ✅
  - Check all backend endpoints working ✅
  - Verify no console errors ✅
  - Check TypeScript compilation ✅

- [X] **Git Commit:** `docs: add .prt parser documentation and ADR` ✅ `dab96e5`
  - Update docs/architecture.md with new metadata structure ✅
  - Create ADR-005: .prt parser and metadata separation ✅
  - Document intake/exhaust detection logic ✅

- [ ] **Phase 1 Sign-off (Vladimir):**
  **✅ Phase 1 COMPLETE:**
  1. Backend работает без ошибок ✅
  2. .prt файлы парсятся корректно ✅
  3. Metadata структура auto+manual работает ✅
  4. API endpoints возвращают правильные данные ✅
  5. Можно откатиться на любой commit ✅
  6. Documentation complete (ADR-005, docs/architecture.md) ✅

  **➡️ Следующий шаг: Phase 2.4 - Engine badges на карточках**

---

## 🚀 Phase 2: Frontend Core (Неделя 2)

**Цель:** Dashboard с фильтрами, search, sorting, enhanced cards

### 2.1 TypeScript Types & API Client (1-2 часа) ✅

- [X] **Update frontend types** (`frontend/src/types/index.ts`) (1 час)
  - Add `EngineConfig` interface (from .prt auto metadata)
  - Add `IntakeSystem` type: "ITB" | "IM"
  - Add `ExhaustSystem` type: "4-2-1" | "4-1" | "tri-y" | etc.
  - Update `ProjectInfo` with new fields (displayName, auto metadata)

- [X] **Update API client** (`frontend/src/api/client.ts`) (30 min)
  - Add filters params to `getProjects()`
  - Update response types

**🔄 Checkpoint 2.1: TypeScript Types Updated** ✅

- [X] **Automated Testing:**
  - Run `npm run typecheck` (frontend) - no errors ✅
  - Verify TypeScript compilation successful ✅

- [X] **Git Commit:** `feat(frontend): add TypeScript types for .prt metadata` ✅
  ```
  - Add EngineConfig interface
  - Add IntakeSystem and ExhaustSystem types
  - Update ProjectInfo with displayName and auto metadata
  - Update API client with filters support
  ```

- [X] **Browser Testing Request (Vladimir):**
  - ⏸️ Not applicable (types only, no visual changes)

### 2.2 UI Components: Badges (2-3 часа)

- [ ] **Study Radix UI Badge component** (30 min)
  - Read official docs: https://www.radix-ui.com/
  - Study best practices for badge design

- [ ] **Create `EngineBadge` component** (1 час)
  - Props: type, intake, exhaust, cylinders
  - Color coding:
    - NA = green, Turbo = blue, Supercharged = purple
    - ITB = orange, IM = gray
    - Cylinders = gray
  - TailwindCSS styling (consistent with existing UI)

- [ ] **Test badge component** (30 min)
  - Test all color combinations
  - Test responsive sizing
  - Test accessibility (WCAG 2.1 AA)

**🔄 Checkpoint 2.2: Badge Component Created**

- [ ] **Automated Testing:**
  - Run dev server - no console errors
  - Verify badge renders in Storybook/isolated component
  - Check all color variants render correctly

- [ ] **Git Commit:** `feat(frontend): create EngineBadge component`
  ```
  - Add EngineBadge component with color coding
  - NA=green, Turbo=blue, Supercharged=purple, ITB=orange
  - TailwindCSS styling consistent with existing UI
  - WCAG 2.1 AA accessibility
  ```

- [ ] **Browser Testing Request (Vladimir):**
  **Чек-лист для тестирования:**
  1. Открыть http://localhost:5173
  2. Найти badge компоненты на карточках проектов
  3. Проверить цвета:
     - NA badge зелёный
     - ITB badge оранжевый
     - IM badge серый
     - Cylinders badge серый
  4. Проверить читаемость текста на всех badges
  5. Проверить responsive: badges выглядят хорошо на mobile/tablet/desktop

  **Ожидаемый результат:** Badges выглядят профессионально, цвета различаются, текст читаемый

### 2.3 Dashboard: Filters Component (3-4 часа)

- [ ] **Create `FiltersBar` component** (2-3 часа)
  - Multi-select for: Type (NA, Turbo, Supercharged)
  - Multi-select for: Intake (ITB, IM)
  - Multi-select for: Cylinders (1, 2, 3, 4, 5, 6, 8)
  - Multi-select for: Exhaust (4-2-1, 4-1, tri-y)
  - Search input (displayName, client)
  - Sort dropdown (date, name, cylinders)
  - Active filters display (removable chips)
  - "Clear all" button

- [ ] **Implement filter logic** (1 час)
  - Client-side filtering (projects array)
  - Combine filters (AND logic)
  - Search across displayName + client fields
  - Sorting functions

**🔄 Checkpoint 2.3: Filters Component Created**

- [ ] **Automated Testing:**
  - Run dev server - no console errors
  - Test filters in isolation (filter test data)
  - Verify all filter combinations work
  - Test search functionality
  - Test sort functionality

- [ ] **Git Commit:** `feat(frontend): create FiltersBar component with multi-select`
  ```
  - Add FiltersBar component (Type, Intake, Exhaust, Cylinders)
  - Implement search by displayName and client
  - Add sort dropdown (date, name, cylinders)
  - Active filters display with remove chips
  - Client-side filtering with AND logic
  ```

- [ ] **Browser Testing Request (Vladimir):**
  **Чек-лист для тестирования:**
  1. Открыть Dashboard http://localhost:5173
  2. Проверить FiltersBar отображается над карточками
  3. Тест фильтров:
     - Выбрать "Type: NA" → видны только NA проекты
     - Добавить "Intake: ITB" → видны только NA + ITB проекты
     - Очистить фильтры → все проекты снова видны
  4. Тест поиска:
     - Ввести "Vesta" → найден проект Vesta
     - Очистить → все проекты снова видны
  5. Тест сортировки:
     - Sort by "Date" → проекты по дате
     - Sort by "Name" → алфавитный порядок
  6. Тест responsive: фильтры работают на mobile/tablet/desktop

  **Ожидаемый результат:** Фильтры работают корректно, можно комбинировать, UI плавный

### 2.4 Dashboard: Enhanced ProjectCard (2-3 часа)

- [ ] **Update `ProjectCard.tsx`** (2 часа)
  - Display: displayName (large, bold)
  - Display: ID (small, gray, muted) - below displayName
  - Add: Engine badges (NA, ITB, 4 Cyl, 4-2-1)
  - Update layout for new fields
  - Keep existing: client, calculations count, date, status

- [ ] **Test ProjectCard** (1 час)
  - Test with all 4 test projects
  - Test with/without displayName (fallback to ID)
  - Test with/without client
  - Test color coding

**🔄 Checkpoint 2.4: ProjectCard Enhanced**

- [ ] **Automated Testing:**
  - Run dev server - no console errors
  - Verify all 4 test projects render correctly
  - Check displayName fallback to ID works
  - Verify badges display correctly

- [ ] **Git Commit:** `feat(frontend): enhance ProjectCard with displayName and badges`
  ```
  - Add displayName display (large, bold)
  - Add ID display (small, gray, muted)
  - Add engine badges (NA, ITB, cylinders, exhaust)
  - Update layout for new fields
  - Keep existing: client, calculations, date, status
  ```

- [ ] **Browser Testing Request (Vladimir):**
  **Чек-лист для тестирования:**
  1. Открыть Dashboard http://localhost:5173
  2. Проверить каждую карточку проекта:
     - Display Name отображается крупно сверху (если есть)
     - ID отображается мелко, серым цветом под Display Name
     - Badges отображаются (NA, ITB/IM, 4 Cyl, 4-2-1)
  3. Найти проект БЕЗ Display Name:
     - Должен показывать ID вместо Display Name
  4. Проверить hover эффект:
     - Карточка слегка увеличивается
     - Тень усиливается
     - Плавная анимация 300ms
  5. Проверить responsive: карточки выглядят хорошо на всех экранах

  **Ожидаемый результат:** Карточки выглядят профессионально, информация читаемая, "iPhone quality"

### 2.5 Metadata Dialog: Enhanced Form (2-3 часа)

- [ ] **Update `MetadataDialog.tsx`** (2-3 часа)
  - Add section: "📋 Project Identity"
  - Add field: ID (readonly, locked icon, disabled input)
  - Add field: Display Name (editable, large input)
  - Keep existing fields: description, client, tags, status, notes
  - Add section: "🔧 Engine Configuration" (readonly, from auto metadata)
    - Show: cylinders, type, configuration, bore, stroke, intake, exhaust
  - Update form validation (Zod schema)
  - Update API call (only send manual section)

**🔄 Checkpoint 2.5: Metadata Dialog Enhanced**

- [ ] **Automated Testing:**
  - Run dev server - no console errors
  - Test dialog opening/closing
  - Test form validation (Zod schema)
  - Test saving changes (API call)
  - Verify "auto" section not sent to API

- [ ] **Git Commit:** `feat(frontend): enhance MetadataDialog with ID and auto metadata`
  ```
  - Add "Project Identity" section (ID readonly, Display Name editable)
  - Add "Engine Configuration" section (auto metadata readonly)
  - Update Zod schema for new fields
  - Update API call (only send manual section)
  - Add lock icon for ID field
  ```

- [ ] **Browser Testing Request (Vladimir):**
  **Чек-лист для тестирования:**
  1. Открыть Dashboard → выбрать проект → нажать Edit Info
  2. Проверить "📋 Project Identity" section:
     - ID field показывает ID проекта (readonly, серый, с иконкой замка)
     - Display Name field редактируемый (можно вводить текст)
  3. Проверить "🔧 Engine Configuration" section (readonly):
     - Отображается: cylinders, type, configuration, bore, stroke, intake, exhaust
     - Все поля серые (нельзя редактировать)
  4. Тест сохранения:
     - Изменить Display Name на "Test Project"
     - Нажать Save
     - Закрыть dialog → открыть снова
     - Display Name = "Test Project" (сохранилось)
     - ID НЕ изменился (readonly работает)
  5. Проверить что старые поля работают: description, client, tags, status, notes

  **Ожидаемый результат:** Dialog работает, Display Name редактируется, ID readonly, auto metadata отображается

### 2.6 HomePage: Integration (1-2 часа)

- [ ] **Update `HomePage.tsx`** (1-2 часа)
  - Add `FiltersBar` component above grid
  - Connect filters state to project list
  - Add empty state: "No projects match filters"
  - Add loading state (skeleton cards)
  - Test responsive layout (filters + cards)

**🔄 Checkpoint 2.6: Phase 2 Complete**

- [ ] **Automated Testing:**
  - Run dev server - no console errors
  - Test full flow: filters → cards → dialog → save
  - Verify all components integrated correctly
  - Check TypeScript types (no errors)
  - Check responsive layout (mobile/tablet/desktop)

- [ ] **Git Commit:** `feat(frontend): integrate FiltersBar with HomePage dashboard`
  ```
  - Add FiltersBar above project cards grid
  - Connect filters state to project list
  - Add empty state for no matches
  - Add loading skeleton state
  - Test responsive layout
  ```

- [ ] **Phase 2 Sign-off (Vladimir):**
  **✅ Phase 2 Complete когда:**
  1. Dashboard отображает все проекты с новыми полями
  2. Фильтры работают (Type, Intake, Exhaust, Cylinders)
  3. Search находит проекты по displayName и client
  4. ProjectCard показывает displayName, ID (мелко), badges
  5. MetadataDialog позволяет редактировать displayName и manual metadata
  6. Всё работает на mobile/tablet/desktop
  7. UI выглядит профессионально ("iPhone quality")

  **➡️ После OK от Vladimir → переходим к Phase 3 (Polish)**

---

## 🚀 Phase 3: Polish & Testing (Неделя 3)

**Цель:** "iPhone quality" UI, все баги исправлены, production-ready

### 3.1 UI Polish & Animations (2-3 часа)

- [ ] **Add smooth animations** (1-2 часа)
  - Card hover: scale(1.02), shadow increase, 300ms transition
  - Badge animations: subtle hover effects
  - Filters: smooth expand/collapse
  - Search: debounce input (300ms)

- [ ] **Improve spacing & typography** (1 час)
  - Review all components for "iPhone quality"
  - Consistent whitespace (Tailwind spacing scale)
  - Professional typography (font sizes, weights, line heights)

### 3.2 Accessibility & Error Handling (2-3 часа)

- [ ] **Accessibility audit** (1 час)
  - WCAG 2.1 AA compliance
  - Keyboard navigation (filters, cards, dialog)
  - Screen reader testing (aria-labels)
  - Color contrast check (badges, text)

- [ ] **Error handling** (1-2 часа)
  - Frontend: API error states (toast notifications)
  - Backend: .prt parse errors (graceful fallback)
  - Empty states: no projects, no search results
  - Loading states: skeleton UI (not spinners)

### 3.3 Testing & Bug Fixes (3-4 часа)

- [ ] **Test with all 4 test projects** (1 час)
  - 4_Cyl_ITB (ITB, NA, 4 Cyl, 4-2-1)
  - Vesta 1.6 IM (IM, NA, 4 Cyl, 4-2-1)
  - BMW M42 (IM, NA, 4 Cyl, 4-2-1)
  - TM Soft ShortCut (check all fields)

- [ ] **Test filters combinations** (1 час)
  - Single filter (Type = NA)
  - Multiple filters (NA + ITB + 4 Cyl)
  - Search + filters
  - Sorting + filters

- [ ] **Test edge cases** (1 час)
  - Project without displayName (fallback to ID)
  - Project without client (should hide client field)
  - Corrupted .prt file (error handling)
  - Empty .metadata file (backward compatibility)

- [ ] **Bug fixes** (1-2 часа)
  - Fix any bugs found during testing
  - Review console errors/warnings
  - Performance optimization (if needed)

### 3.4 Documentation & Cleanup (2-3 часа)

- [ ] **Update documentation** (1-2 часа)
  - Update `README.md` (new features section)
  - Update `CHANGELOG.md` (version bump, new features)
  - Update `docs/architecture.md` (metadata structure, .prt parser)
  - Update `docs/file-formats/README.md` (add .prt format)
  - Create `docs/file-formats/prt-format.md` (specification)

- [ ] **Code cleanup** (1 час)
  - Remove console.logs
  - Remove commented code
  - Add JSDoc comments to parser
  - Consistent formatting (Prettier)

- [ ] **Final testing** (30 min)
  - Smoke test entire flow
  - Test on different browsers (Chrome, Safari)
  - Test responsive layout (mobile, tablet, desktop)

**🔄 Checkpoint 3.4: Phase 3 Complete - RELEASE**

- [ ] **Automated Testing:**
  - Full smoke test (backend + frontend)
  - No console errors/warnings
  - TypeScript compilation successful
  - All tests pass

- [ ] **Git Commit:** `chore: final cleanup and documentation update`
  ```
  - Remove all console.logs
  - Clean up commented code
  - Add JSDoc comments
  - Update all documentation
  - Format code with Prettier
  ```

- [ ] **Final Browser Testing (Vladimir):**
  **✅ RELEASE READY когда:**
  1. ✅ All features работают (filters, search, badges, displayName, metadata)
  2. ✅ No bugs найдено
  3. ✅ UI "iPhone quality" (smooth, professional, accessible)
  4. ✅ Works на всех устройствах (mobile/tablet/desktop)
  5. ✅ Works на всех browsers (Chrome, Safari)
  6. ✅ Documentation updated (README, CHANGELOG, architecture)
  7. ✅ All git commits сделаны (можно откатиться на любой checkpoint)

- [ ] **FINAL Git Commit:** `chore: bump version to v2.1.0 - Project Metadata Dashboard`
  ```
  - Complete implementation of Project Metadata Dashboard
  - .prt parser with auto metadata extraction
  - Dashboard filters (Type, Intake, Exhaust, Cylinders)
  - ID vs Display Name support
  - Enhanced ProjectCard with badges
  - Updated MetadataDialog with auto/manual sections
  - "iPhone quality" UI with smooth animations
  - Full documentation and ADRs

  ✅ All features tested and approved
  ✅ Ready for production use
  ```

- [ ] **Update CHANGELOG.md:** Add v2.1.0 release notes

---

## 🧪 Testing & Git Workflow Protocol

**КРИТИЧЕСКИ ВАЖНО:** Каждая задача проходит 3 этапа:

### 1. Code Implementation
- Написать код согласно roadmap

### 2. Automated Testing (Claude)
- Запустить сервер (backend + frontend)
- Проверить консоль на ошибки
- Протестировать API endpoints (если backend)
- Проверить TypeScript типы (если frontend)
- **НЕ переходить дальше если есть ошибки!**

### 3. Git Commit (после успешных automated tests)
```bash
git add .
git commit -m "feat: [краткое описание изменений]

- Детали изменения 1
- Детали изменения 2

✅ Automated tests: passed
⏸ Waiting for: browser testing feedback"
```

**Правила commit messages:**
- `feat:` - новая фича
- `fix:` - исправление бага
- `refactor:` - рефакторинг кода
- `docs:` - обновление документации
- `test:` - добавление тестов

### 4. Browser Testing Request (Vladimir)
- Попросить Vladimir протестировать в браузере
- Предоставить чек-лист что тестировать
- **ЖДАТЬ feedback от Vladimir**

### 5. Feedback Loop
- ✅ **OK от Vladimir** → отметить задачу [X] в roadmap → следующая задача
- ❌ **Найдены баги** → исправить → повторить шаги 2-5

**ВАЖНО:**
- Задача считается выполненной ТОЛЬКО после OK от Vladimir
- Всегда делать git commit перед browser testing (чтобы можно было откатиться)
- Значительные изменения = отдельный commit (не накапливать много изменений)

---

## 📝 Implementation Notes

### Critical Rules (from CLAUDE.md):

1. ⚠️ **NEVER translate parameter names** (keep original English names)
2. ⚠️ **First column in .det/.pou is service column** (skip with slice(1))
3. ⚠️ **File access rules:**
   - ✅ READ: .prt/.det/.pou files (only read!)
   - ✅ WRITE: .metadata/*.json
   - ❌ NEVER modify .prt/.det/.pou files

### When facing difficulties:

1. **STOP** - don't guess or iterate randomly
2. **Study official documentation** (use WebFetch):
   - ECharts: https://echarts.apache.org/
   - Radix UI: https://www.radix-ui.com/
   - React: https://react.dev/
   - TailwindCSS: https://tailwindcss.com/docs
3. **Find best practices** from official sources
4. **Apply proven solution** from documentation

### "iPhone Quality" Standard:

- Minimalism (no clutter)
- Smooth animations (300ms transitions)
- Professional look (like MacBook apps)
- WCAG 2.1 AA accessibility

---

## ✅ Success Criteria

After implementation, these should work:

1. ✅ Dashboard shows all projects with auto metadata (from .prt)
2. ✅ Filters work (multi-select, combinations)
3. ✅ Search finds projects by displayName and client
4. ✅ Edit Info modal allows editing displayName + manual metadata
5. ✅ Display Name shown on cards (ID shown small, gray)
6. ✅ Client info optional (can be empty)
7. ✅ .prt files NOT TOUCHED (read-only)
8. ✅ "iPhone quality" UI (smooth, professional)
9. ✅ Color-coded badges (NA=green, ITB=orange, etc.)
10. ✅ Backward compatibility (old metadata files work)

---

## 📅 Progress Log

### 2025-11-05 (Day 1)

- [X] Created PROJECT-METADATA-DASHBOARD-ROADMAP.md
- [ ] Research phase started
- **Next:** Study ECharts and Radix UI badge components

---

**Total Estimated Time:** 2-3 weeks (20-30 hours)
**Current Progress:** 1/29 tasks completed (3%)
