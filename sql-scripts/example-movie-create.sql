-- Example Data Insertion Script for Interstellar

--CLEANUP
DELETE FROM people;
DELETE FROM movies;
DELETE FROM movie_directors;
DELETE FROM movie_actors;
DELETE FROM movie_writers;
DELETE FROM movie_disks;
--CLEANUP END

INSERT INTO people (name) VALUES ('Christopher Nolan');
INSERT INTO people (name) VALUES ('Matthew McConaughey');
INSERT INTO people (name) VALUES ('Anne Hathaway');

INSERT INTO movies (title, description, year, runtime_min, imdb_id) VALUES
('Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 2014, 169, 'tt0816692');

INSERT INTO movie_directors (movie_id, person_id) VALUES
((SELECT id FROM movies WHERE title = 'Interstellar'), (SELECT id FROM people WHERE name = 'Christopher Nolan'));

INSERT INTO movie_actors (movie_id, person_id, character_name) VALUES
((SELECT id FROM movies WHERE title = 'Interstellar'), (SELECT id FROM people WHERE name = 'Matthew McConaughey'), 'Cooper'),
((SELECT id FROM movies WHERE title = 'Interstellar'), (SELECT id FROM people WHERE name = 'Anne Hathaway'), 'Brand');

-- Create Disk 1 --
INSERT INTO movie_disks (movie_id, disk_region, disk_format)
VALUES (
  (SELECT id FROM movies WHERE title = 'Interstellar'),
  (SELECT id FROM regions WHERE name = 'Region Free'),
  (SELECT id FROM formats WHERE name = '4K Ultra HD')
), (
  (SELECT id FROM movies WHERE title = 'Interstellar'),
  (SELECT id FROM regions WHERE name = 'Region A'),
  (SELECT id FROM formats WHERE name = 'Blu-Ray')
);

SELECT * FROM movie_overview;