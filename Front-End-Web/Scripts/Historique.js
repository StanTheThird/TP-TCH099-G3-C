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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la récupération de l\'historique');
        }
        
        displayHistorique(data);
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message);
    }
}

function displayHistorique(data) {
    const conteneur = document.querySelector('.conteneurHistorique');
    conteneur.innerHTML = '';
    
    // Cas où l'historique est vide
    if (data.status === "empty") {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-history';
        
        emptyDiv.innerHTML = `
            <div class="empty-icon">📚</div>
            <h2>${data.message}</h2>
            <button class="btn-explorer" onclick="window.location.href='accueil.html'">
                Explorer les livres
            </button>
        `;
        
        conteneur.appendChild(emptyDiv);
        return;
    }
    
    // Cas où l'historique contient des données
    if (data.length === 0) {
        // Fallback au cas où l'API ne renverrait pas le status "empty"
        conteneur.innerHTML = `
            <div class="empty-history">
                <div class="empty-icon">📚</div>
                <h2>Vous n'avez encore emprunté aucun livre</h2>
                <p>Parcourez notre catalogue pour trouver votre prochaine lecture !</p>
                <button class="btn-explorer" onclick="window.location.href='accueil.html'">
                    Explorer les livres
                </button>
            </div>
        `;
        return;
    }

    // Le reste du code pour afficher l'historique non vide reste inchangé
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