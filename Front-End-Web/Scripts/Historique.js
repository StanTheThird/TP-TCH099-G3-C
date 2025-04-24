// Front-End-Web/Scripts/Historique.js

async function ShowHistorique() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Veuillez vous connecter pour accéder à votre historique");
        window.location.href = "connexion.html";
        return;
    }

    try {
        const resp = await fetch(`http://localhost:8000/api/historique/${user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await resp.json();
        if (!resp.ok) {
            throw new Error(data.error || "Erreur lors de la récupération de l'historique");
        }
        displayHistorique(data);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function displayHistorique(data) {
    const cont = document.querySelector('.conteneurHistorique');
    cont.innerHTML = '';

    // Si pas de tableau ou vide
    if (!Array.isArray(data) || data.length === 0) {
        cont.innerHTML = `
            <div class="empty-history">
                <div class="empty-icon"></div>
                <h2>Vous n'avez encore emprunté aucun livre.</h2>
                <button class="btn-explorer" onclick="window.location.href='accueil.html'">
                    Explorer les livres
                </button>
            </div>
        `;
        return;
    }
    const table = document.createElement('table');
    table.className = 'table-historique';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Titre du livre</th>
                <th>Date d'emprunt</th>
                <th>Date limite</th>
                <th>Date de retour</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(e => {
                const dateEmp = e.date_emprunt ? formatDate(e.date_emprunt) : '-';
                const dateLim = e.date_limite   ? formatDate(e.date_limite)   : '-';
                const dateRet = e.date_retour    ? formatDate(e.date_retour)    : '-';
                const statut = e.date_retour
                    ? 'Retourné'
                    : (new Date() > new Date(e.date_limite) ? 'En retard' : 'En cours');
                return `
                    <tr>
                        <td>${e.livre?.titre || '—'}</td>
                        <td>${dateEmp}</td>
                        <td>${dateLim}</td>
                        <td>${dateRet}</td>
                        <td class="statut ${statut.toLowerCase().replace(' ', '-')}">
                            ${statut}
                        ${
                        statut === 'En retard'
                            ? (e.est_paye
                                ? `<span class="statut-paye">Payé</span>`
                                : `<button class="btn-payer" data-id="${e.id_emprunt}" data-montant="${e.solde || 0}">Payer</button>`)
                            : ''
                        }

                            </td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    cont.appendChild(table);

    document.querySelectorAll('.btn-payer').forEach(btn => {
        btn.addEventListener('click', () => {
            const empruntId = btn.dataset.id;
            const montant = btn.dataset.montant;
    
            sessionStorage.setItem('paiement_emprunt_id', empruntId);
            sessionStorage.setItem('paiement_montant', montant);
    
            window.location.href = "paiement.html";
        });
    });
    
}

function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-CA');
}

ShowHistorique();
