import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface SendPaymentFormProps {
  onSubmit: (paymentData: PaymentData) => void;
}

export interface PaymentData {
  recipient: string;
  amount: number;
  description: string;
  paymentType: 'check' | 'ach';
  isMultipleRecipients: boolean;
  csvFile?: File;
}

export function SendPaymentForm({ onSubmit }: SendPaymentFormProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    recipient: '',
    amount: 0,
    description: '',
    paymentType: 'check',
    isMultipleRecipients: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(paymentData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentData(prev => ({ ...prev, csvFile: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="multiple-recipients"
          checked={paymentData.isMultipleRecipients}
          onCheckedChange={(checked) => setPaymentData(prev => ({ ...prev, isMultipleRecipients: checked }))}
        />
        <Label htmlFor="multiple-recipients">Multiple Recipients</Label>
      </div>

      {!paymentData.isMultipleRecipients && (
        <>
          <div>
            <Label htmlFor="recipient">Recipient Name or Email</Label>
            <Input
              id="recipient"
              value={paymentData.recipient}
              onChange={(e) => setPaymentData({ ...paymentData, recipient: e.target.value })}
              required={!paymentData.isMultipleRecipients}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
              required
              min="0.01"
              step="0.01"
            />
          </div>
        </>
      )}

      {paymentData.isMultipleRecipients && (
        <div>
          <Label htmlFor="csv-upload">Upload CSV File</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            required={paymentData.isMultipleRecipients}
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={paymentData.description}
          onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="paymentType">Payment Type</Label>
        <Select
          value={paymentData.paymentType}
          onValueChange={(value: 'check' | 'ach') => setPaymentData({ ...paymentData, paymentType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="check">Digital Check</SelectItem>
            <SelectItem value="ach">ACH Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Send Payment</Button>
    </form>
  );
}