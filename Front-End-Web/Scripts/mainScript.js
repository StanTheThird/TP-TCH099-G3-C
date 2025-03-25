let conteneur = null;

document.addEventListener("DOMContentLoaded", () => {
    const nomPage = document.title;
    
    console.log(nomPage);
    if (nomPage == 'Accueil') {
        conteneur = document.getElementsByClassName('liste-livre');
        populateFiltres();

        const filtres =
        {
            auteur: "tous",
            style: "tous",
            langue: "tous"
        };  

        displayLivres(filtres)
    } else if (nomPage == 'Connexion') {
        ocument.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();});//Add function here
    } else if (nomPage == 'Enregistrement') {
        ocument.getElementById('signInForm').addEventListener('submit', function(event) {
            event.preventDefault();});//Add function here
    }else if(nomPage == "BiblioSmart"){
        const url = new URL(window.location.href);
        const id = new URLSearchParams(url.search).get("id");
        populateFiltres();
        filtrerFromOptions();
    } else {
        console.log('Rien à faire.');
    }
});

const typeDeFiltre = ["nom_auteur", "categorie"];

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
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}

function createFiltre(livres){

    const filtre = document.getElementById('filtres'); //On cherche pour les emplacement de filtres
    for (let i = 0; i < typeDeFiltre.length; i++) {
        const label = document.createElement('label'); //Cree le label
        label.textContent = typeDeFiltre[i];
        label.setAttribute('for', 'filtre-' + typeDeFiltre[i]);
        label.className='filtre';
        filtre.appendChild(label); //On peut append le label, car on n'as plus de modification a faire dessus.
        const select = document.createElement('select'); //Cree le select
        select.id = typeDeFiltre[i];
        select.name = typeDeFiltre[i];
        select.setAttribute('for', 'filtre-' + typeDeFiltre[i]);
        select.className = 'options';
        //On cree l'option tous en premier
        const optTous = document.createElement('option');
        optTous.value = "tous";
        optTous.text = "tous";
        select.appendChild(optTous);
        let dejaAjouter = [];

        livres.forEach((livre) => {
            let textTest;
            switch (i) {
                case 0:
                    textTest = livre.nom_auteur;
                    break;
                case 1:
                    textTest = livre.categorie;
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
    const bouttonFiltre = document.createElement('button');
    bouttonFiltre.id = 'filtrer';
    bouttonFiltre.textContent = "Filtrer";
    bouttonFiltre.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default behavior if inside a form
        filtrerFromOptions();
    }
    );
    filtre.appendChild(bouttonFiltre);
}

function filtrerFromOptions() {
    const selectList = document.getElementsByClassName("filtres");
    console.log("Génération des filtres!");
    const filters =
    {
        auteur: selectList[0].value,
        style: selectList[1].value
    };
    displayFilteredBooks(filters);
}

function displayFilteredBooks(filters) {
    fetch(`http://localhost:8000/api/livres/filtrer?auteur=${filters.auteur}&style=${filters.style}&langue=${filters.langue}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des livres');
            }
            return response.json();
        })
        .then(data => {
            let livres;
            livres = data;
            conteneur.innerHTML = "";
            livres.forEach((livre) => {
            conteneur.append(addLivre(livre));
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
        });

}
//A remplacer                                                                               Cette partie n'est pas complète je ne connais pas encore tout les infos retourner par le php
function addLivre(livre) {

    let tr = document.createElement("tr");
    let td = document.createElement("td");
    tr.append(td);

    let l = document.createElement("div");
    l.className = "livreInfo";
    td.append(l);

    let img = document.createElement("div");
    img.className = "image";
    let image = document.createElement("img");
    image.src = livre.image;
    image.alt = "image loading failed";
    img.append(image);
    livre.append(img);

    let description = document.createElement("div");
    description.className = "desc";

    let h1 = document.createElement("h1");
    h1.textContent = livre.titre;
    description.append(h1);

    let ul = document.createElement("ul");

    li(activity.description, ul);
    li(activity.level_id, ul);
    li(activity.coach_id, ul);
    li(activity.schedule_day, ul);
    li(activity.schedule_time, ul);
    li(activity.location_id, ul);

    ul.append(document.createElement("br"));

    //let l = document.createElement("l");
    //l.href = "modifierActivite.html?id=" + (livre.id);
    //let button = document.createElement("button");
    //button.textContent = "modifier le livre";
    //l.append(button);
    //ul.append(l);

    description.append(ul);
    activite.append(description);

    return tr;
}

function li(data, host) {
    let li = document.createElement("li");
    li.textContent = data;
    host.append(li);

}
