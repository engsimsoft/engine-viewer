import { useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectMetadata } from '@/types';

interface ProjectInfoCardProps {
  metadata?: ProjectMetadata | null;
}

/**
 * ProjectInfoCard component
 * Compact card with "View Details" button that opens modal with full project info
 *
 * Used on client-facing project overview pages
 *
 * @param metadata - Project metadata (auto + manual sections)
 */
export default function ProjectInfoCard({ metadata }: ProjectInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback if no metadata provided
  if (!metadata) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Info
          </CardTitle>
          <CardDescription>Basic project information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No project metadata available
          </p>
          <Button disabled className="w-full">
            <ChevronRight className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { id, displayName, auto, manual } = metadata;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Info
          </CardTitle>
          <CardDescription>Engine specifications & details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compact Summary */}
          <div>
            <h3 className="font-semibold">{displayName || id}</h3>
            {auto && (
              <p className="text-sm text-muted-foreground mt-1">
                {auto.cylinders} Cyl • {auto.type} • {auto.intakeSystem}
              </p>
            )}
          </div>

          {/* Client (if present) */}
          {manual.client && (
            <div>
              <span className="text-xs text-muted-foreground">Client:</span>
              <p className="text-sm font-medium">{manual.client}</p>
            </div>
          )}

          {/* View Details Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full"
            variant="default"
          >
            <ChevronRight className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {displayName || id}
            </DialogTitle>
            <DialogDescription>
              Complete project specifications and metadata
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Engine Configuration */}
            {auto && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Engine Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{auto.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Configuration:</span>
                    <p className="font-medium capitalize">{auto.configuration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cylinders:</span>
                    <p className="font-medium">{auto.cylinders}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intake System:</span>
                    <p className="font-medium">{auto.intakeSystem}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bore × Stroke:</span>
                    <p className="font-medium">{auto.bore} × {auto.stroke} mm</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Compression Ratio:</span>
                    <p className="font-medium">{auto.compressionRatio}:1</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max RPM:</span>
                    <p className="font-medium">{auto.maxPowerRPM}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valves per Cylinder:</span>
                    <p className="font-medium">
                      {auto.valvesPerCylinder} ({auto.inletValves} In + {auto.exhaustValves} Ex)
                    </p>
                  </div>
                  {auto.displacement && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Displacement:</span>
                      <p className="font-medium">{auto.displacement} L</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Details */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Project Details</h3>
              <div className="space-y-3 text-sm">
                {manual.client && (
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <p className="font-medium mt-1">{manual.client}</p>
                  </div>
                )}
                {manual.description && (
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1">{manual.description}</p>
                  </div>
                )}
                {manual.status && (
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium mt-1 capitalize">{manual.status}</p>
                  </div>
                )}
                {manual.tags && manual.tags.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {manual.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {manual.notes && (
                  <div>
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1 text-xs">{manual.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Future: Intake/Exhaust Systems Data */}
            {/* Will be added when .prt parsing includes intake/exhaust geometry */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
