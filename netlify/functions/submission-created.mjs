/**
 * Netlify Function — submission-created (event-triggered)
 * Déclenchée automatiquement par Netlify à chaque soumission de formulaire.
 *
 * Formulaire "contact" uniquement :
 *   1. Email notification via Brevo SMTP → info@foyer-dents-du-midi.ch
 *   2. Création/MAJ contact dans Brevo CRM (liste Contacts site)
 *
 * Formulaire "inscription" : géré nativement par Netlify Forms
 *   → notification email configurée dans Netlify dashboard
 *   (Site > Forms > Form notifications > Email notification)
 *
 * Prérequis Brevo :
 *   - Domaine expéditeur vérifié (foyer-dents-du-midi.ch) dans Brevo > Senders
 *   - BREVO_API_KEY configurée dans Netlify > Environment Variables
 */

const NOTIFY_EMAIL = 'info@foyer-dents-du-midi.ch';
const SENDER_EMAIL = 'noreply@foyer-dents-du-midi.ch';
const SENDER_NAME = 'Foyer de Charité Dents-du-Midi';
const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_CONTACTS_URL = 'https://api.brevo.com/v3/contacts';
const BREVO_LIST_CONTACTS = 5;

export const handler = async (event) => {
  const payload = JSON.parse(event.body).payload;
  const formName = payload.form_name;
  const data = payload.data || {};

  console.log(`[submission-created] Formulaire: ${formName}`);

  // Inscription = Netlify Forms natif, rien à faire ici
  if (formName !== 'contact') {
    return { statusCode: 200 };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[submission-created] BREVO_API_KEY manquante');
    return { statusCode: 200 };
  }

  const subject = `Message de ${data.nom || 'Visiteur'} — ${data.sujet || 'Contact site web'}`;
  const htmlContent = buildContactEmail(data);

  // --- 1. Email notification ---
  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: NOTIFY_EMAIL, name: SENDER_NAME }],
        replyTo: data.email ? { email: data.email, name: data.nom || '' } : undefined,
        subject,
        htmlContent,
      }),
    });
    const text = await res.text();
    console.log(`[submission-created] Brevo email ${res.status}: ${text}`);
  } catch (err) {
    console.error('[submission-created] Erreur email:', err.message);
  }

  // --- 2. Créer/MAJ contact dans Brevo CRM ---
  if (data.email) {
    const attributes = {};
    const parts = (data.nom || '').split(' ');
    if (parts.length >= 2) {
      attributes.PRENOM = parts[0];
      attributes.NOM = parts.slice(1).join(' ');
    } else if (parts[0]) {
      attributes.NOM = parts[0];
    }
    if (data.telephone) attributes.SMS = data.telephone;

    try {
      const res = await fetch(BREVO_CONTACTS_URL, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          attributes,
          listIds: [BREVO_LIST_CONTACTS],
          updateEnabled: true,
        }),
      });
      const text = await res.text();
      console.log(`[submission-created] Brevo contact ${res.status}: ${text}`);
    } catch (err) {
      console.error('[submission-created] Erreur contact:', err.message);
    }
  }

  return { statusCode: 200 };
};

// ---------------------------------------------------------------------------
// Template email contact
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600;color:#112F41;width:180px;vertical-align:top">${label}</td>
    <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333">${escapeHtml(value)}</td>
  </tr>`;
}

function buildContactEmail(d) {
  let rows = '';
  rows += row('Nom', d.nom);
  rows += row('Email', d.email);
  rows += row('Téléphone', d.telephone);
  rows += row('Sujet', d.sujet);

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:#112F41;padding:24px 32px">
      <h1 style="margin:0;color:#F09A0A;font-size:20px;font-weight:700">Nouveau message de contact</h1>
    </div>
    <div style="padding:24px 32px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <div style="margin-top:20px;padding:16px 20px;background:#f8f9fa;border-left:4px solid #F09A0A;border-radius:0 8px 8px 0;white-space:pre-wrap;line-height:1.6;color:#333">${escapeHtml(d.message || '(pas de message)')}</div>
    </div>
    <div style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:12px">Soumis via le formulaire de contact — foyer-dents-du-midi.ch</p>
    </div>
  </div>
</body>
</html>`;
}
