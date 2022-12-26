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
          cy.loginSupplyManager();
        }
        cy.wait('@login').then(res => {
          scope.token = res['response']['body']['access_token'];
        });
      });
    });
  });

  it('Depot Details - UF-130', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('ul > div:nth-child(6) > div').click();
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});

    cy.get('#Depot').click();

    cy.get('.css-mjt1fr').invoke('text').should($txt => {
      expect($txt).to.contain('Study XYZ567');
    });

    cy.get('[data-colindex = "0"] > a').eq(0).invoke('text').then($txt => {
       scope.depotNo = $txt;
    });

    cy.get('.css-87d3iw').invoke('text').should($txt => {
      expect($txt).to.contain(`Depot ${scope.depotNo}`);
    });

    cy.get('.css-1gu9xq').invoke('text').should($txt => {
      expect($txt).to.contain('Depot Details');
    });

    cy.get('ul li div span').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Status');
    });

    cy.get('ul li div span').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Location');
    });

    cy.get('ul li div span').eq(4).invoke('text').should($txt => {
      expect($txt).to.contain('Contact');
    });

    cy.get('ul li div span').eq(5).invoke('text').should($txt => {
      expect($txt).to.contain('Shipping to');
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[role="columnheader"]').eq(6).invoke('text').should($txt => {
      expect($txt).to.contain('Kit Type');
    });

    cy.get('[role="columnheader"]').eq(7).invoke('text').should($txt => {
      expect($txt).to.contain('Available');
    });

    cy.get('[role="columnheader"]').eq(8).invoke('text').should($txt => {
      expect($txt).to.contain('Unavailable');
    });

    cy.get('[role="columnheader"]').eq(9).invoke('text').should($txt => {
      expect($txt).to.contain('Quarantined');
    });

    cy.get('[role="columnheader"]').eq(10).invoke('text').should($txt => {
      expect($txt).to.contain('Damaged');
    });

    cy.get('[role="columnheader"]').eq(11).invoke('text').should($txt => {
      expect($txt).to.contain('Expired');
    });

    cy.get('[role="columnheader"]').eq(12).invoke('text').should($txt => {
      expect($txt).to.contain('Lost');
    });

    cy.contains('Close').click();
  });

  it('Depot Report Download - UF-131', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('ul > div:nth-child(6) > div').click();
    cy.get('[data-testid="vertMenu"]').eq(0).click();

    cy.get('#Depot').click();

    cy.get('.css-mjt1fr').invoke('text').should($txt => {
      expect($txt).to.contain('Study XYZ567');
    });

    cy.get('[data-colindex = "0"] > a').eq(0).invoke('text').then($txt => {
       scope.depotNo = $txt;
    });

    cy.contains('Close').click();
  });

  it('Add Countries - UF-132', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('ul > div:nth-child(8) > div').click();
    cy.get('[data-testid = "new-depot-btn"]').click({ force: true});

    cy.get('.css-1o0en0j').click();
    cy.contains('Canada').click();
    cy.get('button[type="submit"]').click({ force: true});
    cy.get('button[type="submit"]').eq(1).click({ force: true});
    cy.get('button[type="submit"]').eq(0).click({ force: true});
  });

  it('Associate depots to countries - UF-133', () => {
    cy.get('ul > div:nth-child(6) > div').click();
    cy.get('.css-1b7ibh7').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('depots');
    });

    cy.get('.css-1b7ibh7').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('sites');
    });

    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('[data-testid$="new-depot-btn"]').invoke('text').should($txt => {
      expect($txt).to.contain('New Depot');
    });

    cy.get('.css-f16u1x').invoke('text').should($txt => {
      expect($txt).to.contain('Download Report');
    });

    cy.get('[data-field = "depotStatus"]').invoke('text').should($txt => {
      expect($txt).to.contain('Active');
    });
    cy.get('[id = "Depot"]').invoke('text').should($txt => {
      expect($txt).to.contain('View Depot Details');
    });

    cy.get('[id = "Deactivate Depot"]').invoke('text').should($txt => {
      expect($txt).to.contain('Deactivate Depot');
    });

    cy.get('[id = "Depot"]').click({ force: true});
    cy.contains('Close').click();
  });
});