/**
 * EngineBadge Component
 *
 * Displays engine specification badges with color-coded variants
 * Used in ProjectCard to show engine configuration (type, intake, exhaust, cylinders)
 *
 * Color coding:
 * - Type: NA = green, Turbo = blue, Supercharged = purple
 * - Intake: ITB = orange, IM = gray
 * - Exhaust/Cylinders = gray (neutral)
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IntakeSystem, ExhaustSystem } from '@/types';

interface EngineBadgeProps {
  /**
   * Engine type (NA, Turbo, Supercharged)
   */
  type?: 'NA' | 'Turbo' | 'Supercharged';

  /**
   * Intake system (ITB, IM)
   */
  intake?: IntakeSystem;

  /**
   * Exhaust system (4-2-1, 4-1, tri-y, etc.)
   */
  exhaust?: ExhaustSystem;

  /**
   * Number of cylinders
   */
  cylinders?: number;

  /**
   * Engine configuration (inline, V, boxer, W)
   */
  configuration?: 'inline' | 'V' | 'boxer' | 'W';

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
  // Exhaust/Cylinders/Configuration - neutral
  neutral: 'bg-gray-600 text-white hover:bg-gray-700',
};

/**
 * Display labels for configuration types
 */
const configurationLabels = {
  inline: 'Inline',
  V: 'V',
  boxer: 'Boxer',
  W: 'W',
};

export default function EngineBadge({
  type,
  intake,
  exhaust,
  cylinders,
  configuration,
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

  // Configuration badge (Inline, V, Boxer, W)
  if (configuration) {
    badges.push({
      key: `config-${configuration}`,
      label: configurationLabels[configuration],
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

  // Exhaust badge (4-2-1, 4-1, tri-y, etc.)
  if (exhaust) {
    badges.push({
      key: `exhaust-${exhaust}`,
      label: exhaust,
      color: badgeColors.neutral,
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
