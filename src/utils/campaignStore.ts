export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  recipients: { name: string; email: string }[];
  trackingIds: string[];
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  subject: string;
  body: string;
  isRecurring: boolean;
  targetAudience: string;
  scheduledDateTime?: string;
  userEmail: string;
}

const CAMPAIGNS_KEY = 'email_campaigns';

export function saveCampaign(campaign: Campaign): void {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex(c => c.id === campaign.id);
  if (index !== -1) {
    campaigns[index] = campaign;
  } else {
    campaigns.push(campaign);
  }
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function getCampaigns(): Campaign[] {
  const campaignsJson = localStorage.getItem(CAMPAIGNS_KEY);
  if (campaignsJson) {
    return JSON.parse(campaignsJson);
  }
  return [];
}

export function updateCampaignStats(id: string, stats: Partial<Campaign['stats']>): void {
  const campaigns = getCampaigns();
  const campaignIndex = campaigns.findIndex(c => c.id === id);
  if (campaignIndex !== -1) {
    campaigns[campaignIndex].stats = {
      ...campaigns[campaignIndex].stats,
      ...stats
    };
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }
}