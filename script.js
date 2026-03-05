// NAVIGATION SPA
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    // Update Header style based on page
    const header = document.getElementById('header');
    if (pageId !== 'home') {
        header.style.position = 'fixed';
        header.style.background = 'white';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.position = 'absolute';
        header.style.background = 'transparent';
        header.style.boxShadow = 'none';
    }
    window.scrollTo(0, 0);
}

// SIMULATEUR DENORMANDIE
function updateSim() {
    const prix = parseFloat(document.getElementById('sim-prix').value) || 0;
    const travaux = parseFloat(document.getElementById('sim-travaux').value) || 0;
    const surface = parseFloat(document.getElementById('sim-surface').value) || 0;
    
    const total = prix + (prix * 0.08) + travaux;
    const ratio = total > 0 ? (travaux / total) * 100 : 0;
    const isEligible = ratio >= 25;
    
    const assiette = Math.min(total, 300000);
    const coeff = surface > 0 ? Math.min(1.2, 0.7 + (19/surface)) : 0;
    const loyer = (9.83 * surface * coeff).toFixed(2);

    const res = document.getElementById('sim-results');
    res.innerHTML = `
        <div style="padding:15px; border-radius:10px; margin-bottom:20px; font-weight:800; text-align:center; background:${isEligible ? '#d1fae5' : '#fee2e2'}; color:${isEligible ? '#065f46' : '#991b1b'}">
            ${isEligible ? '✅ PROJET ÉLIGIBLE' : '❌ TRAVAUX < 25%'}
        </div>
        <div style="font-size:0.9rem; color:#666">Ratio Travaux : <strong>${ratio.toFixed(1)}%</strong></div>
        <div style="font-size:1.5rem; color:#E30613; font-weight:900; margin: 15px 0">Économie d'impôt : ${(assiette * 0.21).toLocaleString()} €</div>
        <div style="font-weight:700">Loyer Max (B2) : ${loyer} €/mois</div>
    `;
}

// INITIALISATION
window.onload = () => {
    updateSim();
    // Simulation Catalogue
    const grid = document.getElementById('catalogue-grid');
    const items = [
        {t: "Maison Pierre de Taille", p: "215 000€", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"},
        {t: "Immeuble Pauillac Centre", p: "340 000€", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600"}
    ];
    grid.innerHTML = items.map(i => `
        <div style="background:white; border-radius:20px; overflow:hidden; border:1px solid #eee">
            <img src="${i.img}" style="width:100%; height:250px; object-fit:cover">
            <div style="padding:20px">
                <h3 style="font-weight:800">${i.t}</h3>
                <p style="color:#E30613; font-weight:900; margin-top:10px">${i.p}</p>
            </div>
        </div>
    `).join('');
};
