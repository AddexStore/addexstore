/* JS mirror of the design-system tokens defined in src/styles/theme.css.
   Prefer CSS variables in components; use this only where JS values are
   required (charts, inline SVG fills). */

export const theme = {
  colors: {
    gold: {
      50: '#FBF8F1', 100: '#F6EFDF', 200: '#EDDFBB', 300: '#E0C78D',
      400: '#D3B274', 500: '#C6A972', 600: '#B3925C', 700: '#92754A',
      800: '#6F5838', 900: '#4F3F27',
    },
    ivory: { 50: '#FCFBF9', 100: '#F7F4EF', 200: '#EFEAE2', 300: '#E4DDD2', 400: '#D2C9BB', 500: '#B4AA99' },
    charcoal: {
      50: '#F5F4F2', 100: '#E9E7E3', 200: '#CECBC5', 300: '#ABA69E',
      400: '#807B72', 500: '#5C574E', 600: '#454038', 700: '#2E2B25',
      800: '#1D1B17', 900: '#12110E',
    },
    bg: {
      primary: '#F7F4EF',
      secondary: '#F2EEE6',
      card: '#FFFFFF',
      hover: '#EFEAE2',
      input: '#F6F3ED',
    },
    text: {
      primary: '#1D1B17',
      secondary: '#5C574E',
      muted: '#8A8478',
    },
    accent: {
      gold: '#C6A972',
      goldHover: '#B3925C',
      goldDark: '#92754A',
      secondary: '#2E2B25',
    },
    border: {
      DEFAULT: '#E5DED1',
      divider: '#EDE7DB',
    },
    semantic: {
      success: '#2F7D5A',
      error: '#B3403A',
      warning: '#B9872E',
      info: '#4F6272',
    },
    chart: {
      gold: '#C6A972',
      blue: '#4F6272',
      green: '#2F7D5A',
      purple: '#8B5CF6',
      rose: '#D99BA8',
      teal: '#3E9C88',
      orange: '#D09A3E',
    },
    overlay: {
      dark: 'rgba(29, 27, 23, 0.42)',
      light: 'rgba(29, 27, 23, 0.04)',
      gold: 'rgba(198, 169, 114, 0.15)',
    },
  },
  spacing: {
    section: 'section-lux',
    container: 'container-lux',
  },
  typography: {
    heading: 'heading-display',
    body: 'font-sans',
    eyebrow: 'eyebrow',
  },
  borderRadius: {
    card: 'rounded-card',
    button: 'rounded-full',
    field: 'rounded-field',
  },
  shadow: {
    card: 'shadow-card',
    cardHover: 'shadow-card-hover',
    button: 'shadow-gold-soft',
    glow: 'shadow-gold',
  },
  animation: {
    transition: 'transition-all duration-300',
    hoverLift: 'hover:-translate-y-0.5',
  },
}

export const colors = theme.colors

export const buttonStyles = {
  primary: 'btn btn-primary',
  gold: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline: 'btn btn-outline',
  danger: 'btn btn-danger',
  ghost: 'btn btn-ghost',
}

export const cardStyles = {
  card: 'card',
  interactive: 'card card-interactive',
  glass: 'card card-glass',
}

export const inputStyles = {
  base: 'input',
}
