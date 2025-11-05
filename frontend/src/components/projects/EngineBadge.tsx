/**
 * EngineBadge Component
 *
 * Displays engine specification badges with color-coded variants
 * Used in ProjectCard to show ONLY essential engine info: Type, Cylinders, Intake
 *
 * Color coding:
 * - Type: NA = green, Turbo = blue, Supercharged = purple
 * - Intake: ITB = orange, IM = gray
 * - Cylinders = gray (neutral)
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
   * Intake system (ITB, IM)
   */
  intake?: IntakeSystem;

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
  },
  // Cylinders - neutral
  neutral: 'bg-gray-600 text-white hover:bg-gray-700',
};

export default function EngineBadge({
  type,
  cylinders,
  intake,
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

  // Intake badge (ITB, IM)
  if (intake) {
    badges.push({
      key: `intake-${intake}`,
      label: intake,
      color: badgeColors.intake[intake],
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
