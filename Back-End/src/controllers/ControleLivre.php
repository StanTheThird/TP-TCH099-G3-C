<?php
class ControleLivre{

    
    public static function getBook($id){
        global $pdo;

        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8');  
        // header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        // header("Access-Control-Allow-Headers: Content-Type, Authorization");

        try {
            $requete = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description, l.style, l.date_parution, a.id_auteur, a.nom AS nom_auteur, a.date_naissance, a.description AS description_auteur 
            FROM livre l
            INNER JOIN auteur a ON l.auteur_id = a.id_auteur
            WHERE l.id_livre = :id');
            $requete->bindParam(':id',$id, PDO::PARAM_INT);
            $requete->execute();
            $livre = $requete->fetch(PDO::FETCH_ASSOC);
            echo json_encode($livre);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getAllBook() {
        global $pdo;

        header('Access-Control-Allow-Origin: *'); 
        header('Content-Type: application/json; charset=utf-8'); 

        try {
            $requete = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description, l.style, l.date_parution, a.id_auteur, a.nom AS nom_auteur 
            FROM livre l
            INNER JOIN auteur a ON l.auteur_id = a.id_auteur
            ');
            $requete->execute();
            $livre = $requete->fetchAll();
            echo json_encode($livre);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getAllBookFiltre() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8');  

        // Récupérer les paramètres de filtres via les query parameters
        $style = isset($_GET['style']) ? $_GET['style'] : null;
        $langue = isset($_GET['langue']) ? $_GET['langue'] : null;

        try {
            $sql = ('SELECT SELECT l.id_livre, l.image, l.titre, l.description, l.style, l.date_parution, a.id_auteur, a.nom AS nom_auteur 
            FROM livre l
            INNER JOIN auteur a ON l.auteur_id = a.id_auteur
            ');
            $param = [];

            if (!empty($style) && $style !== "Tous") {
                $query .= ('AND style.name = :style');
                $params['style'] = $style;
            }
            if (!empty($langue) && $langue !== "Tous") {
                $query .= ('AND langue.name = :langue');
                $params['langue'] = $langue;
            }

            $requete = $pdo->prepare($sql);
            $requete->execute($sql);
            $livre = $requete->fetchAll();
            echo json_encode($livre);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function createBook() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8');  

        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['image'], $data['titre'], $data['auteur_id'], $data['description'], 
            $data['style'],$data['date_parution'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        try {
            $sql = ('INSERT INTO livre (image, titre, auteur_id, description, style, date_parution) 
            VALUES (:image, :titre, :auteur_id, :description, :style, :date_parution)');
            $requete = $pdo->prepare($sql);
            $requete->execute([
                ':image' => $data['image'] ?? null,
                ':titre' => $data['titre'] ?? null,
                ':auteur_id' => $data['auteur_id'] ?? null,
                ':description' => $data['description'] ?? null,
                ':style' => $data['style'] ?? null,
                ':date_parution' => $data['date_parution'] ?? null,
            ]);
            echo json_encode(['success' => true, 'message' => 'Livre ajouté avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function deleteBook() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        $data = json_decode(file_get_contents("php://input"), true);

        if(!isset($data['id'])){
            http_response_code(400);
            echo json_encode(['error' => 'id manquant']);
            exit();
        }
        
        try {
            $sql = ('DELETE FROM livre WHERE id = :id');
            $requete = $pdo->prepare($sql);
            $requete->bindParam(':id', $id, PDO::PARAM_INT);
            $requete->execute();
            echo json_encode(['success' => true, 'message' => 'Livre ajouté avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>