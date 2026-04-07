/**
 * Netlify Function — submission-created (event-triggered)
 * Declenchee automatiquement par Netlify a chaque soumission de formulaire.
 *
 * Formulaire "contact" :
 *   - Email notification via Brevo SMTP → info@foyer-dents-du-midi.ch
 *   - Creation/MAJ contact dans Brevo CRM (liste Contacts site)
 *
 * Formulaire "inscription" :
 *   - Email notification formatee → info@foyer-dents-du-midi.ch (imprimable)
 *   - Email confirmation → inscrit(e) (accuse de reception)
 *   - Creation/MAJ contact dans Brevo CRM
 *   NOTE : Desactiver la notification native Netlify Forms pour eviter les doublons
 *          (Site > Forms > inscription > Form notifications > supprimer l'email notification)
 *
 * Prerequis Brevo :
 *   - Domaine expediteur verifie (foyer-dents-du-midi.ch) dans Brevo > Senders
 *   - BREVO_API_KEY configuree dans Netlify > Environment Variables
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

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[submission-created] BREVO_API_KEY manquante');
    return { statusCode: 200 };
  }

  if (formName === 'contact') {
    await handleContact(apiKey, data);
  } else if (formName === 'inscription') {
    await handleInscription(apiKey, data);
  }

  return { statusCode: 200 };
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

async function handleContact(apiKey, data) {
  const subject = `Message de ${data.nom || 'Visiteur'} — ${data.sujet || 'Contact site web'}`;

  await sendEmail(apiKey, {
    to: [{ email: NOTIFY_EMAIL, name: SENDER_NAME }],
    replyTo: data.email ? { email: data.email, name: data.nom || '' } : undefined,
    subject,
    htmlContent: buildContactEmail(data),
  });

  if (data.email) {
    await upsertBrevoContact(apiKey, data.email, {
      NOM: data.nom || '',
      SMS: data.telephone || '',
    });
  }
}

// ---------------------------------------------------------------------------
// Inscription
// ---------------------------------------------------------------------------

async function handleInscription(apiKey, data) {
  const prenom = data['adulte-1-prenom'] || '';
  const nom = data['adulte-1-nom'] || '';
  const email = data['adulte-1-email'] || '';
  const retraiteLabel = data['retraite-label'] || data.retraite || '';
  const fullName = [prenom, nom].filter(Boolean).join(' ') || 'Inscrit(e)';

  // 1. Email notification au Foyer (formatee, imprimable)
  await sendEmail(apiKey, {
    to: [{ email: NOTIFY_EMAIL, name: SENDER_NAME }],
    replyTo: email ? { email, name: fullName } : undefined,
    subject: `Inscription — ${fullName} — ${retraiteLabel}`,
    htmlContent: buildInscriptionNotification(data),
  });

  // 2. Email confirmation a l'inscrit(e)
  if (email) {
    await sendEmail(apiKey, {
      to: [{ email, name: fullName }],
      subject: 'Votre demande d\'inscription — Foyer de Charité Dents-du-Midi',
      htmlContent: buildInscriptionConfirmation(data),
    });
  }

  // 3. Brevo CRM
  if (email) {
    await upsertBrevoContact(apiKey, email, {
      PRENOM: prenom,
      NOM: nom,
      SMS: data['adulte-1-telephone'] || '',
    });
  }
}

// ---------------------------------------------------------------------------
// Brevo helpers
// ---------------------------------------------------------------------------

async function sendEmail(apiKey, { to, replyTo, subject, htmlContent }) {
  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to,
        replyTo,
        subject,
        htmlContent,
      }),
    });
    const text = await res.text();
    console.log(`[submission-created] Brevo email ${res.status}: ${text}`);
  } catch (err) {
    console.error('[submission-created] Erreur email:', err.message);
  }
}

async function upsertBrevoContact(apiKey, email, attributes) {
  try {
    const res = await fetch(BREVO_CONTACTS_URL, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email,
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

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

const rowStyle = 'padding:8px 12px;border-bottom:1px solid #eee';
const labelStyle = `${rowStyle};font-weight:600;color:#112F41;width:160px;vertical-align:top`;
const valueStyle = `${rowStyle};color:#333`;

function row(label, value) {
  if (!value) return '';
  return `<tr><td style="${labelStyle}">${label}</td><td style="${valueStyle}">${esc(value)}</td></tr>`;
}

function sectionHeader(title) {
  return `<tr><td colspan="2" style="padding:14px 12px 6px;font-weight:700;color:#112F41;font-size:15px;border-bottom:2px solid #F09A0A">${title}</td></tr>`;
}

// ---------------------------------------------------------------------------
// Template — Notification inscription (Foyer, imprimable)
// ---------------------------------------------------------------------------

function buildInscriptionNotification(d) {
  const retraiteLabel = d['retraite-label'] || d.retraite || '';
  const type = d['type-participant'] || '';
  const now = new Date().toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  let rows = '';

  // Retraite
  rows += sectionHeader('Retraite');
  rows += row('Retraite', retraiteLabel);
  rows += row('Type', type);
  if (type === 'Famille') {
    rows += row('Adultes', d['nombre-adultes']);
    rows += row('Enfants', d['nombre-enfants']);
  }

  // Participant 1
  rows += sectionHeader(type === 'Individuel' ? 'Participant' : 'Participant 1');
  rows += row('Prénom', d['adulte-1-prenom']);
  rows += row('Nom', d['adulte-1-nom']);
  rows += row('Date de naissance', formatDateFr(d['adulte-1-datenaissance']));
  rows += row('Profession', d['adulte-1-profession']);
  rows += row('Email', d['adulte-1-email']);
  rows += row('Téléphone', d['adulte-1-telephone']);
  rows += row('Adresse', d['adulte-1-adresse']);
  rows += row('NPA / Ville', d['adulte-1-npa-ville']);

  // Participant 2
  if (d['adulte-2-prenom']) {
    rows += sectionHeader('Participant 2');
    rows += row('Prénom', d['adulte-2-prenom']);
    rows += row('Nom', d['adulte-2-nom']);
    rows += row('Date de naissance', formatDateFr(d['adulte-2-datenaissance']));
    rows += row('Profession', d['adulte-2-profession']);
    rows += row('Email', d['adulte-2-email']);
    rows += row('Téléphone', d['adulte-2-telephone']);
  }

  // Enfants
  if (d['enfants-details']) {
    rows += sectionHeader('Enfants');
    rows += row('Enfants', d['enfants-details']);
  }

  // Infos complementaires
  rows += sectionHeader('Informations complémentaires');
  rows += row('Déjà venu(e)', d['deja-venu']);
  rows += row('Comment connu', d['comment-connu']);
  rows += row('Autorisation photos', d['autorisation-photos']);
  if (d.message) {
    rows += `<tr><td colspan="2" style="padding:12px;color:#333">
      <strong style="color:#112F41">Message :</strong><br>
      <div style="margin-top:8px;padding:12px 16px;background:#f8f9fa;border-left:4px solid #F09A0A;border-radius:0 8px 8px 0;white-space:pre-wrap;line-height:1.6">${esc(d.message)}</div>
    </td></tr>`;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:#112F41;padding:24px 32px">
      <h1 style="margin:0;color:#F09A0A;font-size:20px;font-weight:700">Nouvelle inscription</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px">${esc(retraiteLabel)}</p>
    </div>
    <div style="padding:16px 24px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>
    <div style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:12px">Soumis le ${esc(now)} via foyer-dents-du-midi.ch</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Template — Confirmation inscription (inscrit)
// ---------------------------------------------------------------------------

function buildInscriptionConfirmation(d) {
  const prenom = d['adulte-1-prenom'] || '';
  const retraiteLabel = d['retraite-label'] || d.retraite || '';
  const type = d['type-participant'] || '';

  let recapRows = '';
  recapRows += row('Retraite', retraiteLabel);
  recapRows += row('Type', type);
  recapRows += row('Participant', [d['adulte-1-prenom'], d['adulte-1-nom']].filter(Boolean).join(' '));
  if (d['adulte-2-prenom']) {
    recapRows += row('Participant 2', [d['adulte-2-prenom'], d['adulte-2-nom']].filter(Boolean).join(' '));
  }
  if (d['enfants-details']) {
    recapRows += row('Enfants', d['enfants-details']);
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:#112F41;padding:24px 32px">
      <h1 style="margin:0;color:#F09A0A;font-size:20px;font-weight:700">Votre demande d'inscription</h1>
    </div>
    <div style="padding:24px 32px;line-height:1.7;color:#333">
      <p style="margin:0 0 16px">Bonjour${prenom ? ' ' + esc(prenom) : ''},</p>
      <p style="margin:0 0 16px">Votre demande d'inscription a bien été reçue. Merci pour votre confiance.</p>
      <p style="margin:0 0 20px">Un membre de notre équipe vous contactera sous <strong>48 à 72 heures</strong> pour confirmer votre inscription et répondre à vos éventuelles questions.</p>

      <div style="background:#f8f9fa;border-radius:8px;padding:4px 0;margin-bottom:20px">
        <table style="width:100%;border-collapse:collapse">${recapRows}</table>
      </div>

      <p style="margin:0 0 16px;font-size:13px;color:#666">
        <strong>Important :</strong> cette demande n'est pas encore une confirmation définitive.
        Votre inscription sera validée après contact par un membre du Foyer.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">

      <p style="margin:0 0 4px">Pour toute question :</p>
      <p style="margin:0 0 16px"><a href="mailto:info@foyer-dents-du-midi.ch" style="color:#112F41">info@foyer-dents-du-midi.ch</a></p>

      <p style="margin:0;color:#112F41">Au plaisir de vous accueillir,<br><em>Le Foyer de Charité Dents-du-Midi</em></p>
    </div>
    <div style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee;text-align:center">
      <p style="margin:0;color:#999;font-size:12px">Foyer de Charité Dents-du-Midi — Route de Gryon 22, 1880 Bex</p>
      <p style="margin:4px 0 0;color:#bbb;font-size:11px"><a href="https://foyer-dents-du-midi.ch" style="color:#bbb">foyer-dents-du-midi.ch</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Template — Contact (existant)
// ---------------------------------------------------------------------------

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
      <div style="margin-top:20px;padding:16px 20px;background:#f8f9fa;border-left:4px solid #F09A0A;border-radius:0 8px 8px 0;white-space:pre-wrap;line-height:1.6;color:#333">${esc(d.message || '(pas de message)')}</div>
    </div>
    <div style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:12px">Soumis via le formulaire de contact — foyer-dents-du-midi.ch</p>
    </div>
  </div>
</body>
</html>`;
}
