import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { useProjectData } from '@/hooks/useProjectData';
import { useSelectedCalculations } from '@/hooks/useSelectedCalculations';
import { useChartPreset } from '@/hooks/useChartPreset';
import { CalculationSelector } from '@/components/visualization/CalculationSelector';
import { PresetSelector } from '@/components/visualization/PresetSelector';
import { ChartPreset1 } from '@/components/visualization/ChartPreset1';
import { ChartPreset2 } from '@/components/visualization/ChartPreset2';
import { ChartPreset3 } from '@/components/visualization/ChartPreset3';
import { ChartPreset4 } from '@/components/visualization/ChartPreset4';
import { DataTable } from '@/components/visualization/DataTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Страница визуализации проекта
 *
 * ВАЖНО (v2.0 Architecture):
 * - projectId из URL (:id) используется как INITIAL CONTEXT для визуализации
 * - Это НЕ ограничение - пользователь может сравнивать расчёты из ЛЮБЫХ проектов
 * - В Phase 2: projectId определяет какой проект показать в Primary Selection Modal по умолчанию
 * - Cross-project comparison полностью поддерживается через useMultiProjectData hook
 *
 * Текущая версия (Phase 1):
 * - Загружает данные одного проекта (старая архитектура)
 * - В Phase 2 будет обновлена для работы с Zustand store + multi-project data
 *
 * Отображает:
 * - Информацию о проекте
 * - Селектор расчётов (макс 5)
 * - Переключатель пресетов графиков
 * - График выбранного пресета (1-4)
 * - Таблицу данных с экспортом (CSV, Excel)
 */
export default function ProjectPage() {
  // projectId из URL - initial context для Phase 2
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Загружаем данные проекта
  const { project, loading, error, refetch } = useProjectData(id);

  // Управление выбранными расчётами
  const {
    selectedIds,
    toggleCalculation,
    isMaxReached,
    maxCount,
    count,
  } = useSelectedCalculations();

  // Управление выбором пресета графиков
  const [activePreset, setActivePreset] = useChartPreset();

  // Обработчик возврата на главную
  const handleGoBack = () => {
    navigate('/');
  };

  // Состояние загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  // Проект не найден
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Проект не найден</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header с кнопкой "Назад" */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>

          {/* Информация о проекте */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{project.fileName}</CardTitle>
                  <CardDescription className="mt-2">
                    {project.metadata.engineType} • {project.metadata.numCylinders} цилиндров
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {project.calculations.length} расчётов
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Левая колонка: Селектор расчётов */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Расчёты
                </CardTitle>
                <CardDescription>
                  Выберите до {maxCount} расчётов для сравнения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalculationSelector
                  calculations={project.calculations}
                  selectedIds={selectedIds}
                  onToggle={toggleCalculation}
                  isMaxReached={isMaxReached}
                  maxCount={maxCount}
                />
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: График */}
          <div className="lg:col-span-3 space-y-6">
            {/* Селектор пресетов */}
            <PresetSelector
              activePreset={activePreset}
              onPresetChange={setActivePreset}
            />

            {/* График */}
            <Card>
              <CardHeader>
                <CardTitle>Визуализация</CardTitle>
                <CardDescription>
                  {count > 0
                    ? `Отображено ${count} расчёт${count === 1 ? '' : count < 5 ? 'а' : 'ов'}`
                    : 'Выберите расчёты для отображения'}
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {/* Рендерим график в зависимости от выбранного пресета */}
                {activePreset === 'preset1' && (
                  <ChartPreset1
                    calculations={project.calculations}
                    selectedIds={selectedIds}
                  />
                )}
                {activePreset === 'preset2' && (
                  <ChartPreset2
                    calculations={project.calculations}
                    selectedIds={selectedIds}
                  />
                )}
                {activePreset === 'preset3' && (
                  <ChartPreset3
                    calculations={project.calculations}
                    selectedIds={selectedIds}
                  />
                )}
                {activePreset === 'preset4' && (
                  <ChartPreset4
                    calculations={project.calculations}
                    selectedIds={selectedIds}
                  />
                )}
              </CardContent>
            </Card>

            {/* Таблица данных */}
            <DataTable
              calculations={project.calculations}
              selectedIds={selectedIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
