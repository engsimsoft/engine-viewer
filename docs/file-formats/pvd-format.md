# PV-Diagram Format (.pvd)

**Версия:** 1.0
**Дата:** 7 ноября 2025
**Статус:** Phase 1.5 (между Phase 1 и Phase 2)

---

## 📋 Обзор

**PV-Diagram (.pvd)** - файл с данными для построения термодинамической диаграммы "давление-объём" (Pressure-Volume diagram) для каждого цилиндра двигателя.

**Назначение:**
- Термодинамический анализ рабочего цикла двигателя
- Визуализация изменения давления относительно объёма цилиндра
- Два режима отображения: Normal P-V, log P - log V

**Происхождение:** EngMod4T (Delphi 7) - Post4T visualization tool

**Расположение в roadmap:**
- **Phase 1:** .det/.pou парсинг и визуализация ✅
- **Phase 1.5:** PV-Diagram (.pvd) ⏳ ← **текущий документ**
- **Phase 2:** Trace files (~18 типов) ⏳

---

## 🎯 Характеристики формата

**Общие параметры:**
- **Формат:** Fixed-width ASCII text (как .det/.pou/.trace files)
- **Происхождение:** Delphi 7 `WriteLn(F, Format('%12.6f ...', [values]))`
- **Разделитель:** Множественные пробелы (не одиночные, не табы)
- **Парсинг:** `split(/\s+/)` - как все форматы EngMod4T
- **Первая колонка:** `Deg` - угол коленвала (crank angle), 0-720°
- **Кодировка:** ASCII
- **Naming convention:** `ProjectName_RPM.pvd` (например: `V8_2000.pvd`)

---

## 📐 Структура файла

### Общая схема

```
Строка 1:      RPM значение
Строка 2:      Конфигурация двигателя (NumCyl, NumTurbo, etc.)
Строка 3-15:   Метаданные системы (pipes, collectors, boxes)
Строка 16:     Заголовки колонок (Deg + N × 2 параметра)
Строка 17+:    Данные (720 строк, 0-720 градусов)
```

### Пример структуры (8-цилиндровый двигатель)

```
        2000      RPM
           8           0           1           0     NumCyl NumTurbo NumExPas NumSuper
          16      NumPipIn
           0      NumColIn
           0      NumBoxIn
          26      NumPipEx
           2      NumColEx
           0      NumBoxEx
           2      NumOutPipEx
          16      NumStepExH
          16      NumStepEx
           0      NumExSil
           0      NumExSilPlen
   320.0000       ITraceL
   10.00000       ETraceL
730.0  460.0  280.0  550.0  640.0  370.0  190.0  100.0
100.0  320.0  402.0  622.0   75.5   30.0
     Deg         Cylinder(1)     Cylinder(2)     Cylinder(3)     ...
    0.000000   561.663574     1.539665    61.333782     1.022993   ...
    1.000000   555.288574     1.563007    61.420597     1.009590   ...
    ...
  720.000000   ...
```

---

## 📊 Параметры данных

### Структура колонок

**Колонка 1:**
- `Deg` - угол коленвала (crank angle)
- Диапазон: 0.0 - 720.0 градусов
- Шаг: 1.0 градус
- Всего: 721 значение (0, 1, 2, ..., 720)

**Колонки 2+:**
Для каждого цилиндра **ДВА параметра** (Volume, Pressure):

| Cylinder | Колонка Volume | Колонка Pressure | Описание |
|----------|---------------|------------------|----------|
| Cylinder 1 | 2 | 3 | Объём и давление цилиндра 1 |
| Cylinder 2 | 4 | 5 | Объём и давление цилиндра 2 |
| Cylinder 3 | 6 | 7 | Объём и давление цилиндра 3 |
| ... | ... | ... | ... |
| Cylinder N | 2+(N-1)×2 | 3+(N-1)×2 | Объём и давление цилиндра N |

**Общее количество колонок:**
```
Total = 1 + (NumCylinders × 2)

Примеры:
- 4-цилиндровый: 1 + (4 × 2) = 9 колонок
- 6-цилиндровый: 1 + (6 × 2) = 13 колонок
- 8-цилиндровый: 1 + (8 × 2) = 17 колонок
```

### Параметры (2 × N цилиндров)

| # | Параметр | Единицы | Описание | Диапазон |
|---|----------|---------|----------|----------|
| 1 | **Volume** | cm³ | Объём цилиндра | Min volume (TDC) → Max volume (BDC) |
| 2 | **Pressure** | bar (абсолютное) | Давление в цилиндре | 0.5 → 100+ bar |

**Важные детали:**
- **Volume:** Абсолютное значение объёма цилиндра в см³
  - Минимум (TDC - Top Dead Center): Объём камеры сгорания
  - Максимум (BDC - Bottom Dead Center): Полный объём цилиндра

- **Pressure:** Абсолютное давление в барах
  - Атмосферное: ~1 bar
  - Впуск/выпуск: 0.5-2 bar
  - Сжатие: 10-40 bar
  - Сгорание: 40-100+ bar

---

## 🔬 Метаданные (строки 1-16)

### Строка 1: RPM

