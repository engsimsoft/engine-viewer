# 📘 Руководство по добавлению парсеров

**Дата создания:** 31 октября 2025
**Обновлено:** 2 ноября 2025
**Версия:** 2.1

---

## 🎯 Назначение

Это руководство описывает как добавить поддержку нового формата файлов в Engine Results Viewer используя **Registry Pattern Architecture**.

**Текущие форматы:**
- ✅ [.det Format](file-formats/det-format.md) - 24 параметра (базовый набор)
- ✅ [.pou Format](file-formats/pou-format.md) - 71 параметр (расширенный набор)
- ⏳ .prt + ~12 trace file types - Планируется

**Принцип:** Все парсеры преобразуют данные в **единый JSON формат** и регистрируются в **ParserRegistry**.

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО: Universal EngMod4T Format

**Перед написанием парсера ОБЯЗАТЕЛЬНО прочитайте:** [EngMod4T Overview](engmod4t-overview.md)

### Все файлы имеют единый формат!

**КЛЮЧЕВОЕ ОТКРЫТИЕ:** Все ~15 типов файлов (.det, .pou, .prt, trace files) создаются ОДНОЙ программой (EngMod4T, Delphi 7) → ОДИН и тот же формат!

**Универсальные характеристики (для ВСЕХ файлов):**

- **Формат:** Fixed-width ASCII text (**НЕ** CSV, **НЕ** tab-separated)
- **Происхождение:** Delphi `WriteLn(F, Format('%12.2f ...', [values]))`
- **Разделитель:** Множественные пробелы (не одиночные, не табы)
- **Первая колонка:** ВСЕГДА служебная (пропускать через `slice(1)`)
- **Выравнивание:** Числа выровнены по правому краю с пробелами слева

### Универсальная стратегия парсинга

```javascript
// ✅ ПРАВИЛЬНО для ВСЕХ файлов EngMod4T
const columns = line.trim().split(/\s+/);      // Множественные пробелы
const dataColumns = columns.slice(1);          // Пропускаем первую колонку
const values = dataColumns.map(parseFloat);

// ❌ НЕПРАВИЛЬНО
const values = line.split(',');       // НЕТ! Это не CSV
const values = line.split(/\t+/);     // НЕТ! Это не табы
const values = line.split(' ');       // НЕТ! Множественные пробелы
```

### Зачем это знать?

1. **Экономия времени:** Не нужно угадывать формат нового файла
2. **Единообразие:** Все парсеры используют одинаковый подход
3. **Надёжность:** Проверенный метод парсинга работает для всех типов
4. **Документация:** Single Source of Truth в [EngMod4T Overview](engmod4t-overview.md)

---

## 🏗️ Архитектура парсеров

### Структура папок

```
backend/src/parsers/
├── index.js                    # Единый API, регистрация парсеров
├── ParserRegistry.js           # Registry pattern - управление парсерами
├── common/                     # Общие утилиты для всех парсеров
│   ├── calculationMarker.js    # Парсинг $ маркеров
│   └── formatDetector.js       # Автоопределение формата файла
└── formats/                    # Парсеры для конкретных форматов
    ├── detParser.js            # .det формат (24 параметра)
    └── pouParser.js            # .pou формат (71 параметр)
```

### Компоненты системы

#### 1. ParserRegistry (Реестр парсеров)

**Назначение:** Централизованное управление парсерами

```javascript
// backend/src/parsers/ParserRegistry.js
class ParserRegistry {
  constructor() {
    this.parsers = new Map();
  }

  // Регистрация парсера
  register(format, ParserClass) {
    this.parsers.set(format, ParserClass);
  }

  // Получение парсера
  getParser(format) {
    return new (this.parsers.get(format))();
  }

  // Проверка поддержки формата
  hasParser(format) {
    return this.parsers.has(format);
  }
}

export const globalRegistry = new ParserRegistry();
```

#### 2. Format Detector (Определение формата)

**Назначение:** Автоматическое определение формата файла

```javascript
// backend/src/parsers/common/formatDetector.js
export function detectFormat(filePath, firstLine) {
  // 1. Проверка по расширению
  if (filePath.endsWith('.det')) return 'det';
  if (filePath.endsWith('.pou')) return 'pou';

  // 2. Проверка по содержимому (metadata fields)
  const parts = firstLine.split(/\s+/).filter(Boolean);
  if (parts.length === 2) return 'det';  // .det: 2 поля
  if (parts.length >= 5) return 'pou';   // .pou: 5 полей

  throw new Error('Неизвестный формат файла');
}
```

