/**
 * SkeletonCard Component
 *
 * Loading placeholder for ProjectCard
 * "iPhone quality" UX - smooth skeleton UI instead of spinners
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Display Name skeleton */}
            <div className="h-6 bg-muted rounded w-3/4" />
            {/* Description skeleton */}
            <div className="h-4 bg-muted rounded w-full" />
          </div>
          {/* Status badge skeleton */}
          <div className="h-6 w-20 bg-muted rounded shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Client skeleton */}
        <div className="h-4 bg-muted rounded w-1/2" />

        {/* Engine badges skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>

        {/* Engine info skeleton */}
        <div className="h-4 bg-muted rounded w-1/3" />

        {/* Date skeleton */}
        <div className="h-4 bg-muted rounded w-2/5" />
      </CardContent>

      <CardFooter className="flex gap-2">
        {/* Edit button skeleton */}
        <div className="h-10 flex-1 bg-muted rounded" />
        {/* Open button skeleton */}
        <div className="h-10 flex-1 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}
