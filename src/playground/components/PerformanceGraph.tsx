import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceGraphProps {
  data: {
    date: string;
    openRate: number;
    clickRate: number;
  }[];
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'currentColor' }}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fill: 'currentColor' }}
                stroke="currentColor"
                label={{ 
                  value: 'Rate (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'currentColor' 
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="openRate" 
                name="Open Rate"
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
              <Line 
                type="monotone" 
                dataKey="clickRate" 
                name="Click Rate"
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ fill: '#82ca9d' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 