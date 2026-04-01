import * as stylex from '@stylexjs/stylex';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

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
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    paddingBlock: 8,
    paddingInline: 16,
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
      default: '#2563eb',
      ':hover': '#1d4ed8',
    },
    color: '#ffffff',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': '#3b82f6',
    },
  },
  secondary: {
    backgroundColor: {
      default: '#ffffff',
      ':hover': '#f9fafb',
    },
    color: '#374151',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': '#3b82f6',
    },
  },
  danger: {
    backgroundColor: {
      default: '#dc2626',
      ':hover': '#b91c1c',
    },
    color: '#ffffff',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': '#ef4444',
    },
  },
});
