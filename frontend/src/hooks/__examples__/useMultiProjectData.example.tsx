/**
 * Примеры использования useMultiProjectData hook
 *
 * Этот файл демонстрирует различные сценарии использования hook
 * для загрузки данных из нескольких проектов.
 */

import React from 'react';
import { useMultiProjectData } from '../useMultiProjectData';
import type { CalculationReference } from '@/types/v2';

// ============================================================================
// Example 1: Basic Usage - Single Project
// ============================================================================

/**
 * Пример 1: Загрузка одного расчёта из одного проекта
 */
export function BasicUsageExample() {
  const primaryCalc: CalculationReference = {
    projectId: 'vesta-16-im',
    projectName: 'Vesta 1.6 IM',
    calculationId: '$1',
    calculationName: '$1',
    color: '#ff6b6b',
    metadata: {
      rpmRange: [2600, 7800],
      avgStep: 200,
      pointsCount: 26,
      engineType: 'NATUR',
      cylinders: 4,
    },
  };

  const { calculations, isLoading, error } = useMultiProjectData([primaryCalc]);

  if (isLoading) {
    return <div>Loading calculation data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const loadedCalc = calculations[0];

  return (
    <div>
      <h2>{loadedCalc.projectName} → {loadedCalc.calculationName}</h2>
      <p>Data points loaded: {loadedCalc.data?.length || 0}</p>
      {loadedCalc.data && (
        <pre>{JSON.stringify(loadedCalc.data[0], null, 2)}</pre>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Cross-Project Comparison
// ============================================================================

/**
 * Пример 2: Загрузка расчётов из разных проектов (cross-project)
 */
export function CrossProjectExample() {
  const calculations: CalculationReference[] = [
    {
      // Primary: Vesta
      projectId: 'vesta-16-im',
      projectName: 'Vesta 1.6 IM',
      calculationId: '$1',
      calculationName: '$1',
      color: '#ff6b6b',
      metadata: {
        rpmRange: [2600, 7800],
        avgStep: 200,
        pointsCount: 26,
        engineType: 'NATUR',
        cylinders: 4,
      },
    },
    {
      // Comparison 1: BMW
      projectId: 'bmw-m42',
      projectName: 'BMW M42',
      calculationId: '$5',
      calculationName: '$5',
      color: '#4ecdc4',
      metadata: {
        rpmRange: [2000, 8000],
        avgStep: 200,
        pointsCount: 30,
        engineType: 'TURBO',
        cylinders: 4,
      },
    },
  ];

  const { calculations: loaded, isLoading, error, progress } = useMultiProjectData(calculations);

  if (isLoading) {
    return (
      <div>
        <div>Loading data from multiple projects...</div>
        <div>Progress: {progress.loaded} / {progress.total}</div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div>
      <h2>Cross-Project Comparison</h2>
      {loaded.map((calc) => (
        <div key={`${calc.projectId}-${calc.calculationId}`}>
          <h3 style={{ color: calc.color }}>
            {calc.projectName} → {calc.calculationName}
          </h3>
          <p>Data points: {calc.data?.length || 0}</p>
          <p>RPM range: {calc.metadata.rpmRange.join('-')} RPM</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 3: With Error Handling and Refetch
// ============================================================================

/**
 * Пример 3: Обработка ошибок и повторная загрузка
 */
export function ErrorHandlingExample() {
  const calculations: CalculationReference[] = [
    {
      projectId: 'vesta-16-im',
      projectName: 'Vesta 1.6 IM',
      calculationId: '$1',
      calculationName: '$1',
      color: '#ff6b6b',
      metadata: {
        rpmRange: [2600, 7800],
        avgStep: 200,
        pointsCount: 26,
        engineType: 'NATUR',
        cylinders: 4,
      },
    },
  ];

  const { calculations: loaded, isLoading, error, refetch } = useMultiProjectData(calculations);

  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Failed to load calculation data</h3>
          <p>{error}</p>
        </div>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Calculation Data Loaded Successfully</h2>
      {loaded.map((calc) => (
        <div key={`${calc.projectId}-${calc.calculationId}`}>
          <p>{calc.projectName}: {calc.data?.length} data points</p>
        </div>
      ))}
      <button onClick={refetch}>Reload Data</button>
    </div>
  );
}

// ============================================================================
// Example 4: Dynamic Calculations (Add/Remove)
// ============================================================================

/**
 * Пример 4: Динамическое добавление/удаление расчётов
 */
export function DynamicCalculationsExample() {
  const [calculations, setCalculations] = React.useState<CalculationReference[]>([
    {
      projectId: 'vesta-16-im',
      projectName: 'Vesta 1.6 IM',
      calculationId: '$1',
      calculationName: '$1',
      color: '#ff6b6b',
      metadata: {
        rpmRange: [2600, 7800],
        avgStep: 200,
        pointsCount: 26,
        engineType: 'NATUR',
        cylinders: 4,
      },
    },
  ]);

  const { calculations: loaded, isLoading, error, progress } = useMultiProjectData(calculations);

  const addComparison = () => {
    const newCalc: CalculationReference = {
      projectId: 'bmw-m42',
      projectName: 'BMW M42',
      calculationId: '$5',
      calculationName: '$5',
      color: '#4ecdc4',
      metadata: {
        rpmRange: [2000, 8000],
        avgStep: 200,
        pointsCount: 30,
        engineType: 'TURBO',
        cylinders: 4,
      },
    };

    setCalculations([...calculations, newCalc]);
  };

  const removeComparison = (index: number) => {
    setCalculations(calculations.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Dynamic Calculations Management</h2>

      {isLoading && (
        <div>Loading: {progress.loaded} / {progress.total}</div>
      )}

      {error && <div>Error: {error}</div>}

      <div>
        <h3>Loaded Calculations:</h3>
        {loaded.map((calc, index) => (
          <div key={`${calc.projectId}-${calc.calculationId}`}>
            <span style={{ color: calc.color }}>●</span>
            {calc.projectName} → {calc.calculationName}
            {' '}({calc.data?.length || 0} points)
            <button onClick={() => removeComparison(index)}>Remove</button>
          </div>
        ))}
      </div>

      <button onClick={addComparison} disabled={calculations.length >= 5}>
        Add Comparison
      </button>
    </div>
  );
}

// ============================================================================
// Example 5: With Zustand Store Integration
// ============================================================================

/**
 * Пример 5: Интеграция с Zustand store
 *
 * Реальное использование в приложении с глобальным state
 */
export function ZustandIntegrationExample() {
  // In real app, you would use useAppStore() from stores/appStore.ts
  // const { primaryCalculation, comparisonCalculations } = useAppStore();

  // Пример mock data
  const primaryCalculation: CalculationReference | null = {
    projectId: 'vesta-16-im',
    projectName: 'Vesta 1.6 IM',
    calculationId: '$1',
    calculationName: '$1',
    color: '#ff6b6b',
    metadata: {
      rpmRange: [2600, 7800],
      avgStep: 200,
      pointsCount: 26,
      engineType: 'NATUR',
      cylinders: 4,
    },
  };

  const comparisonCalculations: CalculationReference[] = [];

  // Combine primary + comparisons
  const allCalculations = [
    ...(primaryCalculation ? [primaryCalculation] : []),
    ...comparisonCalculations,
  ];

  const { calculations, isLoading, error } = useMultiProjectData(allCalculations);

  if (isLoading) return <div>Loading calculations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Calculations with Store Integration</h2>
      <p>Primary: {calculations[0]?.projectName}</p>
      <p>Comparisons: {calculations.length - 1}</p>
      <p>Total data points: {calculations.reduce((sum, c) => sum + (c.data?.length || 0), 0)}</p>
    </div>
  );
}
