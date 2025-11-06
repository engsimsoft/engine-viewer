/**
 * FiltersBar Component
 *
 * Provides filtering, searching and sorting controls for projects dashboard
 * Used in HomePage to filter ProjectCard grid
 *
 * Features:
 * - Multi-select filters: Type, Intake, Created Year, Cylinders
 * - Search input: displayName, client
 * - Sort dropdown: date modified, date created, name, cylinders
 * - Active filters display with remove chips
 * - Clear all button
 */

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelect, { type MultiSelectOption } from '@/components/shared/MultiSelect';

export interface ProjectFiltersState {
  type: Array<'NA' | 'Turbo' | 'Supercharged' | 'ITB' | 'IM'>;
  valves: number[]; // Valves per cylinder (2, 3, 4, 5)
  cylinders: number[];
  tags: string[];
  search: string;
  sortBy: 'date' | 'created' | 'name' | 'cylinders';
}

interface FiltersBarProps {
  filters: ProjectFiltersState;
  onFiltersChange: (filters: ProjectFiltersState) => void;
  onClearAll: () => void;
  resultsCount: number;
  totalCount: number;
  availableTags: string[]; // All unique tags from all projects
}

// Filter options configuration
const TYPE_OPTIONS: MultiSelectOption<'NA' | 'Turbo' | 'Supercharged' | 'ITB' | 'IM'>[] = [
  { value: 'NA', label: 'NA' },
  { value: 'Turbo', label: 'Turbo' },
  { value: 'Supercharged', label: 'Supercharged' },
  { value: 'ITB', label: 'ITB', section: 'Intake (NA only)' },
  { value: 'IM', label: 'IM' },
];

const VALVES_OPTIONS: MultiSelectOption<number>[] = [
  { value: 2, label: '2V' },
  { value: 3, label: '3V' },
  { value: 4, label: '4V' },
  { value: 5, label: '5V' },
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
  availableTags,
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

  // Generate tags options from available tags
  const tagsOptions: MultiSelectOption<string>[] = availableTags.map(tag => ({
    value: tag,
    label: tag,
  }));

  // Count active filters
  const activeFiltersCount =
    filters.type.length +
    filters.valves.length +
    filters.cylinders.length +
    filters.tags.length +
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
          label="Engine"
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(value) => updateFilter('type', value)}
          placeholder="All Engines"
          className="w-[160px]"
        />

        <MultiSelect
          label="Valves per Cylinder"
          options={VALVES_OPTIONS}
          value={filters.valves}
          onChange={(value) => updateFilter('valves', value)}
          placeholder="Valves/Cyl"
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

        <MultiSelect
          label="Tags"
          options={tagsOptions}
          value={filters.tags}
          onChange={(value) => updateFilter('tags', value)}
          placeholder="All Tags"
          className="w-[160px]"
        />

        {/* Sort Dropdown */}
        <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
          <SelectTrigger className="h-10 w-[160px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Modified (newest)</SelectItem>
            <SelectItem value="created">Created (oldest)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="cylinders">Cylinders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {/* Engine filters (Type + Intake combined) */}
          {filters.type.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('type', type)}
            >
              {type}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {/* Valves filters */}
          {filters.valves.map((valves) => (
            <Badge
              key={valves}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('valves', valves)}
            >
              {valves}V
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

          {/* Tags filters */}
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('tags', tag)}
            >
              {tag}
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

          {/* Clear all badge (iPhone style - consistent with other filters) */}
          <Badge
            variant="secondary"
            className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={onClearAll}
          >
            Clear all
            <X className="h-3 w-3" />
          </Badge>
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
