/// <reference types="cypress" />

describe("share location", () => {
  beforeEach(() => {
    cy.visit("/").then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition")
        .as("getUserLocation")
        .callsFake((cb) => {
          setTimeout(() => {
            cb({
              coords: {
                latitude: 43.5,
                longitude: 32,
              },
            });
          }, 100);
        });

      cy.stub(win.navigator.clipboard, "writeText")
        .as("shareLocation")
        .resolves();
    });
  });

  it("should fetch the user location", () => {
    cy.get('[data-cy="get-loc-btn"]').click();
    cy.get("@getUserLocation").should("have.been.called");
    cy.get('[data-cy="get-loc-btn"]').should("be.disabled");
    cy.get('[data-cy="actions"]').should("contain", "Location fetched!");
  });

  it(" should share our location", () => {
    cy.get('[data-cy="name-input"]').type("Jafar");
    cy.get('[data-cy="get-loc-btn"]').click();
    cy.get('[data-cy="share-loc-btn"]').click();
    cy.get("@shareLocation").should("have.been.called");
  });
});
