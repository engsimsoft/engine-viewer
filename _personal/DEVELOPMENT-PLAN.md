# Development Plan - Engine Results Viewer v2.1+

**Дата создания:** 7 ноября 2025
**Версия:** 1.0
**Статус:** В разработке

---

## Введение

Этот документ содержит архитектурные решения и roadmap развития Engine Results Viewer после релиза v2.0.0.

**Workflow:**
- Постепенное заполнение через обсуждение с пользователем
- Работаем поэтапно: закончили Q1 → зафиксировали → перешли к Q2
- После проработки всех вопросов → создание конкретных roadmap для фич

---

## Open Questions & Architectural Decisions

> Ответы на вопросы Q1-Q14 из [AUDIT-FINDINGS.md](AUDIT-FINDINGS.md) (Section: VII. Open Questions)

### Q1: Metadata Storage Location

**Вопрос из AUDIT:**
> Where should .metadata/ folder be located: inside engine-viewer/ or inside data folder (test-data/ or C:/4Stroke/)?

**Решение:** `.metadata/` внутри папки проекта (subfolder)

**Production Structure:**
```
C:/4Stroke/ProjectName/
├── ProjectName.det               # ✅ EngMod4T результаты (READ-ONLY)
├── ProjectName.pou               # ✅ EngMod4T результаты (READ-ONLY)
└── .metadata/                    # ✅ Engine Viewer данные (наша территория)
    ├── project-metadata.json     # UI metadata (tags, client, notes, status, color)
    ├── marker-tracking.json      # Timestamps когда markers были обнаружены
    └── prt-versions/             # Configuration snapshots (.prt для каждого marker)
        ├── $baseline.prt
        ├── $v2.prt
        └── $v15_final.prt
```

**Development Structure (без изменений):**
```
test-data/ProjectName/
├── ProjectName.det
├── ProjectName.pou
└── .metadata/                    # Остаётся как сейчас
    ├── project-metadata.json
    └── prt-versions/
```

---

#### Обоснование

1. **File Ownership Contract (EngMod4T Suite Architecture)**
   - `C:/4Stroke/` ROOT принадлежит EngMod4T Suite (Dat4T, EngMod4T, Post4T)
   - Service files в root: `Dat4TErrorLog.dat`, `EngMod4TLicenseCheck.dat`, etc.
   - `.prt` files в root (конфигурации проектов)
   - **SUBFOLDERS** `C:/4Stroke/ProjectName/` - результаты расчётов
   - ✅ Результаты (.det, .pou, .trace) можем менять (не сломает EngMod4T)
   - ✅ `.metadata/` в subfolder = наша территория (не нарушает contract)

2. **Locality (всё в одном месте)**
   - Simulation data (.det, .pou) и metadata рядом
   - Backup простой: копируешь папку проекта → всё сохранено
   - Переносишь папку → metadata не теряется

3. **Post4T Compatibility**
   - Post4T (старый визуализатор) должен работать
   - Post4T игнорирует папки начинающиеся с точки (`.metadata/`)
   - Не сломаем workflow инженеров

4. **Один компьютер = один инженер**
   - Каждый инженер работает на своём Windows компьютере
   - НЕТ shared network folders
   - НЕТ multi-user на одном компьютере
   - AppData/Local/ не нужен (нет преимуществ)

5. **Папки долгоживущие**
   - Инженеры НЕ удаляют папки проектов
   - ~50 проектов в год хранятся годами
   - Metadata не потеряется

6. **Separation of Concerns**
   - Simulation Data (EngMod4T) ≠ UI Metadata (Engine Viewer)
   - `.prt, .det, .pou` - simulation input/output
   - `.metadata/*.json` - UI preferences и configuration history

---

#### Почему НЕ AppData?

**Против `C:/Users/{Username}/AppData/Local/EngineViewer/.metadata/`:**

❌ Разделяет связанные данные:
- Simulation data в `C:/4Stroke/ProjectName/`
- Metadata в `C:/Users/.../AppData/...`
- Backup сложнее (два места)

❌ Нет преимуществ в этом use case:
- Один компьютер = один инженер → per-user изоляция не нужна
- Папки долгоживущие → persistence гарантирована
- Не нужна защита от переустановки приложения

❌ Усложняет workflow:
- Инженер копирует папку проекта → metadata не копируется
- Два места для backup/restore

---

#### Формат metadata файлов

**project-metadata.json:**
```json
{
  "version": "1.0",
  "id": "project-name",
  "displayName": "Custom Project Name",
  "manual": {
    "description": "Optimization run for client X",
    "client": "Client X",
    "tags": ["optimization", "turbo"],
    "status": "active",
    "notes": "Testing new exhaust header configuration",
    "color": "#3b82f6"
  },
  "created": "2025-10-21T10:30:00Z",
  "modified": "2025-10-25T16:45:00Z"
}
```

**marker-tracking.json:**
```json
{
  "$baseline": {
    "firstSeen": "2025-10-21T10:30:00Z",
    "prtSaved": true,
    "prtPath": ".metadata/prt-versions/$baseline.prt"
  },
  "$v2": {
    "firstSeen": "2025-10-22T14:15:00Z",
    "prtSaved": false,
    "warning": "Configuration not saved (opened Engine Viewer after multiple calculations)"
  },
  "$v15_final": {
    "firstSeen": "2025-10-25T16:45:00Z",
    "prtSaved": true,
    "prtPath": ".metadata/prt-versions/$v15_final.prt"
  }
}
```

**prt-versions/ snapshots:**
- Filename: `{markerId}.prt` (например `$baseline.prt`, `$v2.prt`)
- Content: Copy of `C:/4Stroke/ProjectName.prt` на момент обнаружения marker
- Формат: Оригинальный .prt format (EngMod4T)

---

#### Implementation Notes

1. **Backend Path Resolution:**
   ```javascript
   // backend/src/services/metadataService.js
   function getMetadataPath(projectName) {
     const projectDir = path.join(DATA_DIR, projectName); // C:/4Stroke/ProjectName/
     return path.join(projectDir, '.metadata');           // C:/4Stroke/ProjectName/.metadata/
   }
   ```

2. **Auto-create .metadata/ folder:**
   - При первом открытии проекта создаём `.metadata/` если не существует
   - Создаём подпапки: `prt-versions/`

3. **Compatibility с существующими проектами:**
   - Dev environment: `.metadata/` в `engine-viewer/.metadata/` (как сейчас)
   - Production: `.metadata/` в `C:/4Stroke/ProjectName/.metadata/`
   - Миграция НЕ требуется (dev ≠ production)

---

**Статус:** ✅ Решено (7 ноября 2025)

---

### Q2: Определение последнего marker

**Вопрос из AUDIT:**
> Как определить "последний" marker когда инженер делает несколько расчётов подряд без открытия Engine Viewer?

**Проблема:**

**Сценарий:**
```
День 1, 10:00 → $baseline расчёт в EngMod4T
День 1, 11:00 → изменил exhaust header 650mm → 700mm
День 1, 12:00 → $v2 расчёт (ProjectName.prt перезаписан!)
День 1, 14:00 → $v3 расчёт
День 2, 09:00 → $v4 расчёт
День 2, 10:00 → $v5 расчёт (ProjectName.prt = config #5)
День 2, 11:00 → ПЕРВЫЙ РАЗ открыл Engine Viewer
```

**Что видит Engine Viewer:**
- `.pou` файл содержит 5 markers: `[$baseline, $v2, $v3, $v4, $v5]`
- `.prt` файл содержит ТОЛЬКО конфигурацию #5 (последний)
- Конфигурации #1, #2, #3, #4 потеряны навсегда ❌

