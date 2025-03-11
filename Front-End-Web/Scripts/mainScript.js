let host = null;

document.addEventListener("DOMContentLoaded", () => {
    const nomPage = document.title;

    console.log(nomPage);
    if (nomPage == 'Accueil') {
        //Put Accueil Action here
    } else if (nomPage == 'Liste livres') {

        const liste = document.getElementsByClassName('list-livre');
        host = liste[0].getElementsByTagName('tbody')[0];
        populateFiltres();

        const filtres =
        {
            auteur: "tous",
            style: "tous",
            langue: "tous"
        };  

        displayLivres(filtres)
    }else if(nomPage == "Info Livre"){
        const url = new URL(window.location.href);
        const id = new URLSearchParams(url.search).get("id");
        afficherInformations(id);
    } else {
        console.log('Rien à faire.');
    }
});

const typeDeFiltre = ["Auteur", "Style", "Langue"];

function populateFiltres() {
    
    fetch(`http://localhost:8001/api/livres`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des livres');
            }
            return response.json();
        })
        .then(data => {
            createFilter(data);
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}

function createFilter(livres){

    const filtre = document.getElementById('critere'); //On cherche pour les emplacement de filtres
    for (let i = 0; i < typeDeFiltre.length; i++) {
        const label = document.createElement('label'); //Cree le label
        label.textContent = typeDeFiltre[i];
        label.setAttribute('for', typeDeFiltre[i]);
        filtre.appendChild(label); //On peut append le label, car on n'as plus de modification a faire dessus.
        const select = document.createElement('select'); //Cree le select
        select.id = typeDeFiltre[i];
        select.name = typeDeFiltre[i];
        select.className = "filterSelect";
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
                    textTest = livre.auteur_nom;
                    break;
                case 1:
                    textTest = livre.style_nom;
                    break;
                case 2:
                    textTest = livre.langue_nom;
                    break;
            }
            if (!dejaAjouter.includes(textTest)) {                                              //Tristan du futur. tu doit modifier cette parite  et la remplacer par un UniqueSet = new Set(). Le tout devrait être plus éfficace.
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
    const selectList = document.getElementsByClassName("filterSelect");
    console.log("Génération des filtres!");
    const filters =
    {
        auteur: selectList[0].value,
        style: selectList[1].value,
        langue: selectList[2].value
    };
    displayFilteredBooks(filters);
}

function displayFilteredBooks(filters) {
    fetch(`http://localhost:8001/api/livres/filtrer?auteur=${filters.auteur}&style=${filters.style}&langue=${filters.langue}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des livres');
            }
            return response.json();
        })
        .then(data => {
            let livres;
            livres = data;
            host.innerHTML = "";
            livres.forEach((livre) => {
            host.append(addLivre(livre));
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

    let livre = document.createElement("div");
    livre.className = "livreInfo";
    td.append(activite);

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
    h1.textContent = livre.name;
    description.append(h1);

    let ul = document.createElement("ul");

    li(activity.description, ul);
    li(activity.level_id, ul);
    li(activity.coach_id, ul);
    li(activity.schedule_day, ul);
    li(activity.schedule_time, ul);
    li(activity.location_id, ul);

    ul.append(document.createElement("br"));

    let a = document.createElement("a");
    a.href = "modifierActivite.html?id=" + (activity.id);
    let button = document.createElement("button");
    button.textContent = "modifier l'activité";
    a.append(button);
    ul.append(a);

    description.append(ul);
    activite.append(description);

    return tr;
}

function li(data, host) {
    let li = document.createElement("li");
    li.textContent = data;
    host.append(li);

}
