import { expect, test } from '../helpers/harness.ts';
import {
  expectBookReaderText,
  importBookFixtures,
  openBookFromManage,
  PARAGRAPH_INDENT_BOOK
} from '../helpers/fixtures.ts';
import { navigateToSettingsAppearance } from '../helpers/navigation.ts';
import { expectReaderActionComplete } from '../helpers/reader.ts';
import { useReaderSettings } from '../helpers/workflows.ts';

for (const viewMode of ['Paginated', 'Continuous']) {
  for (const writingMode of ['Vertical', 'Horizontal']) {
    test(`preserves book indentation until customized in ${viewMode} ${writingMode}`, async ({
      page
    }) => {
      await page.setViewportSize({ width: 1172, height: 835 });
      await useReaderSettings(page, { fontSize: '24', viewMode, writingMode });
      await importBookFixtures(page, [PARAGRAPH_INDENT_BOOK]);
      await openBookFromManage(page, PARAGRAPH_INDENT_BOOK);
      await expectBookReaderText(page, PARAGRAPH_INDENT_BOOK);
      await expectReaderActionComplete(page);

      const title = page.locator('.book-content .chapter-title');
      const indented = page.locator('.book-content .indented');
      const flush = page.locator('.book-content .flush');
      const important = page.locator('.book-content .important-indent');
      await expect(title).toHaveCSS('text-indent', '-102.864px');
      await expect(indented).toHaveCSS('text-indent', '48px');
      await expect(flush).toHaveCSS('text-indent', '0px');
      await expect(important).toHaveCSS('text-indent', '72px');

      if (viewMode === 'Paginated' && writingMode === 'Vertical') {
        await page.evaluate(() => document.fonts.ready);
        await expect
          .poll(() =>
            title.evaluate((paragraph) => {
              const text = paragraph.firstChild!;
              const first = document.createRange();
              first.setStart(text, 0);
              first.setEnd(text, 1);
              const last = document.createRange();
              last.setStart(text, text.textContent!.length - 1);
              last.setEnd(text, text.textContent!.length);
              return Math.abs(first.getBoundingClientRect().x - last.getBoundingClientRect().x);
            })
          )
          .toBeLessThan(1);
      }

      const settingsPage = await page.context().newPage();
      try {
        await navigateToSettingsAppearance(settingsPage);
        const source = settingsPage.getByRole('group', { name: 'Paragraph indentation source' });
        const indentation = settingsPage.getByRole('spinbutton', {
          name: 'Paragraph indent',
          exact: true
        });

        await source.getByText('Custom', { exact: true }).click();
        await indentation.fill('2');
        await expect(title).toHaveCSS('text-indent', '32px');
        await expect(indented).toHaveCSS('text-indent', '32px');
        await expect(flush).toHaveCSS('text-indent', '32px');
        await expect(important).toHaveCSS('text-indent', '72px');

        await indentation.fill('0');
        await expect(title).toHaveCSS('text-indent', '0px');
        await expect(indented).toHaveCSS('text-indent', '0px');
        await settingsPage.locator('summary').getByText('Advanced', { exact: true }).click();
        await settingsPage
          .getByText('Prioritize reader paragraph formatting', { exact: true })
          .click();
        await expect(important).toHaveCSS('text-indent', '0px');

        await source.getByText('Book', { exact: true }).click();
        await expect(title).toHaveCSS('text-indent', '-102.864px');
        await expect(indented).toHaveCSS('text-indent', '48px');
        await expect(flush).toHaveCSS('text-indent', '0px');
        await expect(important).toHaveCSS('text-indent', '72px');
      } finally {
        await settingsPage.close();
      }
    });
  }
}
