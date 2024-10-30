import { analyzeCampaign, getOverallPerformance } from '../functions/campaignAnalysis';
import { generateContentSuggestions } from './suggestionEngine';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function handleCampaignQuery(userId: string, campaignName: string | undefined) {
  try {
    const response = await analyzeCampaign(userId, campaignName);
    
    if (typeof response === 'string') {
      return response;
    }

    // Format data for Gemini analysis
    const campaignData = {
      name: campaignName,
      metrics: {
        openRate: response.stats.openRate,
        clickRate: response.stats.clickRate,
        conversionRate: response.stats.conversionRate,
        bounceRate: response.stats.bounceRate,
        clickToOpenRate: response.stats.clickToOpenRate
      },
      deviceDistribution: response.deviceStats.map(stat => ({
        device: stat.device,
        percentage: stat.percentage,
        browser: stat.browserInfo[0]?.name || 'Unknown',
        os: stat.osInfo[0]?.name || 'Unknown',
        users: stat.count
      }))
    };

    // Generate AI analysis using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are an elite email marketing expert with 15 years of experience. Analyze this campaign with precision and in concise manner in English Language unless asked in other language:

Campaign: "${campaignData.name}"

Performance Data:
Open Rate: ${campaignData.metrics.openRate.toFixed(2)}% 
Click Rate: ${campaignData.metrics.clickRate.toFixed(2)}%
Conversion Rate: ${campaignData.metrics.conversionRate.toFixed(2)}%
Bounce Rate: ${campaignData.metrics.bounceRate.toFixed(2)}%
CTOR: ${campaignData.metrics.clickToOpenRate.toFixed(2)}%

Audience Technology Mix:
${campaignData.deviceDistribution.map(d => 
  `${d.device}: ${d.percentage.toFixed(1)}% (${d.users} users)
Browser: ${d.browser}
OS: ${d.os}`
).join('\n')}

Provide expert analysis:
Most Important. None of the answer needs to have * or # or - or any html tags.

1. Funnel Analysis
- Compare each metric against industry benchmarks
- Identify exact drop-off points in user journey
- Calculate revenue impact of performance gaps

2. Technical Delivery
- Evaluate device-browser-OS combinations impact on engagement
- Spot rendering or compatibility issues
- Flag deliverability concerns from bounce patterns

3. Action Plan
- List 3 highest-ROI improvements with expected impact
- Identify quick wins vs strategic changes
- Provide exact next steps for implementation

Keep analysis data-driven and actionable. Focus on patterns that directly impact revenue. Avoid generic advice.

Format: Clear sections, bullet points, numbers where relevant. Max 2-3 sentences per insight.`;

    const result = await model.generateContent(prompt);
    const aiAnalysis = result.response.text();

    // Format the response with AI analysis
    const formattedResponse = {
      ...response,
      stats: {
        ...response.stats,
        performanceMetrics: [
          { name: 'Open Rate', value: response.stats.openRate },
          { name: 'Click Rate', value: response.stats.clickRate },
          { name: 'Conversion Rate', value: response.stats.conversionRate },
          { name: 'Bounce Rate', value: response.stats.bounceRate },
          { name: 'Click to Open Rate', value: response.stats.clickToOpenRate }
        ],
        deviceStats: response.deviceStats,
        deviceBreakdown: response.deviceStats.reduce((acc, stat) => {
          acc[stat.device] = stat.percentage;
          return acc;
        }, {} as { [key: string]: number })
      },
      analysis: aiAnalysis,
      improvements: extractImprovements(aiAnalysis),
      actions: extractActions(aiAnalysis),
      needsVisualization: true
    };

    console.log('Formatted Performance Metrics:', formattedResponse.stats.performanceMetrics);
    console.log('Formatted Device Data:', formattedResponse.stats.deviceStats);
    console.log('Formatted Device Breakdown:', formattedResponse.stats.deviceBreakdown);

    return formattedResponse;
  } catch (error) {
    console.error('Error in handleCampaignQuery:', error);
    return "I encountered an error while analyzing the campaign. Please try again.";
  }
}

// Helper function to extract improvements from AI analysis
function extractImprovements(analysis: string): string[] {
  const improvements: string[] = [];
  const sections = analysis.split('\n');
  let inImprovementsSection = false;

  for (const line of sections) {
    if (line.toLowerCase().includes('recommendations') || line.toLowerCase().includes('improvements')) {
      inImprovementsSection = true;
      continue;
    }
    if (inImprovementsSection && line.trim().startsWith('-')) {
      improvements.push(line.trim().substring(1).trim());
    }
    if (inImprovementsSection && line.trim() === '') {
      inImprovementsSection = false;
    }
  }

  return improvements;
}

// Helper function to extract action items from AI analysis
function extractActions(analysis: string): string[] {
  const actions: string[] = [];
  const sections = analysis.split('\n');
  let inActionsSection = false;

  for (const line of sections) {
    if (line.toLowerCase().includes('action items')) {
      inActionsSection = true;
      continue;
    }
    if (inActionsSection && line.trim().startsWith('-')) {
      actions.push(line.trim().substring(1).trim());
    }
    if (inActionsSection && line.trim() === '') {
      inActionsSection = false;
    }
  }

  return actions;
}

export async function getOverallCampaignPerformance(userId: string, days: number = 30) {
  try {
    return await getOverallPerformance(userId, days);
  } catch (error) {
    console.error('Error in getOverallCampaignPerformance:', error);
    return "I encountered an error while getting overall performance. Please try again.";
  }
} 