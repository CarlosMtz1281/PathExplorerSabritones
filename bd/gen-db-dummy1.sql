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
  "region_id" integer
);
CREATE TABLE "Region" (
  "region_id" SERIAL PRIMARY KEY,
  "region_name" varchar,
  "country" varchar,
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
  "region_id" integer
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
  "region_id" integer
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
  "status" varchar CHECK ('completed', 'expired', 'in progress'),
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
CREATE TABLE "Session" (
  "session_id" varchar PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'base64'),
  "user_id" integer NOT NULL,
  "expires_at" timestamp NOT NULL DEFAULT NOW() + INTERVAL '1 week'
);
-- =======================
--    FOREIGN KEY SETUP
-- =======================
ALTER TABLE "Users"
ADD CONSTRAINT fk_users_region FOREIGN KEY ("region_id") REFERENCES "Region"("region_id"),
  ADD CONSTRAINT fk_users_role FOREIGN KEY ("role_id") REFERENCES "Permits"("role_id");
ALTER TABLE "Capability"
ADD CONSTRAINT fk_capability_lead FOREIGN KEY ("capability_lead_id") REFERENCES "Users"("user_id"),
  ADD CONSTRAINT fk_capability_region FOREIGN KEY ("region_id") REFERENCES "Region"("region_id");
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
  ADD CONSTRAINT fk_projects_region FOREIGN KEY ("region_id") REFERENCES "Region"("region_id");
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
ALTER TABLE "Session"
ADD CONSTRAINT fk_session_user FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;
--   DUMMY DATA INSERTION
-- 1) Region
INSERT INTO "Region" (
    "region_name",
    "country",
    "timezone"
  )
VALUES ('North America', 'USA', 'UTC-5'),
  ('Europe', 'Germany', 'UTC+1'),
  ('Asia', 'India', 'UTC+5:30');
-- 2) Permits
INSERT INTO "Permits" (
    "is_employee",
    "is_people_lead",
    "is_capability_lead",
    "is_delivery_lead",
    "is_admin"
  )
VALUES (TRUE, FALSE, FALSE, FALSE, FALSE),
  -- Simple employee
  (TRUE, TRUE, FALSE, FALSE, FALSE),
  -- People lead
  (TRUE, FALSE, TRUE, FALSE, FALSE),
  -- Capability lead
  (TRUE, FALSE, FALSE, TRUE, FALSE),
  -- Delivery lead
  (FALSE, FALSE, FALSE, FALSE, TRUE);
-- Admin
-- 3) Skills
INSERT INTO "Skills" ("name", "technical")
VALUES ('Java', TRUE),
  ('Project Management', FALSE),
  ('Python', TRUE),
  ('Communication', FALSE);
-- 4) Certificates
INSERT INTO "Certificates" (
    "certificate_name",
    "certificate_desc",
    "provider"
  )
VALUES (
    'Oracle Java Certification',
    'Certification for Java developers',
    'Oracle'
  ),
  (
    'PMP Certification',
    'Project Management Professional',
    'PMI'
  ),
  (
    'AWS Certified Solutions Architect',
    'Cloud architecture certification',
    'Amazon'
  );
-- 5) Courses
INSERT INTO "Courses" (
    "course_name",
    "course_desc",
    "estimated_time"
  )
VALUES (
    'Java Basics',
    'Introduction to Java programming',
    '10 hours'
  ),
  (
    'Advanced Project Management',
    'Deep dive into PM techniques',
    '20 hours'
  ),
  ('AWS Foundations', 'Basic AWS usage', '15 hours');
-- 6) Work_Position
INSERT INTO "Work_Position" (
    "position_name",
    "position_desc",
    "company"
  )
VALUES (
    'Software Engineer',
    'Responsible for software development',
    'TechCorp'
  ),
  (
    'Project Manager',
    'Oversees project execution',
    'BizCorp'
  ),
  (
    'DevOps Engineer',
    'Manages CI/CD and infrastructure',
    'CloudCorp'
  );
-- 7) Goals
INSERT INTO "Goals" ("goal_name", "goal_desc")
VALUES (
    'Improve Java Skills',
    'Focus on advanced Java concepts'
  ),
  (
    'Develop PM Skills',
    'Learn project management methodologies'
  ),
  ('Get AWS Certified', 'Achieve AWS certification');
