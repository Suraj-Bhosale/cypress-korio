describe('System Health', () => {
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

    it('Verify Login page has all the required fields', () => {
      cy.fixture('mainFixtures.json').as('usersData');
      cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
        return req;
      }).as('login');

      cy.visitPageAndClearCookies(scope.baseUrl);
      cy.getAccessTokenSupplyUSer(scope);
      cy.verifyStudyName(scope);
    });

    it('System Health PLT-377', () => {
      cy.contains('All Studies').click();
      cy.contains('Study XYZ567').parent().find('button').click();
      cy.verifyText('ul > div:nth-child(11) > div','System Health');

      cy.waitForElementAndClick('ul > div:nth-child(11) > div');
      cy.verifyTextWithIndex('.css-19sb15v',0,'integrations');
      cy.verifyTextWithIndex('.css-19sb15v',1,'All');
      cy.verifyTextWithIndex('.css-19sb15v',2,'Errors');
      cy.verifyTextWithIndex('.css-19sb15v',3,'Pending');

      //ALL Inetgrations
      //Last Seven Days
      cy.log('Last 7 days');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',0);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      //Last 30 days
      cy.log('Last 30 days');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',1);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      cy.log('Last year');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',2);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      cy.log('All Time');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',3);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);


      //Errors Integrations
      cy.waitForElementwithIndexClick('.css-19sb15v',2);
      //Last Seven Days
      cy.log('Last 7 days');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',0);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      //Last 30 days
      cy.log('Last 30 days');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',1);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      cy.log('Last year');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',2);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      cy.log('All Time');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',3);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      //Pending Integrations

      cy.waitForElementwithIndexClick('.css-19sb15v',3);
      //Last Seven Days
      cy.log('Last 7 days');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',0);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      //Last 30 days
      cy.log('Last 30 days');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',1);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      cy.log('Last year');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',2);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

      cy.log('All Time');
      cy.waitForElementAndClick('.css-87yb2j');
      cy.waitForElementwithIndexClick('.css-h5obyu',3);
      cy.verifyPagnation('.css-82t9en','[data-testid="KeyboardArrowRightIcon"]','.css-87yb2j','.css-h5obyu',3);

    });
  });