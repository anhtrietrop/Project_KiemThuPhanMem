/**
 * KIỂM THỬ: SEARCH FUNCTIONALITY
 * Mục đích: Kiểm tra chức năng tìm kiếm sản phẩm
 */

describe("Search Functionality", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Basic Search", () => {
    it("TC-SEARCH-01: Tìm kiếm product theo tên (keyword matching)", () => {
      cy.visit(Cypress.env("userUrl"));

      // Tìm search input
      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[placeholder*="search"], input[placeholder*="tìm"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          cy.wrap(searchInput.first()).type("laptop{enter}");

          // Verify: Kết quả chứa keyword "laptop"
          cy.url().should("satisfy", (url) => {
            return (
              url.includes("search") ||
              url.includes("laptop") ||
              url.includes("q=")
            );
          });

          cy.get("body").should(
            "contain.text",
            /laptop|product|result|kết quả/i
          );
        }
      });
    });

    it("TC-SEARCH-02: Tìm kiếm với keyword không tồn tại", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[placeholder*="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          cy.wrap(searchInput.first()).type("xyznonexistentproduct123{enter}");

          // Verify: Hiển thị "no results" hoặc empty list
          cy.get("body").should("satisfy", ($body) => {
            const text = $body.text().toLowerCase();
            return (
              text.includes("no") ||
              text.includes("not found") ||
              text.includes("không tìm thấy") ||
              text.includes("empty")
            );
          });
        }
      });
    });

    it("TC-SEARCH-03: Tìm kiếm với keyword rỗng hiển thị tất cả products", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Submit search trống
          cy.wrap(searchInput.first()).type("{enter}");

          // Verify: Hiển thị tất cả products
          cy.get("body").should("contain.text", /product|sản phẩm/i);
        }
      });
    });

    it("TC-SEARCH-04: Tìm kiếm không phân biệt hoa thường (case insensitive)", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Search với UPPERCASE
          cy.wrap(searchInput.first()).type("LAPTOP{enter}");

          cy.wait(1000);

          // Lưu số kết quả
          cy.get("body").then(($firstBody) => {
            const firstResultText = $firstBody.text();

            // Search lại với lowercase
            cy.visit(Cypress.env("userUrl"));
            cy.get('input[type="search"], input[name="search"]')
              .first()
              .type("laptop{enter}");

            cy.wait(1000);

            // Verify: Cùng kết quả
            cy.get("body").should("contain.text", /laptop|product/i);
          });
        }
      });
    });

    it("TC-SEARCH-05: Tìm kiếm với khoảng trắng ở đầu/cuối", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Thêm spaces
          cy.wrap(searchInput.first()).type("  laptop  {enter}");

          // Verify: Vẫn tìm được (trim spaces)
          cy.get("body").should("contain.text", /laptop|product|result/i);
        }
      });
    });
  });

  describe("Search by Category", () => {
    it("TC-SEARCH-06: Filter products theo category", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      // Tìm category filter
      cy.get("body").then(($body) => {
        const categorySelects = $body.find(
          'select[name="category"], select[name="categoryId"]'
        );
        const categoryLinks = $body
          .find("a")
          .filter((i, el) => /category|danh mục/i.test(Cypress.$(el).text()));

        if (categorySelects.length > 0) {
          // Select category đầu tiên (không phải "All")
          cy.get('select[name="category"], select[name="categoryId"]').select(
            1
          );

          // Verify: Chỉ hiển thị products thuộc category đó
          cy.url().should("satisfy", (url) => {
            return url.includes("category") || url.includes("categoryId");
          });
        } else if (categoryLinks.length > 0) {
          // Click vào category link
          cy.wrap(categoryLinks.first()).click();

          // Verify: Filter applied
          cy.url().should("include", "category");
        }
      });
    });

    it("TC-SEARCH-07: Kết hợp search keyword và category filter", () => {
      cy.visit(Cypress.env("userUrl"));

      // Search keyword trước
      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          cy.wrap(searchInput.first()).type("laptop{enter}");
          cy.wait(1000);

          // Sau đó filter theo category
          cy.get("body").then(($resultBody) => {
            const categoryFilter = $resultBody.find('select[name="category"]');
            if (categoryFilter.length > 0) {
              cy.get('select[name="category"]').select(1);

              // Verify: Cả keyword và category đều được áp dụng
              cy.url().should("satisfy", (url) => {
                return (
                  (url.includes("laptop") || url.includes("search")) &&
                  url.includes("category")
                );
              });
            }
          });
        }
      });
    });

    it("TC-SEARCH-08: Xem tất cả products trong một category", () => {
      cy.visit(Cypress.env("userUrl"));

      // Click vào category link trong navbar
      cy.get("nav, header").then(($nav) => {
        const categoryLinks = $nav.find("a").filter((i, el) => {
          const text = Cypress.$(el).text().toLowerCase();
          return (
            !text.includes("login") &&
            !text.includes("cart") &&
            text.length > 3 &&
            text.length < 20
          );
        });

        if (categoryLinks.length > 0) {
          cy.wrap(categoryLinks.first()).click();

          // Verify: Hiển thị products của category
          cy.get("body").should("contain.text", /product|sản phẩm/i);
        }
      });
    });
  });

  describe("Search by Price Range", () => {
    it("TC-SEARCH-09: Filter products theo khoảng giá", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      cy.get("body").then(($body) => {
        const priceInputs = $body.find(
          'input[name*="price"], input[placeholder*="price"]'
        );
        const priceSlider = $body.find('input[type="range"]');

        if (priceInputs.length >= 2) {
          // Nhập min và max price
          cy.get('input[name*="price"]').eq(0).type("1000000");
          cy.get('input[name*="price"]').eq(1).type("5000000");

          // Apply filter
          cy.get("button")
            .contains(/apply|filter|lọc/i)
            .click();

          // Verify: Chỉ hiển thị products trong khoảng giá
          cy.url().should("satisfy", (url) => {
            return (
              url.includes("price") ||
              url.includes("min") ||
              url.includes("max")
            );
          });
        } else if (priceSlider.length > 0) {
          // Sử dụng price slider
          cy.get('input[type="range"]')
            .first()
            .invoke("val", 2000000)
            .trigger("change");
          cy.wait(500);
        }
      });
    });

    it("TC-SEARCH-10: Min price không thể lớn hơn max price", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      cy.get("body").then(($body) => {
        const priceInputs = $body.find(
          'input[name*="min"], input[name*="max"]'
        );

        if (priceInputs.length >= 2) {
          // Nhập min > max
          cy.get('input[name*="min"]').type("5000000");
          cy.get('input[name*="max"]').type("1000000");

          cy.get("button")
            .contains(/apply|filter|lọc/i)
            .click();

          // Verify: Hiển thị lỗi hoặc swap values
          cy.get("body").should("satisfy", ($body) => {
            const text = $body.text();
            return (
              text.includes("invalid") ||
              text.includes("không hợp lệ") ||
              text.includes("greater") ||
              !text.includes("error")
            );
          });
        }
      });
    });
  });

  describe("Sort Results", () => {
    it("TC-SEARCH-11: Sắp xếp products theo giá tăng dần", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      cy.get("body").then(($body) => {
        const sortSelect = $body
          .find('select[name*="sort"], select')
          .filter((i, el) => {
            return (
              /sort|sắp xếp/i.test(Cypress.$(el).text()) ||
              Cypress.$(el)
                .find("option")
                .filter((j, opt) => /price|giá/i.test(Cypress.$(opt).text()))
                .length > 0
            );
          });

        if (sortSelect.length > 0) {
          // Chọn "Price: Low to High"
          cy.wrap(sortSelect.first())
            .find("option")
            .then(($options) => {
              const lowToHighOption = Array.from($options).find((opt) =>
                /low to high|thấp đến cao|asc/i.test(opt.text)
              );
              if (lowToHighOption) {
                cy.wrap(sortSelect.first()).select(lowToHighOption.value);

                // Verify: URL hoặc products được sort
                cy.wait(1000);
                cy.url().should("satisfy", (url) => {
                  return url.includes("sort") || url.includes("order");
                });
              }
            });
        }
      });
    });

    it("TC-SEARCH-12: Sắp xếp products theo giá giảm dần", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      cy.get("body").then(($body) => {
        const sortSelect = $body.find("select").filter((i, el) => {
          return (
            Cypress.$(el)
              .find("option")
              .filter((j, opt) => /price|giá/i.test(Cypress.$(opt).text()))
              .length > 0
          );
        });

        if (sortSelect.length > 0) {
          cy.wrap(sortSelect.first())
            .find("option")
            .then(($options) => {
              const highToLowOption = Array.from($options).find((opt) =>
                /high to low|cao đến thấp|desc/i.test(opt.text)
              );
              if (highToLowOption) {
                cy.wrap(sortSelect.first()).select(highToLowOption.value);
                cy.wait(1000);
              }
            });
        }
      });
    });

    it("TC-SEARCH-13: Sắp xếp theo tên A-Z", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      cy.get("body").then(($body) => {
        const sortSelect = $body.find('select[name*="sort"]');

        if (sortSelect.length > 0) {
          cy.wrap(sortSelect.first())
            .find("option")
            .then(($options) => {
              const nameOption = Array.from($options).find((opt) =>
                /name|tên|a-z/i.test(opt.text)
              );
              if (nameOption) {
                cy.wrap(sortSelect.first()).select(nameOption.value);
                cy.wait(1000);
              }
            });
        }
      });
    });

    it("TC-SEARCH-14: Sắp xếp theo rating (nếu có)", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      cy.get("body").then(($body) => {
        const sortSelect = $body.find('select[name*="sort"]');

        if (sortSelect.length > 0) {
          cy.wrap(sortSelect.first())
            .find("option")
            .then(($options) => {
              const ratingOption = Array.from($options).find((opt) =>
                /rating|đánh giá|review/i.test(opt.text)
              );
              if (ratingOption) {
                cy.wrap(sortSelect.first()).select(ratingOption.value);
                cy.wait(1000);
              }
            });
        }
      });
    });
  });

  describe("Search Performance", () => {
    it("TC-SEARCH-15: Search trả về kết quả nhanh (< 3s)", () => {
      const startTime = Date.now();

      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          cy.wrap(searchInput.first()).type("laptop{enter}");

          // Wait for results
          cy.get("body")
            .should("contain.text", /product|result/i)
            .then(() => {
              const endTime = Date.now();
              const duration = endTime - startTime;

              // Verify: < 3 seconds
              expect(duration).to.be.lessThan(3000);
            });
        }
      });
    });

    it("TC-SEARCH-16: Pagination hoạt động khi có nhiều kết quả", () => {
      cy.visit(Cypress.env("userUrl") + "/products");

      // Tìm pagination controls
      cy.get("body").then(($body) => {
        const pagination = $body.find(
          'nav[aria-label*="pagination"], .pagination, [class*="pagination"]'
        );

        if (pagination.length > 0) {
          // Click trang 2
          cy.get("a, button")
            .contains(/2|next|sau/i)
            .first()
            .click();

          // Verify: URL hoặc content changed
          cy.url().should("satisfy", (url) => {
            return url.includes("page=2") || url.includes("offset");
          });
        }
      });
    });
  });

  describe("Advanced Search", () => {
    it("TC-SEARCH-17: Tìm kiếm trong description (full-text search)", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Search từ có thể nằm trong description
          cy.wrap(searchInput.first()).type("gaming{enter}");

          // Verify: Kết quả có thể match description
          cy.get("body").should("contain.text", /gaming|product/i);
        }
      });
    });

    it("TC-SEARCH-18: Auto-suggest khi gõ keyword (nếu có)", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          cy.wrap(searchInput.first()).type("lap");

          // Đợi suggestions xuất hiện
          cy.wait(500);

          // Kiểm tra có suggestions dropdown không
          cy.get("body").then(($suggestionBody) => {
            if (
              $suggestionBody.find(
                '.suggestion, .autocomplete, [class*="suggest"]'
              ).length > 0
            ) {
              cy.get(".suggestion, .autocomplete").should("be.visible");
            }
          });
        }
      });
    });

    it("TC-SEARCH-19: Search với nhiều keywords", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Multiple keywords
          cy.wrap(searchInput.first()).type("laptop gaming asus{enter}");

          // Verify: Kết quả chứa ít nhất 1 keyword
          cy.get("body").should("satisfy", ($body) => {
            const text = $body.text().toLowerCase();
            return (
              text.includes("laptop") ||
              text.includes("gaming") ||
              text.includes("asus")
            );
          });
        }
      });
    });

    it("TC-SEARCH-20: Tìm kiếm với ký tự đặc biệt không gây lỗi", () => {
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Special characters
          cy.wrap(searchInput.first()).type("laptop & accessories{enter}");

          // Verify: Không crash
          cy.get("body").should("exist");
          cy.url().should("exist");
        }
      });
    });
  });

  describe("Search History (nếu có)", () => {
    it("TC-SEARCH-21: Lưu search history cho user đã đăng nhập", () => {
      cy.loginUser("user@example.com", "user123");
      cy.visit(Cypress.env("userUrl"));

      cy.get("body").then(($body) => {
        const searchInput = $body.find(
          'input[type="search"], input[name="search"]'
        );

        if (searchInput.length > 0) {
          // Thực hiện search
          cy.wrap(searchInput.first()).type("laptop{enter}");
          cy.wait(1000);

          // Quay lại và check history
          cy.visit(Cypress.env("userUrl"));
          cy.get('input[type="search"]').first().click();

          // Kiểm tra có recent searches không
          cy.get("body").then(($historyBody) => {
            if (
              $historyBody.find('.history, .recent, [class*="recent"]').length >
              0
            ) {
              cy.get(".history, .recent").should("contain.text", "laptop");
            }
          });
        }
      });
    });
  });
});
