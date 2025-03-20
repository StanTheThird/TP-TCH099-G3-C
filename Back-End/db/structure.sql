

-- Création de la table Utilisateur
CREATE TABLE Utilisateur (
    id_utilisateur INT(10) NOT NULL AUTO_INCREMENT,
    nom VARCHAR(55) NOT NULL,
    prenom VARCHAR(55) NOT NULL,
    mot_de_passe VARCHAR(55) NOT NULL,
    nom_utilisateur VARCHAR(55) NOT NULL,
    type BOOLEAN NOT NULL, -- TRUE pour admin, FALSE pour client
    PRIMARY KEY(id_utilisateur)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Auteur
CREATE TABLE Auteur (
    id_auteur INT(10) NOT NULL AUTO_INCREMENT,
    prenom VARCHAR(55) NOT NULL,
    nom VARCHAR(55) NOT NULL,
    date_naissance DATE,
    nationalite VARCHAR(55),
    biographie VARCHAR (255),
    PRIMARY KEY (id_auteur)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table catégorie
CREATE TABLE Categorie(
    id_categorie INT(10) NOT NULL AUTO_INCREMENT,
    nom VARCHAR(55) NOT NULL,
    PRIMARY KEY(id_categorie)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table langue
CREATE TABLE Langue(
    id_langue INT(10) NOT NULL AUTO_INCREMENT,
    nom VARCHAR(55) NOT NULL,
    PRIMARY KEY(id_langue)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Livre
CREATE TABLE Livre (
    id_livre INT(10) NOT NULL AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date_parution DATE NOT NULL,
    image VARCHAR(255) NOT NULL,
    categorie_id INT(10) NOT NULL,
    auteur_id INT(10) NOT NULL,
    langue_id INT(10) NOT NULL,
    PRIMARY KEY(id_livre),
    FOREIGN KEY (auteur_id) REFERENCES Auteur(id_auteur) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES Categorie(id_categorie) ON DELETE CASCADE,
    FOREIGN KEY (langue_id) REFERENCES Langue(id_langue) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Image (Image du livre)
CREATE TABLE Image (
    id_image INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,  -- URL de l'image
    livre_id INT,
    FOREIGN KEY (livre_id) REFERENCES Livre(id_livre) ON DELETE CASCADE
);

-- Création de la table Emprunt
CREATE TABLE Emprunt (
    id_emprunt INT(10)  NOT NULL AUTO_INCREMENT,
    date_emprunt DATE NOT NULL,
    date_limite DATE NOT NULL,
    date_retour DATE ,
    livre_id INT(10) NOT NULL,
    utilisateur_id INT(10) NOT NULL,
    PRIMARY KEY(id_emprunt),
    FOREIGN KEY (livre_id) REFERENCES Livre(id_livre) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Solde
CREATE TABLE Solde (
    id_solde INT(10) NOT NULL AUTO_INCREMENT,
    montant DECIMAL(10, 2) NOT NULL,
    date_limite_paiement DATE,
    emprunt_id INT(10) NOT NULL,
    utilisateur_id INT(10) NOT NULL,
    PRIMARY KEY(id_solde),
    FOREIGN KEY (emprunt_id) REFERENCES Emprunt(id_emprunt) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Index de la table livre
CREATE INDEX idx_auteur_id ON Livre(auteur_id);
CREATE INDEX idx_categorie_id ON Livre(categorie_id);
CREATE INDEX idx_langue_id ON Livre(langue_id);
CREATE INDEX idx_titre ON Livre(titre);
CREATE INDEX idx_date_parution ON Livre(date_parution);

-- Index de la table emprunt
CREATE INDEX idx_livre_id ON Emprunt(livre_id);
CREATE INDEX idx_utilisateur_id ON Emprunt(utilisateur_id);

-- Index de la table solde
CREATE INDEX idx_emprunt_id ON Solde(emprunt_id);
CREATE INDEX idx_utilisateur_id_solde ON Solde(utilisateur_id);

-- Index de la table utilisateur
CREATE UNIQUE INDEX idx_unique_nom_utilisateur ON Utilisateur(nom_utilisateur);
COMMIT;