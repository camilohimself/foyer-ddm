/**
 * Netlify Function — Inscription newsletter via Brevo API.
 * Reçoit un POST formulaire (email + prenom optionnel),
 * crée le contact dans la liste "Newsletter Foyer" (ID 3),
 * puis redirige vers /newsletter/confirmation.
 */

const BREVO_LIST_ID = 3;
const BREVO_API_URL = 'https://api.brevo.com/v3/contacts';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const params = new URLSearchParams(body);

  const email = params.get('email')?.trim();
  const prenom = params.get('prenom')?.trim() || '';

  // Honeypot anti-spam
  if (params.get('bot-field')) {
    return Response.redirect(new URL('/newsletter/confirmation', req.url));
  }

  if (!email) {
    return Response.redirect(new URL('/?newsletter=error', req.url));
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[newsletter] BREVO_API_KEY manquante');
    return Response.redirect(new URL('/newsletter/confirmation', req.url));
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: prenom ? { PRENOM: prenom } : {},
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      console.error(`[newsletter] Brevo ${res.status}: ${err}`);
    }
  } catch (err) {
    console.error('[newsletter] Erreur:', err.message);
  }

  // Toujours rediriger — même en cas d'erreur Brevo, l'UX reste propre
  return Response.redirect(new URL('/newsletter/confirmation', req.url));
};
