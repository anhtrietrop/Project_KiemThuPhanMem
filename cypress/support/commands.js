// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

/**
 * Command để đăng nhập User
 * @example cy.loginUser('user@example.com', 'password123')
 */
Cypress.Commands.add("loginUser", (email, password) => {
  cy.visit(Cypress.env("userUrl") + "/login");
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]').type(password);
  cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i, {
    timeout: 10000,
  }).click();
  cy.url().should("not.include", "/login");
});

/**
 * Command để đăng nhập Admin
 * @example cy.loginAdmin('admin@example.com', 'admin123')
 */
Cypress.Commands.add("loginAdmin", (email, password) => {
  cy.visit(Cypress.env("adminUrl") + "/login");
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]').type(password);
  cy.contains("button", /đăng nhập|login|sign\s?in|signin|sign-in/i, {
    timeout: 10000,
  }).click();
  cy.url().should("not.include", "/login");
});

/**
 * Command để đăng xuất
 */
Cypress.Commands.add("logout", () => {
  cy.contains(/log\s?out|đăng xuất|logout|sign\s?out|sign-out/i, {
    timeout: 5000,
  }).click({ force: true });
});

/**
 * Command để đăng ký user mới
 */
Cypress.Commands.add("registerUser", (email, password, name = "Test User") => {
  cy.visit(Cypress.env("userUrl") + "/register");
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]')
    .first()
    .type(password);
  cy.get('input[name="confirmPassword"], input[type="password"]')
    .last()
    .type(password);

  // Nếu có trường name/username
  cy.get("body").then(($body) => {
    if ($body.find('input[name="name"], input[name="username"]').length > 0) {
      cy.get('input[name="name"], input[name="username"]').type(name);
    }
  });

  cy.get('button[type="submit"]')
    .contains(/đăng ký|register|sign up/i)
    .click();
});

/**
 * Command để kiểm tra API response
 */
Cypress.Commands.add("apiRequest", (method, endpoint, body = null) => {
  const options = {
    method: method,
    url: Cypress.env("apiUrl") + endpoint,
    failOnStatusCode: false,
  };

  if (body) {
    options.body = body;
  }

  return cy.request(options);
});

/**
 * Command để chờ API call hoàn thành
 */
Cypress.Commands.add("waitForAPI", (alias) => {
  cy.wait(alias).its("response.statusCode").should("be.oneOf", [200, 201]);
});

/**
 * Command để tạo product (admin)
 */
Cypress.Commands.add("createProduct", (productData) => {
  const defaultProduct = {
    title: "Test Product",
    price: 1000000,
    quantity: 10,
    description: "Test Description",
    manufacturer: "Test Brand",
    ...productData,
  };

  cy.visit(Cypress.env("adminUrl") + "/products/new");
  cy.get('input[name="title"]').type(defaultProduct.title);
  cy.get('input[name="price"]').type(defaultProduct.price);
  cy.get('input[name="quantity"]').type(defaultProduct.quantity);
  cy.get('textarea[name="description"]').type(defaultProduct.description);
  cy.get('input[name="manufacturer"]').type(defaultProduct.manufacturer);

  // Select category if exists
  cy.get("body").then(($body) => {
    if ($body.find('select[name="categoryId"]').length > 0) {
      cy.get('select[name="categoryId"]').select(1);
    }
  });

  cy.contains("button", /save|lưu|tạo|create/i, { timeout: 10000 })
    .should("be.visible")
    .click();
});
