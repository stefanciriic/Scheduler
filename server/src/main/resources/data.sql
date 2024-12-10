CREATE TABLE business (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    description VARCHAR(255),
    owner_id BIGINT,
    working_hours VARCHAR(255)
);

CREATE TABLE employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    business_id BIGINT NOT NULL,
    FOREIGN KEY (business_id) REFERENCES business(id)
);
