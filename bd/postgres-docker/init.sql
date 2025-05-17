CREATE SCHEMA IF NOT EXISTS pathexplorer;
SET search_path TO pathexplorer;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- =======================
CREATE TABLE "Users" (
  "user_id" SERIAL PRIMARY KEY,
  "mail" varchar,
  "password" varchar,
  "name" varchar,
  "birthday" timestamp,
  "hire_date" timestamp,
  "role_id" integer,
  "in_project" boolean,
  "country_id" integer
);
CREATE TABLE "Country" (
  "country_id" SERIAL PRIMARY KEY,
  "country_name" varchar,
  "region_name" varchar,
  "timezone" varchar
);
CREATE TABLE "User_Score" (
  "score_id" SERIAL PRIMARY KEY,
  "user_id" integer,
  "score" integer
);
CREATE TABLE "Permits" (
  "role_id" SERIAL PRIMARY KEY,
  "is_employee" boolean,
  "is_people_lead" boolean,
  "is_capability_lead" boolean,
  "is_delivery_lead" boolean,
  "is_admin" boolean
);
CREATE TABLE "Capability" (
  "capability_id" SERIAL PRIMARY KEY,
  "capability_name" varchar,
  "capability_lead_id" integer,
  "country_id" integer
);
CREATE TABLE "Capability_People_Lead" (
  "capability_id" integer,
  "capability_pl_id" integer,
  PRIMARY KEY ("capability_id", "capability_pl_id")
);
CREATE TABLE "Capability_Employee" (
  "capability_id" integer,
  "people_lead_id" integer,
  "employee_id" integer,
  PRIMARY KEY ("capability_id", "people_lead_id", "employee_id")
);
CREATE TABLE "Skills" (
  "skill_id" SERIAL PRIMARY KEY,
  "name" varchar,
  "technical" boolean
);
CREATE TABLE "User_Skills" (
  "user_id" integer,
  "skill_id" integer,
  PRIMARY KEY ("user_id", "skill_id")
);
CREATE TABLE "Projects" (
  "project_id" SERIAL PRIMARY KEY,
  "delivery_lead_user_id" integer,
  "project_name" varchar,
  "company_name" varchar,
  "project_desc" text,
  "start_date" timestamp,
  "end_date" timestamp,
  "country_id" integer
);
CREATE TABLE "Project_Positions" (
  "position_id" SERIAL PRIMARY KEY,
  "project_id" integer,
  "position_name" varchar,
  "position_desc" text,
  "user_id" integer
);
CREATE TABLE "Project_Position_Skills" (
  "position_id" integer,
  "skill_id" integer,
  PRIMARY KEY ("position_id", "skill_id")
);
CREATE TABLE "Project_Position_Certificates" (
  "position_id" integer,
  "certificate_id" integer,
  PRIMARY KEY ("position_id", "certificate_id")
);
CREATE TABLE "Project_User" (
  "user_id" integer,
  "project_id" integer,
  PRIMARY KEY ("user_id", "project_id")
);
CREATE TABLE "Postulations" (
  "postulation_id" SERIAL PRIMARY KEY,
  "project_position_id" integer,
  "user_id" integer,
  "postulation_date" timestamp,
  "meeting_id" integer
);
CREATE TABLE "Meeting" (
  "meeting_id" SERIAL PRIMARY KEY,
  "meeting_date" timestamp,
  "meeting_link" varchar
);
CREATE TABLE "Feedback" (
  "feedback_id" SERIAL PRIMARY KEY,
  "project_id" integer,
  "user_id" integer,
  "desc" text,
  "score" integer
);
CREATE TABLE "Certificates" (
  "certificate_id" SERIAL PRIMARY KEY,
  "certificate_name" varchar,
  "certificate_desc" text,
  "provider" varchar
);
CREATE TABLE "Certificate_Users" (
  "certificate_id" integer,
  "user_id" integer,
  "certificate_date" timestamp,
  "certificate_expiration_date" timestamp,
  "certificate_link" varchar,
  "status" varchar CHECK ("status" IN ('completed', 'expired', 'in progress')),
  PRIMARY KEY ("certificate_id", "user_id")
);
CREATE TABLE "Certificate_Skills" (
  "certificate_id" integer,
  "skill_id" integer,
  PRIMARY KEY ("certificate_id", "skill_id")
);
CREATE TABLE "Courses" (
  "course_id" SERIAL PRIMARY KEY,
  "course_name" varchar,
  "course_desc" text,
  "estimated_time" varchar
);
CREATE TABLE "Course_Users" (
  "course_id" integer,
  "user_id" integer,
  "course_start_date" timestamp,
  "progress" integer,
  "course_link" varchar,
  "finished" boolean,
  PRIMARY KEY ("course_id", "user_id")
);
CREATE TABLE "Course_Skills" (
  "course_id" integer,
  "skill_id" integer,
  PRIMARY KEY ("course_id", "skill_id")
);
CREATE TABLE "Work_Position" (
  "position_id" SERIAL PRIMARY KEY,
  "position_name" varchar,
  "position_desc" text,
  "company" varchar
);
CREATE TABLE "Employee_Position" (
  "position_id" integer,
  "user_id" integer,
  "level" integer,
  "start_date" timestamp,
  "end_date" timestamp,
  PRIMARY KEY ("position_id", "user_id")
);
CREATE TABLE "Goals" (
  "goal_id" SERIAL PRIMARY KEY,
  "goal_name" varchar,
  "goal_desc" text
);
CREATE TABLE "Goal_Skills" (
  "goal_id" integer,
  "skill_id" integer,
  PRIMARY KEY ("goal_id", "skill_id")
);
CREATE TABLE "Goal_Users" (
  "goal_id" integer,
  "user_id" integer,
  "create_date" timestamp,
  "finished_date" timestamp,
  "completed" boolean,
  PRIMARY KEY ("goal_id", "user_id")
);
CREATE TABLE "Areas" (
  "area_id" SERIAL PRIMARY KEY,
  "area_name" varchar,
  "area_desc" text
);
CREATE TABLE "Area_Certificates" (
  "area_id" integer,
  "certificate_id" integer,
  PRIMARY KEY ("area_id", "certificate_id")
);
CREATE TABLE "Area_Courses" (
  "area_id" integer,
  "course_id" integer,
  PRIMARY KEY ("area_id", "course_id")
);
CREATE TABLE "Project_Position_Areas" (
  "position_id" integer,
  "area_id" integer,
  PRIMARY KEY ("position_id", "area_id")
);
CREATE TABLE "User_Area_Score" (
  "user_id" integer,
  "area_id" integer,
  "score" integer,
  PRIMARY KEY ("user_id", "area_id")
);
CREATE TABLE "Session" (
  "session_id" varchar PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'base64'),
  "user_id" integer NOT NULL,
  "expires_at" timestamp NOT NULL DEFAULT NOW() + INTERVAL '1 week'
);
-- =======================
--    FOREIGN KEY SETUP
-- =======================
ALTER TABLE "Users"
ADD CONSTRAINT fk_users_region FOREIGN KEY ("country_id") REFERENCES "Country"("country_id"),
  ADD CONSTRAINT fk_users_role FOREIGN KEY ("role_id") REFERENCES "Permits"("role_id");
