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
    // 1. Récupération des inputs manuels
    const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
    const notaire = parseFloat(document.getElementById('sim-notaire').value) || 0;
    const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
    const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
    
    const apport = parseFloat(document.getElementById('sim-apport').value) || 0;
    const revenus = parseFloat(document.getElementById('sim-revenus').value) || 0;
    const tauxPret = parseFloat(document.getElementById('sim-taux').value) || 0;
    const nbMois = parseFloat(document.getElementById('sim-duree-mois').value) || 0;
    const assurance = parseFloat(document.getElementById('sim-assurance').value) || 0;

    // 2. Calculs Fiscaux (La Jess)
    const totalProjet = prix + notaire + travaux;
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
    
    const mensualiteTotale = mensualitePret + assurance;
    const totalInterets = (mensualitePret * nbMois) - capitalEmprunte;
    const coutGlobal = apport + capitalEmprunte + totalInterets + (assurance * nbMois);
    const tauxEndettement = revenus > 0 ? (mensualiteTotale / revenus) * 100 : 0;

    // --- INJECTION DANS L'INTERFACE --- //

    // Bloc "La Jess" (Réduction Impôt - Top Right)
    document.getElementById('res-reduction').innerText = formatEur(reduction);
    document.getElementById('res-sub').innerText = `sur ${durationObj.years} ans • soit ${formatEur(reductionAn)}/an`;
    document.getElementById('res-prix').innerText = formatEur(prix);
    document.getElementById('res-notaire').innerText = formatEur(notaire);
    document.getElementById('res-travaux').innerText = formatEur(travaux);
    document.getElementById('res-total').innerText = formatEur(totalProjet);
    document.getElementById('res-assiette').innerText = formatEur(assiette);
    document.getElementById('res-loyer').innerText = loyer + ' €/mois';
    document.getElementById('res-loyer-detail').innerText = `Base : 9.83 €/m² × ${surface} m² × coeff. ${coeff.toFixed(2)}`;
    
    const alertRatio = document.getElementById('alert-ratio');
    const resRatio = document.getElementById('res-ratio');
    resRatio.innerText = ratioTravaux.toFixed(1) + '%';
    resRatio.className = isEligible ? 'bold text-navy' : 'bold text-red';
    alertRatio.style.display = isEligible ? 'none' : 'block';
    if(!isEligible) document.getElementById('val-ratio-alert').innerText = ratioTravaux.toFixed(1) + '%';

    // Bloc Crédit Mensuel
    document.getElementById('res-mensualite').innerText = formatEur(mensualiteTotale);
    document.getElementById('res-mensualite-detail').innerText = `${Math.round(mensualitePret)}€ (prêt) + ${Math.round(assurance)}€ (assurance)`;

    // Bloc Poids Budget
    document.getElementById('res-endettement-txt').innerText = tauxEndettement.toFixed(1) + '%';
    const barFill = document.getElementById('res-endettement-bar');
    const budgetContainer = document.getElementById('budget-container');
    const budgetStatus = document.getElementById('res-endettement-status');
    const headerColor = document.querySelector('.budget-header');
    
    barFill.style.width = Math.min(tauxEndettement, 100) + '%';
    if(tauxEndettement <= 35) {
        budgetContainer.style.background = '#F0FDF4'; budgetContainer.style.borderColor = '#BBF7D0';
        barFill.style.background = '#10B981'; headerColor.style.color = '#166534';
        budgetStatus.innerText = "✅ C'est très raisonnable."; budgetStatus.style.color = '#166534';
    } else {
        budgetContainer.style.background = '#FEF2F2'; budgetContainer.style.borderColor = '#FECACA';
        barFill.style.background = '#E30613'; headerColor.style.color = '#991B1B';
        budgetStatus.innerText = "⚠️ Endettement élevé (> 35%)."; budgetStatus.style.color = '#991B1B';
    }

    // Graphique Camembert
    if(coutGlobal > 0) {
        const pApport = (apport / coutGlobal) * 100;
        const pCapital = (capitalEmprunte / coutGlobal) * 100;
        const pInterets = Math.max(0, (totalInterets / coutGlobal) * 100);
        document.getElementById('pie-chart').style.background = `conic-gradient(
            #10B981 0% ${pApport}%,
            #3B82F6 ${pApport}% ${pApport + pCapital}%,
            #EF4444 ${pApport + pCapital}% ${pApport + pCapital + pInterets}%,
            #F59E0B ${pApport + pCapital + pInterets}% 100%
        )`;
    }

    // Tableau d'amortissement
    let htmlTable = '';
    let resteDu = capitalEmprunte;
    const anneesPret = Math.ceil(nbMois / 12);
    const maxYearsToShow = Math.min(anneesPret, 4);

    for(let i=1; i<=maxYearsToShow; i++) {
        let interetsAnnee = 0; let capitalAnnee = 0;
        for(let m=0; m<12; m++) {
            if(resteDu <= 0) break;
            let intMois = resteDu * tauxMensuel;
            let capMois = mensualitePret - intMois;
            interetsAnnee += intMois; capitalAnnee += capMois; resteDu -= capMois;
        }
        htmlTable += `<tr><td>Année ${i}</td><td>${formatEur(interetsAnnee)}</td><td>${formatEur(capitalAnnee)}</td><td class="bold text-navy">${formatEur(Math.max(0, resteDu))}</td></tr>`;
    }
    if(anneesPret > 4) {
        htmlTable += `<tr><td colspan="4" class="text-center text-gray" style="padding:15px">... jusqu'à l'année ${anneesPret}</td></tr>`;
    }
    document.getElementById('amortissement-body').innerHTML = htmlTable;
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
        { title: "Maison avec chai — Saint-Estèphe", price: 165000, address: "Route des Châteaux", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", surface: 110, pieces: 4, travaux: 65000, status: "Réservé", statusClass: "badge-yellow" },
        { title: "Appartement T2 rénové", price: 95000, address: "Cœur de ville", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", surface: 45, pieces: 2, travaux: 0, status: "Disponible", statusClass: "badge-green", nodeno: true },
        { title: "Ensemble immobilier", price: 350000, address: "Rue de la Verrerie", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", surface: 300, pieces: 15, travaux: 150000, status: "Disponible", statusClass: "badge-green" }
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
