import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown, Download, FileSpreadsheet } from 'lucide-react';
import type { Calculation, DataPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToCSV, exportToExcel } from '@/utils/export';

interface DataTableProps {
  /** Все расчёты проекта */
  calculations: Calculation[];
  /** ID выбранных расчётов */
  selectedIds: string[];
}

/**
 * Тип строки таблицы - комбинация данных из всех выбранных расчётов
 * Каждая строка представляет одно значение RPM
 */
interface TableRow {
  /** Значение RPM (общее для всех расчётов в строке) */
  rpm: number;
  /** Данные по каждому расчёту: ключ - id расчёта, значение - DataPoint или undefined */
  calculationData: Record<string, DataPoint | undefined>;
}

/**
 * Компонент таблицы данных с сортировкой, пагинацией и экспортом
 *
 * Особенности:
 * - Отображает данные выбранных расчётов в табличном виде
 * - Каждая строка = одно значение RPM
 * - Колонки: RPM, затем параметры для каждого выбранного расчёта
 * - Поддерживает сортировку по любой колонке
 * - Pagination для больших наборов данных
 * - Экспорт в CSV и Excel
 */
export function DataTable({ calculations, selectedIds }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  // Фильтруем только выбранные расчёты
  const selectedCalculations = useMemo(() => {
    return calculations.filter((calc) => selectedIds.includes(calc.id));
  }, [calculations, selectedIds]);

  // Подготавливаем данные для таблицы
  const tableData = useMemo(() => {
    if (selectedCalculations.length === 0) {
      return [];
    }

    // Собираем все уникальные RPM значения из всех выбранных расчётов
    const rpmSet = new Set<number>();
    selectedCalculations.forEach((calc) => {
      calc.dataPoints.forEach((point) => {
        rpmSet.add(point.RPM);
      });
    });

    // Сортируем RPM по возрастанию
    const sortedRpms = Array.from(rpmSet).sort((a, b) => a - b);

    // Создаём строки таблицы
    const rows: TableRow[] = sortedRpms.map((rpm) => {
      const calculationData: Record<string, DataPoint | undefined> = {};

      selectedCalculations.forEach((calc) => {
        // Находим точку данных с соответствующим RPM
        const dataPoint = calc.dataPoints.find((point) => point.RPM === rpm);
        calculationData[calc.id] = dataPoint;
      });

      return {
        rpm,
        calculationData,
      };
    });

    return rows;
  }, [selectedCalculations]);

  // Создаём колонки таблицы
  const columns = useMemo<ColumnDef<TableRow, any>[]>(() => {
    const columnHelper = createColumnHelper<TableRow>();

    // Колонка RPM (всегда первая)
    const cols: ColumnDef<TableRow, any>[] = [
      columnHelper.accessor('rpm', {
        header: 'RPM',
        cell: (info) => info.getValue().toFixed(0),
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,
    ];

    // Для каждого выбранного расчёта создаём колонки
    selectedCalculations.forEach((calc) => {
      // P-Av (мощность)
      cols.push(
        columnHelper.accessor(
          (row) => row.calculationData[calc.id]?.['P-Av'] as number | undefined,
          {
            id: `${calc.id}-pav`,
            header: `${calc.id} - P-Av (кВт)`,
            cell: (info) => {
              const value = info.getValue();
              return value !== undefined ? value.toFixed(2) : '-';
            },
            sortingFn: 'basic',
          }
        ) as ColumnDef<TableRow, any>
      );

      // Torque (момент)
      cols.push(
        columnHelper.accessor(
          (row) => row.calculationData[calc.id]?.Torque as number | undefined,
          {
            id: `${calc.id}-torque`,
            header: `${calc.id} - Torque (Н·м)`,
            cell: (info) => {
              const value = info.getValue();
              return value !== undefined ? value.toFixed(2) : '-';
            },
            sortingFn: 'basic',
          }
        ) as ColumnDef<TableRow, any>
      );

      // PCylMax (макс. давление в цилиндре) - среднее
      cols.push(
        columnHelper.accessor(
          (row): number | undefined => {
            const data = row.calculationData[calc.id];
            if (!data) return undefined;
            // Вычисляем среднее по всем цилиндрам
            const avg = data.PCylMax.reduce((sum, val) => sum + val, 0) / data.PCylMax.length;
            return avg;
          },
          {
            id: `${calc.id}-pcylmax`,
            header: `${calc.id} - PCylMax (бар)`,
            cell: (info) => {
              const value = info.getValue();
              return value !== undefined ? value.toFixed(2) : '-';
            },
            sortingFn: 'basic',
          }
        ) as ColumnDef<TableRow, any>
      );

      // TCylMax (макс. температура в цилиндре) - среднее
      cols.push(
        columnHelper.accessor(
          (row): number | undefined => {
            const data = row.calculationData[calc.id];
            if (!data) return undefined;
            const avg = data.TCylMax.reduce((sum, val) => sum + val, 0) / data.TCylMax.length;
            return avg;
          },
          {
            id: `${calc.id}-tcylmax`,
            header: `${calc.id} - TCylMax (°C)`,
            cell: (info) => {
              const value = info.getValue();
              return value !== undefined ? value.toFixed(0) : '-';
            },
            sortingFn: 'basic',
          }
        ) as ColumnDef<TableRow, any>
      );

      // Convergence (сходимость)
      cols.push(
        columnHelper.accessor(
          (row) => row.calculationData[calc.id]?.Convergence as number | undefined,
          {
            id: `${calc.id}-convergence`,
            header: `${calc.id} - Convergence`,
            cell: (info) => {
              const value = info.getValue();
              return value !== undefined ? value.toFixed(4) : '-';
            },
            sortingFn: 'basic',
          }
        ) as ColumnDef<TableRow, any>
      );
    });

    return cols;
  }, [selectedCalculations]);

  // Создаём экземпляр таблицы
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Обработчики экспорта
  const handleExportCSV = () => {
    const data = table.getRowModel().rows.map((row) => {
      const rowData: Record<string, string | number> = {};
      row.getAllCells().forEach((cell) => {
        const columnId = cell.column.id;
        const header = typeof cell.column.columnDef.header === 'string'
          ? cell.column.columnDef.header
          : columnId;
        rowData[header] = cell.getValue() as string | number;
      });
      return rowData;
    });

    const filename = `data-${selectedCalculations.map(c => c.id).join('-')}.csv`;
    exportToCSV(data, filename);
  };

  const handleExportExcel = () => {
    const data = table.getRowModel().rows.map((row) => {
      const rowData: Record<string, string | number> = {};
      row.getAllCells().forEach((cell) => {
        const columnId = cell.column.id;
        const header = typeof cell.column.columnDef.header === 'string'
          ? cell.column.columnDef.header
          : columnId;
        rowData[header] = cell.getValue() as string | number;
      });
      return rowData;
    });

    const filename = `data-${selectedCalculations.map(c => c.id).join('-')}.xlsx`;
    exportToExcel(data, filename);
  };

  // Если нет выбранных расчётов
  if (selectedCalculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Таблица данных</CardTitle>
          <CardDescription>Выберите расчёты для отображения данных</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Таблица данных</CardTitle>
            <CardDescription>
              {tableData.length} строк • {selectedCalculations.length} расчёт
              {selectedCalculations.length === 1 ? '' : selectedCalculations.length < 5 ? 'а' : 'ов'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={tableData.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={tableData.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Таблица */}
        <div className="relative overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:bg-accent transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {/* Индикатор сортировки */}
                        {header.column.getIsSorted() === 'asc' && (
                          <ArrowUp className="h-4 w-4" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        {!header.column.getIsSorted() && (
                          <ArrowUpDown className="h-4 w-4 opacity-30" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b transition-colors hover:bg-muted/50 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Строк на странице:
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Страница {table.getState().pagination.pageIndex + 1} из{' '}
              {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
