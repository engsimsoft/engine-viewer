# ADR 014: .prt File Format Specification

**Дата:** 2025-11-12
**Статус:** Принято
**Автор:** User + Claude Code
**Связано с:** ADR-005, ADR-007, ADR-011, ADR-013

---

## Контекст

**.prt файлы - PRIMARY source of truth для конфигурации двигателя** в EngMod4T Suite.

### Что такое .prt файл

**Определение:** "Printable summary" всех subsystems проекта (source: DAT4T documentation)

**Создается:** Программой DAT4T (pre-processor) при сохранении проекта
**Используется:**
- EngMod4T (читает конфигурацию для simulation)
- Engine Results Viewer (извлекает metadata для auto-population)

**Назначение:**
- Хранит полную конфигурацию двигателя (engine specs, intake/exhaust, combustion, temperatures)
- Читаемый текстовый формат (human-readable для print/review)
- Единый источник истины для всех настроек проекта

### Проблема

До этого ADR информация о формате .prt была разрозненна:
- ADR 005 описывал **parser и metadata separation**
- ADR 007 описывал **intake system detection** (ITB/IM/Carb)
- ADR 011 описывал **lazy parsing optimization**
- ADR 013 описывал **combustion table interpolation**
- `prtParser.js` - 588 строк кода парсинга
- Документация DAT4T - что создает .prt, но не структуру

**Отсутствовало:**
- ❌ Централизованное описание структуры формата
- ❌ Спецификация секций файла
- ❌ Примеры реальных данных
- ❌ Foundation document для других ADR

---

## Решение

**Создать централизованную спецификацию .prt формата** как foundation document.

### Формат файла

**Общие характеристики:**
- **Тип:** Fixed-width ASCII text (NOT structured data like JSON/XML)
- **Кодировка:** Windows-1251 (Cyrillic support)
- **Программа-источник:** DAT4T (Delphi 7)
- **Разделитель секций:** Asterisks (`*********`)
- **Формат данных:** 
  - Текстовые описания (human-readable)
  - Параметры с labels и units
  - Табличные данные (fixed-width columns)

**Структура:** 8 основных секций (всего ~400 строк)

---

## Структура секций

### 1. Header Section (lines 1-31)

**Содержит:**
- Название проекта (line 8)
- Дата создания (line 12-13)
- Время создания (line 13)
- DAT4T версия (line 15)
- Список subsystem files (lines 19-29)

**Извлекаемые данные:**
- `projectName` (line 8)
- `created` (ISO 8601 timestamp from lines 12-13)
- `datVersion` (line 15)

---

### 2. General Engine Data (lines 33-63)

**Содержит:**
- Engine type (NA/Turbo/Supercharged)
- Number of cylinders
- Configuration (INLINE/VEE)
- Bore, Stroke, Compression Ratio
- Max Power RPM
- Valve configuration

**Извлекаемые данные:**
- `type`: "NA" | "Turbo" | "Supercharged"
- `cylinders`: number
- `configuration`: "inline" | "vee"
- `bore`: mm
- `stroke`: mm
- `compressionRatio`: число
- `maxPowerRPM`: number
- `valvesPerCylinder`: number

---

### 3-4. Exhaust/Inlet Port Sections

**Извлекаемые данные:**
- `exhaustValves`: number (per cylinder)
- `inletValves`: number (per cylinder)

---

### 5. Exhaust System Section (lines 199-267)

**Ключевая фраза для парсинга:**
```
"The exhaust system is a 4into2into1 manifold."
```

**Извлекаемые данные:**
- `exhaustSystem`: "4-2-1" | "4-1" | "tri-y" | "8-4-2-1"

**Patterns:**
- `"4into2into1"` → `"4-2-1"`
- `"4into1"` → `"4-1"`
- `"tri-y"` → `"tri-y"`

---

### 6. Intake System Section (lines 271-353)

**КРИТИЧЕСКИ ВАЖНАЯ для определения типа intake.**

**Ключевые фразы (ADR 007):**

**ITB (Individual Throttle Bodies):**
```
"This is an intake system with seperate intake pipes,
   with no airboxes and no boost bottles but with throttles."
```

**IM (Intake Manifold):**
```
"This is an intake system with seperate intake pipes,
   with a common airbox or plenum."
```

**Carb (Carburetor/Collector):**
```
"This is an intake system with collected intake pipes."
```

**Detection Logic (Priority):**
1. Check `"collected intake pipes"` → Carb
2. Check `"seperate intake pipes"`:
   - + `"with no airboxes"` + `"but with throttles"` → ITB
   - + `"with a common airbox"` → IM
3. Default → IM

**Извлекаемые данные:**
- `intakeSystem`: "ITB" | "IM" | "Carb"

---

### 7. Ignition Model Data Section (lines 356-375)

**КРИТИЧЕСКИ ВАЖНАЯ для combustion timing visualization.**

