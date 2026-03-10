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

function setSafeText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function updateSim() {
    try {
        const prix = parseFloat(document.getElementById('sim-prix')?.value) || 0;
        const notairePct = parseFloat(document.getElementById('sim-notaire-pct')?.value) || 8;
        const travaux = parseFloat(document.getElementById('sim-travaux')?.value) || 0;
        const surface = parseFloat(document.getElementById('sim-surface')?.value) || 0;
        
        const apport = parseFloat(document.getElementById('sim-apport')?.value) || 0;
        const revenus = parseFloat(document.getElementById('sim-revenus')?.value) || 0;
        const tauxPret = parseFloat(document.getElementById('sim-taux')?.value) || 0;
        const nbMois = parseFloat(document.getElementById('sim-duree-mois')?.value) || 0;
        const assurancePct = parseFloat(document.getElementById('sim-assurance')?.value) || 0;

        const notaireMontant = prix * (notairePct / 100);
        setSafeText('val-notaire-montant', `= ${formatEur(notaireMontant)}`);

        const totalProjet = prix + notaireMontant + travaux;
        const ratioTravaux = totalProjet > 0 ? (travaux / totalProjet) * 100 : 0;
        const isEligible = ratioTravaux >= 25;
        
        const assiette = Math.min(totalProjet, 300000);
        const durationObj = DURATIONS[currentDurationIndex];
        const reduction = assiette * durationObj.rate;
        const reductionAn = reduction / durationObj.years;

        const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
        const loyer = (9.83 * surface * coeff).toFixed(0);

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

        setSafeText('res-resume-prix', formatEur(prix));
        setSafeText('res-resume-notaire', formatEur(notaireMontant));
        setSafeText('res-resume-travaux', formatEur(travaux));
        setSafeText('res-resume-reduction', formatEur(reduction));

        setSafeText('res-reduction', formatEur(reduction));
        setSafeText('res-sub', `sur ${durationObj.years} ans • soit ${formatEur(reductionAn)}/an`);
        setSafeText('res-assiette', formatEur(assiette));
        setSafeText('res-loyer', loyer + ' €/mois');
        setSafeText('res-loyer-detail', `Base : 9.83 €/m² × ${surface} m² × coeff. B2 (${coeff.toFixed(2)})`);
        
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

        setSafeText('res-mensualite', formatEur(mensualitePret));
        setSafeText('res-mensualite-detail', `+ ${Math.round(assuranceMensuelle)}€ d'assurance emprunteur`);

        setSafeText('res-endettement-txt', tauxEndettement.toFixed(1) + '%');
        
        const barFill = document.getElementById('res-endettement-bar');
        const budgetContainer = document.getElementById('budget-container');
        const budgetStatus = document.getElementById('res-endettement-status');
        const headerColor = document.getElementById('budget-header');
        
        if (barFill && budgetContainer && budgetStatus && headerColor) {
            barFill.style.width = Math.min(tauxEndettement, 100) + '%';
            if(tauxEndettement <= 35) {
                budgetContainer.style.background = '#F9F9F7'; 
                budgetContainer.style.borderColor = 'rgba(197, 160, 89, 0.4)'; 
                headerColor.style.color = '#1A2B3C';
                barFill.style.background = '#C5A059';
                budgetStatus.innerText = `✅ Capacité d'emprunt respectée (<35%)`;
                budgetStatus.style.color = '#1A2B3C';
            } else {
                budgetContainer.style.background = '#FAF5F5'; 
                budgetContainer.style.borderColor = '#C5A059'; 
                headerColor.style.color = '#1A2B3C';
                barFill.style.background = '#1A2B3C';
                budgetStatus.innerText = `⚠️ Alerte : Endettement élevé (>35%)`;
                budgetStatus.style.color = '#1A2B3C';
            }
        }
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
    if (modal) {
        modal.classList.add('active');
    } else {
        alert("L'étude est prête ! (Le design de la pop-in charge...)");
    }
}

function closeModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.remove('active');
}

function submitForm(event) {
    event.preventDefault(); 
    
    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    
    alert(`Merci ${name} ! Votre étude complète a bien été générée. Elle sera envoyée à ${email}.`);
    
    closeModal();
    event.target.reset();
}

window.onload = () => {
    updateSim();
};
