const { test, expect} = require('@playwright/test');

const CMP_COOKIES = ([
    {
        name: "euconsent-v2", // TCF string v2
        value: "CPWQiJUPWQiJUD3ACBCSCHCsAP_AAEPAAATIIDoBhCokBSFCAGpYIIMAAAAHxxAAYCACABAAoAABABIAIAQAAAAQAAAgBAAAABQAIAIAAAAACEAAAAAAAAAAAQAAAAAAAAAAIQIAAAAAACBAAAAAAABAAAAAAABAQAAAggAAAAIAAAAAAAEAgAAAAAAAAAAAAAAAAAgAAAAAAAAAAAgd1AmAAWABUAC4AGQAQAAyABoADmAIgAigBMACeAFUAMQAfgBCQCIAIkARwAnABSgCxAGWAM0AdwA_QCEAEWALQAXUAwIBrAD5AJBATaAtQBeYDSgGpgO6AAAA.YAAAAAAAAAAA",
        domain: ".stream.cz",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // next month in secs
        secure: true,
        sameSite: "None",
        httpOnly: false,
    },
    {
        name: "cmppersisttestcookie", // unix timestamp of first visit, yup could be 1
        value: "1",
        domain: ".stream.cz",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        secure: true,
        sameSite: "None",
        httpOnly: false,
    },
    {
        name: "szncmpone", // some helper to track purpose1 consent
        value: "1",
        domain: ".stream.cz",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        secure: true,
        sameSite: "None",
        httpOnly: false,
    },
]);

test('Kazma', async ({ browser }) => {

    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/');
    await page.isVisible('[class="ribbon__start"]')

    const search = '[class="search-form" ] [type="text"]'

    await page.locator(search).fill("Kazma");
    await page.click('[class="ribbon-container"] [aria-label="Vyhledat"]');

    await expect(page).toHaveURL(/.*?dotaz=Kazma/);

    const bestResult = await page.locator('[data-dot="top_search_result"]')
    await expect(bestResult).toBeVisible()
    await expect(bestResult).toHaveText("Nejlepší výsledekKazma")

    const shows = await page.locator('[data-dot="search_shows"]')
    await expect(shows).toBeVisible()
    await expect(shows).not.toBeEmpty();

    const videos = await page.locator('[data-dot="search_episodes"]')
    await expect(videos).toBeVisible()
    await expect(videos).not.toBeEmpty();

    await context.close();
});

test('Non existing expression', async ({ browser }) => {

    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/');
    await page.isVisible('[class="ribbon__start"]')

    const search = '[class="search-form" ] [type="text"]'

    await page.locator(search).fill("abcdsuperbullshit42");
    await page.click('[class="ribbon-container"] [aria-label="Vyhledat"]');

    const errorMessage = await page.locator('[class="h h--search-empty"]')
    await expect(errorMessage).toContainText("Bohužel jsme nic nenašli.");

    await context.close();
});

test('/Searching', async ({ browser }) => {

    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/hledani');
    await page.isVisible('[class="ribbon__start"]')

    //the most appropriate solution here would be definitely visual testing :) to check that the site is empty, easy and simple

    const emptyPage = await page.locator('[class="h h--search-empty"]')
    await expect(emptyPage).toContainText("Zadejte, co chcete hledat")
    await expect(emptyPage).toBeEditable()

    const nonExistingResultsVerification = await page.locator('[class="page"]')
    await expect(nonExistingResultsVerification).not.toHaveClass('[class="page-layout-content page-layout-content--search"]');

    await context.close();
});

test('Searching for Kazma then clicking more videos and verifying that items have been added correctly', async ({ browser }) => {

    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/');
    await page.isVisible('[class="ribbon__start"]')

    const search = '[class="search-form" ] [type="text"]'

    await page.locator(search).fill("Kazma");
    await page.click('[class="ribbon-container"] [aria-label="Vyhledat"]');

    await expect(page).toHaveURL(/.*?dotaz=Kazma/);

    const videos = await page.locator('[data-dot="search_episodes"]')
    await expect(videos).toBeVisible()
    await expect(videos).not.toBeEmpty();

    const originalList = page.locator('[class="search-episodes__item"]');
    const originalListCount = originalList.count()
    console.log(await originalList.count())

    await page.click('[data-dot="next_episodes"] button');

    const extendedList = page.locator('[class="search-episodes__item"]');
    const extendedListCount = extendedList.count()
    console.log(await extendedList.count())

    if(await originalListCount < await extendedListCount)
    {
        console.log("new items have been correctly loaded")
    } else {
        throw new Error ("something went wrong items have not been loaded check where is the problem")
    }

    await context.close();
});

test('Filters functionality, no corresponding result', async ({ browser }) => {

    //TBCH clueless about test cases here, probably did not understand the task
    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/');
    await page.isVisible('[class="ribbon__start"]')

    const search = '[class="search-form" ] [type="text"]'

    await page.locator(search).fill("Kazma");
    await page.click('[class="ribbon-container"] [aria-label="Vyhledat"]');

    await expect(page).toHaveURL(/.*?dotaz=Kazma/);

    const filters = await page.locator('[class="btn search-episodes__filter-btn"]')
    await expect(filters).toBeVisible()

    await page.click('[class="btn search-episodes__filter-btn"]')
    await page.waitForSelector('[class="search-filters search-filters--open"]')
    await page.click('[data-dot="today"]')

    const noResult = await page.locator('[class="h h--search-empty"]')
    await expect(noResult).toContainText("Zadaným filtrům neodpovídá žádný výsledek.")

    await context.close();
});

test('Video play later on possibility', async ({ browser }) => {

    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/');
    await page.isVisible('[class="ribbon__start"]')

    const search = '[class="search-form" ] [type="text"]'

    await page.locator(search).fill("Kazma");
    await page.click('[class="ribbon-container"] [aria-label="Vyhledat"]');

    await expect(page).toHaveURL(/.*?dotaz=Kazma/);

    const videos = await page.locator('[data-dot="search_episodes"]')
    await expect(videos).toBeVisible()

    await page.click('[class="search-episodes__list"] [data-dot="1"] [aria-label="Otevření menu epizody"]')

    const playLaterComponent = await page.locator('[class="mobile-menu-modal__content"]')
    await expect(playLaterComponent).toBeVisible()

    await page.click('[class="btn modal-btn modal-btn--watch"]')

    //Now sign in and continue or take a screenshot etc.

    await context.close();
});

test('Stream left pop up panel functionality open check contain text and close', async ({ browser }) => {

    const context = await browser.newContext();
    await context.addCookies(CMP_COOKIES);

    const page = await context.newPage();

    await page.goto('https://www.stream.cz/');
    await page.isVisible('[class="ribbon__start"]')
    await page.click('[class="ribbon__start"] a')

    /*take the screenshot here that stream panel is rolled up and design corresponds, next steps fe clicking on links
    checking the redirections,visibility eventually close the pane with cross*/

    const openedStreamPanel = await page.locator('[data-dot="hamburger_menu"]  ')
    await expect(openedStreamPanel).toContainText("Domovská stránkaZábavaZpravodajstvíMagazínRady a tipySportSeriályPohádkyDokumentyStream originalsFilmyOdebíranéTV ŽIVĚ")

    await page.click('[class="ribbon"] svg')

    const closedStreamPanel = await page.locator('[class="ribbon__start"]')
    await expect(closedStreamPanel).not.toContain('[class="ribbon-menu__item"]');

    await context.close();
});