/**
 * TypeScript типы для Engine Results Viewer Frontend
 * Синхронизировано с backend/src/types/engineData.ts
 */

// ====================================================================
// Backend Types (синхронизировано с backend)
// ====================================================================

/**
 * Метаданные двигателя из первой строки .det файла
 */
export interface EngineMetadata {
  numCylinders: number;      // Количество цилиндров
  engineType: string;         // Тип двигателя (NATUR, TURBO и т.д.)
}

/**
 * Одна точка данных (одна строка из .det файла)
 * Содержит все параметры для одной точки оборотов
 */
export interface DataPoint {
  RPM: number;                // Обороты двигателя (об/мин)
  'P-Av': number;             // Средняя мощность (кВт)
  Torque: number;             // Крутящий момент (Н·м)

  // Коэффициент наполнения для каждого цилиндра
  PurCyl: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальная температура выпускных газов для каждого цилиндра (K)
  TUbMax: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальная температура в цилиндре (K)
  TCylMax: number[];          // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальное давление в цилиндре (бар)
  PCylMax: number[];          // [cyl1, cyl2, cyl3, cyl4, ...]

  // Детонация для каждого цилиндра
  Deto: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  Convergence: number;        // Сходимость расчета
}

/**
 * Один расчет (calculation) - набор точек с одним маркером ($1, $2, и т.д.)
 *
 * ВАЖНО:
 * - Символ $ - технический маркер, который backend программы расчётов добавляет автоматически
 * - После $ идёт текст, который ввёл пользователь (это его название расчета)
 * - В UI показываем name (без $), а id (с $) используем для внутренней логики
 *
 * Примеры:
 *   Файл: "$3.1 R 0.86" → id: "$3.1 R 0.86", name: "3.1 R 0.86"
 *   Файл: "$baseline"   → id: "$baseline",   name: "baseline"
 */
export interface Calculation {
  id: string;                 // Уникальный ID расчета (с $) - для API и внутренней логики
  name: string;               // Название для отображения в UI (без $) - то, что ввёл пользователь
  dataPoints: DataPoint[];    // Массив точек данных для этого расчета
}

/**
 * Полный проект - все данные из одного .det файла
 */
export interface EngineProject {
  name: string;               // Имя проекта без расширения (например "Vesta 1.6 IM")
  fileName: string;           // Имя файла (например "Vesta 1.6 IM.det")
  metadata: EngineMetadata;   // Метаданные двигателя
  columnHeaders: string[];    // Заголовки колонок из строки 2
  calculations: Calculation[]; // Массив всех расчетов
}

/**
 * Метаданные проекта (пользовательская информация о проекте)
 * Хранятся в .metadata/<projectId>.json
 */
export interface ProjectMetadata {
  projectId: string;          // ID проекта (имя файла без расширения)
  description: string;        // Краткое описание проекта
  client: string;             // Название клиента/компании
  tags: string[];             // Теги для категоризации (lowercase)
  notes: string;              // Детальные заметки
  status: 'active' | 'completed' | 'archived'; // Статус проекта
  color: string;              // Цвет для карточки (hex, например "#3b82f6")
  createdAt: string;          // ISO дата создания метаданных
  updatedAt: string;          // ISO дата последнего обновления
}

/**
 * Расширенная информация о проекте (для списка проектов)
 * Комбинирует данные из .det файла и метаданных
 */
export interface ProjectInfo {
  id: string;                 // ID проекта (имя файла без расширения)
  name: string;               // Имя проекта (без расширения)
  fileName: string;           // Полное имя файла
  engineType: string;         // Тип двигателя
  numCylinders: number;       // Количество цилиндров
  calculationsCount: number;  // Количество расчетов
  lastModified: string;       // ISO дата последнего изменения файла
  // Метаданные (опциональные, если не созданы пользователем)
  description?: string;
  client?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  color?: string;
  notes?: string;
  updatedAt?: string;
  metadata?: {                // Вложенный объект метаданных (для удобства)
    description?: string;
    client?: string;
    tags?: string[];
    status?: 'active' | 'completed' | 'archived';
    color?: string;
    notes?: string;
    updatedAt?: string;
  };
}

// ====================================================================
// API Response Types
// ====================================================================

/**
 * Структура для API ответа со списком проектов
 */
export interface ProjectsListResponse {
  success: boolean;
  data: ProjectInfo[];
  meta: {
    total: number;
    scannedAt: number;
    scanDuration: number;
    directory: {
      path: string;
      totalSize: number;
      totalSizeFormatted: string;
    };
  };
}

/**
 * Структура для API ответа с детальными данными проекта
 */
export interface ProjectDetailsResponse {
  project: EngineProject;
}

/**
 * Параметры для фильтрации и выбора данных
 */
export interface DataQueryParams {
  calculationIds?: string[];  // ID расчетов для выбора (например ["$1", "$2"])
  rpmRange?: {                // Диапазон оборотов
    min: number;
    max: number;
  };
  parameters?: string[];      // Какие параметры вернуть (RPM, Torque, и т.д.)
}

// ====================================================================
// UI-Specific Types
// ====================================================================

/**
 * Режим отображения списка проектов
 */
export type ViewMode = 'cards' | 'list';

/**
 * Сортировка списка проектов
 */
export type SortBy = 'date' | 'name' | 'calculations' | 'status';

/**
 * Фильтр по статусу проекта
 */
export type FilterStatus = 'all' | 'active' | 'completed' | 'archived';

/**
 * Состояние загрузки данных
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Настройки отображения графиков
 */
export interface ChartPreset {
  id: string;
  name: string;
  description: string;
  parameters: string[];       // Список параметров для отображения
}

/**
 * Выбранные расчёты для сравнения (макс. 5)
 */
export interface SelectedCalculations {
  projectId: string;
  calculationIds: string[];   // Максимум 5
}

/**
 * Формат экспорта
 */
export type ExportFormat = 'png' | 'svg' | 'csv' | 'xlsx';

/**
 * Опции экспорта графика
 */
export interface ExportOptions {
  format: ExportFormat;
  fileName: string;
  width?: number;
  height?: number;
}
