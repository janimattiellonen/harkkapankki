import * as stylex from '@stylexjs/stylex';

export const borderRadius = stylex.defineConsts({
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
});

export const spacing = stylex.defineConsts({
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
});

export const fontSize = stylex.defineConsts({
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
});

export const fontWeight = stylex.defineConsts({
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
});