**Вопрос:** Для какого marker сохранить текущий .prt? Только для $v5 или для всех?

---

**Решение:** Порядок markers в файле = хронологический порядок создания

#### Как работает EngMod4T

- EngMod4T добавляет markers в конец .pou/.det файла (**append mode**)
- Порядок в файле = порядок создания
- **Последний marker в файле = последний по времени создания**
- File modification time (.pou file) = время добавления последнего marker

#### Implementation Logic

```javascript
// Parse .pou file (markers уже в хронологическом порядке)
const calculations = parseFile('ProjectName.pou');
// Result: [$baseline, $v2, $v3, $v4, $v5]

// Последний marker = последний в массиве
const lastMarker = calculations[calculations.length - 1]; // $v5 ✅

// Variant B: Сохранить .prt ТОЛЬКО для последнего marker
if (!exists(`.metadata/prt-versions/${lastMarker.id}.prt`)) {
  copy('ProjectName.prt', `.metadata/prt-versions/${lastMarker.id}.prt`);

  // Record timestamp когда сохранили
  updateMarkerTracking(lastMarker.id, {
    firstSeen: new Date().toISOString(),
    prtSaved: true,
    prtPath: `.metadata/prt-versions/${lastMarker.id}.prt`
  });
}

// Для остальных markers - показать warning если не сохранены
for (const marker of calculations.slice(0, -1)) {
  if (!exists(`.metadata/prt-versions/${marker.id}.prt`)) {
    console.warn(`⚠️ Configuration not saved for ${marker.id}`);

    updateMarkerTracking(marker.id, {
      firstSeen: new Date().toISOString(),
      prtSaved: false,
      warning: 'Configuration not saved (opened Engine Viewer after multiple calculations)'
    });
  }
}
```

---

#### Почему Variant B (только последний + warning)?

**Variant A: Сохранить текущий .prt для ВСЕХ markers (неточно!)**
```
$baseline.prt = config #5  ❌ НЕПРАВИЛЬНАЯ конфигурация!
$v2.prt = config #5        ❌ НЕПРАВИЛЬНАЯ конфигурация!
$v3.prt = config #5        ❌ НЕПРАВИЛЬНАЯ конфигурация!
$v4.prt = config #5        ❌ НЕПРАВИЛЬНАЯ конфигурация!
$v5.prt = config #5        ✅ Правильная конфигурация
```

**Проблема:** Инженер увидит неправильную конфигурацию для $baseline!

**Variant B: Сохранить только для последнего + warning (честно!)**
```
$baseline.prt = не существует  ⚠️ Configuration not saved
$v2.prt = не существует        ⚠️ Configuration not saved
$v3.prt = не существует        ⚠️ Configuration not saved
$v4.prt = не существует        ⚠️ Configuration not saved
$v5.prt = config #5            ✅ Правильная конфигурация
```

**Преимущества:**
- ✅ Точность данных (не показываем неправильную конфигурацию)
- ✅ Честность (warning показывает "данные потеряны")
- ✅ Manual save доступен (инженер может сохранить вручную если нужно)

**Выбираем Variant B** - точность важнее чем неточные данные.

---

#### UI/UX для Configuration History

**Configuration History Tab:**

```
┌──────────────────────────────────────────────────────────┐
│ Configuration History для "ProjectName"                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ⚠️ $baseline                                             │
│ Configuration not saved                                  │
│ Обнаружен: 7 ноя 2025, 11:00                            │
│                                                          │
│ [💾 Сохранить текущую как $baseline]                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ⚠️ $v2                                                   │
│ Configuration not saved                                  │
│ Обнаружен: 7 ноя 2025, 11:00                            │
│                                                          │
│ [💾 Сохранить текущую как $v2]                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ $v5_final                                             │
│ Конфигурация сохранена                                   │
│ Сохранена: 7 ноя 2025, 11:00                            │
│                                                          │
│ [Просмотр конфигурации] [Сравнить с текущей]           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Manual Save Button:**
- Инженер может вручную сохранить текущий .prt для любого marker
- Warning: "Текущая конфигурация может отличаться от оригинальной"
- Use case: Инженер помнит что изменил и хочет зафиксировать

---

**Статус:** ✅ Решено (7 ноября 2025)

---

### Q4: Типы файлов EngMod4T (.dat, .des, .spo)

**Вопрос из AUDIT:**
> What are .dat, .des, .spo files? Do we need them?

**Решение:** Различаем Single Run и Batch Run результаты

**Источник информации:** [docs/engmod4t-suite/folder-structure.md](docs/engmod4t-suite/folder-structure.md)

---

#### Типы файлов EngMod4T

**Single Run Results (1 RPM точка):**
```
ProjectName.dat  - EngMod4T внутренние логи (текстовые)
ProjectName.spo  - Single Point Output (performance параметры)
ProjectName.des  - Detonation data для single run
```

**Batch Run Results (много RPM точек):**
```
ProjectName.det  - Базовые результаты (24 параметра)
ProjectName.pou  - Расширенные результаты (71 параметр)
```

---

#### Характеристики файлов

| Файл | Назначение | Нужен Engine Viewer? | Когда реализовать |
|------|-----------|---------------------|-------------------|
| `.dat` | Внутренние логи EngMod4T | ❌ НЕТ (debugging only) | Никогда |
| `.spo` | Single run performance (1 RPM) | ✅ ДА (обязательно!) | **Phase 2** |
| `.des` | Single run detonation | ⏳ Опционально | Phase 2 |
| `.det` | Batch run базовые (24 params) | ✅ ДА | ✅ Phase 1 (готово) |
| `.pou` | Batch run расширенные (71 params) | ✅ ДА | ✅ Phase 1 (готово) |

---

#### Single Run vs Batch Run

**Single Run (быстрый тест):**
- **Входные данные:** 1 RPM точка
- **Время:** 2-5 минут
- **Результаты:** `.spo`, `.des` файлы
- **Use case:** Быстрая проверка конкретного режима работы

**Batch Run (полный анализ):**
- **Входные данные:** Диапазон RPM (например 1000-6000 с шагом 500)
- **Время:** 10-60 минут (зависит от количества точек)
- **Результаты:** `.det`, `.pou` файлы
- **Use case:** Полная характеристика двигателя

**Пример workflow инженера:**
```
1. Single run на 3000 RPM (.spo) → быстрая проверка
2. Если результат хороший → Batch run 1000-6000 RPM (.pou/.det)
3. Анализ полной характеристики в Engine Viewer
```

---

#### Формат .spo файла

**Структура (из [post4t-overview.md](docs/engmod4t-suite/post4t-overview.md)):**

```
.spo - Single Point Output
- 1 строка данных (не массив как .det/.pou)
- Те же параметры что в .pou (71 параметр)
- Fixed-width ASCII формат (как .det/.pou)
- Парсинг: split(/\s+/)
```

**Отличие от .pou:**
- `.spo` = 1 RPM точка → 1 строка данных
- `.pou` = N RPM точек → N строк данных (с маркерами $1, $2...)

---

#### Use Cases для Single Run

**Когда инженеры используют Single Run:**

1. **Быстрая проверка изменений**
   - Изменили exhaust header 650mm → 700mm
   - Single run на 3000 RPM → проверка эффекта
   - Если хорошо → делают Batch run

2. **Тестирование экстремальных режимов**
   - Проверка детонации на максимальных оборотах
   - Single run на 6500 RPM с .des файлом

3. **Iterative optimization**
   - Подбор угла зажигания для конкретного RPM
   - Multiple single runs быстрее чем batch runs

---

#### Implementation Plan

**Phase 1 (текущая) - ✅ Реализовано:**
- `.det` файлы (batch run, 24 параметра)
- `.pou` файлы (batch run, 71 параметр)

**Phase 2 (следующая) - ⏳ Обязательно:**
- `.spo` файлы (single run, 71 параметр) **← MANDATORY!**
- `.des` файлы (single run detonation) **← Опционально**

**Парсер для .spo:**
```javascript
// backend/src/parsers/formats/spoParser.js
// Формат идентичен .pou но БЕЗ маркеров ($1, $2...)
// 1 строка метаданных + 1 строка заголовков + 1 строка данных

