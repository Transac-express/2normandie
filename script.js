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

        const notaireMontant = prix * (notairePct / 100);
        document.getElementById('val-notaire-montant').innerText = `= ${formatEur(notaireMontant)}`;

        const totalProjet = prix + notaireMontant + travaux;
        const assiette = Math.min(totalProjet, 300000);
        const durationObj = DURATIONS[currentDurationIndex];
        const reduction = assiette * durationObj.rate;
        const reductionAn = reduction / durationObj.years;

        // On récupère le montant saisi par l'utilisateur (ou 0 par défaut)
        const loyerFinal = parseFloat(document.getElementById('sim-loyer').value) || 0;
        
        // On met à jour l'affichage
        document.getElementById('res-loyer').innerText = loyerFinal + ' €/mois';
        // On retire le détail du calcul devenu inutile
        const loyerDetail = document.getElementById('res-loyer-detail');
        if (loyerDetail) loyerDetail.innerText = '';
        document.getElementById('res-ratio').className = isEligible ? 'text-primary bold' : 'text-red bold';

        const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
        const loyerBase = 9.83; 
        const loyerFinal = (loyerBase * surface * coeff).toFixed(0);
        document.getElementById('res-loyer').innerText = loyerFinal + ' €/mois';
        document.getElementById('res-loyer-detail').innerText = `Base : 9.83 €/m² × ${surface} m² × coeff. (${coeff.toFixed(2)})`;

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
// LOGIQUE WEBHOOK (MAKE) - STANDARD JSON
// ==========================================

// ⚠️ VÉRIFIE QUE CE LIEN EST BIEN LE TOUT DERNIER GÉNÉRÉ PAR MAKE
const WEBHOOK_URL = "https://hook.eu1.make.com/6cr8nh6ioqwk2485qio3dg8ifed9ks3v"; 

function openModal() {
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.add('active');
}

function closeModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.remove('active');
}

// Fonction d'envoi Standard (On enlève le blindage pour voir la vérité)
async function sendToAutomation(data) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' // Make va adorer ce format
            },
            body: JSON.stringify(data)
        });
        
        // On veut voir la vraie réponse de Make
        if (!response.ok) {
            console.error("Make a refusé avec le code :", response.status);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Impossible de joindre Make :", error);
        return false;
    }
}

async function submitForm(event) {
    event.preventDefault(); 
    
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const form = document.getElementById('lead-form');
    const successMsg = document.getElementById('success-message');
    const introText = document.getElementById('modal-intro');
    const noteText = document.getElementById('modal-note');
    
    const fullName = document.getElementById('lead-name').value;
    const firstName = fullName.split(' ')[0];
    
    if (btn) { btn.disabled = true; btn.style.opacity = "0.8"; }
    if (btnText) btnText.innerText = "TRAITEMENT EN COURS...";
    if (btnLoader) btnLoader.style.display = "inline-block";
    
    const leadData = {
        prenom_nom: fullName,
        email: document.getElementById('lead-email').value,
        telephone: document.getElementById('lead-phone').value || "Non renseigné",
        prix_achat: document.getElementById('res-resume-prix').innerText,
        frais_notaire: document.getElementById('res-resume-notaire').innerText,
        montant_travaux: document.getElementById('res-resume-travaux').innerText,
        gain_fiscal_total: document.getElementById('res-resume-reduction').innerText,
        duree_engagement: DURATIONS[currentDurationIndex].years + " ans"
    };
    
    const isSuccess = await sendToAutomation(leadData);
    
    if (isSuccess) {
        if (form) form.style.display = 'none';
        if (introText) introText.style.display = 'none';
        if (noteText) noteText.style.display = 'none';
        
        if (successMsg) {
            successMsg.innerHTML = `
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 style="color: var(--primary); font-family: var(--font-title); font-size: 1.8rem; margin-bottom: 15px;">Merci ${firstName},</h3>
                <p style="color: var(--text-body); line-height: 1.6; font-size: 1rem;">Votre étude est en cours de génération ! Vérifiez vos emails d'ici quelques instants.</p>
            `;
            successMsg.style.display = 'block';
        }
    } else {
        // S'il y a une erreur, on remet le bouton à la normale pour que tu puisses voir ce qui cloche
        if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
        if (btnText) btnText.innerText = "RÉESSAYER";
        if (btnLoader) btnLoader.style.display = "none";
        alert("Make a bloqué la requête. Regarde la console (F12) !");
    }
}

// ==========================================
// 4. LANCEMENT
// ==========================================
window.onload = () => {
    updateSim();
    renderCatalogue();
};
