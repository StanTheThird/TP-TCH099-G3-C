<?php
class ControleLivre {

    public static function getBook($id){
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
    
        try {
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description,  c.nom AS categorie, la.nom AS langue, 
            l.date_parution, a.nom AS nom_auteur, a.prenom AS prenom_auteur, a.date_naissance, a.biographie AS biographie_auteur,
            l.code_livre, l.nb_pages, l.format, l.emprunte
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
            $query = $pdo -> prepare('SELECT l.id_livre, l.image, l.titre, l.description, c.nom AS categorie, 
            la.nom AS langue, l.date_parution, a.prenom AS prenom_auteur, a.nom AS nom_auteur, a.nationalite AS nationalite_auteur,
            l.emprunte
            FROM Livre l
            INNER JOIN Auteur a ON l.auteur_id = a.id_auteur
            INNER JOIN Categorie c ON l.categorie_id = c.id_categorie
            INNER JOIN Langue la ON l.langue_id = la.id_langue
            ');
            $query->execute();
            $books = $query->fetchAll(PDO::FETCH_ASSOC);
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
    
        $search = $_GET['search'] ?? '';
        $categorie = $_GET['Categorie'] ?? null;
        $langue = $_GET['Langue'] ?? null;
        $origine = $_GET['Origine'] ?? null;
    
        $search = trim($search);
        $params = [];
        
        $query = "SELECT l.code_livre, l.image, l.titre, l.description, l.date_parution,  
                l.nb_pages, l.format,
                c.nom AS categorie, la.nom AS langue,
                a.nom AS nom_auteur, a.prenom AS prenom_auteur, a.nationalite AS nationalite_auteur,
                SUM(CASE WHEN l.emprunte = 0 THEN 1 ELSE 0 END) AS stock,
                COALESCE(
                    MIN(CASE WHEN l.emprunte = 0 THEN l.id_livre ELSE NULL END),
                    MIN(l.id_livre)
                ) AS id_livre
                FROM Livre l
                INNER JOIN Auteur a ON l.auteur_id = a.id_auteur
                INNER JOIN Categorie c ON l.categorie_id = c.id_categorie
                INNER JOIN Langue la ON l.langue_id = la.id_langue
                WHERE 1=1";
    
        // Filtre texte (titre ou auteur)
        if (!empty($search)) {
            $query .= " AND (
                l.titre LIKE :searchTitre 
                OR a.nom LIKE :searchNom 
                OR a.prenom LIKE :searchPrenom
            )";
            $params['searchTitre'] = "%$search%";
            $params['searchNom'] = "%$search%";
            $params['searchPrenom'] = "%$search%";
        }
    
        // Filtre catégorie
        if (!empty($categorie) && $categorie !== "Tous") {
            $query .= " AND c.nom = :categorie";
            $params['categorie'] = $categorie;
        }
    
        // Filtre langue
        if (!empty($langue) && $langue !== "Tous") {
            $query .= " AND la.nom = :langue";
            $params['langue'] = $langue;
        }
    
        // Filtre origine (nationalité)
        if (!empty($origine) && $origine !== "Tous") {
            $query .= " AND a.nationalite = :origine";
            $params['origine'] = $origine;
        }
    
        //Partie importante, car il y a maintenant plusieurs copie de chaque livre.
        $query .= " GROUP BY l.titre, l.description, l.date_parution, l.nb_pages, l.format, 
                   c.nom, la.nom, a.nom, a.prenom, a.nationalite, l.image";
    
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            echo json_encode($books);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    public static function emprunterLivre(){
        global $pdo;
    
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
    
        $data = json_decode(file_get_contents("php://input"), true);
    
        if(!isset($data['livre_id'])){
            http_response_code(400);
            echo json_encode(["error" => "Pas de livre sélectionné"]);
            exit;
        }
    
        if(!isset($data['utilisateur_id'])){
            http_response_code(400);
            echo json_encode(["error" => "Veuillez-vous connecté pour poursuivre"]);
            exit;
        }
    
        $livreId = $data['livre_id'];
        $utilisateurId = $data['utilisateur_id'];
    
        try{
            // Vérifier si le livre est disponible en fonction du stock
            $query = $pdo->prepare("SELECT COUNT(*) as disponible FROM Livre WHERE id_livre = ? AND emprunte = FALSE");
            $query->execute([$livreId]);
            $result = $query->fetch(PDO::FETCH_ASSOC);
    
            if($result['disponible'] <= 0){
                http_response_code(409);
                echo json_encode(["error" => "Ce livre n'est pas disponible"]);
                exit;
            }
    
            // Emprunter le livre
            $query2 = $pdo->prepare("INSERT INTO Emprunt (date_emprunt, date_limite, livre_id, utilisateur_id)
            VALUES (CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), ?, ?)");
            $query2->execute([$livreId, $utilisateurId]);
    
            // Mettre à jour le statut du livre
            $query3 = $pdo->prepare("UPDATE Livre SET emprunte = TRUE WHERE id_livre = ?");
            $query3->execute([$livreId]);
    
            // Retourner le nouveau stock disponible pour ce livre (même code_livre)
            $query4 = $pdo->prepare("SELECT COUNT(*) as stock FROM Livre WHERE code_livre = (SELECT code_livre FROM Livre WHERE id_livre = ?) AND emprunte = FALSE");
            $query4->execute([$livreId]);
            $stock = $query4->fetch(PDO::FETCH_ASSOC)['stock'];
    
            http_response_code(201);
            echo json_encode([
                "success" => true, 
                "message" => "Livre emprunté!",
                "stock" => $stock
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur:" . $e->getMessage()]);
        }
    }

    // Créer un livre pour l'admin
    public static function createBook() {
        global $pdo;
    
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
    
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['image'], $data['titre'], $data['auteur_id'], $data['description'], 
                $data['categorie_id'], $data['langue_id'], $data['date_parution'], $data['code_livre'],
                $data['nb_pages'], $data['format'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données incomplètes']);
            exit;
        }
    
        try {
            $query = ("INSERT INTO Livre (image, titre, auteur_id, description, categorie_id, langue_id, date_parution, code_livre,
            nb_pages, format, emprunte)
            VALUES (:image, :titre, :auteur_id, :description, :categorie_id, :langue_id, :date_parution, :code_livre,
            :nb_pages, :format, FALSE)
            ");
            $requete = $pdo->prepare($query);
            $requete->execute([
                ':image' => $data['image'],
                ':titre' => $data['titre'],
                ':auteur_id' => $data['auteur_id'],
                ':description' => $data['description'],
                ':categorie_id' => $data['categorie_id'],
                ':langue_id' => $data['langue_id'],
                ':date_parution' => $data['date_parution'],
                ':code_livre' => $data['code_livre'],
                ':nb_pages' => $data['nb_pages'],
                ':format' => $data['format']
            ]);
            echo json_encode(['success' => true, 'message' => 'Livre ajouté avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    //Supprimer un livre pour l'admin
    public static function deleteBook($id) {
        global $pdo;
    
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
    
        $data = json_decode(file_get_contents("php://input"), true);
    
        if(!$id){
            http_response_code(400);
            echo json_encode(['error' => 'id manquant']);
            exit();
        }
        
        try {
            $query = ('DELETE FROM Livre WHERE id_livre = :id');
            $requete = $pdo->prepare($query);
            $requete->bindParam(':id', $id, PDO::PARAM_INT);
            $requete->execute();
            echo json_encode(['success' => true, 'message' => 'Livre supprimé avec succès']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function retourLivre(){
        global $pdo;
        header('Content-Type: application/json');
    
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id_emprunt'];
    
        if(!$id){
            http_response_code(400);
            echo json_encode(["message" => "Pas d'emprunt (id manquant)"]);
            return;
        }
    
        // vérifier que le livre n'est pas déjà emprunté
        $query = $pdo->prepare('SELECT * FROM Emprunt WHERE id_emprunt = ?');
        $query->execute([$id]);
        $emprunt = $query->fetch(PDO::FETCH_ASSOC);
        
        if (!$emprunt){
            http_response_code(404);
            echo json_encode(["message" => "Aucun emprunt trouvé"]);
            return;
        }
    
        if($emprunt['date_retour'] !== null){
            http_response_code(409);
            echo json_encode(["message" => "Ce livre a déjà été retourné !"]);
            return;
        }
    
        try {
            // Mettre à jour la date de retour
            $maj = $pdo->prepare('UPDATE Emprunt SET date_Retour = CURRENT_DATE WHERE id_emprunt = ?');
            $maj->execute([$id]);
    
            // Mettre à jour le statut du livre
            $updateLivre = $pdo->prepare('UPDATE Livre SET emprunte = FALSE WHERE id_livre = ?');
            $updateLivre->execute([$emprunt['livre_id']]);
    
            echo json_encode(["message" => "Livre retourné avec succès !"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function getAllEmprunt(){
        global $pdo;

        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');

        try{
            $query = $pdo->prepare('SELECT e.id_emprunt, e.date_emprunt, e.date_limite, e.date_retour, 
            u.id_utilisateur, u.nom AS nom_utilisateur, u.prenom AS prenom_utilisateur, l.id_livre, l.titre, l.code_livre
            FROM Emprunt e
            INNER JOIN Utilisateur u ON e.utilisateur_id = u.id_utilisateur 
            INNER JOIN Livre l ON e.livre_id = l.id_livre
            ORDER BY e.date_retour DESC
            ');
            $query->execute();
            $emprunts = $query -> fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($emprunts);

        } catch (PDOException $e){
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function getEmpruntParRecherche(){
        global $pdo;
        header('Content-Type: application/json');

        $search = trim($_GET['search'] ?? '');
        $params = [];

        try{
            $query = $pdo->prepare('SELECT e.id_emprunt, e.date_emprunt, e.date_limite, e.date_retour, 
            u.id_utilisateur, u.nom AS nom_utilisateur, u.prenom AS prenom_utilisateur, l.id_livre, l.code_livre, l.titre
            FROM Emprunt e
            INNER JOIN Livre l ON e.livre_id = l.id_livre
            INNER JOIN Utilisateur u ON e.utilisateur_id = u.id_utilisateur 
            WHERE l.code_livre LIKE :search
            ORDER BY e.date_emprunt DESC
            ');
            $query -> execute([':search' => "$search%"]);
            $resultats = $query->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($resultats);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // Permet de prendre un $userId et puis retourner une liste
    public static function getRecommendations($userId) {
        global $pdo;
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
    
        try {
            // 1. Récupérer les 3 derniers livres empruntés par l'utilisateur
            $queryHistory = $pdo->prepare("
                SELECT l.id_livre, l.categorie_id, l.auteur_id, l.langue_id, l.nb_pages, 
                       l.date_parution, l.format, a.nationalite AS auteur_nationalite
                FROM Emprunt e
                JOIN Livre l ON e.livre_id = l.id_livre
                JOIN Auteur a ON l.auteur_id = a.id_auteur
                WHERE e.utilisateur_id = ?
                ORDER BY e.id_emprunt DESC
                LIMIT 3
            ");
            $queryHistory->execute([$userId]);
            $lastBooks = $queryHistory->fetchAll(PDO::FETCH_ASSOC);
    
            // Si l'utilisateur n'a pas d'historique, retourner 3 livres aléatoires disponibles
            if (empty($lastBooks)) {
                $queryRandom = $pdo->prepare("
                    SELECT DISTINCT l.code_livre, l.image, l.titre, l.description, l.date_parution,
                           a.prenom AS prenom_auteur, a.nom AS nom_auteur, a.nationalite AS nationalite_auteur
                    FROM Livre l
                    JOIN Auteur a ON l.auteur_id = a.id_auteur
                    WHERE l.emprunte = FALSE
                    ORDER BY RAND()
                    LIMIT 3
                ");
                $queryRandom->execute();
                $randomBooks = $queryRandom->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($randomBooks);
                return;
            }
    
            // 2. Récupérer tous les livres disponibles (groupés par code_livre)
            $queryAllBooks = $pdo->prepare("
                SELECT l.code_livre, l.image, l.titre, l.description, l.categorie_id, l.auteur_id, 
                       l.langue_id, l.nb_pages, l.date_parution, l.format,
                       a.prenom AS prenom_auteur, a.nom AS nom_auteur, a.nationalite AS nationalite_auteur,
                       SUM(CASE WHEN l.emprunte = FALSE THEN 1 ELSE 0 END) AS stock
                FROM Livre l
                JOIN Auteur a ON l.auteur_id = a.id_auteur
                WHERE l.code_livre NOT IN (
                    SELECT livre.code_livre 
                    FROM Emprunt 
                    JOIN Livre livre ON Emprunt.livre_id = livre.id_livre
                    WHERE Emprunt.utilisateur_id = ? AND Emprunt.date_retour IS NULL
                )
                GROUP BY l.code_livre, l.image, l.titre, l.description, l.categorie_id, l.auteur_id, 
                         l.langue_id, l.nb_pages, l.date_parution, l.format,
                         a.prenom, a.nom, a.nationalite
                HAVING stock > 0
            ");
            $queryAllBooks->execute([$userId]);
            $allBooks = $queryAllBooks->fetchAll(PDO::FETCH_ASSOC);
    
            // 3. Calculer le score pour chaque livre
            $scoredBooks = [];
            foreach ($allBooks as $book) {
                $score = 0;
                
                foreach ($lastBooks as $lastBook) {
                    // +2 points pour même catégorie
                    if ($book['categorie_id'] == $lastBook['categorie_id']) {
                        $score += 2;
                    }
                    
                    // +1 point pour même auteur
                    if ($book['auteur_id'] == $lastBook['auteur_id']) {
                        $score += 1;
                    }
                    
                    // +1 point pour même nationalité d'auteur
                    if ($book['nationalite_auteur'] == $lastBook['auteur_nationalite']) {
                        $score += 1;
                    }
                    
                    // +1 point pour différence de pages < 50
                    if (abs($book['nb_pages'] - $lastBook['nb_pages']) < 50) {
                        $score += 1;
                    }
                    
                    // +1 point pour même langue
                    if ($book['langue_id'] == $lastBook['langue_id']) {
                        $score += 1;
                    }
                    // +1 point pour même format
                    if ($book['format'] == $lastBook['format']) {
                        $score += 1;
                    }
                    
                    // +1 point pour date de parution proche (20 ans ou moins)
                    $bookYear = date('Y', strtotime($book['date_parution']));
                    $lastBookYear = date('Y', strtotime($lastBook['date_parution']));
                    if (abs($bookYear - $lastBookYear) <= 20) {
                        $score += 1;
                    }
                }
                
                $scoredBooks[] = [
                    'book' => $book,
                    'score' => $score
                ];
            }
    
            // 4. Trier par score décroissant et prendre les 3 premiers
            usort($scoredBooks, function($a, $b) {
                return $b['score'] - $a['score'];
            });
    
            $topBooks = array_slice($scoredBooks, 0, 3);
    
            // 5. Formater la réponse
            $recommendations = [];
            foreach ($topBooks as $scoredBook) {
                $book = $scoredBook['book'];
                $recommendations[] = [
                    'code_livre' => $book['code_livre'],
                    'image' => $book['image'],
                    'titre' => $book['titre'],
                    'description' => $book['description'],
                    'date_parution' => $book['date_parution'],
                    'prenom_auteur' => $book['prenom_auteur'],
                    'nom_auteur' => $book['nom_auteur'],
                    'nationalite_auteur' => $book['nationalite_auteur'],
                    'format' => $book['format']
                ];
            }
    
            echo json_encode($recommendations);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>