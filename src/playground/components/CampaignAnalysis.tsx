import React from 'react';

interface CampaignAnalysisProps {
  analysis: {
    stats: {
      performanceMetrics: Array<{
        name: string;
        value: number;
      }>;
      deviceStats: Array<{
        device: string;
        count: number;
        percentage: number;
        browserInfo: Array<{ name: string; percentage: number }>;
        osInfo: Array<{ name: string; percentage: number }>;
        engagementTimes: Date[];
      }>;
      deviceBreakdown: { [key: string]: number };
    };
  };
}

export const CampaignAnalysis: React.FC<CampaignAnalysisProps> = ({ analysis }) => {
  // Validate the analysis object structure
  if (!analysis?.stats) {
    console.error('Missing analysis or stats object');
    return (
      <div className="p-4 text-red-500">
        Error: Invalid analysis data structure
      </div>
    );
  }


}; 