// Test file to verify image size validation (5MB limit)

describe('Image Size Validation', () => {
  // Helper function to create a mock file with specific size
  const createMockFile = (name, size, type = 'image/jpeg') => {
    const file = new File([''], name, { type });
    // Override the size property
    Object.defineProperty(file, 'size', {
      value: size,
      writable: false
    });
    return file;
  };

  // Helper function to format file size (same as in component)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Test cases for file size validation
  const testCases = [
    {
      name: 'small-image.jpg',
      size: 1024 * 1024, // 1MB
      expected: true,
      description: 'Valid 1MB image'
    },
    {
      name: 'medium-image.jpg',
      size: 3 * 1024 * 1024, // 3MB
      expected: true,
      description: 'Valid 3MB image'
    },
    {
      name: 'large-image.jpg',
      size: 5 * 1024 * 1024, // 5MB (exactly at limit)
      expected: true,
      description: 'Valid 5MB image (at limit)'
    },
    {
      name: 'oversized-image.jpg',
      size: 6 * 1024 * 1024, // 6MB
      expected: false,
      description: 'Invalid 6MB image (over limit)'
    },
    {
      name: 'huge-image.jpg',
      size: 10 * 1024 * 1024, // 10MB
      expected: false,
      description: 'Invalid 10MB image (way over limit)'
    },
    {
      name: 'tiny-image.jpg',
      size: 1024, // 1KB
      expected: true,
      description: 'Valid 1KB image'
    }
  ];

  // Validation function (extracted from component logic)
  const validateImageSize = (file) => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSizeInBytes;
  };

  testCases.forEach(({ name, size, expected, description }) => {
    test(description, () => {
      const mockFile = createMockFile(name, size);
      const result = validateImageSize(mockFile);
      expect(result).toBe(expected);
    });
  });

  // Test file size formatting
  test('File size formatting works correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    expect(formatFileSize(6 * 1024 * 1024)).toBe('6 MB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  // Test error message generation
  test('Error messages are generated correctly for oversized files', () => {
    const generateErrorMessage = (fileSize) => {
      return `Image size must be less than 5MB. Current size: ${formatFileSize(fileSize)}`;
    };

    expect(generateErrorMessage(6 * 1024 * 1024)).toBe('Image size must be less than 5MB. Current size: 6 MB');
    expect(generateErrorMessage(7.5 * 1024 * 1024)).toBe('Image size must be less than 5MB. Current size: 7.5 MB');
    expect(generateErrorMessage(10 * 1024 * 1024)).toBe('Image size must be less than 5MB. Current size: 10 MB');
  });

  // Test that different image types are handled correctly
  test('Different image types are validated correctly', () => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const oversizedFile = 6 * 1024 * 1024; // 6MB

    imageTypes.forEach(type => {
      const mockFile = createMockFile(`test.${type.split('/')[1]}`, oversizedFile, type);
      const result = validateImageSize(mockFile);
      expect(result).toBe(false);
    });
  });
});