ALTER TABLE "Capability"
ADD CONSTRAINT fk_capability_lead FOREIGN KEY ("capability_lead_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_capability_region FOREIGN KEY ("country_id") REFERENCES "Country"("country_id");
ALTER TABLE "Capability_People_Lead"
ADD CONSTRAINT fk_capability_pl_capability FOREIGN KEY ("capability_id") REFERENCES "Capability"("capability_id"),
  ADD CONSTRAINT fk_capability_pl_users FOREIGN KEY ("capability_pl_id") REFERENCES "Users"("user_id");
ALTER TABLE "Capability_Employee"
ADD CONSTRAINT fk_capability_emp_capability FOREIGN KEY ("capability_id") REFERENCES "Capability"("capability_id"),
  ADD CONSTRAINT fk_capability_emp_lead FOREIGN KEY ("people_lead_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_capability_emp_user FOREIGN KEY ("employee_id") REFERENCES "Users"("user_id");
ALTER TABLE "User_Skills"
ADD CONSTRAINT fk_user_skills_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_user_skills_skill FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id");
ALTER TABLE "Projects"
ADD CONSTRAINT fk_projects_lead FOREIGN KEY ("delivery_lead_user_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_projects_region FOREIGN KEY ("country_id") REFERENCES "Country"("country_id");
ALTER TABLE "Project_Positions"
ADD CONSTRAINT fk_project_positions_project FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id"),
  ADD CONSTRAINT fk_project_positions_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Project_Position_Skills"
ADD CONSTRAINT fk_project_position_skills_position FOREIGN KEY ("position_id") REFERENCES "Project_Positions"("position_id"),
  ADD CONSTRAINT fk_project_position_skills_skill FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id");
ALTER TABLE "Project_Position_Certificates"
ADD CONSTRAINT fk_project_position_cert_position FOREIGN KEY ("position_id") REFERENCES "Project_Positions"("position_id"),
  ADD CONSTRAINT fk_project_position_cert_certificate FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id");
ALTER TABLE "Project_User"
ADD CONSTRAINT fk_project_user_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_project_user_project FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id");
ALTER TABLE "Postulations"
ADD CONSTRAINT fk_postulations_project_position FOREIGN KEY ("project_position_id") REFERENCES "Project_Positions"("position_id"),
  ADD CONSTRAINT fk_postulations_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_postulations_meeting FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("meeting_id");
ALTER TABLE "Feedback"
ADD CONSTRAINT fk_feedback_project FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id"),
  ADD CONSTRAINT fk_feedback_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Certificate_Users"
ADD CONSTRAINT fk_certificate_users_certificate FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id"),
  ADD CONSTRAINT fk_certificate_users_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Certificate_Skills"
ADD CONSTRAINT fk_certificate_skills_certificate FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id"),
  ADD CONSTRAINT fk_certificate_skills_skill FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id");
ALTER TABLE "Course_Users"
ADD CONSTRAINT fk_course_users_course FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id"),
  ADD CONSTRAINT fk_course_users_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Course_Skills"
ADD CONSTRAINT fk_course_skills_course FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id"),
  ADD CONSTRAINT fk_course_skills_skill FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id");
ALTER TABLE "Employee_Position"
ADD CONSTRAINT fk_employee_position_work FOREIGN KEY ("position_id") REFERENCES "Work_Position"("position_id"),
  ADD CONSTRAINT fk_employee_position_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Goal_Skills"
ADD CONSTRAINT fk_goal_skills_goal FOREIGN KEY ("goal_id") REFERENCES "Goals"("goal_id"),
  ADD CONSTRAINT fk_goal_skills_skill FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id");
ALTER TABLE "User_Score"
ADD CONSTRAINT fk_goal_users_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Goal_Users"
ADD CONSTRAINT fk_goal_users_goal FOREIGN KEY ("goal_id") REFERENCES "Goals"("goal_id"),
  ADD CONSTRAINT fk_goal_users_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id");
ALTER TABLE "Area_Certificates"
ADD CONSTRAINT fk_area_certificates_area FOREIGN KEY ("area_id") REFERENCES "Areas"("area_id"),
  ADD CONSTRAINT fk_area_certificates_certificate FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id");
ALTER TABLE "Area_Courses"
ADD CONSTRAINT fk_area_courses_area FOREIGN KEY ("area_id") REFERENCES "Areas"("area_id"),
  ADD CONSTRAINT fk_area_courses_course FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id");
ALTER TABLE "Project_Position_Areas"
ADD CONSTRAINT fk_project_position_areas_position FOREIGN KEY ("position_id") REFERENCES "Project_Positions"("position_id"),
  ADD CONSTRAINT fk_project_position_areas_area FOREIGN KEY ("area_id") REFERENCES "Areas"("area_id");
ALTER TABLE "User_Area_Score"
ADD CONSTRAINT fk_user_area_score_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_user_area_score_area FOREIGN KEY ("area_id") REFERENCES "Areas"("area_id");
ALTER TABLE "Session"
ADD CONSTRAINT fk_session_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;
-- =======================
--    DUMMY DATA INSERTION
-- =======================

-- 1) Country - Corrected and expanded
INSERT INTO "Country" ("country_name", "region_name", "timezone") VALUES
('United States', 'North America', 'UTC-5'),
('Canada', 'North America', 'UTC-8'),
('United Kingdom', 'Europe', 'UTC+0'),
('Germany', 'Europe', 'UTC+1'),
('France', 'Europe', 'UTC+1'),
('India', 'Asia', 'UTC+5:30'),
('Australia', 'Oceania', 'UTC+8'),
('Japan', 'Asia', 'UTC+9'),
('Brazil', 'South America', 'UTC-2'),
('South Africa', 'Africa', 'UTC+2');

-- 2) Permits - Expanded with more role combinations
INSERT INTO "Permits" (
    "is_employee",
    "is_people_lead",
    "is_capability_lead",
    "is_delivery_lead",
    "is_admin"
) VALUES
-- Simple employee
(TRUE, FALSE, FALSE, FALSE, FALSE),
-- People lead
(TRUE, TRUE, FALSE, FALSE, FALSE),
-- Capability lead
(TRUE, FALSE, TRUE, FALSE, FALSE),
-- Delivery lead
(TRUE, FALSE, FALSE, TRUE, FALSE),
-- Admin
(FALSE, FALSE, FALSE, FALSE, TRUE),
-- People Lead + Delivery Lead
(TRUE, TRUE, FALSE, TRUE, FALSE),
-- Capability Lead + People Lead
(TRUE, TRUE, TRUE, FALSE, FALSE),
-- Senior Employee with no lead roles
(TRUE, FALSE, FALSE, FALSE, FALSE);

-- 3) Skills - Expanded with more technical and soft skills
INSERT INTO "Skills" ("name", "technical") VALUES
-- Technical skills
('Java', TRUE),
('Python', TRUE),
('JavaScript', TRUE),
('TypeScript', TRUE),
('React', TRUE),
('Angular', TRUE),
('Node.js', TRUE),
('Spring Boot', TRUE),
('Docker', TRUE),
('Kubernetes', TRUE),
('AWS', TRUE),
('Azure', TRUE),
('SQL', TRUE),
('MongoDB', TRUE),
('Machine Learning', TRUE),
('Data Analysis', TRUE),
('DevOps', TRUE),
('CI/CD', TRUE),
('Microservices', TRUE),
('REST API', TRUE),
('TensorFlow', TRUE),
('PyTorch', TRUE),
('Ethical Hacking', TRUE),
('Blockchain', TRUE),
('Smart Contracts', TRUE),
('Serverless Architecture', TRUE),
('Quantum Computing', TRUE),
('GraphQL', TRUE),
('Apache Kafka', TRUE),
('Prometheus', TRUE),
('Istio', TRUE),
('Jenkins', TRUE),
('Ansible', TRUE),
('Chaos Engineering', TRUE),
('Generative AI', TRUE),

-- Soft skills
('Mentorship', FALSE),
('Strategic Thinking', FALSE),
('Cross-cultural Communication', FALSE),
('Innovation Management', FALSE),
('Change Management', FALSE),
('Project Management', FALSE),
('Communication', FALSE),
('Leadership', FALSE),
('Teamwork', FALSE),
('Problem Solving', FALSE),
('Time Management', FALSE),
('Agile Methodologies', FALSE),
('Scrum', FALSE),
('Public Speaking', FALSE),
('Negotiation', FALSE),
('Conflict Resolution', FALSE),
('Critical Thinking', FALSE),
('Creativity', FALSE),
('Adaptability', FALSE),
('Emotional Intelligence', FALSE);

-- 4) Certificates - Expanded with more certifications
INSERT INTO "Certificates" (
    "certificate_name",
    "certificate_desc",
    "provider"
) VALUES
('Oracle Certified Professional: Java SE 11 Developer', 'Advanced Java programming certification', 'Oracle'),
('Oracle Database SQL Certified Associate', 'SQL and database management certification', 'Oracle'),
('Oracle Cloud Infrastructure Foundations Associate', 'Cloud infrastructure basics certification', 'Oracle'),
('Oracle Certified Master, Java EE Enterprise Architect', 'Enterprise-level Java architecture certification', 'Oracle'),
('AWS Certified Solutions Architect - Associate', 'Cloud architecture certification', 'Amazon'),
('AWS Certified Developer - Associate', 'Developing applications on AWS certification', 'Amazon'),
('AWS Certified SysOps Administrator - Associate', 'System operations on AWS certification', 'Amazon'),
('AWS Certified Machine Learning - Specialty', 'Machine learning on AWS certification', 'Amazon'),
('Microsoft Certified: Azure Administrator Associate', 'Azure administration certification', 'Microsoft'),
('Microsoft Certified: Azure Solutions Architect Expert', 'Advanced Azure architecture certification', 'Microsoft'),
('Microsoft Certified: Power BI Data Analyst Associate', 'Data analysis and visualization certification', 'Microsoft'),
('Microsoft Certified: DevOps Engineer Expert', 'DevOps practices on Azure certification', 'Microsoft'),
('Google Professional Data Engineer', 'Data engineering certification', 'Google'),
('Google Associate Cloud Engineer', 'Cloud engineering basics certification', 'Google'),
('Google Professional Cloud Architect', 'Cloud architecture certification', 'Google'),
('Google Professional Machine Learning Engineer', 'Machine learning engineering certification', 'Google'),
('Coursera Data Science Professional Certificate', 'Comprehensive data science certification', 'Coursera'),
('Coursera Machine Learning Specialization', 'Machine learning certification by Andrew Ng', 'Coursera'),
('Coursera Python for Everybody Specialization', 'Python programming certification', 'Coursera'),
('Coursera Deep Learning Specialization', 'Deep learning certification by Andrew Ng', 'Coursera'),
('Cisco Certified Network Associate (CCNA)', 'Networking fundamentals certification', 'Cisco'),
('Cisco Certified CyberOps Associate', 'Cybersecurity operations certification', 'Cisco'),
('Cisco Certified DevNet Associate', 'DevOps and network automation certification', 'Cisco'),
('Cisco Certified Network Professional (CCNP)', 'Advanced networking certification', 'Cisco'),
('TensorFlow Developer Certificate', 'Build and train ML models using TensorFlow', 'Google'),
('Certified Ethical Hacker (CEH)', 'Identify vulnerabilities and secure systems', 'EC-Council'),
('Blockchain Developer Certification', 'Build decentralized applications and smart contracts', 'Blockchain Council'),
('HashiCorp Certified Terraform Associate', 'Infrastructure automation using Terraform', 'HashiCorp'),
('Certified Kubernetes Security Specialist', 'Secure containerized applications', 'CNCF'),
('Azure AI Engineer Associate', 'Implement AI solutions on Microsoft Azure', 'Microsoft'),
('Quantum Computing Fundamentals', 'Introduction to quantum computing concepts', 'IBM'),
('Serverless Architecture Certification', 'Build and deploy serverless applications', 'AWS');

