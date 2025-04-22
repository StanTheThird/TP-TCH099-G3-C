function displayAllBooks() {
    const filtreContainer = document.getElementById("admin");
    const titre = filtreContainer.querySelector('h1');
    filtreContainer.innerHTML = '';
    if (titre) filtreContainer.appendChild(titre);

    const bar = document.createElement('div');
    bar.className = 'admin-bar';

    const rechercheLabel = document.createElement('label');
    rechercheLabel.textContent = " 🔎 ";
    rechercheLabel.setAttribute('for', 'rechercheLivre');

    const champRecherche = document.createElement('input');
    champRecherche.type = "text";
    champRecherche.id = "rechercheLivre";
    champRecherche.placeholder = "Entrez un titre ou un auteur...";
    champRecherche.className = "champ-recherche";
    champRecherche.addEventListener('input', () => {
        let search = champRecherche.value.trim();
        displayBooksFromSearch(search);
    });

    const boutonAjout = document.createElement('button');
    boutonAjout.textContent = "+ Livre";
    boutonAjout.className = 'btn-ajout-livre';

    const boutonEmprunt = document.createElement('button');
    boutonEmprunt.textContent = "Gérer les emprunts";
    boutonEmprunt.className = "btn-gerer-emprunt";
    boutonEmprunt.addEventListener('click', () => {
        window.location.href = 'adminEmprunt.html';
    });

    bar.append(rechercheLabel, champRecherche, boutonAjout, boutonEmprunt);
    filtreContainer.appendChild(bar);

    fetch("http://localhost:8000/api/livre")
        .then(response => {
            if (!response.ok) throw new Error(`erreur HTTP: ${response.status}`);
            return response.json();
        })
        .then(books => {
            const conteneur = document.getElementById("conteneur_livres_admin");
            conteneur.innerHTML = '';
            books.forEach(livre => {
                conteneur.appendChild(createAdminLivre(livre));
            });
        })
        .catch(error => {
            console.error("Erreur chargement des livres :", error);
        });
}

function displayBooksFromSearch(search) { 
    fetch(`http://localhost:8000/api/livre/recherche-filtre?search=${encodeURIComponent(search)}`)
        .then(response => {
            if (!response.ok) throw new Error('Erreur recherche');
            return response.json();
        })
        .then(books => {
            const conteneur = document.getElementById("conteneur_livres_admin");
            conteneur.innerHTML = '';
            books.forEach(livre => {
                conteneur.appendChild(createAdminLivre(livre));
            });
        })
        .catch(error => {
            console.error("erreur recherche: ", error);
        });
}

function createAdminLivre(livre) {
    const carteLivre = document.createElement('div');
    carteLivre.className = 'admin-livre-carte';

    const image = document.createElement('img');
    image.src = livre.image;
    image.alt = livre.titre;

    const titre = document.createElement('h3');
    titre.textContent = livre.titre;

    carteLivre.appendChild(image);
    carteLivre.appendChild(titre);

    carteLivre.addEventListener('click', () => {
        sessionStorage.setItem('livreSelectionne', JSON.stringify(livre));
        window.location.href = "livreInfo.html";
    });

    return carteLivre;
}

function setUpModalAjoutLivre() {
    const modal = document.getElementById('addLivreModal');
    const btnAnnuler = document.getElementById('btnAnnuler');
    const formulaire = document.getElementById('formulaire');

    const boutonAjout = document.querySelector('.btn-ajout-livre');
    if (boutonAjout && modal) {
        boutonAjout.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (btnAnnuler) {
        btnAnnuler.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (formulaire) {
        formulaire.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                image: document.getElementById('image').value,
                titre: document.getElementById('titre').value,
                code_livre: document.getElementById('codeLivre').value,
                description: document.getElementById('description').value,
                date_parution: document.getElementById('dateParution').value,
                nb_pages: document.getElementById('nbPages').value,
                format: document.getElementById('format').value,
                stock: document.getElementById('stock').value,        
                auteur_id: 1,
                langue_id: 1,
                categorie_id: 1
            };

            try {
                const response = await fetch('http://localhost:8000/api/ajout/livre', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error);

                alert("Livre ajouté !");
                modal.style.display = 'none';
                displayAllBooks();
            } catch (error) {
                alert("erreur : " + error.message);
            }
        });
    }
}