#### 3. Common Utilities (Общие утилиты)

**calculationMarker.js** - Универсальный парсинг $ маркеров:

```javascript
// backend/src/parsers/common/calculationMarker.js
export function parseCalculationMarker(line) {
  const cleaned = cleanLine(line);
  const fullId = cleaned.trim();         // "$3.1 R 0.86"
  const userInputName = fullId.substring(1).trim(); // "3.1 R 0.86"

  return {
    id: fullId,              // Для API (с $)
    name: userInputName      // Для UI (без $)
  };
}
```

#### 4. Unified API (Единый API)

**index.js** - Точка входа для всех парсеров:

```javascript
// backend/src/parsers/index.js
import { globalRegistry } from './ParserRegistry.js';
import { DetParser } from './formats/detParser.js';
import { PouParser } from './formats/pouParser.js';

// Регистрируем парсеры при импорте
globalRegistry.register('det', DetParser);
globalRegistry.register('pou', PouParser);

export async function parseEngineFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const firstLine = content.split('\n')[0];

  const format = detectFormat(filePath, firstLine);
  const parser = globalRegistry.getParser(format);

  return await parser.parse(filePath);
}
```

---

## 📋 Единый JSON формат (целевой)

Все парсеры должны возвращать данные в этом формате:

```json
{
  "fileName": "BMW M42.det",
  "format": "det",
  "metadata": {
    "numCylinders": 4,
    "engineType": "NATUR"
  },
  "columnHeaders": [
    "RPM", "P-Av", "Torque", "PurCyl(1)", ...
  ],
  "calculations": [
    {
      "id": "$1",
      "name": "1",
      "dataPoints": [
        {
          "RPM": 1000,
          "P-Av": 15.5,
          "Torque": 123.45,
          "PurCyl": [0.85, 0.86, 0.87, 0.88],
          "TCylMax": [450, 452, 448, 451],
          "PCylMax": [45.2, 45.5, 45.1, 45.3],
          "TUbMax": [680, 685, 678, 682],
          "Deto": [0, 0, 0, 0],
          "Convergence": 0.0001
        }
      ]
    }
  ]
}
```

**Обязательные поля:**
- `fileName` - имя исходного файла
- `format` - формат файла ('det', 'pou', и т.д.)
- `metadata` - метаданные двигателя (cylinders, engineType, etc.)
- `columnHeaders` - заголовки колонок
- `calculations` - массив расчётов
  - `id` - уникальный идентификатор расчёта (с $)
  - `name` - отображаемое имя (без $)
  - `dataPoints` - массив точек данных

**Требования к dataPoints:**
- Базовые параметры: `RPM`, `P-Av`, `Torque`
- Дополнительные параметры: зависят от формата
- Массивы по цилиндрам: длина = `metadata.numCylinders`

---

## 🔧 Шаг 1: Изучить формат файла

### 1.1. Получить тестовые файлы

Попроси разработчика предоставить 2-3 примера файлов нового формата.

**Сохранить в:**
```
test-data/
├── example1.xyz  # Ваше расширение
├── example2.xyz
└── example3.xyz
```

### 1.2. Проанализировать структуру

**Вопросы для анализа:**
- Какое расширение файла? (`.xyz`)
- Текстовый или бинарный формат?
- Разделители? (табуляция, запятые, пробелы)
- Есть ли заголовок?
- Как обозначаются метаданные?
- Как организованы расчёты? (маркеры, секции)
- Сколько параметров в строке данных?
- Какие параметры присутствуют?
- Есть ли массивы по цилиндрам?

**Пример анализа (.det vs .pou):**

| Aspect | .det Format | .pou Format |
|--------|-------------|-------------|
| Расширение | `.det` | `.pou` |
| Формат | Текстовый, пробелы | Текстовый, пробелы |
| Строка 1 | Метаданные (2 поля) | Метаданные (5 полей) |
| Строка 2 | Заголовки (24 параметра) | Заголовки (71 параметр) |
| Строка 3+ | Маркеры $ + данные | Маркеры $ + данные |
| Параметры | 24 | 71 |
| Особенности | Служебная колонка →, массивы PCylMax/TCylMax/Deto | Служебная колонка →, много массивов (Power, IMEP, BMEP, etc.) |

