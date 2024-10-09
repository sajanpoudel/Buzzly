import { Campaign, saveCampaign as saveToStore, getCampaigns as getFromStore, updateCampaignStats as updateStatsInStore } from './campaignStore';

export type { Campaign };

interface CampaignCreationData extends Omit<Campaign, 'id' | 'stats' | 'trackingIds' | 'status'> {
  userEmail: string;
  tokens: any;
  isScheduled: boolean;
  scheduledDateTime?: string;
}

export async function createCampaign(campaignData: CampaignCreationData): Promise<Campaign> {
  try {
    console.log(`Current time: ${new Date().toISOString()}`);
    console.log('Creating campaign with data:', campaignData);

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name,
      type: campaignData.type,
      subject: campaignData.subject,
      body: campaignData.body,
      startDate: campaignData.startDate,
      endDate: campaignData.endDate,
      isRecurring: campaignData.isRecurring,
      targetAudience: campaignData.targetAudience,
      recipients: campaignData.recipients,
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      trackingIds: [],
      status: campaignData.isScheduled ? 'Scheduled' : 'Pending',
      scheduledDateTime: campaignData.scheduledDateTime
    };

    console.log(`Current time: ${new Date().toISOString()}`);
    console.log('New campaign object:', newCampaign);

    if (campaignData.isScheduled) {
      saveToStore(newCampaign);
      return newCampaign;
    }

    // If not scheduled, proceed with immediate sending
    const response = await fetch('https://emailapp-backend.onrender.com/auth/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      credentials: 'include',
      body: JSON.stringify({
        recipients: campaignData.recipients,
        subject: campaignData.subject,
        body: campaignData.body,
        userEmail: campaignData.userEmail,
        tokens: campaignData.tokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    newCampaign.stats.sent = result.info.length;
    newCampaign.trackingIds = result.info.map((item: any) => item.trackingId);
    newCampaign.status = 'Sent';

    saveToStore(newCampaign);

    console.log(`Current time: ${new Date().toISOString()}`);
    console.log('Campaign sent and saved:', newCampaign);

    return newCampaign;
  } catch (error) {
    console.error(`Current time: ${new Date().toISOString()}`);
    console.error('Error creating campaign:', error);
    throw error;
  }
}

export function getCampaigns(): Campaign[] {
  return getFromStore();
}

export function updateCampaignStats(id: string, stats: Partial<Campaign['stats']>): void {
  updateStatsInStore(id, stats);
}