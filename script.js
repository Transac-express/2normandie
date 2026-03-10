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

        // Assiette globale (Prix + Notaire + Travaux) plafonnée à 300 000€
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
        
        // MAJ Interface
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

function renderCatalogue() {}

// ==========================================
// LOGIQUE API BREVO (LEAD CAPTURE)
// ==========================================

function openModal() {
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.add('active');
}

function closeModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('lead-modal');
    if (modal) modal.classList.remove('active');
}

// Fonction d'envoi à l'API Brevo v3
async function sendLeadToWorkflow(leadData) {
    // CLÉ API FRONT-END (ATTENTION : Non recommandé en production)
    const apiKey = "4WdOI7Saw1jqR8DY";
    const url = "https://api.brevo.com/v3/smtp/email";

    const payload = {
        sender: { name: "Transac Express", email: "contact@transac-express.fr" }, // Ton adresse expéditeur
        to: [{ email: leadData.email, name: leadData.nom }], // Envoi à l'utilisateur
        subject: "Votre Étude Patrimoniale Denormandie - Transac Express",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; color: #1A2B3C;">
                <h2 style="color: #C5A059;">Bonjour ${leadData.nom},</h2>
                <p>Suite à votre simulation sur notre site, voici le détail de votre projet d'investissement :</p>
                <ul>
                    <li><strong>Prix d'achat :</strong> ${leadData.projet_prix_achat} €</li>
                    <li><strong>Budget travaux :</strong> ${leadData.projet_travaux} €</li>
                    <li><strong>Économie d'impôt ciblée :</strong> ${leadData.projet_economie_impot}</li>
                </ul>
                <p>Comme convenu, vous pouvez télécharger votre plan de financement personnalisé (PDF) en cliquant sur le lien ci-dessous :</p>
                <p><a href="https://transac-express.github.io/2normandie/etude-patrimoniale.pdf" style="display:inline-block; padding:12px 24px; background-color:#C5A059; color:#1A2B3C; text-decoration:none; font-weight:bold; border-radius:2px;">TÉLÉCHARGER MON ÉTUDE</a></p>
                <p>Un de nos conseillers vous contactera prochainement au ${leadData.telephone} pour vous accompagner dans votre projet.</p>
                <p>À très bientôt,<br>L'équipe Transac Express</p>
            </div>
        `
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch (error) {
        console.error("Erreur API Brevo :", error);
        return false;
    }
}

async function submitForm(event) {
    event.preventDefault(); 
    
    const btn = document.getElementById('submit-btn');
    const form = document.getElementById('lead-form');
    const successMsg = document.getElementById('success-message');
    const introText = document.getElementById('modal-intro');
    const noteText = document.getElementById('modal-note');
    
    // État "Chargement"
    const originalBtnText = btn.innerText;
    btn.innerText = "GÉNÉRATION EN COURS...";
    btn.disabled = true;
    btn.style.opacity = "0.7";
    
    // Données du prospect et du simulateur
    const leadData = {
        nom: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        telephone: document.getElementById('lead-phone').value || "Non renseigné",
        projet_prix_achat: document.getElementById('sim-prix').value,
        projet_travaux: document.getElementById('sim-travaux').value,
        projet_economie_impot: document.getElementById('res-reduction').innerText
    };
    
    // Requête vers Brevo
    const isSuccess = await sendLeadToWorkflow(leadData);
    
    // Succès ou Erreur
    if (isSuccess) {
        form.style.display = 'none';
        if(introText) introText.style.display = 'none';
        if(noteText) noteText.style.display = 'none';
        successMsg.style.display = 'block';
    } else {
        alert("Une erreur de connexion est survenue. Veuillez réessayer.");
        btn.innerText = originalBtnText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

window.onload = () => {
    updateSim();
    renderCatalogue();
};
