import { useCallback } from 'react'

const STORAGE_KEY = 'sifr_recently_viewed'
const MAX_ITEMS = 10

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useRecentlyViewed() {
  const addRecentlyViewed = useCallback((product) => {
    const items = load()
    const filtered = items.filter((item) => item.id !== product.id)
    const updated = [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        brand: product.brand || 'SIFR',
        viewedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_ITEMS)

    save(updated)
  }, [])

  const getRecentlyViewed = useCallback(() => {
    return load()
  }, [])

  return { addRecentlyViewed, getRecentlyViewed }
}
