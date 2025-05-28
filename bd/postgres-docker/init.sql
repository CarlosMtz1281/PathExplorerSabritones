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
  "certificate_start_date" timestamp,
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
  "postulation_date" timestamp,
  "valid" boolean DEFAULT TRUE
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
  "position_id" integer REFERENCES "Project_Positions"("position_id"),
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





-- =======================
--    DUMMY DATA INSERTION
-- =======================

-- 1) Country
INSERT INTO "Country" ("country_name", "region_name", "timezone") VALUES
('México', 'América del Norte', 'UTC-6'),               -- 1
('Estados Unidos', 'América del Norte', 'UTC-5'),       -- 2
('Canadá', 'América del Norte', 'UTC-8'),               -- 3
('Reino Unido', 'Europa', 'UTC+0'),                     -- 4
('Alemania', 'Europa', 'UTC+1'),                        -- 5
('Francia', 'Europa', 'UTC+1'),                         -- 6
('India', 'Asia', 'UTC+5:30'),                          -- 7
('Australia', 'Oceanía', 'UTC+8'),                      -- 8
('Japón', 'Asia', 'UTC+9'),                             -- 9
('Brasil', 'América del Sur', 'UTC-2'),                 -- 10
('Sudáfrica', 'África', 'UTC+2'),                       -- 11
('Argentina', 'América del Sur', 'UTC-3'),              -- 12
('China', 'Asia', 'UTC+8'),                             -- 13
('Corea del Sur', 'Asia', 'UTC+9'),                     -- 14
('Italia', 'Europa', 'UTC+1'),                          -- 15
('España', 'Europa', 'UTC+1'),                          -- 16
('Egipto', 'África', 'UTC+2'),                          -- 17
('Rusia', 'Europa', 'UTC+3'),                           -- 18
('Nueva Zelanda', 'Oceanía', 'UTC+12'),                 -- 19
('Colombia', 'América del Sur', 'UTC-5');               -- 20



-- 2) Permits - Expanded with more role combinations
INSERT INTO "Permits" (
    "is_employee",
    "is_people_lead",
    "is_capability_lead",
    "is_delivery_lead",
    "is_admin"
) VALUES
(TRUE, FALSE, FALSE, FALSE, FALSE), -- 1 Simple employee
(TRUE, TRUE, FALSE, FALSE, FALSE), -- 2 People lead
(TRUE, TRUE, TRUE, FALSE, FALSE), -- 3 Capability lead
(TRUE, FALSE, FALSE, TRUE, FALSE), -- 4 Delivery lead
(FALSE, FALSE, FALSE, FALSE, TRUE); -- 5 Admin



-- 3) Skills
INSERT INTO "Skills" ("name", "technical") VALUES
-- Habilidades técnicas
('Java', TRUE),                          -- 1
('Python', TRUE),                        -- 2
('JavaScript', TRUE),                    -- 3
('TypeScript', TRUE),                    -- 4
('React', TRUE),                         -- 5
('Angular', TRUE),                       -- 6
('Node.js', TRUE),                       -- 7
('Spring Boot', TRUE),                   -- 8
('Docker', TRUE),                        -- 9
('Kubernetes', TRUE),                    -- 10
('AWS', TRUE),                           -- 11
('Azure', TRUE),                         -- 12
('SQL', TRUE),                           -- 13
('MongoDB', TRUE),                       -- 14
('Aprendizaje Automático', TRUE),        -- 15
('Análisis de Datos', TRUE),             -- 16
('DevOps', TRUE),                        -- 17
('CI/CD', TRUE),                         -- 18
('Microservicios', TRUE),                -- 19
('API REST', TRUE),                      -- 20
('TensorFlow', TRUE),                    -- 21
('PyTorch', TRUE),                       -- 22
('Hacking Ético', TRUE),                 -- 23
('Blockchain', TRUE),                    -- 24
('Contratos Inteligentes', TRUE),        -- 25
('Arquitectura Serverless', TRUE),       -- 26
('Computación Cuántica', TRUE),          -- 27
('GraphQL', TRUE),                       -- 28
('Apache Kafka', TRUE),                  -- 29
('Prometheus', TRUE),                    -- 30
('Istio', TRUE),                         -- 31
('Jenkins', TRUE),                       -- 32
('Ansible', TRUE),                       -- 33
('Ingeniería del Caos', TRUE),           -- 34
('IA Generativa', TRUE),                 -- 35

-- Habilidades blandas
('Mentoría', FALSE),                     -- 36
('Pensamiento Estratégico', FALSE),      -- 37
('Comunicación Intercultural', FALSE),   -- 38
('Gestión de la Innovación', FALSE),     -- 39
('Gestión del Cambio', FALSE),           -- 40
('Gestión de Proyectos', FALSE),         -- 41
('Comunicación', FALSE),                 -- 42
('Liderazgo', FALSE),                    -- 43
('Trabajo en Equipo', FALSE),            -- 44
('Resolución de Problemas', FALSE),      -- 45
('Gestión del Tiempo', FALSE),           -- 46
('Metodologías Ágiles', FALSE),          -- 47
('Scrum', FALSE),                        -- 48
('Oratoria', FALSE),                     -- 49
('Negociación', FALSE),                  -- 50
('Resolución de Conflictos', FALSE),     -- 51
('Pensamiento Crítico', FALSE),          -- 52
('Creatividad', FALSE),                  -- 53
('Adaptabilidad', FALSE),                -- 54
('Inteligencia Emocional', FALSE);       -- 55



-- 4) Certificates
INSERT INTO "Certificates" (
    "certificate_name",
    "certificate_desc",
    "certificate_estimated_time",
    "certificate_level",
    "provider"
) VALUES
('Oracle Certified Professional: Java SE 11 Developer', 'Certificación avanzada de programación en Java', 120, 3, 'Oracle'), -- 1
('Oracle Database SQL Certified Associate', 'Certificación en SQL y administración de bases de datos', 80, 2, 'Oracle'), -- 2
('Oracle Cloud Infrastructure Foundations Associate', 'Certificación básica en infraestructura de nube', 60, 1, 'Oracle'), -- 3
('Oracle Certified Master, Java EE Enterprise Architect', 'Certificación en arquitectura Java a nivel empresarial', 150, 4, 'Oracle'), -- 4
('AWS Certified Solutions Architect - Associate', 'Certificación en arquitectura de nube', 100, 2, 'Amazon'), -- 5
('AWS Certified Developer - Associate', 'Certificación en desarrollo de aplicaciones en AWS', 90, 2, 'Amazon'), -- 6
('AWS Certified SysOps Administrator - Associate', 'Certificación en operaciones de sistemas en AWS', 95, 2, 'Amazon'), -- 7
('AWS Certified Machine Learning - Specialty', 'Certificación en machine learning en AWS', 110, 3, 'Amazon'), -- 8
('Microsoft Certified: Azure Administrator Associate', 'Certificación en administración de Azure', 85, 2, 'Microsoft'), -- 9
('Microsoft Certified: Azure Solutions Architect Expert', 'Certificación avanzada en arquitectura de Azure', 130, 3, 'Microsoft'), -- 10
('Microsoft Certified: Power BI Data Analyst Associate', 'Certificación en análisis y visualización de datos', 70, 2, 'Microsoft'), -- 11
('Microsoft Certified: DevOps Engineer Expert', 'Certificación en prácticas DevOps en Azure', 120, 3, 'Microsoft'), -- 12
('Google Professional Data Engineer', 'Certificación en ingeniería de datos', 110, 3, 'Google'), -- 13
('Google Associate Cloud Engineer', 'Certificación básica en ingeniería de nube', 75, 1, 'Google'), -- 14
('Google Professional Cloud Architect', 'Certificación en arquitectura de nube', 125, 3, 'Google'), -- 15
('Google Professional Machine Learning Engineer', 'Certificación en ingeniería de machine learning', 115, 3, 'Google'), -- 16
('Coursera Data Science Professional Certificate', 'Certificación integral en ciencia de datos', 180, 2, 'Coursera'), -- 17
('Coursera Machine Learning Specialization', 'Certificación en machine learning por Andrew Ng', 90, 2, 'Coursera'), -- 18
('Coursera Python for Everybody Specialization', 'Certificación en programación Python', 60, 1, 'Coursera'), -- 19
('Coursera Deep Learning Specialization', 'Certificación en deep learning por Andrew Ng', 100, 3, 'Coursera'), -- 20
('Cisco Certified Network Associate (CCNA)', 'Certificación en fundamentos de redes', 95, 2, 'Cisco'), -- 21
('Cisco Certified CyberOps Associate', 'Certificación en operaciones de ciberseguridad', 85, 2, 'Cisco'), -- 22
('Cisco Certified DevNet Associate', 'Certificación en DevOps y automatización de redes', 90, 2, 'Cisco'), -- 23
('Cisco Certified Network Professional (CCNP)', 'Certificación avanzada en redes', 140, 3, 'Cisco'), -- 24
('TensorFlow Developer Certificate', 'Construye y entrena modelos ML usando TensorFlow', 80, 2, 'Google'), -- 25
('Certified Ethical Hacker (CEH)', 'Identifica vulnerabilidades y protege sistemas', 100, 3, 'EC-Council'), -- 26
('Blockchain Developer Certification', 'Desarrolla aplicaciones descentralizadas y contratos inteligentes', 90, 2, 'Blockchain Council'), -- 27
('HashiCorp Certified Terraform Associate', 'Automatización de infraestructura con Terraform', 70, 2, 'HashiCorp'), -- 28
('Certified Kubernetes Security Specialist', 'Protege aplicaciones en contenedores', 85, 3, 'CNCF'), -- 29
('Azure AI Engineer Associate', 'Implementa soluciones de IA en Microsoft Azure', 95, 2, 'Microsoft'), -- 30
('Fundamentos de Computación Cuántica', 'Introducción a conceptos de computación cuántica', 50, 1, 'IBM'), -- 31
('Certificación en Arquitectura Serverless', 'Construye y despliega aplicaciones serverless', 65, 2, 'AWS'), -- 32
('Certificación Scrum Master', 'Fundamentos de gestión de proyectos ágiles con Scrum', 40, 1, 'Scrum Alliance'), -- 33
('Professional Scrum Product Owner', 'Gestión del ciclo de vida de productos con prácticas ágiles', 45, 2, 'Scrum.org'), -- 34
('Certificación en Diseño UX', 'Investigación de experiencia de usuario y diseño de interfaces', 70, 2, 'Interaction Design Foundation'), -- 35
('Certificado de Diseño UI con Figma', 'Diseña interfaces modernas usando Figma', 50, 1, 'Coursera'), -- 36
('ISTQB Certified Tester – Foundation Level', 'Certificación estándar QA para testers', 60, 1, 'ISTQB'), -- 37
('Certificación en Pruebas Móviles con Appium', 'Pruebas automatizadas para aplicaciones móviles', 55, 2, 'Udemy'), -- 38
('Certificado de Desarrollador React Native', 'Desarrollo de apps multiplataforma con React Native', 80, 2, 'Meta'), -- 39
('Certificación en Desarrollo con Flutter', 'Construye aplicaciones móviles con Flutter', 85, 2, 'Google'), -- 40
('Desarrollo de Apps iOS con Swift', 'Construye aplicaciones iOS usando Swift', 75, 2, 'Apple'), -- 41
('Certificación de Desarrollador Android con Kotlin', 'Construye aplicaciones Android usando Kotlin', 80, 2, 'Google'), -- 42
('Pipelines CI/CD con Jenkins', 'Crea y gestiona pipelines CI/CD', 60, 2, 'Pluralsight'), -- 43
('Monitoreo de Infraestructura con Prometheus & Grafana', 'Monitorea infraestructura efectivamente', 65, 2, 'Linux Foundation'), -- 44
('Codificación Segura en Java', 'Evita vulnerabilidades en aplicaciones Java', 70, 2, 'OWASP'), -- 45
('Certificación Profesional en Privacidad de Datos', 'Entiende protección de datos y cumplimiento', 90, 2, 'IAPP'), -- 46
('SQL Avanzado y Ajuste de Bases de Datos', 'Optimiza rendimiento de bases de datos y consultas', 75, 3, 'Oracle'), -- 47
('Certificación en Esenciales de NoSQL', 'Trabajo con bases de datos NoSQL basadas en documentos', 55, 2, 'MongoDB University'), -- 48
('Nanodegree en Desarrollo Web Full Stack', 'Desarrollo completo de stack con Node y React', 180, 3, 'Udacity'), -- 49
('Certificación en Liderazgo Ágil', 'Lidera equipos ágiles con estrategias modernas', 65, 2, 'ICAgile'), -- 50
('Certificación de Analista en Ciberseguridad', 'Analiza amenazas y protege redes', 95, 2, 'IBM'), -- 51
('Certificado en Diseño Ético de IA', 'Diseña sistemas de IA de forma responsable y ética', 50, 1, 'DeepLearning.AI'), -- 52
('Certificado Profesional en Desarrollo con React', 'Domina el desarrollo con React.js', 90, 2, 'Meta'), -- 53
('Certificado en Desarrollo Backend con Node.js', 'Servicios backend usando Node.js', 80, 2, 'Udacity'), -- 54
('DevOps en Azure', 'Implementa pipelines DevOps en Azure', 100, 3, 'Microsoft'), -- 55
('Certificación en Seguridad en la Nube', 'Asegura prácticas de seguridad nativas en la nube', 70, 2, 'Cloud Security Alliance'), -- 56
('Certificación en Desarrollo con Python', 'Domina Python para ingeniería de software', 85, 2, 'PCAP'), -- 57
('Visualización de Datos con Tableau', 'Construye dashboards e insights de datos', 60, 1, 'Coursera'), -- 58
('Certificación en Sistemas Distribuidos', 'Construye aplicaciones distribuidas escalables', 100, 3, 'Stanford Online'), -- 59
('Certificación en Desarrollo con GraphQL', 'Diseña e implementa APIs GraphQL', 60, 2, 'Apollo GraphQL'); -- 60



-- 5) Goals
INSERT INTO "Goals" ("goal_name", "goal_desc") VALUES
('Dominar Desarrollo Java', 'Adquirir competencia en conceptos avanzados y frameworks de Java'), -- 1
('Mejorar Habilidades de Gestión de Proyectos', 'Desarrollar experiencia en metodologías Ágiles y Scrum'), -- 2
('Obtener Certificación AWS', 'Prepararse y aprobar el examen de Arquitecto de Soluciones AWS'), -- 3
('Mejorar Habilidades de Liderazgo', 'Desarrollar habilidades para liderar equipos técnicos efectivamente'), -- 4
('Aprender Machine Learning', 'Adquirir conocimientos prácticos de algoritmos y aplicaciones de ML'), -- 5
('Mejorar Oratoria', 'Ganar confianza en presentación de temas técnicos'), -- 6
('Convertirse en Desarrollador Full-Stack', 'Ampliar habilidades para incluir desarrollo frontend y backend'), -- 7
('Profundizar en Conocimientos de DevOps', 'Aprender técnicas avanzadas de CI/CD y automatización de infraestructura'), -- 8
('Desarrollar Habilidades de Análisis de Datos', 'Aprender a trabajar con big data y herramientas de visualización'), -- 9
('Mejorar Gestión del Tiempo', 'Optimizar productividad personal y priorización de tareas'), -- 10
('Aprender Seguridad en la Nube', 'Entender mejores prácticas de seguridad para entornos cloud'), -- 11
('Dominar Kubernetes', 'Adquirir competencia en orquestación de contenedores'), -- 12
('Convertirse en Ingeniero de Machine Learning', 'Adquirir habilidades para despliegue de ML en producción'), -- 13
('Dominar Desarrollo Blockchain', 'Construir DApps (aplicaciones descentralizadas) de nivel empresarial'), -- 14
('Desarrollar Experticia en Ciberseguridad', 'Proteger infraestructura crítica'), -- 15
('Aprender Computación Cuántica', 'Entender algoritmos cuánticos'), -- 16
('Adquirir Experticia Cloud-Native', 'Dominar orquestación de contenedores'), -- 17
('Mejorar Habilidades en MLOps', 'Implementar CI/CD para pipelines de ML'), -- 18
('Convertirse en Especialista en Ética de IA', 'Garantizar desarrollo responsable de IA'), -- 19
('Dominar Observabilidad', 'Implementar soluciones avanzadas de monitoreo'), -- 20
('Aprender IA Generativa', 'Crear sistemas de generación de contenido'), -- 21
('Desarrollar Habilidades en Edge Computing', 'Construir soluciones optimizadas para IoT'); -- 22



