import { useMemo } from 'react'
import { parseSvg } from '../utils/sanitizeSvg'

export default function SafeIcon({ icon, className = '' }) {
  const svg = useMemo(() => parseSvg(icon), [icon])
  if (!svg) return null
  return <span className={className}>{svg}</span>
}
