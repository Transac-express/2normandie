// ==========================================
// 1. NAVIGATION SPA (SÉCURISÉE)
// ==========================================
function navigate(targetId) {
    if (window.event) window.event.preventDefault();

    const targetPage = document.getElementById('page-' + targetId);
    
    if (targetPage) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none'; 
        });

        targetPage.classList.add('active');
        targetPage.style.display = 'block'; 

        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            }
        });

        window.scrollTo(0, 0);

        if(targetId === 'catalogue') renderCatalogue();
    } else {
        console.error("Erreur : La section 'page-" + targetId + "' n'existe pas.");
    }
}

// ==========================================
// 2. SIMULATEUR FISCAL EXPERT
// ==========================================
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
        const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
        const notairePct = parseFloat(document.getElementById('sim-notaire-pct').value) || 8;
        const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
        const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
        const apport = parseFloat(document.getElementById('sim-apport').value) || 0;
        const revenus = parseFloat(document.getElementById('sim-revenus').value) || 0;
        const tauxPret = parseFloat(document.getElementById('sim-taux').value) || 0;
        const nbMois = parseFloat(document.getElementById('sim-duree-mois').value) || 240;
        
        // --- NOUVEAU CHAMP LOYER ---
        const loyerSaisi = parseFloat(document.getElementById('sim-loyer').value) || 0;

        const notaireMontant = prix * (notairePct / 100);
        document.getElementById('val-notaire-montant').innerText = `= ${formatEur(notaireMontant)}`;

        const totalProjet = prix + notaireMontant + travaux;
        const assiette = Math.min(totalProjet, 300000);
        const durationObj = DURATIONS[currentDurationIndex];
        const reduction = assiette * durationObj.rate;
        const reductionAn = reduction / durationObj.years;

        const ratioTravaux = totalProjet > 0 ? (travaux / totalProjet) * 100 : 0;
        const isEligible = ratioTravaux >= 25;
        const alertRatio = document.getElementById('alert-ratio');
        if (alertRatio) alertRatio.style.display = isEligible ? 'none' : 'block';
        document.getElementById('val-ratio-alert').innerText = ratioTravaux.toFixed(1) + '%';
        document.getElementById('res-ratio').innerText = ratioTravaux.toFixed(1) + '%';
        document.getElementById('res-ratio').className = isEligible ? 'text-primary bold' : 'text-red bold';

        // --- AFFICHAGE DU LOYER SAISI (SANS CALCUL PLAFOND) ---
        document.getElementById('res-loyer').innerText = loyerSaisi + ' €/mois';
        const loyerDetail = document.getElementById('res-loyer-detail');
        if (loyerDetail) loyerDetail.innerText = '';

        const capitalEmprunte = Math.max(0, totalProjet - apport);
        const tauxMensuel = (tauxPret / 100) / 12;
        let mensualite = 0;
        if (tauxMensuel > 0 && nbMois > 0) {
            mensualite = capitalEmprunte * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois)) / (Math.pow(1 + tauxMensuel, nbMois) - 1);
        } else if (nbMois > 0) {
            mensualite = capitalEmprunte / nbMois; 
        }

        const ratioEndettement = revenus > 0 ? (mensualite / revenus) * 100 : 0;
        const barFill = document.getElementById('res-endettement-bar');
        document.getElementById('res-endettement-txt').innerText = ratioEndettement.toFixed(1) + "%";
        if (barFill) {
            barFill.style.width = Math.min(ratioEndettement, 100) + "%";
            barFill.style.background = ratioEndettement > 35 ? "#1A2B3C" : "#C5A059";
        }
        document.getElementById('res-endettement-status').innerText = ratioEndettement > 35 ? "⚠️ Endettement élevé (>35%)" : "✅ Capacité d'emprunt respectée";

        document.getElementById('res-resume-prix').innerText = formatEur(prix);
        document.getElementById('res-resume-notaire').innerText = formatEur(notaireMontant);
        document.getElementById('res-resume-travaux').innerText = formatEur(travaux);
        document.getElementById('res-resume-reduction').innerText = formatEur(reduction);
        document.getElementById('res-reduction').innerText = formatEur(reduction);
        document.getElementById('res-sub').innerText = `sur ${durationObj.years} ans • soit ${formatEur(reductionAn)}/an`;
        document.getElementById('res-assiette').innerText = formatEur(assiette);
        document.getElementById('res-mensualite').innerText = formatEur(mensualite);

    } catch(e) {
        console.error("Erreur simulateur :", e);
    }
}

