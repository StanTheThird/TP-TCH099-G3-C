<?php

require_once(__DIR__.'/router.php');

require 'config.php';
require './src/controllers/ControleLivre.php';
require './src/controllers/ControleUtilisateur.php';

/*------------------------Route pour les livres------------------------*/
// Récupérer tous les livres
get('/api/livre', function(){
    ControleLivre::getAllBooks();
});

// Récupérer tous les livres filtrés
get('/api/livre/filter', function(){
    ControleLivre::getAllBookFiltre();
});

// Récupérer un livre
get('/api/livre/$id', function($id){
    ControleLivre::getBook($id);
});

// Rechercher un livre
get('/api/recherche/livre', function(){
    ControleLivre::getBookBySearch();
});

// Emprunter un livre
post('/api/emprunt/livre', function(){
    ControleLivre::emprunterLivre();
});

// Ajouter un livre (admin)
post('/api/ajout/livre', function(){
    ControleLivre::createBook();
});

// Supprimer un livre (admin)
delete('/api/supprimer/livre/$id', function($id){
    ControleLivre::deleteBook($id);
});
/*------------------------Route pour les utilisateurs------------------------*/
// Inscription client
post('/api/register', function(){
    ControleUtilisateur::userRegister();
});
// Connexion client
post('/api/login', function(){
    ControleUtilisateur::userLogin();
});


// route par défaut pour les erreurs 404
// any('/404', function() {
//     http_response_code(404);
//     echo json_encode(["error" => "route not found"]);
// });
?>