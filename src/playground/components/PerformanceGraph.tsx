import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceGraphProps {
  data?: Array<{
    date: string;
    openRate: number;
    clickRate: number;
  }>;
  loading?: boolean;
  error?: string;
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ 
  data = [], 
  loading = false,
  error 
}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading performance data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-500">No performance data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rate']}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  padding: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontSize: '11px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="openRate"
                name="Open Rate"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="clickRate"
                name="Click Rate"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 