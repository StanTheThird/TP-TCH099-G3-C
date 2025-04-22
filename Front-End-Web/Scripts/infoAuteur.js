async function SetUpAuteurInfo() {
    
    const auteurData = JSON.parse(sessionStorage.getItem('auteurSelectionne'));
    if (!auteurData) {
        alert("Aucun auteur sélectionné !");
        window.location.href = "accueil.html";
        return;
    }

    try {
        if (auteurData) {

            const auteurTitre = document.getElementById('auteur-titre');
            const auteurInfosList = document.getElementById('auteur-infos');
            const auteurImage = document.getElementById('auteur-image'); 
    
            auteurTitre.textContent = `${auteurData.prenom} ${auteurData.nom}`;
    
            auteurInfosList.innerHTML = '';
    
            const addAuteurInfo = (label, value) => {
                if (value) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${label}:</strong> ${value}`;
                    auteurInfosList.appendChild(li);
                }
            };
    
            addAuteurInfo('Date de naissance', auteurData.date_naissance);
            addAuteurInfo('Nationalité', auteurData.nationalite);
            addAuteurInfo('Biographie', auteurData.biographie_auteur);

            if (auteurData.image_auteur) {
                auteurImage.src = auteurData.image_auteur;
                auteurImage.alt = `${auteurData.prenom} ${auteurData.nom}`;
            }
    
        } else {
            alert("Aucune information sur l'auteur sélectionné !");
            window.location.href = "accueil.html";
        }

    } catch (error) {
        console.error('Erreur:', error);
        if (livreData.nom_auteur && livreData.prenom_auteur) {
            document.getElementById('auteur-nom-complet').textContent = `${livreData.prenom_auteur} ${livreData.nom_auteur}`;
        }
        document.getElementById('auteur-bio').textContent = 'Impossible de charger la biographie complète';
    }
}

// Initialisation
SetUpAuteurInfo();