-- 5) Courses - Expanded with more learning paths
INSERT INTO "Courses" (
    "course_name",
    "course_desc",
    "estimated_time"
) VALUES
('Java Fundamentals', 'Core Java concepts and syntax', '40 hours'),
('Advanced Java Programming', 'Advanced Java features and frameworks', '60 hours'),
('Python for Data Science', 'Using Python for data analysis and visualization', '50 hours'),
('Modern JavaScript Development', 'ES6+ features and modern frameworks', '45 hours'),
('Cloud Computing Basics', 'Introduction to cloud platforms', '30 hours'),
('DevOps Essentials', 'CI/CD pipelines and infrastructure as code', '35 hours'),
('Agile Project Management', 'Managing projects with Agile methodologies', '25 hours'),
('Machine Learning Foundations', 'Basic ML algorithms and techniques', '55 hours'),
('Cybersecurity Fundamentals', 'Introduction to information security', '40 hours'),
('Effective Communication for Tech Professionals', 'Improving workplace communication', '20 hours'),
('Leadership in Tech', 'Developing leadership skills for technical roles', '30 hours'),
('Docker and Kubernetes Mastery', 'Containerization and orchestration', '45 hours'),
('Advanced ML with TensorFlow', 'Production-grade ML model development', '60 hours'),
('Blockchain Development 101', 'Ethereum, Solidity, and DApp development', '45 hours'),
('Serverless Patterns on AWS', 'Building event-driven architectures', '35 hours'),
('Quantum Computing Basics', 'Qubits and quantum algorithms', '25 hours'),
('MLOps Fundamentals', 'Machine learning operations lifecycle', '30 hours'),
('Advanced DevOps Monitoring', 'Observability with Prometheus/Grafana', '30 hours'),
('Generative AI with GANs', 'Creating generative models', '40 hours'),
('Cloud-Native Architecture', 'Designing for Kubernetes environments', '40 hours'),
('Ethical Hacking Lab', 'Hands-on penetration testing', '50 hours');

-- 6) Work_Position - Expanded with more roles
INSERT INTO "Work_Position" (
    "position_name",
    "position_desc",
    "company"
) VALUES
('Software Engineer', 'Designs and develops software applications', 'Tech Solutions Inc.'),
('Senior Software Engineer', 'Leads development of complex software systems', 'Tech Solutions Inc.'),
('DevOps Engineer', 'Manages deployment and infrastructure automation', 'Cloud Services Co.'),
('Data Scientist', 'Analyzes complex data and builds predictive models', 'Data Insights Ltd.'),
('Project Manager', 'Plans and oversees project execution', 'Business Solutions Corp.'),
('Product Owner', 'Defines product vision and manages backlog', 'Digital Products LLC'),
('Quality Assurance Engineer', 'Ensures software quality through testing', 'Quality Assurance Partners'),
('UX Designer', 'Designs user interfaces and experiences', 'Creative Design Studios'),
('Technical Architect', 'Designs system architecture and technical solutions', 'Enterprise Systems'),
('Scrum Master', 'Facilitates Agile processes and removes impediments', 'Agile Transformations'),
('Data Engineer', 'Builds and maintains data pipelines', 'Big Data Technologies'),
('Security Analyst', 'Protects systems from cyber threats', 'Cyber Security Experts'),
('Senior Software Engineer', 'Leads development of enterprise applications', 'Accenture'),

-- SAoftware Development related positions
('Senior Software Developer', 'Develops complex software solutions at Accenture', 'Accenture'),
('Software Development Lead', 'Leads a team of software developers at Accenture', 'Accenture'),
('Principal Software Engineer', 'Highest technical level for software engineers at Accenture', 'Accenture'),

-- Project Management related positions
('Senior Project Manager', 'Manages large-scale projects at Accenture', 'Accenture'),
('Delivery Lead', 'Oversees project delivery at Accenture', 'Accenture'),

-- Data Science related positions
('Data Science Lead', 'Leads data science initiatives at Accenture', 'Accenture'),
('Senior Data Scientist', 'Advanced data analysis and modeling at Accenture', 'Accenture'),

-- DevOps related positions
('DevOps Lead', 'Leads DevOps practices at Accenture', 'Accenture'),
('Cloud Infrastructure Engineer', 'Manages cloud infrastructure at Accenture', 'Accenture'),

-- Cloud Architecture related positions
('Cloud Solutions Architect', 'Designs cloud solutions at Accenture', 'Accenture'),
('Senior Cloud Architect', 'Advanced cloud architecture at Accenture', 'Accenture'),

-- Quality Assurance related positions
('QA Automation Lead', 'Leads test automation at Accenture', 'Accenture'),
('Senior Test Engineer', 'Advanced testing at Accenture', 'Accenture'),

-- UX Design related positions
('UX Design Lead', 'Leads UX design at Accenture', 'Accenture'),
('Senior UX Designer', 'Advanced UX design at Accenture', 'Accenture'),

-- Product Management related positions
('Product Strategy Lead', 'Leads product strategy at Accenture', 'Accenture'),
('Senior Product Manager', 'Manages product development at Accenture', 'Accenture');

-- 7) Goals - Expanded with more development goals
INSERT INTO "Goals" ("goal_name", "goal_desc") VALUES
('Master Java Development', 'Become proficient in advanced Java concepts and frameworks'),
('Improve Project Management Skills', 'Develop expertise in Agile and Scrum methodologies'),
('Obtain AWS Certification', 'Prepare for and pass AWS Solutions Architect exam'),
('Enhance Leadership Abilities', 'Develop skills to lead technical teams effectively'),
('Learn Machine Learning', 'Gain practical knowledge of ML algorithms and applications'),
('Improve Public Speaking', 'Become more confident in presenting technical topics'),
('Become Full-Stack Developer', 'Expand skills to include both frontend and backend development'),
('Enhance DevOps Knowledge', 'Learn advanced CI/CD and infrastructure automation techniques'),
('Develop Data Analysis Skills', 'Learn to work with big data and visualization tools'),
('Improve Time Management', 'Optimize personal productivity and task prioritization'),
('Learn Cloud Security', 'Understand security best practices for cloud environments'),
('Master Kubernetes', 'Become proficient in container orchestration'),
('Become Machine Learning Engineer', 'Gain production ML deployment skills'),
('Master Blockchain Development', 'Build enterprise-grade DApps'),
('Develop Cybersecurity Expertise', 'Protect critical infrastructure'),
('Learn Quantum Computing', 'Understand quantum algorithms'),
('Achieve Cloud-Native Expertise', 'Master container orchestration'),
('Improve MLOps Skills', 'Implement CI/CD for ML pipelines'),
('Become AI Ethics Specialist', 'Ensure responsible AI development'),
('Master Observability', 'Implement advanced monitoring solutions'),
('Learn Generative AI', 'Create content-generation systems'),
('Develop Edge Computing Skills', 'Build IoT-optimized solutions');

-- 8) Users - Expanded with more realistic employee data
INSERT INTO "Users" (
    "mail",
    "password",
    "name",
    "birthday",
    "hire_date",
    "role_id",
    "in_project",
    "country_id"
) VALUES
-- US Employees
('john.doe@example.com', crypt('password123', gen_salt('bf')), 'John Doe', '1985-05-20', '2020-01-15', 1, TRUE, 1),
('jane.smith@example.com', crypt('passwordabc', gen_salt('bf')), 'Jane Smith', '1990-07-10', '2019-03-10', 2, FALSE, 1),
('robert.johnson@example.com', crypt('robpass', gen_salt('bf')), 'Robert Johnson', '1988-11-25', '2021-02-15', 1, TRUE, 1),
('emily.wilson@example.com', crypt('wilson123', gen_salt('bf')), 'Emily Wilson', '1992-03-18', '2022-06-01', 3, FALSE, 1),

-- UK Employees
('david.brown@example.com', crypt('brownpass', gen_salt('bf')), 'David Brown', '1987-09-12', '2018-07-22', 4, TRUE, 3),
('sarah.miller@example.com', crypt('miller456', gen_salt('bf')), 'Sarah Miller', '1991-12-05', '2020-09-14', 2, FALSE, 3),
('michael.davis@example.com', crypt('davis789', gen_salt('bf')), 'Michael Davis', '1983-06-30', '2017-11-03', 1, TRUE, 3),

