import { CampaignData } from "./database";

export interface CampaignCreationData {
  name: string;
  type: string;
  subject: string;
  body: string;
  recipients: { name: string; email: string }[];
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  targetAudience: string;
  userEmail: string;
  tokens: any;
  isScheduled: boolean;
  scheduledDateTime?: string;
  isSingleEmail?: boolean;
  description?: string;
}

export interface CampaignInput extends Omit<CampaignData, 'id'> {
  tokens: any;
}