### 1.3. Создать документацию формата

Создай файл `docs/file-formats/xyz-format.md`:

```markdown
# .xyz File Format Specification

**Version:** 1.0
**Date:** YYYY-MM-DD

## Overview

[Краткое описание формата]

## File Structure

Line 1: Metadata
Line 2: Column headers
Line 3+: Calculation markers ($) and data

## Metadata

Format: <Field1> <Field2> ...

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| Field1 | type | description | value |

## Parameters

[Описание всех параметров с единицами измерения]

## Example

[Реальный пример из test-data]
```

**Примеры:** [det-format.md](file-formats/det-format.md), [pou-format.md](file-formats/pou-format.md)

---

## 💻 Шаг 2: Создать парсер

### 2.1. Создать файл парсера

```bash
touch backend/src/parsers/formats/xyzParser.js
```

### 2.2. Структура парсера (шаблон)

```javascript
/**
 * Парсер для .xyz файлов двигателей
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';
import {
  cleanLine,
  parseCalculationMarker,
  isCalculationMarker
} from '../common/calculationMarker.js';

class XyzParser {
  /**
   * Парсит метаданные из первой строки .xyz файла
   * @param {string} line - Первая строка файла
   * @returns {Object} - Метаданные
   */
  parseMetadata(line) {
    const cleaned = cleanLine(line);
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length < 2) {
      throw new Error('Некорректный формат метаданных');
    }

    return {
      numCylinders: parseInt(parts[0], 10),
      engineType: parts[1],
      // ... другие поля специфичные для формата
    };
  }

  /**
   * Парсит заголовки колонок из второй строки .xyz файла
   * @param {string} line - Вторая строка файла
   * @returns {string[]} - Массив заголовков
   */
  parseColumnHeaders(line) {
    const cleaned = cleanLine(line);
    const headers = cleaned.split(/\s+/).filter(Boolean);
    return headers;
  }

  /**
   * Парсит одну строку данных из .xyz файла
   * @param {string} line - Строка с данными
   * @param {string[]} headers - Заголовки колонок
   * @param {number} numCylinders - Количество цилиндров
   * @returns {Object|null} - Объект DataPoint или null
   */
  parseDataLine(line, headers, numCylinders) {
    const cleaned = cleanLine(line);

    // Если строка пустая или это маркер расчёта
    if (!cleaned || cleaned.startsWith('$')) {
      return null;
    }

    // Разбиваем по пробелам
    const values = cleaned.split(/\s+/).filter(Boolean);

    // Проверяем соответствие количества значений
    if (values.length !== headers.length) {
      console.warn(
        `[XyzParser] Несоответствие: ${values.length} значений, ${headers.length} заголовков`
      );
    }

    // Создаём объект DataPoint
    const dataPoint = {
      RPM: parseFloat(values[0]),
      'P-Av': parseFloat(values[1]),
      Torque: parseFloat(values[2]),
      // ... остальные параметры специфичные для формата
    };

    // Если есть массивы по цилиндрам:
    let idx = 3; // После базовых параметров

    // Пример: парсинг массива Power(1-N)
    dataPoint.Power = [];
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Power.push(parseFloat(values[idx++]));
    }

    return dataPoint;
  }

  /**
   * Парсит .xyz файл и возвращает структурированные данные
   * @param {string} filePath - Путь к .xyz файлу
   * @returns {Promise<Object>} - Объект EngineProject
   */
  async parse(filePath) {
    try {
      // Читаем файл
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      if (lines.length < 3) {
        throw new Error('Файл слишком короткий');
      }

      // Парсим метаданные (строка 1)
      const metadata = this.parseMetadata(lines[0]);

      // Парсим заголовки (строка 2)
      const columnHeaders = this.parseColumnHeaders(lines[1]);

      // Парсим расчёты (строка 3+)
      const calculations = [];
      let currentCalculation = null;

      for (let i = 2; i < lines.length; i++) {
        const line = lines[i];

        // Пропускаем пустые строки
        if (!line.trim()) {
          continue;
        }

        // Проверяем, является ли строка маркером расчёта
        if (isCalculationMarker(line)) {
          // Сохраняем предыдущий расчёт (если был)
          if (currentCalculation && currentCalculation.dataPoints.length > 0) {
            calculations.push(currentCalculation);
          }

          // Начинаем новый расчёт
          const { id, name } = parseCalculationMarker(line);
          currentCalculation = {
            id,    // С символом $
            name,  // Без символа $
            dataPoints: []
          };
        } else if (currentCalculation) {
          // Парсим строку данных
          const dataPoint = this.parseDataLine(
            line,
            columnHeaders,
            metadata.numCylinders
          );

          if (dataPoint) {
            currentCalculation.dataPoints.push(dataPoint);
          }
        }
      }

      // Добавляем последний расчёт
      if (currentCalculation && currentCalculation.dataPoints.length > 0) {
        calculations.push(currentCalculation);
      }

      // Формируем результат в едином формате
      const result = {
        fileName: basename(filePath),
        format: 'xyz',              // ← Формат файла
        metadata,
        columnHeaders,
        calculations
      };

      return result;
    } catch (error) {
      console.error(`[XyzParser] Ошибка при парсинге файла ${filePath}:`, error);
      throw error;
    }
  }
}

export { XyzParser };
```

