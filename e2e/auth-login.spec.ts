import { test, expect } from '@playwright/test';

test.describe('로그인 페이지 E2E', () => {
    test('로그인 페이지가 정상적으로 렌더링된다', async ({ page }) => {
        await page.goto('/auth/login');

        await expect(
            page.getByRole('heading', {
                name: /냥멍일지에 오신 것을 환영해요/i,
            }),
        ).toBeVisible();

        await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
        await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();

        const loginButton = page.getByRole('button', { name: '로그인' });
        await expect(loginButton).toBeVisible();
        await expect(loginButton).toBeDisabled();
    });

    test('이메일과 비밀번호를 입력하면 로그인 버튼이 활성화된다', async ({ page }) => {
        await page.goto('/auth/login');

        const emailInput = page.getByPlaceholder('이메일을 입력하세요');
        const passwordInput = page.getByPlaceholder('비밀번호를 입력하세요');
        const loginButton = page.getByRole('button', { name: '로그인' });

        await emailInput.fill('user@test.com');
        await passwordInput.fill('password123');

        await expect(loginButton).toBeEnabled();
    });

    test('잘못된 이메일 형식으로 제출하면 에러 메시지가 노출된다 (로컬 검증)', async ({ page }) => {
        await page.goto('/auth/login');

        const emailInput = page.getByPlaceholder('이메일을 입력하세요');
        const passwordInput = page.getByPlaceholder('비밀번호를 입력하세요');
        const loginButton = page.getByRole('button', { name: '로그인' });

        await emailInput.fill('invalid-email');
        await passwordInput.fill('password123');
        await loginButton.click();

        await expect(
            page.getByText(/올바른 이메일 형식이 아닙니다/i),
        ).toBeVisible();
    });
});



