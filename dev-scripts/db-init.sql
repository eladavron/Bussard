-- Pre Cleanup --
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS formats CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS movie_directors CASCADE;
DROP TABLE IF EXISTS movie_actors CASCADE;
DROP TABLE IF EXISTS movie_writers CASCADE;
DROP TABLE IF EXISTS movie_disks CASCADE;
DROP TABLE IF EXISTS movie_images CASCADE;
DROP TABLE IF EXISTS disk_format CASCADE;
DROP TABLE IF EXISTS disk_region CASCADE;
DROP VIEW IF EXISTS movie_overview CASCADE;

--- Native Types ---
-- Formats --
CREATE TABLE formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- e.g., DVD, Blu-Ray, 4K, Digital
  sort_order INT NOT NULL DEFAULT 0 -- For custom ordering of formats
);

INSERT INTO formats (name, sort_order) VALUES
('DVD', 0),
('Blu-Ray', 1),
('Blu-Ray 3D', 2),
('4K Ultra HD', 3),
('Digital', 4);
REVOKE ALL ON formats FROM PUBLIC;

-- Regions --
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE  -- e.g., Region 1, Region 2, Region Free
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
REVOKE ALL ON regions FROM PUBLIC;

-- People --
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Images --

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mime_type TEXT NOT NULL CHECK (mime_type in ('image/jpeg', 'image/png', 'image/gif', 'image/webp')),
    byte_data BYTEA NOT NULL,
    width INT NOT NULL CHECK (width > 0),
    height INT NOT NULL CHECK (height > 0),
    byte_size INT NOT NULL CHECK (byte_size > 0)
);

--- Main Table ---

CREATE TABLE movies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  year              SMALLINT,
  runtime_min       SMALLINT,
  imdb_id           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  series            TEXT, -- In the future convert to a table
  aspect_ratio      TEXT, -- In the future convert to a table
  studio            TEXT, -- In the future convert to a table
  poster_image_id   UUID REFERENCES images(id) ON DELETE SET NULL
);

--- Many to Many Links ---
CREATE TABLE movie_disks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disk_number SMALLINT,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  disk_format UUID REFERENCES formats(id) ON DELETE CASCADE
);

CREATE TABLE movie_disk_regions (
  movie_disk_id UUID REFERENCES movie_disks(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_disk_id, region_id)
);

CREATE TABLE movie_directors (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, person_id)
);

CREATE TABLE movie_writers (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, person_id)
);

CREATE TABLE movie_actors (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  character_name TEXT,  -- Name of the character played
  PRIMARY KEY (movie_id, person_id)
);

CREATE VIEW movie_overview AS
WITH disk_with_regions AS (
  SELECT
    disk.id AS disk_id,
    disk.disk_number,
    disk.movie_id,
    disk.disk_format,
    f.id AS format_id,
    f.name AS format_name,
    jsonb_agg(DISTINCT jsonb_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL) AS regions
  FROM movie_disks disk
  LEFT JOIN formats f ON disk.disk_format = f.id
  LEFT JOIN movie_disk_regions mdr ON disk.id = mdr.movie_disk_id
  LEFT JOIN regions r ON mdr.region_id = r.id
  GROUP BY disk.id, f.id, f.name
)
SELECT
  m.id,
  title,
  description,
  year,
  runtime_min,
  imdb_id,
  created_at,
  series,
  aspect_ratio,
  studio,
  (CASE WHEN m.poster_image_id IS NOT NULL THEN
      jsonb_build_object(
          'id', pi.id,
          'mime_type', pi.mime_type,
          'width', pi.width,
          'height', pi.height,
          'byte_size', pi.byte_size,
          'byte_data', pi.byte_data
      )
   ELSE NULL END) AS poster_image,

  COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', pd.id, 'name', pd.name)) FILTER (WHERE pd.id IS NOT NULL), '[]') AS directors,
  COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', pa.id, 'name', pa.name, 'character', ma.character_name)) FILTER (WHERE pa.id IS NOT NULL), '[]') AS actors,
  COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', pw.id, 'name', pw.name)) FILTER (WHERE pw.id IS NOT NULL), '[]') AS writers,
  COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
    'id', dwr.disk_id,
    'disk_number', dwr.disk_number,
    'format', jsonb_build_object('id', dwr.format_id, 'name', dwr.format_name),
    'regions', COALESCE(dwr.regions, '[]')
  )) FILTER (WHERE dwr.disk_id IS NOT NULL), '[]') AS disks

FROM movies m
LEFT JOIN movie_directors md ON m.id = md.movie_id
LEFT JOIN people pd ON md.person_id = pd.id
LEFT JOIN movie_actors ma ON m.id = ma.movie_id
LEFT JOIN people pa ON ma.person_id = pa.id
LEFT JOIN movie_writers mw ON m.id = mw.movie_id
LEFT JOIN people pw ON mw.person_id = pw.id
LEFT JOIN disk_with_regions dwr ON m.id = dwr.movie_id
LEFT JOIN images pi ON m.poster_image_id = pi.id

GROUP BY m.id, pi.id;