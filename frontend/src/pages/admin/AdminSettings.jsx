import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import BackButton from '../../components/BackButton'

const defaultSettings = {
  general: { siteName: 'AddexStores', tagline: 'Luxury Redefined', currency: 'USD', taxRate: '8.5' },
  shipping: { freeThreshold: '150', standardCost: '12.99', expressCost: '24.99' },
  payment: { creditCard: true, paypal: true, bankTransfer: true, crypto: false },
}

export default function AdminSettings() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState(defaultSettings)
  const [activeSection, setActiveSection] = useState('general')

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'shipping', label: 'Shipping' }, { id: 'payment', label: 'Payment' },
  ]

  const updateGeneral = (key, value) => setSettings((prev) => ({ ...prev, general: { ...prev.general, [key]: value } }))
  const updateShipping = (key, value) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, [key]: value } }))
  const togglePayment = (key) => setSettings((prev) => ({ ...prev, payment: { ...prev.payment, [key]: !prev.payment[key] } }))

  const handleSave = () => { showToast('Settings saved successfully', 'success') }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white font-['Playfair_Display']">Settings</h1>
        </div>
        <button onClick={handleSave} className="px-4 py-1.5 bg-[#C6A972] text-white rounded-lg text-xs font-semibold hover:bg-[#B8965F] transition-colors">Save</button>
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
        {activeSection === 'general' && (
          <div className="space-y-3 max-w-lg">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Site Name</label>
              <input value={settings.general.siteName} onChange={(e) => updateGeneral('siteName', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Tagline</label>
              <input value={settings.general.tagline} onChange={(e) => updateGeneral('tagline', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Currency</label>
                <select value={settings.general.currency} onChange={(e) => updateGeneral('currency', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[#C6A972]">
                  <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Tax Rate (%)</label>
                <input type="number" value={settings.general.taxRate} onChange={(e) => updateGeneral('taxRate', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'shipping' && (
          <div className="space-y-3 max-w-lg">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Free Shipping Threshold ($)</label>
              <input type="number" value={settings.shipping.freeThreshold} onChange={(e) => updateShipping('freeThreshold', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Orders above this get free shipping</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Standard ($)</label>
                <input type="number" value={settings.shipping.standardCost} onChange={(e) => updateShipping('standardCost', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Express ($)</label>
                <input type="number" value={settings.shipping.expressCost} onChange={(e) => updateShipping('expressCost', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A972]" />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'payment' && (
          <div className="space-y-2 max-w-lg">
            {[
              { key: 'creditCard', label: 'Credit Card', desc: 'Visa, Mastercard, Amex' },
              { key: 'paypal', label: 'PayPal', desc: 'PayPal / Venmo' },
              { key: 'bankTransfer', label: 'Bank Transfer', desc: 'Direct wire transfer' },
              { key: 'crypto', label: 'Cryptocurrency', desc: 'Bitcoin, Ethereum, USDC' },
            ].map((method) => (
              <label key={method.key} className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[#2A2A2A] cursor-pointer hover:border-[#B5B5B5] transition-colors">
                <div>
                  <p className="text-xs text-white font-medium">{method.label}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{method.desc}</p>
                </div>
                <div onClick={() => togglePayment(method.key)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${settings.payment[method.key] ? 'bg-[#C6A972]' : 'bg-[var(--bg-hover)]'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--bg-card)] transition-transform ${settings.payment[method.key] ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
