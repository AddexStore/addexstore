# AddexStore Frontend — Premium Luxury Design System

Final report on the storefront + admin redesign into one shared luxury design system.

## 1. What was built

A single, token-driven luxury design system used by **both** the customer storefront and the admin dashboard — not a page-by-page reskin. One set of primitives, one palette, one type scale, one icon system, one interaction language.

### Design tokens — single source of truth
- `src/styles/theme.css` — all colors, surfaces, text, borders, shadows, semantic states as CSS variables, with full **light + dark** definitions.
- `src/index.css` — Tailwind v4 `@theme inline` mapping that turns every token into a utility (`bg-surface`, `text-sub`, `border-line`, `shadow-gold`, `bg-chart-purple`, ...). Includes base typography, focus rings, scrollbars, `.container-lux` / `.section-lux` / `.heading-display` / `.eyebrow`, skeleton shimmer, scroll-reveal, and keyframes.
- `src/constants/theme.js` — JS mirror of the tokens (used only where JS values are required: inline SVG charts).

### Palette
Warm white / ivory / sand neutrals, champagne-gold brand accent, charcoal ink, bronze/graphite touches. No flat SaaS greys, no Material/Amazon/Flipkart vibes. Semantic + chart series colors are also tokens.

### Icons — one library, one primitive
- `lucide-react` via `src/components/ui/Icon.jsx`: tree-shakeable named imports + a REGISTRY map (99 icons), single size scale (xs–xl), single stroke weight (1.75), `aria-hidden` by default.
- **Bundle:** ~785 KB → **~312 KB** (223 KB → **~103 KB gzip**).
- Social brand marks live in `BrandIcon` (separate from the Lucide system on purpose).

### Standardized UI primitives (`src/components/ui/`)
`Icon`, `Button`, `Card`, `Badge`, `Spinner`, `Skeleton`, `Input` (`Field/Input/Textarea/Select/Checkbox/Toggle`), `Modal` + `ConfirmDialog`, `StatusBadge`, `Table`, `PageHeader`, `SectionHeading`, `Reveal`, `Pagination`, `Tabs`, `BrandIcon`.

Geometry is fixed across the app: `rounded-card` 1rem, `rounded-field` 0.75rem, `rounded-soft` 0.5rem, `rounded-full` buttons; `shadow-card` / `shadow-card-hover` / `shadow-gold` / `shadow-overlay`.

## 2. Shared components rewritten
Navbar, Footer, HeroBanner, ProductCard, CategoryCard, SearchBar, MobileBottomNav, AdminSidebar, AdminNavbar, StarRating, BackButton, Toast, EmptyState, ImageWithFallback, SkeletonLoader, QuantitySelector, ThemeToggle, CelebrationOverlay, ErrorBoundary, LoadingFallback, MainLayout, AdminLayout.

## 3. Pages redesigned

**Storefront** — Home, AllProducts (bottom-sheet filter drawer), Search, Cart (free-shipping progress + mobile sticky footer), ProductDetails (gallery, swatch/size pills, accordions, reviews, related), Checkout (stepper, radio payment cards, Stripe/Razorpay panels), Login + Signup (split-screen charcoal hero with gold glow), Wishlist, NewArrivals, Trending, CategoriesPage (gold icon tiles), CategoryProducts (hero banner, subcategory grid, sticky sidebar filters), Orders (status pill tabs, gold progress stepper), OrderConfirmation, Profile, Settings, Notifications, PaymentStatus, About, Contact, NotFound.

**Admin (all 12)** — Dashboard (token StatCards, SVG revenue/orders charts, activity feed), Users (detail modal, role badges, sortable headers), Products (add/edit modal, variant table, gallery upload), Orders (Tabs, Table, StatusBadge selects), PaymentDetails (DetailCard rows, refund dialog), Categories, Banners, Payments, Reviews (StarRating, Badge, ConfirmDialog), Notifications, Settings (real Toggle), Inventory (mobile stack list), Analytics (Tabs, StatCards, SVG charts), Login (mirror of customer Login).

Admin refactors were executed with subagents working in parallel; all business logic/state/handlers preserved, verified with builds after each batch.

## 4. UX / accessibility / performance
- Focus-visible gold outline; `aria-label` on icon buttons; Icon is `aria-hidden`; Modal = `role="dialog"` + `aria-modal` + Escape-to-close + body scroll lock; skeleton shimmer + reduced-motion support; scroll-reveal respects `prefers-reduced-motion`.
- Buttons/spinners show loading state; toasts and confirm dialogs consistent everywhere; empty states everywhere.
- Bundle cut by ~60% via the tree-shakeable icon system; charts are inline SVG (no chart library); code-splitting already per-route.

## 5. Files modified
- Tokens: `src/styles/theme.css`, `src/index.css`, `src/constants/theme.js`
- Primitives: `src/components/ui/*` (Icon, Button, Card, Badge, Spinner, Skeleton, Input, Modal, StatusBadge, Table, PageHeader, SectionHeading, Reveal, Pagination, Tabs, BrandIcon)
- Shared: `src/components/*` + `src/layouts/MainLayout.jsx`, `AdminLayout.jsx`
- Payments: `StripeCheckout.jsx`, `RazorpayCheckout.jsx`, `StripePaymentElement.jsx`
- Pages: all storefront pages in `src/pages/*` and all admin pages in `src/pages/admin/*`

## 6. Recommendations (future)
- Focus-trap management inside `Modal` (e.g., `focus-trap-react`) for full keyboard accessibility.
- Move inline `bgColor` hex on HeroBanner/AdminBanners into a constrained set of banner palettes.
- Centralize color-swatch data (product colors) into a token-backed constant instead of hex literals.
- Add visual regression snapshots (Playwright) keyed to the token system to guard future drift.
