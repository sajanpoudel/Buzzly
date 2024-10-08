import React, { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailTrackingStatsProps {
  trackingIds: string[];
}

interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicks: number;
  uniqueOpens: number;
}

const EmailTrackingStats: React.FC<EmailTrackingStatsProps> = ({ trackingIds }) => {
  const [stats, setStats] = useState<EmailStats>({ totalSent: 0, totalOpened: 0, totalClicks: 0, uniqueOpens: 0 });
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://6a34-192-122-237-12.ngrok-free.app/auth/email-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ trackingIds })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching email stats:', error);
      setError('Failed to fetch email stats. Please try again later.');
    }
  };

  useEffect(() => {
    if (trackingIds.length > 0) {
      fetchStats();
      const interval = setInterval(fetchStats, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [trackingIds]);

  const chartData = [
    { name: 'Sent', value: stats.totalSent },
    { name: 'Opened', value: stats.totalOpened },
    { name: 'Clicked', value: stats.totalClicks },
  ];

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSent}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Unique Opens</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.uniqueOpens}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Open Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalSent > 0 ? ((stats.uniqueOpens / stats.totalSent) * 100).toFixed(2) : 0}%
              </dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Click-through Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalSent > 0 ? ((stats.totalClicks / stats.totalSent) * 100).toFixed(2) : 0}%
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