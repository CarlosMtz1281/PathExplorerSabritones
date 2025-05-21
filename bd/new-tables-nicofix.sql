CREATE SCHEMA IF NOT EXISTS pathexplorer;
SET search_path TO pathexplorer;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- =======================

-- TABLA DE PAISES CON REGION Y TIMEZONE --
CREATE TABLE "Country" (
  "country_id" SERIAL PRIMARY KEY,
  "country_name" varchar,
  "region_name" varchar,
  "timezone" varchar
);

-- PERMISOS --
CREATE TABLE "Permits" (
  "role_id" SERIAL PRIMARY KEY,
  "is_employee" boolean,
  "is_people_lead" boolean,
  "is_capability_lead" boolean,
  "is_delivery_lead" boolean,
  "is_admin" boolean
);

-- ==================================
-- Tablas base
-- ==================================
CREATE TABLE "Skills" (
  "skill_id" SERIAL PRIMARY KEY,
  "name" varchar,
  "technical" boolean
);

CREATE TABLE "Certificates" (
  "certificate_id" SERIAL PRIMARY KEY,
  "certificate_name" varchar,
  "certificate_desc" text,
  "certificate_estimated_time" integer,
  "certificate_level" integer,
  "provider" varchar
);

CREATE TABLE "Goals" (
  "goal_id" SERIAL PRIMARY KEY,
  "goal_name" varchar,
  "goal_desc" text
);

CREATE TABLE "Goal_Skills" (
  "goal_id" integer REFERENCES "Goals"("goal_id"),
  "skill_id" integer REFERENCES "Skills"("skill_id"),
  PRIMARY KEY ("goal_id", "skill_id")
);

CREATE TABLE "Certificate_Skills" (
  "certificate_id" integer REFERENCES "Certificates"("certificate_id"),
  "skill_id" integer REFERENCES "Skills"("skill_id"),
  PRIMARY KEY ("certificate_id", "skill_id")
);

-- ==================================
-- Cosas de empleados
-- ==================================
CREATE TABLE "Users" (
  "user_id" SERIAL PRIMARY KEY,
  "mail" varchar,
  "password" varchar,
  "name" varchar,
  "birthday" timestamp,
  "hire_date" timestamp,
  "role_id" integer REFERENCES "Permits"("role_id"),
  "country_id" integer REFERENCES "Country"("country_id")
);

-- Puestos de empleos NO DE PROYECTOS
CREATE TABLE "Work_Position" (
  "position_id" SERIAL PRIMARY KEY,
  "position_name" varchar,
  "position_desc" text,
  "company" varchar
);

-- Relacion entre los puestos y los empleados
CREATE TABLE "Employee_Position" (
  "position_id" integer REFERENCES "Work_Position"("position_id"),
  "user_id" integer REFERENCES "Users"("user_id"),
  "level" integer,
  "start_date" timestamp,
  "end_date" timestamp,
  PRIMARY KEY ("position_id", "user_id")
);

-- Capabilitys
CREATE TABLE "Capability" (
  "capability_id" SERIAL PRIMARY KEY,
  "capability_name" varchar,
  "capability_lead_id" integer REFERENCES "Users"("user_id"),
  "country_id" integer REFERENCES "Country"("country_id")
);

-- Todos los people leads relacionados a su capability
CREATE TABLE "Capability_People_Lead" (
  "capability_id" integer REFERENCES "Capability"("capability_id"),
  "capability_pl_id" integer REFERENCES "Users"("user_id"),
  PRIMARY KEY ("capability_id", "capability_pl_id")
);

-- Relacionar empleados con sus capabilitys y people leads
CREATE TABLE "Capability_Employee" (
  "capability_id" integer REFERENCES "Capability"("capability_id"),
  "people_lead_id" integer REFERENCES "Users"("user_id"),
  "employee_id" integer REFERENCES "Users"("user_id"),
  PRIMARY KEY ("capability_id", "people_lead_id", "employee_id")
);

-- conexion
CREATE TABLE "User_Skills" (
  "user_id" integer REFERENCES "Users"("user_id"),
  "skill_id" integer REFERENCES "Skills"("skill_id"),
  PRIMARY KEY ("user_id", "skill_id")
);

-- conexion data usuarios
CREATE TABLE "Certificate_Users" (
  "certificate_id" integer REFERENCES "Certificates"("certificate_id"),
  "user_id" integer REFERENCES "Users"("user_id"),
  "certificate_date" timestamp,
  "certificate_expiration_date" timestamp,
  "certificate_link" varchar,
  "status" varchar CHECK ("status" IN ('completed', 'expired', 'in progress')),
  PRIMARY KEY ("certificate_id", "user_id")
);

