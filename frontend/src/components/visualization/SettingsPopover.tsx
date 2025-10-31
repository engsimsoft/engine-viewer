/**
 * Settings Popover Component
 *
 * Phase 2 - Section 2.2
 *
 * Features:
 * - Units selection (SI / American / HP)
 * - Theme selection (Light / Dark)
 * - Chart settings (Animation, Grid, Decimals)
 * - Instant apply (no Save button)
 * - Persists to localStorage via Zustand middleware
 *
 * Layout:
 * ┌──────────────────────┐
 * │ Settings         [×] │
 * ├──────────────────────┤
 * │ 🌍 Units             │
 * │ ⦿ SI Units           │
 * │ ○ American Units     │
 * │ ○ Power in HP        │
 * ├──────────────────────┤
 * │ 🎨 Theme             │
 * │ ⦿ Light  ○ Dark      │
 * ├──────────────────────┤
 * │ 📊 Chart             │
 * │ ☑ Animation Enabled  │
 * │ ☑ Show Grid          │
 * │ Decimals: [2 ▼]      │
 * └──────────────────────┘
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/stores/appStore';

interface SettingsPopoverProps {
  /** Trigger element (Settings icon button) */
  children: React.ReactNode;
}

/**
 * Settings Popover Component
 *
 * Displays application settings in a popover dialog.
 * All changes are applied instantly and persisted to localStorage.
 *
 * @example
 * ```tsx
 * <SettingsPopover>
 *   <Button variant="ghost" size="icon">
 *     <Settings className="h-5 w-5" />
 *   </Button>
 * </SettingsPopover>
 * ```
 */
export function SettingsPopover({ children }: SettingsPopoverProps) {
  // Get state and actions from store
  const units = useAppStore((state) => state.units);
  const theme = useAppStore((state) => state.theme);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const isSettingsOpen = useAppStore((state) => state.isSettingsOpen);

  const setUnits = useAppStore((state) => state.setUnits);
  const setTheme = useAppStore((state) => state.setTheme);
  const updateChartSettings = useAppStore((state) => state.updateChartSettings);
  const toggleSettings = useAppStore((state) => state.toggleSettings);

  /**
   * Handle animation checkbox change
   */
  const handleAnimationChange = (checked: boolean) => {
    updateChartSettings({ animation: checked });
  };

  /**
   * Handle show grid checkbox change
   */
  const handleGridChange = (checked: boolean) => {
    updateChartSettings({ showGrid: checked });
  };

  /**
   * Handle decimals select change
   */
  const handleDecimalsChange = (value: string) => {
    updateChartSettings({ decimals: parseInt(value, 10) });
  };

  return (
    <Popover open={isSettingsOpen} onOpenChange={toggleSettings}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>

      <PopoverContent
        className="w-80"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Settings</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={toggleSettings}
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Units Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <h4 className="font-medium text-sm">Units</h4>
          </div>

          <RadioGroup
            value={units}
            onValueChange={(value) => setUnits(value as 'si' | 'american' | 'hp')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="units-si" />
              <Label htmlFor="units-si" className="cursor-pointer font-normal">
                SI Units <span className="text-muted-foreground text-xs">(kW • N·m • bar • °C)</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="american" id="units-american" />
              <Label htmlFor="units-american" className="cursor-pointer font-normal">
                American Units <span className="text-muted-foreground text-xs">(bhp • lb-ft • psi • °F)</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hp" id="units-hp" />
              <Label htmlFor="units-hp" className="cursor-pointer font-normal">
                Power in HP <span className="text-muted-foreground text-xs">(PS • N·m • bar • °C)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-4" />

        {/* Theme Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <h4 className="font-medium text-sm">Theme</h4>
          </div>

          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as 'light' | 'dark')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="cursor-pointer font-normal">
                Light
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="cursor-pointer font-normal">
                Dark
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-4" />

        {/* Chart Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h4 className="font-medium text-sm">Chart</h4>
          </div>

          {/* Animation Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="chart-animation"
              checked={chartSettings.animation}
              onCheckedChange={handleAnimationChange}
            />
            <Label
              htmlFor="chart-animation"
              className="cursor-pointer font-normal text-sm"
            >
              Animation Enabled
            </Label>
          </div>

          {/* Show Grid Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="chart-grid"
              checked={chartSettings.showGrid}
              onCheckedChange={handleGridChange}
            />
            <Label
              htmlFor="chart-grid"
              className="cursor-pointer font-normal text-sm"
            >
              Show Grid
            </Label>
          </div>

          {/* Decimals Select */}
          <div className="flex items-center justify-between">
            <Label htmlFor="chart-decimals" className="font-normal text-sm">
              Decimals
            </Label>
            <Select
              value={chartSettings.decimals.toString()}
              onValueChange={handleDecimalsChange}
            >
              <SelectTrigger id="chart-decimals" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SettingsPopover;
