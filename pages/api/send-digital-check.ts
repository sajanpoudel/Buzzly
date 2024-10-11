import type { NextApiRequest, NextApiResponse } from 'next';
import CheckbookAPI from 'checkbook-api';

const Checkbook = new CheckbookAPI({
  api_key: process.env.CHECKBOOK_API_KEY || 'd6aa2703655f4ba2af2a56202961ca86',
  api_secret: process.env.CHECKBOOK_API_SECRET || 'dXbCgzYBMibj8ZwuQMd2NXr6rtvjZ8',
  env: 'sandbox'
});

function sendDigitalCheck(recipientName: string, recipientEmail: string, amount: number, description: string) {
  return new Promise((resolve, reject) => {
    Checkbook.checks.sendDigitalCheck({
      name: recipientName,
      recipient: recipientEmail,
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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { recipient, email, amount, description } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ message: 'Email and amount are required' });
  }

  try {
    const result = await sendDigitalCheck(
      recipient,
      email,
      amount,
      description
    );
    res.status(200).json({ message: 'Digital check sent successfully', result });
  } catch (error) {
    console.error('Error sending digital check:', error);
    res.status(500).json({ message: 'Error sending digital check', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}