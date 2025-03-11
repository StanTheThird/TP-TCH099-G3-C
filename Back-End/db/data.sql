--Il faut inserer les informations de livres, clients et autres ici.
INSERT INTO Auteur (nom, date_naissance, description)
VALUES 
    ('J.K. Rowling', '1965-07-31', 'Auteur britannique, célèbre pour la série Harry Potter'),
    ('George Orwell', '1903-06-25', 'Auteur britannique, connu pour 1984 et Animal Farm'),
    ('J.R.R. Tolkien', '1892-01-03', 'Auteur britannique, créateur du Seigneur des Anneaux'),
    ('Agatha Christie', '1890-09-15', 'Autrice britannique, reine du roman policier'),
    ('Isaac Asimov', '1920-01-02', 'Auteur de science-fiction américain, connu pour la Fondation');
INSERT INTO Livre (titre, auteur_id, description, style, date_parution)
VALUES 
    ('Harry Potter à l\'école des sorciers', 1, 'Premier livre de la saga Harry Potter', 'Fantasy', '1997-06-26'),
    ('1984', 2, 'Roman dystopique sur un futur totalitaire', 'Dystopie', '1949-06-08'),
    ('Le Seigneur des Anneaux : La Communauté de l\'Anneau', 3, 'Premier tome de la saga du Seigneur des Anneaux', 'Fantasy', '1954-07-29'),
    ('Le Meurtre de Roger Ackroyd', 4, 'Un classique de la littérature policière avec Hercule Poirot', 'Policier', '1926-06-01'),
    ('Fondation', 5, 'Le premier livre de la série Fondation, sur un futur galactique', 'Science-fiction', '1951-06-01');

INSERT INTO Utilisateur (motDePasse, nomUtilisateur, type)
VALUES 
    ('clientpass1', 'client1', FALSE),  -- Client
    ('clientpass2', 'client2', FALSE),  -- Client
    ('clientpass3', 'client3', FALSE),  -- Client
    ('adminpass', 'admin', TRUE);  -- Administrateur

INSERT INTO Emprunt (date_emprunt, date_limite, livre_id, utilisateur_id)
VALUES 
    ('2025-03-01', '2025-03-15', 1, 1),  -- Client 1 emprunte "Harry Potter à l'école des sorciers"
    ('2025-03-01', '2025-03-15', 2, 2),  -- Client 2 emprunte "1984"
    ('2025-03-01', '2025-03-15', 3, 3),  -- Client 3 emprunte "Le Seigneur des Anneaux"
    ('2025-03-01', '2025-03-15', 4, 1),  -- Client 1 emprunte "Le Meurtre de Roger Ackroyd"
    ('2025-03-01', '2025-03-15', 5, 2);  -- Client 2 emprunte "Fondation"
INSERT INTO Solde (montant, date_limite_paiement, emprunt_id, utilisateur_id)
VALUES 
    (10.00, '2025-03-30', 1, 1),  -- Client 1 doit 10.00 pour un retard
    (5.00, '2025-03-30', 2, 2);  -- Client 2 doit 5.00 pour un retard
   --Rajouter remplacer style par catgeorie type de livre, consulter dispo d'un livre backlog, flitrage oar catégorue, gabarit specififation logiciel