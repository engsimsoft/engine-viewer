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
import type { CalculationReference } from '@/types/v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToCSV, exportToExcel } from '@/utils/export';
import { useMultiProjectData, getLoadedCalculations } from '@/hooks/useMultiProjectData';
import { useAppStore } from '@/stores/appStore';
import {
  convertPower,
  convertTorque,
  convertPressure,
  convertTemperature,
  getPowerUnit,
  getTorqueUnit,
  getPressureUnit,
  getTemperatureUnit,
} from '@/lib/unitsConversion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface DataTableProps {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
  /** Selected preset (1-4) to filter displayed columns */
  selectedPreset: 1 | 2 | 3 | 4;
}

/**
 * Тип строки таблицы - одна строка = одна точка данных от одного расчёта
 * Multi-project support: строки от всех calculations объединены в одну таблицу
 */
interface TableRow {
  /** Unique row ID (calculationId + RPM) */
  id: string;
  /** Source calculation label for display (e.g., "Vesta 1.6 IM → $1") */
  source: string;
  /** Color for source indicator */
  sourceColor: string;
  /** Calculation ID (for filtering) */
  calculationId: string;
  /** RPM value */
  rpm: number;
  /** Power (P-Av) in original SI units (kW) */
  powerKW: number;
  /** Torque in original SI units (N·m) */
  torqueNm: number;
  /** Average cylinder pressure in original SI units (bar) */
  pressureBar: number;
  /** Average cylinder temperature (TCylMax) in original SI units (°C) */
  temperatureCylC: number;
  /** Average exhaust temperature (TUbMax) in original SI units (°C) */
  temperatureExhC: number;
  /** Convergence value */
  convergence: number;
}

/**
 * Компонент таблицы данных с сортировкой, пагинацией и экспортом (v2.0)
 *
 * Features:
 * - Multi-project calculation comparison
 * - Source column with color indicator
 * - Dynamic units conversion (SI/American/HP)
 * - Calculation filter dropdown
 * - Export to CSV/Excel with units
 * - Sorting and pagination
 */
