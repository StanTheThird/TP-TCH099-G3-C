document.addEventListener("DOMContentLoaded", () => {
    SetUpNavigation();
    const nomPage = document.title;
    
    // Chargement dynamique des scripts en fonction de la page
    switch(nomPage) {
        case "BiblioSmart":
            loadScript('../Scripts/LivreListe.js');
            break;
        case "Connexion":
        case "Enregistrement":
            loadScript('../Scripts/EnregistrementConnexion.js');
            break;
        case "Admin":
            loadScript('../Scripts/Admin.js', () => {
                displayAllBooks();
                setUpModalAjoutLivre();
            });
            break;
        case "AdminEmprunt":
            loadScript('../Scripts/Admin.js', () => {
                displayEmpruntAdmin();
            });
            break;
        case "InfoLivre":
            loadScript('../Scripts/InfoLivre.js');
            break;
        case "Historique":
            loadScript('../Scripts/Historique.js');
            break;
        default:
            console.log("Rien à faire.");
    }
});

function loadScript(scriptName, callback = null) {
    const script = document.createElement('script');
    script.src = scriptName;
    script.onload = () => {
        if (callback) callback();
    };
    document.head.appendChild(script);
}

function SetUpNavigation() {
    const nav = document.getElementById('navigation');
    nav.innerHTML = '';
    const menuButton = document.querySelector('.btn-menu a');
    const userData = localStorage.getItem('user');
    const isConnected = userData !== null;
    
    if (isConnected) {
        const user = JSON.parse(userData);
        menuButton.innerHTML = `<img src="/Front-End-Web/ressources/menu.jpg" alt="logo-menu" width="40" height="30"> ${user.nom_utilisateur}`;
    } else {
        menuButton.innerHTML = `<img src="/Front-End-Web/ressources/menu.jpg" alt="logo-menu" width="40" height="30"> Menu`;
    }

    const createMenuItem = (text, href = '#', onClick = null) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = text;
        if (href !== '#') {
            a.href = '/Front-End-Web/html/' + href;
        }
        if (onClick) {
            a.addEventListener('click', onClick);
        }
        li.appendChild(a);
        return li;
    };

    nav.appendChild(createMenuItem('Accueil', 'accueil.html'));
    
    if (isConnected) {
        const user = JSON.parse(userData);
        nav.appendChild(createMenuItem('Historique', 'historique.html'));
        nav.appendChild(createMenuItem('Déconnexion', 'accueil.html', () => {
            localStorage.removeItem('user');
            SetUpNavigation();
        }));
        
        if (user.type == 1) {
            nav.appendChild(createMenuItem('Administration', 'admin.html'));
        }
    } else {
        nav.appendChild(createMenuItem('Connexion', 'connexion.html'));
        nav.appendChild(createMenuItem('Enregistrement', 'enregistrement.html'));
    }
}

// Fonction utilitaire partagée
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA');
}