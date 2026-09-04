CREATE TABLE IF NOT EXISTS trip_plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  trip_title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  travelers_count INT UNSIGNED NOT NULL DEFAULT 1,
  estimated_budget DECIMAL(12,2) NULL,
  contact_phone VARCHAR(50) NULL,
  contact_email VARCHAR(255) NULL,
  special_requests TEXT NULL,
  status ENUM('planned','confirmed','cancelled') NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_trip_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_plans_user_created (user_id, created_at),
  INDEX idx_trip_plans_status_created (status, created_at)
);
