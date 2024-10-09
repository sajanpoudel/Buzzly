export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Our Service!',
    body: 'Dear [Name],\n\nWelcome to our service! We\'re excited to have you on board...'
  },
  {
    id: 'newsletter',
    name: 'Monthly Newsletter',
    subject: 'Your Monthly Update',
    body: 'Hello [Name],\n\nHere\'s what\'s new this month...'
  },
  {
    id: 'promotion',
    name: 'Promotional Offer',
    subject: 'Special Offer Just for You!',
    body: 'Hi [Name],\n\nWe have an exclusive offer for you...'
  },
  // Add more templates as needed
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(template => template.id === id);
}