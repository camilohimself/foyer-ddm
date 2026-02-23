import { getPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Retraites',
      links: [
        { text: 'Nos retraites', href: getPermalink('/retraites') },
        { text: 'Retraites de 6 jours', href: getPermalink('/retraites/6-jours') },
        { text: 'Week-ends 3 jours', href: getPermalink('/retraites/week-end') },
        { text: 'Couples', href: getPermalink('/retraites/couples') },
        { text: 'Familles', href: getPermalink('/retraites/familles') },
        { text: 'Journées', href: getPermalink('/retraites/journees') },
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
        { text: 'Découvrir le Foyer', href: getPermalink('/le-foyer') },
        { text: 'L\'équipe', href: getPermalink('/le-foyer/equipe') },
        { text: 'Notre histoire', href: getPermalink('/le-foyer/histoire') },
        { text: 'Marthe Robin', href: getPermalink('/le-foyer/marthe-robin') },
      ],
    },
    {
      text: 'Séjour',
      links: [
        { text: 'Votre séjour', href: getPermalink('/sejour') },
        { text: 'Chambres', href: getPermalink('/sejour/chambres') },
        { text: 'Journée type', href: getPermalink('/sejour/journee-type') },
        { text: 'Tarifs', href: getPermalink('/sejour/tarifs') },
        { text: 'Accès', href: getPermalink('/sejour/acces') },
      ],
    },
    {
      text: 'Actualités',
      href: getPermalink('/actualites'),
    },
    {
      text: 'Témoignages',
      href: getPermalink('/temoignages'),
    },
    {
      text: 'Soutenir',
      href: getPermalink('/soutenir'),
    },
  ],
  actions: [
    {
      text: "S'inscrire",
      href: getPermalink('/contact/inscription'),
      variant: 'primary',
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Retraites',
      links: [
        { text: 'Retraites de 6 jours', href: getPermalink('/retraites/6-jours') },
        { text: 'Week-ends 3 jours', href: getPermalink('/retraites/week-end') },
        { text: 'Couples', href: getPermalink('/retraites/couples') },
        { text: 'Familles', href: getPermalink('/retraites/familles') },
        { text: 'Journées', href: getPermalink('/retraites/journees') },
        { text: 'Préparation au mariage', href: getPermalink('/retraites/preparation-mariage') },
      ],
    },
    {
      title: 'Infos pratiques',
      links: [
        { text: 'Tarifs', href: getPermalink('/sejour/tarifs') },
        { text: 'Accès', href: getPermalink('/sejour/acces') },
        { text: 'Chambres', href: getPermalink('/sejour/chambres') },
        { text: 'Journée type', href: getPermalink('/sejour/journee-type') },
        { text: 'Programme 2026', href: getPermalink('/programme') },
      ],
    },
    {
      title: 'Le Foyer',
      links: [
        { text: 'Découvrir', href: getPermalink('/le-foyer') },
        { text: 'L\'équipe', href: getPermalink('/le-foyer/equipe') },
        { text: 'Notre histoire', href: getPermalink('/le-foyer/histoire') },
        { text: 'Marthe Robin', href: getPermalink('/le-foyer/marthe-robin') },
        { text: 'Témoignages', href: getPermalink('/temoignages') },
        { text: 'Actualités', href: getPermalink('/actualites') },
      ],
    },
    {
      title: 'Contact',
      links: [
        { text: 'Route de Gryon 22, 1880 Bex', href: getPermalink('/sejour/acces') },
        { text: '+41 (0)24 463 22 22', href: 'tel:+41244632222' },
        { text: 'info@foyer-dents-du-midi.ch', href: 'mailto:info@foyer-dents-du-midi.ch' },
        { text: 'Formulaire de contact', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Réseau des Foyers de Charité', href: 'https://www.lesfoyersdecharite.com/' },
  ],
  socialLinks: [],
  footNote: `
    &copy; 2026 Foyer de Charité Dents-du-Midi · Tous droits réservés
  `,
};