function parseSPO(filePath) {
  // Line 1: Metadata (cylinders, engineType, breath, numTurbo, numWasteGate)
  // Line 2: Headers (71 parameters - same as .pou)
  // Line 3: Single data row (NO marker, just values)

  return {
    metadata: { cylinders, engineType, breath, numTurbo, numWasteGate },
    rpm: singleRPM,
    data: { /* 71 parameters */ }
  };
}
```

---

#### UI для Single Run

**Отображение в Project List:**
```
ProjectName/
├── 📊 Batch Runs (3)
│   ├── $baseline (25 RPM points)
│   ├── $v2 (30 RPM points)
│   └── $final (28 RPM points)
│
└── ⚡ Single Runs (5)
    ├── Single_3000rpm.spo
    ├── Single_4500rpm.spo
    └── Test_max_rpm.spo
```

**График для Single Run:**
- Отображаем как одну точку на графике
- Или сравниваем single run с batch run кривой
- Полезно для валидации batch результатов

---

**Статус:** ✅ Решено (7 ноября 2025)

---

### Q5: Per-RPM Auxiliary Files (Trace Files)

**Вопрос из AUDIT:**
> What are per-RPM auxiliary files (.cbt, .cyl, .dme, etc.)? ~20 file types per RPM point. Can they be excluded from distribution?

**Решение:** Trace files - это **Phase 2 (обязательно!)**

---

#### Что это такое?

**Trace Files = Детальные данные vs Crank Angle (0-720°)**

EngMod4T создаёт **~18 типов trace файлов** для каждого RPM point в batch run:
- Каждый файл содержит данные для **ОДНОГО RPM** vs crank angle (каждый градус!)
- Naming: `ProjectName_6000.cbt` (6000 RPM combustion trace)
- Формат: Fixed-width ASCII (как .det/.pou)
- Данные: 150+ параметров per crank angle degree

**Пример:**
```
Batch run: 1000-6000 RPM (шаг 500) = 11 RPM points
Trace types: 18 файлов
Total trace files: 11 × 18 = 198 файлов для одного проекта!
```

---

#### Статистика test-data/

**Анализ реального размера:**
```
Total files:       39,498
Trace files:       36,872 (93% всех файлов!)
Total size:        7.8 GB
Essential files:   14 MB (.det, .pou, .prt)
Trace files size:  ~7.786 GB (99.8% дискового пространства!)
```

**Вывод:** Trace файлы занимают почти всё место, но они ОБЯЗАТЕЛЬНЫ для Phase 2!

---

#### Типы Trace Files (18 форматов)

**Основные категории:**

**1. Combustion & Thermodynamics:**
- `.cbt` - Combustion traces (mass fraction burned, heat release rate)
- `.tpt` - Temperature traces (cylinder, gas temperature vs crank angle)
- `.eff` - Efficiency traces (scavenging, trapping efficiency)

**2. Gasdynamics:**
- `.ppt` (или `.pde`) - Pressure traces (cylinder, intake, exhaust pressure)
- `.mat` (или `.mch`) - Mach traces (Mach number in intake/exhaust)
- `.wve` - Wave traces (pressure wave propagation)
- `.mst` - Mass flow traces (mass flow rate at trace positions)

**3. Advanced Analysis:**
- `.tut` (или `.tub`) - Turbo traces (boost pressure, turbo RPM)
- `.put` (или `.pur`) - Purity traces (fresh charge purity)
- `.epa` - Exhaust port area vs crank angle (Excel format)
- `.ipa` - Inlet port area vs crank angle (Excel format)

**4. Unknown (требуется детальное описание):**
- `.cyl`, `.dme`, `.lds`, `.nse`, `.out`, `.pvd`, `.wmf`

**Полное описание:** [docs/file-formats/trace-files.md](../docs/file-formats/trace-files.md) ← будет создан

---

#### Use Cases для Trace Files

**Когда инженеры используют traces:**

1. **Gasdynamic Analysis**
   - Анализ волн давления в intake/exhaust system
   - Оптимизация длины труб для резонанса
   - Mach number analysis (flow velocity)

2. **Combustion Optimization**
   - Heat release rate (RoHR) vs crank angle
   - Flame propagation (RFlame, AFlame, VFlame)
   - Ignition timing optimization

3. **Turbocharger Tuning**
   - Boost pressure dynamics vs crank angle
   - Turbine inlet temperature monitoring
   - Compressor efficiency analysis

4. **Deep Debugging**
   - Понять почему детонация происходит на определённом градусе
   - Найти причину низкой эффективности
   - Проверить scavenging process (2-stroke engines)

---

#### Можно ли удалить trace файлы?

**Development (test-data/):**
- ✅ **Можно уменьшить:** Оставить 1-2 примера trace файлов для development
- ✅ **Уменьшит repo:** С 7.8GB до ~50MB
- ✅ **Документация сохранится:** Полное описание в trace-files.md

**Production (C:/4Stroke/):**
- ❌ **НЕ удалять!** Инженер сам решает:
  - Если нужны trace graphs → хранить
  - Если работает только с .pou/.det → можно удалить
  - Engine Viewer будет поддерживать traces в **Phase 2**

**Рекомендация для repo:**
- Добавить trace файлы в `.gitignore` (кроме 1-2 примеров)
- Создать script для скачивания полного test-data набора (optional)

---

#### Implementation Plan - Phase 2

**Priority:** MANDATORY (после .spo реализации)

**Parsers:**
```javascript
// backend/src/parsers/formats/traceParser.js
// Универсальный парсер для всех trace types
// Registry pattern (как для .det/.pou)

function parseTraceFile(filePath, traceType) {
  // Line 1-15: Metadata (RPM, NumCyl, trace positions, pipe configuration)
  // Line 16+: Headers (150+ parameters)
  // Line 17+: Data vs crank angle (0-720°, каждый градус)

  return {
    rpm: extractedRPM,
    traceType: traceType,
    metadata: { /* pipe config, trace positions */ },
    data: [ /* array of 720 data points (0-720 degrees) */ ]
  };
}
```

**UI Components:**
- Trace viewer (crank angle X-axis, parameter Y-axis)
- Comparison mode (multiple RPM points overlay)
- Zoom/pan functionality (ECharts dataZoom)
- Export to Excel/CSV

**Phases:**
- **Phase 2.1:** .spo files (single run performance) ← first
- **Phase 2.2:** Basic traces (.ppt, .tpt, .cbt) ← core functionality
- **Phase 2.3:** Advanced traces (.mch, .wve, .tub, .pur) ← advanced features
- **Phase 2.4:** Port area files (.epa, .ipa) ← optional

---

**Детальная документация:** [docs/file-formats/trace-files.md](../docs/file-formats/trace-files.md)

**Статус:** ✅ Решено (7 ноября 2025) - создать trace-files.md документ

---

### Q6: .prt Files Location (Root vs Subfolder)

**Вопрос из AUDIT:**
> Why are .prt files at root AND inside project folders? Are folder .prt files backups? Legacy? Different data?

**Решение:** Вопрос основан на **ошибочной предпосылке** - дублирования НЕТ!

**Источник информации:** [docs/engmod4t-suite/folder-structure.md](docs/engmod4t-suite/folder-structure.md)

---

#### Фактическая структура

**Проверено в test-data/:**

```bash
test-data/
├── BMW M42.prt              ✅ .prt в КОРНЕ (конфигурация)
└── BMW M42/                 ✅ Папка с результатами
    ├── BMW M42.det          (результаты расчётов)
    ├── BMW M42.pou          (результаты расчётов)
    └── (НЕТ .prt файла!)    ❌ Дублирования нет
