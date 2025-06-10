import { test, expect, Page } from "@playwright/test";
import { login } from "./functions";
import { qase } from "playwright-qase-reporter";

test("Login", async ({ page }) => {
  qase.id(76);

  await login(page, 'EMP');


});

test("GET employee/user/:userId", async ({ request, page }) => {
  const userId = await login(page, "EMP");

  const response = await request.get(
    `http://localhost:3003/employee/user/${userId}`
  );
  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  expect(data).toMatchObject({
    user_id: userId,
    position_name: expect.any(String),
    level: expect.anything(),
    Country: expect.objectContaining({
      country_name: expect.any(String),
      timezone: expect.any(String),
    }),
    Certificate_Users: expect.any(Array),
    Employee_Position: expect.any(Array),
    Permits: expect.objectContaining({
      is_admin: expect.any(Boolean),
      is_employee: expect.any(Boolean),

      role_id: expect.any(Number),
    }),
  });
});

test("GET getProjectById/:projectId", async ({ request, page }) => {
  await login(page, "CL");

  const projectId = 1;

  const response = await request.get(
    `http://localhost:3003/project/getProjectById/${projectId}`
  );
  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  expect(data).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    description: expect.any(String),
    start_date: expect.any(String),
    end_date: expect.any(String),
    vacants: expect.any(Number),
    details: {
      company: expect.any(String),
      country: expect.any(String),
      capability: expect.any(String),
    },
    positions: expect.any(Array),
    team_members: expect.any(Array),
  });

  if (data.positions.length > 0) {
    expect(data.positions[0]).toMatchObject({
      position_id: expect.any(Number),
      project_id: expect.any(Number),
      position_name: expect.any(String),
      position_desc: expect.any(String),
      user_id: expect.anything(),
      Project_Position_Skills: expect.any(Array),
      Project_Position_Certificates: expect.any(Array),
      Postulations: expect.any(Array),
    });
  }

  if (data.team_members.length > 0) {
    expect(data.team_members[0]).toMatchObject({
      user_id: expect.any(Number),
      project_id: expect.any(Number),
      Users: expect.objectContaining({
        user_id: expect.any(Number),
        name: expect.any(String),
        mail: expect.any(String),
      }),
    });
  }
});

test("Prueba de endpoints de los proyectos", async ({ request, page }) => {
  qase.id(111);

  const userId = await login(page, "PL");

  const response = await request.get(
    `http://localhost:3003/employee/experience?userId=${userId}`
  );
  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  expect(data).toEqual(
    expect.objectContaining({
      jobs: expect.any(Array),
      projects: expect.any(Array),
    })
  );

  if (data.jobs.length > 0) {
    expect(data.jobs[0]).toMatchObject({
      positionId: expect.any(Number),
      company: expect.any(String),
      position: expect.any(String),
      positionDesc: expect.any(String),
      startDate: expect.any(String),
      endDate: expect.any(String),
      rawStart: expect.anything(),
      rawEnd: expect.anything(),
    });
  }

  if (data.projects.length > 0) {
    expect(data.projects[0]).toMatchObject({
      projectName: expect.any(String),
      company: expect.any(String),
      positionName: expect.any(String),
      projectDescription: expect.any(String),
      startDate: expect.any(String),
      endDate: expect.any(String),
      feedbackDesc: expect.any(String),
      feedbackScore: expect.anything(),
      deliveryLeadName: expect.any(String),
      skills: expect.any(Array),
      areas: expect.any(Array),
      rawStart: expect.anything(),
      rawEnd: expect.anything(),
    });
  }
});

test("Revisión de información correcta", async ({ request, page }) => {
  qase.id(110);

  await login(page, "CL");

  const response = await request.get(
    `http://localhost:3003/project/projectsByCapability`
  );

  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  if (data.length === 0) {
    expect(data).toEqual([]);
    return;
  }

  for (const project of data) {
    expect(project).toMatchObject({
      project_id: expect.any(Number),
      project_name: expect.any(String),
      company_name: expect.any(String),
      project_desc: expect.any(String),
      start_date: expect.any(String),
      end_date: expect.any(String),
      country: expect.objectContaining({
        country_id: expect.any(Number),
        country_name: expect.any(String),
        region_name: expect.any(String),
        timezone: expect.any(String),
      }),
      delivery_lead: expect.objectContaining({
        user_id: expect.any(Number),
        name: expect.any(String),
        mail: expect.any(String),
        password: expect.any(String),
        birthday: expect.any(String),
        hire_date: expect.any(String),
        gender: expect.any(Boolean),
        role_id: expect.any(Number),
        country_id: expect.any(Number),
      }),
      capability_name: expect.any(String),
      open_positions: expect.any(Array),
    });

    for (const position of project.open_positions) {
      expect(position).toMatchObject({
        position_id: expect.any(Number),
        position_name: expect.any(String),
        position_desc: expect.any(String),
        required_skills: expect.any(Array),
        required_certificates: expect.any(Array),
        required_areas: expect.any(Array),
      });

      for (const skill of position.required_skills) {
        expect(skill).toMatchObject({
          skill_id: expect.any(Number),
          name: expect.any(String),
          technical: expect.any(Boolean),
        });
      }

      for (const cert of position.required_certificates) {
        expect(cert).toMatchObject({
          certificate_id: expect.any(Number),
          certificate_name: expect.any(String),
          certificate_desc: expect.any(String),
          certificate_estimated_time: expect.any(Number),
          certificate_level: expect.any(Number),
          provider: expect.any(String),
        });
      }

      for (const area of position.required_areas) {
        expect(area).toMatchObject({
          area_id: expect.any(Number),
          area_name: expect.any(String),
        });
      }
    }
  }
});
