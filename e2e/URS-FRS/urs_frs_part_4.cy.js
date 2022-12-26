
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

  it('Default Subject actions - UF-61', () => {
    cy.contains('All Studies').click();
    cy.request({
      url: `${scope.apiUrl}/v1/Studies`,
      headers: {
        authorization: `Bearer ${scope.token}`,
      }
    }).then((resp) => {
      scope.amountOfStudies = resp['body']['userStudies'].length;
      cy.log(scope.amountOfStudies);
      resp['body']['userStudies'].forEach(element => {
      if(element['studyName'] === 'Study XYZ567') {
        scope.subjectStudyXYZ567 = element['studyName'];
      }
      });
      expect(resp.status).to.eq(200);
    });

    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.createSubject(scope);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Screened');
    });

    cy.get('[data-testid="vertMenu"]').eq(0).click();

    cy.get('#Subject').invoke('text').should($txt => {
      expect($txt).to.contain('View Subject Details');
    });

    cy.get('li[id="Scheduled Visit"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Scheduled Visit');
    });

    cy.get('li[id="Randomize"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Randomize');
    });

    cy.get('li[id="Screen Failed"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Screen Failed');
    });

    cy.get('li[id="Randomize"] > p').click();
  });    

  it('Secondary subject actions - UF-62, UF-63', () => {

    cy.get('.css-1w6at85').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Visits');
    });

    cy.get('.css-1w6at85').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Status Change');
    });
  });
});