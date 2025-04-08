import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Region
  await prisma.region.createMany({
    data: [
      {
        region_id: 1,
        region_name: "North America",
        country: "USA",
        timezone: "UTC-5",
      },
      {
        region_id: 2,
        region_name: "Europe",
        country: "Germany",
        timezone: "UTC+1",
      },
      {
        region_id: 3,
        region_name: "Asia",
        country: "India",
        timezone: "UTC+5:30",
      },
    ],
    skipDuplicates: true,
  });

  // 2) Permits
  await prisma.permits.createMany({
    data: [
      {
        role_id: 1,
        is_employee: true,
        is_people_lead: false,
        is_capability_lead: false,
        is_delivery_lead: false,
        is_admin: false,
      },
      {
        role_id: 2,
        is_employee: true,
        is_people_lead: true,
        is_capability_lead: false,
        is_delivery_lead: false,
        is_admin: false,
      },
      {
        role_id: 3,
        is_employee: true,
        is_people_lead: false,
        is_capability_lead: true,
        is_delivery_lead: false,
        is_admin: false,
      },
      {
        role_id: 4,
        is_employee: true,
        is_people_lead: false,
        is_capability_lead: false,
        is_delivery_lead: true,
        is_admin: false,
      },
      {
        role_id: 5,
        is_employee: false,
        is_people_lead: false,
        is_capability_lead: false,
        is_delivery_lead: false,
        is_admin: true,
      },
    ],
    skipDuplicates: true,
  });

  // 3) Skills
  await prisma.skills.createMany({
    data: [
      { skill_id: 1, name: "Java", technical: true },
      { skill_id: 2, name: "Project Management", technical: false },
      { skill_id: 3, name: "Python", technical: true },
      { skill_id: 4, name: "Communication", technical: false },
    ],
    skipDuplicates: true,
  });

  // 4) Certificates
  await prisma.certificates.createMany({
    data: [
      {
        certificate_id: 1,
        certificate_name: "Oracle Java Certification",
        certificate_desc: "Certification for Java developers",
      },
      {
        certificate_id: 2,
        certificate_name: "PMP Certification",
        certificate_desc: "Project Management Professional",
      },
      {
        certificate_id: 3,
        certificate_name: "AWS Certified Solutions Architect",
        certificate_desc: "Cloud architecture certification",
      },
    ],
    skipDuplicates: true,
  });

  // 5) Courses
  await prisma.courses.createMany({
    data: [
      {
        course_id: 1,
        course_name: "Java Basics",
        course_desc: "Introduction to Java programming",
        estimated_time: "10 hours",
      },
      {
        course_id: 2,
        course_name: "Advanced Project Management",
        course_desc: "Deep dive into PM techniques",
        estimated_time: "20 hours",
      },
      {
        course_id: 3,
        course_name: "AWS Foundations",
        course_desc: "Basic AWS usage",
        estimated_time: "15 hours",
      },
    ],
    skipDuplicates: true,
  });

  // 6) Work_Position
  await prisma.work_Position.createMany({
    data: [
      {
        position_id: 1,
        position_name: "Software Engineer",
        position_desc: "Responsible for software development",
        company: "TechCorp",
      },
      {
        position_id: 2,
        position_name: "Project Manager",
        position_desc: "Oversees project execution",
        company: "BizCorp",
      },
      {
        position_id: 3,
        position_name: "DevOps Engineer",
        position_desc: "Manages CI/CD and infrastructure",
        company: "CloudCorp",
      },
    ],
    skipDuplicates: true,
  });

  // 7) Goals
  await prisma.goals.createMany({
    data: [
      {
        goal_id: 1,
        goal_name: "Improve Java Skills",
        goal_desc: "Focus on advanced Java concepts",
      },
      {
        goal_id: 2,
        goal_name: "Develop PM Skills",
        goal_desc: "Learn project management methodologies",
      },
      {
        goal_id: 3,
        goal_name: "Get AWS Certified",
        goal_desc: "Achieve AWS certification",
      },
    ],
    skipDuplicates: true,
  });

  // 8) Users
  await prisma.users.createMany({
    data: [
      {
        user_id: 1,
        mail: "john.doe@example.com",
        password: "password123",
        name: "John Doe",
        birthday: new Date("1985-05-20"),
        hire_date: new Date("2020-01-15"),
        role_id: 1,
        in_project: true,
        region_id: 1,
      },
      {
        user_id: 2,
        mail: "jane.smith@example.com",
        password: "passwordabc",
        name: "Jane Smith",
        birthday: new Date("1990-07-10"),
        hire_date: new Date("2019-03-10"),
        role_id: 2,
        in_project: false,
        region_id: 1,
      },
      {
        user_id: 3,
        mail: "alex.miller@example.com",
        password: "pass123",
        name: "Alex Miller",
        birthday: new Date("1988-12-01"),
        hire_date: new Date("2021-06-01"),
        role_id: 3,
        in_project: true,
        region_id: 2,
      },
      {
        user_id: 4,
        mail: "emily.jones@example.com",
        password: "mypassword",
        name: "Emily Jones",
        birthday: new Date("1978-11-15"),
        hire_date: new Date("2015-09-01"),
        role_id: 4,
        in_project: false,
        region_id: 2,
      },
      {
        user_id: 5,
        mail: "admin.user@example.com",
        password: "adminpass",
        name: "Admin User",
        birthday: new Date("2000-01-01"),
        hire_date: new Date("2022-01-01"),
        role_id: 5,
        in_project: false,
        region_id: 3,
      },
    ],
    skipDuplicates: true,
  });

  // 9) User_Score
  await prisma.user_Score.createMany({
    data: [
      { score_id: 1, user_id: 1, score: 85 },
      { score_id: 2, user_id: 2, score: 90 },
      { score_id: 3, user_id: 3, score: 75 },
      { score_id: 4, user_id: 4, score: 88 },
      { score_id: 5, user_id: 5, score: 95 },
    ],
    skipDuplicates: true,
  });

  // 10) Capability
  await prisma.capability.createMany({
    data: [
      {
        capability_id: 1,
        capability_name: "Software Development",
        capability_lead_id: 1,
        region_id: 1,
      },
      {
        capability_id: 2,
        capability_name: "Project Management",
        capability_lead_id: 2,
        region_id: 1,
      },
    ],
    skipDuplicates: true,
  });

  // 11) Capability_People_Lead
  await prisma.capability_People_Lead.createMany({
    data: [
      { capability_id: 1, capability_pl_id: 2 },
      { capability_id: 2, capability_pl_id: 3 },
    ],
    skipDuplicates: true,
  });

  // 12) Capability_Employee
  await prisma.capability_Employee.createMany({
    data: [
      { capability_id: 1, people_lead_id: 2, employee_id: 1 },
      { capability_id: 1, people_lead_id: 2, employee_id: 3 },
      { capability_id: 2, people_lead_id: 3, employee_id: 2 },
      { capability_id: 2, people_lead_id: 3, employee_id: 4 },
    ],
    skipDuplicates: true,
  });

  // 13) Projects
  await prisma.projects.createMany({
    data: [
      {
        project_id: 1,
        delivery_lead_user_id: 4,
        project_name: "Project Alpha",
        company_name: "TechCorp",
        project_desc: "A top secret software project",
        start_date: new Date("2023-01-01"),
        end_date: new Date("2023-12-31"),
        region_id: 1,
      },
      {
        project_id: 2,
        delivery_lead_user_id: 4,
        project_name: "Project Beta",
        company_name: "DataCorp",
        project_desc: "Data analysis initiative",
        start_date: new Date("2023-02-01"),
        end_date: new Date("2023-08-31"),
        region_id: 2,
      },
      {
        project_id: 3,
        delivery_lead_user_id: 4,
        project_name: "Project Gamma",
        company_name: "CloudCorp",
        project_desc: "Cloud infrastructure migration",
        start_date: new Date("2026-01-01"),
        end_date: new Date("2026-12-31"),
        region_id: 1,
      },
      {
        project_id: 4,
        delivery_lead_user_id: 4,
        project_name: "Project Delta",
        company_name: "MobileCorp",
        project_desc: "Mobile app development",
        start_date: new Date("2026-01-01"),
        end_date: new Date("2026-06-30"),
        region_id: 2,
      },
      {
        project_id: 5,
        delivery_lead_user_id: 4,
        project_name: "Project Epsilon",
        company_name: "AI Innovations",
        project_desc: "AI Research initiative",
        start_date: new Date("2025-12-01"),
        end_date: new Date("2026-05-31"),
        region_id: 1,
      },
      {
        project_id: 6,
        delivery_lead_user_id: 4,
        project_name: "Project Zeta",
        company_name: "Security Solutions",
        project_desc: "Cybersecurity audit",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-31"),
        region_id: 3,
      },
    ],
    skipDuplicates: true,
  });

  // 14) Meeting
  await prisma.meeting.createMany({
    data: [
      {
        meeting_id: 1,
        meeting_date: new Date("2023-03-15 10:00:00"),
        meeting_link: "http://meetinglink.com/1",
      },
      {
        meeting_id: 2,
        meeting_date: new Date("2023-04-20 15:30:00"),
        meeting_link: "http://meetinglink.com/2",
      },
    ],
    skipDuplicates: true,
  });

  // 15) Project_Positions
  await prisma.project_Positions.createMany({
    data: [
      {
        position_id: 1,
        project_id: 1,
        position_name: "Java Developer",
        position_desc: "Develops Java code for Project Alpha",
        user_id: 1,
      },
      {
        position_id: 2,
        project_id: 1,
        position_name: "Project Coordinator",
        position_desc: "Coordinates tasks for Project Alpha",
        user_id: 2,
      },
      {
        position_id: 3,
        project_id: 2,
        position_name: "Python Developer",
        position_desc: "Works on data analysis with Python for Project Beta",
        user_id: 3,
      },
      {
        position_id: 4,
        project_id: 3,
        position_name: "Cloud Architect",
        position_desc: "Design AWS infrastructure",
        user_id: null,
      },
      {
        position_id: 5,
        project_id: 3,
        position_name: "DevOps Engineer",
        position_desc: "Implement CI/CD pipelines",
        user_id: 3,
      },
      {
        position_id: 6,
        project_id: 4,
        position_name: "Flutter Developer",
        position_desc: "Build cross-platform app",
        user_id: null,
      },
      {
        position_id: 7,
        project_id: 5,
        position_name: "ML Engineer",
        position_desc: "Develop machine learning models",
        user_id: null,
      },
    ],
    skipDuplicates: true,
  });

  // 16) Project_User
  await prisma.project_User.createMany({
    data: [
      { user_id: 1, project_id: 1 }, // John on Project Alpha
      { user_id: 2, project_id: 1 }, // Jane on Project Alpha
      { user_id: 3, project_id: 2 }, // Alex on Project Beta
      { user_id: 4, project_id: 1 }, // Emily also on Project Alpha
      { user_id: 4, project_id: 2 }, // Emily is the Delivery Lead on Project Beta
    ],
    skipDuplicates: true,
  });

  // 17) Project_Position_Skills
  await prisma.project_Position_Skills.createMany({
    data: [
      { position_id: 1, skill_id: 1 }, // Java Developer => Java skill
      { position_id: 2, skill_id: 2 }, // Project Coordinator => PM skill
      { position_id: 3, skill_id: 3 }, // Python Developer => Python skill
    ],
    skipDuplicates: true,
  });

  // 18) Project_Position_Certificates
  await prisma.project_Position_Certificates.createMany({
    data: [
      { position_id: 1, certificate_id: 1 }, // Java Dev might require Java Certification
      { position_id: 2, certificate_id: 2 }, // Coordinator might require PMP
    ],
    skipDuplicates: true,
  });

  // 19) Postulations
  await prisma.postulations.createMany({
    data: [
      {
        postulation_id: 1,
        project_position_id: 3,
        user_id: 1,
        postulation_date: new Date("2023-02-20"),
        meeting_id: 1,
      },
      {
        postulation_id: 2,
        project_position_id: 1,
        user_id: 2,
        postulation_date: new Date("2023-02-21"),
        meeting_id: 2,
      },
    ],
    skipDuplicates: true,
  });

  // 20) Feedback
  await prisma.feedback.createMany({
    data: [
      {
        feedback_id: 1,
        project_id: 1,
        user_id: 1,
        desc: "Great progress so far",
        score: 4,
      },
      {
        feedback_id: 2,
        project_id: 1,
        user_id: 2,
        desc: "Needs more coordination",
        score: 3,
      },
      {
        feedback_id: 3,
        project_id: 2,
        user_id: 3,
        desc: "Excellent data analysis",
        score: 5,
      },
    ],
    skipDuplicates: true,
  });

  // 21) Certificate_Users
  await prisma.certificate_Users.createMany({
    data: [
      {
        certificate_id: 1,
        user_id: 1,
        certificate_date: new Date("2021-06-01"),
        certificate_expiration_date: new Date("2024-06-01"),
        certificate_link: "http://certificates.com/java_1",
        certificate_valid: true,
      },
      {
        certificate_id: 2,
        user_id: 2,
        certificate_date: new Date("2022-01-10"),
        certificate_expiration_date: new Date("2025-01-10"),
        certificate_link: "http://certificates.com/pmp_1",
        certificate_valid: true,
      },
    ],
    skipDuplicates: true,
  });

  // 22) Certificate_Skills
  await prisma.certificate_Skills.createMany({
    data: [
      { certificate_id: 1, skill_id: 1 }, // Java Cert -> Java skill
      { certificate_id: 2, skill_id: 2 }, // PMP Cert -> PM skill
      { certificate_id: 3, skill_id: 3 }, // AWS Cert -> Python skill (example)
    ],
    skipDuplicates: true,
  });

  // 23) Course_Users
  await prisma.course_Users.createMany({
    data: [
      {
        course_id: 1,
        user_id: 1,
        course_start_date: new Date("2023-01-01"),
        progress: 50,
        course_link: "http://courses.com/java_basics",
        finished: false,
      },
      {
        course_id: 2,
        user_id: 2,
        course_start_date: new Date("2023-02-01"),
        progress: 100,
        course_link: "http://courses.com/advanced_pm",
        finished: true,
      },
      {
        course_id: 3,
        user_id: 3,
        course_start_date: new Date("2023-03-01"),
        progress: 30,
        course_link: "http://courses.com/aws_foundations",
        finished: false,
      },
    ],
    skipDuplicates: true,
  });

  // 24) Course_Skills
  await prisma.course_Skills.createMany({
    data: [
      { course_id: 1, skill_id: 1 }, // Java Basics => Java skill
      { course_id: 2, skill_id: 2 }, // Advanced PM => PM skill
      { course_id: 3, skill_id: 3 }, // AWS Foundations => Python skill
    ],
    skipDuplicates: true,
  });

  // 25) Employee_Position
  await prisma.employee_Position.createMany({
    data: [
      {
        position_id: 1,
        user_id: 1,
        start_date: new Date("2020-01-15"),
        end_date: null,
      },
      {
        position_id: 2,
        user_id: 2,
        start_date: new Date("2019-03-10"),
        end_date: null,
      },
      {
        position_id: 3,
        user_id: 3,
        start_date: new Date("2021-06-01"),
        end_date: null,
      },
    ],
    skipDuplicates: true,
  });

  // 26) Goal_Skills
  await prisma.goal_Skills.createMany({
    data: [
      { goal_id: 1, skill_id: 1 }, // Improve Java Skills -> Java
      { goal_id: 2, skill_id: 2 }, // Develop PM Skills -> PM
      { goal_id: 3, skill_id: 3 }, // Get AWS Certified -> Python
    ],
    skipDuplicates: true,
  });

  // 27) Goal_Users
  await prisma.goal_Users.createMany({
    data: [
      {
        goal_id: 1,
        user_id: 1,
        create_date: new Date("2023-01-15"),
        finished_date: null,
        completed: false,
      },
      {
        goal_id: 2,
        user_id: 2,
        create_date: new Date("2023-02-20"),
        finished_date: null,
        completed: false,
      },
      {
        goal_id: 3,
        user_id: 3,
        create_date: new Date("2023-03-01"),
        finished_date: null,
        completed: false,
      },
    ],
    skipDuplicates: true,
  });

  // 28) User_Skills
  await prisma.user_Skills.createMany({
    data: [
      { user_id: 1, skill_id: 1 }, // John -> Java
      { user_id: 2, skill_id: 2 }, // Jane -> PM
      { user_id: 3, skill_id: 3 }, // Alex -> Python
      { user_id: 4, skill_id: 4 }, // Emily -> Communication
      { user_id: 1, skill_id: 4 }, // John -> Communication as well
    ],
    skipDuplicates: true,
  });

  // At this point, all your seeded data should be inserted.
  console.log("Seeding complete!");
}

// Execute the main seed function
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
