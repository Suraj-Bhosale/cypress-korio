describe('Audit Trail Blinded spec', () => {
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

  it('Login Application Blinded user', () => {
    cy.fixture('mainFixtures.json').as('usersData');

    cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
      return req;
    }).as('login');
    cy.visitPageAndClearCookies(scope.baseUrl);
    cy.getAccessToken(scope);
    cy.verifyStudyName(scope);
  });


  it('Audit Trail UnBlinded PLT-382', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.verifyText('ul > div:nth-child(7) > div','Audit Trail');

    cy.waitForElementAndClick('ul > div:nth-child(7) > div');
    cy.verifyTextWithIndex('.css-cc8tf1',0,'Audit Id');
    cy.verifyTextWithIndex('.css-cc8tf1',1,'Name');
    cy.verifyTextWithIndex('.css-cc8tf1',2,'Environment');
    cy.verifyTextWithIndex('.css-cc8tf1',3,'Date Time');
    cy.verifyTextWithIndex('.css-cc8tf1',4,'Reason');
    cy.verifyTextWithIndex('.css-cc8tf1',5,'Protocol');
    cy.verifyTextWithIndex('.css-cc8tf1',6,'Session ID');
    cy.verifyTextWithIndex('.css-cc8tf1',7,'Details');
    cy.verifyText('[data-testid="audit-trail-export-btn"]','Download CSV');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('ul').eq(1).click();
    cy.get('ul li').eq(1).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
  
  });  
  it('Login Application with UnBlinded', () => {
    cy.fixture('mainFixtures.json').as('usersData');

    cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
      return req;
    }).as('login');
    
    cy.visitPageAndClearCookies(scope.baseUrl);
    cy.getAccessTokenSupplyUSer(scope);
    cy.verifyStudyName(scope);
  });

  it('Audit Trail Blinded PLT-383', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.verifyText('ul > div:nth-child(10) > div','Audit Trail');

    cy.waitForElementAndClick('ul > div:nth-child(10) > div');
    cy.verifyTextWithIndex('.css-cc8tf1',0,'Audit Id');
    cy.verifyTextWithIndex('.css-cc8tf1',1,'Name');
    cy.verifyTextWithIndex('.css-cc8tf1',2,'Environment');
    cy.verifyTextWithIndex('.css-cc8tf1',3,'Date Time');
    cy.verifyTextWithIndex('.css-cc8tf1',4,'Reason');
    cy.verifyTextWithIndex('.css-cc8tf1',5,'Protocol');
    cy.verifyTextWithIndex('.css-cc8tf1',6,'Session ID');
    cy.verifyTextWithIndex('.css-cc8tf1',7,'Details');
    cy.verifyText('[data-testid="audit-trail-export-btn"]','Download CSV');
  });
});