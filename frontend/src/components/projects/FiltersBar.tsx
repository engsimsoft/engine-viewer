/**
 * FiltersBar Component
 *
 * Provides filtering, searching and sorting controls for projects dashboard
 * Used in HomePage to filter ProjectCard grid
 *
 * Features:
 * - Multi-select filters: Type, Intake, Exhaust, Cylinders
 * - Search input: displayName, client
 * - Sort dropdown: date, name, cylinders
 * - Active filters display with remove chips
 * - Clear all button
 */

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelect, { type MultiSelectOption } from '@/components/shared/MultiSelect';
import type { IntakeSystem, ExhaustSystem } from '@/types';

export interface ProjectFiltersState {
  type: Array<'NA' | 'Turbo' | 'Supercharged'>;
  intake: IntakeSystem[];
  exhaust: ExhaustSystem[];
  cylinders: number[];
  search: string;
  sortBy: 'date' | 'name' | 'cylinders';
}

interface FiltersBarProps {
  filters: ProjectFiltersState;
  onFiltersChange: (filters: ProjectFiltersState) => void;
  onClearAll: () => void;
  resultsCount: number;
  totalCount: number;
}

// Filter options configuration
const TYPE_OPTIONS: MultiSelectOption<'NA' | 'Turbo' | 'Supercharged'>[] = [
  { value: 'NA', label: 'NA' },
  { value: 'Turbo', label: 'Turbo' },
  { value: 'Supercharged', label: 'Supercharged' },
];

const INTAKE_OPTIONS: MultiSelectOption<IntakeSystem>[] = [
  { value: 'ITB', label: 'ITB' },
  { value: 'IM', label: 'IM' },
];

const EXHAUST_OPTIONS: MultiSelectOption<ExhaustSystem>[] = [
  { value: '4-2-1', label: '4-2-1' },
  { value: '4-1', label: '4-1' },
  { value: 'tri-y', label: 'tri-y' },
  { value: '4-1-2', label: '4-1-2' },
  { value: '8-4-2-1', label: '8-4-2-1' },
];

const CYLINDERS_OPTIONS: MultiSelectOption<number>[] = [
  { value: 1, label: '1 Cyl' },
  { value: 2, label: '2 Cyl' },
  { value: 3, label: '3 Cyl' },
  { value: 4, label: '4 Cyl' },
  { value: 5, label: '5 Cyl' },
  { value: 6, label: '6 Cyl' },
  { value: 8, label: '8 Cyl' },
];

export default function FiltersBar({
  filters,
  onFiltersChange,
  onClearAll,
  resultsCount,
  totalCount,
}: FiltersBarProps) {
  const updateFilter = <K extends keyof ProjectFiltersState>(
    key: K,
    value: ProjectFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (filterType: keyof ProjectFiltersState, value?: any) => {
    if (filterType === 'search') {
      updateFilter('search', '');
    } else if (filterType === 'sortBy') {
      updateFilter('sortBy', 'date');
    } else {
      const currentArray = filters[filterType] as any[];
      updateFilter(
        filterType,
        value !== undefined
          ? currentArray.filter((v) => v !== value)
          : []
      );
    }
  };

  // Count active filters
  const activeFiltersCount =
    filters.type.length +
    filters.intake.length +
    filters.exhaust.length +
    filters.cylinders.length +
    (filters.search ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0 || filters.sortBy !== 'date';

  return (
    <div className="space-y-4 mb-6">
      {/* Filter Controls Row */}
      <div className="flex flex-wrap gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or client..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
          {filters.search && (
            <button
              onClick={() => removeFilter('search')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Multi-Select Filters */}
        <MultiSelect
          label="Type"
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(value) => updateFilter('type', value)}
          placeholder="All Types"
          className="w-[160px]"
        />

        <MultiSelect
          label="Intake"
          options={INTAKE_OPTIONS}
          value={filters.intake}
          onChange={(value) => updateFilter('intake', value)}
          placeholder="All Intakes"
          className="w-[160px]"
        />

        <MultiSelect
          label="Exhaust"
          options={EXHAUST_OPTIONS}
          value={filters.exhaust}
          onChange={(value) => updateFilter('exhaust', value)}
          placeholder="All Exhausts"
          className="w-[160px]"
        />

        <MultiSelect
          label="Cylinders"
          options={CYLINDERS_OPTIONS}
          value={filters.cylinders}
          onChange={(value) => updateFilter('cylinders', value)}
          placeholder="All Cylinders"
          className="w-[160px]"
        />

        {/* Sort Dropdown */}
        <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date (newest)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="cylinders">Cylinders</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearAll} className="gap-2">
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {/* Type filters */}
          {filters.type.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('type', type)}
            >
              Type: {type}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {/* Intake filters */}
          {filters.intake.map((intake) => (
            <Badge
              key={intake}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('intake', intake)}
            >
              Intake: {intake}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {/* Exhaust filters */}
          {filters.exhaust.map((exhaust) => (
            <Badge
              key={exhaust}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('exhaust', exhaust)}
            >
              Exhaust: {exhaust}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {/* Cylinders filters */}
          {filters.cylinders.map((cyl) => (
            <Badge
              key={cyl}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('cylinders', cyl)}
            >
              {cyl} Cyl
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {/* Search badge */}
          {filters.search && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('search')}
            >
              Search: "{filters.search}"
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{resultsCount}</span> of{' '}
        <span className="font-semibold text-foreground">{totalCount}</span> projects
      </div>
    </div>
  );
}
