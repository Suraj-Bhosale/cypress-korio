describe('Shipments & Kits', () => {
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
    cy.get('.css-1nmt8ps > p').eq(1).click();
    cy.get('.css-gaxyvd > ul > li').click();
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



  it('Verify UI Flow in Shipment Receipt - Page Area. Jira PLT-272, PLT-273', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.get('div > h2').should($h5 => {
      expect($h5).to.contain('BioPab');
    });

    cy.waitForElementAndClick('ul > div:nth-child(5) > div');
    cy.verifyTextWithIndex('tr th div',0,'Shipment #');
    cy.verifyTextWithIndex('tr th div',1,'Quantity');
    cy.verifyTextWithIndex('tr th div',2,'Tracking');
    cy.verifyTextWithIndex('tr th div',3,'Take Action');
    cy.verifyTextWithIndex('tr th div',4,'More');

    cy.verifyTextWithIndex('tr td',2,'10');
    cy.verifyTextWithIndex('tr td h6',0,'Requested');
    cy.verifyTextWithIndex('tr td h6',1,'Shipped');
    cy.verifyTextWithIndex('tr td h6',2,'Received');
  });

  it('Verify UI Flow in View Shipment Details - Page Area. Jira PLT-350', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.get('div > h2').should($h5 => {
      expect($h5).to.contain('BioPab');
    });

    cy.waitForElementAndClick('ul > div:nth-child(5) > div');

    cy.get('[datatest-id="primary-action-button"]').should('not.have.value','Receive Shipment').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').first().click({ force: true});
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        cy.get('[id="Shipment"]').click();
        
    });
    cy.get('.css-15sh8s1').parent().within($el => {
      cy.wrap($el).get('.css-15sh8s1').eq(0).invoke('text').then($txt => {
        scope.subjectId = $txt;
      });
    });

    cy.get('.css-xxslal').invoke('text').should($txt => {
      expect($txt).to.contain(`Shipment Received: Shipment ${scope.subjectId}`);
    });

    cy.verifyTextWithIndex('.css-cc8tf1',0,'Kit #');
    cy.verifyTextWithIndex('.css-cc8tf1',1,'Lot #');
    cy.verifyTextWithIndex('.css-cc8tf1',2,'Expiry');
    cy.verifyTextWithIndex('.css-cc8tf1',3,'Kit Status');
    cy.get('[data-testid = rand-tray-response]').click();
  });
});

describe('Shipment Receipt tickets', () => {
  it('Shipment Receipt - Jira PLT-278, PLT-279, PLT-280, PLT-281, PLT-282', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.get('div > h2').should($h5 => {
      expect($h5).to.contain('BioPab');
    });

    cy.waitForElementAndClick('ul > div:nth-child(5) > div');
    cy.viewport(1280, 800);
    cy.get('[datatest-id="primary-action-button"]').contains('Receive Shipment').click({ force: true });
    cy.get('.css-xxslal').parent().within($el => {
      cy.wrap($el).get('.css-xxslal').eq(0).invoke('text').then($txt => {
        scope.subjectId = $txt.split(' ')[4];
      });
    });

    cy.clickRadiobuttonWithIndex('[role = "radiogroup"] > p',1);
    cy.clickRadiobuttonWithIndex('[role = "radiogroup"] > p',3);
   
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();
    cy.contains('No Damage').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('[type*="checkbox"]').first().check();
  });

  it('Shipment Receipt - Jira PLT-278, PLT-279, PLT-280, PLT-281, PLT-282 - repeating', () => {

    //Shipment Receipt - Warning
    let count = 0;
      cy.get('[data-field=selectedKitCondition] > div > div > div > div > span').each(($ele) => {
        let data = $ele.text();
        if(data === 'No Damage'){
          cy.get('.css-87yb2j').eq(1).click();
          cy.get('ul[role="listbox"] > li').within(($ele) => {
          cy.wrap($ele).eq(1).click({ force: true});
        });
          count++;
        }
      });
    cy.get('.css-jhaw4c').should($txt => {
      expect($txt).to.contain(`You are marking ${count} kits as being damaged.`);
    });

    //Shipment Receipt - Confirm
    cy.get('[data-testid= assignedList-confirm]').click();

    //Click ‘No, Cancel’
    cy.get('.css-10cj156').click({ force: true});
    cy.get('[data-testid= assignedList-confirm]').click();

    //click ‘Yes, I’m Sure’ 
    cy.get('[role="dialog"] [type="submit"]').click({ force: true});

    //Shipment Receipt - Success
    cy.verifyTextWithId('[data-testid="spons-study-site"]','BioPab','Study XYZ567','Site 1');

    cy.get('.MuiAlert-message',{timeout: 10000}).invoke('text').should($txt => {
      expect($txt).to.contain('You have successfully received Shipment');
      expect($txt).to.contain(scope.subjectId);
    });

    cy.get('[data-testid="spons-study-site"]').parent().within($el => {
      cy.wrap($el).get('h2').invoke('text').should($txt => {
        expect($txt).to.contain(`Shipment Received Shipped: Shipment ${scope.subjectId}`);
        expect($txt).to.contain(':');
        expect($txt).to.contain(scope.subjectId);
      });
    });

    cy.verifyTextWithIndex('.css-96cu5 >th',0,'Kit #');
    cy.verifyTextWithIndex('.css-96cu5 >th',1,'Lot #');
    cy.verifyTextWithIndex('.css-96cu5 >th',2,'Expiry');
    cy.verifyTextWithIndex('.css-96cu5 >th',3,'Kit Status');
    cy.verifyText('[data-testid = rand-tray-response]','Done');
    cy.get('[data-testid = rand-tray-response]').click();

    //Shipment Receipt - Temp Excursion Default
    cy.contains('Receive Shipment').click();
    cy.clickRadiobuttonWithIndex('[role = "radiogroup"] > p',1);
    cy.clickRadiobuttonWithIndex('[role = "radiogroup"] > p',3);
    cy.get('[data-testid="shipment-receipt-tray-confirm"]').click();

  });
});

describe('Shipment Receipt UI flow', () => {
  it('Verify UI Flow in Shipment Receipt - Page Area. Jira PLT-274,PLT-275,PLT-276,PLT-277', () => {
    cy.contains('All Studies').click();
    cy.contains('Study XYZ567').parent().find('button').click();
    cy.get('div > h2').should($h5 => {
      expect($h5).to.contain('BioPab');
    });

    cy.waitForElementAndClick('ul > div:nth-child(5) > div');

    cy.contains('Receive Shipment').click();
    cy.get('.css-xxslal').parent().within($el => {
      cy.wrap($el).get('.css-xxslal').eq(0).invoke('text').then($txt => {
        scope.subjectId = $txt.split(' ')[4];
      });
    });
  });

  it('Verify UI Flow in Shipment Receipt - continue', () => {
    cy.verifyTextWithId('[data-testid="spons-study-site"]','BioPab','Study XYZ567','Site 1');
    cy.verifyTextWithId('.css-xxslal','Receive Shipment',':',scope.subjectId);

    cy.verifyText('#question-1','Was there temperature excursion reported during shipment?');
    cy.verifyText('#question-2','Is the entire shipment damaged?');
  
    cy.clickRadiobuttonWithIndex('[role = "radiogroup"] > p',1);
    cy.clickRadiobuttonWithIndex('[role = "radiogroup"] > p',3);

    cy.get('.css-14k6z28').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
    });

    cy.verifyTextWithIndex('.css-53re0p',0,'Please confirm the above information is accurate for Shipment ');
    cy.verifyTextWithIndex('.css-941zsy',0,'After confirming, you will be provided a list of Kit(s) included in this shipment to confirm the receipt and status of each kit.');

    cy.get('button[data-testid="shipment-receipt-tray-cancel"]').should('contain','Cancel');
    cy.get('button[data-testid="shipment-receipt-tray-confirm"]').should('contain', 'Confirm').click();
    cy.contains('No Damage').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.verifyTextWithId('[data-testid="spons-study-site"]','BioPab','Study XYZ567','Site 1');
    cy.verifyTextWithId('.css-xxslal','Assess Kits in Shipment Shipped',':',scope.subjectId);
    

    cy.verifyTextWithIndex('.css-cc8tf1',0,'Kit #');
    cy.verifyTextWithIndex('.css-cc8tf1',1,'Lot #');
    cy.verifyTextWithIndex('.css-cc8tf1',2,'Expiry');
    cy.verifyTextWithIndex('.css-cc8tf1',3,'Kit Condition');

    cy.get('.css-a3ogcs').should($h6 => {
      expect($h6).to.contain('Confirm your intent');
    });
    cy.verifyTextWithId('.css-l56s1z','Please confirm the above information is accurate for Shipment ',scope.subjectId,'.');

    cy.verifyTextWithId('.css-941zsy','After confirming, ','only',' kits with the condition "No Damage" will be made available for assigning to subjects.');
    cy.get('[type*="checkbox"]').first().check();
  });
});
});