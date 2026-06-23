import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Server, 
  Flame, 
  Users, 
  Bell, 
  Terminal,
  Cpu
} from 'lucide-react';

const initialLogs = [
  { time: '23:15:02', type: 'info', message: 'Auth Handshake: Keycloak validated session for doctor-service.' },
  { time: '23:15:20', type: 'info', message: 'Cache Sync: Synchronized 14 schedule slots to Redis cache.' },
  { time: '23:18:44', type: 'info', message: 'Notification Sent: SMS dispatch for Appt #APP-998 (Dr. Sarah Jenkins).' },
];

export default function AdminPanel() {
  const [logs, setLogs] = useState(initialLogs);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    todayAppts: 48,
    activeDocs: '12/15',
    pendingNotifs: 3,
    conflictsPrevented: 142
  });

  const runSimulation = () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setSimulationStep(1);
    setSimLogs([]);

    const steps = [
      {
        step: 1,
        log: '⚡ Incoming Traffic: Gateway intercepts 2 concurrent booking requests for Dr. Sarah Jenkins (Slot: June 25, 10:30 AM).',
        delay: 800
      },
      {
        step: 2,
        log: '🧵 Thread A (User: Michael Tran) & Thread B (User: Alice Smith) dispatched to Appointment Service.',
        delay: 1500
      },
      {
        step: 3,
        log: '🔒 Distributed Lock: Initiating Redisson acquireLock("lock:doctor:1:2026-06-25:10:30") on Redis Cluster.',
        delay: 2200
      },
      {
        step: 4,
        log: '✅ Lock Granted: Thread A successfully acquired Redis lock. Thread B lock acquisition blocked, entering retry loop.',
        delay: 3000
      },
      {
        step: 5,
        log: '🗄️ Database Tx: Thread A confirms slot is vacant. Persisting appointment #APP-7712. Emitting AppointmentBookedEvent.',
        delay: 3800
      },
      {
        step: 6,
        log: '🔓 Lock Released: Thread A completes transaction and releases Redis lock.',
        delay: 4500
      },
      {
        step: 7,
        log: '🔄 Lock Retry: Thread B acquires lock, checks doctor availability, database returns status: RESERVED.',
        delay: 5300
      },
      {
        step: 8,
        log: '🛑 Collision Intercepted: Thread B execution aborted. Threw DoubleBookingException. Transaction rolled back safely.',
        delay: 6000
      },
      {
        step: 9,
        log: '⚠️ Response Dispatch: Gateway returns 201 Created to Thread A, and 409 Conflict (Slot occupied) to Thread B.',
        delay: 6800
      }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setSimulationStep(s.step);
        setSimLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: s.log }]);
        
        // Final step actions
        if (s.step === 9) {
          setSimulationRunning(false);
          setStats(prev => ({
            ...prev,
            todayAppts: prev.todayAppts + 1,
            conflictsPrevented: prev.conflictsPrevented + 1
          }));
          
          setLogs(prev => [
            { time: new Date().toLocaleTimeString(), type: 'warning', message: 'Double-Booking Attempt Blocked: Lock conflict on Doctor 1 Slot 10:30 AM resolved by Redisson lock.' },
            ...prev
          ]);
        }
      }, s.delay);
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fadeIn text-slate-100">
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              System Admin
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">Appointment Service Control</h1>
          <p className="text-slate-400 text-xs mt-0.5">Microservice orchestration panel & double-booking prevention control tower</p>
        </div>

        <button 
          onClick={() => {
            setStats(prev => ({ ...prev, todayAppts: 48, conflictsPrevented: 142 }));
            setLogs(initialLogs);
            setSimLogs([]);
            setSimulationStep(0);
          }}
          className="bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-405 text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 self-start transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Monitors
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Appointments Today</span>
            <span className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+12% hr</span>
          </div>
          <p className="text-2xl font-bold mt-2 text-white">{stats.todayAppts}</p>
          <p className="text-[10px] text-slate-500 mt-1">Total active bookings registered</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Doctor Schedules</span>
            <span className="text-teal-400 text-[10px] font-bold bg-teal-500/10 px-1.5 py-0.5 rounded">Sync On</span>
          </div>
          <p className="text-2xl font-bold mt-2 text-white">{stats.activeDocs}</p>
          <p className="text-[10px] text-slate-500 mt-1">Physicians accepting appointments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Notifications</span>
            <span className="text-amber-400 text-[10px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">RabbitMQ</span>
          </div>
          <p className="text-2xl font-bold mt-2 text-white">{stats.pendingNotifs}</p>
          <p className="text-[10px] text-slate-500 mt-1">SMS & email templates queued</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conflicts Prevented</span>
            <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded">Redisson Lock</span>
          </div>
          <p className="text-2xl font-bold mt-2 text-white">{stats.conflictsPrevented}</p>
          <p className="text-[10px] text-slate-500 mt-1">Race conditions successfully isolated</p>
        </div>
      </div>

      {/* Center Layout: Simulator vs Service Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* DOUBLE-BOOKING SIMULATOR PANEL (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-teal-400" />
                Double-Booking Collision Monitor
              </h2>
              <p className="text-[11px] text-slate-500">
                Simulate two users submitting bookings simultaneously to test Redisson distributed locks.
              </p>
            </div>
            
            <button
              onClick={runSimulation}
              disabled={simulationRunning}
              className={`text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
                simulationRunning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-md shadow-teal-500/10'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${simulationRunning ? 'animate-bounce' : ''}`} />
              <span>Simulate Race Condition</span>
            </button>
          </div>

          {/* Interactive Simulation Graphic */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex-1 flex flex-col justify-center min-h-[300px]">
            {simulationStep === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h3 className="text-xs font-bold text-slate-400">Locking Monitor Standby</h3>
                  <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto mt-1 leading-relaxed">
                    Click "Simulate Race Condition" to trigger two simultaneous booking requests and inspect database transaction locks.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Lock Representation */}
                <div className="flex justify-between items-center px-4">
                  {/* Thread A (User Michael) */}
                  <div className={`p-3 rounded-xl border text-center transition-all ${
                    simulationStep >= 4 ? 'bg-teal-950/20 border-teal-500/40 text-teal-400' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <span className="text-[9px] block font-semibold text-slate-500 uppercase">Thread A</span>
                    <span className="text-xs font-bold block">Michael Tran</span>
                    <span className="text-[9px] font-semibold text-teal-400 mt-1 block">Request 1 (10:30 AM)</span>
                  </div>

                  {/* Lock Center */}
                  <div className="flex flex-col items-center gap-1.5 px-4 flex-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Distributed Key Lock</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                      simulationStep >= 4 && simulationStep < 6
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {simulationStep >= 4 && simulationStep < 6 ? 'LOCKED' : 'FREE'}
                    </div>
                    <div className="h-0.5 w-full bg-slate-850 relative overflow-hidden">
                      <div className={`h-full bg-teal-500 transition-all duration-700 ${
                        simulationStep === 1 ? 'w-1/4' : 
                        simulationStep === 2 ? 'w-1/2' : 
                        simulationStep === 4 ? 'w-3/4' : 
                        simulationStep >= 6 ? 'w-full' : 'w-0'
                      }`}></div>
                    </div>
                  </div>

                  {/* Thread B (User Alice) */}
                  <div className={`p-3 rounded-xl border text-center transition-all ${
                    simulationStep >= 8 ? 'bg-red-950/20 border-red-500/40 text-red-400' : 
                    simulationStep >= 4 ? 'bg-slate-900 border-slate-800 opacity-50' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <span className="text-[9px] block font-semibold text-slate-500 uppercase">Thread B</span>
                    <span className="text-xs font-bold block">Alice Smith</span>
                    <span className="text-[9px] font-semibold text-red-400 mt-1 block">Request 2 (10:30 AM)</span>
                  </div>
                </div>

                {/* Simulation Logs Output Terminal */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] space-y-1.5 max-h-[160px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 text-slate-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Redisson & Hibernate Log Monitor</span>
                  </div>
                  {simLogs.map((l, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-600">[{l.time}]</span>
                      <span className={
                        l.text.includes('✅') || l.text.includes('Lock Released') ? 'text-teal-400' :
                        l.text.includes('🛑') || l.text.includes('Conflict') ? 'text-red-400' :
                        'text-slate-300'
                      }>{l.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MICROSERVICES HEALTH & SYSTEM LOGS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Microservices Health Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Server className="w-4.5 h-4.5 text-teal-400" />
              Microservices Cluster
            </h2>
            
            <div className="space-y-3">
              {[
                { name: 'API Gateway', status: 'Online', latency: '12ms', color: 'bg-emerald-500' },
                { name: 'Patient Service', status: 'Online', latency: '24ms', color: 'bg-emerald-500' },
                { name: 'Doctor Service', status: 'Online', latency: '18ms', color: 'bg-emerald-500' },
                { name: 'Appointment Service', status: 'Online', latency: '35ms', color: 'bg-emerald-500' },
                { name: 'Notification Service', status: 'Online', latency: '40ms', color: 'bg-emerald-500' },
                { name: 'Redis Cache (Redisson Lock)', status: 'Online', latency: '2ms', color: 'bg-emerald-500' },
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svc.color}`}></div>
                    <span className="text-xs font-bold text-slate-200">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                    <span>{svc.latency}</span>
                    <span className="text-slate-700">|</span>
                    <span className="text-emerald-400 uppercase">{svc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Audit Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-teal-400" />
                Audit Logs
              </h2>
              <span className="text-[9px] uppercase font-bold text-slate-500">Live Stream</span>
            </div>

            <div className="space-y-3 max-h-[180px] overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className={log.type === 'warning' ? 'text-red-400' : 'text-teal-400'}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-slate-500">{log.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
