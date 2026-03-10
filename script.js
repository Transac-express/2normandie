// --- NAVIGATION SPA ---
function navigate(targetId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + targetId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        }
    });
    window.scrollTo(0, 0);
    if(targetId === 'catalogue') renderCatalogue();
}

const DURATIONS = [
    { years: 6, rate: 0.12 },
    { years: 9, rate: 0.18 },
    { years: 12, rate: 0.21 }
];
let currentDurationIndex = 1;

function formatEur(num) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' €';
}

// Fonction de sécurité pour injecter le texte sans planter
function setSafeText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function updateSim() {
    try {
        // 1. Récupération des inputs
        const prix = parseFloat(document.getElementById('sim-prix')?.value) || 0;
        const notairePct = parseFloat(document.getElementById('sim-notaire-pct')?.value) || 8;
        const travaux = parseFloat(document.getElementById('sim-travaux')?.value) || 0;
        const surface = parseFloat(document.getElementById('sim-surface')?.value) || 0;
        
        // Calcul dynamique des frais de notaire
        const notaireMontant = prix * (notairePct / 100);
        setSafeText('val-notaire-montant', `= ${formatEur(notaireMontant)}`);

        // 2. Calculs Fiscaux (Assiette = Prix + Notaire + Travaux)
        const totalProjet = prix + notaireMontant + travaux;
        const ratioTravaux = totalProjet > 0 ? (travaux / totalProjet) * 100 : 0;
        const isEligible = ratioTravaux >= 25;
        
        const assiette = Math.min(totalProjet, 300000);
        const durationObj = DURATIONS[currentDurationIndex];
        const reduction = assiette * durationObj.rate;
        const reductionAn = reduction / durationObj.years;

        const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
        const loyer = (9.83 * surface * coeff).toFixed(0);

        // --- INJECTION DANS L'INTERFACE --- //

        // Bloc "Résumé de votre projet"
        setSafeText('res-resume-prix', formatEur(prix));
        setSafeText('res-resume-notaire', formatEur(notaireMontant));
        setSafeText('res-resume-travaux', formatEur(travaux));
        setSafeText('res-resume-reduction', formatEur(reduction));

        // La Jess (Détail Impôt)
        setSafeText('res-reduction', formatEur(reduction));
        setSafeText('res-sub', `sur ${durationObj.years} ans • soit ${formatEur(reductionAn)}/an`);
        setSafeText('res-assiette', formatEur(assiette));
        setSafeText('res-loyer', loyer + ' €/mois');
        setSafeText('res-loyer-detail', `Base : 9.83 €/m² × ${surface} m² × coeff. B2 (${coeff.toFixed(2)})`);
        
        // Alertes Éligibilité
        const alertRatio = document.getElementById('alert-ratio');
        const resRatio = document.getElementById('res-ratio');
        
        if (resRatio) {
            resRatio.innerText = ratioTravaux.toFixed(1) + '%';
            resRatio.className = isEligible ? 'bold text-primary' : 'bold text-red';
        }
        if (alertRatio) {
            alertRatio.style.display = isEligible ? 'none' : 'block';
        }
        setSafeText('val-ratio-alert', ratioTravaux.toFixed(1) + '%');

    } catch(e) {
        console.error("Erreur de calcul :", e);
    }
}

function setDuree(index) {
    currentDurationIndex = index;
    const cards = document.querySelectorAll('.duree-card');
    cards.forEach((card, i) => {
        if(i === index) { card.classList.add('active'); card.querySelector('.duree-pct').classList.add('text-red'); }
        else { card.classList.remove('active'); card.querySelector('.duree-pct').classList.remove('text-red'); }
    });
    updateSim();
}

function renderCatalogue() {
    const grid = document.getElementById('catalogue-grid');
    if (!grid || grid.innerHTML !== "") return; 

    const properties = [
        { title: "Maison avec chai — Saint-Estèphe", price: 165000, address: "Route des Châteaux, Saint-Estèphe", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", surface: 110, pieces: 4, travaux: 65000, status: "Réservé", statusClass: "badge-yellow" },
        { title: "Appartement T2 rénové — Cœur de ville", price: 95000, address: "Place du Général de Gaulle, Pauillac", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", surface: 45, pieces: 2, travaux: 0, status: "Disponible", statusClass: "badge-green", nodeno: true },
        { title: "Ensemble immobilier — Projet d'exception", price: 350000, address: "Rue de la Verrerie, Pauillac", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", surface: 300, pieces: 15, travaux: 150000, status: "Disponible", statusClass: "badge-green" }
    ];

    grid.innerHTML = properties.map(p => `
        <div class="property-card">
            <div class="property-img-wrap"><img src="${p.img}"><div class="badges-top">${!p.nodeno ? `<span class="badge-red">Éligible Denormandie</span>` : '<span></span>'}<span class="${p.statusClass}">● ${p.status}</span></div></div>
            <div class="property-body"><div class="property-header"><h3>${p.title}</h3><span class="property-price">${formatEur(p.price)}</span></div><p class="property-address">📍 ${p.address}</p><div class="property-meta"><span>📏 ${p.surface} m²</span><span>🚪 ${p.pieces} pièces</span><span>🔨 Trv: ${p.travaux > 0 ? formatEur(p.travaux) : 'Aucun'}</span></div></div>
        </div>
    `).join('');
}

// ==========================================
// LOGIQUE POP-IN (LEAD CAPTURE)
// ==========================================
function openModal() {
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.add('active');
}

function closeModal(event) {
    // Si l'event existe (clic), on ferme
    if (event) event.preventDefault();
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.remove('active');
}

function submitForm(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    
    // Récupération des données
    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    const phone = document.getElementById('lead-phone').value;
    
    // Simulation de l'envoi (Console)
    console.log("=== NOUVEAU LEAD CAPTURÉ ===");
    console.log("Nom :", name);
    console.log("Email :", email);
    console.log("Téléphone :", phone);
    
    // Message de succès pour l'utilisateur
    alert(`Merci ${name} ! Votre étude complète a été envoyée à l'adresse : ${email}`);
    
    // Fermeture et réinitialisation
    closeModal();
    event.target.reset();
}

window.onload = () => {
    updateSim();
};
