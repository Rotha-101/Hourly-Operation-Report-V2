import React, { useState, useEffect } from 'react';

export default function Layout() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return { hhmm: `${hh}:${mm}`, ss };
  };

  const formatDate = (d: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const { hhmm, ss } = formatTime(time);

  return (
    <header className="h-[88px] flex-shrink-0 w-full bg-gradient-to-b from-[#0c1422] via-[#090f1c] to-[#070c18] border-b border-sky-400/10 relative overflow-hidden flex items-center px-6 justify-between">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(56,189,248,0.045) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'linear-gradient(to right, black, transparent)'
      }}></div>
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-sky-400/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-emerald-400/5 blur-[100px] pointer-events-none"></div>

      {/* Left Section */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-[54px] h-[54px] rounded-[13px] bg-gradient-to-b from-[#0d2035] to-[#081522] border border-sky-400/20 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <span className="text-[16px] font-bold text-sky-400 leading-none">ESS</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent my-1"></div>
          <span className="text-[6.5px] text-sky-400/70 leading-none">BESS</span>
        </div>

        <div className="w-px h-[46px] bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-3 h-px bg-sky-400/50"></div>
            <span className="text-[10px] uppercase text-sky-400 tracking-widest font-semibold">Energy Storage System</span>
          </div>
          <h1 className="text-[20px] font-black text-slate-100 leading-none tracking-tight mb-1">HOURLY OPERATION REPORT</h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Developed by Performance &amp; Analysis Team</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-900/30 border border-sky-400/20">
              <i className="fas fa-microchip text-[8px] text-sky-400"></i>
              <span className="text-[8px] text-sky-400 font-bold tracking-wider">BESS · ICS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section Connector */}
      <div className="hidden xl:flex flex-1 items-center justify-center opacity-20 pointer-events-none px-12">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-400"></div>
        <div className="w-1 h-1 rounded-full bg-sky-400 mx-2"></div>
        <div className="h-px flex-1 bg-gradient-to-r from-sky-400 to-transparent"></div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 relative z-10">
        <StatusCard icon="ping" label="System" value="Healthy" color="emerald" />
        <StatusCard icon="fas fa-shield-halved" label="Link" value="Secure" color="sky" />
        <StatusCard icon="fas fa-server" label="Node" value="Active" color="violet" />
        <StatusCard icon="fas fa-rotate" label="Sync" value="Online" color="teal" />

        <div className="w-[100px] h-[64px] rounded-[10px] bg-green-400/5 border border-green-400/20 flex flex-col justify-center px-3 ml-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </div>
            <span className="text-[8px] uppercase text-green-400/70 font-bold tracking-wider">Live Clock</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[15px] font-bold text-green-400 tabular-nums leading-none">{hhmm}</span>
            <span className="text-[11px] text-green-400/60 tabular-nums leading-none">:{ss}</span>
          </div>
          <span className="text-[8px] text-green-400/60 uppercase tracking-wider mt-0.5">{formatDate(time)}</span>
        </div>
      </div>
    </header>
  );
}

function StatusCard({ icon, label, value, color }: { icon: string, label: string, value: string, color: 'emerald' | 'sky' | 'violet' | 'teal' }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-400/5', border: 'border-emerald-400/20', text: 'text-emerald-400', iconColor: 'text-emerald-400/70' },
    sky: { bg: 'bg-sky-400/5', border: 'border-sky-400/20', text: 'text-sky-400', iconColor: 'text-sky-400/70' },
    violet: { bg: 'bg-violet-400/5', border: 'border-violet-400/20', text: 'text-violet-400', iconColor: 'text-violet-400/70' },
    teal: { bg: 'bg-teal-400/5', border: 'border-teal-400/20', text: 'text-teal-400', iconColor: 'text-teal-400/70' },
  };
  const c = colorMap[color];

  return (
    <div className={`w-[88px] h-[64px] rounded-[10px] ${c.bg} ${c.border} border flex flex-col justify-center px-3`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon === 'ping' ? (
          <div className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.text.replace('text-', 'bg-')} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c.text.replace('text-', 'bg-')}`}></span>
          </div>
        ) : (
          <i className={`${icon} text-[8px] ${c.iconColor}`}></i>
        )}
        <span className="text-[8px] uppercase text-slate-500 font-bold tracking-wider">{label}</span>
      </div>
      <span className={`text-[13px] font-black uppercase ${c.text} leading-none`}>{value}</span>
    </div>
  );
}
