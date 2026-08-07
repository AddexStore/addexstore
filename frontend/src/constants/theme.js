/* JS mirror of the design-system tokens defined in src/styles/theme.css.
   Prefer CSS variables in components; use this only where JS values are
   required (charts, inline SVG fills). */

export const theme = {
  colors: {
    gold: {
      50: '#FBF7EF', 100: '#F5EDDC', 200: '#EBDCC1', 300: '#DDC494',
      400: '#CDAC71', 500: '#C2A366', 600: '#A98952', 700: '#866A3F',
      800: '#634E2E', 900: '#453620',
    },
    ivory: { 50: '#FEFDFB', 100: '#F9F6F0', 200: '#F1EBE0', 300: '#E7DFCF', 400: '#D6CBB4', 500: '#B9AB90' },
    charcoal: {
      50: '#F6F4F0', 100: '#EBE7DF', 200: '#D5CEC1', 300: '#B2A998',
      400: '#877D6D', 500: '#61584B', 600: '#484038', 700: '#2E2821',
      800: '#221D16', 900: '#181410',
    },
    bg: {
      primary: '#FCFAF5',
      secondary: '#F6F1E6',
      card: '#FFFFFF',
      hover: '#F3EEE4',
      input: '#FAF7F1',
    },
    text: {
      primary: '#1C1813',
      secondary: '#5E5547',
      muted: '#948878',
    },
    accent: {
      gold: '#C2A366',
      goldHover: '#A98952',
      goldDark: '#866A3F',
      secondary: '#2E2821',
    },
    border: {
      DEFAULT: '#EAE1CF',
      divider: '#F0EADB',
    },
    semantic: {
      success: '#2E7A58',
      error: '#B3403A',
      warning: '#B9872E',
      info: '#4F6272',
    },
    chart: {
      gold: '#C2A366',
      blue: '#4F6272',
      green: '#2E7A58',
      purple: '#8B5CF6',
      rose: '#D99BA8',
      teal: '#3E9C88',
      orange: '#D09A3E',
    },
    overlay: {
      dark: 'rgba(24, 20, 16, 0.45)',
      light: 'rgba(24, 20, 16, 0.04)',
      gold: 'rgba(194, 163, 102, 0.15)',
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
