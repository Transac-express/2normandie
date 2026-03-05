// --- NAVIGATION SPA ---
function navigate(targetId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
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

// --- SIMULATEUR ---
const DURATIONS = [
    { years: 6, rate: 0.12 },
    { years: 9, rate: 0.18 },
    { years: 12, rate: 0.21 }
];
let currentDurationIndex = 1;

function formatEur(num) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' €';
}

function updateSliderBackground(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #2B2D42 0%, #2B2D42 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`;
}

function updateSim() {
    const elPrix = document.getElementById('sim-prix');
    const elNotaire = document.getElementById('sim-notaire');
    const elTravaux = document.getElementById('sim-travaux');
    const elSurface = document.getElementById('sim-surface');

    const prix = parseFloat(elPrix.value) || 0;
    const notaire = parseFloat(elNotaire.value) || 0;
    const travaux = parseFloat(elTravaux.value) || 0;
    const surface = parseFloat(elSurface.value) || 0;

    updateSliderBackground(elPrix);
    updateSliderBackground(elNotaire);
    updateSliderBackground(elTravaux);
    updateSliderBackground(elSurface);

    document.getElementById('val-prix').innerText = formatEur(prix);
    document.getElementById('val-notaire').innerText = formatEur(notaire);
    document.getElementById('val-travaux').innerText = formatEur(travaux);
    document.getElementById('val-surface').innerText = surface + ' m²';

    const total = prix + notaire + travaux;
    const ratio = total > 0 ? (travaux / total) * 100 : 0;
    const isEligible = ratio >= 25;
    
    const assiette = Math.min(total, 300000);
    const durationObj = DURATIONS[currentDurationIndex];
    const reduction = assiette * durationObj.rate;
    const reductionAn = reduction / durationObj.years;

    const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
    const loyer = (9.83 * surface * coeff).toFixed(0);

    document.getElementById('res-prix').innerText = formatEur(prix);
    document.getElementById('res-notaire').innerText = formatEur(notaire);
    document.getElementById('res-travaux').innerText = formatEur(travaux);
    document.getElementById('res-total').innerText = formatEur(total);
    document.getElementById('res-assiette').innerText = formatEur(assiette);
    
    const ratioEl = document.getElementById('res-ratio');
    ratioEl.innerText = ratio.toFixed(1) + '%';
    ratioEl.className = isEligible ? 'bold text-navy' : 'bold text-red';

    document.getElementById('res-loyer').innerText = loyer + ' €/mois';
    document.getElementById('res-loyer-detail').innerText = `Base : 9.83 €/m² × ${surface} m² × coeff. ${coeff.toFixed(2)}`;

    document.getElementById('res-reduction').innerText = formatEur(reduction);
    document.getElementById('res-sub').innerText = `sur ${durationObj.years} ans • soit ${formatEur(reductionAn)}/an`;

    const alertRatio = document.getElementById('alert-ratio');
    const alertSmall = document.getElementById('res-eligibility');
    document.getElementById('val-ratio-alert').innerText = ratio.toFixed(1) + '%';
    
    if(isEligible) {
        alertRatio.style.display = 'none';
        alertSmall.style.display = 'none';
    } else {
        alertRatio.style.display = 'block';
        alertSmall.style.display = 'block';
    }
}

function setDuree(index) {
    currentDurationIndex = index;
    const cards = document.querySelectorAll('.duree-card');
    cards.forEach((card, i) => {
        if(i === index) {
            card.classList.add('active');
            card.querySelector('.duree-pct').classList.add('text-red');
        } else {
            card.classList.remove('active');
            card.querySelector('.duree-pct').classList.remove('text-red');
        }
    });
    updateSim();
}

function renderCatalogue() {
    const grid = document.getElementById('catalogue-grid');
    if (grid.innerHTML !== "") return; 

    const properties = [
        {
            title: "Maison avec chai — Saint-Estèphe", price: 165000, 
            address: "Route des Châteaux, Saint-Estèphe", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            surface: 110, pieces: 4, travaux: 65000, status: "Réservé", statusClass: "badge-yellow"
        },
        {
            title: "Appartement T2 rénové — Cœur de ville", price: 95000, 
            address: "Place du Général de Gaulle, Pauillac", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            surface: 45, pieces: 2, travaux: 0, status: "Disponible", statusClass: "badge-green", nodeno: true
        },
        {
            title: "Ensemble immobilier — Projet d'exception", price: 350000, 
            address: "Rue de la Verrerie, Pauillac", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            surface: 300, pieces: 15, travaux: 150000, status: "Disponible", statusClass: "badge-green"
        }
    ];

    grid.innerHTML = properties.map(p => `
        <div class="property-card">
            <div class="property-img-wrap">
                <img src="${p.img}" alt="${p.title}">
                <div class="badges-top">
                    ${!p.nodeno ? `<span class="badge-red">Éligible Denormandie</span>` : '<span></span>'}
                    <span class="${p.statusClass}">● ${p.status}</span>
                </div>
            </div>
            <div class="property-body">
                <div class="property-header">
                    <h3>${p.title}</h3>
                    <span class="property-price">${formatEur(p.price)}</span>
                </div>
                <p class="property-address">📍 ${p.address}</p>
                <div class="property-meta">
                    <span>📏 ${p.surface} m²</span>
                    <span>🚪 ${p.pieces} pièces</span>
                    <span>🔨 Trv : ${p.travaux > 0 ? formatEur(p.travaux) : 'Aucun'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

window.onload = () => {
    updateSim();
};
