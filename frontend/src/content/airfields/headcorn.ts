import type { AirfieldContent } from '@/types';

export const headcorn: AirfieldContent = {
  id: 'headcorn',
  name: 'Skydive Headcorn',
  region: 'Kent',
  address: 'Headcorn Aerodrome, Shenley Road, Ashford',
  postcode: 'TN27 9HX',
  phone: '01622 890226',
  weightLimitKg: 114,
  weightSurchargeNote:
    'Max weight limit for all jumps is 18 stone. A surcharge of £10 will apply for every stone over 15 stone.',
  intro:
    'Once booked in you may receive communication via text and/or email from GoSkydive. This is correspondence directly from the airfield that you are booked into. GoSkydive will include a link to make payment for your jump costs. If you have booked a full price Gift Voucher or a charity jump where you are able to use sponsorship to cover your jump costs, then please disregard this payment link for jump costs. For charity jumps where the charity allow sponsorship to cover jump costs, please continue to fundraise at least your minimum sponsorship amount as this will cover your jump costs payment on the day. We at Skyline ensure this is communicated to GoSkydive, please do not make any payments for jump costs to GoSkydive in this instance unless you intend to self-fund your jump or you have booked a non-charity skydive. If you have received notice that your chosen charity is a non-invoice charity, this information above is not applicable, please follow the advice given in our email.',
  importantNotes: [
    'All skydivers will be required to complete the airfield forms via the email link sent prior to the jump (this will be emailed to you around 1 week before your jump).',
    'Please bring your own gloves (optional) to wear during the skydive. Jump suits and goggles are provided.',
    'Spectators are not restricted, but please note that there are no indoor waiting areas. The on-site cafe is not a waiting area and you will be asked to leave if you are not buying anything.',
    'The medical declaration is done via the email link check-in sent 1 week before your jump. If you have the 115B medical form signed by your doctor then please bring it with you on the date.',
    'Please wear something warm and comfortable, layer up, for example, long sleeve t-shirt/jumper, leggings or tracksuit bottoms and tight-fitting shoes/trainers with no buckles, heels or hooks.',
  ],
  sections: [
    {
      heading: 'When?',
      paragraphs: [
        "Please see arrival time in your confirmation email and Profile page. Alterations to your jump date require a minimum one month's notice. Any changes made within two weeks of your jump date are subject to a £50 surcharge payable to GoSkydive.",
      ],
    },
    {
      heading: 'Weather',
      paragraphs: [
        'You are expected to arrive regardless of the weather. You will be contacted only if we do not want you to attend.',
      ],
    },
    {
      heading: 'Where?',
      paragraphs: [
        'Below is a map to the airfield which is situated just outside Headcorn in Kent. If using a Sat-Nav the postcode is TN27 9HX.',
      ],
    },
    {
      heading: 'What do I wear?',
      paragraphs: [
        'You should wear comfortable clothes that are suitable for the prevailing weather conditions. A jumpsuit, hat and goggles are provided.',
      ],
    },
    {
      heading: 'Procedure',
      paragraphs: [
        'First there will be a 20-30 minute briefing session on what equipment you will be using, how to board the aircraft and most importantly how to exit the aircraft in a stable face-to-earth position. The parachute centre will then place you in a queuing system on a first come first served basis and will endeavour to complete your jump as quickly as possible. But you should realise that with lots of other people waiting to jump and factors outside of their control such as weather and air traffic control, delays are going to be inevitable. Our advice is take something to read, lots to eat and do not expect to get back home until sometime in the evening. Please register at the tandem meeting point, the airfields operate a first come first served basis.',
      ],
    },
    {
      heading: 'Facilities',
      paragraphs: ['There is a full time canteen serving hot and cold food.'],
    },
    {
      heading: 'Photography',
      paragraphs: [
        'This can be arranged for an extra fee. Freefall is £169 per person.',
        'Handcam is £119 per person. You may book this service on the day or use your GoSkydive Portal to pre-book.',
        'Please note that using any personal filming or photography equipment such as Go Pros is strictly prohibited at all of our skydive locations.',
      ],
    },
    {
      heading: 'Accommodation',
      paragraphs: [
        'Please call the airfield on 01722 442967 should you require details of local accommodation.',
      ],
    },
    {
      heading: 'Finally',
      paragraphs: [
        'You are welcome to bring friends and family to watch, but please remember, facilities at airfields are fairly basic and young children may quickly become bored. Try not to be too nervous on the day; there will be many other people trying parachuting for the very first time and the more you relax the more you will enjoy it.',
      ],
    },
  ],
  facilities: ['On-site canteen', 'Free parking', 'Spectator area', 'Toilets and changing rooms'],
  mapEmbedUrl:
    'https://www.google.com/maps?q=Headcorn+Aerodrome+TN27+9HX&output=embed',
};
