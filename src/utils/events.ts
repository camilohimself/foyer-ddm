import { getCollection } from 'astro:content';

// --- Date constants (computed at build time) ---
export const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
export const currentYear = new Date().getFullYear().toString();

// --- Date formatting (fr-CH) ---
export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long' });
};

export const formatDateRange = (start: string, end?: string) => {
  if (!end) return formatDate(start);
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end + 'T12:00:00');
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}-${e.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long' })}`;
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
};

// --- Event queries ---
type EventType = '6-jours' | 'week-end' | 'couples' | 'familles' | 'journees' | 'mariage';

export async function getUpcomingEvents(type?: EventType) {
  const allEvents = await getCollection('event');
  return allEvents
    .filter((e) => e.data.dateStart >= today)
    .filter((e) => !type || e.data.type === type)
    .sort((a, b) => a.data.dateStart.localeCompare(b.data.dateStart));
}

export async function getAllEvents() {
  const allEvents = await getCollection('event');
  return allEvents.sort((a, b) => a.data.dateStart.localeCompare(b.data.dateStart));
}

export async function getUpcomingEventCount() {
  const upcoming = await getUpcomingEvents();
  return upcoming.length;
}

// --- Convert events to Steps component format ---
type Event = Awaited<ReturnType<typeof getUpcomingEvents>>[number];

const typeIcons: Record<string, string> = {
  '6-jours': 'tabler:sunset-2',
  'week-end': 'tabler:calendar-event',
  couples: 'tabler:hearts',
  familles: 'tabler:home-heart',
  journees: 'tabler:sun',
  mariage: 'tabler:rings',
};

export function eventsToStepsItems(events: Event[]) {
  return events.flatMap((event) => [
    {
      title: `${formatDateRange(event.data.dateStart, event.data.dateEnd)} — <span class="font-medium">«${event.data.title}»</span>`,
      description: '',
      icon: typeIcons[event.data.type] || ('tabler:calendar' as const),
    },
    {
      title: '',
      description: `${event.data.preacher}${event.data.variant ? ` · ${event.data.variant}` : ''}${event.data.price ? ` · ${event.data.price}` : ''}`,
    },
  ]);
}

// --- JSON-LD Event schema for structured data ---
const heroImages: Record<string, string> = {
  '6-jours': 'https://foyer-dents-du-midi.ch/images/fddm-croix-sommet-hiver.jpg',
  'week-end': 'https://foyer-dents-du-midi.ch/images/fddm-chapelle-tournesols.jpg',
  couples: 'https://foyer-dents-du-midi.ch/images/fddm-couple-marche.jpg',
  familles: 'https://foyer-dents-du-midi.ch/images/fddm-sentier-groupe.jpeg',
  journees: 'https://foyer-dents-du-midi.ch/images/fddm-feu-de-camp.jpg',
  mariage: 'https://foyer-dents-du-midi.ch/images/fddm-couple-mains.jpg',
};

export function eventsToJsonLd(events: Event[]) {
  return events.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.data.title,
    startDate: event.data.dateStart,
    endDate: event.data.dateEnd || event.data.dateStart,
    description: `${event.data.title} — ${event.data.preacher}. Retraite spirituelle au Foyer de Charité Dents-du-Midi, Bex, Suisse. Silence, enseignements et accompagnement au pied des Alpes.`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Foyer de Charité Dents-du-Midi',
      address: { '@type': 'PostalAddress', streetAddress: 'Route de Gryon 22', addressLocality: 'Bex', postalCode: '1880', addressCountry: 'CH' },
    },
    organizer: { '@type': 'Organization', name: 'Foyer de Charité Dents-du-Midi', url: 'https://foyer-dents-du-midi.ch' },
    ...(event.data.preacher ? { performer: event.data.preacher.split(',').map((p: string) => ({ '@type': 'Person', name: p.trim() })) } : {}),
    ...(event.data.price ? { offers: { '@type': 'Offer', price: event.data.price.replace(/[^0-9.]/g, ''), priceCurrency: 'CHF', url: 'https://foyer-dents-du-midi.ch/contact/inscription', availability: 'https://schema.org/InStock' } } : {}),
    image: heroImages[event.data.type] || 'https://foyer-dents-du-midi.ch/images/fddm-croix-sommet-hiver.jpg',
  }));
}

// --- Format event label for forms ---
export function formatEventLabel(event: Event): string {
  const start = formatDate(event.data.dateStart);
  const end = event.data.dateEnd ? formatDate(event.data.dateEnd) : '';
  const dateRange = end ? `${start} – ${end}` : start;
  const variant = event.data.variant ? ` (${event.data.variant})` : '';
  return `${dateRange} — «${event.data.title}»${variant}`;
}
