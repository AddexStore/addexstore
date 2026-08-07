export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  AUD: { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  CAD: { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
}

export const CURRENCY_OPTIONS = Object.values(CURRENCIES)

let currentCurrency = 'INR'
let currentSymbol = '₹'

export function setStoreCurrency(code, symbol) {
  const key = (code || '').toUpperCase()
  if (!key) return
  const meta = CURRENCIES[key]
  currentCurrency = key
  currentSymbol = symbol || meta?.symbol || key
}

export function getStoreCurrency() {
  return currentCurrency
}

export function getStoreSymbol() {
  return currentSymbol
}

export function getCurrencySymbol(currency) {
  const key = (currency || '').toUpperCase()
  return CURRENCIES[key]?.symbol || (key || currentSymbol)
}

export function formatCurrency(amount, symbol) {
  if (amount === null || amount === undefined || amount === '') return '--'
  const value = Number(amount)
  if (Number.isNaN(value)) return '--'
  const sym = symbol || currentSymbol
  const decimals = currentCurrency === 'JPY' ? 0 : 2
  const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sym}${formatted}`
}
