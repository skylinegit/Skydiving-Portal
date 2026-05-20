import type { AirfieldContent } from '@/types';

export const oldSarum: AirfieldContent = {
  id: 'old-sarum',
  name: 'Skydive Old Sarum',
  region: 'Wiltshire',
  address: 'Old Sarum Airfield, Old Sarum, Salisbury',
  postcode: 'SP4 6DZ',
  phone: '01722 322786',
  weightLimitKg: 95,
  weightSurchargeNote:
    'Max weight limit for all jumps is 15 stone. Please contact Skyline if you are unsure whether you qualify.',
  intro:
    'Old Sarum is a historic airfield just outside Salisbury, offering tandem skydives with stunning views of the Wiltshire countryside. The team here are friendly and run a smaller, quieter operation than the larger commercial dropzones.',
  importantNotes: [
    'All skydivers will be required to complete the airfield forms via the email link sent prior to the jump (this will be emailed to you around 1 week before your jump).',
    'Jump suits and goggles are provided. Please bring your own gloves if you would like to wear them.',
    'Spectators are welcome but please be aware that facilities are limited.',
    'Please wear comfortable, weather-appropriate clothing and tight-fitting trainers with no buckles, heels or hooks.',
  ],
  sections: [
    {
      heading: 'When?',
      paragraphs: [
        'Please see arrival time in your confirmation email and Profile page. Alterations to your jump date require a minimum one month notice.',
      ],
    },
    {
      heading: 'Weather',
      paragraphs: [
        'You are expected to arrive regardless of the weather. The airfield will contact you directly if conditions prevent your jump.',
      ],
    },
    {
      heading: 'Where?',
      paragraphs: [
        'The airfield is situated just outside Salisbury. If using a Sat-Nav the postcode is SP4 6DZ.',
      ],
    },
    {
      heading: 'What do I wear?',
      paragraphs: [
        'Comfortable clothes appropriate to the weather. A jumpsuit, hat and goggles are provided.',
      ],
    },
    {
      heading: 'Procedure',
      paragraphs: [
        'A 20-30 minute briefing covers equipment, boarding the aircraft and the exit position. Jumps run on a first come first served basis subject to weather and air traffic.',
      ],
    },
    {
      heading: 'Facilities',
      paragraphs: ['Refreshments are available on site. Free parking and a spectator area.'],
    },
    {
      heading: 'Photography',
      paragraphs: [
        'Freefall and handcam packages can be booked on the day. Personal cameras and Go Pros are not permitted.',
      ],
    },
    {
      heading: 'Accommodation',
      paragraphs: [
        'Salisbury offers plenty of local accommodation options. Please call the airfield if you would like recommendations.',
      ],
    },
    {
      heading: 'Finally',
      paragraphs: [
        'Friends and family are welcome to come and watch. Relax and enjoy the experience.',
      ],
    },
  ],
  facilities: ['Free parking', 'Spectator area', 'Refreshments', 'Toilets'],
  mapEmbedUrl: 'https://www.google.com/maps?q=Old+Sarum+Airfield+SP4+6DZ&output=embed',
};
