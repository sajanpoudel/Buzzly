import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SendPaymentFormProps {
  onSubmit: (paymentData: PaymentData) => void;
}

export interface PaymentData {
  recipient: string;
  amount: number;
  description: string;
  paymentType: 'check' | 'ach';
}

export function SendPaymentForm({ onSubmit }: SendPaymentFormProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    recipient: '',
    amount: 0,
    description: '',
    paymentType: 'check',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(paymentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="recipient">Recipient Name</Label>
        <Input
          id="recipient"
          value={paymentData.recipient}
          onChange={(e) => setPaymentData({ ...paymentData, recipient: e.target.value })}
          required
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