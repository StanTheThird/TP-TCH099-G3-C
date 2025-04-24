// Front-End-Web/Scripts/Paiement.js

/**
 * Initialise le formulaire de paiement :
 *  - Validation du numéro de carte (16 chiffres, commence par 4519)
 *  - Validation de la date d'expiration (MM/AA, année ≥ 2025)
 *  - Validation du CVC (3 chiffres)
 *  - Envoi du paiement puis redirection vers l'historique
 */
function SetupPayment() {
  const form = document.getElementById("paymentForm");
  const messageErreur = document.getElementById("messageErreur");

  // Récupère le solde stocké (en CAD)
  const montant = parseFloat(localStorage.getItem("solde") || "0");
  // Pré-remplissage du champ montant (readonly)
  form.elements["montant"].value = montant.toFixed(2);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    messageErreur.textContent = "";

    const nom    = form.nom.value.trim();
    const numero = form.numero.value.trim();
    const dateExp= form.date_expiration.value.trim();
    const cvc    = form.cvc.value.trim();

    // 1) Numéro de carte : 4519 + 12 chiffres
    if (!/^4519\d{12}$/.test(numero)) {
      messageErreur.textContent = "Le numéro de carte doit comporter 16 chiffres et commencer par 4519.";
      return;
    }

    // 2) Date d'expiration MM/AA, année ≥ 2025
    const m = /^(\d{2})\/(\d{2})$/.exec(dateExp);
    if (!m) {
      messageErreur.textContent = "Le format de date doit être MM/AA.";
      return;
    }
    const mois = +m[1], an2 = +m[2], an = 2000 + an2;
    if (mois < 1 || mois > 12) {
      messageErreur.textContent = "Le mois d'expiration est invalide.";
      return;
    }
    if (an < 2025) {
      messageErreur.textContent = "La carte doit être valide au moins jusqu'en 2025.";
      return;
    }

    // 3) CVC à 3 chiffres
    if (!/^\d{3}$/.test(cvc)) {
      messageErreur.textContent = "Le CVC doit comporter 3 chiffres.";
      return;
    }

    // 4) Envoi du paiement à l'API
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const resp = await fetch("http://localhost:8000/api/paiement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilisateur_id: user.id,
          nom,
          numero,
          date_expiration: dateExp,
          cvc,
          montant
        })
      });

      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error || "Erreur lors du paiement");
      }

      alert("✅ Paiement effectué ! Votre solde est maintenant à 0 $ CAD.");
      // Remise à zéro du solde côté client
      localStorage.setItem("solde", "0");
      // Retour à l'historique
      window.location.href = "historique.html";
    } catch (err) {
      messageErreur.textContent = err.message;
    }
  });
}

// On expose la fonction pour que mainScript.js puisse l'appeler automatiquement
window.SetupPayment = SetupPayment;
