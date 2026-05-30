import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'
import { wishlistService } from '../services/wishlistService'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'sifr_wishlist'

function loadWishlist() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [localItems, setLocalItems] = useState(loadWishlist)
  const [apiItems, setApiItems] = useState([])
  const toast = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems))
  }, [localItems])

  useEffect(() => {
    if (isAuthenticated) {
      wishlistService.getWishlist()
        .then((res) => { setApiItems(res.data || []) })
        .catch(() => {})
    }
  }, [isAuthenticated])

  const wishlistItems = isAuthenticated ? apiItems : localItems

  const isInWishlist = useCallback((id) => {
    const numId = Number(id)
    return wishlistItems.some((item) => item.id === numId || item.productId === numId)
  }, [wishlistItems])

  const toggleWishlist = useCallback(async (product) => {
    const productId = Number(product.id)
    const exists = wishlistItems.some((item) => item.id === productId || item.productId === productId)

    if (exists) {
      if (isAuthenticated) {
        await wishlistService.removeItem(productId).catch(() => {})
        setApiItems((prev) => prev.filter((item) => item.id !== productId && item.productId !== productId))
      } else {
        setLocalItems((prev) => prev.filter((item) => item.id !== productId))
      }
      toast.showToast(`${product.name} removed from wishlist`, 'info')
    } else {
      if (isAuthenticated) {
        await wishlistService.addItem(productId).catch(() => {})
        setApiItems((prev) => [...prev, {
          id: productId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          image: product.images?.[0]?.imageUrl || product.image,
          brand: product.brand || 'AddexStores',
        }])
      } else {
        setLocalItems((prev) => [...prev, {
          id: productId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          image: product.images?.[0]?.imageUrl || product.image,
          brand: product.brand || 'AddexStores',
          addedAt: Date.now(),
        }])
      }
      toast.showToast(`${product.name} added to wishlist`, 'success')
    }
  }, [wishlistItems, isAuthenticated, toast])

  const removeFromWishlist = useCallback(async (id) => {
    const numId = Number(id)
    const item = wishlistItems.find((i) => i.id === numId || i.productId === numId)
    if (item) toast.showToast(`${item.name} removed from wishlist`, 'info')

    if (isAuthenticated) {
      await wishlistService.removeItem(numId).catch(() => {})
      setApiItems((prev) => prev.filter((i) => i.id !== numId && i.productId !== numId))
    } else {
      setLocalItems((prev) => prev.filter((item) => item.id !== numId))
    }
  }, [wishlistItems, isAuthenticated, toast])

  const value = useMemo(() => ({ wishlistItems, toggleWishlist, isInWishlist, removeFromWishlist }), [wishlistItems, toggleWishlist, isInWishlist, removeFromWishlist])

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
