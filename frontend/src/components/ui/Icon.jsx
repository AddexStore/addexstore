import {
  Home, ShoppingBag, ShoppingCart, ShoppingBasket, User, Users, UserPlus, UserCheck,
  Heart, HeartCrack, Bell, Search, SearchX, Menu, X, Plus, Minus, ChevronLeft,
  ChevronRight, ChevronDown, ChevronUp, Trash2, Star, Settings, LogOut, Package,
  PackageOpen, PackageCheck, PackageX, LayoutDashboard, LayoutGrid, Warehouse, Image,
  CreditCard, AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, ArrowLeft,
  ArrowRight, ArrowUpRight, ArrowDownRight, ArrowDown, ArrowUp, Filter, SlidersHorizontal,
  Truck, ShieldCheck, RefreshCw, Eye, EyeOff, Mail, Lock, Phone, MapPin, Clock,
  Calendar, CalendarDays, Check, CheckCheck, Copy, Pencil, Upload, Tag, TrendingUp,
  TrendingDown, DollarSign, Send, Sparkles, Zap, Flame, Gem, Award, BadgeCheck, Gift,
  Wallet, FileText, Sun, Moon, BarChart3, PenLine, PlusCircle, XCircle, Grid3x3,
  History, Store, CircleDollarSign, MessageSquare, ThumbsUp, Rocket, Layers, Box,
  Banknote, ClipboardList, LogIn, KeyRound, Landmark, QrCode, Percent, Ticket, Timer,
  MonitorSmartphone, Camera, Trash, Repeat, RotateCcw, Ban, ExternalLink, Archive,
  ChartColumn, Table2, ScrollText, Cog, CircleUserRound, Navigation, MailOpen,
  Headphones, HandCoins, Palette, Ruler, Sparkle, MoonStar, SunMedium, PartyPopper,
  AppWindow, Recycle, HeartHandshake,
} from 'lucide-react'

const REGISTRY = {
  Home, ShoppingBag, ShoppingCart, ShoppingBasket, User, Users, UserPlus, UserCheck,
  Heart, HeartCrack, Bell, Search, SearchX, Menu, X, Plus, Minus, ChevronLeft,
  ChevronRight, ChevronDown, ChevronUp, Trash2, Star, Settings, LogOut, Package,
  PackageOpen, PackageCheck, PackageX, LayoutDashboard, LayoutGrid, Warehouse, Image,
  CreditCard, AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, ArrowLeft,
  ArrowRight, ArrowUpRight, ArrowDownRight, ArrowDown, ArrowUp, Filter, SlidersHorizontal,
  Truck, ShieldCheck, RefreshCw, Eye, EyeOff, Mail, Lock, Phone, MapPin, Clock,
  Calendar, CalendarDays, Check, CheckCheck, Copy, Pencil, Upload, Tag, TrendingUp,
  TrendingDown, DollarSign, Send, Sparkles, Zap, Flame, Gem, Award, BadgeCheck, Gift,
  Wallet, FileText, Sun, Moon, BarChart3, PenLine, PlusCircle, XCircle, Grid3x3,
  History, Store, CircleDollarSign, MessageSquare, ThumbsUp, Rocket, Layers, Box,
  Banknote, ClipboardList, LogIn, KeyRound, Landmark, QrCode, Percent, Ticket, Timer,
  MonitorSmartphone, Camera, Trash, Repeat, RotateCcw, Ban, ExternalLink, Archive,
  ChartColumn, Table2, ScrollText, Cog, CircleUserRound, Navigation, MailOpen,
  Headphones, HandCoins, Palette, Ruler, Sparkle, MoonStar, SunMedium, PartyPopper,
  AppWindow, Recycle, HeartHandshake,
}

const SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
}

/**
 * Single icon primitive for the entire app. Only icons registered
 * above are bundled (tree-shakeable), keeping the JS payload small.
 *
 * Usage: <Icon name="ShoppingBag" size="md" />
 */
export default function Icon({ name, size = 'md', strokeWidth = 1.75, className = '', ...props }) {
  const LucideIcon = REGISTRY[name]
  if (!LucideIcon) return null
  const px = typeof size === 'number' ? size : SIZES[size] || 20
  return (
    <LucideIcon
      size={px}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  )
}
