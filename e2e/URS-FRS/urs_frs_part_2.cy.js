
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

  it('Unblinding Visit Results - UF-95', () => {
    //Randomize
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
    cy.get('[data-testid="vertMenu"]').eq(0).click();

    cy.get("li[id='Randomize']").click({force: true});

    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();

    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid="rand-tray-response"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Unblind"]').click({force: true});
    cy.enterPin('1','2','3','4','5','6');
    cy.get('[data-testid = unblind-visit-confirm]').click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Unblind');
    });

    cy.get('[role="alert"] > div').invoke('text').should($txt => {
      expect($txt).to.contain('Subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain(' is randomized to treatment type:');
    });

    cy.get('.css-b0b8rp').invoke('text').should($txt => {
      expect($txt).to.contain('View Visit History');
    });

    cy.get('.css-96cu5 > th').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Visit');
    });

    cy.get('.css-96cu5 > th').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Date');
    });

    cy.get('.css-41qop6').eq(7).invoke('text').should($txt => {
      expect($txt).to.contain('Kit ID');
    });

    cy.get('.css-41qop6').eq(8).invoke('text').should($txt => {
      expect($txt).to.contain('Lot #');
    });

    cy.get('.css-41qop6').eq(9).invoke('text').should($txt => {
      expect($txt).to.contain('Expiry');
    });

    cy.get('.css-41qop6').eq(10).invoke('text').should($txt => {
      expect($txt).to.contain('Treatment Type');
    });

    cy.get('[data-testid=unblind-response]').click();
  });

  it('Visit Schedule Options - UF-59', () => {
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
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('#Randomize',{timeout: 10000}).click({force: true});
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.get('[role="alert"] div').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain(scope.subjectId);
    });
    cy.get('[data-testid="rand-tray-response"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Scheduled Visit"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Scheduled Visit');
    });

    cy.get('li[id="Unscheduled Visit"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Unscheduled Visit');
    });

    cy.get('li[id="Lost / Damaged Kit"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Lost / Damaged Kit');
    });

    cy.get('li[id="Unblind"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Unblind');
    });

    cy.get('li[id="Discontinue"] > p').invoke('text').should($txt => {
      expect($txt).to.contain('Discontinue');
    });

    cy.get('li[id="Discontinue"] > p').click();
  });
});