### 2.3. Важные моменты

**✅ DO:**
- Использовать `cleanLine()` из `calculationMarker.js` для удаления служебных символов
- Использовать `isCalculationMarker()` и `parseCalculationMarker()` для обработки $ маркеров
- Валидировать входные данные
- Обрабатывать edge cases (пустые строки, неполные данные)
- Логировать ошибки с деталями
- Возвращать `format` поле в результате
- Бросать исключения при критических ошибках
- Комментировать сложную логику

**❌ DON'T:**
- Дублировать логику парсинга $ маркеров (используй common utilities)
- Игнорировать ошибки
- Предполагать что данные всегда корректны
- Хардкодить количество цилиндров (использовать `metadata.numCylinders`)
- Забывать про `format` поле в результате

### 2.4. Продвинутые техники

#### Parameter Mapping (Унификация названий параметров)

**Проблема:** Разные форматы могут использовать разные названия для одного параметра.

**Пример:** `.pou` файлы используют `Purc`, а `.det` файлы используют `PurCyl` для одного и того же параметра "Mixture Purity".

**Решение:** Создать маппинг для унификации названий к каноническому виду.

```javascript
/**
 * Маппинг параметров: .pou файл → каноническое название
 */
const PARAMETER_MAPPING = {
  'Purc': 'PurCyl',  // .pou использует "Purc", .det использует "PurCyl"
  // Добавляйте сюда другие маппинги при необходимости
};

/**
 * Применяет маппинг к названию параметра
 */
function mapParameterName(paramName) {
  // Убираем номера цилиндров: "Purc( 1)" → "Purc"
  const baseName = paramName.replace(/\(\s*\d+\s*\)/, '').trim();

  // Применяем маппинг
  const mappedName = PARAMETER_MAPPING[baseName] || baseName;

  // Восстанавливаем номер цилиндра: "Purc" → "PurCyl( 1)"
  const cylinderMatch = paramName.match(/\(\s*\d+\s*\)/);
  if (cylinderMatch) {
    return mappedName + cylinderMatch[0];
  }

  return mappedName;
}

// В методе parseColumnHeaders:
parseColumnHeaders(line) {
  const cleaned = cleanLine(line);
  const headers = cleaned.split(/\s+/).filter(Boolean);

  // Применяем маппинг к каждому заголовку
  const mappedHeaders = headers.map(header => mapParameterName(header));

  return mappedHeaders;
}
```

**Результат:** Frontend получает единые названия параметров, независимо от формата файла.

#### Temperature Units (Единицы температуры)

**Важно:** Все температурные параметры хранятся в **°C (Celsius)**, не в Kelvin!

```javascript
// ✅ ПРАВИЛЬНО - данные уже в °C
dataPoint.TCylMax = [450, 452, 448, 451];  // °C
dataPoint.TUbMax = [680, 685, 678, 682];   // °C
dataPoint.TexAv = 584.6;                   // °C

// ❌ НЕПРАВИЛЬНО - НЕ конвертировать K → °C!
// dataPoint.TCylMax = tempK - 273.15;  // Не делайте так!
```

**Параметры с температурой:**
- `TCylMax` - Maximum cylinder temperature (°C)
- `TUbMax` - Maximum unburned mixture temperature (°C)
- `TexAv` - Average exhaust temperature (°C)
- `TC-Av` - Average cylinder temperature (°C)

