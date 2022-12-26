describe('Depot & Sites', () => {
  let scope = {};

  before(() => {
    cy.visitPageAndClearwinCookies();
    scope.baseUrl = Cypress.env('baseUrl');
    scope.apiUrl = Cypress.env('apiUrl');
  });

  after(() => {
    cy.get('ul').eq(1).click();
    cy.get('[data-testid="sign-out-btn"]').click();
  });

  it('Verify Login page has all the required fields', () => {
    cy.fixture('mainFixtures.json').as('usersData');
    cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
      return req;
    }).as('login');
    cy.visitPageAndClearCookies(scope.baseUrl);
    cy.getAccessTokenSupplyUSer(scope);
    cy.verifyStudyName(scope);
  });

  it('Countries - PLT-327,PLT-328,PLT-330,PLT-331,PLT-332', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/allCountries`).as('allCountries');

    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();

    cy.waitForElementAndClick('ul > div:nth-child(8) > div');

    cy.wait('@allCountries');

    //PLT-326

    cy.verifyTextWithIndex('.css-cc8tf1',0,'Country');
    cy.verifyTextWithIndex('.css-cc8tf1',1,'Depot');
    cy.verifyTextWithIndex('.css-cc8tf1',2,'Status');
    cy.verifyTextWithIndex('.css-cc8tf1',3,'More');


    // PLT-328
    cy.get('[data-testid="vertMenu"]',{timeout: 10000}).eq(1).click({ force: true});
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.verifyTextWithIndex('.css-xax8ac',0,'View Country Details');
    cy.verifyTextWithIndex('.css-xax8ac',1,'Activate');
    cy.get('.css-xax8ac').eq(0).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('.css-1b7ibh7').eq(1).click();
    cy.get('[data-testid = "new-depot-btn"]').click({ force: true});
    cy.get('.css-1o0en0j').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('.css-h5obyu').eq(1).click();
    cy.get('button[type="submit"]').click({ force: true});
    cy.get('button[type="submit"]').eq(1).click({ force: true});
    cy.get('button[type="submit"]').eq(1).click({ force: true});

    //Click on No, Cancel;
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);
     cy.get('.css-1b7ibh7').eq(1).click();
     cy.get('[data-testid = "new-depot-btn"]').click({ force: true});
     cy.get('.css-1o0en0j').click();
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);
     cy.get('.css-h5obyu').eq(0).click();
     cy.get('.css-h5obyu').eq(1).click();
     cy.get('button[type="submit"]').click({ force: true});
     cy.get('button[type="submit"]').eq(1).click({ force: true});
     cy.get('button[type="submit"]').eq(0).click({ force: true});
  });
});