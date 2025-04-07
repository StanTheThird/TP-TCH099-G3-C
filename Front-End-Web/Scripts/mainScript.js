document.addEventListener("DOMContentLoaded", () => {
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
        document.getElementById('registerBtn').addEventListener('submit', function(event) {
            event.preventDefault();
            register();
        });
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
            // Retrieve the form data
            const formData = new FormData(loginForm);
    
            // Log the form data to check if it's being retrieved properly
            console.log('Form data:', formData);
    
            // Prepare the data to be sent in the body
            const data = {
                nom_utilisateur: formData.get('nom_utilisateur'),  // Get 'nom_utilisateur' from the form field
                mot_de_passe: formData.get('mot_de_passe')          // Get 'mot_de_passe' from the form field
            };
    
            // Log the data to ensure both fields are retrieved
            console.log('Prepared data:', data);
    
            // Check if the data exists before sending it
            if (!data.nom_utilisateur || !data.mot_de_passe) {
                throw new Error('Both username and password are required!');
            }
    
            // Send the POST request to the API
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            // Check if the response is OK (status code 2xx)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }
    
            // If the login is successful, handle the response data
            const responseData = await response.json();
    
            // Log the success and the user data
            console.log('Login successful:', responseData.user);
    
            // Store user information in localStorage if necessary
            if (responseData.user) {
                localStorage.setItem('user', JSON.stringify(responseData.user));
            }
    
            // Redirect to the homepage or dashboard
            //window.location.href = 'Front-End-Web/html/accueil.html';
    
        } catch (error) {
            // Log any error and display it to the user
            console.error('Error:', error);
            alert(error.message || 'Login failed');
        }
    });
}
//Inscription
function register(){
    const registerFrom = document.getElementById("registerForm");
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
            if (!dejaAjouter.includes(textTest)) {                                              //Tristan du futur. tu doit modifier cette parite  et la remplacer par un UniqueSet = new Set(). Le tout devrait être plus efficace.
                const opt = document.createElement('option');
                opt.value = textTest;
                opt.text = textTest;
                dejaAjouter.push(textTest);
                select.appendChild(opt);
            }

        });

        filtre.appendChild(select);
    }
    // const bouttonFiltre = document.createElement('button');
    // bouttonFiltre.id = 'filtrer';
    // bouttonFiltre.textContent = "Filtrer";
    // bouttonFiltre.addEventListener('click', (e) => {
    //     e.preventDefault(); // Prevent default behavior if inside a form
    //     filtrerFromOptions();
    // }
    // );
    // filtre.appendChild(bouttonFiltre);

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
    // fetch(`http://localhost:8000/api/livre/filter?Categorie=${filters.categorie}&Langue=${filters.langue}`)
        // .then(response => {
        //     if (!response.ok) {
        //         throw new Error('Erreur lors de la récupération des livres');
        //     }
        //     return response.json();
        // })
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

    // button section
    let bouton = document.createElement("button");
    bouton.className = "btn-emprunt";
    bouton.style.backgroundColor = "white";
    bouton.disabled = livre.deja_emprunter;
    // Vérifier si le livre est déjà emprunté
    if (livre.deja_emprunter){
        bouton.disabled = true;
        bouton.textContent = "Déjà emprunté";
        bouton.style.background = "gray";
    } else {
        bouton.textContent= "Emprunter";
        bouton.addEventListener("click", () => {
            if (confirm(`Vous voulez emprunter ce livre ?`)) {
                const utilisateur = JSON.parse(localStorage.getItem("user"));
                if(!utilisateur){
                    alert("Vous devez vous connecter pour effectuer cette action !");
                    return;
                }
                empruntLivre(livre.id_livre,bouton); 
            }
        })
    }
    description.append(bouton);
    return tr;
}

function empruntLivre(livreId, bouton){
    fetch("http://localhost:8000/api/emprunt/livre", {
        method:"POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({livre_id: livreId})
    })
        .then (response =>{
            if (!response.ok){
                return response.json().then(err=>{throw new Error(err.error);});
            }
            return response.json();
        })
        .then (data =>{
            console.log("Réponse de l'emprunt :", data);
            alert("Livre emprunté!");
            bouton.disabled=true;
            bouton.textContent = "Déjà emprunté";
            bouton.style.backgroundColor = "gray";
        })
        .catch(error => {
            console.error("Erreur de fetch:", error);
            alert("Erreur : " + error.message);
        })
}

// Your existing li helper function
function li(data, host) {
    let li = document.createElement("li");
    li.textContent = data;
    host.append(li);
}