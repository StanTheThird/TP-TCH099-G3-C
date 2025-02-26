--Faire les tables ici :
CREATE TABLE Livre (
    `id_livre` int(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `titre` varchar(50) Not NULL,
    `auteur` varchar(50),
    `description` varchar(255),
    `style` varchar(50),
    `date_parution` DATE,
);
CREATE TABLE Utilisateur (
    `id_utilisateur` int(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `motDePasse` varchar(50) Not NULL,
    `nomUtilisateur` varchar(50) Not NULL UNIQUE,
    type ENUM('Client', 'Admin') NOT NULL DEFAULT 'Client'
);
CREATE TABLE Emprunt (
    
);
CREATE TABLE Inscription (
    
);

CREATE TABLE `coaches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--Il reste encore a faire les liens entre les différentes table et les populates dans data