-- 6) Goal_Skills
INSERT INTO "Goal_Skills" ("goal_id", "skill_id") VALUES
(1, 1), (1, 8), (1, 19), (1, 20),                      -- Master Java Development: Java, Spring Boot, Microservices, REST API
(2, 41), (2, 47), (2, 48), (2, 37), (2, 43),           -- Improve Project Management Skills: Project Management, Agile, Scrum, Strategic Thinking, Leadership
(3, 11), (3, 17), (3, 18),                             -- Obtain AWS Certification: AWS, DevOps, CI/CD
(4, 43), (4, 36), (4, 37), (4, 42),                    -- Enhance Leadership Abilities: Leadership, Mentorship, Strategic Thinking, Communication
(5, 15), (5, 21), (5, 22), (5, 16),                    -- Learn Machine Learning: Machine Learning, TensorFlow, PyTorch, Data Analysis
(6, 49), (6, 42),                                       -- Improve Public Speaking: Public Speaking, Communication
(7, 1), (7, 3), (7, 5), (7, 7), (7, 8), (7, 19), (7, 20), -- Become Full-Stack Developer: Java, JavaScript, React, Node.js, Spring Boot, Microservices, REST API
(8, 17), (8, 18), (8, 9), (8, 32), (8, 33),            -- Enhance DevOps Knowledge: DevOps, CI/CD, Docker, Jenkins, Ansible
(9, 16), (9, 13), (9, 14),                             -- Develop Data Analysis Skills: Data Analysis, SQL, MongoDB
(10, 46), (10, 45),                                    -- Improve Time Management: Time Management, Problem Solving
(11, 23), (11, 11), (11, 12),                          -- Learn Cloud Security: Ethical Hacking, AWS, Azure
(12, 10), (12, 9), (12, 31), (12, 30),                 -- Master Kubernetes: Kubernetes, Docker, Istio, Prometheus
(13, 15), (13, 21), (13, 22), (13, 18),                 -- Become Machine Learning Engineer: Machine Learning, TensorFlow, PyTorch, CI/CD
(14, 24), (14, 25),                                    -- Master Blockchain Development: Blockchain, Smart Contracts
(15, 23), (15, 42),                                    -- Develop Cybersecurity Expertise: Ethical Hacking, Communication
(16, 27),                                              -- Learn Quantum Computing: Quantum Computing
(17, 10), (17, 9), (17, 31), (17, 30), (17, 17),        -- Achieve Cloud-Native Expertise: Kubernetes, Docker, Istio, Prometheus, DevOps
(18, 15), (18, 18), (18, 32),                          -- Improve MLOps Skills: Machine Learning, CI/CD, Jenkins
(19, 42), (19, 43),                                    -- Become AI Ethics Specialist: Communication, Leadership
(20, 30), (20, 34), (20, 33),                          -- Master Observability: Prometheus, Chaos Engineering, Ansible
(21, 35), (21, 2),                                     -- Learn Generative AI: Generative AI, Python
(22, 9), (22, 16);                                     -- Develop Edge Computing Skills: Docker, Data Analysis



-- 7) Certificate skills
INSERT INTO "Certificate_Skills" ("certificate_id", "skill_id") VALUES
(1, 1), (1, 8), (1, 13), (1, 45), -- Oracle Certified Professional: Java SE 11 Developer
(2, 13), (2, 45), (2, 16), -- Oracle Database SQL Certified Associate
(3, 11), (3, 17), (3, 54), -- Oracle Cloud Infrastructure Foundations Associate
(4, 1), (4, 8), (4, 19), (4, 37), -- Oracle Certified Master, Java EE Enterprise Architect
(5, 11), (5, 17), (5, 26), (5, 45), -- AWS Certified Solutions Architect - Associate
(6, 2), (6, 11), (6, 18), (6, 42) , -- AWS Certified Developer - Associate
(7, 11), (7, 17), (7, 32), (7, 46), -- AWS Certified SysOps Administrator - Associate
(8, 2), (8, 15), (8, 21), (8, 35), -- AWS Certified Machine Learning - Specialty
(9, 12), (9, 17), (9, 40), -- Microsoft Certified: Azure Administrator Associate
(10, 12), (10, 19), (10, 26), (10, 37), -- Microsoft Certified: Azure Solutions Architect Expert
(11, 16), (11, 42), (11, 53), -- Microsoft Certified: Power BI Data Analyst Associate
(12, 17), (12, 18), (12, 33), (12, 47), -- Microsoft Certified: DevOps Engineer Expert
(13, 2), (13, 15), (13, 16), (13, 28), -- Google Professional Data Engineer
(14, 11), (14, 17), (14, 54), -- Google Associate Cloud Engineer
(15, 11), (15, 19), (15, 26), (15, 37), -- Google Professional Cloud Architect
(16, 2), (16, 15), (16, 21), (16, 35), -- Google Professional Machine Learning Engineer
(17, 2), (17, 15), (17, 16), (17, 45), -- Coursera Data Science Professional Certificate
(18, 2), (18, 15), (18, 21), -- Coursera Machine Learning Specialization
(19, 2), (19, 3), (19, 45), -- Coursera Python for Everybody Specialization
(20, 2), (20, 15), (20, 21), (20, 22), -- Coursera Deep Learning Specialization
(21, 17), (21, 45), (21, 51), -- Cisco Certified Network Associate (CCNA)
(22, 23), (22, 51), (22, 52), -- Cisco Certified CyberOps Associate
(23, 17), (23, 33), (23, 47), -- Cisco Certified DevNet Associate
(24, 17), (24, 19), (24, 34), -- Cisco Certified Network Professional (CCNP)
(25, 15), (25, 21), (25, 35), -- TensorFlow Developer Certificate
(26, 23), (26, 51), (26, 52), -- Certified Ethical Hacker (CEH)
(27, 24), (27, 25), (27, 52), -- Blockchain Developer Certification
(28, 17), (28, 33), (28, 47), -- HashiCorp Certified Terraform Associate
(29, 10), (29, 17), (29, 55), -- Certified Kubernetes Security Specialist
(30, 15), (30, 35), (30, 52), -- Azure AI Engineer Associate
(31, 27), (31, 45), (31, 52), -- Quantum Computing Fundamentals
(32, 11), (32, 26), (32, 47), -- Serverless Architecture Certification
(33, 41), (33, 47), (33, 48), -- Scrum Master Certification
(34, 41), (34, 47), (34, 50), -- Professional Scrum Product Owner
(35, 42), (35, 49), (35, 53), -- Certified UX Designer
(36, 42), (36, 49), (36, 53), -- Figma UI Design Certificate
(37, 45), (37, 51), (37, 52), -- ISTQB Certified Tester – Foundation Level
(38, 3), (38, 45), (38, 51), -- Appium Mobile Testing Certification
(39, 3), (39, 5), (39, 44), -- React Native Developer Certificate
(40, 3), (40, 5), (40, 44), -- Flutter Developer Certification
(41, 3), (41, 42), (41, 44), -- iOS App Development with Swift
(42, 3), (42, 5), (42, 44), -- Android Kotlin Developer Certification
(43, 17), (43, 18), (43, 32), -- CI/CD Pipelines with Jenkins
(44, 17), (44, 30), (44, 46), -- Infrastructure Monitoring with Prometheus & Grafana
(45, 1), (45, 23), (45, 51), -- Secure Coding in Java
(46, 40), (46, 51), (46, 52), -- Certified Data Privacy Professional
(47, 13), (47, 16), (47, 45), -- Advanced SQL and Database Tuning
(48, 14), (48, 16), (48, 45), -- NoSQL Essentials Certification
(49, 3), (49, 5), (49, 7), (49, 13), -- Full Stack Web Developer Nanodegree
(50, 41), (50, 43), (50, 47), -- Agile Leadership Certification
(51, 23), (51, 51), (51, 52), -- Cybersecurity Analyst Certification
(52, 35), (52, 52), (52, 53), -- Ethical AI Design Certificate
(53, 3), (53, 5), (53, 20), -- React Developer Professional Certificate
(54, 3), (54, 7), (54, 20), -- Node.js Backend Developer Certificate
(55, 12), (55, 17), (55, 18), -- DevOps on Azure
(56, 11), (56, 12), (56, 55), -- Cloud Security Certification
(57, 2), (57, 45), (57, 53), -- Certified Python Developer
(58, 16), (58, 42), (58, 53), -- Data Visualization with Tableau
(59, 19), (59, 26), (59, 34), -- Distributed Systems Certification
(60, 7), (60, 20), (60, 28); -- GraphQL Developer Certification



-- 8) Users
-- 1-3 Admins
-- 4-8 DL

-- CL
-- 9 Software Nivel 7
-- 10
-- 11
-- 12
-- 13
-- 14

-- PL
-- 15-19 Software Nivel 4-6
-- 20-22
-- 23-25
-- 26-28
-- 29-31
-- 32-34

-- EMP
-- 35-49 Software Nivel 1-3
-- 50-58
-- 59-67
-- 68-76
-- 77-85
-- 86-94
INSERT INTO "Users" ("mail", "password", "name", "birthday", "hire_date", "role_id", "country_id") VALUES
-- Admins (role 5)
('admin1@accenture.com', crypt('admin123', gen_salt('bf')), 'Admin One', '1980-01-15', '2010-06-01', 5, 2), -- 1
('admin2@accenture.com', crypt('admin223', gen_salt('bf')), 'Admin Two', '1982-05-22', '2012-03-15', 5, 4), -- 2
('admin3@accenture.com', crypt('admin323', gen_salt('bf')), 'Admin Three', '1985-11-30', '2015-09-10', 5, 5), -- 3
-- Delivery Leads (role 4)
('james.wilson@accenture.com', crypt('wilson123', gen_salt('bf')), 'James Wilson', '1975-03-10', '2015-02-20', 4, 2), -- 4
('sarah.johnson@accenture.com', crypt('johnson123', gen_salt('bf')), 'Sarah Johnson', '1978-07-25', '2016-05-12', 4, 2), -- 5
('robert.garcia@accenture.com', crypt('garcia123', gen_salt('bf')), 'Robert Garcia', '1980-11-05', '2017-08-30', 4, 1), -- 6
('emily.smith@accenture.com', crypt('smith123', gen_salt('bf')), 'Emily Smith', '1982-02-18', '2018-01-15', 4, 4), -- 7
('david.miller@accenture.com', crypt('miller123', gen_salt('bf')), 'David Miller', '1983-09-22', '2019-04-05', 4, 5), -- 8
-- Capability Leads (role 3)
('michael.brown@accenture.com', crypt('brown123', gen_salt('bf')), 'Michael Brown', '1985-04-12', '2016-07-10', 3, 2), -- 9
('jennifer.davis@accenture.com', crypt('davis123', gen_salt('bf')), 'Jennifer Davis', '1986-08-30', '2017-03-22', 3, 2), -- 10
('william.rodriguez@accenture.com', crypt('rodriguez123', gen_salt('bf')), 'William Rodriguez', '1987-01-25', '2018-09-15', 3, 1), -- 11
('linda.martinez@accenture.com', crypt('martinez123', gen_salt('bf')), 'Linda Martinez', '1988-06-18', '2019-02-10', 3, 4), -- 12
('john.anderson@accenture.com', crypt('anderson123', gen_salt('bf')), 'John Anderson', '1989-11-05', '2020-05-20', 3, 5), -- 13
('patricia.thomas@accenture.com', crypt('thomas123', gen_salt('bf')), 'Patricia Thomas', '1990-03-30', '2021-01-08', 3, 6), -- 14
-- People Leads (role 2)
('christopher.taylor@accenture.com', crypt('taylor123', gen_salt('bf')), 'Christopher Taylor', '1988-05-15', '2017-06-12', 2, 2), -- 15
('jessica.hernandez@accenture.com', crypt('hernandez123', gen_salt('bf')), 'Jessica Hernandez', '1989-09-20', '2018-03-25', 2, 1), -- 16
('matthew.moore@accenture.com', crypt('moore123', gen_salt('bf')), 'Matthew Moore', '1990-02-10', '2019-01-18', 2, 2), -- 17
('ashley.martin@accenture.com', crypt('martin123', gen_salt('bf')), 'Ashley Martin', '1991-07-05', '2020-04-30', 2, 4), -- 18
('daniel.jackson@accenture.com', crypt('jackson123', gen_salt('bf')), 'Daniel Jackson', '1992-11-22', '2021-02-15', 2, 5), -- 19
('samantha.thompson@accenture.com', crypt('thompson123', gen_salt('bf')), 'Samantha Thompson', '1993-04-18', '2022-03-10', 2, 6), -- 20
('joseph.white@accenture.com', crypt('white123', gen_salt('bf')), 'Joseph White', '1991-08-30', '2019-07-22', 2, 2), -- 21
('amanda.lopez@accenture.com', crypt('lopez123', gen_salt('bf')), 'Amanda Lopez', '1992-01-25', '2020-05-15', 2, 1), -- 22
('ryan.lee@accenture.com', crypt('lee123', gen_salt('bf')), 'Ryan Lee', '1993-06-12', '2021-01-08', 2, 2), -- 23
('emma.gonzalez@accenture.com', crypt('gonzalez123', gen_salt('bf')), 'Emma Gonzalez', '1994-10-05', '2022-02-20', 2, 4), -- 24
('joshua.harris@accenture.com', crypt('harris123', gen_salt('bf')), 'Joshua Harris', '1995-03-30', '2023-04-12', 2, 5), -- 25
('olivia.clark@accenture.com', crypt('clark123', gen_salt('bf')), 'Olivia Clark', '1993-07-22', '2020-08-15', 2, 6), -- 26
('andrew.lewis@accenture.com', crypt('lewis123', gen_salt('bf')), 'Andrew Lewis', '1994-12-18', '2021-06-10', 2, 2), -- 27
('isabella.robinson@accenture.com', crypt('robinson123', gen_salt('bf')), 'Isabella Robinson', '1995-05-10', '2022-03-05', 2, 1), -- 28
('ethan.walker@accenture.com', crypt('walker123', gen_salt('bf')), 'Ethan Walker', '1996-09-25', '2023-01-20', 2, 2), -- 29
('mia.allen@accenture.com', crypt('allen123', gen_salt('bf')), 'Mia Allen', '1994-02-15', '2021-04-12', 2, 4), -- 30
('alexander.young@accenture.com', crypt('young123', gen_salt('bf')), 'Alexander Young', '1995-08-08', '2022-02-28', 2, 5), -- 31
('sophia.hall@accenture.com', crypt('hall123', gen_salt('bf')), 'Sophia Hall', '1996-01-30', '2023-05-15', 2, 6), -- 32
('jacob.king@accenture.com', crypt('king123', gen_salt('bf')), 'Jacob King', '1994-04-22', '2021-07-10', 2, 2), -- 33
('charlotte.scott@accenture.com', crypt('scott123', gen_salt('bf')), 'Charlotte Scott', '1995-10-15', '2022-03-25', 2, 1), -- 34
-- Regular Employees (role 1)
('william.green@accenture.com', crypt('green123', gen_salt('bf')), 'William Green', '1995-06-20', '2020-09-15', 1, 2), -- 35
('ava.adams@accenture.com', crypt('adams123', gen_salt('bf')), 'Ava Adams', '1996-01-12', '2021-02-10', 1, 1), -- 36
('noah.baker@accenture.com', crypt('baker123', gen_salt('bf')), 'Noah Baker', '1997-05-30', '2022-04-05', 1, 2), -- 37
('amelia.nelson@accenture.com', crypt('nelson123', gen_salt('bf')), 'Amelia Nelson', '1995-10-25', '2020-11-18', 1, 4), -- 38
('liam.carter@accenture.com', crypt('carter123', gen_salt('bf')), 'Liam Carter', '1996-03-15', '2021-06-22', 1, 5), -- 39
('oliver.mitchell@accenture.com', crypt('mitchell123', gen_salt('bf')), 'Oliver Mitchell', '1997-08-10', '2022-01-15', 1, 6), -- 40
('elijah.perez@accenture.com', crypt('perez123', gen_salt('bf')), 'Elijah Perez', '1995-12-05', '2020-10-30', 1, 2), -- 41
('harper.roberts@accenture.com', crypt('roberts123', gen_salt('bf')), 'Harper Roberts', '1996-07-22', '2021-03-12', 1, 1), -- 42
('lucas.turner@accenture.com', crypt('turner123', gen_salt('bf')), 'Lucas Turner', '1997-02-18', '2022-05-20', 1, 2), -- 43
('evelyn.phillips@accenture.com', crypt('phillips123', gen_salt('bf')), 'Evelyn Phillips', '1996-04-30', '2021-08-15', 1, 4), -- 44
('benjamin.campbell@accenture.com', crypt('campbell123', gen_salt('bf')), 'Benjamin Campbell', '1997-09-25', '2022-02-10', 1, 5), -- 45
('abigail.parker@accenture.com', crypt('parker123', gen_salt('bf')), 'Abigail Parker', '1995-11-15', '2020-12-05', 1, 6), -- 46
('henry.evans@accenture.com', crypt('evans123', gen_salt('bf')), 'Henry Evans', '1996-06-08', '2021-04-22', 1, 2), -- 47
('ella.edwards@accenture.com', crypt('edwards123', gen_salt('bf')), 'Ella Edwards', '1997-01-30', '2022-07-18', 1, 1), -- 48
('alexander.collins@accenture.com', crypt('collins123', gen_salt('bf')), 'Alexander Collins', '1995-08-22', '2020-11-10', 1, 2), -- 49
('scarlett.stewart@accenture.com', crypt('stewart123', gen_salt('bf')), 'Scarlett Stewart', '1996-03-15', '2021-05-25', 1, 4), -- 50
('daniel.sanchez@accenture.com', crypt('sanchez123', gen_salt('bf')), 'Daniel Sanchez', '1997-10-05', '2022-01-12', 1, 5), -- 51
('madison.morris@accenture.com', crypt('morris123', gen_salt('bf')), 'Madison Morris', '1995-05-28', '2020-09-20', 1, 6), -- 52
('jackson.rogers@accenture.com', crypt('rogers123', gen_salt('bf')), 'Jackson Rogers', '1996-12-20', '2021-06-15', 1, 2), -- 53
('avery.reed@accenture.com', crypt('reed123', gen_salt('bf')), 'Avery Reed', '1997-07-12', '2022-03-08', 1, 1), -- 54
('sebastian.cook@accenture.com', crypt('cook123', gen_salt('bf')), 'Sebastian Cook', '1995-09-05', '2020-12-22', 1, 2), -- 55
('chloe.morgan@accenture.com', crypt('morgan123', gen_salt('bf')), 'Chloe Morgan', '1996-04-30', '2021-08-10', 1, 4), -- 56
('david.bell@accenture.com', crypt('bell123', gen_salt('bf')), 'David Bell', '1997-11-25', '2022-02-15', 1, 5), -- 57
('zoey.murphy@accenture.com', crypt('murphy123', gen_salt('bf')), 'Zoey Murphy', '1995-02-18', '2020-10-05', 1, 6), -- 58
('joseph.bailey@accenture.com', crypt('bailey123', gen_salt('bf')), 'Joseph Bailey', '1996-09-10', '2021-04-20', 1, 2), -- 59
('victoria.rivera@accenture.com', crypt('rivera123', gen_salt('bf')), 'Victoria Rivera', '1997-04-05', '2022-01-12', 1, 1), -- 60
('samuel.cooper@accenture.com', crypt('cooper123', gen_salt('bf')), 'Samuel Cooper', '1995-07-30', '2020-11-25', 1, 2), -- 61
('penelope.richardson@accenture.com', crypt('richardson123', gen_salt('bf')), 'Penelope Richardson', '1996-12-22', '2021-06-18', 1, 4), -- 62
('gabriel.cox@accenture.com', crypt('cox123', gen_salt('bf')), 'Gabriel Cox', '1997-05-15', '2022-02-10', 1, 5), -- 63
('layla.howard@accenture.com', crypt('howard123', gen_salt('bf')), 'Layla Howard', '1995-10-08', '2020-12-30', 1, 6), -- 64
('christopher.ward@accenture.com', crypt('ward123', gen_salt('bf')), 'Christopher Ward', '1996-03-25', '2021-07-15', 1, 2), -- 65
('riley.torres@accenture.com', crypt('torres123', gen_salt('bf')), 'Riley Torres', '1997-08-20', '2022-03-05', 1, 1), -- 66
('andrew.peterson@accenture.com', crypt('peterson123', gen_salt('bf')), 'Andrew Peterson', '1995-01-12', '2020-09-22', 1, 2), -- 67
('hannah.gray@accenture.com', crypt('gray123', gen_salt('bf')), 'Hannah Gray', '1996-06-05', '2021-02-18', 1, 4), -- 68
('dylan.ramirez@accenture.com', crypt('ramirez123', gen_salt('bf')), 'Dylan Ramirez', '1997-11-30', '2022-05-10', 1, 5), -- 69
('natalie.james@accenture.com', crypt('james123', gen_salt('bf')), 'Natalie James', '1995-04-22', '2020-10-15', 1, 6), -- 70
('nathan.watson@accenture.com', crypt('watson123', gen_salt('bf')), 'Nathan Watson', '1996-09-15', '2021-04-05', 1, 2), -- 71
('zoey.brooks@accenture.com', crypt('brooks123', gen_salt('bf')), 'Zoey Brooks', '1997-02-08', '2022-01-20', 1, 1), -- 72
('ryan.kelly@accenture.com', crypt('kelly123', gen_salt('bf')), 'Ryan Kelly', '1995-07-30', '2020-11-12', 1, 2), -- 73
('leah.sanders@accenture.com', crypt('sanders123', gen_salt('bf')), 'Leah Sanders', '1996-12-25', '2021-06-15', 1, 4), -- 74
('isaac.price@accenture.com', crypt('price123', gen_salt('bf')), 'Isaac Price', '1997-05-18', '2022-02-28', 1, 5), -- 75
('audrey.bennett@accenture.com', crypt('bennett123', gen_salt('bf')), 'Audrey Bennett', '1995-10-10', '2020-12-22', 1, 6), -- 76
('caleb.wood@accenture.com', crypt('wood123', gen_salt('bf')), 'Caleb Wood', '1996-03-05', '2021-07-18', 1, 2), -- 77
('savannah.barnes@accenture.com', crypt('barnes123', gen_salt('bf')), 'Savannah Barnes', '1997-08-30', '2022-04-10', 1, 1), -- 78
('luke.ross@accenture.com', crypt('ross123', gen_salt('bf')), 'Luke Ross', '1995-01-22', '2020-09-15', 1, 2), -- 79
('aria.henderson@accenture.com', crypt('henderson123', gen_salt('bf')), 'Aria Henderson', '1996-06-15', '2021-02-28', 1, 4), -- 80
('christian.coleman@accenture.com', crypt('coleman123', gen_salt('bf')), 'Christian Coleman', '1997-11-10', '2022-05-22', 1, 5), -- 81
('lily.jenkins@accenture.com', crypt('jenkins123', gen_salt('bf')), 'Lily Jenkins', '1995-04-02', '2020-10-18', 1, 6), -- 82
('jonathan.perry@accenture.com', crypt('perry123', gen_salt('bf')), 'Jonathan Perry', '1996-09-25', '2021-04-12', 1, 2), -- 83
('aubrey.powell@accenture.com', crypt('powell123', gen_salt('bf')), 'Aubrey Powell', '1997-02-18', '2022-01-30', 1, 1), -- 84
('elias.long@accenture.com', crypt('long123', gen_salt('bf')), 'Elias Long', '1995-07-12', '2020-11-05', 1, 2), -- 85
('claire.patterson@accenture.com', crypt('patterson123', gen_salt('bf')), 'Claire Patterson', '1996-12-05', '2021-06-20', 1, 4), -- 86
('landon.hughes@accenture.com', crypt('hughes123', gen_salt('bf')), 'Landon Hughes', '1997-05-30', '2022-03-15', 1, 5), -- 87
('skylar.flores@accenture.com', crypt('flores123', gen_salt('bf')), 'Skylar Flores', '1995-10-22', '2020-12-10', 1, 6), -- 88
('aaron.washington@accenture.com', crypt('washington123', gen_salt('bf')), 'Aaron Washington', '1996-03-15', '2021-07-25', 1, 2), -- 89
('paisley.butler@accenture.com', crypt('butler123', gen_salt('bf')), 'Paisley Butler', '1997-08-10', '2022-04-05', 1, 1), -- 90
('hudson.simmons@accenture.com', crypt('simmons123', gen_salt('bf')), 'Hudson Simmons', '1995-01-30', '2020-09-22', 1, 2), -- 91
('autumn.foster@accenture.com', crypt('foster123', gen_salt('bf')), 'Autumn Foster', '1996-06-25', '2021-02-15', 1, 4), -- 92
('ezra.gonzales@accenture.com', crypt('gonzales123', gen_salt('bf')), 'Ezra Gonzales', '1997-11-18', '2022-05-30', 1, 5), -- 93
('piper.bryant@accenture.com', crypt('bryant123', gen_salt('bf')), 'Piper Bryant', '1995-04-10', '2020-10-25', 1, 6), -- 94
-- Managing Director
('john.doe@accenture.com', crypt('doe123', gen_salt('bf')), 'John Doe', '1985-04-10', '2020-10-25', 3, 1); -- 95


