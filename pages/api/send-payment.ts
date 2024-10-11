import type { NextApiRequest, NextApiResponse } from 'next';
import CheckbookAPI from 'checkbook-api';

const Checkbook = new CheckbookAPI({
  api_key: process.env.CHECKBOOK_API_KEY,
  api_secret: process.env.CHECKBOOK_API_SECRET,
  env: 'sandbox'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { recipient, amount, description } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      Checkbook.checks.sendDigitalCheck({
        name: recipient,
        recipient: recipient,
        description: description,
        amount: amount
      }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });

    res.status(200).json({ message: 'Payment sent successfully', result });
  } catch (error) {
    console.error('Error sending payment:', error);
    res.status(500).json({ message: 'Error sending payment', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}