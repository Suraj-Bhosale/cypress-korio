describe('enrollment spec', () => {
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
      cy.getAccessToken(scope);
      cy.verifyStudyEnrollName(scope);
    });

    it('Verify New Screen Subject creation. Jira PLT-450, PLT-451', () => {
      cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
      cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
      cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
      cy.clickEnrollStudy(scope);
      cy.enrollNewSubject(scope);

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
        expect($txt).to.contain('Enrolled');
      });
      cy.get('[data-colindex = "1"]').should(data => {
        expect(data).to.contain('PQ');
      });
      cy.get('[data-colindex= "0"]').invoke('text').should('not.be.empty');
      cy.get('[data-colindex= "2"]').invoke('text').should('not.be.empty');
      cy.get('[data-colindex= "3"]').invoke('text').should(data => {
        expect(data).to.contain('Male');
      });
      cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
        expect($txt).to.contain('Enrolled');
      });
      cy.get('[data-colindex= "5"]').invoke('text').should('not.be.empty');
      cy.get('[data-colindex= "5"] > div > div').eq(1).invoke('text').should($txt => {
        expect($txt).to.contain('future');
      });

      cy.get('[data-testid="CircleIcon"]').invoke('css', 'color')
        .should('equal', 'rgb(76, 175, 80)');

      cy.get('input[type$="search"]').clear();
    });

  });