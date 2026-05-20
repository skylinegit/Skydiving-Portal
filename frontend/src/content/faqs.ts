import type { ReactNode } from 'react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: 'how-to-get-started',
    title: 'How to get started',
    items: [
      {
        question: "What are your company's terms and conditions?",
        answer:
          'You can read over our terms and conditions here. Everyone who books on with us needs to accept these before we can get you confirmed with the airfield.',
      },
      {
        question: 'How does the medical form work?',
        answer: [
          'British Skydiving insist that all participants bring their medical form with them on the day. Whether you need to get the form signed by a doctor depends on the following information.',
          'The first medical form is Form 115A. If you have any of the medical conditions listed on the form, then you must get Form 115B signed by a doctor instead. If you do not have any of the medical conditions listed on the form, then you may self-sign Form 115A and bring that along on the day.',
          'Please print your form double-sided (if possible) and bring it with you on the day. If you are not able to do this please email us at info@skylineevents.co.uk and we can post a form out to you.',
          'Both 115A and 115B are available on the My Forms page in this portal.',
          'If you book on for an accelerated freefall skydive (AFF) you will need to get the solo medical form signed. If you are 40 years or older and doing a solo jump, you will need to get this form signed by your doctor.',
        ].join('\n\n'),
      },
      {
        question: 'What if I have a disability, can I still jump?',
        answer:
          'Our airfields will look at each case individually, so please email us at info@skylineevents.co.uk and we can check for you. With any medical condition you will also need to have the medical form signed by a doctor.',
      },
      {
        question: 'What if my doctor tells me I cannot jump due to medical reasons?',
        answer:
          'If your doctor refuses to sign your medical form or advises you not to jump, you need to send us over a note from your doctor informing us of this. If the doctor says you cannot do the jump, unfortunately you will need to take their medical advice.',
      },
    ],
  },
  {
    id: 'once-booked-on',
    title: 'Once booked on',
    items: [
      {
        question: "I've booked on, now what?",
        answer:
          'Once you have booked your jump and paid the deposit, you will need to wait up to 5 working days for us to send a confirmation email. This email will have everything you need to know for the jump. If you do not hear from us after 5 business days, it is best to contact the office to make sure there is not an issue with your booking.',
      },
      {
        question: "After I've booked on, can I change the airfield I want to jump at?",
        answer:
          'You can change to your preferred airfield providing that you give your original airfield at least 4 weeks notice of the cancellation with them and you have not paid the original airfield any jump cost. Also, keep in mind when changing that every airfield has a different jump cost.',
      },
      {
        question: 'What if I have to cancel or reschedule?',
        answer:
          'If you have to cancel your jump, please contact our office on 0207 424 5522 or email myskydive@skylineevents.co.uk. Remember, your deposit is non-refundable and you have until four weeks before your jump within which we can reschedule you for free. If you cancel or reschedule within four weeks of your jump, you are required to pay a £50 cancellation fee, and if this is within one week (seven days) of your jump date, this fee rises to £100.',
      },
    ],
  },
  {
    id: 'fundraising',
    title: 'Fundraising information for charity jumps',
    items: [
      {
        question: 'How can I fundraise?',
        answer:
          'You have the option to fundraise online or offline or both. When you book on, we will send a confirmation email with more details about fundraising and you will find details on your minimum fundraising target on the Sponsorship tab in the menu.',
      },
      {
        question: 'How do I get my £70 deposit back if I am doing a charity jump?',
        answer: [
          'If you are jumping for charity and would like to reimburse yourself for your deposit, you can do so out of any cash donations that you have received. You cannot be reimbursed from any funds raised on your online fundraising page.',
          'If you no longer wish to complete the skydive we can cancel your jump, but the deposit is non-refundable.',
        ].join('\n\n'),
      },
    ],
  },
  {
    id: 'on-the-day',
    title: 'On the day',
    items: [
      {
        question: "What if the weather isn't looking good?",
        answer:
          'The one aspect of your day that is out of our control is definitely the weather. If the forecast is looking bad in the days leading up to your jump, you may be contacted by the airfield to reschedule, and you are free to contact the airfield yourself to ask about whether the jump will be going ahead. However, if you have not heard anything to the contrary, you must still turn up to your jump.',
      },
      {
        question: 'Can I have supporters come with me on the day and what time should they arrive?',
        answer:
          'Of course, you can bring along supporters. We recommend that they arrive with you. Your jump time will vary so you can be in the plane in as little as 30 minutes.',
      },
      {
        question: 'What time do I need to be at the airfield for?',
        answer:
          'Your arrival time at the airfield would have been sent to you in your confirmation email and can be viewed under the Profile tab in the menu. It is usually between 8am and 9am. Please note that we cannot provide a jump time as it is weather dependent.',
      },
      {
        question: 'Can I use a GoPro?',
        answer:
          'The airfields do not allow you to use your own recording equipment for the jump. However you can purchase filming from most airfields on the day. Please check your booking details on the portal to check if you need to pre-book your video or if you can book upon arrival as this varies at different airfields.',
      },
      {
        question: 'Are dogs allowed at the airfield?',
        answer:
          'The airfields vary on their restrictions for dogs. Some allow dogs on lead, however the following airfields do not: Bridlington, Brigg, Coleraine, Errol, Honiton, Lancaster, Maidstone, Netheravon (Salisbury), Nottingham and Swansea.',
      },
      {
        question: 'How long does the process take to complete the jump?',
        answer:
          'We will give you an arrival time once you are confirmed with the airfield. This is when you will check in and receive your training for the jump. The jump time would depend on the weather and how many other people are booked in that day. There is a small chance you could wait all day until you jump. The airfields do operate a first come first served basis though, so the earlier you arrive the earlier you will jump.',
      },
      {
        question: 'What do I wear?',
        answer:
          'The airfield will provide you with a jumpsuit on the day. You just need to wear comfortable clothing underneath and suitable tie-up shoes (trainers or something similar would be ideal). We recommend layering up on a colder day and wearing ski gloves (optional).',
      },
      {
        question: 'Can I wear glasses or contact lenses?',
        answer:
          'You can wear both of these. The airfields will have a range of goggles made to fit over glasses.',
      },
    ],
  },
];
