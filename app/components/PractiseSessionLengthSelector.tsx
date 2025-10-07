import type { PractiseLength } from '~/types';

type PractiseSessionLengthSelectorProps = {
  selectedLength: PractiseLength;
  onLengthChange: (length: PractiseLength) => void;
};

export function PractiseSessionLengthSelector({
  selectedLength,
  onLengthChange,
}: PractiseSessionLengthSelectorProps) {
  const lengths: PractiseLength[] = [60, 90];

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-lg font-semibold">Practice Session Length</h2>
      <div className="flex gap-4">
        {lengths.map(length => (
          <label
            key={length}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 transition-colors hover:border-blue-400"
            style={{
              borderColor: selectedLength === length ? '#3b82f6' : undefined,
              backgroundColor: selectedLength === length ? '#eff6ff' : undefined,
            }}
          >
            <input
              type="radio"
              name="practiseLength"
              value={length}
              checked={selectedLength === length}
              onChange={e => onLengthChange(Number(e.target.value) as PractiseLength)}
              className="h-4 w-4"
            />
            <span className="font-medium">{length} minutes</span>
          </label>
        ))}
      </div>
    </div>
  );
}