```
        2000      RPM
```

**Параметры:**
- Обороты двигателя в об/мин

### Строка 2: Конфигурация двигателя

```
           8           0           1           0     NumCyl NumTurbo NumExPas NumSuper
```

| Параметр | Описание |
|----------|----------|
| `NumCyl` | Количество цилиндров |
| `NumTurbo` | Количество турбонагнетателей (0 = NATUR) |
| `NumExPas` | Number of exhaust passages |
| `NumSuper` | Number of superchargers |

### Строки 3-14: Конфигурация системы

```
          16      NumPipIn        - Количество впускных труб
           0      NumColIn        - Количество впускных коллекторов
           0      NumBoxIn        - Количество впускных боксов
          26      NumPipEx        - Количество выпускных труб
           2      NumColEx        - Количество выпускных коллекторов
           0      NumBoxEx        - Количество выпускных боксов
           2      NumOutPipEx     - Количество выходных выпускных труб
          16      NumStepExH      - Number of exhaust steps (header)
          16      NumStepEx       - Number of exhaust steps
           0      NumExSil        - Number of exhaust silencers
           0      NumExSilPlen    - Number of exhaust silencer plenums
   320.0000       ITraceL         - Intake trace length
   10.00000       ETraceL         - Exhaust trace length
```

### Строка 15: Firing order / Ignition timing

```
730.0  460.0  280.0  550.0  640.0  370.0  190.0  100.0
```

**Назначение:** Порядок работы цилиндров или углы зажигания (TBD - требует уточнения)

### Строка 16: Заголовки колонок

```
     Deg         Cylinder(1)     Cylinder(2)     Cylinder(3)     ...
```

**Структура:**
- Первая колонка: `Deg`
- Далее: `Cylinder(1)`, `Cylinder(2)`, ..., `Cylinder(N)`
- Каждое `Cylinder(X)` занимает ДВЕ колонки данных: Volume, Pressure

---

## 📈 Graph Types

### 1. Normal P-V Diagram

**Назначение:** Классическая термодинамическая диаграмма

**Оси:**
- **X-axis:** Volume (cm³) - линейная шкала
- **Y-axis:** Pressure (bar) - линейная шкала

**Этапы цикла (видны на графике):**
1. **Впуск (Intake):** Давление низкое, объём увеличивается
2. **Сжатие (Compression):** Давление растёт, объём уменьшается
3. **Сгорание (Combustion):** Резкий скачок давления при ~TDC
4. **Расширение (Expansion):** Давление падает, объём увеличивается
5. **Выпуск (Exhaust):** Давление низкое, объём уменьшается

**Use case:**
- Анализ эффективности цикла
- Расчёт индикаторной работы (площадь под кривой)
- Сравнение циклов разных двигателей

### 2. Log P - Log V Diagram

**Назначение:** Логарифмическая диаграмма для анализа политропных процессов

**Оси:**
- **X-axis:** log(Volume) - логарифмическая шкала
- **Y-axis:** log(Pressure) - логарифмическая шкала

**Преимущества:**
- Линеаризация политропных процессов: P × V^n = const
- Определение показателя политропы n
- Анализ отклонений от идеального цикла

**Use case:**
- Термодинамический анализ
- Исследования сжатия/расширения
- Выявление утечек и потерь

---

## 🎨 UI Features (из Post4T)

### File Selection Dialog

- **Button:** "Add File" - открыть .pvd файл
- **List:** Selected files - список выбранных файлов
- Click на файл → открывается диалог выбора цилиндров

### Cylinder Selection Dialog

- Выбор crankcases (для многосекционных двигателей)
- Выбор цилиндров (checkbox list: Cylinder 1, 2, 3, ...)
- Поддержка multiple selection

### Graph Options

**X-axis value:**
- Radio button: "Displacement volume" (объём цилиндра)
- Другие варианты: TBD

**Graph mode:**
- Radio button: "Normal P-V"
- Radio button: "log P - log V"

---

## 💻 Parser Architecture

### Parser Structure

```javascript
// backend/src/parsers/formats/pvdParser.js

export function parsePVD(content) {
  const lines = content.trim().split('\n');

  // Line 1: RPM
  const rpm = parseFloat(lines[0].trim().split(/\s+/)[0]);

  // Line 2: Configuration
  const config = lines[1].trim().split(/\s+/);
  const numCylinders = parseInt(config[0]);
  const numTurbo = parseInt(config[1]);

  // Lines 3-15: System configuration (skip for now)

  // Line 16: Headers
  const headers = lines[15].trim().split(/\s+/);
  // ['Deg', 'Cylinder(1)', 'Cylinder(2)', ...]

  // Line 17+: Data (720 rows)
  const data = [];
  for (let i = 16; i < lines.length; i++) {
    const values = lines[i].trim().split(/\s+/);
    const deg = parseFloat(values[0]);

    const cylinders = [];
    for (let c = 0; c < numCylinders; c++) {
      cylinders.push({
        volume: parseFloat(values[1 + c * 2]),      // Volume
        pressure: parseFloat(values[1 + c * 2 + 1]) // Pressure
      });
    }

    data.push({ deg, cylinders });
  }

  return {
    metadata: {
      rpm,
      cylinders: numCylinders,
      engineType: numTurbo > 0 ? 'TURBO' : 'NATUR'
    },
    data
  };
}
```

