const getUser = () =>
  ({ email: `${crypto.randomUUID()}@local.host`, password: 'Loc@l.h0st' } as const);

Cypress.on('uncaught:exception', (_err, _runnable) => {
  return false;
});

describe('basic user flow', () => {
  const user = getUser();

  it('should be visitable', () => {
    cy.visit('/');
  });

  it('should redirect anon to auth', () => {
    cy.visit('/');
    cy.url().should('include', '/auth?redirectToPath=%2F');
  });

  it('should sign up', () => {
    cy.signup(user);
  });

  it('should log in', () => {
    cy.login(user);
  });

  it('should log in and log out', () => {
    cy.login(user);
    cy.get('header').find('button[aria-haspopup="menu"]').click();
    cy.get('a[href="/logout"]').click();
  });
});

it('create organization', () => {
  const user = getUser();
  cy.visit('/');
  cy.signup(user);
  cy.get('input[name="name"]').type('Bubatzbieber');
  cy.get('button[type="submit"]').click();
  cy.get('h1').contains('Bubatzbieber');
});

it.only('oidc login for organization', async () => {
  const organizationAdminUser = getUser();
  cy.visit('/');
  cy.signup(organizationAdminUser);
  cy.get('input[name="name"]').type('Bubatzbieber');
  cy.get('button[type="submit"]').click();
  cy.get('h1').contains('Bubatzbieber');
  cy.get('a[href$="/view/settings"]').click();
  cy.get('a[href$="/view/settings#create-oidc-integration"]').click();
  cy.get('input[id="tokenEndpoint"]').type('http://oidc-server-mock:80/connect/token');
  cy.get('input[id="userinfoEndpoint"]').type('http://oidc-server-mock:80/connect/userinfo');
  cy.get('input[id="authorizationEndpoint"]').type('http://localhost:7043/connect/authorize');
  cy.get('input[id="clientId"]').type('implicit-mock-client');
  cy.get('input[id="clientSecret"]').type('client-credentials-mock-client-secret');

  cy.get('div[role="dialog"]').find('button[type="submit"]').click();
  cy.get('div[role="dialog"]')
    .find('code')
    .last()
    .then($elem => $elem.text())
    .then(url => {
      cy.visit('/logout');

      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.visit(url);

      cy.get('input[id="Input_Username"]').type('test-user');
      cy.get('input[id="Input_Password"]').type('password');
      cy.get('button[value="login"]').click();

      cy.get('h1').contains('Bubatzbieber');
    });
});
