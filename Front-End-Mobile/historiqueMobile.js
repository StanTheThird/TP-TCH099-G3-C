function loadHistoryMobile() {
    fetch('http://localhost:8000/api/historique')
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'historique");
        }
        return response.json();
      })
      .then(historyData => {
        const container = document.getElementById("mobileHistoryContainer");
        if (!container) {
          console.error("Conteneur mobile d'historique non trouvé");
          return;
        }
        container.innerHTML = "";
        historyData.forEach(item => {
          const card = document.createElement("div");
          card.className = "history-card";
          card.innerHTML = `
            <h2>${item.titre}</h2>
            <p><strong>Emprunté :</strong> ${item.date_emprunt}</p>
            <p><strong>À rendre :</strong> ${item.date_retour}</p>
            <p><strong>Statut :</strong> ${item.statut}</p>
          `;
          container.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Erreur lors du chargement de l'historique mobile :", error);
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (document.title.toLowerCase().includes("mobile")) {
      loadHistoryMobile();
    }
  });
  