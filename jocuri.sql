-- stergem tabelele vechi daca exista pentru a putea rula scriptul de la zero fara erori
DROP TABLE IF EXISTS jocuri;
DROP TYPE IF EXISTS gen_joc;
DROP TYPE IF EXISTS platforma_joc;

-- 5. categorie mare 
CREATE TYPE gen_joc AS ENUM('actiune', 'RPG', 'sport', 'strategie', 'horror');

-- 6. categorie secundară
CREATE TYPE platforma_joc AS ENUM('PC', 'PlayStation', 'Xbox', 'Nintendo', 'Multi-platform');

CREATE TABLE IF NOT EXISTS jocuri (
   id SERIAL PRIMARY KEY,                                      -- 1. id numeric
   nume VARCHAR(100) UNIQUE NOT NULL,                          -- 2. nume
   descriere TEXT,                                             -- 3. descriere
   imagine VARCHAR(300),                                       -- 4. imagine 
   gen gen_joc NOT NULL,                                       -- 5. categorie mare 
   platforma platforma_joc NOT NULL,                           -- 6. categorie secundară 
   pret NUMERIC(8,2) NOT NULL,                                 -- 7. preț 
   scor_metacritic INT NOT NULL CHECK (scor_metacritic >= 0 AND scor_metacritic <= 100), -- 8. a 2-a caracteristica numerica
   data_adaugare DATE DEFAULT CURRENT_DATE,                    -- 9. data calendaristica
   varsta_minima INT NOT NULL CHECK (varsta_minima IN (3, 7, 12, 16, 18)), -- 10. o singura valoare dintr-un set (PEGI)
   limbi_disponibile VARCHAR(250) NOT NULL,                    -- 11. mai multe valori într-un camp (separate prin virgula)
   multiplayer_online BOOLEAN NOT NULL DEFAULT FALSE           -- 12. boolean
);

-- 16 entitati diversificate 
INSERT INTO jocuri (nume, descriere, imagine, gen, platforma, pret, scor_metacritic, data_adaugare, varsta_minima, limbi_disponibile, multiplayer_online) VALUES 

('Elden Ring', 'Un RPG masiv de acțiune într-o lume fantezistă plină de pericole la tot pasul.', 'elden_ring.jpg', 'RPG', 'Multi-platform', 299.99, 96, '2023-03-10', 16, 'engleză, franceză, germană, spaniolă', TRUE),

('The Witcher 3: Wild Hunt', 'Explorează un continent devastat în pielea vânătorului de monștri Geralt.', 'the_witcher_3.jpg', 'RPG', 'Multi-platform', 149.50, 93, '2022-06-15', 18, 'română, engleză, poloneză, italiană', FALSE),

('Resident Evil 4 Remake', 'Agentul Leon S. Kennedy este trimis să o salveze pe fiica președintelui dintr-un sat terorizat.', 'resident_evil_4.jpg', 'horror', 'PlayStation', 249.99, 91, '2023-05-22', 18, 'engleză, japoneză, spaniolă', FALSE),

('Super Mario Odyssey', 'Alătură-te lui Mario într-o aventură 3D uriașă pe planetă pentru a o salva pe Peach.', 'mario_odyssey.png', 'actiune', 'Nintendo', 259.00, 97, '2022-01-08', 3, 'engleză, franceză, japoneză', FALSE),

('EA Sports FC 26', 'Cel mai complet simulator de fotbal, cu grafică de ultimă generație și echipe actualizate.', 'fifa.png', 'sport', 'Multi-platform', 349.99, 76, '2024-09-27', 3, 'română, engleză, spaniolă, italiană', TRUE),

('Age of Empires IV', 'Comandă armate mari în bătălii istorice epice și construiește un imperiu măreț.', 'Age_of_Empires_IV.png', 'strategie', 'PC', 179.99, 81, '2022-11-03', 12, 'engleză, germană, chineză', TRUE),

('Silent Hill 2 Remake', 'James Sunderland se întoarce în orașul bântuit după ce primește o scrisoare de la soția decedată.', 'Silent_Hill_2_remake.jpg', 'horror', 'PC', 199.00, 87, '2024-02-14', 18, 'engleză, spaniolă, japoneză', FALSE),

('Civilization VI', 'Un joc de strategie pe ture în care încerci să îți conduci poporul din antichitate în viitor.', 'Civilization_VI.jpg', 'strategie', 'PC', 99.00, 88, '2021-08-19', 7, 'engleză, franceză, germană', TRUE),

('Minecraft', 'Plasează blocuri și pornești în aventuri nelimitate într-o lume generată complet aleatoriu.', 'minecraft.jpg', 'actiune', 'Multi-platform', 120.00, 93, '2021-03-30', 7, 'română, engleză, maghiară, spaniolă', TRUE),

('Gran Turismo 7', 'Simulatorul auto definitiv care combină colecționarea de mașini cu realismul curselor pe circuit.', 'gran_turismo_7.webp', 'sport', 'PlayStation', 299.00, 87, '2023-07-11', 3, 'engleză, italiană, germană', TRUE),

('Counter-Strike 2', 'Liderul mondial al jocurilor competitive de tip shooter pe echipe. Rush B!', 'CS2.webp', 'actiune', 'PC', 0.00, 82, '2023-09-27', 16, 'română, engleză, ucraineană, turcă', TRUE),

('Cyberpunk 2077', 'Un RPG de acțiune plasat în Night City, o metropolă obsedată de modă și cibernetică.', 'Cyberpunk_2077.jpg', 'RPG', 'Xbox', 139.99, 86, '2022-04-05', 18, 'engleză, germană, spaniolă', FALSE),

('Hades', 'Înfruntă zeii din infern în timp ce încerci să scapi din lumea subterană a mitologiei grecești.', 'Hades.jpg', 'RPG', 'Nintendo', 115.00, 93, '2022-09-17', 12, 'engleză, franceză, rusă', FALSE),

('It Takes Two', 'O aventură cooperativă minunată unde doi părinți transformați în păpuși trebuie să colaboreze.', 'It_Takes_Two.png', 'actiune', 'Xbox', 159.00, 89, '2023-01-24', 12, 'engleză, spaniolă, chineză', TRUE),

('Alan Wake 2', 'Un scriitor blocat într-o dimensiune de coșmar scrie o poveste pentru a schimba realitatea din jur.', 'alan_wake_2.avif', 'horror', 'Multi-platform', 210.00, 89, '2024-04-08', 18, 'engleză, germană, finlandeză', FALSE),

('Rocket League', 'Fotbal cu mașini propulsate de rachete într-un amestec haotic de sport și distrugere.', 'rocket_league.png', 'sport', 'Nintendo', 0.00, 85, '2021-12-01', 3, 'engleză, franceză, spaniolă', TRUE);