-- Add search indexes (FULLTEXT + supporting indexes)
-- Note: Requires MySQL/InnoDB FULLTEXT support (MySQL 5.6+). If FULLTEXT is not available,
-- the /api/search endpoint will still work via LIKE fallback when fuzzy=true.

-- Destinations: boost title/subtitle/summary/long_description
ALTER TABLE destinations
  ADD FULLTEXT INDEX ft_destinations_content (title, subtitle, summary, long_description);

-- Activities ("stages")
ALTER TABLE activities
  ADD FULLTEXT INDEX ft_activities_content (name, description);

-- Users (admin search)
ALTER TABLE users
  ADD FULLTEXT INDEX ft_users_content (name, email, bio);

-- Bookings (admin search)
ALTER TABLE bookings
  ADD FULLTEXT INDEX ft_bookings_content (special_requests, notes);
