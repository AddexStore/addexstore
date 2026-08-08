import { useState, useEffect, useCallback } from 'react'
import { useBlocker } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { useSettings } from '../../context/SettingsContext'
import { settingsService } from '../../services/settingsService'
import { adminService } from '../../services/adminService'
import { CURRENCY_OPTIONS } from '../../utils/currency'
import BackButton from '../../components/BackButton'

const emptySettings = {
  siteName: '',
  siteDescription: '',
  logo: '',
  favicon: '',
  email: '',
  phone: '',
  address: '',
  currency: 'INR',
  taxRate: '',
  shippingCost: '',
  freeShippingThreshold: '',
}

const inputClass = 'w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972] placeholder:text-[var(--text-secondary)]/50'
const errorClass = 'border-red-500 focus:border-red-500'

const iconStyle = 'w-4 h-4 flex-shrink-0'

const icons = {
  general: (
    <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  currency: (
    <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M15.5 8.5c-.8-1-2-1.5-3.5-1.5-2 0-3.5 1.1-3.5 2.6 0 3.4 7 1.8 7 5.2 0 1.5-1.5 2.7-3.5 2.7-1.5 0-2.7-.6-3.5-1.5" />
    </svg>
  ),
  tax: (
    <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7l6 10V7" />
    </svg>
  ),
  shipping: (
    <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
    </svg>
  ),
  payments: (
    <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
    </svg>
  ),
  marketplace: (
    <svg className={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

export default function AdminSettings() {
  const { showToast } = useToast()
  const { refresh: refreshStoreSettings } = useSettings()
  const [settings, setSettings] = useState(emptySettings)
  const [original, setOriginal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState('general')
  const [currencyConfirm, setCurrencyConfirm] = useState(null)
  const [gateways, setGateways] = useState([])
  const [gatewaySaving, setGatewaySaving] = useState({})

  const dirty = original != null && JSON.stringify(settings) !== JSON.stringify(original)

  const sections = [
    { id: 'general', label: 'General', icon: icons.general },
    { id: 'currency', label: 'Currency', icon: icons.currency },
    { id: 'tax', label: 'Tax', icon: icons.tax },
    { id: 'shipping', label: 'Shipping', icon: icons.shipping },
    { id: 'payments', label: 'Payments', icon: icons.payments },
    { id: 'marketplace', label: 'Marketplace', icon: icons.marketplace, disabled: true },
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await settingsService.getAdmin()
      const data = res.data || {}
      const s = {
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        logo: data.logo || '',
        favicon: data.favicon || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        currency: data.currency || 'INR',
        taxRate: data.taxRate ?? '',
        shippingCost: data.shippingCost ?? '',
        freeShippingThreshold: data.freeShippingThreshold ?? '',
      }
      setSettings(s)
      setOriginal(s)
    } catch (err) {
      showToast(err.message || 'Failed to load settings', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadGateways = useCallback(async () => {
    try {
      setGateways(await adminService.getPaymentGateways())
    } catch (err) {
      showToast(err.message || 'Failed to load payment gateways', 'error')
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (activeSection === 'payments') loadGateways()
  }, [activeSection, loadGateways])

  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const blocker = useBlocker(dirty)

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const next = {}
    if (!settings.siteName.trim()) next.siteName = 'Site name is required'
    if (!CURRENCY_OPTIONS.some((c) => c.code === settings.currency)) next.currency = 'Select a valid currency'
    const tax = Number(settings.taxRate)
    if (settings.taxRate !== '' && (Number.isNaN(tax) || tax < 0 || tax > 100)) next.taxRate = 'Must be between 0 and 100'
    if (settings.shippingCost !== '') {
      const sc = Number(settings.shippingCost)
      if (Number.isNaN(sc) || sc < 0) next.shippingCost = 'Must be 0 or greater'
    }
    if (settings.freeShippingThreshold !== '') {
      const ft = Number(settings.freeShippingThreshold)
      if (Number.isNaN(ft) || ft < 0) next.freeShippingThreshold = 'Must be 0 or greater'
    }
    if (settings.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.trim())) next.email = 'Enter a valid email address'
    return next
  }

  const handleSave = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      showToast('Please fix the highlighted fields', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await settingsService.update({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        logo: settings.logo,
        favicon: settings.favicon,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        currency: settings.currency,
        taxRate: settings.taxRate === '' ? null : Number(settings.taxRate),
        shippingCost: settings.shippingCost === '' ? null : Number(settings.shippingCost),
        freeShippingThreshold: settings.freeShippingThreshold === '' ? null : Number(settings.freeShippingThreshold),
      })
      const data = res.data || {}
      const s = {
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        logo: data.logo || '',
        favicon: data.favicon || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        currency: data.currency || 'INR',
        taxRate: data.taxRate ?? '',
        shippingCost: data.shippingCost ?? '',
        freeShippingThreshold: data.freeShippingThreshold ?? '',
      }
      setSettings(s)
      setOriginal(s)
      await refreshStoreSettings()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
      showToast('Settings saved successfully', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCurrencyChange = (next) => {
    if (next === settings.currency) return
    if (original && next !== original.currency) {
      setCurrencyConfirm({ previous: settings.currency, next })
    } else {
      update('currency', next)
    }
  }

  const selectedCurrency = CURRENCY_OPTIONS.find((c) => c.code === settings.currency) || CURRENCY_OPTIONS[0]
  const samplePrice = `${selectedCurrency.symbol}12,345.67`

  const handleToggleGateway = async (gw) => {
    setGatewaySaving((prev) => ({ ...prev, [gw.id]: true }))
    try {
      const updated = await adminService.togglePaymentGateway(gw.id)
      setGateways((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
      showToast(`${updated.gateway} ${updated.enabled ? 'enabled' : 'disabled'}`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update payment gateway', 'error')
    } finally {
      setGatewaySaving((prev) => ({ ...prev, [gw.id]: false }))
    }
  }

  const Field = ({ label, description, error, children }) => (
    <div>
      <label className="block text-xs text-[var(--text-secondary)] mb-1">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
      {!error && description && <p className="text-[10px] text-[var(--text-secondary)] mt-1">{description}</p>}
    </div>
  )

  const Card = ({ title, description, children }) => (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[#2A2A2A]/50 p-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {description && <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">{description}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  )

  const renderGeneral = () => (
    <div className="space-y-4">
      <Card title="Branding" description="Identity shown across your storefront.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Site Name" error={errors.siteName}>
            <input
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              className={`${inputClass} ${errors.siteName ? errorClass : ''}`}
            />
          </Field>
          <Field label="Tagline">
            <input
              value={settings.siteDescription}
              onChange={(e) => update('siteDescription', e.target.value)}
              className={inputClass}
              placeholder="A short description of your store"
            />
          </Field>
          <Field label="Logo URL">
            <input
              value={settings.logo}
              onChange={(e) => update('logo', e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </Field>
          <Field label="Favicon URL">
            <input
              value={settings.favicon}
              onChange={(e) => update('favicon', e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </Field>
        </div>
      </Card>
      <Card title="Contact" description="Contact details shown in the storefront footer and contact page.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Support Email" error={errors.email}>
            <input
              value={settings.email}
              onChange={(e) => update('email', e.target.value)}
              className={`${inputClass} ${errors.email ? errorClass : ''}`}
              placeholder="support@store.com"
            />
          </Field>
          <Field label="Support Phone">
            <input
              value={settings.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
              placeholder="+91 00000 00000"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Store Address">
              <textarea
                value={settings.address}
                onChange={(e) => update('address', e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Street, City, State, ZIP, Country"
              />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderCurrency = () => (
    <Card
      title="Base Currency"
      description="Every price across the catalog, cart, checkout, and payments is recorded and displayed in this currency."
    >
      <Field label="Store Currency" error={errors.currency}>
        <select
          value={settings.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className={`${inputClass} ${errors.currency ? errorClass : ''}`}
        >
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol}) — {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="rounded-lg border border-[#2A2A2A] bg-[var(--bg-card)] px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">Sample product price</span>
        <span className="text-lg font-semibold text-white font-mono">{samplePrice}</span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)]">
        Changing the base currency does not convert existing prices. Product and shipping-rule amounts keep their numeric
        values and are interpreted in the new currency.
      </p>
    </Card>
  )

  const renderTax = () => (
    <Card title="Default Tax Rate" description="Applied to orders not covered by a country/state tax rule.">
      <Field label="Tax Rate (%)" error={errors.taxRate}>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={settings.taxRate}
          onChange={(e) => update('taxRate', e.target.value)}
          className={`${inputClass} ${errors.taxRate ? errorClass : ''}`}
        />
      </Field>
    </Card>
  )

  const renderShipping = () => (
    <Card title="Shipping Defaults" description="Used when no shipping rule matches an order's destination.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={`Standard Shipping Cost (${selectedCurrency.symbol})`} error={errors.shippingCost}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={settings.shippingCost}
            onChange={(e) => update('shippingCost', e.target.value)}
            className={`${inputClass} ${errors.shippingCost ? errorClass : ''}`}
          />
        </Field>
        <Field
          label={`Free Shipping Threshold (${selectedCurrency.symbol})`}
          description="Orders at or above this total ship free."
          error={errors.freeShippingThreshold}
        >
          <input
            type="number"
            step="0.01"
            min="0"
            value={settings.freeShippingThreshold}
            onChange={(e) => update('freeShippingThreshold', e.target.value)}
            className={`${inputClass} ${errors.freeShippingThreshold ? errorClass : ''}`}
          />
        </Field>
      </div>
    </Card>
  )

  const renderPayments = () => (
    <Card title="Payment Gateways" description="Enabled gateways appear as payment options at checkout.">
      {gateways.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <svg className="w-6 h-6 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="space-y-3">
          {gateways.map((gw) => (
            <div key={gw.id} className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[var(--bg-card)] px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{gw.displayName || gw.gateway}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {gw.supportedMethods} &middot; {gw.enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
              <button
                onClick={() => handleToggleGateway(gw)}
                disabled={gatewaySaving[gw.id]}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${gw.enabled ? 'bg-[#C6A972]' : 'bg-[#2A2A2A]'} disabled:opacity-50`}
                aria-label={`Toggle ${gw.gateway}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${gw.enabled ? 'translate-x-4' : ''}`}
                />
              </button>
            </div>
          ))}
          <p className="text-[11px] text-[var(--text-secondary)]">Gateway credentials are managed via secure configuration and are never exposed here.</p>
        </div>
      )}
    </Card>
  )

  const renderMarketplace = () => (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[#2A2A2A]/50 p-4 opacity-70 pointer-events-none">
      <h2 className="text-sm font-semibold text-white">Marketplace</h2>
      <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">Connect external marketplaces to sync products and orders.</p>
      <div className="flex items-center justify-center py-10 border border-dashed border-[#2A2A2A] rounded-lg">
        <span className="text-xs text-[var(--text-secondary)]">Coming soon</span>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col gap-3 py-3 px-4">
      <div className="flex items-center justify-between flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Settings</h1>
          {dirty && (
            <span className="text-[10px] font-medium text-[#C6A972] bg-[#C6A972]/10 border border-[#C6A972]/30 rounded-full px-2 py-0.5 whitespace-nowrap">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {savedFlash && <span className="text-xs text-[#2F855A] font-medium">Saved</span>}
          <button
            onClick={handleSave}
            disabled={!dirty || saving || loading}
            className="px-4 py-1.5 bg-[#C6A972] text-white rounded-lg text-xs font-semibold hover:bg-[#B8965F] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex md:hidden gap-1 flex-shrink-0 overflow-x-auto pb-1">
        {sections.map((section) => (
          <button
            key={section.id}
            disabled={section.disabled}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${activeSection === section.id ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'}`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 gap-3">
        <nav className="hidden md:flex w-44 flex-shrink-0 flex-col gap-1 overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              disabled={section.disabled}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                activeSection === section.id
                  ? 'bg-[#C6A972]/15 text-[#C6A972] border border-[#C6A972]/30'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-transparent hover:text-white hover:border-[#2A2A2A]'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-6 h-6 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="max-w-2xl">
              {activeSection === 'general' && renderGeneral()}
              {activeSection === 'currency' && renderCurrency()}
              {activeSection === 'tax' && renderTax()}
              {activeSection === 'shipping' && renderShipping()}
              {activeSection === 'payments' && renderPayments()}
              {activeSection === 'marketplace' && renderMarketplace()}
            </div>
          )}
        </div>
      </div>

      {currencyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[var(--bg-card)] border border-[#2A2A2A] rounded-xl p-5 max-w-md w-full">
            <h3 className="text-sm font-semibold text-white mb-2">Change base currency to {currencyConfirm.next}?</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Existing product prices and shipping rules will not be converted. Their current numeric values will be
              interpreted in the new currency. Taxes and shipping defaults are also applied in this currency.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setCurrencyConfirm(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[#2A2A2A] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  update('currency', currencyConfirm.next)
                  setCurrencyConfirm(null)
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C6A972] hover:bg-[#B8965F]"
              >
                Change Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {blocker && blocker.state === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[var(--bg-card)] border border-[#2A2A2A] rounded-xl p-5 max-w-md w-full">
            <h3 className="text-sm font-semibold text-white mb-2">Unsaved changes</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              You have unsaved changes. If you leave now, they will be lost.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => blocker.reset()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C6A972] hover:bg-[#B8965F]"
              >
                Stay
              </button>
              <button
                onClick={() => blocker.proceed()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[#2A2A2A] hover:text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
