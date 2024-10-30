import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

// Update the color palette with darker gradients
const COLORS = {
  Desktop: {
    start: '#1E40AF', // Darker Indigo
    end: '#3730A3'
  },
  Mobile: {
    start: '#065F46', // Darker Emerald
    end: '#047857'
  },
  Tablet: {
    start: '#B45309', // Darker Amber
    end: '#92400E'
  },
  Other: {
    start: '#BE185D', // Darker Pink
    end: '#9D174D'
  }
};

export const CampaignAnalysis: React.FC<CampaignAnalysisProps> = ({ analysis }) => {
  // Debug logs with more detail
  console.log('CampaignAnalysis received:', JSON.stringify(analysis, null, 2));
  console.log('Performance Metrics:', JSON.stringify(analysis?.stats?.performanceMetrics, null, 2));
  console.log('Device Breakdown:', JSON.stringify(analysis?.stats?.deviceBreakdown, null, 2));
  console.log('Device Stats:', JSON.stringify(analysis?.stats?.deviceStats, null, 2));

  // Validate the analysis object structure
  if (!analysis?.stats) {
    console.error('Missing analysis or stats object');
    return (
      <div className="p-4 text-red-500">
        Error: Invalid analysis data structure
      </div>
    );
  }

  // Filter out metrics with zero values for the bar chart
  const validMetrics = analysis.stats.performanceMetrics
    .filter(metric => metric && typeof metric.value === 'number' && metric.value > 0)
    .map(metric => ({
      ...metric,
      name: metric.name.replace(/[*#]/g, '').trim()
    }));

  // Transform device data for pie chart using useMemo to cache calculations
  const deviceData = React.useMemo(() => {
    if (!analysis?.stats?.deviceStats?.length) {
      return [{
        name: 'Desktop',
        value: 100,
        browser: 'Unknown',
        os: 'Unknown',
        users: 1
      }];
    }
    
    return analysis.stats.deviceStats.map(stat => ({
      name: stat.device.replace(/[*#]/g, '').trim(),
      value: Number(stat.percentage.toFixed(1)),
      browser: stat.browserInfo[0]?.name || 'Unknown',
      os: stat.osInfo[0]?.name || 'Unknown',
      users: stat.count
    }));
  }, [analysis?.stats?.deviceStats]);

  // Memoize the PieChart component to prevent unnecessary re-renders
  const PieChartComponent = React.useMemo(() => (
    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
      <Pie
        data={deviceData}
        cx="50%"
        cy="50%"
        innerRadius={45}
        outerRadius={70}
        paddingAngle={4}
        dataKey="value"
        nameKey="name"
        label={false}
      >
        {deviceData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[entry.name as keyof typeof COLORS]?.start || COLORS.Other.start}
            strokeWidth={1}
            stroke="rgba(255,255,255,0.5)"
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value: number, name: string, props: any) => {
          const entry = deviceData.find(d => d.name === props.payload.name);
          return [
            <div key="tooltip" className="text-xs space-y-1 p-1.5">
              <div className="font-medium text-gray-900">
                {entry?.name}
              </div>
              <div className="font-semibold text-sm text-gray-900">
                {`${value.toFixed(1)}%`}
              </div>
              <div className="text-gray-600 text-[11px]">
                {`${entry?.users} users`}
              </div>
              <div className="text-gray-500 text-[11px]">
                {`${entry?.browser} on ${entry?.os}`}
              </div>
            </div>,
            ''
          ];
        }}
        contentStyle={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          borderRadius: '8px',
          padding: '8px',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          fontSize: '11px'
        }}
      />
      <Legend
        verticalAlign="bottom"
        align="center"
        layout="horizontal"
        height={36}
        formatter={(value, entry) => {
          const data = deviceData.find(d => d.name === value);
          return (
            <span className="text-[11px] font-medium flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block" 
                style={{ 
                  backgroundColor: COLORS[value as keyof typeof COLORS]?.start || COLORS.Other.start
                }} 
              />
              <span className="text-gray-700">
                {value}: {data?.value.toFixed(1)}%
              </span>
            </span>
          );
        }}
        wrapperStyle={{
          paddingTop: '8px'
        }}
      />
    </PieChart>
  ), [deviceData]);

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-center text-gray-900">
          Device Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {PieChartComponent}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 