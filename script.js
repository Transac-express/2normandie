// Navigation SPA
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Logique du Simulateur Denormandie
function updateSim() {
    const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
    const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
    const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
    
    const fraisNotaire = prix * 0.08;
    const totalOperation = prix + fraisNotaire + travaux;
    
    // Règle des 25% de travaux
    const ratioTravaux = totalOperation > 0 ? (travaux / totalOperation) * 100 : 0;
    const isEligible = ratioTravaux >= 25;
    
    // Plafond d'assiette 300 000€
    const assiette = Math.min(totalOperation, 300000);
    
    // Calcul Loyer Zone B2 (9.83€/m²) avec coeff multiplicateur
    const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19 / surface)) : 0;
    const loyerMax = (9.83 * surface * coeff).toFixed(2);

    const resultsDiv = document.getElementById('sim-results');
    resultsDiv.innerHTML = `
        <div class="alert ${isEligible ? 'alert-success' : 'alert-error'}">
            ${isEligible ? '✅ PROJET ÉLIGIBLE' : '❌ TRAVAUX INSUFFISANTS (< 25%)'}
        </div>
        <div style="margin-bottom:10px">Ratio travaux : <strong>${ratioTravaux.toFixed(1)}%</strong></div>
        <div style="margin-bottom:10px">Investissement total : <strong>${totalOperation.toLocaleString()} €</strong></div>
        <hr style="margin: 15px 0; border: 0; border-top: 1px solid #EEE">
        <div style="font-size: 1.2rem; color: var(--primary); font-weight: 800">Réduction d'impôt (12 ans) : ${(assiette * 0.21).toLocaleString()} €</div>
        <div style="margin-top:10px; font-weight:600">Loyer plafond Zone B2 : ${loyerMax} €/mois</div>
    `;
}

// Initialisation
window.onload = () => {
    updateSim();
    // Génération automatique du catalogue
    const grid = document.getElementById('catalogue-grid');
    const maisons = [
        {t: "Maison de Maître - Centre Pauillac", p: "245 000€", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"},
        {t: "Appartement T3 - Vue Estuaire", p: "135 000€", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"},
        {t: "Immeuble de rapport - 4 lots", p: "320 000€", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600"}
    ];
    grid.innerHTML = maisons.map(m => `
        <div class="card">
            <img src="${m.img}" alt="${m.t}">
            <div class="card-body">
                <h3>${m.t}</h3>
                <p style="color:var(--primary); font-weight:900; font-size:1.2rem; margin: 10px 0">${m.p}</p>
                <button class="btn-nav" style="width:100%; border:none; cursor:pointer" onclick="navigateTo('simulateur')">Calculer la rentabilité</button>
            </div>
        </div>
    `).join('');
};  });
  if (push) {
    history.pushState({ page: pageId }, '', '#' + pageId);
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  closeMobileMenu();
}

function initNav() {
  // All nav links
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  // Browser back/forward
  window.addEventListener('popstate', e => {
    const page = e.state?.page || 'home';
    navigateTo(page, false);
  });

  // Initial route from hash
  const hash = window.location.hash.replace('#', '') || 'home';
  const initial = PAGES.includes(hash) ? hash : 'home';
  navigateTo(initial, false);
}

// =========================================
// SCROLL — Header transparent on hero
// =========================================
function initScrollHeader() {
  const header = document.getElementById('header');
  const handler = () => {
    const pageHome = document.getElementById('page-home');
    if (pageHome && pageHome.classList.contains('active')) {
      header.classList.toggle('transparent', window.scrollY < 60);
    } else {
      header.classList.remove('transparent');
    }
  };
  window.addEventListener('scroll', handler, { passive: true });
  // Reset on page changes
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => setTimeout(handler, 50));
  });
  handler();
}

// =========================================
// HAMBURGER MENU
// =========================================
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}
function closeMobileMenu() {
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('nav-mobile')?.classList.remove('open');
}

