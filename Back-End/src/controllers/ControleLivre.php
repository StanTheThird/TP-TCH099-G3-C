<?php
class ControleLivre {

    public static function getBook($id){
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        try {
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description,  c.nom AS categorie, la.nom AS langue, l.date_parution, a.nom AS nom_auteur, a.prenom AS prenom_auteur, a.date_naissance, a.biographie AS biographie_auteur 
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
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description, c.nom AS categorie, la.nom AS langue, l.date_parution, a.prenom AS prenom_auteur, a.nom AS nom_auteur 
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
                $data['categorie_id'], $data['langue_id'], $data['date_parution'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        try {
            $query = ("INSERT INTO Livre (image, titre, auteur_id, description, categorie_id, langue_id, date_parution)
            VALUES (:image, :titre, :auteur_id, :description, :categorie_id, :langue_id, :date_parution)
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

}
?>