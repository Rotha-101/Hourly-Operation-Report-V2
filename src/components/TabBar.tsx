import React from 'react';
import { TabEntry } from '../types';

interface TabBarProps {
  tabs: TabEntry[];
  activeTabId: string;
  onSwitchTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
}

export default function TabBar({ tabs, activeTabId, onSwitchTab, onAddTab, onCloseTab }: TabBarProps) {
  return (
    <div className="h-[40px] flex-shrink-0 w-full bg-[#070d1a] border-b border-slate-800 flex items-end px-2 gap-1 overflow-x-auto hide-scrollbar">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSwitchTab(tab.id)}
            className={`group relative h-[34px] min-w-[160px] max-w-[240px] flex items-center px-3 rounded-t-lg cursor-pointer transition-colors border-b-2 ${
              isActive 
                ? 'bg-[#111827] border-sky-400 text-slate-100' 
                : 'bg-[#0f172a]/50 border-transparent text-slate-400 hover:bg-[#0f172a] hover:text-slate-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${isActive ? 'bg-sky-400' : 'bg-slate-600'}`}></div>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-xs font-semibold truncate select-none">
                {tab.label}
              </span>
              {tab.reportData && (
                <span className="text-[9px] text-slate-500 truncate">
                  {tab.reportData.capacity}
                </span>
              )}
            </div>
            <button
              onClick={(e) => onCloseTab(tab.id, e)}
              className={`ml-2 w-5 h-5 rounded hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 sm:opacity-100'}`}
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        );
      })}
      <button
        onClick={onAddTab}
        className="h-[34px] w-[34px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-[#0f172a] rounded-t-lg transition-colors ml-1"
      >
        <i className="fas fa-plus text-sm"></i>
      </button>
    </div>
  );
}
