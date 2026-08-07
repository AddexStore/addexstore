export function mapProduct(p) {
  if (!p) return null
  const rawImages = Array.isArray(p.images) ? p.images : []
  const sortedImages = [...rawImages]
    .sort((a, b) => ((b.isPrimary === true) - (a.isPrimary === true)) || ((a.sortOrder || 0) - (b.sortOrder || 0)))
  const imageUrls = sortedImages
    .map((img) => (typeof img === 'string' ? img : img && img.imageUrl))
    .filter(Boolean)
  return {
    _id: p.id,
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || '',
    brand: p.brand || '',
    category: p.category?.name || p.category || '',
    subCategory: p.subCategory?.name || p.subCategory || '',
    description: p.description || '',
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    discountPercentage: p.discountPercentage,
    discount: p.discountPercentage,
    rating: p.rating || 0,
    totalReviews: p.totalReviews || 0,
    numReviews: p.totalReviews || 0,
    stock: p.stock ?? 0,
    images: imageUrls,
    gallery: imageUrls,
    image: imageUrls[0] || null,
    colors: (p.variants || []).filter((v) => v.color).map((v) => v.color).filter((v, i, a) => a.indexOf(v) === i),
    sizes: (p.variants || []).filter((v) => v.size).map((v) => v.size).filter((v, i, a) => a.indexOf(v) === i),
    featured: p.featured || false,
    trending: p.trending || false,
    isNewArrival: p.isNewArrival || p.newArrival || false,
    isOnSale: p.isOnSale || p.onSale || false,
    active: p.active !== undefined ? p.active : true,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
    variants: p.variants || [],
  }
}

export function mapOrder(o) {
  if (!o) return null
  return {
    id: o.id,
    orderNumber: o.orderNumber || `ORD-${String(o.id).padStart(3, '0')}`,
    userId: o.userId,
    items: (o.items || []).map((item) => ({
      productId: item.productId,
      name: item.productName,
      image: item.productImage,
      price: item.price,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
      subtotal: item.subtotal,
    })),
    totalAmount: o.totalAmount,
    subtotal: o.subtotal,
    tax: o.tax,
    shippingCost: o.shippingCost,
    currency: o.currency || 'USD',
    status: o.status,
    shippingAddress: o.shippingAddress || {},
    paymentMethod: o.paymentMethod || '',
    notes: o.notes || '',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt || o.createdAt,
  }
}

export function mapCartItem(ci) {
  return {
    id: ci.productId,
    productId: ci.productId,
    name: ci.productName,
    price: ci.price,
    originalPrice: ci.originalPrice || ci.price,
    images: [ci.productImage].filter(Boolean),
    image: ci.productImage,
    quantity: ci.quantity,
    size: ci.size || 'One Size',
    color: ci.color || 'Default',
    brand: '',
    stock: 99,
    _cartKey: `${ci.productId}-${ci.size || ''}-${ci.color || ''}-${Date.now()}-${Math.random()}`,
  }
}

export function mapCategory(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image || '',
    description: c.description || '',
    productCount: c.productCount || 0,
    active: c.active !== undefined ? c.active : true,
    icon: c.icon,
    subcategories: (c.subCategories || []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      productCount: s.productCount || 0,
      icon: s.icon,
    })),
  }
}
