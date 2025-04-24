-- Création de la table Utilisateur (avec gestion du solde directement ici)
CREATE TABLE Utilisateur (
    id_utilisateur INT(10) NOT NULL AUTO_INCREMENT,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100) NOT NULL,
    mot_de_passe   VARCHAR(255) NOT NULL,
    nom_utilisateur VARCHAR(100) NOT NULL,
    type           BOOLEAN       NOT NULL DEFAULT 0,  -- 0 = client, 1 = admin
    solde          DECIMAL(10,2) NOT NULL DEFAULT 0,  -- solde en $ CAD
    PRIMARY KEY (id_utilisateur),
    UNIQUE KEY  (nom_utilisateur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Auteur
CREATE TABLE Auteur (
    id_auteur     INT(10) NOT NULL AUTO_INCREMENT,
    prenom        VARCHAR(55)  NOT NULL,
    nom           VARCHAR(55)  NOT NULL,
    image         VARCHAR(255) NOT NULL,
    date_naissance DATE,
    nationalite   VARCHAR(55),
    biographie    TEXT,
    PRIMARY KEY (id_auteur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Categorie
CREATE TABLE Categorie (
    id_categorie INT(10) NOT NULL AUTO_INCREMENT,
    nom          VARCHAR(55) NOT NULL,
    PRIMARY KEY (id_categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Langue
CREATE TABLE Langue (
    id_langue INT(10) NOT NULL AUTO_INCREMENT,
    nom       VARCHAR(55) NOT NULL,
    PRIMARY KEY (id_langue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Livre
CREATE TABLE Livre (
    id_livre      INT(10) NOT NULL AUTO_INCREMENT,
    code_livre    INT        NOT NULL,
    titre         VARCHAR(255) NOT NULL,
    description   TEXT       NOT NULL,
    date_parution DATE       NOT NULL,
    image         VARCHAR(255) NOT NULL,
    nb_pages      INT        NOT NULL,
    format        VARCHAR(25) CHECK (format IN ('Livre de poche','Livre numérique','Livre relié')),
    emprunte      BOOLEAN    NOT NULL DEFAULT FALSE,
    categorie_id  INT(10)    NOT NULL,
    auteur_id     INT(10)    NOT NULL,
    langue_id     INT(10)    NOT NULL,
    PRIMARY KEY (id_livre),
    FOREIGN KEY (auteur_id)    REFERENCES Auteur(id_auteur)    ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES Categorie(id_categorie) ON DELETE CASCADE,
    FOREIGN KEY (langue_id)    REFERENCES Langue(id_langue)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Création de la table Emprunt
CREATE TABLE Emprunt (
    id_emprunt     INT(10) NOT NULL AUTO_INCREMENT,
    date_emprunt   DATE      NOT NULL,
    date_limite    DATE      NOT NULL,
    date_retour    DATE,
    livre_id       INT(10)   NOT NULL,
    utilisateur_id INT(10)   NOT NULL,
    est_paye          BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_emprunt),
    FOREIGN KEY (livre_id)       REFERENCES Livre(id_livre)       ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Indexes pour optimiser les recherches
CREATE INDEX idx_auteur_id        ON Livre(auteur_id);
CREATE INDEX idx_categorie_id     ON Livre(categorie_id);
CREATE INDEX idx_langue_id        ON Livre(langue_id);
CREATE INDEX idx_titre            ON Livre(titre);
CREATE INDEX idx_date_parution    ON Livre(date_parution);
CREATE INDEX idx_livre_id         ON Emprunt(livre_id);
CREATE INDEX idx_utilisateur_id   ON Emprunt(utilisateur_id);
