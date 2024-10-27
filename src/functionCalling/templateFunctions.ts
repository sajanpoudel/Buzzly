import { GoogleGenerativeAI } from "@google/generative-ai";
import { TemplateData } from "@/types/database";
import { createTemplate as createTemplateInDb } from '@/utils/db';
import { doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export async function saveTemplate(name: string, subject: string, body: string, userId: string) {
  console.log(`Saving template: ${name}`);
  
  // Create a new document reference to get an ID
  const templateRef = doc(collection(db, 'templates'));
  
  // Create template data with ID and userId
  const templateData: TemplateData = {
    id: templateRef.id,
    userId: userId, // Add the userId here
    name,
    description: '',
    category: 'custom',
    subject,
    body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await createTemplateInDb(templateData);
}

// Update createTemplate to handle ID generation
export async function createTemplate(templateData: Omit<TemplateData, 'id'>) {
  console.log(`Creating template: ${templateData.name}`);
  
  // Create a new document reference to get an ID
  const templateRef = doc(collection(db, 'templates'));
  
  // Create the full template data with the generated ID
  const fullTemplateData: TemplateData = {
    ...templateData,
    id: templateRef.id
  };
  
  return await createTemplateInDb(fullTemplateData);
}

export function editTemplate(id: string, content: string) {
  console.log(`Editing template ${id}`);
  // Implement template editing logic
  return `Template ${id} updated`;
}

// Add more template-related functions
