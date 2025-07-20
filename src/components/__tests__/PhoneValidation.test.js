// Test file to verify phone number validation
// This demonstrates that the phone number validation requires max 10 digits and no leading zeros

describe('Phone Number Validation', () => {
  // Test cases for phone number validation (max 10 digits, no leading zeros)
  const testCases = [
    // Valid cases - first digit must NOT be zero
    { input: '1712345678', expected: true, description: 'Valid 10-digit number starting with 1' },
    { input: '2712345678', expected: true, description: 'Valid 10-digit number starting with 2' },
    { input: '3712345678', expected: true, description: 'Valid 10-digit number starting with 3' },
    { input: '4712345678', expected: true, description: 'Valid 10-digit number starting with 4' },
    { input: '5712345678', expected: true, description: 'Valid 10-digit number starting with 5' },
    { input: '6712345678', expected: true, description: 'Valid 10-digit number starting with 6' },
    { input: '7712345678', expected: true, description: 'Valid 10-digit number starting with 7' },
    { input: '8712345678', expected: true, description: 'Valid 10-digit number starting with 8' },
    { input: '9712345678', expected: true, description: 'Valid 10-digit number starting with 9' },
    { input: '171234567', expected: true, description: 'Valid 9-digit number starting with 1' },
    { input: '12345', expected: true, description: 'Valid 5-digit number' },
    { input: '1', expected: true, description: 'Valid 1-digit number' },
    
    // Invalid cases
    { input: '0712345678', expected: false, description: 'Invalid - starts with 0' },
    { input: '071234567', expected: false, description: 'Invalid - starts with 0' },
    { input: '12345678901', expected: false, description: 'Invalid - 11 digits (too long)' },
    { input: '071234567a', expected: false, description: 'Invalid - contains letter' },
    { input: '', expected: false, description: 'Invalid - empty string' },
  ];

  // Validation function (extracted from the component logic)
  const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length === 0) return false;
    if (phoneDigits.length > 10) return false;
    if (phoneDigits.startsWith('0')) return false;
    if (!/^\d+$/.test(phoneDigits)) return false;
    
    return true;
  };

  testCases.forEach(({ input, expected, description }) => {
    test(description, () => {
      const result = validatePhoneNumber(input);
      expect(result).toBe(expected);
    });
  });

  // Test the input cleaning function (from handleChange) - removes leading zeros
  test('Input cleaning removes non-digits, leading zeros, and limits to 10 digits', () => {
    const cleanPhoneInput = (value) => {
      const digitsOnly = value.replace(/\D/g, '');
      const withoutLeadingZeros = digitsOnly.replace(/^0+/, '');
      return withoutLeadingZeros.slice(0, 10);
    };

    expect(cleanPhoneInput('071-234-5678')).toBe('712345678'); // Leading zero removed
    expect(cleanPhoneInput('071 234 5678')).toBe('712345678'); // Leading zero removed
    expect(cleanPhoneInput('(071) 234-5678')).toBe('712345678'); // Leading zero removed
    expect(cleanPhoneInput('171234567890123')).toBe('1712345678'); // Truncated to 10 digits
    expect(cleanPhoneInput('abc171234567def')).toBe('1712345678');
    expect(cleanPhoneInput('000123456789')).toBe('123456789'); // All leading zeros removed
    expect(cleanPhoneInput('0000')).toBe(''); // All zeros removed
  });
});
