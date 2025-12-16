describe("Xác thực - Đăng nhập", () => {
  const {
    email: validEmail,
    password: validPassword,
  } = require("../fixtures/testUser.json");

  it("TC-AUTH-LOGIN-01: Đăng nhập thành công với thông tin hợp lệ (kiểm tra bằng email hiển thị)", () => {
    cy.visit(Cypress.env("userUrl") + "/login");

    cy.get('input[name="email"], input[type="email"]')
      .should("be.visible")
      .clear()
      .type(validEmail);
    cy.get('input[name="password"], input[type="password"]')
      .should("be.visible")
      .clear()
      .type(validPassword);

    cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i, {
      timeout: 10000,
    })
      .should("be.visible")
      .click();

    // Chờ chuyển hướng/UI cập nhật và kiểm tra header hiển thị email đã đăng nhập
    cy.url({ timeout: 10000 }).should("not.include", "/login");
    cy.get("body", { timeout: 10000 }).should("contain.text", validEmail);
  });

  it("TC-AUTH-LOGIN-02: Bỏ trống email khi submit hiển thị validation (không nhập email)", () => {
    cy.visit(Cypress.env("userUrl") + "/login");

    // để trống email
    cy.get('input[name="password"], input[type="password"]')
      .should("be.visible")
      .clear()
      .type(validPassword);
    cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i).click();

    // Kiểm tra HTML5 validation cho input email
    cy.get('input[name="email"], input[type="email"]').then(($el) => {
      expect($el[0].validationMessage).to.not.be.empty;
    });
  });

  it("TC-AUTH-LOGIN-03: Bỏ trống mật khẩu khi submit hiển thị validation hoặc lỗi", () => {
    cy.visit(Cypress.env("userUrl") + "/login");

    cy.get('input[name="email"], input[type="email"]')
      .should("be.visible")
      .clear()
      .type(validEmail);
    // để trống password
    cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i).click();

    cy.get('input[name="password"], input[type="password"]').then(($el) => {
      // hoặc HTML5 validation hoặc thông báo lỗi inline
      if ($el[0].validationMessage) {
        expect($el[0].validationMessage).to.not.be.empty;
      } else {
        cy.get("body").should(
          "contain.text",
          /password|mật khẩu|required|bắt buộc|vui lòng nhập/i
        );
      }
    });
  });

  it("TC-AUTH-LOGIN-04: Bỏ trống cả hai trường khi submit hiển thị validation", () => {
    cy.visit(Cypress.env("userUrl") + "/login");
    cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i).click();
    cy.get('input[name="email"], input[type="email"]').then(($el) => {
      expect($el[0].validationMessage).to.not.be.empty;
    });
  });

  it("TC-AUTH-LOGIN-05: Sai thông tin đăng nhập hiển thị lỗi", () => {
    cy.visit(Cypress.env("userUrl") + "/login");
    cy.get('input[name="email"], input[type="email"]')
      .clear()
      .type("wronguser@example.com");
    cy.get('input[name="password"], input[type="password"]')
      .clear()
      .type("wrongpassword");
    cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i).click();

    // Ứng dụng hiện thông báo lỗi: có thể là tiếng Anh hoặc tiếng Việt
    cy.contains(
      /Invalid email or password|Email hoặc mật khẩu không hợp lệ|Sai email hoặc mật khẩu/i,
      { timeout: 5000 }
    ).should("exist");
  });
});