-- German Employees
('anna.schmidt@example.com', crypt('schmidt!', gen_salt('bf')), 'Anna Schmidt', '1989-04-22', '2019-08-19', 5, FALSE, 4),
('thomas.mueller@example.com', crypt('mueller$', gen_salt('bf')), 'Thomas Müller', '1986-01-15', '2021-01-10', 1, TRUE, 4),
('claudia.fischer@example.com', crypt('fischer%', gen_salt('bf')), 'Claudia Fischer', '1993-07-08', '2022-03-25', 2, FALSE, 4),

-- Indian Employees
('raj.patel@example.com', crypt('patel123', gen_salt('bf')), 'Raj Patel', '1990-10-11', '2020-05-15', 1, TRUE, 6),
('priya.sharma@example.com', crypt('sharma456', gen_salt('bf')), 'Priya Sharma', '1988-02-28', '2019-11-20', 3, FALSE, 6),
('amit.singh@example.com', crypt('singh789', gen_salt('bf')), 'Amit Singh', '1992-08-17', '2021-07-01', 1, TRUE, 6),

-- Australian Employees
('olivia.wilson@example.com', crypt('wilsonau', gen_salt('bf')), 'Olivia Wilson', '1987-05-09', '2018-04-12', 4, TRUE, 7),
('liam.taylor@example.com', crypt('taylorau', gen_salt('bf')), 'Liam Taylor', '1991-11-23', '2020-02-18', 2, FALSE, 7),

-- Admin users
('admin.us@example.com', crypt('adminpass1', gen_salt('bf')), 'US Admin', '1980-01-01', '2015-01-01', 5, FALSE, 1),
('admin.uk@example.com', crypt('adminpass2', gen_salt('bf')), 'UK Admin', '1982-02-02', '2016-02-02', 5, FALSE, 3),
('admin.global@example.com', crypt('adminpass3', gen_salt('bf')), 'Global Admin', '1975-03-03', '2010-03-03', 5, FALSE, 1);

-- 9) User_Score - Expanded with more scores
INSERT INTO "User_Score" ("user_id", "score") VALUES
(1, 85), (2, 92), (3, 78), (4, 88), (5, 90), 
(6, 82), (7, 75), (8, 95), (9, 80), (10, 87),
(11, 83), (12, 79), (13, 91), (14, 84), (15, 89),
(16, 96), (17, 97), (18, 98);

-- 10) Capability - Expanded with more capabilities
INSERT INTO "Capability" (
    "capability_name",
    "capability_lead_id",
    "country_id"
) VALUES
('Software Development', 4, 1),   -- Led by Emily Wilson (US)
('Project Management', 6, 3),     -- Led by Sarah Miller (UK)
('Data Science', 8, 4),           -- Led by Anna Schmidt (Germany)
('DevOps Engineering', 13, 6),    -- Led by Priya Sharma (India)
('Cloud Architecture', 14, 7),    -- Led by Olivia Wilson (Australia)
('Quality Assurance', 2, 1),      -- Led by Jane Smith (US)
('UX Design', 10, 4),             -- Led by Claudia Fischer (Germany)
('Product Management', 5, 3);     -- Led by David Brown (UK)

-- 11) Capability_People_Lead - Expanded
INSERT INTO "Capability_People_Lead" ("capability_id", "capability_pl_id") VALUES
(1, 2),  -- Software Development PL: Jane Smith
(1, 6),  -- Software Development PL: Sarah Miller
(2, 5),  -- Project Management PL: David Brown
(3, 10), -- Data Science PL: Claudia Fischer
(4, 12), -- DevOps Engineering PL: Amit Singh
(5, 15), -- Cloud Architecture PL: Liam Taylor
(6, 3),  -- Quality Assurance PL: Robert Johnson
(7, 9),  -- UX Design PL: Thomas Müller
(8, 7);  -- Product Management PL: Michael Davis

-- 12) Capability_Employee - Expanded with more team assignments
INSERT INTO "Capability_Employee" ("capability_id", "people_lead_id", "employee_id") VALUES
-- Software Development team
(1, 2, 1),   -- John Doe under Jane Smith
(1, 2, 3),   -- Robert Johnson under Jane Smith
(1, 6, 7),   -- Michael Davis under Sarah Miller
(1, 6, 9),   -- Thomas Müller under Sarah Miller
(1, 6, 11),  -- Raj Patel under Sarah Miller

-- Project Management team
(2, 5, 2),   -- Jane Smith under David Brown
(2, 5, 6),   -- Sarah Miller under David Brown
(2, 5, 10),  -- Claudia Fischer under David Brown

-- Data Science team
(3, 10, 4),  -- Emily Wilson under Claudia Fischer
(3, 10, 8),  -- Anna Schmidt under Claudia Fischer
(3, 10, 12), -- Amit Singh under Claudia Fischer

-- DevOps Engineering team
(4, 12, 5),  -- David Brown under Amit Singh
(4, 12, 13), -- Priya Sharma under Amit Singh
(4, 12, 14), -- Olivia Wilson under Amit Singh

-- Cloud Architecture team
(5, 15, 15), -- Liam Taylor under himself (as capability lead)
(5, 15, 16), -- US Admin under Liam Taylor

-- Quality Assurance team
(6, 3, 1),   -- John Doe under Robert Johnson
(6, 3, 7),   -- Michael Davis under Robert Johnson

-- UX Design team
(7, 9, 9),   -- Thomas Müller under himself
(7, 9, 10),  -- Claudia Fischer under Thomas Müller

-- Product Management team
(8, 7, 5),   -- David Brown under Michael Davis
(8, 7, 14);  -- Olivia Wilson under Michael Davis

-- 13) Projects - Expanded with more projects
INSERT INTO "Projects" (
    "delivery_lead_user_id",
    "project_name",
    "company_name",
    "project_desc",
    "start_date",
    "end_date",
    "country_id"
) VALUES
-- Active projects
(5, 'E-Commerce Platform', 'Retail Solutions Inc.', 'Development of a modern e-commerce platform with AI recommendations', '2025-01-15', '2025-12-31', 1),
(5, 'Banking System Modernization', 'Global Finance Corp', 'Migration of legacy banking systems to microservices architecture', '2025-03-01', '2026-06-30', 3),
(14, 'Healthcare Analytics', 'MediData Solutions', 'Big data analytics platform for healthcare providers', '2025-02-10', '2025-11-30', 4),
(13, 'IoT Fleet Management', 'LogiTech', 'IoT solution for real-time fleet tracking and management', '2025-04-01', '2026-03-31', 6),
(14, 'Mobile Banking App', 'FinTech Innovations', 'Cross-platform mobile application for banking services', '2025-05-26', '2026-02-28', 7),
(14, 'E-Learning Platform', 'EduTech Solutions', 'Development of an interactive e-learning platform', '2025-05-01', '2026-03-31', 7),
(14, 'Smart Home Automation', 'HomeTech Inc.', 'IoT-based smart home automation system', '2025-05-02', '2026-04-30', 7),
(14, 'Retail Analytics Dashboard', 'Retail Insights', 'Dashboard for retail data analytics and visualization', '2025-05-03', '2026-05-31', 7),
(14, 'AI-Powered CRM', 'CustomerFirst', 'AI-driven customer relationship management system', '2025-05-04', '2026-06-30', 7),
(14, 'Blockchain Voting System', 'SecureVote', 'Blockchain-based secure voting platform', '2025-05-05', '2026-07-31', 7),
(14, 'Healthcare Mobile App', 'HealthTech', 'Mobile app for healthcare appointment scheduling and tracking', '2025-05-06', '2026-08-31', 7),
(14, 'Logistics Optimization Tool', 'LogiTech', 'Tool for optimizing logistics and supply chain operations', '2025-05-07', '2026-09-30', 7),
(14, 'Energy Management System', 'GreenEnergy', 'Platform for monitoring and managing energy consumption', '2025-05-08', '2026-10-31', 7),
(14, 'Social Media Analytics', 'SocialMetrics', 'Analytics platform for social media performance tracking', '2025-05-09', '2026-11-30', 7),
(14, 'E-Commerce Recommendation Engine', 'ShopSmart', 'AI-powered recommendation engine for e-commerce platforms', '2025-05-10', '2026-12-31', 7),
(14, 'Virtual Reality Training', 'VRLearn', 'VR-based training platform for corporate learning', '2025-05-11', '2027-01-31', 7),
(14, 'Cybersecurity Threat Detection', 'SecureNet', 'AI-driven threat detection system for cybersecurity', '2025-05-12', '2027-02-28', 7),
(14, 'Personal Finance Manager', 'FinanceBuddy', 'Mobile app for personal finance tracking and budgeting', '2025-05-13', '2027-03-31', 7),
(14, 'Smart City Dashboard', 'UrbanTech', 'Dashboard for monitoring and managing smart city infrastructure', '2025-05-14', '2027-04-30', 7),
(14, 'Online Marketplace', 'MarketPlacePro', 'Development of an online marketplace platform', '2025-05-15', '2027-05-31', 7),
(14, 'AI Legal Assistant', 'LegalAI', 'AI-powered assistant for legal research and document drafting', '2025-05-16', '2027-06-30', 7),
(14, 'Fitness Tracking App', 'FitLife', 'Mobile app for fitness tracking and health monitoring', '2025-05-17', '2027-07-31', 7),
(14, 'Remote Work Collaboration Tool', 'TeamSync', 'Platform for remote team collaboration and communication', '2025-05-18', '2027-08-31', 7),
(14, 'Digital Payment Gateway', 'PaySecure', 'Secure and scalable digital payment gateway', '2025-05-19', '2027-09-30', 7),

