import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import { Field, Input, Textarea } from '../components/ui/Input'
import SectionHeading from '../components/ui/SectionHeading'

const CHANNELS = [
  {
    icon: 'Mail',
    title: 'Email',
    value: 'support@addexstores.com',
    href: 'mailto:support@addexstores.com',
  },
  {
    icon: 'Phone',
    title: 'Phone',
    value: '+91 1800-123-4567',
    href: 'tel:+9118001234567',
  },
  {
    icon: 'MapPin',
    title: 'Visit Us',
    value: 'AddexStores Luxury House, 42 Fashion Street, Mumbai, Maharashtra 400001, India',
  },
  {
    icon: 'Clock',
    title: 'Concierge Hours',
    value: 'Monday – Saturday · 10:00 AM – 7:00 PM IST',
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="bg-page">
      <section className="relative overflow-hidden bg-charcoal-900 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[520px] translate-x-1/4 -translate-y-1/4 rounded-full bg-gold-500/12 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4 text-gold-400">Concierge</p>
            <h1 className="heading-display text-4xl text-ivory-50 sm:text-5xl">Contact Us</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ivory-50/70">
              Have a question, concern, or just want to share feedback? Our team would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <SectionHeading
                eyebrow="Reach Us"
                title="We're Here to Help"
                description="Choose the channel that suits you best — we respond to every enquiry within one business day."
              />

              <div className="space-y-3">
                {CHANNELS.map((c) => (
                  <Card key={c.title} className="flex items-start gap-4" interactive={!!c.href}>
                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
                      <Icon name={c.icon} size="md" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-sub">{c.title}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="mt-1 block text-sm text-ink transition-colors hover:text-gold-600"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm leading-relaxed text-ink">{c.value}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
                {sent ? (
                  <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success">
                      <Icon name="CheckCheck" size="xl" />
                    </div>
                    <h3 className="heading-display text-2xl text-ink">Message Sent</h3>
                    <p className="mt-2 max-w-sm text-sm text-sub">
                      Thank you for reaching out. Our concierge team will respond to you within one business day.
                    </p>
                    <Button
                      className="mt-6"
                      variant="outline"
                      icon="RotateCcw"
                      onClick={() => {
                        setSent(false)
                        setForm({ name: '', email: '', subject: '', message: '' })
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Your Name" htmlFor="c-name" required>
                        <Input
                          id="c-name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                          required
                        />
                      </Field>
                      <Field label="Your Email" htmlFor="c-email" required>
                        <Input
                          id="c-email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                          required
                        />
                      </Field>
                    </div>
                    <Field label="Subject" htmlFor="c-subject" required>
                      <Input
                        id="c-subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                      />
                    </Field>
                    <Field label="Your Message" htmlFor="c-message" required>
                      <Textarea
                        id="c-message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us a little more..."
                        required
                      />
                    </Field>
                    <Button type="submit" fullWidth size="lg" icon="Send" iconPosition="right">
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
