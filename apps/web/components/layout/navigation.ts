import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  Bell,
  History,
  Settings,
  Store,
  Tags,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** When set, the item shows a locked state if the plan lacks this feature. */
  feature?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics BI', href: '/analytics', icon: BarChart3, badge: 'Live', feature: 'advanced_analytics' },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Categories', href: '/categories', icon: Tags },
      { label: 'Inventory', href: '/inventory', icon: Boxes, badge: '1 Alert' },
      { label: 'Orders', href: '/orders', icon: ShoppingCart, badge: '1' },
      { label: 'Marketing & Promo', href: '/marketing', icon: Layers, feature: 'whatsapp_broadcast' },
      { label: 'Customers & Khata', href: '/customers', icon: Users },
    ],
  },
  {
    group: 'Finance & Compliance',
    items: [
      { label: 'Invoices (GST)', href: '/invoices', icon: FileText, feature: 'gst_invoicing' },
      { label: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    group: 'Storefront',
    items: [
      { label: 'Online Store', href: '/storefront', icon: Store },
      { label: 'Store Builder', href: '/storefront/builder', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Plan & Billing', href: '/billing', icon: Wallet },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Staff & Team RBAC', href: '/staff', icon: Users },
      { label: 'Security Center', href: '/security', icon: ShieldCheck },
      { label: 'Audit Logs', href: '/audit', icon: History },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export function isGroupActive(pathname: string | null, group: NavGroup) {
  if (!pathname) return false;
  return group.items.some((item) => isItemActive(pathname, item.href));
}