# 🔧 Архитектурная спецификация: Система версионирования конфигураций .prt

**Проект:** Engine Results Viewer  
**Функция:** Автоматическое отслеживание истории конфигураций  
**Версия:** Draft 1.0  
**Дата:** 3 ноября 2025  
**Статус:** 🟡 Обсуждение концепции

---

## 📋 Краткое резюме

**Проблема:** Когда инженер делает несколько расчётов в EngMod4T, файл .prt (snapshot конфигурации проекта) перезаписывается при каждом новом расчёте. Это приводит к потере исторических данных конфигурации - инженер не может понять, что изменилось между расчётом №1 и расчётом №15.

**Решение:** Автоматически версионировать .prt файлы по calculation marker. Каждый calculation marker ($baseline, $v2, $15 и т.д.) получает свой snapshot .prt. Инженер может просмотреть конфигурацию для любого расчёта и сравнить конфигурации между расчётами.

**Эффект:** 
- ✅ Полный audit trail эволюции проекта
- ✅ Понимание причинно-следственных связей (изменил длину header → +5 HP)
- ✅ Возможность "откатиться" к успешным конфигурациям
- ✅ Автоматическая документация (замена ручных Excel таблиц)

---

## 🎯 Описание проблемы

### Текущий workflow (EngMod4T)

```
Шаг 1: Настройка двигателя
├── Bore: 82.5mm, Stroke: 75.6mm
├── Exhaust header: 650mm, diameter 39.4mm
├── Intake: ITB system
└── Combustion: timing 14.7° @ 2000 RPM

Шаг 2: Запуск расчёта → marker: $baseline
├── EngMod4T генерирует .prt файл (snapshot конфигурации)
└── EngMod4T записывает результаты в .det/.pou

Шаг 3: Изменение параметров
└── Exhaust header: 650mm → 700mm

Шаг 4: Запуск расчёта → marker: $v2_longer_header
├── EngMod4T ПЕРЕЗАПИСЫВАЕТ .prt файл (новая конфигурация)
└── EngMod4T ДОБАВЛЯЕТ в .det/.pou (новые результаты)

❌ Проблема: .prt перезаписан → потеряна конфигурация для $baseline
```

### Текущее ручное решение

Инженер ведёт Excel таблицу:

| Marker | Description |
|--------|-------------|
| $baseline | Initial: header 650mm, timing 14.7° @ 2000 RPM |
| $v2_longer_header | Changed: header 650mm → 700mm |
| $v15_final | Changed: header 700mm, timing 25.0° @ 6000 RPM |

**Проблемы ручного подхода:**
- ⏰ Занимает время
- ❌ Легко забыть записать
- 📝 Неполные описания
- 🔍 Сложно найти точные различия

---

## 💡 Предлагаемое решение

### Автоматическое версионирование конфигураций

**Основная концепция:** Автоматически сохранять версию .prt файла для каждого calculation marker

**Workflow в Engine Viewer:**

```
1. Пользователь делает расчёт в EngMod4T:
   $baseline → EngMod4T создаёт .prt
   
2. Engine Viewer парсит проект:
   - Обнаруживает marker $baseline в .det
   - Проверяет, существует ли .metadata/prt-versions/$baseline.prt
   - Если НЕТ → копирует текущий .prt → сохраняет как $baseline.prt
   - Если ДА → пропускает (уже сохранён)
   
3. Пользователь изменяет параметры (header 650→700mm):
   EngMod4T ПЕРЕЗАПИСЫВАЕТ .prt
   
4. Пользователь делает расчёт:
   $v2 → EngMod4T обновляет .prt
   
5. Engine Viewer парсит проект:
   - Обнаруживает НОВЫЙ marker $v2 в .det
   - Копирует текущий .prt → сохраняет как $v2.prt
   
6. Через месяц пользователь хочет понять разницу:
   - Engine Viewer: "Compare $baseline vs $v2"
   - Diff показывает: Exhaust header: 650mm → 700mm
```

---

## 📁 Архитектура хранения

### Структура директорий

```
C:/4Stroke/TM Soft ShortCut/
├── TM Soft ShortCut.det             # Результаты (все расчёты)
├── TM Soft ShortCut.pou             # Результаты (все расчёты)
├── TM Soft ShortCut.prt             # Текущая конфигурация (последняя)
├── TM Soft ShortCut.eng             # Engine file
├── TM Soft ShortCut.exp             # Exhaust port
├── TM Soft ShortCut.ipo             # Inlet port
├── ... (другие файлы компонентов)
└── .metadata/                       # Метаданные Engine Viewer
    ├── project.json                 # Метаданные проекта (уже есть)
    └── prt-versions/                # НОВОЕ: Версии конфигураций
        ├── $baseline.prt
        ├── $v2_longer_header.prt
        ├── $v15_final.prt
        └── index.json               # Метаданные версий
```

