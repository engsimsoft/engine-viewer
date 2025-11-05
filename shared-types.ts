/**
 * Shared TypeScript Types для Engine Results Viewer
 *
 * Основано на анализе реального файла: test-data/Vesta 1.6 IM.det
 *
 * Структура .det файла:
 * - Строка 1: Метаданные (количество цилиндров, тип двигателя)
 * - Строка 2: Заголовки колонок (24 параметра)
 * - Строка 3+: Маркеры расчётов ($1, $2, ...) и данные
 *
 * ⚠️ ВАЖНО: Первая колонка в файле - служебная (номера строк)
 * Реальные данные начинаются со ВТОРОЙ колонки!
 */

// ====================================================================
// Типы двигателя
// ====================================================================

/**
 * Тип двигателя
 */
export type EngineType =
  | 'NATUR'       // Атмосферный (естественный впуск)
  | 'TURBO'       // Турбированный
  | 'SUPERCHARGED'; // С компрессором

/**
 * Метаданные двигателя (первая строка .det файла)
 */
export interface EngineMetadata {
  /** Количество цилиндров (обычно 4, 6, 8) */
  numCylinders: number;

  /** Тип двигателя */
  engineType: EngineType;
}

// ====================================================================
// Точка данных (одна строка в расчёте)
// ====================================================================

/**
 * Одна точка данных расчёта (одна строка в .det файле)
 *
 * Содержит все параметры для заданного RPM
 */
export interface DataPoint {
  /** Обороты двигателя (об/мин) */
  RPM: number;

  /** Средняя эффективная мощность (кВт) */
  PAv: number;

  /** Крутящий момент (Н·м) */
  Torque: number;

  /** Коэффициент наполнения цилиндров (1-4) */
  PurCyl: [number, number, number, number];

  /** Максимальная температура выхлопных газов на выходе из цилиндра (°C) */
  TUbMax: [number, number, number, number];

  /** Максимальная температура в цилиндре (°C) */
  TCylMax: [number, number, number, number];

  /** Максимальное давление в цилиндре (бар) */
  PCylMax: [number, number, number, number];

  /** Показатель детонации (0 = нет детонации) */
  Deto: [number, number, number, number];

  /** Сходимость расчёта (0 = идеальная сходимость) */
  Convergence: number;
}

// ====================================================================
// Расчёт
// ====================================================================

/**
 * Один расчёт (один набор данных с маркером $N)
 *
 * Расчёт - это набор точек данных для разных RPM при определённых
 * условиях (настройки ДВС, состав смеси, опережение зажигания и т.д.)
 */
export interface Calculation {
  /** Идентификатор расчёта (например: "1", "2", "3.1", "3.1 R 0.86") */
  id: string;

  /** Метка расчёта из файла (например: "$1", "$2", "$3.1") */
  marker: string;

  /** Массив точек данных (каждая точка = одно значение RPM) */
  dataPoints: DataPoint[];

  /** Дополнительная информация о расчёте (опционально) */
  metadata?: CalculationMetadata;
}

/**
 * Дополнительные метаданные расчёта
 */
export interface CalculationMetadata {
  /** Описание расчёта */
  description?: string;

  /** Дата создания расчёта */
  createdAt?: Date;

  /** Название конфигурации */
  configName?: string;

  /** Любые дополнительные параметры */
  [key: string]: unknown;
}

// ====================================================================
// Проект (один .det файл)
// ====================================================================

/**
 * Данные проекта (полное содержимое одного .det файла)
 */
export interface ProjectData {
  /** Уникальный идентификатор проекта */
  id: string;

  /** Название проекта (например: "Vesta 1.6 IM") */
  name: string;

  /** Путь к исходному .det файлу */
  filePath: string;

  /** Метаданные двигателя */
  metadata: EngineMetadata;

  /** Массив всех расчётов в проекте */
  calculations: Calculation[];

  /** Дата последнего изменения файла */
  modifiedAt: Date;

  /** Размер файла в байтах */
  fileSize: number;
}

/**
 * Краткая информация о проекте (для списка проектов)
 */
export interface ProjectInfo {
  /** Уникальный идентификатор проекта */
  id: string;

  /** Название проекта */
  name: string;

  /** Количество расчётов в проекте */
  calculationsCount: number;

  /** Количество цилиндров */
  numCylinders: number;

  /** Тип двигателя */
  engineType: EngineType;

  /** Дата последнего изменения */
  modifiedAt: Date;

  /** Размер файла в байтах */
  fileSize: number;
}

// ====================================================================
// API Response Types
// ====================================================================

/**
 * Ответ API: список проектов
 */
export interface GetProjectsResponse {
  projects: ProjectInfo[];
}

/**
 * Ответ API: данные конкретного проекта
 */
export interface GetProjectResponse {
  project: ProjectData;
}

/**
 * Ответ API: ошибка
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// ====================================================================
// Chart Configuration Types (для ECharts)
// ====================================================================

/**
 * Параметр для отображения на графике
 */
