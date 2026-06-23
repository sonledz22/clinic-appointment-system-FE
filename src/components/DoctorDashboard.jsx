import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Activity, 
  Sliders, 
  UserCheck, 
  CalendarRange,
  Users,
  Eye,
  FileText
} from 'lucide-react';

const initialPatients = [
  { id: '1', name: 'Michael Tran', time: '09:00 AM', status: 'Completed', symptoms: 'Mild headache for 3 days, chest stiffness', age: 34, gender: 'Male', ticket: '#A21-P' },
  { id: '2', name: 'Jenny Nguyen', time: '10:30 AM', status: 'In-Progress', symptoms: 'Follow-up for eczema treatment, dry red patches on forearm', age: 28, gender: 'Female', ticket: '#A29-P' },
  { id: '3', name: 'Robert Chen', time: '11:00 AM', status: 'Waiting', symptoms: 'Asthma inhaler refill and checkup', age: 45, gender: 'Male', ticket: '#A30-P' },
  { id: '4', name: 'Amira Patel', time: '02:00 PM', status: 'Waiting', symptoms: 'Sore throat and persistent low-grade fever', age: 10, gender: 'Female', ticket: '#A31-P' },
  { id: '5', name: 'David Miller', time: '03:30 PM', status: 'Waiting', symptoms: 'Sports injury: swelling in left ankle', age: 19, gender: 'Male', ticket: '#A34-P' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Hourly schedule structure for the grid
const initialScheduleSlots = {
  'Monday': [
    { time: '09:00 AM', state: 'Booked', patient: 'Michael Tran' },
    { time: '10:00 AM', state: 'Available' },
    { time: '11:00 AM', state: 'Booked', patient: 'Robert Chen' },
    { time: '12:00 PM', state: 'Blocked', label: 'Lunch Break' },
    { time: '01:00 PM', state: 'Available' },
    { time: '02:00 PM', state: 'Available' },
    { time: '03:00 PM', state: 'Available' },
    { time: '04:00 PM', state: 'Blocked', label: 'Admin Work' }
  ],
  'Tuesday': [
    { time: '09:00 AM', state: 'Available' },
    { time: '10:00 AM', state: 'Available' },
    { time: '11:00 AM', state: 'Available' },
    { time: '12:00 PM', state: 'Blocked', label: 'Lunch Break' },
    { time: '01:00 PM', state: 'Booked', patient: 'Jenny Nguyen' },
    { time: '02:00 PM', state: 'Booked', patient: 'Amira Patel' },
    { time: '03:00 PM', state: 'Available' },
    { time: '04:00 PM', state: 'Available' }
  ],
  'Wednesday': [
    { time: '09:00 AM', state: 'Available' },
    { time: '10:00 AM', state: 'Blocked', label: 'Hospital Rounds' },
    { time: '11:00 AM', state: 'Blocked', label: 'Hospital Rounds' },
    { time: '12:00 PM', state: 'Blocked', label: 'Lunch Break' },
    { time: '01:00 PM', state: 'Available' },
    { time: '02:00 PM', state: 'Available' },
    { time: '03:00 PM', state: 'Booked', patient: 'David Miller' },
    { time: '04:00 PM', state: 'Available' }
  ],
  'Thursday': [
    { time: '09:00 AM', state: 'Available' },
    { time: '10:00 AM', state: 'Available' },
    { time: '11:00 AM', state: 'Available' },
    { time: '12:00 PM', state: 'Blocked', label: 'Lunch Break' },
    { time: '01:00 PM', state: 'Available' },
    { time: '02:00 PM', state: 'Available' },
    { time: '03:00 PM', state: 'Available' },
    { time: '04:00 PM', state: 'Available' }
  ],
  'Friday': [
    { time: '09:00 AM', state: 'Available' },
    { time: '10:00 AM', state: 'Available' },
    { time: '11:00 AM', state: 'Available' },
    { time: '12:00 PM', state: 'Blocked', label: 'Lunch Break' },
    { time: '01:00 PM', state: 'Available' },
    { time: '02:00 PM', state: 'Blocked', label: 'Clinic Maintenance' },
    { time: '03:00 PM', state: 'Blocked', label: 'Clinic Maintenance' },
    { time: '04:00 PM', state: 'Available' }
  ]
};

export default function DoctorDashboard() {
  const [patients, setPatients] = useState(initialPatients);
  const [scheduleSlots, setScheduleSlots] = useState(initialScheduleSlots);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('05:00 PM');
  const [activePatient, setActivePatient] = useState(null);

  // Status handlers
  const updateStatus = (patientId, newStatus) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
    if (activePatient && activePatient.id === patientId) {
      setActivePatient(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Toggle slot state
  const handleSlotClick = (day, index) => {
    const daySlots = [...scheduleSlots[day]];
    const clickedSlot = daySlots[index];

    if (clickedSlot.state === 'Booked') {
      // Find booked patient
      const foundPatient = patients.find(p => p.name === clickedSlot.patient);
      if (foundPatient) {
        setActivePatient(foundPatient);
      } else {
        alert(`Booked by ${clickedSlot.patient}. Consult schedule detail.`);
      }
      return;
    }

    // Toggle between Available and Blocked
    if (clickedSlot.state === 'Available') {
      clickedSlot.state = 'Blocked';
      clickedSlot.label = 'Manually Blocked';
    } else if (clickedSlot.state === 'Blocked') {
      clickedSlot.state = 'Available';
      delete clickedSlot.label;
    }

    setScheduleSlots({
      ...scheduleSlots,
      [day]: daySlots
    });
  };

  // Calculate statistics
  const totalWaiting = patients.filter(p => p.status === 'Waiting').length;
  const totalInProgress = patients.filter(p => p.status === 'In-Progress').length;
  const totalCompleted = patients.filter(p => p.status === 'Completed').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fadeIn text-slate-100">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Doctor Service
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></div>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">Dr. Sarah Jenkins</h1>
          <p className="text-slate-400 text-xs mt-0.5">Cardiology Specialist • ID: DOC-4991 • General Schedule Dashboard</p>
        </div>

        {/* Schedule Working Hours Setting Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-300">Working Hours:</span>
          </div>
          <div className="flex gap-2">
            <select 
              value={workingHoursStart}
              onChange={(e) => setWorkingHoursStart(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-1.5 focus:outline-none focus:border-teal-500"
            >
              <option>08:00 AM</option>
              <option>09:00 AM</option>
            </select>
            <span className="text-slate-500 text-xs self-center">to</span>
            <select 
              value={workingHoursEnd}
              onChange={(e) => setWorkingHoursEnd(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-1.5 focus:outline-none focus:border-teal-500"
            >
              <option>04:00 PM</option>
              <option>05:00 PM</option>
              <option>06:00 PM</option>
            </select>
          </div>
          <span className="text-[10px] text-teal-400 font-bold bg-teal-500/5 px-2 py-1 rounded border border-teal-500/10 font-sans">Auto-Synced</span>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: TODAY'S CONSULTATION QUEUE (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-teal-400" />
                  Today's Consultation Queue
                </h2>
                <p className="text-[11px] text-slate-500">Live queue management for patient registration</p>
              </div>
              <span className="text-[10px] bg-slate-950 border border-slate-855 px-2.5 py-1 rounded-lg text-slate-400 font-semibold">
                June 22, 2026
              </span>
            </div>

            {/* Queue statistics cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Waiting</span>
                <p className="text-lg font-bold text-amber-400">{totalWaiting}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center animate-pulse">
                <span className="text-[9px] text-slate-500 font-bold uppercase">In-Progress</span>
                <p className="text-lg font-bold text-teal-400">{totalInProgress}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Completed</span>
                <p className="text-lg font-bold text-slate-400">{totalCompleted}</p>
              </div>
            </div>

            {/* Patients list */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {patients.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setActivePatient(p)}
                  className={`border rounded-xl p-3.5 transition-all cursor-pointer relative ${
                    activePatient?.id === p.id 
                      ? 'bg-slate-850/80 border-teal-500/60 shadow-lg shadow-teal-500/5' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                        <span className="text-[9px] text-slate-500 font-semibold">{p.gender}, {p.age}y</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-teal-500/70" />
                        <span>Scheduled: {p.time}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-amber-500/90 font-bold">{p.ticket}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'Completed' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                      p.status === 'In-Progress' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Context controls shown if active */}
                  {activePatient?.id === p.id && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {p.status === 'Waiting' && (
                        <button 
                          onClick={() => updateStatus(p.id, 'In-Progress')}
                          className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Start Consultation</span>
                        </button>
                      )}
                      {p.status === 'In-Progress' && (
                        <button 
                          onClick={() => updateStatus(p.id, 'Completed')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Complete Consultation</span>
                        </button>
                      )}
                      <button 
                        onClick={() => alert(`Accessing Electronic Health Records for patient: ${p.name}`)}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Medical File</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Patient Details panel */}
          {activePatient && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Patient Case Detail</h3>
                <button onClick={() => setActivePatient(null)} className="text-xs text-slate-500 hover:text-slate-300">Close</button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">FullName:</span>
                  <span className="text-white font-semibold">{activePatient.name} ({activePatient.gender}, {activePatient.age}y)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Queue Position:</span>
                  <span className="text-amber-400 font-mono font-bold">{activePatient.ticket}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">Reason for Visit & Symptoms:</span>
                  <p className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-300 leading-relaxed text-[11px]">
                    {activePatient.symptoms}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SCHEDULE MANAGEMENT (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarRange className="w-4.5 h-4.5 text-teal-400" />
                Schedule Availability Manager
              </h2>
              <p className="text-[11px] text-slate-500">Click a slot to toggle between Blocked and Available status.</p>
            </div>
            <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
              {daysOfWeek.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                    selectedDay === d 
                      ? 'bg-teal-500 text-slate-950 shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-2">
              <span>Time Slot Window</span>
              <span>Availability State</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheduleSlots[selectedDay].map((slot, index) => {
                const isBooked = slot.state === 'Booked';
                const isBlocked = slot.state === 'Blocked';
                
                return (
                  <div
                    key={index}
                    onClick={() => handleSlotClick(selectedDay, index)}
                    className={`border p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                      isBooked 
                        ? 'bg-teal-500/10 border-teal-500/30 hover:border-teal-500/50' 
                        : isBlocked
                          ? 'bg-slate-950 border-slate-850 opacity-60 hover:opacity-85'
                          : 'bg-slate-950 border-slate-800 hover:border-teal-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className={`w-4.5 h-4.5 ${isBooked ? 'text-teal-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{slot.time}</span>
                        {isBooked && (
                          <span className="text-[10px] text-teal-400 font-semibold">Booked: {slot.patient}</span>
                        )}
                        {isBlocked && (
                          <span className="text-[10px] text-slate-500 font-medium italic">{slot.label}</span>
                        )}
                        {!isBooked && !isBlocked && (
                          <span className="text-[10px] text-slate-500">Unreserved Slot</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isBooked ? (
                        <div className="flex items-center gap-1 bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20 text-[9px] font-bold">
                          <Eye className="w-3 h-3" /> View Detail
                        </div>
                      ) : isBlocked ? (
                        <div className="text-slate-600 p-1 bg-slate-900 border border-slate-850 rounded">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="text-teal-400 p-1 bg-teal-500/5 border border-teal-500/20 rounded">
                          <Unlock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Schedule Actions */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-[10px] text-slate-500 font-sans">
              * Schedule changes are immediately pushed to the Scheduling Service to prevent patient double-bookings.
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const updated = scheduleSlots[selectedDay].map(s => s.state === 'Available' ? { ...s, state: 'Blocked', label: 'Admin Block' } : s);
                  setScheduleSlots({ ...scheduleSlots, [selectedDay]: updated });
                }}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-350 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all"
              >
                Block All Slots
              </button>
              <button 
                onClick={() => {
                  const updated = scheduleSlots[selectedDay].map(s => s.state === 'Blocked' && s.label !== 'Lunch Break' ? { ...s, state: 'Available' } : s);
                  setScheduleSlots({ ...scheduleSlots, [selectedDay]: updated });
                }}
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all"
              >
                Release Blocked
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
