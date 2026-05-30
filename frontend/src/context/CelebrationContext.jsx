import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CelebrationContext = createContext(null)

export function CelebrationProvider({ children }) {
  const [celebration, setCelebration] = useState(null)

  const triggerCelebration = useCallback((message = 'Added to Cart') => {
    setCelebration({ message, key: Date.now() })
    setTimeout(() => setCelebration(null), 1800)
  }, [])

  const value = useMemo(
    () => ({ celebration, triggerCelebration }),
    [celebration, triggerCelebration]
  )

  return (
    <CelebrationContext.Provider value={value}>
      {children}
    </CelebrationContext.Provider>
  )
}

export function useCelebration() {
  const context = useContext(CelebrationContext)
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider')
  }
  return context
}
