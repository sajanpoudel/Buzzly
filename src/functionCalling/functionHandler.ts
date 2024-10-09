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

export async function handleUserInput(input: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      Based on the following user input, determine the most appropriate function to call and its arguments.
      Return your response in JSON format with 'function' and 'args' keys.
      Do not include any markdown formatting or additional text.
      Available functions: ${Object.keys(functionMappings).join(', ')}
      
      User input: "${input}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Remove any markdown formatting if present
    const jsonString = responseText.replace(/```json\n|\n```|```JSON\n/g, '').trim();
    
    console.log("AI response:", jsonString); // Log the cleaned response

    let response;
    try {
      response = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return "I'm sorry, I couldn't understand how to process that request.";
    }

    if (response.function in functionMappings) {
      const result = await functionMappings[response.function](...Object.values(response.args));
      return result;
    } else {
      return "I'm not sure how to handle that request.";
    }
  } catch (error) {
    console.error('Error in handleUserInput:', error);
    return "Sorry, I encountered an error processing your request.";
  }
}