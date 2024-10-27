export interface UserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  gmailTokens: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
}

export interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
}

export interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  deviceInfo?: DeviceInfo[];  // Add deviceInfo to stats
}

export type CampaignType = 'general' | 'newsletter' | 'promotional' | 'transactional';

export interface CampaignData {
  id: string;
  userId: string;
  name: string;
  type: CampaignType;
  subject: string;
  body: string;
  recipients: {
    name: string;
    email: string;
  }[];
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  isScheduled: boolean;
  scheduledDateTime?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  stats: CampaignStats;  // Use the new CampaignStats interface
  trackingIds: string[];
  createdAt: string;
  updatedAt: string;
  targetAudience: string;
  userEmail: string;
  description?: string;
  templateId?: string;
}

export interface TemplateData {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailStats {
  campaignId: string;
  trackingId: string;
  recipientEmail: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  converted: boolean;
  convertedAt?: string;
  deviceInfo?: DeviceInfo[];
}
