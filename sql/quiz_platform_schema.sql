
CREATE DATABASE quiz_platform;
USE quiz_platform;

-- Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('user','admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, email, role) VALUES
  ('john_doe', 'john123', 'john@example.com', 'user'),
  ('admin',    'admin123','admin@example.com','admin'),
  ('jane_smith','jane123','jane@example.com','user');
  


-- Quizzes
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO quizzes (title, description, status, created_by) VALUES
  ('General Knowledge', 'Test your general knowledge!', 'active', 2),
  ('Java Basics',       'Basic concepts of Java programming', 'active', 2),
  ('Tech Quiz',         'Programming and computer basics!', 'active', 2),
  ('Medical Quiz',      'Basic medical and health questions', 'active', 2);

-- Questions
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10 GK questions (ids 1–10)
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
('What is the capital of India?', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'A'),
('What is H2O commonly known as?', 'Hydrogen', 'Oxygen', 'Water', 'Salt', 'C'),
('Which is the largest continent?', 'Asia', 'Africa', 'Europe', 'Antarctica', 'A'),
('How many days are there in a leap year?', '364', '365', '366', '367', 'C'),
('Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'B'),
('Which is the largest ocean?', 'Indian Ocean', 'Arctic Ocean', 'Atlantic Ocean', 'Pacific Ocean', 'D'),
('Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'Leo Tolstoy', 'William Shakespeare', 'Mark Twain', 'C'),
('Which gas do plants absorb from the atmosphere?', 'Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen', 'B'),
('Which country is famous for the Great Wall?', 'India', 'China', 'Japan', 'Russia', 'B'),
('What is the currency of Japan?', 'Yen', 'Dollar', 'Euro', 'Rupee', 'A');

-- 10 Java questions (ids 11–20)
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
('Which keyword is used to declare a class in Java?', 'function', 'class', 'public', 'package', 'B'),
('Which method is the entry point in a Java app?', 'run', 'execute', 'start', 'main', 'D'),
('Which keyword is used to inherit a class?', 'this', 'implements', 'extends', 'instanceof', 'C'),
('Which collection does not allow duplicate elements?', 'ArrayList', 'LinkedList', 'HashSet', 'Vector', 'C'),
('Which package contains the Scanner class?', 'java.util', 'java.io', 'java.net', 'java.lang', 'A'),
('Which keyword is used to handle exceptions?', 'try', 'catch', 'throw', 'All of the above', 'D'),
('Which data type is used to create a variable that should store text?', 'int', 'String', 'double', 'char', 'B'),
('Which operator is used for equality comparison?', '=', '==', '===', '!=', 'B'),
('Which OOP concept is related to "one name, many forms"?', 'Encapsulation', 'Abstraction', 'Polymorphism', 'Inheritance', 'C'),
('Which of these is not a Java primitive type?', 'int', 'float', 'String', 'boolean', 'C');

-- 10 Tech questions (ids 21–30)
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
('Which language is mainly used for Android app development?', 'Python','Java','C++','PHP','B'),
('Which operating system is open source?','Windows','Linux','macOS','DOS','B'),
('What does CPU stand for?', 'Central Processing Unit', 'Computer Personal Unit', 'Central Performance Unit', 'Control Processing Unit', 'A'),
('Which device is used to connect a computer to a network?', 'Keyboard', 'Monitor', 'Router', 'Printer', 'C'),
('Which number system do computers use?', 'Decimal', 'Binary', 'Octal', 'Hexadecimal', 'B'),
('What does HTML stand for?', 'Hyperlinks and Text Markup Language', 'Home Tool Markup Language', 'HyperText Markup Language', 'Hyper Technical Markup Language', 'C'),
('Which company developed the Windows OS?', 'Apple', 'Microsoft', 'Google', 'IBM', 'B'),
('Which storage device is non-volatile?', 'RAM', 'Cache', 'Register', 'SSD', 'D'),
('Which protocol is used to transfer web pages?', 'FTP', 'SMTP', 'HTTP', 'SSH', 'C'),
('What does OS stand for?', 'Original Software', 'Operating System', 'Open Source', 'Online Service', 'B');

-- 10 Medical questions (ids 31–40)
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
('What is the normal human body temperature in Celsius?', '36.5–37.5', '34–35', '38–39', '40–41', 'A'),
('Which organ pumps blood throughout the body?', 'Lungs', 'Liver', 'Heart', 'Kidneys', 'C'),
('Which vitamin is mainly obtained from sunlight?', 'Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K', 'C'),
('Which blood cells help in clotting?', 'Red blood cells', 'White blood cells', 'Platelets', 'Plasma cells', 'C'),
('Which is the largest organ of the human body?', 'Liver', 'Lungs', 'Skin', 'Heart', 'C'),
('What is the medical term for high blood pressure?', 'Hypotension', 'Hypertension', 'Hyperglycemia', 'Hypoglycemia', 'B'),
('Which organ is affected by hepatitis?', 'Heart', 'Liver', 'Kidneys', 'Lungs', 'B'),
('Which nutrient is the main source of energy?', 'Proteins', 'Vitamins', 'Carbohydrates', 'Minerals', 'C'),
('Which part of the eye controls the amount of light entering?', 'Retina', 'Cornea', 'Iris', 'Lens', 'C'),
('Which disease is caused by lack of insulin?', 'Anemia', 'Diabetes', 'Asthma', 'Malaria', 'B');


-- Mapping questions to quizzes
CREATE TABLE quiz_questions (
    quiz_id INT NOT NULL,
    question_id INT NOT NULL,
    PRIMARY KEY (quiz_id, question_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);


INSERT INTO quiz_questions (quiz_id, question_id)
SELECT 1, id FROM questions WHERE id BETWEEN 1 AND 10;

INSERT INTO quiz_questions (quiz_id, question_id)
SELECT 2, id FROM questions WHERE id BETWEEN 11 AND 20;

INSERT INTO quiz_questions (quiz_id, question_id)
SELECT 3, id FROM questions WHERE id BETWEEN 21 AND 30;

INSERT INTO quiz_questions (quiz_id, question_id)
SELECT 4, id FROM questions WHERE id BETWEEN 31 AND 40;


-- Attempts and attempted questions

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quiz_id INT,
    score INT,
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_sec INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE attempted_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT,
    question_id INT,
    chosen_option CHAR(1),
    is_correct BOOLEAN,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);


-- Quick checks
SELECT * FROM quizzes;
SELECT COUNT(*) AS total_questions, quiz_id FROM quiz_questions GROUP BY quiz_id;
