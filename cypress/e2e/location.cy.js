/// <reference types="cypress" />

describe("share location", () => {
  beforeEach(() => {
    cy.clock();
    cy.fixture("user-location.json").as("userLoaction");
    cy.get("@userLoaction").then((fakePostion) => {
      cy.visit("/").then((win) => {
        cy.stub(win.navigator.geolocation, "getCurrentPosition")
          .as("getUserLocation")
          .callsFake((cb) => {
            setTimeout(() => {
              cb(fakePostion);
            }, 100);
          });

        cy.stub(win.navigator.clipboard, "writeText")
          .as("shareLocation")
          .resolves();

        cy.spy(win.localStorage, "setItem").as("localStorage");
        cy.spy(win.localStorage, "getItem").as("getlocalStorage");
      });
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
    cy.get("@userLoaction").then((position) => {
      const { latitude, longitude } = position.coords;

      cy.get("@shareLocation").should(
        "have.been.calledWithMatch",
        new RegExp(`${latitude}.*${longitude}.*${encodeURI("Jafar")}`)
      );

      cy.get("@localStorage").should(
        "have.been.calledWithMatch",
        /Jafar/,
        new RegExp(`${latitude}.*${longitude}.*${encodeURI("Jafar")}`)
      );
    });
    cy.get("@localStorage").should("have.been.called");
    cy.get('[data-cy="share-loc-btn"]').click();
    cy.get("@getlocalStorage").should("have.been.called");
    cy.get('[data-cy="info-message"]').should("be.visible");
    cy.get('[data-cy="info-message"]').should("have.class", "visible");
    cy.tick(2000); // shuncha vaqt kutish anglatadi buni ishlatish uchun cy.clock() yozilishi kerak va each ichida yozilishining sababi u oldindan yuklangan bo'ladi
    cy.get('[data-cy="info-message"]').should("not.be.visible");
  });
});
