import { createGlobalStyle, css, DefaultTheme } from 'styled-components';

// Define theme interface
interface ThemeColors {
  fontSize: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  warning: string;
  warningForeground: string;
  border: string;
  input: string;
  inputBackground: string;
  switchBackground: string;
  fontWeightMedium: string;
  fontWeightNormal: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  radius: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

interface AppTheme {
  light: ThemeColors;
  dark: ThemeColors;
}

// Theme configuration
export const theme: AppTheme = {
  light: {
    fontSize: '16px',
    background: '#FAFAFA',
    foreground: '#2C2C2C',
    card: '#ffffff',
    cardForeground: '#2C2C2C',
    popover: '#ffffff',
    popoverForeground: '#2C2C2C',
    primary: '#1565C0',
    primaryForeground: '#ffffff',
    secondary: '#F5F5F5',
    secondaryForeground: '#2C2C2C',
    muted: '#F0F0F0',
    mutedForeground: '#757575',
    accent: '#E3F2FD',
    accentForeground: '#1565C0',
    destructive: '#D32F2F',
    destructiveForeground: '#ffffff',
    warning: '#FF6D00',
    warningForeground: '#ffffff',
    border: 'rgba(0, 0, 0, 0.1)',
    input: 'transparent',
    inputBackground: '#f3f3f5',
    switchBackground: '#cbced4',
    fontWeightMedium: '500',
    fontWeightNormal: '400',
    ring: 'oklch(0.708 0 0)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    radius: '0.625rem',
    sidebar: 'oklch(0.985 0 0)',
    sidebarForeground: 'oklch(0.145 0 0)',
    sidebarPrimary: '#030213',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.97 0 0)',
    sidebarAccentForeground: 'oklch(0.205 0 0)',
    sidebarBorder: 'oklch(0.922 0 0)',
    sidebarRing: 'oklch(0.708 0 0)',
  },
  dark: {
    fontSize: '16px',
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.145 0 0)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.145 0 0)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.985 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    accentForeground: 'oklch(0.985 0 0)',
    destructive: 'oklch(0.396 0.141 25.723)',
    destructiveForeground: 'oklch(0.637 0.237 25.331)',
    warning: '#FF6D00', // Добавлено недостающее свойство
    warningForeground: '#ffffff', // Добавлено недостающее свойство
    border: 'oklch(0.269 0 0)',
    input: 'oklch(0.269 0 0)',
    inputBackground: '#f3f3f5',
    switchBackground: '#cbced4',
    ring: 'oklch(0.439 0 0)',
    fontWeightMedium: '500',
    fontWeightNormal: '400',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    radius: '0.625rem',
    sidebar: 'oklch(0.205 0 0)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.269 0 0)',
    sidebarAccentForeground: 'oklch(0.985 0 0)',
    sidebarBorder: 'oklch(0.269 0 0)',
    sidebarRing: 'oklch(0.439 0 0)',
  },
};

// Extended styled-components theme
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: ThemeColors;
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}

// Utility function for radius calculations
const createRadius = (baseRadius: string) => ({
  sm: `calc(${baseRadius} - 4px)`,
  md: `calc(${baseRadius} - 2px)`,
  lg: baseRadius,
  xl: `calc(${baseRadius} + 4px)`,
});

// Create theme for styled-components ThemeProvider
export const styledComponentsTheme: DefaultTheme = {
  colors: theme.light,
  radius: createRadius(theme.light.radius),
};

export type Theme = typeof theme;
export type ThemeMode = keyof Theme;