function setDuree(index) {
    currentDurationIndex = index;
    const cards = document.querySelectorAll('.duree-card');
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });
    updateSim();
}

// ==========================================
// CATALOGUE ET INJECTION SIMULATEUR
// ==========================================

const PROPERTIES = [
    {
        id: 1,
        title: "Immeuble de Rapport - 3 Lots",
        location: "Pauillac Centre - À 200m des quais",
        price: 185000,
        surface: 140,
        travaux: 65000,
        img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
        badge: "Idéal Investisseur",
        plan: "plan-immeuble.pdf"
    },
    {
        id: 2,
        title: "Maison de Ville en Pierre",
        location: "Pauillac - Proche commodités",
        price: 120000,
        surface: 90,
        travaux: 45000,
        img: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80",
        badge: "Forte rentabilité",
        plan: "plan-immeuble.pdf"
    },
    {
        id: 3,
        title: "Grand T3 avec Extérieur",
        location: "Pauillac - Quartier historique",
        price: 95000,
        surface: 65,
        travaux: 35000,
        img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80",
        badge: "Coup de cœur",
        plan: "plan-immeuble.pdf"
    }
];

function renderCatalogue() {
    const grid = document.getElementById('catalogue-grid');
    if (!grid) return;

    grid.innerHTML = PROPERTIES.map(prop => `
        <div class="property-card">
            <div class="property-img-wrap">
                <img src="${prop.img}" alt="${prop.title}">
                <div class="badge-red" style="position: absolute; top: 15px; left: 15px;">${prop.badge}</div>
                <div class="badge-dark" style="position: absolute; top: 15px; right: 15px;">ÉLIGIBLE DENORMANDIE</div>
            </div>
            <div class="property-body">
                <div class="property-header">
                    <h3 style="font-size: 1.1rem; line-height: 1.3; max-width: 65%; color: var(--primary); font-family: var(--font-title);">${prop.title}</h3>
                    <div style="font-family: var(--font-title); font-size: 1.4rem; color: var(--accent); font-weight: 700;">${formatEur(prop.price)}</div>
                </div>
                <p class="text-gray text-xs mb-20">📍 ${prop.location}</p>
                
                <div class="grid-2 gap-15 mb-20" style="text-align: center; border-top: 1px solid var(--border-fine); border-bottom: 1px solid var(--border-fine); padding: 15px 0;">
                    <div>
                        <span class="text-xs text-gray" style="display:block; text-transform:uppercase; font-weight:600;">Surface</span>
                        <strong style="color: var(--primary); font-size:1.1rem;">${prop.surface} m²</strong>
                    </div>
                    <div style="border-left: 1px solid var(--border-fine);">
                        <span class="text-xs text-gray" style="display:block; text-transform:uppercase; font-weight:600;">Travaux est.</span>
                        <strong style="color: var(--accent); font-size:1.1rem;">${formatEur(prop.travaux)}</strong>
                    </div>
                </div>

                <button class="btn-primary" style="width: 100%; font-size: 0.85rem; margin-bottom: 10px;" onclick="loadPropertyInSim(${prop.price}, ${prop.travaux}, ${prop.surface})">
                    ÉTUDIER CE PROJET
                </button>
                
                <a href="${prop.plan}" target="_blank" style="display: flex; justify-content: center; align-items: center; width: 100%; font-size: 0.85rem; padding: 14px; border: 1px solid var(--accent); color: var(--primary); font-weight: 700; border-radius: var(--radius-luxe); text-transform: uppercase; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.background='var(--accent)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='var(--primary)'">
                    📄 Voir les plans (PDF)
                </a>
            </div>
        </div>
    `).join('');
}

