async function ShowHistorique() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Veuillez vous connecter pour accéder à votre historique");
        window.location.href = "connexion.html";
        return;
    }
    try {
        const response = await fetch(`http://localhost:8000/api/historique/${user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'historique');
        }
        const historique = await response.json();
        displayHistorique(historique);
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message);
    }
}

function displayHistorique(historique) {
    const conteneur = document.querySelector('.conteneurHistorique');
    conteneur.innerHTML = '';
    if (historique.length === 0) {
        conteneur.innerHTML = '<p class="aucun-emprunt">Aucun emprunt dans votre historique</p>';
        return;
    }
    const table = document.createElement('table');
    table.className = 'table-historique';
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Titre du livre</th>
            <th>Date d'emprunt</th>
            <th>Date limite</th>
            <th>Date de retour</th>
            <th>Statut</th>
        </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    historique.forEach(emprunt => {
        const row = document.createElement('tr');
        let statut = '';
        if (emprunt.date_retour) {
            statut = 'Retourné';
        } else {
            const today = new Date();
            const dateLimite = new Date(emprunt.date_limite);
            statut = today > dateLimite ? 'En retard' : 'En cours';
        }
        row.innerHTML = `
            <td>${emprunt.livre.titre}</td>
            <td>${formatDate(emprunt.date_emprunt)}</td>
            <td>${formatDate(emprunt.date_limite)}</td>
            <td>${emprunt.date_retour ? formatDate(emprunt.date_retour) : '-'}</td>
            <td class="statut ${statut.toLowerCase().replace(' ', '-')}">${statut}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    conteneur.appendChild(table);
}

// Initialisation
ShowHistorique();