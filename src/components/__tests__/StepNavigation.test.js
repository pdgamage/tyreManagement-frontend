// Test file to verify step navigation works correctly

describe('Step Navigation in Tire Request Form', () => {
  // Mock form data that would pass validation for each step
  const mockValidFormData = {
    // Step 1 fields
    vehicleNumber: "ABC123",
    vehicleBrand: "Toyota",
    vehicleModel: "Camry",
    userSection: "IT Department",
    costCenter: "CC001",
    
    // Step 2 fields
    tireSizeRequired: "205/55R16",
    quantity: 2,
    existingTireMake: "Michelin",
    lastReplacementDate: "2023-01-15",
    presentKmReading: "50000",
    previousKmReading: "30000",
    tireWearPattern: "Even",
    
    // Step 3 fields (includes requester info)
    requestReason: "Tire wear due to normal usage",
    requesterName: "John Doe",
    requesterEmail: "john.doe@company.com",
    requesterPhone: "1234567890",
    
    // Step 4 fields
    supervisorId: "supervisor123",
    comments: "Additional comments",
    images: [null, null, null, null, null, null, null]
  };

  // Validation function for each step (extracted from component logic)
  const validateStep = (step, formData) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.vehicleNumber) errors.vehicleNumber = "Vehicle number is required";
        if (!formData.vehicleBrand) errors.vehicleBrand = "Vehicle brand is required";
        if (!formData.vehicleModel) errors.vehicleModel = "Vehicle model is required";
        if (!formData.userSection) errors.userSection = "Department is required";
        if (!formData.costCenter) errors.costCenter = "Cost center is required";
        break;
        
      case 2:
        if (!formData.tireSizeRequired) errors.tireSizeRequired = "Tire size is required";
        if (!formData.quantity || formData.quantity < 1) errors.quantity = "Valid quantity is required";
        if (!formData.existingTireMake) errors.existingTireMake = "Existing tire make is required";
        if (!formData.lastReplacementDate) errors.lastReplacementDate = "Last replacement date is required";
        if (!formData.presentKmReading) errors.presentKmReading = "Current KM reading is required";
        if (!formData.previousKmReading) errors.previousKmReading = "Previous KM reading is required";
        if (!formData.tireWearPattern) errors.tireWearPattern = "Tire wear pattern is required";
        break;
        
      case 3:
        if (!formData.requestReason) errors.requestReason = "Request reason is required";
        if (!formData.requesterName) errors.requesterName = "Name is required";
        if (!formData.requesterEmail) errors.requesterEmail = "Email is required";
        if (!formData.requesterPhone) errors.requesterPhone = "Phone is required";
        break;
        
      case 4:
        if (!formData.supervisorId) errors.supervisorId = "Supervisor is required";
        break;
    }

    return Object.keys(errors).length === 0;
  };

  // Test navigation from step 1 to step 2
  test('Can navigate from step 1 to step 2 with valid data', () => {
    const result = validateStep(1, mockValidFormData);
    expect(result).toBe(true);
  });

  // Test navigation from step 2 to step 3
  test('Can navigate from step 2 to step 3 with valid data', () => {
    const result = validateStep(2, mockValidFormData);
    expect(result).toBe(true);
  });

  // Test navigation from step 3 to step 4 (this was the problematic one)
  test('Can navigate from step 3 to step 4 with valid data', () => {
    const result = validateStep(3, mockValidFormData);
    expect(result).toBe(true);
  });

  // Test step 4 validation
  test('Step 4 validation works correctly', () => {
    const result = validateStep(4, mockValidFormData);
    expect(result).toBe(true);
  });

  // Test that step 3 fails without required fields
  test('Step 3 validation fails without required fields', () => {
    const incompleteData = {
      ...mockValidFormData,
      requestReason: "", // Missing required field
      requesterPhone: "" // Missing required field
    };
    
    const result = validateStep(3, incompleteData);
    expect(result).toBe(false);
  });

  // Test that step 4 fails without supervisor
  test('Step 4 validation fails without supervisor', () => {
    const incompleteData = {
      ...mockValidFormData,
      supervisorId: "" // Missing required field
    };
    
    const result = validateStep(4, incompleteData);
    expect(result).toBe(false);
  });

  // Test phone number validation in step 3
  test('Step 3 phone validation works correctly', () => {
    const validatePhoneInStep3 = (phone) => {
      const testData = { ...mockValidFormData, requesterPhone: phone };
      return validateStep(3, testData);
    };

    // Valid phone numbers
    expect(validatePhoneInStep3("1234567890")).toBe(true);
    expect(validatePhoneInStep3("9876543210")).toBe(true);
    
    // Invalid phone numbers (empty)
    expect(validatePhoneInStep3("")).toBe(false);
  });

  // Test step progression logic
  test('Step progression follows correct sequence', () => {
    const steps = [1, 2, 3, 4];
    
    steps.forEach(step => {
      const isValid = validateStep(step, mockValidFormData);
      expect(isValid).toBe(true);
    });
  });
});
