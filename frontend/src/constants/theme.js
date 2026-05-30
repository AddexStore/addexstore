export const theme = {
  colors: {
    bg: {
      primary: '#FAF9F7',
      secondary: '#F5F2ED',
      card: '#FFFFFF',
      hover: '#EDE8E1',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      muted: '#999999',
    },
    accent: {
      gold: '#C6A972',
      goldHover: '#B8965F',
      goldDark: '#8A6A3D',
      secondary: '#2E2E2E',
    },
    border: {
      DEFAULT: '#E7E2DA',
      divider: '#EFEAE4',
    },
    semantic: {
      success: '#2F855A',
      error: '#C53030',
      warning: '#D69E2E',
      info: '#4A5568',
    },
    chart: {
      gold: '#C6A972',
      blue: '#4A5568',
      green: '#2F855A',
      purple: '#8B5CF6',
      rose: '#E8A0B4',
      teal: '#14B8A6',
      orange: '#D69E2E',
    },
    overlay: {
      dark: 'rgba(0, 0, 0, 0.35)',
      light: 'rgba(0, 0, 0, 0.04)',
      gold: 'rgba(198, 169, 114, 0.15)',
    },
  },
  spacing: {
    section: 'py-16 sm:py-20 lg:py-24',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    sectionMobile: 'py-12 sm:py-16',
  },
  typography: {
    heading: 'font-playfair-display',
    body: 'font-inter',
    headingClass: 'font-playfair-display font-bold text-[#1A1A1A]',
    bodyClass: 'font-inter text-[#666666]',
  },
  borderRadius: {
    card: 'rounded-xl',
    button: 'rounded-xl',
    full: 'rounded-full',
  },
  shadow: {
    card: 'shadow-lg shadow-black/5',
    cardHover: 'shadow-xl shadow-black/10',
    button: 'shadow-md shadow-black/5',
    glow: 'shadow-lg shadow-[#C6A972]/20',
  },
  animation: {
    transition: 'transition-all duration-300',
    hover: 'hover:scale-[1.02]',
    hoverLift: 'hover:-translate-y-1',
  },
}

export const colors = theme.colors

export const buttonStyles = {
  primary: `bg-[#C6A972] text-white ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#B8965F] active:scale-[0.98] shadow-lg shadow-[#C6A972]/20`,
  gold: `bg-[#C6A972] text-white ${theme.borderRadius.button} px-6 py-2.5 text-sm font-semibold ${theme.animation.transition} hover:bg-[#B8965F] active:scale-[0.98] shadow-lg shadow-[#C6A972]/20`,
  secondary: `bg-white border border-[#E7E2DA] text-[#1A1A1A] ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#FAF9F7] active:scale-[0.98]`,
  outline: `bg-transparent border border-[#C6A972] text-[#C6A972] ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#C6A972] hover:text-white active:scale-[0.98]`,
  danger: `bg-transparent border border-[#C53030]/40 text-[#C53030] ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#C53030]/5 active:scale-[0.98]`,
  ghost: `text-[#666666] ${theme.borderRadius.button} px-4 py-2 text-sm font-medium ${theme.animation.transition} hover:bg-[#EDE8E1] hover:text-[#1A1A1A]`,
}

export const cardStyles = {
  card: `bg-white ${theme.borderRadius.card} ${theme.shadow.card} border border-[#E7E2DA] ${theme.animation.transition} ${theme.animation.hoverLift} hover:${theme.shadow.cardHover}`,
  interactive: `bg-white ${theme.borderRadius.card} border border-[#E7E2DA] ${theme.animation.transition} hover:border-[#C6A972]/30 hover:bg-[#EDE8E1]`,
  glass: `bg-white/80 backdrop-blur-md border border-[#E7E2DA] ${theme.borderRadius.card}`,
}

export const inputStyles = {
  base: `w-full bg-white border border-[#E7E2DA] ${theme.borderRadius.button} px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#999999] focus:outline-none focus:border-[#C6A972] focus:ring-1 focus:ring-[#C6A972]/30 ${theme.animation.transition}`,
}
