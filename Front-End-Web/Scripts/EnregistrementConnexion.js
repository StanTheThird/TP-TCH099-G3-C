function SetupLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            const formData = new FormData(loginForm);
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            const responseText = await response.text();
            console.log('Raw server response:', responseText);
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                throw new Error("Invalid server response format");
            }
            if (!response.ok) {
                throw new Error(responseData.error || "Échec de la connexion");
            }
            console.log('Connexion réussie :', responseData.user);
            if (responseData.user) {
                localStorage.setItem('user', JSON.stringify(responseData.user));
                window.location.href = 'accueil.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || "Échec de la connexion");
        }
    });
}

function SetUpRegister() {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async event => {
        event.preventDefault();
        const motDePasse = registerForm.mot_de_passe.value;
        const confirmation = registerForm.confirmation_mot_de_passe.value;
        if (motDePasse !== confirmation) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        try {
            const formData = new FormData(registerForm);
            const userData = Object.fromEntries(formData.entries());
            // Forcer le type à 0 (utilisateur normal)
            userData.type = 0;
            
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de l'inscription");
            }
            const responseData = await response.json();
            console.log('Inscription réussie:', responseData.user);
            if (responseData.user) {
                localStorage.setItem('user', JSON.stringify(responseData.user));
                window.location.href = 'accueil.html';
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || "Échec de l'inscription");
        }
    });
}

if (document.title === 'Connexion') {
    SetupLogin();
} else if (document.title === 'Enregistrement') {
    SetUpRegister();
}