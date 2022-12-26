import dayjs from 'dayjs';

describe('empty spec', () => {
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

  it('Verify Login page has all the required fields', () => {
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
          cy.get('#email').type(Cypress.env('lls_username'));
          cy.get('#password').type(Cypress.env('lls_password'));
          cy.get('#next').click();
        }
        cy.wait('@login').then(res => {
          scope.token = res['response']['body']['access_token'];
        });
      });
    });
  });

  it('Verify Study names via UI and API', () => {
    cy.contains('All Studies').click();
    cy.request({
      url: `${scope.apiUrl}/v1/Studies`,
      headers: {
        authorization: `Bearer ${scope.token}`,
      }
    }, {timeout: 16000}).then((resp) => {
      scope.amountOfStudies = resp['body']['userStudies'].length;
      cy.log(scope.amountOfStudies);
      resp['body']['userStudies'].forEach(element => {
       if(element['studyName'] === 'Rand Only 123') {
        scope.subjectRandOnly123 = element['studyName'];
       }
      });
      expect(resp.status).to.eq(200);
    });
  });

  it('Verify New Screen Subject creation. Jira PLT-148, PLT-147, PLT-158, PLT 174, PLT 175', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');

    cy.visit(scope.baseUrl);
    cy.contains('All Studies').click();
    cy.wait('@studies');
    cy.get('div h2').eq(0).invoke('text').then($txt => {
      scope.firstProtocolName = $txt;
    });
    
    // temp method until we resolve roles in API response
    let indexProtocol = 1;

    cy.get('div h2').eq(indexProtocol).invoke('text').then($txt => {
      scope.secondProtocolName = $txt;
    });

    // uncomment when sponsor is visible
    // cy.get('div h4').eq(0).invoke('text').then($txt => {
    //   scope.firstSponsorName = $txt;
    // });
    scope.secondSponsorName = 'B Biotech, Inc.';
    cy.contains('Rand Only 123').parent().find('button').click();
    cy.get('div > h5').should($h5 => {
      expect($h5).to.contain('Korio Study Overview');
    });

    cy.get('ul > div:nth-child(5) > div').click();
    cy.wait('@subjects');
    cy.get('div:nth-child(3) > button').click();
    cy.get('.css-ekeie0 > div > div > h6').should($h6 => {
      expect($h6).to.contain('B Biotech, Inc.: Rand Only 123 - Site 1');
    });

    cy.get('ul div span').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain(scope.secondProtocolName);
    });

    cy.get('ul div span').eq(4).invoke('text').should($txt => {
      expect($txt).to.contain(scope.secondSponsorName);
    });
    cy.get('.css-ekeie0 > div > div > h2').should($h2 => {
      expect($h2).to.contain('Screen a new subject into Rand Only 123');
    });
    cy.get('[name="firstFLInitValue"]').type('P');
    cy.get('[name="lastFLInitValue"]').type('Q');
    cy.get('div:nth-child(2) > div > div > button > svg').click({ force: true });
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-3angto > div > div > button > svg').click({ force: true }).then(() => {
      cy.get('[aria-selected="true"]').click({ force: true });
    });
    cy.get('div:nth-child(2) > div:nth-child(4) > div > div > button > svg').click({ force: true }).then(() => {
      cy.get('div:nth-child(119) > button').click({ force: true });
    });
    cy.get('.MuiDialogActions-spacing button').eq(1).click({ force: true });
    cy.get('input[type="checkbox"]').check();
    cy.get('.MuiDialogActions-spacing button').eq(1).click({ force: true });
    cy.wait('@newsubject');

    cy.get('[role="dialog"] div h2').invoke('text').should($txt => {
      expect($txt).to.contain('Success!');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('Subject');
      expect($txt).to.contain('has been successfully screened into');
      expect($txt).to.contain(scope.subjectRandOnly123);
    });
  
    let nextDayDate = dayjs().add(1, 'day');
    nextDayDate = (nextDayDate.format('DD MMM YYYY'));

    cy.get('[role="dialog"] div h6').invoke('text').should($txt => {
      expect($txt).to.contain(`The subject's next expected visit is ${nextDayDate}.`);
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[role="dialog"] button span').eq(1).click({force: true});
    cy.wait('@subjects');
    cy.get('.css-155nsqr').last().within($el => {
      cy.wrap($el).get('td p').eq(0).should(data => {
        expect(data).to.contain('PQ');
      });
      cy.wrap($el).get('td a').eq(0).invoke('text').should('not.be.empty');
      cy.wrap($el).get('td p').eq(1).invoke('text').should('not.be.empty');
      cy.wrap($el).get('[datatest-id="status-chip"] span').invoke('text').should($txt => {
        expect($txt).to.contain('Screened');
      });
      cy.wrap($el).get('td div p').invoke('text').should('not.be.empty');
      cy.wrap($el).get('td div span span').invoke('text').should($txt => {
        expect($txt).to.contain('future');
      });
      cy.wrap($el).get('[data-testid="CircleIcon"]').invoke('css', 'color')
      .should('equal', 'rgb(76, 175, 80)');
    });
  });

  it('Subject eligible actions: Vertical Menu Logic. PLT 168', () => {
    cy.get('.css-155nsqr').last().within($el => {
      cy.wrap($el).get('td a').eq(0).invoke('text').then(text => {
        scope.subjectId = text.trim();
      });
      cy.wrap($el).get('[data-testid="vertMenu"]').click();
    });
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
      expect($txt).to.contain('B Biotech, Inc.');
      expect($txt).to.contain('Rand Only 123');
      expect($txt).to.contain('Site 1');
    });
    cy.get('[data-testid="last-visit-type"]').invoke('text').should($txt => {
      expect($txt).to.contain('Screening');
    });
    cy.get('[role="radiogroup"] span').eq(0).click({force: true});
    cy.get('[data-testid="rand-tray-cancel"]').eq(0).click({force: true});
    cy.get('.css-155nsqr').last().within($el => {
      return cy.wrap($el).get('[datatest-id="status-chip"] span');
    }).then($el => {
      cy.wrap($el).should(statusText => {
        expect(statusText).to.contain('Screened');
      });
    });
    cy.get('.css-155nsqr').last().within($el => {
      cy.wrap($el).get('[datatest-id="primary-action-button"]').click();
    });
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

    cy.get('.css-155nsqr').last().within($el => {
      return cy.wrap($el).get('[datatest-id="status-chip"] span');
    }).then($el => {
      cy.wrap($el).should(statusText => {
        expect(statusText).to.contain('Screened');
      });
    });

    cy.get('.css-155nsqr').last().within($el => {
      cy.wrap($el).get('[datatest-id="primary-action-button"]').click();
    });

    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.get('p:nth-child(1) > span > input').eq(0).click();
    cy.get('p:nth-child(1) > span > input').eq(1).click();
    cy.get('[data-testid="rand-tray-confirm"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();
    cy.wait('@randomize');
    cy.get('[role="alert"] div').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain(scope.subjectId);
    });
    cy.get('[data-testid="rand-tray-response"]').click();
    cy.wait('@subjects');
    cy.get('.css-155nsqr').last().within($el => {
      return cy.wrap($el).get('[datatest-id="status-chip"] span');
    }).then($el => {
      cy.wrap($el).should(statusText => {
        expect(statusText).to.contain('Randomized');
      });
    });

    cy.get('.css-155nsqr').last().within($el => {
      cy.wrap($el).get('[datatest-id="primary-action-button"]').invoke('text')
        .should($txt => {
          expect($txt).to.contain('Complete');
        });
        cy.wrap($el).get('[datatest-id="primary-action-button"]').click();
    });
    cy.get('#unscheduledVisitBox [datatest-id="status-chip"]').eq(0).should($txt => {
      expect($txt).to.contain('Randomized');
    });
    cy.get('#unscheduledVisitBox [datatest-id="status-chip"]').eq(1).should($txt => {
      expect($txt).to.contain('Completed');
    });
    cy.get('[data-testid="complete-visit-confirm"]').click();
    cy.get('[role="dialog"] [type="submit"]').click();
    cy.wait('@subjects');
    cy.get('[data-testid="rand-tray-response"]').click();
   
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('.css-155nsqr').last().within($el => {
      return cy.wrap($el).get('[datatest-id="status-chip"] span');
    }).then($el => {
      cy.wrap($el).should(statusText => {
        expect(statusText).to.contain('Completed');
      });
    });
  });
});