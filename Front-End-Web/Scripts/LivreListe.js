const typeDeFiltre = ["Categorie", "Langue", "Origine"];

async function populateFiltres() {
    try {
        const response = await fetch(`http://localhost:8000/api/livre/recherche-filtre`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des livres');
        const data = await response.json();
        createFiltre(data);
        setDefaultValues();
        filtrerFromOptions();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function createFiltre(livres) {
    const filtre = document.getElementById('filtres');
    filtre.innerHTML = '';
    
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

    const conteneurBouton = document.createElement('div');
    conteneurBouton.className= 'affichage-boutons';
    const btnGrille = document.createElement('button');
    btnGrille.className = 'btn-affichage';
    btnGrille.innerHTML = `<img src="../ressources/grille.jpg" alt="Grille" class="icone-btn">`;
    btnGrille.addEventListener('click', () => changerAffichage('grille'));
    const btnListe = document.createElement('button');
    btnListe.className = 'btn-affichage';
    btnListe.innerHTML = `<img src="../ressources/ligne.jpg" alt="Liste" class="icone-btn">`;
    btnListe.addEventListener('click' , () => changerAffichage('liste'));
    conteneurBouton.appendChild(btnGrille);
    conteneurBouton.appendChild(btnListe);
    filtre.appendChild(conteneurBouton);
    
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

    try {
        const url = `http://localhost:8000/api/livre/recherche-filtre?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Erreur lors de la récupération des livres');

        let livres = await response.json();
        const user = JSON.parse(localStorage.getItem('user'));

        if (user) {
            const recResponse = await fetch(`http://localhost:8000/api/recommandations/${user.id}`);
            if (recResponse.ok) {
                const recommendations = await recResponse.json();
                const recommendedTitles = recommendations.map(r => r.titre.toLowerCase().trim());

                livres = livres.map(livre => ({
                    ...livre,
                    isRecommended: recommendedTitles.includes(livre.titre.toLowerCase().trim())
                })).sort((a, b) => {
                    if (a.isRecommended && !b.isRecommended) return -1;
                    if (!a.isRecommended && b.isRecommended) return 1;
                    return 0;
                });
            }
        }

        const conteneur = document.getElementById("conteneur_livres");
        conteneur.innerHTML = '';

        if (livres.length === 0) {
            conteneur.innerHTML = '<p>Aucun livre trouvé.</p>';
            return;
        }

        // Valeur par défaut: "grille"
        const mode = localStorage.getItem('modeAffichage') || 'grille';
        if (mode === 'liste') {
            conteneur.className = 'conteneur-liste';
        } else {
            conteneur.className = 'conteneur-grille';
        }        
        livres.forEach(livre => {
            let element;
            if (mode === 'liste') {
                element = addLivre(livre);
            } else {
                element = createLivre(livre);
            }
            conteneur.appendChild(element);
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}



function createLivre(livre) {
    const carte = document.createElement('div');
    
    // Déterminer la classe en fonction de la disponibilité et des recommandations
    if (livre.stock <= 0) {
        carte.className = 'livre-indisponible admin-livre-carte';
        
        const badge = document.createElement('div');
        badge.className = 'badge-indisponible';
        badge.textContent = 'Pas en stock';
        carte.appendChild(badge);
    } else if (livre.isRecommended) {
        carte.className = 'livre-recommande admin-livre-carte';
        
        const badge = document.createElement('div');
        badge.className = 'badge-recommandation';
        badge.textContent = 'Recommandé';
        carte.appendChild(badge);
    } else {
        carte.className = 'admin-livre-carte';
    }

    const image = document.createElement('img');
    image.src = livre.image || 'placeholder.jpg';
    image.alt = livre.titre || 'Couverture';
    carte.appendChild(image);

    const titre = document.createElement('h3');
    titre.textContent = livre.titre || 'Titre inconnu';
    carte.appendChild(titre);

    carte.addEventListener('click', () => {
        sessionStorage.setItem('livreSelectionne', JSON.stringify(livre));
        window.location.href = "livreInfo.html";
     });
    return carte;
}
function setDefaultValues() {
    document.querySelectorAll(".option").forEach(select => select.value = 'Tous');
}

function changerAffichage(mode) {
    localStorage.setItem('modeAffichage', mode);
    filtrerFromOptions();
}

function addLivre(livre) {
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
    infoDiv.appendChild(imageDiv);
    infoDiv.appendChild(descDiv);
    livreDiv.appendChild(infoDiv);

    return livreDiv;
}

populateFiltres();