-- 8) Users
INSERT INTO "Users" (
    "mail",
    "password",
    "name",
    "birthday",
    "hire_date",
    "role_id",
    "in_project",
    "region_id"
  )
VALUES (
    'john.doe@example.com',
    'password123',
    'John Doe',
    '1985-05-20',
    '2020-01-15',
    1,
    TRUE,
    1
  ),
  (
    'jane.smith@example.com',
    'passwordabc',
    'Jane Smith',
    '1990-07-10',
    '2019-03-10',
    2,
    FALSE,
    1
  ),
  (
    'alex.miller@example.com',
    'pass123',
    'Alex Miller',
    '1988-12-01',
    '2021-06-01',
    3,
    TRUE,
    2
  ),
  (
    'emily.jones@example.com',
    'mypassword',
    'Emily Jones',
    '1978-11-15',
    '2015-09-01',
    4,
    FALSE,
    2
  ),
  (
    'admin.user@example.com',
    'adminpass',
    'Admin User',
    '2000-01-01',
    '2022-01-01',
    5,
    FALSE,
    3
  );
-- 9) User_Score
INSERT INTO "User_Score" ("user_id", "score")
VALUES (1, 85),
  (2, 90),
  (3, 75),
  (4, 88),
  (5, 95);
-- 10) Capability
INSERT INTO "Capability" (
    "capability_name",
    "capability_lead_id",
    "region_id"
  )
VALUES ('Software Development', 1, 1),
  ('Project Management', 2, 1);
-- 11) Capability_People_Lead
INSERT INTO "Capability_People_Lead" ("capability_id", "capability_pl_id")
VALUES (1, 2),
  (2, 3);
-- 12) Capability_Employee
INSERT INTO "Capability_Employee" ("capability_id", "people_lead_id", "employee_id")
VALUES (1, 2, 1),
  (1, 2, 3),
  (2, 3, 2),
  (2, 3, 4);
-- 13) Projects
INSERT INTO "Projects" (
    "delivery_lead_user_id",
    "project_name",
    "company_name",
    "project_desc",
    "start_date",
    "end_date",
    "region_id"
  )
VALUES (
    4,
    'Project Alpha',
    'TechCorp',
    'A top secret software project',
    '2023-01-01',
    '2023-12-31',
    1
  ),
  (
    4,
    'Project Beta',
    'DataCorp',
    'Data analysis initiative',
    '2023-02-01',
    '2023-08-31',
    2
  ),
  (
    4,
    'Project Gamma',
    'CloudCorp',
    'Cloud infrastructure migration',
    '2026-01-01',
    '2026-12-31',
    1
  ),
  (
    4,
    'Project Delta',
    'MobileCorp',
    'Mobile app development',
    '2026-01-01',
    '2026-06-30',
    2
  ),
  (
    4,
    'Project Epsilon',
    'AI Innovations',
    'AI Research initiative',
    '2025-12-01',
    '2026-05-31',
    1
  ),
  (
    4,
    'Project Zeta',
    'Security Solutions',
    'Cybersecurity audit',
    '2025-09-01',
    '2025-12-31',
    3
  );
-- 14) Meeting
INSERT INTO "Meeting" ("meeting_date", "meeting_link")
VALUES (
    '2023-03-15 10:00:00',
    'http://meetinglink.com/1'
  ),
  (
    '2023-04-20 15:30:00',
    'http://meetinglink.com/2'
  );
-- 15) Project_Positions
INSERT INTO "Project_Positions" (
    "project_id",
    "position_name",
    "position_desc",
    "user_id"
  )
VALUES (
    1,
    'Java Developer',
    'Develops Java code for Project Alpha',
    1
  ),
  (
    1,
    'Project Coordinator',
    'Coordinates tasks for Project Alpha',
    2
  ),
  (
    2,
    'Python Developer',
    'Works on data analysis with Python for Project Beta',
    3
  ),
  (
    3,
    'Cloud Architect',
    'Design AWS infrastructure',
    NULL
  ),
  (
    3,
    'DevOps Engineer',
    'Implement CI/CD pipelines',
    3
  ),
  (
    4,
    'Flutter Developer',
    'Build cross-platform app',
    NULL
  ),
  (
    5,
    'ML Engineer',
    'Develop machine learning models',
    NULL
  );
-- 16) Project_User
INSERT INTO "Project_User" ("user_id", "project_id")
VALUES (1, 1),
  -- John on Project Alpha
  (2, 1),
  -- Jane on Project Alpha
  (3, 2),
  -- Alex on Project Beta
  (4, 1),
  -- Emily also involved in Project Alpha
  (4, 2);
