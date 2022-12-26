
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

  it('Confirmation message, - Pre, Confirmation message - Post - UF-65,66', () => {
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

    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('You are about to randomize this subject and assign kits.');
    });

    //Randomize Success Message
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    cy.get('[data-testid=rand-tray-response]').should($txt => {
      expect($txt).to.contain('Done');
    });

    cy.get('[data-testid="rand-tray-response"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    //Unscheduled Visit
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Unscheduled Visit"]',{timeout: 10000}).click({force: true});
    cy.get("button[data-testid='unsched-visit-cancel']").should('contain','Cancel');
    cy.get("button[type='submit']").should('contain', 'Confirm');

    //Unscheduled Visit Success Message
    cy.get("button[type='submit']").click();
    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully assigned 3 Kits to');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('[data-testid=visit-recording-response]').should($txt => {
      expect($txt).to.contain('Done');
    });

    cy.get('[data-testid=visit-recording-response]').click();

    //Lost/Damage Flow
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Lost / Damaged Kit"]',{timeout: 10000}).click({force: true});
    cy.get('button[data-testid="lost-damaged-visit-confirm"]').should('contain', 'Confirm').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('input[type="checkbox"]').eq(1).click();
    cy.get('[data-testid=assignedList-confirm]').click();

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    //Lost Flow - Success
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully reported 1 Kits as lost or damaged and assigned 1 Kits to');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('[data-testid=visit-recording-response]').should($txt => {
      expect($txt).to.contain('Done');
    });

    cy.get('[data-testid=visit-recording-response]').click();

    //Scheduled Visit
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Scheduled Visit"]',{timeout: 10000}).click({force: true});

    cy.get('button[data-testid="sched-visit-confirm"]').should('contain', 'Confirm').click();

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('You are about to record a scheduled visit for this subject and assign kits for dispensation.');
    });

    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully assigned 3 Kits to ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('[data-testid=visit-recording-response]').should($txt => {
      expect($txt).to.contain('Done');
    });

    cy.get('[data-testid=visit-recording-response]').click();

    //Completed
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    for(let i = 0; i<3; i++) {
      cy.get('button[value="Scheduled Visit"]').invoke('text').should($txt => {
        expect($txt).to.contain('Scheduled Visit');
      });
      
      cy.get('button[value="Scheduled Visit"]').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[data-testid="last-visit-type"]').invoke('text').should($txt => {
        if(i===0) {
          expect($txt).to.contain('Scheduled Visit');
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
    cy.get('[data-testid="complete-visit-confirm"]').click();
    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('You are about to complete this subject. Completing a subject removes the ability to assign further kits.');
    });

    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid="rand-tray-response"]').click();

    //Unblinding Flow 
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get("li[id='Unblind']").click({force: true});
    cy.get('[data-testid = unblind-visit-confirm]').should('be.disabled');
    cy.enterPin('1','2','3','4','5','6');
    cy.get('button[type="submit"]').should('contain', 'Confirm').click();

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('Unblinding will deactivate this subject and prevent further subject dispensation visits in this study.');
    });

    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    cy.get('[role="alert"] > div').invoke('text').should($txt => {
      expect($txt).to.contain('Subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain(' is randomized to treatment type:');
    });

    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid= "unblind-response"]').invoke('text').should($txt => {
      expect($txt).to.contain('Done');
    });
    cy.get('[data-testid= "unblind-response"]').click();

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

    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Screened');
    });

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

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('You are about to discontinue this subject. This action will disqualify the subject from further study participation.');
    });

    //Discontinue Flow - Success
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully changed the status of this ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(' to ');
    });

    cy.get('[role="alert"] > div  >div >span').invoke('text').should($txt => {
      expect($txt).to.contain('Discontinued');
    });
    cy.get('[data-testid= "rand-tray-response"]').click();
  });
});