function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function updateSim() {
    const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
    const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
    const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
    const notaire = prix * 0.08;
    const total = prix + notaire + travaux;

    const ratioTravaux = (travaux / total) * 100;
    const isEligible = ratioTravaux >= 25;

    // Plafond 300k
    const assiette = Math.min(total, 300000);
    
    // Loyer Zone B2 avec coefficient
    const coeff = Math.min(1.2, 0.7 + (19 / surface));
    const loyerMax = (9.83 * surface * coeff).toFixed(2);

    const resultsDiv = document.getElementById('sim-results');
    resultsDiv.innerHTML = `
        <div class="alert ${isEligible ? 'alert-success' : 'alert-error'}">
            ${isEligible ? '✅ Projet Éligible' : '❌ Travaux insuffisants (< 25%)'}
        </div>
        <div class="res-item">Ratio travaux : <strong>${ratioTravaux.toFixed(1)}%</strong></div>
        <div class="res-item">Réduction d'impôt (12 ans) : <strong style="color:var(--primary)">${(assiette * 0.21).toLocaleString()} €</strong></div>
        <div class="res-item">Loyer max conseillé : <strong>${loyerMax} €/mois</strong></div>
        <p style="font-size:0.8rem; margin-top:1rem; color: #666">
            * Amélioration énergétique de 30% requise.<br>
            * Location nue à titre de résidence principale.
        </p>
    `;
}

// Chargement initial
window.onload = () => {
    updateSim();
    // Simulation de chargement de catalogue
    const grid = document.getElementById('catalogue-grid');
    const maisons = [
        {t: "Maison de ville", p: "185 000€", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"},
        {t: "Appartement T3", p: "125 000€", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
    ];
    grid.innerHTML = maisons.map(m => `
        <div class="card">
            <img src="${m.img}">
            <div class="card-content">
                <h3>${m.t}</h3>
                <p style="color:var(--primary); font-weight:bold">${m.p}</p>
                <span class="btn-nav" style="font-size:0.7rem">Éligible Denormandie</span>
            </div>
        </div>
    `).join('');
};