-- 9) Work Positions
INSERT INTO "Work_Position" (
    "position_name", 
    "position_desc", 
    "company"
) VALUES
-- Puestos de Accenture
('Ingeniero de Software', 'Diseña y desarrolla aplicaciones de software', 'Accenture'), -- 1
('Gerente de Desarrollo de Software', 'Lidera el equipo de desarrollo de software y define estándares técnicos', 'Accenture'), -- 2
('Analista de Datos', 'Realiza análisis de datos y crea modelos predictivos', 'Accenture'), -- 3
('Líder de Ciencia de Datos', 'Dirige proyectos de análisis de datos e implementación de modelos de ML', 'Accenture'), -- 4
('Especialista en Cloud', 'Implementa y mantiene soluciones en la nube', 'Accenture'), -- 5
('Arquitecto Cloud Senior', 'Diseña arquitecturas escalables en la nube y establece mejores prácticas', 'Accenture'), -- 6
('Ingeniero QA', 'Ejecuta pruebas de software y asegura la calidad del producto', 'Accenture'), -- 7
('Gerente de Calidad de Software', 'Supervisa los procesos de QA y mejora continua', 'Accenture'), -- 8
('Diseñador UI/UX', 'Crea interfaces de usuario y experiencias digitales', 'Accenture'), -- 9
('Líder de Diseño Digital', 'Gestiona el equipo de diseño y la estrategia de experiencia de usuario', 'Accenture'), -- 10
('Ingeniero DevOps', 'Automatiza procesos de despliegue e integración continua', 'Accenture'), -- 11
('Arquitecto DevOps', 'Diseña e implementa estrategias de automatización y entrega continua', 'Accenture'), -- 12
-- Puestos fuera de Accenture
('Desarrollador Frontend React', 'Implementa interfaces de usuario usando React.js', 'Meta'), -- 13
('Ingeniero de Machine Learning', 'Diseña e implementa modelos de inteligencia artificial', 'Google'), -- 14
('Especialista en Ciberseguridad', 'Protege sistemas contra amenazas digitales', 'Cisco'), -- 15
('Arquitecto de Soluciones AWS', 'Diseña infraestructuras en la nube de AWS', 'Amazon Web Services'), -- 16
('Ingeniero de Datos Senior', 'Construye pipelines de datos a gran escala', 'Microsoft'), -- 17
('Scrum Master', 'Facilita procesos ágiles en equipos de desarrollo', 'Spotify'), -- 18
('Desarrollador Blockchain', 'Crea aplicaciones descentralizadas (DApps)', 'Coinbase'), -- 19
('Ingeniero de Confiabilidad de Sitios (SRE)', 'Mantiene la disponibilidad de sistemas críticos', 'Google'), -- 20
('Especialista en Inteligencia Artificial', 'Desarrolla algoritmos de aprendizaje automático', 'DeepMind'), -- 21
('Consultor SAP', 'Implementa soluciones empresariales SAP', 'SAP'), -- 22
('Ingeniero de Realidad Aumentada', 'Desarrolla experiencias AR/VR', 'Unity Technologies'), -- 23
('Analista de Ciberseguridad', 'Monitorea y responde a incidentes de seguridad', 'Palo Alto Networks'), -- 24
('Desarrollador iOS Senior', 'Crea aplicaciones para el ecosistema Apple', 'Apple'), -- 25
('Ingeniero de Automatización', 'Desarrolla scripts y herramientas para automatización', 'Tesla'), -- 26
('Arquitecto de Software Empresarial', 'Diseña sistemas complejos para grandes organizaciones', 'Oracle'), -- 27
('Especialista en DevOps', 'Implementa prácticas CI/CD en entornos cloud', 'GitLab'), -- 28
('Ingeniero de Calidad de Software', 'Asegura calidad en productos digitales', 'Adobe'), -- 29
('Científico de Datos Cuantitativos', 'Desarrolla modelos matemáticos avanzados', 'Jane Street'), -- 30
('Desarrollador de Juegos', 'Crea videojuegos para múltiples plataformas', 'Electronic Arts'), -- 31
('Ingeniero de Sistemas Embebidos', 'Programa sistemas de hardware integrado', 'Intel'), -- 32
('Especialista en Transformación Digital', 'Ayuda a empresas en su transición tecnológica', 'IBM'), -- 33
('Software Delivery Lead', 'Delivery lead Accenture', 'Accenture'), -- 34
('Data Delivery Lead', 'Delivery lead Accenture', 'Accenture'), -- 35
('AWS Delivery Lead', 'Delivery lead Accenture', 'Accenture'), -- 36
('QA Delivery Lead', 'Delivery lead Accenture', 'Accenture'), -- 37
('UIUX Delivery Lead', 'Delivery lead Accenture', 'Accenture'), -- 38
('Admin', 'Admin Accenture PathExplorer', 'Accenture'), -- 39
('Managing Director', 'Managing director of capability and delivery leads', 'Accenture'); -- 40



-- 10) Employee Position
INSERT INTO "Employee_Position" (
    "position_id",
    "user_id", 
    "level",
    "start_date",
    "end_date"
) VALUES
-- Administradores (usuarios 1-3)
(39, 1, 1, '2000-01-01', NULL),
(39, 2, 1, '2000-01-01', NULL),
(39, 3, 1, '2000-01-01', NULL),
-- DL (usuarios 4-8)
(34, 4, 6, '2000-01-01', NULL),
(35, 5, 6, '2000-01-01', NULL),
(36, 6, 6, '2000-01-01', NULL),
(37, 7, 6, '2000-01-01', NULL),
(38, 8, 6, '2000-01-01', NULL), 
-- CL (9-14)
(25, 9, NULL, '2018-10-10', '2022-12-31'),
(2,  9, 6, '2023-01-01', NULL),
(4, 10, 7, '2022-01-10', NULL),
(6, 11, 8, '2022-01-10', NULL),
(8, 12, 6, '2022-01-10', NULL),
(10, 13, 6, '2022-01-10', NULL),
(12, 14, 7, '2022-01-10', NULL),
-- PL CAP 1 (15-19)
(13, 15, NULL, '2019-01-10', '2022-01-09'),
(1, 15, 7, '2022-01-10', NULL),
(1, 16, 8, '2022-01-10', NULL),
(1, 17, 9, '2022-01-10', NULL),
(1, 18, 8, '2022-01-10', NULL),
(1, 19, 6, '2022-01-10', NULL),
-- Otros PL (20-34)
(3, 20, 7, '2022-01-10', NULL),
(3, 21, 8, '2022-01-10', NULL),
(3, 22, 7, '2022-01-10', NULL),
(5, 23, 9, '2022-01-10', NULL),
(5, 24, 8, '2022-01-10', NULL),
(5, 25, 7, '2022-01-10', NULL),
(7, 26, 7, '2022-01-10', NULL),
(7, 27, 7, '2022-01-10', NULL),
(7, 28, 8, '2022-01-10', NULL),
(9, 29, 8, '2022-01-10', NULL),
(9, 30, 8, '2022-01-10', NULL),
(9, 31, 7, '2022-01-10', NULL),
(11, 32, 7, '2022-01-10', NULL),
(11, 33, 7, '2022-01-10', NULL),
(11, 34, 7, '2022-01-10', NULL),
-- Regular Emps (35-94)
-- Employee 35 with previous position 13 (Desarrollador Frontend React at Meta)
(13, 35, NULL, '2019-06-15', '2021-12-31'),
(1, 35, 10, '2022-01-01', NULL),
-- Employees 36-49 (Job 1 nivel 1-3)
(1, 36, 11, '2022-01-10', NULL),
(1, 37, 10, '2022-01-10', NULL),
(1, 38, 9, '2022-01-10', NULL),
(1, 39, 10, '2022-01-10', NULL),
(1, 40, 11, '2022-01-10', NULL),
(1, 41, 10, '2022-01-10', NULL),
(1, 42, 11, '2022-01-10', NULL),
(1, 43, 10, '2022-01-10', NULL),
(1, 44, 10, '2022-01-10', NULL),
(1, 45, 11, '2022-01-10', NULL),
(1, 46, 11, '2022-01-10', NULL),
(1, 47, 9, '2022-01-10', NULL),
(1, 48, 11, '2022-01-10', NULL),
(1, 49, 10, '2022-01-10', NULL),
-- Employees 50-58 (Job 3 nivel 1-3)
(3, 50, 11, '2022-01-10', NULL),
(3, 51, 9, '2022-01-10', NULL),
(3, 52, 10, '2022-01-10', NULL),
(3, 53, 11, '2022-01-10', NULL),
(3, 54, 10, '2022-01-10', NULL),
(3, 55, 11, '2022-01-10', NULL),
(3, 56, 10, '2022-01-10', NULL),
(3, 57, 10, '2022-01-10', NULL),
(3, 58, 10, '2022-01-10', NULL),
-- Employees 59-67 (Job 5 nivel 1-3)
(5, 59, 10, '2022-01-10', NULL),
(5, 60, 10, '2022-01-10', NULL),
(5, 61, 11, '2022-01-10', NULL),
(5, 62, 11, '2022-01-10', NULL),
(5, 63, 11, '2022-01-10', NULL),
(5, 64, 9, '2022-01-10', NULL),
(5, 65, 9, '2022-01-10', NULL),
(5, 66, 10, '2022-01-10', NULL),
(5, 67, 11, '2022-01-10', NULL),
-- Employees 68-76 (Job 7 nivel 1-3)
(7, 68, 11, '2022-01-10', NULL),
(7, 69, 11, '2022-01-10', NULL),
(7, 70, 10, '2022-01-10', NULL),
(7, 71, 11, '2022-01-10', NULL),
(7, 72, 11, '2022-01-10', NULL),
(7, 73, 11, '2022-01-10', NULL),
(7, 74, 10, '2022-01-10', NULL),
(7, 75, 10, '2022-01-10', NULL),
(7, 76, 11, '2022-01-10', NULL),
-- Employees 77-85 (Job 9 nivel 1-3)
(9, 77, 11, '2022-01-10', NULL),
(9, 78, 10, '2022-01-10', NULL),
(9, 79, 11, '2022-01-10', NULL),
(9, 80, 9, '2022-01-10', NULL),
(9, 81, 10, '2022-01-10', NULL),
(9, 82, 11, '2022-01-10', NULL),
(9, 83, 11, '2022-01-10', NULL),
(9, 84, 9, '2022-01-10', NULL),
(9, 85, 9, '2022-01-10', NULL),
-- Employees 86-94 (Job 11 nivel 1-3)
(11, 86, 10, '2022-01-10', NULL),
(11, 87, 11, '2022-01-10', NULL),
(11, 88, 9, '2022-01-10', NULL),
(11, 89, 11, '2022-01-10', NULL),
(11, 90, 11, '2022-01-10', NULL),
(11, 91, 11, '2022-01-10', NULL),
(11, 92, 10, '2022-01-10', NULL),
(11, 93, 9, '2022-01-10', NULL),
(11, 94, 10, '2022-01-10', NULL),
-- Managing director
(40, 95, 5, '2015-01-01', NULL);



