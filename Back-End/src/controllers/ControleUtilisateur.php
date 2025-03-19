<?php
class ControleUtilisateur{

    //Token??

    public static function userRegister() {
        global $pdo;

        header('Access-Control-Allow-Origin: *');  
        header('Content-Type: application/json; charset=utf-8'); 

        $data = json_decode(file_get_contents("php://input"), true);

        // if(!isset($data['nom'], $data['prenom'], $data['nomUtilisateur'], $data['motDePasse'], $data['confirmation_mot_de_passe'])){
            if(!isset($data['nomUtilisateur'], $data['motDePasse'], $data['confirmation_mot_de_passe'])){
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }

        if ($data['motDePasse'] !== $data['confirmation_mot_de_passe']){
            http_response_code(400);
            echo json_encode(['error' => 'Les mots de passe sont différents']);
            exit;
        }

        // $nom = $data['nom'];
        // $prenom = $data['prenom'];
        $nomUtilisateur = trim($data['nomUtilisateur']);
        $motDePasse = password_hash($data['motDePasse'], PASSWORD_BCRYPT);
        $type = 0; // Utilisateur est un client (0 = faux)
        try {

            // Vérifier si l'utilisateur existe déjà
            $verifierClient = $pdo->prepare('SELECT COUNT(*) FROM utilisateur WHERE nomUtilisateur = :nomUtilisateur');
            $verifierClient->execute([':nomUtilisateur' => $nomUtilisateur]);
            if ($verifierClient->fetchColumn() > 0){
                http_response_code(409); // conflit
                echo json_encode(["error" => "nom d'utilisateur déjà utilisé !"]);
                exit;
            }

            // Création du compte client
            $requete = $pdo->prepare('INSERT INTO Utilisateur (nomUtilisateur, motDePasse, type)
            VALUES (:nomUtilisateur, :motDePasse, :type)
            ');
            $requete -> execute([
                    ':nomUtilisateur' => $nomUtilisateur,
                    ':motDePasse' => $motDePasse,
                    ':type' => $type,
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

