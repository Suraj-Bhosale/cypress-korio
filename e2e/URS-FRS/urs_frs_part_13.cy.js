
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

  it('Shipment request - UF-112, UF-123, UF-124, UF-125', () => {
    cy.intercept('POST', `${scope.apiUrl}/v1/Studies/*/updateKits`).as('updateStatus');
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.get('div > h2').should($h5 => {
       expect($h5).to.contain('BioPab');
    });
      cy.contains('Shipment & Kits').click();
    cy.get('tr th div').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Shipment #');
    });

    cy.get('tr th div').eq(1).invoke('text').then($txt => {
      expect($txt).contain('From');
    });

    cy.get('tr th div').eq(2).invoke('text').then($txt => {
      expect($txt).contain('To');
    });

    cy.get('tr th div').eq(3).invoke('text').then($txt => {
      expect($txt).contain('Quantity');
    });

    cy.get('tr th div').eq(4).invoke('text').then($txt => {
      expect($txt).contain('Tracking');
    });
    cy.get('tr th div').eq(5).invoke('text').then($txt => {
      expect($txt).contain('Status');
    });
    cy.get('tr th div').eq(6).invoke('text').then($txt => {
      expect($txt).contain('More');
    });
    cy.verifyText('.css-162gqv5','New Shipment');
    cy.waitForElementAndClick('.css-162gqv5');
    cy.waitForElementAndClick('[data-testid="new-shipment-origin-site-select"]');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get("div[data-testid='new-shipment-origin-site-select'] em").invoke('text').then($txt => {
      expect($txt).contain('Select Origin Depot');
    });
    cy.get("div[data-testid='new-shipment-destination-site-select'] em").invoke('text').then($txt => {
      expect($txt).contain('Select Destination Site');
    });

    cy.get("div[data-testid='new-shipment-kit-type-site-select'] em").invoke('text').then($txt => {
      expect($txt).contain('Select Kit Type');
    });

    cy.get("div[data-testid='new-shipment-lot-num-select'] em").invoke('text').then($txt => {
      expect($txt).contain('Select Lot#');
    });

    cy.get('[data-testid = new-shipment-quantity-select] label').invoke('text').then($txt => {
      expect($txt).contain('Quantity');
    });

    cy.waitForElementwithIndexClick('.css-h5obyu',1);
    cy.waitForElementAndClick('[data-testid="new-shipment-destination-site-select"]');
    cy.waitForElementwithIndexClick('.css-h5obyu',1);
    cy.waitForElementAndClick('[data-testid="new-shipment-kit-type-site-select"]');
    cy.waitForElementwithIndexClick('.css-h5obyu',1);
    cy.waitForElementAndClick('[data-testid="new-shipment-lot-num-select"]');
    cy.waitForElementwithIndexClick('.css-h5obyu',3);
    cy.get('[data-testid="new-shipment-quantity-select"]').click().type('2');
    cy.waitForElementAndClick('[data-testid="new-shipment-confirm"]');
    cy.verifyText('.css-14k6z28','Confirm your intent');
    cy.verifyText('.css-53re0p','Please confirm the above information is accurate');
    cy.verifyText('.css-941zsy','After confirming, this shipment will be routed for approval.');
    cy.waitForElementAndClick('[data-testid="add-shipment-confirm"]');
    cy.get('[role="dialog"] [type="submit"]').click();

    cy.get("div[class='MuiAlert-message css-1xsto0d']").eq(3).invoke('text').then($txt => {
      expect($txt).contain('Shipment added successfully.');
    });
    
    cy.get('[data-testid="add-shipment-complete"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);    
    cy.get('[datatest-id="status-chip"] span').eq(0).invoke('text').then($el => {
      expect($el).is.equal('Pending');
    });

    //In Transit
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('[id="Shipment"]').invoke('text').then($txt => {
      expect($txt).contain('View Shipment Details');
    });

    cy.verifyText('[id="Ship"]','Ship');
    cy.verifyText('[id="Cancel Shipment"]','Cancel Shipment');
    cy.get('[id="Ship"]').click();
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();
    cy.get('[role="dialog"] [type="submit"]').click();
    cy.get('[data-testid="rand-tray-response"]',{timeout: 10000}).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[datatest-id="status-chip"] span').eq(0).invoke('text').then($el => {
      expect($el).is.equal('In Transit');
    });

    //Received Shipment
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get("li[id='Receive Shipment']").click();
    cy.get('[role = "radiogroup"] > p').eq(1).click();
    cy.get('[role = "radiogroup"] > p').eq(3).click();
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();
    cy.get('[type*="checkbox"]').first().check();
    cy.get('[data-testid= assignedList-confirm]').click();
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});
    cy.get('[data-testid="rand-tray-response"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[datatest-id="status-chip"] span').eq(0).invoke('text').then($el => {
      expect($el).is.equal('Received');
    });

    //Canceled
    cy.waitForElementAndClick('.css-162gqv5');
    cy.waitForElementAndClick('[data-testid="new-shipment-origin-site-select"]');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.waitForElementwithIndexClick('.css-h5obyu',1);
    cy.waitForElementAndClick('[data-testid="new-shipment-destination-site-select"]');
    cy.waitForElementwithIndexClick('.css-h5obyu',1);
    cy.waitForElementAndClick('[data-testid="new-shipment-kit-type-site-select"]');
    cy.waitForElementwithIndexClick('.css-h5obyu',1);
    cy.waitForElementAndClick('[data-testid="new-shipment-lot-num-select"]');
    cy.waitForElementwithIndexClick('.css-h5obyu',3);
    cy.get('[data-testid="new-shipment-quantity-select"]').click().type('2');
    cy.waitForElementAndClick('[data-testid="new-shipment-confirm"]');
    cy.verifyText('.css-14k6z28','Confirm your intent');
    cy.verifyText('.css-53re0p','Please confirm the above information is accurate');
    cy.verifyText('.css-941zsy','After confirming, this shipment will be routed for approval.');
    cy.waitForElementAndClick('[data-testid="add-shipment-confirm"]');
    cy.get('[role="dialog"] [type="submit"]').click();
    cy.get('[data-testid="add-shipment-complete"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[data-testid="vertMenu"]').eq(0).click();
    cy.get('[id="Shipment"]').invoke('text').then($txt => {
      expect($txt).contain('View Shipment Details');
    });
    cy.verifyText('[id="Cancel Shipment"]','Cancel Shipment');
    cy.get('[id="Cancel Shipment"]').click();
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();
    cy.get('[role="dialog"] [type="submit"]').click();
    cy.get('[data-testid="rand-tray-response"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[datatest-id="status-chip"] span').eq(0).invoke('text').then($el => {
      expect($el).is.equal('Canceled');
    });

    cy.get('.css-1b7ibh7').eq(1).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[type*="checkbox"]').first().check() ;
    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('.css-10cj156').click();

    //Quarantine
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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-colindex = "1"] a').eq(0).invoke('text').then($quarantineKitNo => {
      cy.wrap($quarantineKitNo).as('quarantineKitNo');
    });
    cy.get('[data-testid="MoreVertIcon"]',{timeout: 10000}).eq(0).click({ force: true });
    cy.get('[id$="Quarantine"] p').click();
    cy.get('button[type="submit"]').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.wait('@updateStatus');
    cy.get('.css-1b7ibh7').eq(0).click();
    cy.get('.css-1b7ibh7').eq(1).click();
    cy.get('@quarantineKitNo').then(quarantineKitNo => {
      cy.get('[type$="search"]',{timeout: 10000}).type(quarantineKitNo);
    });

    cy.get('[data-colindex = "7"] > div > span').eq(0).invoke('text').then($txt => {
      expect($txt).is.equal('Quarantined');
    });

   //Damage
   cy.get('[type$="search"]',{timeout: 10000}).clear();
   cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
   cy.get('.css-h5obyu').eq(0).click();
   cy.get("button[title='Delete']").click();
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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-colindex = "1"] a').eq(2).invoke('text').then($DamageKitNo => {
      cy.wrap($DamageKitNo).as('DamageKitNo');
    });
    cy.get('[data-testid="MoreVertIcon"]',{timeout: 10000}).eq(2).click({ force: true });
    cy.get('[id$="Damage"] p').click();
    cy.get('button[type="submit"]').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get("button[title='Delete']").click();
    cy.get('@DamageKitNo').then(DamageKitNo => {
      cy.get('[type$="search"]',{timeout: 10000}).type(DamageKitNo);
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[data-colindex = "7"] > div > span').eq(0).invoke('text').then($txt => {
      expect($txt).is.equal('Damage');
    });
    cy.get('[type$="search"]',{timeout: 10000}).clear();


    //Lost
    cy.get('[type$="search"]',{timeout: 10000}).clear();
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get("button[title='Delete']").click();
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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[data-colindex = "1"] a').eq(1).invoke('text').then($LostKitNo => {
      cy.wrap($LostKitNo).as('LostKitNo');
    });
    cy.get('[data-testid="MoreVertIcon"]',{timeout: 10000}).eq(1).click({ force: true });
    cy.get('[id$="Lost"] p').click();
    cy.get('button[type="submit"]').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[data-testid="TripleDotsVerticalIcon"]').eq(6).click({ force: true });
    cy.get('.css-h5obyu').eq(0).click();
    cy.get("button[title='Delete']").click();
    cy.get('@LostKitNo').then(LostKitNo => {
      cy.get('[type$="search"]',{timeout: 10000}).type(LostKitNo);
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[data-colindex = "7"] > div > span').eq(0).invoke('text').then($txt => {
      expect($txt).is.equal('Lost');
    });
  });
});