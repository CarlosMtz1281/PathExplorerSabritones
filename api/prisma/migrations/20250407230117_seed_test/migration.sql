-- CreateTable
CREATE TABLE "Capability" (
    "capability_id" INTEGER NOT NULL,
    "capability_name" VARCHAR,
    "capability_lead_id" INTEGER,
    "region_id" INTEGER,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("capability_id")
);

-- CreateTable
CREATE TABLE "Capability_Employee" (
    "capability_id" INTEGER NOT NULL,
    "people_lead_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "Capability_Employee_pkey" PRIMARY KEY ("capability_id","people_lead_id","employee_id")
);

-- CreateTable
CREATE TABLE "Capability_People_Lead" (
    "capability_id" INTEGER NOT NULL,
    "capability_pl_id" INTEGER NOT NULL,

    CONSTRAINT "Capability_People_Lead_pkey" PRIMARY KEY ("capability_id","capability_pl_id")
);

-- CreateTable
CREATE TABLE "Certificate_Skills" (
    "certificate_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "Certificate_Skills_pkey" PRIMARY KEY ("certificate_id","skill_id")
);

-- CreateTable
CREATE TABLE "Certificate_Users" (
    "certificate_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "certificate_date" TIMESTAMP(6),
    "certificate_expiration_date" TIMESTAMP(6),
    "certificate_link" VARCHAR,
    "certificate_valid" BOOLEAN,

    CONSTRAINT "Certificate_Users_pkey" PRIMARY KEY ("certificate_id","user_id")
);

-- CreateTable
CREATE TABLE "Certificates" (
    "certificate_id" INTEGER NOT NULL,
    "certificate_name" VARCHAR,
    "certificate_desc" TEXT,

    CONSTRAINT "Certificates_pkey" PRIMARY KEY ("certificate_id")
);

-- CreateTable
CREATE TABLE "Course_Skills" (
    "course_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "Course_Skills_pkey" PRIMARY KEY ("course_id","skill_id")
);

-- CreateTable
CREATE TABLE "Course_Users" (
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_start_date" TIMESTAMP(6),
    "progress" INTEGER,
    "course_link" VARCHAR,
    "finished" BOOLEAN,

    CONSTRAINT "Course_Users_pkey" PRIMARY KEY ("course_id","user_id")
);

