import dayjs from 'dayjs';

Cypress.Commands.add('verifyPagnation', (filterSelector,arrowkeySelector,filterSelector2,filterlistselector,index, wait=10000) => {

  cy.get(filterSelector)
    .invoke('text')
    .as('pageno');
  cy.get('@pageno').then((pageno) => {
    cy.log('pageno : ' + pageno);
  });

  cy.get('@pageno').then(pageno => {
    if( pageno !== ('0–0 of 0')){
      cy.get(arrowkeySelector).should('be.visible').should('not.be.disabled');
    }
    else{
      cy.get(filterSelector2, { timeout: wait }).click();
      cy.get(filterlistselector, { timeout: wait }).eq(index,{timeout:2000}).click({force:true});
    }
  });
});
Cypress.Commands.add('waitForElementAndClick', (selector, wait = 10000) => {
  cy.get(selector, { timeout: wait })
    .should('be.visible')
    .should('not.be.disabled')
    .click();
});

Cypress.Commands.add('waitForElementwithIndexClick', (selector,index, wait = 10000) => {
  cy.get(selector, { timeout: wait })
    .should('be.visible')
    .should('not.be.disabled')
    .eq(index)
    .click();
});

Cypress.Commands.add('verifyText', (selector, Text, wait = 10000) => {

  cy.get(selector,{ timeout: wait }).invoke('text').should($txt => {
    expect($txt).to.contain(Text);
  });
});

Cypress.Commands.add('verifyTextWithIndex', (selector, index, Text, wait = 10000) => {

  cy.get(selector,{ timeout: wait }).eq(index,{ timeout: wait }).invoke('text').should($txt => {
    expect($txt).to.contain(Text);
  });
});

Cypress.Commands.add('clickStudy', (scope) => {
  cy.visit(scope.baseUrl);
  cy.contains('All Studies').click();
  cy.wait('@studies');
  cy.get('div h2').eq(0).invoke('text').then($txt => {
    scope.firstProtocolName = $txt;
  });

  let indexProtocol;
  if(scope.amountOfStudies === 3) {
    indexProtocol = 2;
  } else {
    indexProtocol = 1;
  }

  cy.get('div h2').eq(indexProtocol).invoke('text').then($txt => {
    scope.secondProtocolName = $txt;
  });

  cy.get('div h4').eq(0).invoke('text').then($txt => {
    scope.firstSponsorName = $txt;
  });

  cy.get('div h4').eq(1).invoke('text').then($txt => {
    scope.secondSponsorName = $txt;
  });
  cy.contains('Study XYZ567').parent().find('button').click();
});

Cypress.Commands.add('loginSupplyManager', () => {
  cy.get('#email').type(Cypress.env('supply_manager_username'));
  cy.get('#password').type(Cypress.env('supply_manager_password'));
  cy.get('#next').click();
});

Cypress.Commands.add('login', () => {
  cy.get('#email').type(Cypress.env('username'));
  cy.get('#password').type(Cypress.env('password'));
  cy.get('#next').click();
});

