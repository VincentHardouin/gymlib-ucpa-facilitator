const CONTREMARQUE_FORM_URL = 'https://sphinx.ucpa.com/surveyserver/s/ucpa/CONTREMARQUE/Gymlib.htm';

export class SubmitFormUseCase {
  constructor({ browser, reservationRepository, formInfo, dryRun }) {
    this.browser = browser;
    this.reservationRepository = reservationRepository;
    this.formInfo = formInfo;
    this.dryRun = dryRun;
  }

  async execute(reservation) {
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
    if (!this.dryRun) {
      await page.click('[type="submit"][data-action="save"]');
    }
    await this.browser.browser.close();

    reservation.markAsSubmitted();
    await this.reservationRepository.save(reservation);
  }
}
