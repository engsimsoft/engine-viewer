# ADR 013: Linear Interpolation for .prt Tabular Data

**Дата:** 2025-11-12
**Статус:** Принято
**Автор:** Claude Code + User
**Связано с:** ADR-012 (PV-Diagrams Combustion Timing), ADR-005 (.prt Parser)

## Контекст

При реализации Combustion Timing visualization (ADR-012) обнаружена проблема:

**Ситуация:**
- .prt файлы содержат табличные данные "Ignition, AFR and Combustion curves" с фиксированными точками RPM (2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000)
- .pvd файлы содержат данные для промежуточных RPM (3500, 4500, 5500, 6500, 7500)
- Пользователь может выбрать любой RPM для отображения

**Проблема:**
```typescript
// Исходный код (строгое сравнение)
const curve = combustionData.find((c) => c.rpm === currentRPM);

// RPM 5000 → foundCurve: true ✅
// RPM 3500 → foundCurve: false ❌ (нет точного совпадения)
```

Результат: Combustion timing markers не отображались для промежуточных RPM, хотя данные для соседних точек (3000, 4000) были доступны.

**Пример табличных данных из .prt:**
```
   RPM     Timing    AFR    Delay Duration  VibeA  VibeB  Beff
  3000.00   17.60   12.55    5.02   50.20   10.00  2.000  0.910
  4000.00   19.60   12.52    5.40   54.00   10.00  2.000  0.910
  5000.00   21.50   12.50    5.79   57.90   10.00  2.000  0.895
```

Пользователь выбирает RPM 3500 → нет точного совпадения в таблице.

## Решение

**Использовать линейную интерполяцию между двумя ближайшими точками в таблице.**

Реализация:
```typescript
function interpolateCombustionData(
  combustionData: CombustionCurve[],
  targetRPM: number
): CombustionCurve | null {
  // 1. Проверка на точное совпадение
  const exactMatch = sortedCurves.find((c) => c.rpm === targetRPM);
  if (exactMatch) return exactMatch;

  // 2. Поиск двух ближайших точек (lower, upper)
  for (let i = 0; i < sortedCurves.length - 1; i++) {
    if (sortedCurves[i].rpm < targetRPM && sortedCurves[i + 1].rpm > targetRPM) {
      lowerCurve = sortedCurves[i];
      upperCurve = sortedCurves[i + 1];
      break;
    }
  }

  // 3. Линейная интерполяция всех полей
  const factor = (targetRPM - lowerCurve.rpm) / (upperCurve.rpm - lowerCurve.rpm);

  return {
    rpm: targetRPM,
    timing: lowerCurve.timing + (upperCurve.timing - lowerCurve.timing) * factor,
    afr: lowerCurve.afr + (upperCurve.afr - lowerCurve.afr) * factor,
    // ... 8 полей всего
  };
}
```

**Пример:**
```
Таблица:  3000 RPM (timing: 17.60)  →  4000 RPM (timing: 19.60)
Target:   3500 RPM
Factor:   (3500 - 3000) / (4000 - 3000) = 0.5
Result:   timing = 17.60 + (19.60 - 17.60) * 0.5 = 18.60°
```

## Причины

### 1. **Физическая обоснованность**
Параметры двигателя (timing, AFR, delay, duration) изменяются плавно с увеличением RPM. Линейная интерполяция - хорошая аппроксимация между соседними точками (шаг 1000 RPM).

### 2. **Простота реализации**
- Не требует сложных библиотек (spline, polynomial)
- Понятный и предсказуемый результат
- Легко debugить

### 3. **Производительность**
- O(n) поиск ближайших точек (n ≈ 8 точек в таблице)
- Нет накладных расходов на сложные вычисления
- Выполняется мгновенно при каждом рендере графика

### 4. **Паттерн для будущего**
.prt файлы могут содержать другие табличные данные:
- Valve timing tables
- Fuel maps
- Turbocharger maps

Этот паттерн применим ко всем табличным данным.

## Последствия

**Плюсы:**
- ✅ Combustion timing markers отображаются для **любого RPM** в диапазоне
- ✅ Физически обоснованные значения (плавное изменение)
- ✅ Простая и понятная реализация
- ✅ Переиспользуемый паттерн для других таблиц .prt

**Минусы:**
- ⚠️ Линейная интерполяция менее точна чем spline (но достаточна для visualization)
- ⚠️ Работает только внутри диапазона таблицы (3500 ✅, 1500 ❌)
- ⚠️ Для RPM вне диапазона возвращается `null` (markers не показываются)

**Edge cases:**
```typescript
// ✅ Внутри диапазона
interpolate([2000, 3000, 4000], 2500) → интерполированное значение

// ✅ Точное совпадение
interpolate([2000, 3000, 4000], 3000) → возврат exact match

// ❌ Вне диапазона (ниже)
interpolate([2000, 3000, 4000], 1500) → null

// ❌ Вне диапазона (выше)
interpolate([2000, 3000, 4000], 5000) → null
```

## Альтернативы

### 1. Nearest Neighbor (ближайшее значение)
**Отклонено:**
- ❌ Резкие скачки параметров при переключении между соседними точками
- ❌ Визуально неестественно (markers "прыгают" при изменении RPM)
- ❌ Менее точно для промежуточных значений

### 2. Cubic Spline Interpolation
**Отклонено:**
- ❌ Overkill для 8 точек данных
- ❌ Требует библиотеку (увеличение bundle size)
- ❌ Сложнее debugить
- ✅ Могло бы быть рассмотрено если точек 50+

### 3. Polynomial Interpolation
**Отклонено:**
- ❌ Риск overfitting (oscillations между точками)
- ❌ Сложнее реализовать
- ❌ Непредсказуемое поведение

## Применение паттерна в будущем

Этот паттерн можно применить к другим табличным данным из .prt файлов:

**Примеры:**
1. **Valve Timing Tables** (если будут добавлены в .prt)
   ```
   RPM    IVO    IVC    EVO    EVC
   3000   ...    ...    ...    ...
   4000   ...    ...    ...    ...
   ```

2. **Fuel Maps** (AFR vs RPM & Load)
   ```
   RPM    Load10  Load20  Load30  ...
   3000   ...     ...     ...     ...
   4000   ...     ...     ...     ...
   ```

3. **Turbocharger Maps** (для turbo engines)
   ```
   RPM    BoostPressure  CompressorEff  ...
   3000   ...            ...            ...
   4000   ...            ...            ...
   ```

**Рекомендация:**
- Создать utility функцию `interpolateTableData(table, targetValue, keyField)`
- Переиспользовать для всех табличных данных
- Документировать в `frontend/src/utils/interpolationUtils.ts`

## Реализация

**Файлы:**
- `frontend/src/components/pv-diagrams/chartOptionsHelpers.ts`
  - Функция `interpolateCombustionData()` (строки 59-109)
  - Замена строгого поиска на интерполяцию (строка 543)

**Тесты:**
- ✅ RPM с точным совпадением (5000, 6000) → exact match
- ✅ RPM промежуточные (3500, 4500, 5500) → интерполяция
- ✅ RPM вне диапазона (1000, 10000) → null (markers не показываются)

**Верификация:**
- Протестировано на всех проектах (35 проектов)
- Build без TypeScript ошибок
- Combustion timing markers работают для любого RPM

## Ссылки

- ADR-012: PV-Diagrams Combustion Timing Implementation
- ADR-005: .prt Parser and Metadata Separation
- [Linear Interpolation - Wikipedia](https://en.wikipedia.org/wiki/Linear_interpolation)
- Code: `frontend/src/components/pv-diagrams/chartOptionsHelpers.ts:59-109`