Cypress.Commands.add('createSubject', (scope) => {

  cy.contains('Subject Management').click();
    cy.get('.css-bsszx1 ').should($h2 => {
      expect($h2).to.contain('Screen New Subject');
    });

    cy.contains('Screen New Subject').click();
    cy.get('.css-1nrzr1n').should($txt => {
      expect($txt).to.contain('BioPab: Study XYZ567 - Site 1');
    });

    cy.get('.css-1b3dexb').should($txt => {
      expect($txt).to.contain('Screen a new subject into Study XYZ567');
    });

    cy.get('.css-1u755n2').eq(0).should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Subject's initials`);
    });

    cy.get('.css-1u755n2').eq(1).should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Subject's date of birth`);
    });

    cy.get('.css-1u755n2').eq(2).should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Subject's gender`);
    });

    cy.get('.css-1f4gnxv').eq(0).should($txt => {
      expect($txt).to.contain('First');
    });

    cy.get('.css-1f4gnxv').eq(1).should($txt => {
      expect($txt).to.contain('Last');
    });
    cy.get('[name="firstFLInitValue"]').type('P');
    cy.get('[name="lastFLInitValue"]').type('Q');
    cy.get('[aria-label= "Choose date"] > svg').eq(0).click();
    cy.get('div > button:nth-child(7)').click();
    cy.get('#mui-component-select-genderValue').click().then(() => {
      cy.get('#menu-genderValue ul li').eq(0).should(maleOption => {
        expect(maleOption).to.contain('Male');
      });
      cy.get('#menu-genderValue ul li').eq(1).should(femaleOption => {
        expect(femaleOption).to.contain('Female');
      });
      cy.get('#menu-genderValue ul li').eq(2).should(unspecifiedOption => {
        expect(unspecifiedOption).to.contain('Unspecified');
      });
    });

    cy.get('#menu-genderValue ul li').eq(0).click({ force: true });
    cy.get('.MuiDialogActions-spacing button').eq(1).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('body').then((body) => {
        if (body.find('[data-testid = "add-subject-done-dialogue-confirm"]').length > 0) {
          cy.log('Unique subject created');
        }
        else {
          cy.log('Duplicate subject created');
          cy.get('input[type="checkbox"]').click();
          cy.get('[data-testid=add-subj-confirm]').click({force: true});
        }
    });

    cy.get('.css-1bcp2a2').parent().within($el => {
      cy.wrap($el).invoke('text').then($text => {
        let no = $text.replace(/[^0-9]/gi,'');
        let kitNo = no.substring('0','2');
        let visitNo = no.substring('2','5');
        let subjectNo = `${kitNo}-${visitNo}`;
        scope.subjectId = subjectNo;
        cy.wrap(subjectNo).as('subjectNo');
      });
    });

    cy.get('.css-4sqi6x').invoke('text').should($txt => {
      expect($txt).to.contain('Success!');
    });

    cy.get('[role="dialog"] div p').invoke('text').should($txt => {
      expect($txt).to.contain('Subject');
      expect($txt).to.contain('has been successfully screened into');
      expect($txt).to.contain(scope.subjectStudyXYZ567);
    });

    let nextDayDate = dayjs().add(1, 'day');
    nextDayDate = (nextDayDate.format('DD MMM YYYY'));

    cy.get('[role="dialog"] div h6').invoke('text').should($txt => {
      expect($txt).to.contain(`The subject's next expected visit is ${nextDayDate}.`);
    });

    cy.get('[data-testid=add-subject-done-dialogue-confirm]').click({force: true});
    cy.get('@subjectNo').then(subjectNo => {
      cy.contains(subjectNo).should('be.visible');
      cy.get('input[type$="search"]').clear().type(subjectNo);
    });
});

Cypress.Commands.add('verifyTextWithId', (selector, Text1, Text2, Text3, wait = 10000) => {
  cy.get(selector,{timeout:wait}).invoke('text').should($txt => {
    expect($txt).to.contain(Text1);
    expect($txt).to.contain(Text2);
    expect($txt).to.contain(Text3);
  });
});

Cypress.Commands.add('clickRadiobuttonWithIndex', (selector,index, wait = 10000) => {
  cy.get(selector, { timeout: wait }).eq(index).click();
});