-- Upcoming projects
(5, 'AI Customer Support', 'ServiceFirst', 'AI-powered chatbot for customer support services', '2025-09-01', '2026-05-31', 1),
(13, 'Blockchain Supply Chain', 'ChainLogistics', 'Blockchain-based supply chain transparency solution', '2025-10-01', '2026-08-31', 6),
(14, 'AR Retail Experience', 'ShopFuture', 'Augmented reality shopping experience for retail', '2025-11-01', '2026-07-31', 7),

-- Completed projects
(5, 'Legacy System Migration', 'Enterprise Systems Ltd', 'Migration from mainframe to cloud-based systems', '2024-01-10', '2024-12-15', 3),
(13, 'Data Warehouse Implementation', 'Analytics Corp', 'Enterprise data warehouse with BI capabilities', '2024-03-01', '2024-11-30', 4),
(14, 'Cybersecurity Upgrade', 'SecureNet', 'Company-wide cybersecurity infrastructure upgrade', '2024-05-15', '2025-01-31', 1),

-- John Doe projects
(5, 'Financial Analytics Platform', 'Accenture', 'Development of analytics platform for financial services', '2024-02-01', '2024-08-31', 1),
(5, 'Client Portal Modernization', 'Accenture', 'Modernization of legacy client portal system', '2024-05-01', '2024-11-30', 1);


-- 14) Meeting - Expanded with more meetings
INSERT INTO "Meeting" ("meeting_date", "meeting_link") VALUES
('2023-03-15 10:00:00', 'https://meet.example.com/alpha'),
('2023-04-20 15:30:00', 'https://meet.example.com/beta'),
('2023-05-10 09:00:00', 'https://meet.example.com/gamma'),
('2023-06-05 14:00:00', 'https://meet.example.com/delta'),
('2023-07-12 11:30:00', 'https://meet.example.com/epsilon'),
('2023-08-08 13:00:00', 'https://meet.example.com/zeta'),
('2023-09-18 16:00:00', 'https://meet.example.com/eta'),
('2023-10-23 10:30:00', 'https://meet.example.com/theta');

-- 15) Project_Positions - Expanded with more positions
INSERT INTO "Project_Positions" (
    "project_id", 
    "position_name",
    "position_desc",
    "user_id"
) VALUES
-- E-Commerce Platform positions
(1, 'Java Backend Developer', 'Develop core e-commerce functionality using Spring Boot', 1),
(1, 'Frontend Developer', 'Build React-based user interfaces', NULL),
(1, 'DevOps Engineer', 'Manage CI/CD pipelines and cloud infrastructure', 13),
(1, 'Product Owner', 'Define product requirements and prioritize backlog', 5),
(1, 'QA Engineer', 'Ensure software quality through automated testing', 3),

-- Banking System Modernization positions
(2, 'Solution Architect', 'Design microservices architecture', 14),
(2, '.NET Developer', 'Migrate legacy .NET applications', NULL),
(2, 'Database Specialist', 'Optimize and migrate database systems', NULL),
(2, 'Project Manager', 'Coordinate project timelines and deliverables', 6),
(2, 'Security Specialist', 'Implement security best practices', 8),

-- Healthcare Analytics positions
(3, 'Data Scientist', 'Develop predictive models for healthcare data', 4),
(3, 'Python Developer', 'Build data processing pipelines', 11),
(3, 'Data Engineer', 'Design and implement data warehouse', NULL),
(3, 'BI Analyst', 'Create dashboards and reports', 10),

-- IoT Fleet Management positions
(4, 'IoT Engineer', 'Develop firmware for tracking devices', NULL),
(4, 'Cloud Developer', 'Build cloud backend for IoT data', 12),
(4, 'Mobile Developer', 'Create companion mobile app', NULL),
(4, 'Data Analyst', 'Analyze fleet performance data', 7),

-- Mobile Banking App positions
(5, 'Flutter Developer', 'Build cross-platform mobile app', NULL),
(5, 'Backend Developer', 'Develop banking API services', 9),
(5, 'UX Designer', 'Design user-friendly banking interfaces', 10),
(5, 'Security Engineer', 'Implement financial-grade security', 8),

-- Proyecto 14 (NextGen E-Commerce)
(14, 'Lead Java Developer', 'Lead backend development with Spring Boot', NULL),
(14, 'Senior Frontend Developer', 'Build React-based user interfaces', NULL),
(14, 'DevOps Engineer', 'Setup CI/CD pipelines and cloud infrastructure', NULL),
(14, 'QA Automation Engineer', 'Implement automated testing framework', NULL),

-- Proyecto 15 (Digital Banking)
(15, 'Java Microservices Architect', 'Design banking microservices architecture', NULL),
(15, 'Angular Developer', 'Develop banking portal frontend', NULL),
(15, 'Database Specialist', 'Optimize and secure financial databases', NULL),

-- Proyecto 16 (ERP)
(16, 'Full Stack Java Developer', 'Develop ERP modules end-to-end', NULL),
(16, 'UI/UX Designer', 'Design intuitive ERP interfaces', NULL),
(16, 'Scrum Master', 'Facilitate Agile development process', NULL),

-- John does
(31, 'Tech Lead', 'Technical leadership for analytics platform development', 1),
(32, 'Senior Developer', 'Lead developer for portal modernization', 1);

-- 16) Project_User - Expanded with more assignments
INSERT INTO "Project_User" ("user_id", "project_id") VALUES
-- E-Commerce Platform team
(1, 1), (3, 1), (5, 1), (13, 1), (2, 1),

-- Banking System Modernization team
(6, 2), (14, 2), (8, 2), (5, 2), (7, 2),

-- Healthcare Analytics team
(4, 3), (11, 3), (10, 3), (14, 3), (12, 3),

-- IoT Fleet Management team
(12, 4), (7, 4), (13, 4), (9, 4),

-- Mobile Banking App team
(9, 5), (10, 5), (8, 5), (14, 5), (15, 5),

-- AI Customer Support (upcoming) tentative assignments
(1, 6), (4, 6), (11, 6),

-- Blockchain Supply Chain (upcoming) tentative assignments
(12, 7), (13, 7), (8, 7),

-- AR Retail Experience (upcoming) tentative assignments
(10, 8), (9, 8), (14, 8),

-- John Doe
(1, 31), (1, 32);

-- 17) Project_Position_Skills - Expanded with more skill requirements
INSERT INTO "Project_Position_Skills" ("position_id", "skill_id") VALUES
-- Java Backend Developer skills
(1, 1), (1, 8), (1, 20),

-- Frontend Developer skills
(2, 4), (2, 5), (2, 6),

-- DevOps Engineer skills
(3, 9), (3, 10), (3, 11), (3, 17),

-- Product Owner skills
(4, 2), (4, 23), (4, 27),

-- QA Engineer skills
(5, 13), (5, 16), (5, 25),

-- Solution Architect skills
(6, 19), (6, 20), (6, 23),

-- .NET Developer skills
(7, 13), (7, 20), (7, 25),

-- Database Specialist skills
(8, 13), (8, 14), (8, 25),

-- Project Manager skills
(9, 2), (9, 23), (9, 27),

-- Security Specialist skills
(10, 10), (10, 29), (10, 34),

-- Data Scientist skills
(11, 3), (11, 15), (11, 16),

-- Python Developer skills
(12, 3), (12, 16), (12, 25),

-- Data Engineer skills
(13, 3), (13, 13), (13, 14), (13, 16),

-- BI Analyst skills
(14, 16), (14, 25), (14, 30),

-- IoT Engineer skills
(15, 17), (15, 19), (15, 34),

-- Cloud Developer skills
(16, 10), (16, 11), (16, 19),

-- Mobile Developer skills
(17, 4), (17, 5), (17, 20),

-- Data Analyst skills
(18, 16), (18, 25), (18, 30),

-- Flutter Developer skills
(19, 4), (19, 5), (19, 20),

-- Backend Developer skills
(20, 1), (20, 8), (20, 20),

-- UX Designer skills
(21, 5), (21, 30), (21, 33),

-- Security Engineer skills
(22, 10), (22, 29), (22, 34),

-- Lead Java Developer
(25, 1), (25, 8), (25, 20),

-- Senior Frontend Developer
(26, 4), (26, 5), (26, 6),

-- DevOps Engineer
(27, 9), (27, 10), (27, 17),

-- QA Automation Engineer
(28, 13), (28, 16), (28, 25),

-- Java Microservices Architect
(29, 1), (29, 8), (29, 19),

-- Angular Developer
(30, 4), (30, 6), (30, 20),

-- Database Specialist
(31, 13), (31, 14), (31, 25),

-- Full Stack Java Developer
(32, 1), (32, 4), (32, 8),

-- UI/UX Designer
(33, 5), (33, 30), (33, 33),

-- Scrum Master
(34, 27), (34, 28), (34, 23),

-- John Doe
(23, 1), (23, 8), (23, 20),  -- Tech Lead needs Java, Spring Boot, Architecture
(24, 1), (24, 4), (24, 5);    -- Senior Dev needs Java, JavaScript, React

