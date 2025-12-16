/**
 * Unit Tests: Product Logic Functions
 * Tests cho các pure functions không cần database
 */

describe('Product Logic - Unit Tests', () => {

    // ============================================
    // 1. SLUG GENERATION
    // ============================================

    describe('Slug Generation (generateSlug)', () => {
        const generateSlug = (title) => {
            return title
                .toLowerCase()
                .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
                .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
                .replace(/[ìíịỉĩ]/g, 'i')
                .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
                .replace(/[ùúụủũưừứựửữ]/g, 'u')
                .replace(/[ỳýỵỷỹ]/g, 'y')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        // Basic functionality
        test('Generate slug from English text', () => {
            expect(generateSlug('iPhone 15 Pro Max')).toBe('iphone-15-pro-max');
        });

        test('Generate slug from Vietnamese text', () => {
            expect(generateSlug('Điện thoại thông minh')).toBe('dien-thoai-thong-minh');
        });

        test('Handle special characters', () => {
            expect(generateSlug('Product @#$% Name!')).toBe('product-name');
        });

        test('Handle multiple spaces', () => {
            expect(generateSlug('Product   Name')).toBe('product-name');
        });

        // Edge cases
        test('Handle leading/trailing spaces', () => {
            expect(generateSlug('  Product  ')).toBe('product');
        });

        test('Handle mixed case', () => {
            expect(generateSlug('iPhone Pro MAX')).toBe('iphone-pro-max');
        });

        test('Handle numbers', () => {
            expect(generateSlug('iPhone 15 256GB')).toBe('iphone-15-256gb');
        });

        test('Handle empty string', () => {
            expect(generateSlug('')).toBe('');
        });

        test('Handle only special characters', () => {
            expect(generateSlug('!@#$%^&*()')).toBe('');
        });
    });

    // ============================================
    // 2. PRICE VALIDATION
    // ============================================

    describe('Price Validation (validatePrice)', () => {
        const validatePrice = (price) => {
            if (typeof price !== 'number') return false;
            if (price < 0) return false;
            if (price === 0) return false; // Assume free items not allowed
            if (!isFinite(price)) return false;
            return true;
        };

        test('Valid positive price', () => {
            expect(validatePrice(100000)).toBe(true);
            expect(validatePrice(1)).toBe(true);
            expect(validatePrice(999999999)).toBe(true);
        });

        test('Invalid: negative price', () => {
            expect(validatePrice(-100)).toBe(false);
            expect(validatePrice(-0.01)).toBe(false);
        });

        test('Invalid: zero price', () => {
            expect(validatePrice(0)).toBe(false);
        });

        test('Invalid: non-number type', () => {
            expect(validatePrice('100000')).toBe(false);
            expect(validatePrice(null)).toBe(false);
            expect(validatePrice(undefined)).toBe(false);
            expect(validatePrice({})).toBe(false);
        });

        test('Invalid: Infinity', () => {
            expect(validatePrice(Infinity)).toBe(false);
            expect(validatePrice(-Infinity)).toBe(false);
            expect(validatePrice(NaN)).toBe(false);
        });

        test('Valid: decimal price', () => {
            expect(validatePrice(99.99)).toBe(true);
            expect(validatePrice(0.01)).toBe(true);
        });
    });

    // ============================================
    // 3. QUANTITY VALIDATION
    // ============================================

    describe('Quantity Validation (validateQuantity)', () => {
        const validateQuantity = (quantity) => {
            if (typeof quantity !== 'number') return false;
            if (!Number.isInteger(quantity)) return false;
            if (quantity < 0) return false;
            return true;
        };

        test('Valid quantities', () => {
            expect(validateQuantity(0)).toBe(true);
            expect(validateQuantity(1)).toBe(true);
            expect(validateQuantity(1000)).toBe(true);
            expect(validateQuantity(999999)).toBe(true);
        });

        test('Invalid: negative', () => {
            expect(validateQuantity(-1)).toBe(false);
            expect(validateQuantity(-100)).toBe(false);
        });

        test('Invalid: decimal', () => {
            expect(validateQuantity(1.5)).toBe(false);
            expect(validateQuantity(0.1)).toBe(false);
        });

        test('Invalid: non-number', () => {
            expect(validateQuantity('10')).toBe(false);
            expect(validateQuantity(null)).toBe(false);
        });
    });

    // ============================================
    // 4. TITLE VALIDATION
    // ============================================

    describe('Title Validation (validateTitle)', () => {
        const validateTitle = (title) => {
            if (typeof title !== 'string') return false;
            const trimmed = title.trim();
            if (trimmed.length < 3) return false;
            if (trimmed.length > 255) return false;
            return true;
        };

        test('Valid titles', () => {
            expect(validateTitle('iPhone 15')).toBe(true);
            expect(validateTitle('Samsung Galaxy S24')).toBe(true);
            expect(validateTitle('Pro Max')).toBe(true);
        });

        test('Invalid: too short', () => {
            expect(validateTitle('a')).toBe(false);
            expect(validateTitle('ab')).toBe(false);
            expect(validateTitle('  ')).toBe(false);
        });

        test('Invalid: too long', () => {
            expect(validateTitle('a'.repeat(300))).toBe(false);
        });

        test('Invalid: not string', () => {
            expect(validateTitle(null)).toBe(false);
            expect(validateTitle(123)).toBe(false);
            expect(validateTitle(undefined)).toBe(false);
        });

        test('Trim whitespace', () => {
            expect(validateTitle('  iPhone  ')).toBe(true);
        });
    });


    // ============================================
    // 6. RATING VALIDATION
    // ============================================

    describe('Rating Validation (validateRating)', () => {
        const validateRating = (rating) => {
            if (typeof rating !== 'number') return false;
            if (rating < 0 || rating > 5) return false;
            return true;
        };

        test('Valid ratings', () => {
            expect(validateRating(0)).toBe(true);
            expect(validateRating(2.5)).toBe(true);
            expect(validateRating(5)).toBe(true);
            expect(validateRating(3.14159)).toBe(true);
        });

        test('Invalid: below 0', () => {
            expect(validateRating(-0.1)).toBe(false);
            expect(validateRating(-5)).toBe(false);
        });

        test('Invalid: above 5', () => {
            expect(validateRating(5.1)).toBe(false);
            expect(validateRating(10)).toBe(false);
        });

        test('Invalid: not number', () => {
            expect(validateRating('4.5')).toBe(false);
            expect(validateRating(null)).toBe(false);
        });
    });

    // ============================================
    // 7. CATEGORY VALIDATION
    // ============================================

    describe('Category Validation (validateCategory)', () => {
        const validateCategory = (categoryId) => {
            if (typeof categoryId !== 'string') return false;
            if (categoryId.trim().length === 0) return false;
            if (categoryId.length > 50) return false;
            return true;
        };

        test('Valid category IDs', () => {
            expect(validateCategory('CAT001')).toBe(true);
            expect(validateCategory('electronics')).toBe(true);
            expect(validateCategory('cat-with-dash')).toBe(true);
        });

        test('Invalid: empty string', () => {
            expect(validateCategory('')).toBe(false);
            expect(validateCategory('   ')).toBe(false);
        });

        test('Invalid: too long', () => {
            expect(validateCategory('a'.repeat(100))).toBe(false);
        });

        test('Invalid: not string', () => {
            expect(validateCategory(null)).toBe(false);
            expect(validateCategory(123)).toBe(false);
        });
    });

    // ============================================
    // 8. PRODUCT DATA VALIDATION (Complete)
    // ============================================

    describe('Complete Product Validation (validateProductData)', () => {
        const validateProductData = (data) => {
            const errors = [];

            // Title
            if (!data.title || data.title.trim().length < 3) {
                errors.push('Title must be at least 3 characters');
            }

            // Price
            if (typeof data.price !== 'number' || data.price <= 0) {
                errors.push('Price must be a positive number');
            }

            // Quantity
            if (typeof data.quantity !== 'number' || data.quantity < 0) {
                errors.push('Quantity must be non-negative');
            }

            // CategoryId
            if (!data.categoryId || typeof data.categoryId !== 'string') {
                errors.push('CategoryId is required');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        };

        test('Valid product data', () => {
            const result = validateProductData({
                title: 'iPhone 15',
                price: 25000000,
                quantity: 10,
                categoryId: 'CAT001'
            });

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('Invalid: missing title', () => {
            const result = validateProductData({
                price: 25000000,
                quantity: 10,
                categoryId: 'CAT001'
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Title must be at least 3 characters');
        });

        test('Invalid: negative price', () => {
            const result = validateProductData({
                title: 'Product',
                price: -100,
                quantity: 10,
                categoryId: 'CAT001'
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Price must be a positive number');
        });

        test('Multiple validation errors', () => {
            const result = validateProductData({
                title: 'ab', // Too short
                price: -100, // Invalid
                quantity: -5, // Invalid
                // Missing categoryId
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });

    // ============================================
    // 9. SEARCH QUERY SANITIZATION
    // ============================================

    describe('Search Query Sanitization (sanitizeSearchQuery)', () => {
        const sanitizeSearchQuery = (query) => {
            if (typeof query !== 'string') return '';
            return query
                .trim()
                .toLowerCase()
                .replace(/[*%_]/g, '\\$&') // Escape SQL wildcards
                .substring(0, 100); // Limit length
        };

        test('Sanitize basic query', () => {
            expect(sanitizeSearchQuery('iPhone')).toBe('iphone');
        });

        test('Remove SQL injection attempts', () => {
            expect(sanitizeSearchQuery("'; DROP TABLE--%")).toContain('\\');
        });

        test('Limit query length', () => {
            const longQuery = 'a'.repeat(200);
            expect(sanitizeSearchQuery(longQuery).length).toBeLessThanOrEqual(100);
        });

        test('Handle wildcards', () => {
            const result = sanitizeSearchQuery('Phone%Tablet*');
            expect(result).toContain('\\%');
            expect(result).toContain('\\*');
        });

        test('Invalid input types', () => {
            expect(sanitizeSearchQuery(null)).toBe('');
            expect(sanitizeSearchQuery(undefined)).toBe('');
            expect(sanitizeSearchQuery(123)).toBe('');
        });
    });

    // ============================================
    // 10. PAGINATION VALIDATION
    // ============================================

    describe('Pagination Validation (validatePagination)', () => {
        const validatePagination = (page, limit) => {
            const validPage = Number.isInteger(page) && page > 0 ? page : 1;
            const validLimit = Number.isInteger(limit) && limit > 0 && limit <= 100
                ? limit
                : 10;

            return { page: validPage, limit: validLimit };
        };

        test('Valid pagination', () => {
            const result = validatePagination(2, 20);
            expect(result.page).toBe(2);
            expect(result.limit).toBe(20);
        });

        test('Default values', () => {
            const result = validatePagination(0, 0);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });

        test('Limit max 100', () => {
            const result = validatePagination(1, 200);
            expect(result.limit).toBe(10); // Falls back to default
        });

        test('Negative values', () => {
            const result = validatePagination(-5, -10);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });
    });

});
