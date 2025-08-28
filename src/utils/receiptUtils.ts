export const generateReceiptNumber = (request: {
  id: string;
  submittedAt: Date | string;
  vehicleNumber: string;
}) => {
  const date = new Date(request.submittedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const vehicleCode = request.vehicleNumber.replace(/[^A-Z0-9]/g, '');
  const requestId = String(request.id).padStart(4, '0');

  return `SLTM/TO/${year}${month}/${vehicleCode}/${requestId}`;
};
