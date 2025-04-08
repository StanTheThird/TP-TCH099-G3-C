<?php
class ControleHistorique {
    public static function getHistoriqueByUser($id) {
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $stmt = $pdo->prepare("
                SELECT e.id_emprunt,
                       l.titre,
                       e.date_emprunt,
                       e.date_retour,
                       e.statut
                FROM Emprunts e
                JOIN Livre l ON e.livre_id = l.id_livre
                WHERE e.utilisateur_id = :id
            ");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $historique = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($historique);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