-- 11) Capability
INSERT INTO "Capability" (
    "capability_name",
    "capability_lead_id",
    "country_id"
) VALUES
('Desarrollo de Software', 9, 1),
('Ciencia de Datos', 10, 6),
('Arquitectura en la nube', 11, 2),
('Calidad de Software QA', 12, 1),
('Diseño de UI y UX', 13, 4),
('Ingenieria de DevOps', 14, 3),
('Management', 95, 1);



-- 12) Capability PL
INSERT INTO "Capability_People_Lead" ("capability_id", "capability_pl_id") VALUES
-- Desarrollo de Software (People Leads 15-19)
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
-- Ciencia de Datos (People Leads 20-22)
(2, 20),
(2, 21),
(2, 22),
-- Arquitectura en la Nube (People Leads 23-25)
(3, 23),
(3, 24),
(3, 25),
-- Calidad de Software QA (People Leads 26-28)
(4, 26),
(4, 27),
(4, 28),
-- Diseño de UI/UX (People Leads 29-31)
(5, 29),
(5, 30),
(5, 31),
-- Ingeniería de DevOps (People Leads 32-34)
(6, 32),
(6, 33),
(6, 34),
-- CLs son people leads tambien
(1, 9),
(2, 10),
(3, 11),
(4, 12),
(5, 13),
(6, 14),
(7, 95);



-- 13) Capability Employee
INSERT INTO "Capability_Employee" ("capability_id", "people_lead_id", "employee_id") VALUES
-- Desarrollo de Software (Employees 35-49) - 3 employees per People Lead (15-19)
(1, 15, 35), (1, 15, 36), (1, 15, 37),
(1, 16, 38), (1, 16, 39), (1, 16, 40),
(1, 17, 41), (1, 17, 42), (1, 17, 43),
(1, 18, 44), (1, 18, 45), (1, 18, 46),
(1, 19, 47), (1, 19, 48), (1, 19, 49),
-- PLs son counselees de CL
(1, 9, 15), (1, 9, 16), (1, 9, 17), (1, 9, 18), (1, 9, 19), (1, 9, 4),
-- Ciencia de Datos (Employees 50-58) - 3 employees per People Lead (20-22)
(2, 20, 50), (2, 20, 51), (2, 20, 52),
(2, 21, 53), (2, 21, 54), (2, 21, 55),
(2, 22, 56), (2, 22, 57), (2, 22, 58),
-- PLs son counselees de CL
(2, 10, 20), (2, 10, 21), (2, 10, 22), (2, 10, 5),
-- Arquitectura en la Nube (Employees 59-67) - 3 employees per People Lead (23-25)
(3, 23, 59), (3, 23, 60), (3, 23, 61),
(3, 24, 62), (3, 24, 63), (3, 24, 64),
(3, 25, 65), (3, 25, 66), (3, 25, 67),
-- PLs son counselees de CL
(3, 11, 23), (3, 11, 24), (3, 11, 25), (3, 11, 6),
-- Calidad de Software QA (Employees 68-76) - 3 employees per People Lead (26-28)
(4, 26, 68), (4, 26, 69), (4, 26, 70),
(4, 27, 71), (4, 27, 72), (4, 27, 73),
(4, 28, 74), (4, 28, 75), (4, 28, 76),
-- PLs son counselees de CL
(4, 12, 26), (4, 12, 27), (4, 12, 28), (4, 12, 7),
-- Diseño de UI/UX (Employees 77-85) - 3 employees per People Lead (29-31)
(5, 29, 77), (5, 29, 78), (5, 29, 79),
(5, 30, 80), (5, 30, 81), (5, 30, 82),
(5, 31, 83), (5, 31, 84), (5, 31, 85),
-- PLs son counselees de CL
(5, 13, 29), (5, 13, 30), (5, 13, 31), (5, 13, 8),
-- Ingeniería de DevOps (Employees 86-94) - 3 employees per People Lead (32-34)
(6, 32, 86), (6, 32, 87), (6, 32, 88),
(6, 33, 89), (6, 33, 90), (6, 33, 91),
(6, 34, 92), (6, 34, 93), (6, 34, 94),
-- PLs son counselees de CL
(6, 14, 32), (6, 14, 33), (6, 14, 34),
-- Manager es PL de CLs
(7, 95, 9), (7, 95, 10), (7, 95, 11), (7, 95, 12), (7, 95, 13), (7, 95, 14);



-- 14) User Skills
INSERT INTO "User_Skills" ("user_id", "skill_id") VALUES
-- Delivery Leads (4-8)
(4, 1), (4, 8), (4, 13), (4, 42), (4, 43), (4, 45),  -- Java, Spring Boot, SQL, Comunicación, Liderazgo, Resolución de Problemas
(5, 2), (5, 15), (5, 16), (5, 37), (5, 43), (5, 52),  -- Python, Aprendizaje Automático, Análisis de Datos, Pensamiento Estratégico, Liderazgo, Pensamiento Crítico
(6, 11), (6, 19), (6, 26), (6, 40), (6, 43), (6, 47),  -- AWS, Microservicios, Arquitectura Serverless, Gestión del Cambio, Liderazgo, Metodologías Ágiles
(7, 7), (7, 13), (7, 17), (7, 41), (7, 43), (7, 48),  -- Node.js, SQL, DevOps, Gestión de Proyectos, Liderazgo, Scrum
(8, 5), (8, 6), (8, 20), (8, 42), (8, 49), (8, 53),  -- React, Angular, API REST, Comunicación, Oratoria, Creatividad
-- Capability Leads (9-14)
(9, 1), (9, 8), (9, 13), (9, 42), (9, 43), (9, 45),  -- Java, Spring Boot, SQL, Comunicación, Liderazgo, Resolución de Problemas
(10, 2), (10, 15), (10, 16), (10, 37), (10, 43), (10, 52),  -- Python, Aprendizaje Automático, Análisis de Datos, Pensamiento Estratégico, Liderazgo, Pensamiento Crítico
(11, 11), (11, 19), (11, 26), (11, 40), (11, 43), (11, 47),  -- AWS, Microservicios, Arquitectura Serverless, Gestión del Cambio, Liderazgo, Metodologías Ágiles
(12, 7), (12, 13), (12, 17), (12, 41), (12, 43), (12, 48),  -- Node.js, SQL, DevOps, Gestión de Proyectos, Liderazgo, Scrum
(13, 5), (13, 6), (13, 20), (13, 42), (13, 49), (13, 53),  -- React, Angular, API REST, Comunicación, Oratoria, Creatividad
(14, 9), (14, 10), (14, 17), (14, 43), (14, 45), (14, 54),  -- Docker, Kubernetes, DevOps, Liderazgo, Resolución de Problemas, Adaptabilidad
-- People Leads (15-34)
(15, 1), (15, 8), (15, 13), (15, 42), (15, 43), (15, 45),
(16, 1), (16, 3), (16, 7), (16, 42), (16, 44), (16, 45),
(17, 2), (17, 13), (17, 16), (17, 42), (17, 45), (17, 52),
(18, 1), (18, 8), (18, 20), (18, 43), (18, 47), (18, 48),
(19, 3), (19, 5), (19, 7), (19, 42), (19, 44), (19, 45),
(20, 2), (20, 15), (20, 16), (20, 37), (20, 43), (20, 45),
(21, 2), (21, 15), (21, 21), (21, 42), (21, 45), (21, 52),
(22, 13), (22, 14), (22, 16), (22, 42), (22, 45), (22, 46),
(23, 11), (23, 12), (23, 19), (23, 40), (23, 43), (23, 47),
(24, 11), (24, 17), (24, 26), (24, 43), (24, 45), (24, 54),
(25, 11), (25, 19), (25, 28), (25, 43), (25, 45), (25, 47),
(26, 7), (26, 13), (26, 18), (26, 41), (26, 45), (26, 48),
(27, 9), (27, 10), (27, 17), (27, 43), (27, 45), (27, 54),
(28, 7), (28, 18), (28, 32), (28, 41), (28, 45), (28, 48),
(29, 5), (29, 6), (29, 28), (29, 42), (29, 49), (29, 53),
(30, 5), (30, 20), (30, 28), (30, 42), (30, 49), (30, 53),
(31, 3), (31, 5), (31, 28), (31, 42), (31, 49), (31, 53),
(32, 9), (32, 10), (32, 17), (32, 43), (32, 45), (32, 54),
(33, 17), (33, 18), (33, 32), (33, 43), (33, 45), (33, 47),
(34, 9), (34, 17), (34, 30), (34, 43), (34, 45), (34, 54),
-- Regular Employees (35-94) - Pattern: 3 technical + 3 soft skills per user
(35, 1), (35, 8), (35, 13), (35, 42), (35, 44), (35, 45),
(36, 1), (36, 3), (36, 7), (36, 42), (36, 44), (36, 45),
(37, 2), (37, 13), (37, 16), (37, 42), (37, 45), (37, 52),
(38, 1), (38, 8), (38, 20), (38, 42), (38, 47), (38, 48),
(39, 3), (39, 5), (39, 7), (39, 42), (39, 44), (39, 45),
(40, 2), (40, 15), (40, 16), (40, 42), (40, 45), (40, 52),
(41, 2), (41, 15), (41, 21), (41, 42), (41, 45), (41, 52),
(42, 13), (42, 14), (42, 16), (42, 42), (42, 45), (42, 46),
(43, 11), (43, 12), (43, 19), (43, 42), (43, 45), (43, 47),
(44, 11), (44, 17), (44, 26), (44, 42), (44, 45), (44, 54),
(45, 11), (45, 19), (45, 28), (45, 42), (45, 45), (45, 47),
(46, 7), (46, 13), (46, 18), (46, 42), (46, 45), (46, 48),
(47, 9), (47, 10), (47, 17), (47, 42), (47, 45), (47, 54),
(48, 7), (48, 18), (48, 32), (48, 42), (48, 45), (48, 48),
(49, 5), (49, 6), (49, 28), (49, 42), (49, 44), (49, 53),
(50, 2), (50, 15), (50, 16), (50, 42), (50, 45), (50, 52),
(51, 2), (51, 15), (51, 21), (51, 42), (51, 45), (51, 52),
(52, 13), (52, 14), (52, 16), (52, 42), (52, 45), (52, 46),
(53, 11), (53, 12), (53, 19), (53, 42), (53, 45), (53, 47),
(54, 11), (54, 17), (54, 26), (54, 42), (54, 45), (54, 54),
(55, 11), (55, 19), (55, 28), (55, 42), (55, 45), (55, 47),
(56, 7), (56, 13), (56, 18), (56, 42), (56, 45), (56, 48),
(57, 9), (57, 10), (57, 17), (57, 42), (57, 45), (57, 54),
(58, 7), (58, 18), (58, 32), (58, 42), (58, 45), (58, 48),
(59, 11), (59, 12), (59, 19), (59, 42), (59, 45), (59, 47),
(60, 11), (60, 17), (60, 26), (60, 42), (60, 45), (60, 54),
(61, 11), (61, 19), (61, 28), (61, 42), (61, 45), (61, 47),
(62, 7), (62, 13), (62, 18), (62, 42), (62, 45), (62, 48),
(63, 9), (63, 10), (63, 17), (63, 42), (63, 45), (63, 54),
(64, 7), (64, 18), (64, 32), (64, 42), (64, 45), (64, 48),
(65, 7), (65, 13), (65, 18), (65, 42), (65, 45), (65, 48),
(66, 9), (66, 10), (66, 17), (66, 42), (66, 45), (66, 54),
(67, 7), (67, 18), (67, 32), (67, 42), (67, 45), (67, 48),
(68, 7), (68, 13), (68, 18), (68, 42), (68, 45), (68, 48),
(69, 9), (69, 10), (69, 17), (69, 42), (69, 45), (69, 54),
(70, 7), (70, 18), (70, 32), (70, 42), (70, 45), (70, 48),
(71, 5), (71, 6), (71, 28), (71, 42), (71, 44), (71, 53),
(72, 5), (72, 20), (72, 28), (72, 42), (72, 44), (72, 53),
(73, 3), (73, 5), (73, 28), (73, 42), (73, 44), (73, 53),
(74, 9), (74, 10), (74, 17), (74, 42), (74, 45), (74, 54),
(75, 17), (75, 18), (75, 32), (75, 42), (75, 45), (75, 47),
(76, 9), (76, 17), (76, 30), (76, 42), (76, 45), (76, 54),
(77, 5), (77, 6), (77, 28), (77, 42), (77, 44), (77, 53),
(78, 5), (78, 20), (78, 28), (78, 42), (78, 44), (78, 53),
(79, 3), (79, 5), (79, 28), (79, 42), (79, 44), (79, 53),
(80, 9), (80, 10), (80, 17), (80, 42), (80, 45), (80, 54),
(81, 17), (81, 18), (81, 32), (81, 42), (81, 45), (81, 47),
(82, 9), (82, 17), (82, 30), (82, 42), (82, 45), (82, 54),
(83, 5), (83, 6), (83, 28), (83, 42), (83, 44), (83, 53),
(84, 5), (84, 20), (84, 28), (84, 42), (84, 44), (84, 53),
(85, 3), (85, 5), (85, 28), (85, 42), (85, 44), (85, 53),
(86, 9), (86, 10), (86, 17), (86, 42), (86, 45), (86, 54),
(87, 17), (87, 18), (87, 32), (87, 42), (87, 45), (87, 47),
(88, 9), (88, 17), (88, 30), (88, 42), (88, 45), (88, 54),
(89, 5), (89, 6), (89, 28), (89, 42), (89, 44), (89, 53),
(90, 5), (90, 20), (90, 28), (90, 42), (90, 44), (90, 53),
(91, 3), (91, 5), (91, 28), (91, 42), (91, 44), (91, 53),
(92, 9), (92, 10), (92, 17), (92, 42), (92, 45), (92, 54),
(93, 17), (93, 18), (93, 32), (93, 42), (93, 45), (93, 47),
(94, 9), (94, 17), (94, 30), (94, 42), (94, 45), (94, 54),
-- 95 Manager
(95, 1), (95, 8), (95, 13), (95, 42), (95, 43), (95, 45);  -- Java, Spring Boot, SQL, Comunicación, Liderazgo, Resolución de Problemas



-- 15) Asignar Certificados Certificate Users
-- Asignar 8 certificados completados y 1 en progreso para usuarios 4-19, 35-49
DO $$
DECLARE
    user_id integer;
    cert_id integer;
    cert_date date;
    months_ago integer;
    cert_link varchar;
    used_certificates integer[];
