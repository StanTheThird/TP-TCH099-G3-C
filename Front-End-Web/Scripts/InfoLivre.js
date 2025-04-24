function SetUpLivreInfo() {
    const livreData = JSON.parse(sessionStorage.getItem('livreSelectionne'));
    if (!livreData) {
        alert("Aucun livre sélectionné !");
        window.location.href = "accueil.html";
        return;
    }

    const isAdmin = sessionStorage.getItem('admin') === 'true';
    
    document.getElementById('livre-titre').textContent = livreData.titre;
    document.getElementById('livre-image').src = livreData.image || 'placeholder.jpg';
    const infosList = document.getElementById('livre-infos');
    infosList.innerHTML = '';

    const addInfo = (label, value) => {
        if (value) {
            if (label === 'Auteur') {
                const li = document.createElement('li'); 
                const button = document.createElement('button');
                button.textContent = `${livreData.prenom_auteur} ${livreData.nom_auteur}`;
                button.classList.add('btn-auteur'); 
                li.innerHTML = `<strong>${label}:</strong> `;
                li.appendChild(button);
                infosList.appendChild(li);

                button.addEventListener('click', () => {
                    const auteurInfo = {
                        prenom: livreData.prenom_auteur,
                        nom: livreData.nom_auteur,
                        nationalite: livreData.nationalite_auteur,
                        image_auteur: livreData.image_auteur,
                        date_naissance: livreData.date_naissance, 
                        biographie_auteur: livreData.biographie_auteur 
                    };
                    sessionStorage.setItem('auteurSelectionne', JSON.stringify(auteurInfo));
                    window.location.href = "auteurInfo.html";
                });
            } else {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${label}:</strong> ${value}`;
                infosList.appendChild(li);
            }
        }
    };

    // Ajout du code livre pour les admins
    if (isAdmin && livreData.code_livre) {
        addInfo('Code livre', livreData.code_livre);
    }

    addInfo('Description', livreData.description);
    addInfo('Catégorie', livreData.categorie);
    addInfo('Langue', livreData.langue);
    addInfo('Date de parution', livreData.date_parution);
    
    if (livreData.nom_auteur && livreData.prenom_auteur) {
        addInfo('Auteur', `${livreData.prenom_auteur} ${livreData.nom_auteur}`);
    }
    
    addInfo('Format', livreData.format);
    addInfo('Nombre de pages', livreData.nb_pages);
    
    // Modification de l'affichage du statut pour les admins
    if (isAdmin) {
        addInfo('Statut', livreData.emprunte ? 'Emprunté' : 'Disponible');
    } else {
        addInfo('Exemplaires disponibles', livreData.stock || '0');
    }

    const conteneurBtn = document.getElementById('conteneur-btn');
    conteneurBtn.innerHTML = '';

    if (isAdmin) {
        const btnSupprimer = document.createElement('button');
        btnSupprimer.textContent = "Supprimer ce livre";
        btnSupprimer.className = "btn-supprimer";

        const btnStock = document.createElement('button');
        btnStock.textContent = "+ Stock";
        btnStock.className = "btn-stock";
    
        btnStock.addEventListener('click', () => {
            const modalStock = document.getElementById("modalAjoutStock");
            const formStock = document.getElementById("formAjoutStock");
            
            modalStock.style.display = 'flex';
            setupAjoutExemplaire(livreData, modalStock, formStock);
        });
    
        conteneurBtn.appendChild(btnStock);

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
        
        alert("Emprunt réussi !");
        
        window.location.href = '/Front-End-Web/html/accueil.html';
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur: " + error.message);
    }
}

// Initialisation
SetUpLivreInfo();
function setupAjoutExemplaire(livreData, modalStock, formStock) {
    formStock.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ancienCode = livreData.code_livre;
        const nouveauCode = document.getElementById("nouveauCodeLivre").value;

        try {
            const response = await fetch('http://localhost:8000/api/ajout/exemplaire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ancien_code: ancienCode, nouveau_code: nouveauCode })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            alert(result.message);
            modalStock.style.display = 'none';
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    });
}


