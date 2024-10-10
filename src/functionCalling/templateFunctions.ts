import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateTemplate(description: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate an email template based on the following description: "${description}".
  Please provide a subject line and email body. Use [NAME] as a placeholder for the recipient's name. Do not include "Subject:" or any asterisks in the response. Separate the subject and body with two newline characters.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const generatedText = response.text();

  console.log('Generated Text:', generatedText);

  const [generatedSubject, ...bodyParts] = generatedText.split('\n\n');
  
  return {
    subject: generatedSubject.trim(),
    body: bodyParts.join('\n\n').trim()
  };
}

export function saveTemplate(name: string, subject: string, body: string) {
  // Implement the logic to save the template to your database or storage
  console.log(`Saving template: ${name}`);
  // For now, we'll just return a success message
  return `Template "${name}" saved successfully`;
}

export function createTemplate(name: string, content: string) {
  console.log(`Creating template: ${name}`);
  // Implement template creation logic
  return `Template "${name}" created`;
}

export function editTemplate(id: string, content: string) {
  console.log(`Editing template ${id}`);
  // Implement template editing logic
  return `Template ${id} updated`;
}

// Add more template-related functions