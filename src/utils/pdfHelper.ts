import { TireRequest } from '../types/api';

export const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number | undefined) => {
  if (num === undefined) return 'N/A';
  return num.toLocaleString();
};

export const preparePDFData = (request: TireRequest) => {
  return {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg',
    id: request.id,
    status: request.status || 'N/A',
    requestInfo: {
      orderNumber: request.orderNumber || 'Not Assigned',
      orderPlacedDate: formatDate(request.orderPlacedDate),
      submittedAt: formatDate(request.submittedAt),
      requestReason: request.requestReason || 'N/A',
      requesterName: request.requesterName || 'N/A',
      requesterEmail: request.requesterEmail || 'N/A',
      requesterPhone: request.requesterPhone || 'N/A',
      deliveryLocation: request.deliveryOfficeName 
        ? `${request.deliveryOfficeName}${request.deliveryStreetName ? ', ' + request.deliveryStreetName : ''}${request.deliveryTown ? ', ' + request.deliveryTown : ''}`
        : 'N/A'
    },
    supplierInfo: {
      name: request.supplierName || 'Not Assigned',
      phone: request.supplierPhone || 'N/A',
      email: request.supplierEmail || 'N/A'
    },
    vehicleInfo: {
      id: request.vehicleId,
      number: request.vehicleNumber || 'N/A',
      brand: request.vehicleBrand || 'N/A',
      model: request.vehicleModel || 'N/A',
      department: request.vehicleDepartment || 'N/A',
      section: request.vehicleCostCentre || 'N/A',
    },
    tireDetails: {
      sizeRequired: request.tireSizeRequired || 'N/A',
      quantity: request.quantity || 0,
      tubesQuantity: request.tubesQuantity || 0,
      existingMake: request.existingTireMake || 'N/A',
      currentKm: formatNumber(request.presentKmReading),
      lastReplacementDate: formatDate(request.lastReplacementDate),
      kmDifference: request.presentKmReading && request.previousKmReading 
        ? formatNumber(request.presentKmReading - request.previousKmReading)
        : 'N/A',
      wearPattern: request.tireWearPattern || 'N/A',
      wearIndicator: request.tireWearIndicatorAppeared ? 'Yes' : 'No',
    },
    approval: {
      supervisorNotes: request.supervisorNotes || 'N/A',
      technicalManagerNotes: request.technicalManagerNotes || 'N/A',
      engineerNotes: request.engineerNotes || 'N/A',
    },
  };
};
