import { useState, useEffect, FormEvent } from 'react';
import {
  MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle,
  Ticket, AlertCircle, RefreshCw, Navigation
} from 'lucide-react';
import { Inquiry } from '../types';

export default function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Visa Consultancy');
  const [msg, setMsg] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot spam filter

  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [localTickets, setLocalTickets] = useState<Inquiry[]>([]);

  // Load inquiries from localStorage to show in status board
  const loadLocalTickets = () => {
    const listStr = localStorage.getItem('kamal_express_inquiries');
    if (listStr) {
      setLocalTickets(JSON.parse(listStr));
    }
  };

  useEffect(() => {
    loadLocalTickets();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !msg.trim()) {
      alert('Please fill out all required contact fields.');
      return;
    }

    setIsSending(true);

    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        msg,
        website // honeypot
      })
    })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) {
          const generatedId = result.reference_id;
          const newInquiry: Inquiry = {
            id: generatedId,
            name,
            email,
            phone,
            serviceType: subject,
            destination: 'Contact Form Message',
            notes: msg,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Pending'
          };

          // Add to local Storage list
          const existingStr = localStorage.getItem('kamal_express_inquiries');
          const list: Inquiry[] = existingStr ? JSON.parse(existingStr) : [];
          list.unshift(newInquiry);
          localStorage.setItem('kamal_express_inquiries', JSON.stringify(list));

          setSuccessMsg(true);
          loadLocalTickets(); // Refresh list

          // Reset
          setName('');
          setEmail('');
          setPhone('');
          setMsg('');
          setWebsite('');
        } else {
          alert(result.message || 'An error occurred while sending your contact message.');
        }
      })
      .catch((err) => {
        console.error('Contact Submission Error:', err);
        alert('Failed to connect to the host server. Please check your network or try again.');
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-16 animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="text-left space-y-4 border-b border-gray-100 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          Contact Our Corporate Branch
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
          Visit our hospitality suite in Aalay Plaza, Islamabad, chat directly on WhatsApp, or compose a quick contact ticket block below.
        </p>
      </div>

      {/* Grid: Coordinates Info left, Form right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Coordinates Details Col */}
        <div className="lg:col-span-5 space-y-8 text-left">

          <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 space-y-6 shadow-2xs">
            <h3 className="text-lg font-bold text-gray-950">Branch Coordinates</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">Office Location</span>
                  <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                    Office No. 05, 2nd Floor, Aalay Plaza, 7th Ave, near Kalsoom Hospital, G-6/3 G 6/2 Blue Area, Islamabad, 46000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">Telephone Line</span>
                  <p className="text-sm text-gray-700 font-semibold">
                    (051) 2726807
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">Support Email</span>
                  <p className="text-sm text-gray-700 font-semibold">
                    customercare@kamalexpress.com.pk
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">Operating Schedule</span>
                  <p className="text-sm text-gray-700 font-semibold leading-normal">
                    Monday to Saturday: 09:00 AM - 06:00 PM <br />
                    <span className="text-xs text-gray-400 font-medium font-sans">Sunday: Closed for server maintenance</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp redirect trigger card */}
            <div className="bg-emerald-600 rounded-xl p-5 text-white space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 justify-start">
                <MessageSquare className="w-5 h-5 fill-current" /> Fast WhatsApp Chat
              </h4>
              <p className="text-xs text-emerald-100 leading-normal font-normal">
                Skip form completions. Speak directly to our visa pre-screens team via a secure, active WhatsApp chat now.
              </p>
              <a
                href="https://wa.me/92512726807?text=Hi%20Kamal%20Express,%20I'm%20visiting%20your%20website%20and%20want%2520to%20know%20more."
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center bg-white text-emerald-950 font-bold text-xs py-2.5 rounded-lg hover:bg-emerald-50 shadow-sm transition-colors"
              >
                Launch Instant Chat
              </a>
            </div>
          </div>

          {/* Location Map visual placeholder using stable iframe Map */}
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs space-y-4 text-left p-6">
            <h4 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-600" /> Interactive Map Area
            </h4>
            <div className="h-56 rounded-xl overflow-hidden border border-gray-150 bg-slate-100 relative">
              <iframe
                title="Kamal Express Aalay Plaza Map"
                src="https://maps.google.com/maps?q=Aalay%20Plaza,%20Blue%20Area,%20Islamabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Contact Form Col */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 md:p-8 text-left space-y-6 shadow-2xs">
          <h3 className="text-lg font-bold text-gray-950">Draft a Contact Ticket</h3>
          <p className="text-xs text-gray-500 leading-normal font-normal">
            Your messages are registered immediately inside our priorities databases. Rest assured, your coordinates stay fully confidential.
          </p>

          {successMsg ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-800">Contact Form Submitted!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Your message has been logged in our system. You can view and track your active ticket in the panel below.
                </p>
              </div>
              <button
                onClick={() => setSuccessMsg(false)}
                className="text-xs font-bold text-emerald-700 underline hover:text-emerald-800 transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot hidden input */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sohail"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg text-sm p-3 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +92 300 0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg text-sm p-3 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg text-sm p-3 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">Involved Core Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg text-sm p-3 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                >
                  <option value="Visa Consultancy">Visa Consultancy Assistance</option>
                  <option value="Air Ticketing">Air Ticketing (Fares check)</option>
                  <option value="Hotel Reservation">Hotel Reservations Stays</option>
                  <option value="Umrah Packages">Umrah Pilgrimage Package</option>
                  <option value="Tour Packages">Tours & Destinations Package</option>
                  <option value="General Inquiry">General Company Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your requirements so our consult experts reach prepared..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg text-sm p-3 bg-gray-50 focus:bg-white focus:border-emerald-600 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-gold hover:bg-gold-hover text-slate-950 text-sm font-bold py-3.5 rounded-lg shadow-sm transition-colors cursor-pointer disabled:bg-slate-300 disabled:text-gray-500"
              >
                {isSending ? 'Sending Live Ticket...' : 'Send Contact Ticket'}
              </button>

            </form>
          )}

        </div>

      </div>

      {/* 3. ACTIVE REAL-TIME LOCAL TICKET MONITOR BOARD */}
      <section className="bg-slate-50 border border-gray-150 rounded-3xl p-6 md:p-8 text-left space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-gray-950 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-600" /> Active Service Tickets Monitor
            </h3>
            <p className="text-xs text-gray-500 font-normal leading-normal">
              Below are active tickets you have submitted on this device. Submissions are saved inside your secure local space.
            </p>
          </div>

          <button
            onClick={loadLocalTickets}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Screen State
          </button>
        </div>

        {localTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localTickets.map((tk) => (
              <div
                key={tk.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-800 text-[10px] uppercase font-bold px-3 py-1 rounded-bl">
                  Reviewing Queue
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-emerald-700 font-bold tracking-widest block uppercase">
                    Ref ID: {tk.id}
                  </span>
                  <h4 className="text-sm font-bold text-gray-950 leading-tight">{tk.serviceType}</h4>
                  <span className="text-[10px] text-gray-400 block font-normal">Logged: {tk.date}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 text-xs text-gray-600 space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-gray-400 font-medium">Applicant:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{tk.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-gray-400 font-medium">Contact:</span>
                    <span className="col-span-2 text-gray-800 font-semibold truncate">{tk.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-gray-400 font-medium">Destination:</span>
                    <span className="col-span-2 text-gray-800 font-semibold truncate">{tk.destination}</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-gray-100 text-[11px] text-gray-500 italic line-clamp-2">
                    "{tk.notes}"
                  </div>
                </div>

                {/* Direct WhatsApp acceleration block */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/923000590935?text=Hi%20Kamal%20Express,%20I'm%20tracking%20my%20contact%20ticket%20${tk.id}.%20Can%20you%20please%20accelerate%20my%20visa/flight%20consultancy?`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs py-2 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" /> Accelerate via WhatsApp
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-12 text-center text-gray-400 max-w-sm mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-700">No Submitted Tickets Yet</h4>
              <p className="text-xs text-gray-450 leading-relaxed font-normal px-6">
                Submit an inquiry or contact ticket above. The moment you register it, it will dynamically monitor state in this panel!
              </p>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
