import { Skeleton } from "./skeleton";

export function StatsSkeleton() {
  return (
    <div className="bg-white border border-[#e2e8e4] rounded-3xl p-6 shadow-sm">
      <div className="mb-4 flex justify-between items-start">
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-t border-[#e2e8e4]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-8 py-5">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-[#e2e8e4] rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
