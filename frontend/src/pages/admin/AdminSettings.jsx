import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../context/ToastContext'
import { useSettings } from '../../context/SettingsContext'
import { settingsService } from '../../services/settingsService'
import { CURRENCY_OPTIONS } from '../../utils/currency'
import BackButton from '../../components/BackButton'

const emptySettings = {
  siteName: '',
  siteDescription: '',
  currency: 'INR',
  taxRate: '',
  shippingCost: '',
  freeShippingThreshold: '',
}

export default function AdminSettings() {
  const { showToast } = useToast()
  const { refresh: refreshStoreSettings } = useSettings()
  const [settings, setSettings] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'shipping', label: 'Shipping' },
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await settingsService.getAdmin()
      const data = res?.data || res
      setSettings({
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        currency: data.currency || 'INR',
        taxRate: data.taxRate ?? '',
        shippingCost: data.shippingCost ?? '',
        freeShippingThreshold: data.freeShippingThreshold ?? '',
      })
    } catch (err) {
      showToast(err.message || 'Failed to load settings', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await settingsService.update({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        currency: settings.currency,
        taxRate: settings.taxRate === '' ? null : Number(settings.taxRate),
        shippingCost: settings.shippingCost === '' ? null : Number(settings.shippingCost),
        freeShippingThreshold: settings.freeShippingThreshold === '' ? null : Number(settings.freeShippingThreshold),
      })
      const data = res?.data || res
      setSettings({
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        currency: data.currency || 'INR',
        taxRate: data.taxRate ?? '',
        shippingCost: data.shippingCost ?? '',
        freeShippingThreshold: data.freeShippingThreshold ?? '',
      })
      await refreshStoreSettings()
      showToast('Settings saved successfully', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const selectedCurrency = CURRENCY_OPTIONS.find((c) => c.code === settings.currency) || CURRENCY_OPTIONS[0]

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-4 py-1.5 bg-[#C6A972] text-white rounded-lg text-xs font-semibold hover:bg-[#B8965F] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {sections.map((section) => (
          <button key={section.id} onClick={() => setActiveSection(section.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeSection === section.id ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'}`}>
            {section.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-[var(--bg-card)] rounded-lg border border-[#2A2A2A]/50 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-6 h-6 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {activeSection === 'general' && (
              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Site Name</label>
                  <input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Tagline</label>
                  <input value={settings.siteDescription} onChange={(e) => update('siteDescription', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Store Currency</label>
                    <select value={settings.currency} onChange={(e) => update('currency', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]">
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Every price across the store, cart, and checkout uses {selectedCurrency.symbol} ({selectedCurrency.code}).</p>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Tax Rate (%)</label>
                    <input type="number" step="0.01" value={settings.taxRate} onChange={(e) => update('taxRate', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'shipping' && (
              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Free Shipping Threshold ({selectedCurrency.symbol})</label>
                  <input type="number" step="0.01" value={settings.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Orders above this get free shipping</p>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">Standard Shipping Cost ({selectedCurrency.symbol})</label>
                  <input type="number" step="0.01" value={settings.shippingCost} onChange={(e) => update('shippingCost', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
