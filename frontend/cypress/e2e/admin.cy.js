/// <reference types="cypress" />
describe('Happy Path of an Admin', () => {

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

  it('Registers a new admin', () => {
    cy.visit('/register');
    cy.get('input[id="register-name"]').type("Test Name")
    cy.get('input[id="register-email"]').type(email);
    cy.get('input[id="register-password"]').type(password);
    cy.get('input[id="register-confirm-password"]').type(password);
    cy.contains('button', 'Register').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
  });

  it('Creates a new game', () => {
    cy.visit('/dashboard');
    cy.contains('button', 'Create New Game').click();
    cy.get('input[id="gameName"]').type("Test New Game");
    cy.contains('button', 'Create Game').click();
    cy.contains("Test New Game").should('exist');
  });

  it('Starts a game', () => {
    cy.visit('/dashboard');
    cy.contains('button', 'Start Game').click();
    cy.contains('button', 'Close').click();
    cy.contains('Session Active').should('exist');
  });

  it('Stops game and gets results', () => {
    cy.visit('/dashboard');
    cy.contains('Stop Game').click();
    cy.contains('Game Session Stopped').should('exist');
    cy.contains('button', 'View Results').click();
    cy.url().should('include', '/results');
    cy.contains('Session Results').should('exist');
    cy.contains('Top 5 Players').should('exist');
  });

  it('Logs out and in again', () => {
    cy.visit('/dashboard');
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
    cy.contains('Login');

    cy.get('input[id="login-email"]').type(email);
    cy.get('input[id="login-password"]').type(password);
    cy.contains('button', 'Login').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
    cy.contains("Test New Game").should('exist');
  });
});
  