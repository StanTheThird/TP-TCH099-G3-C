// Variable globale pour conserver la référence à l'input
let searchInput = null;

function displayBooks(search = '') {
    const filtreContainer = document.getElementById("admin");
    const conteneurLivres = document.getElementById("conteneur_livres_admin");
    
    // On ne recrée la barre d'administration que si elle n'existe pas déjà
    if (!document.querySelector('.admin-bar')) {
        const titre = filtreContainer.querySelector('h1');
        filtreContainer.innerHTML = '';
        if (titre) filtreContainer.appendChild(titre);

        const bar = document.createElement('div');
        bar.className = 'admin-bar';

        const rechercheLabel = document.createElement('label');
        rechercheLabel.textContent = " 🔎 ";
        rechercheLabel.setAttribute('for', 'rechercheLivre');

        searchInput = document.createElement('input'); // On stocke la référence
        searchInput.type = "text";
        searchInput.id = "rechercheLivre";
        searchInput.placeholder = "Entrez un titre ou un auteur...";
        searchInput.className = "champ-recherche";
        searchInput.value = search; // On pré-remplit avec la valeur actuelle
        
        // Utilisation d'un debouncer pour éviter des appels trop fréquents
        let timeout = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = e.target.value.trim();
                loadBooks(searchTerm);
            }, 300);
        });

        const boutonAjout = document.createElement('button');
        boutonAjout.textContent = "+ Livre";
        boutonAjout.className = 'btn-ajout-livre';

        const boutonAdmin = document.createElement('button');
        boutonAdmin.textContent = "+ Admin";
        boutonAdmin.className = "btn-ajouter-admin";
        boutonAdmin.addEventListener('click', () => {
            window.location.href = 'createAdmin.html';
        });

        const boutonEmprunt = document.createElement('button');
        boutonEmprunt.textContent = "Gérer les emprunts";
        boutonEmprunt.className = "btn-gerer-emprunt";
        boutonEmprunt.addEventListener('click', () => {
            window.location.href = 'adminEmprunt.html';
        });

        bar.append(rechercheLabel, searchInput, boutonAjout, boutonAdmin, boutonEmprunt);
        filtreContainer.appendChild(bar);
    } else if (searchInput) {
        // Si la barre existe déjà, on met juste à jour la valeur
        searchInput.value = search;
    }

    loadBooks(search);
}

function loadBooks(search = '') {
    const apiUrl = search 
        ? `http://localhost:8000/api/livre/admin-search?search=${encodeURIComponent(search)}`
        : 'http://localhost:8000/api/livre/admin-search';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const conteneur = document.getElementById("conteneur_livres_admin");
            conteneur.innerHTML = '';
            
            const books = Array.isArray(data) ? data : [];
            
            if (books.length === 0) {
                conteneur.innerHTML = '<p class="no-books">Aucun livre trouvé</p>';
                return;
            }
            
            books.forEach(livre => {
                conteneur.appendChild(createAdminLivre(livre));
            });
        })
        .catch(error => {
            console.error("Erreur:", error);
            const conteneur = document.getElementById("conteneur_livres_admin");
            conteneur.innerHTML = `<p class="error">Erreur lors du chargement: ${error.message}</p>`;
        });
}

// Keep all other functions unchanged (createAdminLivre, setUpModalAjoutLivre, etc.)

function createAdminLivre(livre) {
    const carteLivre = document.createElement('div');
    carteLivre.className = 'admin-livre-carte';

    if (livre.emprunte) {
        carteLivre.classList.add('livre-emprunte');
        
        const badge = document.createElement('div');
        badge.className = 'badge-emprunte';
        badge.textContent = 'Emprunté';
        carteLivre.appendChild(badge);
    }

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
                displayBooks();
            } catch (error) {
                alert("erreur : " + error.message);
            }
        });
    }
}

function displayEmpruntAdmin() {
    const conteneur = document.querySelector('.conteneurEmprunt');
    conteneur.innerHTML = '';

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'emprunt-controls';

    // Barre de recherche
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

    // Menu déroulant pour le tri
    const sortSelect = document.createElement('select');
    sortSelect.id = 'sortEmprunts';
    sortSelect.className = 'sort-select';
    
    const options = [
        { value: 'date_desc', text: 'Date emprunt(récent → ancien)' },
        { value: 'date_asc', text: 'Date emprunt(ancien → récent)' },
        { value: 'nom_asc', text: 'Utilisateur (A → Z)' },
        { value: 'nom_desc', text: 'Utilisateur (Z → A)' },
        { value: 'code_asc', text: 'Code livre (A → Z)' },
        { value: 'code_desc', text: 'Code livre (Z → A)' }
    ];
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        sortSelect.appendChild(optionElement);
    });

    sortSelect.addEventListener('change', () => {
        chargerTousLesEmprunts(conteneur, sortSelect.value);
    });

    divRecherche.appendChild(inputRecherche);
    
    const sortDiv = document.createElement('div');
    sortDiv.className = 'sort-emprunt';
    const sortLabel = document.createElement('label');
    sortLabel.textContent = 'Trier par: ';
    sortLabel.htmlFor = 'sortEmprunts';
    sortDiv.appendChild(sortLabel);
    sortDiv.appendChild(sortSelect);

    controlsDiv.appendChild(divRecherche);
    controlsDiv.appendChild(sortDiv);
    conteneur.appendChild(controlsDiv);
    chargerTousLesEmprunts(conteneur, 'date_desc');
}

function chargerTousLesEmprunts(conteneur, sortBy = 'date_desc') {
    fetch(`http://localhost:8000/api/emprunt/admin?sort=${sortBy}`)
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

function rechercherEmprunts(search, conteneur, sortBy = 'date_desc') {
    fetch(`http://localhost:8000/api/emprunt/recherche?search=${encodeURIComponent(search)}&sort=${sortBy}`)
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

function createAdmin() {
    const adminForm = document.getElementById('adminForm');
    if (!adminForm) return;

    adminForm.addEventListener('submit', async event => {
        event.preventDefault();
        const motDePasse = adminForm.mot_de_passe.value;
        const confirmation = adminForm.confirmation_mot_de_passe.value;
        
        if (motDePasse !== confirmation) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }

        try {
            const formData = new FormData(adminForm);
            const adminData = Object.fromEntries(formData.entries());
            // Forcer le type à 1 (administrateur)
            adminData.type = 1;

            // Vérifier si l'utilisateur actuel est admin
            const userData = localStorage.getItem('user');
            if (!userData) {
                throw new Error("Accès non autorisé");
            }
            const user = JSON.parse(userData);
            if (user.type !== 1) {
                throw new Error("Seuls les administrateurs peuvent créer des comptes admin");
            }

            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la création de l'administrateur");
            }

            const responseData = await response.json();
            alert("Administrateur créé avec succès !");
            adminForm.reset();
            
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || "Échec de la création de l'administrateur");
        }
    });
}