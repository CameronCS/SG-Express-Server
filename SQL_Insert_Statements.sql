INSERT INTO users (id, first_name, last_name, username, password, image_path, is_admin, contact_no) VALUES
(1, 'Karen', 'Botha', 'kabotha', '$2b$10$HuSIT.SFqUT4bCnhnWs1QuKQmBroNJNnNRkEJ6.oRWKovJfx8VOTG', '/uploads/Users/1727890668820.jpg', false, '0833031908'),
(2, 'Ryan', 'Botha', 'rybotha', '$2b$10$IjziK445uS3fViA1ls/OYOErnqWY/AmVHj9Ef4E/LcoI2qmuCwpnm', '/uploads/Users/1727890672762.jpg', false, '0827274365'),
(3, 'Charlie', 'Steyn', 'chsteyn', '$2b$10$0AzhCGY/jHc1KDEO5kFHyO6ovR0qTDGOwC.NfacV.YQF1R/MRJt5K', '/uploads/Admins/1727890676339.jpg', true, '0637888532'),
(4, 'Jim', 'Carrey', 'jicarrey', '$2b$10$BDbx9UxCOs3p3GMIYucpN.3nueKxX9WnDDCIJFnqzqiF9JiFQhhMa', '/uploads/Admins/1727890680880.jpg', true, '0637888532');

INSERT INTO child (id, first_name, last_name, class_name, image_path, notes) VALUES
(1, 'Consantine', 'Botha', 'Dinosaur Class', '/uploads/child/1727890688718.jpg', 'Allergic To Nuts'),
(2, 'Jamal', 'Botha', 'Caterpillar Class', '/uploads/child/1727890693090.jpg', 'Allergic To Nuts; Ryan is not Jamal\'s Dad; Has one less chromosome as well'),
(3, 'Maria', 'Botha', 'Caterpillar Class', '/uploads/child/1727890697221.jpg', 'Allergic to Bees');

INSERT INTO child_parent (id, c_id, u_id) VALUES
(1, 2, 1),
(2, 3, 1),
(3, 3, 2),
(4, 1, 1),
(5, 1, 2);

INSERT INTO emails (id, sender_username, receiver_username, subject, body, status, timestamp) VALUES
(1, 'kabotha', 'chsteyn', 'Test', 'This is a test email', 'read', '2024-10-02 19:55:01'),
(2, 'chsteyn', 'kabotha', 'Test', 'This is a test response', 'unread', '2024-10-02 19:55:37'),
(3, 'chsteyn', 'rybotha', 'Jamal', 'Hi Ryan\n\nIm So sorry to hear that Jamal is not your child\nIf you end up single so am I\n\nRegards\nCharlie', 'archived', '2024-10-02 19:56:26'),
(5, 'kabotha', 'chsteyn', 'Jamal', 'Hi Charlie\n\nPlease note jamal is not Ryans Child, L.o.L\n\nKaren', 'unread', '2024-10-02 19:58:45'),
(7, 'jicarrey', 'rybotha', 'Jamal', 'Soz Bru', 'unread', '2024-10-02 20:30:33');

INSERT INTO calendar (title, description, event_date)
VALUES 
('School Assembly', 'Weekly school assembly in the auditorium', '2024-10-08'),
('Parent-Teacher Meeting', 'Discuss student progress and upcoming activities', '2024-10-15'),
('Sports Day', 'Annual sports day at the main stadium', '2024-10-22'),
('Science Fair', 'Exhibition of science projects by students', '2024-11-01');

INSERT INTO newsletters (id, title, description, image_path) VALUES
(1, 'Zoo Trip', 'Its Zoo Day soon please be ready sign and send in consent forms', '/uploads/newsletters/1728328507392.png'),
(2, 'Bake Sale', 'It is bake sale time, please bring money and goodies to sell!', '/uploads/newsletters/1728328541947.png'),
(3, 'Sports Day', 'Its Sports day! Be ready for cool pix and pack appropriate clothes!', '/uploads/newsletters/1728328604345.png');

INSERT INTO gallery_collection (id, event_name, year) VALUES
(1, 'Sports Day', 2023),
(2, 'Picture Day', 2023);

INSERT INTO gallery_images (id, collection_id, image_path) VALUES
(1, 1, '/uploads/Gallery/Sports Day_2023/1.jpg'),
(2, 1, '/uploads/Gallery/Sports Day_2023/2.jpg'),
(3, 1, '/uploads/Gallery/Sports Day_2023/3.jpg'),
(4, 2, '/uploads/Gallery/Picture Day_2023/kid1.jpg'),
(5, 2, '/uploads/Gallery/Picture Day_2023/kid2.jpg'),
(6, 2, '/uploads/Gallery/Picture Day_2023/kid3.jpg');

INSERT INTO media_resources (id, title, file_path, uploaded_by, upload_date) VALUES
(1, 'How to say hello', '/uploads/resources/media/1728332407449.mp4', 'chsteyn', '2024-10-07 22:20:07'),
(2, 'Ba Ba Black Sheep', '/uploads/resources/media/1728332418537.mp3', 'chsteyn', '2024-10-07 22:20:18'),
(3, 'How to Kick a Ball', '/uploads/resources/media/1728332443766.mp4', 'chsteyn', '2024-10-07 22:20:43');

INSERT INTO arts_and_crafts_resources (id, title, file_path, uploaded_by, upload_date) VALUES
(1, 'Cool Drawing', '/uploads/resources/arts_and_crafts/1728332320726.jpg', 'chsteyn', '2024-10-07 22:18:40'),
(2, 'Colouring Book', '/uploads/resources/arts_and_crafts/1728332371078.pdf', 'chsteyn', '2024-10-07 22:19:31');

INSERT INTO additional_resources (id, title, file_path, uploaded_by, upload_date) VALUES
(1, 'Toy Guide', '/uploads/resources/additional/1728332204537.pdf', 'chsteyn', '2024-10-07 22:16:44'),
(2, 'New Parent Guide', '/uploads/resources/additional/1728332270596.pdf', 'chsteyn', '2024-10-07 22:17:50');

INSERT INTO tips_resources (id, title, tip_text, uploaded_by, upload_date) VALUES
(1, 'How to Stop a baby from crying', 'Extra holding, cuddling, or swaddling can help. According to the American Academy of Pediatrics, two-to-three hours of crying a day is normal for babies in the first three months of life', 'chsteyn', '2024-10-07 22:22:34'),
(2, 'Stimulate the babys senses', 'So don\'t hold back on kisses and cuddles! You can also massage your baby: you will both really enjoy these moments of complicity. To take learning about touch a stage further, you can roll balls under their feet, wrap them up in soft fabrics followed by ...', 'chsteyn', '2024-10-07 22:23:03');
