import React, { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmailStats } from '@/utils/db';
import { CampaignData, CampaignStats } from '@/types/database';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDoc } from 'firebase/firestore';

interface EmailTrackingStatsProps {
  campaignId: string;
}

const EmailTrackingStats: React.FC<EmailTrackingStatsProps> = ({ campaignId }) => {
  const [stats, setStats] = useState<CampaignStats>({
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    deviceInfo: []
  });

  const fetchStats = async () => {
    try {
      const campaignRef = doc(db, 'campaigns', campaignId);
      const campaignSnap = await getDoc(campaignRef);
      
      if (campaignSnap.exists()) {
        const campaignData = campaignSnap.data() as CampaignData;
        setStats(campaignData.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchStats();
      const interval = setInterval(fetchStats, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [campaignId]);

  const chartData = [
    { name: 'Sent', value: stats.sent },
    { name: 'Opened', value: stats.opened },
    { name: 'Clicked', value: stats.clicked },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Email Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Sent</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.sent}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Opens</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.opened}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Open Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(2) : 0}%
              </dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Click-through Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(2) : 0}%
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Email Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTrackingStats;