# ADR 005: .prt Parser и Разделение Metadata на Auto/Manual

**Дата:** 2025-11-05
**Статус:** Принято
**Автор:** Claude Code + Vladimir

---

## Контекст

Система Engine Viewer работает с ~50 проектами в год. Каждый проект содержит файлы:
- `.det`/`.pou` - результаты расчётов (данные для графиков)
- `.prt` - метаданные двигателя (engine specs: cylinders, bore, stroke, type, intake, exhaust)

**Проблемы:**

1. **Нет автоматического извлечения metadata:**
   - User вручную заполняет информацию о двигателе (cylinders, type, intake system)
   - При 50+ проектах это трудозатратно
   - Возможны ошибки ручного ввода

2. **Конфликт автоматических и пользовательских данных:**
   - Metadata может быть как из `.prt` (engine specs), так и от user (client name, notes, tags)
   - Как обновлять auto данные без потери user данных?
   - Что если user изменил auto данные вручную?

3. **Сложность фильтрации:**
   - Нужны фильтры: cylinders, type (NA/Turbo), intake (ITB/IM), exhaust (4-2-1/4-1)
   - User не хочет вручную помечать 50+ проектов тегами

**Требования:**
- Автоматически извлекать metadata из `.prt` файлов
- Отличать "Intake Manifold" (IM) от "Individual Throttle Bodies" (ITB)
- Распознавать exhaust patterns ("4into2into1" → "4-2-1")
- Сохранять пользовательские данные (client, description, tags, notes) при re-parse
- Поддерживать фильтры Dashboard (cylinders, type, intake, exhaust)

---

## Решение

### 1. Реализовать .prt Parser

Создать `backend/src/parsers/formats/prtParser.js` для извлечения:
- Engine specs: cylinders, configuration, type, bore, stroke, compression ratio, max RPM
- **Intake System detection**: "with no airboxes" → ITB, "with a common airbox or plenum" → IM
- **Exhaust System detection**: "4into2into1 manifold" → "4-2-1"

### 2. Разделить Metadata на Auto + Manual

**Новая структура metadata v1.0:**

```json
{
  "version": "1.0",
  "id": "bmw-m42",
  "displayName": "BMW M42 Performance Build",

  "auto": {
    "cylinders": 4,
    "type": "NA",
    "configuration": "inline",
    "bore": 84,
    "stroke": 81,
    "compressionRatio": 10.5,
    "maxPowerRPM": 7000,
    "intakeSystem": "ITB",
    "exhaustSystem": "4-2-1",
    "combustion": {
      "fuelType": "100 UNLEADED",
      "nitromethaneRatio": 0.0,
      "curves": [
        { "rpm": 2000, "timing": 14.0, "afr": 12.5, "delay": 4.34, "duration": 43.4, "vibeA": 10.0, "vibeB": 2.0, "beff": 0.87 },
        { "rpm": 3000, "timing": 16.0, "afr": 12.5, "delay": 4.77, "duration": 47.7, "vibeA": 10.0, "vibeB": 2.0, "beff": 0.87 }
      ]
    }
  },

  "manual": {
    "description": "Performance build for track use",
    "client": "Ivan Petrov",
    "tags": ["client-project", "track-build"],
    "status": "completed",
    "notes": "Dyno tested 05/11/2025",
    "color": "#ff6b00"
  },

  "created": "2025-10-22T10:00:00Z",
  "modified": "2025-11-05T15:00:00Z"
}
```

**Правила:**
- **auto section** = read-only данные из `.prt` (источник истины - файл)
- **manual section** = user-editable данные (источник истины - `.metadata/{id}.json`)
- При re-parse `.prt`: обновляем `auto`, СОХРАНЯЕМ `manual`

---

## Причины

### 1. Автоматизация

**Проблема:** User работает с 50+ проектами, ручной ввод трудозатратен.

**Решение:** `.prt` файлы уже содержат все engine specs → парсим автоматически.

### 2. Точность данных

**Проблема:** Ручной ввод → ошибки (cylinders = 5 вместо 4, type = Turbo вместо NA).

**Решение:** Auto данные из `.prt` файла → 100% точность (source of truth).

### 3. Intake System detection (ITB vs IM)

**Проблема:** 85% проектов = NA engines, но нужно отличать ITB от IM для фильтрации.

