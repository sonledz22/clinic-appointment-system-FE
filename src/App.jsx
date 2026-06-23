import React, { useState } from 'react';
import PatientPortal from './components/PatientPortal';
import DoctorDashboard from './components/DoctorDashboard';
import AdminPanel from './components/AdminPanel';
import { 
  Smartphone, 
  Monitor, 
  Activity, 
  User, 
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

function App() {
  const [currentRole, setCurrentRole] = useState('patient'); // patient | doctor | admin
  const [mobileSimulator, setMobileSimulator] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Main Panel Control Bar */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 py-3.5 px-6 sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and project name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
            <Activity className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight">CarePulse MedSuite</h1>
              <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Mock Core</span>
            </div>
            <p className="text-[10px] text-slate-400">Microservices Clinic Appointment System Frontend</p>
          </div>
        </div>

        {/* Dynamic Role Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setCurrentRole('patient')}
            className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
              currentRole === 'patient' 
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </button>
          
          <button
            onClick={() => setCurrentRole('doctor')}
            className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
              currentRole === 'doctor' 
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
              currentRole === 'admin' 
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </button>
        </div>

        {/* System Architecture Tech Badge */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-lg text-slate-400">
            <Database className="w-3 h-3 text-teal-400" />
            <span>Spring Boot</span>
            <span className="text-slate-700">•</span>
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Keycloak Auth</span>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-start">
        
        {/* Informative Subbar explaining architecture connection */}
        <div className="bg-slate-900/30 border-b border-slate-800/40 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            {currentRole === 'patient' && (
              <>
                <span className="font-semibold text-teal-400">Patient Module:</span>
                <span>• Displays upcoming appointments synchronized with Scheduling DB</span>
                <span>• Step-by-step Booking Flow queries live availabilities from <strong>Doctor Service</strong></span>
                <span>• Records list queries <strong>Patient Service</strong> endpoints</span>
              </>
            )}
            {currentRole === 'doctor' && (
              <>
                <span className="font-semibold text-teal-400">Doctor Module:</span>
                <span>• Schedule availability grid controls slots in <strong>Doctor Service</strong> DB</span>
                <span>• Consultation status updates (Waiting / In-Progress / Completed) emit events via <strong>RabbitMQ</strong></span>
              </>
            )}
            {currentRole === 'admin' && (
              <>
                <span className="font-semibold text-teal-400">Admin Control Tower:</span>
                <span>• Live stat metrics monitor health checks across the cluster gateway</span>
                <span>• Collision Monitor demonstrates distributed lock operations resolving double-booking race conditions</span>
              </>
            )}
          </div>
          
          {currentRole === 'patient' && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px]">Simulation View:</span>
              <button 
                onClick={() => setMobileSimulator(!mobileSimulator)} 
                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                  mobileSimulator 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mobileSimulator ? 'Phone Simulator Frame' : 'Widescreen Web View'}
              </button>
            </div>
          )}
        </div>

        {/* View Switcher Core */}
        <div className="flex-1 py-8 px-4 flex items-center justify-center">
          {currentRole === 'patient' ? (
            mobileSimulator ? (
              /* Phone Device Mockup Container */
              <div className="relative py-12 px-6 bg-slate-900/20 rounded-[50px] border border-slate-800 shadow-2xl flex items-center justify-center">
                {/* Phone ear speaker slot and camera notch mock */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full border border-slate-800/85 z-30 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3 border border-slate-850"></div>
                </div>
                {/* Screen frame and component */}
                <PatientPortal />
                {/* Phone bottom home bar mock */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-slate-700/80 rounded-full z-30"></div>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-slate-900 border border-slate-850 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-teal-400 mb-4 text-center">Patient Portal (Responsiveness Test Grid)</h3>
                <div className="flex justify-center">
                  <PatientPortal />
                </div>
              </div>
            )
          ) : currentRole === 'doctor' ? (
            <DoctorDashboard />
          ) : (
            <AdminPanel />
          )}
        </div>
      </main>

      {/* Footer System Indicator */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <span>© 2026 CarePulse Medical Microservices. Demo sandbox environment.</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-500/70" /> Hexagonal Architecture
            </span>
            <span className="text-slate-800">|</span>
            <span>Tailwind v4 Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
