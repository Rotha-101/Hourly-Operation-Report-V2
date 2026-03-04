import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TabBar from './components/TabBar';
import ReportForm from './components/ReportForm';
import LivePreview from './components/LivePreview';
import { AppState, ReportData, TabRegistry, TabEntry, Shift, ProjectType } from './types';
import { loadTabRegistry, saveTabRegistry, saveReport, logAudit } from './services/db';
import { GROUPS, OPERATORS, PROJECTS } from './constants';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultState = (): AppState => ({
  operatorId: null,
  operatorNames: [],
  groupId: null,
  groupName: null,
  role: 'operator',
  activeProjectId: null,
  activeProjectName: null,
  reportDate: new Date().toISOString().split('T')[0],
  hourInterval: '00:00',
  shift: Shift.A,
  systemReady: true,
});

const createDefaultTab = (): TabEntry => ({
  id: generateId(),
  label: 'New Report',
  state: createDefaultState(),
  reportData: null,
});

export default function App() {
  const [registry, setRegistry] = useState<TabRegistry>(() => {
    const saved = loadTabRegistry();
    if (saved && saved.tabs.length > 0) return saved;
    const defaultTab = createDefaultTab();
    return { tabs: [defaultTab], activeTabId: defaultTab.id };
  });

  useEffect(() => {
    saveTabRegistry(registry);
  }, [registry]);

  const activeTab = registry.tabs.find(t => t.id === registry.activeTabId) || registry.tabs[0];

  const handleSwitchTab = (id: string) => {
    setRegistry(prev => ({ ...prev, activeTabId: id }));
  };

  const handleAddTab = () => {
    const newTab = createDefaultTab();
    setRegistry(prev => ({
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRegistry(prev => {
      const newTabs = prev.tabs.filter(t => t.id !== id);
      if (newTabs.length === 0) {
        const newTab = createDefaultTab();
        return { tabs: [newTab], activeTabId: newTab.id };
      }
      let newActiveId = prev.activeTabId;
      if (id === prev.activeTabId) {
        const closedIndex = prev.tabs.findIndex(t => t.id === id);
        newActiveId = newTabs[Math.min(closedIndex, newTabs.length - 1)].id;
      }
      return { tabs: newTabs, activeTabId: newActiveId };
    });
  };

  const updateActiveTabState = (update: Partial<AppState>) => {
    setRegistry(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === prev.activeTabId ? { ...t, state: { ...t.state, ...update } } : t)
    }));
  };

  const updateActiveTabData = (update: Partial<ReportData>) => {
    setRegistry(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === prev.activeTabId ? { ...t, reportData: t.reportData ? { ...t.reportData, ...update } : null } : t)
    }));
  };

  const handleProjectSelect = (projectId: string) => {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    const newReportData: ReportData = {
      capacity: project.capacity,
      bessFunction: {
        peakShifting: false,
        pfc: false,
        qu: false,
        tieLine: project.type === ProjectType.FORMAT_A ? false : undefined,
        pvSmoothing: project.type === ProjectType.FORMAT_B ? false : undefined,
        manualCharge: { enabled: false, mw: '0', time: '' },
        manualDischarge: { enabled: false, mw: '0', time: '' },
      },
      telemetry: project.type === ProjectType.FORMAT_A ? {
        formatA: {
          sppc1: { soc: 0, cycleToday: '0', cycleMonth: '0', cycleTotal: '0' },
          sppc2: { soc: 0, cycleToday: '0', cycleMonth: '0', cycleTotal: '0' },
          sppc3: { soc: 0, cycleToday: '0', cycleMonth: '0', cycleTotal: '0' },
        }
      } : {
        formatB: { soc: 0, todayCycle: '0', thisMonthCycle: '0', totalCycle: '0' }
      },
      availability: {
        bessOnline: project.defaults.bessOnline,
        pcsOnline: project.defaults.pcsOnline,
        transformerOnline: project.defaults.transformerOnline,
        emsStatus: project.defaults.emsStatus,
        overallJudgment: project.defaults.overallJudgment,
      },
      incidents: [],
    };

    setRegistry(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => {
        if (t.id === prev.activeTabId) {
          return {
            ...t,
            label: project.siteName,
            state: { ...t.state, activeProjectId: project.id, activeProjectName: project.name },
            reportData: newReportData,
          };
        }
        return t;
      })
    }));
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Layout />
      <TabBar 
        tabs={registry.tabs} 
        activeTabId={registry.activeTabId} 
        onSwitchTab={handleSwitchTab} 
        onAddTab={handleAddTab} 
        onCloseTab={handleCloseTab} 
      />
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="flex-1 lg:w-[68%] overflow-y-auto p-4 lg:p-6 bg-[#060b16]">
          <ReportForm 
            state={activeTab.state} 
            reportData={activeTab.reportData} 
            onUpdateState={updateActiveTabState} 
            onUpdateData={updateActiveTabData} 
            onProjectSelect={handleProjectSelect} 
          />
        </div>
        <div className="h-[500px] lg:h-auto lg:w-[32%] border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#111827]">
          <LivePreview state={activeTab.state} reportData={activeTab.reportData} />
        </div>
      </div>
    </div>
  );
}
