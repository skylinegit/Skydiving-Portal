import type { AirfieldContent } from '@/types';

export const maidstone: AirfieldContent = {
  id: 'maidstone',
  name: 'Skydive Maidstone',
  region: 'Kent',
  address: 'Maidstone Airfield, Maidstone',
  postcode: 'ME17 1SP',
  phone: '01622 000000',
  weightLimitKg: 100,
  weightSurchargeNote:
    'Max weight limit for all jumps is 16 stone. Please contact Skyline if you are unsure whether you qualify.',
  intro:
    'Maidstone offers tandem skydives over the rolling Kent countryside with quick access from the M20. A friendly team and a relaxed atmosphere on jump day.',
  importantNotes: [
    'All skydivers will be required to complete the airfield forms via the email link sent prior to the jump (this will be emailed to you around 1 week before your jump).',
    'Jump suits and goggles are provided. Please bring your own gloves if you would like to wear them.',
    'Spectators are welcome.',
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
      paragraphs: ['The airfield is in Kent. If using a Sat-Nav the postcode is ME17 1SP.'],
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
        'A 20-30 minute briefing covers equipment, boarding and the exit position. Jumps run on a first come first served basis subject to weather and air traffic.',
      ],
    },
    {
      heading: 'Facilities',
      paragraphs: ['On-site cafe, free parking, spectator area and changing rooms.'],
    },
    {
      heading: 'Photography',
      paragraphs: [
        'Freefall and handcam packages can be booked on the day. Personal cameras and Go Pros are not permitted.',
      ],
    },
    {
      heading: 'Accommodation',
      paragraphs: ['Plenty of local hotels in Maidstone. Call the airfield for recommendations.'],
    },
    {
      heading: 'Finally',
      paragraphs: [
        'Friends and family are welcome to watch. Relax and enjoy the experience.',
      ],
    },
  ],
  facilities: ['Free parking', 'Cafe on site', 'Spectator area', 'Changing rooms'],
  mapEmbedUrl: 'https://www.google.com/maps?q=Maidstone+Airfield+ME17+1SP&output=embed',
};