BEGIN
    FOR user_id IN 4..19 LOOP
        used_certificates := '{}'; -- Resetear array para cada usuario
        
        -- Asignar 8 certificados completados en los últimos 12 meses
        FOR i IN 1..8 LOOP
            -- Seleccionar un certificado aleatorio que no haya sido usado aún para este usuario
            LOOP
                cert_id := floor(random() * 60 + 1)::integer;
                EXIT WHEN NOT (cert_id = ANY(used_certificates));
            END LOOP;
            
            used_certificates := array_append(used_certificates, cert_id);
            
            -- Fecha aleatoria en los últimos 12 meses (junio 2024 - mayo 2025)
            months_ago := floor(random() * 12)::integer;
            cert_date := (date '2025-05-01' - (months_ago || ' months')::interval)::date;
            
            -- Generar un enlace ficticio
            cert_link := 'https://certificates.example.com/' || user_id || '/' || cert_id || '/' || 
                         to_char(cert_date, 'YYYYMMDD');
            
            -- Insertar certificado completado
            INSERT INTO "Certificate_Users" (
                "certificate_id", 
                "user_id", 
                "certificate_start_date",
                "certificate_date", 
                "certificate_expiration_date",
                "certificate_link", 
                "status"
            ) VALUES (
                cert_id,
                user_id,
                cert_date - interval '1 month', -- Fecha de inicio un mes antes
                cert_date,
                cert_date + interval '2 years', -- Expiración en 2 años
                cert_link,
                'completed'
            );
        END LOOP;
        
        -- Asignar 1 certificado en progreso (diferente a los completados)
        LOOP
            cert_id := floor(random() * 60 + 1)::integer;
            EXIT WHEN NOT (cert_id = ANY(used_certificates));
        END LOOP;
        
        cert_link := 'https://certificates.example.com/' || user_id || '/' || cert_id || '/in-progress';
        cert_date := (current_date - (floor(random() * 2 + 1)::int || ' months')::interval)::date;

        INSERT INTO "Certificate_Users" (
            "certificate_id", 
            "user_id", 
            "certificate_start_date",
            "certificate_date", 
            "certificate_expiration_date",
            "certificate_link", 
            "status"
        ) VALUES (
            cert_id,
            user_id, 
            cert_date, -- fecha actual menos 1-2 meses
            NULL, -- Fecha nula porque está en progreso
            NULL, -- Fecha de expiración nula
            cert_link,
            'in progress'
        );
    END LOOP;
    FOR user_id IN 35..49 LOOP
        used_certificates := '{}'; -- Resetear array para cada usuario
        
        -- Asignar 8 certificados completados en los últimos 12 meses
        FOR i IN 1..8 LOOP
            -- Seleccionar un certificado aleatorio que no haya sido usado aún para este usuario
            LOOP
                cert_id := floor(random() * 60 + 1)::integer;
                EXIT WHEN NOT (cert_id = ANY(used_certificates));
            END LOOP;
            
            used_certificates := array_append(used_certificates, cert_id);
            
            -- Fecha aleatoria en los últimos 12 meses (junio 2024 - mayo 2025)
            months_ago := floor(random() * 12)::integer;
            cert_date := (date '2025-05-01' - (months_ago || ' months')::interval)::date;
            
            -- Generar un enlace ficticio
            cert_link := 'https://certificates.example.com/' || user_id || '/' || cert_id || '/' || 
                         to_char(cert_date, 'YYYYMMDD');
            
            -- Insertar certificado completado
            INSERT INTO "Certificate_Users" (
                "certificate_id", 
                "user_id", 
                "certificate_start_date",
                "certificate_date", 
                "certificate_expiration_date",
                "certificate_link", 
                "status"
            ) VALUES (
                cert_id,
                user_id,
                cert_date - interval '1 month', -- Fecha de inicio un mes antes
                cert_date,
                cert_date + interval '2 years', -- Expiración en 2 años
                cert_link,
                'completed'
            );
        END LOOP;
        
        -- Asignar 1 certificado en progreso (diferente a los completados)
        LOOP
            cert_id := floor(random() * 60 + 1)::integer;
            EXIT WHEN NOT (cert_id = ANY(used_certificates));
        END LOOP;
        
        cert_link := 'https://certificates.example.com/' || user_id || '/' || cert_id || '/in-progress';
        cert_date := (current_date - (floor(random() * 2 + 1)::int || ' months')::interval)::date;

        INSERT INTO "Certificate_Users" (
            "certificate_id", 
            "user_id", 
            "certificate_start_date",
            "certificate_date", 
            "certificate_expiration_date",
            "certificate_link", 
            "status"
        ) VALUES (
            cert_id,
            user_id, 
            cert_date, -- fecha actual menos 1-2 meses
            NULL, -- Fecha nula porque está en progreso
            NULL, -- Fecha de expiración nula
            cert_link,
            'in progress'
        );
    END LOOP;
END $$;

-- Asignar 1 certificado completado y 1 en progreso para usuarios 20-34, 50-95
DO $$
DECLARE
    user_id integer;
    cert_id integer;
    cert_date date;
    months_ago integer;
    cert_link varchar;
    in_progress_cert_id integer;
BEGIN
    FOR user_id IN 20..34 LOOP
        -- Asignar 1 certificado completado en los últimos 12 meses
        cert_id := floor(random() * 60 + 1)::integer;
        months_ago := floor(random() * 12)::integer;
        cert_date := (date '2025-05-01' - (months_ago || ' months')::interval)::date;
        cert_link := 'https://certificates.example.com/' || user_id || '/' || cert_id || '/' || 
                     to_char(cert_date, 'YYYYMMDD');
        
        INSERT INTO "Certificate_Users" (
            "certificate_id", 
            "user_id", 
            "certificate_start_date",
            "certificate_date", 
            "certificate_expiration_date",
            "certificate_link", 
            "status"
        ) VALUES (
            cert_id,
            user_id,
            cert_date - interval '1 month', -- Fecha de inicio un mes antes
            cert_date,
            cert_date + interval '2 years',
            cert_link,
            'completed'
        );
        
        -- Asignar 1 certificado en progreso (diferente al completado)
        LOOP
            in_progress_cert_id := floor(random() * 60 + 1)::integer;
            EXIT WHEN in_progress_cert_id <> cert_id;
        END LOOP;
        
        cert_link := 'https://certificates.example.com/' || user_id || '/' || in_progress_cert_id || '/in-progress';
        cert_date := (current_date - (floor(random() * 2 + 1)::int || ' months')::interval)::date;

        INSERT INTO "Certificate_Users" (
            "certificate_id", 
            "user_id", 
            "certificate_date", 
            "certificate_start_date",
            "certificate_expiration_date",
            "certificate_link", 
            "status"
        ) VALUES (
            in_progress_cert_id,
            user_id,
            cert_date, -- fecha actual menos 1-2 mesesq
            NULL,
            NULL,
            cert_link,
            'in progress'
        );
    END LOOP;
    FOR user_id IN 50..95 LOOP
        -- Asignar 1 certificado completado en los últimos 12 meses
        cert_id := floor(random() * 60 + 1)::integer;
        months_ago := floor(random() * 12)::integer;
        cert_date := (date '2025-05-01' - (months_ago || ' months')::interval)::date;
        cert_link := 'https://certificates.example.com/' || user_id || '/' || cert_id || '/' || 
                     to_char(cert_date, 'YYYYMMDD');
        
        INSERT INTO "Certificate_Users" (
            "certificate_id", 
            "user_id", 
            "certificate_start_date",
            "certificate_date", 
            "certificate_expiration_date",
            "certificate_link", 
            "status"
        ) VALUES (
            cert_id,
            user_id,
            cert_date - interval '1 month', -- Fecha de inicio un mes antes
            cert_date,
            cert_date + interval '2 years',
            cert_link,
            'completed'
        );
        
        -- Asignar 1 certificado en progreso (diferente al completado)
        LOOP
            in_progress_cert_id := floor(random() * 60 + 1)::integer;
            EXIT WHEN in_progress_cert_id <> cert_id;
        END LOOP;
        
        cert_link := 'https://certificates.example.com/' || user_id || '/' || in_progress_cert_id || '/in-progress';
        cert_date := (current_date - (floor(random() * 2 + 1)::int || ' months')::interval)::date;

        INSERT INTO "Certificate_Users" (
            "certificate_id", 
            "user_id", 
            "certificate_start_date",
            "certificate_date", 
            "certificate_expiration_date",
            "certificate_link", 
            "status"
        ) VALUES (
            in_progress_cert_id,
            user_id,
            cert_date, -- fecha actual menos 1-2 meses
            NULL,
            NULL,
            cert_link,
            'in progress'
        );
    END LOOP;
END $$;



-- 16) Goal Users
-- Asignar 1 meta completada y 1 en progreso para usuarios 4-95
DO $$
DECLARE
    user_id integer;
    goal_id integer;
    in_progress_goal_id integer;
    create_date date;
    finished_date date;
    priority_options varchar[] := ARRAY['low', 'medium', 'high'];
    selected_priority varchar;
BEGIN
    FOR user_id IN 4..95 LOOP
        -- Seleccionar una meta aleatoria para completar (1-22)
        goal_id := floor(random() * 22 + 1)::integer;
        
        -- Fecha de creación: hasta 12 meses atrás
        create_date := (date '2025-05-01' - (floor(random() * 12)::integer || ' months')::interval)::date;
        
        -- Fecha de finalización: entre creación y hoy
        finished_date := create_date + (floor(random() * (date '2025-05-01' - create_date))::integer || ' days')::interval;
        
        -- Prioridad aleatoria
        selected_priority := priority_options[floor(random() * 3 + 1)::integer];
        
        -- Insertar meta completada
        INSERT INTO "Goal_Users" (
            "goal_id", 
            "user_id", 
            "create_date", 
            "finished_date", 
            "priority", 
            "completed"
        ) VALUES (
            goal_id,
            user_id,
            create_date,
            finished_date,
            selected_priority,
            true
        );
        
        -- Seleccionar una meta diferente para "en progreso"
        LOOP
            in_progress_goal_id := floor(random() * 22 + 1)::integer;
            EXIT WHEN in_progress_goal_id <> goal_id;
        END LOOP;
        
        -- Fecha de creación: hasta 3 meses atrás (más reciente que la completada)
        create_date := (date '2025-05-01' - (floor(random() * 3)::integer || ' months')::interval)::date;
        
        -- Prioridad aleatoria
        selected_priority := priority_options[floor(random() * 3 + 1)::integer];
        
        -- Insertar meta en progreso (sin fecha de finalización)
        INSERT INTO "Goal_Users" (
            "goal_id", 
            "user_id", 
            "create_date", 
            "finished_date", 
            "priority", 
            "completed"
        ) VALUES (
            in_progress_goal_id,
            user_id,
            create_date,
            NULL, -- Sin fecha de finalización
            selected_priority,
            false
        );
    END LOOP;
END $$;



-- 17) proyectos
INSERT INTO "Projects" (
    "delivery_lead_user_id",
    "project_name",
    "company_name",
    "project_desc",
    "start_date",
    "end_date",
    "country_id"
) VALUES
-- Proyectos completados (terminaron en los últimos 3 meses)
(4, 'Migración a la Nube', 'Banco Nacional', 'Migración de infraestructura on-premise a AWS', '2024-06-01', '2025-03-15', 1), -- ID 1
(5, 'Sistema de Gestión de Inventarios', 'Distribuidora Latina', 'Desarrollo de sistema de control de inventario con IoT', '2024-05-15', '2025-02-28', 2), -- ID 2
(6, 'Plataforma de E-learning', 'EducaTech', 'Plataforma de cursos online con inteligencia artificial', '2024-04-10', '2025-04-28', 3), -- ID 3
(7, 'App de Delivery', 'Rápido Express', 'Aplicación móvil para servicio de delivery con seguimiento en tiempo real', '2024-03-20', '2025-04-15', 4), -- ID 4
(8, 'Modernización de ERP', 'Manufacturas Unidas', 'Actualización del sistema ERP a versión cloud', '2024-02-15', '2025-03-30', 5), -- ID 5
(4, 'Portal de Clientes', 'Seguros Continental', 'Portal web para autogestión de clientes con firma digital', '2024-01-10', '2025-04-20', 6), -- ID 6
(5, 'Chatbot Empresarial', 'Servicios Financieros', 'Asistente virtual para servicio al cliente con NLP', '2023-12-05', '2025-03-18', 7), -- ID 7
(6, 'Análisis de Datos Médicos', 'Hospital Central', 'Plataforma de análisis predictivo para historiales médicos', '2023-11-15', '2025-03-25', 8), -- ID 8
(7, 'Sistema de Pago Digital', 'PagoFácil', 'Infraestructura para pagos digitales con blockchain', '2023-10-20', '2025-04-30', 9), -- ID 9
(8, 'Optimización de Red Logística', 'Global Logistics', 'Reestructuración de red de distribución con algoritmos de optimización', '2024-03-01', '2025-03-10', 1), -- ID 10
(4, 'Sistema de Reservas Hotelera', 'Hotel Chain International', 'Plataforma unificada de reservas con integración a canales de venta', '2024-02-15', '2025-02-22', 1), -- ID 11
(5, 'Automatización de Procesos Bancarios', 'Banco Comercial', 'Implementación de RPA para procesos back-office', '2024-01-20', '2025-03-30', 3), -- ID 12
(6, 'Plataforma de Crowdfunding', 'Invierte Local', 'Sistema de financiamiento colectivo para emprendedores', '2023-12-10', '2025-04-15', 4), -- ID 13

-- Proyectos activos (en curso)
(4, 'Inteligencia Artificial para Retail', 'Supermercados Unidos', 'Sistema de recomendación personalizada para clientes', '2025-05-01', '2025-12-15', 1), -- ID 14
(5, 'Plataforma de Streaming', 'EntertainTV', 'Servicio de streaming con contenido regional', '2025-05-15', '2026-01-30', 2), -- ID 15
(6, 'Blockchain para Cadena de Suministro', 'AgroExport', 'Sistema de trazabilidad para productos agrícolas', '2025-05-10', '2025-8-28', 3), -- ID 16
(8, 'Reconocimiento Facial para Seguridad', 'Ciudad Segura', 'Sistema de identificación biométrica para espacios públicos', '2025-05-15', '2025-9-30', 5), -- ID 17
(7, 'Sistema de Gestión Energética', 'Energía Verde S.A.', 'Plataforma para monitoreo y optimización de consumo energético en edificios', '2025-05-01', '2025-11-30', 1), -- ID 18
(8, 'Realidad Virtual para Entrenamiento', 'Industrias Pesadas Co.', 'Simuladores VR para capacitación de operarios de maquinaria pesada', '2025-05-15', '2026-02-28', 2), -- ID 19

-- Proyectos no iniciados (planificados)
(4, 'Sistema de Gestión de Flotas', 'Transportes Rápidos', 'Plataforma para optimización de rutas de transporte', '2025-07-01', '2025-12-01', 1), -- ID 20
(5, 'App de Turismo Local', 'DescubreMiCiudad', 'Guía turística con realidad aumentada', '2025-06-20', '2025-10-01', 2), -- ID 21
(6, 'Plataforma de Telemedicina', 'SaludConectada', 'Sistema de consultas médicas remotas con IA', '2025-07-15', '2025-11-01', 3), -- ID 22
(7, 'Gestión Inteligente de Residuos', 'EcoCiudad', 'Sistema de recolección de basura con sensores IoT', '2025-08-01', '2025-12-31', 4); -- ID 23



-- 18) Project_Positions
-- SCRIPT DE PROYECTOS COMPLETADOS
-- Asignación de puestos para proyectos completados (IDs 1-13)
DO $$
DECLARE
    project_id integer;
    cap_id integer;
    user_id integer;
    used_users integer[] := '{}';
    all_users integer[] := ARRAY(SELECT generate_series(9,94));
    available_users integer[];
    cap1_positions integer;
BEGIN
    -- Asignar puestos para cada proyecto completado
    FOR project_id IN 1..13 LOOP
        -- Resetear usuarios disponibles para este proyecto
        available_users := all_users;

        -- Determinar cuántos puestos de capability 1 asignar (2 para los primeros 6 proyectos, 1 para los demás)
        IF project_id <= 8 THEN
            cap1_positions := 2;
        ELSE
            cap1_positions := 1;
        END IF;

        -- Asignar puestos de Desarrollo de Software (capability 1)
        FOR i IN 1..cap1_positions LOOP
            -- Buscar primero en los rangos específicos (9, 15-19 y 35-49)
            user_id := (SELECT u FROM unnest(available_users) u 
                        WHERE (u = 9 OR u BETWEEN 15 AND 19 OR u BETWEEN 35 AND 49)
                        AND NOT u = ANY(used_users)
                        LIMIT 1);

            -- Si no encuentra en los rangos específicos, buscar en cualquier usuario disponible
            IF user_id IS NULL THEN
                user_id := (SELECT u FROM unnest(available_users) u 
                            WHERE NOT u = ANY(used_users) 
                            LIMIT 1);
            END IF;

            INSERT INTO "Project_Positions" (
                "project_id",
                "position_name",
                "position_desc",
                "capability_id",
                "user_id"
            ) VALUES (
                project_id,
                CASE 
                    WHEN i = 1 THEN 'Desarrollador Backend'
                    ELSE 'Desarrollador Frontend'
                END,
                CASE 
                    WHEN i = 1 THEN 'Desarrollo de APIs y lógica de negocio del sistema'
                    ELSE 'Implementación de interfaces de usuario y experiencia frontend'
                END,
                1,
                user_id
            );

            used_users := array_append(used_users, user_id);
            available_users := array_remove(available_users, user_id);
        END LOOP;

        -- Asignar 1 puesto de cada otra capability (2-6)
        FOR cap_id IN 2..6 LOOP
            CASE cap_id
                WHEN 2 THEN -- Científico de Datos
                    user_id := (SELECT u FROM unnest(available_users) u 
                                WHERE (u = 10 OR u BETWEEN 20 AND 22 OR u BETWEEN 50 AND 58)
                                AND NOT u = ANY(used_users)
                                LIMIT 1);
                WHEN 3 THEN -- Arquitecto Cloud
                    user_id := (SELECT u FROM unnest(available_users) u 
                                WHERE (u = 11 OR u BETWEEN 23 AND 25 OR u BETWEEN 59 AND 67)
                                AND NOT u = ANY(used_users)
                                LIMIT 1);
                WHEN 4 THEN -- Especialista QA
                    user_id := (SELECT u FROM unnest(available_users) u 
                                WHERE (u = 12 OR u BETWEEN 26 AND 28 OR u BETWEEN 68 AND 76)
                                AND NOT u = ANY(used_users)
                                LIMIT 1);
                WHEN 5 THEN -- Diseñador UX/UI
                    user_id := (SELECT u FROM unnest(available_users) u 
                                WHERE (u = 13 OR u BETWEEN 29 AND 31 OR u BETWEEN 77 AND 85)
                                AND NOT u = ANY(used_users)
                                LIMIT 1);
                WHEN 6 THEN -- Ingeniero DevOps
                    user_id := (SELECT u FROM unnest(available_users) u 
                                WHERE (u = 14 OR u BETWEEN 32 AND 34 OR u BETWEEN 86 AND 94)
                                AND NOT u = ANY(used_users)
                                LIMIT 1);
            END CASE;

            -- Si no encuentra en los rangos específicos, buscar en cualquier usuario disponible
            IF user_id IS NULL THEN
                user_id := (SELECT u FROM unnest(available_users) u 
                            WHERE NOT u = ANY(used_users) 
                            LIMIT 1);
            END IF;

            INSERT INTO "Project_Positions" (
                "project_id",
                "position_name",
                "position_desc",
                "capability_id",
                "user_id"
            ) VALUES (
                project_id,
                CASE cap_id
                    WHEN 2 THEN 'Científico de Datos'
                    WHEN 3 THEN 'Arquitecto Cloud'
                    WHEN 4 THEN 'Especialista QA'
                    WHEN 5 THEN 'Diseñador UX/UI'
                    WHEN 6 THEN 'Ingeniero DevOps'
                END,
                CASE cap_id
                    WHEN 2 THEN 'Análisis de datos y modelado predictivo para el proyecto'
                    WHEN 3 THEN 'Diseño de arquitectura en la nube y optimización de recursos'
                    WHEN 4 THEN 'Garantía de calidad y pruebas del software desarrollado'
                    WHEN 5 THEN 'Diseño de interfaces de usuario y experiencia de cliente'
                    WHEN 6 THEN 'Automatización de despliegues y gestión de infraestructura'
                END,
                cap_id,
                user_id
            );

            used_users := array_append(used_users, user_id);
            available_users := array_remove(available_users, user_id);
        END LOOP;
    END LOOP;
