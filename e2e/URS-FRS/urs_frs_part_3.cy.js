
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

  it('Subject Statuses - UF-60', () => {
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

    cy.get('#Randomize',{timeout: 10000}).click({force: true});

    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid="rand-tray-response"]').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Randomized');
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    for(let i = 0; i<4; i++) {
      cy.get('button[value="Scheduled Visit"]').invoke('text').should($txt => {
        expect($txt).to.contain('Scheduled Visit');
      });
      
      cy.get('button[value="Scheduled Visit"]').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[data-testid="last-visit-type"]').invoke('text').should($txt => {
        if(i===0) {
          expect($txt).to.contain('Randomization');
        } else {
            expect($txt).to.contain('Scheduled Visit');
          }
       });
      cy.get('[data-testid="sched-visit-confirm"]').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.get('.css-10cj156').click({ force: true});
      cy.get('[data-testid="sched-visit-confirm"]').click();
      cy.get('[role="dialog"] [type="submit"]').click();
      cy.get('[data-testid="visit-recording-response"]').click();
    };
 
    cy.get('button[value="Complete"]').invoke('text').should($txt => {
      expect($txt).to.contain('Complete');
    });
    cy.get('button[value="Complete"]').click();
  
    cy.get('#unscheduledVisitBox [datatest-id="status-chip"]').eq(0).should($txt => {
      expect($txt).to.contain('Randomized');
    });
    cy.get('#unscheduledVisitBox [datatest-id="status-chip"]').eq(1).should($txt => {
      expect($txt).to.contain('Completed');
    });
    cy.get('[data-testid="complete-visit-confirm"]').click();
    cy.get('[role="dialog"] [type="submit"]').click();
    cy.get('[data-testid="rand-tray-response"]').click();
   // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Completed');
    });

    //Discontinued
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
    cy.get("li[id='Discontinue']").click({force: true});
    cy.get('[data-testid = discontinue-visit-confirm]').click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid= "rand-tray-response"]').click();
 
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Discontinued');
    });
  });
});
