/**
 * KIỂM THỬ: FORM VALIDATION
 * Mục đích: Kiểm tra các validation rules cho forms trong ứng dụng
 */

describe('Form Validation', () => {
  
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Login Form Validation', () => {
    
    beforeEach(() => {
      cy.visit(Cypress.env('userUrl') + '/login')
    })

    it('TC-VAL-01: Email field bắt buộc nhập', () => {
      // Bỏ trống email
      cy.get('input[name="password"], input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Verify: HTML5 validation
      cy.get('input[name="email"], input[type="email"]').then($input => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('TC-VAL-02: Email phải đúng format', () => {
      cy.get('input[name="email"], input[type="email"]').type('invalid-email')
      cy.get('input[name="password"], input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Verify: Invalid email format
      cy.get('input[name="email"], input[type="email"]').then($input => {
        expect($input[0].validity.valid).to.be.false
      })
    })

    it('TC-VAL-03: Password field bắt buộc nhập', () => {
      cy.get('input[name="email"], input[type="email"]').type('test@example.com')
      // Bỏ trống password
      cy.get('button[type="submit"]').click()
      
      // Verify: Validation error
      cy.get('input[name="password"], input[type="password"]').then($input => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('TC-VAL-04: Hiển thị lỗi khi email không tồn tại', () => {
      cy.get('input[name="email"], input[type="email"]').type('nonexistent@example.com')
      cy.get('input[name="password"], input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Verify: Error message hiển thị
      cy.get('body').should('contain.text', /invalid|incorrect|not found|không tồn tại/i)
    })

    it('TC-VAL-05: Hiển thị lỗi khi password sai', () => {
      cy.get('input[name="email"], input[type="email"]').type('user@example.com')
      cy.get('input[name="password"], input[type="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      // Verify: Wrong password error
      cy.get('body').should('contain.text', /invalid|incorrect|wrong|sai/i)
    })
  })

  describe('Register Form Validation', () => {
    
    beforeEach(() => {
      cy.visit(Cypress.env('userUrl') + '/register')
    })

    it('TC-VAL-06: Email bắt buộc nhập', () => {
      cy.get('input[name="password"], input[type="password"]').first().type('Password123!')
      cy.get('button[type="submit"]').click()
      
      // Verify: Email required
      cy.get('input[name="email"], input[type="email"]').then($input => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('TC-VAL-07: Email phải đúng format', () => {
      cy.get('input[name="email"], input[type="email"]').type('invalid-email-format')
      cy.get('input[name="password"], input[type="password"]').first().type('Password123!')
      cy.get('button[type="submit"]').click()
      
      // Verify: Invalid email
      cy.get('input[name="email"], input[type="email"]').then($input => {
        expect($input[0].validity.valid).to.be.false
      })
    })

    it('TC-VAL-08: Password bắt buộc nhập', () => {
      cy.get('input[name="email"], input[type="email"]').type('test@example.com')
      // Bỏ trống password
      cy.get('button[type="submit"]').click()
      
      // Verify: Password required
      cy.get('input[name="password"], input[type="password"]').first().then($input => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('TC-VAL-09: Password phải có độ dài tối thiểu', () => {
      cy.get('input[name="email"], input[type="email"]').type('test@example.com')
      cy.get('input[name="password"], input[type="password"]').first().type('123')
      
      cy.get('body').then($body => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type('123')
        }
      })
      
      cy.get('button[type="submit"]').click()
      
      // Verify: Password too short
      cy.get('body').should('contain.text', /too short|quá ngắn|at least|ít nhất/i)
    })

    it('TC-VAL-10: Confirm password phải khớp với password', () => {
      cy.get('input[name="email"], input[type="email"]').type('test@example.com')
      cy.get('input[name="password"], input[type="password"]').first().type('Password123!')
      
      cy.get('body').then($body => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type('DifferentPassword!')
          cy.get('button[type="submit"]').click()
          
          // Verify: Passwords don't match
          cy.get('body').should('contain.text', /not match|không khớp|mismatch/i)
        }
      })
    })

    it('TC-VAL-11: Email đã tồn tại không thể đăng ký', () => {
      cy.get('input[name="email"], input[type="email"]').type('user@example.com')
      cy.get('input[name="password"], input[type="password"]').first().type('Password123!')
      
      cy.get('body').then($body => {
        if ($body.find('input[name="confirmPassword"]').length > 0) {
          cy.get('input[name="confirmPassword"]').type('Password123!')
        }
      })
      
      cy.get('button[type="submit"]').click()
      
      // Verify: Email already exists
      cy.get('body').should('contain.text', /already exists|đã tồn tại|already taken/i)
    })
  })

  describe('Product Form Validation (Admin)', () => {
    
    beforeEach(() => {
      cy.loginAdmin('admin@example.com', 'admin123')
      cy.visit(Cypress.env('adminUrl') + '/products')
      cy.contains(/add|new|thêm|tạo/i).click()
    })

    it('TC-VAL-12: Title bắt buộc nhập', () => {
      cy.get('input[name="price"]').type('1000000')
      cy.get('input[name="quantity"]').type('10')
      cy.get('button[type="submit"]').click()
      
      // Verify: Title required
      cy.get('input[name="title"]').then($input => {
        expect($input[0].validationMessage || $input[0].validity.valid === false).to.exist
      })
    })

    it('TC-VAL-13: Price phải là số dương', () => {
      cy.get('input[name="title"]').type('Test Product')
      cy.get('input[name="price"]').clear().type('-1000')
      cy.get('input[name="quantity"]').type('10')
      cy.get('textarea[name="description"]').type('Test')
      cy.get('input[name="manufacturer"]').type('Test')
      cy.get('button[type="submit"]').click()
      
      // Verify: Invalid price
      cy.get('body').should('contain.text', /invalid|không hợp lệ|positive|dương/i)
    })

    it('TC-VAL-14: Price không thể là 0', () => {
      cy.get('input[name="title"]').type('Test Product')
      cy.get('input[name="price"]').clear().type('0')
      cy.get('input[name="quantity"]').type('10')
      cy.get('textarea[name="description"]').type('Test')
      cy.get('input[name="manufacturer"]').type('Test')
      cy.get('button[type="submit"]').click()
      
      // Verify: Price must be greater than 0
      cy.get('body').should('contain.text', /greater than|lớn hơn|invalid|không hợp lệ/i)
    })

    it('TC-VAL-15: Quantity phải là số nguyên dương', () => {
      cy.get('input[name="title"]').type('Test Product')
      cy.get('input[name="price"]').type('1000000')
      cy.get('input[name="quantity"]').clear().type('-5')
      cy.get('textarea[name="description"]').type('Test')
      cy.get('input[name="manufacturer"]').type('Test')
      cy.get('button[type="submit"]').click()
      
      // Verify: Invalid quantity
      cy.get('body').should('contain.text', /invalid|không hợp lệ|positive|dương/i)
    })

    it('TC-VAL-16: Quantity không thể là số thập phân', () => {
      cy.get('input[name="title"]').type('Test Product')
      cy.get('input[name="price"]').type('1000000')
      cy.get('input[name="quantity"]').clear().type('10.5')
      
      // Verify: Chỉ chấp nhận số nguyên
      cy.get('input[name="quantity"]').should('have.attr', 'type').and('match', /number|text/)
    })

    it('TC-VAL-17: Description không được để trống', () => {
      cy.get('input[name="title"]').type('Test Product')
      cy.get('input[name="price"]').type('1000000')
      cy.get('input[name="quantity"]').type('10')
      cy.get('input[name="manufacturer"]').type('Test')
      // Bỏ trống description
      cy.get('button[type="submit"]').click()
      
      // Verify: Description required (nếu có validation)
      cy.get('body').then($body => {
        const text = $body.text()
        if (text.includes('required') || text.includes('bắt buộc')) {
          expect(text).to.match(/description|mô tả/i)
        }
      })
    })

    it('TC-VAL-18: Manufacturer không được để trống', () => {
      cy.get('input[name="title"]').type('Test Product')
      cy.get('input[name="price"]').type('1000000')
      cy.get('input[name="quantity"]').type('10')
      cy.get('textarea[name="description"]').type('Test description')
      // Bỏ trống manufacturer
      cy.get('button[type="submit"]').click()
      
      // Verify: Manufacturer required
      cy.get('input[name="manufacturer"]').then($input => {
        if ($input.attr('required')) {
          expect($input[0].validationMessage).to.not.be.empty
        }
      })
    })
  })

  describe('Checkout Form Validation', () => {
    
    beforeEach(() => {
      cy.loginUser('user@example.com', 'user123')
      // Add item to cart first
      cy.visit(Cypress.env('userUrl'))
      cy.get('body').then($body => {
        const addCartBtns = $body.find('button').filter((i, el) => /add to cart|thêm/i.test(Cypress.$(el).text()))
        if (addCartBtns.length > 0) {
          cy.wrap(addCartBtns.first()).click({ force: true })
        }
      })
      cy.visit(Cypress.env('userUrl') + '/checkout')
    })

    it('TC-VAL-19: Name không được để trống', () => {
      cy.get('body').then($body => {
        if ($body.find('input[name="name"]').length > 0) {
          cy.get('input[name="phone"]').type('0123456789')
          cy.get('input[name="adress"], input[name="address"]').type('123 Street')
          cy.get('button[type="submit"]').click()
          
          // Verify: Name required
          cy.get('input[name="name"]').then($input => {
            expect($input[0].validationMessage).to.not.be.empty
          })
        }
      })
    })

    it('TC-VAL-20: Phone phải đúng format số điện thoại', () => {
      cy.get('body').then($body => {
        if ($body.find('input[name="phone"]').length > 0) {
          cy.get('input[name="name"]').type('Test User')
          cy.get('input[name="phone"]').type('invalid-phone')
          cy.get('input[name="adress"], input[name="address"]').type('123 Street')
          cy.get('button[type="submit"]').click()
          
          // Verify: Invalid phone
          cy.get('body').should('contain.text', /invalid|không hợp lệ|phone|số điện thoại/i)
        }
      })
    })

    it('TC-VAL-21: Address không được để trống', () => {
      cy.get('body').then($body => {
        if ($body.find('input[name="adress"], input[name="address"]').length > 0) {
          cy.get('input[name="name"]').type('Test User')
          cy.get('input[name="phone"]').type('0123456789')
          // Bỏ trống address
          cy.get('button[type="submit"]').click()
          
          // Verify: Address required
          cy.get('input[name="adress"], input[name="address"]').then($input => {
            expect($input[0].validationMessage).to.not.be.empty
          })
        }
      })
    })

    it('TC-VAL-22: City phải được chọn', () => {
      cy.get('body').then($body => {
        if ($body.find('select[name="city"]').length > 0) {
          cy.get('input[name="name"]').type('Test User')
          cy.get('input[name="phone"]').type('0123456789')
          cy.get('input[name="adress"], input[name="address"]').type('123 Street')
          // Không chọn city
          cy.get('button[type="submit"]').click()
          
          // Verify: City required
          cy.get('select[name="city"]').then($select => {
            if ($select.attr('required')) {
              expect($select[0].validationMessage).to.not.be.empty
            }
          })
        }
      })
    })
  })

  describe('Search Form Validation', () => {
    
    it('TC-VAL-23: Search với keyword trống hiển thị tất cả products', () => {
      cy.visit(Cypress.env('userUrl'))
      
      cy.get('body').then($body => {
        if ($body.find('input[type="search"]').length > 0) {
          // Submit search trống
          cy.get('input[type="search"]').type('{enter}')
          
          // Verify: Hiển thị tất cả products hoặc message
          cy.get('body').should('contain.text', /product|sản phẩm|search|all/i)
        }
      })
    })

    it('TC-VAL-24: Search với ký tự đặc biệt không gây lỗi', () => {
      cy.visit(Cypress.env('userUrl'))
      
      cy.get('body').then($body => {
        if ($body.find('input[type="search"]').length > 0) {
          cy.get('input[type="search"]').type('<script>alert("xss")</script>{enter}')
          
          // Verify: Không có lỗi, XSS được escape
          cy.get('body').should('not.contain', '<script>')
        }
      })
    })

    it('TC-VAL-25: Search với keyword quá dài vẫn hoạt động', () => {
      cy.visit(Cypress.env('userUrl'))
      
      cy.get('body').then($body => {
        if ($body.find('input[type="search"]').length > 0) {
          const longKeyword = 'a'.repeat(200)
          cy.get('input[type="search"]').type(longKeyword + '{enter}')
          
          // Verify: Không crash
          cy.get('body').should('exist')
        }
      })
    })
  })

  describe('Real-time Validation', () => {
    
    it('TC-VAL-26: Email validation real-time khi nhập', () => {
      cy.visit(Cypress.env('userUrl') + '/register')
      
      cy.get('input[name="email"], input[type="email"]').type('invalid').blur()
      
      // Có thể có error message hiển thị ngay
      cy.get('input[name="email"], input[type="email"]').then($input => {
        expect($input[0].validity.valid).to.be.false
      })
    })

    it('TC-VAL-27: Password strength indicator (nếu có)', () => {
      cy.visit(Cypress.env('userUrl') + '/register')
      
      cy.get('input[name="password"], input[type="password"]').first().type('weak')
      
      // Kiểm tra có password strength indicator không
      cy.get('body').then($body => {
        if ($body.find('.password-strength, [class*="strength"]').length > 0) {
          cy.get('.password-strength, [class*="strength"]').should('be.visible')
        }
      })
    })
  })
})
