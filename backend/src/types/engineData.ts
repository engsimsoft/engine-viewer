/**
 * TypeScript типы для данных двигателя из .det файлов
 * Основано на анализе тестового файла: Vesta 1.6 IM.det
 */

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
  fileName: string;           // Имя файла (например "Vesta 1.6 IM.det")
  metadata: EngineMetadata;   // Метаданные двигателя
  columnHeaders: string[];    // Заголовки колонок из строки 2
  calculations: Calculation[]; // Массив всех расчетов
}

/**
 * Структура для API ответа со списком проектов
 */
export interface ProjectsListResponse {
  projects: {
    id: string;               // ID проекта (имя файла без расширения)
    fileName: string;         // Полное имя файла
    engineType: string;       // Тип двигателя
    numCylinders: number;     // Количество цилиндров
    calculationsCount: number; // Количество расчетов
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