**Пример таблицы:**
```
  RPM     Timing    AFR    Delay Duration  VibeA  VibeB  Beff
 2000.00   14.70   12.57    4.64   46.40   10.00  2.000  0.910
 3000.00   17.60   12.55    5.02   50.20   10.00  2.000  0.910
 4000.00   19.60   12.52    5.40   54.00   10.00  2.000  0.910
 5000.00   21.50   12.50    5.79   57.90   10.00  2.000  0.895
 6000.00   23.50   12.50    6.17   61.70   10.00  2.000  0.905
 7000.00   25.48   12.50    6.56   65.60   10.00  2.000  0.910
 8000.00   27.45   12.45    6.94   69.40   10.00  2.000  0.910
 9000.00   29.41   12.42    7.32   73.20   10.00  2.000  0.910
```

**Извлекаемые данные:**
- `combustion.fuelType`: string
- `combustion.nitromethaneRatio`: number
- `combustion.curves`: array (8 RPM points)

**Использование:**
- Combustion timing markers на P-α диаграммах
- Linear interpolation для промежуточных RPM (ADR 013)

---

### 8. Wall Temperature Section (lines 380-395)

**Извлекаемые данные:**
- Wall temperatures (для thermal simulation)
- Atmospheric conditions

---

## Парсинг

**Файл:** `backend/src/parsers/formats/prtParser.js` (588 строк)

**Output Format:**
```json
{
  "engine": {
    "name": "4_Cyl_ITB",
    "cylinders": 4,
    "type": "NA",
    "bore": 82.5,
    "stroke": 75.6,
    "intakeSystem": "ITB",
    "exhaustSystem": "4-2-1"
  },
  "combustion": {
    "fuelType": "100 UNLEADED",
    "curves": [ /* 8 RPM points */ ]
  }
}
```

---

## Причины

### Почему .prt = Primary Source of Truth

**Workflow:**
```
DAT4T (creates/updates .prt)
  ↓
EngMod4T (reads .prt, runs simulation)
  ↓
.det/.pou (results)
  ↓
Engine Viewer (visualizes results + extracts metadata from .prt)
```

**Ключевые факты:**
- ✅ DAT4T - ЕДИНСТВЕННАЯ программа создающая .prt
- ✅ EngMod4T читает .prt (READ-ONLY)
- ✅ .prt создается ОДИН РАЗ при создании проекта

### Почему Text Format

- ✅ Human-readable (engineer может review в text editor)
- ✅ Printable (отсюда "printable summary")
- ✅ Delphi 7 legacy (stable 15+ лет)

---

## Последствия

### Плюсы
- ✅ Централизованная документация формата
- ✅ Foundation document для других ADR
- ✅ Упрощает onboarding новых разработчиков

### Минусы
- ⚠️ Maintenance burden если формат изменится
- ⚠️ Некоторое дублирование с ADR 007, 013

---

## Альтернативы

**1. Не создавать отдельный ADR** - Отклонено (ADR 005 фокусируется на parser, не на format)
**2. Только prt-format.md без ADR** - Отклонено (нужны оба: ADR для context + spec для details)

---

## Реализация

**Backend:**
- `backend/src/parsers/formats/prtParser.js` - main parser
- `backend/src/services/fileScanner.js` - scanning
- `backend/src/services/prtQueue.js` - lazy parsing (ADR 011)

**Frontend:**
- `frontend/src/components/HomePage/ProjectCard.tsx` - displays metadata
- `frontend/src/components/HomePage/FiltersBar.tsx` - filters
- `frontend/src/components/pv-diagrams/*` - uses combustion data

---

## Ссылки

### Related ADRs
- [ADR 005: .prt Parser and Metadata Separation](./005-prt-parser-metadata-separation.md)
- [ADR 007: Carb Intake System Support](./007-carb-intake-system-support.md)
- [ADR 011: Lazy .prt Parsing](./011-lazy-prt-parsing.md)
- [ADR 013: .prt Table Data Interpolation](./013-prt-table-data-interpolation.md)

### Documentation
- [docs/file-formats/prt-format.md](../file-formats/prt-format.md) - Detailed specification
- [docs/engmod4t-suite/dat4t-overview.md](../engmod4t-suite/dat4t-overview.md) - DAT4T overview

### Code
- `backend/src/parsers/formats/prtParser.js`
- `backend/test-prt-parser.js`

---

## Примечания

**File Naming:**
```
C:/4Stroke/BMW M42.prt           ← Project file
C:/4Stroke/BMW M42/              ← Results folder
  ├── BMW M42.det
  ├── BMW M42.pou
  └── BMW M42_8000.pvd
```

**String Stability:** Ключевые фразы ("collected intake pipes", "seperate intake pipes") stable 15+ лет.

**Future-proof:** Легко добавить новые секции (9, 10, ...) по мере необходимости.