```

**Production структура (C:/4Stroke/):**

```
C:/4Stroke/
│
├── ProjectName.prt          # ✅ INPUT - конфигурация (в ROOT)
├── ProjectName.pjt          # Project file (список subsystems)
├── ProjectName.eng          # Engine subsystem
├── ProjectName.exp          # Exhaust subsystem
├── ProjectName.ipo          # Inlet subsystem
├── ... (другие subsystems)
│
└── ProjectName/             # ✅ OUTPUT - результаты (в SUBFOLDER)
    ├── ProjectName.det      # Batch run detonation
    ├── ProjectName.pou      # Batch run performance
    ├── ProjectName.spo      # Single run performance
    └── ProjectName_6000.*   # Trace files для 6000 RPM
```

---

#### File Ownership Contract

**ROOT уровень** (`C:/4Stroke/` или `test-data/`):
- ✅ `.prt` файл - **INPUT** (Project Print - summary всех subsystems)
- ✅ Все subsystem файлы (`.eng`, `.exp`, `.ipo`, `.exl`, `.cbd`, etc.)
- ✅ Service files (`Dat4TErrorLog.dat`, `OldProjectFile.fle`)

**SUBFOLDER уровень** (`C:/4Stroke/ProjectName/`):
- ✅ `.det` файл - **OUTPUT** (batch run detonation results)
- ✅ `.pou` файл - **OUTPUT** (batch run performance results)
- ✅ `.spo` файл - **OUTPUT** (single run performance)
- ✅ Trace files (`ProjectName_6000.cbt`, `.mch`, `.tpt`, etc.)
- ❌ **НЕТ .prt файла** в subfolder!

---

#### Что такое .prt файл?

**`.prt` = Project Print (конфигурация)**

**Создание:**
- Создаётся **Dat4T** при сохранении проекта
- Содержит **summary ВСЕХ subsystems** в читаемом формате

**Назначение:**
1. **Quick reference** - человек читает конфигурацию
2. **Metadata extraction** - Engine Viewer парсит для auto metadata
3. **Documentation** - snapshot конфигурации на момент расчёта

**Формат:**
- ASCII text (Windows-1251 кодировка)
- Человеко-читаемый формат
- Содержит:
  - Engine geometry (bore, stroke, displacement)
  - Intake system configuration
  - Exhaust system configuration
  - Valve timing, combustion model
  - Все параметры из subsystem файлов

---

#### Почему .prt в ROOT, а не в subfolder?

**Логика EngMod4T Suite:**

1. **Input/Output Separation**
   - ROOT = INPUT files (configuration, subsystems)
   - SUBFOLDER = OUTPUT files (results только)
   - .prt описывает конфигурацию → INPUT → ROOT

2. **Single Source of Truth**
   - Один .prt файл для проекта
   - Если скопировать в subfolder → риск устаревания
   - Изменили конфигурацию → забыли обновить копию → confusion

3. **Reusability**
   - Одна конфигурация → много расчётов
   - Разные subfolder для разных batch runs
   - Все используют один .prt из ROOT

**Пример workflow:**
```
Day 1:
- Создали ProjectName.prt в ROOT (Dat4T)
- Запустили batch run → создалась папка ProjectName/
- Результаты: ProjectName/ProjectName.det, ProjectName.pou

Day 2:
- Изменили угол зажигания в Dat4T
- Сохранили → обновился ProjectName.prt в ROOT
- Запустили новый batch run → результаты добавились (append mode)
- ProjectName.prt всегда актуальный (в ROOT)
```

---

#### Engine Viewer Implementation

**fileScanner.js (корректная логика):**

```javascript
// Сканируем ROOT для .prt файлов
const prtFiles = await scanDirectory(DATA_DIR, '.prt'); // C:/4Stroke/*.prt

for (const prtFile of prtFiles) {
  const projectName = path.basename(prtFile, '.prt');

  // 1. Парсим .prt из ROOT ✅
  const metadata = parsePRT(prtFile); // C:/4Stroke/ProjectName.prt

  // 2. Ищем результаты в SUBFOLDER ✅
  const resultsFolder = path.join(DATA_DIR, projectName); // C:/4Stroke/ProjectName/
  const detFile = path.join(resultsFolder, `${projectName}.det`);
  const pouFile = path.join(resultsFolder, `${projectName}.pou`);

  // 3. НЕ ищем .prt в subfolder (его там нет) ✅
}
```

---

#### Почему возник вопрос?

**Причина:** Ошибка в старой версии документации

До audit fix (ноябрь 2025):
- Старая документация показывала .prt внутри subfolder
- Audit findings унаследовали эту ошибку
- Возник вопрос Q6: "Why .prt in both places?"

После audit fix:
- [docs/engmod4t-suite/folder-structure.md](docs/engmod4t-suite/folder-structure.md) исправлен
- Структура правильно документирована
- .prt ТОЛЬКО в ROOT, subfolder содержит ТОЛЬКО результаты

---

#### Исключение: Configuration History (Engine Viewer)

**Единственное место где .prt дублируется:**

`.metadata/prt-versions/` (Engine Viewer feature, см. Q2):
- Копии .prt файла для разных calculation markers
- Snapshot конфигурации на момент создания marker
- Naming: `.metadata/prt-versions/$baseline.prt`, `$v2.prt`, etc.

**Назначение:**
- Позволяет увидеть какая была конфигурация для $baseline
- Если инженер сделал 5 расчётов подряд, текущий .prt = config #5
- Копии в .metadata/prt-versions/ сохраняют историю

**Это НЕ дублирование, это версионирование!**

---

**Статус:** ✅ Решено (7 ноября 2025) - вопрос основан на старой ошибке в документации, которая исправлена

---

### Q3: Data Path Configuration (Production vs Development)

**Вопрос из AUDIT:**
> How to configure data path for production without code changes?

**Проблема:**

На рабочем компьютере (Windows) все файлы EngMod4T находятся в `C:/4Stroke/`, но в программе hardcoded путь `test-data/` (для development на Mac).

**Как сказать программе "ищи файлы в `C:/4Stroke/`" без редактирования кода?**

---

**Решение:** First-time setup wizard с auto-detection (Вариант 3+)

#### User Experience

**Сценарий 1: C:/4Stroke/ существует (99% случаев)**

При первом запуске Engine Viewer:

```
┌─────────────────────────────────────────────┐
│ Engine Viewer - First Time Setup           │
├─────────────────────────────────────────────┤
│                                             │
│ EngMod4T data folder detected:              │
│                                             │
│ ✅ C:/4Stroke/                              │
│                                             │
│ Use this folder?                            │
│                                             │
│ [Yes, use C:/4Stroke] [Choose different...] │
│                                             │
└─────────────────────────────────────────────┘
```

**Действия пользователя:**
- В 99% случаев → один клик **"Yes"** → готово ✅
- Если данные в другом месте → **"Choose different..."** → браузер файлов

---

**Сценарий 2: C:/4Stroke/ НЕ найден (редкий случай)**

```
┌─────────────────────────────────────────────┐
│ Engine Viewer - First Time Setup           │
├─────────────────────────────────────────────┤
│                                             │
│ Please select EngMod4T data folder:         │
│                                             │
│ [Browse...] ________________                │
│                                             │
│ [Continue]                                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Действия пользователя:**
- Клик **"Browse..."** → выбрать папку (например `D:/MyEngineData/`)
- Клик **"Continue"** → настройка сохранена ✅

