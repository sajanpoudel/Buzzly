import { Campaign, getCampaigns, updateCampaignStats } from './campaignStore';

export async function checkAndSendScheduledCampaigns() {
  console.log('Checking for scheduled campaigns...');
  const campaigns = getCampaigns();
  console.log(`Found ${campaigns.length} campaigns in total.`);
  const now = new Date();
  console.log(`Current time: ${now.toISOString()}`);

  for (const campaign of campaigns) {
    console.log(`Checking campaign: ${campaign.id} - ${campaign.name}`);
    console.log(`Campaign status: ${campaign.status}`);
    console.log(`Scheduled DateTime: ${campaign.scheduledDateTime}`);
    if (campaign.status === 'Scheduled' && campaign.scheduledDateTime) {
      const scheduledTime = new Date(campaign.scheduledDateTime);
      console.log(`Scheduled time: ${scheduledTime.toISOString()}`);
      if (scheduledTime <= now) {
        console.log(`Campaign ${campaign.id} is due for sending.`);
        await sendScheduledCampaign(campaign);
      } else {
        console.log(`Campaign ${campaign.id} is not yet due for sending.`);
      }
    } else {
      console.log(`Campaign ${campaign.id} is not scheduled or has no scheduled date.`);
    }
  }
}

async function sendScheduledCampaign(campaign: Campaign) {
  console.log(`Attempting to send scheduled campaign: ${campaign.id}`);
  try {
    const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}');
    console.log('Retrieved tokens from localStorage');

    const response = await fetch('https://emailapp-backend.onrender.com/auth/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      credentials: 'include',
      body: JSON.stringify({
        recipients: campaign.recipients,
        subject: campaign.subject,
        body: campaign.body,
        userEmail: campaign.userEmail,
        tokens: tokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Campaign ${campaign.id} sent successfully. Result:`, result);

    // Update campaign status and stats
    updateCampaignStats(campaign.id, {
      sent: result.info.length,
      status: 'Sent',
    });
    console.log(`Updated campaign ${campaign.id} status to Sent`);

  } catch (error) {
    console.error(`Error sending scheduled campaign ${campaign.id}:`, error);
    updateCampaignStats(campaign.id, { status: 'Failed' });
    console.log(`Updated campaign ${campaign.id} status to Failed`);
  }
}