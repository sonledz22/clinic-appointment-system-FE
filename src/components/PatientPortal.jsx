import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  FileText, 
  MapPin, 
  Star,
  Activity,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

const mockDoctors = [
  { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', rating: 4.9, reviews: 124, exp: '12 years', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300' },
  { id: 2, name: 'Dr. Alexander Patel', specialty: 'Pediatrics', rating: 4.8, reviews: 98, exp: '8 years', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300' },
  { id: 3, name: 'Dr. Elena Rostova', specialty: 'Dermatology', rating: 4.7, reviews: 145, exp: '10 years', image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300' },
  { id: 4, name: 'Dr. Marcus Vance', specialty: 'General Medicine', rating: 4.9, reviews: 210, exp: '15 years', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' },
];

const mockHistory = [
  { id: 'REC-2026-981', date: '2026-05-14', doctor: 'Dr. Marcus Vance', specialty: 'General Medicine', diagnosis: 'Mild Hypertension', prescription: 'Lisinopril 10mg (Once daily)', notes: 'Blood pressure checked at 135/85. Patient advised to reduce sodium intake and return for follow-up in 3 months.' },
  { id: 'REC-2026-432', date: '2026-03-22', doctor: 'Dr. Elena Rostova', specialty: 'Dermatology', diagnosis: 'Eczema Flare-up', prescription: 'Hydrocortisone Cream 1% (Apply bid)', notes: 'Dry red patches on forearms. Trigger identified as synthetic laundry detergent. Switching to hypoallergenic detergent recommended.' },
  { id: 'REC-2025-119', date: '2025-12-10', doctor: 'Dr. Sarah Jenkins', specialty: 'Cardiology', diagnosis: 'Normal Sinus Rhythm', prescription: 'None', notes: 'Routine ECG performed. Heart rate stable. Clear cardiovascular profile. Next checkup in 12 months.' },
];

const initialAppointments = [
  { id: 'APP-998', doctor: 'Dr. Sarah Jenkins', specialty: 'Cardiology', date: '2026-06-25', time: '10:30 AM', status: 'Confirmed', room: 'Clinic Room 3B' },
  { id: 'APP-1002', doctor: 'Dr. Marcus Vance', specialty: 'General Medicine', date: '2026-07-02', time: '02:00 PM', status: 'Pending Approval', room: 'Clinic Room 1A' }
];

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState('home'); // home | book | history
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Doctor, 2: Select Date/Time, 3: Symptom & Confirm
  const [appointments, setAppointments] = useState(initialAppointments);
  
  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-06-26');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = ['All', 'General Medicine', 'Cardiology', 'Pediatrics', 'Dermatology'];

  const filteredDoctors = mockDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'
  ];

  const handleBookAppointment = (e) => {
    e.preventDefault();
    const newApp = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      time: selectedTime,
      status: 'Confirmed',
      room: selectedDoctor.id === 1 ? 'Clinic Room 3B' : selectedDoctor.id === 2 ? 'Clinic Room 2A' : selectedDoctor.id === 3 ? 'Clinic Room 1C' : 'Clinic Room 1A'
    };
    
    setAppointments([newApp, ...appointments]);
    setBookingStep(4); // Success step
  };

  const resetBooking = () => {
    setSelectedDoctor(null);
    setSelectedTime('');
    setSymptoms('');
    setBookingStep(1);
    setActiveTab('home');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-950 min-h-[750px] shadow-2xl rounded-3xl overflow-hidden border border-slate-800 flex flex-col">
      {/* Mobile Screen Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">CarePulse</h1>
            <p className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">Patient Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></div>
          <span className="text-xs text-slate-400 font-medium">Sync Active</span>
        </div>
      </div>

      {/* Main Screen Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Welcoming Card */}
            <div className="bg-gradient-to-br from-teal-900/40 via-teal-950/20 to-slate-900 p-5 rounded-2xl border border-teal-500/20">
              <span className="text-teal-400 text-xs font-semibold px-2.5 py-1 bg-teal-500/10 rounded-full border border-teal-500/10">Welcome Back</span>
              <h2 className="text-xl font-bold text-white mt-2">Hello, Michael Tran</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Select a service below to schedule your medical consultations or view reports.</p>
              
              <button 
                onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                className="mt-4 w-full bg-teal-500 hover:bg-teal-600 active:scale-98 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/15"
              >
                <span>Book New Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Upcoming Appointments section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Upcoming Visits</h3>
                <span className="text-xs text-teal-400 font-medium">{appointments.length} Scheduled</span>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <CalendarIcon className="w-8 h-8 text-slate-655 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No appointments scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((app) => (
                    <div key={app.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                            <User className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{app.doctor}</h4>
                            <p className="text-[10px] text-slate-400">{app.specialty} • {app.room}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'Confirmed' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-teal-500/70" />
                          <span>{app.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-500/70" />
                          <span>{app.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions grid */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Services</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-xl text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors">Find a Specialist</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Book via medical departments</p>
                </button>

                <button 
                  onClick={() => setActiveTab('history')}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-xl text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Medical Records</h4>
                  <p className="text-[10px] text-slate-500 mt-1">View lab results & history</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOK APPOINTMENT FLOW */}
        {activeTab === 'book' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Step Indicator Header */}
            {bookingStep <= 3 && (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <button 
                  onClick={() => {
                    if (bookingStep > 1) setBookingStep(bookingStep - 1);
                    else setActiveTab('home');
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  <div className={`h-1.5 w-6 rounded-full transition-all duration-300 ${bookingStep >= 1 ? 'bg-teal-400' : 'bg-slate-800'}`}></div>
                  <div className={`h-1.5 w-6 rounded-full transition-all duration-300 ${bookingStep >= 2 ? 'bg-teal-400' : 'bg-slate-800'}`}></div>
                  <div className={`h-1.5 w-6 rounded-full transition-all duration-300 ${bookingStep >= 3 ? 'bg-teal-400' : 'bg-slate-800'}`}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Step {bookingStep}/3</span>
              </div>
            )}

            {/* STEP 1: Select Specialty / Doctor */}
            {bookingStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-bold text-white">Find a Doctor</h2>
                  <p className="text-xs text-slate-400">Select a physician or search by clinic specialty</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-550" />
                  <input 
                    type="text" 
                    placeholder="Search doctor or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Specialty Pill Filter */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {specialties.map(spec => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`text-[10px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-full border transition-all ${
                        selectedSpecialty === spec 
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>

                {/* Doctor List */}
                <div className="space-y-3">
                  {filteredDoctors.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setBookingStep(2);
                      }}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 rounded-xl p-3 flex gap-3 cursor-pointer transition-all group"
                    >
                      <img 
                        src={doc.image} 
                        alt={doc.name} 
                        className="w-16 h-16 rounded-lg object-cover border border-slate-850"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors truncate">{doc.name}</h4>
                            <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{doc.rating}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-teal-400 font-medium">{doc.specialty}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Exp: {doc.exp}</p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                          <span>{doc.reviews} reviews</span>
                          <span className="text-teal-400 flex items-center gap-0.5 font-semibold group-hover:translate-x-0.5 transition-transform">
                            Select <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-xs">No doctors found matching search.</div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Interactive Calendar & Availability */}
            {bookingStep === 2 && selectedDoctor && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-bold text-white">Select Date & Time</h2>
                  <p className="text-xs text-slate-400">Availability with {selectedDoctor.name}</p>
                </div>

                {/* Short Doctor Card */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex gap-3 items-center">
                  <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedDoctor.name}</h4>
                    <p className="text-[10px] text-teal-400 font-medium">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                {/* Calendar Selector (Mock) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-2">
                    <span>June 2026</span>
                    <span className="text-[10px] text-teal-400">Doctor Sync Active</span>
                  </div>
                  {/* Grid of days */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                      <span key={d} className="text-slate-505 font-bold py-1">{d}</span>
                    ))}
                    {/* Days padding, start June 2026 on Mon (1st) */}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                      const isSelected = selectedDate === dateStr;
                      // Just mock some blocked weekends (e.g. 6th, 7th, 13th, 14th, 20th, 21st, 27th, 28th)
                      const isWeekend = dayNum % 7 === 6 || dayNum % 7 === 0;
                      
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isWeekend}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedTime(''); // clear selected time when date changes
                          }}
                          className={`py-2 rounded-lg font-semibold flex flex-col items-center justify-center transition-all ${
                            isWeekend 
                              ? 'text-slate-700 cursor-not-allowed' 
                              : isSelected 
                                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20' 
                                : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{dayNum}</span>
                          <span className={`w-1 h-1 rounded-full mt-0.5 ${
                            isWeekend ? 'bg-transparent' : isSelected ? 'bg-slate-950' : 'bg-teal-500/60'
                          }`}></span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Slots section */}
                <div>
                  <h3 className="text-xs font-bold text-slate-405 mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Available Slots on {selectedDate}</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`text-xs py-2 px-1 rounded-lg border text-center font-medium transition-all ${
                          selectedTime === slot
                            ? 'bg-teal-500/20 text-teal-400 border-teal-400 font-bold'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next button */}
                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={() => setBookingStep(3)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedTime 
                      ? 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-md shadow-teal-500/10' 
                      : 'bg-slate-850 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Continue to Confirmation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: Confirm & Symptoms note */}
            {bookingStep === 3 && selectedDoctor && (
              <form onSubmit={handleBookAppointment} className="space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-bold text-white">Review & Confirm</h2>
                  <p className="text-xs text-slate-400">Describe your symptoms to complete reservation</p>
                </div>

                {/* Summary panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3 items-center pb-3 border-b border-slate-800/80">
                    <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-11 h-11 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedDoctor.name}</h4>
                      <p className="text-[10px] text-teal-400 font-medium">{selectedDoctor.specialty}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Appointment Date</span>
                      <span className="text-slate-200 font-semibold flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-teal-500" />
                        {selectedDate}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Time Window</span>
                      <span className="text-slate-200 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        {selectedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Symptoms Form */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Reason for Visit / Symptoms</label>
                  <textarea
                    rows={4}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                    placeholder="Describe brief medical symptom notes, current medications, or concerns (e.g. Mild headache for 3 days, chest stiffness, annual checkup...)"
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-3 text-slate-200 focus:outline-none focus:border-teal-500 placeholder:text-slate-600 leading-relaxed resize-none"
                  ></textarea>
                </div>

                {/* Double-booking warning indicator */}
                <div className="bg-teal-950/20 border border-teal-500/20 rounded-xl p-3 flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong className="text-teal-400">Locking Slot:</strong> CarePulse verifies that this time slot is locked against double booking via our microservices architecture before confirming.
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg shadow-teal-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Appointment Booking</span>
                </button>
              </form>
            )}

            {/* STEP 4: Success Mockup */}
            {bookingStep === 4 && (
              <div className="text-center py-8 space-y-5 animate-scaleIn">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Booking Confirmed!</h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    Your appointment has been synchronized successfully with the Scheduling and Doctor services.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 max-w-[290px] mx-auto text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-505">Doctor:</span>
                    <span className="text-slate-200 font-bold">{selectedDoctor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-505">Specialty:</span>
                    <span className="text-slate-200">{selectedDoctor?.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-505">Date:</span>
                    <span className="text-teal-400 font-semibold">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-505">Time:</span>
                    <span className="text-teal-400 font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-505">Queue Ticket:</span>
                    <span className="text-amber-400 font-bold">#A29-P</span>
                  </div>
                </div>

                <button
                  onClick={resetBooking}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDICAL HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-white">Medical History</h2>
              <p className="text-xs text-slate-400">Electronic health records synced with Patient Service</p>
            </div>

            <div className="space-y-3">
              {mockHistory.map(record => (
                <div key={record.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{record.doctor}</h4>
                      <p className="text-[9px] text-teal-400 uppercase font-semibold tracking-wider">{record.specialty}</p>
                    </div>
                    <span className="text-[10px] text-slate-505 font-semibold">{record.date}</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-505 block text-[9px] uppercase font-bold">Diagnosis</span>
                      <p className="text-slate-200 font-semibold">{record.diagnosis}</p>
                    </div>
                    <div>
                      <span className="text-slate-505 block text-[9px] uppercase font-bold">Prescribed Medication</span>
                      <p className="text-amber-400 font-mono font-medium">{record.prescription}</p>
                    </div>
                    <div>
                      <span className="text-slate-505 block text-[9px] uppercase font-bold">Clinical Consultation Note</span>
                      <p className="text-slate-400 leading-relaxed mt-0.5">{record.notes}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-[9px] text-slate-500">
                    <span className="font-mono">Record ID: {record.id}</span>
                    <button 
                      type="button" 
                      onClick={() => alert(`Downloading Medical Record Report PDF: ${record.id}`)}
                      className="text-teal-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <FileText className="w-3 h-3" /> Download PDF Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Tab Navigator */}
      <div className="bg-slate-900 border-t border-slate-805 px-6 py-3.5 flex justify-between items-center z-10 sticky bottom-0">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-teal-400 scale-105' : 'text-slate-500 hover:text-slate-350'}`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-bold">Dashboard</span>
        </button>

        <button 
          onClick={() => { setActiveTab('book'); setBookingStep(1); }}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'book' ? 'text-teal-400 scale-105' : 'text-slate-500 hover:text-slate-350'}`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold">Book Visit</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-teal-400 scale-105' : 'text-slate-500 hover:text-slate-350'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[9px] font-bold">My Records</span>
        </button>
      </div>
    </div>
  );
}
