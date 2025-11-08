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
  // convertValue,  // Will be used in future unified conversion refactoring
  getPowerUnit,
  getTorqueUnit,
  getPressureUnit,
  getTemperatureUnit,
  // getParameterUnit,  // Will be used in future unified conversion refactoring
} from '@/lib/unitsConversion';
// import { PARAMETERS } from '@/config/parameters';  // Will be used in future refactoring
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface DataTableProps {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
  /** Selected preset (1-6) to filter displayed columns */
  selectedPreset: 1 | 2 | 3 | 4 | 5 | 6;
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

  // Preset 1: Power & Torque
  /** Power (P-Av) in original SI units (kW) */
  powerKW: number;
  /** Torque in original SI units (N·m) */
  torqueNm: number;

  // Preset 2: MEP (Mean Effective Pressures)
  /** FMEP (Friction MEP) in bar - scalar */
  fmep: number | undefined;
  /** IMEP (Indicated MEP) in bar - per-cylinder averaged */
  imep: number | undefined;
  /** BMEP (Brake MEP) in bar - per-cylinder averaged */
  bmep: number | undefined;
  /** PMEP (Pumping MEP) in bar - per-cylinder averaged */
  pmep: number | undefined;

  // Preset 3: Critical Engine Values
  /** PCylMax (Max Cylinder Pressure) in bar - per-cylinder averaged */
  pcylMax: number | undefined;
  /** TC-Av (Average Cylinder Temperature) in °C - per-cylinder averaged */
  tcAv: number | undefined;
  /** MaxDeg (Angle at Max Pressure) in degrees - per-cylinder averaged */
  maxDeg: number | undefined;

  // Preset 5: Combustion
  /** TAF (Air/Fuel Ratio) - scalar */
  taf: number | undefined;
  /** Timing (Ignition Timing) in degrees - scalar */
  timing: number | undefined;
  /** Delay (Ignition Delay) in degrees - per-cylinder averaged */
  delay: number | undefined;
  /** Durat (Combustion Duration) in degrees - per-cylinder averaged */
  durat: number | undefined;

  // Preset 6: Efficiency
  /** DRatio (Delivery Ratio) - per-cylinder averaged */
  dRatio: number | undefined;
  /** PurCyl (Mixture Purity) - per-cylinder averaged */
  purCyl: number | undefined;
  /** Seff (Scavenging Efficiency) - per-cylinder averaged */
  seff: number | undefined;
  /** Teff (Trapping Efficiency) - per-cylinder averaged */
  teff: number | undefined;
  /** Ceff (Charging Efficiency / VE) - per-cylinder averaged */
  ceff: number | undefined;

  // Legacy fields (for Preset 4 Custom Chart)
  /** Average cylinder temperature (TCylMax) in °C - only in .det files */
  temperatureCylC: number | undefined;
  /** Average exhaust temperature (TUbMax) in °C */
  temperatureExhC: number | undefined;
  /** Convergence value - only in .det files */
  convergence: number | undefined;
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

  // Helper: average per-cylinder array or return scalar
  const averageIfArray = (value: any): number | undefined => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      return value.reduce((sum, val) => sum + val, 0) / value.length;
    }
    return value as number;
  };

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
        // Preset 1: Power & Torque (always available)
        const powerKW = point['P-Av'];
        const torqueNm = point.Torque;

        // Preset 2: MEP parameters
        // Educational visualization: FMEP and PMEP shown as negative for energy balance clarity
        // Formula: BMEP = IMEP - FMEP - PMEP
        const fmep = averageIfArray(point.FMEP) !== undefined ? -averageIfArray(point.FMEP)! : undefined;
        const imep = averageIfArray(point.IMEP); // IMEP per-cylinder (positive)
        const bmep = averageIfArray(point.BMEP); // BMEP per-cylinder (positive)
        const pmep = averageIfArray(point.PMEP) !== undefined ? -averageIfArray(point.PMEP)! : undefined;

        // Preset 3: Critical parameters
        const pcylMax = averageIfArray(point.PCylMax); // PCylMax per-cylinder
        const tcAv = averageIfArray(point['TC-Av']); // TC-Av per-cylinder (maps from TCylMax in .det)
        const maxDeg = averageIfArray(point.MaxDeg); // MaxDeg per-cylinder

        // Preset 5: Combustion parameters
        const taf = averageIfArray(point.TAF); // TAF scalar
        const timing = averageIfArray(point.Timing); // Timing scalar
        const delay = averageIfArray(point.Delay); // Delay per-cylinder
        const durat = averageIfArray(point.Durat); // Durat per-cylinder

        // Preset 6: Efficiency parameters (all per-cylinder)
        const dRatio = averageIfArray(point.DRatio);
        const purCyl = averageIfArray(point.PurCyl);
        const seff = averageIfArray(point.Seff);
        const teff = averageIfArray(point.Teff);
        const ceff = averageIfArray(point.Ceff);

        // Legacy fields for Preset 4 (Custom Chart)
        const temperatureCylC = averageIfArray(point.TCylMax); // TCylMax per-cylinder
        const temperatureExhC = averageIfArray(point.TUbMax); // TUbMax per-cylinder
        const convergence = point.Convergence; // Scalar

        rows.push({
          id: `${calc.calculationId}-${point.RPM}`,
          source: `${calc.projectName} → ${calc.calculationName}`,
          sourceColor: calc.color,
          calculationId: calc.calculationId,
          rpm: point.RPM,
          // Preset 1
          powerKW,
          torqueNm,
          // Preset 2
          fmep,
          imep,
          bmep,
          pmep,
          // Preset 3
          pcylMax,
          tcAv,
          maxDeg,
          // Preset 5
          taf,
          timing,
          delay,
          durat,
          // Preset 6
          dRatio,
          purCyl,
          seff,
          teff,
          ceff,
          // Legacy (Preset 4)
          temperatureCylC,
          temperatureExhC,
          convergence,
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
  const getPresetName = (preset: 1 | 2 | 3 | 4 | 5 | 6): string => {
    switch (preset) {
      case 1:
        return 'Power & Torque Data';
      case 2:
        return 'MEP Data';
      case 3:
        return 'Critical Engine Values';
      case 4:
        return 'Complete Data';
      case 5:
        return 'Combustion Data';
      case 6:
        return 'Efficiency Data';
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

      // === Preset 1: Power & Torque ===

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

      // === Preset 2: MEP (Mean Effective Pressures) ===

      // FMEP column
      columnHelper.accessor('fmep', {
        header: `FMEP (${pressureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          const converted = convertPressure(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // IMEP column
      columnHelper.accessor('imep', {
        header: `IMEP (${pressureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          const converted = convertPressure(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // BMEP column
      columnHelper.accessor('bmep', {
        header: `BMEP (${pressureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          const converted = convertPressure(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // PMEP column
      columnHelper.accessor('pmep', {
        header: `PMEP (${pressureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          const converted = convertPressure(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // === Preset 3: Critical Engine Values ===

      // PCylMax column
      columnHelper.accessor('pcylMax', {
        header: `PCylMax (${pressureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          const converted = convertPressure(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // TC-Av column
      columnHelper.accessor('tcAv', {
        header: `TC-Av (${temperatureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          const converted = convertTemperature(value, units);
          return converted.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // MaxDeg column
      columnHelper.accessor('maxDeg', {
        header: 'MaxDeg (°)',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // === Preset 5: Combustion ===

      // TAF column
      columnHelper.accessor('taf', {
        header: 'TAF',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Timing column
      columnHelper.accessor('timing', {
        header: 'Timing (°)',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Delay column
      columnHelper.accessor('delay', {
        header: 'Delay (°)',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Durat column
      columnHelper.accessor('durat', {
        header: 'Durat (°)',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // === Preset 6: Efficiency ===

      // DRatio column
      columnHelper.accessor('dRatio', {
        header: 'DRatio',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // PurCyl column
      columnHelper.accessor('purCyl', {
        header: 'PurCyl',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Seff column
      columnHelper.accessor('seff', {
        header: 'Seff',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Teff column
      columnHelper.accessor('teff', {
        header: 'Teff',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // Ceff column
      columnHelper.accessor('ceff', {
        header: 'Ceff (VE)',
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—';
          return value.toFixed(decimals);
        },
        sortingFn: 'basic',
      }) as ColumnDef<TableRow, any>,

      // === Legacy columns (for Preset 4 Custom Chart) ===

      // TCylMax column with units conversion (average cylinder temperature)
      columnHelper.accessor('temperatureCylC', {
        header: `TCylMax (${temperatureUnit})`,
        cell: (info) => {
          const value = info.getValue();
          if (value === undefined) return '—'; // Not available in .pou format
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
          if (value === undefined) return '—';
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
          if (value === undefined) return '—'; // Not available in .pou format
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
      // Preset 2: MEP (Mean Effective Pressures)
      filteredCols.push(cols[4]); // FMEP
      filteredCols.push(cols[5]); // IMEP
      filteredCols.push(cols[6]); // BMEP
      filteredCols.push(cols[7]); // PMEP
    } else if (selectedPreset === 3) {
      // Preset 3: Critical Engine Values
      filteredCols.push(cols[8]);  // PCylMax
      filteredCols.push(cols[9]);  // TC-Av
      filteredCols.push(cols[10]); // MaxDeg
    } else if (selectedPreset === 4) {
      // Preset 4: Custom Chart - show only selected parameters
      // Map parameter IDs to column indices
      const paramToColIndex: Record<string, number> = {
        'P-Av': 2,
        'Torque': 3,
        'PCylMax': 8,      // Updated index (new pcylMax column)
        'TCylMax': 20,     // Updated index (legacy temperatureCylC)
        'TUbMax': 21,      // Updated index (legacy temperatureExhC)
        'Convergence': 22, // Updated index (legacy convergence)
      };

      // Add columns for selected parameters only
      selectedCustomParams.forEach((selectedParam) => {
        const paramId = selectedParam.id;
        const colIndex = paramToColIndex[paramId];
        if (colIndex !== undefined && cols[colIndex]) {
          filteredCols.push(cols[colIndex]);
        }
      });
    } else if (selectedPreset === 5) {
      // Preset 5: Combustion
      filteredCols.push(cols[11]); // TAF
      filteredCols.push(cols[12]); // Timing
      filteredCols.push(cols[13]); // Delay
      filteredCols.push(cols[14]); // Durat
    } else if (selectedPreset === 6) {
      // Preset 6: Efficiency
      filteredCols.push(cols[15]); // DRatio
      filteredCols.push(cols[16]); // PurCyl
      filteredCols.push(cols[17]); // Seff
      filteredCols.push(cols[18]); // Teff
      filteredCols.push(cols[19]); // Ceff (VE)
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
        // Preset 2: MEP
        exportRow[`FMEP (${pressureUnit})`] = row.fmep !== undefined ? convertPressure(row.fmep, units).toFixed(decimals) : 'N/A';
        exportRow[`IMEP (${pressureUnit})`] = row.imep !== undefined ? convertPressure(row.imep, units).toFixed(decimals) : 'N/A';
        exportRow[`BMEP (${pressureUnit})`] = row.bmep !== undefined ? convertPressure(row.bmep, units).toFixed(decimals) : 'N/A';
        exportRow[`PMEP (${pressureUnit})`] = row.pmep !== undefined ? convertPressure(row.pmep, units).toFixed(decimals) : 'N/A';
      } else if (selectedPreset === 3) {
        // Preset 3: Critical Engine Values
        exportRow[`PCylMax (${pressureUnit})`] = row.pcylMax !== undefined ? convertPressure(row.pcylMax, units).toFixed(decimals) : 'N/A';
        exportRow[`TC-Av (${temperatureUnit})`] = row.tcAv !== undefined ? convertTemperature(row.tcAv, units).toFixed(decimals) : 'N/A';
        exportRow['MaxDeg (°)'] = row.maxDeg !== undefined ? row.maxDeg.toFixed(decimals) : 'N/A';
      } else if (selectedPreset === 4) {
        // Preset 4: Custom Chart - export only selected parameters
        selectedCustomParams.forEach((selectedParam) => {
          const paramId = selectedParam.id;
          if (paramId === 'P-Av') {
            exportRow[`P-Av (${powerUnit})`] = convertPower(row.powerKW, units).toFixed(decimals);
          } else if (paramId === 'Torque') {
            exportRow[`Torque (${torqueUnit})`] = convertTorque(row.torqueNm, units).toFixed(decimals);
          } else if (paramId === 'PCylMax') {
            exportRow[`PCylMax (${pressureUnit})`] = row.pcylMax !== undefined ? convertPressure(row.pcylMax, units).toFixed(decimals) : 'N/A';
          } else if (paramId === 'TCylMax') {
            exportRow[`TCylMax (${temperatureUnit})`] = row.temperatureCylC !== undefined ? convertTemperature(row.temperatureCylC, units).toFixed(decimals) : 'N/A';
          } else if (paramId === 'TUbMax') {
            exportRow[`TUbMax (${temperatureUnit})`] = row.temperatureExhC !== undefined ? convertTemperature(row.temperatureExhC, units).toFixed(decimals) : 'N/A';
          } else if (paramId === 'Convergence') {
            exportRow['Convergence'] = row.convergence !== undefined ? row.convergence.toFixed(4) : 'N/A';
          }
        });
      } else if (selectedPreset === 5) {
        // Preset 5: Combustion
        exportRow['TAF'] = row.taf !== undefined ? row.taf.toFixed(decimals) : 'N/A';
        exportRow['Timing (°)'] = row.timing !== undefined ? row.timing.toFixed(decimals) : 'N/A';
        exportRow['Delay (°)'] = row.delay !== undefined ? row.delay.toFixed(decimals) : 'N/A';
        exportRow['Durat (°)'] = row.durat !== undefined ? row.durat.toFixed(decimals) : 'N/A';
      } else if (selectedPreset === 6) {
        // Preset 6: Efficiency
        exportRow['DRatio'] = row.dRatio !== undefined ? row.dRatio.toFixed(decimals) : 'N/A';
        exportRow['PurCyl'] = row.purCyl !== undefined ? row.purCyl.toFixed(decimals) : 'N/A';
        exportRow['Seff'] = row.seff !== undefined ? row.seff.toFixed(decimals) : 'N/A';
        exportRow['Teff'] = row.teff !== undefined ? row.teff.toFixed(decimals) : 'N/A';
        exportRow['Ceff (VE)'] = row.ceff !== undefined ? row.ceff.toFixed(decimals) : 'N/A';
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
        // Preset 2: MEP
        exportRow[`FMEP (${pressureUnit})`] = row.fmep !== undefined ? convertPressure(row.fmep, units).toFixed(decimals) : 'N/A';
        exportRow[`IMEP (${pressureUnit})`] = row.imep !== undefined ? convertPressure(row.imep, units).toFixed(decimals) : 'N/A';
        exportRow[`BMEP (${pressureUnit})`] = row.bmep !== undefined ? convertPressure(row.bmep, units).toFixed(decimals) : 'N/A';
        exportRow[`PMEP (${pressureUnit})`] = row.pmep !== undefined ? convertPressure(row.pmep, units).toFixed(decimals) : 'N/A';
      } else if (selectedPreset === 3) {
        // Preset 3: Critical Engine Values
        exportRow[`PCylMax (${pressureUnit})`] = row.pcylMax !== undefined ? convertPressure(row.pcylMax, units).toFixed(decimals) : 'N/A';
        exportRow[`TC-Av (${temperatureUnit})`] = row.tcAv !== undefined ? convertTemperature(row.tcAv, units).toFixed(decimals) : 'N/A';
        exportRow['MaxDeg (°)'] = row.maxDeg !== undefined ? row.maxDeg.toFixed(decimals) : 'N/A';
      } else if (selectedPreset === 4) {
        // Preset 4: Custom Chart - export only selected parameters
        selectedCustomParams.forEach((selectedParam) => {
          const paramId = selectedParam.id;
          if (paramId === 'P-Av') {
            exportRow[`P-Av (${powerUnit})`] = convertPower(row.powerKW, units).toFixed(decimals);
          } else if (paramId === 'Torque') {
            exportRow[`Torque (${torqueUnit})`] = convertTorque(row.torqueNm, units).toFixed(decimals);
          } else if (paramId === 'PCylMax') {
            exportRow[`PCylMax (${pressureUnit})`] = row.pcylMax !== undefined ? convertPressure(row.pcylMax, units).toFixed(decimals) : 'N/A';
          } else if (paramId === 'TCylMax') {
            exportRow[`TCylMax (${temperatureUnit})`] = row.temperatureCylC !== undefined ? convertTemperature(row.temperatureCylC, units).toFixed(decimals) : 'N/A';
          } else if (paramId === 'TUbMax') {
            exportRow[`TUbMax (${temperatureUnit})`] = row.temperatureExhC !== undefined ? convertTemperature(row.temperatureExhC, units).toFixed(decimals) : 'N/A';
          } else if (paramId === 'Convergence') {
            exportRow['Convergence'] = row.convergence !== undefined ? row.convergence.toFixed(4) : 'N/A';
          }
        });
      } else if (selectedPreset === 5) {
        // Preset 5: Combustion
        exportRow['TAF'] = row.taf !== undefined ? row.taf.toFixed(decimals) : 'N/A';
        exportRow['Timing (°)'] = row.timing !== undefined ? row.timing.toFixed(decimals) : 'N/A';
        exportRow['Delay (°)'] = row.delay !== undefined ? row.delay.toFixed(decimals) : 'N/A';
        exportRow['Durat (°)'] = row.durat !== undefined ? row.durat.toFixed(decimals) : 'N/A';
      } else if (selectedPreset === 6) {
        // Preset 6: Efficiency
        exportRow['DRatio'] = row.dRatio !== undefined ? row.dRatio.toFixed(decimals) : 'N/A';
        exportRow['PurCyl'] = row.purCyl !== undefined ? row.purCyl.toFixed(decimals) : 'N/A';
        exportRow['Seff'] = row.seff !== undefined ? row.seff.toFixed(decimals) : 'N/A';
        exportRow['Teff'] = row.teff !== undefined ? row.teff.toFixed(decimals) : 'N/A';
        exportRow['Ceff (VE)'] = row.ceff !== undefined ? row.ceff.toFixed(decimals) : 'N/A';
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
