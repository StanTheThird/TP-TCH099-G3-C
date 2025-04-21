document.addEventListener("DOMContentLoaded", () => {
    SetUpNavigation();
    const nomPage = document.title;
    if(nomPage == "BiblioSmart"){
        console.log("Page Principale");
        const url = new URL(window.location.href);
        const id = new URLSearchParams(url.search).get("id");
        populateFiltres();
        sessionStorage.removeItem('admin');
    } else if (nomPage == 'Connexion') {
        console.log("Page Connexion");
        SetupLogin();
    } else if (nomPage == "Enregistrement") {
        console.log("Page Enregistrement");
        SetUpRegister();
    } else if (nomPage == "Admin") {
        console.log("Page Admin");
        displayAllBooks();
        setUpModalAjoutLivre();
    } else if (nomPage == "AdminEmprunt"){
        console.log("Page Emprunt (côté Admin)");
        displayEmpruntAdmin();
    } else if (nomPage == 'InfoLivre') {
        console.log("Page InfoLivre");
        SetUpLivreInfo();
    } else if (nomPage == "Historique") {
        console.log("Page Historique");
        ShowHistorique();
    } else {
        console.log("Rien à faire.");
    }
});

function SetupLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            const formData = new FormData(loginForm);
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            const responseText = await response.text();
            console.log('Raw server response:', responseText);
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                throw new Error("Invalid server response format");
            }
            if (!response.ok) {
                throw new Error(responseData.error || "Échec de la connexion");
            }
            console.log('Connexion réussie :', responseData.user);
            if (responseData.user) {
                localStorage.setItem('user', JSON.stringify(responseData.user));
                window.location.href = 'accueil.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || "Échec de la connexion");
        }
    });
}

function SetUpRegister() {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async event => {
        event.preventDefault();
        const motDePasse = registerForm.mot_de_passe.value;
        const confirmation = registerForm.confirmation_mot_de_passe.value;
        if (motDePasse !== confirmation) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        try {
            const formData = new FormData(registerForm);
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de l'inscription");
            }
            const responseData = await response.json();
            console.log('Inscription réussie:', responseData.user);
            if (responseData.user) {
                localStorage.setItem('user', JSON.stringify(responseData.user));
                window.location.href = 'accueil.html';
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || "Échec de l'inscription");
        }
    });
}

