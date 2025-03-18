

-- Création de la table Utilisateur
CREATE TABLE Utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    motDePasse VARCHAR(255) NOT NULL,
    nomUtilisateur VARCHAR(255) NOT NULL,
    type BOOLEAN NOT NULL  -- TRUE pour admin, FALSE pour client
);

-- Création de la table Style (Catégorie de livre)
CREATE TABLE Style (
    id_style INT AUTO_INCREMENT PRIMARY KEY,
    nom_style VARCHAR(255) NOT NULL
);

-- Création de la table Langue
CREATE TABLE Langue (
    id_langue INT AUTO_INCREMENT PRIMARY KEY,
    nom_langue VARCHAR(255) NOT NULL
);



-- Création de la table Auteur
CREATE TABLE Auteur (
    id_auteur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    date_naissance DATE,
    description TEXT
);

-- Création de la table Livre
CREATE TABLE Livre (
    id_livre INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    auteur_id INT,
    description TEXT,
    style_id INT,
    langue_id INT,
    date_parution DATE,
    FOREIGN KEY (auteur_id) REFERENCES Auteur(id_auteur),
    FOREIGN KEY (style_id) REFERENCES Style(id_style),
    FOREIGN KEY (langue_id) REFERENCES Langue(id_langue)
);

-- Création de la table Image (Image du livre)
CREATE TABLE Image (
    id_image INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,  -- URL de l'image
    livre_id INT,
    FOREIGN KEY (livre_id) REFERENCES Livre(id_livre)
);

-- Création de la table Emprunt
CREATE TABLE Emprunt (
    id_emprunt INT AUTO_INCREMENT PRIMARY KEY,
    date_emprunt DATE NOT NULL,
    date_limite DATE NOT NULL,
    date_retour DATE,
    livre_id INT,
    utilisateur_id INT,
    FOREIGN KEY (livre_id) REFERENCES Livre(id_livre),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur)
);

-- Création de la table Solde
CREATE TABLE Solde (
    id_solde INT AUTO_INCREMENT PRIMARY KEY,
    montant DECIMAL(10, 2) NOT NULL,
    date_limite_paiement DATE,
    emprunt_id INT,
    utilisateur_id INT,
    FOREIGN KEY (emprunt_id) REFERENCES Emprunt(id_emprunt),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id_utilisateur)
);

-- Création de la table Inscription
CREATE TABLE Inscription (
    id_inscription INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    confirmation_mot_de_passe VARCHAR(255) NOT NULL,
    id_utilisateur INT,
    FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id_utilisateur)
);
