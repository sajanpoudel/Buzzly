import { CampaignData } from '@/types/database';

export function generateContentSuggestions(campaign: CampaignData): string[] {
  const suggestions: string[] = [];
  
  // Analyze subject line
  if (campaign.subject.length < 30) {
    suggestions.push("Consider using a longer subject line for better engagement");
  }
  if (!campaign.subject.includes('personalization')) {
    suggestions.push("Try adding personalization to your subject line");
  }

  // Analyze content
  const wordCount = campaign.body.split(' ').length;
  if (wordCount < 100) {
    suggestions.push("Your email content might be too short. Consider adding more value-driven content");
  }
  if (!campaign.body.includes('call-to-action')) {
    suggestions.push("Add a clear call-to-action button or link");
  }

  // Analyze timing
  const sendHour = new Date(campaign.createdAt).getHours();
  if (sendHour < 9 || sendHour > 17) {
    suggestions.push("Consider sending during business hours for better engagement");
  }

  return suggestions;
}

export function generateImprovementStrategies(stats: any): string[] {
  const strategies: string[] = [];
  
  if (stats.openRate < 20) {
    strategies.push("Your open rate is below industry average. Consider:");
    strategies.push("- A/B testing different subject lines");
    strategies.push("- Segmenting your audience more precisely");
    strategies.push("- Optimizing send times based on recipient time zones");
  }

  if (stats.clickRate < 2) {
    strategies.push("To improve click rates:");
    strategies.push("- Make your CTAs more prominent");
    strategies.push("- Use action-oriented button text");
    strategies.push("- Place important links above the fold");
  }

  return strategies;
} 