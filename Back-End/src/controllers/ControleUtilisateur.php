<?php
class ControleUtilisateur{
  
    //Token??

    public static function userRegister() {
        //Partie importante ne pas retirer: 
        require_once __DIR__ . "/../../config.php"; 
        global $pdo;
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Content-Type: application/json; charset=utf-8');
    
        // Get JSON input
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);
    
        // Validate required fields
        if (!isset($data['prenom'], $data['nom'], $data['nom_utilisateur'], $data['mot_de_passe'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données incomplètes"]);
            exit;
        }
    
        $prenom = trim($data['prenom']);
        $nom = trim($data['nom']);
        $nomUtilisateur = trim($data['nom_utilisateur']);
        $motDePasse = trim($data['mot_de_passe']);
        $type = isset($data['type']) && ($data['type'] == 1) ? 1 : 0;
    
        // Hash the password
        $hashedPassword = password_hash($motDePasse, PASSWORD_BCRYPT);
    
        try {
            // Check if username already exists
            $query = $pdo->prepare("SELECT COUNT(*) FROM Utilisateur WHERE nom_utilisateur = ?");
            $query->execute([$nomUtilisateur]);
            if ($query->fetchColumn() > 0) {
                http_response_code(409); // Conflict
                echo json_encode(["error" => "Nom d'utilisateur déjà utilisé !"]);
                exit;
            }
    
            // Insert new user
            $query = $pdo->prepare("INSERT INTO Utilisateur (prenom, nom, mot_de_passe, nom_utilisateur, type) 
                                    VALUES (?, ?, ?, ?, ?)");
            $query->execute([$prenom, $nom, $hashedPassword, $nomUtilisateur, $type]);
    
            // Récupérer les informations du nouvel utilisateur
            $query = $pdo->prepare("SELECT id_utilisateur, prenom, nom, nom_utilisateur, type FROM Utilisateur WHERE nom_utilisateur = ?");
            $query->execute([$nomUtilisateur]);
            $newUser = $query->fetch();
    
            http_response_code(201);
            echo json_encode([
                "message" => "Utilisateur enregistré avec succès",
                "user" => [
                    "id" => $newUser['id_utilisateur'],
                    "nom_utilisateur" => $newUser['nom_utilisateur'],
                    "type" => $newUser['type']
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }
    public static function userLogin() {
        //Partie importante ne pas retirer :
        require_once __DIR__ . "/../../config.php"; 
        global $pdo;
        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8'); 


        $data = json_decode(file_get_contents('php://input'), true);
    
        if (json_last_error() !== JSON_ERROR_NONE || $_SERVER["REQUEST_METHOD"] !== "POST") {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON or incorrect method"]);
            exit;
        }
    
        $username = trim($data['nom_utilisateur'] ?? '');
        $password = $data['mot_de_passe'] ?? '';
    
        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "Champs manquants"]);
            exit;
        }
    
        try {
            $query = $pdo->prepare("SELECT id_utilisateur, nom_utilisateur, mot_de_passe, type FROM Utilisateur WHERE nom_utilisateur = ?");
            $query->execute([$username]);
            $user = $query->fetch();
    
            // On vérifie que le mot de passe et nom utilisateur existe.
            if ($user && password_verify($password, $user['mot_de_passe'])) {
                echo json_encode([
                    "message" => "Connexion réussie",
                    "user" => [
                        "id" => $user['id_utilisateur'],
                        "nom_utilisateur" => $user['nom_utilisateur'],
                        "type" => $user['type']
                    ]
                ]);
                http_response_code(200);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Identifiants incorrects!"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }
    public static function getHistorique($userId) {
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
    
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "ID utilisateur manquant"]);
            exit;
        }
    
        try {
            $query = $pdo->prepare("
            SELECT 
                e.id_emprunt,
                e.date_emprunt,
                e.date_limite,
                e.date_retour,
                l.titre,
                CASE 
                    WHEN e.date_retour IS NOT NULL THEN 'Retourné'
                    WHEN e.date_limite < NOW() THEN 'En retard'
                    ELSE 'Emprunté'
                END AS statut
            FROM 
                Emprunt e
            JOIN 
                Livre l ON e.livre_id = l.id_livre
            WHERE 
                e.utilisateur_id = ?
            ORDER BY 
                e.date_emprunt DESC
            ");
            
            $query->execute([$userId]);
            $historique = $query->fetchAll(PDO::FETCH_ASSOC);
    
            if (empty($historique)) {
                // Retourne un code 200 avec un message spécifique
                http_response_code(200);
                echo json_encode([
                    "status" => "empty",
                    "message" => "Vous n'avez encore emprunté aucun livre. Parcourez notre catalogue pour trouver votre prochaine lecture !"
                ]);
                return;
            }
    
            // Formatage des données existant...
            http_response_code(200);
            echo json_encode($historique);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }
    
}

?>