describe("Tìm kiếm - Người dùng", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("userUrl"));
  });

  it("TC-SEARCH-01: Tìm kiếm sản phẩm từ header (full match)", () => {
    cy.get("header").within(() => {
      cy.get('input[placeholder="Type here"], input[type="text"]')
        .first()
        .should("be.visible")
        .type("Samsung{enter}");
    });

    // Trang search hiển thị kết quả cho từ khóa
    cy.contains(
      /Showing results for|Showing results|Kết quả|Sản phẩm|Showing results for Samsung/i,
      { timeout: 8000 }
    ).should("exist");
    cy.url().should("include", "/search?search=");
  });

  it("TC-SEARCH-02: Partial match tìm kiếm (ví dụ 'Sam')", () => {
    cy.get("header").within(() => {
      cy.get('input[placeholder="Type here"], input[type="text"]')
        .first()
        .should("be.visible")
        .type("Sam{enter}");
    });

    cy.contains(/Showing results for|Showing results|Kết quả/i, {
      timeout: 8000,
    }).should("exist");
    cy.url().should("include", "search=");
  });

  it("TC-SEARCH-03: Gửi tìm kiếm rỗng -> điều hướng tới trang search (empty query)", () => {
    // Trigger submit by pressing Enter on the header search input (safer than form.submit())
    cy.get("header").within(() => {
      cy.get('input[placeholder="Type here"], input[type="text"]')
        .first()
        .should("be.visible")
        .focus()
        .type("{enter}");
    });

    // Should navigate to search page (may be empty param)
    cy.url({ timeout: 8000 }).should((u) => {
      expect(u).to.match(/\/search\?search=*/);
    });
    // Section title exists and show empty / no-results message
    cy.contains("Search Page").should("exist");
    cy.contains(
      /No products found for specified query|No products found/i
    ).should("exist");
  });

  it("TC-SEARCH-04: No results (gibberish) shows no-products message", () => {
    cy.get("header").within(() => {
      cy.get('input[placeholder="Type here"], input[type="text"]')
        .first()
        .should("be.visible")
        .type("zzzxxyy{enter}");
    });

    cy.contains(/No products found for specified query|No products found/i, {
      timeout: 8000,
    }).should("exist");
  });

  it("TC-SEARCH-05: Accent/diacritics and case-insensitive check (partial)", () => {
    cy.get("header").within(() => {
      cy.get('input[placeholder="Type here"], input[type="text"]')
        .first()
        .should("be.visible")
        .type("iphone{enter}");
    });

    cy.contains(/Showing results for|Showing results|Iphone|iphone|IPhone/i, {
      timeout: 8000,
    }).should("exist");
  });
});
