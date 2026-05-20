import {
  ClipboardList,
  User,
  MapPin,
  HelpCircle,
  FileText,
  Heart,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: '/portal/checklist', label: 'Checklist', icon: ClipboardList },
  { href: '/portal/profile', label: 'Profile', icon: User },
  { href: '/portal/venue', label: 'Venue Information', icon: MapPin },
  { href: '/portal/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/portal/forms', label: 'My Forms', icon: FileText },
  { href: '/portal/sponsorship', label: 'Sponsorship', icon: Heart },
];
