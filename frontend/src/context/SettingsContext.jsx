import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { settingsService } from '../services/settingsService'
import { setStoreCurrency, getStoreCurrency, getStoreSymbol } from '../utils/currency'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const applySettings = useCallback((data) => {
    if (!data) return
    setStoreCurrency(data.currency, data.currencySymbol)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await settingsService.getPublic()
      const data = res?.data || res
      setSettings(data)
      applySettings(data)
    } catch {
      // keep defaults when the backend is unreachable
    } finally {
      setLoading(false)
    }
  }, [applySettings])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refresh,
        currency: settings?.currency || getStoreCurrency(),
        currencySymbol: settings?.currencySymbol || getStoreSymbol(),
        siteName: settings?.siteName || 'AddexStores',
        siteDescription: settings?.siteDescription || '',
        supportEmail: settings?.email || '',
        supportPhone: settings?.phone || '',
        storeAddress: settings?.address || '',
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
