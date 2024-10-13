export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const emailTemplates: EmailTemplate[] = [

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
    `
  },
  {
    id: 'welcome-new',
    name: 'New Welcome Email',
    subject: 'Welcome to [Your Brand] - Let\'s Begin Your Journey!',
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
  </style>
</head>
<body style="background-color: #f7f7f7; margin: 0 !important; padding: 0 !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 0 10px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" valign="top" style="padding: 40px 10px;">
              <a href="https://yourwebsite.com" target="_blank" style="text-decoration: none;">
                <img alt="Logo" src="https://i.pinimg.com/736x/1b/87/cb/1b87cbef9358cd884afbb28bb310776e.jpg" width="200" height="50" style="display: block; width: 200px; max-width: 200px; min-width: 200px; font-family: 'Poppins', sans-serif; color: #ffffff; font-size: 18px;" border="0">
              </a>
            </td>
          </tr>
          <!-- Hero Image -->
         
          <!-- Content -->
          <tr>
            <td align="left" valign="top" style="padding: 35px; background-color: #ffffff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
              <h1 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 32px; line-height: 48px; font-weight: 700; letter-spacing: -1px; color: #2C3E50;">Welcome to [Your Brand]!</h1>
              <p style="font-family: 'Poppins', sans-serif; font-size: 16px; line-height: 24px; color: #666666; margin-top: 20px;">Dear [Name],</p>
              <p style="font-family: 'Poppins', sans-serif; font-size: 16px; line-height: 24px; color: #666666;">We're thrilled to have you join our community! At [Your Brand], we're committed to providing you with an exceptional experience and value that exceeds your expectations.</p>
              <h2 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 22px; line-height: 32px; font-weight: 600; color: #2C3E50; margin-top: 30px;">What you can expect:</h2>
              <ul style="font-family: 'Poppins', sans-serif; font-size: 16px; line-height: 24px; color: #666666; margin-top: 10px; padding-left: 30px;">
                <li style="margin-bottom: 10px;"><strong style="color: #2C3E50;">Exclusive Offers:</strong> Access to special promotions and early bird specials.</li>
                <li style="margin-bottom: 10px;"><strong style="color: #2C3E50;">Insider Content:</strong> Be the first to receive industry insights and expert advice.</li>
                <li style="margin-bottom: 10px;"><strong style="color: #2C3E50;">Community Engagement:</strong> Share your thoughts and connect with like-minded individuals.</li>
                <li><strong style="color: #2C3E50;">Latest Updates:</strong> Stay informed about our newest products and events.</li>
              </ul>
              <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                <tr>
                  <td align="center" style="border-radius: 50px;" bgcolor="#3498DB">
                    <a href="[CTA Link]" target="_blank" style="font-size: 18px; font-family: 'Poppins', sans-serif; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 50px; display: inline-block; font-weight: 600;">Get Started</a>
                  </td>
                </tr>
              </table>
              <p style="font-family: 'Poppins', sans-serif; font-size: 16px; line-height: 24px; color: #666666; margin-top: 30px;">If you have any questions, our support team is always here to help at <a href="mailto:[support email]" style="color: #3498DB; text-decoration: none;">[support email]</a>.</p>
              <p style="font-family: 'Poppins', sans-serif; font-size: 16px; line-height: 24px; color: #666666; margin-top: 20px;">Welcome aboard!</p>
              <p style="font-family: 'Poppins', sans-serif; font-size: 16px; line-height: 24px; color: #666666;">The [Your Brand] Team</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 35px; background-color: #ffffff; border-top: 1px solid #e9e9e9; font-family: 'Poppins', sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
              <p style="margin: 0;">&copy; 2023 [Your Brand]. All rights reserved.</p>
              <p style="margin: 0;">
                <a href="[Unsubscribe Link]" style="color: #3498DB; text-decoration: underline;" target="_blank">Unsubscribe</a> |
                <a href="[Privacy Policy Link]" style="color: #3498DB; text-decoration: underline;" target="_blank">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
    `
  },
  {
    id: 'testimonials',
    name: 'Testimonials/Social Proof',
    subject: 'Hear What Everyone Is Raving About',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #4CAF50; text-align: center;">Customer Testimonials</h1>
  
  <p>The happiness and satisfaction of our cherished customers fuels [Your Brand's] dedication to providing top-notch goods and services. We take pride in the relationships we develop with each customer, so we wanted to share some feedback we've gotten from those who have personally experienced the [Your Brand] difference.</p>

  <h2 style="color: #2196F3;">Here are some testimonials from our delighted customers:</h2>
  <div style="background-color: #f0f0f0; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
    <p><strong>[Customer Name 1]:</strong> "[Testimonial or quote from the customer about their positive experience with your product/service.]"</p>
  </div>
  <div style="background-color: #f0f0f0; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
    <p><strong>[Customer Name 2]:</strong> "[Testimonial or quote from the customer highlighting the specific benefits they received from your brand.]"</p>
  </div>
  <div style="background-color: #f0f0f0; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
    <p><strong>[Customer Name 3]:</strong> "[Testimonial or quote from the customer expressing their appreciation for your exceptional customer service or support.]"</p>
  </div>
  <div style="background-color: #f0f0f0; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
    <p><strong>[Customer Name 4]:</strong> "[Testimonial or quote focusing on how your brand has solved a particular pain point or made a positive impact on their life or business.]"</p>
  </div>

  <p>Want to share your experience with [Your Brand]? We'd love to hear your thoughts! Feel free to leave us a review by replying to this email or visiting our website [insert review submission link].</p>

  <p>Thank you once again for choosing [Your Brand]. If you have any questions or need further assistance, don't hesitate to reach out. We're always here to help.</p>

  <div style="text-align: center; margin-top: 20px;">
    <a href="[CTA Link]" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Share Your Experience</a>
  </div>

  <p style="margin-top: 20px;">Warm regards,</p>
  <p>[Signature]</p>
</div>
    `
  },
  {
    id: 'survey',
    name: 'Survey/Feedback Request',
    subject: 'We Value Your Input! Help Us Improve with Your Feedback',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #4CAF50; text-align: center;">Your Feedback Matters</h1>
  
  <p>Dear [Name],</p>

  <p>You are an important part of our [Your Brand] family, and we value the insights and experiences you have shared with us. We work hard to improve our goods and services and keep your satisfaction at the center of everything we do.</p>

  <p>We kindly ask for you to lend a few minutes of your time to filling out our customer feedback survey. Your suggestions will be crucial in determining how we will develop our services in the future.</p>

  <div style="text-align: center; margin: 20px 0;">
    <a href="[Link to the survey]" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take the Survey</a>
  </div>

  <p>The survey will only take a few minutes to complete, and your responses will remain anonymous. In order for us to better understand your preferences, expectations, and areas where we can improve, we hope you'll take this opportunity to leave open and honest feedback.</p>

  <p>Thank you for supporting [Your Brand] in such a significant way. Please contact our knowledgeable support team at <a href="mailto:[support email]">[support email]</a> if you have any questions or run into any problems with the survey.</p>

  <p style="margin-top: 20px;">All the best,</p>
  <p>[Signature]</p>
</div>
    `
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    subject: "You're Invited! RSVP for Our Upcoming [Event Type]",
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #4CAF50; text-align: center;">You're Invited!</h1>
  
  <p>Dear [Name],</p>

  <p>We are delighted to extend a warm invitation to you for [Your Brand]'s upcoming [Event Type]. This event promises to be enlightening, containing insightful observations, professional knowledge, and stimulating discussions.</p>

  <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px;">
    <h2 style="color: #2196F3; margin-top: 0;">Event Details:</h2>
    <p><strong>Event Name:</strong> [Event Name]</p>
    <p><strong>Date:</strong> [Event Date]</p>
    <p><strong>Time:</strong> [Event Time]</p>
    <p><strong>Duration:</strong> [Event Duration]</p>
  </div>

  <h3 style="color: #2196F3;">During this [Event Type], you'll have the opportunity to:</h3>
  <ul>
    <li>Learn from industry experts who will share their expertise and knowledge.</li>
    <li>Engage in interactive sessions and hands-on workshops to hone your skills.</li>
    <li>Connect and network with like-minded individuals who share your interests.</li>
  </ul>

  <div style="text-align: center; margin: 20px 0;">
    <a href="[RSVP Link]" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Now</a>
  </div>

  <p>If you have any questions or require further information, please feel free to reach out to our event support team at <a href="mailto:[support email]">[support email]</a>.</p>

  <p>We are looking forward to seeing you there!</p>

  <p style="margin-top: 20px;">All the best,</p>
  <p>[Signature]</p>
</div>
    `
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    subject: 'Thank You for Choosing [Your Brand]: Gratitude from Our Team',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #4CAF50; text-align: center;">Thank You!</h1>
  
  <p>Dear [Name],</p>

  <p>Thank you so much for choosing [Your Brand]. We are grateful to have you as a valued customer and appreciate your support and confidence.</p>

  <p>At [Your Brand], our mission has always been to deliver an exceptional experience. Your decision to place your trust in us drives our passion to exceed your expectations continually.</p>

  <p>We wanted to take a moment to thank you for your loyalty and for being an essential part of our growing community. Your feedback and insights have been invaluable in shaping how we do business, and we're committed to using this knowledge to better serve you in the future.</p>

  <p>Should you ever need assistance or have any questions, please don't hesitate to reach out to our customer support team at <a href="mailto:[support email]">[support email]</a>. We're here to help!</p>

  <p>Once again, thank you for choosing [Your Brand]. We look forward to continuing this incredible journey together.</p>

  <div style="text-align: center; margin: 20px 0;">
    <a href="[CTA Link]" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Our Latest Offerings</a>
  </div>

  <p style="margin-top: 20px;">Gratefully yours,</p>
  <p>[Signature]</p>
</div>
    `
  }
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(template => template.id === id);
}