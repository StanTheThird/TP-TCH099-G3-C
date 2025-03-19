--Il faut inserer les informations de livres, clients et autres ici.
-- Insertion des données dans la table catégorie
INSERT INTO Categorie (nom) VALUES ('Fantasy'), ('Romance'), ('Policier'), ('Science-fiction');

-- Insertion des données dans la table Langue
INSERT INTO Langue (nom) VALUES ('Français'), ('Anglais'), ('Espagnol');

-- Insertion des données dans la table Auteur
INSERT INTO Auteur (prenom, nom, date_naissance,nationalite, biographie)
VALUES 
    ('John Ronald Reuel', 'Tolkien', '1892-01-03', 'Britannique', 'J.R.R. Tolkien est un écrivain, surtout connu pour ses œuvres de fantasy,
     notamment "Le Hobbit" et "Le Seigneur des Anneaux". Il est souvent considéré comme le père de la littérature moderne de fantasy.
     Son œuvre est influencée par la mythologie, les légendes et les langues anciennes.'),
    ('Clive Staples', 'Lewis', '1898-11-29', 'Britannique', 'C.S. Lewis était un écrivain, professeur et théologien britannique,
     mieux connu pour sa série "Les Chroniques de Narnia". Il a été l''un des intellectuels chrétiens les plus influents du XXe siècle.'),
    ('Joanne', 'Rowling', '1965-07-31', 'Britannique', 'J.K. Rowling est une auteure britannique mondialement célèbre, surtout connue pour
     la série "Harry Potter". Ses livres ont captivé des millions de lecteurs à travers le monde et ont été adaptés en films à succès.'),
    ('Jane', ' Austen', '1775-12-16', 'Britannique', 'Jane Austen est une auteure anglaise du XVIIIe siècle, surtout connue pour ses romans
     traitant des mœurs et des relations sociales. Bien qu''elle n''ait pas connu de succès de son vivant, elle est maintenant considérée comme
     l''une des plus grandes écrivaines anglaises'),
    ('Julia', 'Quinn', '1970-01-08', 'Américaine', 'Julia Quinn est une auteure américaine de romans historiques, surtout connue pour sa série "Les Bridgerton".
     Elle a écrit plus de 20 romans, principalement dans le genre romance historique, et est l''une des auteures les plus populaires de ce genre.');
    ('Agatha', 'Christie', '1890-09-15', 'Britannique', 'Agatha Christie est une auteure britannique, l''une des plus grandes figures du roman policier.
     Christie a écrit 66 romans policiers, 14 recueils de nouvelles et de nombreuses pièces de théâtre. Elle est connue pour ses intrigues complexes et ses retournements de situation.');
    ('Sir Arthur Ignatius', 'Conan Doyle', '1859-05-22', 'Britannique', 'Sir Arthur Conan Doyle était un écrivain écossais, mieux connu pour avoir créé le célèbre détective Sherlock Holmes.
     Il a également écrit des romans historiques, des récits de science-fiction et des ouvrages de spiritualisme.');
    ('Frank', 'Herbert', '1920-10-08', 'Américain', 'Frank Herbert était un écrivain américain de science-fiction, surtout connu pour sa série "Dune".
     "Dune" est l''une des œuvres les plus influentes du genre, abordant des thèmes de politique, d''écologie et de religion dans un futur lointain.
      Herbert a écrit plusieurs autres romans de science-fiction tout au long de sa carrière.');
    ('Herbert George', 'Wells', '1866-09-21', 'Britannique', 'H.G. Wells est un écrivain britannique, pionnier de la science-fiction. Il est l''auteur de classiques
     tels que "La Guerre des mondes", "L''Invasion divine" et "La Machine à explorer le temps". Ses œuvres ont souvent exploré des thèmes sociaux et technologiques,
      et il est considéré comme l''un des précurseurs de la science-fiction moderne.');

-- Insertion des données dans la table Livre
INSERT INTO Livre (titre,description,date_parution,image, categorie_id, auteur_id, langue_id)
VALUES 
    ('Le Seigneur des Anneaux','Un epic de fantasy qui raconte l''histoire de la destruction de l''Anneau Unique, une arme de pouvoir maléfique, et des aventures
     de Frodon Sacquet et ses compagnons pour sauver la Terre du Milieu.','1954-07-29','/Front-End-Web/ressources/seigneurDesAnneaux.jpg',1,1,2),
    ('Le Hobbit','L''histoire de Bilbo Baggins, un hobbit qui se lance dans une aventure pour aider un groupe de nains à récupérer leur royaume perdu.','1937-09-21',
    '/Front-End-Web/ressources/hobbit.jpg',1,1,1),
    ('Le Lion, la Sorcière Blanche et l''Armoire Magique ','Quatre enfants découvrent une armoire magique qui les transporte dans le monde de Narnia, où ils rencontrent
     des créatures fantastiques et luttent contre une sorcière maléfique.','1950-10-16','/Front-End-Web/ressources/armoireMagique.jpg',1,2,1),
    ('Le Prince Caspian ','Quelques années après leur première aventure, les enfants Pevensie retournent à Narnia pour découvrir que des siècles se sont écoulés. Le royaume est sous
     l''oppression de l''usurpateur Miraz. Le prince Caspian, héritier légitime, leur demande de l''aide pour reprendre son trône et sauver Narnia.',
     '1951-10-15','/Front-End-Web/ressources/princeCaspian.jpg',1,2,1),
    ('Harry Potter à l''école des sorciers','Le premier livre de la série Harry Potter où un jeune orphelin découvre qu''il est un sorcier et entame sa scolarité à l''école de sorcellerie
     Poudlard.','1997-06-26','/Front-End-Web/ressources/ecoleSorciers.jpg',1,3,2),
    ('Harry Potter et la Chambre des Secrets','Harry Potter, le jeune sorcier enquête sur des événements mystérieux à Poudlard et découvre une chambre secrète où des créatures maléfiques
     sont cachées.','1998-07-02','/Front-End-Web/ressources/chambreSecrets.jpg',1,3,2),
    ('Orgueil et Préjugés','Un roman sur l''amour et les classes sociales, où Elizabeth Bennet et Mr. Darcy luttent contre leurs préjugés pour finir ensemble.','1813-01-28',
    '/Front-End-Web/ressources/orgueilPrejuges.jpg',2,4,3),
    ('Raison et Sentiments','L’histoire des sœurs Dashwood, Elinor et Marianne, et de leur lutte pour équilibrer l’amour et la raison.','1811-10-28','/Front-End-Web/ressources/sentiments.jpg',2,4,1),
    ('La Promesse du Marquis','Ce livre raconte l’histoire d’un homme qui, pour sauver son nom, se voit obligé de faire une promesse d’amour à une jeune femme.','2000-01-01',
    '/Front-End-Web/ressources/marquis.jpg',2,5,1),
    ('Les Quatre Premiers Mariages','L’histoire de l’histoire de la famille Rokesby et des amours contrariés dans la haute société anglaise du 18e siècle.','2016-09-26',
    '/Front-End-Web/ressources/mariages.jpg',2,5,2),
    ('Le Crime de l''Orient-Express',' Un meurtre est commis à bord du célèbre train de luxe, l''Orient-Express, et Hercule Poirot est appelé pour résoudre le mystère.','1934-01-01',
    '/Front-End-Web/ressources/orientExpress.jpg',3,6,1),
    ('Dix Petits Nègres','Dix personnes invitées sur une île déserte sont tuées une par une selon une comptine, et il revient à un détective de résoudre ce meurtre mystérieux.','1939-11-06',
    '/Front-End-Web/ressources/dixPetits.jpg',3,6,2),
    ('Une Étude en Rouge','Sherlock Holmes et son fidèle Dr Watson résolvent leur première enquête ensemble, où un meurtre mystérieux a lieu à Londres.',
    '1887-11-01','/Front-End-Web/ressources/etudeEnRouge.jpg',3,7,3),
    ('Le Chien des Baskerville','Un célèbre mystère de Sherlock Holmes où il doit enquêter sur une légende familiale impliquant un chien géant.','1902-08-01',
    '/Front-End-Web/ressources/chienBaskerville.jpg',3,7,3),
    ('Dune',' L’histoire épique se déroule sur la planète désertique Arrakis, où l''humanité lutte pour le contrôle de l''épice, une substance précieuse qui permet le voyage spatial.',
    '1965-08-01','/Front-End-Web/ressources/dune.jpg',4,8,1),
    ('Le Messie de Dune','Suite de Dune, ce livre suit Paul Atreides, devenu empereur, alors qu''il doit naviguer entre les enjeux politiques, religieux et familiaux.','1969-11-06',
    '/Front-End-Web/ressources/messieDune.jpg',4,8,2),
    ('La Machine à explorer le temps','Un scientifique voyage dans le futur pour découvrir un monde où les humains sont divisés en deux races distinctes.','1895',
    '/Front-End-Web/ressources/machine.jpg',4,9,2),
    (' L''Île du docteur Moreau','Un naufragé arrive sur une île habitée par un scientifique qui mène des expériences biologiques sur des animaux.','1896',
    '/Front-End-Web/ressources/docteurMoreau.jpg',4,9,2),;

-- Insertion des données dans la table Emprunt
INSERT INTO Emprunt (date_emprunt, date_limite, livre_id, utilisateur_id)
VALUES 
    ('2025-03-01', '2025-03-15', 1, 1); 

-- Insertion des données dans la table Solde
INSERT INTO Solde (montant, date_limite_paiement, emprunt_id, utilisateur_id)
VALUES 
    (10.00, '2025-03-30', 1, 1);  

-- Insertion des données dans la table Utilisateur
INSERT INTO Inscription (prenon, nom, mot_de_passe, nom_utilisateur)
VALUES 
    ('Jean', 'Dupont', 'password123''client1',);
