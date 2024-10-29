import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignSuggestionsProps {
  suggestions: string[];
  title?: string;
}

export const CampaignSuggestions: React.FC<CampaignSuggestionsProps> = ({ 
  suggestions,
  title = "Improvement Suggestions" 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">💡</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}; 