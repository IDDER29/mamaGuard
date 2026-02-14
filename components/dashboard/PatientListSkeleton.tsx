import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface PatientListSkeletonProps {
  count?: number;
}

export default function PatientListSkeleton({
  count = 3,
}: PatientListSkeletonProps) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-4 animate-pulse">
          <div className="flex items-start gap-4">
            {/* Avatar Skeleton */}
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              {/* Name and Badge */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Symptoms */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
