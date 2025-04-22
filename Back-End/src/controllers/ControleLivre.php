<?php
class ControleLivre {

    public static function getBook($id){
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        try {
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description,  c.nom AS categorie, la.nom AS langue, 
            l.date_parution, a.nom AS nom_auteur, a.prenom AS prenom_auteur, a.date_naissance, a.biographie AS biographie_auteur,
            l.code_livre, l.nb_page, l.format, l.stock
            FROM Livre l
            INNER JOIN Auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN Categorie c ON l.categorie_id = c.id_categorie
            INNER JOIN Langue la ON l.langue_id = la.id_langue
            WHERE l.id_livre = :id
            ');
            $query->bindParam(':id',$id, PDO::PARAM_INT);
            $query->execute();
            $book = $query->fetch(PDO::FETCH_ASSOC);
            echo json_encode($book);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getAllBooks() {
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        try {
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description, c.nom AS categorie, 
            la.nom AS langue, l.date_parution, a.prenom AS prenom_auteur, a.nom AS nom_auteur 
            FROM Livre l
            INNER JOIN Auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN Categorie c ON l.categorie_id = c.id_categorie
            INNER JOIN Langue la ON l.langue_id = la.id_langue
            ');
            $query->execute();
            $books = $query->fetchAll(PDO::FETCH_ASSOC);
            // Si déjà emprunté
            foreach($books as &$book) {
                $query2 = $pdo->prepare("SELECT COUNT(*) FROM Emprunt WHERE livre_id = ? AND date_retour IS NULL");
                $query2->execute([$book['id_livre']]);
                $book['deja_emprunter'] = $query2->fetchColumn() > 0;
            }
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getAllBookFiltre() {
        global $pdo;

    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');

    $search = $_GET['search'] ?? '';
    $categorie = $_GET['Categorie'] ?? null;
    $langue = $_GET['Langue'] ?? null;

    $search = trim($search);
    $params = [];
    
    $query = "SELECT l.id_livre, l.image, l.titre, l.description, l.date_parution,  
                    c.nom AS categorie, la.nom AS langue, a.nom AS nom_auteur, a.prenom AS prenom_auteur
              FROM Livre l
              INNER JOIN Auteur a ON l.auteur_id = a.id_auteur
              INNER JOIN Categorie c ON l.categorie_id = c.id_categorie
              INNER JOIN Langue la ON l.langue_id = la.id_langue
              WHERE 1=1";

    // Filtre texte (titre ou auteur)
    if (!empty($search)) {
        $query .= " AND (
            l.titre LIKE :searchTitre 
            OR a.nom LIKE :searchNom 
            OR a.prenom LIKE :searchPrenom
        )";
        $params['searchTitre'] = "%$search%";
        $params['searchNom'] = "%$search%";
        $params['searchPrenom'] = "%$search%";
    }

    // Filtre catégorie
    if (!empty($categorie) && $categorie !== "Tous") {
        $query .= " AND c.nom = :categorie";
        $params['categorie'] = $categorie;
    }

    // Filtre langue
    if (!empty($langue) && $langue !== "Tous") {
        $query .= " AND la.nom = :langue";
        $params['langue'] = $langue;
    }

    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Vérifier les emprunts
        foreach ($books as &$book) {
            $stmt2 = $pdo->prepare("SELECT COUNT(*) FROM Emprunt WHERE livre_id = ? AND date_retour IS NULL");
            $stmt2->execute([$book['id_livre']]);
            $book['deja_emprunter'] = $stmt2->fetchColumn() > 0;
        }

        echo json_encode($books);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
    public static function emprunterLivre(){
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        $data = json_decode(file_get_contents("php://input"), true);

        // vérifier le livre
        if(!isset($data['livre_id'])){
            http_response_code(400);
            echo json_encode(["error" => "Pas de livre sélectionné"]);
            exit;
        }

        if(!isset($data['utilisateur_id'])){
            http_response_code(400);
            echo json_encode(["error" => "Veuillez-vous connecté pour poursuivre"]);
            exit;
        }

        $livreId = $data['livre_id'];
        $utilisateurId = $data['utilisateur_id'];
    
        try{
            //vérifier si le livre est déjà emprunté
            $query = $pdo->prepare("SELECT COUNT(*) FROM Emprunt WHERE livre_id = ? AND date_retour IS NULL");
            $query->execute([$livreId]);

            if($query->fetchColumn() > 0){
                http_response_code(409);
                echo json_encode(["error" => "Ce livre est déja emprunté"]);
                exit;
            }

            // emprunter le livre 
            $query2 = $pdo->prepare("INSERT INTO Emprunt (date_emprunt, date_limite, livre_id, utilisateur_id)
            VALUES (CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), ?, ?)");
            $query2 -> execute([$livreId, $utilisateurId]);
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Livre emprunté!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur:" . $e->getMessage()]);
        }
    
    }

    // Créer un livre pour l'admin
    public static function createBook() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['image'], $data['titre'], $data['auteur_id'], $data['description'], 
                $data['categorie_id'], $data['langue_id'], $data['date_parution'], $data['code_livre'],
                $data['nb_pages'], $data['format'], $data['stock'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        try {
            $query = ("INSERT INTO Livre (image, titre, auteur_id, description, categorie_id, langue_id, date_parution, code_livre,
            nb_pages, format, stock)
            VALUES (:image, :titre, :auteur_id, :description, :categorie_id, :langue_id, :date_parution, :code_livre,
            :nb_pages, :format, :stock)
            ");
            $requete = $pdo->prepare($query);
            $requete->execute([
                ':image' => $data['image'],
                ':titre' => $data['titre'],
                ':auteur_id' => $data['auteur_id'],
                ':description' => $data['description'],
                ':categorie_id' => $data['categorie_id'],
                ':langue_id' => $data['langue_id'],
                ':date_parution' => $data['date_parution'],
                ':code_livre' => $data['code_livre'],
                ':nb_pages' => $data['nb_pages'],
                ':format' => $data['format'],
                ':stock' => $data['stock']
            ]);
            echo json_encode(['success' => true, 'message' => 'Livre ajouté avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    //Supprimer un livre pour l'admin
    public static function deleteBook($id) {
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        $data = json_decode(file_get_contents("php://input"), true);

        if(!$id){
            http_response_code(400);
            echo json_encode(['error' => 'id manquant']);
            exit();
        }
        
        try {
            $query = ('DELETE FROM Livre WHERE id_livre = :id');
            $requete = $pdo->prepare($query);
            $requete->bindParam(':id', $id, PDO::PARAM_INT);
            $requete->execute();
            echo json_encode(['success' => true, 'message' => 'Livre supprimé avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function retourLivre(){
        global $pdo;
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id_emprunt'];

        if(!$id){
            http_response_code(400);
            echo json_encode(["message" => "Pas d'emprunt (id manquant)"]);
            return;
        }

        // vérifier que le livre n'est pas déjà emprunté
        $query = $pdo->prepare(' SELECT * FROM Emprunt 
        WHERE id_emprunt = ? 
        ');
        $query->execute([$id]);
        $emprunt = $query->fetch(PDO::FETCH_ASSOC);
        if (!$emprunt){
        // Not found
        http_response_code(404);
        echo json_encode(["message" => "Aucun emprunt trouvé / Livre déjà retourné"]);
        return;
        }

        if($emprunt['date_retour'] !== null){
            // conflit, parce que livre déjà emprunté
            http_response_code(409);
            echo json_encode(["message" => "Ce livre a déjà été retourné !"]);
            return;
        }

        // Si déjà retourné
        $maj = $pdo->prepare('UPDATE Emprunt SET date_Retour = CURRENT_DATE 
        WHERE id_emprunt = ?');
        $maj->execute([$id]);

        echo json_encode(["message" => "Livre retourné avec succès !"]);
    }

    public static function getAllEmprunt(){
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');

        try{
            $query = $pdo->prepare('SELECT e.id_emprunt, e.date_emprunt, e.date_limite, e.date_retour, 
            u.id_utilisateur, u.nom AS nom_utilisateur, u.prenom AS prenom_utilisateur, l.id_livre, l.titre, l.code_livre
            FROM Emprunt e
            INNER JOIN Utilisateur u ON e.utilisateur_id = u.id_utilisateur 
            INNER JOIN Livre l ON e.livre_id = l.id_livre
            ORDER BY e.date_retour DESC
            ');
            $query->execute();
            $emprunts = $query -> fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($emprunts);

        } catch (PDOException $e){
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function getEmpruntParRecherche(){
        global $pdo;
        header('Content-Type: application/json');

        $search = trim($_GET['search'] ?? '');
        $params = [];

        try{
            $query = $pdo->prepare('SELECT e.id_emprunt, e.date_emprunt, e.date_limite, e.date_retour, 
            u.id_utilisateur, u.nom AS nom_utilisateur, u.prenom AS prenom_utilisateur, l.id_livre, l.code_livre, l.titre
            FROM Emprunt e
            INNER JOIN Livre l ON e.livre_id = l.id_livre
            INNER JOIN Utilisateur u ON e.utilisateur_id = u.id_utilisateur 
            WHERE l.code_livre LIKE :search
            ORDER BY e.date_emprunt DESC
            ');
            $query -> execute([':search' => "$search%"]);
            $resultats = $query->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($resultats);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}
?>