### Output JSON Format

```json
{
  "metadata": {
    "rpm": 2000,
    "cylinders": 8,
    "engineType": "NATUR"
  },
  "data": [
    {
      "deg": 0.0,
      "cylinders": [
        { "volume": 561.66, "pressure": 1.54 },
        { "volume": 61.33, "pressure": 1.02 },
        { "volume": 948.18, "pressure": 0.87 },
        ...
      ]
    },
    {
      "deg": 1.0,
      "cylinders": [...]
    },
    ...
  ]
}
```

---

## 📊 ECharts Implementation

### Normal P-V Chart

```javascript
// frontend/src/components/charts/PVDiagramChart.jsx

export function createPVChartOptions(pvdData, selectedCylinders) {
  const series = selectedCylinders.map(cylIndex => {
    const data = pvdData.data.map(row => [
      row.cylinders[cylIndex].volume,    // X: Volume
      row.cylinders[cylIndex].pressure   // Y: Pressure
    ]);

    return {
      name: `Cylinder ${cylIndex + 1}`,
      type: 'line',
      data,
      smooth: false,
      showSymbol: false
    };
  });

  return {
    title: {
      text: `PV-Diagram - ${pvdData.metadata.rpm} RPM`
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const [volume, pressure] = params[0].data;
        return `Volume: ${volume.toFixed(2)} cm³<br/>Pressure: ${pressure.toFixed(2)} bar`;
      }
    },
    xAxis: {
      type: 'value',
      name: 'Volume (cm³)',
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      type: 'value',
      name: 'Pressure (bar)',
      min: 0
    },
    series
  };
}
```

### Log P - Log V Chart

```javascript
export function createLogPVChartOptions(pvdData, selectedCylinders) {
  // Same series structure, but logarithmic axes

  return {
    ...commonOptions,
    xAxis: {
      type: 'log',          // Logarithmic X-axis
      name: 'log(Volume)',
      logBase: 10
    },
    yAxis: {
      type: 'log',          // Logarithmic Y-axis
      name: 'log(Pressure)',
      logBase: 10
    }
  };
}
```

---

## 🎯 Phase 1.5 Implementation Roadmap

### Step 1: Parser Development
- [ ] Create `backend/src/parsers/formats/pvdParser.js`
- [ ] Implement metadata parsing (lines 1-16)
- [ ] Implement data parsing (line 17+)
- [ ] Register parser in Parser Registry
- [ ] Add unit tests with V8_2000.pvd example

### Step 2: API Integration
- [ ] Add .pvd file detection in `detectionUtils.js`
- [ ] Update `/api/files/:id` endpoint to support .pvd
- [ ] Test API response with V8 project files

### Step 3: Frontend Components
- [ ] Create `PVDiagramChart.jsx` component
- [ ] Implement Normal P-V chart with ECharts
- [ ] Implement log P - log V chart with ECharts
- [ ] Add cylinder selection UI (checkboxes)
- [ ] Add chart mode toggle (Normal / Log-Log)

### Step 4: UI Integration
- [ ] Add PV-Diagram tab/section to Results page
- [ ] Integrate with existing file selection
- [ ] Add chart export functionality (PNG, SVG)
- [ ] Mobile responsive design

### Step 5: Testing & Polish
- [ ] Test with all V8 .pvd files (2000, 4000, 4500, 7000, 8000 RPM)
- [ ] Test with 4-cylinder, 6-cylinder projects
- [ ] Performance optimization (720 data points × N cylinders)
- [ ] Documentation update

---

## 📚 References

### EngMod4T Suite Documentation
- **[docs/engmod4t-suite/post4t-overview.md](../engmod4t-suite/post4t-overview.md)** - Post4T visualization tool overview
- **[_personal/Post4THelp-chapters/12-PV-Diagrams.md](_personal/Post4THelp-chapters/12-PV-Diagrams.md)** - Original Post4T Help chapter

### Related Formats
- **[det-format.md](det-format.md)** - Basic results (.det)
- **[pou-format.md](pou-format.md)** - Extended results (.pou)
- **[trace-files.md](trace-files.md)** - Trace files overview (~18 types, Phase 2)

### Architecture
- **[docs/architecture.md](../architecture.md)** - Full project architecture
- **[docs/decisions/002-pou-file-format.md](../decisions/002-pou-file-format.md)** - Parser Registry ADR

---

## ✅ Completion Criteria

Phase 1.5 завершён когда:
- [ ] .pvd parser работает с 4/6/8-цилиндровыми двигателями
- [ ] Normal P-V график отображается корректно
- [ ] Log P - Log V график отображается корректно
- [ ] Можно выбирать цилиндры для отображения
- [ ] Работает с реальными файлами из test-data/V8/
- [ ] Документация обновлена
- [ ] Unit tests написаны и проходят

---

**Следующий этап:** Phase 2 - Trace Files (~18 типов, полная документация в [trace-files.md](trace-files.md))
