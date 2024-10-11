import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CHECKBOOK_API_KEY = process.env.CHECKBOOK_API_KEY;
const CHECKBOOK_API_SECRET = process.env.CHECKBOOK_API_SECRET;
const CHECKBOOK_API_URL = process.env.CHECKBOOK_API_URL || 'https://sandbox.checkbook.io/v3/check';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { recipient, amount, description, paymentType } = req.body;

  try {
    const response = await axios.post(
      CHECKBOOK_API_URL,
      {
        recipient: recipient,
        name: 'Your Company Name',
        amount: amount,
        description: description,
        type: paymentType === 'ach' ? 'ACH' : 'CHECK',
      },
      {
        auth: {
          username: CHECKBOOK_API_KEY!,
          password: CHECKBOOK_API_SECRET!,
        },
      }
    );

    res.status(200).json({ transactionId: response.data.id });
  } catch (error) {
    console.error('Error sending payment:', error);
    res.status(500).json({ message: 'Error sending payment' });
  }
}