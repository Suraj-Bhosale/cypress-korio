
describe('URS_FRS spec', () => {
  let scope = {};

  before(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    scope.baseUrl = Cypress.env('baseUrl');
    scope.apiUrl = Cypress.env('apiUrl');
  });

  after(() => {
    cy.get('ul').eq(1).click();
    cy.get('ul li').eq(1).click();
  });

  it('Login Application', () => {
    cy.fixture('mainFixtures.json').as('usersData');
    cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
      return req;
    }).as('login');

    cy.visit(scope.baseUrl, {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
      }
    });

    cy.get('.MuiListItemButton-root').click().then(() => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000);
      cy.get('body').then(($a) => {
        if (!$a.text().includes('All Studies')) {
          cy.login();
        }
        cy.wait('@login').then(res => {
          scope.token = res['response']['body']['access_token'];
        });
      });
    });
  });

  it('Shipments Page, Shipments Default Action - UF-108,109,110,111', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.contains('Shipment & Kits').click();

    cy.get('th:nth-child(2) div:nth-child(1)').invoke('text').should($txt => {
      expect($txt).to.contain('Shipment #');
    });

    cy.get('th:nth-child(3) div:nth-child(1)').invoke('text').should($txt => {
      expect($txt).to.contain('Quantity');
    });

    cy.get('th:nth-child(4) div:nth-child(1)').invoke('text').should($txt => {
      expect($txt).to.contain('Tracking');
    });

    cy.get('th:nth-child(5) div:nth-child(1)').invoke('text').should($txt => {
      expect($txt).to.contain('Take Action');
    });

    cy.get('th:nth-child(6) div:nth-child(1)').invoke('text').should($txt => {
      expect($txt).to.contain('More');
    });

    cy.get('tr td').eq(2).invoke('text').then($txt => {
      expect($txt).contain('10');
    });

    cy.get('tr td h6').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Requested');
    });

    cy.get('tr td h6').eq(1).invoke('text').then($txt => {
      expect($txt).contain('Shipped');
    });

    cy.get('tr td h6').eq(2).invoke('text').then($txt => {
      expect($txt).contain('Received');
    });

    cy.get('[data-testid = "vertMenu"] svg').eq(0).click();

    cy.get('#Shipment').invoke('text').then($txt => {
      expect($txt).contain('View Shipment Details');
    });

    cy.get('#Shipment').click();
    cy.contains('Done').click();
  });

  it('Shipment Assessment UF-116', () => {
    cy.contains('Receive Shipment').click();
    cy.get('.css-xxslal').parent().within($el => {
      cy.wrap($el).get('.css-xxslal').eq(0).invoke('text').then($txt => {
        scope.subjectId = $txt;
      });
    });

    cy.get('[role = "radiogroup"] > p').eq(1).click();
    cy.get('[role = "radiogroup"] > p').eq(3).click();
    cy.get('button[data-testid="shipment-receipt-tray-cancel"]').should('contain','Cancel');
    cy.get('button[data-testid="shipment-receipt-tray-confirm"]').should('contain', 'Confirm').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Assess Kits in Shipment Shipped');
      expect($txt).to.contain(':');
    });

    cy.get('.css-cc8tf1').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Kit #');
    });

    cy.get('.css-cc8tf1').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Lot #');
    });

    cy.get('.css-cc8tf1').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Expiry');
    });

    cy.get('.css-cc8tf1').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Kit Condition');
    });
  });
});