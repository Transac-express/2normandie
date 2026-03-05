// FONCTION DE SCROLL PAR SECTION
function scrollToSection(id) {
    const scroller = document.querySelector('.main-scroller');
    const target = document.getElementById(id);
    scroller.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth'
    });
}

// LOGIQUE SIMULATEUR
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
        <div style="font-size:1.5rem; color:#E30613; font-weight:900; margin-bottom:10px">Réduction d'impôt : ${(assiette * 0.21).toLocaleString()} €</div>
        <div style="font-weight:700">Loyer Max (Zone B2) : ${loyer} €/mois</div>
    `;
}

// CATALOGUE DYNAMIQUE
window.onload = () => {
    updateSim();
    const grid = document.getElementById('catalogue-grid');
    const items = [
        {t: "Maison Pierre de Taille", p: "215 000€", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"},
        {t: "Appartement T3 Centre", p: "145 000€", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"}
    ];
    grid.innerHTML = items.map(i => `
        <div style="background:white; border-radius:15px; overflow:hidden; border:1px solid #eee">
            <img src="${i.img}" style="width:100%; height:200px; object-fit:cover">
            <div style="padding:20px">
                <h3 style="font-weight:800">${i.t}</h3>
                <p style="color:#E30613; font-weight:900; margin-top:10px">${i.p}</p>
            </div>
        </div>
    `).join('');
};
