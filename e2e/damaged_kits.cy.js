describe('empty spec', () => {
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

  it('Lost/Damaged Kit Replacement - Tray. PLT-162, PLT-160, PLT-257,PLT-152', () => {
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
    //Create subjects
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
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('#Randomize',{timeout: 10000}).click({force: true});
    cy.get('[role="radiogroup"] span').eq(0).click({force: true});
    cy.get('[data-testid="rand-tray-cancel"]').eq(0).click({force: true});
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get("li[id='Randomize']").click({force: true});
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click({ force: true});
    cy.get('.MuiDialogActions-spacing button').eq(0).click({ force: true});
    cy.get('[data-testid="rand-tray-cancel"]').click({ force: true});
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get("li[id='Randomize']").click({force: true});
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.get('[data-testid="rand-tray-response"]').click({ force: true});

    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[id="Lost / Damaged Kit"]').click();
    cy.get('#lostDamagedActionBox > div > h6').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
      });

    cy.get('#lostDamagedActionBox > div > p').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('You are about to report assigned ');
      expect($txt).to.contain('kit');
      expect($txt).to.contain('(s) to ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain('’s for Protocol');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain(' as lost or damaged.');
    });

    cy.get('#lostDamagedActionBox > div > p').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('After confirming your intent, appropriate study personnel will be notified of this action.');
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

    cy.get('.css-1c8hbgw').invoke('text').should($txt => {
      expect($txt).to.contain('Show all visits');
    });

    cy.get('[data-testid="lost-damaged-visit-cancel"]').invoke('text').should($txt => {
      expect($txt).to.contain('Cancel');
    });

    cy.get('[data-testid="lost-damaged-visit-confirm"]').invoke('text').should($txt => {
      expect($txt).to.contain('Confirm');
    });
    cy.get('button[data-testid="lost-damaged-visit-cancel"]').should('contain','Cancel');
    cy.get('button[data-testid="lost-damaged-visit-confirm"]').should('contain', 'Confirm').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('input[type="checkbox"]').eq(1).click();

    cy.get('button[data-testid="assignedList-confirm"]').should('contain', 'Confirm').click();
    //No, Cancel
    cy.log('No, Cancel');
    cy.get('.css-10cj156').click({ force: true});

    cy.get('button[data-testid="assignedList-confirm"]').should('contain', 'Confirm').click();
    //Yes,I'm sure
    cy.log("Yes, I'm Sure");
    cy.get('[role="dialog"] [type="submit"]').click();
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully reported 1 Kits as lost or damaged and assigned 1 Kits to');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
      });

    cy.get('[data-testid="visit-recording-response"]').click();
  });
  });