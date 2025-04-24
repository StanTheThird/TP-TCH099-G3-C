function calculerFraisRetard(historique) {
    const today = new Date();
    let total = 0;
    
    const breakdown = historique.map(e => {
        const limite = new Date(e.date_limite);
        const fin = e.date_retour ? new Date(e.date_retour) : today;
        const diff = fin - limite;
        const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const frais = jours > 0 ? jours * 1 : 0; // 1$ / jour
        total += frais;
        
        return {
            titre: e.livre?.titre || '—',
            jours: jours > 0 ? jours : 0,
            frais
        };
    }).filter(item => item.frais > 0);

    return { total, breakdown };
}

function afficherRecapitulatifFrais(total, breakdown, container) {
    container.innerHTML = `
        <div class="total-due">
            <h2>Total dû : <strong>${total.toFixed(2)} $ CAD</strong></h2>
            <ul class="breakdown-list">
                ${breakdown.map(b => `<li>${b.titre} : ${b.jours} jour(s) → ${b.frais.toFixed(2)} $</li>`).join('')}
            </ul>
            <button id="btnPayerTotal" class="btn-payer-total">PAYER MAINTENANT</button>
        </div>
    `;
    
    document.getElementById('btnPayerTotal').addEventListener('click', () => {
        localStorage.setItem('solde', total.toFixed(2));
        window.location.href = 'solde.html';
    });
}

/**
 * Initialise la page de paiement/solde
 */
function setupPageSolde() {
    const form = document.getElementById("paymentForm");
    const messageErreur = document.getElementById("messageErreur");
    const montantAffichage = document.getElementById("montantValue");
    const montantInput = document.getElementById("montant");

    // Récupère le solde stocké
    const montant = parseFloat(localStorage.getItem("solde") || "0");
    // Met à jour l'affichage
    montantAffichage.textContent = montant.toFixed(2);
    montantInput.value = montant.toFixed(2);

    form.addEventListener("submit", async e => {
        e.preventDefault();
        messageErreur.textContent = "";

        const data = Object.fromEntries(new FormData(form).entries());
        data.id_utilisateur = JSON.parse(localStorage.getItem("user")).id;
        data.montant = montant;

        // Validation
        if (!/^4519\d{12}$/.test(data.numero)) {
            messageErreur.textContent = "Le numéro doit commencer par 4519 et faire 16 chiffres.";
            return;
        }
        const [mm, aa] = data.date_expiration.split('/');
        if (!mm || !aa || Number(aa) < 25) {
            messageErreur.textContent = "La date d'expiration doit être après 2025.";
            return;
        }
        if (!/^\d{3}$/.test(data.cvc)) {
            messageErreur.textContent = "Le CVC doit faire 3 chiffres.";
            return;
        }

        try {
            const resp = await fetch("http://localhost:8000/api/paiement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const json = await resp.json();
            if (!resp.ok) throw new Error(json.error || "Erreur paiement");

            alert("Paiement réussi ! Votre solde est maintenant à $ 0.00");
            localStorage.setItem("solde", "0");
            window.location.href = "historique.html";
        } catch (err) {
            messageErreur.textContent = err.message;
        }
    });
}

setupPageSolde();