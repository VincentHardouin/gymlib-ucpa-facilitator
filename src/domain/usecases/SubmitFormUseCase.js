const CONTREMARQUE_FORM_URL = 'https://sphinx.ucpa.com/surveyserver/s/ucpa/CONTREMARQUE/Gymlib.htm';

export class SubmitFormUseCase {
  constructor({ browser, reservationRepositories, formInfo }) {
    this.browser = browser;
    this.reservationRepositories = reservationRepositories;
    this.formInfo = formInfo;
  }

  async execute(reservation, dryRun) {
    const { club, lastName, firstName, email, tel } = this.formInfo;
    const page = this.browser.page;
    await page.goto(CONTREMARQUE_FORM_URL);
    await page.select('[id="2041925461"]', club);
    const radioSexe = await page.$('[id="971686063_1"]');
    await radioSexe.evaluate(r => r.click());
    await page.locator('[id="850825341"]').fill(lastName);
    await page.locator('[id="1942938287"]').fill(firstName);
    await page.locator('[id="312670120"]').fill(email);
    await page.locator('[id="1685117953"]').fill(tel);
    await page.click('[type="submit"][data-action="next"]');
    await page.locator('[id="1556317564"]').fill(reservation.code);
    const radioAccount = await page.$('[id="1118941646_1"]');
    await radioAccount.evaluate(r => r.click());
    if (!dryRun) {
      await page.click('[type="submit"][data-action="save"]');
    }
    await this.browser.browser.close();

    reservation.markAsSubmitted();
    await this.reservationRepositories.save(reservation);
  }
}
