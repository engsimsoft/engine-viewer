# Проблема: Неправильные углы пикового давления в PV-Diagrams

**Дата:** 11.11.2025
**Статус:** Отложено для исправления парсинга .pvd файлов

---

## Симптомы

При открытии разных проектов в PV-Diagrams углы пикового давления **физически неправильные**:

- **V6 (vq35de-itb)**: ~133-135° (до TDC)
- **I4 (gimura)**: ~260-263° (слишком далеко после TDC)
- **V8 (3uz-fe)**: ~107-108° (до TDC)

**Ожидаемое:** Пик давления должен быть **365-390°** (5-30° ATDC после TDC = 360°) для правильной фазы сжатия.

---

## Корневая причина

### Текущая реализация (неправильная)

```javascript
// backend/src/routes/data.js:647-653
for (const dataPoint of pvdData.data) {
  const cyl1 = dataPoint.cylinders[0]; // ← ОШИБКА: берем cylinders[0]
  if (cyl1.pressure > peakPressure) {
    peakPressure = cyl1.pressure;
    peakPressureAngle = dataPoint.deg;
  }
}
```

**Проблема:** `cylinders[0]` - это НЕ "первый цилиндр по порядку работы", а просто первый элемент массива. Для разных двигателей это может быть цилиндр с TDC = 730°, 460°, 280° и т.д.

### Пример из реального .pvd файла (V8)

```
Строка 15 (firing order):
730.0  460.0  280.0  550.0  640.0  370.0  190.0  100.0
       ↑      ↑      ↑      ↑      ↑      ↑      ↑      ↑
     Cyl 1  Cyl 2  Cyl 3  Cyl 4  Cyl 5  Cyl 6  Cyl 7  Cyl 8
     (TDC)  (TDC)  (TDC)  (TDC)  (TDC)  (TDC)  (TDC)  (TDC)
```

- **Cylinder 1** (cylinders[0]): TDC = 730° → пик давления будет при ~745° (неправильно)
- **Cylinder 6** (cylinders[5]): TDC = 370° → пик давления будет при ~375° (ПРАВИЛЬНО!)

---

## Попытка исправления (откатили)

Попытался сделать автоматический выбор правильного цилиндра:

```javascript
// Анализ всех цилиндров
const cylinderPeaks = pvdData.data[0].cylinders.map(() => ({ pressure: 0, angle: 0 }));

for (const dataPoint of pvdData.data) {
  dataPoint.cylinders.forEach((cyl, idx) => {
    if (cyl.pressure > cylinderPeaks[idx].pressure) {
      cylinderPeaks[idx].pressure = cyl.pressure;
      cylinderPeaks[idx].angle = dataPoint.deg;
    }
  });
}

// Найти цилиндр с пиком в диапазоне 365-390°
for (let i = 0; i < cylinderPeaks.length; i++) {
  if (cylinderPeaks[i].angle >= 365 && cylinderPeaks[i].angle <= 390) {
    correctCylinderIndex = i;
    peakPressure = cylinderPeaks[i].pressure;
    peakPressureAngle = cylinderPeaks[i].angle;
    break;
  }
}
```

**Откатили, потому что:**
1. Риск сломать production приложение
2. Нужно сначала исправить парсинг .pvd (корневая причина)
3. Временное решение маскирует реальную проблему

---

## Реальная проблема: Парсинг .pvd файлов

Парсер неправильно интерпретирует структуру данных. Нужно проверить:

1. **Firing order (строка 15-16):** Правильно ли парсятся углы TDC для каждого цилиндра?
2. **Порядок цилиндров в данных:** Соответствует ли порядок в `dataPoint.cylinders[]` физическим цилиндрам?
3. **Соответствие между firing order и данными:** cylinders[0] = физический цилиндр с TDC из firing order[0]?

### Файл для проверки
`backend/src/parsers/formats/pvdParser.js` (строки 70-76):

```javascript
// Строки 16-17: Firing order / Ignition timing (2 строки для V8)
const firingOrderLine1 = cleanLine(lines[15]);
const firingOrderLine2 = cleanLine(lines[16]);
const firingOrder = [
  ...firingOrderLine1.split(/\s+/).filter(Boolean).map(parseFloat),
  ...firingOrderLine2.split(/\s+/).filter(Boolean).map(parseFloat)
];
```

**Вопрос:** `firingOrder` содержит углы TDC, но как они связаны с порядком данных в `cylinders[]`?

---

## Решение (TODO)

1. **Шаг 1:** Исправить парсер .pvd - установить правильное соответствие между firing order и cylinders[]
2. **Шаг 2:** Убедиться, что cylinders[0] всегда соответствует цилиндру с TDC ≈ 360°
3. **Шаг 3:** Добавить валидацию - проверять, что пик давления в диапазоне 365-390°, иначе ошибка парсинга

---

## Текущее состояние кода

**Откачено к версии:**
- Backend: `cylinders[0]` везде (простой вариант)
- Frontend: `cylinders[0]` везде
- Бейджи Max/Min работают, но углы могут быть неправильными

**Результат:** Приложение работает, но показывает неправильные углы. Проблема задокументирована.

---

## Связанные файлы

- `backend/src/parsers/formats/pvdParser.js` - парсер .pvd
- `backend/src/routes/data.js:642-653` - расчет пикового давления
- `frontend/src/components/pv-diagrams/*` - компоненты визуализации
- `roadmap-pv-diagrams-educational.md` - основной roadmap (Stage 1.1 завершен)
