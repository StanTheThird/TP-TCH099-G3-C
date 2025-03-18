

-- Création de la table Utilisateur
CREATE TABLE Utilisateur (
    id_utilisateur INT(10) NOT NULL AUTO_INCREMENT,
    nom VARCHAR(55) NOT NULL,
    prenom VARCHAR(55) NOT NULL,
    mot_de_passe VARCHAR(55) NOT NULL,
    nom_utilisateur VARCHAR(55) NOT NULL,
    PRIMARY KEY(id_utilisateur),
    type BOOLEAN NOT NULL  -- TRUE pour admin, FALSE pour client
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Auteur
CREATE TABLE Auteur (
    id_auteur INT(10) NOT NULL AUTO_INCREMENT,
    prenom VARCHAR(55) NOT NULL,
    nom VARCHAR(55) NOT NULL,
    date_naissance DATE,
    natinalite VARCHAR(55),
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
    FOREIGN KEY (auteur_id) REFERENCES Auteur(id_auteur),
    FOREIGN KEY (categorie_id) REFERENCES Categorie(id_categorie),
    FOREIGN KEY (langue_id) REFERENCES Langue(id_langue)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Image (Image du livre)
CREATE TABLE Image (
    id_image INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,  -- URL de l'image
    livre_id INT,
    FOREIGN KEY (livre_id) REFERENCES Livre(id_livre)
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
    FOREIGN KEY (livre_id) REFERENCES Livre(id_livre),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Solde
CREATE TABLE Solde (
    id_solde INT(10) NOT NULL AUTO_INCREMENT,
    montant DECIMAL(10, 2) NOT NULL,
    date_limite_paiement DATE,
    emprunt_id INT,
    utilisateur_id INT,
    PRIMARY KEY(id_solde),
    FOREIGN KEY (emprunt_id) REFERENCES Emprunt(id_emprunt),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Index de la table livre
ALTER TABLE Livre
    ADD PRIMARY KEY(id_livre),
    ADD KEY categorie_id (categorie),
    ADD KEY auteur_id (auteur),
    ADD KEY langue_id (langue);

-- Index de la table emprunt
ALTER TABLE Emprunt
    ADD PRIMARY KEY(id_emprunt),
    ADD KEY livre_id (livre),
    ADD KEY utilisateur_id (utilisateur); 

-- Index de la table solde
ALTER TABLE Solde
    ADD PRIMARY KEY(id_solde),
    ADD KEY emprunt_id (emprunt),
    ADD KEY utilisateur_id (utilisateur);       

-- Index de la table utilisateur
ALTER TABLE Utilisateur
    ADD PRIMARY KEY(id_utilisateur),
    ADD UNIQUE KEY Utilisateur_UNIQUE (nom_utilisateur);

-- Index de la table auteur
ALTER TABLE Auteur
    ADD PRIMARY KEY(id_auteur);

-- Index de la table catégorie
ALTER TABLE Categorie
    ADD PRIMARY KEY(id_categorie);

-- Index de la table langue
ALTER TABLE Langue
    ADD PRIMARY KEY(id_langue);

--
-- AUTO_INCREMENT de la table livre
--
ALTER TABLE Livre
  MODIFY id_livre Int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la table emprunt
--
ALTER TABLE Emprunt
  MODIFY id_emprunt int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la table solde
--
ALTER TABLE Solde
  MODIFY id_solde int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la table Utilisateur
--
ALTER TABLE Utilisateur
  MODIFY id_utilisateur int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la table auteur
--
ALTER TABLE Auteur
  MODIFY id_auteur int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la table catégorie
--
ALTER TABLE Categorie
  MODIFY id_categorie int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la table langue
--
ALTER TABLE Langue
  MODIFY id_langue int(10) NOT NULL AUTO_INCREMENT;


COMMIT:
