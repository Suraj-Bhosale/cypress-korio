
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

  it('Temperature Excursion - UF-114', () => {
    //https://korioclinical.atlassian.net/browse/UF-114
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('ul > div:nth-child(5) > div').click();
    cy.contains('Receive Shipment').click();
    cy.get('#question-1').invoke('text').should($txt => {
      expect($txt).to.contain('Was there temperature excursion reported during shipment?');
    });

    cy.get('#question-2').invoke('text').should($txt => {
      expect($txt).to.contain('Is the entire shipment damaged?');
    });

    cy.get('.css-14k6z28').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
    });

    cy.get('.css-53re0p').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Please confirm the above information is accurate for Shipment ');
    });

    cy.get('.css-941zsy').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('After confirming, you will be provided a list of Kit(s) included in this shipment to confirm the receipt and status of each kit.');
    });

    //Shipment Receipt - Temp Excursion Default
    cy.get('[role = "radiogroup"] > p').eq(0).click();
    cy.get('[role = "radiogroup"] > p').eq(3).click();
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type*="checkbox"]').first().check() ;
    let totalCheckbox;
    cy.get('.css-1cvwmzi').parent().within($el => {
      cy.wrap($el).eq(0).invoke('text').then(text => {
        totalCheckbox = text.replace(/[^0-9]/gi,'');
        cy.wrap(totalCheckbox).as('totalCheckbox');
      });
    });

    cy.get('@totalCheckbox').then(totalCheckbox => {
      for(let i = 0; i < totalCheckbox; i++){
        cy.get(`[data-id = ${i}]  > div > div > div > div`).should($txt => {
          expect($txt).to.contain('Temperature Excursion');
        });
      };
    });
  });

  it('Kit Condition - UF-117', () => {
    //https://korioclinical.atlassian.net/browse/UF-117
    cy.get('.css-cc8tf1').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Kit #');
    });

    cy.get('.css-cc8tf1').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Lot #');
    });

    cy.get('.css-cc8tf1').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Expiry');
    });

    cy.get('.css-cc8tf1').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Kit Condition');
    });

    cy.get('[data-testid = assignedList-confirm]').click();
    cy.get('.css-10cj156').click();

    //Shipment Receipt - Assessment No Damage
    cy.get('[data-testid = assignedList-back]').click();
    cy.get('[role = "radiogroup"] > p').eq(1).click();
    cy.get('[role = "radiogroup"] > p').eq(3).click();
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();

    cy.contains('No Damage').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type*="checkbox"]').first().check();
    let totalCheckbox;
    cy.get('.css-1cvwmzi').parent().within($el => {
      cy.wrap($el).eq(0).invoke('text').then(text => {
        totalCheckbox = text.replace(/[^0-9]/gi,'');
        cy.wrap(totalCheckbox).as('totalCheckbox');
      });
    });

    cy.get('@totalCheckbox').then(totalCheckbox => {
      for(let i = 0; i < totalCheckbox; i++){
        cy.get(`[data-id = ${i}]  > div > div > div > div`).should($txt => {
          expect($txt).to.contain('No Damage');
        });
      };
    });
  });

  it('Kit Condition Confirmation, - UF-118',() => {
    //https://korioclinical.atlassian.net/browse/UF-118
    cy.get('.css-87yb2j > span').eq(1).click();

    cy.get('ul[role="listbox"] > li').within(($ele) => {
      cy.wrap($ele).eq(1).click({ force: true});
    });
    cy.get('.css-jhaw4c').should($txt => {
      expect($txt).to.contain('You are marking 9 kits as being damaged');
    });

    //Shipment Receipt - Confirm
    cy.get('.css-87yb2j > span').eq(1).click();
    cy.get('ul[role="listbox"] > li').within(($ele) => {
      cy.wrap($ele).eq(0).click({ force: true});
    });
    cy.get('[data-testid= assignedList-confirm]').click();

    //Click ‘No, Cancel’
    cy.get('.css-10cj156').click({ force: true});

    //click ‘Yes, I’m Sure’ 
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
  });

  it('Kit Condition Success - UF-119',() => {
    //https://korioclinical.atlassian.net/browse/UF-119
    //Shipment Receipt - Success
    cy.get('[data-testid="spons-study-site"]').invoke('text').should($txt => {
      expect($txt).to.contain('BioPab');
      expect($txt).to.contain('Study XYZ567');
      expect($txt).to.contain('Site 1');
    });

    cy.get('.MuiAlert-message',{timeout: 10000}).invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully received Shipment ');
      expect($txt).to.contain('.');
    });

    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain('Shipment Received');
        expect($txt).to.contain(':');
      });
    });

    cy.get('.css-96cu5 >th').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Kit #');
    });

    cy.get('.css-96cu5 >th').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('Lot #');
    });

    cy.get('.css-96cu5 >th').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain('Expiry');
    });
  
    cy.get('.css-96cu5 >th').eq(3).invoke('text').should($txt => {
      expect($txt).to.contain('Kit Status');
    });

    cy.get('[data-testid = rand-tray-response]').invoke('text').should($txt => {
      expect($txt).to.contain('Done');
    });
  });

  it('Kit Status - UF-120',() => {
    //https://korioclinical.atlassian.net/browse/UF-120
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies/*/subjects`).as('subjects');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/newSubject`).as('newsubject');
    cy.clickStudy(scope);
    cy.get('ul > div:nth-child(5) > div').click();
    cy.contains('Receive Shipment').click();
    cy.get('[role = "radiogroup"] > p').eq(1).click();
    cy.get('[role = "radiogroup"] > p').eq(3).click();
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();
    cy.get('[data-id = "2"]  [aria-haspopup$="listbox"]').click();
    cy.get('div[id="menu-"] li:nth-child(1) > span').should($txt => {
      expect($txt).to.contain('No Damage');
    });

    cy.get('div[id="menu-"] li:nth-child(2) > span').should($txt => {
      expect($txt).to.contain('Damaged');
    });

    cy.get('div[id="menu-"] li:nth-child(3) > span').should($txt => {
      expect($txt).to.contain('Temperature Excursion');
    });

    cy.get('div[id="menu-"] li:nth-child(4) > span').should($txt => {
      expect($txt).to.contain('Lost');
    });

    cy.get('div[id="menu-"] li:nth-child(4)').click();
  });
});