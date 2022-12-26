
describe('Shipments & Kits', () => {
  let scope = {};

  before(() => {
    cy.visitPageAndClearwinCookies();
    scope.baseUrl = Cypress.env('baseUrl');
    scope.apiUrl = Cypress.env('apiUrl');
  });

  after(() => {
    cy.get('.css-1nmt8ps > p').eq(1).click();
    cy.get('.css-1nmt8ps > p').eq(1).click();
    cy.get('.css-gaxyvd > ul > li').click();
  });


  it('Verify Login page has all the required fields', () => {
    cy.fixture('mainFixtures.json').as('usersData');

    cy.intercept(`${Cypress.env('loginRequest')}/b2c_1_si/oauth2/v2.0/token`, (req) => {
      return req;
    }).as('login');

    cy.visitPageAndClearCookies(scope.baseUrl);
    cy.getAccessTokenSupplyUSer(scope);
    cy.verifyStudyName(scope);
  });


  it('Verify UI Flow in Shipment & Kits - Page Area. Jira PLT-294, PLT-295', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('div > h2').should($h5 => {
      expect($h5).to.contain('BioPab');
    });
    cy.get('ul > div:nth-child(7) > div').click();
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
    cy.get('tr td h6').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Requested');
    });
    cy.get('[data-testid="MoreVertIcon"]').eq(0).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.css-h5obyu').click();
    cy.get('.css-1xnox0e').eq(0).within($el => {
      cy.wrap($el).get('tr td a').eq(0).invoke('text').then(text => {
        scope.subjectId = text.trim();
      });
      cy.get('.css-ed4u1n').eq(0).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
    });
  });

  it('Verify UI Flow for Kits - Page Area. Jira PLT-297,PLT-296', () => {
    cy.intercept('GET', `${scope.apiUrl}/v1/Studies`).as('studies');
    cy.clickStudy(scope);
    cy.get('div > h2').should($h2 => {
      expect($h2).to.contain('BioPab: Study XYZ567');
    });
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

    // make all statuses Avaialbe
    cy.get('.css-1m9pwf3').eq(0).click();
    cy.log('click on select');
    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
    cy.get('.css-h5obyu').eq(0).click();
    cy.get('[type$="submit"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.css-1vqdciu').eq(1).click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[placeholder="Search Kits"]').clear();
    cy.get('[data-testid="FilterListIcon"]').parent().click();
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('equals');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').click().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);

    cy.get('[datatest-id="status-chip"] span').contains('Available').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').click();
        });
      cy.get('#Subject').invoke('text').then($txt => {
        expect($txt).contain('View Kit Details');
      });
      cy.get('.css-xax8ac').eq(1).invoke('text').then($txt => {
        expect($txt).contain('Unavailable');
      });
      cy.get('.css-xax8ac').eq(2).invoke('text').then($txt => {
        expect($txt).contain('Expired');
      });
      cy.get('.css-xax8ac').eq(3).invoke('text').then($txt => {
        expect($txt).contain('Quarantine');
      });
      cy.get('.css-xax8ac').eq(4).invoke('text').then($txt => {
        expect($txt).contain('Damage');
      });

      //Add to Shipment is inactive from verticle menu for now
      // cy.get('.css-xax8ac').eq(5).invoke('text').then($txt => {
      //   expect($txt).contain('Add to Shipment');
      // });
      // Lost status should be added when bug is fixed
      cy.get('.css-1w6at85').invoke('text').then($txt => {
        expect($txt).contain('Change status to');
      });
      cy.get('#Subject').click({ force: true });
      cy.get('.css-1p39f1q').click();
    });

     //Imp part
    // changing status of kits to avoid failures when other secondary status are not available

    // change to unvailable
    for(let i=0;i<3;i++){
      cy.get('input[type="checkbox"]').eq(i+1).click();
    }
    cy.log('click on select');
    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
    cy.get('.css-h5obyu').eq(7).click();
    cy.get('[type$="submit"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.css-1vqdciu').eq(1).click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').clear();

     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);

    // change to Expired
    cy.get('[datatest-id="status-chip"] span').contains('Available').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
      cy.get('[data-testid="vertMenu"]').click();

      });
       // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('.css-xax8ac').eq(2).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[role="dialog"] [type="submit"]').click({ force: true});
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').clear();
    cy.get('[data-testid="FilterListIcon"]').parent().click();
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('equals');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('[placeholder="Search Kits"]').click().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);

      // change to Quarantine
    cy.get('[datatest-id="status-chip"] span').contains('Available').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').click();

    });

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('.css-xax8ac').eq(3).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[role="dialog"] [type="submit"]').click({ force: true});
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').clear();
    cy.get('[data-testid="FilterListIcon"]').parent().click();
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('equals');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').click().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);

     // change to Damage
    cy.get('[datatest-id="status-chip"] span').contains('Available').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
      cy.get('[data-testid="vertMenu"]').click();

    });

       // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('.css-xax8ac').eq(4).click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[role="dialog"] [type="submit"]').click({ force: true});
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').clear();
    cy.get('[data-testid="FilterListIcon"]').parent().click();
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('equals');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').click().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);

    cy.get('[datatest-id="status-chip"] span').contains('Available').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
     });
    });
    cy.get('#Subject').click({ force: true });
    cy.get('.css-1p39f1q').click();
    cy.get('[placeholder="Search Kits"]').type('{esc}');
    for(let i=0;i<4;i++){
      cy.get('input[type="checkbox"]').eq(i+1).click();
      scope.count = i+1;
    }
    cy.get('.css-1p1namh').eq(0).click({ force: true });
    cy.get('.css-10cj156').should('contain','Cancel').click();

    cy.get('[type$="checkbox"]').eq(1).click();
    cy.get('[type$="checkbox"]').eq(2).click();
    cy.get('.css-1p1namh').click();
    cy.get('#status-select').click();
    cy.get('.css-h5obyu').eq(1).click();
    cy.get('[type$="submit"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.css-1vqdciu').eq(1).click();

    // checking status of primary and secondary buttons

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').clear();
    cy.get('[data-testid="FilterListIcon"]').parent().click();
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('equals');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').click().type('Unavailable');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);
    cy.get('[placeholder="Search Kits"]').type('{esc}');
    cy.get('[datatest-id="status-chip"] span').contains('Unavailable').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').click();
        });
      cy.get('#Subject').invoke('text').then($txt => {
        expect($txt).contain('View Kit Details');
      });
      cy.get('.css-xax8ac').eq(1).invoke('text').then($txt => {
        expect($txt).contain('Available');
      });
      cy.get('.css-xax8ac').eq(2).invoke('text').then($txt => {
        expect($txt).contain('Expired');
      });
      cy.get('.css-xax8ac').eq(3).invoke('text').then($txt => {
        expect($txt).contain('Quarantine');
      });
      cy.get('.css-xax8ac').eq(4).invoke('text').then($txt => {
        expect($txt).contain('Damage');
      });
      cy.get('.css-xax8ac').eq(5).invoke('text').then($txt => {
        expect($txt).contain('Lost');
      });
      cy.get('#Subject').click();
      cy.get('.css-1p39f1q').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
      cy.get('[placeholder="Search Kits"]').clear();
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').type('Quarantine');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.get('[placeholder="Search Kits"]').type('{esc}');

    cy.get('[datatest-id="status-chip"] span').contains('Quarantine').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').click();
        });
      cy.get('#Subject').invoke('text').then($txt => {
        expect($txt).contain('View Kit Details');
      });
      cy.get('#Subject').click();
      cy.get('.css-1p39f1q').click();
    });

     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').clear();
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').type('Assigned');
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);
     cy.get('[placeholder="Search Kits"]').type('{esc}');
     cy.get('[datatest-id="status-chip"] span').contains('Assigned').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
       cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
         cy.get('[data-testid="vertMenu"]').click();
         });
       cy.get('#Subject').invoke('text').then($txt => {
         expect($txt).contain('View Kit Details');
       });
       cy.get('#Subject').click();
       cy.get('.css-1p39f1q').click();
     });

     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').clear();
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').type('Expired');
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);
     cy.get('[placeholder="Search Kits"]').type('{esc}');
     cy.get('[datatest-id="status-chip"] span').contains('Expired').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
       cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
         cy.get('[data-testid="vertMenu"]').click();
         });
       cy.get('#Subject').invoke('text').then($txt => {
         expect($txt).contain('View Kit Details');
       });
       cy.get('.css-xax8ac').eq(1).invoke('text').then($txt => {
        expect($txt).contain('Update Expiration');
      });
       cy.get('#Subject').click();
       cy.get('.css-1p39f1q').click();
     });

     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').clear();
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(1000);
     cy.get('[placeholder="Search Kits"]').type('Damage');
     // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);
     cy.get('[placeholder="Search Kits"]').type('{esc}');
     cy.get('[datatest-id="status-chip"] span').contains('Damage').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
       cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
         cy.get('[data-testid="vertMenu"]').click();
         });
       cy.get('#Subject').invoke('text').then($txt => {
         expect($txt).contain('View Kit Details');
       });
       cy.get('#Subject').click();
       cy.get('.css-1p39f1q').click();
       // eslint-disable-next-line cypress/no-unnecessary-waiting
       cy.wait(1000);
       cy.get('[placeholder="Search Kits"]').clear();
     });
  });


  it('Verify UI Flow for Kits - Page Area. Jira PLT-298,PLT-299', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').clear();
    cy.get('[data-testid="FilterListIcon"]').parent().click();
    cy.get('div:nth-child(4) > div:nth-child(2) > select:nth-child(1)').select('equals');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[placeholder="Search Kits"]').click().type('Available');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
     cy.wait(2000);

    cy.get('[datatest-id="status-chip"] span').contains('Available').then($el => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cy.wrap($el).parentsUntil('[role="row"]').parent().within(($el) => {
        cy.get('[data-testid="vertMenu"]').click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
     });
    });
    cy.get('#Subject').click({ force: true });
    cy.get('.css-1wurjxf').eq(1).invoke('text').should($txt => {
      scope.kittype1 = $txt;
    });
    cy.get('.css-1wurjxf').eq(2).invoke('text').should($txt => {
      scope.batch = $txt;
    });
    cy.get('.css-1wurjxf').eq(3).invoke('text').should($txt => {
      scope.lot = $txt;
    });
    cy.get('.css-1p39f1q').click();
    cy.get('[placeholder="Search Kits"]').type('{esc}');
    for(let i=0;i<4;i++){
      cy.get('input[type="checkbox"]').eq(i+1).click();
      scope.count = i+1;
    }
    cy.get('.css-1p1namh').eq(0).click({ force: true });

    cy.get('.css-phd5z4').invoke('text').then($txt => {
      expect($txt).contain('Change Status');
    });

    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain(scope.count);
      expect($txt).to.contain(' kits have been marked for updated ');
      expect($txt).to.contain('status');
    });

    cy.get('.css-1cqaqi7').invoke('text').then($txt => {
      expect($txt).contain('Kit Details');
    });

    cy.get('.css-i6nibx').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Protocol');
    });

    cy.get('.css-i6nibx').eq(1).invoke('text').then($txt => {
      expect($txt).contain('Kit Type');
    });

    cy.get('.css-i6nibx').eq(2).invoke('text').then($txt => {
      expect($txt).contain('Batch #');
    });

    cy.get('.css-i6nibx').eq(3).invoke('text').then($txt => {
      expect($txt).contain('Lot #');
    });

    cy.get('.css-8es81c').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Study XYZ567');
    });

    cy.get('.css-8es81c').eq(1).invoke('text').then($txt => {
      expect($txt).contain(scope.kittype1);
    });

    cy.get('.css-8es81c').eq(2).invoke('text').then($txt => {
      expect($txt).contain(scope.batch);
    });

    cy.get('.css-8es81c').eq(3).invoke('text').then($txt => {
      expect($txt).contain(scope.lot);
    });

    cy.get('.css-o4zp82').invoke('text').then($txt => {
      expect($txt).contain('Confirm your intent');
    });

    cy.get('.css-7nmjf2').invoke('text').then($txt => {
      expect($txt).contain('Please confirm your intention to update the ');
      expect($txt).contain('Status');
      expect($txt).contain(' for ');
      expect($txt).contain(scope.count);
    });
    cy.get('.css-10cj156').should('contain','Cancel').click();


    // Update Expiry flow - PLT-307

    for(let i=0;i<4;i++){
      cy.get('input[type="checkbox"]').eq(i+1).click();
      scope.count = i+1;
    }
    cy.get('.css-14ky8rb').click({ force: true });

    cy.get('.css-1cvwmzi').invoke('text').then($txt => {
      expect($txt).contain('Update Expiry');
    });

    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain(scope.count);
      expect($txt).to.contain(' kits have been marked for updated ');
      expect($txt).to.contain('expiration date');
      expect($txt).to.contain('.');
    });

    cy.get('.css-1cqaqi7').invoke('text').then($txt => {
      expect($txt).contain('Kit Details');
    });

    cy.get('.css-i6nibx').eq(0).invoke('text').then($txt => {
      expect($txt).contain('Protocol');
    });

    cy.get('.css-i6nibx').eq(1).invoke('text').then($txt => {
      expect($txt).contain('Kit Type');
    });

    cy.get('.css-i6nibx').eq(2).invoke('text').then($txt => {
      expect($txt).contain('Batch #');
    });

    cy.get('.css-i6nibx').eq(3).invoke('text').then($txt => {
      expect($txt).contain('Lot #');
    });

    cy.get('.css-7nmjf2').invoke('text').then($txt => {
      expect($txt).contain('Please confirm your intention to update the ');
      expect($txt).contain('Expiry');
      expect($txt).contain(' for ');
      expect($txt).contain(scope.count);
    });
    cy.get('.css-10cj156').should('contain','Cancel').click();
  });
});