**Логика detection:**
```javascript
// ITB (Individual Throttle Bodies)
if (line.includes('with no airboxes')) → intakeSystem = 'ITB'

// IM (Intake Manifold)
if (line.includes('with a common airbox or plenum')) → intakeSystem = 'IM'
```

**Важность:** ITB vs IM = критичное различие в конфигурации двигателя.

### 4. Exhaust System parsing

**Проблема:** Exhaust patterns записаны текстом: "4into2into1 manifold".

**Решение:** Regex parsing:
```javascript
"4into2into1" → "4-2-1"
"4into1"      → "4-1"
"tri-y"       → "tri-y"
"8into4into2into1" → "8-4-2-1"
```

### 5. Combustion Timing Data (v3.2.0)

**Проблема:** Для educational визуализации на P-α диаграммах нужны данные о фазах сгорания (ignition timing, delay, duration).

**Решение:** Парсинг секции "Ignition Model Data" из `.prt` файлов:
```javascript
combustion: {
  fuelType: "100 UNLEADED",
  nitromethaneRatio: 0.0,
  curves: [
    {
      rpm: 2000,
      timing: 14.0,      // Ignition advance (°BTDC)
      afr: 12.5,         // Air-Fuel Ratio
      delay: 4.34,       // Ignition delay (°)
      duration: 43.4,    // Combustion duration (°)
      vibeA: 10.0,       // Wiebe parameter A
      vibeB: 2.0,        // Wiebe parameter B
      beff: 0.87         // Combustion efficiency
    },
    // ... more RPM points
  ]
}
```

**Использование:**
- Визуализация combustion timing markers на P-α диаграммах (Stage 6)
- Educational: показывает зоны ignition delay и burn duration
- RPM-specific: каждый RPM имеет свои timing параметры

### 6. Разделение Auto/Manual

**Почему не merged metadata?**

❌ **Вариант 1: Все поля в одном объекте**
```json
{
  "cylinders": 4,
  "type": "NA",
  "client": "Ivan",
  "notes": "Track build"
}
```
**Проблема:** При re-parse `.prt` как отличить auto поля от manual? → Можем случайно перезаписать user данные.

✅ **Вариант 2: Разделение auto + manual**
```json
{
  "auto": { /* from .prt */ },
  "manual": { /* from user */ }
}
```
**Решение:** Явное разделение → при re-parse обновляем `auto`, сохраняем `manual`.

### 6. Backward Compatibility

**Проблема:** Уже есть 5 старых metadata файлов (без `auto`/`manual`).

**Решение:** Migration script `backend/scripts/migrate-metadata.js`:
- Читает старые файлы
- Переносит user данные в `manual` section
- Создаёт пустую `auto` section (заполнится при первом scan)

---

## Последствия

### Плюсы

✅ **Автоматизация:**
- User не вводит engine specs вручную
- Сэкономлено ~5 минут на проект × 50 проектов = 4 часа в год

✅ **Точность:**
- 100% точность auto данных (source of truth - `.prt` файл)
- Нет ошибок ручного ввода

✅ **Умные фильтры:**
- Dashboard фильтры работают автоматически (cylinders, type, intake, exhaust)
- User сразу видит: "показать все ITB проекты" без ручной пометки тегами

✅ **Data Integrity:**
- При re-parse `.prt` user данные (client, notes, tags) НИКОГДА не теряются
- Явное разделение `auto`/`manual` → нет случайного перезаписывания

✅ **Расширяемость:**
- Легко добавить новые auto поля в будущем (valve timing, cam lift, etc.)
- Легко добавить новые manual поля (rating, project cost, etc.)

### Минусы

⚠️ **Сложность структуры:**
- Metadata имеет вложенную структуру (`auto`/`manual`)
- Frontend должен знать где искать поля: `metadata.auto.cylinders` vs `metadata.manual.client`

⚠️ **Migration requirement:**
- Все старые metadata файлы требуют миграции
- Migration script должен запускаться один раз

⚠️ **User не может edit auto поля:**
- Auto поля read-only в UI (источник истины - `.prt` файл)
- Если user хочет изменить cylinders → нужно править `.prt` файл (редкий случай)

---

## Альтернативы

### Вариант 1: Теги вместо auto metadata

```json
{
  "tags": ["4-cyl", "NA", "ITB", "4-2-1"]
}
```

**Плюсы:**
- Простая структура
- User полный контроль

