<?php
class ControleLivre{

    
    public static function getBook($id){
        global $pdo;

        self::headers();

        try {
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description,  s.nom_style AS style, la.nom_langue AS langue, l.date_parution, a.id_auteur, a.nom AS nom_auteur, a.date_naissance, a.description AS description_auteur 
            FROM livre l
            INNER JOIN auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN style s ON l.style_id = s.id_style
            INNER JOIN langue la ON l.langue_id = la.id_langue
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

        self::headers();

        try {
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description, s.nom_style AS style, la.nom_langue AS langue, l.date_parution, a.id_auteur, a.nom AS nom_auteur 
            FROM livre l
            INNER JOIN auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN style s ON l.style_id = s.id_style
            INNER JOIN langue la ON l.langue_id = la.id_langue
            ');
            $query->execute();
            $books = $query->fetchAll();
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getAllBookFiltre() {
        global $pdo;

        self::headers();

        // Récupérer les paramètres de filtres via les query parameters
        $style = isset($_GET['style']) ? $_GET['style'] : null;
        $langue = isset($_GET['langue']) ? $_GET['langue'] : null;

        try {
            $query = ('SELECT l.id_livre, l.image, l.titre, l.description,l.date_parution,  s.nom_style AS style, la.nom_langue AS langue, a.id_auteur, a.nom AS nom_auteur 
            FROM livre l
            INNER JOIN auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN style s ON l.style_id = s.id_style
            INNER JOIN langue la ON l.langue_id = la.id_langue
            WHERE 1=1
            ');
            $params = [];

            if (!empty($style) && $style !== "Tous") {
                $query .= ' AND s.nom_style = :style';
                $params['style'] = $style;
            }
            if (!empty($langue) && $langue !== "Tous") {
                $query .= ' AND la.nom_langue = :langue';
                $params['langue'] = $langue;
            }

            $bookquery = $pdo->prepare($query);
            $bookquery->execute($params);
            $books = $bookquery->fetchAll();
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // À completer plus tard
    public static function createBook() {
        global $pdo;

        self::headers();

        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['image'], $data['titre'], $data['auteur_id'], $data['description'], 
            $data['style'],$data['date_parution'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        try {
            $query = ('INSERT INTO livre (image, titre, auteur_id, description, style, date_parution) 
            VALUES (:image, :titre, :auteur_id, :description, :style, :date_parution)');
            $requete = $pdo->prepare($query);
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

    // À completer plus tard
    public static function deleteBook() {
        global $pdo;

        self::headers();

        $data = json_decode(file_get_contents("php://input"), true);

        if(!isset($data['id'])){
            http_response_code(400);
            echo json_encode(['error' => 'id manquant']);
            exit();
        }
        
        try {
            $query = ('DELETE FROM livre WHERE id = :id');
            $requete = $pdo->prepare($query);
            $requete->bindParam(':id', $id, PDO::PARAM_INT);
            $requete->execute();
            echo json_encode(['success' => true, 'message' => 'Livre ajouté avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Garder ici pour l'instant 
    private static function headers(){
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }
}
?>