describe('Reports', () => {
  let scope = {};

  before(() => {
    cy.visitPageAndClearwinCookies();
    scope.baseUrl = Cypress.env('baseUrl');
    scope.apiUrl = Cypress.env('apiUrl');
  });

  after(() => {
    cy.get('ul').eq(1).click();
    cy.get('ul li').eq(1).click();
  });
  it('Login Application with CRO user', () => {
    cy.fixture('mainFixtures.json').as('usersData');

    cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
      return req;
    }).as('login');

    cy.visitPageAndClearCookies(scope.baseUrl);
    cy.getAccessTokenSupplyUSer(scope);
    cy.verifyStudyName(scope);
  });
  it('Subject list report for CRO PLT-449', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.verifyText('ul > div:nth-child(9) > div','Reports');
    cy.waitForElementAndClick('ul > div:nth-child(9) > div');
    cy.verifyText('.css-mquyto','Download Report');
  });
});