/**
 * TypeScript типы для данных двигателя
 * Поддерживаемые форматы:
 * - .det: 24 параметра (базовые характеристики)
 * - .pou: 71 параметр (расширенный набор)
 */

// =============================================================================
// МЕТАДАННЫЕ (Строка 1 файла)
// =============================================================================

/**
 * Метаданные двигателя из первой строки .det файла
 * Формат: "           4 NATUR     NumCyl"
 */
export interface DetMetadata {
  numCylinders: number;      // Количество цилиндров
  engineType: string;         // Тип двигателя (NATUR, TURBO и т.д.)
}

/**
 * Метаданные двигателя из первой строки .pou файла
 * Формат: "           4 NATUR       0       0     NumCyl,Breath,NumTurbo,NumWasteGate"
 */
export interface PouMetadata {
  numCylinders: number;      // Количество цилиндров
  engineType: string;         // Тип двигателя (NATUR, TURBO и т.д.)
  breath: number;             // Дыхание (0/1)
  numTurbo: number;           // Количество турбин
  numWasteGate: number;       // Количество wastegate
}

/**
 * Union type для метаданных (поддержка обоих форматов)
 */
export type EngineMetadata = DetMetadata | PouMetadata;

// =============================================================================
// ТОЧКИ ДАННЫХ (Строки с числовыми данными)
// =============================================================================

/**
 * Одна точка данных из .det файла (24 параметра)
 * Содержит базовые параметры для одной точки оборотов
 */
export interface DetDataPoint {
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
 * Одна точка данных из .pou файла (71 параметр)
 * Содержит расширенный набор параметров для одной точки оборотов
 */
export interface PouDataPoint {
  RPM: number;                // Обороты двигателя (об/мин)
  'P-Av': number;             // Средняя мощность (кВт)
  Torque: number;             // Крутящий момент (Н·м)
  TexAv: number;              // Средняя температура выпуска (K)

  // Мощность для каждого цилиндра (кВт)
  Power: number[];            // [cyl1, cyl2, cyl3, cyl4, ...]

  // Индикаторное среднее эффективное давление (бар)
  IMEP: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Brake Mean Effective Pressure (бар)
  BMEP: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Pumping Mean Effective Pressure (бар)
  PMEP: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Friction Mean Effective Pressure (бар)
  FMEP: number;

  // Degree Ratio
  DRatio: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Коэффициент наполнения для каждого цилиндра
  PurCyl: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Scavenging efficiency
  Seff: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Trapping efficiency
  Teff: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Charging efficiency
  Ceff: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Brake Specific Fuel Consumption (г/кВт·ч)
  BSFC: number[];             // [cyl1, cyl2, cyl3, cyl4, ...]

  // Температура в цилиндре средняя (K)
  'TC-Av': number[];          // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальная температура выпускных газов (K)
  TUbMax: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальное давление в цилиндре (бар) - добавляется из .det при merge
  PCylMax?: number[];         // [cyl1, cyl2, cyl3, cyl4, ...] (optional, from .det)

  // Детонация для каждого цилиндра - добавляется из .det при merge
  Deto?: number[];            // [cyl1, cyl2, cyl3, cyl4, ...] (optional, from .det)

  // Максимальный угол (градусы)
  MaxDeg: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Timing (градусы)
  Timing: number;

  // Delay (задержка) для каждого цилиндра
  Delay: number[];            // [cyl1, cyl2, cyl3, cyl4, ...]

  // Duration (продолжительность) для каждого цилиндра
  Durat: number[];            // [cyl1, cyl2, cyl3, cyl4, ...]

  // Total Air Flow
  TAF: number;

  // Vibe параметры (модель сгорания)
  VibeDelay: number;          // Задержка Vibe
  VibeDurat: number;          // Продолжительность Vibe
  VibeA: number;              // Параметр A Vibe
  VibeM: number;              // Параметр M Vibe
}

/**
 * Union type для точек данных (поддержка обоих форматов)
 */
export type DataPoint = DetDataPoint | PouDataPoint;

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
 * Полный проект - все данные из одного файла двигателя (.det, .pou, или merged)
 */
export interface EngineProject {
  fileName: string;                  // Имя файла (например "Vesta 1.6 IM.det" или "TM Soft ShortCut.pou")
  format: 'det' | 'pou' | 'pou-merged'; // Формат файла (pou-merged = .pou + TCylMax/Convergence from .det)
  metadata: EngineMetadata;          // Метаданные двигателя (DetMetadata | PouMetadata)
  columnHeaders: string[];           // Заголовки колонок из строки 2
  calculations: Calculation[];       // Массив всех расчетов
}

/**
 * Структура для API ответа со списком проектов
 */
export interface ProjectsListResponse {
  projects: {
    id: string;                          // ID проекта (имя файла без расширения)
    fileName: string;                    // Полное имя файла
    format: 'det' | 'pou' | 'pou-merged'; // Формат файла (pou-merged = merged data)
    engineType: string;                  // Тип двигателя
    numCylinders: number;                // Количество цилиндров
    calculationsCount: number;           // Количество расчетов
  }[];
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
 * Комбинирует данные из файла двигателя (.det, .pou, или merged) и метаданных
 */
export interface ProjectInfo {
  id: string;                          // ID проекта (имя файла без расширения)
  fileName: string;                    // Полное имя файла
  format: 'det' | 'pou' | 'pou-merged'; // Формат файла (pou-merged = merged data)
  engineType: string;                  // Тип двигателя
  numCylinders: number;                // Количество цилиндров
  calculationsCount: number;           // Количество расчетов
  // Метаданные (опциональные, если не созданы пользователем)
  description?: string;
  client?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  color?: string;
  updatedAt?: string;
}
