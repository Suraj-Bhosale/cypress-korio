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

  it('Screening Details,Duplicate Subject check - UF-80,81', () => {
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
    cy.get('[role="radiogroup"] span').eq(0).click({force: true});
    cy.get('[data-testid="rand-tray-cancel"]').eq(0).click({force: true});
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get("li[id='Randomize']").click({force: true});
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click({ force: true});

    cy.get('.MuiDialogActions-spacing button').eq(0).click({ force: true});
    cy.get('[data-testid="rand-tray-cancel"]').click({ force: true});

    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get("li[id='Randomize']").click({force: true});
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.get('[data-testid="rand-tray-response"]').click({ force: true});
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
  });

  it('Unscheduled Visits Results - UF-91', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
  
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
  });
});