### Формат index.json

```json
{
  "$baseline": {
    "createdAt": "2025-10-21T10:30:00Z",
    "capturedFrom": "TM Soft ShortCut.prt",
    "fileSize": 12456,
    "checksum": "sha256:abc123..."
  },
  "$v2_longer_header": {
    "createdAt": "2025-10-22T14:15:00Z",
    "capturedFrom": "TM Soft ShortCut.prt",
    "fileSize": 12460,
    "checksum": "sha256:def456...",
    "changesFrom": "$baseline",
    "changesCount": 3
  }
}
```

**Почему .metadata/?**
- ✅ Уже используется для метаданных проектов
- ✅ Скрытая папка - не захламляет директорию проекта
- ✅ Всё в одном месте
- ✅ Простой backup/sync
- ✅ Согласуется с существующей архитектурой

---

## ⚙️ Backend логика

### Trigger: Когда сохранять версию?

**Стратегия:** Сохранять при первом обнаружении нового marker

**Алгоритм:**

```
function versionPrtFiles(projectPath) {
  // 1. Парсим .det/.pou, получаем все calculation markers
  const calculations = parseDetFile(projectPath).calculations;
  const markers = calculations.map(calc => calc.id); // ["$baseline", "$v2", ...]
  
  // 2. Читаем текущий .prt файл
  const currentPrt = readFile(`${projectPath}/project.prt`);
  
  // 3. Убеждаемся что .metadata/prt-versions/ существует
  const versionsDir = `${projectPath}/.metadata/prt-versions/`;
  ensureDirectoryExists(versionsDir);
  
  // 4. Загружаем или создаём index.json
  const index = loadIndex(versionsDir) || {};
  
  // 5. Для каждого marker проверяем, существует ли версия
  for (marker of markers) {
    const versionPath = `${versionsDir}/${marker}.prt`;
    
    if (!fileExists(versionPath)) {
      // Первый раз видим этот marker → сохраняем версию
      copyFile(currentPrt, versionPath);
      
      // Обновляем index
      index[marker] = {
        createdAt: new Date().toISOString(),
        capturedFrom: "project.prt",
        fileSize: getFileSize(currentPrt),
        checksum: calculateChecksum(currentPrt)
      };
      
      console.log(`✅ Сохранена версия конфигурации для ${marker}`);
    }
  }
  
  // 6. Сохраняем обновлённый index
  saveIndex(versionsDir, index);
}
```

**Когда выполнять:**
- При открытии проекта (фаза парсинга)
- При file system watch (если .det изменён)
- Кнопка "Обновить версии" вручную в UI

### API Endpoints

**Необходимые новые endpoints:**

```
GET /api/project/:id/prt-versions
→ Возвращает список всех сохранённых .prt версий

GET /api/project/:id/prt-versions/:marker
→ Возвращает конкретную версию .prt (распарсенную)

GET /api/project/:id/prt-versions/compare/:marker1/:marker2
→ Возвращает diff между двумя конфигурациями

POST /api/project/:id/prt-versions/:marker/save
→ Вручную сохранить текущий .prt как версию для marker
```

---

## 🎨 UI/UX дизайн

### 1. Новая вкладка: "Configuration History"

**Расположение:** ProjectPage, рядом с Charts и Data Table

```
┌─────────────────────────────────────────────────┐
│ [Charts] [Data Table] [Configuration History]  │ ← НОВАЯ ВКЛАДКА!
└─────────────────────────────────────────────────┘
```

**Содержимое:**

```
Configuration History для "TM Soft ShortCut"

┌──────────────────────────────────────────────────┐
│ 📋 $baseline                                     │
│ Начальная конфигурация                           │
│ Сохранена: 21 окт 2025, 10:30                   │
│                                                  │
│ [Просмотр конфигурации] [Сравнить с текущей]    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 📋 $v2_longer_header                             │
│ 3 параметра изменено от $baseline               │
│ Сохранена: 22 окт 2025, 14:15                   │
│                                                  │
│ [Просмотр конфигурации] [Сравнить с $baseline]  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 📋 $v15_final                                    │
│ 7 параметров изменено от $baseline              │
│ Сохранена: 25 окт 2025, 16:45                   │
│                                                  │
│ [Просмотр конфигурации] [Сравнить с любой...]   │
└──────────────────────────────────────────────────┘

[Ручные действия]
[🔄 Обновить версии] [💾 Сохранить текущую как...]
```

