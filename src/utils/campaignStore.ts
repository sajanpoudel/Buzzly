export interface Campaign {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  targetAudience: string;
  recipients: { name: string; email: string }[];
  status: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  trackingIds: string[];
  scheduledDateTime?: string; // Add this line
}

const CAMPAIGNS_KEY = 'email_campaigns';

export function saveCampaign(campaign: Campaign): void {
  const campaigns = getCampaigns();
  campaigns.push(campaign);
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function getCampaigns(): Campaign[] {
  const campaignsJson = localStorage.getItem(CAMPAIGNS_KEY);
  return campaignsJson ? JSON.parse(campaignsJson) : [];
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