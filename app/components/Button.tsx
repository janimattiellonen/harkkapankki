import * as stylex from '@stylexjs/stylex';
import { color } from '~/styles/tokens.stylex';
import { borderRadius, fontSize, fontWeight, spacing } from '~/styles/constants.stylex';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> & {
  variant?: ButtonVariant;
  style?: stylex.StyleXStyles;
};

export function Button({ variant = 'primary', style, children, ...rest }: ButtonProps) {
  return (
    <button {...rest} {...stylex.props(styles.base, styles[variant], style)}>
      {children}
    </button>
  );
}

const styles = stylex.create({
  base: {
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    cursor: {
      default: 'pointer',
      ':disabled': 'not-allowed',
    },
    opacity: {
      default: 1,
      ':disabled': 0.5,
    },
    borderWidth: 0,
    borderStyle: 'none',
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': 2,
    },
  },
  primary: {
    backgroundColor: {
      default: color.buttonPrimaryBg,
      ':hover': color.buttonPrimaryBgHover,
    },
    color: color.buttonPrimaryColor,
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.buttonPrimaryOutline,
    },
  },
  secondary: {
    backgroundColor: {
      default: color.buttonSecondaryBg,
      ':hover': color.buttonSecondaryBgHover,
    },
    color: color.buttonSecondaryColor,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.buttonSecondaryBorder,
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.buttonSecondaryOutline,
    },
  },
  danger: {
    backgroundColor: {
      default: color.buttonDangerBg,
      ':hover': color.buttonDangerBgHover,
    },
    color: color.buttonDangerColor,
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.buttonDangerOutline,
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: {
      default: color.textAccent,
      ':hover': color.textAccentHover,
    },
    paddingBlock: 0,
    paddingInline: 0,
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.buttonPrimaryOutline,
    },
  },
  icon: {
    backgroundColor: 'transparent',
    paddingBlock: spacing.xs,
    paddingInline: spacing.xs,
    borderRadius: borderRadius.sm,
    outlineColor: {
      default: 'transparent',
      ':focus-visible': color.buttonPrimaryOutline,
    },
  },
});