### 2. Configuration Viewer Modal

**Trigger:** Click "View Configuration"

**Content:** Beautifully parsed .prt file

```
┌─────────────────────────────────────────────────┐
│ Configuration: $baseline                        │
│                                           [✕]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ENGINE                                          │
│ • Type: 4-cylinder Inline, Naturally Aspirated │
│ • Bore × Stroke: 82.5 × 75.6 mm                │
│ • Displacement: 1616 cc                         │
│ • Compression Ratio: 11.3:1                     │
│ • Cylinder Head: Tumble Flow, 4 valves/cyl     │
│                                                 │
│ INTAKE SYSTEM                                   │
│ • Type: Individual Throttle Bodies (ITB)       │
│ • Throttles: 4 × Butterfly type                │
│ • Pipes: 8 total (4 cylinder + 4 throttle)     │
│                                                 │
│ EXHAUST SYSTEM                                  │
│ • Type: 4-into-1 collector                     │
│ • Header pipes: 4 × 650mm, Ø 39.4mm            │
│ • Collector: Ø 78.8mm → Ø 57mm                 │
│ • Exhaust box: 9000 cc                         │
│                                                 │
│ COMBUSTION                                      │
│ • Fuel: 100 Unleaded                           │
│ • Timing: 14.7° @ 2000 RPM → 29.4° @ 9000 RPM  │
│ • AFR: 12.57 @ 2000 RPM → 12.42 @ 9000 RPM     │
│                                                 │
│ [Export as PDF] [Copy to Clipboard]            │
└─────────────────────────────────────────────────┘
```

### 3. Configuration Diff Viewer

**Trigger:** Click "Compare with $baseline"

**Content:**

```
┌─────────────────────────────────────────────────┐
│ Comparing: $v2_longer_header vs $baseline      │
│                                           [✕]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ EXHAUST SYSTEM                                  │
│ ● Header length: 650mm → 700mm                  │
│ ○ Header diameter: 39.4mm (unchanged)          │
│ ○ Collector: 78.8mm → 57mm (unchanged)         │
│                                                 │
│ COMBUSTION                                      │
│ ● Timing @ 6000 RPM: 23.5° → 25.0°             │
│ ● AFR @ 6000 RPM: 12.50 → 12.45                │
│ ○ Timing @ 2000 RPM: 14.7° (unchanged)         │
│                                                 │
│ UNCHANGED SECTIONS                              │
│ ○ Engine (bore, stroke, CR, cylinders)         │
│ ○ Intake system (ITB configuration)            │
│ ○ Firing order                                 │
│                                                 │
│ Legend:                                         │
│ ● Changed  ○ Unchanged                          │
│                                                 │
│ [Export Diff Report] [Apply to Current]        │
└─────────────────────────────────────────────────┘
```

**Diff Algorithm Priorities:**

**Critical changes (always show):**
- ✅ Exhaust system (lengths, diameters, collector)
- ✅ Intake system (ITB vs IM, pipe dimensions)
- ✅ Combustion (timing, AFR by RPM)
- ✅ Engine basics (bore, stroke, CR)

**Secondary changes (show if changed):**
- ⚠️ Valve timing (cam centers)
- ⚠️ Flowbench data
- ⚠️ Port dimensions

