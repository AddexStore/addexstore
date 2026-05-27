export const theme = {
  colors: {
    bg: {
      primary: '#0F0F10',
      secondary: '#18181B',
      card: '#232326',
      hover: '#2A2A2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8B8C2',
    },
    accent: {
      gold: '#D4AF37',
      goldHover: '#C9A84C',
      soft: '#E8DCC8',
    },
    border: {
      DEFAULT: '#2D2D30',
    },
    semantic: {
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    chart: {
      gold: '#D4AF37',
      blue: '#3B82F6',
      green: '#22C55E',
      purple: '#8B5CF6',
      rose: '#E8A0B4',
      teal: '#14B8A6',
      orange: '#F97316',
    },
    overlay: {
      dark: 'rgba(0, 0, 0, 0.6)',
      light: 'rgba(255, 255, 255, 0.05)',
      gold: 'rgba(212, 175, 55, 0.15)',
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
    headingClass: 'font-playfair-display font-bold text-white',
    bodyClass: 'font-inter text-[#B8B8C2]',
  },
  borderRadius: {
    card: 'rounded-xl',
    button: 'rounded-xl',
    full: 'rounded-full',
  },
  shadow: {
    card: 'shadow-lg shadow-black/20',
    cardHover: 'shadow-xl shadow-black/30',
    button: 'shadow-lg shadow-black/25',
    glow: 'shadow-lg shadow-[#D4AF37]/10',
  },
  animation: {
    transition: 'transition-all duration-300',
    hover: 'hover:scale-[1.02]',
    hoverLift: 'hover:-translate-y-1',
  },
}

export const colors = theme.colors

export const buttonStyles = {
  primary: `bg-[#232326] border border-[#D4AF37]/40 text-white ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#2A2A2E] hover:border-[#D4AF37]/70 active:scale-[0.98]`,
  gold: `bg-[#D4AF37] text-black ${theme.borderRadius.button} px-6 py-2.5 text-sm font-semibold ${theme.animation.transition} hover:bg-[#C9A84C] active:scale-[0.98]`,
  secondary: `bg-transparent border border-[#2D2D30] text-[#B8B8C2] ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#2A2A2E] hover:text-white active:scale-[0.98]`,
  danger: `bg-transparent border border-[#EF4444]/40 text-[#EF4444] ${theme.borderRadius.button} px-6 py-2.5 text-sm font-medium ${theme.animation.transition} hover:bg-[#EF4444]/10 active:scale-[0.98]`,
  ghost: `text-[#B8B8C2] ${theme.borderRadius.button} px-4 py-2 text-sm font-medium ${theme.animation.transition} hover:bg-[#2A2A2E] hover:text-white`,
}

export const cardStyles = {
  card: `bg-[#232326] ${theme.borderRadius.card} ${theme.shadow.card} ${theme.animation.transition} ${theme.animation.hoverLift} hover:${theme.shadow.cardHover} hover:shadow-[#D4AF37]/5`,
  interactive: `bg-[#232326] ${theme.borderRadius.card} border border-[#2D2D30] ${theme.animation.transition} hover:border-[#D4AF37]/30 hover:bg-[#2A2A2E]`,
  glass: `bg-[#232326]/80 backdrop-blur-md border border-[#2D2D30] ${theme.borderRadius.card}`,
}

export const inputStyles = {
  base: `w-full bg-[#18181B] border border-[#2D2D30] ${theme.borderRadius.button} px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 ${theme.animation.transition}`,
}
