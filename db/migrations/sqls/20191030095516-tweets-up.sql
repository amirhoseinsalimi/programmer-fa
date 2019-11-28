/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS tweets (
    `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `tweet_id` VARCHAR(100) NOT NULL,
    `tweet_text` VARCHAR(1000) NOT NULL,
    `user_name` VARCHAR(30) NOT NULL,
    `user_id` VARCHAR(100) NOT NULL,
    `created_at` VARCHAR(100) NOT NULL
);
