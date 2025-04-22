<?php
require_once(__DIR__.'/router.php');
require 'config.php';
require './src/controllers/ControleLivre.php';
require './src/controllers/ControleUtilisateur.php';

// Routes existantes...
get('/api/livre', function(){
    ControleLivre::getAllBooks();
});
get('/api/livre/recherche-filtre', function(){
    ControleLivre::getAllBookFiltre();
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
post('/api/register', function(){
    ControleUtilisateur::userRegister();
});
post('/api/login', function(){
    ControleUtilisateur::userLogin();
});
// Route Historique
get('/api/historique/$id', function($id){
    ControleUtilisateur::getHistorique($id);
});
post('/api/retour/emprunt', function(){
    ControleLivre::retourLivre();
});
get('/api/emprunt/admin', function(){
    ControleLivre::getAllEmprunt();
});
get('/api/emprunt/recherche', function(){
    ControleLivre::getEmpruntParRecherche();
});

// Route Recommandation
get('/api/recommandations/$id', function($id) {
    ControleLivre::getRecommendations($id);
});

// route par défaut pour les erreurs 404
// any('/404', function() {
//     http_response_code(404);
//     echo json_encode(["error" => "route not found"]);
// });
?>