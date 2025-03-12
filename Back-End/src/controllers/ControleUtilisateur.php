<?php
class ControleUtilisateur{

    //Token??

    public static function userRegister() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8'); 

        $data = json_decode(file_get_contents("php://input"), true);

        if(!isset($data['nom'], $data['prenom'], $data['nomUtilisateur'], $data['motDePasse'])){
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        // $nom = $data['nom'];
        // $prenom = $data['prenom'];
        $nomUtilisateur = $data['nomUtilisateur'];
        $motDePasse = password_hash($data['motDePasse'], PASSWORD_BCRYPT);
        $type = 0; // Utilisateur est un client (0 = faux)
        try {
            $requete = $pdo->prepare('INSERT INTO Utilisateur (nomUtilisateur, motDePasse, type)
            VALUES (:nomUtilisateur, :motDePasse, :type)
            ');
            $requete -> execute([
                    ':nomUtilisateur' => $data['nomUtilisateur'] ?? null,
                    ':motDePasse' => $data['motDePasse'] ?? null,
                    ':type' => $data['type'] ?? null,
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

        try {
           
        } catch (PDOException $e) {
            
        }
    }
}
?>

