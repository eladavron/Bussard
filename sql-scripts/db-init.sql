-- Main Table --
CREATE TABLE movies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  year         SMALLINT,
  runtime_min  SMALLINT,
  imdb_id      TEXT UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Formats --
CREATE TABLE formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE  -- e.g., DVD, BluRay, 4K, Digital
);

CREATE TABLE movie_formats (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  format_id UUID REFERENCES formats(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, format_id)
);

INSERT INTO formats (name) VALUES
('DVD'),
('BluRay'),
('4K Ultra HD'),
('Digital');

-- Regions --
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE  -- e.g., Region 1, Region 2, Region Free
);

CREATE TABLE movie_regions ( -- Many-to-many relationship between movies and regions
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, region_id)
);

INSERT INTO regions (name) VALUES
('Region Free'),
('Region 1'),
('Region 2'),
('Region 3'),
('Region 4'),
('Region 5'),
('Region 6'),
('Region A'),
('Region B'),
('Region C');

-- People --
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE movie_directors ( -- Many-to-many relationship between movies and people
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, person_id)
);

CREATE TABLE movie_writers ( -- Many-to-many relationship between movies and people
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, person_id)
);

CREATE TABLE movie_actors ( -- Many-to-many relationship between movies and people
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  character_name TEXT,  -- Name of the character played
  PRIMARY KEY (movie_id, person_id)
);

-- Main View --
CREATE VIEW movie_overview AS
SELECT
  m.*,
  COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', pd.id, 'name', pd.name)) FILTER (WHERE pd.id IS NOT NULL), '[]') AS directors,
  COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', pa.id, 'name', pa.name, 'character', ma.character_name)) FILTER (WHERE pa.id IS NOT NULL), '[]') AS actors,
  COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', pw.id, 'name', pw.name)) FILTER (WHERE pw.id IS NOT NULL), '[]') AS writers
FROM movies m
LEFT JOIN movie_directors md ON m.id = md.movie_id
LEFT JOIN people pd ON md.person_id = pd.id
LEFT JOIN movie_actors ma ON m.id = ma.movie_id
LEFT JOIN people pa ON ma.person_id = pa.id
LEFT JOIN movie_writers mw ON m.id = mw.movie_id
LEFT JOIN people pw ON mw.person_id = pw.id
GROUP BY m.id;
SELECT * FROM movie_overview;