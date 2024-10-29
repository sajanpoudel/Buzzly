import { handleUserInput } from '@/functionCalling/functionHandler';
import { handleCampaignQuery } from '../utils/messageHandler';
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
  trends?: {
    date: string;
    openRate: number;
    clickRate: number;
  }[];
  suggestions?: string[];
  stats: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    deviceBreakdown: { [key: string]: number };
  };
}

export async function handlePlaygroundQuery(message: string, userId: string): Promise<PlaygroundResponse> {
  try {
    // Create UI callbacks
    const uiCallbacks = {
      startEmailCreation: () => {
        console.log('Email creation started');
        // Handle in parent component if needed
      },
      openPaymentForm: () => {
        console.log('Payment form opened');
        // Handle in parent component if needed
      },
      startTemplateCreation: () => {
        console.log('Template creation started');
        // Handle in parent component if needed
      },
      startCampaignCreation: () => {
        console.log('Campaign creation started');
        // Handle in parent component if needed
      }
    };

    // First try handling with general function handler
    const generalResponse = await handleUserInput(message, userId, uiCallbacks);
    
    // Check if generalResponse is a string and different from the original message
    if (typeof generalResponse === 'string' && generalResponse !== message) {
      return { text: generalResponse };
    }

    if (message.toLowerCase().includes('how') && 
        (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('performance'))) {
      const response = await handleCampaignQuery(message, userId) as AnalysisResponse | string;
      
      if (typeof response === 'string') {
        return { text: response };
      }

      const analysisProps = {
        stats: response.stats,
        trends: response.trends || [],
        suggestions: response.suggestions || []
      };

      const components: ReactElement[] = [];

      // Add CampaignAnalysis
      components.push(
        React.createElement(CampaignAnalysis, { 
          analysis: analysisProps,
          key: 'analysis' 
        })
      );

      // Add PerformanceGraph if trends exist
      if (response.trends) {
        components.push(
          React.createElement(PerformanceGraph, { 
            data: response.trends,
            key: 'performance'
          })
        );
      }

      // Add CampaignSuggestions if suggestions exist
      if (response.suggestions?.length) {
        components.push(
          React.createElement(CampaignSuggestions, {
            suggestions: response.suggestions,
            key: 'suggestions'
          })
        );
      }

      return {
        text: response.analysis || 'Here are your campaign statistics:',
        component: React.createElement('div', { className: 'space-y-4' }, components)
      };
    }

    if (message.toLowerCase().includes('improve') || 
        message.toLowerCase().includes('suggestions') ||
        message.toLowerCase().includes('better')) {
      const response = await handleCampaignQuery(message, userId) as AnalysisResponse | string;
      
      return {
        text: typeof response === 'string' ? response : response.analysis || 'Here are some suggestions:',
        component: typeof response !== 'string' && response.suggestions ? 
          React.createElement(CampaignSuggestions, {
            suggestions: response.suggestions || [],
            title: "Improvement Strategies"
          }) : undefined
      };
    }

    if (message.toLowerCase().includes('overall') || 
        message.toLowerCase().includes('all campaigns')) {
      const response = await handleCampaignQuery(message, userId) as AnalysisResponse | string;
      
      return {
        text: typeof response === 'string' ? response : response.analysis || 'Here is your overall performance:',
        component: typeof response !== 'string' && response.trends ? 
          React.createElement(PerformanceGraph, { data: response.trends }) : undefined
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