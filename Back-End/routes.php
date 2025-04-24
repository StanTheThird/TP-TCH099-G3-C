<?php
require_once(__DIR__ . '/router.php');
require 'config.php';

require './src/controllers/ControleLivre.php';
require './src/controllers/ControleUtilisateur.php';
require './src/controllers/ControlePaiement.php';

/*------------------------ Routes Livre ------------------------*/

// Recherche / filtres avancés
get('/api/livre/recherche-filtre', function() {
    ControleLivre::getAllBookFiltre();
});

// Recherche administrateur
get('/api/livre/admin-search', function() {
    ControleLivre::getAllBookAdmin();
});

// Tous les livres
get('/api/livre', function() {
    ControleLivre::getAllBooks();
});

// Un livre précis
get('/api/livre/$id', function($id) {
    ControleLivre::getBook($id);
});

// Emprunter
post('/api/emprunt/livre', function() {
    ControleLivre::emprunterLivre();
});

// Ajouter (admin)
post('/api/ajout/livre', function() {
    ControleLivre::createBook();
});

// Ajouter stock (admin)
post('/api/ajout/exemplaire', function() {
    ControleLivre::ajouterExemplaire();
});

// Supprimer (admin)
delete('/api/supprimer/livre/$id', function($id) {
    ControleLivre::deleteBook($id);
});

/*------------------------ Routes Info Livre ------------------------*/
get('/api/auteurs', function() {
    ControleLivre::getAllAuteurs();
});
get('/api/langues', function() {
    ControleLivre::getAllLangues();
});
get('/api/categories', function() {
    ControleLivre::getAllCategories();
});

/*------------------------ Routes Utilisateur ------------------------*/

// Inscription
post('/api/register', function() {
    ControleUtilisateur::userRegister();
});

// Connexion
post('/api/login', function() {
    ControleUtilisateur::userLogin();
});

// Historique d’un client
get('/api/historique/$id', function($id) {
    ControleUtilisateur::getHistorique($id);
});


/*------------------------ Route Retour de livre ------------------------*/

// Marquer un emprunt comme retourné
post('/api/retour/emprunt', function() {
    ControleLivre::retourLivre();
});


/*------------------------ Routes Emprunts Admin ------------------------*/

// Lister tous les emprunts (admin)
get('/api/emprunt/admin', function() {
    ControleLivre::getAllEmprunt();
});

// Rechercher des emprunts (admin)
get('/api/emprunt/recherche', function() {
    ControleLivre::getEmpruntParRecherche();
});


/*------------------------ Route Recommandations ------------------------*/

// Livres recommandés pour un client
get('/api/recommandations/$id', function($id) {
    ControleLivre::getRecommendations($id);
});


/*------------------------ Route Paiement ------------------------*/

// Traiter un paiement et remettre le solde à zéro
post('/api/paiement', function() {
    ControlePaiement::payerSolde();
});


/*------------------------ Route 404 par défaut ------------------------*/

any('/404', function() {
    http_response_code(404);
    echo json_encode(["error" => "route not found"]);
});
