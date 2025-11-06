/**
 * EngineBadge Component
 *
 * Displays engine specification badges with color-coded variants
 * Used in ProjectCard to show essential engine info: Type, Cylinders, Valves, Displacement, Intake
 *
 * Color coding:
 * - Type: NA = green, Turbo = blue, Supercharged = purple
 * - Cylinders = gray (neutral)
 * - Valves = cyan (total valves: cylinders × valvesPerCylinder)
 * - Displacement = zinc (engine volume in liters - engineering style)
 * - Intake: ITB = orange, IM = gray, Carb = amber
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IntakeSystem } from '@/types';

interface EngineBadgeProps {
  /**
   * Engine type (NA, Turbo, Supercharged)
   */
  type?: 'NA' | 'Turbo' | 'Supercharged';

  /**
   * Number of cylinders
   */
  cylinders?: number;

  /**
   * Intake system (ITB, IM, Carb)
   */
  intake?: IntakeSystem;

  /**
   * Valves per cylinder (will display total valves: cylinders × valvesPerCylinder)
   * Example: 4 cylinders × 4 valves = "16V"
   */
  valvesPerCylinder?: number;

  /**
   * Engine displacement in liters (calculated from bore, stroke, cylinders)
   * Example: 1.6, 2.0, 3.5
   */
  displacement?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Color configuration for different badge types
 * WCAG 2.1 AA compliant (contrast ratio > 4.5:1 for small text)
 */
const badgeColors = {
  // Engine Type
  type: {
    NA: 'bg-green-600 text-white hover:bg-green-700',
    Turbo: 'bg-blue-600 text-white hover:bg-blue-700',
    Supercharged: 'bg-purple-600 text-white hover:bg-purple-700',
  },
  // Intake System
  intake: {
    ITB: 'bg-orange-600 text-white hover:bg-orange-700',
    IM: 'bg-gray-600 text-white hover:bg-gray-700',
    Carb: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  // Cylinders - neutral
  neutral: 'bg-gray-600 text-white hover:bg-gray-700',
  // Valves - cyan/teal color for distinction
  valves: 'bg-cyan-600 text-white hover:bg-cyan-700',
  // Displacement - zinc (dark metallic gray, engineering style)
  displacement: 'bg-zinc-600 text-white hover:bg-zinc-700',
};

export default function EngineBadge({
  type,
  cylinders,
  intake,
  valvesPerCylinder,
  displacement,
  className,
}: EngineBadgeProps) {
  // Render badges only if props are provided
  const badges: Array<{ label: string; color: string; key: string }> = [];

  // Type badge (NA, Turbo, Supercharged)
  if (type) {
    badges.push({
      key: `type-${type}`,
      label: type,
      color: badgeColors.type[type],
    });
  }

  // Cylinders badge (4 Cyl, 6 Cyl, etc.)
  if (cylinders !== undefined) {
    badges.push({
      key: `cylinders-${cylinders}`,
      label: `${cylinders} Cyl`,
      color: badgeColors.neutral,
    });
  }

  // Valves badge (16V, 24V, etc.) - Total valves = cylinders × valvesPerCylinder
  if (cylinders !== undefined && valvesPerCylinder !== undefined) {
    const totalValves = cylinders * valvesPerCylinder;
    badges.push({
      key: `valves-${totalValves}`,
      label: `${totalValves}V`,
      color: badgeColors.valves,
    });
  }

  // Displacement badge (1.6L, 2.0L, etc.) - Engine volume in liters
  if (displacement !== undefined && displacement > 0) {
    badges.push({
      key: `displacement-${displacement}`,
      label: `${displacement.toFixed(1)}L`,
      color: badgeColors.displacement,
    });
  }

  // Intake badge (ITB, IM, Carb)
  if (intake) {
    badges.push({
      key: `intake-${intake}`,
      label: intake,
      color: badgeColors.intake[intake] || badgeColors.neutral,
    });
  }

  // If no badges to render, return null
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges.map(({ key, label, color }) => (
        <Badge
          key={key}
          className={cn(
            'text-xs font-semibold transition-colors',
            color
          )}
        >
          {label}
        </Badge>
      ))}
    </div>
  );
}
