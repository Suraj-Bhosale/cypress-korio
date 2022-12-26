describe('empty spec', () => {
  let scope = {};

  before(() => {
    cy.clearCookies();
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

  it('Verify New Screen Subject Yes Yes radio button Senario', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.createSubject(scope);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('.css-1gt7dkl').eq(0).click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
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

    // Yes Yes radio selection
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();

    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();

    cy.get('@subjectNo').then(subjectNo => {
      cy.get('.css-1xsto0d').invoke('text').should($txt => {
        expect($txt).to.contain('You have successfully  randomized and assigned 3 Kits to ');
        expect($txt).to.contain('subject');
        expect($txt).to.contain(subjectNo);
      });
    });

    cy.get('[data-testid="rand-tray-response"]').click({ force: true});
  });


  it('Verify New Screen Subject No No radio button Senario', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.createSubject(scope);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
    cy.get('.css-1gt7dkl').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
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

    // No No radio selection
    cy.get('p:nth-child(2) > span > input').eq(0).click();
    cy.get('p:nth-child(2) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();

    cy.get('@subjectNo').then(subjectNo => {
      cy.get('.css-1xsto0d').invoke('text').should($txt => {
        expect($txt).to.contain('You have successfully  randomized and assigned 3 Kits to ');
        expect($txt).to.contain('subject');
        expect($txt).to.contain(subjectNo);
      });
    });
    cy.get('[data-testid="rand-tray-response"]').click({ force: true});
  });

  it('Verify New Screen Subject Yes No radio button Senario', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.createSubject(scope);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('.css-1gt7dkl').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
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

    // Yes No radio selection
    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(2) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();

    cy.get('@subjectNo').then(subjectNo => {
      cy.get('.css-1xsto0d').invoke('text').should($txt => {
        expect($txt).to.contain('You have successfully  randomized and assigned 3 Kits to ');
        expect($txt).to.contain('subject');
        expect($txt).to.contain(subjectNo);
      });
    });
    cy.get('[data-testid="rand-tray-response"]').click({ force: true});
  });

  it('Verify New Screen Subject No Yes radio button Senario', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.createSubject(scope);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('.css-1gt7dkl').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
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

    // No Yes radio selection
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('p:nth-child(2) > span > input').eq(0).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();

    cy.get('@subjectNo').then(subjectNo => {
      cy.get('.css-1xsto0d').invoke('text').should($txt => {
        expect($txt).to.contain('You have successfully  randomized and assigned 3 Kits to ');
        expect($txt).to.contain('subject');
        expect($txt).to.contain(subjectNo);
      });
    });
    cy.get('[data-testid="rand-tray-response"]').click({ force: true});
  });
});