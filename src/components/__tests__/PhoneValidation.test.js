// Test file to verify phone number validation
// This demonstrates that the phone number validation allows any first digit (0-9)

describe('Phone Number Validation', () => {
  // Test cases for phone number validation
  const testCases = [
    // Valid cases - first digit can be any digit 0-9
    { input: '0712345678', expected: true, description: 'Valid 10-digit number starting with 0' },
    { input: '1712345678', expected: true, description: 'Valid 10-digit number starting with 1' },
    { input: '2712345678', expected: true, description: 'Valid 10-digit number starting with 2' },
    { input: '3712345678', expected: true, description: 'Valid 10-digit number starting with 3' },
    { input: '4712345678', expected: true, description: 'Valid 10-digit number starting with 4' },
    { input: '5712345678', expected: true, description: 'Valid 10-digit number starting with 5' },
    { input: '6712345678', expected: true, description: 'Valid 10-digit number starting with 6' },
    { input: '7712345678', expected: true, description: 'Valid 10-digit number starting with 7' },
    { input: '8712345678', expected: true, description: 'Valid 10-digit number starting with 8' },
    { input: '9712345678', expected: true, description: 'Valid 10-digit number starting with 9' },
    { input: '071234567', expected: true, description: 'Valid 9-digit number starting with 0' },
    { input: '171234567', expected: true, description: 'Valid 9-digit number starting with 1' },
    
    // Invalid cases
    { input: '12345678', expected: false, description: 'Invalid - only 8 digits' },
    { input: '12345678901', expected: false, description: 'Invalid - 11 digits (too long)' },
    { input: '071234567a', expected: false, description: 'Invalid - contains letter' },
    { input: '071-234-567', expected: false, description: 'Invalid - contains dashes (but should be cleaned)' },
    { input: '', expected: false, description: 'Invalid - empty string' },
  ];

  // Validation function (extracted from the component logic)
  const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 9) return false;
    if (phoneDigits.length > 10) return false;
    if (!/^\d{9,10}$/.test(phoneDigits)) return false;
    
    return true;
  };

  testCases.forEach(({ input, expected, description }) => {
    test(description, () => {
      const result = validatePhoneNumber(input);
      expect(result).toBe(expected);
    });
  });

  // Test the input cleaning function (from handleChange)
  test('Input cleaning removes non-digits and limits to 10 digits', () => {
    const cleanPhoneInput = (value) => {
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.slice(0, 10);
    };

    expect(cleanPhoneInput('071-234-5678')).toBe('0712345678');
    expect(cleanPhoneInput('071 234 5678')).toBe('0712345678');
    expect(cleanPhoneInput('(071) 234-5678')).toBe('0712345678');
    expect(cleanPhoneInput('071234567890123')).toBe('0712345678'); // Truncated to 10 digits
    expect(cleanPhoneInput('abc071234567def')).toBe('0712345678');
  });
});
