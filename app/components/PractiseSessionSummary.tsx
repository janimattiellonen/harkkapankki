import type { PractiseLength } from "~/types";

type PractiseSessionSummaryProps = {
  practiseLength: PractiseLength;
  totalAllocated: number;
};

export function PractiseSessionSummary({
  practiseLength,
  totalAllocated,
}: PractiseSessionSummaryProps) {
  const remaining = practiseLength - totalAllocated;
  const isOverTime = remaining < 0;

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
      <h3 className="mb-3 text-lg font-semibold">Session Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Practice Length:</span>
          <span className="font-semibold">{practiseLength} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Total Allocated:</span>
          <span className="font-semibold">{totalAllocated} min</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-700">
            {isOverTime ? 'Over:' : 'Remaining:'}
          </span>
          <span
            className={`font-bold ${
              isOverTime ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {Math.abs(remaining)} min
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all ${
              isOverTime ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min((totalAllocated / practiseLength) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-600 text-center">
          {((totalAllocated / practiseLength) * 100).toFixed(0)}% allocated
        </div>
      </div>
    </div>
  );
}
