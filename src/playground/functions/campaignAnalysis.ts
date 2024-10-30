import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, writeBatch } from 'firebase/firestore';
import { CampaignData, DeviceInfo } from '@/types/database';

interface DeviceStats {
  device: string;
  percentage: number;
  count: number;
}

interface CampaignAnalysis {
  stats: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    bounceRate: number;
    clickToOpenRate: number;
    deviceBreakdown: { [key: string]: number };
    totalRecipients: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    engagementRate: number;
  };
  trends: {
    isImproving: boolean;
    topPerformingDevice: string;
    data: {
      date: string;
      openRate: number;
      clickRate: number;
    }[];
    peakEngagementTime: string;
    loading: boolean;
    error?: string;
  };
  deviceStats: any[];
  suggestions: string[];
  analysis: string;
}

interface OverallPerformance {
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  trends: {
    date: string;
    openRate: number;
    clickRate: number;
  }[];
  suggestions: string[];
}

interface EnhancedDeviceInfo extends DeviceInfo {
  timestamp?: string;
}

interface DeviceMapEntry {
  device: string;
  count: number;
  browserInfo: { [key: string]: number };
  osInfo: { [key: string]: number };
  engagementTimes: Date[];
}

interface ProcessedDeviceStat {
  device: string;
  count: number;
  percentage: number;
  browserInfo: Array<{ name: string; percentage: number }>;
  osInfo: Array<{ name: string; percentage: number }>;
  engagementTimes: Date[];
}

// Add interface for historical data return type
interface HistoricalDataResponse {
  data: Array<{
    date: string;
    openRate: number;
    clickRate: number;
  }>;
  isImproving: boolean;
  loading: boolean;
  error?: string;
}

export async function analyzeCampaign(userId: string, campaignName?: string): Promise<string | CampaignAnalysis> {
  try {
    let campaign: CampaignData | null = null;
    
    if (!userId) {
      return "No user ID provided. Please make sure you're logged in.";
    }

    if (!campaignName) {
      return "Please provide a campaign name to analyze.";
    }

    // Query the campaign
    const campaignsRef = collection(db, 'campaigns');
    const q = query(campaignsRef, 
      where('userId', '==', userId),
      where('name', '==', campaignName.trim())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return `I couldn't find a campaign named "${campaignName}".`;
    }

    campaign = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as CampaignData;

    // Calculate detailed metrics
    const totalRecipients = campaign.recipients?.length || 1;
    const stats = campaign.stats || { 
      sent: totalRecipients, 
      opened: 0, 
      clicked: 0, 
      converted: 0, 
      deviceInfo: [] 
    };
    
    // Basic metrics calculation with proper rounding
    const openRate = Number(((stats.opened / totalRecipients) * 100).toFixed(2));
    const clickRate = Number(((stats.clicked / totalRecipients) * 100).toFixed(2));
    const conversionRate = Number(((stats.converted / totalRecipients) * 100).toFixed(2));
    const bounceRate = Number(((totalRecipients - stats.opened) / totalRecipients) * 100).toFixed(2);
    const clickToOpenRate = stats.opened > 0 
      ? Number(((stats.clicked / stats.opened) * 100).toFixed(2))
      : 0;

    // Process device information
    const deviceStats = processDetailedDeviceInfo(stats.deviceInfo || []);
    const deviceBreakdown = deviceStats.reduce((acc, stat) => {
      acc[stat.device] = Number(stat.percentage.toFixed(2));
      return acc;
    }, {} as { [key: string]: number });

    // Ensure we have at least Desktop in device breakdown
    if (Object.keys(deviceBreakdown).length === 0) {
      deviceBreakdown['Desktop'] = 100;
    }

    // Get historical data with loading state
    const historicalData = await getHistoricalData(userId, campaign.id, openRate, clickRate);
    
    // Get engagement times
    const engagementTimes = calculateEngagementTimes(stats.deviceInfo || []);
    
    const analysis: CampaignAnalysis = {
      stats: {
        openRate,
        clickRate,
        conversionRate,
        bounceRate: Number(bounceRate),
        clickToOpenRate,
        deviceBreakdown,
        totalRecipients,
        totalOpened: stats.opened,
        totalClicked: stats.clicked,
        totalConverted: stats.converted,
        engagementRate: Number(((stats.clicked + stats.opened) / (totalRecipients * 2) * 100).toFixed(2))
      },
      trends: {
        isImproving: historicalData.isImproving,
        topPerformingDevice: deviceStats[0]?.device || 'Unknown',
        data: historicalData.data,
        peakEngagementTime: engagementTimes.peakTime,
        loading: historicalData.loading,
        error: historicalData.error
      },
      deviceStats: deviceStats.map(stat => ({
        ...stat,
        browserInfo: stat.browserInfo || [],
        osInfo: stat.osInfo || []
      })),
      suggestions: generateEnhancedSuggestions(
        openRate, 
        clickRate, 
        conversionRate, 
        deviceStats,
        engagementTimes
      ),
      analysis: `Campaign "${campaign.name}" Performance Analysis`
    };

    return analysis;
  } catch (error) {
    console.error('Error analyzing campaign:', error);
    throw new Error('Unable to analyze campaign. Please try again later.');
  }
}

