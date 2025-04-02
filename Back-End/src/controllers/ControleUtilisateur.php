<?php
class ControleUtilisateur{
  
    //Token??

    public static function userRegister() {
        require_once __DIR__ . "/../../config.php"; // Ensure the correct path
    
        global $pdo; // Make sure $pdo is available
    
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
    
            http_response_code(201);
            echo json_encode(["message" => "Utilisateur enregistré avec succès"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }
    public static function userLogin() {
        require_once __DIR__ . "/../../config.php"; 
        global $pdo;
    
        // Set headers for the response
        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8'); 
        
        // Read and decode the input JSON
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
            // Prepare and execute query
            $query = $pdo->prepare("SELECT id_utilisateur, nom_utilisateur, mot_de_passe FROM Utilisateur WHERE nom_utilisateur = ?");
            $query->execute([$username]);
            $user = $query->fetch();
    
            // Check if user exists and password matches
            if ($user && password_verify($password, $user['mot_de_passe'])) {
                echo json_encode([
                    "message" => "Connexion réussie",
                    "user" => [
                        "id" => $user['id_utilisateur'],
                        "nom_utilisateur" => $user['nom_utilisateur']
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
    
}

?>