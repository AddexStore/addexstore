import BackButton from '../components/BackButton'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-['Playfair_Display']">Contact Us</h1>
        </div>

        <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-color)]/50 space-y-6">
          <div>
            <h2 className="text-[var(--text-primary)] text-sm font-semibold mb-2">Get in Touch</h2>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Have a question, concern, or just want to share feedback? We'd love to hear from you.
              Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C6A972]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#C6A972]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-[var(--text-primary)] text-xs font-medium">Email</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">support@addexstores.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C6A972]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#C6A972]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="text-[var(--text-primary)] text-xs font-medium">Phone</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">+91 1800-123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C6A972]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#C6A972]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[var(--text-primary)] text-xs font-medium">Address</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">AddexStores Luxury House, 42 Fashion Street,<br />Mumbai, Maharashtra 400001, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-6">
            <h2 className="text-[var(--text-primary)] text-sm font-semibold mb-3">Send us a Message</h2>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Your Name"
                  className="w-full px-3 py-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#C6A972] transition placeholder:text-[var(--text-muted)]"
                />
                <input
                  placeholder="Your Email"
                  type="email"
                  className="w-full px-3 py-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#C6A972] transition placeholder:text-[var(--text-muted)]"
                />
              </div>
              <input
                placeholder="Subject"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#C6A972] transition placeholder:text-[var(--text-muted)]"
              />
              <textarea
                rows={4}
                placeholder="Your Message"
                className="w-full px-3 py-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#C6A972] transition placeholder:text-[var(--text-muted)] resize-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#C6A972] text-white text-sm font-medium rounded-md hover:bg-[#B8965F] transition active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
