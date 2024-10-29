import { analyzeCampaign, getOverallPerformance } from '../functions/campaignAnalysis';
import { generateContentSuggestions, generateImprovementStrategies } from './suggestionEngine';

export async function handleCampaignQuery(message: string, userId: string) {
  // Extract campaign name if specified
  const campaignNameMatch = message.match(/campaign ["'](.+?)["']/i);
  const campaignName = campaignNameMatch ? campaignNameMatch[1] : null;
  
  // Check for specific types of queries
  if (message.toLowerCase().includes('overall performance')) {
    return await getOverallPerformance(userId);
  }
  
  if (message.toLowerCase().includes('improve') || message.toLowerCase().includes('suggestions')) {
    const analysis = await analyzeCampaign(campaignName || undefined, userId);
    return typeof analysis === 'string' ? analysis : generateImprovementStrategies(analysis.stats);
  }
  
  // Default to campaign analysis
  return await analyzeCampaign(campaignName || undefined, userId);
} 