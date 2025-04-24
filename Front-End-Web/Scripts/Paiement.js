// /Front-End-Web/Scripts/Paiement.js

/**
 * Initialise le formulaire de paiement :
 *  - Validation du numéro de carte (4519 + 12 chiffres)
 *  - Validation de la date d'expiration (MM/AA, année ≥ 2025)
 *  - Validation du CVC (3 chiffres)
 *  - Envoi du paiement puis affichage d’une confirmation et redirection
 */
function SetupPayment() {
  const form                = document.getElementById("paymentForm");
  const messageErreur       = document.getElementById("messageErreur");
  const messageConfirmation = document.getElementById("messageConfirmation");
  const btnPayer            = form.querySelector("button[type=submit]");

  // Pré-remplissage du champ montant à partir de localStorage (en CAD)
  const montant = parseFloat(localStorage.getItem("solde") || "0");
  form.elements["montant"].value = montant.toFixed(2);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    messageErreur.textContent = "";
    messageConfirmation.style.display = "none";
    btnPayer.disabled = true;

    const nom     = form.nom.value.trim();
    const numero  = form.numero.value.trim();
    const dateExp = form.date_expiration.value.trim();
    const cvc     = form.cvc.value.trim();

    // 1) Numéro : 4519 + 12 chiffres
    if (!/^4519\d{12}$/.test(numero)) {
      messageErreur.textContent = "Le numéro de carte doit commencer par 4519 et contenir 16 chiffres.";
      btnPayer.disabled = false;
      return;
    }

    // 2) Date d'expiration MM/AA, année ≥ 2025
    const m = dateExp.match(/^(\d{2})\/(\d{2})$/);
    if (!m) {
      messageErreur.textContent = "Le format de date doit être MM/AA.";
      btnPayer.disabled = false;
      return;
    }
    const mois = +m[1], an2 = +m[2], an = 2000 + an2;
    if (mois < 1 || mois > 12) {
      messageErreur.textContent = "Le mois d'expiration est invalide.";
      btnPayer.disabled = false;
      return;
    }
    if (an < 2025) {
      messageErreur.textContent = "La carte doit être valide au moins jusqu’en 2025.";
      btnPayer.disabled = false;
      return;
    }

    // 3) CVC : 3 chiffres
    if (!/^\d{3}$/.test(cvc)) {
      messageErreur.textContent = "Le CVC doit comporter 3 chiffres.";
      btnPayer.disabled = false;
      return;
    }

    // 4) Envoi au serveur
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const resp = await fetch("http://localhost:8000/api/paiement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utilisateur:     user.id,
          nom,
          numero,
          date_expiration:    dateExp,
          cvc,
          montant
        })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Erreur lors du paiement.");

      // Confirmation visuelle
      messageConfirmation.textContent = "✅ Paiement effectué ! Votre solde est maintenant à 0 $ CAD.";
      messageConfirmation.style.display = "block";

      // Mise à jour du solde côté client
      localStorage.setItem("solde", "0");

      // Redirection après 2 secondes vers l’historique
      setTimeout(() => {
        window.location.href = "historique.html";
      }, 2000);

    } catch (err) {
      messageErreur.textContent = err.message;
      btnPayer.disabled = false;
    }
  });
}

// Expose pour mainScript.js
window.SetupPayment = SetupPayment;