END $$;

-- SCRIPT PARA PROYECTOS EN PROGRESO
DO $$
DECLARE
    project_id integer;
    cap_id integer;
    user_id integer;
    used_users integer[] := '{}';
    all_users integer[] := ARRAY(SELECT generate_series(9,94));
    available_users integer[] := all_users;
BEGIN
    FOR project_id IN 14..19 LOOP
        FOR cap_id IN 1..6 LOOP
            -- Seleccionar usuario según capability
            CASE cap_id
                WHEN 1 THEN user_id := (SELECT u FROM unnest(available_users) u WHERE (u = 9 OR u BETWEEN 15 AND 19 OR u BETWEEN 35 AND 49) AND NOT u = ANY(used_users) LIMIT 1);
                WHEN 2 THEN user_id := (SELECT u FROM unnest(available_users) u WHERE (u = 10 OR u BETWEEN 20 AND 22 OR u BETWEEN 50 AND 58) AND NOT u = ANY(used_users) LIMIT 1);
                WHEN 3 THEN user_id := (SELECT u FROM unnest(available_users) u WHERE (u = 11 OR u BETWEEN 23 AND 25 OR u BETWEEN 59 AND 67) AND NOT u = ANY(used_users) LIMIT 1);
                WHEN 4 THEN user_id := (SELECT u FROM unnest(available_users) u WHERE (u = 12 OR u BETWEEN 26 AND 28 OR u BETWEEN 68 AND 76) AND NOT u = ANY(used_users) LIMIT 1);
                WHEN 5 THEN user_id := (SELECT u FROM unnest(available_users) u WHERE (u = 13 OR u BETWEEN 29 AND 31 OR u BETWEEN 77 AND 85) AND NOT u = ANY(used_users) LIMIT 1);
                WHEN 6 THEN user_id := (SELECT u FROM unnest(available_users) u WHERE (u = 14 OR u BETWEEN 32 AND 34 OR u BETWEEN 86 AND 94) AND NOT u = ANY(used_users) LIMIT 1);
            END CASE;

            -- Si no hay en la capability específica, seleccionar cualquiera no usado
            IF user_id IS NULL THEN
                user_id := (
                    SELECT u FROM unnest(available_users) u 
                    WHERE NOT u = ANY(used_users) 
                    LIMIT 1
                );
            END IF;

            -- Insertar puesto
            INSERT INTO "Project_Positions" (
                "project_id",
                "position_name",
                "position_desc",
                "capability_id",
                "user_id"
            ) VALUES (
                project_id,
                CASE cap_id
                    WHEN 1 THEN 'Desarrollador Fullstack'
                    WHEN 2 THEN 'Analista de Datos'
                    WHEN 3 THEN 'Especialista Cloud'
                    WHEN 4 THEN 'Tester QA'
                    WHEN 5 THEN 'Diseñador de Interacción'
                    WHEN 6 THEN 'Especialista en CI/CD'
                END,
                CASE cap_id
                    WHEN 1 THEN 'Desarrollo tanto de frontend como backend del sistema'
                    WHEN 2 THEN 'Procesamiento y análisis de datos del proyecto'
                    WHEN 3 THEN 'Implementación de soluciones en la nube'
                    WHEN 4 THEN 'Ejecución de pruebas manuales y automatizadas'
                    WHEN 5 THEN 'Diseño de flujos de usuario y prototipos'
                    WHEN 6 THEN 'Mantenimiento de pipelines de integración continua'
                END,
                cap_id,
                user_id
            );

            -- Marcar usuario como usado
            used_users := array_append(used_users, user_id);
            available_users := array_remove(available_users, user_id);
        END LOOP;
    END LOOP;
END $$;

-- PROYECTOS FUTUROS
DO $$
DECLARE
    project_id integer;
    cap_id integer;
BEGIN
    FOR project_id IN 20..23 LOOP
        FOR cap_id IN 1..6 LOOP
            INSERT INTO "Project_Positions" (
                "project_id",
                "position_name",
                "position_desc",
                "capability_id",
                "user_id"
            ) VALUES (
                project_id,
                CASE cap_id
                    WHEN 1 THEN 'Desarrollador Backend'
                    WHEN 2 THEN 'Científico de Datos'
                    WHEN 3 THEN 'Arquitecto Cloud'
                    WHEN 4 THEN 'Especialista QA'
                    WHEN 5 THEN 'Diseñador UX/UI'
                    WHEN 6 THEN 'Ingeniero DevOps'
                END,
                CASE cap_id
                    WHEN 1 THEN 'Desarrollo de APIs y lógica de negocio del sistema'
                    WHEN 2 THEN 'Análisis de datos y modelado predictivo para el proyecto'
                    WHEN 3 THEN 'Diseño de arquitectura en la nube y optimización de recursos'
                    WHEN 4 THEN 'Garantía de calidad y pruebas del software desarrollado'
                    WHEN 5 THEN 'Diseño de interfaces de usuario y experiencia de cliente'
                    WHEN 6 THEN 'Automatización de despliegues y gestión de infraestructura'
                END,
                cap_id,
                NULL
            );
        END LOOP;
    END LOOP;
END $$;



-- 19) Project Position Skills
INSERT INTO "Project_Position_Skills" ("position_id", "skill_id") VALUES
-- Capability 1: Desarrollo de Software (IDs 1,2,8,9,15,16,22,23,29,30,36,37,43,44,50,51,57,63,69,75,81,87,93,99,105,111,117)
-- Backend Developers
(1, 1), (1, 8), (1, 13),   -- Java, Spring Boot, SQL
(8, 1), (8, 8), (8, 44),   -- Java, Spring Boot, Trabajo en Equipo
(15, 1), (15, 8), (15, 19), -- Java, Spring Boot, Microservicios
(22, 1), (22, 8), (22, 47), -- Java, Spring Boot, Metodologías Ágiles
(29, 1), (29, 13), (29, 19), -- Java, SQL, Microservicios
(36, 1), (36, 8), (36, 44), -- Java, Spring Boot, Trabajo en Equipo
(43, 1), (43, 19), (43, 47), -- Java, Microservicios, Metodologías Ágiles
(50, 7), (50, 13), (50, 20), -- Node.js, SQL, API REST
(57, 7), (57, 20), (57, 44), -- Node.js, API REST, Trabajo en Equipo
(63, 7), (63, 28), (63, 47), -- Node.js, GraphQL, Metodologías Ágiles
(69, 7), (69, 13), (69, 20), -- Node.js, SQL, API REST
(75, 7), (75, 20), (75, 44), -- Node.js, API REST, Trabajo en Equipo
(81, 7), (81, 28), (81, 47), -- Node.js, GraphQL, Metodologías Ágiles
-- 123, 129, 135, 141
(123, 7), (123, 13), (123, 20), -- Node.js, SQL, API REST
(129, 7), (129, 20), (129, 44), -- Node.js, API REST, Trabajo en Equipo
(135, 7), (135, 28), (135, 47), -- Node.js, GraphQL, Metodologías Ágiles
(141, 1), (141, 8), (141, 13), -- Java, Spring Boot, SQL

-- Frontend Developers
(2, 3), (2, 5), (2, 20),   -- JavaScript, React, API REST
(9, 3), (9, 5), (9, 44),   -- JavaScript, React, Trabajo en Equipo
(16, 3), (16, 5), (16, 28), -- JavaScript, React, GraphQL
(23, 3), (23, 6), (23, 42), -- JavaScript, Angular, Comunicación
(30, 4), (30, 5), (30, 20), -- TypeScript, React, API REST
(37, 4), (37, 5), (37, 44), -- TypeScript, React, Trabajo en Equipo
(44, 4), (44, 6), (44, 28), -- TypeScript, Angular, GraphQL
(51, 3), (51, 6), (51, 42), -- JavaScript, Angular, Comunicación
(87, 4), (87, 5), (87, 20), -- TypeScript, React, API REST
(93, 4), (93, 5), (93, 44), -- TypeScript, React, Trabajo en Equipo
(99, 4), (99, 6), (99, 28), -- TypeScript, Angular, GraphQL
(105, 3), (105, 6), (105, 42), -- JavaScript, Angular, Comunicación
(111, 4), (111, 5), (111, 20), -- TypeScript, React, API REST
(117, 4), (117, 5), (117, 44), -- TypeScript, React, Trabajo en Equipo


-- Capability 2: Ciencia de Datos (IDs 3,10,17,24,31,38,45,52,58,64,70,76,82,88,94,100,106,112,118)
(3, 2), (3, 15), (3, 16),   -- Python, Aprendizaje Automático, Análisis de Datos
(10, 2), (10, 21), (10, 22), -- Python, TensorFlow, PyTorch
(17, 15), (17, 16), (17, 45), -- Aprendizaje Automático, Análisis de Datos, Resolución de Problemas
(24, 2), (24, 15), (24, 21), -- Python, Aprendizaje Automático, TensorFlow
(31, 16), (31, 29), (31, 42), -- Análisis de Datos, Apache Kafka, Comunicación
(38, 2), (38, 15), (38, 22), -- Python, Aprendizaje Automático, PyTorch
(45, 15), (45, 16), (45, 45), -- Aprendizaje Automático, Análisis de Datos, Resolución de Problemas
(52, 2), (52, 21), (52, 22), -- Python, TensorFlow, PyTorch
(58, 2), (58, 15), (58, 16), -- Python, Aprendizaje Automático, Análisis de Datos
(64, 15), (64, 21), (64, 45), -- Aprendizaje Automático, TensorFlow, Resolución de Problemas
(70, 2), (70, 16), (70, 29), -- Python, Análisis de Datos, Apache Kafka
(76, 15), (76, 22), (76, 42), -- Aprendizaje Automático, PyTorch, Comunicación
(82, 2), (82, 15), (82, 21), -- Python, Aprendizaje Automático, TensorFlow
(88, 16), (88, 29), (88, 45), -- Análisis de Datos, Apache Kafka, Resolución de Problemas
(94, 2), (94, 15), (94, 22), -- Python, Aprendizaje Automático, PyTorch
(100, 15), (100, 16), (100, 42), -- Aprendizaje Automático, Análisis de Datos, Comunicación
(106, 2), (106, 21), (106, 45), -- Python, TensorFlow, Resolución de Problemas
(112, 15), (112, 22), (112, 29), -- Aprendizaje Automático, PyTorch, Apache Kafka
(118, 2), (118, 16), (118, 42), -- Python, Análisis de Datos, Comunicación
-- 124, 130, 136, 142
(124, 15), (124, 21), (124, 22), -- Aprendizaje Automático, TensorFlow, PyTorch
(130, 15), (130, 16), (130, 45), -- Aprendizaje Automático, Análisis de Datos, Resolución de Problemas
(136, 2), (136, 21), (136, 29), -- Python, TensorFlow, Apache Kafka
(142, 15), (142, 22), (142, 42), -- Aprendizaje Automático, PyTorch, Comunicación

-- Capability 3: Arquitectura en la Nube (IDs 4,11,18,25,32,39,46,53,59,65,71,77,83,89,95,101,107,113,119)
(4, 11), (4, 17), (4, 19),   -- AWS, DevOps, Microservicios
(11, 12), (11, 17), (11, 26), -- Azure, DevOps, Arquitectura Serverless
(18, 9), (18, 10), (18, 17), -- Docker, Kubernetes, DevOps
(25, 11), (25, 19), (25, 26), -- AWS, Microservicios, Arquitectura Serverless
(32, 12), (32, 17), (32, 47), -- Azure, DevOps, Metodologías Ágiles
(39, 9), (39, 10), (39, 45), -- Docker, Kubernetes, Resolución de Problemas
(46, 11), (46, 17), (46, 19), -- AWS, DevOps, Microservicios
(53, 12), (53, 26), (53, 42), -- Azure, Arquitectura Serverless, Comunicación
(59, 9), (59, 10), (59, 17), -- Docker, Kubernetes, DevOps
(65, 11), (65, 19), (65, 47), -- AWS, Microservicios, Metodologías Ágiles
(71, 12), (71, 17), (71, 26), -- Azure, DevOps, Arquitectura Serverless
(77, 9), (77, 10), (77, 45), -- Docker, Kubernetes, Resolución de Problemas
(83, 11), (83, 17), (83, 19), -- AWS, DevOps, Microservicios
(89, 12), (89, 26), (89, 42), -- Azure, Arquitectura Serverless, Comunicación
(95, 9), (95, 10), (95, 17), -- Docker, Kubernetes, DevOps
(101, 11), (101, 19), (101, 47), -- AWS, Microservicios, Metodologías Ágiles
(107, 12), (107, 17), (107, 26), -- Azure, DevOps, Arquitectura Serverless
(113, 9), (113, 10), (113, 45), -- Docker, Kubernetes, Resolución de Problemas
(119, 11), (119, 17), (119, 19), -- AWS, DevOps, Microservicios
-- 125, 131, 137, 143
(125, 12), (125, 26), (125, 42), -- Azure, Arquitectura Serverless, Comunicación
(131, 9), (131, 10), (131, 17), -- Docker, Kubernetes, DevOps
(137, 11), (137, 19), (137, 47), -- AWS, Microservicios, Metodologías Ágiles
(143, 12), (143, 17), (143, 26), -- Azure, DevOps, Arquitectura Serverless

-- Capability 4: Calidad de Software QA (IDs 5,12,19,26,33,40,47,54,60,66,72,78,84,90,96,102,108,114,120)
(5, 3), (5, 5), (5, 48),   -- JavaScript, React, Scrum
(12, 1), (12, 8), (12, 48), -- Java, Spring Boot, Scrum
(19, 3), (19, 7), (19, 18), -- JavaScript, Node.js, CI/CD
(26, 5), (26, 20), (26, 45), -- React, API REST, Resolución de Problemas
(33, 1), (33, 13), (33, 48), -- Java, SQL, Scrum
(40, 3), (40, 18), (40, 47), -- JavaScript, CI/CD, Metodologías Ágiles
(47, 5), (47, 7), (47, 45), -- React, Node.js, Resolución de Problemas
(54, 1), (54, 8), (54, 48), -- Java, Spring Boot, Scrum
(60, 3), (60, 18), (60, 47), -- JavaScript, CI/CD, Metodologías Ágiles
(66, 5), (66, 20), (66, 45), -- React, API REST, Resolución de Problemas
(72, 1), (72, 13), (72, 48), -- Java, SQL, Scrum
(78, 3), (78, 7), (78, 18), -- JavaScript, Node.js, CI/CD
(84, 5), (84, 20), (84, 45), -- React, API REST, Resolución de Problemas
(90, 1), (90, 8), (90, 48), -- Java, Spring Boot, Scrum
(96, 3), (96, 18), (96, 47), -- JavaScript, CI/CD, Metodologías Ágiles
(102, 5), (102, 7), (102, 45), -- React, Node.js, Resolución de Problemas
(108, 1), (108, 8), (108, 48), -- Java, Spring Boot, Scrum
(114, 3), (114, 18), (114, 47), -- JavaScript, CI/CD, Metodologías Ágiles
(120, 5), (120, 20), (120, 45), -- React, API REST, Resolución de Problemas
-- 126, 132, 138, 144
(126, 1), (126, 13), (126, 48), -- Java, SQL, Scrum
(132, 3), (132, 7), (132, 18), -- JavaScript, Node.js, CI/CD
(138, 5), (138, 20), (138, 45), -- React, API REST, Resolución de Problemas
(144, 1), (144, 8), (144, 48), -- Java, Spring Boot, Scrum

