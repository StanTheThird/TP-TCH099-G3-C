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

    } else {
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


function populateFiltres() {
    fetch(`http://localhost:8000/api/livre`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des livres');
            }
            return response.json();
        })
        .then(data => {
            createFiltre(data);
            setDefaultValues();
            filtrerFromOptions();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des livres :', error);
        });
}

const typeDeFiltre = ["Categorie", "Langue"];
function createFiltre(livres){
    const filtre = document.getElementById('filtres'); //On cherche pour les emplacement de filtres
    for (let i = 0; i < typeDeFiltre.length; i++) {
        const label = document.createElement('label'); //Cree le label
        label.textContent = typeDeFiltre[i];
        label.setAttribute('for', 'filtre-' + typeDeFiltre[i]);
        filtre.appendChild(label); //On peut append le label, car on n'as plus de modification a faire dessus.
        const select = document.createElement('select'); //Cree le select
        select.id = typeDeFiltre[i];
        select.name = typeDeFiltre[i];
        select.setAttribute('for', 'filtre-' + typeDeFiltre[i]);
        select.className = 'option';
        //On add un event listener sur les filtres
        select.addEventListener('change', () => {
            filtrerFromOptions();
        });
        //On cree l'option tous en premier
        const optTous = document.createElement('option');
        optTous.value = "Tous";
        optTous.text = "Tous";
        optTous.selected = true;
        select.appendChild(optTous);
        let dejaAjouter = [];

        livres.forEach((livre) => {
            let textTest;
            switch (i) {
                case 0:
                    textTest = livre.categorie;
                    break;
                case 1:
                    textTest = livre.langue;
                    break;
            }
            if (!dejaAjouter.includes(textTest)) {                                              //Tristan du futur. tu doit modifier cette partie  et la remplacer par un UniqueSet = new Set(). Le tout devrait être plus efficace. 
                const opt = document.createElement('option');
                opt.value = textTest;
                opt.text = textTest;
                dejaAjouter.push(textTest);
                select.appendChild(opt);
            }

        });

        filtre.appendChild(select);
    }

    // Filtre pour la recherche
    const recherche = document.createElement('label');
    recherche.textContent = " 🔎 ";                                 // à changer pour un autre symbole (à trouver)
    recherche.setAttribute('for', 'rechercheLivre');
    filtre.appendChild(recherche);

    const champRecherche = document.createElement('input');
    champRecherche.type = "text";
    champRecherche.id = "rechercheLivre";
    champRecherche.placeholder = "Entrez un titre/auteur...";
    champRecherche.className = "champ-recherche";

    champRecherche.addEventListener('input', () =>{
        filtrerFromOptions();
    });

    filtre.appendChild(champRecherche);

}

function filtrerFromOptions() {
    const selectList = document.getElementsByClassName("option");
    const rechercheTitre = document.getElementById("rechercheLivre")?.value || ""; 

    const filters =
    {
        categorie: selectList[0].value,
        langue: selectList[1].value,
        titre: rechercheTitre.trim()

    };
    displayFilteredBooks(filters);
}

function displayFilteredBooks(filters) {
    let url = "";
    if (filters.titre && filters.titre.trim() !== ""){
        url = `http://localhost:8000/api/recherche/livre?search=${filters.titre}`
    } else {
        url = `http://localhost:8000/api/livre/filter?Categorie=${filters.categorie}&Langue=${filters.langue}`
    }
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des livres');
            }
            return response.json();
        }) 
        .then(data => {
            let livres;
            livres = data;
            let conteneur = document.getElementById("conteneur_livres");
            conteneur.innerHTML = "";
            livres.forEach((livre) => {
            conteneur.append(addLivre(livre));
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}
function setDefaultValues() {
    const selectList = document.getElementsByClassName("option");

    for(const select of selectList){
        select.value = 'Tous';
    }
}

//A remplacer                                                                               Cette partie n'est pas complète je ne connais pas encore tout les infos retourner par le php
function addLivre(livre) {
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    tr.append(td);

    // Main book container
    let bookContainer = document.createElement("div");
    bookContainer.className = "livreInfo";
    td.append(bookContainer);

    // Image section
    let imgContainer = document.createElement("div");
    imgContainer.className = "image";
    let image = document.createElement("img");
    image.src = livre.image || 'placeholder.jpg'; // Fallback image
    image.alt = livre.titre || "Book cover";
    imgContainer.append(image);
    bookContainer.append(imgContainer);  // Fixed: append to bookContainer instead of livre

    // Description section
    let description = document.createElement("div");
    description.className = "desc";

    // Title
    let h1 = document.createElement("h1");
    h1.textContent = livre.titre;
    description.append(h1);

    // Details list
    let ul = document.createElement("ul");

    // Add book details using your li function
    if (livre.description) li(livre.description, ul);
    if (livre.categorie) li(`Catégorie: ${livre.categorie}`, ul);
    if (livre.langue) li(`Langue: ${livre.langue}`, ul);
    if (livre.date_parution) li(`Date de parution: ${livre.date_parution}`, ul);
    if (livre.nom_auteur && livre.prenom_auteur) {
        li(`Auteur: ${livre.prenom_auteur} ${livre.nom_auteur}`, ul);
    }

    description.append(ul);
    bookContainer.append(description);  // Fixed: append to bookContainer instead of undefined 'activite'

    return tr;
}

// Your existing li helper function
function li(data, host) {
    let li = document.createElement("li");
    li.textContent = data;
    host.append(li);
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