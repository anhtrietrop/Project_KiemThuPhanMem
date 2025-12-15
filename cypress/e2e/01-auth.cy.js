/**
 * KIỂM THỬ: LOGIN & REGISTER
 * Mục đích: Kiểm tra chức năng đăng nhập và đăng ký người dùng
 */

describe("Authentication - Login & Register", () => {
  beforeEach(() => {
    // Clear cookies và localStorage trước mỗi test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("User Login", () => {
    it("TC-AUTH-01: Đăng nhập thành công với tài khoản User hợp lệ", () => {
      cy.visit(Cypress.env("userUrl") + "/login");

      // Nhập thông tin đăng nhập
      cy.get('input[name="email"], input[type="email"]')
        .should("be.visible")
        .type("user@example.com");
      cy.get('input[name="password"], input[type="password"]')
        .should("be.visible")
        .type("user123");

      // Click nút đăng nhập
      cy.get('button[type="submit"]')
        .contains(/đăng nhập|login/i)
        .click();

      // Verify: Chuyển hướng về trang chủ sau khi đăng nhập thành công
      cy.url().should("not.include", "/login");
      cy.url().should("include", Cypress.env("userUrl"));

      // Verify: Hiển thị thông tin user hoặc nút logout
      cy.get("body").should(
        "contain.text",
        /logout|đăng xuất|profile|tài khoản/i
      );
    });

    it("TC-AUTH-02: Đăng nhập thất bại với email sai", () => {
      cy.visit(Cypress.env("userUrl") + "/login");

      cy.get('input[name="email"], input[type="email"]').type(
        "wrong@example.com"
      );
      cy.get('input[name="password"], input[type="password"]').type(
        "password123"
      );
      cy.get('button[type="submit"]')
        .contains(/đăng nhập|login/i)
        .click();

      // Verify: Hiển thị thông báo lỗi
      cy.get("body").should(
        "contain.text",
        /invalid|incorrect|sai|không tồn tại/i
      );

      // Verify: Vẫn ở trang login
      cy.url().should("include", "/login");
    });

    it("TC-AUTH-03: Đăng nhập thất bại với password sai", () => {
      cy.visit(Cypress.env("userUrl") + "/login");

      cy.get('input[name="email"], input[type="email"]').type(
        "user@example.com"
      );
      cy.get('input[name="password"], input[type="password"]').type(
        "wrongpassword"
      );
      cy.get('button[type="submit"]')
        .contains(/đăng nhập|login/i)
        .click();

      // Verify: Hiển thị thông báo lỗi
      cy.get("body").should("contain.text", /invalid|incorrect|sai|mật khẩu/i);
      cy.url().should("include", "/login");
    });

    it("TC-AUTH-04: Đăng nhập thất bại với trường bỏ trống", () => {
      cy.visit(Cypress.env("userUrl") + "/login");

      // Submit form trống
      cy.get('button[type="submit"]')
        .contains(/đăng nhập|login/i)
        .click();

      // Verify: HTML5 validation hoặc error message
      cy.get('input[name="email"], input[type="email"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });
  });

  describe("Admin Login", () => {
    it("TC-AUTH-05: Admin đăng nhập thành công vào Admin Panel", () => {
      cy.visit(Cypress.env("adminUrl") + "/login");

      cy.get('input[name="email"], input[type="email"]').type(
        "admin@example.com"
      );
      cy.get('input[name="password"], input[type="password"]').type("admin123");
      cy.get('button[type="submit"]')
        .contains(/đăng nhập|login/i)
        .click();

      // Verify: Redirect đến dashboard
      cy.url().should("not.include", "/login");
      cy.url().should("include", Cypress.env("adminUrl"));

      // Verify: Hiển thị admin dashboard elements
      cy.get("body").should(
        "contain.text",
        /dashboard|products|orders|quản lý/i
      );
    });

    it("TC-AUTH-06: User thường không thể đăng nhập vào Admin Panel", () => {
      cy.visit(Cypress.env("adminUrl") + "/login");

      // Thử đăng nhập bằng tài khoản user
      cy.get('input[name="email"], input[type="email"]').type(
        "user@example.com"
      );
      cy.get('input[name="password"], input[type="password"]').type("user123");
      cy.get('button[type="submit"]')
        .contains(/đăng nhập|login/i)
        .click();

      // Verify: Hiển thị lỗi hoặc không cho phép truy cập
      cy.url().should("satisfy", (url) => {
        return (
          url.includes("/login") ||
          url.includes("/unauthorized") ||
          url.includes("/403")
        );
      });
    });
  });

  describe("User Registration", () => {
    it("TC-AUTH-07: Đăng ký thành công với thông tin hợp lệ", () => {
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@example.com`;

      cy.visit(Cypress.env("userUrl") + "/register");

      // Nhập thông tin đăng ký
      cy.get('input[name="email"], input[type="email"]').type(testEmail);
      cy.get('input[name="password"], input[type="password"]')
        .first()
        .type("Password123!");

      // Confirm password (nếu có)
      cy.get("body").then(($body) => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type("Password123!");
        }
      });

      // Name field (nếu có)
      cy.get("body").then(($body) => {
        if (
          $body.find('input[name="name"], input[name="username"]').length > 0
        ) {
          cy.get('input[name="name"], input[name="username"]').type(
            "Test User"
          );
        }
      });

      cy.get('button[type="submit"]')
        .contains(/đăng ký|register|sign up/i)
        .click();

      // Verify: Chuyển hướng sau khi đăng ký thành công
      cy.url().should("not.include", "/register");
    });

    it("TC-AUTH-08: Đăng ký thất bại với email đã tồn tại", () => {
      cy.visit(Cypress.env("userUrl") + "/register");

      // Dùng email đã có
      cy.get('input[name="email"], input[type="email"]').type(
        "user@example.com"
      );
      cy.get('input[name="password"], input[type="password"]')
        .first()
        .type("Password123!");

      cy.get("body").then(($body) => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type("Password123!");
        }
      });

      cy.get('button[type="submit"]')
        .contains(/đăng ký|register/i)
        .click();

      // Verify: Hiển thị lỗi email đã tồn tại
      cy.get("body").should(
        "contain.text",
        /already exists|đã tồn tại|already taken/i
      );
    });

    it("TC-AUTH-09: Đăng ký thất bại với mật khẩu không khớp", () => {
      cy.visit(Cypress.env("userUrl") + "/register");

      const timestamp = Date.now();
      cy.get('input[name="email"], input[type="email"]').type(
        `test${timestamp}@example.com`
      );
      cy.get('input[name="password"], input[type="password"]')
        .first()
        .type("Password123!");

      // Nhập confirm password khác
      cy.get("body").then(($body) => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type("DifferentPassword!");
          cy.get('button[type="submit"]')
            .contains(/đăng ký|register/i)
            .click();

          // Verify: Hiển thị lỗi mật khẩu không khớp
          cy.get("body").should(
            "contain.text",
            /not match|không khớp|do not match/i
          );
        }
      });
    });

    it("TC-AUTH-10: Đăng ký thất bại với email không hợp lệ", () => {
      cy.visit(Cypress.env("userUrl") + "/register");

      // Email không đúng format
      cy.get('input[name="email"], input[type="email"]').type("invalid-email");
      cy.get('input[name="password"], input[type="password"]')
        .first()
        .type("Password123!");

      cy.get('button[type="submit"]')
        .contains(/đăng ký|register/i)
        .click();

      // Verify: HTML5 validation
      cy.get('input[name="email"], input[type="email"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });
  });

  describe("Session Management", () => {
    it("TC-AUTH-11: Logout thành công", () => {
      // Đăng nhập trước
      cy.loginUser("user@example.com", "user123");

      // Đợi trang load xong
      cy.wait(1000);

      // Click logout
      cy.contains(/logout|đăng xuất|sign out/i).click({ force: true });

      // Verify: Redirect về login hoặc trang chủ
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url === Cypress.env("userUrl") + "/";
      });

      // Verify: Không còn hiển thị thông tin user
      cy.get("body").should(
        "not.contain.text",
        /my account|tài khoản của tôi/i
      );
    });

    it("TC-AUTH-12: Session persist sau khi refresh trang", () => {
      cy.loginUser("user@example.com", "user123");

      // Refresh trang
      cy.reload();

      // Verify: Vẫn đăng nhập
      cy.url().should("not.include", "/login");
      cy.get("body").should("contain.text", /logout|đăng xuất|profile/i);
    });
  });
});
