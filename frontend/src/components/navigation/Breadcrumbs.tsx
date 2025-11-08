import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string; // undefined = current page (not clickable)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs Navigation Component
 *
 * v3.0 Architecture:
 * - Show only on Level 3 pages (Analysis Pages: Performance, Traces, etc.)
 * - Format: "Engine Viewer > Project Name > Analysis Type"
 * - First items are clickable links, last item is current page (not clickable)
 *
 * Example usage:
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Engine Viewer', href: '/' },
 *     { label: 'Vesta 1.6 IM', href: '/project/vesta-16-im' },
 *     { label: 'Performance & Efficiency' } // current page
 *   ]}
 * />
 * ```
 *
 * Features:
 * - Clickable links with hover effects
 * - ChevronRight separators between items
 * - Last item (current page) displayed in muted color, not clickable
 * - Responsive: text truncation on small screens
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            {/* Breadcrumb item */}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`truncate max-w-[200px] ${
                  isLast ? 'text-foreground font-medium' : ''
                }`}
              >
                {item.label}
              </span>
            )}

            {/* Separator */}
            {!isLast && (
              <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
