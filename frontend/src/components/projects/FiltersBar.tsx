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

import { Search, X, SlidersHorizontal, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import MultiSelect, { type MultiSelectOption } from '@/components/shared/MultiSelect';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface ProjectFiltersState {
  type: Array<'NA' | 'Turbo' | 'Supercharged' | 'ITB' | 'IM' | 'Carb'>;
  valves: number[]; // Valves per cylinder (2, 3, 4, 5)
  cylinders: number[];
  tags: string[]; // User tags only
  status: Array<'active' | 'completed' | 'archived'>; // Separate status field
  search: string;
  sortBy: 'date' | 'created' | 'name';
}

interface FiltersBarProps {
  filters: ProjectFiltersState;
  onFiltersChange: (filters: ProjectFiltersState) => void;
  onClearAll: () => void;
  resultsCount: number;
  totalCount: number;
  availableTags: string[]; // All unique tags from all projects
  filterCounts: {
    cylinders: Record<number, number>;
    valves: Record<number, number>;
    types: Record<string, number>;
    tags: Record<string, number>;
    status: Record<string, number>; // Status counts (active, completed, archived)
  };
}

// Filter options configuration
const TYPE_OPTIONS: MultiSelectOption<'NA' | 'Turbo' | 'Supercharged' | 'ITB' | 'IM' | 'Carb'>[] = [
  { value: 'NA', label: 'NA' },
  { value: 'Turbo', label: 'Turbo' },
  { value: 'Supercharged', label: 'Supercharged' },
  { value: 'ITB', label: 'ITB', section: 'Intake (NA only)' },
  { value: 'IM', label: 'IM' },
  { value: 'Carb', label: 'Carb' },
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

const STATUS_OPTIONS: MultiSelectOption<string>[] = [
  { value: 'active', label: 'Active', section: 'Project Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function FiltersBar({
  filters,
  onFiltersChange,
  onClearAll,
  resultsCount,
  totalCount,
  availableTags,
  filterCounts,
}: FiltersBarProps) {
  const [sortStatusOpen, setSortStatusOpen] = useState(false);

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
    } else if (filterType === 'status') {
      const currentArray = filters.status as any[];
      updateFilter(
        'status',
        value !== undefined
          ? currentArray.filter((v) => v !== value)
          : []
      );
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

  const handleStatusToggle = (status: 'active' | 'completed' | 'archived') => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatus);
  };

  // Generate tags options: User Tags only (Status moved to Sort & Status dropdown)
  const userTagsOptions: MultiSelectOption<string>[] = (availableTags || []).map(tag => ({
    value: tag,
    label: tag,
  }));

  // Enrich filter options with counts
  const cylindersWithCounts = CYLINDERS_OPTIONS.map(option => ({
    ...option,
    count: filterCounts.cylinders[option.value] || 0,
  }));

  const valvesWithCounts = VALVES_OPTIONS.map(option => ({
    ...option,
    count: filterCounts.valves[option.value] || 0,
  }));

  const typeWithCounts = TYPE_OPTIONS.map(option => ({
    ...option,
    count: filterCounts.types[option.value] || 0,
  }));

  const tagsWithCounts = userTagsOptions.map(option => ({
    ...option,
    count: filterCounts.tags[option.value] || 0,
  }));

  // Count active filters
  const activeFiltersCount =
    filters.type.length +
    filters.valves.length +
    filters.cylinders.length +
    filters.tags.length +
    filters.status.length +
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
          options={typeWithCounts}
          value={filters.type}
          onChange={(value) => updateFilter('type', value)}
          placeholder="All Engines"
          className="w-[160px]"
        />

        <MultiSelect
          label="Valves per Cylinder"
          options={valvesWithCounts}
          value={filters.valves}
          onChange={(value) => updateFilter('valves', value)}
          placeholder="Valves/Cyl"
          className="w-[160px]"
        />

        <MultiSelect
          label="Cylinders"
          options={cylindersWithCounts}
          value={filters.cylinders}
          onChange={(value) => updateFilter('cylinders', value)}
          placeholder="All Cylinders"
          className="w-[160px]"
        />

        <MultiSelect
          label="Tags"
          options={tagsWithCounts}
          value={filters.tags}
          onChange={(value) => updateFilter('tags', value)}
          placeholder="All Tags"
          className="w-[160px]"
        />

        {/* Combined Sort & Status Dropdown */}
        <Popover open={sortStatusOpen} onOpenChange={setSortStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={sortStatusOpen}
              className="h-10 w-[160px] justify-between"
            >
              <span className="truncate">
                {filters.status.length > 0
                  ? `Status (${filters.status.length})`
                  : filters.sortBy === 'date'
                  ? 'Sort & Status'
                  : filters.sortBy === 'created'
                  ? 'Created (oldest)'
                  : 'Name (A-Z)'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <div className="p-2">
              {/* Sort By Section */}
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Sort By
              </div>
              <div className="space-y-1">
                {[
                  { value: 'date' as const, label: 'Modified (newest)' },
                  { value: 'created' as const, label: 'Created (oldest)' },
                  { value: 'name' as const, label: 'Name (A-Z)' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer',
                      filters.sortBy === option.value && 'bg-accent'
                    )}
                    onClick={() => updateFilter('sortBy', option.value)}
                  >
                    <span className="text-sm flex-1">{option.label}</span>
                    {filters.sortBy === option.value && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div className="my-2 border-t border-border" />

              {/* Status Section */}
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Status
              </div>
              <div className="space-y-1">
                {STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleStatusToggle(option.value as 'active' | 'completed' | 'archived')}
                  >
                    <Checkbox
                      checked={filters.status.includes(option.value as 'active' | 'completed' | 'archived')}
                      onCheckedChange={() => handleStatusToggle(option.value as 'active' | 'completed' | 'archived')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm flex-1">
                      {option.label}
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({filterCounts.status[option.value] || 0})
                      </span>
                    </span>
                    {filters.status.includes(option.value as 'active' | 'completed' | 'archived') && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              {/* Clear Status button */}
              {filters.status.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => updateFilter('status', [])}
                  >
                    Clear status filters
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
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

          {/* Status filters */}
          {filters.status.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter('status', status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
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
