import { Campaign, getCampaigns, updateCampaignStats, saveCampaign } from './campaignStore';

interface QueuedCampaign {
  campaign: Campaign;
  attempts: number;
  lastAttempt: Date;
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

let campaignQueue: QueuedCampaign[] = [];

export async function checkAndSendScheduledCampaigns() {
  console.log('Checking for scheduled campaigns...');
  const campaigns = getCampaigns();
  console.log(`Found ${campaigns.length} campaigns in total.`);
  const now = new Date();
  console.log(`Current time: ${now.toISOString()}`);

  // Add new scheduled campaigns to the queue
  campaigns.forEach(campaign => {
    console.log(`Checking campaign: ${campaign.id}, Status: ${campaign.status}, Scheduled DateTime: ${campaign.scheduledDateTime}`);
    if (campaign.status === 'Scheduled' && campaign.scheduledDateTime && !campaignQueue.some(qc => qc.campaign.id === campaign.id)) {
      console.log(`Adding campaign ${campaign.id} to queue`);
      campaignQueue.push({ campaign, attempts: 0, lastAttempt: new Date(0) });
    }
  });

  console.log(`Campaign queue length: ${campaignQueue.length}`);

  // Process the queue
  campaignQueue = await Promise.all(campaignQueue.map(async (queuedCampaign) => {
    const { campaign, attempts, lastAttempt } = queuedCampaign;
    const scheduledTime = new Date(campaign.scheduledDateTime!);

    console.log(`Processing queued campaign: ${campaign.id}, Scheduled time: ${scheduledTime.toISOString()}, Attempts: ${attempts}`);

    if (now >= scheduledTime && now.getTime() - scheduledTime.getTime() <= EXPIRY_TIME) {
      if (attempts < MAX_ATTEMPTS && now.getTime() - lastAttempt.getTime() >= RETRY_DELAY) {
        const success = await sendScheduledCampaign(campaign);
        if (success) {
          console.log(`Campaign ${campaign.id} sent successfully.`);
          return null; // Remove from queue
        } else {
          console.log(`Campaign ${campaign.id} send attempt failed. Incrementing attempts.`);
          return { ...queuedCampaign, attempts: attempts + 1, lastAttempt: new Date() };
        }
      } else if (attempts >= MAX_ATTEMPTS) {
        console.log(`Campaign ${campaign.id} failed after ${MAX_ATTEMPTS} attempts. Marking as 'Failed'.`);
        campaign.status = 'Failed';
        saveCampaign(campaign);
        return null; // Remove from queue
      }
    } else if (now.getTime() - scheduledTime.getTime() > EXPIRY_TIME) {
      console.log(`Campaign ${campaign.id} has expired. Marking as 'Expired'.`);
      campaign.status = 'Expired';
      saveCampaign(campaign);
      return null; // Remove from queue
    }

    return queuedCampaign; // Keep in queue
  })).then(results => results.filter((item): item is QueuedCampaign => item !== null));

  console.log(`Updated campaign queue length: ${campaignQueue.length}`);
}

async function sendScheduledCampaign(campaign: Campaign): Promise<boolean> {
  console.log(`Attempting to send scheduled campaign: ${campaign.id}`);
  try {
    // Check if the campaign has already been sent
    if (campaign.status === 'Sent') {
      console.log(`Campaign ${campaign.id} has already been sent. Skipping.`);
      return true;
    }

    const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}');
    console.log('Retrieved tokens from localStorage');

    // Check if tokens are expired
    if (tokens.expiry_date && new Date().getTime() > tokens.expiry_date) {
      console.log('Tokens have expired. Refresh needed.');
      // Implement token refresh logic here
      // For now, we'll just return false to retry later
      return false;
    }

    const payload = {
      recipients: campaign.recipients,
      subject: campaign.subject,
      body: campaign.body,
      userEmail: campaign.userEmail,
      tokens: tokens,
    };
    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://emailapp-backend.onrender.com/auth/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Campaign ${campaign.id} sent successfully. Result:`, result);

    // Update campaign status and stats
    campaign.status = 'Sent';
    campaign.stats.sent = result.info.length;
    campaign.trackingIds = result.info.map((item: any) => item.trackingId);
    saveCampaign(campaign);
    console.log(`Updated campaign ${campaign.id} status to Sent`);

    return true;
  } catch (error) {
    console.error(`Error sending scheduled campaign ${campaign.id}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}