-- 18) Project_Position_Certificates - Expanded with more certificate requirements
INSERT INTO "Project_Position_Certificates" ("position_id", "certificate_id") VALUES
-- Java Backend Developer certs
(1, 1),

-- DevOps Engineer certs
(3, 3), (3, 7),

-- Solution Architect certs
(6, 3), (6, 8),

-- Project Manager certs
(9, 2), (9, 4),

-- Security Specialist certs
(10, 10),

-- Data Scientist certs
(11, 6),

-- Cloud Developer certs
(16, 3),

-- Security Engineer certs
(22, 10);

-- 19) Postulations - Expanded with more applications
INSERT INTO "Postulations" (
    "project_position_id",
    "user_id",
    "postulation_date",
    "meeting_id"
) VALUES
(2, 9, '2023-02-15', 1),   -- Thomas Müller applying for Frontend Developer
(6, 14, '2023-03-10', 2),  -- Olivia Wilson applying for Solution Architect
(11, 11, '2023-04-05', 3), -- Raj Patel applying for Data Scientist
(16, 12, '2023-05-12', 4), -- Amit Singh applying for Cloud Developer
(19, 9, '2023-06-08', 5),  -- Thomas Müller applying for Flutter Developer
(21, 10, '2023-07-15', 6), -- Claudia Fischer applying for UX Designer
(3, 13, '2023-01-20', 7),  -- Priya Sharma applying for DevOps Engineer
(20, 1, '2023-02-28', 8);  -- John Doe applying for Backend Developer

-- 20) Feedback - Expanded with more feedback entries
INSERT INTO "Feedback" (
    "project_id",
    "user_id",
    "desc",
    "score"
) VALUES
(1, 1, 'Excellent work on the cart functionality implementation', 5),
(1, 3, 'Needs to improve test coverage for new features', 3),
(2, 6, 'Great job coordinating between teams', 4),
(2, 14, 'Architecture design exceeded expectations', 5),
(3, 4, 'Predictive models show high accuracy', 5),
(3, 11, 'Python code needs better documentation', 3),
(4, 12, 'Cloud implementation was flawless', 5),
(4, 7, 'Data analysis reports could be more detailed', 4),
(5, 9, 'Backend performance is excellent', 5),
(5, 10, 'UX designs are very intuitive', 5),
(9, 5, 'Successfully completed migration ahead of schedule', 5),
(10, 13, 'Data warehouse implementation had some delays', 3),
(11, 14, 'Security upgrade completed with zero downtime', 5),
(31, 1, 'Excellent technical leadership and architecture design', 5),
(32, 1, 'Delivered high-quality code ahead of schedule', 4);

-- 21) Certificate_Users - Expanded with more certifications
INSERT INTO "Certificate_Users" (
    "certificate_id",
    "user_id",
    "certificate_date",
    "certificate_expiration_date",
    "certificate_link",
    "status"
) VALUES
(1, 1, '2021-06-15', '2024-06-15', 'https://certs.example.com/java1', 'completed'),

(4, 1, '2023-02-15', '2026-02-15', 'https://certs.example.com/azure1', 'in progress'),
(5, 1, '2023-03-20', '2026-03-20', 'https://certs.example.com/google1', 'in progress'),
(3, 14, '2022-03-10', '2024-03-10', 'https://certs.example.com/aws1', 'completed'),
(4, 6, '2021-11-05', '2023-11-05', 'https://certs.example.com/scrum1', 'completed'),
(5, 8, '2022-05-12', '2024-05-12', 'https://certs.example.com/azure1', 'completed'),
(6, 4, '2022-07-18', '2024-07-18', 'https://certs.example.com/data1', 'completed'),
(7, 13, '2022-09-22', '2025-09-22', 'https://certs.example.com/k8s1', 'completed'),
(8, 14, '2021-12-10', '2023-12-10', 'https://certs.example.com/togaf1', 'completed'),
(9, 3, '2022-02-15', '2024-02-15', 'https://certs.example.com/istqb1', 'completed'),
(10, 8, '2022-04-30', '2025-04-30', 'https://certs.example.com/cissp1', 'completed'),
(1, 9, '2022-06-20', '2025-06-20', 'https://certs.example.com/java2', 'completed'),
(3, 12, '2022-08-05', '2024-08-05', 'https://certs.example.com/aws2', 'completed'),
(4, 5, '2022-10-12', '2024-10-12', 'https://certs.example.com/scrum2', 'completed'),
(7, 12, '2023-01-15', '2026-01-15', 'https://certs.example.com/k8s2', 'completed'),
(10, 14, '2023-02-28', '2026-02-28', 'https://certs.example.com/cissp2', 'completed'),

-- default certs for users 7, 9, 11 (test PL Dashboard)
(1, 7, '2024-06-15', '2026-06-15', 'https://certs.example.com/java1', 'completed'),
(5, 7, '2024-07-10', '2026-07-10', 'https://certs.example.com/aws1', 'completed'),
(7, 7, '2024-08-22', '2026-08-22', 'https://certs.example.com/k8s1', 'completed'),
(9, 7, '2024-09-05', '2026-09-05', 'https://certs.example.com/istqb1', 'completed'),
(12, 7, '2024-10-18', '2026-10-18', 'https://certs.example.com/devops1', 'completed'),
(15, 7, '2024-11-30', '2026-11-30', 'https://certs.example.com/cloud1', 'completed'),
(18, 7, '2024-12-15', '2026-12-15', 'https://certs.example.com/ml1', 'completed'),
(21, 7, '2025-01-20', '2027-01-20', 'https://certs.example.com/ccna1', 'completed'),
(25, 7, '2025-02-10', '2027-02-10', 'https://certs.example.com/tf1', 'completed'),
(28, 7, '2025-03-05', '2027-03-05', 'https://certs.example.com/terraform1', 'completed'),
(2, 9, '2025-05-10', '2026-05-20', 'https://certs.example.com/sql1', 'completed'),
(4, 9, '2024-06-10', '2026-06-10', 'https://certs.example.com/javaee1', 'completed'),
(6, 9, '2024-07-15', '2026-07-15', 'https://certs.example.com/awsdev1', 'completed'),
(8, 9, '2024-08-25', '2026-08-25', 'https://certs.example.com/awsml1', 'completed'),
(10, 9, '2024-09-30', '2026-09-30', 'https://certs.example.com/cissp1', 'completed'),
(13, 9, '2024-10-15', '2026-10-15', 'https://certs.example.com/data1', 'completed'),
(16, 9, '2024-11-20', '2026-11-20', 'https://certs.example.com/cloud2', 'completed'),
(19, 9, '2024-12-10', '2026-12-10', 'https://certs.example.com/python1', 'completed'),
(22, 9, '2025-01-25', '2027-01-25', 'https://certs.example.com/cyber1', 'completed'),
(26, 9, '2025-02-15', '2027-02-15', 'https://certs.example.com/ceh1', 'completed'),
(29, 9, '2025-03-01', '2027-03-01', 'https://certs.example.com/k8ssec1', 'completed'),
(30, 9, '2025-03-20', '2027-03-20', 'https://certs.example.com/azureai1', 'completed'),
(3, 11, '2024-07-01', '2026-07-01', 'https://certs.example.com/oci1', 'completed'),
(11, 11, '2024-08-15', '2026-08-15', 'https://certs.example.com/powerbi1', 'completed'),
(14, 11, '2024-09-20', '2026-09-20', 'https://certs.example.com/gcp1', 'completed'),
(17, 11, '2024-10-10', '2026-10-10', 'https://certs.example.com/datasci1', 'completed'),
(20, 11, '2024-11-25', '2026-11-25', 'https://certs.example.com/dl1', 'completed'),
(23, 11, '2025-01-05', '2027-01-05', 'https://certs.example.com/devnet1', 'completed'),
(27, 11, '2025-02-20', '2027-02-20', 'https://certs.example.com/blockchain1', 'completed'),
(31, 11, '2025-03-10', '2027-03-10', 'https://certs.example.com/quantum1', 'completed');


-- 22) Certificate_Skills - Expanded with more certificate-skill relationships
INSERT INTO "Certificate_Skills" ("certificate_id", "skill_id") VALUES
(1, 1), (1, 8),       -- Java cert -> Java, Spring Boot
(2, 2), (2, 23),      -- PMP -> Project Management, Leadership
(3, 10), (3, 11),     -- AWS -> AWS, Cloud
(4, 27), (4, 28),     -- Scrum -> Agile, Scrum
(5, 11), (5, 12),     -- Azure -> Azure, Cloud
(6, 15), (6, 16),     -- Data Engineer -> ML, Data Analysis
(7, 9), (7, 10),      -- Kubernetes -> Docker, Kubernetes
(8, 19), (8, 23),     -- TOGAF -> Architecture, Leadership
(9, 16), (9, 25),     -- ISTQB -> Testing, QA
(10, 29), (10, 34),   -- CISSP -> Security, Security
(11, 7), (11, 20),    -- Salesforce -> CRM, Business
(12, 17), (12, 34),   -- RHCE -> Linux, Security
-- TensorFlow
(25, 36), (25, 15), (25, 3),
-- Ethical Hacking
(26, 38), (26, 34), (26, 29),
-- Blockchain
(27, 39), (27, 40), (27, 19),
-- Terraform
(28, 17), (28, 45), (28, 9),
-- Kubernetes Security
(29, 10), (29, 34), (29, 17),
-- Azure AI
(30, 15), (30, 36), (30, 12),
-- Quantum Computing
(31, 42), (31, 15), (31, 16),
-- Serverless
(32, 41), (32, 11), (32, 17);