Frontend выполняет конверсию °C ↔ °F для American units через `unitsConversion.ts`.

#### Parameter Metadata (Метаданные параметров)

**Single Source of Truth:** `frontend/src/config/parameters.ts`

Этот файл содержит официальные метаданные для всех 29 параметров:
- `name` - Каноническое название (RPM, P-Av, PurCyl, etc.)
- `displayName` - Человеко-читаемое название (Engine Speed, Average Power, etc.)
- `unit` - Единица измерения SI (об/мин, kW, N·m, bar, °C, etc.)
- `conversionType` - Тип конверсии (power, torque, pressure, temperature, none)
- `category` - Категория (global, per-cylinder, vibe-model)
- `formats` - Доступность (['det'], ['pou'], ['det', 'pou'], etc.)
- `chartable` - Можно ли отобразить на графике
- `brief` - Краткое описание (для tooltips)
- `description` - Полное описание (для Help страницы)

**При добавлении нового формата:** Если вводите новые параметры, добавьте их в `parameters.ts` с полной документацией.

---

## 🔌 Шаг 3: Зарегистрировать парсер

### 3.1. Обновить parsers/index.js

```javascript
// backend/src/parsers/index.js
import { globalRegistry } from './ParserRegistry.js';
import { DetParser } from './formats/detParser.js';
import { PouParser } from './formats/pouParser.js';
import { XyzParser } from './formats/xyzParser.js'; // ← Импортируем новый парсер

function registerParsers() {
  try {
    globalRegistry.register('det', DetParser);
    globalRegistry.register('pou', PouParser);
    globalRegistry.register('xyz', XyzParser); // ← Регистрируем
  } catch (error) {
    if (!error.message.includes('уже зарегистрирован')) {
      throw error;
    }
  }
}

registerParsers();

// ... остальной код остаётся без изменений
```

### 3.2. Обновить formatDetector.js

```javascript
// backend/src/parsers/common/formatDetector.js

function detectFormatByExtension(filePath) {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith('.det')) return 'det';
  if (lowerPath.endsWith('.pou')) return 'pou';
  if (lowerPath.endsWith('.xyz')) return 'xyz'; // ← Добавляем

  return null;
}

function detectFormatByContent(firstLine) {
  const parts = firstLine.split(/\s+/).filter(Boolean);

  if (parts.length === 2) return 'det';
  if (parts.length >= 5) return 'pou';
  if (parts.length === X) return 'xyz'; // ← Добавляем логику для .xyz

  return null;
}
```

### 3.3. Обновить TypeScript типы

```typescript
// backend/src/types/engineData.ts

// 1. Добавить метаданные
export interface XyzMetadata {
  numCylinders: number;
  engineType: string;
  // ... поля специфичные для .xyz
}

export type EngineMetadata = DetMetadata | PouMetadata | XyzMetadata;

// 2. Добавить DataPoint
export interface XyzDataPoint {
  RPM: number;
  'P-Av': number;
  Torque: number;
  // ... параметры специфичные для .xyz
}

export type DataPoint = DetDataPoint | PouDataPoint | XyzDataPoint;

// 3. Обновить формат
export interface EngineProject {
  fileName: string;
  format: 'det' | 'pou' | 'xyz'; // ← Добавить 'xyz'
  metadata: EngineMetadata;
  columnHeaders: string[];
  calculations: Calculation[];
}
```

### 3.4. Обновить fileScanner.js

```javascript
// backend/src/services/fileScanner.js

// Обновить расширения по умолчанию
export async function scanDirectory(
  directoryPath,
  extensions = ['.det', '.pou', '.xyz'] // ← Добавить '.xyz'
) {
  // ... остальной код
}

export async function scanProjects(
  directoryPath,
  extensions = ['.det', '.pou', '.xyz'], // ← Добавить '.xyz'
  maxFileSize = 0
) {
  // ... остальной код
}

// В функции scanProjects, в fallback для ошибок парсинга:
return {
  // ... existing fields
  format: file.name.endsWith('.pou')
    ? 'pou'
    : file.name.endsWith('.xyz')
      ? 'xyz'
      : 'det', // ← Обновить определение формата
  // ... rest of fields
};
```

---

## ✅ Шаг 4: Тестирование

### 4.1. Подготовка тестовых данных

