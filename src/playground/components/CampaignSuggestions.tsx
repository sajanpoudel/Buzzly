import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Clock, Target } from 'lucide-react';

interface CampaignSuggestionsProps {
  suggestions: string[];
  title?: string;
  type: 'improvement' | 'action';
}

const getIcon = (index: number, type: 'improvement' | 'action') => {
  if (type === 'improvement') {
    return [Lightbulb, TrendingUp, Target][index % 3];
  }
  return [Clock, Target, TrendingUp][index % 3];
};

const getBadgeColor = (type: 'improvement' | 'action', index: number) => {
  const colors = {
    improvement: ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'],
    action: ['bg-amber-100 text-amber-800', 'bg-indigo-100 text-indigo-800', 'bg-rose-100 text-rose-800']
  };
  return colors[type][index % 3];
};

export const CampaignSuggestions: React.FC<CampaignSuggestionsProps> = ({ 
  suggestions,
  type,
  title
}) => {
  // Set default title based on type
  const defaultTitle = type === 'improvement' ? "Improvement Areas" : "Action Steps";
  const displayTitle = title || defaultTitle;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = getIcon(index, type);
            const badgeColor = getBadgeColor(type, index);
            
            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`p-2 rounded-full ${badgeColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{suggestion}</p>
                </div>
                <Badge variant="outline" className={badgeColor}>
                  Priority {index + 1}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}; 