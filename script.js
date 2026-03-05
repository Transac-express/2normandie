// --- NAVIGATION GLOBALE ---
function navigate(targetId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + targetId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('data-target') === targetId) link.classList.add('active');
    });
    window.scrollTo(0, 0);
    if(targetId === 'catalogue') renderCatalogue();
    if(targetId === 'simulateur') renderFavorites(); 
}

// --- SOUS-ONGLETS SIMULATEUR ---
function switchSimTab(tabId) {
    document.querySelectorAll('.sim-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sim-view').forEach(view => view.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

const DURATIONS = [{ years: 6, rate: 0.12 }, { years: 9, rate: 0.18 }, { years: 12, rate: 0.21 }];
let currentDurationIndex = 1;

function formatEur(num) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' €';
}

// --- LOGIQUE PRINCIPALE DU SIMULATEUR ---
function updateSim() {
    const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
    const apport = parseFloat(document.getElementById('sim-apport').value) || 0;
    const notaire = parseFloat(document.getElementById('sim-notaire').value) || 0;
    const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
    const tauxPret = parseFloat(document.getElementById('sim-taux').value) || 0;
    const nbMois = parseFloat(document.getElementById('sim-duree-mois').value) || 0;
    const assurance = parseFloat(document.getElementById('sim-assurance').value) || 0;
    const revenus = parseFloat(document.getElementById('sim-revenus').value) || 0;
    const surface = parseFloat(document.getElementById('sim-surface').value) || 0;

    // Calculs de base
    const totalProjet = prix + notaire + travaux;
    const ratioTravaux = totalProjet > 0 ? (travaux / totalProjet) * 100 : 0;
    const isEligible = ratioTravaux >= 25;
    
    const assiette = Math.min(totalProjet, 300000);
    const durationObj = DURATIONS[currentDurationIndex];
    const reduction = assiette * durationObj.rate;

    const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
    const loyer = (9.83 * surface * coeff).toFixed(0);

    // Calculs de crédit
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

    // Endettement
    const tauxEndettement = revenus > 0 ? (mensualiteTotale / revenus) * 100 : 0;

    // INJECTION UI
    document.getElementById('res-mensualite').innerText = formatEur(mensualiteTotale);
    document.getElementById('res-mensualite-detail').innerText = `${Math.round(mensualitePret)}€ (prêt) + ${Math.round(assurance)}€ (assurance)`;
    
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + nbMois);
    document.getElementById('res-date-fin').innerText = dateFin.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    document.getElementById('res-reduction').innerText = formatEur(reduction);
    document.getElementById('res-sub').innerText = `sur ${durationObj.years} ans • soit ${formatEur(reduction/durationObj.years)}/an`;
    document.getElementById('res-total').innerText = formatEur(totalProjet);
    document.getElementById('res-ratio').innerText = ratioTravaux.toFixed(1) + '%';
    document.getElementById('res-loyer').innerText = loyer + ' €/mois';

    // Jauge Endettement
    document.getElementById('res-endettement-txt').innerText = tauxEndettement.toFixed(1) + '%';
    const barFill = document.getElementById('res-endettement-bar');
    const bStatus = document.getElementById('res-endettement-status');
    const bCont = document.getElementById('budget-container');
    const headerColor = document.querySelector('.budget-header');
    
    barFill.style.width = Math.min(tauxEndettement, 100) + '%';
    if(tauxEndettement <= 35) {
        bCont.style.background = '#F0FDF4'; bCont.style.borderColor = '#BBF7D0';
        barFill.style.background = '#10B981'; headerColor.style.color = '#166534';
        bStatus.innerText = "✅ Endettement raisonnable."; bStatus.style.color = '#166534';
    } else {
        bCont.style.background = '#FEF2F2'; bCont.style.borderColor = '#FECACA';
        barFill.style.background = '#EF4444'; headerColor.style.color = '#991B1B';
        bStatus.innerText = "⚠️ Endettement élevé (>35%)."; bStatus.style.color = '#991B1B';
    }

    // Camembert
    if(coutGlobal > 0) {
        const pApp = (apport / coutGlobal) * 100;
        const pCap = (capitalEmprunte / coutGlobal) * 100;
        const pInt = Math.max(0, (totalInterets / coutGlobal) * 100);
        document.getElementById('pie-chart').style.background = `conic-gradient(#10B981 0% ${pApp}%, #3B82F6 ${pApp}% ${pApp + pCap}%, #E30613 ${pApp + pCap}% ${pApp + pCap + pInt}%, #F59E0B ${pApp + pCap + pInt}% 100%)`;
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
        htmlTable += `<tr><td>Année ${i}</td><td>${formatEur(interetsAnnee)}</td><td>${formatEur(capitalAnnee)}</td><td class="bold">${formatEur(Math.max(0, resteDu))}</td></tr>`;
    }
    if(anneesPret > 4) htmlTable += `<tr><td colspan="4" class="text-center text-gray" style="padding:15px">... jusqu'à l'année ${anneesPret}</td></tr>`;
    document.getElementById('amortissement-body').innerHTML = htmlTable;

    updateExpertAdvice(isEligible, apport, notaire, tauxEndettement, ratioTravaux);
}

