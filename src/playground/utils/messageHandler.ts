import { analyzeCampaign, getOverallPerformance } from '../functions/campaignAnalysis';
import { generateContentSuggestions } from './suggestionEngine';

export async function handleCampaignQuery(userId: string, campaignName: string | undefined) {
  try {
    // If no campaign name is provided, get latest campaign analysis
    if (!campaignName) {
      return await analyzeCampaign(userId);
    }

    // Get specific campaign analysis
    const response = await analyzeCampaign(userId, campaignName);
    
    if (typeof response === 'string') {
      return response;
    }

    // Create trend data for visualization
    const trendData = [
      {
        date: 'Start',
        openRate: response.stats.openRate,
        clickRate: response.stats.clickRate
      },
      {
        date: 'Current',
        openRate: response.stats.openRate,
        clickRate: response.stats.clickRate
      }
    ];

    // Format the response in a more readable way
    const formattedResponse = {
      ...response,
      trends: trendData,  // Add trend data for visualization
      analysis: `
Campaign Performance

• Open Rate: ${response.stats.openRate.toFixed(2)}% - ${getOpenRateAnalysis(response.stats.openRate)}
• Click Rate: ${response.stats.clickRate.toFixed(2)}% - ${getClickRateAnalysis(response.stats.clickRate)}
• Conversion Rate: ${response.stats.conversionRate.toFixed(2)}% - ${getConversionRateAnalysis(response.stats.conversionRate)}

Key Improvements Needed

1. ${response.suggestions[0] || 'Optimize email content and subject lines'}
2. ${response.suggestions[1] || 'Improve targeting and segmentation'}
3. ${response.suggestions[2] || 'Test different sending times'}

Action Steps

1. Review and update email content to improve engagement
2. Analyze audience segments for better targeting
3. Implement A/B testing for future campaigns
      `.trim(),
      needsVisualization: true  // Add this flag to indicate visualization is needed
    };

    return formattedResponse;
  } catch (error) {
    console.error('Error in handleCampaignQuery:', error);
    return "I encountered an error while analyzing the campaign. Please try again.";
  }
}

function getOpenRateAnalysis(rate: number): string {
  if (rate > 50) return "Excellent engagement with your subject line";
  if (rate > 25) return "Good open rate, but room for improvement";
  return "Needs attention - consider testing different subject lines";
}

function getClickRateAnalysis(rate: number): string {
  if (rate > 10) return "Strong click-through performance";
  if (rate > 5) return "Average click rate, could be improved";
  return "Low engagement - review your call-to-action strategy";
}

function getConversionRateAnalysis(rate: number): string {
  if (rate > 5) return "Excellent conversion performance";
  if (rate > 2) return "Good conversion rate with room for growth";
  return "Consider optimizing your conversion funnel";
}

export async function getOverallCampaignPerformance(userId: string, days: number = 30) {
  try {
    return await getOverallPerformance(userId, days);
  } catch (error) {
    console.error('Error in getOverallCampaignPerformance:', error);
    return "I encountered an error while getting overall performance. Please try again.";
  }
} 