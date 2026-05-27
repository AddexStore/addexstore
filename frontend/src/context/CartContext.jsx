import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useToast } from './ToastContext'

const CartContext = createContext(null)

const STORAGE_KEY = 'sifr_cart'

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const items = JSON.parse(saved)
    const merged = []
    const seen = new Set()
    for (const item of items) {
      const key = `${item.id}-${item.size}-${item.color}`
      const existing = merged.find((m) => `${m.id}-${m.size}-${m.color}` === key)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, existing.stock || 99)
      } else if (!seen.has(key)) {
        seen.add(key)
        merged.push({ ...item, _cartKey: key + '-' + Date.now() + Math.random() })
      }
    }
    return merged
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart)
  const toast = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((product, quantity = 1, size, color) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color
      )

      if (existingIndex > -1) {
        const updated = [...prev]
        const existing = updated[existingIndex]
        const newQty = existing.quantity + quantity
        if (newQty > (existing.stock || 99)) {
          toast.showToast('Requested quantity exceeds available stock', 'warning')
          return prev
        }
        updated[existingIndex] = { ...existing, quantity: newQty }
        toast.showToast(`${product.name} quantity updated in cart`, 'success')
        return updated
      }

      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0] || product.image,
        quantity,
        size: size || product.sizes?.[0] || 'One Size',
        color: color || product.colors?.[0] || 'Default',
        brand: product.brand || 'SIFR',
        stock: product.stock ?? 99,
        _cartKey: `${product.id}-${size || product.sizes?.[0] || 'One Size'}-${color || product.colors?.[0] || 'Default'}-${Date.now()}-${Math.random()}`,
      }

      toast.showToast(`${product.name} added to cart`, 'success')
      return [...prev, newItem]
    })
  }, [toast])

  const removeFromCart = useCallback((id, size, color) => {
    setCartItems((prev) => {
      const item = prev.find(
        (i) => i.id === id && i.size === size && i.color === color
      )
      if (item) {
        toast.showToast(`${item.name} removed from cart`, 'info')
      }
      return prev.filter(
        (i) => !(i.id === id && i.size === size && i.color === color)
      )
    })
  }, [toast])

  const updateQuantity = useCallback((id, quantity, size, color) => {
    if (quantity < 1) return

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cartItems])

  const getCartCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
