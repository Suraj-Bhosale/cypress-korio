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

    cy.visitPageAndClearCookies(scope.baseUrl);
    cy.getAccessToken(scope);
    cy.verifyStudyName(scope);
  });

  it('Verify New Screen Subject creation. Jira PLT-148, PLT-147, PLT-158, PLT 174, PLT 175', () => {
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

    cy.get('[data-testid="CircleIcon"]').invoke('css', 'color')
      .should('equal', 'rgb(76, 175, 80)');
    
  });

  it('Subject eligible actions: Vertical Menu Logic. PLT 168', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('#Subject').should(subjectText => {
      expect(subjectText).to.contain('View Subject Details');
    });
    cy.get('.css-16umtot h6').eq(0).should(visitText => {
      expect(visitText).to.contain('Visit');
    });
    cy.get('[role="menuitem"] p').eq(1).should(scheduledVisitText => {
      expect(scheduledVisitText).to.contain('Scheduled Visit');
    });
    cy.get('.css-16umtot h6').eq(1).should(statusChange => {
      expect(statusChange).to.contain('Status Change');
    });
    cy.get('#Randomize p').should(randomizeText => {
      expect(randomizeText).to.contain('Randomize');
    });
  });

  it('Randomize Feature. PLT-150, PLT-202, PLT-208', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects/*/visits`).as('visits');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/subjects/*/randomize`).as('randomize');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('#Randomize').click({force: true});
    cy.get('[data-testid="visit-row"] td').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('1');
    });
    
    // uncomment when https://korioclinical.atlassian.net/browse/PLT-376 fixed
    // cy.get('[data-testid="visit-row"] td').eq(1).invoke('text').should($txt => {
      // let todaysDate = (dayjs().format('DD MMM YYYY'));
      // expect($txt).to.contain(todaysDate);
    // });

    cy.get('[data-testid="visit-row"] td').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('N/A');
    });

    cy.get('[data-testid="visit-row"] td').eq(4).invoke('text').should('not.be.empty');

    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });
    cy.get('[data-testid="last-visit-type"]').invoke('text').should($txt => {
      expect($txt).to.contain('Screening');
    });
    cy.get('[role="radiogroup"] span').eq(0).click({force: true});
    cy.get('[data-testid="rand-tray-cancel"]').eq(0).click({force: true});

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Screened');
    });
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('#Randomize',{timeout: 10000}).click({force: true});
    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(0).click();
    cy.get('[data-testid="rand-tray-cancel"]').click();
    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Screened');
    });

    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('#Randomize',{timeout: 10000}).click({force: true});

    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

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
    cy.get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
      expect($txt).to.contain('Randomized');
    });


    scope['listOfKits'] = [];
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
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[data-test-id="kit-details-0"] p').invoke('text').then($txt => {
        scope['listOfKits'].push($txt);
      });
      cy.get('[data-test-id="kit-details-1"] p').invoke('text').then($txt => {
        scope['listOfKits'].push($txt);
      });
      cy.get('[data-test-id="kit-details-2"] p').invoke('text').then($txt => {
        scope['listOfKits'].push($txt.trim());
      });
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
  });

  it('Verify kits belong to proper study', () => {
    let counter = 0;
    cy.fixture('kitslist.json').then(list => {

      scope['listOfKits'].forEach(listItemFromWeb => {
        list.forEach(element => {
          if(element['KitNumber'] === listItemFromWeb.trim()) {
            counter++;
          }
        });
      });
      scope['listOfKits'] = [...new Set(scope['listOfKits'])];
      expect(counter).to.eq(12);
    });
  });

  it('Unscheduled Feature - PLT-153, PLT-245, PLT-154, PLT-246, PLT 388', () => {
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

    //Scheduled Visit-PLT 388, 389
    cy.get('button[value="Scheduled Visit"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.contains('Show all visits').click();

    cy.get('th:last-child').invoke('text').should($txt => {
      expect($txt).not.to.contain('Edit');
    });

    cy.get('tbody tr:nth-child(1) td:nth-child(4)').invoke('text').should($txt => {
      expect($txt).to.contain('N/A');
    });

    cy.get('tbody tr:nth-child(2) td:nth-child(4)').invoke('text').should($txt => {
      expect($txt).not.to.contain('N/A');
    });

    cy.get("button[type='submit']").click();

    //Unscheduled Visit
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
  
     cy.get('li[id="Unscheduled Visit"]',{timeout: 10000}).click({force: true});

     cy.get('.css-1xsto0d').should('contain','This visit is outside of the scheduled visit window specified by the study’s protocol');

     cy.get('#unscheduledVisitBox > div > h6').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
     });

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

    cy.get('.css-opnjyp').invoke('text').should($txt => {
      expect($txt).to.contain('Please assign the ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(' the following');
      expect($txt).to.contain('kit');
      expect($txt).to.contain('(s):');
    });

    cy.get('.css-y5jx4v').invoke('text').should($txt => {
      expect($txt).to.contain('The ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain("'s next expected visit is");
    });

    cy.get('.MuiTypography-inherit').should($txt => {
      expect($txt).to.contain('View Visit History');
    });

    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Unscheduled Visit');
    });
    
    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.get('[data-testid=visit-recording-response]').should($txt => {
      expect($txt).to.contain('Done');
    });
    cy.contains('Close').click({ force: true});

    //Unscheduled visit dispensation
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
  
    cy.get('li[id="Unscheduled Visit"]').click({force: true});

    cy.get('.css-1xsto0d').should('contain','This visit is outside of the scheduled visit window specified by the study’s protocol');

    cy.get('#unscheduledVisitBox > div > h6').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
    });
    cy.get('button[type="submit"]').click();
    cy.get('.css-10cj156').click({ force: true});

    cy.contains('Close').click({ force: true});
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get("li[id='Unscheduled Visit']").click({force: true});
    cy.get("button[type='submit']").click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
  });

  it('Unblinding Feature - PLT-252, PLT-161, PLT-253, PLT-258, PLT-155, PLT-398', () => {

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
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('#Randomize').click({force: true});
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

    //Unblinding Flow - Tray
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get("li[id='Unblind']").click({force: true});
    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
    expect($txt).to.contain('BioPab');
    expect($txt).to.contain('Study XYZ567');
    expect($txt).to.contain('Site 1');
  });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Unblind');
    });
    
    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });
     cy.get('.css-1xsto0d').should('contain','Unblinding will deactivate this subject and prevent further subject dispensation visits in this study.');

     cy.get('#unblindVisitBox > div > h6').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
     });

     cy.get('#unblindVisitBox > div > p').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('You are about to reveal what treatment type has been assigned to ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain(' for protocol');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('.');
    });

    cy.get('#unblindVisitBox > div > p').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain("After confirming your intent to unblind, the subject's treatment will be revealed to you.");
    });

    cy.get('#unblindVisitBox > div > p').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Appropriate study personnel will be notified of this action.');
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

    cy.get('.css-1tmn5yy').invoke('text').should($txt => {
      expect($txt).to.contain('Show all visits');
    });

    cy.get('[data-testid = unblind-visit-cancel]').invoke('text').should($txt => {
      expect($txt).to.contain('Cancel');
    });

    cy.get('[data-testid = unblind-visit-confirm]').invoke('text').should($txt => {
      expect($txt).to.contain('Confirm');
    });

    //Unblinding Flow - PIN
    cy.get('[data-testid = unblind-visit-confirm]').should('be.disabled');
    cy.enterPin('1','2','3','4','5','6');
    cy.contains('Forgot your PIN?').should('be.visible');
    cy.get('[data-testid = unblind-visit-confirm]').focus().should('be.visible');
    cy.get('[data-testid = unblind-visit-cancel]').focus().should('contain','Cancel');
    cy.get('button[type="submit"]').should('contain', 'Confirm');

     //Unblinding - PIN Validation
    cy.get('[data-testid = unblind-visit-confirm]').focus().click();
    cy.get('.css-10cj156').click({ force: true});
    cy.contains('Close').click({ force: true});
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('li[id="Unblind"]').click({force: true});

    //PLT-398
    cy.enterPin('1','1','1','1','1','1');
    cy.get('[data-testid = unblind-visit-confirm]').focus().click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    cy.get('#unblindVisitBox p').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Could not record unblinding visit for the current subject.');
    });

    cy.enterPin('1','2','3','4','5','6');
    cy.get('[data-testid = unblind-visit-confirm]').focus().click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    //After clicked ‘Yes, I’m Sure’ button, then the Randomization treatment type, visit history, and dispensation history (1 row per kit) are displayed.
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

    cy.get('.css-1qbwc7x').invoke('text').should($txt => {
      expect($txt).to.contain('The appropriate study personnel have been notified. No further action is required at this time.');
    });

    //Unblinding Flow - Done
    cy.get('[data-testid= "unblind-response"]').invoke('text').should($txt => {
      expect($txt).to.contain('Done');
    });
    cy.get('[data-testid= "unblind-response"]').click();
  });

  it('Discontinue Feature - PLT-156, PLT- 254, PLT-255', () => {
    //Create subjects
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.createSubject(scope);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get('#Randomize').click({force: true});
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

    //Discontinue Flow - Tray
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get("li[id='Discontinue']").click({force: true});
    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Discontinue');
    });
    
    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.get('.css-1xsto0d').should('contain','This action will disqualify the subject from further study participation');

    cy.get('#unscheduledVisitBox > div > h6').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
      });

      cy.get('#unscheduledVisitBox > div > p').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('You are about to discontinue ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain('’s participation in protocol');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('.');
    });

    cy.get('#unscheduledVisitBox > div > p').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Taking this action will change ');
      expect($txt).to.contain('subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain('’s status from ');
      expect($txt).to.contain('to');
      expect($txt).to.contain('.');
    });

    cy.get('#unscheduledVisitBox > div > p  >div > span').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Randomized');
    });

    cy.get('#unscheduledVisitBox > div > p  >div > span').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Discontinued');
    });

    cy.get('#unscheduledVisitBox  > div > p').eq(2).invoke('text').should($txt => {
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
  
    cy.get('[data-testid = discontinue-visit-cancel]').invoke('text').should($txt => {
      expect($txt).to.contain('Cancel');
    });

    cy.get('[data-testid = discontinue-visit-confirm]').invoke('text').should($txt => {
      expect($txt).to.contain('Confirm');
    });

    //Discontinue Flow - Confirm and Cancel
    //Click ‘No, Cancel’
    cy.get('[data-testid = discontinue-visit-confirm]').click();
    cy.get('.css-10cj156').click({ force: true});

    cy.contains('Close').click({ force: true});
    cy.get('[data-testid="vertMenu"]').eq(0).click({ force: true});
    cy.get("li[id='Discontinue']").click({force: true});
    cy.get('[data-testid = discontinue-visit-confirm]').click();

    //click ‘Yes, I’m Sure’ 
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Discontinue');
    });
    
    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
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

    cy.get('.css-b0b8rp').invoke('text').should($txt => {
      expect($txt).to.contain('View Visit History');
    });

    cy.get('.css-opnjyp').invoke('text').should($txt => {
      expect($txt).to.contain('Subject');
      expect($txt).to.contain(scope.subjectId);
      expect($txt).to.contain('is no longer an active participant in this study.');
    });

    cy.get('.css-317fuh').invoke('text').should($txt => {
      expect($txt).to.contain('The appropriate study personnel have been notified. No further action is required at this time.');
    });

    cy.get('[data-testid= "rand-tray-response"]').invoke('text').should($txt => {
      expect($txt).to.contain('Done');
    });
    cy.get('[data-testid= "rand-tray-response"]').click();
  });

  it('Screen fail - Tray. PLT-384', () => {
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
    cy.verifyTextWithIndex('[role="menuitem"]',3, 'Screen Failed');
    cy.waitForElementwithIndexClick('[role="menuitem"]',3);
    cy.waitForElementAndClick('[data-testid="screenfail-visit-confirm"]');
    //Yes,I'm sure
    cy.log("Yes, I'm Sure");
    cy.get('[role="dialog"] [type="submit"]').click();
  });
});