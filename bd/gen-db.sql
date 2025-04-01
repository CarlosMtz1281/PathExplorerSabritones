-- =======================
--      TABLE CREATION
-- =======================
CREATE TABLE "Users" (
    "user_id" integer PRIMARY KEY,
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
    "region_id" integer PRIMARY KEY,
    "region_name" varchar,
    "country" varchar,
    "timezone" varchar
);
CREATE TABLE "User_Score" (
    "score_id" integer PRIMARY KEY,
    "user_id" integer,
    "score" integer
);
CREATE TABLE "Permits" (
    "role_id" integer PRIMARY KEY,
    "is_employee" boolean,
    "is_people_lead" boolean,
    "is_capability_lead" boolean,
    "is_delivery_lead" boolean,
    "is_admin" boolean
);
CREATE TABLE "Capability" (
    "capability_id" integer PRIMARY KEY,
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
    "skill_id" integer PRIMARY KEY,
    "name" varchar,
    "technical" boolean
);
CREATE TABLE "User_Skills" (
    "user_id" integer,
    "skill_id" integer,
    PRIMARY KEY ("user_id", "skill_id")
);
CREATE TABLE "Projects" (
    "project_id" integer PRIMARY KEY,
    "delivery_lead_user_id" integer,
    "project_name" varchar,
    "project_desc" text,
    "start_date" timestamp,
    "end_date" timestamp,
    "region_id" integer
);
CREATE TABLE "Project_Positions" (
    "position_id" integer PRIMARY KEY,
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
    "postulation_id" integer PRIMARY KEY,
    "project_position_id" integer,
    "user_id" integer,
    "postulation_date" timestamp,
    "meeting_id" integer
);
CREATE TABLE "Meeting" (
    "meeting_id" integer PRIMARY KEY,
    "meeting_date" timestamp,
    "meeting_link" varchar
);
CREATE TABLE "Feedback" (
    "feedback_id" integer PRIMARY KEY,
    "project_id" integer,
    "user_id" integer,
    "desc" text,
    "score" integer
);
CREATE TABLE "Certificates" (
    "certificate_id" integer PRIMARY KEY,
    "certificate_name" varchar,
    "certificate_desc" text
);
CREATE TABLE "Certificate_Users" (
    "certificate_id" integer,
    "user_id" integer,
    "certificate_date" timestamp,
    "certificate_expiration_date" timestamp,
    "certificate_link" varchar,
    "certificate_valid" boolean,
    PRIMARY KEY ("certificate_id", "user_id")
);
CREATE TABLE "Certificate_Skills" (
    "certificate_id" integer,
    "skill_id" integer,
    PRIMARY KEY ("certificate_id", "skill_id")
);
CREATE TABLE "Courses" (
    "course_id" integer PRIMARY KEY,
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
    "position_id" integer PRIMARY KEY,
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
    "goal_id" integer PRIMARY KEY,
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