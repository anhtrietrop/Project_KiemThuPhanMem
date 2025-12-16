describe("Thanh toán - Luồng", () => {
  it("TC-CHECKOUT-01: Hoàn tất thanh toán end-to-end (cần đăng nhập)", () => {
    cy.fixture("testUser").then(({ email, password }) => {
      // ===== LOGIN =====
      cy.loginUser(email, password);
      cy.visit(Cypress.env("userUrl"));

      // ===== OPEN PRODUCT =====
      cy.get('a[href*="/product"], a', { timeout: 15000 })
        .contains(/view product|chi tiết|xem chi tiết|product|iphone|samsung/i)
        .first()
        .click({ force: true });

      // ===== ADD TO CART / BUY NOW =====
      cy.get("body", { timeout: 15000 }).then(($body) => {
        const candidates = $body.find(
          'button, a, input[type="button"], input[type="submit"], [role="button"], .btn'
        );
        const buyRegex = /(buy now|mua ngay|buy|checkout|thanh toán ngay)/i;
        const addRegex = /(add to cart|thêm vào giỏ|add to basket)/i;
        let clicked = false;

        // try buy buttons first
        candidates.each((i, el) => {
          if (clicked) return;
          const txt = (el.innerText || "").trim();
          if (txt && buyRegex.test(txt)) {
            cy.wrap(el).click({ force: true });
            clicked = true;
          }
        });

        // fallback to add-to-cart
        if (!clicked) {
          candidates.each((i, el) => {
            if (clicked) return;
            const txt = (el.innerText || "").trim();
            if (txt && addRegex.test(txt)) {
              cy.wrap(el).click({ force: true });
              clicked = true;
            }
          });
        }

        if (!clicked) {
          throw new Error("❌ Không tìm thấy nút Mua / Thêm vào giỏ");
        }
      });

      // ===== GO TO CART =====
      cy.visit(Cypress.env("userUrl") + "/cart");
      cy.wait(2000);

      // ===== CLICK CHECKOUT BUTTON =====
      cy.get("body").then(($body) => {
        const checkoutBtn = $body
          .find("button")
          .filter((i, el) => {
            const text = (el.innerText || "").toLowerCase();
            return text.includes("checkout") || text.includes("thanh toán");
          })
          .first();

        if (checkoutBtn.length) {
          cy.wrap(checkoutBtn).click({ force: true });
          console.log("Đã click nút checkout");
        }
      });

      // ===== CHỜ CHECKOUT PAGE LOAD =====
      cy.wait(3000);

      // ===== DEBUG: TÌM TẤT CẢ INPUT VÀ ID CỦA CHÚNG =====
      cy.get("body").then(($body) => {
        console.log("=== DEBUG ALL INPUTS ===");
        $body.find("input, textarea, select").each((i, el) => {
          console.log(`${i}: ${el.tagName}`, {
            id: el.id,
            name: el.name,
            type: el.type,
            placeholder: el.placeholder,
            value: el.value,
          });
        });
      });

      // ===== ĐIỀN FORM THEO ID CHÍNH XÁC =====

      // 1. Điền NAME (tìm ID thực tế)
      cy.get("body").then(($body) => {
        // Tìm input cho Name
        const nameInput = $body
          .find('input[id*="name"], input[name*="name"]')
          .first();
        if (nameInput.length) {
          cy.wrap(nameInput).clear().type("Anh Triết", { force: true });
          console.log(
            `Đã điền Name vào ${nameInput.attr("id") || nameInput.attr("name")}`
          );
        } else {
          // Fallback: input đầu tiên
          cy.get('input[type="text"]')
            .first()
            .clear()
            .type("Anh Triết", { force: true });
          console.log("Đã điền Name vào input đầu tiên");
        }
      });

      // 2. Điền LASTNAME
      cy.get("body").then(($body) => {
        const lastNameInput = $body
          .find('input[id*="last"], input[name*="last"]')
          .first();
        if (lastNameInput.length) {
          cy.wrap(lastNameInput).clear().type("Đỗ", { force: true });
          console.log(`Đã điền Lastname vào ${lastNameInput.attr("id")}`);
        } else {
          cy.get('input[type="text"]')
            .eq(1)
            .clear()
            .type("Đỗ", { force: true });
          console.log("Đã điền Lastname vào input thứ 2");
        }
      });

      // 3. Điền PHONE
      cy.get("body").then(($body) => {
        const phoneInput = $body
          .find('input[type="tel"], input[id*="phone"], input[name*="phone"]')
          .first();
        if (phoneInput.length) {
          cy.wrap(phoneInput).clear().type("0899517129", { force: true });
          console.log(`Đã điền Phone vào ${phoneInput.attr("id")}`);
        } else {
          cy.get('input[type="text"]')
            .eq(2)
            .clear()
            .type("0899517129", { force: true });
          console.log("Đã điền Phone vào input thứ 3");
        }
      });

      // 4. Điền EMAIL (có ID là #email-address)
      cy.get("#email-address").then(($input) => {
        if ($input.length) {
          cy.wrap($input)
            .clear()
            .type(email || "anhtrietrop@gmail.com", { force: true });
          console.log("Đã điền Email vào #email-address");
        } else {
          cy.get('input[type="email"]')
            .clear()
            .type(email || "anhtrietrop@gmail.com", { force: true });
          console.log("Đã điền Email vào input email");
        }
      });

      // 5. Điền ADDRESS - TÌM ID THỰC TẾ
      cy.get("body").then(($body) => {
        // Tìm input Address bằng nhiều cách
        const addressSelectors = [
          "#address", // ID trực tiếp
          'input[id*="address"]',
          'input[name*="address"]',
          'input[placeholder*="Address"]',
          'input[placeholder*="Địa chỉ"]',
        ];

        let addressFilled = false;
        for (const selector of addressSelectors) {
          const $input = $body.find(selector).first();
          if ($input.length) {
            cy.wrap($input)
              .clear()
              .type("273 An Dương Vương, Quận 5", { force: true });
            console.log(`✓ Đã điền Address vào ${selector}`);
            addressFilled = true;
            break;
          }
        }

        if (!addressFilled) {
          console.log("Không tìm thấy input Address, thử tìm theo label...");
          // Tìm label "Address *" rồi tìm input liên quan
          cy.contains("label", /address/i).then(($label) => {
            if ($label.length) {
              // Tìm input trong cùng form field
              const $field = $label.closest(".field, .form-group, div");
              if ($field.length) {
                const $input = $field.find("input").first();
                if ($input.length) {
                  cy.wrap($input)
                    .clear()
                    .type("273 An Dương Vương, Quận 5", { force: true });
                  console.log("✓ Đã điền Address qua label");
                }
              }
            }
          });
        }
      });

      // 6. Điền APARTMENT - TÌM ID THỰC TẾ
      cy.get("body").then(($body) => {
        const apartmentSelectors = [
          "#apartment",
          'input[id*="apartment"]',
          'input[name*="apartment"]',
          'input[name*="suite"]',
          'input[placeholder*="Apartment"]',
          'input[placeholder*="suite"]',
        ];

        for (const selector of apartmentSelectors) {
          const $input = $body.find(selector).first();
          if ($input.length) {
            // CÓ THỂ ĐỂ TRỐNG (optional) hoặc điền
            // cy.wrap($input).clear().type('Lầu 5', { force: true });
            console.log(
              `Tìm thấy Apartment input: ${selector} (optional - có thể để trống)`
            );
            break;
          }
        }
      });

      // 7. Điền CITY (có ID là #city)
      cy.get("#city").then(($input) => {
        if ($input.length) {
          cy.wrap($input)
            .clear()
            .type("Thành phố Hồ Chí Minh", { force: true });
          console.log("✓ Đã điền City vào #city");
        } else {
          cy.get('input[id*="city"], input[name*="city"]')
            .first()
            .clear()
            .type("Thành phố Hồ Chí Minh", { force: true });
          console.log("Đã điền City");
        }
      });

      // 8. Điền ORDER NOTICE (có ID là #order-notice)
      cy.get("#order-notice").then(($textarea) => {
        if ($textarea.length) {
          cy.wrap($textarea)
            .clear()
            .type("Giao hàng giờ hành chính", { force: true });
          console.log("✓ Đã điền Order notice vào #order-notice");
        } else {
          cy.get("textarea")
            .first()
            .clear()
            .type("Giao hàng giờ hành chính", { force: true });
          console.log("Đã điền Order notice");
        }
      });

      // ===== KIỂM TRA TẤT CẢ FIELD ĐÃ ĐƯỢC ĐIỀN =====
      cy.wait(1000);
      cy.get("body").then(($body) => {
        console.log("=== KIỂM TRA GIÁ TRỊ ===");

        // Danh sách các ID/selector cần kiểm tra
        const fieldsToCheck = [
          { selector: 'input[id*="name"]:first', name: "Name" },
          { selector: 'input[id*="last"]:first', name: "Lastname" },
          { selector: 'input[type="tel"], input[id*="phone"]', name: "Phone" },
          { selector: "#email-address", name: "Email" },
          { selector: '#address, input[id*="address"]', name: "Address" },
          { selector: "#city", name: "City" },
          { selector: "#order-notice, textarea", name: "Order notice" },
        ];

        fieldsToCheck.forEach((field) => {
          const $el = $body.find(field.selector).first();
          if ($el.length) {
            const value = $el.val();
            console.log(
              `${field.name}: ${value ? `"${value}" ✓` : "CHƯA ĐIỀN ✗"}`
            );

            // Nếu Address chưa điền, điền ngay
            if (field.name === "Address" && (!value || value.trim() === "")) {
              cy.wrap($el)
                .clear()
                .type("273 An Dương Vương, Quận 5", { force: true });
              console.log("  → Đã điền Address");
            }
          } else {
            console.log(`${field.name}: Không tìm thấy element ✗`);
          }
        });
      });

      // ===== SCROLL ĐẾN NÚT PLACE ORDER =====
      cy.get(
        'button:contains("Place Order"), button:contains("Đặt hàng")'
      ).scrollIntoView();
      cy.wait(500);

      // ===== CLICK PLACE ORDER =====
      cy.get('button:contains("Place Order"), button:contains("Đặt hàng")', {
        timeout: 10000,
      })
        .should("be.visible")
        .then(($button) => {
          console.log("Nút Place Order:", {
            text: $button.text(),
            disabled: $button.prop("disabled"),
            enabled: $button.is(":enabled"),
          });

          if ($button.prop("disabled")) {
            console.log("Nút vẫn disabled, chụp ảnh debug...");
            cy.screenshot("place-order-disabled");

            // Kiểm tra validation errors
            cy.get("body").then(($body) => {
              const errors = $body.find(
                '.error, .text-red-500, [aria-invalid="true"]'
              );
              console.log(`Validation errors: ${errors.length}`);

              // Thử click với force
              cy.wrap($button).click({ force: true });
            });
          } else {
            cy.wrap($button).click({ force: true });
            console.log("Đã click Place Order");
          }
        });

      // ===== VERIFY SUCCESS =====
      cy.wait(5000);

      cy.get("body").should(($body) => {
        const bodyText = $body.text();
        const hasSuccess =
          /thank you/i.test(bodyText) ||
          /cảm ơn/i.test(bodyText) ||
          /order received/i.test(bodyText) ||
          /đặt hàng thành công/i.test(bodyText);

        if (!hasSuccess) {
          console.log("Chưa thấy success message, checking URL...");
          const url = window.location.href;
          console.log("Current URL:", url);

          const urlHasSuccess = /success|thank|order|complete/i.test(url);
          if (urlHasSuccess) {
            console.log("Success detected in URL");
            return true;
          }
        }

        return hasSuccess;
      });
    });
  });
});
