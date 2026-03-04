import React from 'react';
import { AppState, ReportData, Shift, ProjectType, Incident } from '../types';
import { GROUPS, OPERATORS, PROJECTS } from '../constants';

interface ReportFormProps {
  state: AppState;
  reportData: ReportData | null;
  onUpdateState: (update: Partial<AppState>) => void;
  onUpdateData: (update: Partial<ReportData>) => void;
  onProjectSelect: (projectId: string) => void;
}

export default function ReportForm({ state, reportData, onUpdateState, onUpdateData, onProjectSelect }: ReportFormProps) {
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = parseInt(e.target.value);
    const group = GROUPS.find(g => g.id === groupId);
    onUpdateState({
      groupId: isNaN(groupId) ? null : groupId,
      groupName: group ? group.name : null,
      operatorNames: [],
      activeProjectId: null,
      activeProjectName: null,
    });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onProjectSelect(e.target.value);
  };

  const syncTime = () => {
    const d = new Date();
    const hh = d.getHours().toString().padStart(2, '0');
    onUpdateState({ hourInterval: `${hh}:00` });
  };

  const toggleOperator = (name: string) => {
    const current = state.operatorNames;
    if (current.includes(name)) {
      onUpdateState({ operatorNames: current.filter(n => n !== name) });
    } else {
      onUpdateState({ operatorNames: [...current, name] });
    }
  };

  const activeProject = PROJECTS.find(p => p.id === state.activeProjectId);
  const filteredProjects = PROJECTS.filter(p => p.groupId === state.groupId);
  const filteredOperators = OPERATORS.filter(o => o.groupId === state.groupId);

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      {/* Section 1: Context */}
      <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4 border-l-4 border-sky-400 pl-3">
          <i className="fas fa-file-lines text-sky-400"></i>
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">1. Report Context & Operators</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Group Selection</label>
            <select 
              className="input-dark w-full p-2 rounded-md text-sm"
              value={state.groupId || ''}
              onChange={handleGroupChange}
            >
              <option value="">-- Select Group --</option>
              {GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project / Feed ID</label>
            <select 
              className="input-dark w-full p-2 rounded-md text-sm"
              value={state.activeProjectId || ''}
              onChange={handleProjectChange}
              disabled={!state.groupId}
            >
              <option value="">-- Select Project --</option>
              {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reporting Date</label>
            <input 
              type="date" 
              className="input-dark w-full p-2 rounded-md text-sm"
              value={state.reportDate}
              onChange={e => onUpdateState({ reportDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="HH:MM"
                className="input-dark flex-1 p-2 rounded-md text-sm"
                value={state.hourInterval}
                onChange={e => onUpdateState({ hourInterval: e.target.value })}
              />
              <button onClick={syncTime} className="w-10 flex items-center justify-center rounded-md border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                <i className="fas fa-clock"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shift Assignment</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Shift).map(shift => (
              <button
                key={shift}
                onClick={() => onUpdateState({ shift })}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors border ${
                  state.shift === shift 
                    ? 'bg-sky-500 border-sky-400 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">On-Duty Operators</label>
          <div className="flex flex-wrap gap-2">
            {filteredOperators.length === 0 && <span className="text-xs text-slate-500 italic">Select a group first</span>}
            {filteredOperators.map(op => {
              const isSelected = state.operatorNames.includes(op.name);
              return (
                <button
                  key={op.id}
                  onClick={() => toggleOperator(op.name)}
                  className={`py-1.5 px-3 rounded-full text-[11px] font-medium transition-colors border ${
                    isSelected
                      ? 'bg-sky-500 border-sky-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {op.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {!reportData ? (
        <div className="flex-1 flex items-center justify-center p-12 border border-dashed border-slate-700 rounded-xl text-slate-500">
          Please select a project to begin reporting.
        </div>
      ) : (
        <>
          {/* Section 2: BESS Function Controls */}
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 border-l-4 border-amber-400 pl-3">
              <i className="fas fa-bolt text-amber-400"></i>
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">2. BESS Function Controls</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <FunctionToggle 
                label="Peak Shift" 
                active={reportData.bessFunction.peakShifting} 
                onClick={() => onUpdateData({ bessFunction: { ...reportData.bessFunction, peakShifting: !reportData.bessFunction.peakShifting } })} 
              />
              <FunctionToggle 
                label="PFC" 
                active={reportData.bessFunction.pfc} 
                onClick={() => onUpdateData({ bessFunction: { ...reportData.bessFunction, pfc: !reportData.bessFunction.pfc } })} 
              />
              <FunctionToggle 
                label="QU Control" 
                active={reportData.bessFunction.qu} 
                onClick={() => onUpdateData({ bessFunction: { ...reportData.bessFunction, qu: !reportData.bessFunction.qu } })} 
              />
              {activeProject?.type === ProjectType.FORMAT_A ? (
                <FunctionToggle 
                  label="Tie Line" 
                  active={!!reportData.bessFunction.tieLine} 
                  onClick={() => onUpdateData({ bessFunction: { ...reportData.bessFunction, tieLine: !reportData.bessFunction.tieLine } })} 
                />
              ) : (
                <FunctionToggle 
                  label="PV Smoothing" 
                  active={!!reportData.bessFunction.pvSmoothing} 
                  onClick={() => onUpdateData({ bessFunction: { ...reportData.bessFunction, pvSmoothing: !reportData.bessFunction.pvSmoothing } })} 
                />
              )}
            </div>

            {activeProject?.type === ProjectType.FORMAT_B && (
              <div className="space-y-3 mt-6">
                <ManualOpRow 
                  label="Manual Charging" 
                  data={reportData.bessFunction.manualCharge} 
                  onChange={(d) => onUpdateData({ bessFunction: { ...reportData.bessFunction, manualCharge: d } })} 
                />
                <ManualOpRow 
                  label="Manual Discharging" 
                  data={reportData.bessFunction.manualDischarge} 
                  onChange={(d) => onUpdateData({ bessFunction: { ...reportData.bessFunction, manualDischarge: d } })} 
                />
              </div>
            )}
          </section>

          {/* Section 3: Storage Telemetry */}
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 border-l-4 border-teal-400 pl-3">
              <i className="fas fa-chart-line text-teal-400"></i>
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">3. Storage Telemetry (SOC & Cycles)</h2>
            </div>

            {activeProject?.type === ProjectType.FORMAT_A && reportData.telemetry.formatA ? (
              <div className="space-y-6">
                {(['sppc1', 'sppc2', 'sppc3'] as const).map(key => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{key.toUpperCase()} SOC (%)</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
                        <input 
                          type="number" 
                          className="input-dark w-full p-3 rounded-md text-xl font-bold text-teal-400"
                          value={reportData.telemetry.formatA![key].soc || ''}
                          onChange={e => onUpdateData({ telemetry: { ...reportData.telemetry, formatA: { ...reportData.telemetry.formatA!, [key]: { ...reportData.telemetry.formatA![key], soc: parseFloat(e.target.value) || 0 } } } })}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 rounded-b-md overflow-hidden">
                          <div className={`h-full ${reportData.telemetry.formatA![key].soc >= 5 && reportData.telemetry.formatA![key].soc <= 95 ? 'bg-teal-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.max(0, reportData.telemetry.formatA![key].soc))}%` }}></div>
                        </div>
                      </div>
                      <TelemetryInput label="Cycle (Today)" value={reportData.telemetry.formatA![key].cycleToday} onChange={v => onUpdateData({ telemetry: { ...reportData.telemetry, formatA: { ...reportData.telemetry.formatA!, [key]: { ...reportData.telemetry.formatA![key], cycleToday: v } } } })} />
                      <TelemetryInput label="Cycle (Month)" value={reportData.telemetry.formatA![key].cycleMonth} onChange={v => onUpdateData({ telemetry: { ...reportData.telemetry, formatA: { ...reportData.telemetry.formatA!, [key]: { ...reportData.telemetry.formatA![key], cycleMonth: v } } } })} />
                      <TelemetryInput label="Cycle (Total)" value={reportData.telemetry.formatA![key].cycleTotal} onChange={v => onUpdateData({ telemetry: { ...reportData.telemetry, formatA: { ...reportData.telemetry.formatA!, [key]: { ...reportData.telemetry.formatA![key], cycleTotal: v } } } })} />
                    </div>
                  </div>
                ))}
              </div>
            ) : reportData.telemetry.formatB ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SOC (%)</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      className="input-dark w-full p-3 rounded-md text-xl font-bold text-teal-400"
                      value={reportData.telemetry.formatB.soc || ''}
                      onChange={e => onUpdateData({ telemetry: { ...reportData.telemetry, formatB: { ...reportData.telemetry.formatB!, soc: parseFloat(e.target.value) || 0 } } })}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 rounded-b-md overflow-hidden">
                      <div className={`h-full ${reportData.telemetry.formatB.soc >= 5 && reportData.telemetry.formatB.soc <= 95 ? 'bg-teal-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.max(0, reportData.telemetry.formatB.soc))}%` }}></div>
                    </div>
                  </div>
                  <TelemetryInput label="Cycle (Today)" value={reportData.telemetry.formatB.todayCycle} onChange={v => onUpdateData({ telemetry: { ...reportData.telemetry, formatB: { ...reportData.telemetry.formatB!, todayCycle: v } } })} />
                  <TelemetryInput label="Cycle (Month)" value={reportData.telemetry.formatB.thisMonthCycle} onChange={v => onUpdateData({ telemetry: { ...reportData.telemetry, formatB: { ...reportData.telemetry.formatB!, thisMonthCycle: v } } })} />
                  <TelemetryInput label="Cycle (Total)" value={reportData.telemetry.formatB.totalCycle} onChange={v => onUpdateData({ telemetry: { ...reportData.telemetry, formatB: { ...reportData.telemetry.formatB!, totalCycle: v } } })} />
                </div>
              </div>
            ) : null}
          </section>

          {/* Section 4: System Availability */}
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 border-l-4 border-violet-400 pl-3">
              <i className="fas fa-heart-pulse text-violet-400"></i>
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">4. System Availability & Judgment</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AvailabilityCard 
                label="BESS Online" 
                value={reportData.availability.bessOnline} 
                onChange={v => onUpdateData({ availability: { ...reportData.availability, bessOnline: v } })} 
                icon="fas fa-server"
              />
              <AvailabilityCard 
                label="PCS Online" 
                value={reportData.availability.pcsOnline} 
                onChange={v => onUpdateData({ availability: { ...reportData.availability, pcsOnline: v } })} 
                icon="fas fa-server"
              />
              <AvailabilityCard 
                label="Transformer" 
                value={reportData.availability.transformerOnline} 
                onChange={v => onUpdateData({ availability: { ...reportData.availability, transformerOnline: v } })} 
                icon="fas fa-server"
              />
              
              <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-halved text-slate-500 text-[11px]"></i>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EMS Status</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center mb-4 min-h-[60px]">
                  <span className={`text-2xl font-black uppercase tracking-wide ${reportData.availability.emsStatus === 'Normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {reportData.availability.emsStatus}
                  </span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => onUpdateData({ availability: { ...reportData.availability, emsStatus: 'Normal' } })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-colors ${reportData.availability.emsStatus === 'Normal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700 border border-transparent'}`}
                  >
                    <i className="fas fa-check-circle mr-1.5"></i> NORMAL
                  </button>
                  <button 
                    onClick={() => onUpdateData({ availability: { ...reportData.availability, emsStatus: 'Abnormal' } })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-colors ${reportData.availability.emsStatus === 'Abnormal' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700 border border-transparent'}`}
                  >
                    <i className="fas fa-triangle-exclamation mr-1.5"></i> ABNORMAL
                  </button>
                </div>
              </div>
            </div>

            {reportData.availability.emsStatus === 'Abnormal' && (
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">+ EMS Note</label>
                <textarea 
                  className="input-dark w-full p-2 rounded-md text-sm" 
                  rows={2}
                  value={reportData.availability.emsNote || ''}
                  onChange={e => onUpdateData({ availability: { ...reportData.availability, emsNote: e.target.value } })}
                  placeholder="Describe EMS abnormality..."
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Operational Judgment</label>
              <select 
                className={`w-full p-3 rounded-md text-sm font-bold border outline-none transition-colors ${
                  reportData.availability.overallJudgment === 'Normal' 
                    ? 'bg-green-900/20 border-green-500/50 text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400' 
                    : 'bg-red-900/20 border-red-500/50 text-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                }`}
                value={reportData.availability.overallJudgment}
                onChange={e => onUpdateData({ availability: { ...reportData.availability, overallJudgment: e.target.value } })}
              >
                <option value="Normal" className="bg-slate-900 text-green-400">NORMAL OPERATION</option>
                <option value="Abnormal" className="bg-slate-900 text-red-400">ABNORMAL OPERATION</option>
              </select>
            </div>
          </section>

          {/* Section 5: Incidents */}
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className={`flex items-center gap-2 mb-4 border-l-4 pl-3 ${reportData.availability.overallJudgment === 'Normal' ? 'border-emerald-400' : 'border-red-400'}`}>
              <i className={`fas ${reportData.availability.overallJudgment === 'Normal' ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-red-400'}`}></i>
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">5. Operation Remarks & Incidents</h2>
            </div>

            {reportData.availability.overallJudgment === 'Normal' ? (
              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex justify-end mb-2">
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-widest">All Systems Nominal</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-1">+ Issue / Remarks</label>
                    <textarea 
                      className="input-dark w-full p-2 rounded-md text-sm border-emerald-500/30 focus:border-emerald-400 focus:shadow-[0_0_0_1px_#34d399]" 
                      rows={2}
                      value={reportData.incidents[0]?.issue || 'N/A'}
                      onChange={e => {
                        const newIncidents = [...reportData.incidents];
                        if (!newIncidents[0]) newIncidents[0] = { issue: '', action: 'N/A', solvedExpectation: 'N/A', status: 'Resolved', collapsed: false };
                        newIncidents[0].issue = e.target.value;
                        onUpdateData({ incidents: newIncidents });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-1">+ Action Taken</label>
                    <textarea 
                      className="input-dark w-full p-2 rounded-md text-sm border-emerald-500/30 focus:border-emerald-400 focus:shadow-[0_0_0_1px_#34d399]" 
                      rows={2}
                      value={reportData.incidents[0]?.action || 'N/A'}
                      onChange={e => {
                        const newIncidents = [...reportData.incidents];
                        if (!newIncidents[0]) newIncidents[0] = { issue: 'N/A', action: '', solvedExpectation: 'N/A', status: 'Resolved', collapsed: false };
                        newIncidents[0].action = e.target.value;
                        onUpdateData({ incidents: newIncidents });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-1">+ Solved Expectation</label>
                    <input 
                      type="text"
                      className="input-dark w-full p-2 rounded-md text-sm border-emerald-500/30 focus:border-emerald-400 focus:shadow-[0_0_0_1px_#34d399]" 
                      value={reportData.incidents[0]?.solvedExpectation || 'N/A'}
                      onChange={e => {
                        const newIncidents = [...reportData.incidents];
                        if (!newIncidents[0]) newIncidents[0] = { issue: 'N/A', action: 'N/A', solvedExpectation: '', status: 'Resolved', collapsed: false };
                        newIncidents[0].solvedExpectation = e.target.value;
                        onUpdateData({ incidents: newIncidents });
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => onUpdateData({ availability: { ...reportData.availability, overallJudgment: 'Normal' } })}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Back to Normal
                  </button>
                  <button 
                    onClick={() => {
                      onUpdateData({ 
                        incidents: [...reportData.incidents, { issue: '', action: '', solvedExpectation: '', status: 'In Progress', collapsed: false }] 
                      })
                    }}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
                  >
                    <i className="fas fa-plus mr-1"></i> Add Case
                  </button>
                </div>

                {reportData.incidents.map((incident, idx) => (
                  <div key={idx} className="bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden">
                    <div 
                      className="bg-slate-800/80 p-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/80 transition-colors"
                      onClick={() => {
                        const newIncidents = [...reportData.incidents];
                        newIncidents[idx].collapsed = !newIncidents[idx].collapsed;
                        onUpdateData({ incidents: newIncidents });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-grip-vertical text-slate-600"></i>
                        <span className="font-bold text-sm">Case {idx + 1}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${incident.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {incident.status}
                        </span>
                        <i className={`fas fa-chevron-${incident.collapsed ? 'down' : 'up'} text-slate-500 ml-2`}></i>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {reportData.incidents.length > 1 && (
                          <button 
                            onClick={() => {
                              const newIncidents = [...reportData.incidents];
                              newIncidents.splice(idx, 1);
                              onUpdateData({ incidents: newIncidents });
                            }}
                            className="w-6 h-6 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {!incident.collapsed && (
                      <div className="p-4 space-y-4 border-t border-slate-700">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const newIncidents = [...reportData.incidents];
                              newIncidents[idx].status = 'In Progress';
                              onUpdateData({ incidents: newIncidents });
                            }}
                            className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${incident.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-transparent'}`}
                          >
                            IN PROGRESS
                          </button>
                          <button 
                            onClick={() => {
                              const newIncidents = [...reportData.incidents];
                              newIncidents[idx].status = 'Resolved';
                              onUpdateData({ incidents: newIncidents });
                            }}
                            className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${incident.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-transparent'}`}
                          >
                            RESOLVED
                          </button>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">+ Issue {idx + 1} (Required)</label>
                          <textarea 
                            className="input-dark w-full p-2 rounded-md text-sm border-red-500/30 focus:border-red-400 focus:shadow-[0_0_0_1px_#ef4444]" 
                            rows={2}
                            value={incident.issue}
                            onChange={e => {
                              const newIncidents = [...reportData.incidents];
                              newIncidents[idx].issue = e.target.value;
                              onUpdateData({ incidents: newIncidents });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">+ Action {idx + 1} (Required)</label>
                          <textarea 
                            className="input-dark w-full p-2 rounded-md text-sm border-red-500/30 focus:border-red-400 focus:shadow-[0_0_0_1px_#ef4444]" 
                            rows={2}
                            value={incident.action}
                            onChange={e => {
                              const newIncidents = [...reportData.incidents];
                              newIncidents[idx].action = e.target.value;
                              onUpdateData({ incidents: newIncidents });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">+ Solved Expectation {idx + 1} (Required)</label>
                          <input 
                            type="datetime-local"
                            className="input-dark w-full p-2 rounded-md text-sm border-red-500/30 focus:border-red-400 focus:shadow-[0_0_0_1px_#ef4444]" 
                            value={incident.solvedExpectation}
                            onChange={e => {
                              const newIncidents = [...reportData.incidents];
                              newIncidents[idx].solvedExpectation = e.target.value;
                              onUpdateData({ incidents: newIncidents });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    onUpdateData({ 
                      incidents: [...reportData.incidents, { issue: '', action: '', solvedExpectation: '', status: 'In Progress', collapsed: false }] 
                    })
                  }}
                  className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/50 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  + Add Another Issue Case
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function FunctionToggle({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`h-[70px] rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all border ${
        active 
          ? 'bg-gradient-to-b from-sky-400 to-sky-500 border-sky-300 text-white shadow-lg shadow-sky-500/20' 
          : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:bg-slate-800'
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider mb-1 text-center px-1">{label}</span>
      <span className={`text-[10px] font-black uppercase ${active ? 'text-sky-100' : 'text-slate-600'}`}>
        {active ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </div>
  );
}

function ManualOpRow({ label, data, onChange }: { label: string, data: any, onChange: (d: any) => void }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border ${data.enabled ? 'bg-slate-800/80 border-slate-600' : 'bg-[#0f172a]/50 border-slate-800 opacity-60'}`}>
      <label className="flex items-center gap-2 cursor-pointer w-48">
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
          checked={data.enabled}
          onChange={e => onChange({ ...data, enabled: e.target.checked })}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</span>
      </label>
      <input 
        type="number" 
        placeholder="MW"
        className="input-dark flex-1 p-2 rounded text-sm"
        value={data.mw}
        onChange={e => onChange({ ...data, mw: e.target.value })}
        disabled={!data.enabled}
      />
      <input 
        type="time" 
        className="input-dark flex-1 p-2 rounded text-sm"
        value={data.time}
        onChange={e => onChange({ ...data, time: e.target.value })}
        disabled={!data.enabled}
      />
    </div>
  );
}

function TelemetryInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input 
        type="text" 
        className="input-dark w-full p-2 rounded-md text-sm text-center"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function AvailabilityCard({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon: string }) {
  const [onlineStr, totalStr] = value.split('/');
  const online = parseInt(onlineStr) || 0;
  const total = parseInt(totalStr) || 0;
  const offline = total - online;
  const pct = total > 0 ? Math.round((online / total) * 100) : 0;
  const isOk = online === total;

  const handleOfflineChange = (delta: number) => {
    const newOffline = Math.max(0, Math.min(total, offline + delta));
    const newOnline = total - newOffline;
    onChange(`${newOnline}/${total}`);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <i className={`${icon} text-slate-500 text-[11px]`}></i>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${isOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {isOk ? 'OK' : 'FAULT'}
        </span>
      </div>
      
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-100 leading-none">{online}</span>
          <span className="text-sm font-bold text-slate-500 leading-none">/{total}</span>
        </div>
        <span className="text-xl font-bold text-emerald-400 leading-none">{pct}%</span>
      </div>
      <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Units Online</div>

      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }}></div>
      </div>

      <div className="flex items-center justify-between bg-slate-800/40 rounded-lg p-2 border border-slate-700/50 mt-auto">
        <span className="text-[10px] text-slate-500 uppercase font-bold ml-2">Offline</span>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOfflineChange(-1)} className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 text-sm transition-colors">-</button>
          <span className="text-sm font-bold w-6 text-center">{offline}</span>
          <button onClick={() => handleOfflineChange(1)} className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 text-sm transition-colors">+</button>
        </div>
      </div>
    </div>
  );
}