```bash
# Скопировать тестовые файлы
cp /path/to/examples/*.xyz test-data/
```

### 4.2. Запуск backend

```bash
./scripts/start.sh
```

**Проверить логи:**
```
[ParserRegistry] Зарегистрировано парсеров: 3
  - det: DetParser
  - pou: PouParser
  - xyz: XyzParser
```

### 4.3. Тестирование API

**1. Список проектов:**
```bash
curl http://localhost:3000/api/projects | jq
```

**Ожидаемый результат:**
```json
{
  "projects": [
    {
      "id": "example-xyz",
      "fileName": "example.xyz",
      "format": "xyz",
      "engineType": "NATUR",
      "numCylinders": 4,
      "calculationsCount": 2
    }
  ]
}
```

**2. Детали проекта:**
```bash
curl http://localhost:3000/api/project/example-xyz | jq
```

**Ожидаемый результат:**
```json
{
  "project": {
    "fileName": "example.xyz",
    "format": "xyz",
    "metadata": { ... },
    "calculations": [ ... ]
  }
}
```

### 4.4. Тестирование в UI

1. Открыть http://localhost:5173
2. Проверить:
   - [ ] Файл .xyz появился в списке проектов
   - [ ] Открывается без ошибок
   - [ ] Графики отображаются корректно
   - [ ] Таблица показывает данные
   - [ ] Badge формата показывает "xyz"

### 4.5. Проверка производительности

**Целевые показатели:**
- Файл <1 MB: <100ms
- Файл 1-5 MB: <300ms
- Файл 5-10 MB: <800ms

**Проверить в логах backend:**
```
[ParserAPI] Парсинг файла example.xyz занял: 85ms
```

---

## 📚 Шаг 5: Документация

### 5.1. Создать спецификацию формата

Создай детальную документацию:
```
docs/file-formats/xyz-format.md
```

**См. примеры:**
- [det-format.md](file-formats/det-format.md)
- [pou-format.md](file-formats/pou-format.md)

### 5.2. Создать пример файла

```bash
# Создать аннотированный пример
touch docs/file-formats/examples/sample.xyz
```

### 5.3. Обновить сравнительную таблицу

Добавить в [comparison.md](file-formats/comparison.md) раздел с .xyz форматом.

### 5.4. Обновить README проекта

```markdown
## Supported File Formats

| Format | Extension | Parameters | Status |
|--------|-----------|------------|--------|
| DET | `.det` | 24 | ✅ Supported |
| POU | `.pou` | 71 | ✅ Supported |
| XYZ | `.xyz` | XX | ✅ Supported |
```

### 5.5. Обновить CHANGELOG

```markdown
## [Unreleased]

### Added
- Support for .xyz file format (XX parameters)
- Parser: XyzParser implementing Registry pattern
- Documentation: xyz-format.md specification
- Example file: docs/file-formats/examples/sample.xyz
- TypeScript types: XyzMetadata, XyzDataPoint

### Changed
- Updated formatDetector.js with .xyz detection
- Extended fileScanner.js default extensions
- Updated ParserRegistry with xyz parser
```

### 5.6. Обновить file-formats/README.md

```markdown
| Формат | Расширение | Параметры | Парсер | Документация | Статус |
|--------|-----------|-----------|--------|--------------|--------|
| DET | `.det` | 24 | `detParser.js` | [det-format.md](det-format.md) | ✅ Реализовано |
| POU | `.pou` | 71 | `pouParser.js` | [pou-format.md](pou-format.md) | ✅ Реализовано |
| XYZ | `.xyz` | XX | `xyzParser.js` | [xyz-format.md](xyz-format.md) | ✅ Реализовано |
```

---

## 🔍 Checklist: Добавление нового формата

### Подготовка
- [ ] Получил тестовые файлы (2-3 примера)
- [ ] Сохранил в `test-data/`
- [ ] Проанализировал структуру файла
- [ ] Изучил особенности формата (edge cases)
- [ ] Определил количество параметров
- [ ] Определил структуру метаданных

### Код
- [ ] Создал парсер: `backend/src/parsers/formats/xyzParser.js`
- [ ] Реализовал класс `XyzParser` с методом `parse()`
- [ ] Использовал common utilities (`cleanLine`, `parseCalculationMarker`)
- [ ] Возвращает данные в едином JSON формате
- [ ] Включает поле `format: 'xyz'`
- [ ] Добавлены JSDoc комментарии
- [ ] Обработаны ошибки и edge cases

