CREATE DATABASE tmf_db;

USE tmf_db;

CREATE TABLE customers (
  customer_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	customer_name VARCHAR(150) NOT NULL,
  contact VARCHAR(150),
  address VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(15)
);


CREATE TABLE quotes (
  quote_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY
);


-- Initiate Values
INSERT INTO customers VALUES('', 'SBS', 'person', 'address', 'email@example.com', '123-456-7890');
INSERT INTO quotes VALUES('');
