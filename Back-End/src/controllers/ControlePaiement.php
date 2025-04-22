<?php
class ControlePaiement {
    public static function payerSolde() {
        require_once __DIR__ . "/../../config.php";
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Content-Type: application/json; charset=utf-8');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $userId   = $data['id_utilisateur']  ?? null;
        $numero   = $data['numero']          ?? '';
        $date     = $data['date_expiration'] ?? '';
        $cvc      = $data['cvc']             ?? '';
        $montant  = $data['montant']         ?? null;

        // Validation simple du numéro de carte
        if (!preg_match('/^4519\d{12}$/', $numero)) {
            http_response_code(400);
            echo json_encode(['error' => 'Numéro de carte non valide']);
            exit;
        }
        // Date au format MM/AA et expiration pas avant 2025
        if (!preg_match('/^(0[1-9]|1[0-2])\/\d{2}$/', $date) ||
            intval(substr($date, 3, 2)) < 25) {
            http_response_code(400);
            echo json_encode(['error' => 'Date d\'expiration non valide']);
            exit;
        }
        // CVC 3 chiffres
        if (!preg_match('/^\d{3}$/', $cvc)) {
            http_response_code(400);
            echo json_encode(['error' => 'CVC non valide']);
            exit;
        }
        if ($montant === null || $montant < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Montant non valide']);
            exit;
        }

        try {
            // On met le solde de l'utilisateur à zéro
            $stmt = $pdo->prepare(
                "UPDATE Utilisateur SET solde = 0 WHERE id_utilisateur = :id"
            );
            $stmt->execute([':id' => $userId]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
        }
    }
}
?>
