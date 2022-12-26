
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

  it('Login', () => {
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
      cy.wait(5000);
      cy.get('body').then(($a) => {
        if (!$a.text().includes('All Studies')) {
          cy.loginSupplyManager();
        }
        cy.wait('@login').then(res => {
          scope.token = res['response']['body']['access_token'];
        });
      });
    });
  });

  it('Kit Statuses - UF-121', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/updateKits`).as('updateStatus');
    cy.clickStudy(scope);
    cy.contains('Shipment & Kits').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('.css-1b7ibh7').eq(1).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type*="checkbox"]').first().check() ;
    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
     
    cy.get('.css-h5obyu').eq(0).should($txt => {
      expect($txt).to.contain('Available');
    });

    cy.get('.css-h5obyu').eq(2).should($txt => {
      expect($txt).to.contain('Damaged');
    });

    cy.get('.css-h5obyu').eq(4).should($txt => {
      expect($txt).to.contain('Quarantined');
    });

    cy.get('.css-h5obyu').eq(6).should($txt => {
      expect($txt).to.contain('Lost');
    });

    cy.get('.css-h5obyu').eq(8).should($txt => {
      expect($txt).to.contain('Do Not Dispense');
    });

    cy.get('.css-h5obyu').eq(10).should($txt => {
      expect($txt).to.contain('Do Not Ship');
    });

    cy.get('.css-h5obyu').eq(0).click();
    cy.get('.css-10cj156').click();
  });

  it('Kit Status Changes - UF-127', () => {
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/updateKits`).as('updateStatus');
    cy.contains('Shipment & Kits').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('.css-1b7ibh7').eq(1).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('.css-cc8tf1').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Kit #');
    });
    cy.get('.css-cc8tf1').eq(1).invoke('text').then($txt => {
      expect($txt).contain('Location');
    });

    cy.get('.css-cc8tf1').eq(2).invoke('text').then($txt => {
      expect($txt).contain('Kit Type');
    });

    cy.get('.css-cc8tf1').eq(3).invoke('text').then($txt => {
      expect($txt).contain('Lot #');
    });

    cy.get('.css-cc8tf1').eq(4).invoke('text').then($txt => {
      expect($txt).contain('Batch #');
    });

    cy.get('.css-cc8tf1').eq(5).invoke('text').then($txt => {
      expect($txt).contain('Expiry');
    });

    cy.get('.css-cc8tf1').eq(6).invoke('text').then($txt => {
      expect($txt).contain('Status');
    });
    
    cy.get('.css-cc8tf1').eq(7).invoke('text').then($txt => {
      expect($txt).contain('More');
    });

    //Filter available status 
    cy.get('.css-1b7ibh7').eq(1).click();
    cy.viewport(1280, 800);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('div:nth-child(3) > div:nth-child(2) > select:nth-child(1)').select('Status');
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('starts with');
    cy.get('[placeholder$="Filter value"]').clear().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');
  
    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();

    cy.get('[data-colindex = "1"] a').eq(0).invoke('text').then($kit1 => {
      cy.wrap($kit1).as('kitNoOne');
    });

    cy.get('[data-colindex = "1"] a').eq(1).invoke('text').then($kit2 => {
      cy.wrap($kit2).as('kitNoTwo');
    });

    cy.get('[data-colindex = "7"] > div > span').eq(0).invoke('text').then($txt => {
      cy.wrap($txt).as('currenStatusValue1');
    });

    cy.get('[data-colindex = "7"] > div > span').eq(1).invoke('text').then($txt => {
      cy.wrap($txt).as('currenStatusValue2');
    });

    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
    cy.get('.css-h5obyu').eq(7).click();
    cy.get('[type$="submit"]').click();

    cy.get('.css-4sqi6x').invoke('text').then($txt => {
      expect($txt).contain('Are you sure you want to take this action?');
    });

    cy.get('.css-1bcp2a2').invoke('text').then($txt => {
      expect($txt).contain('You are about to request that the status of 2 kits be changed to Unavailable.');
    });

    cy.get('.css-1vqdciu').eq(1).click();
    cy.get('.css-1b7ibh7').eq(1).click();
    cy.viewport(1280, 800);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('div:nth-child(3) > div:nth-child(2) > select:nth-child(1)').select('Status');
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('starts with');
    cy.get('[placeholder$="Filter value"]').clear().type('unavailable');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');

    cy.get('@kitNoOne').then(kitNoOne => {
      cy.get('[type$="search"]',{timeout: 10000}).type(kitNoOne);
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);

    cy.get('[data-colindex = "7"] > div > span').eq(0).invoke('text').then($txt => {
      cy.wrap($txt).as('changeStatusValue1');
    });

    cy.get('@currenStatusValue1').then(currenStatusValue1 => {
      cy.get('@changeStatusValue1').then(changeStatusValue1 => {
        expect(currenStatusValue1).not.equal(changeStatusValue1);
        expect(changeStatusValue1).is.equal('Unavailable');
      });
    });

    cy.get('@kitNoTwo').then(kitNoTwo => {
      cy.get('[type$="search"]',{timeout: 10000}).clear().type(kitNoTwo);
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);

    cy.get('[data-colindex = "7"] > div > span').eq(0).invoke('text').then($txt => {
      cy.wrap($txt).as('changeStatusValue2');
    });

    cy.get('@currenStatusValue2').then(currenStatusValue2 => {
      cy.get('@changeStatusValue2').then(changeStatusValue2 => {
        expect(currenStatusValue2).not.equal(changeStatusValue2);
        expect(changeStatusValue2).is.equal('Unavailable');
      });
    });

    cy.get('button[aria-label="Clear"]').click();

  //Expiry Statuses
    //No,Cancel
    cy.viewport(1280, 800);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('div:nth-child(3) > div:nth-child(2) > select:nth-child(1)').select('Status');
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('starts with');
    cy.get('[placeholder$="Filter value"]').clear().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-14ky8rb').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-1vqdciu').click();
    cy.get('.css-10cj156').eq(1).click();
    cy.get('.css-10cj156').eq(0).click();

    //Yes, I Confirm
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-14ky8rb').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-1vqdciu').click();
    cy.get('.css-1vqdciu').eq(1).click();

    //Manage Kit Status - Single
    cy.get('[data-colindex = "1"] a').eq(0).invoke('text').then($kit3 => {
      cy.wrap($kit3).as('kitNoThree');
    });

    cy.get('[data-colindex = "8"] >  div > button').eq(0).click();
    cy.get('#Subject').invoke('text').should($txt => {
      expect($txt).to.contain('View Kit Details');
    });

    cy.get('#Unavailable > p').invoke('text').should($txt => {
      expect($txt).to.contain('Unavailable');
    });

    cy.get('#Expired > p').invoke('text').should($txt => {
      expect($txt).to.contain('Expired');
    });

    cy.get('#Quarantine > p').invoke('text').should($txt => {
      expect($txt).to.contain('Quarantine');
    });

    cy.get('#Damage > p').invoke('text').should($txt => {
      expect($txt).to.contain('Damage');
    });

    //Commented until it get active again
    // cy.get('[id$="Add to Shipment"] > p').invoke('text').should($txt => {
    //   expect($txt).to.contain('Add to Shipment');
    // });

    cy.get('li[id$="Unavailable"]').dblclick({ force: true});
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('body').then((body) => {
      for(let i = 0; i < 10; i++) {
        if (body.find('[type$="submit"]').length > 0) {
          cy.get('[type$="submit"]').click();
          break;;
        }
        else {
          cy.log('Confirmation box not visible');
          cy.get('[data-colindex = "8"] >  div > button').eq(0).click();
          cy.get('li[id$="Unavailable"]').dblclick({ force: true});
          // eslint-disable-next-line cypress/no-unnecessary-waiting
           cy.wait(2000);
        }
      }
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('.css-1b7ibh7').eq(1).click();
    cy.viewport(1280, 800);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('div:nth-child(3) > div:nth-child(2) > select:nth-child(1)').select('Status');
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('starts with');
    cy.get('[placeholder$="Filter value"]').clear().type('unavailable');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');
    cy.get('@kitNoThree').then(kitNoThree => {
      cy.get('[type$="search"]',{timeout: 10000}).clear().type(kitNoThree);
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-colindex = "7"] > div > span').invoke('text').then($txt => {
      expect($txt).to.contain('Unavailable');
    });
  });

  it('Kit Expiry - UF - 128', () => {
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/updateKits`).as('updateStatus');
    cy.contains('Shipment & Kits').click();
    cy.get('.css-1b7ibh7').eq(0).click();
    cy.get('.css-1b7ibh7').eq(1).click();
    cy.get('[data-colindex = "2"] > div').invoke('text').should('not.be.empty');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type*="checkbox"]').first().check() ;
    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').eq(1).click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('[data-colindex = "1"] a').eq(0).invoke('text').then($expireKit => {
      cy.wrap($expireKit).as('expireKit');
    });

    cy.get('li[id$="Expired"]').dblclick({ force: true});
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('body').then((body) => {
      if (body.find('[type$="submit"]').length > 0) {
        if (body.find('[type$="submit"]').length > 0) {
          cy.get('[type$="submit"]').click({ force: true});
          cy.wait('@updateStatus');
        }
        else {
          cy.log('Confirmation box not visible');
          cy.get('[data-colindex = "8"] >  div > button').eq(0).click();
          cy.get('li[id$="Expired"]').dblclick({ force: true});
          // eslint-disable-next-line cypress/no-unnecessary-waiting
           cy.wait(2000);
        }
      }
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-colindex = "2"] > div').invoke('text').should('not.be.empty');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('div:nth-child(3) > div:nth-child(2) > select:nth-child(1)').select('Status');
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('starts with');
    cy.get('[placeholder$="Filter value"]').clear().type('Expired');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');

    cy.get('@expireKit').then(expireKit => {
      cy.get('[type$="search"]',{timeout: 10000}).type(expireKit);
    });

    //Single Expiry Update
    cy.get('[data-testid="MoreVertIcon"]',{timeout: 10000}).eq(0).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
    Cypress.on('uncaught:exception', (err) => {
      /* returning false here prevents Cypress from failing the test */
      if (resizeObserverLoopErrRe.test(err.message)) {
          return false;
      }
    });
    cy.get('[id$="Update Expiration"]').click();

    cy.get('div a').eq(0).invoke('text').then(text => {
      cy.wrap(text).as('kitId');
    });

    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('@kitId').then(kitId => {
      cy.get('.css-gkco4w').invoke('text').then($txt => {
        expect($txt).contain(`Please confirm the new expiration date for Kit ${kitId} is accurate.`);
      });
    });

    cy.get('.css-dyfjrv').invoke('text').then($txt => {
      expect($txt).contain('Confirm your intent');
    });

    cy.get('.css-1scsav1').click();
    // click 'No, Cancel'
    cy.get('.css-10cj156').click();
    cy.get('.css-1scsav1').click();
    // click on I'm, Sure
    cy.get('.css-1vqdciu').click();

    cy.get('@kitId').then(kitId => {
      cy.get('.css-1xsto0d').invoke('text').then($txt => {
        expect($txt).contain(`You have successfully updated the expiration date for Kit ${kitId}.`);
      });
    });
    cy.get('.css-1p39f1q').click();
    cy.get('[type$="search"]',{timeout: 10000}).clear();
    //Multiple Expiry Update
    //No,Cancel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.viewport(1280, 800);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('div:nth-child(3) > div:nth-child(2) > select:nth-child(1)').select('Status');
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('starts with');
    cy.get('[placeholder$="Filter value"]').clear().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[placeholder$="Filter value"]').type('{esc}');
    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-14ky8rb').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('[role = "alert"] > div').eq(1).invoke('text').then($txt => {
      expect($txt).contain('2 kits have been marked for updated expiration date.');
    });

    cy.get('.css-o4zp82').invoke('text').then($txt => {
      expect($txt).contain('Confirm your intent');
    });

    cy.get('.css-7nmjf2').invoke('text').then($txt => {
      expect($txt).contain('Please confirm your intention to update the Expiry for 2 kits.');
    });

    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-1vqdciu').click();

    cy.get('.css-4sqi6x').invoke('text').then($txt => {
      expect($txt).contain('Are you sure you want to take this action?');
    });

    cy.get('.css-10cj156').eq(1).click();
    cy.get('.css-10cj156').eq(0).click();

    //Yes, I Confirm
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-14ky8rb').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.get('div > button:nth-child(7)').click({ force: true });
    cy.get('.css-1vqdciu').click();
    cy.get('.css-1vqdciu').eq(1).click();
  });
});