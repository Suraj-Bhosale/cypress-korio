describe('URS_FRS 11 spec', () => {
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

  it('Completion Visit Details - UF-100', () => {
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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.contains('Done').click();

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
     cy.get('.css-1u755n2').eq(0).invoke('text').should($txt => {
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
 
     cy.get('[data-testid="complete-visit-confirm"]').click();
     cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
       expect($txt).to.contain('Are you sure you want to take this action?');
     });
 
     cy.get('[role="dialog"] div p').invoke('text').should($txt => {
       expect($txt).to.contain('You are about to complete this subject. Completing a subject removes the ability to assign further kits.');
     });
 
     cy.get('[role="dialog"] [type="submit"]').click({ force: true});
  });

  it('Completion Visit Results - UF-101', () => {
    cy.contains('View Visit History').should('be.visible');

    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Thank you. The subject's completion of the study has been recorded.`);
    });
  });

  it('Lost / Damaged Visit Details - UF-103', () => {
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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.contains('Done').click();

    //Lost/Damage Flow
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Lost / Damaged Kit"]',{timeout: 10000}).click({force: true});

    cy.get('.css-1xsto0d').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Reporting Kit(s) as lost or damaged will assign new Kit(s) to subject as replacement');
    });

    cy.get('.css-1u755n2').eq(0).invoke('text').should($txt => {
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

    cy.get('button[data-testid="lost-damaged-visit-confirm"]').should('contain', 'Confirm').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

  });

  it('Lost / Damaged Visit Selection, Lost / Damaged Visit Confirmation - UF-104,105', () => {
    cy.get('input[type="checkbox"]').eq(1).click();
    cy.get('.MuiTableContainer-root > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > .css-1w1xt5v').eq(0).invoke('text').then($text => {
      cy.wrap($text).as('kitID');
    });
    cy.get('@kitID').then(kitID => {
      cy.get('.css-1xsto0d').eq(1).invoke('text').should($txt => {
        expect($txt).to.contain(`Kit(s) ${kitID} will be reported as lost or damaged`);
      });
    });

    cy.get('[data-testid=assignedList-confirm]').click();

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Are you sure you want to take this action?');
    });
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
  });

  it('Lost / Damaged Visit Results - UF-106', () => {
    //Lost Flow - Success
    cy.contains('View Visit History').should('be.visible');
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully reported 1 Kits as lost or damaged and assigned 1 Kits to');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('.css-16kxaf8').should('be.exist');
    cy.get('[data-testid=visit-recording-response]').should($txt => {
      expect($txt).to.contain('Done');
    });

    cy.get('[data-testid=visit-recording-response]').click();
  });
});