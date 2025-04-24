<?php
class ControleUtilisateur {

    /**
     * Enregistre un nouvel utilisateur et renvoie ses infos (incluant solde = 0).
     */
    public static function userRegister() {
        require_once __DIR__ . "/../../config.php";
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Content-Type: application/json; charset=utf-8');

        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['prenom'], $data['nom'], $data['nom_utilisateur'], $data['mot_de_passe'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données incomplètes"]);
            exit;
        }

        $prenom         = trim($data['prenom']);
        $nom            = trim($data['nom']);
        $nomUtilisateur = trim($data['nom_utilisateur']);
        $motDePasse     = trim($data['mot_de_passe']);
        $type           = (isset($data['type']) && $data['type'] == 1) ? 1 : 0;

        $hashedPassword = password_hash($motDePasse, PASSWORD_BCRYPT);

        try {
            // Vérifier unicité du nom d'utilisateur
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM Utilisateur WHERE nom_utilisateur = ?");
            $stmt->execute([$nomUtilisateur]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(409);
                echo json_encode(["error" => "Nom d'utilisateur déjà utilisé"]);
                exit;
            }

            // Insertion (solde par défaut = 0)
            $stmt = $pdo->prepare("
                INSERT INTO Utilisateur (prenom, nom, mot_de_passe, nom_utilisateur, type)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$prenom, $nom, $hashedPassword, $nomUtilisateur, $type]);

            // Récupérer l'utilisateur nouvellement créé
            $stmt = $pdo->prepare("
                SELECT id_utilisateur AS id,
                       prenom,
                       nom,
                       nom_utilisateur,
                       type,
                       solde
                FROM Utilisateur
                WHERE nom_utilisateur = ?
            ");
            $stmt->execute([$nomUtilisateur]);
            $newUser = $stmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode([
                "message" => "Utilisateur enregistré avec succès",
                "user"    => $newUser
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }

    /**
     * Authentifie un utilisateur et renvoie ses infos (incluant solde).
     */
    public static function userLogin() {
        require_once __DIR__ . "/../../config.php";
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Méthode non autorisée"]);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(["error" => "JSON invalide"]);
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
            $stmt = $pdo->prepare("
                SELECT id_utilisateur AS id,
                       nom_utilisateur,
                       mot_de_passe,
                       type,
                       solde
                FROM Utilisateur
                WHERE nom_utilisateur = ?
            ");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['mot_de_passe'])) {
                // Ne pas renvoyer le mot_de_passe
                unset($user['mot_de_passe']);
                echo json_encode([
                    "message" => "Connexion réussie",
                    "user"    => $user
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Identifiants incorrects"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }

    /**
     * Retourne l'historique d'emprunts d'un utilisateur donné.
     */
    public static function getHistorique($userId) {
        require_once __DIR__ . "/../../config.php";
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');

        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "ID utilisateur manquant"]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT 
                    e.id_emprunt,
                    e.date_emprunt,
                    e.date_limite,
                    e.date_retour,
                    l.id_livre,
                    l.titre,
                    l.image,
                    a.nom AS auteur_nom,
                    a.prenom AS auteur_prenom,
                    c.nom AS categorie,
                    lang.nom AS langue
                FROM Emprunt e
                JOIN Livre l ON e.livre_id = l.id_livre
                JOIN Auteur a ON l.auteur_id = a.id_auteur
                JOIN Categorie c ON l.categorie_id = c.id_categorie
                JOIN Langue lang ON l.langue_id = lang.id_langue
                WHERE e.utilisateur_id = ?
                ORDER BY e.date_emprunt DESC
            ");
            $stmt->execute([$userId]);
            $hist = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($hist)) {
                echo json_encode([
                    "status"  => "empty",
                    "message" => "Vous n'avez encore emprunté aucun livre. Parcourez notre catalogue !"
                ]);
            } else {
                echo json_encode($hist);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur serveur: " . $e->getMessage()]);
        }
    }
}
?>