-- 23) Course_Users - Expanded with more course enrollments
INSERT INTO "Course_Users" (
    "course_id",
    "user_id",
    "course_start_date",
    "progress",
    "course_link",
    "finished"
) VALUES
(1, 1, '2023-01-10', 100, 'https://learning.example.com/java1', TRUE),
(2, 1, '2023-02-15', 75, 'https://learning.example.com/advjava1', FALSE),
(3, 4, '2023-01-20', 100, 'https://learning.example.com/pydata1', TRUE),
(4, 9, '2023-03-05', 50, 'https://learning.example.com/js1', FALSE),
(5, 14, '2023-02-10', 100, 'https://learning.example.com/cloud1', TRUE),
(6, 13, '2023-03-15', 100, 'https://learning.example.com/devops1', TRUE),
(7, 6, '2023-01-25', 100, 'https://learning.example.com/agile1', TRUE),
(8, 11, '2023-04-01', 30, 'https://learning.example.com/ml1', FALSE),
(9, 8, '2023-02-28', 100, 'https://learning.example.com/cyber1', TRUE),
(10, 2, '2023-03-10', 80, 'https://learning.example.com/comm1', FALSE),
(11, 5, '2023-04-05', 25, 'https://learning.example.com/lead1', FALSE),
(12, 12, '2023-03-20', 100, 'https://learning.example.com/docker1', TRUE),
(1, 3, '2023-04-10', 20, 'https://learning.example.com/java2', FALSE),
(3, 7, '2023-05-01', 10, 'https://learning.example.com/pydata2', FALSE),
(5, 10, '2023-04-15', 45, 'https://learning.example.com/cloud2', FALSE),
(7, 15, '2023-05-05', 90, 'https://learning.example.com/agile2', FALSE);

-- 24) Course_Skills - Expanded with more course-skill relationships
INSERT INTO "Course_Skills" ("course_id", "skill_id") VALUES
(1, 1),         -- Java Fundamentals -> Java
(2, 1), (2, 8), -- Advanced Java -> Java, Spring Boot
(3, 3), (3, 16), -- Python for Data Science -> Python, Data Analysis
(4, 4), (4, 5), -- Modern JavaScript -> JavaScript, React
(5, 10), (5, 11), -- Cloud Basics -> AWS, Cloud
(6, 17), (6, 18), -- DevOps -> DevOps, CI/CD
(7, 27), (7, 28), -- Agile PM -> Agile, Scrum
(8, 15), (8, 16), -- ML Foundations -> ML, Data Analysis
(9, 29), (9, 34), -- Cybersecurity -> Security, Security
(10, 22), (10, 24), -- Communication -> Communication, Teamwork
(11, 23), (11, 26), -- Leadership -> Leadership, Time Management
(12, 9), (12, 10),  -- Docker/K8s -> Docker, Kubernetes
(13, 36), (13, 15), (13, 16),  -- Advanced ML
(14, 39), (14, 40), (14, 19),   -- Blockchain
(15, 38), (15, 34), (15, 29),   -- Cybersecurity
(16, 41), (16, 11), (16, 17),   -- Serverless
(17, 42), (17, 15), (17, 16),   -- Quantum
(18, 45), (18, 17), (18, 18),   -- MLOps
(19, 46), (19, 47), (19, 9),    -- Monitoring
(20, 44), (20, 36), (20, 15),   -- Generative AI
(21, 10), (21, 17), (21, 19);   -- Cloud-Native

-- 25) Employee_Position - Expanded with more position assignments
 INSERT INTO "Employee_Position" (
    "position_id",
    "user_id",
    "level",
    "start_date",
    "end_date"
) VALUES
(1, 1, NULL, '2021-01-15', '2022-12-31'), -- John Doe - Software Engineer
(2, 4, NULL, '2020-06-01', '2022-12-31'), -- Emily Wilson - Senior Software Engineer
(3, 12, NULL, '2021-07-01', '2022-12-31'), -- Priya Sharma - DevOps Engineer
(4, 11, NULL, '2020-05-15', '2022-12-31'), -- Raj Patel - Data Scientist
(5, 6, NULL, '2019-03-10', '2022-12-31'), -- Sarah Miller - Project Manager
(6, 5, NULL, '2018-07-22', '2022-12-31'), -- David Brown - Product Owner
(7, 3, NULL, '2021-02-15', '2022-12-31'), -- Robert Johnson - QA Engineer
(8, 10, NULL, '2021-03-25', '2022-12-31'), -- Claudia Fischer - UX Designer
(9, 11, NULL, '2018-04-12', '2022-12-31'), -- Olivia Wilson - Technical Architect
(10, 6, NULL, '2020-09-14', '2022-12-31'), -- Sarah Miller - Scrum Master
(11, 12, NULL, '2021-07-01', '2022-12-31'), -- Amit Singh - Data Engineer
(12, 8, NULL, '2019-08-19', '2022-12-31'), -- Anna Schmidt - Security Analyst
(1, 7, NULL, '2017-11-03', '2022-12-31'), -- Michael Davis - Software Engineer
(1, 9, NULL, '2021-01-10', '2022-12-31'), -- Thomas Müller - Software Engineer
(1, 11, NULL, '2020-05-15', '2022-12-31'), -- Raj Patel - Software Engineer
(2, 12, NULL, '2020-02-18', '2022-12-31'), -- Liam Taylor - Senior Software Engineer

-- John Doe
(13, 1, 3, '2024-01-01', NULL),

-- Jane Smith - QA Automation Lead (related to Quality Assurance capability)
(23, 2, 2, '2023-01-01', NULL),

-- Robert Johnson - Senior Test Engineer (related to Quality Assurance capability)
(24, 3, 3, '2023-01-01', NULL),

-- Emily Wilson - Principal Software Engineer (related to Software Development capability)
(15, 4, 4, '2023-01-01', NULL),

-- David Brown - Product Strategy Lead (related to Product Management capability)
(29, 5, 3, '2023-01-01', NULL),

-- Sarah Miller - Delivery Lead (related to Project Management capability)
(18, 6, 3, '2023-01-01', NULL),

-- Michael Davis - Software Development Lead (related to Software Development capability)
(14, 7, 3, '2023-01-01', NULL),

-- Anna Schmidt - Data Science Lead (related to Data Science capability)
(19, 8, 3, '2023-01-01', NULL),

-- Thomas Müller - Senior UX Designer (related to UX Design capability)
(26, 9, 3, '2023-01-01', NULL),

-- Claudia Fischer - UX Design Lead (related to UX Design capability)
(25, 10, 3, '2023-01-01', NULL),

-- Raj Patel - Senior Data Scientist (related to Data Science capability)
(20, 11, 3, '2023-01-01', NULL),

-- Amit Singh - DevOps Lead (related to DevOps Engineering capability)
(21, 12, 3, '2023-01-01', NULL),

-- Priya Sharma - Cloud Infrastructure Engineer (related to DevOps Engineering capability)
(22, 13, 2, '2023-01-01', NULL),

-- Olivia Wilson - Senior Cloud Architect (related to Cloud Architecture capability)
(28, 14, 3, '2023-01-01', NULL),

-- Liam Taylor - Cloud Solutions Architect (related to Cloud Architecture capability)
(27, 15, 3, '2023-01-01', NULL),

-- Admin users (generic positions)
(14, 16, 4, '2023-01-01', NULL),  -- US Admin - Software Development Lead
(14, 17, 4, '2023-01-01', NULL),  -- UK Admin - Software Development Lead
(14, 18, 5, '2023-01-01', NULL);  -- Global Admin - Software Development Lead (highest level)


-- 26) Goal_Skills - Expanded with more goal-skill relationships
INSERT INTO "Goal_Skills" ("goal_id", "skill_id") VALUES
(1, 1), (1, 8),           -- Master Java -> Java, Spring Boot
(2, 2), (2, 27),          -- Improve PM -> PM, Agile
(3, 10), (3, 11),         -- AWS Cert -> AWS, Cloud
(4, 23), (4, 24),         -- Leadership -> Leadership, Teamwork
(5, 15), (5, 16),         -- Learn ML -> ML, Data Analysis
(6, 22), (6, 30),         -- Public Speaking -> Communication, Presentation
(7, 1), (7, 4), (7, 5),   -- Full-Stack -> Java, JavaScript, React
(8, 9), (8, 10), (8, 17), -- DevOps -> Docker, Kubernetes, DevOps
(9, 16), (9, 25),         -- Data Analysis -> Data Analysis, Problem Solving
(10, 26), (10, 31),       -- Time Management -> Time Mgmt, Productivity
(11, 29), (11, 34),       -- Cloud Security -> Security, Security
(12, 9), (12, 10),        -- Kubernetes -> Docker, Kubernetes
(13, 36), (13, 15), (13, 16),   -- ML Engineer
(14, 39), (14, 40), (14, 19),    -- Blockchain
(15, 38), (15, 34), (15, 29),    -- Cybersecurity
(16, 42), (16, 15), (16, 16),    -- Quantum
(17, 10), (17, 17), (17, 9),     -- Cloud-Native
(18, 45), (18, 17), (18, 18),    -- MLOps
(19, 22), (19, 24), (19, 33),    -- AI Ethics
(20, 46), (20, 47), (20, 9),     -- Observability
(21, 44), (21, 36), (21, 15),    -- Generative AI
(22, 48), (22, 19), (22, 34);    -- Edge Computing

