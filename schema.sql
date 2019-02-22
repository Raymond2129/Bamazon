-- Need to create a database
CREATE DATABASE bamazon;

-- Need to use the database
USE bamazon;

-- Need to create a table with 5 columns
CREATE TABLE products (
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(6,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    PRIMARY KEY (id)
);