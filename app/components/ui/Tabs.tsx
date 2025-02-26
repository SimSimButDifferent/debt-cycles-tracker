'use client';

import React, { useState, ReactElement } from 'react';
import { TabsProps } from '@/app/types';

// Define the type for TabPanel props
interface TabPanelProps {
  children: React.ReactNode;
  value: string;
}

export default function Tabs({ defaultValue, tabs, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div>
      <div className="border-b border-border mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap
                ${activeTab === tab.value
                  ? 'bg-background text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="tab-content">
        {React.Children.map(children, (child) => {
          // Safely check if child is a valid React element and has the value prop matching the active tab
          if (
            React.isValidElement<TabPanelProps>(child) && 
            child.props.value === activeTab
          ) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function TabPanel({ 
  children, 
  value 
}: TabPanelProps) {
  return (
    <div role="tabpanel" id={`tabpanel-${value}`}>
      {children}
    </div>
  );
} 