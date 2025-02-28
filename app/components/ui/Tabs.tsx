'use client';

import React, { useState, ReactElement } from 'react';

// Define the type for tab items
export interface TabItem {
  id: string;
  label: string;
}

// Define the type for Tabs props
export interface TabsProps {
  defaultTab: string;
  tabs: TabItem[];
  children: React.ReactNode;
}

// Define the type for TabPanel props
export interface TabPanelProps {
  children: React.ReactNode;
  id: string;
}

export default function Tabs({ defaultTab, tabs, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div>
      <div className="border-b border-border mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap
                ${activeTab === tab.id
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
          // Safely check if child is a valid React element and has the id prop matching the active tab
          if (
            React.isValidElement<TabPanelProps>(child) && 
            child.props.id === activeTab
          ) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function TabPanel({ children, id }: TabPanelProps) {
  return (
    <div className="tab-panel">
      {children}
    </div>
  );
} 