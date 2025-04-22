async function SetUpAuteurInfo() {
    // Récupérer les données du livre depuis sessionStorage
    const auteurData = JSON.parse(sessionStorage.getItem('auteurSelectionne'));
    if (!auteurData) {
        alert("Aucun auteur sélectionné !");
        window.location.href = "accueil.html";
        return;
    }

    try {
        if (auteurData) {
            console.log("Informations de l'auteur :", auteurData);

            const auteurTitre = document.getElementById('auteur-titre');
            const auteurInfosList = document.getElementById('auteur-infos');
            const auteurImage = document.getElementById('auteur-image'); // Si tu as une image d'auteur
    
            auteurTitre.textContent = `${auteurData.prenom} ${auteurData.nom}`;
    
            // Efface la liste précédente
            auteurInfosList.innerHTML = '';
    
            // Fonction pour ajouter des informations à la liste
            const addAuteurInfo = (label, value) => {
                if (value) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${label}:</strong> ${value}`;
                    auteurInfosList.appendChild(li);
                }
            };
    
            //addAuteurInfo('Date de naissance', auteurData.date_naissance);
            addAuteurInfo('Biographie', auteurData.biographie);
            addAuteurInfo('Nationalité', auteurData.nationalité);

            // Si tu as une URL d'image pour l'auteur dans tes données
            /*if (auteurData.image_auteur) {
                auteurImage.src = auteurData.image_auteur;
                auteurImage.alt = `${auteurData.prenom} ${auteurData.nom}`;
            }*/
    
        } else {
            alert("Aucune information sur l'auteur sélectionné !");
            window.location.href = "accueil.html";
        }

    } catch (error) {
        console.error('Erreur:', error);
        // Fallback: afficher les infos de base si la requête échoue
        if (livreData.nom_auteur && livreData.prenom_auteur) {
            document.getElementById('auteur-nom-complet').textContent = `${livreData.prenom_auteur} ${livreData.nom_auteur}`;
        }
        document.getElementById('auteur-bio').textContent = 'Impossible de charger la biographie complète';
    }
}

// Initialisation
SetUpAuteurInfo();