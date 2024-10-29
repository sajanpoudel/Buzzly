import { handleUserInput } from '@/functionCalling/functionHandler';
import { handleCampaignQuery, getOverallCampaignPerformance } from '../utils/messageHandler';
import { CampaignData } from '@/types/database';
import { CampaignAnalysis } from '../components/CampaignAnalysis';
import { PerformanceGraph } from '../components/PerformanceGraph';
import { CampaignSuggestions } from '../components/CampaignSuggestions';
import React, { ReactElement } from 'react';

interface PlaygroundResponse {
  text: string;
  component?: React.ReactElement;
}

interface AnalysisResponse {
  analysis: string;
  stats?: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    deviceBreakdown: { [key: string]: number };
  };
  trends?: {
    date: string;
    openRate: number;
    clickRate: number;
  }[];
  suggestions?: string[];
}

export async function handlePlaygroundQuery(message: string, userId: string): Promise<PlaygroundResponse> {
  try {
    if (!userId) {
      return { text: "No user ID provided. Please make sure you're logged in." };
    }

    console.log('Processing query with userId:', userId);

    // Check for overall performance query
    if (message.toLowerCase().includes('overall') || 
        message.toLowerCase().includes('all campaigns') ||
        message.toLowerCase().includes('campaigns doing')) {
      const response = await getOverallCampaignPerformance(userId);
      return { 
        text: response,
        component: undefined  // You can add overall performance visualization here if needed
      };
    }

    // Check for specific campaign analysis
    if (message.toLowerCase().includes('how') && 
        (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('performance'))) {
      const campaignNameMatch = message.match(/['"]([^'"]+)['"]/);
      const campaignName = campaignNameMatch ? campaignNameMatch[1] : undefined;
      
      console.log(`Extracted campaign name: "${campaignName}", userId: "${userId}"`);
      
      const response = await handleCampaignQuery(userId, campaignName) as AnalysisResponse | string;
      
      if (typeof response === 'string') {
        return { text: response };
      }

      // Create visualization components array
      const components: ReactElement[] = [];

      // Add PerformanceGraph first with proper data
      if (response.stats) {
        const graphData = response.trends || [
          {
            date: 'Start',
            openRate: response.stats.openRate,
            clickRate: response.stats.clickRate
          },
          {
            date: 'Current',
            openRate: response.stats.openRate,
            clickRate: response.stats.clickRate
          }
        ];

        components.push(
          React.createElement(PerformanceGraph, { 
            data: graphData,
            key: 'performance'
          })
        );

        components.push(
          React.createElement(CampaignAnalysis, { 
            analysis: {
              stats: response.stats,
              trends: response.trends || [],
              suggestions: response.suggestions || []
            },
            key: 'analysis' 
          })
        );

        if (response.suggestions?.length) {
          components.push(
            React.createElement(CampaignSuggestions, {
              suggestions: response.suggestions,
              key: 'suggestions'
            })
          );
        }
      }

      return {
        text: response.analysis || 'Here are your campaign statistics:',
        component: components.length > 0 ? React.createElement('div', { 
          className: 'space-y-4 w-full',
          children: components 
        }) : undefined
      };
    }

    return { 
      text: "I can help you analyze campaign performance, provide improvement suggestions, or show overall campaign statistics. What would you like to know?" 
    };
  } catch (error) {
    console.error('Error handling playground query:', error);
    return {
      text: "I encountered an error processing your request. Please try again."
    };
  }
} 