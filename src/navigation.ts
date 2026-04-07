import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Retraites',
      links: [
        { text: 'Nos retraites', href: getPermalink('/retraites') },
        { text: 'Journées', href: getPermalink('/retraites/journees') },
        { text: 'Week-ends', href: getPermalink('/retraites/week-ends') },
        { text: 'Retraites de 6 jours', href: getPermalink('/retraites/6-jours') },
        { text: 'Préparation au mariage', href: getPermalink('/retraites/preparation-mariage') },
      ],
    },
    {
      text: 'Programme',
      href: getPermalink('/programme'),
    },
    {
      text: 'Le Foyer',
      links: [
        { text: 'Le Foyer', href: getPermalink('/le-foyer') },
        { text: 'Notre histoire', href: getPermalink('/le-foyer/histoire') },
      ],
    },
    {
      text: 'Séjour',
      links: [
        { text: 'Conditions de séjour', href: getPermalink('/sejour/conditions') },
        { text: 'Chambres', href: getPermalink('/sejour/chambres') },
        { text: 'Journée type', href: getPermalink('/sejour/journee-type') },
        { text: 'Accès', href: getPermalink('/sejour/acces') },
      ],
    },
    {
      text: 'Méditations',
      href: getPermalink('/meditations'),
    },
    {
      text: 'Témoignages',
      href: getPermalink('/temoignages'),
    },
    {
      text: 'Soutenir',
      href: getPermalink('/soutenir'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [
    {
      text: "S'inscrire",
      href: getPermalink('/contact/inscription') + '?new',
      variant: 'primary' as const,
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Retraites',
      links: [
        { text: 'Journées', href: getPermalink('/retraites/journees') },
        { text: 'Week-ends', href: getPermalink('/retraites/week-ends') },
        { text: 'Retraites de 6 jours', href: getPermalink('/retraites/6-jours') },
        { text: 'Préparation au mariage', href: getPermalink('/retraites/preparation-mariage') },
      ],
    },
    {
      title: 'Infos pratiques',
      links: [
        { text: 'Conditions de séjour', href: getPermalink('/sejour/conditions') },
        { text: 'Accès', href: getPermalink('/sejour/acces') },
        { text: 'Chambres', href: getPermalink('/sejour/chambres') },
        { text: `Programme ${new Date().getFullYear()}`, href: getPermalink('/programme') },
      ],
    },
    {
      title: 'Le Foyer',
      links: [
        { text: 'Le Foyer', href: getPermalink('/le-foyer') },
        { text: 'Notre histoire', href: getPermalink('/le-foyer/histoire') },
        { text: 'Témoignages', href: getPermalink('/temoignages') },
        { text: 'Méditations', href: getPermalink('/meditations') },
      ],
    },
    {
      title: 'Contact',
      links: [
        { text: 'Route de Gryon 22, 1880 Bex', href: getPermalink('/sejour/acces') },
        { text: '+41 24 463 22 22', href: 'tel:+41244632222' },
        { text: 'info@foyer-dents-du-midi.ch', href: 'mailto:info@foyer-dents-du-midi.ch' },
        { text: 'S\'inscrire', href: getPermalink('/contact/inscription') },
        { text: 'Newsletter', href: '#footer-newsletter' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Réseau des Foyers de Charité', href: 'https://www.lesfoyersdecharite.com/', target: '_blank' },
    { text: 'Politique de confidentialité', href: getPermalink('/politique-de-confidentialite') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/foyerdentsdumidi', target: '_blank' },
  ],
  footNote: `
    &copy; ${new Date().getFullYear()} Foyer de Charité Dents-du-Midi · Tous droits réservés
  `,
};
