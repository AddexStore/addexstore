import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useToast } from './ToastContext'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'sifr_wishlist'

function loadWishlist() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(loadWishlist)
  const toast = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const isInWishlist = useCallback(
    (id) => wishlistItems.some((item) => item.id === id),
    [wishlistItems]
  )

  const toggleWishlist = useCallback((product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        toast.showToast(`${product.name} removed from wishlist`, 'info')
        return prev.filter((item) => item.id !== product.id)
      }

      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0] || product.image,
        brand: product.brand || 'SIFR',
        addedAt: Date.now(),
      }

      toast.showToast(`${product.name} added to wishlist`, 'success')
      return [...prev, wishlistItem]
    })
  }, [toast])

  const removeFromWishlist = useCallback((id) => {
    setWishlistItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) {
        toast.showToast(`${item.name} removed from wishlist`, 'info')
      }
      return prev.filter((item) => item.id !== id)
    })
  }, [toast])

  const value = useMemo(
    () => ({
      wishlistItems,
      toggleWishlist,
      isInWishlist,
      removeFromWishlist,
    }),
    [wishlistItems, toggleWishlist, isInWishlist, removeFromWishlist]
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
