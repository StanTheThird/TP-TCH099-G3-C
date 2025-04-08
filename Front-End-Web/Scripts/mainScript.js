document.addEventListener("DOMContentLoaded", () => {
    SetUpNavigation();
    const nomPage = document.title;
    if(nomPage == "BiblioSmart"){
        console.log("Page Principale");
        const url = new URL(window.location.href);
        const id = new URLSearchParams(url.search).get("id");
        populateFiltres();
    } else if (nomPage == 'Connexion') {
        console.log("Page Connexion");
        SetupLogin();
    } else if (nomPage == 'Enregistrement') {
        console.log("Page Enregistrement");
        SetUpRegister();
    } else if (nomPage == 'Admin') {
        console.log("Page Admin");
        displayAllBooks();
    } else if (nomPage == 'InfoLivre') {
        console.log("Page InfoLivre");
        SetUpLivreInfo();
    }   else {
        console.log('Rien à faire.');
    }
});


//Connexion
function SetupLogin() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async event => {
        event.preventDefault();
    
        try {
            // On récupère le data du form html
            const formData = new FormData(loginForm);

            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });

            // First get the response as text
            const responseText = await response.text();
            
            // Debug: log the raw response
            console.log('Raw server response:', responseText);
            
            // Try to parse as JSON
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
    
            // On récupère les informations utilisateur pour pouvoir rester connecté et accèdé au informations du compte
            // Et on renvoie l'utilisateur a l'accueil
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
//Inscription
function SetUpRegister() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async event => {
        event.preventDefault();

        //Vérif mot de passe
        const motDePasse = registerForm.mot_de_passe.value;
        const confirmation = registerForm.confirmation_mot_de_passe.value;
        
        if (motDePasse !== confirmation) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        
        try {
            // On récupère le data du form html
            const formData = new FormData(registerForm);

            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                //On envoie le form en json, car nous savons que le form html utilise les bon noms
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de l'inscription");
            }

            const responseData = await response.json();
            console.log('Inscription réussie:', responseData.user);
    
            // On stocke les informations utilisateur dans le localStorage
            // Et on redirige vers la page d'accueil
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


// Récupère les livres et initialise les filtres
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

const typeDeFiltre = ["Categorie", "Langue"];

// Crée les éléments de filtre dans le DOM
function createFiltre(livres) {
    const filtre = document.getElementById('filtres'); // Conteneur des filtres
    
    // Crée les filtres pour catégorie et langue
    typeDeFiltre.forEach((type, index) => {
        const label = document.createElement('label');
        label.textContent = type;
        label.htmlFor = `filtre-${type}`;
        
        const select = document.createElement('select');
        select.id = type;
        select.className = 'option';
        select.addEventListener('change', filtrerFromOptions);
        
        // Option par défaut "Tous"
        select.innerHTML = `<option value="Tous" selected>Tous</option>`;
        
        // Ajoute les options uniques
        const options = new Set(livres.map(livre => index === 0 ? livre.categorie : livre.langue));
        options.forEach(value => {
            if (value) select.innerHTML += `<option value="${value}">${value}</option>`;
        });
        
        filtre.append(label, select);
    });

    // Champ de recherche
    const recherche = document.createElement('label');
    recherche.textContent = " 🔎 "; // Symbole de recherche
    recherche.htmlFor = "rechercheLivre";
    recherche.id="symbole";
    
    const champRecherche = document.createElement('input');
    champRecherche.type = "text";
    champRecherche.id = "rechercheLivre";
    champRecherche.placeholder = "Entrez un titre/auteur...";
    champRecherche.className = "champ-recherche";
    champRecherche.addEventListener('input', filtrerFromOptions);
    
    filtre.append(recherche, champRecherche);
}

// Applique les filtres sélectionnés
function filtrerFromOptions() {
    const selects = document.getElementsByClassName("option");
    displayFilteredBooks({
        categorie: selects[0]?.value || "Tous",
        langue: selects[1]?.value || "Tous",
        titre: document.getElementById("rechercheLivre")?.value.trim() || ""
    });
}

// Affiche les livres filtrés
async function displayFilteredBooks(filters) {
    const url = filters.titre
        ? `http://localhost:8000/api/recherche/livre?search=${filters.titre}`
        : `http://localhost:8000/api/livre/filter?Categorie=${filters.categorie}&Langue=${filters.langue}`;
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

// Réinitialise les filtres
function setDefaultValues() {
    document.querySelectorAll(".option").forEach(select => select.value = 'Tous');
}

// Crée un élément livre pour l'affichage
// Crée un élément livre pour l'affichage
function addLivre(livre) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');

    const livreDiv = document.createElement('div');
    livreDiv.className = 'livre';
    
    // Redirection quand on clique sur le bloc
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

        // Empêche la redirection si on clique sur le bouton
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

// Nouvelle fonction pour gérer la redirection
function redirectToLivreInfo(livreJSON) {
    sessionStorage.setItem('livreSelectionne', decodeURIComponent(livreJSON));
    window.location.href = "livreInfo.html";
}


function SetUpLivreInfo() {
    // Récupérer les données du livre depuis le localStorage
    const livreData = JSON.parse(sessionStorage.getItem('livreSelectionne'));
    
    if (!livreData) {
        alert("Aucun livre sélectionné !");
        window.location.href = "accueil.html"; // Rediriger vers la page principale
        return;
    }

    // Remplir la page avec les données du livre
    document.getElementById('livre-titre').textContent = livreData.titre;
    document.getElementById('livre-image').src = livreData.image || 'placeholder.jpg';
    
    const infosList = document.getElementById('livre-infos');
    infosList.innerHTML = ''; // Vider la liste avant de la remplir
    
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

    // Gérer le bouton d'emprunt
    const btnEmprunt = document.getElementById('btn-emprunt');
    if (livreData.deja_emprunter) {
        btnEmprunt.disabled = true;
        btnEmprunt.textContent = "Déjà emprunté";
        //btnEmprunt.style.background = "gray";
    } else {
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
}

// Gère l'emprunt d'un livre
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
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                livre_id: livreId, 
                utilisateur_id: user.id
            })
        });
        
        if (!response.ok) throw new Error((await response.json()).error);
        
        if (bouton) {
            bouton.disabled = true;
            bouton.textContent = "Déjà emprunté";
            bouton.style.background = "gray";
        }
        
        alert("Emprunt réussi !");
        
        // Mise à jour en temps réel si sur la page InfoLivre
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
    nav.innerHTML = ''; // Vide le menu avant reconstruction

    // Récupère les données utilisateur depuis le localStorage
    const userData = localStorage.getItem('user');
    const isConnected = userData !== null; // Vérifie si un utilisateur est connecté

    // Fonction pour créer un élément de menu
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

    // Menu pour utilisateur connecté
    if (isConnected) {
        const user = JSON.parse(userData);
        
        // Accueil
        nav.appendChild(createMenuItem('Accueil', 'accueil.html'));
        
        // Nom d'utilisateur (non cliquable)
        nav.appendChild(createMenuItem(user.nom_utilisateur));
        
        // Historique
        nav.appendChild(createMenuItem('Historique', 'historique.html'));
        
        // Déconnexion
        nav.appendChild(createMenuItem('Déconnexion', 'accueil.html', () => {
            localStorage.removeItem('user'); // Supprime seulement les données utilisateur
            SetUpNavigation(); // Met à jour le menu
        }));

        if(user.type == 1){
            nav.appendChild(createMenuItem('Administration', 'admin.html'));
        }
    } 
    // Menu pour visiteur non connecté
    else {
        nav.appendChild(createMenuItem('Accueil', 'accueil.html'));
        nav.appendChild(createMenuItem('Connexion', 'connexion.html'));
        nav.appendChild(createMenuItem('Enregistrement', 'enregistrement.html'));
    }
}