**Минусы:**
- ❌ User должен вручную тегировать 50+ проектов
- ❌ Возможны опечатки ("4cyl" vs "4-cyl")
- ❌ Нет source of truth (если `.prt` изменился, теги устарели)

**Вердикт:** Отклонено из-за трудозатратности и отсутствия source of truth.

### Вариант 2: Merged metadata с флагом `editable`

```json
{
  "cylinders": { "value": 4, "editable": false },
  "client": { "value": "Ivan", "editable": true }
}
```

**Плюсы:**
- Плоская структура
- Явное указание editable полей

**Минусы:**
- ❌ Избыточная вложенность для каждого поля
- ❌ Сложнее парсить (каждое поле = объект)
- ❌ При re-parse нужно проверять флаг `editable` для каждого поля

**Вердикт:** Отклонено из-за избыточной сложности.

### Вариант 3: Два отдельных файла

```
.metadata/bmw-m42.auto.json    (from .prt)
.metadata/bmw-m42.manual.json  (from user)
```

**Плюсы:**
- Полное разделение на уровне файлов
- Нет риска случайного merged

**Минусы:**
- ❌ Два файла вместо одного
- ❌ Нужно синхронизировать два файла при операциях
- ❌ Сложнее API (два endpoint: `/auto` и `/manual`)

**Вердикт:** Отклонено из-за усложнения API и file management.

---

## Реализация

### Backend Files

**Parser:**
- `backend/src/parsers/formats/prtParser.js` - .prt parser (540 строк)
- `backend/src/parsers/index.js` - registry `globalRegistry.register('prt', PrtParser)`

**Services:**
- `backend/src/services/fileScanner.js` - recursive scanning, auto metadata population
- `backend/src/services/metadataService.js` - `updateAutoMetadata()`, `updateManualMetadata()`

**Routes:**
- `backend/src/routes/projects.js` - GET `/api/projects?cylinders=4&type=NA&intake=ITB`
- `backend/src/routes/metadata.js` - POST `/api/projects/:id/metadata` (только manual section)

**Migration:**
- `backend/scripts/migrate-metadata.js` - миграция старых metadata → v1.0

### TypeScript Types

**shared-types.ts:**
```typescript
export interface AutoMetadata {
  cylinders: number;
  type: 'NA' | 'Turbo' | 'Supercharged';
  configuration: EngineConfiguration;
  bore: number;
  stroke: number;
  compressionRatio: number;
  maxPowerRPM: number;
  intakeSystem: IntakeSystem;
  exhaustSystem: ExhaustSystem;
}

export interface ManualMetadata {
  description?: string;
  client?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived' | 'testing';
  notes?: string;
  color?: string;
}

export interface ProjectMetadata {
  version: '1.0';
  id: string;
  displayName?: string;
  auto?: AutoMetadata;
  manual: ManualMetadata;
  created: string;
  modified: string;
}
```

### Frontend Integration

**API Client:**
- `frontend/src/api/client.ts` - handles `metadata.auto.*` and `metadata.manual.*`

**Components:**
- `frontend/src/components/projects/ProjectCard.tsx` - displays auto badges (cylinders, type, intake, exhaust)
- Project Edit Dialog - только manual поля editable, auto поля read-only

### Git Commits

- `1efaa37` - feat: implement .prt parser and metadata v1.0 structure (Phase 1.2 + 1.3 + 1.4)
- `f3f5975` - fix: correct metadata field paths in ProjectCard
- `11dcd19` - feat: add technical specification and reorganize test-data

---

## Ссылки

- [PROJECT-METADATA-DASHBOARD-SPEC.md](../../PROJECT-METADATA-DASHBOARD-SPEC.md) - Technical specification
- [PROJECT-METADATA-DASHBOARD-ROADMAP.md](../../PROJECT-METADATA-DASHBOARD-ROADMAP.md) - Implementation roadmap
- [docs/file-formats/prt-format.md](../file-formats/prt-format.md) - .prt file format specification
- [ADR-001: .det file parsing](./001-det-file-parsing.md) - Related decision for .det files

---

## Примечания

### Intake System Detection

**Логика основана на тексте из `.prt` файла:**

```
Line 276: "4 throttles - with no airboxes"     → ITB
Line 276: "1 throttle - with a common airbox"  → IM
```

