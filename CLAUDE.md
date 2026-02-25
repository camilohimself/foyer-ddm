# Foyer de Charite Dents-du-Midi — Site Web

**Stack** : Astro 5 + AstroWind (vendored) + Tailwind 3 + Decap CMS + Netlify
**Repo** : `git@github.com:camilohimself/foyer-ddm.git`
**Build** : `npm run build` → `dist/` (static, no SSR) — 32 pages, ~7s
**Dev** : `npm run dev` (localhost:4321)

## Design System

- **Couleurs** : Primary `#112F41` (bleu petrole) + Accent `#F09A0A` (orange FDC)
- **Typo** : Josefin Sans (headings), Playball (display/cursive), Inter (fallback body)
- **Theme** : `light:only` — pas de dark mode
- **Boutons** : `.btn-primary` (orange), `.btn-secondary` (bleu), `.btn-tertiary` (ghost)
- **Logo** : `logo-ddm-orange.png` (header), `logo-ddm-nb.png` (footer) — converti depuis .ai

## Images — Etat au 25 fev 2026

**32 photos reelles** du Foyer integrees (0 Unsplash, 0 stock restant sur pages modifiees).
- `src/assets/images/fddm-*.jpg` — traitees par Astro Image (WebP auto, srcsets)
- `public/images/fddm-*.jpg` — hero backgrounds (chargement eager, pas de pipeline)
- 51 images WebP generees au build
- Catalogue source : `03_SITE-WEB/ASSETS/CHOIX-PHOTOS-DRIVE/` (47 photos auditees)

### Hero photos (toutes les pages)
| Page | Photo hero |
|------|-----------|
| index (homepage) | fddm-lune-dents-du-midi |
| retraites/index | fddm-chapelle-etoile |
| retraites/6-jours | fddm-croix-sommet-hiver |
| retraites/week-end | fddm-chapelle-tournesols |
| retraites/couples | fddm-couple-marche |
| retraites/familles | fddm-sentier-groupe |
| retraites/journees | fddm-feu-de-camp |
| retraites/preparation-mariage | fddm-couple-mains |
| sejour/index | fddm-facade-ete |
| programme | fddm-contemplation-dents-du-midi |
| temoignages | fddm-autel-hiver |
| contact/inscription | fddm-raquettes-dents-du-midi |
| le-foyer/index | fddm-automne-2 |
| soutenir | fddm-bougies-priere |
| galerie | fddm-randonnee-alpage |

### Content images ajoutees (25 fev)
| Page | Photo content | Sujet |
|------|--------------|-------|
| index (homepage) | fddm-tablee-terrasse | Repas convivial en terrasse |
| retraites/index | fddm-enseignement-alpage | Enseignement en cercle sur alpage |
| retraites/familles | fddm-enfants-parachute | Enfants jeu parachute |
| sejour/index | fddm-paella-montagnes | Cuisine plein air + DDM |
| le-foyer/index | fddm-messe-plein-air | Messe en plein air alpage |
| le-foyer/index | fddm-lavement-pieds | Lavement pieds Jeudi Saint |

### Photos a remplacer (toujours stock/basse qualite)
- `fddm-couple-marche` (hero couples) — demander photo couple authentique
- `fddm-couple-mains` (hero mariage) — idem
- `fddm-bougies-priere` (hero soutenir) — potentiellement stock

### Pattern hero
```astro
<Fragment slot="bg">
  <div class="absolute inset-0">
    <img src="/images/fddm-xxx.jpg" alt="..." class="w-full h-full object-cover" loading="eager" />
    <div class="absolute inset-0 bg-primary-900/60"></div>
  </div>
</Fragment>
```

### Pattern content image
```astro
import imgName from '~/assets/images/fddm-xxx.jpg';
// puis dans Content component :
image={{ src: imgName, alt: '...' }}
```

## Header

- Logo : `h-20` mobile, `h-[66px]` desktop
- CSS color-switching dans `tailwind.css` :
  - `#header` : texte blanc (sur hero)
  - `#header.scroll` : texte sombre (apres scroll)
  - `#header.expanded` : texte sombre (menu mobile ouvert)
  - `#header .dropdown-menu a` : toujours sombre (fond blanc/90)
- Hamburger : `bg-gray-900` (visible sur fond clair mobile)

## Architecture

```
src/
├── pages/              # 32 pages statiques
│   ├── index.astro     # Homepage (3 events + 6 temoignages)
│   ├── retraites/      # Hub + 6 types (6-jours, week-end, couples, familles, journees, mariage)
│   ├── le-foyer/       # 4 pages (index, equipe, histoire, marthe-robin)
│   ├── sejour/         # 5 pages (index, chambres, journee-type, tarifs, acces)
│   ├── contact/        # Contact + inscription wizard 3 etapes
│   ├── programme.astro # Calendrier 2026 (19 events)
│   ├── temoignages.astro
│   ├── galerie.astro
│   └── soutenir.astro
├── data/               # Content collections
│   ├── post/           # 7 messages P. Guy (.md)
│   ├── events/         # 19 retraites 2026 (.md/.yaml)
│   └── testimonials/   # 17 temoignages (.md/.yaml)
├── content/config.ts   # Schema des 3 collections
├── navigation.ts       # Header (6 sections + CTA) + Footer
├── config.yaml         # Site metadata, blog config, i18n fr
├── components/
│   ├── Logo.astro      # Logo officiel FDC (logo-ddm-orange.png)
│   ├── CustomStyles.astro
│   └── widgets/        # Hero, Features, Content, Steps, Testimonials, CallToAction...
├── layouts/            # PageLayout, Layout, MarkdownLayout, LandingLayout
├── assets/
│   ├── images/         # 32 photos fddm-* + 3 logos logo-ddm-*
│   └── styles/tailwind.css  # Custom utilities (.btn-*, .wizard-step, .radio-card, header states)
```

## CMS (Decap)

- Config : `public/admin/config.yml`
- Backend : git-gateway (branche main)
- Collections : events, testimonials, actualites (posts)
- Acces : `/admin` via Netlify Identity

## Formulaire inscription

- `src/pages/contact/inscription.astro` — wizard 3 etapes (vanilla JS)
- Step 1 : Choix retraite + profil participant
- Step 2 : Infos personnelles + hebergement + regime
- Step 3 : Recapitulatif + RGPD
- Backend actuel : Netlify Forms (`data-netlify="true"`)
- TODO : Basculer vers API OASIS si endpoints disponibles (ligne ~718)

## Conventions

- Couleurs via Tailwind config (`primary-*`, `accent-*`) — jamais de hex en dur
- Collections dans `src/data/` (pas `src/content/`)
- Slugs URL en francais sans accents (`/sejour/journee-type`)
- Photos nommees `fddm-` + description kebab-case
- Hero : photo dans `public/images/` + overlay `bg-primary-900/60`
- Content : import depuis `~/assets/images/` (optimisation Astro)
- Template AstroWind vendored dans `vendor/integration/` — ne pas modifier

## Deploiement

- `netlify.toml` : build `npm run build`, publish `dist/`
- Cache : `/_astro/*` → immutable (31536000s)
- DNS : foyer-dents-du-midi.ch (migration vers Netlify en attente)
- GA4 : ID a configurer dans `config.yaml` → `googleAnalyticsId`