---

#### Implementation Logic

**Priority chain (автоматический выбор пути):**

1. **Saved configuration** (если уже настроено) → используем сохранённый путь
2. **Auto-detection Windows** → если существует `C:/4Stroke/` → предлагаем его
3. **Auto-detection macOS** → если существует `./test-data/` → используем для development
4. **Manual selection** → если ничего не найдено → показываем setup wizard

**Backend implementation:**

```javascript
// backend/src/config/config.js

function getDataPath() {
  // 1. Check saved configuration (highest priority)
  const savedPath = loadSavedConfig('dataPath');
  if (savedPath && fs.existsSync(savedPath)) {
    return savedPath;
  }

  // 2. Auto-detect Windows production path
  if (process.platform === 'win32') {
    const windowsPath = 'C:/4Stroke';
    if (fs.existsSync(windowsPath)) {
      return windowsPath; // Показываем setup wizard с предложением
    }
  }

  // 3. Auto-detect development path (macOS/Linux)
  const devPath = './test-data';
  if (fs.existsSync(devPath)) {
    return devPath;
  }

  // 4. No path found → trigger setup wizard
  return null; // Frontend показывает setup wizard
}

function saveDataPath(path) {
  // Save to config file or AppData
  const configFile = path.join(getConfigDir(), 'settings.json');
  fs.writeFileSync(configFile, JSON.stringify({ dataPath: path }));
}
```

---

#### Где сохранять настройку?

**Windows:**
```
C:/Users/{Username}/AppData/Local/EngineViewer/settings.json
```

**macOS:**
```
~/Library/Application Support/EngineViewer/settings.json
```

**Формат settings.json:**
```json
{
  "version": "1.0",
  "dataPath": "C:/4Stroke",
  "setupCompleted": true,
  "setupDate": "2025-11-07T14:30:00Z"
}
```

---

#### UI/UX детали

**После завершения setup:**
- Настройка сохранена → setup wizard больше НЕ показывается
- Если путь стал недоступен (папка удалена/переименована):
  - Показываем ошибку: "Data folder not found: C:/4Stroke/"
  - Предлагаем: [Browse for new location] [Use default]

**Settings menu (опционально, будущая фича):**
- Добавить в Settings: "Data folder location: C:/4Stroke/ [Change...]"
- Позволяет пользователю изменить путь если нужно

---

#### Alternative Options (отклонены)

**Вариант 1: Auto-detect only (без setup wizard)**
- ❌ Не работает если данные не в `C:/4Stroke/`
- ❌ Пользователь не понимает откуда программа берёт данные

**Вариант 2: Edit config.yaml manually**
- ❌ При обновлении программы → config.yaml может перезаписаться
- ❌ Сложно для не-программистов

**Вариант 4: Environment variable**
- ❌ Windows пользователи не привыкли к environment variables
- ❌ Нужно объяснять как настроить

---

#### Development vs Production

**Development (macOS):**
- Auto-detection: `./test-data/` → работает из коробки
- Setup wizard НЕ показывается (если test-data/ существует)

**Production (Windows):**
- Auto-detection: `C:/4Stroke/` → показываем setup wizard с предложением
- Один клик "Yes" → готово
- Настройка сохраняется в AppData

---

#### Преимущества решения

✅ **User-friendly:**
- В 99% случаев → один клик "Yes"
- Не нужно редактировать файлы
- Понятно что происходит

✅ **Flexibility:**
- Можно выбрать любую папку если нужно
- Можно изменить в Settings (будущая фича)

✅ **Development convenience:**
- Dev environment работает автоматически (test-data/)
- Production environment работает автоматически (C:/4Stroke/)

✅ **Persistence:**
- Настройка сохраняется
- Не теряется при обновлении программы

---

**Статус:** ✅ Решено (7 ноября 2025) - Вариант 3+ (First-time setup wizard с auto-detection)

---

### Q7: Metadata Conflicts (несколько пользователей одновременно)

**Вопрос из AUDIT:**
> How to handle metadata conflicts when multiple engineers edit same project simultaneously?

**Решение:** Вариант C - Last-write-wins (текущее поведение, ничего не делать)

---

#### Контекст использования

**Реальный use case:**
- 👤 **Один пользователь** на одном компьютере
- 🏠 **Персональная программа** (не shared environment)
- 💻 **Один компьютер = один инженер**
- 🚫 **НЕТ multi-user scenarios**
- 🚫 **НЕТ network sharing**

**Вывод:** Конфликты метаданных **физически невозможны** в этом use case.

---

#### Гипотетическая проблема (не применима)

**Сценарий (НЕ РЕАЛЕН для нашего use case):**
```
Понедельник 10:00
Инженер А открывает проект "BMW M42"
Добавляет заметку: "Тестирование турбо настройки"
Сохраняет → запись в .metadata/bmw-m42.json

Понедельник 10:05
Инженер Б открывает тот же проект "BMW M42"
Добавляет заметку: "Базовая конфигурация"
Сохраняет → перезаписывает .metadata/bmw-m42.json

Результат: Заметка инженера А потеряна! 😱
```

**Почему это не проблема:**
- В нашем use case инженер Б **не существует**
- Это персональная программа для одного человека
- Конфликты невозможны

---

#### Альтернативы (отклонены как избыточные)

**A) File Locking (блокировка файла)**
```javascript
// Блокировать .metadata/project.json при редактировании
lockFile('.metadata/bmw-m42.json');
// Показывать "⚠️ Проект заблокирован" другим пользователям
```

❌ **Отклонено:**
- Нет других пользователей → блокировать некого
- Усложняет код без преимуществ
- Может привести к "orphan locks" (файл остался заблокированным после crash)

**B) Optimistic Locking (версионирование)**
```json
{
  "version": 5,
  "manual": {
    "description": "..."
  }
}
```

❌ **Отклонено:**
- Требует conflict resolution UI
- Усложняет сохранение (нужно проверять версию)
- Нет benefit для single-user scenario

**C) Last-write-wins (текущее поведение)** ✅

✅ **Выбрано:**
- Простота реализации (уже работает)
- Нет overhead на проверки/блокировки
- Подходит для персональной программы
- Если в будущем появится multi-user → можно добавить Variant A/B

---

#### Current Implementation

**metadataService.js (текущая логика):**
```javascript
async function saveMetadata(projectId, metadata) {
  const metadataPath = path.join(
    DATA_DIR,
    projectId,
    '.metadata',
    'project-metadata.json'
  );

  // Simply overwrite the file (last-write-wins)
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // No locking, no version checking
  return { success: true };
}
```

**Поведение:**
- Кто последний сохранил → та версия и осталась
- НЕ проверяем изменения других пользователей
- НЕ показываем warnings о конфликтах

**Это правильно для single-user программы!**

---

#### Почему это решение правильное

✅ **Простота:**
- Минимальный код (уже работает)
- Нет сложной логики блокировок/версий
- Легко тестировать и поддерживать

✅ **Соответствует use case:**
- Один пользователь = нет конфликтов
- Персональная программа = не нужна multi-user защита

