describe("Sản phẩm - Xem chi tiết", () => {
  it("TC-PRODUCT-01: Xem trang chi tiết sản phẩm", () => {
    cy.visit(Cypress.env("userUrl"));

    // Mở trang sản phẩm đầu tiên
    cy.get("a,button")
      .contains(/product|view product|chi tiết|xem chi tiết|Iphone|Samsung/i)
      .first()
      .click({ force: true });

    // Kiểm tra tiêu đề và nút Thêm vào giỏ
    cy.get("h1, h2").first().should("exist");
    cy.contains("button", /add to cart|thêm vào giỏ|mua ngay/i).should(
      "be.visible"
    );
  });
});
