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
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode(['error' => 'Erreur d’encodage JSON: ' . json_last_error_msg()]);
                exit();
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

        // Récupérer les paramètres de filtres via les query parameters
        $categorie = isset($_GET['Categorie']) ? $_GET['Categorie'] : null;        
        $langue = isset($_GET['Langue']) ? $_GET['Langue'] : null;

        try {
            $query = ('SELECT l.id_livre, l.image, l.titre, l.description,l.date_parution,  c.nom AS categorie, la.nom AS langue, a.nom AS nom_auteur, a.prenom AS prenom_auteur
            FROM Livre l
            INNER JOIN Auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN Categorie c ON l.categorie_id = c.id_categorie
            INNER JOIN Langue la ON l.langue_id = la.id_langue
            WHERE 1=1
            ');
            $params = [];

            if (!empty($categorie) && $categorie !== "Tous") {
                $query .= ' AND c.nom = :categorie';
                $params['categorie'] = $categorie;
            }
            if (!empty($langue) && $langue !== "Tous") {
                $query .= ' AND la.nom_langue = :langue';
                $params['langue'] = $langue;
            }

            $bookquery = $pdo->prepare($query);
            $bookquery->execute($params);
            $books = $query->fetchAll(PDO::FETCH_ASSOC);
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode(['error' => 'Erreur d’encodage JSON: ' . json_last_error_msg()]);
                exit();
            }
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

//     // À completer plus tard
//     public static function createBook() {
//         global $pdo;

//         header('Access-Control-Allow-Origin: *');
//         header('Content-Type: application/json; charset=utf-8');

//         $data = json_decode(file_get_contents('php://input'), true);
//         if (!isset($data['image'], $data['titre'], $data['auteur_id'], $data['description'], 
//             $data['style'],$data['date_parution'])) {
//             http_response_code(400);
//             echo json_encode(['error' => 'Données incomplètes']);
//             exit;
//         }

//         try {
//             $query = ('INSERT INTO livre (image, titre, auteur_id, description, style, date_parution) 
//             VALUES (:image, :titre, :auteur_id, :description, :style, :date_parution)');
//             $requete = $pdo->prepare($query);
//             $requete->execute([
//                 ':image' => $data['image'] ?? null,
//                 ':titre' => $data['titre'] ?? null,
//                 ':auteur_id' => $data['auteur_id'] ?? null,
//                 ':description' => $data['description'] ?? null,
//                 ':style' => $data['style'] ?? null,
//                 ':date_parution' => $data['date_parution'] ?? null,
//             ]);
//             echo json_encode(['success' => true, 'message' => 'Livre ajouté avec succès']);
//         } catch (PDOException $e) {
//             http_response_code(500);
//             echo json_encode(['error' => $e->getMessage()]);
//         }
//     }

//     // À completer plus tard
//     public static function deleteBook() {
//         global $pdo;

//         header('Access-Control-Allow-Origin: *');
//         header('Content-Type: application/json; charset=utf-8');

//         $data = json_decode(file_get_contents("php://input"), true);

//         if(!isset($data['id'])){
//             http_response_code(400);
//             echo json_encode(['error' => 'id manquant']);
//             exit();
//         }
        
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
    }
}
?>