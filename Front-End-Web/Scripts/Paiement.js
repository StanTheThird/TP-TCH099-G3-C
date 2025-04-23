async function SetupPayment() {
    const form = document.getElementById("paymentForm");
    const messageErreur = document.getElementById("messageErreur");
    // Récupère l'utilisateur et son solde (à adapter selon ta source de données)
    const user = JSON.parse(localStorage.getItem("user"));
    let montant = parseFloat(localStorage.getItem("solde") || "0"); 
    form.montant.value = montant.toFixed(2);
  
    form.addEventListener("submit", async e => {
      e.preventDefault();
      messageErreur.textContent = "";
  
      // Validation côté client
      const data = Object.fromEntries(new FormData(form).entries());
      data.id_utilisateur = user.id;
      data.montant = montant;
      data.numero = data.numero.trim();
      if (!/^4519\d{12}$/.test(data.numero)) {
        messageErreur.textContent = "Le numéro de carte doit commencer par 4519 et contenir 16 chiffres.";
        return;
      }
      const [mois, annee] = data.date_expiration.split("/").map(s => parseInt(s,10));
      if (!mois || !annee || mois<1 || mois>12 || (2000+annee) < 2025) {
        messageErreur.textContent = "Date d’expiration invalide (MM/AA) ou antérieure à 2025.";
        return;
      }
      if (!/^\d{3}$/.test(data.cvc)) {
        messageErreur.textContent = "Le CVC doit faire 3 chiffres.";
        return;
      }
  
      try {
        const resp = await fetch("http://localhost:8000/api/paiement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.error || "Erreur paiement");
        alert("Paiement réussi ! Votre solde est maintenant à $ 0.00");
        localStorage.setItem("solde", "0");
        window.location.href = "accueil.html";
      } catch (err) {
        messageErreur.textContent = err.message;
      }
    });
  }
  