-- Capability 5: Diseño de UI/UX (IDs 6,13,20,27,34,41,48,55,61,67,73,79,85,91,97,103,109,115,121)
(6, 5), (6, 28), (6, 42),   -- React, GraphQL, Comunicación
(13, 3), (13, 5), (13, 53), -- JavaScript, React, Creatividad
(20, 4), (20, 5), (20, 49), -- TypeScript, React, Oratoria
(27, 5), (27, 6), (27, 42), -- React, Angular, Comunicación
(34, 3), (34, 28), (34, 53), -- JavaScript, GraphQL, Creatividad
(41, 5), (41, 20), (41, 49), -- React, API REST, Oratoria
(48, 5), (48, 6), (48, 42), -- React, Angular, Comunicación
(55, 3), (55, 5), (55, 53), -- JavaScript, React, Creatividad
(61, 4), (61, 28), (61, 49), -- TypeScript, GraphQL, Oratoria
(67, 5), (67, 6), (67, 42), -- React, Angular, Comunicación
(73, 3), (73, 5), (73, 53), -- JavaScript, React, Creatividad
(79, 5), (79, 20), (79, 49), -- React, API REST, Oratoria
(85, 5), (85, 6), (85, 42), -- React, Angular, Comunicación
(91, 3), (91, 28), (91, 53), -- JavaScript, GraphQL, Creatividad
(97, 4), (97, 5), (97, 49), -- TypeScript, React, Oratoria
(103, 5), (103, 6), (103, 42), -- React, Angular, Comunicación
(109, 3), (109, 5), (109, 53), -- JavaScript, React, Creatividad
(115, 4), (115, 28), (115, 49), -- TypeScript, GraphQL, Oratoria
(121, 5), (121, 6), (121, 42), -- React, Angular, Comunicación
-- 127, 133, 139, 145
(127, 3), (127, 5), (127, 53), -- JavaScript, React, Creatividad
(133, 4), (133, 5), (133, 49), -- TypeScript, React, Oratoria
(139, 5), (139, 20), (139, 49), -- React, API REST, Oratoria
(145, 5), (145, 6), (145, 42), -- React, Angular, Comunicación

-- Capability 6: Ingeniería de DevOps (IDs 7,14,21,28,35,42,49,56,62,68,74,80,86,92,98,104,110,116,122)
(7, 9), (7, 17), (7, 18),   -- Docker, DevOps, CI/CD
(14, 10), (14, 17), (14, 32), -- Kubernetes, DevOps, Jenkins
(21, 9), (21, 10), (21, 45), -- Docker, Kubernetes, Resolución de Problemas
(28, 17), (28, 18), (28, 33), -- DevOps, CI/CD, Ansible
(35, 9), (35, 17), (35, 47), -- Docker, DevOps, Metodologías Ágiles
(42, 10), (42, 30), (42, 45), -- Kubernetes, Prometheus, Resolución de Problemas
(49, 17), (49, 18), (49, 32), -- DevOps, CI/CD, Jenkins
(56, 9), (56, 10), (56, 47), -- Docker, Kubernetes, Metodologías Ágiles
(62, 17), (62, 33), (62, 45), -- DevOps, Ansible, Resolución de Problemas
(68, 9), (68, 18), (68, 30), -- Docker, CI/CD, Prometheus
(74, 10), (74, 17), (74, 47), -- Kubernetes, DevOps, Metodologías Ágiles
(80, 18), (80, 32), (80, 45), -- CI/CD, Jenkins, Resolución de Problemas
(86, 9), (86, 10), (86, 33), -- Docker, Kubernetes, Ansible
(92, 17), (92, 30), (92, 47), -- DevOps, Prometheus, Metodologías Ágiles
(98, 9), (98, 18), (98, 45), -- Docker, CI/CD, Resolución de Problemas
(104, 10), (104, 17), (104, 32), -- Kubernetes, DevOps, Jenkins
(110, 9), (110, 33), (110, 47), -- Docker, Ansible, Metodologías Ágiles
(116, 10), (116, 30), (116, 45), -- Kubernetes, Prometheus, Resolución de Problemas
(122, 17), (122, 18), (122, 33), -- DevOps, CI/CD, Ansible
-- 128, 134, 140, 146
(128, 9), (128, 10), (128, 45), -- Docker, Kubernetes, Resolución de Problemas
(134, 17), (134, 18), (134, 32), -- DevOps, CI/CD, Jenkins
(140, 9), (140, 10), (140, 33), -- Docker, Kubernetes, Ansible
(146, 17), (146, 30), (146, 45); -- DevOps, Prometheus, Resolución de Problemas



-- 20) Project Position Certificates
INSERT INTO "Project_Position_Certificates" ("position_id", "certificate_id") VALUES
-- Capability 1: Desarrollo de Software
(1, 1), (1, 45),    -- Java SE 11 Developer, Secure Java Coding
(2, 53), (2, 60),    -- React Development, GraphQL Development
(8, 1), (8, 54),     -- Java SE 11 Developer, Backend with Node.js
(9, 39), (9, 53),    -- React Native, React Development
(15, 4), (15, 19),   -- Java EE Enterprise Architect, Python for Everybody
(16, 53), (16, 60),  -- React Development, GraphQL Development
(22, 45), (22, 54),  -- Secure Java Coding, Backend with Node.js
(23, 39), (23, 60),  -- React Native, GraphQL Development
(29, 1), (29, 57),   -- Java SE 11 Developer, Python Development
(30, 53), (30, 54),  -- React Development, Backend with Node.js
(36, 19), (36, 57),  -- Python for Everybody, Python Development
(37, 49), (37, 60),  -- Full Stack Development, GraphQL Development
(43, 45), (43, 54),  -- Secure Java Coding, Backend with Node.js
(44, 1), (44, 53),   -- Java SE 11 Developer, React Development
(50, 49), (50, 60),  -- Full Stack Development, GraphQL Development
(51, 41), (51, 42),  -- iOS with Swift, Android with Kotlin
(57, 27), (57, 57),  -- Blockchain Developer, Python Development
(63, 39), (63, 53),  -- React Native, React Development
(69, 1), (69, 4),    -- Java SE 11 Developer, Java EE Enterprise Architect
(75, 49), (75, 54),  -- Full Stack Development, Backend with Node.js
(81, 45), (81, 57),  -- Secure Java Coding, Python Development
(87, 1), (87, 53),   -- Java SE 11 Developer, React Development
(93, 49), (93, 60),  -- Full Stack Development, GraphQL Development
(99, 41), (99, 42),  -- iOS with Swift, Android with Kotlin
(105, 27), (105, 57), -- Blockchain Developer, Python Development
(111, 39), (111, 53), -- React Native, React Development
(117, 1), (117, 4),  -- Java SE 11 Developer, Java EE Enterprise Architect
-- 123, 129, 135, 141
(123, 45), (123, 54), -- Secure Java Coding, Backend with Node.js
(129, 49), (129, 60), -- Full Stack Development, GraphQL Development
(135, 41), (135, 42), -- iOS with Swift, Android with Kotlin
(141, 27), (141, 57), -- Blockchain Developer, Python Development
-- Capability 2: Ciencia de Datos
(3, 17), (3, 20),    -- Data Science Professional, Deep Learning Specialization
(10, 16), (10, 20),  -- Google ML Engineer, Deep Learning Specialization
(17, 11), (17, 58),  -- Power BI Data Analyst, Data Visualization with Tableau
(24, 8), (24, 25),   -- AWS Machine Learning, TensorFlow Developer
(31, 17), (31, 52),  -- Data Science Professional, Ethical AI Design
(38, 16), (38, 58),  -- Google ML Engineer, Data Visualization with Tableau
(45, 18), (45, 25),  -- Machine Learning Specialization, TensorFlow Developer
(52, 13), (52, 58),  -- Google Data Engineer, Data Visualization with Tableau
(58, 17), (58, 20),  -- Data Science Professional, Deep Learning Specialization
(64, 25), (64, 52),  -- TensorFlow Developer, Ethical AI Design
(70, 11), (70, 20),  -- Power BI Data Analyst, Deep Learning Specialization
(76, 16), (76, 52),  -- Google ML Engineer, Ethical AI Design
(82, 17), (82, 25),  -- Data Science Professional, TensorFlow Developer
(88, 13), (88, 17),  -- Google Data Engineer, Data Science Professional
(94, 25), (94, 58),  -- TensorFlow Developer, Data Visualization with Tableau
(100, 18), (100, 52), -- Machine Learning Specialization, Ethical AI Design
(106, 11), (106, 16), -- Power BI Data Analyst, Google ML Engineer
(112, 17), (112, 25), -- Data Science Professional, TensorFlow Developer
(118, 13), (118, 58), -- Google Data Engineer, Data Visualization with Tableau
-- 124, 130, 136, 142
(124, 18), (124, 52), -- Machine Learning Specialization, Ethical AI Design
(130, 11), (130, 20), -- Power BI Data Analyst, Deep Learning Specialization
(136, 17), (136, 25), -- Data Science Professional, TensorFlow Developer
(142, 13), (142, 58), -- Google Data Engineer, Data Visualization with Tableau
-- Capability 3: Arquitectura en la Nube
(4, 5), (4, 56),     -- AWS Solutions Architect, Cloud Security
(11, 10), (11, 56),  -- Azure Solutions Architect, Cloud Security
(18, 14), (18, 32),  -- Google Associate Cloud Engineer, Serverless Architecture
(25, 5), (25, 32),   -- AWS Solutions Architect, Serverless Architecture
(32, 10), (32, 59),  -- Azure Solutions Architect, Distributed Systems
(39, 14), (39, 59),  -- Google Associate Cloud Engineer, Distributed Systems
(46, 5), (46, 56),   -- AWS Solutions Architect, Cloud Security
(53, 15), (53, 32),  -- Google Cloud Architect, Serverless Architecture
(59, 32), (59, 59),  -- Serverless Architecture, Distributed Systems
(65, 15), (65, 56),  -- Google Cloud Architect, Cloud Security
(71, 10), (71, 32),  -- Azure Solutions Architect, Serverless Architecture
(77, 14), (77, 59),  -- Google Associate Cloud Engineer, Distributed Systems
(83, 5), (83, 56),   -- AWS Solutions Architect, Cloud Security
(89, 15), (89, 32),  -- Google Cloud Architect, Serverless Architecture
(95, 32), (95, 56),  -- Serverless Architecture, Cloud Security
(101, 5), (101, 59), -- AWS Solutions Architect, Distributed Systems
(107, 10), (107, 32), -- Azure Solutions Architect, Serverless Architecture
(113, 14), (113, 59), -- Google Associate Cloud Engineer, Distributed Systems
(119, 5), (119, 15), -- AWS Solutions Architect, Google Cloud Architect
-- 125, 131, 137, 143
(125, 10), (125, 56), -- Azure Solutions Architect, Cloud Security
(131, 14), (131, 59), -- Google Associate Cloud Engineer, Distributed Systems
(137, 5), (137, 15), -- AWS Solutions Architect, Google Cloud Architect
(143, 10), (143, 32), -- Azure Solutions Architect, Serverless Architecture
-- Capability 4: Calidad de Software QA
(5, 37), (5, 51),    -- ISTQB Foundation Level, Cybersecurity Analyst
(12, 26), (12, 37),  -- Certified Ethical Hacker, ISTQB Foundation Level
(19, 38), (19, 51),  -- Mobile Testing with Appium, Cybersecurity Analyst
(26, 37), (26, 46),  -- ISTQB Foundation Level, Data Privacy Professional
(33, 37), (33, 51),  -- ISTQB Foundation Level, Cybersecurity Analyst
(40, 45), (40, 51),  -- Secure Java Coding, Cybersecurity Analyst
(47, 26), (47, 37),  -- Certified Ethical Hacker, ISTQB Foundation Level
(54, 37), (54, 51),  -- ISTQB Foundation Level, Cybersecurity Analyst
(60, 45), (60, 51),  -- Secure Java Coding, Cybersecurity Analyst
(66, 26), (66, 37),  -- Certified Ethical Hacker, ISTQB Foundation Level
(70, 37), (70, 51),  -- ISTQB Foundation Level, Cybersecurity Analyst
(76, 45), (76, 51),  -- Secure Java Coding, Cybersecurity Analyst
(82, 26), (82, 37),  -- Certified Ethical Hacker, ISTQB Foundation Level
(88, 37), (88, 51),  -- ISTQB Foundation Level, Cybersecurity Analyst
(94, 45), (94, 51),  -- Secure Java Coding, Cybersecurity Analyst
(100, 26), (100, 37), -- Certified Ethical Hacker, ISTQB Foundation Level
(106, 37), (106, 51), -- ISTQB Foundation Level, Cybersecurity Analyst
(114, 45), (114, 51), -- Secure Java Coding, Cybersecurity Analyst
(120, 26), (120, 37), -- Certified Ethical Hacker, ISTQB Foundation Level
-- 126, 132, 138, 144
(126, 37), (126, 51), -- ISTQB Foundation Level, Cybersecurity Analyst
(132, 45), (132, 51), -- Secure Java Coding, Cybersecurity Analyst
(138, 26), (138, 37), -- Certified Ethical Hacker, ISTQB Foundation Level
(144, 37), (144, 51), -- ISTQB Foundation Level, Cybersecurity Analyst
-- Capability 5: Diseño de UI/UX
(6, 35), (6, 53),    -- UX Design Certification, React Development
(13, 36), (13, 58),  -- UI Design with Figma, Data Visualization with Tableau
(20, 39), (20, 53),  -- React Native Development, React Development
(27, 35), (27, 52),  -- UX Design Certification, Ethical AI Design
(34, 36), (34, 39),  -- UI Design with Figma, React Native Development
(41, 35), (41, 36),  -- UX Design Certification, UI Design with Figma
(48, 36), (48, 53),  -- UI Design with Figma, React Development
(55, 35), (55, 52),  -- UX Design Certification, Ethical AI Design
(61, 36), (61, 53),  -- UI Design with Figma, React Development
(67, 35), (67, 58),  -- UX Design Certification, Data Visualization with Tableau
(73, 36), (73, 39),  -- UI Design with Figma, React Native Development
(79, 35), (79, 36),  -- UX Design Certification, UI Design with Figma
(85, 36), (85, 53),  -- UI Design with Figma, React Development
(91, 35), (91, 52),  -- UX Design Certification, Ethical AI Design
(97, 36), (97, 53),  -- UI Design with Figma, React Development
(103, 35), (103, 58), -- UX Design Certification, Data Visualization with Tableau
(109, 36), (109, 39), -- UI Design with Figma, React Native Development
(115, 35), (115, 36), -- UX Design Certification, UI Design with Figma
(121, 36), (121, 53), -- UI Design with Figma, React Development
-- 127, 133, 139, 145
(127, 35), (127, 52), -- UX Design Certification, Ethical AI Design
(133, 36), (133, 58), -- UI Design with Figma, Data Visualization with Tableau
(139, 35), (139, 53), -- UX Design Certification, React Development
(145, 36), (145, 39), -- UI Design with Figma, React Native Development
-- Capability 6: Ingeniería de DevOps
(7, 7), (7, 28),     -- AWS SysOps Administrator, Terraform Associate
(14, 12), (14, 55),  -- Microsoft DevOps Engineer, DevOps in Azure
(21, 28), (21, 44),  -- Terraform Associate, Infrastructure Monitoring with Prometheus & Grafana
(28, 7), (28, 55),   -- AWS SysOps Administrator, DevOps in Azure
(35, 12), (35, 55),  -- Microsoft DevOps Engineer, DevOps in Azure
(42, 28), (42, 55),  -- Terraform Associate, DevOps in Azure
(49, 23), (49, 44),  -- Cisco DevNet Associate, Infrastructure Monitoring with Prometheus & Grafana
(56, 7), (56, 55),   -- AWS SysOps Administrator, DevOps in Azure
(62, 12), (62, 55),  -- Microsoft DevOps Engineer, DevOps in Azure
(68, 28), (68, 55),  -- Terraform Associate, DevOps in Azure
(74, 7), (74, 55),   -- AWS SysOps Administrator, DevOps in Azure
(80, 12), (80, 55),  -- Microsoft DevOps Engineer, DevOps in Azure
(86, 28), (86, 55),  -- Terraform Associate, DevOps in Azure
(92, 23), (92, 44),  -- Cisco DevNet Associate, Infrastructure Monitoring with Prometheus & Grafana
(98, 7), (98, 55),   -- AWS SysOps Administrator, DevOps in Azure
(104, 12), (104, 55), -- Microsoft DevOps Engineer, DevOps in Azure
(110, 28), (110, 55), -- Terraform Associate, DevOps in Azure
(116, 7), (116, 55), -- AWS SysOps Administrator, DevOps in Azure
(122, 12), (122, 28), -- Microsoft DevOps Engineer, Terraform Associate
-- 128, 134, 140, 146
(128, 23), (128, 44), -- Cisco DevNet Associate, Infrastructure Monitoring with Prometheus & Grafana
(134, 7), (134, 55), -- AWS SysOps Administrator, DevOps in Azure
(140, 12), (140, 55), -- Microsoft DevOps Engineer, DevOps in Azure
(146, 28), (146, 55); -- Terraform Associate, DevOps in Azure



-- -- 21) Postulations NULL