-- 27) Goal_Users - Expanded with more goal assignments
INSERT INTO "Goal_Users" (
    "goal_id",
    "user_id",
    "create_date",
    "finished_date",
    "completed"
) VALUES
(1, 1, '2023-01-10', NULL, FALSE),    -- John: Master Java
(2, 2, '2023-01-15', NULL, FALSE),    -- Jane: Improve PM
(3, 14, '2023-02-01', NULL, FALSE),   -- Olivia: AWS Cert
(4, 5, '2023-02-10', NULL, FALSE),    -- David: Leadership
(5, 4, '2023-03-05', NULL, FALSE),    -- Emily: Learn ML
(6, 10, '2023-03-15', NULL, FALSE),   -- Claudia: Public Speaking
(7, 9, '2023-04-01', NULL, FALSE),    -- Thomas: Full-Stack
(8, 13, '2023-04-10', NULL, FALSE),   -- Priya: DevOps
(9, 11, '2023-05-01', NULL, FALSE),   -- Raj: Data Analysis
(10, 7, '2023-05-15', NULL, FALSE),   -- Michael: Time Mgmt
(11, 8, '2023-06-01', NULL, FALSE),   -- Anna: Cloud Security
(12, 12, '2023-06-10', NULL, FALSE),  -- Amit: Kubernetes
(1, 3, '2023-01-20', NULL, FALSE),    -- Robert: Master Java
(3, 12, '2023-02-05', NULL, FALSE),   -- Amit: AWS Cert
(7, 1, '2023-04-05', NULL, FALSE);    -- John: Full-Stack

-- 28) User_Skills - Expanded with more skill assignments
INSERT INTO "User_Skills" ("user_id", "skill_id") VALUES
-- John Doe (Java developer)
(1, 1), (1, 8), (1, 13), (1, 20), (1, 22),

-- Jane Smith (Project Manager)
(2, 2), (2, 22), (2, 23), (2, 27), (2, 28),

-- Robert Johnson (QA Engineer)
(3, 13), (3, 16), (3, 25), (3, 30),

-- Emily Wilson (Data Scientist)
(4, 3), (4, 15), (4, 16), (4, 25), (4, 30),

-- David Brown (Product Owner)
(5, 2), (5, 23), (5, 27), (5, 31),

-- Sarah Miller (Project Manager)
(6, 2), (6, 22), (6, 23), (6, 27), (6, 28),

-- Michael Davis (Software Engineer)
(7, 1), (7, 4), (7, 13), (7, 20),

-- Anna Schmidt (Security Analyst)
(8, 10), (8, 11), (8, 29), (8, 34),

-- Thomas Müller (Software Engineer)
(9, 1), (9, 4), (9, 5), (9, 20),

-- Claudia Fischer (UX Designer)
(10, 5), (10, 22), (10, 30), (10, 33),

-- Raj Patel (Data Scientist)
(11, 3), (11, 15), (11, 16), (11, 25),

-- Amit Singh (DevOps Engineer)
(12, 9), (12, 10), (12, 11), (12, 17), (12, 18),

-- Priya Sharma (DevOps Engineer)
(13, 9), (13, 10), (13, 17), (13, 18), (13, 34),

-- Olivia Wilson (Cloud Architect)
(14, 10), (14, 11), (14, 19), (14, 23),

-- Liam Taylor (Senior Software Engineer)
(15, 1), (15, 4), (15, 8), (15, 20), (15, 23),

-- US Admin
(16, 1), (16, 2), (16, 23), (16, 27),

-- UK Admin
(17, 2), (17, 23), (17, 27), (17, 34),

-- Global Admin
(18, 1), (18, 2), (18, 10), (18, 23), (18, 29), (18, 34);


-- 29) Areas - Inserting 10 different technology areas
INSERT INTO "Areas" ("area_name", "area_desc") VALUES
('Java Development', 'Backend development using Java and Spring ecosystem'),
('Frontend Development', 'Building user interfaces with modern frameworks'),
('Cloud & DevOps', 'Cloud infrastructure and DevOps practices'),
('Data Science & Analytics', 'Data analysis, machine learning and AI'),
('Mobile Development', 'Cross-platform and native mobile app development'),
('Quality Assurance', 'Software testing and quality assurance'),
('UX/UI Design', 'User experience and interface design'),
('Project Management', 'Agile project management and leadership'),
('Cybersecurity', 'Information security and secure coding practices'),
('Database Engineering', 'Database design, optimization and administration');

-- 30) Area_Certificates - Associating relevant certificates with each area
INSERT INTO "Area_Certificates" ("area_id", "certificate_id") VALUES
-- Java Development
(1, 1), (1, 4), 

-- Frontend Development
(2, 11), (2, 12),

-- Cloud & DevOps
(3, 5), (3, 6), (3, 7), (3, 8),

-- Data Science & Analytics
(4, 17), (4, 18), (4, 19), (4, 20),

-- Mobile Development
(5, 11), (5, 12),

-- Quality Assurance
(6, 9),

-- UX/UI Design
(7, 11), (7, 12),

-- Project Management
(8, 2), (8, 4),

-- Cybersecurity
(9, 10), (9, 22), (9, 23),

-- Database Engineering
(10, 2), (10, 3);

-- 31) Area_Courses - Associating relevant courses with each area
INSERT INTO "Area_Courses" ("area_id", "course_id") VALUES
-- Java Development
(1, 1), (1, 2),

-- Frontend Development
(2, 4),

-- Cloud & DevOps
(3, 5), (3, 6), (3, 12),

-- Data Science & Analytics
(4, 3), (4, 8),

-- Mobile Development
(5, 4),

-- Quality Assurance
(6, 9),

-- UX/UI Design
(7, 10),

-- Project Management
(8, 7),

-- Cybersecurity
(9, 9),

-- Database Engineering
(10, 5);

-- 32) Project_Position_Areas - Associating project positions with relevant areas
INSERT INTO "Project_Position_Areas" ("position_id", "area_id") VALUES
-- E-Commerce Platform positions
(1, 1),   -- Java Backend Developer -> Java Development
(2, 2),   -- Frontend Developer -> Frontend Development
(3, 3),   -- DevOps Engineer -> Cloud & DevOps
(5, 6),   -- QA Engineer -> Quality Assurance

-- Banking System Modernization positions
(6, 1),   -- Solution Architect -> Java Development
(6, 3),   -- Solution Architect -> Cloud & DevOps
(8, 10),  -- Database Specialist -> Database Engineering
(10, 9),  -- Security Specialist -> Cybersecurity

-- Healthcare Analytics positions
(11, 4),  -- Data Scientist -> Data Science & Analytics
(13, 4),  -- Data Engineer -> Data Science & Analytics
(13, 10), -- Data Engineer -> Database Engineering

-- Mobile Banking App positions
(19, 5),  -- Flutter Developer -> Mobile Development
(21, 7),  -- UX Designer -> UX/UI Design

-- New positions
(25, 1),  -- Lead Java Developer -> Java Development
(26, 2),  -- Senior Frontend Developer -> Frontend Development
(27, 3),  -- DevOps Engineer -> Cloud & DevOps
(29, 1),  -- Java Microservices Architect -> Java Development
(29, 3),  -- Java Microservices Architect -> Cloud & DevOps
(32, 1),  -- Full Stack Java Developer -> Java Development
(32, 2);  -- Full Stack Java Developer -> Frontend Development

-- 33) User_Area_Score - Assigning area scores to users
INSERT INTO "User_Area_Score" ("user_id", "area_id", "score") VALUES
-- John Doe - strong in Java, moderate in others
(1, 1, 90), (1, 3, 75), (1, 6, 80),

-- Jane Smith - Project Management focus
(2, 8, 85), (2, 2, 65),

-- Emily Wilson - Data Science expert
(4, 4, 95), (4, 10, 85),

-- David Brown - Project Management
(5, 8, 90), (5, 1, 70),

-- Sarah Miller - Project Management
(6, 8, 88), (6, 2, 72),

-- Anna Schmidt - Cybersecurity
(8, 9, 92), (8, 3, 85),

-- Thomas Müller - Java and Frontend
(9, 1, 85), (9, 2, 80),

-- Claudia Fischer - UX/UI Design
(10, 7, 94), (10, 2, 88),

-- Raj Patel - Data Science
(11, 4, 89), (11, 10, 78),

-- Amit Singh - Cloud & DevOps
(12, 3, 93), (12, 9, 82),

-- Priya Sharma - Cloud & DevOps
(13, 3, 91), (13, 1, 75),

-- Olivia Wilson - Cloud & Java
(14, 3, 96), (14, 1, 85),

-- Liam Taylor - Java and Frontend
(15, 1, 88), (15, 2, 82);