function displayEmpruntAdmin() {
    const conteneur = document.querySelector('.conteneurEmprunt');
    conteneur.innerHTML = '';

    const divRecherche = document.createElement('div');
    divRecherche.className = 'recherche-emprunt';

    const inputRecherche = document.createElement('input');
    inputRecherche.type = 'text';
    inputRecherche.id = 'rechercheEmpruntInput';
    inputRecherche.placeholder = 'Code du livre';

    inputRecherche.addEventListener('input', () => {
        const valeurRecherche = inputRecherche.value.trim();
        if (valeurRecherche === '') {
            chargerTousLesEmprunts(conteneur);
        } else {
            rechercherEmprunts(valeurRecherche, conteneur);
        }
    });

    divRecherche.appendChild(inputRecherche);
    conteneur.appendChild(divRecherche);

    chargerTousLesEmprunts(conteneur);
}

function chargerTousLesEmprunts(conteneur) {
    fetch('http://localhost:8000/api/emprunt/admin')
        .then(response => {
            if (!response.ok) throw new Error('Erreur recherche');
            return response.json();
        })
        .then(emprunts => {
            afficherTableauEmprunts(emprunts, conteneur);
        })
        .catch(err => {
            console.error('Erreur chargement des emprunts admin:', err);
            conteneur.innerHTML += '<p class="erreur">Erreur lors du chargement des emprunts.</p>';
        });
}

function rechercherEmprunts(search, conteneur) {
    fetch(`http://localhost:8000/api/emprunt/recherche?search=${encodeURIComponent(search)}`)
        .then(response => {
            if (!response.ok) throw new Error('Erreur recherche');
            return response.json();
        })
        .then(emprunts => {
            afficherTableauEmprunts(emprunts, conteneur);
        })
        .catch(err => {
            console.error('Erreur lors de la recherche:', err);
            conteneur.innerHTML += '<p class="erreur">Erreur lors de la recherche</p>';
        });
}

function afficherTableauEmprunts(emprunts, conteneur) {
    const ancienTableau = conteneur.querySelector('table');
    if (ancienTableau) ancienTableau.remove();

    const table = document.createElement('table');
    table.className = 'table-emprunt';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Utilisateur</th>
                <th>Code livre</th>
                <th>Titre du livre</th>
                <th>Date d'emprunt</th>
                <th>Date limite</th>
                <th>Date de retour</th>
                <th>Statut</th>
                <th>Retour</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');
    emprunts.forEach(emprunt => {
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
            <td>${emprunt.prenom_utilisateur} ${emprunt.nom_utilisateur}</td>
            <td>${emprunt.code_livre}</td>
            <td>${emprunt.titre}</td>
            <td>${formatDate(emprunt.date_emprunt)}</td>
            <td>${formatDate(emprunt.date_limite)}</td>
            <td>${emprunt.date_retour ? formatDate(emprunt.date_retour) : '-'}</td>
            <td class="statut ${statut.toLowerCase().replace(' ', '-')}">${statut}</td>
            <td>
                ${!emprunt.date_retour
                    ? `<button class="btn-retour" onclick="retournerLivre(${emprunt.id_emprunt})">Retourner</button>`
                    : ''}
            </td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    conteneur.appendChild(table);
}

function retournerLivre(idEmprunt) {
    if (!confirm("Confirmez-vous le retour de ce livre ?")) return;

    fetch("http://localhost:8000/api/retour/emprunt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_emprunt: idEmprunt })
    })
    .then(async response => {
        const result = await response.json();
        if (!response.ok) {
            alert(result.message || "Erreur lors du retour");
            throw new Error(result.message);
        }
        alert(result.message || "Livre retourné !");
        displayEmpruntAdmin(); 
    })
    .catch(error => {
        console.error("Erreur:", error);
    });
}