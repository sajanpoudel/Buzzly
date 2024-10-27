import { Campaign, saveCampaign as saveToStore, getCampaigns as getFromStore, updateCampaignStats as updateStatsInStore } from './campaignStore';
import { CampaignData } from '@/types/database';
import { CampaignInput } from '@/types/campaign';

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const campaign: Campaign = {
    ...input,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    },
    trackingIds: [],
    status: input.isScheduled ? 'scheduled' : 'running'
  };

  await saveToStore(campaign);
  return campaign;
}

export function getCampaigns(): Campaign[] {
  return getFromStore();
}

export function updateCampaignStats(id: string, stats: Partial<Campaign['stats']>): void {
  updateStatsInStore(id, stats);
}
