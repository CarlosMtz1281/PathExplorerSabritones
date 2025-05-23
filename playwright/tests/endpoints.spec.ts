import { test, expect, Page } from '@playwright/test';
import { login } from './functions.spec';

test('GET employee/user/:userId', async ({ request, page }) => {

    const userId = await login(page, 'EMP');

    const response = await request.get(`http://localhost:3003/employee/user/${userId}`);
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

test('GET getProjectById/:projectId', async ({ request, page }) => {
  await login(page, 'CL'); 

  const projectId = 1; 

  const response = await request.get(`http://localhost:3003/project/getProjectById/${projectId}`);
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