-- -- 22) Meeting NULL



-- 23) Feedback
INSERT INTO "Feedback" ("position_id", "desc", "score") VALUES
(1, 'Desarrolló lógica de negocio robusta y mantuvo una excelente estructura en los endpoints.', 5),
(2, 'Buena implementación de componentes reutilizables y uso adecuado de librerías frontend.', 4),
(3, 'Demostró habilidades analíticas sólidas al construir modelos predictivos efectivos.', 5),
(4, 'Propuso una arquitectura en la nube escalable y optimizada para costos.', 4),
(5, 'Realizó pruebas exhaustivas que mejoraron significativamente la calidad del producto.', 5),
(6, 'Diseños intuitivos que mejoraron notablemente la experiencia del usuario final.', 4),
(7, 'Automatizó con éxito pipelines de CI/CD y monitoreo de infraestructura.', 5),
(8, 'Buen manejo de controladores y servicios backend, aunque con áreas de mejora en validación.', 4),
(9, 'Interfaces visualmente atractivas, pero faltó accesibilidad en algunos elementos.', 3),
(10, 'Identificó patrones ocultos en los datos que aportaron valor estratégico.', 5),
(11, 'Arquitectura propuesta con buen uso de contenedores y balanceadores.', 4),
(12, 'Detección oportuna de bugs críticos en pruebas de regresión.', 5),
(13, 'Propuso wireframes innovadores y coherentes con la identidad del producto.', 4),
(14, 'Estableció integraciones con herramientas de monitoreo como Prometheus y Grafana.', 5),
(15, 'API REST bien documentada y con manejo adecuado de errores.', 5),
(16, 'Implementación rápida de interfaces adaptables a móviles.', 4),
(17, 'Validó hipótesis con técnicas estadísticas avanzadas y limpieza efectiva de datos.', 5),
(18, 'Diseño orientado a microservicios con enfoque en alta disponibilidad.', 4),
(19, 'Cobertura de pruebas superior al 90%, con scripts bien estructurados.', 5),
(20, 'Flujos de usuario claros y consistentes en todas las pantallas.', 4),
(21, 'Configuración de pipelines en Jenkins eficiente y estable.', 5),
(22, 'Contribuyó con endpoints seguros y eficientes.', 4),
(23, 'Buen uso de hooks y estados en React, aunque se repitieron estilos.', 3),
(24, 'Predicciones acertadas que ayudaron a tomar decisiones de negocio.', 5),
(25, 'Uso adecuado de servicios como AWS Lambda y S3.', 4),
(26, 'Identificó escenarios de prueba no contemplados por el equipo.', 5),
(27, 'Propuso mejoras en el diseño con base en pruebas de usuario.', 4),
(28, 'Automatizó tareas de mantenimiento de infraestructura con Terraform.', 5),
(29, 'Refactorizó código para mejorar mantenibilidad y rendimiento.', 5),
(30, 'Buen manejo de enrutamiento y diseño responsive.', 4),
(31, 'Documentación detallada y reproducible de los modelos generados.', 5),
(32, 'Diseño eficiente de red con balanceo de carga distribuido.', 4),
(33, 'Creó planes de prueba completos y bien ejecutados.', 5),
(34, 'Siguió buenas prácticas de diseño centrado en el usuario.', 4),
(35, 'Uso efectivo de herramientas como Docker y Ansible.', 5),
(36, 'Refactorizó módulos complejos, reduciendo duplicación y mejorando mantenibilidad.', 5),
(37, 'Utilizó Tailwind CSS y buenas prácticas de diseño, aunque algunos componentes se repiten.', 4),
(38, 'Desarrolló dashboards interactivos con datos en tiempo real.', 5),
(39, 'El código cumplió con estándares de seguridad pero requiere más pruebas unitarias.', 3),
(40, 'Analizó datasets masivos con herramientas como Pandas y Spark.', 5),
(41, 'Implementó una arquitectura de microservicios bien documentada.', 4),
(42, 'Creó tests automatizados con buena cobertura, pero falta integración en CI.', 4),
(43, 'Diseñó UI accesible siguiendo lineamientos WCAG.', 5),
(44, 'Configuró infraestructura en GCP con Terraform de forma eficiente.', 5),
(45, 'Endpoints bien estructurados y respuesta rápida bajo carga.', 5),
(46, 'Buen uso de componentes funcionales y gestión de estado.', 4),
(47, 'Extracción de datos efectiva con ETL programado y validación de calidad.', 5),
(48, 'Alta disponibilidad lograda con balanceadores y failover automático.', 5),
(49, 'Validaciones sólidas en pruebas manuales, aunque faltó automatización.', 3),
(50, 'Diseños centrados en usabilidad con prototipos funcionales.', 4),
(51, 'Integración continua con pipelines robustos y pruebas en staging.', 5),
(52, 'Organización lógica del backend con separación de responsabilidades clara.', 4),
(53, 'Interfaces limpias, pero con algunos problemas de rendimiento en móviles.', 3),
(54, 'Exploración de datos profunda y visualizaciones efectivas.', 5),
(55, 'Buena segmentación de servicios y escalabilidad garantizada.', 5),
(56, 'Escritura de casos de prueba completos y bien ejecutados.', 5),
(57, 'Creación de prototipos de interfaz con alto grado de fidelidad.', 4),
(58, 'Automatizó procesos clave usando scripts Bash y Python.', 5),
(59, 'Código backend escalable y con principios SOLID bien aplicados.', 5),
(60, 'Componentes reutilizables bien diseñados con estado controlado.', 4),
(61, 'Uso avanzado de clustering y técnicas de aprendizaje no supervisado.', 5),
(62, 'Red con políticas de seguridad claras y segmentación lógica adecuada.', 4),
(63, 'Pruebas automatizadas eficaces, aunque con bajo enfoque en casos negativos.', 4),
(64, 'Diseños innovadores y coherentes con la identidad visual del producto.', 5),
(65, 'Automatización efectiva de infraestructura como código.', 5),
(66, 'Endpoints bien versionados y respetando principios REST.', 4),
(67, 'Diseño de UI responsive, pero con ligeros errores de alineación.', 3),
(68, 'Análisis exploratorio bien presentado con hallazgos relevantes.', 5),
(69, 'Reducción de latencia en microservicios con caching inteligente.', 5),
(70, 'Creación de ambientes de testing reproducibles y completos.', 5),
(71, 'Entregó prototipos bien evaluados con retroalimentación de usuarios.', 4),
(72, 'Automatización de despliegue con zero-downtime efectiva.', 5),
(73, 'Optimización del backend que mejoró tiempos de respuesta.', 5),
(74, 'Componentes modernos y bien estructurados en frontend.', 4),
(75, 'Modelos predictivos precisos y explicables.', 5),
(76, 'Diseño de arquitectura orientada a eventos y desacoplada.', 4),
(77, 'Cobertura completa de pruebas, incluyendo casos extremos.', 5),
(78, 'Interfaz accesible, pero con oportunidades de mejora en usabilidad móvil.', 3),
(79, 'Infraestructura robusta con monitoreo proactivo implementado.', 5),
(80, 'API GraphQL bien estructurada con resolvers eficientes.', 5),
(81, 'Diseño limpio de interfaces, aunque repetitivo en algunas secciones.', 3),
(82, 'Análisis estadístico profundo y visualización de KPIs clave.', 5),
(83, 'Uso eficiente de Kubernetes para escalar servicios automáticamente.', 5),
(84, 'Suite de pruebas con cobertura alta y rápida ejecución.', 5),
(85, 'Prototipos validados con pruebas A/B y feedback de usuarios.', 4),
(86, 'Automatización con scripts reproducibles y bien documentados.', 5);



-- 24) Areas
INSERT INTO "Areas" ("area_name", "area_desc") VALUES
('Desarrollo Backend', 'Desarrollo del lado servidor utilizando distintos ecosistemas'), -- 1
('Desarrollo Frontend', 'Construcción de interfaces de usuario con frameworks modernos'), -- 2
('Cloud y DevOps', 'Infraestructura en la nube y prácticas DevOps'), -- 3
('Ciencia de Datos y Analítica', 'Análisis de datos, aprendizaje automático e inteligencia artificial'), -- 4
('Desarrollo Móvil', 'Desarrollo de aplicaciones móviles nativas y multiplataforma'), -- 5
('Aseguramiento de Calidad', 'Pruebas de software y aseguramiento de calidad'), -- 6
('Diseño UX/UI', 'Diseño de experiencia e interfaz de usuario'), -- 7
('Gestión de Proyectos', 'Gestión ágil de proyectos y liderazgo'), -- 8
('Ciberseguridad', 'Seguridad de la información y prácticas de codificación segura'), -- 9
('Ingeniería de Bases de Datos', 'Diseño, optimización y administración de bases de datos'); -- 10



-- 25) Area Certificates
INSERT INTO "Area_Certificates" ("area_id", "certificate_id") VALUES
-- Desarrollo Backend (1)
(1, 1),  -- Oracle Certified Professional: Java SE 11 Developer
(1, 4),  -- Oracle Certified Master, Java EE Enterprise Architect
(1, 54), -- Certificado en Desarrollo Backend con Node.js
(1, 57), -- Certificación en Desarrollo con Python
-- Desarrollo Frontend (2)
(2, 49), -- Nanodegree en Desarrollo Web Full Stack
(2, 52), -- Certificado Profesional en Desarrollo con React
(2, 36), -- Certificado de Diseño UI con Figma
(2, 60), -- Certificación en Desarrollo con GraphQL
-- Cloud y DevOps (3)
(3, 5),  -- AWS Certified Solutions Architect - Associate
(3, 12), -- Microsoft Certified: DevOps Engineer Expert
(3, 28), -- HashiCorp Certified Terraform Associate
(3, 43), -- Pipelines CI/CD con Jenkins
-- Ciencia de Datos y Analítica (4)
(4, 11), -- Microsoft Certified: Power BI Data Analyst Associate
(4, 17), -- Coursera Data Science Professional Certificate
(4, 18), -- Coursera Machine Learning Specialization
(4, 58), -- Visualización de Datos con Tableau
-- Desarrollo Móvil (5)
(5, 39), -- Certificado de Desarrollador React Native
(5, 40), -- Certificación en Desarrollo con Flutter
(5, 41), -- Desarrollo de Apps iOS con Swift
(5, 42), -- Certificación de Desarrollador Android con Kotlin
-- Aseguramiento de Calidad (6)
(6, 37), -- ISTQB Certified Tester – Foundation Level
(6, 38), -- Certificación en Pruebas Móviles con Appium
(6, 44), -- Monitoreo de Infraestructura con Prometheus & Grafana
(6, 45), -- Codificación Segura en Java
-- Diseño UX/UI (7)
(7, 35), -- Certificación en Diseño UX
(7, 36), -- Certificado de Diseño UI con Figma
(7, 52), -- Certificado en Diseño Ético de IA
(7, 58), -- Visualización de Datos con Tableau
-- Gestión de Proyectos (8)
(8, 32), -- Certificación Scrum Master
(8, 33), -- Certificación Scrum Master
(8, 34), -- Professional Scrum Product Owner
(8, 50), -- Certificación en Liderazgo Ágil
-- Ciberseguridad (9)
(9, 22), -- Cisco Certified CyberOps Associate
(9, 26), -- Certified Ethical Hacker (CEH)
(9, 45), -- Codificación Segura en Java
(9, 51), -- Certificación de Analista en Ciberseguridad
-- Ingeniería de Bases de Datos (10)
(10, 2),  -- Oracle Database SQL Certified Associate
(10, 47), -- SQL Avanzado y Ajuste de Bases de Datos
(10, 48), -- Certificación en Esenciales de NoSQL
(10, 59); -- Certificación en Sistemas Distribuidos



-- -- 26) project position areas
-- Asignación de áreas a las posiciones de proyecto
INSERT INTO "Project_Position_Areas" ("position_id", "area_id") VALUES
-- Capability 1: Desarrollo de Software
-- Backend Developers
(1, 1), (8, 1), (15, 1), (22, 1), (29, 1), (36, 1), (43, 1), (50, 1), (57, 1), (63, 1), (69, 1), (75, 1), (81, 1),
-- Frontend Developers
(2, 2), (9, 2), (16, 2), (23, 2), (30, 2), (37, 2), (44, 2), (51, 2), (87, 2), (93, 2), (99, 2), (105, 2), (111, 2), (117, 2),
-- Fullstack Developers
(55, 1), (55, 2), (85, 1), (85, 2), (103, 1), (103, 2),

-- Capability 2: Ciencia de Datos
(3, 4), (10, 4), (17, 4), (24, 4), (31, 4), (38, 4), (45, 4), (52, 4), (58, 4), (64, 4), (70, 4), (76, 4), (82, 4), (88, 4), (94, 4), (100, 4), (106, 4), (112, 4), (118, 4),

-- Capability 3: Arquitectura en la Nube
(4, 3), (11, 3), (18, 3), (25, 3), (32, 3), (39, 3), (46, 3), (53, 3), (59, 3), (65, 3), (71, 3), (77, 3), (83, 3), (89, 3), (95, 3), (101, 3), (107, 3), (113, 3), (119, 3),

-- Capability 4: Calidad de Software QA
(5, 6), (12, 6), (19, 6), (26, 6), (33, 6), (40, 6), (47, 6), (54, 6), (60, 6), (66, 6), (72, 6), (78, 6), (84, 6), (90, 6), (96, 6), (102, 6), (108, 6), (114, 6), (120, 6),

-- Capability 5: Diseño de UI/UX
(6, 7), (13, 7), (20, 7), (27, 7), (34, 7), (41, 7), (48, 7), (55, 7), (61, 7), (67, 7), (73, 7), (79, 7), (85, 7), (91, 7), (97, 7), (103, 7), (109, 7), (115, 7), (121, 7),

-- Capability 6: Ingeniería de DevOps
(7, 3), (14, 3), (21, 3), (28, 3), (35, 3), (42, 3), (49, 3), (56, 3), (62, 3), (68, 3), (74, 3), (80, 3), (86, 3), (92, 3), (98, 3), (104, 3), (110, 3), (116, 3), (122, 3),

-- Posiciones especiales (múltiples áreas)
-- Desarrolladores con enfoque en seguridad
(1, 9), (8, 9), (22, 9), (29, 9), (43, 9), (45, 9), (91, 9),
-- Desarrolladores con enfoque en bases de datos
(1, 10), (8, 10), (15, 10), (22, 10), (29, 10), (36, 10), (43, 10), (50, 10), (57, 10), (63, 10), (69, 10), (75, 10), (81, 10),
-- Científicos de datos con enfoque en visualización
(17, 7), (52, 7), (58, 7), (70, 7), (88, 7), (94, 7), (118, 7),
-- QA con enfoque en seguridad
(5, 9), (12, 9), (19, 9), (26, 9), (33, 9), (40, 9), (47, 9), (54, 9), (60, 9), (66, 9), (72, 9), (78, 9), (84, 9), (90, 9), (96, 9), (102, 9), (108, 9), (114, 9), (120, 9);



-- 27) User Area Score
WITH cert_points AS (
    SELECT
        cu.user_id,
        ac.area_id,
        COUNT(*) * 250 AS points
    FROM
        "Certificate_Users" cu
    JOIN
        "Area_Certificates" ac ON cu.certificate_id = ac.certificate_id
    WHERE
        cu.status = 'completed'
    GROUP BY
        cu.user_id, ac.area_id
),

position_points AS (
    SELECT
        pp.user_id,
        ppa.area_id,
        ROUND(SUM((
            EXTRACT(EPOCH FROM COALESCE(p.end_date, CURRENT_DATE)) - 
            EXTRACT(EPOCH FROM p.start_date)) / 
            (60 * 60 * 24 * 30) * 250)) AS points
    FROM
        "Project_Positions" pp
    JOIN
        "Projects" p ON p.project_id = pp.project_id
    JOIN
        "Project_Position_Areas" ppa ON ppa.position_id = pp.position_id
    WHERE
        pp.user_id IS NOT NULL
    GROUP BY
        pp.user_id, ppa.area_id
),

total_points AS (
    SELECT 
        user_id,
        area_id,
        SUM(points) AS total_score
    FROM (
        SELECT user_id, area_id, points FROM cert_points
        UNION ALL
        SELECT user_id, area_id, points FROM position_points
    ) AS combined
    GROUP BY user_id, area_id
)

INSERT INTO "User_Area_Score" (user_id, area_id, score)
SELECT user_id, area_id, total_score
FROM total_points
ON CONFLICT (user_id, area_id)
DO UPDATE SET score = EXCLUDED.score;

CREATE OR REPLACE FUNCTION update_user_area_score_from_certificate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        INSERT INTO pathexplorer."User_Area_Score" ("user_id", "area_id", "score")
        SELECT
        NEW.user_id,
        ac.area_id,
        250
        FROM pathexplorer."Area_Certificates" ac
        WHERE ac.certificate_id = NEW.certificate_id
        ON CONFLICT ("user_id", "area_id") DO UPDATE
        SET score = pathexplorer."User_Area_Score".score + 250;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_area_score_from_certificate_trigger
AFTER INSERT OR UPDATE ON "Certificate_Users"
FOR EACH ROW
EXECUTE FUNCTION update_user_area_score_from_certificate();



-- 28) Session NULL