function loadPropertyInSim(prix, travaux, surface) {
    document.getElementById('sim-prix').value = prix;
    document.getElementById('sim-travaux').value = travaux;
    document.getElementById('sim-surface').value = surface;
    updateSim();
    navigate('simulateur');
}

// ==========================================
// LOGIQUE DE PARTAGE NATIVE
// ==========================================

async function partagerSimulation() {
    // 1. Récupération des valeurs saisies par l'utilisateur
    const prix = document.getElementById('sim-prix').value;
    const travaux = document.getElementById('sim-travaux').value;
    const surface = document.getElementById('sim-surface').value;
    const loyer = document.getElementById('sim-loyer').value;
    const apport = document.getElementById('sim-apport').value;
    const revenus = document.getElementById('sim-revenus').value;
    const duree = document.getElementById('sim-duree-mois').value;

    // 2. Création de l'URL avec les paramètres inclus
    const baseUrl = window.location.href.split('?')[0];
    const urlAvecParametres = `${baseUrl}?prix=${prix}&travaux=${travaux}&surface=${surface}&loyer=${loyer}&apport=${apport}&revenus=${revenus}&duree=${duree}`;

    const shareData = {
        title: 'Ma simulation Denormandie',
        text: 'Regarde cette simulation d\'investissement immobilier à Pauillac :',
        url: urlAvecParametres
    };

    // 3. Lancement du partage
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (erreur) {
            console.log('Partage annulé par l\'utilisateur');
        }
    } else {
        // Alternative pour les PC sans partage natif
        try {
            await navigator.clipboard.writeText(urlAvecParametres);
            alert('Le lien de votre simulation a été copié dans le presse-papier ! Vous pouvez le coller où vous le souhaitez.');
        } catch (err) {
            console.error('Erreur lors de la copie', err);
        }
    }
}

// ==========================================
// DEMARRAGE DE L'APPLICATION (LE MOTEUR)
// ==========================================

function demarrerApplication() {
    console.log("🚀 1. Lancement de l'application...");
    
    // On analyse le lien web
    const urlParams = new URLSearchParams(window.location.search);
    
    // Si on trouve le mot "prix" dans le lien, c'est que c'est un lien partagé
    if (urlParams.has('prix')) {
        console.log("🔗 2. Lien de partage détecté ! Paramètres :", urlParams.toString());
        
        try {
            // Remplissage des cases
            document.getElementById('sim-prix').value = urlParams.get('prix');
            document.getElementById('sim-travaux').value = urlParams.get('travaux');
            document.getElementById('sim-surface').value = urlParams.get('surface');
            document.getElementById('sim-loyer').value = urlParams.get('loyer');
            document.getElementById('sim-apport').value = urlParams.get('apport');
            
            if (urlParams.has('revenus')) document.getElementById('sim-revenus').value = urlParams.get('revenus');
            if (urlParams.has('duree')) document.getElementById('sim-duree-mois').value = urlParams.get('duree');

            console.log("✅ 3. Champs remplis avec succès. Basculement sur la page Simulateur...");
            
            // On utilise ta propre fonction de navigation pour faire propre
            navigate('simulateur');
            
        } catch (erreur) {
            console.error("❌ Erreur lors du remplissage des champs :", erreur);
        }
    } else {
        console.log("🏠 2. Visite classique (Pas de partage). On reste sur l'accueil.");
    }

    // Dans tous les cas, on met à jour les calculs et on charge les biens
    updateSim();
    renderCatalogue();
    console.log("🏁 4. Initialisation terminée.");
}

// On lance le moteur une fois que le HTML de base est lu par le navigateur
document.addEventListener('DOMContentLoaded', demarrerApplication);
// ==========================================
// MODALES (Cartes et Appel)
// ==========================================
function openMapChoice() {
    const modal = document.getElementById('map-modal');
    if (modal) modal.classList.add('active');
}

function confirmCall() {
    const modal = document.getElementById('call-modal');
    if (modal) modal.classList.add('active');
}

function closeCallModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('call-modal');
    if (modal) modal.classList.remove('active');
}
