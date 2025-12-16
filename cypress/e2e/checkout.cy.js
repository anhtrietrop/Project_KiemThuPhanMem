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

      // DEBUG: CHỤP ẢNH ĐỂ XEM FORM
      cy.screenshot("checkout-page");

      // DEBUG: IN RA TẤT CẢ ELEMENT
      cy.get("body").then(($body) => {
        console.log("=== DEBUG FORM CHECKOUT ===");

        // 1. Tìm tất cả input
        const inputs = $body.find("input");
        console.log(`Tổng số input: ${inputs.length}`);
        inputs.each((index, el) => {
          console.log(`Input ${index}:`, {
            tag: el.tagName,
            type: el.type,
            name: el.name,
            id: el.id,
            placeholder: el.placeholder,
            value: el.value,
            className: el.className,
          });
        });

        // 2. Tìm tất cả label
        const labels = $body.find("label");
        console.log(`Tổng số label: ${labels.length}`);
        labels.each((index, el) => {
          console.log(`Label ${index}: "${el.innerText.trim()}"`, {
            htmlFor: el.htmlFor,
            className: el.className,
          });
        });
      });

      // ===== TÌM VÀ ĐIỀN FORM THEO NHIỀU CÁCH =====

      // CÁCH 1: Tìm input gần label "Name *"
      cy.contains("label", /name/i).then(($label) => {
        if ($label.length) {
          console.log("Tìm thấy label Name:", $label.text());

          // Cách 1A: Tìm input bằng for attribute
          const forId = $label.attr("for");
          if (forId) {
            cy.get(`#${forId}`).then(($input) => {
              if ($input.length) {
                cy.wrap($input).clear().type("Anh Triết", { force: true });
                console.log("Đã điền Name bằng for attribute");
                return;
              }
            });
          }

          // Cách 1B: Tìm input trong cùng container
          const container = $label.parent();
          const input = container.find("input").first();
          if (input.length) {
            cy.wrap(input).clear().type("Anh Triết", { force: true });
            console.log("Đã điền Name bằng parent container");
            return;
          }

          // Cách 1C: Tìm input sau label
          const nextInput = $label.next("input");
          if (nextInput.length) {
            cy.wrap(nextInput).clear().type("Anh Triết", { force: true });
            console.log("Đã điền Name bằng next sibling");
            return;
          }
        }

        // Nếu không tìm thấy bằng label, thử cách khác
        console.log("Không tìm thấy bằng label, thử cách khác...");

        // CÁCH 2: Tìm input đầu tiên có type="text" và trống
        cy.get('input[type="text"]').then(($inputs) => {
          const emptyInputs = $inputs.filter(
            (i, el) => !el.value || el.value.trim() === ""
          );
          if (emptyInputs.length > 0) {
            cy.wrap(emptyInputs[0]).clear().type("Anh Triết", { force: true });
            console.log("Đã điền Name vào input text đầu tiên");
          }
        });
      });

      // CÁCH 3: Điền Lastname
      cy.contains("label", /lastname|last name/i).then(($label) => {
        if ($label.length) {
          const forId = $label.attr("for");
          if (forId) {
            cy.get(`#${forId}`).clear().type("Đỗ", { force: true });
          } else {
            const container = $label.parent();
            const input = container.find("input").first();
            if (input.length) {
              cy.wrap(input).clear().type("Đỗ", { force: true });
            }
          }
        } else {
          // Tìm input text thứ 2
          cy.get('input[type="text"]').then(($inputs) => {
            const emptyInputs = $inputs.filter(
              (i, el) => !el.value || el.value.trim() === ""
            );
            if (emptyInputs.length > 1) {
              cy.wrap(emptyInputs[1]).clear().type("Đỗ", { force: true });
            }
          });
        }
      });

      // CÁCH 4: Điền Phone number
      cy.contains("label", /phone|số điện thoại/i).then(($label) => {
        if ($label.length) {
          const forId = $label.attr("for");
          if (forId) {
            cy.get(`#${forId}`).clear().type("0899517129", { force: true });
          }
        } else {
          // Tìm input type="tel" hoặc input text thứ 3
          cy.get('input[type="tel"]').then(($telInputs) => {
            if ($telInputs.length > 0) {
              cy.wrap($telInputs[0])
                .clear()
                .type("0899517129", { force: true });
            } else {
              cy.get('input[type="text"]').then(($inputs) => {
                const emptyInputs = $inputs.filter(
                  (i, el) => !el.value || el.value.trim() === ""
                );
                if (emptyInputs.length > 2) {
                  cy.wrap(emptyInputs[2])
                    .clear()
                    .type("0899517129", { force: true });
                }
              });
            }
          });
        }
      });

      // CÁCH 5: Điền Email address
      cy.contains("label", /email/i).then(($label) => {
        if ($label.length) {
          const forId = $label.attr("for");
          if (forId) {
            cy.get(`#${forId}`)
              .clear()
              .type(email || "anhtrietrop@gmail.com", { force: true });
          }
        } else {
          // Tìm input type="email"
          cy.get('input[type="email"]').then(($emailInputs) => {
            if ($emailInputs.length > 0) {
              cy.wrap($emailInputs[0])
                .clear()
                .type(email || "anhtrietrop@gmail.com", { force: true });
            } else {
              cy.get('input[type="text"]').then(($inputs) => {
                const emptyInputs = $inputs.filter(
                  (i, el) => !el.value || el.value.trim() === ""
                );
                if (emptyInputs.length > 3) {
                  cy.wrap(emptyInputs[3])
                    .clear()
                    .type(email || "anhtrietrop@gmail.com", { force: true });
                }
              });
            }
          });
        }
      });

      // CÁCH 6: Điền các field Shipping Address
      // Tìm section Shipping Address
      cy.contains(/shipping address/i).then(($section) => {
        if ($section.length) {
          console.log("Tìm thấy Shipping Address section");

          // Điền Address
          cy.contains("label", /address/i).then(($label) => {
            if ($label.length) {
              const input =
                $label.next("input").first() ||
                $label.parent().find("input").first();
              if (input.length) {
                cy.wrap(input)
                  .clear()
                  .type("273 An Dương Vương", { force: true });
              }
            }
          });

          // Điền City
          cy.contains("label", /city/i).then(($label) => {
            if ($label.length) {
              const input =
                $label.next("input").first() ||
                $label.parent().find("input").first();
              if (input.length) {
                cy.wrap(input)
                  .clear()
                  .type("Thành phố Hồ Chí Minh", { force: true });
              }
            }
          });
        } else {
          // Nếu không tìm thấy section, điền input tiếp theo
          cy.get('input[type="text"]').then(($inputs) => {
            const emptyInputs = $inputs.filter(
              (i, el) => !el.value || el.value.trim() === ""
            );
            if (emptyInputs.length > 4) {
              cy.wrap(emptyInputs[4])
                .clear()
                .type("273 An Dương Vương", { force: true }); // Address
            }
            if (emptyInputs.length > 5) {
              cy.wrap(emptyInputs[5])
                .clear()
                .type("Thành phố Hồ Chí Minh", { force: true }); // City
            }
          });
        }
      });

      // ===== KIỂM TRA FORM ĐÃ ĐƯỢC ĐIỀN =====
      cy.wait(1000);
      cy.get("body").then(($body) => {
        const filledInputs = $body
          .find("input")
          .filter((i, el) => el.value && el.value.trim() !== "");
        console.log(`Đã điền được ${filledInputs.length} field`);

        // Nếu chưa đủ, thử điền bằng cách đơn giản nhất
        if (filledInputs.length < 4) {
          console.log("Chưa điền đủ, thử cách đơn giản...");

          // Điền tất cả input text trống
          const textInputs = $body.find(
            'input[type="text"], input[type="email"], input[type="tel"]'
          );
          const values = [
            "Anh Triết",
            "Đỗ",
            "0899517129",
            email || "anhtrietrop@gmail.com",
            "273 An Dương Vương",
            "Thành phố Hồ Chí Minh",
          ];

          textInputs.each((index, el) => {
            if (
              index < values.length &&
              (!el.value || el.value.trim() === "")
            ) {
              cy.wrap(el).clear().type(values[index], { force: true });
            }
          });
        }
      });

      // ===== PLACE ORDER =====
      cy.get('button:contains("Place Order"), button:contains("Đặt hàng")', {
        timeout: 10000,
      })
        .should("be.visible")
        .should("not.be.disabled")
        .click({ force: true });

      // ===== VERIFY SUCCESS =====
      cy.wait(5000);
      cy.contains(
        /thank you|cảm ơn|order received|success|đặt hàng thành công/i,
        { timeout: 30000 }
      ).should("exist");
    });
  });
});