export type ChartParameter =
  | 'RPM'
  | 'PAv'
  | 'Torque'
  | 'PurCyl1' | 'PurCyl2' | 'PurCyl3' | 'PurCyl4'
  | 'TUbMax1' | 'TUbMax2' | 'TUbMax3' | 'TUbMax4'
  | 'TCylMax1' | 'TCylMax2' | 'TCylMax3' | 'TCylMax4'
  | 'PCylMax1' | 'PCylMax2' | 'PCylMax3' | 'PCylMax4'
  | 'Deto1' | 'Deto2' | 'Deto3' | 'Deto4'
  | 'Convergence';

/**
 * Пресет графика
 */
export type ChartPreset = 'preset1' | 'preset2' | 'preset3' | 'custom';

/**
 * Конфигурация пресета графика
 */
export interface ChartPresetConfig {
  /** Идентификатор пресета */
  id: ChartPreset;

  /** Название пресета */
  name: string;

  /** Описание пресета */
  description: string;

  /** Параметры для отображения */
  parameters: ChartParameter[];

  /** Использовать две оси Y (левая и правая) */
  dualYAxis: boolean;

  /** Параметры для левой оси Y */
  yAxisLeft?: ChartParameter[];

  /** Параметры для правой оси Y */
  yAxisRight?: ChartParameter[];
}

/**
 * Выбранные расчёты для сравнения
 */
export interface SelectedCalculations {
  /** Массив ID выбранных расчётов */
  calculationIds: string[];

  /** Цвета для каждого расчёта (hex) */
  colors: Record<string, string>;
}

// ====================================================================
// Project Metadata Types (auto + manual)
// ====================================================================

/**
 * Тип intake system
 */
export type IntakeSystem = 'ITB' | 'IM';

/**
 * Тип exhaust system
 */
export type ExhaustSystem = '4-2-1' | '4-1' | 'tri-y' | string;

/**
 * Engine configuration type
 */
export type EngineConfiguration = 'inline' | 'vee';

/**
 * Автоматически извлечённые метаданные из .prt файла (readonly для пользователя)
 */
export interface AutoMetadata {
  /** Количество цилиндров */
  cylinders: number;

  /** Тип двигателя: NA (Naturally Aspirated), Turbo, Supercharged */
  type: 'NA' | 'Turbo' | 'Supercharged';

  /** Конфигурация цилиндров: inline (рядный), vee (V-образный) */
  configuration: EngineConfiguration;

  /** Диаметр цилиндра (bore) в мм */
  bore: number;

  /** Ход поршня (stroke) в мм */
  stroke: number;

  /** Степень сжатия */
  compressionRatio: number;

  /** Максимальные обороты для максимальной мощности (RPM) */
  maxPowerRPM: number;

  /** Тип intake system: ITB (Individual Throttle Bodies), IM (Intake Manifold) */
  intakeSystem: IntakeSystem;

  /** Паттерн exhaust system: "4-2-1", "4-1", "tri-y", etc. */
  exhaustSystem: ExhaustSystem;
}

/**
 * Пользовательские метаданные (редактируются пользователем)
 */
export interface ManualMetadata {
  /** Описание проекта */
  description?: string;

  /** Клиент / заказчик */
  client?: string;

  /** Теги для поиска и фильтрации */
  tags?: string[];

  /** Статус проекта: active, completed, archived, testing */
  status?: 'active' | 'completed' | 'archived' | 'testing';

  /** Заметки / комментарии */
  notes?: string;

  /** Цвет карточки проекта (hex код) */
  color?: string;
}

/**
 * Полная структура метаданных проекта (v1.0)
 */
export interface ProjectMetadata {
  /** Версия схемы метаданных */
  version: '1.0';

  /** ID проекта (из названия файла, readonly) */
  id: string;

  /** Display Name (опционально, по умолчанию = ID) */
  displayName?: string;

  /** Автоматические метаданные из .prt файла (readonly) */
  auto?: AutoMetadata;

  /** Пользовательские метаданные (editable) */
  manual: ManualMetadata;

  /** Дата создания метаданных */
  created: string;

  /** Дата последнего изменения */
  modified: string;
}

// ====================================================================
// Export Format Types
// ====================================================================

/**
 * Формат экспорта графика
 */
export type ChartExportFormat = 'png' | 'svg' | 'jpg';

/**
 * Формат экспорта данных
 */
export type DataExportFormat = 'csv' | 'excel' | 'json';

/**
 * Опции экспорта графика
 */
export interface ChartExportOptions {
  /** Формат файла */
  format: ChartExportFormat;

  /** Ширина изображения (px) */
  width?: number;

  /** Высота изображения (px) */
  height?: number;

  /** Фоновый цвет */
  backgroundColor?: string;

  /** DPI (для PNG) */
  pixelRatio?: number;
}

/**
 * Опции экспорта данных
 */
export interface DataExportOptions {
  /** Формат файла */
  format: DataExportFormat;

  /** Включить метаданные */
  includeMetadata?: boolean;

  /** Включить только выбранные расчёты */
  selectedOnly?: boolean;
}
