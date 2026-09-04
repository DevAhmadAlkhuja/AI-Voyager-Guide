-- Extend existing destinations table with CMS fields (additive migration)

ALTER TABLE destinations
  ADD COLUMN slug VARCHAR(255) NULL,
  ADD COLUMN title VARCHAR(255) NULL,
  ADD COLUMN subtitle VARCHAR(255) NULL,
  ADD COLUMN country VARCHAR(100) NULL,
  ADD COLUMN city VARCHAR(100) NULL,
  ADD COLUMN summary TEXT NULL,
  ADD COLUMN long_description LONGTEXT NULL,
  ADD COLUMN tags JSON NULL,
  ADD COLUMN meta_title VARCHAR(255) NULL,
  ADD COLUMN meta_description VARCHAR(512) NULL,
  ADD COLUMN featured_image VARCHAR(255) NULL,
  ADD COLUMN images JSON NULL,
  ADD COLUMN is_published TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN priority INT NOT NULL DEFAULT 0,
  ADD COLUMN views_count INT NOT NULL DEFAULT 0,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Backfill for existing rows
UPDATE destinations
SET
  title = COALESCE(title, name),
  slug = COALESCE(slug, CONCAT(LOWER(REPLACE(name, ' ', '-')), '-', id)),
  is_published = 1
WHERE title IS NULL OR slug IS NULL;

-- Make required fields non-null after backfill
ALTER TABLE destinations
  MODIFY COLUMN slug VARCHAR(255) NOT NULL,
  MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- Indexes
CREATE UNIQUE INDEX ux_destinations_slug ON destinations (slug);
CREATE INDEX idx_destinations_published ON destinations (is_published);
CREATE INDEX idx_destinations_priority ON destinations (priority);
CREATE INDEX idx_destinations_country_city ON destinations (country, city);
