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
  {
    id: 'go-green',
    name: 'Go Green',
    subject: 'Join EcoTech Solutions in Embracing a Greener Future',
    body: `
<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #2c5e2e; background-color: #f0f7f0; padding: 20px;">
  <h1 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">EcoTech Solutions</h1>
  
  <h2 style="color: #2c5e2e; text-align: center; margin-bottom: 20px;">Embracing a Greener Future</h2>
  
  <p style="color: #2c5e2e; margin-bottom: 15px;">Dear [Name],</p>
  
  <p style="color: #2c5e2e; margin-bottom: 20px;">Join us in our mission to revolutionize technology with sustainable solutions.</p>
  
  <div style="background-color: #8BC34A; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
    <h3 style="margin-top: 0; color: white;">Our Green Initiatives</h3>
    <p style="color: white;">At EcoTech Solutions, we're committed to pushing green technology forward. Our innovative approaches are designed to reduce environmental impact while enhancing performance.</p>
  </div>

  <h3 style="color: #2c5e2e; margin-bottom: 15px;">Sustainable Innovation</h3>
  <ul style="color: #2c5e2e; margin-bottom: 20px; padding-left: 20px;">
    <li>Energy-efficient smart devices</li>
    <li>Biodegradable electronics</li>
    <li>Solar-powered infrastructure solutions</li>
  </ul>

  <div style="background-color: #66BB6A; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
    <h3 style="margin-top: 0; color: white;">Join the Green Revolution</h3>
    <p style="color: white;">Together, we can create a sustainable future. Your support drives our innovation and helps us implement green technologies on a global scale.</p>
  </div>

  <p style="color: #2c5e2e; margin-bottom: 15px;">Let's make a difference together!</p>
  
  <p style="color: #2c5e2e; margin-bottom: 20px;">Best regards,<br>The EcoTech Team</p>
  
  <div style="background-color: #4CAF50; color: white; text-align: center; padding: 10px; font-size: 0.8em; border-radius: 5px;">
    <p style="color: white; margin: 0;">You're receiving this email because you've expressed interest in our green technology initiatives. 
    Stay updated on our latest developments and how you can contribute to a greener future.</p>
  </div>
</div>
    `,
  },
  // Add more templates as needed
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(template => template.id === id);
}