✅ **YAGNI (You Aren't Gonna Need It):**
- Не добавляем функциональность "на будущее"
- Если потребуется multi-user → добавим тогда
- Сейчас это преждевременная оптимизация

✅ **Performance:**
- Нет overhead на проверки файлов/версий
- Быстрое сохранение (прямая запись)

---

#### Если в будущем потребуется multi-user

**Признаки что нужно переделать:**
- Программа используется на network share
- Несколько инженеров работают одновременно
- Пользователи жалуются на потерю заметок

**Тогда можно добавить:**
1. **File modification time check:**
   ```javascript
   const currentMtime = fs.statSync(metadataPath).mtime;
   if (currentMtime > lastKnownMtime) {
     showConflictWarning("File was modified by another user");
   }
   ```

2. **Optimistic locking:**
   - Добавить version number в metadata.json
   - Проверять при сохранении
   - Показывать conflict UI если версия изменилась

**Но сейчас это не нужно!**

---

#### Риски (минимальные)

**Единственный возможный сценарий потери данных:**

Инженер открывает две копии Engine Viewer одновременно:
```
Browser Tab 1: http://localhost:3001/projects/bmw-m42
Browser Tab 2: http://localhost:3001/projects/bmw-m42

Tab 1: Редактирует заметку → Save
Tab 2: Редактирует теги → Save (перезаписывает заметку из Tab 1)
```

**Вероятность:** Очень низкая
- Зачем открывать две вкладки одного проекта?
- Если случайно открыл → заметит сразу

**Решение (если станет проблемой):**
- Добавить простой check: "Metadata was changed in another tab. Reload?"
- Не требует file locking, только mtime check

**Пока не делаем - YAGNI!**

---

**Статус:** ✅ Решено (7 ноября 2025) - Вариант C (Last-write-wins), подходит для single-user программы

---

### Q8: Configuration History - автоматическое отслеживание изменений конфигурации

**Вопрос из AUDIT-FINDINGS.md:** Should .prt changes notify user?

**Настоящий вопрос:** Как отслеживать изменения конфигурации двигателя между расчётами?

**Решение:** Automatic .prt versioning - автоматическое сохранение snapshot каждой конфигурации при создании нового calculation marker.

---

#### 🎯 Бизнес-проблема

**Текущая ситуация (без Engine Viewer):**
- Инженер делает 42+ расчёта для одного проекта
- Каждый расчёт = изменения в конфигурации двигателя (bore, stroke, valve timing, etc.)
- **Вручную** ведётся Excel таблица с описанием изменений:
  ```
  Marker  | Description
  $1      | Base configuration
  $2      | Увеличил bore +0.5mm
  $3      | Изменил exhaust valve timing
  $4      | Добавил турбо
  ...
  $42     | Финальная конфигурация
  ```
- **Проблемы:**
  - ❌ Забываешь что менял 2 недели назад
  - ❌ Нет автоматического diff между конфигурациями
  - ❌ Нельзя посмотреть "какая конфигурация была в расчёте $15?"
  - ❌ Manual tracking = errors & time waste

**Это главная боль (killer-feature)** которую должен решить Engine Viewer!

---

#### ✅ Решение: Automatic Configuration History

**Концепция:**
1. **Автоматическое сохранение .prt snapshot** при каждом новом marker
2. **Configuration History UI** - визуализация всех конфигураций проекта
3. **Configuration Viewer** - отображение parsed .prt файла в human-readable формате
4. **Configuration Diff** - сравнение двух конфигураций с highlight изменений

**Как это работает (концептуально):**

```
User workflow:
1. Запускает EngMod4T расчёт → создаётся marker $1 в .det/.pou файле
2. Engine Viewer автоматически:
   - Копирует ProjectName.prt → .metadata/prt-versions/ProjectName-$1.prt
   - Обновляет marker-tracking.json: { "$1": { timestamp, prtHash } }
3. User делает изменения в EngMod4T → запускает расчёт $2
4. Engine Viewer автоматически:
   - Копирует ProjectName.prt → .metadata/prt-versions/ProjectName-$2.prt
   - Обновляет marker-tracking.json: { "$2": { timestamp, prtHash } }
5. User открывает "Configuration History" tab в Engine Viewer
6. Видит список всех конфигураций:
   - $1 (2025-11-01 10:00) - Base configuration
   - $2 (2025-11-01 14:30) - Modified
   - $3 (2025-11-02 09:15) - Modified
7. User кликает "View Config" → открывается Configuration Viewer modal
8. User кликает "Compare with $1" → открывается Configuration Diff viewer
9. Видит что изменилось: bore: 82.0 → 82.5 mm, stroke: 90.0 → 92.0 mm
```

---

#### 🖥️ UI Концепция

**1. Configuration History Tab** (на одном уровне с Metadata tab)
```
├── Metadata (существующий tab)
├── Configuration History (новый tab) ← добавляем
└── Charts (существующий tab)
```

**2. Configuration Viewer Modal**
- Отображает parsed .prt файл в human-readable формате
- Секции: Engine Geometry, Valve Timing, Intake System, Exhaust System, etc.
- Параметры в виде таблицы: Name | Value | Unit

**3. Configuration Diff Viewer**
- Показывает две конфигурации side-by-side
- Изменения highlighted (зелёный = changed, красный = removed, синий = added)
- **Приоритет изменений**:
  - 🔴 Critical: bore, stroke, compression ratio
  - 🟡 Important: valve timing, intake/exhaust geometry
  - 🟢 Minor: temperatures, atmospheric conditions

---

#### 📁 Структура данных (концептуально)

```
.metadata/
├── prt-versions/                    # Snapshots .prt файлов
│   ├── ProjectName-$1.prt          # Конфигурация для marker $1
│   ├── ProjectName-$2.prt          # Конфигурация для marker $2
│   └── ProjectName-$3.prt          # Конфигурация для marker $3
│
└── marker-tracking.json            # Tracking metadata
    {
      "$1": {
        "timestamp": "2025-11-01T10:00:00Z",
        "prtHash": "abc123",
        "hasPrtSnapshot": true
      },
      "$2": {
        "timestamp": "2025-11-01T14:30:00Z",
        "prtHash": "def456",
        "hasPrtSnapshot": true
      }
    }
```

---

#### 🎯 Что решает Configuration History

**Заменяет:**
- ❌ Manual Excel tracking (42+ rows)
- ❌ "Что я менял 2 недели назад?"
- ❌ "Какая конфигурация была в расчёте $15?"

**Даёт:**
- ✅ Автоматическое отслеживание всех изменений
- ✅ Visual diff между любыми конфигурациями
- ✅ Timeline всех расчётов с timestamps
- ✅ Возможность вернуться к любой предыдущей конфигурации

---

#### 📝 Техническая реализация

**Отложено на будущее обсуждение.**

Сейчас фиксируем **ЧТО** (WHAT) и **ПОЧЕМУ** (WHY).

**КАК** (HOW) будем обсуждать после завершения всех вопросов Q1-Q14.

---

**Статус:** ✅ Решено (7 ноября 2025) - Концепция Configuration History с automatic .prt versioning, техническая реализация будет обсуждена позже

---

### Q9: Metadata файлы в git - commit или ignore?

**Вопрос из AUDIT-FINDINGS.md:** Why are 38 metadata files uncommitted? Should they be committed to git or added to .gitignore?

**Решение:** Разделяем Development examples и Production data

---

#### 🎯 Проблема

**Текущая ситуация:**
- В `.metadata/` лежат 38 файлов `*.json` (по одному на каждый проект)
- Все файлы **modified** но не committed в git
- `.metadata/` **НЕ** в `.gitignore` → git их видит как untracked
- Содержат **user-generated metadata**: description, status, tags, notes

**Вопрос:** Commit в git или добавить в .gitignore?

---

#### ✅ Решение: Split Development vs Production

**Development (test-data/):**
- ✅ **Commit примеры metadata** в git
- **Почему:**
  - Примеры показывают функциональность (демонстрация)
  - Новые пользователи видят как заполнять metadata
  - Тестовые данные = часть проекта
  - Не содержат реальных personal данных

**Production (C:/4Stroke/):**
- ✅ **Добавить `.metadata/` в `.gitignore`**
- **Почему:**
  - Personal data (заметки инженера, клиенты, статусы)
  - 50+ проектов → 50+ metadata файлов
  - Не должны попадать в shared repository (если будет)
  - Каждый инженер имеет свои заметки

---

#### 📋 Implementation

**1. Commit примеры metadata (Development)**

Текущие test-data проекты:
```bash
.metadata/
├── bmw-m42.json                ✅ Commit (пример для демонстрации)
├── vesta-16-im.json            ✅ Commit (пример для демонстрации)
└── 4-cyl-itb.json              ✅ Commit (пример для демонстрации)
```

**Действия:**
```bash
git add .metadata/bmw-m42.json
git add .metadata/vesta-16-im.json
git add .metadata/4-cyl-itb.json
git commit -m "docs: add example metadata files for test-data projects"
```

---

**2. Обновить .gitignore (Production protection)**

```gitignore
# .gitignore

# Development metadata (examples) - tracked ✅
# .metadata/bmw-m42.json
# .metadata/vesta-16-im.json
# .metadata/4-cyl-itb.json

# Production metadata - NOT tracked ❌
# (user-generated personal data in C:/4Stroke/)
.metadata/*

# Except examples (whitelist)
!.metadata/bmw-m42.json
!.metadata/vesta-16-im.json
!.metadata/4-cyl-itb.json

# Also ignore marker tracking (production only)
.metadata/marker-tracking.json

# PRT versions (snapshots, can be large)
.metadata/prt-versions/
```

**Логика .gitignore:**
1. Игнорируем ВСЁ в `.metadata/*`
2. Явно разрешаем (`!`) только примеры для test-data
3. Production metadata автоматически игнорируется

---

#### 🔄 Development vs Production Workflow

**Development (engine-viewer/test-data/):**
```
test-data/
├── BMW M42.prt
├── BMW M42/
│   ├── BMW M42.det
│   ├── BMW M42.pou
│   └── .metadata/
│       └── bmw-m42.json        ✅ Tracked by git (example)
```

**Production (C:/4Stroke/):**
```
C:/4Stroke/ProjectName/
├── ProjectName.det
├── ProjectName.pou
└── .metadata/
    ├── project-metadata.json   ❌ NOT tracked (personal data)
    ├── marker-tracking.json    ❌ NOT tracked
    └── prt-versions/           ❌ NOT tracked
        ├── $1.prt
        └── $2.prt
```

---

#### 🎯 Почему это правильное решение

**✅ Преимущества:**

1. **Examples in repo (Development)**
   - Новые пользователи видят как заполнять metadata
   - Документация живая (реальные примеры)
   - CI/CD тесты используют примеры
   - Демонстрация функционала

2. **Privacy (Production)**
   - Personal заметки НЕ попадают в git
   - Client names остаются конфиденциальными
   - Каждый инженер имеет свои metadata
   - Безопасность данных

3. **Flexibility**
   - Production инженеры не боятся делать commit (metadata не утечёт)
   - Development примеры всегда актуальны
   - Можно добавить новые примеры (whitelist в .gitignore)

4. **Clean git status**
   - После setup → `git status` чистый
   - Нет 50+ untracked files
   - Понятно что нужно commit, а что нет

---

#### 🔍 Edge Cases

**Вопрос:** Что если инженер хочет backup metadata?

**Ответ:**
- Metadata в `.metadata/` → рядом с результатами
- Backup папки проекта → metadata backup автоматически
- НЕ нужен отдельный backup mechanism
- Git backup НЕ нужен (personal data)

**Вопрос:** Что если metadata файл test-data/ случайно изменён?

**Ответ:**
- `git diff .metadata/bmw-m42.json` → видим изменения
- Если изменения полезные (улучшили пример) → commit
- Если случайные → `git restore .metadata/bmw-m42.json`

**Вопрос:** Можно ли добавить новые примеры?

**Ответ:**
- ✅ Да! Добавить в `.gitignore` whitelist:
  ```gitignore
  !.metadata/new-example.json
  ```
- Commit новый пример
- Используется для демонстрации новых features

---

#### 📝 Summary

**Решение:**
- Development examples → **tracked** (commit в git)
- Production data → **ignored** (в .gitignore)
- Split approach = best of both worlds

**Actions:**
1. ✅ Commit текущие 3 примера metadata
2. ✅ Обновить .gitignore (ignore all, whitelist examples)
3. ✅ Документировать в README (где metadata хранится)

---

**Статус:** ✅ Решено (7 ноября 2025) - Development examples tracked, Production ignored

---

### Q10: .pou и .det merge - нужен ли?

**Вопрос из AUDIT-FINDINGS.md:** Is .pou merging (73 params) needed? fileScanner.js prioritizes .pou over .det (no merge).

**Решение:** Вопрос основан на **устаревшей информации** - merge **УЖЕ РЕАЛИЗОВАН** ✅

---

#### 🎯 Текущая реализация

**Автоматический merge работает!**

Когда существуют оба файла (`.det` + `.pou`) для одного проекта:
- Backend автоматически их объединяет
- Формат результата: `'pou-merged'`
- Параметры: **75 total** (не 73!)

**Что берётся:**
- ✅ **71 параметр** из `.pou` файла (полный набор)
- ✅ **4 параметра** из `.det` файла:
  - `TCylMax` - максимальная температура в цилиндре (per-cylinder array)
  - `PCylMax` - максимальное давление в цилиндре (per-cylinder array)
  - `Deto` - детонация (per-cylinder array)
  - `Convergence` - сходимость расчёта (single value)

**Итого:** 71 + 4 = **75 параметров** ✅

---

#### 📋 Где реализовано

**1. Merge логика:** [backend/src/services/fileMerger.js](backend/src/services/fileMerger.js)

```javascript
export function mergeDetPouData(pouProject, detProject) {
  // 1. Use .pou as base (71 parameters)
  // 2. Add TCylMax, PCylMax, Deto, Convergence from .det
  // 3. Match calculations by ID
  // 4. Match data points by RPM
  // 5. Return merged project with format: 'pou-merged'

  const mergedPoint = {
    ...pouPoint,                       // All 71 .pou parameters
    TCylMax: detPoint.TCylMax,         // Add from .det
    PCylMax: detPoint.PCylMax,         // Add from .det
    Deto: detPoint.Deto,               // Add from .det
    Convergence: detPoint.Convergence  // Add from .det
  };

  return mergedProject; // format: 'pou-merged'
}
```

**2. Автоматический вызов:** [backend/src/services/fileParser.js](backend/src/services/fileParser.js)

```javascript
async function parseDetFile(filePath) {
  // Проверяем существуют ли оба файла
  const hasPou = existsSync(pouPath);
  const hasDet = existsSync(detPath);

  // Если оба файла существуют - делаем merge АВТОМАТИЧЕСКИ
  if (hasPou && hasDet) {
    console.log(`Найдены оба файла, выполняю merge...`);

    const pouProject = await parseEngineFile(pouPath);
    const detProject = await parseEngineFile(detPath);

    const merged = mergeDetPouData(pouProject, detProject);
    return merged; // format: 'pou-merged' с 75 параметрами
  }

  // Если только один файл - парсим как обычно
  return await parseEngineFile(filePath);
}
```

---

#### ✅ Что уже работает

**1. Автоматическое определение:**
- Backend сканирует папку проекта
- Находит `.det` и `.pou` файлы
- Автоматически объединяет если оба существуют

**2. Приоритизация:**
- Если оба файла → merge (75 параметров)
- Если только `.pou` → используем `.pou` (71 параметр)
- Если только `.det` → используем `.det` (24 параметра)

**3. Совместимость:**
- Проверяется количество цилиндров (.pou vs .det)
- Проверяется engineType (warning если отличается)
- Matching calculations by ID
- Matching data points by RPM

**4. Обработка несовпадений:**
- Если calculation есть в .pou но нет в .det → используем только .pou data
- Если RPM есть в .pou но нет в .det → используем только .pou point
- Warning логи для debugging

---

#### 🔍 Почему AUDIT устарел?

**AUDIT утверждал (строка 910):**
> fileScanner.js prioritizes .pou over .det (no merge)

**Реальность:**
- Merge **УЖЕ реализован** в `fileParser.js`
- Происходит **АВТОМАТИЧЕСКИ** когда оба файла существуют
- Format: `'pou-merged'` с **75 параметрами** (не 73!)

**Когда был добавлен merge?**
- Реализован в fileMerger.js (Phase 1)
- AUDIT проводился до или во время реализации
- Вопрос Q10 устарел после добавления merge функциональности

---

#### 📊 Use Cases

**Графики с TCylMax:**
- ✅ Работает! TCylMax доступен из merged data
- Можно строить график TCylMax vs RPM
- Используются данные из .det файла

**DataTable с полным набором:**
- ✅ Работает! Все 75 параметров доступны
- Пользователь видит комбинированный dataset
- Не нужно переключаться между .pou и .det

**Per-cylinder analysis:**
- ✅ Работает! PCylMax, TCylMax, Deto arrays доступны
- Можно анализировать отличия между цилиндрами
- Детальный анализ детонации

---

#### 📝 Что НЕ нужно делать

**❌ НЕ НУЖНО:**
- Реализовывать merge (уже есть!)
- Добавлять manual merge UI (автоматически!)
- Спрашивать пользователя ".pou или .det?" (автомат!)
- Документировать "как будем делать merge" (уже работает!)

**✅ НУЖНО:**
- Обновить AUDIT-FINDINGS.md (отметить Q10 как resolved)
- Документировать что merge УЖЕ работает
- Тестировать merge на реальных данных

---

#### 🎯 Итог

**Вопрос Q10 основан на устаревшей информации.**

Merge `.det` + `.pou` **УЖЕ РАБОТАЕТ** в production:
- ✅ Автоматически объединяет оба файла
- ✅ 75 параметров доступны (71 pou + 4 det)
- ✅ Format: `'pou-merged'`
- ✅ Все use cases покрыты

**Действия не требуются** - функциональность уже реализована! ✨

---

**Статус:** ✅ Решено (7 ноября 2025) - Merge уже реализован в Phase 1, вопрос устарел

---

### Q11: File Watching (автообновление) - включено ли?

**Вопрос из AUDIT-FINDINGS.md:** Should file watching be enabled? chokidar installed but not used, createFileWatcher() exists but not called.

**Решение:** Вопрос основан на **устаревшей информации** - file watching **УЖЕ ВКЛЮЧЕН и РАБОТАЕТ** ✅

---

#### 🎯 Текущая реализация

**File watching активен при старте backend!**

- Автоматически запускается при `npm run backend`
- Отслеживает `.det`, `.pou`, `.prt` файлы
- Real-time обновление metadata для .prt файлов
- Логирование всех событий

---

#### 📋 Где реализовано

**1. Watcher логика:** [backend/src/services/fileScanner.js:504](backend/src/services/fileScanner.js)
**2. Автозапуск:** [backend/src/server.js:162](backend/src/server.js)

---

#### ✅ Что работает

- ✅ Новые/изменённые/удалённые файлы → event триггеры
- ✅ `awaitWriteFinish` - ждёт завершения записи (500ms стабильности)
- ✅ .prt изменился → auto-update metadata
- ✅ Рекурсивное отслеживание всех подпапок
- ✅ Логирование событий

---

#### ⚠️ Ограничение

**Frontend НЕ обновляется автоматически:**
- Backend знает об изменениях (watcher работает)
- Frontend НЕ знает (нет WebSocket)
- Нужен manual refresh (F5) в браузере

**Future enhancement:** WebSocket для frontend auto-reload

---

**Статус:** ✅ Решено (7 ноября 2025) - File watching работает (backend), frontend auto-reload - future enhancement

---

### Q12: Chart Export Quality - pixelRatio=2 достаточно?

**Вопрос из AUDIT:** PNG export uses pixelRatio=2. For publication-quality? Should there be higher resolution or PDF/vector export?

**Решение:** **SVG export УЖЕ РЕАЛИЗОВАН** ✅ - векторный формат для публикаций!

---

#### 🎯 Реализация

**ДВА формата:**
1. **PNG** - pixelRatio=2 (Retina) - презентации
2. **SVG** ✅ - векторный - **publication-quality**

**Где:** [frontend/src/utils/export.ts](frontend/src/utils/export.ts)
- exportChartToPNG() - строка 109
- exportChartToSVG() - строка 143

**UI:** Доступно во всех ChartPreset компонентах через useChartExport hook

---

#### ✅ SVG преимущества

- ✅ Векторный → бесконечное масштабирование
- ✅ Редактируемый (Illustrator, Inkscape)
- ✅ Идеален для научных журналов
- ✅ Чёткий текст при любом размере

---

#### 📝 Итог

- PNG + SVG покрывают **ВСЕ use cases**
- Higher pixelRatio **НЕ НУЖЕН** (есть SVG)
- PDF **НЕ НУЖЕН** (SVG лучше)

**Статус:** ✅ Решено (7 ноября 2025) - SVG export работает (publication-quality)

---

### Q13-Q14: Лимит 5 calculations - почему?

**Вопросы из AUDIT:**
- Q13: Why 5 calculations limit (1 primary + 4 comparisons)?
- Q14: Could users want more? How to expand?

**Решение:** Лимит 5 = **UX decision** (readability), НЕ технический. Расширение возможно.

---

#### 🎯 Обоснование лимита

**5 calculations total (1 primary + 4 comparisons):**

1. **Color Palette** (ADR 003):
   - 5 contrasting colors для максимальной читаемости
   - Red → Green → Blue → Orange → Purple
   - Больше цветов → хуже distinguishability

2. **Chart Readability:**
   - 5 линий на графике = читаемо
   - 10+ линий = visual clutter
   - Инженерный инструмент → чистота важнее

3. **Performance:**
   - 5 projects × 20 calculations × 30 points = 3000 points
   - ECharts справляется без проблем

**Документация:** [ADR 006: Cross-Project Comparison](docs/decisions/006-cross-project-comparison.md)

---

#### ✅ Где реализовано

**Константы:** [frontend/src/types/v2.ts:231](frontend/src/types/v2.ts)
```typescript
export const CALCULATION_COLORS = [
  "#e74c3c", // Red (primary)
  "#3498db", // Blue
  "#2ecc71", // Green
  "#f39c12", // Orange
  "#9b59b6"  // Purple
];

export const MAX_COMPARISONS = 4; // + 1 primary = 5 total
```

---

#### 🔄 Future Expansion

**Можно увеличить до 7-8:**
1. Добавить цвета в CALCULATION_COLORS
2. Увеличить MAX_COMPARISONS
3. Протестировать readability

**НО сначала:**
- Обсудить с пользователем нужность
- Подобрать дополнительные контрастные цвета
- Проверить accessibility (WCAG 2.1 AA)

**Из ADR 006:**
> "Можно увеличить limit до 7-8 projects если потребуется, но сначала нужно добавить больше цветов в palette"

---

**Статус:** ✅ Решено (7 ноября 2025) - UX decision (readability), расширение возможно при необходимости

---