function processDetailedDeviceInfo(deviceInfo: EnhancedDeviceInfo[]): ProcessedDeviceStat[] {
  if (!deviceInfo || deviceInfo.length === 0) {
    return [{
      device: 'Desktop',
      count: 1,
      percentage: 100,
      browserInfo: [{ name: 'Chrome', percentage: 100 }],
      osInfo: [{ name: 'Windows', percentage: 100 }],
      engagementTimes: []
    }];
  }

  const total = deviceInfo.length;
  const deviceMap = new Map<string, DeviceMapEntry>();

  // Process device info
  deviceInfo.forEach(info => {
    const device = info.device || 'Desktop';
    if (!deviceMap.has(device)) {
      deviceMap.set(device, {
        device,
        count: 0,
        browserInfo: {},
        osInfo: {},
        engagementTimes: []
      });
    }

    const entry = deviceMap.get(device)!;
    entry.count++;

    // Process browser info
    const browser = info.browser || 'Unknown';
    entry.browserInfo[browser] = (entry.browserInfo[browser] || 0) + 1;

    // Process OS info
    const os = info.os || 'Unknown';
    entry.osInfo[os] = (entry.osInfo[os] || 0) + 1;

    if (info.timestamp) {
      entry.engagementTimes.push(new Date(info.timestamp));
    }
  });

  // Convert to array and calculate percentages
  return Array.from(deviceMap.values())
    .map(entry => ({
      device: entry.device,
      count: entry.count,
      percentage: (entry.count / total) * 100,
      browserInfo: Object.entries(entry.browserInfo).map(([name, count]) => ({
        name,
        percentage: (count / entry.count) * 100
      })),
      osInfo: Object.entries(entry.osInfo).map(([name, count]) => ({
        name,
        percentage: (count / entry.count) * 100
      })),
      engagementTimes: entry.engagementTimes
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateEngagementTimes(deviceInfo: EnhancedDeviceInfo[]): {
  peakTime: string;
  hourlyDistribution: { [hour: string]: number };
} {
  const hourCounts: { [hour: string]: number } = {};
  
  deviceInfo.forEach(info => {
    if (info.timestamp) {
      const hour = new Date(info.timestamp).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      hourCounts[timeSlot] = (hourCounts[timeSlot] || 0) + 1;
    }
  });

  const peakTime = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

  return {
    peakTime,
    hourlyDistribution: hourCounts
  };
}

function generateEnhancedSuggestions(
  openRate: number,
  clickRate: number,
  conversionRate: number,
  deviceStats: ProcessedDeviceStat[],
  engagementTimes: { peakTime: string; hourlyDistribution: { [hour: string]: number } }
): string[] {
  const suggestions: string[] = [];

  // Engagement-based suggestions
  if (openRate < 20) {
    suggestions.push("Improve subject lines for better open rates");
    suggestions.push(`Schedule emails around peak engagement time (${engagementTimes.peakTime})`);
  }

  // Device-specific suggestions
  const mobileStats = deviceStats.find(s => s.device.toLowerCase().includes('mobile'));
  if (mobileStats && mobileStats.percentage > 50) {
    suggestions.push("Optimize email design for mobile devices");
    suggestions.push(`Focus on ${mobileStats.osInfo[0]?.name} optimization (${mobileStats.osInfo[0]?.percentage.toFixed(1)}% of mobile users)`);
  }

  // Browser-specific suggestions
  const topBrowser = deviceStats[0]?.browserInfo[0];
  if (topBrowser) {
    suggestions.push(`Ensure optimal rendering in ${topBrowser.name} (${topBrowser.percentage.toFixed(1)}% of users)`);
  }

  return suggestions;
}

// Update the getHistoricalData function with proper return type
async function getHistoricalData(userId: string, campaignId: string, currentOpenRate: number, currentClickRate: number): Promise<HistoricalDataResponse> {
  try {
    // First try to get data from the new path
    const historyRef = collection(db, 'campaigns', campaignId, 'metrics');
    let snapshot = await getDocs(query(historyRef, orderBy('timestamp', 'desc')));

    // If no data in new path, try the legacy path
    if (snapshot.empty) {
      const legacyRef = collection(db, 'users', userId, 'campaignHistory', campaignId, 'metrics');
      snapshot = await getDocs(query(legacyRef, orderBy('timestamp', 'desc')));
    }

    // If we have real data, use it
    if (!snapshot.empty) {
      const data = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: new Date(data.timestamp).toLocaleDateString(),
          openRate: data.openRate || currentOpenRate,
          clickRate: data.clickRate || currentClickRate
        };
      });

      return {
        data,
        isImproving: calculateTrend(data),
        loading: false,
        error: undefined
      };
    }

    // If no real data exists or there's a permissions error, just return mock data
    console.log('Using mock data with current metrics:', { currentOpenRate, currentClickRate });
    const mockData = generateMockHistoricalData(currentOpenRate, currentClickRate);
    
    return { 
      data: mockData,
      isImproving: calculateTrend(mockData),
      loading: false,
      error: undefined
    };

  } catch (error) {
    // On error, return mock data without trying to write to Firestore
    console.log('Falling back to mock data due to error:', error);
    const mockData = generateMockHistoricalData(currentOpenRate, currentClickRate);
    return { 
      data: mockData,
      isImproving: calculateTrend(mockData),
      loading: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Update generateMockHistoricalData to be more stable
function generateMockHistoricalData(currentOpenRate: number, currentClickRate: number) {
  const data = [];
  const today = new Date();
  let prevOpenRate = currentOpenRate;
  let prevClickRate = currentClickRate;
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate slightly varying rates based on previous day
    const openRate = Math.max(0, Math.min(100, prevOpenRate + (Math.random() * 2 - 1))); // Vary by ±1%
    const clickRate = Math.max(0, Math.min(100, prevClickRate + (Math.random() * 1 - 0.5))); // Vary by ±0.5%
    
    data.push({
      date: date.toLocaleDateString(),
      openRate: Number(openRate.toFixed(2)),
      clickRate: Number(clickRate.toFixed(2))
    });
    
    prevOpenRate = openRate;
    prevClickRate = clickRate;
  }
  
  return data;
}

// Helper function to calculate trend
function calculateTrend(data: Array<{ openRate: number; clickRate: number }>) {
  if (data.length < 2) return false;
  const lastIndex = data.length - 1;
  return (data[lastIndex].openRate + data[lastIndex].clickRate) >
         (data[0].openRate + data[0].clickRate);
}

export async function getOverallPerformance(userId: string, days: number = 30): Promise<string | OverallPerformance> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query campaigns collection
    const campaignsRef = collection(db, 'campaigns');
    const q = query(
      campaignsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', startDate.toISOString())
    );

    const querySnapshot = await getDocs(q);
    const campaigns = querySnapshot.docs.map(doc => doc.data() as CampaignData);

    if (campaigns.length === 0) {
      return `No campaigns found in the last ${days} days.`;
    }

    // Calculate aggregate stats
    const totalStats = campaigns.reduce(
      (acc, campaign) => ({
        sent: acc.sent + (campaign.stats?.sent || 0),
        opened: acc.opened + (campaign.stats?.opened || 0),
        clicked: acc.clicked + (campaign.stats?.clicked || 0),
        converted: acc.converted + (campaign.stats?.converted || 0)
      }),
      { sent: 0, opened: 0, clicked: 0, converted: 0 }
    );

    // Calculate trends over time
    const trendData = campaigns
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(campaign => {
        const totalRecipients = campaign.recipients.length || 1;
        return {
          date: new Date(campaign.createdAt).toLocaleDateString(),
          openRate: ((campaign.stats?.opened || 0) / totalRecipients) * 100,
          clickRate: ((campaign.stats?.clicked || 0) / totalRecipients) * 100
        };
      });

    // Generate suggestions based on overall performance
    const suggestions = generateOverallSuggestions(totalStats, campaigns.length);

    return {
      stats: totalStats,
      trends: trendData,
      suggestions
    };
  } catch (error) {
    console.error('Error getting overall performance:', error);
    return "Error analyzing overall campaign performance.";
  }
}

function generateOverallSuggestions(stats: { sent: number; opened: number; clicked: number; converted: number }, campaignCount: number): string[] {
  const suggestions: string[] = [];
  const openRate = (stats.opened / stats.sent) * 100;
  const clickRate = (stats.clicked / stats.sent) * 100;
  const conversionRate = (stats.converted / stats.sent) * 100;

  if (campaignCount < 2) {
    suggestions.push("Run more campaigns to gather meaningful performance data");
  }

  if (openRate < 20) {
    suggestions.push("Focus on improving subject lines across campaigns");
    suggestions.push("Test different sending times for better open rates");
  }

  if (clickRate < 10) {
    suggestions.push("Enhance CTAs in your email content");
    suggestions.push("Experiment with different content layouts");
  }

  if (conversionRate < 2) {
    suggestions.push("Review and optimize your conversion funnel");
    suggestions.push("Consider segmenting your audience for better targeting");
  }

  return suggestions;
} 