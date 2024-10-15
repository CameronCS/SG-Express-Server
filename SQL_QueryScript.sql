create database SGDB;
use SGDB;

create table users(
	id 			int auto_increment not null primary key,
    first_name	varchar(50) not null,
    last_name 	varchar(50) not null,
    username	varchar(50) not null unique,
    password	varchar(1000) not null,
    image_path	varchar(50) not null,
    is_admin	boolean not null,
    contact_no	varchar(10) not null
);

create table child(
	id			int auto_increment not null primary key,
    first_name 	varchar(50) not null,
    last_name   varchar(50) not null,
    class_name	varchar(50) not null,
    image_path	varchar(50) not null,
    notes		varchar(500) not null
);

create table child_parent(
	id		int auto_increment not null primary key,
    c_id	int,
    u_id 	int,
    foreign key (c_id) references child(id),
    foreign key (u_id) references users(id)
);

CREATE TABLE emails (
    id INT NOT NULL AUTO_INCREMENT,
    sender_username VARCHAR(100) NOT NULL,
    receiver_username VARCHAR(100) NOT NULL,
    subject VARCHAR(255) not null,
    body TEXT not null,
    status varchar(10) not null,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletters (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(255) NOT NULL
);

CREATE TABLE gallery_collection (
    id INT AUTO_INCREMENT not null PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    year INT NOT NULL
);

create table gallery_images(
	id int auto_increment not null primary key,
    collection_id int not null,
    image_path varchar(255) not null,
    foreign key (collection_id) references gallery_collection(id)
);

CREATE TABLE media_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE arts_and_crafts_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE additional_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tips_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tip_text TEXT NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