export function DataTable({ calculations, selectedPreset }: DataTableProps) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { decimals } = chartSettings;
  // Get selected custom parameters for Preset 4
  const selectedCustomParams = useAppStore((state) => state.selectedCustomParams);

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [selectedCalculationFilter, setSelectedCalculationFilter] = useState<string>('all');

  // Load cross-project data
  const {
    calculations: loadedCalculations,
    isLoading,
    error,
    refetch
  } = useMultiProjectData(calculations);

  // Filter calculations with loaded data
  const readyCalculations = useMemo(() => {
    return getLoadedCalculations(loadedCalculations);
  }, [loadedCalculations]);

  // Prepare table data from all calculations
  const tableData = useMemo(() => {
    if (readyCalculations.length === 0) {
      return [];
    }

    const rows: TableRow[] = [];

    // Create one row per data point from each calculation
    readyCalculations.forEach((calc) => {
      if (!calc.data || calc.data.length === 0) return;

      calc.data.forEach((point) => {
        // Calculate averages for cylinder-specific parameters
        const avgPressure = point.PCylMax.reduce((sum, val) => sum + val, 0) / point.PCylMax.length;
        const avgTCylMax = point.TCylMax.reduce((sum, val) => sum + val, 0) / point.TCylMax.length;
        const avgTUbMax = point.TUbMax.reduce((sum, val) => sum + val, 0) / point.TUbMax.length;

        rows.push({
          id: `${calc.calculationId}-${point.RPM}`,
          source: `${calc.projectName} → ${calc.calculationName}`,
          sourceColor: calc.color,
          calculationId: calc.calculationId,
          rpm: point.RPM,
          powerKW: point['P-Av'],
          torqueNm: point.Torque,
          pressureBar: avgPressure,
          temperatureCylC: avgTCylMax,
          temperatureExhC: avgTUbMax,
          convergence: point.Convergence,
        });
      });
    });

    return rows;
  }, [readyCalculations]);

  // Apply calculation filter
  const filteredTableData = useMemo(() => {
    if (selectedCalculationFilter === 'all') {
      return tableData;
    }
    return tableData.filter((row) => row.calculationId === selectedCalculationFilter);
  }, [tableData, selectedCalculationFilter]);

  // Get unit labels (dynamic based on current units setting)
  const powerUnit = getPowerUnit(units);
  const torqueUnit = getTorqueUnit(units);
  const pressureUnit = getPressureUnit(units);
  const temperatureUnit = getTemperatureUnit(units);

  // Get preset name for CardDescription
  const getPresetName = (preset: 1 | 2 | 3 | 4): string => {
    switch (preset) {
      case 1:
        return 'Power & Torque Data';
      case 2:
        return 'Pressure Data';
      case 3:
        return 'Temperature Data';
      case 4:
        return 'Complete Data';
      default:
        return 'Data Table';
    }
  };

  // Create table columns
  const columns = useMemo<ColumnDef<TableRow, any>[]>(() => {
    const columnHelper = createColumnHelper<TableRow>();

    const cols: ColumnDef<TableRow, any>[] = [
      // Source column with color indicator
      columnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: row.sourceColor }}
              />
              <span className="font-medium">{info.getValue()}</span>
            </div>
          );
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // RPM column
      columnHelper.accessor('rpm', {
        header: 'RPM',
        cell: (info) => info.getValue().toFixed(0),
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // P-Av column with units conversion
      columnHelper.accessor('powerKW', {
        header: `P-Av (${powerUnit})`,
        cell: (info) => {
          const value = info.getValue();
          const converted = convertPower(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Torque column with units conversion
      columnHelper.accessor('torqueNm', {
        header: `Torque (${torqueUnit})`,
        cell: (info) => {
          const value = info.getValue();
          const converted = convertTorque(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // PCylMax column with units conversion (average)
      columnHelper.accessor('pressureBar', {
        header: `PCylMax (${pressureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          const converted = convertPressure(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // TCylMax column with units conversion (average cylinder temperature)
      columnHelper.accessor('temperatureCylC', {
        header: `TCylMax (${temperatureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          const converted = convertTemperature(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // TUbMax column with units conversion (average exhaust temperature)
      columnHelper.accessor('temperatureExhC', {
        header: `TUbMax (${temperatureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          const converted = convertTemperature(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Convergence column (no units conversion)
      columnHelper.accessor('convergence', {
        header: 'Convergence',
        cell: (info) => {
          const value = info.getValue();
          return value.toFixed(4);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,
    ];

    // Filter columns based on selected preset
    const filteredCols: ColumnDef<TableRow, any>[] = [];

    // SOURCE and RPM are always visible
    filteredCols.push(cols[0]); // Source
    filteredCols.push(cols[1]); // RPM

    if (selectedPreset === 1) {
      // Preset 1: Power & Torque
      filteredCols.push(cols[2]); // P-Av
      filteredCols.push(cols[3]); // Torque
    } else if (selectedPreset === 2) {
      // Preset 2: Pressure & Temperature
      filteredCols.push(cols[4]); // PCylMax
    } else if (selectedPreset === 3) {
      // Preset 3: Temperature Analysis
      filteredCols.push(cols[5]); // TCylMax
      filteredCols.push(cols[6]); // TUbMax
    } else if (selectedPreset === 4) {
      // Preset 4: Custom Chart - show only selected parameters
      // Map parameter IDs to column indices
      const paramToColIndex: Record<string, number> = {
        'P-Av': 2,
        'Torque': 3,
        'PCylMax': 4,
        'TCylMax': 5,
        'TUbMax': 6,
        'Convergence': 7,
      };

      // Add columns for selected parameters only
      selectedCustomParams.forEach((paramId) => {
        const colIndex = paramToColIndex[paramId];
        if (colIndex !== undefined && cols[colIndex]) {
          filteredCols.push(cols[colIndex]);
        }
      });
    }

    return filteredCols;
  }, [units, decimals, powerUnit, torqueUnit, pressureUnit, temperatureUnit, selectedPreset, selectedCustomParams]);

  // Create table instance with filtered data
  const table = useReactTable({
    data: filteredTableData,
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

  // Export handlers with units conversion
  // Exports only the columns visible in current preset
  const handleExportCSV = () => {
    const data = filteredTableData.map((row) => {
      const exportRow: Record<string, string> = {
        'Source': row.source,
        'RPM': row.rpm.toFixed(0),
      };

      // Add columns based on selected preset
      if (selectedPreset === 1) {
        // Preset 1: Power & Torque
        exportRow[`P-Av (${powerUnit})`] = convertPower(row.powerKW, units).toFixed(decimals);
        exportRow[`Torque (${torqueUnit})`] = convertTorque(row.torqueNm, units).toFixed(decimals);
      } else if (selectedPreset === 2) {
        // Preset 2: Pressure
        exportRow[`PCylMax (${pressureUnit})`] = convertPressure(row.pressureBar, units).toFixed(decimals);
      } else if (selectedPreset === 3) {
        // Preset 3: Temperature
        exportRow[`TCylMax (${temperatureUnit})`] = convertTemperature(row.temperatureCylC, units).toFixed(decimals);
        exportRow[`TUbMax (${temperatureUnit})`] = convertTemperature(row.temperatureExhC, units).toFixed(decimals);
      } else if (selectedPreset === 4) {
        // Preset 4: Custom Chart - export only selected parameters
        selectedCustomParams.forEach((paramId) => {
          if (paramId === 'P-Av') {
            exportRow[`P-Av (${powerUnit})`] = convertPower(row.powerKW, units).toFixed(decimals);
          } else if (paramId === 'Torque') {
            exportRow[`Torque (${torqueUnit})`] = convertTorque(row.torqueNm, units).toFixed(decimals);
          } else if (paramId === 'PCylMax') {
            exportRow[`PCylMax (${pressureUnit})`] = convertPressure(row.pressureBar, units).toFixed(decimals);
          } else if (paramId === 'TCylMax') {
            exportRow[`TCylMax (${temperatureUnit})`] = convertTemperature(row.temperatureCylC, units).toFixed(decimals);
          } else if (paramId === 'TUbMax') {
            exportRow[`TUbMax (${temperatureUnit})`] = convertTemperature(row.temperatureExhC, units).toFixed(decimals);
          } else if (paramId === 'Convergence') {
            exportRow['Convergence'] = row.convergence.toFixed(4);
          }
        });
      }

      return exportRow;
    });

    const filename = `data-${readyCalculations.map(c => c.calculationId).join('-')}.csv`;
    exportToCSV(data, filename);
  };

  const handleExportExcel = () => {
    const data = filteredTableData.map((row) => {
      const exportRow: Record<string, string> = {
        'Source': row.source,
        'RPM': row.rpm.toFixed(0),
      };

      // Add columns based on selected preset
      if (selectedPreset === 1) {
        // Preset 1: Power & Torque
        exportRow[`P-Av (${powerUnit})`] = convertPower(row.powerKW, units).toFixed(decimals);
        exportRow[`Torque (${torqueUnit})`] = convertTorque(row.torqueNm, units).toFixed(decimals);
      } else if (selectedPreset === 2) {
        // Preset 2: Pressure
        exportRow[`PCylMax (${pressureUnit})`] = convertPressure(row.pressureBar, units).toFixed(decimals);
      } else if (selectedPreset === 3) {
        // Preset 3: Temperature
        exportRow[`TCylMax (${temperatureUnit})`] = convertTemperature(row.temperatureCylC, units).toFixed(decimals);
        exportRow[`TUbMax (${temperatureUnit})`] = convertTemperature(row.temperatureExhC, units).toFixed(decimals);
      } else if (selectedPreset === 4) {
        // Preset 4: Custom Chart - export only selected parameters
        selectedCustomParams.forEach((paramId) => {
          if (paramId === 'P-Av') {
            exportRow[`P-Av (${powerUnit})`] = convertPower(row.powerKW, units).toFixed(decimals);
          } else if (paramId === 'Torque') {
            exportRow[`Torque (${torqueUnit})`] = convertTorque(row.torqueNm, units).toFixed(decimals);
          } else if (paramId === 'PCylMax') {
            exportRow[`PCylMax (${pressureUnit})`] = convertPressure(row.pressureBar, units).toFixed(decimals);
          } else if (paramId === 'TCylMax') {
            exportRow[`TCylMax (${temperatureUnit})`] = convertTemperature(row.temperatureCylC, units).toFixed(decimals);
          } else if (paramId === 'TUbMax') {
            exportRow[`TUbMax (${temperatureUnit})`] = convertTemperature(row.temperatureExhC, units).toFixed(decimals);
          } else if (paramId === 'Convergence') {
            exportRow['Convergence'] = row.convergence.toFixed(4);
          }
        });
      }

      return exportRow;
    });

    const filename = `data-${readyCalculations.map(c => c.calculationId).join('-')}.xlsx`;
    exportToExcel(data, filename);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>Loading calculation data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>Failed to load data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no calculations selected
  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>Select calculations to display data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty state - calculations selected but no data loaded
  if (readyCalculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>
              {getPresetName(selectedPreset)} • {filteredTableData.length} rows • {readyCalculations.length} calculation{readyCalculations.length === 1 ? '' : 's'}
              {selectedCalculationFilter !== 'all' && ' (filtered)'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredTableData.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={filteredTableData.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Calculation Filter Dropdown */}
        {readyCalculations.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={selectedCalculationFilter}
              onValueChange={setSelectedCalculationFilter}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All calculations</SelectItem>
                {readyCalculations.map((calc) => (
                  <SelectItem key={calc.calculationId} value={calc.calculationId}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: calc.color }}
                      />
                      <span>{calc.projectName} → {calc.calculationName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
              Rows per page:
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
              Page {table.getState().pagination.pageIndex + 1} of{' '}
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
