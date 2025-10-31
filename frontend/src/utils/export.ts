import * as XLSX from 'xlsx';

/**
 * Экспорт данных в CSV формат
 *
 * @param data - Массив объектов для экспорта
 * @param filename - Имя файла (с расширением .csv)
 */
export function exportToCSV(
  data: Record<string, string | number>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('exportToCSV: No data to export');
    return;
  }

  // Получаем заголовки из первого объекта
  const headers = Object.keys(data[0]);

  // Создаём CSV строку с заголовками
  const csvRows: string[] = [];
  csvRows.push(headers.join(','));

  // Добавляем строки данных
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Если значение содержит запятую или кавычки, оборачиваем в кавычки
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });

  // Создаём Blob и скачиваем файл
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Освобождаем URL
  URL.revokeObjectURL(url);
}

/**
 * Экспорт данных в Excel формат (XLSX)
 *
 * @param data - Массив объектов для экспорта
 * @param filename - Имя файла (с расширением .xlsx)
 */
export function exportToExcel(
  data: Record<string, string | number>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('exportToExcel: No data to export');
    return;
  }

  // Создаём worksheet из данных
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Создаём workbook и добавляем worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Автоматическая ширина колонок (опционально)
  const maxWidths: number[] = [];
  const headers = Object.keys(data[0]);

  // Вычисляем максимальную ширину для каждой колонки
  headers.forEach((header, index) => {
    let maxWidth = header.length;
    data.forEach((row) => {
      const value = row[header];
      const valueLength = value?.toString().length || 0;
      if (valueLength > maxWidth) {
        maxWidth = valueLength;
      }
    });
    maxWidths[index] = Math.min(maxWidth + 2, 50); // Ограничиваем максимальную ширину
  });

  // Применяем ширину колонок
  worksheet['!cols'] = maxWidths.map((width) => ({ wch: width }));

  // Генерируем файл Excel и скачиваем
  XLSX.writeFile(workbook, filename);
}

/**
 * Экспорт графика ECharts в PNG
 *
 * @param chartInstance - Экземпляр ECharts
 * @param filename - Имя файла (с расширением .png)
 * @param backgroundColor - Цвет фона (по умолчанию белый)
 */
export function exportChartToPNG(
  chartInstance: any, // echarts.ECharts
  filename: string,
  backgroundColor: string = '#ffffff'
): void {
  if (!chartInstance) {
    console.warn('exportChartToPNG: Chart instance is null or undefined');
    return;
  }

  // Получаем Data URL графика
  const dataURL = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2, // Для лучшего качества (Retina)
    backgroundColor,
  });

  // Создаём ссылку для скачивания
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Экспорт графика ECharts в SVG
 *
 * @param chartInstance - Экземпляр ECharts
 * @param filename - Имя файла (с расширением .svg)
 */
export function exportChartToSVG(
  chartInstance: any, // echarts.ECharts
  filename: string
): void {
  if (!chartInstance) {
    console.warn('exportChartToSVG: Chart instance is null or undefined');
    return;
  }

  // Получаем Data URL графика в формате SVG
  const dataURL = chartInstance.getDataURL({
    type: 'svg',
  });

  // Создаём ссылку для скачивания
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Проверка поддержки браузером функций экспорта
 */
export function checkExportSupport(): {
  csv: boolean;
  excel: boolean;
  png: boolean;
  svg: boolean;
} {
  const isClientSide = typeof window !== 'undefined';

  return {
    csv: isClientSide && typeof Blob !== 'undefined',
    excel: isClientSide && typeof Blob !== 'undefined',
    png: isClientSide && typeof HTMLCanvasElement !== 'undefined',
    svg: isClientSide,
  };
}
