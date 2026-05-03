import * as stylex from '@stylexjs/stylex';
import { color } from '~/styles/tokens.stylex';
import { borderRadius, fontSize, fontWeight, spacing } from '~/styles/constants.stylex';

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
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.borderDefault,
    backgroundColor: color.bgSecondary,
    padding: spacing.md,
  },
  heading: {
    marginBottom: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    color: color.textSecondary,
  },
  value: {
    fontWeight: fontWeight.semibold,
  },
  dividerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: color.borderLight,
    paddingTop: spacing.sm,
  },
  remainingGreen: {
    fontWeight: fontWeight.bold,
    color: color.textSuccess,
  },
  remainingRed: {
    fontWeight: fontWeight.bold,
    color: color.textDanger,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressTrack: {
    height: 12,
    width: '100%',
    overflow: 'hidden',
    borderRadius: borderRadius.full,
    backgroundColor: color.progressTrack,
  },
  progressBar: (width: string, isOver: boolean) => ({
    height: '100%',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    backgroundColor: isOver ? color.progressDanger : color.progressSuccess,
    width,
  }),
  percentLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: color.textMuted,
    textAlign: 'center',
  },
});