-- Emily is the Delivery Lead on Project Beta
-- 17) Project_Position_Skills
INSERT INTO "Project_Position_Skills" ("position_id", "skill_id")
VALUES (1, 1),
  -- Java Developer needs Java
  (2, 2),
  -- Project Coordinator needs PM
  (3, 3);
-- Python Developer needs Python
-- 18) Project_Position_Certificates
INSERT INTO "Project_Position_Certificates" ("position_id", "certificate_id")
VALUES (1, 1),
  -- Java Dev might require Java Certification
  (2, 2);
-- Coordinator might require PMP
-- 19) Postulations
INSERT INTO "Postulations" (
    "project_position_id",
    "user_id",
    "postulation_date",
    "meeting_id"
  )
VALUES (3, 1, '2023-02-20', 1),
  -- John applying to the Python Developer role
  (1, 2, '2023-02-21', 2);
-- Jane applying to the Java Developer role
-- 20) Feedback
INSERT INTO "Feedback" (
    "project_id",
    "user_id",
    "desc",
    "score"
  )
VALUES (1, 1, 'Great progress so far', 4),
  (1, 2, 'Needs more coordination', 3),
  (2, 3, 'Excellent data analysis', 5);
-- 21) Certificate_Users
INSERT INTO "Certificate_Users" (
    "certificate_id",
    "user_id",
    "certificate_date",
    "certificate_expiration_date",
    "certificate_link",
    "status"
  )
VALUES (
    1,
    1,
    '2021-06-01',
    '2024-06-01',
    'http://certificates.com/java_1',
    'completed'
  ),
  (
    2,
    2,
    '2022-01-10',
    '2025-01-10',
    'http://certificates.com/pmp_1',
    'completed'
  );
-- 22) Certificate_Skills
INSERT INTO "Certificate_Skills" ("certificate_id", "skill_id")
VALUES (1, 1),
  -- Java Cert -> Java skill
  (2, 2),
  -- PMP Cert -> PM skill
  (3, 3);
-- AWS Cert -> Python skill (example)
-- 23) Course_Users
INSERT INTO "Course_Users" (
    "course_id",
    "user_id",
    "course_start_date",
    "progress",
    "course_link",
    "finished"
  )
VALUES (
    1,
    1,
    '2023-01-01',
    50,
    'http://courses.com/java_basics',
    FALSE
  ),
  (
    2,
    2,
    '2023-02-01',
    100,
    'http://courses.com/advanced_pm',
    TRUE
  ),
  (
    3,
    3,
    '2023-03-01',
    30,
    'http://courses.com/aws_foundations',
    FALSE
  );
-- 24) Course_Skills
INSERT INTO "Course_Skills" ("course_id", "skill_id")
VALUES (1, 1),
  -- Java Basics -> Java skill
  (2, 2),
  -- Advanced PM -> Project Management skill
  (3, 3);
-- AWS Foundations -> Python skill (example)
-- 25) Employee_Position
INSERT INTO "Employee_Position" (
    "position_id",
    "user_id",
    "start_date",
    "end_date"
  )
VALUES (1, 1, '2020-01-15', NULL),
  (2, 2, '2019-03-10', NULL),
  (3, 3, '2021-06-01', NULL);
-- 26) Goal_Skills
INSERT INTO "Goal_Skills" ("goal_id", "skill_id")
VALUES (1, 1),
  -- Improve Java Skills -> Java
  (2, 2),
  -- Develop PM Skills -> PM
  (3, 3);
-- Get AWS Certified -> Python skill (example)
-- 27) Goal_Users
INSERT INTO "Goal_Users" (
    "goal_id",
    "user_id",
    "create_date",
    "finished_date",
    "completed"
  )
VALUES (1, 1, '2023-01-15', NULL, FALSE),
  (2, 2, '2023-02-20', NULL, FALSE),
  (3, 3, '2023-03-01', NULL, FALSE);
-- 28) User_Skills
INSERT INTO "User_Skills" ("user_id", "skill_id")
VALUES (1, 1),
  -- John -> Java
  (2, 2),
  -- Jane -> PM
  (3, 3),
  -- Alex -> Python
  (4, 4),
  -- Emily -> Communication
  (1, 4);
-- John -> Communication as well