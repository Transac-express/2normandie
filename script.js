function showPage(pageId) {
    // Cache toutes les pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Affiche la page demandée
    document.getElementById('page-' + pageId).classList.add('active');
    // Remonte en haut de page
    window.scrollTo(0, 0);
}

function updateSim() {
    const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
    const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
    const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
    
    const total = prix + (prix * 0.08) + travaux;
    const assiette = Math.min(total, 300000);
    const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
    const loyer = (9.83 * surface * coeff).toFixed(2);

    const res = document.getElementById('sim-results');
    res.innerHTML = `
        <div style="background:#f8f9fa; padding:30px; border-radius:20px; border-left: 5px solid #E30613">
            <h3 style="color:#E30613; margin-bottom:10px">Résultat :</h3>
            <p style="font-size:1.5rem; font-weight:900">Réduction : ${(assiette * 0.21).toLocaleString()} €</p>
            <p>Loyer Max : ${loyer} € / mois</p>
        </div>
    `;
}

// Init au chargement
window.onload = () => {
    updateSim();
}
