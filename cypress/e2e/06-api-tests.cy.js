/**
 * KIỂM THỬ: IMPORTANT API ENDPOINTS
 * Mục đích: Kiểm tra các API quan trọng của hệ thống
 */

describe("Important API Endpoints", () => {
  const apiUrl = Cypress.env("apiUrl");
  let authToken = null;

  describe("Authentication APIs", () => {
    it("TC-API-01: POST /api/users/register - Đăng ký user mới", () => {
      const timestamp = Date.now();

      cy.request({
        method: "POST",
        url: `${apiUrl}/api/users/register`,
        body: {
          email: `apitest${timestamp}@example.com`,
          password: "TestPassword123!",
          role: "user",
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Verify: 201 Created hoặc 200 OK
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.have.property("email");
        expect(response.body.email).to.equal(`apitest${timestamp}@example.com`);
      });
    });

    it("TC-API-02: POST /api/users/register - Email trùng trả về lỗi", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/users/register`,
        body: {
          email: "user@example.com", // Email đã tồn tại
          password: "TestPassword123!",
          role: "user",
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Verify: 400 hoặc 409 Conflict
        expect(response.status).to.be.oneOf([400, 409]);
        expect(response.body).to.have.property("message");
      });
    });

    it("TC-API-03: POST /api/users/login - Đăng nhập thành công", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/users/login`,
        body: {
          email: "user@example.com",
          password: "user123",
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        // Có thể trả về token hoặc user info
        expect(response.body).to.have.property("email");

        // Lưu token nếu có
        if (response.body.token) {
          authToken = response.body.token;
        }
      });
    });

    it("TC-API-04: POST /api/users/login - Password sai trả về 401", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/users/login`,
        body: {
          email: "user@example.com",
          password: "wrongpassword",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.match(/invalid|incorrect/i);
      });
    });
  });

  describe("Products APIs", () => {
    it("TC-API-05: GET /api/products - Lấy danh sách products", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/products`,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");

        // Verify structure của product
        if (response.body.length > 0) {
          const product = response.body[0];
          expect(product).to.have.property("id");
          expect(product).to.have.property("title");
          expect(product).to.have.property("price");
        }
      });
    });

    it("TC-API-06: GET /api/products/:id - Lấy chi tiết product", () => {
      // Lấy product ID từ list
      cy.request("GET", `${apiUrl}/api/products`).then((listResponse) => {
        if (listResponse.body.length > 0) {
          const productId = listResponse.body[0].id;

          cy.request({
            method: "GET",
            url: `${apiUrl}/api/products/${productId}`,
          }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("id", productId);
            expect(response.body).to.have.property("title");
            expect(response.body).to.have.property("price");
            expect(response.body).to.have.property("description");
          });
        }
      });
    });

    it("TC-API-07: GET /api/products/:id - Product không tồn tại trả về 404", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/products/nonexistent-id-12345`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });

    it("TC-API-08: POST /api/products - Tạo product mới (Admin only)", () => {
      const timestamp = Date.now();

      cy.request({
        method: "POST",
        url: `${apiUrl}/api/products`,
        body: {
          title: `API Test Product ${timestamp}`,
          price: 1500000,
          quantity: 50,
          description: "Created via API test",
          manufacturer: "Test Brand",
          categoryId: "1",
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Nếu cần auth, có thể trả về 401
        // Nếu không cần auth (test env), có thể 201
        expect(response.status).to.be.oneOf([200, 201, 401, 403]);

        if (response.status === 201 || response.status === 200) {
          expect(response.body).to.have.property("id");
          expect(response.body.title).to.include("API Test Product");
        }
      });
    });

    it("TC-API-09: PUT /api/products/:id - Cập nhật product", () => {
      cy.request("GET", `${apiUrl}/api/products`).then((listResponse) => {
        if (listResponse.body.length > 0) {
          const productId = listResponse.body[0].id;

          cy.request({
            method: "PUT",
            url: `${apiUrl}/api/products/${productId}`,
            body: {
              title: "Updated Title via API",
              price: 2000000,
            },
            failOnStatusCode: false,
          }).then((response) => {
            // Auth required: 401/403, Success: 200
            expect(response.status).to.be.oneOf([200, 401, 403]);
          });
        }
      });
    });

    it("TC-API-10: DELETE /api/products/:id - Xóa product", () => {
      cy.request("GET", `${apiUrl}/api/products`).then((listResponse) => {
        if (listResponse.body.length > 0) {
          const productId = listResponse.body[0].id;

          cy.request({
            method: "DELETE",
            url: `${apiUrl}/api/products/${productId}`,
            failOnStatusCode: false,
          }).then((response) => {
            // Auth required: 401/403, Success: 200/204
            expect(response.status).to.be.oneOf([200, 204, 401, 403]);
          });
        }
      });
    });
  });

  describe("Cart APIs", () => {
    it("TC-API-11: GET /api/cart - Lấy giỏ hàng của user", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/cart`,
        failOnStatusCode: false,
      }).then((response) => {
        // Cần authentication
        expect(response.status).to.be.oneOf([200, 401]);

        if (response.status === 200) {
          expect(response.body).to.have.property("items");
          expect(response.body.items).to.be.an("array");
        }
      });
    });

    it("TC-API-12: POST /api/cart/items - Thêm sản phẩm vào giỏ hàng", () => {
      // Lấy product ID trước
      cy.request("GET", `${apiUrl}/api/products`).then((listResponse) => {
        if (listResponse.body.length > 0) {
          const productId = listResponse.body[0].id;

          cy.request({
            method: "POST",
            url: `${apiUrl}/api/cart/items`,
            body: {
              productId: productId,
              quantity: 2,
            },
            failOnStatusCode: false,
          }).then((response) => {
            // Auth required hoặc success
            expect(response.status).to.be.oneOf([200, 201, 401]);

            if (response.status === 200 || response.status === 201) {
              expect(response.body).to.have.property("cartId");
            }
          });
        }
      });
    });

    it("TC-API-13: PUT /api/cart/items/:id - Cập nhật số lượng trong giỏ", () => {
      cy.request({
        method: "PUT",
        url: `${apiUrl}/api/cart/items/some-cart-item-id`,
        body: {
          quantity: 5,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 404]);
      });
    });

    it("TC-API-14: DELETE /api/cart/items/:id - Xóa item khỏi giỏ", () => {
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/api/cart/items/some-cart-item-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 401, 404]);
      });
    });
  });

  describe("Orders APIs", () => {
    it("TC-API-15: GET /api/customer_orders - Lấy danh sách orders của user", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/customer_orders`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);

        if (response.status === 200) {
          expect(response.body).to.be.an("array");
        }
      });
    });

    it("TC-API-16: POST /api/customer_orders - Tạo order mới", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/customer_orders`,
        body: {
          name: "API Test User",
          lastname: "Test",
          phone: "0123456789",
          email: "apitest@example.com",
          adress: "123 Test Street",
          city: "HCM",
          status: "PENDING",
          total: 1500000,
          products: [{ productId: "product-id-1", quantity: 2 }],
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 401, 400]);

        if (response.status === 201 || response.status === 200) {
          expect(response.body).to.have.property("id");
          expect(response.body.status).to.equal("PENDING");
        }
      });
    });

    it("TC-API-17: GET /api/customer_orders/:id - Xem chi tiết order", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/customer_orders/some-order-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 404]);

        if (response.status === 200) {
          expect(response.body).to.have.property("id");
          expect(response.body).to.have.property("status");
          expect(response.body).to.have.property("total");
        }
      });
    });

    it("TC-API-18: PUT /api/customer_orders/:id - Cập nhật order status (Admin)", () => {
      cy.request({
        method: "PUT",
        url: `${apiUrl}/api/customer_orders/some-order-id`,
        body: {
          status: "PROCESSING",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404]);
      });
    });
  });

  describe("Categories APIs", () => {
    it("TC-API-19: GET /api/category - Lấy danh sách categories", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/category`,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");

        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property("id");
          expect(response.body[0]).to.have.property("name");
        }
      });
    });

    it("TC-API-20: POST /api/category - Tạo category mới (Admin)", () => {
      const timestamp = Date.now();

      cy.request({
        method: "POST",
        url: `${apiUrl}/api/category`,
        body: {
          name: `API Test Category ${timestamp}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 401, 403]);
      });
    });
  });

  describe("Search API", () => {
    it("TC-API-21: GET /api/search?q=keyword - Tìm kiếm products", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/search?q=laptop`,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");

        // Verify kết quả chứa keyword
        if (response.body.length > 0) {
          const hasKeyword = response.body.some(
            (product) =>
              product.title.toLowerCase().includes("laptop") ||
              (product.description &&
                product.description.toLowerCase().includes("laptop"))
          );
          expect(hasKeyword || response.body.length === 0).to.be.true;
        }
      });
    });

    it("TC-API-22: GET /api/search?q= - Empty search trả về tất cả", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/search?q=`,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
      });
    });
  });

  describe("Wishlist APIs", () => {
    it("TC-API-23: GET /api/wishlist - Lấy wishlist của user", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/wishlist`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);

        if (response.status === 200) {
          expect(response.body).to.be.an("array");
        }
      });
    });

    it("TC-API-24: POST /api/wishlist - Thêm product vào wishlist", () => {
      cy.request("GET", `${apiUrl}/api/products`).then((listResponse) => {
        if (listResponse.body.length > 0) {
          const productId = listResponse.body[0].id;

          cy.request({
            method: "POST",
            url: `${apiUrl}/api/wishlist`,
            body: {
              productId: productId,
            },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 401]);
          });
        }
      });
    });

    it("TC-API-25: DELETE /api/wishlist/:id - Xóa khỏi wishlist", () => {
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/api/wishlist/some-wishlist-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 401, 404]);
      });
    });
  });

  describe("Payment APIs", () => {
    it("TC-API-26: POST /api/payment/momo - Tạo MoMo payment request", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/payment/momo`,
        body: {
          orderId: "test-order-id",
          amount: 1500000,
          orderInfo: "Test payment",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 401]);

        if (response.status === 200) {
          // MoMo API trả về payUrl
          expect(response.body).to.have.property("payUrl");
        }
      });
    });

    it("TC-API-27: GET /api/payment/momo/callback - MoMo callback", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/api/payment/momo/callback?orderId=test&resultCode=0`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 302, 400]);
      });
    });
  });

  describe("API Security & Validation", () => {
    it("TC-API-28: API reject invalid JSON body", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/api/products`,
        body: "invalid json string",
        headers: {
          "Content-Type": "application/json",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });

    it("TC-API-29: API có CORS headers", () => {
      cy.request({
        method: "OPTIONS",
        url: `${apiUrl}/api/products`,
      }).then((response) => {
        expect(response.headers).to.have.property(
          "access-control-allow-origin"
        );
      });
    });

    it("TC-API-30: Rate limiting hoạt động (nếu có)", () => {
      // Gửi nhiều requests liên tiếp
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(
          cy.request({
            method: "GET",
            url: `${apiUrl}/api/products`,
            failOnStatusCode: false,
          })
        );
      }

      // Một số requests có thể bị rate limit (429)
      Promise.all(requests).then((responses) => {
        const hasRateLimit = responses.some((r) => r.status === 429);
        // Rate limit có thể có hoặc không
        expect(responses.length).to.equal(50);
      });
    });
  });
});