Cypress.Commands.add('visitPageAndClearwinCookies',() => {
  cy.window().then((win) => {
    cy.clearCookies();
    cy.clearLocalStorage();
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('visitPageAndClearCookies',(baseUrl) => {
  cy.visit(baseUrl, {
    onBeforeLoad: (win) => {
      win.sessionStorage.clear();
    }
  });
});

Cypress.Commands.add('enterPin', (firstPin, secondPin, thirdPin, fourthPin, fifthPin, sixthPin) => {
  cy.get('#pin-first-digit').clear().type(firstPin);
  cy.get('#pin-second-digit').clear().type(secondPin);
  cy.get('#pin-third-digit').clear().type(thirdPin);
  cy.get('#pin-fourth-digit').clear().type(fourthPin);
  cy.get('#pin-fifth-digit').clear().type(fifthPin);
  cy.get('#pin-sixth-digit').clear().type(sixthPin);
});

Cypress.Commands.add('clickEnrollStudy', (scope) => {
  cy.visit(scope.baseUrl);
  cy.contains('All Studies').click();
  cy.wait('@studies');
  cy.get('div h2').eq(0).invoke('text').then($txt => {
    scope.firstProtocolName = $txt;
  });

  let indexProtocol;
  if(scope.amountOfStudies === 3) {
    indexProtocol = 2;
  } else {
    indexProtocol = 1;
  }

  cy.get('div h2').eq(indexProtocol).invoke('text').then($txt => {
    scope.secondProtocolName = $txt;
  });

  cy.get('div h4').eq(0).invoke('text').then($txt => {
    scope.firstSponsorName = $txt;
  });

  cy.get('div h4').eq(1).invoke('text').then($txt => {
    scope.secondSponsorName = $txt;
  });
  cy.contains('Study XYZ Enrollment').parent().find('button').click();
});


Cypress.Commands.add('enrollNewSubject', (scope) => {

  cy.get('ul > div:nth-child(4) > div').click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(3000);
    cy.get('.css-bsszx1 ').should($h2 => {
      expect($h2).to.contain('Enroll New Subject');
    });

    cy.contains('Enroll New Subject').click();
    cy.get('.css-1nrzr1n').should($txt => {
      expect($txt).to.contain('Golgi: Study XYZ Enrollment - Site 1');
    });

    cy.get('.css-1b3dexb').should($txt => {
      expect($txt).to.contain('Enroll a new subject into Study XYZ Enrollment');
    });

    cy.get('.css-1u755n2').eq(0).should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Subject's initials`);
    });

    cy.get('.css-1u755n2').eq(1).should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Subject's date of birth`);
    });

    cy.get('.css-1u755n2').eq(2).should($txt => {
      // eslint-disable-next-line quotes
      expect($txt).to.contain(`Subject's gender`);
    });

    cy.get('.css-1f4gnxv').eq(0).should($txt => {
      expect($txt).to.contain('First');
    });

    cy.get('.css-1f4gnxv').eq(1).should($txt => {
      expect($txt).to.contain('Last');
    });
    cy.get('[name="firstFLInitValue"]').type('P');
    cy.get('[name="lastFLInitValue"]').type('Q');
    cy.get('[aria-label= "Choose date"] > svg').eq(0).click();
    cy.get('div > button:nth-child(7)').click();
    cy.get('#mui-component-select-genderValue').click().then(() => {
      cy.get('#menu-genderValue ul li').eq(0).should(maleOption => {
        expect(maleOption).to.contain('Male');
      });
      cy.get('#menu-genderValue ul li').eq(1).should(femaleOption => {
        expect(femaleOption).to.contain('Female');
      });
      cy.get('#menu-genderValue ul li').eq(2).should(unspecifiedOption => {
        expect(unspecifiedOption).to.contain('Unspecified');
      });
    });

    cy.get('#menu-genderValue ul li').eq(0).click({ force: true });
    cy.get('.MuiDialogActions-spacing button').eq(1).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('body').then((body) => {
        if (body.find('[data-testid="add-subj-dlg"]').length > 0) {
          cy.log('Unique subject created');
        }
        else {
          cy.log('Duplicate subject created');
          cy.get('input[type="checkbox"]').click();
          cy.get('[data-testid=add-subj-confirm]').click({force: true});
        }
    });

    cy.get('.css-1h72pae').invoke('text').should($txt => {
      expect($txt).to.contain('Confirm your intent');
    });
    cy.get('[role="dialog"] div p').eq(0).invoke('text').should($txt => {
      expect($txt).to.contain('Please confirm the above information is accurate for new enrollment in Study XYZ Enrollment. This information will determine which kit(s) are assigned to the subject.');
      // expect($txt).to.contain('Study XYZ Enrollment ');
      // expect($txt).to.contain('. This information will determine which kit(s) are assigned to the subject.');
    });
    cy.get('.css-1j3c8z8').eq(1).invoke('text').should($txt => {
      expect($txt).to.contain('After confirming you will be provided a list of kit(s) to dispense to the subject.');
    });
    cy.get('.css-elikd0').eq(0).click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.css-1m9pwf3').eq(2).click();
    cy.get('[data-testid="enroll-subj-continue"]').click();
    cy.get('.MuiDialogActions-spacing button').eq(1).click();

    cy.get('.css-1b3dexb').parent().within($el => {
      cy.wrap($el).invoke('text').then($text => {
        let no = $text.replace(/[^0-9]/gi,'');
        let kitNo = no.substring('0','2');
        let visitNo = no.substring('2','5');
        let subjectNo = `${kitNo}-${visitNo}`;
        scope.subjectId = subjectNo;
        cy.wrap(subjectNo).as('subjectNo');
      });
    });
    cy.get('.css-1xsto0d').invoke('text').should($txt => {
      expect($txt).to.contain(`You have successfully randomized and assigned 3 kits to Subject ${scope.subjectId}.`);
    });

    let nextDayDate = dayjs().add(14, 'day');
    nextDayDate = (nextDayDate.format('DD MMM YYYY'));

    cy.get('[role="dialog"] div h6').eq(2).invoke('text').should($txt => {
      expect($txt).to.contain(`The subject's next expected visit is: ${nextDayDate}. (+/- 3 days)`);
    });

    cy.get('[data-testid="add-subject-done-dialogue-confirm"]').click({force: true});
    cy.get('@subjectNo').then(subjectNo => {
      cy.contains(subjectNo).should('be.visible');
      cy.get('input[type$="search"]').clear().type(subjectNo);
    });
});

Cypress.Commands.add('getAccessToken',(scope) => {
  cy.get('.MuiListItemButton-root').click().then(() => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
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

Cypress.Commands.add('getAccessTokenSupplyUSer',(scope) => {
  cy.get('.MuiListItemButton-root').click().then(() => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
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

Cypress.Commands.add('verifyStudyName',(scope) => {
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
});

Cypress.Commands.add('verifyStudyEnrollName',(scope) => {
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
     if(element['studyName'] === 'Study XYZ Enrollment') {
      scope.subjectStudyXYZ567 = element['studyName'];
     }
    });
    expect(resp.status).to.eq(200);
  });
});