// --- AVIS DE L'EXPERT ---
function updateExpertAdvice(isEligible, apport, notaire, endettement, ratio) {
    const list = document.getElementById('expert-list');
    list.innerHTML = "";
    
    if(!isEligible) {
        list.innerHTML += `<li><span class="exp-err">Projet non éligible Denormandie</span> : Les travaux (${ratio.toFixed(1)}%) sont inférieurs aux 25% requis.</li>`;
    } else {
        list.innerHTML += `<li><span class="exp-success">Éligibilité validée</span> : Le ratio travaux est suffisant pour le dispositif.</li>`;
    }

    if(apport >= notaire) {
        list.innerHTML += `<li><span class="exp-success">Bon apport</span> : Vos frais de notaire sont couverts, excellent signal pour la banque.</li>`;
    } else {
        list.innerHTML += `<li><span class="exp-warn">Apport faible</span> : Il est recommandé de couvrir au moins les frais de notaire (${formatEur(notaire)}).</li>`;
    }

    if(endettement > 35) {
        list.innerHTML += `<li><span class="exp-err">Alerte HCSF</span> : L'endettement dépasse 35%, le crédit risque d'être refusé.</li>`;
    }
}

function setDuree(index) {
    currentDurationIndex = index;
    const cards = document.querySelectorAll('.duree-card');
    cards.forEach((c, i) => {
        if(i === index) { c.classList.add('active'); c.querySelector('.duree-pct').classList.add('text-red'); }
        else { c.classList.remove('active'); c.querySelector('.duree-pct').classList.remove('text-red'); }
    });
    updateSim();
}

// --- CAPACITÉ D'EMPRUNT ---
function calcCapacite() {
    const revenus = parseFloat(document.getElementById('capa-revenus').value) || 0;
    const loyer = parseFloat(document.getElementById('capa-loyer').value) || 0;
    const taux = (parseFloat(document.getElementById('capa-taux').value) || 0) / 100 / 12;
    const mois = (parseFloat(document.getElementById('capa-annees').value) || 0) * 12;

    const revenusPonderes = revenus + (loyer * 0.7);
    const mensualiteMax = revenusPonderes * 0.35;

    let capacite = 0;
    if (taux > 0 && mois > 0) capacite = mensualiteMax * ((1 - Math.pow(1 + taux, -mois)) / taux);
    else if (mois > 0) capacite = mensualiteMax * mois;

    document.getElementById('capa-result').innerText = formatEur(capacite);
}

// --- SAUVEGARDE (FAVORIS) ---
function saveProject() {
    const name = document.getElementById('sim-name').value || 'Projet sans nom';
    const data = {
        id: Date.now(), name: name,
        prix: document.getElementById('sim-prix').value,
        apport: document.getElementById('sim-apport').value,
        travaux: document.getElementById('sim-travaux').value
    };
    let favs = JSON.parse(localStorage.getItem('transacFavs')) || [];
    favs.push(data);
    localStorage.setItem('transacFavs', JSON.stringify(favs));
    document.getElementById('sim-name').value = ""; 
    alert("Projet sauvegardé dans l'onglet 'Mes Projets' !");
    renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favorites-list');
    let favs = JSON.parse(localStorage.getItem('transacFavs')) || [];
    container.innerHTML = '';
    if(favs.length === 0) {
        container.innerHTML = "<p class='text-gray'>Aucun projet sauvegardé pour le moment.</p>";
        return;
    }
    favs.forEach(f => {
        container.innerHTML += `
            <div class="fav-card" onclick="loadProject(${f.id})">
                <div class="fav-title"><span style="color:#2B2D42">${f.name}</span><span class="fav-del" onclick="event.stopPropagation(); deleteProject(${f.id})">×</span></div>
                <div class="fav-details">Achat : ${formatEur(f.prix)} | Trvx : ${formatEur(f.travaux)}</div>
            </div>`;
    });
}

function loadProject(id) {
    let favs = JSON.parse(localStorage.getItem('transacFavs')) || [];
    let f = favs.find(x => x.id === id);
    if(f) {
        document.getElementById('sim-prix').value = f.prix;
        document.getElementById('sim-apport').value = f.apport;
        document.getElementById('sim-travaux').value = f.travaux;
        switchSimTab('complet'); 
        updateSim();
    }
}

function deleteProject(id) {
    let favs = JSON.parse(localStorage.getItem('transacFavs')) || [];
    localStorage.setItem('transacFavs', JSON.stringify(favs.filter(x => x.id !== id)));
    renderFavorites();
}

// --- LE VRAI CATALOGUE COMPLET ---
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
        },
        {
            title: "Immeuble de rapport — 4 lots", price: 280000, 
            address: "Rue Edouard de Pontet, Pauillac", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
            surface: 220, pieces: 12, travaux: 120000, status: "Disponible", statusClass: "badge-green"
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
    calcCapacite();
};
