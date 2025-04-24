// mainScript.js
document.addEventListener("DOMContentLoaded", () => {
    SetUpNavigation();
    const nomPage = document.title;

    switch (nomPage) {
        case "BiblioSmart":
            sessionStorage.setItem('admin', 'false');
            loadScript('../Scripts/LivreListe.js');
            break;

        case "Connexion":
        case "Enregistrement":
            loadScript('../Scripts/EnregistrementConnexion.js');
            break;

        case "Admin":
            sessionStorage.setItem('admin', 'true');
            loadScript('../Scripts/Admin.js', () => {
                displayBooks();
                setUpModalAjoutLivre();
            });
            break;

        case "AdminEmprunt":
            sessionStorage.setItem('admin', 'true');
            loadScript('../Scripts/Admin.js', () => {
                displayEmpruntAdmin();
            });
            break;

        case "InfoLivre":
            loadScript('../Scripts/InfoLivre.js');
            break;

        case "InfoAuteur":
            loadScript('../Scripts/infoAuteur.js');
            break;

        case "Historique":
            sessionStorage.setItem('admin', 'false');
            loadScript('../Scripts/Historique.js');
            break;

        case "Paiement":
            sessionStorage.setItem('admin', 'false');
            SetupPayment();
            break;

        case "Création Administrateur":
            sessionStorage.setItem('admin', 'true');
            loadScript('../Scripts/Admin.js', () => {
                createAdmin();
            });
            break;

        default:
            console.log("Rien à faire.");
    }
});

function loadScript(scriptName, callback = null) {
    const script = document.createElement('script');
    script.src = scriptName;
    script.onload = () => { if (callback) callback(); };
    document.head.appendChild(script);
}

function SetUpNavigation() {
    const nav = document.getElementById('navigation');
    nav.innerHTML = '';
    const menuButton = document.querySelector('.btn-menu a');
    const userData = localStorage.getItem('user');
    const isConnected = !!userData;

    menuButton.innerHTML = isConnected
        ? `<img src="/Front-End-Web/ressources/menu.jpg" width="40" height="30"> ${JSON.parse(userData).nom_utilisateur}`
        : `<img src="/Front-End-Web/ressources/menu.jpg" width="40" height="30"> Menu`;

    const createMenuItem = (text, href='#', onClick=null) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = text;
        if (href!=='#') a.href = '/Front-End-Web/html/' + href;
        if (onClick) a.addEventListener('click', onClick);
        li.appendChild(a);
        return li;
    };

    nav.appendChild(createMenuItem('Accueil','accueil.html'));

    if (isConnected) {
        const user = JSON.parse(userData);
        nav.appendChild(createMenuItem('Historique','historique.html'));
        nav.appendChild(createMenuItem('Déconnexion','accueil.html', () => {
            localStorage.removeItem('user');
            SetUpNavigation();
        }));
        if (user.type==1) {
            nav.appendChild(createMenuItem('Administration','admin.html'));
        }
    } else {
        nav.appendChild(createMenuItem('Connexion','connexion.html'));
        nav.appendChild(createMenuItem('Enregistrement','enregistrement.html'));
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-CA');
}

// --- NOUVELLE FONCTION POUR LA PAGE PAIEMENT ---
function SetupPayment() {
    const form = document.getElementById("paymentForm");
    const messageErreur = document.getElementById("messageErreur");

    // Récupère le solde stocké (ou 0 par défaut)
    const montant = parseFloat(localStorage.getItem("solde") || "0");
    form.montant.value = montant.toFixed(2);

    form.addEventListener("submit", async e => {
        e.preventDefault();
        messageErreur.textContent = "";

        // Récupère les champs du formulaire
        const data = Object.fromEntries(new FormData(form).entries());
        data.id_utilisateur = JSON.parse(localStorage.getItem("user")).id;
        data.montant = montant;

        // Validation basique côté client
        if (!/^4519\d{12}$/.test(data.numero)) {
            messageErreur.textContent = "Le numéro doit commencer par 4519 et faire 16 chiffres.";
            return;
        }
        const [mm, aa] = data.date_expiration.split('/');
        if (!mm || !aa || Number(aa) < 25) {
            messageErreur.textContent = "La date d’expiration doit être après 2025.";
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
