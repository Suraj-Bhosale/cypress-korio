describe('Shipments & Kits', () => {
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
    cy.get('.css-1nmt8ps > p').eq(1).click();
    cy.get('.css-1nmt8ps > p').eq(1).click();
    cy.get('.css-gaxyvd > ul > li').click();
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


  it('Verify UI Flow for Kits - Page Area. Jira PLT-307, PLT-301, PLT-303, PLT-302, PLT-304', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('div > h2').should($h5 => {
        expect($h5).to.contain('BioPab');
    });
    cy.get('ul > div:nth-child(7) > div').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);

    cy.get('.css-1b7ibh7').eq(1).click();
    cy.viewport(1280, 800);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder$="Filter value"]').type('Expired');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');
    cy.get('[data-testid="MoreVertIcon"]').eq(0).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
    Cypress.on('uncaught:exception', (err) => {
      /* returning false here prevents Cypress from failing the test */
      if (resizeObserverLoopErrRe.test(err.message)) {
          return false;
      }
    });
    cy.get('[id$="Update Expiration"]').click();

    cy.get('div a').eq(0).invoke('text').then(text => {
      cy.wrap(text).as('kitId');

    });

    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });


    cy.get('@kitId').then(kitId => {
      cy.get('.css-gkco4w').invoke('text').then($txt => {
        expect($txt).contain(`Please confirm the new expiration date for Kit ${kitId} is accurate.`);
      });
    });

    cy.get('.css-dyfjrv').invoke('text').then($txt => {
      expect($txt).contain('Confirm your intent');
    });

    cy.get('.css-1scsav1').click();

    // click 'No, Cancel'

    cy.get('.css-10cj156').click();

    cy.get('.css-1scsav1').click();

    // click on I'm, Sure
    cy.get('.css-1vqdciu').click();

    cy.get('@kitId').then(kitId => {
      cy.get('.css-1xsto0d').invoke('text').then($txt => {
        expect($txt).contain(`You have successfully updated the expiration date for Kit ${kitId}.`);
      });
    });
    cy.get('.css-1p39f1q').click();
  });


  it('Verify UI Flow for Kits - Page Area. Jira PLT-300, PLT-306, PLT-303, PLT-305', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);

    cy.get('div > h2').should($h2 => {
      expect($h2).to.contain('BioPab');
    });

    cy.get('ul > div:nth-child(7) > div').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('.css-1b7ibh7').eq(1).click();

    //Expiry Statuses
    //No,Cancel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-14ky8rb').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-1vqdciu').click();
    cy.get('.css-10cj156').eq(1).click();
    cy.get('.css-10cj156').eq(0).click();

    //Yes, I Confirm
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-14ky8rb').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-1vqdciu').click();
    cy.get('.css-1vqdciu').eq(1).click();
  });
});