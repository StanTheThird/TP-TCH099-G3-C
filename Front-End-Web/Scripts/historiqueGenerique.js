function loadHistoriqueJS() {
    fetch('http://localhost:8000/api/historique')
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'historique");
        }
        return response.json();
      })
      .then(historyData => {
        const container = document.querySelector(".conteneurHistorique");
        if (!container) {
          console.error("Conteneur d'historique non trouvé");
          return;
        }
        container.innerHTML = "";
        historyData.forEach(entry => {
          const entryDiv = document.createElement("div");
          entryDiv.className = "history-entry";
          entryDiv.innerHTML = `
            <h3>${entry.titre}</h3>
            <p>Emprunté le : ${entry.date_emprunt}</p>
            <p>À rendre le : ${entry.date_retour}</p>
            <p>Statut : ${entry.statut}</p>
          `;
          container.appendChild(entryDiv);
        });
      })
      .catch(error => {
        console.error("Erreur lors du chargement de l'historique :", error);
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (document.title.toLowerCase().includes("historique")) {
      loadHistoriqueJS();
    }
  });
  