// Global styles component
export const GlobalStyles = createGlobalStyle`
  :root {
    --font-size: ${({ theme }) => theme.colors.fontSize};
    --background: ${({ theme }) => theme.colors.background};
    --foreground: ${({ theme }) => theme.colors.foreground};
    --card: ${({ theme }) => theme.colors.card};
    --card-foreground: ${({ theme }) => theme.colors.cardForeground};
    --popover: ${({ theme }) => theme.colors.popover};
    --popover-foreground: ${({ theme }) => theme.colors.popoverForeground};
    --primary: ${({ theme }) => theme.colors.primary};
    --primary-foreground: ${({ theme }) => theme.colors.primaryForeground};
    --secondary: ${({ theme }) => theme.colors.secondary};
    --secondary-foreground: ${({ theme }) => theme.colors.secondaryForeground};
    --muted: ${({ theme }) => theme.colors.muted};
    --muted-foreground: ${({ theme }) => theme.colors.mutedForeground};
    --accent: ${({ theme }) => theme.colors.accent};
    --accent-foreground: ${({ theme }) => theme.colors.accentForeground};
    --destructive: ${({ theme }) => theme.colors.destructive};
    --destructive-foreground: ${({ theme }) => theme.colors.destructiveForeground};
    --warning: ${({ theme }) => theme.colors.warning};
    --warning-foreground: ${({ theme }) => theme.colors.warningForeground};
    --border: ${({ theme }) => theme.colors.border};
    --input: ${({ theme }) => theme.colors.input};
    --input-background: ${({ theme }) => theme.colors.inputBackground};
    --switch-background: ${({ theme }) => theme.colors.switchBackground};
    --font-weight-medium: ${({ theme }) => theme.colors.fontWeightMedium};
    --font-weight-normal: ${({ theme }) => theme.colors.fontWeightNormal};
    --ring: ${({ theme }) => theme.colors.ring};
    --chart-1: ${({ theme }) => theme.colors.chart1};
    --chart-2: ${({ theme }) => theme.colors.chart2};
    --chart-3: ${({ theme }) => theme.colors.chart3};
    --chart-4: ${({ theme }) => theme.colors.chart4};
    --chart-5: ${({ theme }) => theme.colors.chart5};
    --radius: ${({ theme }) => theme.colors.radius};
    --sidebar: ${({ theme }) => theme.colors.sidebar};
    --sidebar-foreground: ${({ theme }) => theme.colors.sidebarForeground};
    --sidebar-primary: ${({ theme }) => theme.colors.sidebarPrimary};
    --sidebar-primary-foreground: ${({ theme }) => theme.colors.sidebarPrimaryForeground};
    --sidebar-accent: ${({ theme }) => theme.colors.sidebarAccent};
    --sidebar-accent-foreground: ${({ theme }) => theme.colors.sidebarAccentForeground};
    --sidebar-border: ${({ theme }) => theme.colors.sidebarBorder};
    --sidebar-ring: ${({ theme }) => theme.colors.sidebarRing};
  }

  .dark {
    --background: ${theme.dark.background};
    --foreground: ${theme.dark.foreground};
    --card: ${theme.dark.card};
    --card-foreground: ${theme.dark.cardForeground};
    --popover: ${theme.dark.popover};
    --popover-foreground: ${theme.dark.popoverForeground};
    --primary: ${theme.dark.primary};
    --primary-foreground: ${theme.dark.primaryForeground};
    --secondary: ${theme.dark.secondary};
    --secondary-foreground: ${theme.dark.secondaryForeground};
    --muted: ${theme.dark.muted};
    --muted-foreground: ${theme.dark.mutedForeground};
    --accent: ${theme.dark.accent};
    --accent-foreground: ${theme.dark.accentForeground};
    --destructive: ${theme.dark.destructive};
    --destructive-foreground: ${theme.dark.destructiveForeground};
    --warning: ${theme.dark.warning};
    --warning-foreground: ${theme.dark.warningForeground};
    --border: ${theme.dark.border};
    --input: ${theme.dark.input};
    --input-background: ${theme.dark.inputBackground};
    --switch-background: ${theme.dark.switchBackground};
    --ring: ${theme.dark.ring};
    --chart-1: ${theme.dark.chart1};
    --chart-2: ${theme.dark.chart2};
    --chart-3: ${theme.dark.chart3};
    --chart-4: ${theme.dark.chart4};
    --chart-5: ${theme.dark.chart5};
    --sidebar: ${theme.dark.sidebar};
    --sidebar-foreground: ${theme.dark.sidebarForeground};
    --sidebar-primary: ${theme.dark.sidebarPrimary};
    --sidebar-primary-foreground: ${theme.dark.sidebarPrimaryForeground};
    --sidebar-accent: ${theme.dark.sidebarAccent};
    --sidebar-accent-foreground: ${theme.dark.sidebarAccentForeground};
    --sidebar-border: ${theme.dark.sidebarBorder};
    --sidebar-ring: ${theme.dark.sidebarRing};
  }

  * {
    border-color: var(--border);
    outline-color: var(--ring);
    outline-color: color-mix(in oklch, var(--ring) 50%, transparent);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
  }

  /* Base typography */
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    p {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }

    label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    button {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    input {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }
  }

  html {
    font-size: var(--font-size);
  }
`;

// Utility CSS object for theme variables
export const themeCSS = css`
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: ${styledComponentsTheme.radius.sm};
  --radius-md: ${styledComponentsTheme.radius.md};
  --radius-lg: ${styledComponentsTheme.radius.lg};
  --radius-xl: ${styledComponentsTheme.radius.xl};
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
`;

// Hook for using theme in components (if you're using React context)
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

export const useTheme = () => {
  const themeContext = useContext(ThemeContext);
  return themeContext || styledComponentsTheme;
};

// Component that applies theme variables
export const ThemeVariables = css`
  ${themeCSS}
`;