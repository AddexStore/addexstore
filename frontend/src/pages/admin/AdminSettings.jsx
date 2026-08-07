import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import { Field, Input, Select, Toggle } from '../../components/ui/Input'

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
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
  ]

  const updateGeneral = (key, value) => setSettings((prev) => ({ ...prev, general: { ...prev.general, [key]: value } }))
  const updateShipping = (key, value) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, [key]: value } }))
  const togglePayment = (key) => setSettings((prev) => ({ ...prev, payment: { ...prev.payment, [key]: !prev.payment[key] } }))

  const handleSave = () => { showToast('Settings saved successfully', 'success') }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Settings"
        description="Configure your store's general, shipping, and payment preferences."
        actions={
          <Button icon="Check" onClick={handleSave}>
            Save
          </Button>
        }
      />

      <div className="flex-shrink-0">
        <Tabs tabs={sections.map((s) => ({ key: s.id, label: s.label }))} activeKey={activeSection} onChange={setActiveSection} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-line bg-surface p-4 sm:p-6">
        {activeSection === 'general' && (
          <div className="max-w-lg space-y-4">
            <Field label="Site Name">
              <Input value={settings.general.siteName} onChange={(e) => updateGeneral('siteName', e.target.value)} />
            </Field>
            <Field label="Tagline">
              <Input value={settings.general.tagline} onChange={(e) => updateGeneral('tagline', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency">
                <Select value={settings.general.currency} onChange={(e) => updateGeneral('currency', e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </Field>
              <Field label="Tax Rate (%)">
                <Input type="number" value={settings.general.taxRate} onChange={(e) => updateGeneral('taxRate', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {activeSection === 'shipping' && (
          <div className="max-w-lg space-y-4">
            <Field label="Free Shipping Threshold ($)" hint="Orders above this get free shipping">
              <Input type="number" value={settings.shipping.freeThreshold} onChange={(e) => updateShipping('freeThreshold', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Standard ($)">
                <Input type="number" value={settings.shipping.standardCost} onChange={(e) => updateShipping('standardCost', e.target.value)} />
              </Field>
              <Field label="Express ($)">
                <Input type="number" value={settings.shipping.expressCost} onChange={(e) => updateShipping('expressCost', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {activeSection === 'payment' && (
          <div className="max-w-lg space-y-2">
            {[
              { key: 'creditCard', label: 'Credit Card', desc: 'Visa, Mastercard, Amex' },
              { key: 'paypal', label: 'PayPal', desc: 'PayPal / Venmo' },
              { key: 'bankTransfer', label: 'Bank Transfer', desc: 'Direct wire transfer' },
              { key: 'crypto', label: 'Cryptocurrency', desc: 'Bitcoin, Ethereum, USDC' },
            ].map((method) => (
              <div key={method.key} className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-gold-500/40">
                <div>
                  <p className="text-sm font-medium text-ink">{method.label}</p>
                  <p className="mt-0.5 text-xs text-sub">{method.desc}</p>
                </div>
                <Toggle
                  checked={settings.payment[method.key]}
                  onChange={() => togglePayment(method.key)}
                  aria-label={method.label}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