async function populateFiltres() {
    try {
        const response = await fetch(`http://localhost:8000/api/livre`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des livres');
        const data = await response.json();
        createFiltre(data);
        setDefaultValues();
        filtrerFromOptions();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

const typeDeFiltre = ["Categorie", "Langue", "Origine"];
function createFiltre(livres) {
    const filtre = document.getElementById('filtres');
    typeDeFiltre.forEach((type, index) => {
        const label = document.createElement('label');
        label.textContent = type;
        label.htmlFor = `filtre-${type}`;
        const select = document.createElement('select');
        select.id = type;
        select.className = 'option';
        select.addEventListener('change', filtrerFromOptions);
        select.innerHTML = `<option value="Tous" selected>Tous</option>`;
    
        const options = new Set(livres.map(livre => 
            index === 0 ? livre.categorie : 
            index === 1 ? livre.langue : 
            livre.nationalite_auteur
        ));
        options.forEach(value => {
            if (value) select.innerHTML += `<option value="${value}">${value}</option>`;
        });
        filtre.append(label, select);
    });
    const recherche = document.createElement('label');
    recherche.textContent = " 🔎 ";
    recherche.htmlFor = "rechercheLivre";
    recherche.id = "symbole";
    const champRecherche = document.createElement('input');
    champRecherche.type = "text";
    champRecherche.id = "rechercheLivre";
    champRecherche.placeholder = "Entrez un titre/auteur...";
    champRecherche.className = "champ-recherche";
    champRecherche.addEventListener('input', filtrerFromOptions);
    filtre.append(recherche, champRecherche);

     //Ajout des 2 boutons pour l'affichage
     const conteneurBouton = document.createElement('div');
     conteneurBouton.className= 'affichage-boutons';
 
     //bouton pour afficher les livres en grille
     const btnGrille = document.createElement('button');
     btnGrille.textContent = 'Grille';
     btnGrille.className = 'btn-affichage';
     btnGrille.addEventListener('click', () => changerAffichage('grille'));
 
     //Bouton pour afficher les livres en liste 
     const btnListe = document.createElement('button');
     btnListe.textContent = 'Liste';
     btnListe.className = 'btn-affichage';
     btnListe.addEventListener('click' , () => changerAffichage('liste'));
 
     conteneurBouton.appendChild(btnGrille);
     conteneurBouton.appendChild(btnListe);
 
     filtre.appendChild(conteneurBouton);
 
 
}

function filtrerFromOptions() {
    const selects = document.getElementsByClassName("option");
    displayFilteredBooks({
        categorie: selects[0]?.value || "Tous",
        langue: selects[1]?.value || "Tous",
        origine: selects[2]?.value || "Tous",
        titre: document.getElementById("rechercheLivre")?.value.trim() || ""
    });
}

async function displayFilteredBooks(filters) {
    const params = new URLSearchParams();
    if (filters.titre) params.append('search', filters.titre);
    if (filters.categorie && filters.categorie !== "Tous") params.append('Categorie', filters.categorie);
    if (filters.langue && filters.langue !== "Tous") params.append('Langue', filters.langue);
    if (filters.origine && filters.origine !== "Tous") params.append('Origine', filters.origine);
    const url = `http://localhost:8000/api/livre/recherche-filtre?${params.toString()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erreur lors de la récupération des livres');
        const livres = await response.json();
        const conteneur = document.getElementById("conteneur_livres");
        conteneur.innerHTML = '';
        livres.forEach(addLivre);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function setDefaultValues() {
    document.querySelectorAll(".option").forEach(select => select.value = 'Tous');
}

function addLivre(livre) {
    const mode = localStorage.getItem('modeAffichage') || 'grille';
    const conteneur = document.getElementById("conteneur_livres"); 

    if(mode == 'grille'){
        const carte = createAdminLivre(livre); 
        conteneur.appendChild(carte);
    } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        const livreDiv = document.createElement('div');
        livreDiv.className = 'livre';
        livreDiv.addEventListener('click', () => {
            sessionStorage.setItem('livreSelectionne', JSON.stringify(livre));
            window.location.href = "livreInfo.html";
        });
        const infoDiv = document.createElement('div');
        infoDiv.className = 'livreInfo';
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image';
        imageDiv.innerHTML = `<img src="${livre.image || 'placeholder.jpg'}" alt="${livre.titre || 'Couverture'}">`;
        const descDiv = document.createElement('div');
        descDiv.className = 'desc';
        descDiv.innerHTML = `
            <h1>${livre.titre}</h1>
            <ul>
                ${livre.description ? `<li>${livre.description}</li>` : ''}
                ${livre.categorie ? `<li>Catégorie: ${livre.categorie}</li>` : ''}
                ${livre.langue ? `<li>Langue: ${livre.langue}</li>` : ''}
                ${livre.date_parution ? `<li>Date de parution: ${livre.date_parution}</li>` : ''}
                ${livre.nom_auteur && livre.prenom_auteur ? `<li>Auteur: ${livre.prenom_auteur} ${livre.nom_auteur}</li>` : ''}
            </ul>
        `;
        const btn = document.createElement('button');
        btn.className = 'btn-emprunt';
        if (livre.deja_emprunter) {
            btn.disabled = true;
            btn.textContent = "Déjà emprunté";
            btn.style.background = "gray";
        } else {
            btn.textContent = "Emprunter";
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                emprunter(livre.id_livre, btn);
            });
        }
        descDiv.appendChild(btn);
        infoDiv.appendChild(imageDiv);
        infoDiv.appendChild(descDiv);
        livreDiv.appendChild(infoDiv);
        cell.appendChild(livreDiv);
        row.appendChild(cell);
        document.getElementById("conteneur_livres").appendChild(row);
    }
}

function redirectToLivreInfo(livreJSON) {
    sessionStorage.setItem('livreSelectionne', decodeURIComponent(livreJSON));
    window.location.href = "livreInfo.html";
}

function SetUpLivreInfo() {
    const livreData = JSON.parse(sessionStorage.getItem('livreSelectionne'));
    if (!livreData) {
        alert("Aucun livre sélectionné !");
        window.location.href = "accueil.html";
        return;
    }
    document.getElementById('livre-titre').textContent = livreData.titre;
    document.getElementById('livre-image').src = livreData.image || 'placeholder.jpg';
    const infosList = document.getElementById('livre-infos');
    infosList.innerHTML = '';
    const addInfo = (label, value) => {
        if (value) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${label}:</strong> ${value}`;
            infosList.appendChild(li);
        }
    };
    addInfo('Description', livreData.description);
    addInfo('Catégorie', livreData.categorie);
    addInfo('Langue', livreData.langue);
    addInfo('Date de parution', livreData.date_parution);
    if (livreData.nom_auteur && livreData.prenom_auteur) {
        addInfo('Auteur', `${livreData.prenom_auteur} ${livreData.nom_auteur}`);
    }
// Gérer le bouton d'emprunt ET DE SUPPRESION
const conteneurBtn = document.getElementById('conteneur-btn');
conteneurBtn.innerHTML = '';

// Si admin : bouton SUPPRIMER
if (sessionStorage.getItem('admin') === 'true') {
    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = "Supprimer ce livre";
    btnSupprimer.className = "btn-supprimer";

    btnSupprimer.addEventListener('click', async () => {
        if (!confirm(`Confirmer la suppression de "${livreData.titre}" ?`)) return;

        try {
            const response = await fetch(`http://localhost:8000/api/supprimer/livre/${livreData.id_livre}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            alert("Livre supprimé avec succès !");
            window.location.href = "admin.html";
        } catch (error) {
            alert("Erreur : " + error.message);
        }
    });
    conteneurBtn.appendChild(btnSupprimer);
} else {       // Sinon : bouton EMPRUNTER
    const btnEmprunt = document.createElement('button');
    btnEmprunt.className = 'btn-emprunt';
    
    if (livreData.deja_emprunter) {
        btnEmprunt.disabled = true;
        btnEmprunt.textContent = "Déjà emprunté";
        btnEmprunt.style.background = "gray";
    } else {
        btnEmprunt.textContent = "Emprunter";
        btnEmprunt.addEventListener('click', () => {
            if (!localStorage.getItem('user')) {
                alert("Veuillez vous connecter pour emprunter ce livre !");
                return;
            }
            if (confirm(`Voulez-vous emprunter "${livreData.titre}" ?`)) {
                emprunter(livreData.id_livre, btnEmprunt);
            }
        });
    }
    conteneurBtn.appendChild(btnEmprunt);
}

}

async function emprunter(livreId, bouton, event = null) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (!localStorage.getItem('user')) {
        alert("Veuillez vous connecter !");
        return;
    }
    if (!confirm("Confirmez l'emprunt ?")) return;
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch("http://localhost:8000/api/emprunt/livre", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ livre_id: livreId, utilisateur_id: user.id })
        });
        if (!response.ok) throw new Error((await response.json()).error);
        if (bouton) {
            bouton.disabled = true;
            bouton.textContent = "Déjà emprunté";
            bouton.style.background = "gray";
        }
        alert("Emprunt réussi !");
        if (document.title == 'InfoLivre') {
            const livreData = JSON.parse(sessionStorage.getItem('livreSelectionne'));
            livreData.deja_emprunter = true;
            sessionStorage.setItem('livreSelectionne', JSON.stringify(livreData));
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur: " + error.message);
    }
}

function SetUpNavigation() {
    const nav = document.getElementById('navigation');
    nav.innerHTML = '';
    const menuButton = document.querySelector('.btn-menu a');
    const userData = localStorage.getItem('user');
    const isConnected = userData !== null;
    if (isConnected) {
        const user = JSON.parse(userData);
        menuButton.innerHTML = `<img src="/Front-End-Web/ressources/menu.jpg" alt="logo-menu" width="40" height="30"> ${user.nom_utilisateur}`;
    } else {
        menuButton.innerHTML = `<img src="/Front-End-Web/ressources/menu.jpg" alt="logo-menu" width="40" height="30"> Menu`;
    }
    const createMenuItem = (text, href = '#', onClick = null) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = text;
        if (href !== '#') {
            a.href = '/Front-End-Web/html/' + href;
        }
        if (onClick) {
            a.addEventListener('click', onClick);
        }
        li.appendChild(a);
        return li;
    };
    nav.appendChild(createMenuItem('Accueil', 'accueil.html'));
    if (isConnected) {
        const user = JSON.parse(userData);
        nav.appendChild(createMenuItem('Historique', 'historique.html'));
        nav.appendChild(createMenuItem('Déconnexion', 'accueil.html', () => {
            localStorage.removeItem('user');
            SetUpNavigation();
        }));
        if (user.type == 1) {
            nav.appendChild(createMenuItem('Administration', 'admin.html'));
        }
    } else {
        nav.appendChild(createMenuItem('Connexion', 'connexion.html'));
        nav.appendChild(createMenuItem('Enregistrement', 'enregistrement.html'));
    }
}
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

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA');
}


// création des éléments pour la bar des "filtres" + affiche tous les livres
function displayAllBooks() {
    const filtreContainer = document.getElementById("admin");

    const titre = filtreContainer.querySelector('h1');
    filtreContainer.innerHTML = '';
    // Pour garder le titre "Administrateur"
    if (titre) filtreContainer.appendChild(titre);

    // Créer bar pour barre de recherche + le bouton pour ajouter un livre
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

    // création du bouton pour ajouter un livre
    const boutonAjout = document.createElement('button');
    boutonAjout.textContent = "+ Livre";
    boutonAjout.className = 'btn-ajout-livre';
    // boutonAjout.addEventListener('click', () => {
    //     const modal = document.getElementById('addLivreModal');
    //     if (modal) {
    //         modal.style.display = 'flex'; // Affiche la modal (voir CSS)
    //     }
    // });

    // Ajoute tout dans la barre de "filtre"
    bar.append(rechercheLabel, champRecherche, boutonAjout);
    filtreContainer.appendChild(bar);

    // Récupere tous les livres
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
            const conteneur = document.getElementById( "conteneur_livres_admin");
            conteneur.innerHTML = '';
            books.forEach(livre => {
                    conteneur.appendChild(createAdminLivre(livre));
            });
        })
        .catch(error => {
            console.error("erreur recherche: ", error);
        });
}

// Créeation des "cartes" pour les livres (côté admin)
function createAdminLivre(livre) {
    // Création de la carte qui va représenter le livre 
    const carteLivre = document.createElement('div');
    carteLivre.className = 'admin-livre-carte';

    const image = document.createElement('img');
    image.src = livre.image;
    image.alt = livre.titre;

    const titre = document.createElement('h3');
    titre.textContent = livre.titre;

    carteLivre.appendChild(image);
    carteLivre.appendChild(titre);

    // Au clic on va à la page livre info
    carteLivre.addEventListener('click', () => {
        sessionStorage.setItem('livreSelectionne', JSON.stringify(livre));
        sessionStorage.setItem('admin', 'true');
        window.location.href = "livreInfo.html";
    });

    return carteLivre;
}

// Fenêtre du formulaire pour ajouter un livre
function setUpModalAjoutLivre(){
    const modal = document.getElementById('addLivreModal');
    const btnAnnuler = document.getElementById('btnAnnuler');
    const formulaire = document.getElementById('formulaire');

    // Ouvre le modal avec le bouton ajout
    const boutonAjout = document.querySelector('.btn-ajout-livre');
    if (boutonAjout && modal) {
        boutonAjout.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // bouton annuler
    if (btnAnnuler) {
        btnAnnuler.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Soumission du formulaire
    if (formulaire) {
        formulaire.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Les données rentrées
            const data = {
                image: document.getElementById('image').value,
                titre: document.getElementById('titre').value,
                description: document.getElementById('description').value,
                date_parution: document.getElementById('dateParution').value,
                auteur_id: 1,                   // À CHANGER
                langue_id: 1,                   // À CHANGER
                categorie_id: 1                 // À CHANGER
            };
            // Ajouter le livre
            try {
                const response = await fetch('http://localhost:8000/api/ajout/livre', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'
                    },
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

// function displayEmpruntAdmin(){
//     const conteneur = document.querySelector('.conteneurEmprunt');
//     conteneur.innerHTML = '';

//     fetch('http://localhost:8000/api/emprunt/admin')
//         .then(response => {
//             if (!response.ok) throw new Error('Erreur recherche');
//             return response.json();
//         })
//         .then(emprunts => {
//             if (emprunts.length === 0) {
//             conteneur.innerHTML ='<p class="aucun-emprunt">Aucun emprunt trouvé !</p>';
//             return;
//         }
//         const table = document.createElement('table');
//         table.className = 'table-emprunt';
//         const thread = document.createElement('thread');
//         table.innerHTML = `
//             <tr>
//                 <th>Utilisateur</th>
//                 <th>Titre du livre</th>
//                 <th>Date d'emprunt</th>
//                 <th>Date limite</th>
//                 <th>Date de retour</th>
//                 <th>Statut</th>
//                 <th>Retour</th>
//             </tr>
//             `;
//             table.appendChild(thread);
//             const tbody = document.createElement('tbody');
//             emprunts.forEach(emprunt => {
//                 const row = document.createElement('tr');
//                 let statut = '';
//                 if (emprunt.date_retour) {
//                     statut = 'Retourné';
//                 } else {
//                     const today = new Date();
//                     const dateLimite = new Date(emprunt.date_limite);
//                     statut = today > dateLimite ? 'En retard' : 'En cours';
//                 }
//                 row.innerHTML = `
//                 <td>${emprunt.prenom_utilisateur} ${emprunt.nom_utilisateur}</td>
//                 <td>${emprunt.titre}</td>
//                 <td>${formatDate(emprunt.date_emprunt)}</td>
//                 <td>${formatDate(emprunt.date_limite)}</td>
//                 <td>${emprunt.date_retour ? formatDate(emprunt.date_retour) : '-'}</td>
//                 <td class="statut ${statut.toLowerCase().replace(' ', '-')}">${statut}</td>
//                 <td>
//                     ${!emprunt.date_retour
//                         ? `<button class="btn-retour" onclick="retournerLivre(${emprunt.id_emprunt})">Retourner</button>`
//                         : ''}
//                 </td>
//             `;
//             tbody.appendChild(row);
//         });

//         table.appendChild(tbody);
//         conteneur.appendChild(table);
//     })
//     .catch(err => {
//         console.error('Erreur chargement des emprunts admin:', err);
//         conteneur.innerHTML = '<p class="erreur">Erreur lors du chargement des emprunts.</p>';
//     });
// }
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

    if (emprunts.length === 0) {
        conteneur.innerHTML += '<p class="aucun-emprunt">Aucun emprunt trouvé !</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table-emprunt';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Utilisateur</th>
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

function changerAffichage(mode){
    localStorage.setItem('modeAffichage', mode);
    filtrerFromOptions();
}

