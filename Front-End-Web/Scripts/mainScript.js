document.addEventListener("DOMContentLoaded", () => {
    const nomPage = document.title;
    if(nomPage == "BiblioSmart"){
        const url = new URL(window.location.href);
        const id = new URLSearchParams(url.search).get("id");
        populateFiltres();
    } else if (nomPage == 'Connexion') {
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();});//Add function here
    } else if (nomPage == 'Enregistrement') {
        document.getElementById('signInForm').addEventListener('submit', function(event) {
            event.preventDefault();});//Add function here
    } else {
        console.log('Rien à faire.');
    }
});



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
}

function filtrerFromOptions() {
    const selectList = document.getElementsByClassName("option");
    const filters =
    {
        categorie: selectList[0].value,
        langue: selectList[1].value
    };
    displayFilteredBooks(filters);
}

function displayFilteredBooks(filters) {
    fetch(`http://localhost:8000/api/livre/filter?Categorie=${filters.categorie}&Langue=${filters.langue}`)
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