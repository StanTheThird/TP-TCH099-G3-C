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
    addInfo('Format', livreData.format);
    addInfo('Nombre de pages', livreData.nb_pages);
    
    // Ajout de l'information sur le stock disponible
    addInfo('Exemplaires disponibles', livreData.stock || '0');

    const conteneurBtn = document.getElementById('conteneur-btn');
    conteneurBtn.innerHTML = '';

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
    } else {
        const btnEmprunt = document.createElement('button');
        btnEmprunt.className = 'btn-emprunt';
        
        // Modifier la condition pour vérifier le stock plutôt que deja_emprunter
        if (livreData.stock <= 0) {
            btnEmprunt.disabled = true;
            btnEmprunt.textContent = "Indisponible";
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
        
        const result = await response.json();
        
        if (bouton) {
            const livreData = JSON.parse(sessionStorage.getItem('livreSelectionne'));
            livreData.stock = result.stock;
            sessionStorage.setItem('livreSelectionne', JSON.stringify(livreData));
            
            // Mettre à jour l'affichage du stock
            const stockElements = document.querySelectorAll('li');
            stockElements.forEach(el => {
                if (el.textContent.includes('Exemplaires disponibles')) {
                    el.innerHTML = `<strong>Exemplaires disponibles:</strong> ${livreData.stock}`;
                }
            });
            
            if (livreData.stock <= 0) {
                bouton.disabled = true;
                bouton.textContent = "Indisponible";
                bouton.style.background = "gray";
            }
        }
        
        alert("Emprunt réussi !");
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur: " + error.message);
    }
}

// Initialisation
SetUpLivreInfo();