### Интеграция
- [ ] Зарегистрировал парсер в `parsers/index.js`
- [ ] Обновил `formatDetector.js` (extension + content detection)
- [ ] Обновил TypeScript типы (`engineData.ts`)
- [ ] Обновил `fileScanner.js` (добавил расширение в defaults)
- [ ] Парсер корректно вызывается через Registry

### Тестирование
- [ ] Backend запускается без ошибок
- [ ] Парсер регистрируется в логах
- [ ] API `/projects` возвращает .xyz файлы
- [ ] API `/project/<id>` парсит .xyz корректно
- [ ] UI: файл появляется в списке
- [ ] UI: открывается без ошибок
- [ ] UI: графики отображаются
- [ ] UI: таблица работает
- [ ] UI: badge формата показывает правильный формат
- [ ] Проверил производительность (время парсинга)

### Документация
- [ ] Создал `docs/file-formats/xyz-format.md`
- [ ] Создал пример: `docs/file-formats/examples/sample.xyz`
- [ ] Обновил `docs/file-formats/README.md`
- [ ] Обновил `docs/file-formats/comparison.md`
- [ ] Обновил `README.md` (Supported Formats)
- [ ] Обновил `CHANGELOG.md` ([Unreleased] секция)

### Финализация
- [ ] Сделал коммит с понятным сообщением
- [ ] Протестировал в Chrome и Safari
- [ ] Обновил roadmap.md если нужно

---

## 🎓 Примеры реализации

### Пример 1: DetParser (24 параметра)

**Файл:** [backend/src/parsers/formats/detParser.js](../backend/src/parsers/formats/detParser.js)

**Особенности:**
- Простая структура метаданных (2 поля)
- 5 массивов по цилиндрам
- Параметр Convergence в конце

### Пример 2: PouParser (71 параметр)

**Файл:** [backend/src/parsers/formats/pouParser.js](../backend/src/parsers/formats/pouParser.js)

**Особенности:**
- Расширенные метаданные (5 полей)
- 16 массивов по цилиндрам
- Последовательное извлечение через индекс
- Vibe параметры в конце
- **Parameter Mapping:** `Purc` → `PurCyl` унификация
- **Temperature Data:** Все температуры в °C (не Kelvin)

### Сравнение подходов

| Aspect | DetParser | PouParser |
|--------|-----------|-----------|
| Метаданные | 2 поля | 5 полей |
| Параметры | 24 | 71 |
| Массивы | 5 | 16 |
| Индексация | Простая | Последовательная (idx++) |
| Сложность | Низкая | Средняя |

---

## 🔗 Ссылки

### Документация форматов
- [.det Format Specification](file-formats/det-format.md) - 24 параметра
- [.pou Format Specification](file-formats/pou-format.md) - 71 параметр
- [Format Comparison](file-formats/comparison.md) - Сравнение форматов

### Исходный код
- [DetParser](../backend/src/parsers/formats/detParser.js) - Пример простого парсера
- [PouParser](../backend/src/parsers/formats/pouParser.js) - Пример сложного парсера
- [ParserRegistry](../backend/src/parsers/ParserRegistry.js) - Registry pattern
- [Format Detector](../backend/src/parsers/common/formatDetector.js) - Автоопределение
- [Calculation Marker](../backend/src/parsers/common/calculationMarker.js) - Парсинг $

### Документация проекта
- [README.md](../README.md) - Главная документация
- [Architecture](architecture.md) - Архитектура проекта
- [API Documentation](api.md) - REST API endpoints

---

## 🚀 Преимущества Registry Pattern

**1. Расширяемость:**
- Добавление нового формата не требует изменения существующего кода
- Просто создать парсер и зарегистрировать его

**2. Единообразие:**
- Все парсеры следуют одному интерфейсу
- Общие утилиты переиспользуются

**3. Автоматизация:**
- Формат определяется автоматически
- Правильный парсер выбирается через Registry

**4. Поддерживаемость:**
- Каждый парсер изолирован
- Легко тестировать и отлаживать

**5. Масштабируемость:**
- Легко добавлять новые форматы
- Нет необходимости в if/else цепочках

---

**Готово! Следуй этому руководству для каждого нового формата файлов.** 🚀
