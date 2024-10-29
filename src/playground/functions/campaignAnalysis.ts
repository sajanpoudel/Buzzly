import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { CampaignData } from '@/types/database';

interface CampaignAnalysis {
  stats: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    deviceBreakdown: { [key: string]: number };
  };
  trends: {
    isImproving: boolean;
    topPerformingDevice: string;
    peakEngagementTime?: string;
    data: {
      date: string;
      openRate: number;
      clickRate: number;
    }[];
  };
  suggestions: string[];
  analysis: string;
}

export async function analyzeCampaign(userId: string, campaignName?: string): Promise<string | CampaignAnalysis> {
  try {
    let campaign: CampaignData | null = null;
    
    if (!userId) {
      return "No user ID provided. Please make sure you're logged in.";
    }

    if (campaignName) {
      console.log(`Searching for campaign with name: "${campaignName}" for user: "${userId}"`);
      // Get specific campaign by exact name match
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('userId', '==', userId),
        where('name', '==', campaignName.trim()) // Add trim() to handle any extra spaces
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        campaign = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as CampaignData;
        console.log('Found campaign:', campaign);
      } else {
        console.log(`No campaign found with name "${campaignName}" for user "${userId}"`);
        return `I couldn't find a campaign named "${campaignName}". Please check if the campaign name is correct and try again.`;
      }
    } else {
      // Get latest campaign
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        campaign = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as CampaignData;
      } else {
        return "I couldn't find any campaigns. Would you like to create one?";
      }
    }

    // Calculate metrics
    const totalRecipients = campaign.recipients.length || 1;
    const openRate = (campaign.stats.opened / totalRecipients) * 100;
    const clickRate = (campaign.stats.clicked / totalRecipients) * 100;
    const conversionRate = (campaign.stats.converted / totalRecipients) * 100;

    // Create trend data
    const trendData = [
      {
        date: new Date(campaign.startDate).toLocaleDateString(),
        openRate: openRate,
        clickRate: clickRate
      },
      {
        date: new Date(campaign.endDate).toLocaleDateString(),
        openRate: openRate,
        clickRate: clickRate
      }
    ];

    // Analyze device info
    const deviceBreakdown = analyzeDeviceInfo(campaign.stats.deviceInfo || []);
    const topPerformingDevice = Object.entries(deviceBreakdown)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

    // Generate suggestions
    const suggestions = generateSuggestions(campaign, openRate, clickRate);

    const analysis: CampaignAnalysis = {
      stats: {
        openRate,
        clickRate,
        conversionRate,
        deviceBreakdown
      },
      trends: {
        isImproving: openRate > 20,
        topPerformingDevice,
        peakEngagementTime: undefined,
        data: trendData
      },
      suggestions,
      analysis: `Campaign "${campaign.name}" Performance Analysis`
    };

    return analysis;
  } catch (error) {
    console.error('Error analyzing campaign:', error);
    return "I encountered an error while analyzing the campaign. Please try again.";
  }
}

export async function getOverallPerformance(userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const campaignsRef = await getDocs(
      query(
        collection(db, 'campaigns'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate.toISOString()),
        orderBy('createdAt', 'desc')
      )
    );

    const campaigns = campaignsRef.docs.map(doc => doc.data() as CampaignData);

    if (campaigns.length === 0) {
      return `I couldn't find any campaigns in the last ${days} days. Would you like to create a new campaign?`;
    }

    // Calculate aggregate metrics
    const totalStats = campaigns.reduce(
      (acc, campaign) => ({
        sent: acc.sent + campaign.stats.sent,
        opened: acc.opened + campaign.stats.opened,
        clicked: acc.clicked + campaign.stats.clicked,
        converted: acc.converted + campaign.stats.converted
      }),
      { sent: 0, opened: 0, clicked: 0, converted: 0 }
    );

    const analysis = `
Here's your campaign performance over the last ${days} days:

📈 Overall Metrics:
- Total Campaigns: ${campaigns.length}
- Total Emails Sent: ${totalStats.sent}
- Average Open Rate: ${((totalStats.opened / totalStats.sent) * 100).toFixed(1)}%
- Average Click Rate: ${((totalStats.clicked / totalStats.sent) * 100).toFixed(1)}%
- Average Conversion Rate: ${((totalStats.converted / totalStats.sent) * 100).toFixed(1)}%

🏆 Top Performing Campaign:
"${campaigns[0].name}" with ${((campaigns[0].stats.opened / campaigns[0].stats.sent) * 100).toFixed(1)}% open rate

Would you like to see detailed metrics for any specific campaign?`;

    return analysis;
  } catch (error) {
    console.error('Error getting overall performance:', error);
    return "I encountered an error while analyzing your campaigns. Please try again.";
  }
}

function analyzeDeviceInfo(deviceInfo: any[]): { [key: string]: number } {
  const total = deviceInfo.length;
  if (total === 0) return {};

  const deviceCounts = deviceInfo.reduce((acc: { [key: string]: number }, device) => {
    acc[device.device] = (acc[device.device] || 0) + 1;
    return acc;
  }, {});

  const percentages: { [key: string]: number } = {};
  Object.entries(deviceCounts).forEach(([device, count]) => {
    percentages[device] = (count / total) * 100;
  });

  return percentages;
}

function generateSuggestions(campaign: CampaignData, openRate: number, clickRate: number): string[] {
  const suggestions: string[] = [];

  // Analyze subject line
  if (openRate < 20) {
    suggestions.push("Consider A/B testing different subject lines to improve open rates");
  }

  // Analyze content
  if (clickRate < 10) {
    suggestions.push("Try making your call-to-action more prominent and compelling");
  }

  // Analyze timing
  const sendTime = new Date(campaign.createdAt).getHours();
  if (sendTime < 9 || sendTime > 17) {
    suggestions.push("Consider sending your campaigns during business hours for better engagement");
  }

  return suggestions;
} 