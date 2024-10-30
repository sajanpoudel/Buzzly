import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface DeviceDistributionProps {
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
    browserInfo: Array<{ name: string; percentage: number }>;
    osInfo: Array<{ name: string; percentage: number }>;
  }>;
}

const COLORS = {
  Desktop: {
    start: '#1E40AF',
    end: '#3730A3'
  },
  Mobile: {
    start: '#065F46',
    end: '#047857'
  },
  Tablet: {
    start: '#B45309',
    end: '#92400E'
  },
  Other: {
    start: '#BE185D',
    end: '#9D174D'
  }
};

export const DeviceDistributionChart: React.FC<DeviceDistributionProps> = ({ deviceStats }) => {
  const chartData = React.useMemo(() => {
    return deviceStats.map(stat => ({
      name: stat.device,
      value: stat.percentage,
      browser: stat.browserInfo[0]?.name || 'Unknown',
      os: stat.osInfo[0]?.name || 'Unknown',
      users: stat.count
    }));
  }, [deviceStats]);

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
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={false}
              >
                {chartData.map((entry, index) => (
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
                  const entry = chartData.find(d => d.name === props.payload.name);
                  if (!entry) return ['', ''];
                  
                  return [
                    <div key={`tooltip-${name}`} className="text-xs space-y-1 p-1.5">
                      <div key={`name-${name}`} className="font-medium text-gray-900">
                        {entry.name}
                      </div>
                      <div key={`value-${name}`} className="font-semibold text-sm text-gray-900">
                        {`${value.toFixed(1)}%`}
                      </div>
                      <div key={`users-${name}`} className="text-gray-600 text-[11px]">
                        {`${entry.users} users`}
                      </div>
                      <div key={`browser-${name}`} className="text-gray-500 text-[11px]">
                        {`${entry.browser} on ${entry.os}`}
                      </div>
                    </div>,
                    'Usage'
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
                  const data = chartData.find(d => d.name === value);
                  return (
                    <span key={`legend-${value}`} className="text-[11px] font-medium flex items-center gap-1.5">
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
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 