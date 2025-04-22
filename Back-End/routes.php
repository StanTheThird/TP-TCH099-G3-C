<?php
require_once(__DIR__.'/router.php');
require 'config.php';

require './src/controllers/ControleLivre.php';
require './src/controllers/ControleUtilisateur.php';
require './src/controllers/ControlePaiement.php';  // <-- Ajout du contrôleur Paiement

/*------------------------ Route pour les livres ------------------------*/
get('/api/livre/recherche-filtre', function(){
    ControleLivre::getAllBookFiltre();
});
get('/api/livre/admin-search', function(){
    ControleLivre::getAllBookAdmin();
});
get('/api/livre', function(){
    ControleLivre::getAllBooks();
});
get('/api/livre/$id', function($id){
    ControleLivre::getBook($id);
});
post('/api/emprunt/livre', function(){
    ControleLivre::emprunterLivre();
});
post('/api/ajout/livre', function(){
    ControleLivre::createBook();
});
delete('/api/supprimer/livre/$id', function($id){
    ControleLivre::deleteBook($id);
});

/*------------------------ Route pour les utilisateurs ------------------------*/
post('/api/register', function(){
    ControleUtilisateur::userRegister();
});
post('/api/login', function(){
    ControleUtilisateur::userLogin();
});
// Historique (récupère l’historique d’un seul utilisateur)
get('/api/historique/$id', function($id){
    ControleUtilisateur::getHistorique($id);
});

/*------------------------ Route pour le retour de livre ------------------------*/
post('/api/retour/emprunt', function(){
    ControleLivre::retourLivre();
});

/*------------------------ Routes admin emprunts ------------------------*/
get('/api/emprunt/admin', function(){
    ControleLivre::getAllEmprunt();
});
get('/api/emprunt/recherche', function(){
    ControleLivre::getEmpruntParRecherche();
});

/*------------------------ Route Recommandations ------------------------*/
get('/api/recommandations/$id', function($id) {
    ControleLivre::getRecommendations($id);
});

/*------------------------ Route Paiement ------------------------*/
post('/api/paiement', function(){
    ControlePaiement::payerSolde();
});

/*------------------------ Route 404 par défaut ------------------------*/
any('/404', function() {
    http_response_code(404);
    echo json_encode(["error" => "route not found"]);
});
?>
