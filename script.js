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

function updateSim() {
    try {
        // 1. Récupération des inputs (Gauche)
        const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
        const notairePct = parseFloat(document.getElementById('sim-notaire-pct').value) || 0;
        const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
        const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
        
        const apport = parseFloat(document.getElementById('sim-apport').value) || 0;
        const revenus = parseFloat(document.getElementById('sim-revenus').value) || 0;
        const tauxPret = parseFloat(document.getElementById('sim-taux').value) || 0;
        const nbMois = parseFloat(document.getElementById('sim-duree-mois').value) || 0;
        const assurancePct = parseFloat(document.getElementById('sim-assurance').value) || 0;

        // Calcul dynamique des frais de notaire
        const notaireMontant = prix * (notairePct / 100);
        document.getElementById('val-notaire-montant').innerText = `= ${formatEur(notaireMontant)}`;

        // 2. Calculs Fiscaux (La Jess)
        const totalProjet = prix + notaireMontant + travaux;
        const ratioTravaux = totalProjet > 0 ? (travaux / totalProjet) * 100 : 0;
        const isEligible = ratioTravaux >= 25;
        
        const assiette = Math.min(totalProjet, 300000);
        const durationObj = DURATIONS[currentDurationIndex];
        const reduction = assiette * durationObj.rate;
        const reductionAn = reduction / durationObj.years;

        const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
        const loyer = (9.83 * surface * coeff).toFixed(0);

        // 3. Calculs Bancaires
        const capitalEmprunte = Math.max(0, totalProjet - apport);
        const tauxMensuel = (tauxPret / 100) / 12;
        
        let mensualitePret = 0;
        if (tauxMensuel > 0 && nbMois > 0) {
            mensualitePret = capitalEmprunte * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois)) / (Math.pow(1 + tauxMensuel, nbMois) - 1);
        } else if (nbMois > 0) {
            mensualitePret = capitalEmprunte / nbMois; 
        }
        
        const assuranceMensuelle = (capitalEmprunte * (assurancePct / 100)) / 12;
        const mensualiteTotale = mensualitePret + assuranceMensuelle;
        const tauxEndettement = revenus > 0 ? (mensualiteTotale / revenus) * 100 : 0;

        // --- INJECTION DANS L'INTERFACE (Droite) ---

        // Bloc "Résumé de votre projet"
        document.getElementById('res-resume-prix').innerText = formatEur(prix);
        document.getElementById('res-resume-notaire').innerText = formatEur(notaireMontant);
        document.getElementById('res-resume-travaux').innerText = formatEur(travaux);
        document.getElementById('res-resume-total').innerText = formatEur(totalProjet);

        // La Jess (Réduction Impôt)
        document.getElementById('res-reduction').innerText = formatEur(reduction);
        document.getElementById('res-sub').innerText = `sur ${durationObj.years} ans • soit ${formatEur(reductionAn)}/an`;
        document.getElementById('res-assiette').innerText = formatEur(assiette);
        document.getElementById('res-loyer').innerText = loyer + ' €/mois';
        document.getElementById('res-loyer-detail').innerText = `Base : 9.83 €/m² × ${surface} m² × coeff. B2 (${coeff.toFixed(2)})`;
        
        // Alertes Éligibilité
        const alertRatio = document.getElementById('alert-ratio');
        const resRatio = document.getElementById('res-ratio');
        resRatio.innerText = ratioTravaux.toFixed(1) + '%';
        resRatio.className = isEligible ? 'bold text-primary' : 'bold text-red';
        alertRatio.style.display = isEligible ? 'none' : 'block';
        if(!isEligible) document.getElementById('val-ratio-alert').innerText = ratioTravaux.toFixed(1) + '%';

        // Crédit Mensuel
        document.getElementById('res-mensualite').innerText = formatEur(mensualitePret);
        document.getElementById('res-mensualite-detail').innerText = `+ ${Math.round(assuranceMensuelle)}€ d'assurance emprunteur`;

        // Poids Budget
        document.getElementById('res-endettement-txt').innerText = tauxEndettement.toFixed(1) + '%';
        const barFill = document.getElementById('res-endettement-bar');
        const budgetContainer = document.getElementById('budget-container');
        const budgetStatus = document.getElementById('res-endettement-status');
        
        barFill.style.width = Math.min(tauxEndettement, 100) + '%';
        if(tauxEndettement <= 35) {
            budgetContainer.style.background = '#F0FDF4'; 
            budgetContainer.style.borderColor = '#BBF7D0'; 
            budgetContainer.style.color = '#166534';
            barFill.style.background = '#10B981';
            budgetStatus.innerText = `✅ Endettement sain (<35%)`;
        } else {
            budgetContainer.style.background = '#FEF2F2'; 
            budgetContainer.style.borderColor = '#FECACA'; 
            budgetContainer.style.color = '#991B1B';
            barFill.style.background = '#E30613';
            budgetStatus.innerText = `⚠️ Endettement élevé (>35%)`;
        }
    } catch(e) {
        console.error("Erreur d'exécution du JS :", e);
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
    if (grid.innerHTML !== "") return; 

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

window.onload = () => {
    updateSim();
};
