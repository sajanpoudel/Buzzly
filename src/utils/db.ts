import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  orderBy,
  Timestamp,
  startAt,
  endAt,
  deleteDoc
} from 'firebase/firestore';
import { UserData, CampaignData, TemplateData, EmailStats, CampaignType } from '@/types/database';

// User functions
export const createOrUpdateUser = async (userData: UserData) => {
  const userRef = doc(db, 'users', userData.id);
  await setDoc(userRef, userData, { merge: true });
};

export const getUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserData : null;
};

// Campaign functions
export const createCampaign = async (campaignData: CampaignData) => {
  try {
    console.log('Creating campaign with data:', campaignData);
    const campaignRef = doc(collection(db, 'campaigns'));
    
    // Create a clean campaign object with all required fields
    const campaign: CampaignData = {
      ...campaignData,
      id: campaignRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        deviceInfo: []
      },
      trackingIds: [],
      status: campaignData.isScheduled ? 'scheduled' : 'running',
      scheduledDateTime: campaignData.isScheduled 
        ? campaignData.scheduledDateTime 
        : new Date().toISOString(),
      description: campaignData.description || '' // Provide default empty string
    };

    // Remove undefined fields and ensure all required fields are present
    const cleanCampaign: CampaignData = {
      id: campaign.id,
      userId: campaign.userId,
      name: campaign.name,
      type: campaign.type,
      subject: campaign.subject,
      body: campaign.body,
      recipients: campaign.recipients,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      isRecurring: campaign.isRecurring,
      isScheduled: campaign.isScheduled,
      scheduledDateTime: campaign.scheduledDateTime,
      status: campaign.status,
      stats: campaign.stats,
      trackingIds: campaign.trackingIds,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      targetAudience: campaign.targetAudience,
      userEmail: campaign.userEmail,
      description: campaign.description || '' // Provide default empty string
    };

    // Remove any remaining undefined values
    Object.keys(cleanCampaign).forEach(key => {
      if (cleanCampaign[key as keyof CampaignData] === undefined) {
        delete cleanCampaign[key as keyof CampaignData];
      }
    });

    await setDoc(campaignRef, cleanCampaign);

    // If not scheduled, send the emails immediately
    if (!cleanCampaign.isScheduled) {
      try {
        await sendCampaignEmails(cleanCampaign);
      } catch (error) {
        console.error('Error sending campaign emails:', error);
        // Update campaign status to error with proper type
        await updateCampaign(cleanCampaign.id, {
          status: 'draft', // Changed from 'error' to valid status
          updatedAt: new Date().toISOString()
        });
        throw error;
      }
    }

    return cleanCampaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const updateCampaign = async (campaignId: string, updates: Partial<CampaignData>) => {
  const campaignRef = doc(db, 'campaigns', campaignId);
  await updateDoc(campaignRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const getCampaigns = async (userId: string, filters?: {
  type?: CampaignType | 'all';
  dateRange?: { start: Date; end: Date };
  audienceSegment?: string;
  sortBy?: 'openRate' | 'clickRate' | 'conversionRate' | undefined;
}) => {
  try {
    if (!userId) {
      console.error('No userId provided to getCampaigns');
      return [];
    }

    console.log('Fetching campaigns for userId:', userId);

    // Start with base query
    let q = query(
      collection(db, 'campaigns'),
      where('userId', '==', userId)
    );

    // Add type filter if specified
    if (filters?.type && filters.type !== 'all') {
      q = query(q, where('type', '==', filters.type));
    }

    // Add date range filter if provided
    if (filters?.dateRange?.start && filters?.dateRange?.end) {
      q = query(q,
        where('createdAt', '>=', filters.dateRange.start.toISOString()),
        where('createdAt', '<=', filters.dateRange.end.toISOString())
      );
    }

    // Execute query
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query returned:', querySnapshot.size, 'documents');

    let campaigns = querySnapshot.docs.map(doc => {
      const data = doc.data() as CampaignData;
      // Calculate rates for each campaign
      const recipientCount = data.recipients.length || 1; // Avoid division by zero
      const rates = {
        openRate: (data.stats.opened / recipientCount) * 100,
        clickRate: (data.stats.clicked / recipientCount) * 100,
        conversionRate: (data.stats.converted / recipientCount) * 100
      };
      return { ...data, rates };
    });

    // Sort based on rates if specified
    if (filters?.sortBy) {
      campaigns.sort((a, b) => {
        return b.rates[filters.sortBy!] - a.rates[filters.sortBy!];
      });
    } else {
      // Default sort by createdAt
      campaigns.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Apply audience segment filter in memory
    if (filters?.audienceSegment && filters.audienceSegment !== 'all') {
      campaigns = campaigns.filter(campaign => 
        campaign.targetAudience === filters.audienceSegment
      );
    }

    // Remove the rates property before returning
    return campaigns.map(({ rates, ...campaign }) => campaign);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// Template functions
export const createTemplate = async (templateData: TemplateData) => {
  const templateRef = doc(collection(db, 'templates'));
  const template = {
    ...templateData,
    id: templateRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(templateRef, template);
  return template;
};

export const getTemplates = async (userId: string) => {
  const q = query(
    collection(db, 'templates'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as TemplateData);
};

// Email stats functions
export const updateEmailStats = async (statsData: EmailStats) => {
  const statsRef = doc(db, 'emailStats', statsData.trackingId);
  await setDoc(statsRef, {
    ...statsData,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // Update campaign stats
  const campaignRef = doc(db, 'campaigns', statsData.campaignId);
  const campaignSnap = await getDoc(campaignRef);
  if (campaignSnap.exists()) {
    const campaign = campaignSnap.data() as CampaignData;
    const stats = campaign.stats;
    
    if (statsData.opened && !stats.opened) {
      stats.opened++;
    }
    if (statsData.clicked && !stats.clicked) {
      stats.clicked++;
    }
    if (statsData.converted && !stats.converted) {
      stats.converted++;
    }

    await updateDoc(campaignRef, { stats });
  }
};

export const getEmailStats = async (campaignId: string) => {
  const q = query(
    collection(db, 'emailStats'),
    where('campaignId', '==', campaignId),
    where('opened', '==', true),
    orderBy('openedAt', 'desc')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EmailStats);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    throw error;
  }
};

// Add this new function to handle email sending
async function sendCampaignEmails(campaign: CampaignData) {
  try {
    const tokens = JSON.parse(localStorage.getItem('gmail_tokens') || '{}');
    
    if (!tokens.access_token) {
      throw new Error('No access token available');
    }

    // Decode the HTML content first (in case it's already encoded)
    const decodedBody = decodeURIComponent(campaign.body);
    
    // Send to backend for email processing
    const response = await fetch('https://emailapp-backend.onrender.com/auth/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access_token}`,
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        recipients: campaign.recipients,
        subject: campaign.subject,
        body: decodedBody, // Send decoded body
        userEmail: campaign.userEmail,
        tokens,
        templateData: {
          brandName: '[Your Brand]',
          supportEmail: 'support@yourbrand.com',
          ctaLink: 'https://yourbrand.com',
          signature: 'The Team'
        }
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send campaign emails');
      } else {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    try {
      const result = await response.json();
      
      // Update campaign with tracking IDs and status
      if (result.info) {
        const trackingIds = result.info.map((info: any) => info.trackingId);
        await updateCampaign(campaign.id, {
          trackingIds,
          stats: {
            ...campaign.stats,
            sent: campaign.recipients.length
          },
          status: 'completed', // Changed from 'sent' to valid status
          updatedAt: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error sending campaign emails:', error);
    throw error;
  }
}

// Add updateTemplate function
export const updateTemplate = async (templateId: string, updates: Partial<TemplateData>) => {
  const templateRef = doc(db, 'templates', templateId);
  await updateDoc(templateRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  
  // Get and return the updated template
  const templateSnap = await getDoc(templateRef);
  if (templateSnap.exists()) {
    return templateSnap.data() as TemplateData;
  }
  throw new Error('Template not found');
};

// Add deleteTemplate function
export const deleteTemplate = async (templateId: string) => {
  const templateRef = doc(db, 'templates', templateId);
  await deleteDoc(templateRef);  // Add deleteDoc to the imports from firebase/firestore
};