**Важно:** Detection работает только если текст соответствует паттерну. Если `.prt` файл от старой версии EngMod4T или текст изменён → detection может не работать.

### Exhaust System Parsing

**Regex patterns:**

```javascript
/(\d+)into(\d+)into(\d+)/  → "4-2-1", "8-4-2-1"
/(\d+)into(\d+)/           → "4-1"
/tri-y/i                   → "tri-y"
```

### Update: Carb Intake System Support (2025-11-06)

**Проблема:** Добавлен новый проект "Lada 1300 Carb" с карбюраторной системой впуска, но parser определил его как "ITB" вместо правильного типа.

**Исследование:**
- Проанализированы все 35 .prt файлов в test-data для поиска точных описаний intake systems
- Найдены 3 различных паттерна в .prt файлах:
  1. "seperate intake pipes, with no airboxes and no boost bottles but with throttles" → **ITB**
  2. "seperate intake pipes, with a common airbox or plenum" → **IM**
  3. "collected intake pipes, with no airboxes" → **Carb** (НОВЫЙ ТИП!)

**Решение:** Добавлен третий тип intake system - "Carb" (Carburetor/Collector)

**Что такое Carb:**
- Карбюраторные системы впуска
- Коллекторные системы (4into1, 1intoN manifolds)
- Характеристика: "**collected** intake pipes" (не "seperate"!)

**Обновлённая логика detection в prtParser.js:**

```javascript
parseIntakeSystem(intakeLines, numCylinders) {
  const intakeText = intakeLines.join('\n').toLowerCase();

  // 1. ПЕРВЫМ проверяем "collected intake pipes" → Carburetor/Collector
  if (intakeText.includes('collected intake pipes')) {
    return 'Carb';
  }

  // 2. Проверяем "seperate intake pipes"
  if (intakeText.includes('seperate intake pipes')) {
    // 2a. ITB: separate + no airboxes + throttles
    if (intakeText.includes('with no airboxes') && intakeText.includes('but with throttles')) {
      return 'ITB';
    }

    // 2b. IM: separate + common airbox/plenum
    if (intakeText.includes('with a common airbox') || intakeText.includes('with a common plenum')) {
      return 'IM';
    }
  }

  // Fallback: Дополнительная проверка по throttles count
  // ...

  return 'IM'; // Default
}
```

**Важность порядка проверки:**
- ❌ **Старая логика:** Проверка "with no airboxes" ПЕРВОЙ → возвращал "ITB" для Carb проектов
- ✅ **Новая логика:** Проверка "collected" vs "seperate" ПЕРВОЙ → правильное определение всех типов

**Причина ошибки:**
- Файл "Lada 1300 Carb.prt" содержит: `"collected intake pipes, with no airboxes"`
- Старая логика: нашла "with no airboxes" → вернула "ITB" ❌
- Правильная логика: сначала проверить "collected" → вернуть "Carb" ✅

**Тестирование (6 проектов):**
- ✅ lada-1300-carb → Carb (карбюратор)
- ✅ 4-cyl-itb → ITB (individual throttle bodies)
- ✅ vesta-16-im → IM (intake manifold)
- ✅ tm-soft-shortcut → IM
- ✅ bmw-m42 → ITB
- ✅ lada-1300-weber → Carb

**Frontend изменения:**
- Добавлен тип 'Carb' в TypeScript union type (FiltersBar.tsx)
- Добавлена опция "Carb" в Engine filter dropdown
- Обновлена логика фильтрации (projectFilters.ts) для включения Carb в intakeSystems array

**Commits:**
- `463ab92` - backend: updated prtParser.js parseIntakeSystem() logic
- `875fea7` - frontend: added Carb to FiltersBar type options
- `2b2c782` - frontend: fixed filter logic to include Carb

**Результат:** Система теперь правильно определяет и фильтрует карбюраторные/коллекторные системы впуска.

**Обновлённая типизация:**

```typescript
export type IntakeSystem = 'ITB' | 'IM' | 'Carb';
```

---

### Future Improvements

- [X] ~~Support для custom intake types (Ram Air, Velocity Stacks)~~ → Добавлен "Carb" (2025-11-06)
- [ ] Auto detection: Forced Induction (Turbo vs Supercharger) by parsing turbochargers/superchargers count
- [ ] Validation: cross-check auto metadata with .det file metadata (cylinders match?)
