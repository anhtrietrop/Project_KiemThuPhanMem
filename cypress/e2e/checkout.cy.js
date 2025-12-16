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

      cy.contains("button", /checkout|thanh toán/i, { timeout: 10000 })
        .should("be.visible")
        .should("not.be.disabled")
        .click();

      // ===== KIỂM TRA CÓ BỊ REDIRECT VỀ LOGIN KHÔNG =====
      cy.url().then((currentUrl) => {
        if (currentUrl.includes("/login")) {
          console.log("⚠️ Bị redirect về login, đăng nhập lại...");
          // Đăng nhập lại
          cy.get('input[type="email"], input[name="email"]').type(email, {
            force: true,
          });
          cy.get('input[type="password"], input[name="password"]').type(
            password,
            { force: true }
          );
          cy.get(
            'button[type="submit"], button:contains("Login"), button:contains("Đăng nhập")'
          ).click({ force: true });

          // Chờ redirect về checkout
          cy.url({ timeout: 10000 }).should("include", "/checkout");
        }
      });

      // ===== ĐẢM BẢO ĐÃ Ở TRANG CHECKOUT =====
      cy.url({ timeout: 10000 }).should("include", "/checkout");

      // Chờ form tải hoàn toàn
      cy.get("body").should("not.contain", "Loading");
      cy.wait(1000);

      // ===== KIỂM TRA FORM CÓ TỒN TẠI KHÔNG =====
      cy.get("body").then(($body) => {
        // Kiểm tra xem có form checkout không
        const hasCheckoutForm =
          $body.find('form, input, button:contains("Place Order")').length > 0;

        if (!hasCheckoutForm) {
          console.log("Không tìm thấy form checkout, thử reload");
          cy.reload();
          cy.wait(2000);
        }
      });

      // ===== ĐIỀN FORM CHECKOUT - CÁCH LINH HOẠT HƠN =====

      // 1. Tìm tất cả input trống và điền theo thứ tự
      cy.get("body").then(($body) => {
        console.log("=== BẮT ĐẦU ĐIỀN FORM ===");

        // Lấy tất cả input text trống
        const emptyTextInputs = $body
          .find('input[type="text"]')
          .filter((i, el) => {
            return !el.value || el.value.trim() === "";
          });

        const emptyEmailInputs = $body
          .find('input[type="email"]')
          .filter((i, el) => {
            return !el.value || el.value.trim() === "";
          });

        const emptyTelInputs = $body
          .find('input[type="tel"]')
          .filter((i, el) => {
            return !el.value || el.value.trim() === "";
          });

        console.log(
          `Tìm thấy: ${emptyTextInputs.length} text input trống, ${emptyEmailInputs.length} email trống, ${emptyTelInputs.length} tel trống`
        );

        // Điền theo thứ tự phổ biến: Name -> Lastname -> Phone -> Email -> Address -> City
        if (emptyTextInputs.length >= 1) {
          cy.wrap(emptyTextInputs[0])
            .clear()
            .type("Anh Triết", { force: true, delay: 100 });
          console.log("Điền Name vào input thứ 1");
        }

        if (emptyTextInputs.length >= 2) {
          cy.wrap(emptyTextInputs[1])
            .clear()
            .type("Đỗ", { force: true, delay: 100 });
          console.log("Điền Lastname vào input thứ 2");
        }

        // Điền phone (có thể là type="tel")
        if (emptyTelInputs.length >= 1) {
          cy.wrap(emptyTelInputs[0])
            .clear()
            .type("0899517129", { force: true, delay: 100 });
          console.log("Điền Phone vào tel input");
        } else if (emptyTextInputs.length >= 3) {
          cy.wrap(emptyTextInputs[2])
            .clear()
            .type("0899517129", { force: true, delay: 100 });
          console.log("Điền Phone vào input thứ 3");
        }

        // Điền email
        if (emptyEmailInputs.length >= 1) {
          cy.wrap(emptyEmailInputs[0])
            .clear()
            .type(email || "anhtrietrop@gmail.com", {
              force: true,
              delay: 100,
            });
          console.log("Điền Email vào email input");
        } else if (emptyTextInputs.length >= 4) {
          cy.wrap(emptyTextInputs[3])
            .clear()
            .type(email || "anhtrietrop@gmail.com", {
              force: true,
              delay: 100,
            });
          console.log("Điền Email vào input thứ 4");
        }

        // Điền address (có thể là input tiếp theo)
        if (emptyTextInputs.length >= 5) {
          cy.wrap(emptyTextInputs[4])
            .clear()
            .type("273 An Dương Vương", { force: true, delay: 100 });
          console.log("Điền Address vào input thứ 5");
        }

        // Điền apartment (optional)
        if (emptyTextInputs.length >= 6) {
          cy.wrap(emptyTextInputs[5])
            .clear()
            .type("Lầu 5", { force: true, delay: 100 });
          console.log("Điền Apartment vào input thứ 6");
        }

        // Điền city
        if (emptyTextInputs.length >= 7) {
          cy.wrap(emptyTextInputs[6])
            .clear()
            .type("Thành phố Hồ Chí Minh", { force: true, delay: 100 });
          console.log("Điền City vào input thứ 7");
        }
      });

      // 2. Tìm và điền vào textarea (order notice)
      cy.get("body").then(($body) => {
        const textareas = $body.find("textarea").filter((i, el) => {
          return !el.value || el.value.trim() === "";
        });

        if (textareas.length > 0) {
          cy.wrap(textareas[0])
            .clear()
            .type("Giao hàng giờ hành chính", { force: true, delay: 100 });
          console.log("Điền Order notice");
        }
      });

      // ===== KIỂM TRA FORM ĐÃ ĐƯỢC ĐIỀN =====
      cy.wait(1000);
      cy.get("body").then(($body) => {
        const filledInputs = $body.find("input, textarea").filter((i, el) => {
          return el.value && el.value.trim() !== "";
        });

        console.log(`=== ĐÃ ĐIỀN ${filledInputs.length} FIELD ===`);
        if (filledInputs.length < 4) {
          console.warn("⚠️ Có thể chưa điền đủ form!");
        }
      });

      // ===== SELECT PAYMENT METHOD =====
      cy.get("body").then(($body) => {
        // Tìm tất cả radio buttons
        const radios = $body.find('input[type="radio"]');
        if (radios.length > 0) {
          // Chọn cái đầu tiên hoặc cái có value chứa "momo"
          const momoRadio = radios
            .filter((i, el) => {
              return (el.value || "").toLowerCase().includes("momo");
            })
            .first();

          if (momoRadio.length) {
            cy.wrap(momoRadio).check({ force: true });
            console.log("Đã chọn MoMo payment");
          } else {
            // Chọn radio đầu tiên
            cy.wrap(radios[0]).check({ force: true });
            console.log("Đã chọn payment method đầu tiên");
          }
        }
      });

      // ===== PLACE ORDER =====
      // Tìm và click nút Place Order
      cy.get("body").then(($body) => {
        const placeOrderButtons = $body.find("button").filter((i, el) => {
          const text = (el.textContent || el.innerText || "").toLowerCase();
          return (
            text.includes("place order") ||
            text.includes("đặt hàng") ||
            text.includes("thanh toán") ||
            text.includes("hoàn tất")
          );
        });

        if (placeOrderButtons.length > 0) {
          const button = placeOrderButtons[0];
          const isDisabled = button.disabled || button.hasAttribute("disabled");

          if (!isDisabled) {
            cy.wrap(button).click({ force: true });
            console.log("Đã click Place Order");
          } else {
            console.log("Nút Place Order bị disabled, kiểm tra form");
            // Kiểm tra validation
            cy.get("body").then(($body) => {
              const errors = $body.find(
                '.error, .text-red-500, [aria-invalid="true"]'
              );
              console.log(`Validation errors: ${errors.length}`);
            });
          }
        } else {
          console.log("Không tìm thấy nút Place Order");
        }
      });

      // ===== VERIFY SUCCESS =====
      // Chờ chuyển trang hoặc hiển thị thông báo thành công
      cy.wait(3000);

      // Kiểm tra URL hoặc thông báo thành công
      cy.get("body").then(($body) => {
        const successText = $body.text();
        const hasSuccess =
          /thank you|cảm ơn|order received|order confirmed|payment successful|thanh toán thành công|đặt hàng thành công/i.test(
            successText
          );

        if (hasSuccess) {
          console.log("✓ Thanh toán thành công!");
        } else {
          console.log("Chưa thấy thông báo thành công, kiểm tra URL...");
          cy.url().should(
            "match",
            /success|thank|order|complete|confirmation|thanh-cong/i
          );
        }
      });
    });
  });
});
