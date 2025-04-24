// /Front-End-Web/Scripts/EnregistrementConnexion.js

/**
 * Initialise la logique de connexion :
 *  - Envoie les identifiants au serveur
 *  - Stocke l'objet `user` et son `solde` en localStorage
 *  - Redirige vers l'accueil
 */
async function SetupLogin() {
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      try {
        // Préparer la requête
        const formData = new FormData(loginForm);
        const payload  = Object.fromEntries(formData.entries());
  
        // Appel à l'API
        const response = await fetch('http://localhost:8000/api/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload)
        });
  
        // Lire la réponse brute puis la parser
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Format de réponse serveur invalide");
        }
  
        if (!response.ok) {
          throw new Error(data.error || "Échec de la connexion");
        }
  
        // Stocker user + solde
        const user = data.user;
        localStorage.setItem('user', JSON.stringify(user));
        // Si l'API renvoie solde, sinon on initialise à 0
        localStorage.setItem('solde', String(user.solde ?? 0));
  
        // Redirection
        window.location.href = 'accueil.html';
      } catch (err) {
        console.error(err);
        alert(err.message || "Échec de la connexion");
      }
    });
  }
  
  /**
   * Initialise la logique d'enregistrement :
   *  - Vérifie la confirmation du mot de passe
   *  - Envoie les données au serveur
   *  - Stocke l'objet `user` et initialise `solde = 0`
   *  - Redirige vers l'accueil
   */
  async function SetupRegister() {
    const registerForm = document.getElementById('registerForm');
  
    registerForm.addEventListener('submit', async event => {
      event.preventDefault();
  
      // Vérification mot de passe / confirmation
      const pwd  = registerForm.mot_de_passe.value;
      const conf = registerForm.confirmation_mot_de_passe.value;
      if (pwd !== conf) {
        alert("Les mots de passe ne correspondent pas !");
        return;
      }
  
      try {
        // Préparer la requête
        const formData = new FormData(registerForm);
        const userData = Object.fromEntries(formData.entries());
        userData.type = 0;  // type client
  
        // Appel à l'API
        const response = await fetch('http://localhost:8000/api/register', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(userData)
        });
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Échec de l'inscription");
        }
  
        // Stocker user + solde initial à 0
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('solde', "0");
  
        // Redirection
        window.location.href = 'accueil.html';
      } catch (err) {
        console.error(err);
        alert(err.message || "Échec de l'inscription");
      }
    });
  }
  
  // Démarrage selon le titre de la page
  if (document.title === 'Connexion') {
    SetupLogin();
  } else if (document.title === 'Enregistrement') {
    SetupRegister();
  }
  