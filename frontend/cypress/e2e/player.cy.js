describe('Happy Path of a Player', () => {

    // Make local storeage persist
    let LOCAL_STORAGE_MEMORY = {};
    beforeEach(() => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
        localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
    });
    afterEach(() => {
    Object.keys(localStorage).forEach(key => {
        LOCAL_STORAGE_MEMORY[key] = localStorage.getItem(key);
    });
    });

    const timestamp = Date.now();
    const email = `admin${timestamp}@test.com`;
    const password = 'password';
  
    it('Set up -> Registers a new admin, creates a game, starts a game', () => {
      // Registers
      cy.visit('/register');
      cy.get('input[id="register-name"]').type("Dummy Admin")
      cy.get('input[id="register-email"]').type(email);
      cy.get('input[id="register-password"]').type(password);
      cy.get('input[id="register-confirm-password"]').type(password);
      cy.contains('button', 'Register').click();
      cy.wait(1000)
      // Creates new game
      cy.url().should('include', '/dashboard');
      cy.contains('button', 'Create New Game').click();
      cy.get('input[id="gameName"]').type("Test New Game");
      cy.contains('button', 'Create Game').click();
      cy.contains("Test New Game").should('exist');
      // Adds questions to the game
      cy.contains('button', 'Edit').click();
      cy.url().should('include', '/game');
      cy.contains('button', 'Add Question').click();
      cy.contains('Question 1: New Question')
        .parent()
        .siblings()
        .contains('Edit')
        .click();
      cy.url().should('include', '/question');
      cy.contains('button', '+ Add Answer').click();
      cy.get('input[placeholder="Answer 1"]').type('Test Answer 1');
      cy.get('input[type="checkbox"]').check();
      cy.contains('button', '+ Add Answer').click();
      cy.get('input[placeholder="Answer 2"]').type('Test Answer 2');
      cy.contains('button', 'Save Question').click();
      // Start Game
      cy.contains('button', '← Back to Dashboard').click();
      cy.url().should('include', '/dashboard');
      cy.contains('button', 'Start Game').click();
      cy.get('input[readonly]').eq(0).invoke('val').then((val) => {
        Cypress.env('sessionId', val);
      });
    });

    it('Joins a game', () => {
        const id = Cypress.env('sessionId');
        expect(id).to.exist;
        cy.visit(`/join?sessionId=${id}`);
        cy.contains('label', 'Name').parent().find('input').type('Test Name');
        cy.contains('button', 'Join Game').click();
        cy.url().should('include', '/lobby');
    })

    it('Advances the game', () => {
        cy.visit('/dashboard');
        cy.contains('button', 'Control Session').click();
        cy.url().should('include', '/session');
        cy.contains('button', 'Advance to Next Question').click();
    })

    it('Answers a question', () => {
        cy.visit('/play');
        cy.contains('button', 'Test Answer 1').click();
    })

    it('Ends the game via advance', () => {
        cy.visit('/dashboard');
        cy.contains('button', 'Control Session').click();
        cy.url().should('include', '/session');
        cy.contains('button', 'Advance to Next Question').click();
    })

    it('Progresses to results page', () => {
        cy.visit('/play');
        cy.url().should('include', '/results');
        cy.contains('Your Results');
        cy.contains('Result: Correct');
    })
  });
  
  
  