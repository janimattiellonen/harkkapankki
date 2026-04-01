import * as stylex from '@stylexjs/stylex';

import type { PractiseLength } from '~/types';

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
    <div {...stylex.props(styles.container)}>
      <h3 {...stylex.props(styles.heading)}>Session Summary</h3>
      <div {...stylex.props(styles.rows)}>
        <div {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.label)}>Practice Length:</span>
          <span {...stylex.props(styles.value)}>{practiseLength} min</span>
        </div>
        <div {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.label)}>Total Allocated:</span>
          <span {...stylex.props(styles.value)}>{totalAllocated} min</span>
        </div>
        <div {...stylex.props(styles.dividerRow)}>
          <span {...stylex.props(styles.label)}>{isOverTime ? 'Over:' : 'Remaining:'}</span>
          <span {...stylex.props(isOverTime ? styles.remainingRed : styles.remainingGreen)}>
            {Math.abs(remaining)} min
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div {...stylex.props(styles.progressContainer)}>
        <div {...stylex.props(styles.progressTrack)}>
          <div
            {...stylex.props(
              styles.progressBar(
                `${Math.min((totalAllocated / practiseLength) * 100, 100)}%`,
                isOverTime
              )
            )}
          />
        </div>
        <div {...stylex.props(styles.percentLabel)}>
          {((totalAllocated / practiseLength) * 100).toFixed(0)}% allocated
        </div>
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  heading: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 600,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    color: '#374151',
  },
  value: {
    fontWeight: 600,
  },
  dividerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  remainingGreen: {
    fontWeight: 700,
    color: '#16a34a',
  },
  remainingRed: {
    fontWeight: 700,
    color: '#dc2626',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressTrack: {
    height: 12,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: '#e5e7eb',
  },
  progressBar: (width: string, isOver: boolean) => ({
    height: '100%',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    backgroundColor: isOver ? '#ef4444' : '#22c55e',
    width,
  }),
  percentLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
});
