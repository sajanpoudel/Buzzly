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
    const currentTime = new Date().toISOString();
    console.log(`Current time: ${currentTime}`);
    console.log('Creating campaign with data:', JSON.stringify(campaignData, null, 2));

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
      scheduledDateTime: campaignData.scheduledDateTime,
      userEmail: campaignData.userEmail
    };

    console.log('New campaign object:', JSON.stringify(newCampaign, null, 2));
    console.log(`Is campaign scheduled: ${campaignData.isScheduled}`);
    console.log(`Scheduled DateTime: ${campaignData.scheduledDateTime}`);

    if (campaignData.isScheduled) {
      saveToStore(newCampaign);
      console.log(`Campaign ${newCampaign.id} saved as scheduled`);
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
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();

    newCampaign.stats.sent = result.info.length;
    newCampaign.trackingIds = result.info.map((item: any) => item.trackingId);
    newCampaign.status = 'Sent';

    // Save the campaign to local storage
    saveToStore(newCampaign);

    console.log(`Campaign sent and saved: ${JSON.stringify(newCampaign, null, 2)}`);

    return newCampaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}

export function getCampaigns(): Campaign[] {
  return getFromStore();
}

export function updateCampaignStats(id: string, stats: Partial<Campaign['stats']>): void {
  updateStatsInStore(id, stats);
}