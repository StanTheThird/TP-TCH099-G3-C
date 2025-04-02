function displayHistoryWeb() {
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
          console.error("Conteneur d'historique web non trouvé");
          return;
        }
        container.innerHTML = "";
        const table = document.createElement("table");
        table.className = "history-table";
        table.innerHTML = `
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date d'emprunt</th>
              <th>Date de retour</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");
        historyData.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${item.titre}</td>
            <td>${item.date_emprunt}</td>
            <td>${item.date_retour}</td>
            <td>${item.statut}</td>
          `;
          tbody.appendChild(row);
        });
        container.appendChild(table);
      })
      .catch(error => {
        console.error("Erreur lors du chargement de l'historique web :", error);
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (document.title.toLowerCase().includes("historique") && !document.title.toLowerCase().includes("mobile")) {
      displayHistoryWeb();
    }
  });
  