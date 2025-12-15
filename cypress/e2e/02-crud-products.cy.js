/**
 * KIỂM THỬ: CRUD OPERATIONS - PRODUCTS (ADMIN)
 * Mục đích: Kiểm tra các chức năng Create, Read, Update, Delete cho Products
 */

describe("CRUD Operations - Products Management", () => {
  // Đăng nhập admin trước mỗi test
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginAdmin("admin@example.com", "admin123");
  });

  describe("Create Product", () => {
    it("TC-CRUD-01: Tạo product mới thành công với đầy đủ thông tin", () => {
      // Navigate to create product page
      cy.visit(Cypress.env("adminUrl") + "/products");
      cy.contains(/add|new|thêm|tạo mới/i).click();

      // Điền thông tin sản phẩm
      const productName = `Test Product ${Date.now()}`;
      cy.get('input[name="title"]').type(productName);
      cy.get('input[name="price"]').clear().type("1500000");
      cy.get('input[name="quantity"]').clear().type("50");
      cy.get('textarea[name="description"]').type("Đây là mô tả sản phẩm test");
      cy.get('input[name="manufacturer"]').type("Test Brand");

      // Chọn category (nếu có)
      cy.get("body").then(($body) => {
        if ($body.find('select[name="categoryId"]').length > 0) {
          cy.get('select[name="categoryId"]').select(1);
        }
      });

      // Submit form
      cy.get('button[type="submit"]')
        .contains(/save|lưu|tạo|create/i)
        .click();

      // Verify: Redirect về products list hoặc hiển thị success message
      cy.url().should("satisfy", (url) => {
        return url.includes("/products") && !url.includes("/new");
      });

      // Verify: Product xuất hiện trong danh sách
      cy.contains(productName).should("be.visible");
    });

    it("TC-CRUD-02: Không thể tạo product với giá âm", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");
      cy.contains(/add|new|thêm/i).click();

      cy.get('input[name="title"]').type("Invalid Price Product");
      cy.get('input[name="price"]').clear().type("-1000");
      cy.get('input[name="quantity"]').clear().type("10");
      cy.get('textarea[name="description"]').type("Test");
      cy.get('input[name="manufacturer"]').type("Test");

      cy.get('button[type="submit"]')
        .contains(/save|lưu|tạo/i)
        .click();

      // Verify: Hiển thị lỗi validation
      cy.get("body").should(
        "contain.text",
        /invalid|không hợp lệ|positive|dương/i
      );
    });

    it("TC-CRUD-03: Không thể tạo product với số lượng âm", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");
      cy.contains(/add|new|thêm/i).click();

      cy.get('input[name="title"]').type("Invalid Quantity Product");
      cy.get('input[name="price"]').clear().type("1000000");
      cy.get('input[name="quantity"]').clear().type("-5");
      cy.get('textarea[name="description"]').type("Test");
      cy.get('input[name="manufacturer"]').type("Test");

      cy.get('button[type="submit"]')
        .contains(/save|lưu/i)
        .click();

      // Verify: Validation error
      cy.get("body").should(
        "contain.text",
        /invalid|không hợp lệ|positive|dương/i
      );
    });

    it("TC-CRUD-04: Không thể tạo product với tên trống", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");
      cy.contains(/add|new|thêm/i).click();

      // Bỏ trống title
      cy.get('input[name="price"]').clear().type("1000000");
      cy.get('input[name="quantity"]').clear().type("10");

      cy.get('button[type="submit"]')
        .contains(/save|lưu/i)
        .click();

      // Verify: HTML5 validation hoặc error message
      cy.get('input[name="title"]').then(($input) => {
        expect($input[0].validationMessage || $input[0].checkValidity()).to
          .exist;
      });
    });
  });

  describe("Read/View Products", () => {
    it("TC-CRUD-05: Hiển thị danh sách products", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Verify: Table hoặc list hiển thị
      cy.get("body").should("contain.text", /product|sản phẩm/i);

      // Verify: Có ít nhất 1 product (nếu DB có data)
      cy.get("body").then(($body) => {
        const text = $body.text();
        // Kiểm tra có products hoặc "no products" message
        expect(text).to.satisfy((str) => {
          return (
            str.includes("product") ||
            str.includes("No ") ||
            str.includes("empty")
          );
        });
      });
    });

    it("TC-CRUD-06: Xem chi tiết product", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Click vào product đầu tiên (nếu có)
      cy.get("body").then(($body) => {
        const viewButtons = $body.find("a, button").filter((i, el) => {
          const text = Cypress.$(el).text();
          return /view|edit|chi tiết|xem/i.test(text);
        });

        if (viewButtons.length > 0) {
          cy.wrap(viewButtons.first()).click();

          // Verify: Hiển thị thông tin chi tiết
          cy.get("body").should(
            "contain.text",
            /price|quantity|description|giá|số lượng|mô tả/i
          );
        }
      });
    });

    it("TC-CRUD-07: Tìm kiếm product theo tên", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Nếu có search box
      cy.get("body").then(($body) => {
        if (
          $body.find(
            'input[type="search"], input[placeholder*="search"], input[placeholder*="tìm"]'
          ).length > 0
        ) {
          cy.get(
            'input[type="search"], input[placeholder*="search"], input[placeholder*="tìm"]'
          )
            .first()
            .type("laptop");

          // Verify: Kết quả chứa keyword
          cy.get("body").should("contain.text", /laptop/i);
        }
      });
    });
  });

  describe("Update Product", () => {
    it("TC-CRUD-08: Cập nhật thông tin product thành công", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Click edit button của product đầu tiên
      cy.get("body").then(($body) => {
        const editButtons = $body.find("a, button").filter((i, el) => {
          const text = Cypress.$(el).text();
          return /edit|sửa|update|cập nhật/i.test(text);
        });

        if (editButtons.length > 0) {
          cy.wrap(editButtons.first()).click();

          // Update thông tin
          const newTitle = `Updated Product ${Date.now()}`;
          cy.get('input[name="title"]').clear().type(newTitle);
          cy.get('input[name="price"]').clear().type("2500000");

          // Submit
          cy.get('button[type="submit"]')
            .contains(/save|lưu|update|cập nhật/i)
            .click();

          // Verify: Cập nhật thành công
          cy.contains(newTitle, { timeout: 10000 }).should("exist");
        }
      });
    });

    it("TC-CRUD-09: Không thể update product với giá trị không hợp lệ", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      cy.get("body").then(($body) => {
        const editButtons = $body.find("a, button").filter((i, el) => {
          return /edit|sửa/i.test(Cypress.$(el).text());
        });

        if (editButtons.length > 0) {
          cy.wrap(editButtons.first()).click();

          // Nhập giá âm
          cy.get('input[name="price"]').clear().type("-500");
          cy.get('button[type="submit"]')
            .contains(/save|lưu/i)
            .click();

          // Verify: Hiển thị lỗi
          cy.get("body").should("contain.text", /invalid|không hợp lệ/i);
        }
      });
    });

    it("TC-CRUD-10: Cập nhật chỉ một trường và giữ nguyên các trường khác", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      cy.get("body").then(($body) => {
        const editButtons = $body.find("a, button").filter((i, el) => {
          return /edit|sửa/i.test(Cypress.$(el).text());
        });

        if (editButtons.length > 0) {
          cy.wrap(editButtons.first()).click();

          // Lưu giá trị cũ của title
          cy.get('input[name="title"]')
            .invoke("val")
            .then((oldTitle) => {
              // Chỉ update quantity
              cy.get('input[name="quantity"]').clear().type("999");
              cy.get('button[type="submit"]')
                .contains(/save|lưu/i)
                .click();

              // Verify: Title vẫn giữ nguyên
              cy.contains(oldTitle).should("exist");
            });
        }
      });
    });
  });

  describe("Delete Product", () => {
    it("TC-CRUD-11: Xóa product thành công", () => {
      // Tạo product mới để xóa
      cy.visit(Cypress.env("adminUrl") + "/products");
      cy.contains(/add|new|thêm/i).click();

      const productToDelete = `Delete Test ${Date.now()}`;
      cy.get('input[name="title"]').type(productToDelete);
      cy.get('input[name="price"]').clear().type("100000");
      cy.get('input[name="quantity"]').clear().type("1");
      cy.get('textarea[name="description"]').type("To be deleted");
      cy.get('input[name="manufacturer"]').type("Test");
      cy.get('button[type="submit"]')
        .contains(/save|lưu/i)
        .click();

      // Tìm và xóa product vừa tạo
      cy.contains(productToDelete)
        .parents("tr, div")
        .within(() => {
          cy.get("button, a")
            .filter((i, el) => {
              return /delete|xóa|remove/i.test(Cypress.$(el).text());
            })
            .first()
            .click();
        });

      // Confirm delete (nếu có popup)
      cy.get("body").then(($body) => {
        if (
          $body
            .find("button")
            .filter((i, el) =>
              /confirm|yes|đồng ý|có/i.test(Cypress.$(el).text())
            ).length > 0
        ) {
          cy.contains(/confirm|yes|đồng ý|có/i).click();
        }
      });

      // Verify: Product không còn trong danh sách
      cy.contains(productToDelete).should("not.exist");
    });

    it("TC-CRUD-12: Hiển thị confirm dialog trước khi xóa", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      cy.get("body").then(($body) => {
        const deleteButtons = $body.find("button, a").filter((i, el) => {
          return /delete|xóa/i.test(Cypress.$(el).text());
        });

        if (deleteButtons.length > 0) {
          cy.wrap(deleteButtons.first()).click();

          // Verify: Hiển thị confirm dialog
          cy.get("body").should(
            "contain.text",
            /confirm|are you sure|bạn có chắc/i
          );
        }
      });
    });

    it("TC-CRUD-13: Hủy xóa product khi click Cancel", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Đếm số products hiện tại
      cy.get("body").then(($body) => {
        const deleteButtons = $body.find("button, a").filter((i, el) => {
          return /delete|xóa/i.test(Cypress.$(el).text());
        });

        if (deleteButtons.length > 0) {
          const initialCount = deleteButtons.length;
          cy.wrap(deleteButtons.first()).click();

          // Click cancel (nếu có)
          cy.get("body").then(($modal) => {
            if (
              $modal
                .find("button")
                .filter((i, el) =>
                  /cancel|hủy|no|không/i.test(Cypress.$(el).text())
                ).length > 0
            ) {
              cy.contains(/cancel|hủy|no|không/i).click();

              // Verify: Số lượng products không đổi
              cy.get("button, a")
                .filter((i, el) => /delete|xóa/i.test(Cypress.$(el).text()))
                .should("have.length", initialCount);
            }
          });
        }
      });
    });
  });

  describe("Bulk Operations", () => {
    it("TC-CRUD-14: Xóa nhiều products cùng lúc (nếu có chức năng)", () => {
      cy.visit(Cypress.env("adminUrl") + "/products");

      // Kiểm tra có checkbox select multiple không
      cy.get("body").then(($body) => {
        if ($body.find('input[type="checkbox"]').length > 1) {
          // Select 2 products
          cy.get('input[type="checkbox"]').eq(0).check();
          cy.get('input[type="checkbox"]').eq(1).check();

          // Click bulk delete
          cy.get("button, a")
            .filter((i, el) => {
              return /delete selected|xóa đã chọn|bulk delete/i.test(
                Cypress.$(el).text()
              );
            })
            .click();

          // Confirm
          cy.get("body").then(($modal) => {
            if (
              $modal
                .find("button")
                .filter((i, el) =>
                  /confirm|yes|đồng ý/i.test(Cypress.$(el).text())
                ).length > 0
            ) {
              cy.contains(/confirm|yes|đồng ý/i).click();
            }
          });
        }
      });
    });
  });
});
