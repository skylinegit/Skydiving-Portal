import type { LucideIcon } from 'lucide-react';
import { ClipboardCheck, PiggyBank, Target, MapPin } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const checklistIntro =
  'Once you have your date confirmed it is important to make sure you are well organised in advance of your jump. Once you have completed all these steps you are ready for the big day.';

export const checklistOutro = 'Once you have completed all these steps then you are ready to go.';

export const checklistItems: ChecklistItem[] = [
  {
    id: 'medical-form',
    title: 'Medical form',
    description:
      'You only need one so please make sure you read them both carefully to determine which one you need. If you qualify for form 115A, then you do not need to bring it with you on the day. You may be sent a link to complete it online, failing that you can do it on the day. If you need form 115B then you will need to have this with you on the day, signed and stamped by your GP. You can find these under the Forms tab to your left.',
    icon: ClipboardCheck,
  },
  {
    id: 'outstanding-costs',
    title: 'Outstanding costs',
    description:
      'If you are a non-charity jump or you are self-funding, you will need to prepare the funds to be paid on the day in cash or card. You can find out the outstanding costs on the Sponsorship tab to your left.',
    icon: PiggyBank,
  },
  {
    id: 'reaching-target',
    title: 'Reaching your target',
    description:
      'If you have signed up for a charity jump and are looking for the cost of your jump to be covered by the charity, then you will need to make sure you hit your pre-set target by 7 days prior to your jump. Please refer to the Sponsorship tab to your left to see what your target is.',
    icon: Target,
  },
  {
    id: 'plan-your-trip',
    title: 'Plan your trip',
    description:
      'Ahead of your jump it is a good idea to find out the contact information and address for your chosen airfield. Please call the airfield if you have any questions on weather. All this information is found on the Venue Information tab to your left.',
    icon: MapPin,
  },
];
