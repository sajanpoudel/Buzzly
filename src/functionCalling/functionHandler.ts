import { GoogleGenerativeAI } from "@google/generative-ai";
import * as campaignFunctions from './campaignFunctions';
import * as emailFunctions from './emailFunctions';
import * as templateFunctions from './templateFunctions';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const functionMappings: { [key: string]: Function } = {
  createCampaign: campaignFunctions.createCampaign,
  scheduleCampaign: campaignFunctions.scheduleCampaign,
  sendEmail: emailFunctions.sendEmail,
  draftEmail: emailFunctions.draftEmail,
  createTemplate: templateFunctions.createTemplate,
  editTemplate: templateFunctions.editTemplate,
};

export async function handleUserInput(input: string, uiCallbacks: {
  startEmailCreation: () => void;
  openPaymentForm: () => void;
  startTemplateCreation: () => void;
  startCampaignCreation: () => void;
}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      You are an AI assistant specializing in email campaigns and marketing, but you can also answer general questions. Analyze the following user input:
      
      "${input}"
      
      If the input is related to one of these specific actions, return a JSON object with the "action" key:
      - Creating a campaign: { "action": "createCampaign" }
      - Sending an email: { "action": "sendEmail" }
      - Sending money: { "action": "sendMoney" }
      - Creating an email template: { "action": "createTemplate" }
      
      If the input is not related to these actions, do not return a JSON object. Instead, provide a friendly and helpful response as an AI assistant. Your response should be informative and relevant to the user's question, whether it's about email marketing, campaigns, or any other topic. Keep the response concise and under 100 words.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    if (responseText.startsWith('{') && responseText.endsWith('}')) {
      try {
        const response = JSON.parse(responseText);
        
        switch (response.action) {
          case "createCampaign":
            uiCallbacks.startCampaignCreation();
            return "Certainly! I've opened the campaign creation form for you. Let's start creating your new campaign.";
          case "sendEmail":
            uiCallbacks.startEmailCreation();
            return "Certainly! I've opened the email creation form for you. Please fill in the details to send your email.";
          case "sendMoney":
            uiCallbacks.openPaymentForm();
            return "Of course! I've opened the payment form for you. Please fill in the details to send money.";
          case "createTemplate":
            uiCallbacks.startTemplateCreation();
            return "Sure thing! I've opened the template creation form for you. Let's create a new email template.";
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        // If JSON parsing fails, treat it as a general response
      }
    }
    
    // If it's not a specific action or JSON parsing failed, return the Gemini response directly
    return responseText;
  } catch (error) {
    console.error('Error in handleUserInput:', error);
    return "I apologize, but I encountered an error while processing your request. Could you please try rephrasing your question or ask something else?";
  }
}