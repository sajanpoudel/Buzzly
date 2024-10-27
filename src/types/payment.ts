export interface PaymentData {
  recipient: string;
  amount: number;
  description: string;
  paymentType: string;
  isMultipleRecipients: boolean;
  csvFile?: File;
}
