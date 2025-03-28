<?php
class ControleUtilisateur{
  
    //Token??

    public static function userRegister() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8'); 

        $data = json_decode(file_get_contents("php://input"), true);

        if(!isset($data['nom'], $data['prenom'], $data['nomUtilisateur'], $data['motDePasse'], $data['confirmation_mot_de_passe'])){
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        if ($data['motDePasse'] !== $data['confirmation_mot_de_passe']){
            http_response_code(400);
            echo json_encode(['error' => 'Les mots de passe sont différents']);
            exit;
        }

        $nom = $data['nom'];
        $prenom = $data['prenom'];
        $nomUtilisateur = trim($data['nomUtilisateur']);
        $motDePasse = password_hash($data['motDePasse'], PASSWORD_BCRYPT);
        $type = 0; // Utilisateur est un client (0 = faux)
        try {

            // Vérifier si l'utilisateur existe déjà
            $verifierClient = $pdo->prepare('SELECT COUNT(*) FROM Utilisateur WHERE nom_utilisateur = :nomUtilisateur');
            $verifierClient->execute([':nomUtilisateur' => $nomUtilisateur]);
            if ($verifierClient->fetchColumn() > 0){
                http_response_code(409); // conflit
                echo json_encode(["error" => "nom d'utilisateur déjà utilisé !"]);
                exit;
            }

            // Création du compte client
            $query = $pdo->prepare('INSERT INTO Utilisateur (nom, prenom, nom_utilisateur, mot_de_passe, type)
            VALUES (:nom, :prenom, :nomUtilisateur, :motDePasse, :type)
            ');
            $query -> execute([
                ':nom' => $nom,
                ':prenom' => $prenom,
                ':nomUtilisateur' => $nomUtilisateur,
                ':motDePasse' => $motDePasse,
                ':type' => $type
            ]);
            http_response_code(201);
            echo json_encode(["message" => "Client enregistré avec succès"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);           
        }
    }
    public static function userLogin() {
        global $pdo;
    
        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8'); 
    
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $username = trim($_POST['nom_utilisateur'] ?? '');
            $password = $_POST['mot_de_passe'] ?? '';
    
            if (!empty($username) && !empty($password)) {
                $query = $pdo->prepare("SELECT id_utilisateur, nom_utilisateur, mot_de_passe FROM Utilisateur WHERE nom_utilisateur = ?");
                $query->execute([$username]);
                $user = $query->fetch();
    
                if ($user && password_verify($password, $user['mot_de_passe'])) {
                    http_response_code(200);
                    echo json_encode([
                        "message" => "Connexion réussie",
                        // À enlever, juste pour vérifier que la connexion se fait sur le bon compte
                        "user" => [
                            "id" => $user['id_utilisateur'],
                            "nom_utilisateur" => $user['nom_utilisateur']
                        ]
                    ]);
                    exit;
                } else {
                    http_response_code(401); 
                    echo json_encode(["error" => "Identifiant incorrect!"]);
                    exit;
                }
            } else {
                http_response_code(400); 
                echo json_encode(["error" => "Champs manquants"]);
                exit;
            }
        }
    }
    
}

?>