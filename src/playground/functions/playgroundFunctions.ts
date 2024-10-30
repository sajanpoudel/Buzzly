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
  stats: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    bounceRate: number;
    clickToOpenRate: number;
    deviceBreakdown: { [key: string]: number };
    performanceMetrics: Array<{
      name: string;
      value: number;
    }>;
    deviceStats: Array<{
      device: string;
      percentage: number;
      browser: string;
      os: string;
      count: number;
    }>;
    totalRecipients: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    engagementRate: number;
  };
  trends?: {
    date: string;
    openRate: number;
    clickRate: number;
  }[];
  suggestions?: string[];
  improvements?: string[];
  actions?: string[];
  needsVisualization?: boolean;
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
      
      // Handle the response based on its type
      if (typeof response === 'string') {
        return { 
          text: response,
          component: undefined
        };
      }

      // If it's an OverallPerformance object, create a formatted text response
      const formattedText = `
Overall Campaign Performance

• Total Sent: ${response.stats.sent}
• Total Opened: ${response.stats.opened}
• Total Clicked: ${response.stats.clicked}
• Total Conversions: ${response.stats.converted}

Key Insights:
${response.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}
      `.trim();

      // Create visualization component for overall performance
      const component = React.createElement('div', { 
        className: 'space-y-4 w-full',
        children: [
          React.createElement(PerformanceGraph, { 
            data: response.trends,
            key: 'overall-performance'
          }),
          React.createElement(CampaignSuggestions, {
            suggestions: response.suggestions,
            type: 'improvement',
            title: 'Overall Recommendations',
            key: 'overall-suggestions'
          })
        ]
      });

      return { 
        text: formattedText,
        component
      };
    }

    // Check for specific campaign analysis
    if (message.toLowerCase().includes('how') && 
        (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('performance'))) {
      try {
        const campaignNameMatch = message.match(/['"]([^'"]+)['"]/);
        const campaignName = campaignNameMatch?.[1];
        
        // Early return if no campaign name is found
        if (!campaignName) {
          return { 
            text: "Please specify a campaign name in quotes. For example: How is campaign \"Summer Sale\" performing?" 
          };
        }
        
        console.log(`Analyzing campaign: "${campaignName}" for user: "${userId}"`);
        
        // Now TypeScript knows campaignName is definitely a string
        const response = await handleCampaignQuery(userId, campaignName);
        
        // Check if response is a string (error message)
        if (typeof response === 'string') {
          return { text: response };
        }

        // Now TypeScript knows response is AnalysisResponse
        console.log('Response stats:', response.stats);

        // Format the response text and suggestions
        const formattedAnalysis = response.analysis.replace(/[*#]/g, '');
        const formattedImprovements = response.improvements?.map(item => item.replace(/[*#]/g, '')) || [];
        const formattedActions = response.actions?.map(item => item.replace(/[*#]/g, '')) || [];

        // Create a container for both charts
        const chartsContainer = React.createElement('div', {
          className: 'grid grid-cols-2 gap-4 w-full mb-4',
          children: [
            // Performance Graph
            React.createElement(PerformanceGraph, {
              data: response.trends?.data.map(item => ({
                date: item.date,
                openRate: Number(item.openRate.toFixed(1)),
                clickRate: Number(item.clickRate.toFixed(1))
              })),
              loading: false,
              error: response.trends?.error,
              key: 'performance-graph'
            }),
            
            // Campaign Analysis (which contains the pie chart)
            React.createElement(CampaignAnalysis, {
              analysis: {
                stats: {
                  performanceMetrics: [
                    { name: 'Open Rate', value: Number(response.stats.openRate || 0) },
                    { name: 'Click Rate', value: Number(response.stats.clickRate || 0) },
                    { name: 'Conversion Rate', value: Number(response.stats.conversionRate || 0) },
                    { name: 'Bounce Rate', value: Number(response.stats.bounceRate || 0) },
                    { name: 'Click to Open Rate', value: Number(response.stats.clickToOpenRate || 0) }
                  ],
                  deviceStats: response.stats.deviceStats || [],
                  deviceBreakdown: response.stats.deviceBreakdown || { Desktop: 100 }
                }
              }
            })
          ]
        });

        // Add suggestions below the charts
        const suggestions = [];
        if (formattedImprovements.length > 0) {
          suggestions.push(
            React.createElement(CampaignSuggestions, {
              suggestions: formattedImprovements,
              type: 'improvement',
              key: 'improvements'
            })
          );
        }

        if (formattedActions.length > 0) {
          suggestions.push(
            React.createElement(CampaignSuggestions, {
              suggestions: formattedActions,
              type: 'action',
              key: 'actions'
            })
          );
        }

        // Return the complete component structure
        return {
          text: formattedAnalysis || 'Here are your campaign statistics:',
          component: React.createElement('div', { 
            className: 'space-y-4 w-full',
            children: [chartsContainer, ...suggestions]
          })
        };
      } catch (error) {
        console.error('Error in campaign analysis:', error);
        return { 
          text: "I encountered an error analyzing the campaign. Please check the campaign name and try again." 
        };
      }
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