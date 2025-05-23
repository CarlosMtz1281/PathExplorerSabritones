import { test, expect, Page } from '@playwright/test';
import { login } from './functions.spec';

test('GET employee/user/:userId', async ({ request, page }) => {

    const userId = await login(page);

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