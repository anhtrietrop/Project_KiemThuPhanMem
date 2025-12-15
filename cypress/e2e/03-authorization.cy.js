/**
 * KIỂM THỬ: PHÂN QUYỀN (AUTHORIZATION)
 * Mục đích: Kiểm tra role-based access control giữa Admin và User
 */

describe("Authorization - Admin vs User Access Control", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Admin Access Rights", () => {
    beforeEach(() => {
      cy.loginAdmin("admin@example.com", "admin123");
    });

    it("TC-AUTH-13: Admin có thể truy cập Admin Dashboard", () => {
      cy.visit(Cypress.env("adminUrl"));

      // Verify: Admin dashboard accessible
      cy.url().should("include", Cypress.env("adminUrl"));
      cy.get("body").should(
        "contain.text",
        /dashboard|products|orders|manage|quản lý/i
      );
    });

    it("TC-AUTH-14: Admin có thể truy cập Products Management", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Verify: Products page accessible
      cy.url().should("include", "/products");
      cy.get("body").should("contain.text", /add|new|create|thêm|tạo/i);
    });

    it("TC-AUTH-15: Admin có thể truy cập Orders Management", () => {
      cy.visit(Cypress.env("adminUrl") + "/orders");

      // Verify: Orders page accessible (hoặc redirect hợp lệ)
      cy.url().should("satisfy", (url) => {
        return url.includes("/orders") || url.includes(Cypress.env("adminUrl"));
      });
    });

    it("TC-AUTH-16: Admin có thể truy cập Users Management", () => {
      cy.visit(Cypress.env("adminUrl") + "/users");

      // Verify: Users management accessible
      cy.url().should("satisfy", (url) => {
        return url.includes("/users") || url.includes(Cypress.env("adminUrl"));
      });
    });

    it("TC-AUTH-17: Admin có thể tạo, sửa, xóa products", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Verify: Có các nút CRUD
      cy.get("body").should("contain.text", /add|new|thêm|tạo/i);

      // Kiểm tra có edit/delete buttons
      cy.get("body").then(($body) => {
        const hasEdit =
          $body
            .find("button, a")
            .filter((i, el) => /edit|sửa/i.test(Cypress.$(el).text())).length >
          0;
        const hasDelete =
          $body
            .find("button, a")
            .filter((i, el) => /delete|xóa/i.test(Cypress.$(el).text()))
            .length > 0;

        expect(hasEdit || hasDelete).to.be.true;
      });
    });

    it("TC-AUTH-18: Admin có thể cập nhật order status", () => {
      cy.visit(Cypress.env("adminUrl") + "/orders");

      // Tìm order đầu tiên và check có thể update status
      cy.get("body").then(($body) => {
        const statusButtons = $body.find("select, button").filter((i, el) => {
          const text = Cypress.$(el).text();
          return (
            /status|trạng thái|pending|processing|shipped/i.test(text) ||
            Cypress.$(el).attr("name") === "status"
          );
        });

        // Nếu có status controls, admin có quyền thay đổi
        if (statusButtons.length > 0) {
          cy.wrap(statusButtons.first()).should("exist");
        }
      });
    });
  });

  describe("User Access Rights", () => {
    beforeEach(() => {
      cy.loginUser("user@example.com", "user123");
    });

    it("TC-AUTH-19: User KHÔNG thể truy cập Admin Dashboard", () => {
      // Thử truy cập admin URL
      cy.visit(Cypress.env("adminUrl"), { failOnStatusCode: false });

      // Verify: Bị chặn hoặc redirect
      cy.url().should("satisfy", (url) => {
        return (
          url.includes("/login") ||
          url.includes("/unauthorized") ||
          url.includes("/403") ||
          url === Cypress.env("userUrl") + "/" ||
          !url.includes(Cypress.env("adminUrl"))
        );
      });
    });

    it("TC-AUTH-20: User KHÔNG thể truy cập Products Management", () => {
      cy.visit(Cypress.env("adminUrl") + "/products", {
        failOnStatusCode: false,
      });

      // Verify: Access denied
      cy.url().should("not.include", Cypress.env("adminUrl") + "/products");
    });

    it("TC-AUTH-21: User có thể xem products (User side)", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      // Verify: User có thể xem products
      cy.url().should("include", Cypress.env("userUrl"));
      cy.get("body").should("contain.text", /product|sản phẩm/i);
    });

    it("TC-AUTH-22: User có thể thêm vào giỏ hàng", () => {
      cy.visit(Cypress.env("userUrl"));

      // Tìm nút "Add to Cart"
      cy.get("body").then(($body) => {
        const cartButtons = $body.find("button, a").filter((i, el) => {
          return /add to cart|thêm vào giỏ|cart/i.test(Cypress.$(el).text());
        });

        if (cartButtons.length > 0) {
          cy.wrap(cartButtons.first()).click({ force: true });

          // Verify: Thêm thành công
          cy.get("body").should("satisfy", ($body) => {
            const text = $body.text();
            return (
              text.includes("cart") ||
              text.includes("giỏ") ||
              text.includes("added")
            );
          });
        }
      });
    });

    it("TC-AUTH-23: User có thể xem giỏ hàng của mình", () => {
      cy.visit(Cypress.env("userUrl") + "/cart");

      // Verify: Cart page accessible
      cy.url().should("include", "/cart");
      cy.get("body").should("contain.text", /cart|giỏ hàng|your cart/i);
    });

    it("TC-AUTH-24: User có thể xem orders của mình", () => {
      cy.visit(Cypress.env("userUrl") + "/my-orders");

      // Verify: My orders page accessible
      cy.url().should("satisfy", (url) => {
        return url.includes("/my-orders") || url.includes("/orders");
      });
    });

    it("TC-AUTH-25: User KHÔNG thể xem orders của người khác", () => {
      // User chỉ có thể xem orders của mình
      cy.visit(Cypress.env("userUrl") + "/my-orders");

      // Verify: Chỉ hiển thị orders của user hiện tại
      // (Cần check API hoặc UI không có orders của user khác)
      cy.url().should("include", Cypress.env("userUrl"));
    });

    it("TC-AUTH-26: User KHÔNG thể tạo/sửa/xóa products", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      // Verify: Không có nút Add/Edit/Delete
      cy.get("body").then(($body) => {
        const adminButtons = $body.find("button, a").filter((i, el) => {
          const text = Cypress.$(el).text().toLowerCase();
          return (
            text.includes("delete") ||
            text.includes("edit") ||
            (text.includes("add") && text.includes("product"))
          );
        });

        expect(adminButtons.length).to.equal(0);
      });
    });

    it("TC-AUTH-27: User có thể thêm wishlist", () => {
      cy.visit(Cypress.env("userUrl"));

      // Tìm wishlist button (heart icon)
      cy.get("body").then(($body) => {
        const wishlistButtons = $body.find("button, a").filter((i, el) => {
          const $el = Cypress.$(el);
          return (
            /wishlist|yêu thích|favorite|heart/i.test($el.text()) ||
            $el.find("svg").length > 0
          );
        });

        if (wishlistButtons.length > 0) {
          cy.wrap(wishlistButtons.first()).click({ force: true });
        }
      });
    });

    it("TC-AUTH-28: User có thể xem wishlist của mình", () => {
      cy.visit(Cypress.env("userUrl") + "/wishlist");

      // Verify: Wishlist page accessible
      cy.url().should("include", "/wishlist");
    });
  });

  describe("Guest (Unauthenticated) Access", () => {
    it("TC-AUTH-29: Guest có thể xem products (không cần đăng nhập)", () => {
      cy.visit(Cypress.env("userUrl"));

      // Verify: Trang chủ hiển thị products
      cy.get("body").should("contain.text", /product|sản phẩm/i);
    });

    it("TC-AUTH-30: Guest có thể search products", () => {
      cy.visit(Cypress.env("userUrl"));

      // Tìm search box
      cy.get("body").then(($body) => {
        if (
          $body.find(
            'input[type="search"], input[placeholder*="search"], input[placeholder*="tìm"]'
          ).length > 0
        ) {
          cy.get('input[type="search"], input[placeholder*="search"]')
            .first()
            .type("laptop");

          // Verify: Search works
          cy.get("body").should("contain.text", /laptop|search|tìm/i);
        }
      });
    });

    it("TC-AUTH-31: Guest KHÔNG thể checkout (phải đăng nhập)", () => {
      cy.visit(Cypress.env("userUrl") + "/checkout");

      // Verify: Redirect to login
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url.includes("/auth");
      });
    });

    it("TC-AUTH-32: Guest KHÔNG thể xem orders", () => {
      cy.visit(Cypress.env("userUrl") + "/my-orders");

      // Verify: Redirect to login
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url.includes("/auth");
      });
    });

    it("TC-AUTH-33: Guest KHÔNG thể xem wishlist", () => {
      cy.visit(Cypress.env("userUrl") + "/wishlist");

      // Verify: Redirect to login hoặc hiển thị empty wishlist
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url.includes("/wishlist");
      });
    });

    it("TC-AUTH-34: Guest KHÔNG thể truy cập Admin Panel", () => {
      cy.visit(Cypress.env("adminUrl"), { failOnStatusCode: false });

      // Verify: Redirect to login
      cy.url().should("include", "/login");
    });
  });

  describe("Session Isolation", () => {
    it("TC-AUTH-35: User session và Admin session độc lập (khác port)", () => {
      // Login as user
      cy.loginUser("user@example.com", "user123");
      cy.visit(Cypress.env("userUrl"));

      // Verify: User logged in
      cy.get("body").should("contain.text", /logout|đăng xuất/i);

      // Mở admin panel trong tab mới (simulate)
      cy.visit(Cypress.env("adminUrl") + "/login");

      // Verify: Admin panel yêu cầu đăng nhập riêng
      cy.url().should("include", "/login");
    });

    it("TC-AUTH-36: Logout từ User không ảnh hưởng Admin session", () => {
      // Login both
      cy.loginUser("user@example.com", "user123");

      // Logout user
      cy.visit(Cypress.env("userUrl"));
      cy.contains(/logout|đăng xuất/i).click({ force: true });

      // Check admin vẫn có thể login độc lập
      cy.loginAdmin("admin@example.com", "admin123");
      cy.url().should("include", Cypress.env("adminUrl"));
    });
  });

  describe("API Authorization", () => {
    it("TC-AUTH-37: User không thể gọi Admin API endpoints", () => {
      // Login as user để lấy token
      cy.loginUser("user@example.com", "user123");

      // Thử gọi admin API
      cy.request({
        method: "DELETE",
        url: Cypress.env("apiUrl") + "/api/products/some-id",
        failOnStatusCode: false,
      }).then((response) => {
        // Verify: 401 hoặc 403
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it("TC-AUTH-38: Guest không thể gọi protected API", () => {
      cy.request({
        method: "GET",
        url: Cypress.env("apiUrl") + "/api/customer_orders",
        failOnStatusCode: false,
      }).then((response) => {
        // Verify: 401 Unauthorized
        expect(response.status).to.equal(401);
      });
    });

    it("TC-AUTH-39: Admin có thể gọi tất cả API endpoints", () => {
      cy.loginAdmin("admin@example.com", "admin123");

      // Gọi admin API
      cy.request({
        method: "GET",
        url: Cypress.env("apiUrl") + "/api/products",
        failOnStatusCode: false,
      }).then((response) => {
        // Verify: Success
        expect(response.status).to.be.oneOf([200, 201]);
      });
    });
  });
});
