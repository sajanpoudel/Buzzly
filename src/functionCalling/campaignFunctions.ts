import { createCampaign as createCampaignUtil, getCampaigns, updateCampaignStats } from '@/utils/campaignManager';
import { Campaign } from '@/utils/campaignStore';
import { checkAndSendScheduledCampaigns } from '@/utils/scheduledCampaignManager';

export async function createCampaign(name?: string) {
  console.log(`Starting campaign creation process${name ? ` for: ${name}` : ''}`);
  
  // If a name is provided, we can start creating the campaign
  if (name) {
    try {
      const newCampaign = await createCampaignUtil({
        name,
        type: '', // These fields will be filled in later
        subject: '',
        body: '',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isRecurring: false,
        targetAudience: 'all',
        recipients: [],
        userEmail: '',
        tokens: JSON.parse(localStorage.getItem('gmail_tokens') || '{}'),
        isScheduled: false,
      } as any);
      return `Campaign "${newCampaign.name}" creation started. What type of campaign would you like this to be?`;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return `Error starting campaign creation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  // If no name is provided, ask for one
  return "Let's create a new campaign. What would you like to name your campaign?";
}

export function scheduleCampaign(id: string, date: string) {
  console.log(`Scheduling campaign ${id} for ${date}`);
  // Implement campaign scheduling logic
  return `Campaign ${id} scheduled for ${date}`;
}

export function getCampaignList() {
  return getCampaigns();
}

export function updateCampaign(id: string, updates: Partial<Campaign>) {
  const campaigns = getCampaigns();
  const campaignIndex = campaigns.findIndex(c => c.id === id);
  if (campaignIndex !== -1) {
    campaigns[campaignIndex] = { ...campaigns[campaignIndex], ...updates };
    // Save updated campaigns
    localStorage.setItem('email_campaigns', JSON.stringify(campaigns));
    return `Campaign ${id} updated successfully.`;
  }
  return `Campaign ${id} not found.`;
}

export function deleteCampaign(id: string) {
  const campaigns = getCampaigns();
  const updatedCampaigns = campaigns.filter(c => c.id !== id);
  if (updatedCampaigns.length < campaigns.length) {
    localStorage.setItem('email_campaigns', JSON.stringify(updatedCampaigns));
    return `Campaign ${id} deleted successfully.`;
  }
  return `Campaign ${id} not found.`;
}

export async function sendCampaign(id: string) {
  const campaigns = getCampaigns();
  const campaign = campaigns.find(c => c.id === id);
  if (campaign) {
    // Implement sending logic here
    // Update status to 'completed' instead of 'Sent'
    campaign.status = 'completed';
    updateCampaign(id, campaign);
    return `Campaign ${id} sent successfully.`;
  }
  return `Campaign ${id} not found.`;
}

export async function checkScheduledCampaigns() {
  await checkAndSendScheduledCampaigns();
  return "Checked and processed scheduled campaigns.";
}

// Add more campaign-related functions as needed