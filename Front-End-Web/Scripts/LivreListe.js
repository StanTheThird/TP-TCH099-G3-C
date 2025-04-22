const typeDeFiltre = ["Categorie", "Langue", "Origine"];

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
                const recommendedIds = recommendations.map(r => r.id_livre);
                
                livres = livres.map(livre => {
                    return {
                        ...livre,
                        isRecommended: recommendedIds.includes(livre.id_livre)
                    };
                }).sort((a, b) => {
                    if (a.isRecommended && !b.isRecommended) return -1;
                    if (!a.isRecommended && b.isRecommended) return 1;
                    return 0;
                });
            }
        }
        
        const conteneur = document.getElementById("conteneur_livres");
        conteneur.innerHTML = '';
        
        livres.forEach(livre => {
            const carte = createLivre(livre);
            conteneur.appendChild(carte);
        });
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function createLivre(livre) {
    const carte = document.createElement('div');
    carte.className = livre.isRecommended ? 'livre-recommande admin-livre-carte' : 'admin-livre-carte';
    
    if (livre.isRecommended) {
        const badge = document.createElement('div');
        badge.className = 'badge-recommandation';
        badge.textContent = 'Recommandé';
        carte.appendChild(badge);
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

// Initialisation
populateFiltres();