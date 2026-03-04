import React, { useRef, useEffect, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { AppState, ReportData, ProjectType } from '../types';
import { PROJECTS } from '../constants';

interface LivePreviewProps {
  state: AppState;
  reportData: ReportData | null;
}

export default function LivePreview({ state, reportData }: LivePreviewProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setIsManualEdit(false);
  }, [state.activeProjectId, state.hourInterval]);

  useEffect(() => {
    if (!isManualEdit && paperRef.current && reportData && state.activeProjectId) {
      const project = PROJECTS.find(p => p.id === state.activeProjectId);
      if (project) {
        const text = buildReportText(state, reportData, project);
        paperRef.current.innerText = text;
      }
    }
  }, [state, reportData, isManualEdit]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    paperRef.current?.focus();
  };

  const handleCopy = async () => {
    if (!paperRef.current) return;
    try {
      await navigator.clipboard.writeText(paperRef.current.innerText);
      showToast('Report copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy text', 'error');
    }
  };

  const handlePngExport = async () => {
    if (!wrapperRef.current || !state.activeProjectName) return;
    try {
      setIsExporting(true);
      // Wait for state update to apply 'exporting' class
      await new Promise(r => setTimeout(r, 50)); 
      
      const dataUrl = await htmlToImage.toPng(wrapperRef.current, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      
      const link = document.createElement('a');
      const dateStr = state.reportDate;
      const timeStr = state.hourInterval.replace(':', '-');
      link.download = `${state.activeProjectName}_${dateStr}_${timeStr}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Exported to PNG successfully!', 'success');
    } catch (err) {
      showToast('Failed to export PNG', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    setIsManualEdit(false);
    if (paperRef.current && reportData && state.activeProjectId) {
      const project = PROJECTS.find(p => p.id === state.activeProjectId);
      if (project) {
        const text = buildReportText(state, reportData, project);
        paperRef.current.innerText = text;
      }
    }
    showToast('Report synced with form data', 'success');
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatDateTime = (dtStr: string) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const buildReportText = (st: AppState, data: ReportData, proj: any) => {
    let out = `Name: ${proj.name}\n`;
    out += `Hourly Report\n`;
    out += `Date: ${formatDateDisplay(st.reportDate)}\n`;
    out += `Time: ${st.hourInterval}\n`;
    out += `Shift: ${st.shift}\n`;
    out += `OP: ${st.operatorNames.join(', ')}\n`;
    out += `----------------------------\n\n`;

    out += `BESS Function:\n`;
    if (proj.type === ProjectType.FORMAT_A) {
      out += `-Peak Shifting: ${data.bessFunction.peakShifting ? 'Enable' : 'Disable'}\n`;
      out += `-PFC: ${data.bessFunction.pfc ? 'Enable' : 'Disable'}\n`;
      out += `-QU: ${data.bessFunction.qu ? 'Enable' : 'Disable'}\n`;
      out += `-Tie Line: ${data.bessFunction.tieLine ? 'Enable' : 'Disable'}\n\n`;

      out += `BESS Data:\n`;
      const fa = data.telemetry.formatA;
      if (fa) {
        out += `-SPPC 1: SOC = ${fa.sppc1.soc}% (5%-95%), Cycle = Today: ${fa.sppc1.cycleToday}/This Month: ${fa.sppc1.cycleMonth}/Total: ${fa.sppc1.cycleTotal}\n`;
        out += `-SPPC 2: SOC = ${fa.sppc2.soc}% (5%-95%), Cycle = Today: ${fa.sppc2.cycleToday}/This Month: ${fa.sppc2.cycleMonth}/Total: ${fa.sppc2.cycleTotal}\n`;
        out += `-SPPC 3: SOC = ${fa.sppc3.soc}% (5%-95%), Cycle = Today: ${fa.sppc3.cycleToday}/This Month: ${fa.sppc3.cycleMonth}/Total: ${fa.sppc3.cycleTotal}\n\n`;
      }
    } else {
      out += `-PV Smoothing: ${data.bessFunction.pvSmoothing ? 'Enable' : 'Disable'}\n`;
      out += `-PFC: ${data.bessFunction.pfc ? 'Enable' : 'Disable'}\n`;
      out += `-QU: ${data.bessFunction.qu ? 'Enable' : 'Disable'}\n`;
      out += `-Peak Shifting: ${data.bessFunction.peakShifting ? 'Enable' : 'Disable'}\n`;
      out += `Manual Charge: ${data.bessFunction.manualCharge.enabled ? `${data.bessFunction.manualCharge.mw} MW (${data.bessFunction.manualCharge.time})` : 'N/A'}\n`;
      out += `Manual Discharge: ${data.bessFunction.manualDischarge.enabled ? `${data.bessFunction.manualDischarge.mw} MW (${data.bessFunction.manualDischarge.time})` : 'N/A'}\n\n`;

      out += `BESS Data:\n`;
      const fb = data.telemetry.formatB;
      if (fb) {
        out += `-SOC = ${fb.soc}% (5%-95%)\n`;
        out += `-Total Cycle = ${fb.totalCycle}\n`;
        out += `-This Month Cycle = ${fb.thisMonthCycle}\n`;
        out += `-Today Cycle = ${fb.todayCycle}\n\n`;
      }
    }

    out += `System Availability:\n`;
    out += `-BESS Online: ${data.availability.bessOnline}\n`;
    out += `-PCS Online: ${data.availability.pcsOnline}\n`;
    out += `-Transformer Online: ${data.availability.transformerOnline}\n`;
    out += `-EMS Status: ${data.availability.emsStatus}\n`;
    if (data.availability.emsStatus === 'Abnormal' && data.availability.emsNote) {
      out += `  +Note: ${data.availability.emsNote}\n`;
    }
    out += `\n`;

    out += `Overall Judgment: ${data.availability.overallJudgment}\n`;
    
    if (data.availability.overallJudgment === 'Normal') {
      const inc = data.incidents[0];
      out += ` +Issue: ${inc?.issue || 'N/A'}\n`;
      out += ` +Action: ${inc?.action || 'N/A'}\n`;
      out += ` +Solved Expectation: ${inc?.solvedExpectation || 'N/A'}\n`;
    } else {
      data.incidents.forEach((inc, idx) => {
        out += `Case ${idx + 1} [${inc.status}]\n`;
        out += ` +Issue: ${inc.issue || 'N/A'}\n`;
        out += ` +Action: ${inc.action || 'N/A'}\n`;
        out += ` +Solved Expectation: ${formatDateTime(inc.solvedExpectation)}\n\n`;
      });
    }

    return out;
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-bolt text-sky-400"></i> Report Live Output
          </h3>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${isManualEdit ? 'text-amber-400' : 'text-sky-400'}`}>
            {isManualEdit ? 'Manual Edit Mode (Auto-Sync Paused)' : 'Dynamic Formatting Active'}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700" title="Sync with Form Data">
            <i className="fas fa-sync-alt"></i> Sync
          </button>
          <button onClick={handleCopy} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700">
            <i className="fas fa-copy"></i> Copy Text
          </button>
          <button onClick={handlePngExport} className="px-3 py-1.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-sky-500/30">
            <i className="fas fa-image"></i> PNG
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 border-b border-slate-800 bg-[#0f172a] flex items-center px-4 gap-2 shrink-0 overflow-x-auto hide-scrollbar">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mr-2">Format</span>
        
        <button onMouseDown={e => { e.preventDefault(); handleFormat('bold'); }} className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors font-serif font-bold">B</button>
        <button onMouseDown={e => { e.preventDefault(); handleFormat('italic'); }} className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors font-serif italic">I</button>
        <button onMouseDown={e => { e.preventDefault(); handleFormat('underline'); }} className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors underline">U</button>
        
        <div className="w-px h-4 bg-slate-700 mx-1"></div>
        
        <button onMouseDown={e => { e.preventDefault(); handleFormat('insertHorizontalRule'); }} className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors">
          <i className="fas fa-bars"></i>
        </button>
        
        <div className="w-px h-4 bg-slate-700 mx-1"></div>
        
        <select 
          onChange={e => { handleFormat('fontSize', e.target.value); e.target.value = ""; }}
          className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer hover:bg-slate-700 rounded px-1 py-1"
          defaultValue=""
        >
          <option value="" disabled>T↑ Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <div className="w-px h-4 bg-slate-700 mx-1"></div>

        <button onMouseDown={e => { e.preventDefault(); handleFormat('removeFormat'); }} className="w-7 h-7 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors">
          <i className="fas fa-remove-format"></i>
        </button>

        <div className="flex-1"></div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Select text → apply format</span>
      </div>

      {/* Paper Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#111827]">
        <div 
          ref={wrapperRef}
          className={`bg-white rounded shadow-lg mx-auto w-full max-w-[800px] min-h-[800px] p-10 flex flex-col ${isExporting ? 'exporting' : ''}`}
        >
          <div 
            ref={paperRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={() => setIsManualEdit(true)}
            className="flex-1 font-mono text-[13px] text-black leading-[1.8] outline-none whitespace-pre-wrap break-words"
          >
            {/* Content injected via ref */}
          </div>
          
          {/* Signature Block */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col items-end text-right">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Authenticated via Control Bus</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Digital OP Signature Block</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Node: {state.groupName || 'UNKNOWN'} – EMS-X1</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`absolute bottom-4 right-4 px-4 py-2 rounded shadow-lg flex items-center gap-2 text-sm font-bold animate-in slide-in-from-bottom-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
