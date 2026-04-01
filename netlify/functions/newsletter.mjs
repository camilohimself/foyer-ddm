/**
 * Netlify Function — Inscription newsletter via Brevo API.
 * Reçoit un POST formulaire (email + prenom optionnel),
 * crée le contact dans la liste "Newsletter Foyer" (ID 3),
 * puis redirige vers /newsletter/confirmation.
 */

const BREVO_LIST_ID = 3;
const BREVO_API_URL = 'https://api.brevo.com/v3/contacts';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let email = '';
  let prenom = '';
  let botField = '';

  // Parser le body — formData() pour les formulaires HTML standard
  try {
    const formData = await req.formData();
    email = formData.get('email')?.trim() || '';
    prenom = formData.get('prenom')?.trim() || '';
    botField = formData.get('bot-field') || '';
  } catch {
    // Fallback: parser comme texte URL-encoded
    try {
      const body = await req.text();
      const params = new URLSearchParams(body);
      email = params.get('email')?.trim() || '';
      prenom = params.get('prenom')?.trim() || '';
      botField = params.get('bot-field') || '';
    } catch (e) {
      console.error('[newsletter] Impossible de parser le body:', e.message);
    }
  }

  console.log(`[newsletter] email=${email}, prenom=${prenom}`);

  // Honeypot anti-spam
  if (botField) {
    return new Response(null, { status: 302, headers: { Location: '/newsletter/confirmation' } });
  }

  if (!email) {
    console.error('[newsletter] Email vide — body non parsé');
    return new Response(null, { status: 302, headers: { Location: '/?newsletter=error' } });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[newsletter] BREVO_API_KEY manquante');
    return new Response(null, { status: 302, headers: { Location: '/newsletter/confirmation' } });
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

    const responseText = await res.text();
    console.log(`[newsletter] Brevo ${res.status}: ${responseText}`);
  } catch (err) {
    console.error('[newsletter] Erreur Brevo:', err.message);
  }

  return new Response(null, { status: 302, headers: { Location: '/newsletter/confirmation' } });
};
