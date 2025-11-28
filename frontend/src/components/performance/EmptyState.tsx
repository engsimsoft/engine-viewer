import { BarChart2, Scale, HelpCircle } from 'lucide-react';

/**
 * Empty State Component for Performance & Efficiency Page
 *
 * Displays feature discovery cards when no calculations are selected.
 * iPhone-style design: Visual, clean, self-explanatory.
 *
 * Features:
 * - 3 feature cards with icons
 * - Clean typography and spacing
 * - Subtle hint at bottom
 * - No need for manual reading
 *
 * @example
 * ```tsx
 * if (calculations.length === 0) {
 *   return <EmptyState />;
 * }
 * ```
 */
export function EmptyState() {
  const features = [
    {
      icon: BarChart2,
      title: 'Six Chart Presets',
      items: [
        'Power & Torque (P-Av, Torque)',
        'MEP (FMEP, IMEP, BMEP, PMEP)',
        'Critical Values (PCylMax, TC-Av, MaxDeg)',
        'Custom Chart (user-selected parameters)',
        'Combustion (TAF, Timing, Delay, Duration)',
        'Efficiency (DRatio, Ceff)',
      ],
    },
    {
      icon: Scale,
      title: 'Cross-Project Comparison',
      items: [
        'Compare up to 5 calculations simultaneously',
        '1 primary + 4 comparison calculations',
        'Visualize different engine configurations',
        'Before/After analysis',
      ],
    },
    {
      icon: HelpCircle,
      title: 'Parameters Reference',
      items: [
        'Help button in header',
        'Complete guide to all engine parameters',
        'Brief and detailed descriptions',
        'Units and Per-Cylinder indicators',
      ],
    },
  ];

  return (
    <div className="flex items-center justify-center h-[600px] bg-muted/10 rounded-lg border">
      <div className="max-w-4xl mx-auto px-8 py-12 text-center space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Explore Performance & Efficiency Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Professional tools for engine performance visualization and comparison
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card rounded-xl border p-6 text-left space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base text-foreground">
                  {feature.title}
                </h3>

                {/* Feature List */}
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-primary/60">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Hint */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
          <span className="text-lg">👈</span>
          <span>Select a calculation from the left panel to start</span>
        </div>
      </div>
    </div>
  );
}
