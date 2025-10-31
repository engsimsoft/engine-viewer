import { Download, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartExportButtonsProps {
  /** Callback для экспорта в PNG */
  onExportPNG: () => void;
  /** Callback для экспорта в SVG */
  onExportSVG: () => void;
  /** Отключить кнопки (когда нет данных) */
  disabled?: boolean;
}

/**
 * Компонент кнопок экспорта графика
 *
 * Предоставляет две кнопки:
 * - PNG - растровый формат (для презентаций, email)
 * - SVG - векторный формат (для публикаций, печати)
 */
export function ChartExportButtons({
  onExportPNG,
  onExportSVG,
  disabled = false,
}: ChartExportButtonsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPNG}
        disabled={disabled}
        title="Экспорт в PNG (растровый формат для презентаций)"
      >
        <Download className="mr-2 h-4 w-4" />
        PNG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportSVG}
        disabled={disabled}
        title="Экспорт в SVG (векторный формат для публикаций)"
      >
        <FileImage className="mr-2 h-4 w-4" />
        SVG
      </Button>
    </div>
  );
}
