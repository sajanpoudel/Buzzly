import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="openRate" stroke="#8884d8" name="Open Rate" />
              <Line type="monotone" dataKey="clickRate" stroke="#82ca9d" name="Click Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 