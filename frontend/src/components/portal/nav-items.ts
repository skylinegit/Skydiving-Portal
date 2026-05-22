import {
  ClipboardList,
  CalendarCheck,
  MapPin,
  HelpCircle,
  FileText,
  Heart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: '/portal/checklist', label: 'Checklist', icon: ClipboardList },
  { href: '/portal/profile', label: 'Booking Detail', icon: CalendarCheck },
  { href: '/portal/venue', label: 'Venue Information', icon: MapPin },
  { href: '/portal/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/portal/forms', label: 'My Forms', icon: FileText },
  { href: '/portal/sponsorship', label: 'Sponsorship', icon: Heart },
  { href: '/portal/settings', label: 'Settings', icon: Settings },
];
