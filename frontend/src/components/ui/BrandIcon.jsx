const paths = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  Facebook: (
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  ),
  X: (
    <path d="M4 4l16 16M20 4L4 20" />
  ),
  XLogo: (
    <path d="M4 4l16 16M20 4L4 20" />
  ),
  Twitter: (
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  ),
  Pinterest: (
    <path d="M9 20l4-9M8 12a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 13 12a4 4 0 0 1-6.9 2.6M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
  ),
  YouTube: (
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  WhatsApp: (
    <path d="M3 21l1.65-4.1A8.5 8.5 0 1 1 7.1 19.35L3 21zm5.3-10.6a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1 0 1.4 5.5 5.5 0 0 0 1.1 1.1 1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.4 0 7.5 7.5 0 0 1-2.1-5.3z" />
  ),
}

/**
 * Brand glyphs (social networks) drawn with the same 1.75 stroke
 * weight as the Lucide icon system so they belong to the same family.
 */
export default function BrandIcon({ name, size = 20, className = '', strokeWidth = 1.75 }) {
  const content = paths[name]
  if (!content) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}
