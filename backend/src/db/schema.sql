CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  profile_image VARCHAR(255) NULL,
  profile_image_url TEXT NULL,
  date_of_birth DATE NULL,
  gender ENUM('male','female','other') NULL,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  address VARCHAR(255) NULL,
  postal_code VARCHAR(20) NULL,
  language VARCHAR(50) NULL,
  bio TEXT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  settings JSON NOT NULL DEFAULT (JSON_OBJECT()),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME NULL DEFAULT NULL,
  last_login_at DATETIME NULL DEFAULT NULL,
  last_activity_at DATETIME NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS destinations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  popularity_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration VARCHAR(100) NOT NULL,
  CONSTRAINT fk_activities_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  capacity INT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_trips_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_activities (
  trip_id INT UNSIGNED NOT NULL,
  activity_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (trip_id, activity_id),
  CONSTRAINT fk_trip_activities_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_activities_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  trip_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  selected_date DATE NULL,
  travelers_count INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  special_requests TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  topic VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  trip_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_activity (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  action_type ENUM('view_trip','book_trip','contact') NOT NULL,
  trip_id INT UNSIGNED NULL,
  destination_id INT UNSIGNED NULL,
  booking_id INT UNSIGNED NULL,
  contact_message_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_activity_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_activity_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_activity_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_activity_contact FOREIGN KEY (contact_message_id) REFERENCES contact_messages(id) ON DELETE SET NULL,
  INDEX idx_user_activity_user_created (user_id, created_at),
  INDEX idx_user_activity_action_created (action_type, created_at)
);

CREATE TABLE IF NOT EXISTS user_activity_tracking (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NULL,
  activity_id INT UNSIGNED NULL,
  action_type ENUM('view','book') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tracking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tracking_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
  CONSTRAINT fk_tracking_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);
