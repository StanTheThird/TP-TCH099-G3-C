function SetupPayment() {
  const form = document.getElementById("paymentForm");
  const messageErreur = document.getElementById("messageErreur");
  const messageConfirmation = document.getElementById("messageConfirmation");
  const btnPayer = form.querySelector("button[type=submit]");

  const montant = parseFloat(sessionStorage.getItem("paiement_montant") || "0");
  const empruntId = sessionStorage.getItem("paiement_emprunt_id");

  if (!empruntId || !montant) {
      alert("Erreur : données de paiement manquantes.");
      window.location.href = "historique.html";
      return;
  }

  form.elements["montant"].value = montant.toFixed(2);

  form.addEventListener("submit", async e => {
      e.preventDefault();

      const nom = form.nom.value.trim();
      const numero = form.numero.value.trim();
      const dateExp = form.date_expiration.value.trim();
      const cvc = form.cvc.value.trim();

      if (!/^4519\d{12}$/.test(numero)) {
          messageErreur.textContent = "Le numéro de carte doit commencer par 4519 et contenir 16 chiffres.";
          return;
      }

      const dateMatch = dateExp.match(/^(\d{2})\/(\d{2})$/);
      if (!dateMatch) {
          messageErreur.textContent = "Le format de date doit être MM/AA.";
          return;
      }

      const mois = +dateMatch[1];
      const annee = 2000 + +dateMatch[2];
      if (mois < 1 || mois > 12 || annee < 2025) {
          messageErreur.textContent = "La date d'expiration est invalide.";
          return;
      }

      if (!/^\d{3}$/.test(cvc)) {
          messageErreur.textContent = "Le CVC doit comporter 3 chiffres.";
          return;
      }

      try {
          const response = await fetch("http://localhost:8000/api/paiement", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  emprunt_id: empruntId,
                  montant,
                  nom,
                  numero,
                  date_expiration: dateExp,
                  cvc
              })
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error);

          messageConfirmation.textContent = "Paiement effectué !";
          messageConfirmation.style.display = "block";

          sessionStorage.removeItem("paiement_emprunt_id");
          sessionStorage.removeItem("paiement_montant");

          setTimeout(() => {
              window.location.href = "historique.html";
          }, 1000);
      } catch (err) {
          messageErreur.textContent = "Erreur : " + err.message;
      }
  });
}

window.addEventListener("DOMContentLoaded", SetupPayment);
