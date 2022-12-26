describe('URS_FRS 10 spec', () => {
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

  it('Subject management grid - UF-78', () => {
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

    cy.get('[data-colindex = "1"]').should(data => {
      expect(data).to.contain('PQ');
    });

    cy.get('[data-colindex= "0"]').invoke('text').should('not.be.empty');
    cy.get('[data-colindex= "2"]').invoke('text').should('not.be.empty');
    cy.get('[data-colindex= "3"]').invoke('text').should(data => {
      expect(data).to.contain('Male');
    });

    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Screened');
    });
    
    cy.get('[data-colindex= "5"]').invoke('text').should('not.be.empty');
    cy.get('[data-colindex= "5"] > div > div').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('future');
    });

    cy.get('[data-testid="CircleIcon"]').invoke('css', 'color').should('equal', 'rgb(76, 175, 80)');
  });

  it('Visit History - UF-83', () => {

    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('#Randomize',{timeout: 10000}).click({force: true});

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.contains('Done').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('button[value="Scheduled Visit"]',{timeout: 10000}).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.contains('Show all visits').click();

    cy.get('.css-1u755n2').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Visit History');
    });

    cy.get('.css-96cu5 > th').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Visit');
    });

    cy.get('.css-96cu5 > th').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Date');
    });

    cy.get('.css-96cu5 > th').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Type');
    });

    cy.get('.css-96cu5 > th').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Kit(s)');
    });

    cy.get('.css-96cu5 > th').eq(4).invoke('text').should($txt => {
      expect($txt).to.contain('Recorded By');
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);    
    cy.get('td:nth-child(1)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(2)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(3)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(4)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(5)').invoke('text').should('not.be.empty');

  });

  it('Scheduled Visits Details - UF-88', () => {
    cy.contains('Hide all visits').click();
    cy.contains('Last Visit').invoke('text').should($txt => {
      expect($txt).to.contain('Last Visit');
    });

    cy.get('.css-96cu5 > th').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Visit');
    });

    cy.get('.css-96cu5 > th').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Date');
    });

    cy.get('.css-96cu5 > th').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Type');
    });

    cy.get('.css-96cu5 > th').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Kit(s)');
    });

    cy.get('.css-96cu5 > th').eq(4).invoke('text').should($txt => {
      expect($txt).to.contain('Recorded By');
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('td:nth-child(1)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(2)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(3)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(4)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(5)').invoke('text').should('not.be.empty');
  });

  it('Scheduled Visits Results - UF-89', () => {
    cy.get('button[data-testid="sched-visit-confirm"]').should('contain', 'Confirm').click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    cy.contains('View Visit History').should('be.visible');
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully assigned 3 Kits to ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('[data-test-id= "kit-details-0"]').invoke('text').should('not.be.empty');
    cy.get('[data-test-id= "kit-details-1"]').invoke('text').should('not.be.empty');
    cy.get('[data-test-id= "kit-details-2"]').invoke('text').should('not.be.empty');

    cy.get('[data-testid=visit-recording-response]').should($txt => {
      expect($txt).to.contain('Done');
    });

    cy.get('[data-testid=visit-recording-response]').click();
  });

  it('Discontinuation / Early Termination Visit Details - UF-97', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get("li[id='Discontinue']").click({force: true});

    cy.get('[role="alert"] div').invoke('text').should($txt => {
      expect($txt).to.contain('This action will disqualify the subject from further study participation');
    });

    cy.get('.css-96cu5 > th').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Visit');
    });

    cy.get('.css-96cu5 > th').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Date');
    });

    cy.get('.css-96cu5 > th').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Visit Type');
    });
  
    cy.get('.css-96cu5 > th').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Kit(s)');
    });

    cy.get('.css-96cu5 > th').eq(4).invoke('text').should($txt => {
      expect($txt).to.contain('Recorded By');
    });

    cy.contains('Show all visits').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('td:nth-child(1)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(2)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(3)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(4)').invoke('text').should('not.be.empty');
    cy.get('td:nth-child(5)').invoke('text').should('not.be.empty');
    cy.get('[data-testid = discontinue-visit-confirm]').click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('You are about to discontinue this subject. This action will disqualify the subject from further study participation.');
    });
  });

  it('Discontinuation / Early Termination Visit Results - UF-98', () => {
    cy.contains('View Visit History').click();
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully changed the status of this ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(' to ');
    });

    cy.get('[datatest-id = "status-chip"] span').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Discontinued');
    });
  });
});