-- CreateTable
CREATE TABLE "Courses" (
    "course_id" INTEGER NOT NULL,
    "course_name" VARCHAR,
    "course_desc" TEXT,
    "estimated_time" VARCHAR,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "Employee_Position" (
    "position_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),

    CONSTRAINT "Employee_Position_pkey" PRIMARY KEY ("position_id","user_id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "feedback_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "user_id" INTEGER,
    "desc" TEXT,
    "score" INTEGER,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "Goal_Skills" (
    "goal_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "Goal_Skills_pkey" PRIMARY KEY ("goal_id","skill_id")
);

-- CreateTable
CREATE TABLE "Goal_Users" (
    "goal_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "create_date" TIMESTAMP(6),
    "finished_date" TIMESTAMP(6),
    "completed" BOOLEAN,

    CONSTRAINT "Goal_Users_pkey" PRIMARY KEY ("goal_id","user_id")
);

-- CreateTable
CREATE TABLE "Goals" (
    "goal_id" INTEGER NOT NULL,
    "goal_name" VARCHAR,
    "goal_desc" TEXT,

    CONSTRAINT "Goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "meeting_id" INTEGER NOT NULL,
    "meeting_date" TIMESTAMP(6),
    "meeting_link" VARCHAR,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("meeting_id")
);

-- CreateTable
CREATE TABLE "Permits" (
    "role_id" INTEGER NOT NULL,
    "is_employee" BOOLEAN,
    "is_people_lead" BOOLEAN,
    "is_capability_lead" BOOLEAN,
    "is_delivery_lead" BOOLEAN,
    "is_admin" BOOLEAN,

    CONSTRAINT "Permits_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Postulations" (
    "postulation_id" INTEGER NOT NULL,
    "project_position_id" INTEGER,
    "user_id" INTEGER,
    "postulation_date" TIMESTAMP(6),
    "meeting_id" INTEGER,

    CONSTRAINT "Postulations_pkey" PRIMARY KEY ("postulation_id")
);

-- CreateTable
CREATE TABLE "Project_Position_Certificates" (
    "position_id" INTEGER NOT NULL,
    "certificate_id" INTEGER NOT NULL,

    CONSTRAINT "Project_Position_Certificates_pkey" PRIMARY KEY ("position_id","certificate_id")
);

-- CreateTable
CREATE TABLE "Project_Position_Skills" (
    "position_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "Project_Position_Skills_pkey" PRIMARY KEY ("position_id","skill_id")
);

-- CreateTable
CREATE TABLE "Project_Positions" (
    "position_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "position_name" VARCHAR,
    "position_desc" TEXT,
    "user_id" INTEGER,

    CONSTRAINT "Project_Positions_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "Project_User" (
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "Project_User_pkey" PRIMARY KEY ("user_id","project_id")
);

-- CreateTable
CREATE TABLE "Projects" (
    "project_id" INTEGER NOT NULL,
    "delivery_lead_user_id" INTEGER,
    "project_name" VARCHAR,
    "company_name" VARCHAR,
    "project_desc" TEXT,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "region_id" INTEGER,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Region" (
    "region_id" INTEGER NOT NULL,
    "region_name" VARCHAR,
    "country" VARCHAR,
    "timezone" VARCHAR,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("region_id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "skill_id" INTEGER NOT NULL,
    "name" VARCHAR,
    "technical" BOOLEAN,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("skill_id")
);

-- CreateTable
CREATE TABLE "User_Score" (
    "score_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "score" INTEGER,

    CONSTRAINT "User_Score_pkey" PRIMARY KEY ("score_id")
);

-- CreateTable
CREATE TABLE "User_Skills" (
    "user_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "User_Skills_pkey" PRIMARY KEY ("user_id","skill_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "mail" VARCHAR,
    "password" VARCHAR,
    "name" VARCHAR,
    "birthday" TIMESTAMP(6),
    "hire_date" TIMESTAMP(6),
    "role_id" INTEGER,
    "in_project" BOOLEAN,
    "region_id" INTEGER,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Work_Position" (
    "position_id" INTEGER NOT NULL,
    "position_name" VARCHAR,
    "position_desc" TEXT,
    "company" VARCHAR,

    CONSTRAINT "Work_Position_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" VARCHAR NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'::text),
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL DEFAULT (now() + '7 days'::interval),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- AddForeignKey
ALTER TABLE "Capability" ADD CONSTRAINT "fk_capability_lead" FOREIGN KEY ("capability_lead_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Capability" ADD CONSTRAINT "fk_capability_region" FOREIGN KEY ("region_id") REFERENCES "Region"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Capability_Employee" ADD CONSTRAINT "fk_capability_emp_capability" FOREIGN KEY ("capability_id") REFERENCES "Capability"("capability_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Capability_Employee" ADD CONSTRAINT "fk_capability_emp_lead" FOREIGN KEY ("people_lead_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Capability_Employee" ADD CONSTRAINT "fk_capability_emp_user" FOREIGN KEY ("employee_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Capability_People_Lead" ADD CONSTRAINT "fk_capability_pl_capability" FOREIGN KEY ("capability_id") REFERENCES "Capability"("capability_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Capability_People_Lead" ADD CONSTRAINT "fk_capability_pl_users" FOREIGN KEY ("capability_pl_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Certificate_Skills" ADD CONSTRAINT "fk_certificate_skills_certificate" FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Certificate_Skills" ADD CONSTRAINT "fk_certificate_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Certificate_Users" ADD CONSTRAINT "fk_certificate_users_certificate" FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Certificate_Users" ADD CONSTRAINT "fk_certificate_users_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Skills" ADD CONSTRAINT "fk_course_skills_course" FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Skills" ADD CONSTRAINT "fk_course_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Users" ADD CONSTRAINT "fk_course_users_course" FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course_Users" ADD CONSTRAINT "fk_course_users_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Employee_Position" ADD CONSTRAINT "fk_employee_position_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Employee_Position" ADD CONSTRAINT "fk_employee_position_work" FOREIGN KEY ("position_id") REFERENCES "Work_Position"("position_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "fk_feedback_project" FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "fk_feedback_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Goal_Skills" ADD CONSTRAINT "fk_goal_skills_goal" FOREIGN KEY ("goal_id") REFERENCES "Goals"("goal_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Goal_Skills" ADD CONSTRAINT "fk_goal_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Goal_Users" ADD CONSTRAINT "fk_goal_users_goal" FOREIGN KEY ("goal_id") REFERENCES "Goals"("goal_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Goal_Users" ADD CONSTRAINT "fk_goal_users_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Postulations" ADD CONSTRAINT "fk_postulations_meeting" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("meeting_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Postulations" ADD CONSTRAINT "fk_postulations_project_position" FOREIGN KEY ("project_position_id") REFERENCES "Project_Positions"("position_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Postulations" ADD CONSTRAINT "fk_postulations_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_Position_Certificates" ADD CONSTRAINT "fk_project_position_cert_certificate" FOREIGN KEY ("certificate_id") REFERENCES "Certificates"("certificate_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_Position_Certificates" ADD CONSTRAINT "fk_project_position_cert_position" FOREIGN KEY ("position_id") REFERENCES "Project_Positions"("position_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_Position_Skills" ADD CONSTRAINT "fk_project_position_skills_position" FOREIGN KEY ("position_id") REFERENCES "Project_Positions"("position_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_Position_Skills" ADD CONSTRAINT "fk_project_position_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_Positions" ADD CONSTRAINT "fk_project_positions_project" FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_Positions" ADD CONSTRAINT "fk_project_positions_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_User" ADD CONSTRAINT "fk_project_user_project" FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project_User" ADD CONSTRAINT "fk_project_user_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "fk_projects_lead" FOREIGN KEY ("delivery_lead_user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "fk_projects_region" FOREIGN KEY ("region_id") REFERENCES "Region"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Score" ADD CONSTRAINT "fk_goal_users_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Skills" ADD CONSTRAINT "fk_user_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "Skills"("skill_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Skills" ADD CONSTRAINT "fk_user_skills_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "fk_users_region" FOREIGN KEY ("region_id") REFERENCES "Region"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "Permits"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "fk_session_user" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