**Ignore (don't show unless requested):**
- ○ Wall temperatures
- ○ Atmospheric conditions
- ○ Iteration cycles

---

## 🚀 Implementation Phases

### Phase 1: Backend Foundation (4-6 hours)
- [ ] Create .prt parser (similar to .det/.pou parsers)
- [ ] Implement versioning logic in fileScanner.js
- [ ] Create prt-versions/ directory structure
- [ ] Implement index.json management
- [ ] Add API endpoints for version retrieval
- [ ] Test with real .prt files

**Deliverable:** Backend can automatically version .prt files by marker

### Phase 2: Basic UI (3-4 hours)
- [ ] Add "Configuration History" tab to ProjectPage
- [ ] Display list of saved versions
- [ ] Show basic metadata (date, changes count)
- [ ] Link to calculation results (click → view charts)

**Deliverable:** User can see list of configuration versions

### Phase 3: Configuration Viewer (4-5 hours)
- [ ] Create Configuration Viewer modal
- [ ] Parse and display .prt beautifully
- [ ] Organize by sections (Engine, Intake, Exhaust, Combustion)
- [ ] Add export to PDF/text

**Deliverable:** User can view detailed configuration for any calculation

### Phase 4: Diff Viewer (5-7 hours)
- [ ] Implement .prt diff algorithm
- [ ] Create Diff Viewer modal
- [ ] Highlight changed/unchanged parameters
- [ ] Categorize changes by priority
- [ ] Add "Apply to current" feature (optional)

**Deliverable:** User can compare configurations and understand changes

### Phase 5: Advanced Features (optional)
- [ ] Manual "Save configuration" button
- [ ] Configuration search/filter
- [ ] Timeline visualization
- [ ] Export full configuration history report

**Total Estimate:** 16-22 hours (2-3 days)

---

## 🔍 Critical Questions for Discussion

### 1. Storage Location
**Current proposal:** `.metadata/prt-versions/`

**Alternatives:**
- Option A: `.metadata/prt-versions/` (✅ recommended)
- Option B: Separate database in Engine Viewer app folder
- Option C: In project root (visible to user)

**Question:** Is `.metadata/prt-versions/` acceptable?

---

### 2. Trigger Strategy
**Current proposal:** Save version on first detection of new marker

**Alternatives:**
- Option A: On first detection (✅ automatic)
- Option B: Manual "Save" button for each calculation
- Option C: On .prt file modification (file watcher)

**Question:** Is automatic on first detection correct?

**Edge case:** What if user runs $test, deletes it, then runs $test again with different config?
- Current: Version won't update (first $test already saved)
- Solution: Manual "Re-save" button in UI

---

### 3. UI Priority
**Options:**
1. **Full implementation** (History + Viewer + Diff) - 16-22 hours
2. **Minimal version** (History + basic Viewer) - 7-10 hours
3. **Backend first** (versioning only, no UI) - 4-6 hours

**Question:** What's the priority? Can we start with backend + minimal UI?

---

### 4. Diff Algorithm Scope
**Question:** Which changes are CRITICAL to highlight?

**Current proposal:**
- ✅ Always show: Exhaust (lengths, diameters), Intake (type, ITB/IM), Combustion (timing, AFR), Engine (bore, stroke, CR)
- ⚠️ Show if changed: Valve timing, flowbench, ports
- ○ Hide by default: Temperatures, atmospheric, iterations

**Is this correct?** Any other critical parameters?

---

### 5. Integration with Existing Features
**Question:** How should Configuration History integrate with charts?

**Ideas:**
- A: Click configuration → automatically load that calculation in charts
- B: Show "View results" button → opens calculation
- C: Side-by-side: configuration + results in split view

**Preference?**

---

### 6. Other File Types
**Current scope:** Only .prt versioning

**Question:** Should we version other files?
- `.eng` (engine configuration)
- `.exp` (exhaust port + cam)
- `.ipo` (inlet port + cam)
- `.cbd` (combustion data)

**Or is .prt sufficient** (since it contains summary of all)?

---

## 📊 Success Metrics

**Qualitative:**
- ✅ Engineer can understand what changed between any two calculations
- ✅ No more manual Excel tables needed
- ✅ Complete audit trail of project evolution
- ✅ Can "rollback" to successful configurations

**Quantitative:**
- ⏱️ Time saved: ~5-10 minutes per calculation (no manual logging)
- 📈 With 50 calculations/project → save ~4-8 hours of documentation time
- 🎯 100% accurate configuration tracking (vs ~70% with manual approach)

---

## 🎯 Next Steps

**For this discussion:**
1. Review architecture proposal
2. Answer critical questions (1-6 above)
3. Prioritize features (full vs minimal implementation)
4. Approve storage structure
5. Approve UI mockups

**After approval:**
1. Create technical roadmap for Claude Code
2. Create ADR (Architecture Decision Record)
3. Update documentation
4. Begin implementation

---

## 📝 Notes & Ideas

*(Space for collaborative notes during discussion)*

**Vladimir's feedback:**
- 

**Additional ideas:**
- 

**Concerns:**
- 

**Decisions made:**
- 

---

**Document Status:** 🟡 Draft - awaiting review and feedback  
**Next Review:** After Vladimir's feedback  
**Implementation Start:** After approval
