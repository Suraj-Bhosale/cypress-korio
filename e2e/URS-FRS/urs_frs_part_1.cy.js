import dayjs from 'dayjs';

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

  it('Subject Information - UF-72,73,74,75', () => {
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
    cy.visit(scope.baseUrl);
    cy.contains('All Studies').click();
    cy.wait('@studies');
    cy.get('div:nth-child(2) > div:nth-child(1) > h6:nth-child(1)').eq(0).invoke('text').then($txt => {
      expect($txt).to.contain('Expected Visits');
    });

    cy.get('div:nth-child(2) > h6:nth-child(1)').eq(0).invoke('text').then($txt => {
      expect($txt).to.contain('Expected Shipments');
    });

    cy.get('div:nth-child(1) > h4:nth-child(2)').eq(0).invoke('text').then($txt => {
      expect($txt).to.contain('3 subjects are scheduled for a visit this week');
    });

    cy.get('div:nth-child(1) > h6:nth-child(3)').eq(0).invoke('text').then($txt => {
      expect($txt).to.contain('1 subjects missed their scheduled visit.');
    });

    cy.get('div:nth-child(2) > h4:nth-child(2)').eq(0).invoke('text').then($txt => {
      expect($txt).to.contain('3 shipments expected to arrive this week');
    });
  });

  it('Randomization details - UF-85', () => {
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
    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Randomize');
    });

    cy.get('.css-1u755n2').invoke('text').should($txt => {
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

    cy.get('.css-1c8hbgw').invoke('text').should($txt => {
      expect($txt).to.contain('Show all visits');
    });

    cy.get('#question-1').invoke('text').should($txt => {
      expect($txt).to.contain('Does the subject exercise each day?');
    });

    cy.get('#question-2').invoke('text').should($txt => {
      expect($txt).to.contain('Enter the subjects weight range in kg.');
    });

    cy.get('#stratificationQuestionBox > div > h6').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
     });

    cy.get('#stratificationQuestionBox > div > p').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('After confirming, you will be provided a list of kit(s) to dispense to the subject.');
    });

    cy.get('[data-testid = rand-tray-cancel]').invoke('text').should($txt => {
      expect($txt).to.contain('Cancel');
    });

    cy.get('[data-testid = rand-tray-confirm]').invoke('text').should($txt => {
      expect($txt).to.contain('Confirm');
    });
  });

  it('Randomzation Results - UF-86', () => {
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('[role="dialog"] [type="submit"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[role="alert"] div').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain('Randomize');
    });

    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.get('.css-b0b8rp').invoke('text').should($txt => {
      expect($txt).to.contain('View Visit History');
    });

    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain(`You have successfully  randomized and assigned 3 Kits to  subject ${scope.subjectId}`);
    });

    let randNextDayDate = dayjs().add(7, 'day');
    randNextDayDate = (randNextDayDate.format('DD MMM YYYY'));

    cy.get('.css-5q5ndq > p').invoke('text').should($txt => {
      expect($txt).to.contain(`The subject's next expected visit is${randNextDayDate}`);
    });

    cy.get('.css-5q5ndq > p').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain(randNextDayDate);
    });
    cy.get('[data-testid="rand-tray-response"]').click();
  });

  it('Unblinding Visit Details - UF-93', () => {

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('li[id="Unblind"]').click({force: true});
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

    cy.get('.css-1u755n2').invoke('text').should($txt => {
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

    cy.get('.css-1tmn5yy').invoke('text').should($txt => {
      expect($txt).to.contain('Show all visits');
    });

    cy.get('[data-testid=pin-panel] > h6').invoke('text').should($txt => {
      expect($txt).to.contain('Enter your 6-digit PIN to confirm');
    });

    cy.get('[data-testid=pin-panel] > a').invoke('text').should($txt => {
      expect($txt).to.contain('Forgot your PIN?');
    });

    cy.get('[data-testid = unblind-visit-cancel]').invoke('text').should($txt => {
      expect($txt).to.contain('Cancel');
    });

    cy.get('[data-testid = unblind-visit-confirm]').invoke('text').should($txt => {
      expect($txt).to.contain('Confirm');
    });
  });

  it('Unblinding PIN - UF-94', () => {
    cy.get('[data-testid = unblind-visit-confirm]').should('be.disabled');
    cy.enterPin('1','2','3','4','5','6');
    cy.get('[data-testid = unblind-visit-confirm]').focus().should('be.visible');
    cy.get('[data-testid = unblind-visit-cancel]').focus().should('contain','Cancel');
    cy.get('button[type="submit"]').should('contain', 'Confirm');

    cy.get('#pin-sixth-digit').clear();

    cy.get('#unblindVisitBox > p').invoke('text').should($txt => {
      expect($txt).to.contain('Please check PIN. All 6 digits are required.');
    });
    cy.get('[data-testid = unblind-visit-confirm]').should('be.disabled');
  });
});