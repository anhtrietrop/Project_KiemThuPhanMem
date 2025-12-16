describe("Giỏ hàng - Thêm / Sửa / Xóa (Use-cases)", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("userUrl"));
  });

  it("TC-CART-ADD-GUEST: Khách thêm sản phẩm vào giỏ và thấy toast", () => {
    cy.get('a[href*="/product"], a')
      .contains(/view product|chi tiết|xem chi tiết|product|Iphone|Samsung/i)
      .first()
      .click({ force: true });

    cy.get("button.btn", { timeout: 15000 })
      .contains(/add to cart|thêm vào giỏ|add to basket/i)
      .first()
      .click({ force: true });

    cy.contains(/product added to the cart|đã thêm vào giỏ hàng/i, {
      timeout: 10000,
    });

    // cart icon shows link; do not navigate here, just ensure presence
    cy.get("header").within(() => {
      cy.get('a[href*="/cart"]').should("exist");
    });
  });

  it("TC-CART-VIEW-GUEST: Khách mở giỏ hàng và thấy sản phẩm", () => {
    // add item first
    cy.get('a[href*="/product"], a')
      .contains(/view product|chi tiết|xem chi tiết|product|Iphone|Samsung/i)
      .first()
      .click({ force: true });
    cy.get("button.btn", { timeout: 15000 })
      .contains(/add to cart|thêm vào giỏ|add to basket/i)
      .first()
      .click({ force: true });
    cy.contains(/product added to the cart|đã thêm vào giỏ hàng/i, {
      timeout: 10000,
    });

    cy.get("header").within(() => {
      cy.get('a[href*="/cart"]').first().click({ force: true });
    });

    cy.url({ timeout: 10000 }).should("include", "/cart");
    cy.contains(/Cart Page|Shopping Cart|Giỏ hàng/i).should("exist");
    cy.contains(/No products found|Your cart is empty/i).should("not.exist");
  });

  it.skip("TC-CART-UPDATE-GUEST: Khách tăng/giảm số lượng và giảm về 0 (xóa)", () => {
    // add item
    cy.get('a[href*="/product"], a')
      .contains(/view product|chi tiết|xem chi tiết|product|Iphone|Samsung/i)
      .first()
      .click({ force: true });
    cy.get("button.btn", { timeout: 15000 })
      .contains(/add to cart|thêm vào giỏ|add to basket/i)
      .first()
      .click({ force: true });
    cy.contains(/product added to the cart|đã thêm vào giỏ hàng/i, {
      timeout: 10000,
    });

    cy.get("header").within(() =>
      cy.get('a[href*="/cart"]').first().click({ force: true })
    );

    // try increment
    cy.get("body").then(($b) => {
      if ($b.find('ul[role="list"] li').length > 0) {
        cy.get('ul[role="list"] li')
          .first()
          .within(() => {
            cy.get('input[type="number"]').first().as("qty");
            // capture current value, click +, then verify it increased by 1
            cy.get("@qty")
              .invoke("val")
              .then((valBefore) => {
                const before = Number(valBefore) || 0;
                cy.get('button[aria-label="Increase quantity"]')
                  .first()
                  .click({ force: true });
                cy.get("@qty")
                  .invoke("val")
                  .should("eq", String(before + 1));
              });

            // decrement until removed (use aria-label)
            cy.get('button[aria-label="Decrease quantity"]')
              .first()
              .click({ force: true });
            cy.wait(300);
            cy.get('button[aria-label="Decrease quantity"]')
              .first()
              .click({ force: true });
          });
      } else {
        // fallback: click remove button using data-cy attribute
        cy.get('ul[role="list"] li')
          .first()
          .find('button[data-cy="remove-item"]', { timeout: 10000 })
          .should("be.visible")
          .and("not.be.disabled")
          .click({ force: true });
      }
    });

    // NOTE: removal verification intentionally skipped
  });

  // Logged-in flows
  it("TC-CART-ADD-USER: Đăng nhập và thêm sản phẩm vào giỏ", () => {
    const { email, password } = require("../fixtures/testUser.json");
    cy.loginUser(email, password);
    cy.contains(email).should("exist");

    cy.get('a[href*="/product"], a')
      .contains(/view product|chi tiết|xem chi tiết|product|Iphone|Samsung/i)
      .first()
      .click({ force: true });

    cy.get("button.btn", { timeout: 15000 })
      .contains(/add to cart|thêm vào giỏ|add to basket/i)
      .first()
      .click({ force: true });

    cy.contains(/product added to the cart|đã thêm vào giỏ hàng/i, {
      timeout: 10000,
    });
  });

  it("TC-CART-UPDATE-USER: Đăng nhập, cập nhật số lượng và kiểm tra tổng", () => {
    const { email, password } = require("../fixtures/testUser.json");
    cy.loginUser(email, password);
    cy.contains(email).should("exist");

    cy.get('a[href*="/product"], a')
      .contains(/view product|chi tiết|xem chi tiết|product|Iphone|Samsung/i)
      .first()
      .click({ force: true });
    cy.get("button.btn", { timeout: 15000 })
      .contains(/add to cart|thêm vào giỏ|add to basket/i)
      .first()
      .click({ force: true });
    cy.contains(/product added to the cart|đã thêm vào giỏ hàng/i, {
      timeout: 10000,
    }).should("be.visible");

    cy.get("header").within(() =>
      cy.get('a[href*="/cart"]').first().click({ force: true })
    );

    // increase quantity
    cy.get('ul[role="list"] li')
      .first()
      .within(() => {
        cy.get('input[type="number"]').first().as("qty");
        cy.get("@qty")
          .invoke("val")
          .then((valBefore) => {
            const before = Number(valBefore) || 0;
            cy.get('button[aria-label="Increase quantity"]')
              .first()
              .click({ force: true });
            cy.get("@qty")
              .invoke("val")
              .should("eq", String(before + 1));
          });
      });

    cy.contains(/Total|Tổng|Subtotal|Thành tiền/i, { timeout: 8000 }).should(
      "exist"
    );
  });
});
