import { GoogleGenerativeAI } from "@google/generative-ai";
import * as campaignFunctions from './campaignFunctions';
import * as emailFunctions from './emailFunctions';
import * as templateFunctions from './templateFunctions';
import { analyzeCampaign, getOverallPerformance } from '../playground/functions/campaignAnalysis';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface AnalysisResponse {
  analysis: string;
  stats?: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    deviceBreakdown: { [key: string]: number };
  };
  trends?: {
    isImproving: boolean;
    topPerformingDevice: string;
    peakEngagementTime?: string;
  };
  suggestions?: string[];
  needsVisualization?: boolean;
}

interface OverallPerformanceResponse {
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  trends?: {
    date: string;
    openRate: number;
    clickRate: number;
  }[];
  suggestions?: string[];
}

const functionMappings: { [key: string]: Function } = {
  createCampaign: campaignFunctions.createCampaign,
  scheduleCampaign: campaignFunctions.scheduleCampaign,
  sendEmail: emailFunctions.sendEmail,
  draftEmail: emailFunctions.draftEmail,
  createTemplate: templateFunctions.createTemplate,
  editTemplate: templateFunctions.editTemplate,
  analyzeCampaign: analyzeCampaign,
  getOverallPerformance: getOverallPerformance
};

export async function handleUserInput(input: string, userId: string, uiCallbacks: {
  startEmailCreation: () => void;
  openPaymentForm: () => void;
  startTemplateCreation: () => void;
  startCampaignCreation: () => void;
}): Promise<string | AnalysisResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, check if it's a campaign analysis query
    const analysisPrompt = `
      Analyze this user query about email campaigns:
      "${input}"
      
      Return a JSON object with:
      {
        "type": "specific_analysis" | "specific_improvement" | "overall" | "other",
        "campaignName": string | null,
        "timeRange": number | null,
        "needsVisualization": boolean
      }

      Examples:
      "How is my campaign 'Summer Sale' doing?" -> 
        { "type": "specific_analysis", "campaignName": "Summer Sale", "timeRange": null, "needsVisualization": true }
      
      "Analyze the campaign 'Welcome Email'" -> 
        { "type": "specific_analysis", "campaignName": "Welcome Email", "timeRange": null, "needsVisualization": true }
      
      "How can I improve my 'Newsletter' campaign?" -> 
        { "type": "specific_improvement", "campaignName": "Newsletter", "timeRange": null, "needsVisualization": true }
      
      "Show overall performance" -> 
        { "type": "overall", "campaignName": null, "timeRange": 30, "needsVisualization": true }
      
      "Create a new campaign" -> 
        { "type": "other", "campaignName": null, "timeRange": null, "needsVisualization": false }
    `;

    const analysisResult = await model.generateContent(analysisPrompt);
    let queryType;
    try {
      queryType = JSON.parse(analysisResult.response.text());
    } catch (e) {
      queryType = { type: "other" };
    }

    if (queryType.type === "specific_analysis" || queryType.type === "specific_improvement") {
      const response = await analyzeCampaign(userId, queryType.campaignName);
      
      if (typeof response === 'string') {
        return response;
      }

      // Updated prompt for better insights
      const insightPrompt = `
        Analyze this campaign performance data:
        Campaign Name: "${queryType.campaignName}"
        Open Rate: ${response.stats.openRate}%
        Click Rate: ${response.stats.clickRate}%
        Conversion Rate: ${response.stats.conversionRate}%
        Top Device: ${response.trends.topPerformingDevice}

        Provide a clear analysis in this exact format, with proper line breaks between sections and points:

        Campaign Performance

        • Open Rate: ${response.stats.openRate}% - [interpret open rate]
        • Click Rate: ${response.stats.clickRate}% - [interpret click rate]
        • Conversion Rate: ${response.stats.conversionRate}% - [interpret conversion rate]

        Key Improvements Needed

        1. [First major improvement area]

        2. [Second major improvement area]

        3. [Third major improvement area]

        Action Steps

        1. [First specific action] - make it clear and actionable

        2. [Second specific action] - make it clear and actionable

        3. [Third specific action] - make it clear and actionable

        Rules for response:
        1. Do not use any markdown formatting (no **, no #, no html tags)
        2. Keep interpretations concise but meaningful
        3. Make improvements specific and actionable
        4. Use proper line breaks between sections and numbered points
        5. Start each bullet point on a new line
        6. Make action steps highly specific and practical
        7. Use plain text only
      `;

      const insights = await model.generateContent(insightPrompt);
      
      return {
        analysis: insights.response.text(),
        stats: response.stats,
        trends: response.trends,
        suggestions: response.suggestions,
        needsVisualization: queryType.needsVisualization
      };
    }

    if (queryType.type === "overall") {
      const timeRange = queryType.timeRange || 30;
      const response = await getOverallPerformance(userId, timeRange);
      
      if (typeof response === 'string') {
        return response;
      }

      const performanceResponse = response as OverallPerformanceResponse;

      const insightPrompt = `
        Given this overall campaign performance:
        ${JSON.stringify(performanceResponse)}
        
        Provide a brief summary of the overall performance trends.
        Focus on key metrics and notable improvements or areas needing attention.
      `;

      const insights = await model.generateContent(insightPrompt);
      
      const analysisResponse: AnalysisResponse = {
        analysis: insights.response.text(),
        stats: {
          openRate: (performanceResponse.stats.opened / performanceResponse.stats.sent) * 100,
          clickRate: (performanceResponse.stats.clicked / performanceResponse.stats.sent) * 100,
          conversionRate: (performanceResponse.stats.converted / performanceResponse.stats.sent) * 100,
          deviceBreakdown: {}
        },
        trends: performanceResponse.trends ? {
          isImproving: true, // You can calculate this based on trends
          topPerformingDevice: 'Unknown',
          peakEngagementTime: undefined
        } : undefined,
        suggestions: performanceResponse.suggestions,
        needsVisualization: queryType.needsVisualization
      };

      return analysisResponse;
    }

    // Handle other types of queries with existing functionality
    const prompt = `
      You are an AI assistant specializing in email campaigns and marketing.
      Analyze this user input: "${input}"
      
      If it matches any of these actions, return a JSON with the action:
      - Creating a campaign: { "action": "createCampaign" }
      - Sending an email: { "action": "sendEmail" }
      - Creating a template: { "action": "createTemplate" }
      - Sending money: { "action": "sendMoney" }
      
      If it doesn't match any action, provide a helpful response about email marketing.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    if (responseText.startsWith('{')) {
      try {
        const response = JSON.parse(responseText);
        
        switch (response.action) {
          case "createCampaign":
            uiCallbacks.startCampaignCreation();
            return "I'll help you create a new campaign. What would you like to name it?";
          case "sendEmail":
            uiCallbacks.startEmailCreation();
            return "Let's send an email. I've opened the email creation form for you.";
          case "sendMoney":
            uiCallbacks.openPaymentForm();
            return "I've opened the payment form for you.";
          case "createTemplate":
            uiCallbacks.startTemplateCreation();
            return "Let's create a new email template. I've opened the template creation form.";
        }
      } catch (error) {
        console.error('Error parsing JSON response:', error);
      }
    }
    
    return responseText;
  } catch (error) {
    console.error('Error in handleUserInput:', error);
    return "I encountered an error processing your request. Please try again.";
  }
}