-- metas de los usuarios
CREATE TABLE "Goal_Users" (
  "goal_id" integer REFERENCES "Goals"("goal_id"),
  "user_id" integer REFERENCES "Users"("user_id"),
  "create_date" timestamp,
  "finished_date" timestamp,
  "priority" varchar,
  "completed" boolean,
  PRIMARY KEY ("goal_id", "user_id")
);

-- ==================================
-- Cosas de proyectos
-- ==================================
CREATE TABLE "Projects" (
  "project_id" SERIAL PRIMARY KEY,
  "delivery_lead_user_id" integer REFERENCES "Users"("user_id"),
  "project_name" varchar,
  "company_name" varchar,
  "project_desc" text,
  "start_date" timestamp,
  "end_date" timestamp,
  "country_id" integer REFERENCES "Country"("country_id")
);

-- todos los puestos dentro de un proyecto
CREATE TABLE "Project_Positions" (
  "position_id" SERIAL PRIMARY KEY,
  "project_id" integer REFERENCES "Projects"("project_id"),
  "position_name" varchar,
  "position_desc" text,
  "capability_id" integer REFERENCES "Capability"("capability_id"),
  "user_id" integer REFERENCES "Users"("user_id")
);

-- skills necesarias para estar en un puesto
CREATE TABLE "Project_Position_Skills" (
  "position_id" integer REFERENCES "Project_Positions"("position_id"),
  "skill_id" integer REFERENCES "Skills"("skill_id"),
  PRIMARY KEY ("position_id", "skill_id")
);

-- certificados para estar en un puesto
CREATE TABLE "Project_Position_Certificates" (
  "position_id" integer REFERENCES "Project_Positions"("position_id"),
  "certificate_id" integer REFERENCES "Certificates"("certificate_id"),
  PRIMARY KEY ("position_id", "certificate_id")
);

-- postulaciones de empleados a posiciones
CREATE TABLE "Postulations" (
  "postulation_id" SERIAL PRIMARY KEY,
  "project_position_id" integer REFERENCES "Project_Positions"("position_id"),
  "user_id" integer REFERENCES "Users"("user_id"),
  "postulation_date" timestamp
);

-- juntas entre capability lead y empleados postulado
CREATE TABLE "Meeting" (
  "meeting_id" SERIAL PRIMARY KEY,
  "meeting_date" timestamp,
  "meeting_link" varchar,
  "postulation_id" integer REFERENCES "Postulations"("postulation_id")
);

-- feedback al terminar un proyecto a un usuario
CREATE TABLE "Feedback" (
  "feedback_id" SERIAL PRIMARY KEY,
  "project_id" integer REFERENCES "Projects"("project_id"),
  "user_id" integer REFERENCES "Users"("user_id"),
  "desc" text,
  "score" integer
);

-- ==================================
-- Cosas de Areas (ML y PathExplorer)
-- ==================================
CREATE TABLE "Areas" (
  "area_id" SERIAL PRIMARY KEY,
  "area_name" varchar,
  "area_desc" text
);

-- que certificados se mejoran en el area
CREATE TABLE "Area_Certificates" (
  "area_id" integer REFERENCES "Areas"("area_id"),
  "certificate_id" integer REFERENCES "Certificates"("certificate_id"),
  PRIMARY KEY ("area_id", "certificate_id")
);

-- que puestos de proyectos estan relacionados a un area
CREATE TABLE "Project_Position_Areas" (
  "position_id" integer REFERENCES "Project_Positions"("position_id"),
  "area_id" integer REFERENCES "Areas"("area_id"),
  PRIMARY KEY ("position_id", "area_id")
);

-- Calificacion de los usuarios en las Areas
CREATE TABLE "User_Area_Score" (
  "user_id" integer REFERENCES "Users"("user_id"),
  "area_id" integer REFERENCES "Areas"("area_id"),
  "score" numeric,
  PRIMARY KEY ("user_id", "area_id")
);

-- ==================================
-- Sesion de usuario
-- ==================================
CREATE TABLE "Session" (
  "session_id" varchar PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'base64'),
  "user_id" integer NOT NULL REFERENCES "Users"("user_id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL DEFAULT NOW() + INTERVAL '1 week'
);