// =========================================
// CATALOGUE — Affichage des biens
// =========================================
function renderCatalogue() {
  if (!APP_DATA) return;
  const grid = document.getElementById('catalogue-grid');
  if (!grid) return;

  const statusLabel = { available: 'Disponible', reserved: 'Réservé', sold: 'Vendu' };
  const typeLabel = { house: 'Maison', apartment: 'Appartement', building: 'Immeuble' };

  grid.innerHTML = APP_DATA.biens.map(b => `
    <article class="property-card">
      <div class="property-img">
        <img src="${b.image}" alt="${b.titre}" loading="lazy">
        <div class="property-badges">
          ${b.eligible_denormandie ? `<span class="badge-denormandie">Éligible Denormandie</span>` : ''}
          <span class="badge-status ${b.statut}">${statusLabel[b.statut] || b.statut}</span>
        </div>
      </div>
      <div class="property-body">
        <div class="property-top">
          <h3 class="property-title">${b.titre}</h3>
          <p class="property-price">${formatEur(b.prix)}</p>
        </div>
        <p class="property-address">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          ${b.adresse}
        </p>
        <div class="property-meta">
          <div class="property-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <strong>${b.surface} m²</strong>
          </div>
          <div class="property-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <strong>${b.pieces} pièces</strong>
          </div>
          ${b.travaux > 0 ? `
          <div class="property-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
            Travaux : <strong>${formatEur(b.travaux)}</strong>
          </div>` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

// =========================================
// SIMULATEUR DENORMANDIE
// =========================================
const SIM = {
  prixAchat: 150000,
  fraisNotairePct: 8,
  travaux: 50000,
  surface: 60,
  duration: 1, // index (0=6ans, 1=9ans, 2=12ans)
};

const DURATIONS = [
  { years: 6,  rate: 0.12 },
  { years: 9,  rate: 0.18 },
  { years: 12, rate: 0.21 },
];
const PLAFOND = 300000;
const LOYER_B2 = 9.83;

function initSimulateur() {
  // Sliders
  const sliders = [
    { id: 'sim-prix',     key: 'prixAchat',      valId: 'sim-prix-val',     fmt: 'eur' },
    { id: 'sim-notaire',  key: 'fraisNotairePct', valId: 'sim-notaire-val',  fmt: 'pct' },
    { id: 'sim-travaux',  key: 'travaux',         valId: 'sim-travaux-val',  fmt: 'eur' },
    { id: 'sim-surface',  key: 'surface',         valId: 'sim-surface-val',  fmt: 'm2'  },
  ];

  sliders.forEach(({ id, key, valId, fmt }) => {
    const el = document.getElementById(id);
    const valEl = document.getElementById(valId);
    if (!el || !valEl) return;

    // Init display
    el.value = SIM[key];
    updateRangeTrack(el);
    valEl.textContent = formatVal(SIM[key], fmt);

    el.addEventListener('input', () => {
      SIM[key] = parseFloat(el.value);
      updateRangeTrack(el);
      valEl.textContent = formatVal(SIM[key], fmt);
      computeAndRender();
    });
  });

  // Duration buttons
  document.querySelectorAll('.duration-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      SIM.duration = i;
      document.querySelectorAll('.duration-btn').forEach((b, j) => {
        b.classList.toggle('active', i === j);
      });
      computeAndRender();
    });
  });

  computeAndRender();
}

function updateRangeTrack(input) {
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || 100;
  const val = parseFloat(input.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(to right, #E30613 ${pct}%, #e5e7eb ${pct}%)`;
}

function computeAndRender() {
  const fraisNotaire = SIM.prixAchat * (SIM.fraisNotairePct / 100);
  const coutTotal = SIM.prixAchat + fraisNotaire + SIM.travaux;
  const ratioTravaux = coutTotal > 0 ? SIM.travaux / coutTotal : 0;
  const isEligible = ratioTravaux >= 0.25;
  const assiette = Math.min(coutTotal, PLAFOND);
  const dur = DURATIONS[SIM.duration];
  const reduction = assiette * dur.rate;
  const reductionAnnuelle = reduction / dur.years;

  // Loyer max Zone B2
  const coeff = Math.min(1.2, 0.7 + (19 / SIM.surface));
  const loyerMax = LOYER_B2 * SIM.surface * coeff;

  // Update results display
  setTxt('res-amount', formatEur(reduction));
  setTxt('res-sub', `Sur ${dur.years} ans · soit ${formatEur(reductionAnnuelle)}/an`);
  setTxt('res-prix', formatEur(SIM.prixAchat));
  setTxt('res-notaire', formatEur(fraisNotaire));
  setTxt('res-travaux', formatEur(SIM.travaux));
  setTxt('res-total', formatEur(coutTotal));
  setTxt('res-assiette', formatEur(assiette));
  setTxt('res-assiette-note', coutTotal > PLAFOND ? `Plafonné à ${formatEur(PLAFOND)}` : '');
  setTxt('res-ratio', `${(ratioTravaux * 100).toFixed(1)}%`);
  setTxt('res-loyer', `${formatEur(loyerMax)}/mois`);
  setTxt('res-loyer-detail', `${LOYER_B2} €/m² × ${SIM.surface} m² × coeff. ${coeff.toFixed(2)}`);

  // Ratio alert classes
  const ratioEl = document.getElementById('res-ratio-row');
  if (ratioEl) ratioEl.classList.toggle('alert', !isEligible);

  // Eligibility alert
  const alertElig = document.getElementById('alert-elig');
  if (alertElig) {
    alertElig.style.display = isEligible ? 'none' : 'flex';
    const ratioTxt = document.getElementById('alert-elig-ratio');
    if (ratioTxt) ratioTxt.textContent = `${(ratioTravaux * 100).toFixed(1)}%`;
  }

  // Eligibility badge
  const badgeOk = document.getElementById('badge-eligible-ok');
  const badgeNok = document.getElementById('badge-eligible-nok');
  if (badgeOk) badgeOk.style.display = isEligible ? 'flex' : 'none';
  if (badgeNok) badgeNok.style.display = isEligible ? 'none' : 'flex';
}

// =========================================
// UTILS
// =========================================
function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function formatVal(v, fmt) {
  if (fmt === 'eur') return formatEur(v);
  if (fmt === 'pct') return `${v} %`;
  if (fmt === 'm2') return `${v} m²`;
  return v;
}
function setTxt(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

// =========================================
// MENTIONS LÉGALES — injection données
// =========================================
function renderMentions() {
  if (!APP_DATA) return;
  const s = APP_DATA.societe;
  const c = APP_DATA.contact;
  ['mentions-raison', 'mentions-raison2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = c.societe;
  });
  const fields = [
    ['mentions-forme', s.forme],
    ['mentions-capital', s.capital],
    ['mentions-rcs', s.rcs],
    ['mentions-siret', s.siret],
    ['mentions-siege', c.adresse],
    ['mentions-activite', s.activite],
    ['mentions-tel', c.telephone],
    ['mentions-email', c.email],
  ];
  fields.forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
}

// =========================================
// INIT
// =========================================
function init() {
  initNav();
  initScrollHeader();
  initHamburger();
  renderCatalogue();
  initSimulateur();
  renderMentions();
}

document.addEventListener('DOMContentLoaded', loadData);

/* FALLBACK si pas de serveur HTTP */
const FALLBACK_DATA = {
  "contact": { "telephone": "05 56 59 00 00", "email": "contact@transac-express.fr", "adresse": "Pauillac, Gironde (33250)", "societe": "MEDOC INVESTISSEMENT" },
  "societe": { "forme": "SARL", "capital": "1 440 000 €", "rcs": "Bordeaux 477 710 222", "siret": "477 710 222 00000", "activite": "Marchand de biens immobiliers" },
  "textes": { "slogan": "L'expertise du marchand de biens au service de votre défiscalisation" },
  "biens": [
    { "id": 1, "titre": "Maison de ville en pierre", "prix": 185000, "surface": 95, "pieces": 5, "chambres": 3, "adresse": "Rue du Maréchal Joffre, Pauillac", "travaux": 75000, "eligible_denormandie": true, "statut": "available", "type": "house", "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
    { "id": 2, "titre": "Appartement T3 — Quais de Pauillac", "prix": 120000, "surface": 62, "pieces": 3, "chambres": 2, "adresse": "Quai Antoine Ferchaud, Pauillac", "travaux": 45000, "eligible_denormandie": true, "statut": "available", "type": "apartment", "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
    { "id": 3, "titre": "Immeuble de rapport — 4 lots", "prix": 280000, "surface": 220, "pieces": 12, "chambres": 6, "adresse": "Rue Edouard de Pontet, Pauillac", "travaux": 120000, "eligible_denormandie": true, "statut": "available", "type": "building", "image": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80" },
    { "id": 4, "titre": "Maison avec chai — Saint-Estèphe", "prix": 165000, "surface": 110, "pieces": 4, "chambres": 3, "adresse": "Route des Châteaux, Saint-Estèphe", "travaux": 65000, "eligible_denormandie": true, "statut": "reserved", "type": "house", "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" },
    { "id": 5, "titre": "Appartement T2 rénové", "prix": 95000, "surface": 45, "pieces": 2, "chambres": 1, "adresse": "Place du Général de Gaulle, Pauillac", "travaux": 0, "eligible_denormandie": false, "statut": "available", "type": "apartment", "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80" },
    { "id": 6, "titre": "Ensemble immobilier — Projet d'exception", "prix": 350000, "surface": 300, "pieces": 15, "chambres": 8, "adresse": "Rue de la Verrerie, Pauillac", "travaux": 150000, "eligible_denormandie": true, "statut": "available", "type": "building", "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" }
  ]
};
