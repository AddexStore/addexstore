import { createElement } from 'react'

const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
  'ellipse', 'defs', 'use', 'symbol', 'marker', 'linearGradient',
  'radialGradient', 'stop', 'clipPath', 'mask', 'pattern', 'filter',
  'feGaussianBlur', 'feOffset', 'feBlend', 'feColorMatrix', 'feMerge',
  'feMergeNode', 'feFlood', 'feComposite', 'text', 'tspan', 'desc', 'title',
])

const ATTR_MAP = {
  viewBox: 'viewBox',
  viewbox: 'viewBox',
  strokeWidth: 'strokeWidth',
  'stroke-width': 'strokeWidth',
  strokewidth: 'strokeWidth',
  strokeLinecap: 'strokeLinecap',
  'stroke-linecap': 'strokeLinecap',
  strokelinecap: 'strokeLinecap',
  strokeLinejoin: 'strokeLinejoin',
  'stroke-linejoin': 'strokeLinejoin',
  strokelinejoin: 'strokeLinejoin',
  strokeDasharray: 'strokeDasharray',
  'stroke-dasharray': 'strokeDasharray',
  strokedasharray: 'strokeDasharray',
  strokeDashoffset: 'strokeDashoffset',
  'stroke-dashoffset': 'strokeDashoffset',
  strokedashoffset: 'strokeDashoffset',
  strokeMiterlimit: 'strokeMiterlimit',
  'stroke-miterlimit': 'strokeMiterlimit',
  strokemiterlimit: 'strokeMiterlimit',
  strokeOpacity: 'strokeOpacity',
  'stroke-opacity': 'strokeOpacity',
  strokeopacity: 'strokeOpacity',
  fillRule: 'fillRule',
  'fill-rule': 'fillRule',
  fillrule: 'fillRule',
  fillOpacity: 'fillOpacity',
  'fill-opacity': 'fillOpacity',
  fillopacity: 'fillOpacity',
  stopColor: 'stopColor',
  'stop-color': 'stopColor',
  stopcolor: 'stopColor',
  stopOpacity: 'stopOpacity',
  'stop-opacity': 'stopOpacity',
  stopopacity: 'stopOpacity',
  clipPath: 'clipPath',
  'clip-path': 'clipPath',
  clippath: 'clipPath',
  clipRule: 'clipRule',
  'clip-rule': 'clipRule',
  cliprule: 'clipRule',
  class: 'className',
}

const PLAIN_ATTRS = new Set([
  'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'width', 'height', 'points', 'fill', 'stroke', 'opacity', 'transform',
  'offset', 'mask', 'filter', 'id', 'version',
])

const FORBIDDEN_TAGS = ['script', 'foreignobject', 'iframe', 'object', 'embed', 'a', 'image', 'audio', 'video']

const DANGEROUS_PATTERN = /javascript:|vbscript:|expression\(|<script|on\w+\s*=/i

export function isSvgMarkup(value) {
  return typeof value === 'string' && value.trim().startsWith('<')
}

function normalizeAttr(raw) {
  if (!raw) return null
  if (ATTR_MAP[raw]) return ATTR_MAP[raw]
  const lower = raw.toLowerCase()
  if (ATTR_MAP[lower]) return ATTR_MAP[lower]
  return PLAIN_ATTRS.has(lower) ? lower : null
}

function buildElement(el) {
  const tag = el.tagName.toLowerCase()
  if (!SVG_TAGS.has(tag)) return null

  const props = {}
  const attrs = el.attributes || []
  for (let i = 0; i < attrs.length; i++) {
    const raw = attrs[i]
    const name = raw.name
    if (!name || name.toLowerCase().startsWith('on')) continue
    const lower = name.toLowerCase()
    if (lower === 'href' || lower === 'xlink:href' || lower === 'style' || lower === 'src' || lower === 'formaction') continue
    const key = normalizeAttr(name)
    if (key && key !== 'className') {
      props[key] = raw.value
    }
  }

  const children = []
  const childNodes = el.childNodes || []
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (child.nodeType === 1) {
      const built = buildElement(child)
      if (built) children.push(built)
    } else if (child.nodeType === 3 && child.textContent && child.textContent.trim()) {
      children.push(child.textContent)
    }
  }

  return createElement(tag, props, ...children)
}

/**
 * Parses an inline SVG string into a React element tree.
 * Only whitelisted tags and safe presentational attributes survive;
 * scripts, event handlers, hrefs and styles are dropped entirely.
 * Returns null for anything that is not safe inline SVG markup.
 */
export function parseSvg(svgString) {
  if (!isSvgMarkup(svgString)) return null

  const trimmed = svgString.trim()
  const lower = trimmed.toLowerCase()
  if (DANGEROUS_PATTERN.test(lower)) return null
  for (const tag of FORBIDDEN_TAGS) {
    if (lower.includes(`<${tag}`) || lower.includes(`</${tag}`)) return null
  }

  let doc
  try {
    doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml')
  } catch (e) {
    return null
  }
  if (!doc || doc.querySelector('parsererror')) return null

  const root = doc.documentElement
  if (!root || root.tagName.toLowerCase() !== 'svg') return null

  return buildElement(root)
}
