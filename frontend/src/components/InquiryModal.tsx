import { useState, useEffect, FormEvent } from 'react';
import { X, CheckCircle, Ticket, Phone, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Inquiry } from '../types';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
  prefilledDestination?: string;
}

export default function InquiryModal({ isOpen, onClose, prefilledService, prefilledDestination }: InquiryModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('Visa Consultancy');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot spam blocker

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<Inquiry | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Apply prefill variables whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (prefilledService) setServiceType(prefilledService);
      if (prefilledDestination) setDestination(prefilledDestination);
      // Reset submission states
      setSuccessTicket(null);
      setErrors([]);
      setWebsite('');
    }
  }, [isOpen, prefilledService, prefilledDestination]);

  if (!isOpen) return null;

  const validate = () => {
    const errList = [];
    if (!name.trim()) errList.push('Full Name is required.');
    if (!email.trim() || !email.includes('@')) errList.push('Enter a valid email address.');
    if (!phone.trim()) errList.push('Contact Phone Number is required.');
    return errList;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    fetch('/api/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        serviceType,
        destination: destination || 'General Inquiry',
        notes: notes || 'No special requirements listed.',
        website // honeypot
      })
    })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) {
          const newInquiry: Inquiry = {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            serviceType: result.data.serviceType,
            destination: result.data.destination,
            notes: result.data.notes,
            date: result.data.date,
            status: 'Pending'
          };

          // Save to localStorage of client
          const existingInquiriesString = localStorage.getItem('kamal_express_inquiries');
          const list: Inquiry[] = existingInquiriesString ? JSON.parse(existingInquiriesString) : [];
          list.unshift(newInquiry);
          localStorage.setItem('kamal_express_inquiries', JSON.stringify(list));

          setSuccessTicket(newInquiry);

          // Reset fields
          setName('');
          setEmail('');
          setPhone('');
          setDestination('');
          setNotes('');
          setWebsite('');
        } else {
          setErrors(result.errors || [result.message || 'An error occurred during submission.']);
        }
      })
      .catch((err) => {
        console.error('Inquiry Submission Error:', err);
        setErrors(['Connection to host server failed. Please verify your internet or contact details.']);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header box */}
        <div className="bg-emerald-800 text-white px-6 py-5 flex items-center justify-between text-left">
          <div>
            <h3 className="text-lg font-bold">Quick Inquiry & Consultation</h3>
            <p className="text-emerald-100 text-xs mt-0.5">Let us plan your custom tour, visa, or flight tickets securely.</p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white rounded-lg p-1.5 hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="p-6 text-left">

          {successTicket ? (
            /* Success Response screen */
            <div className="text-center py-6 space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-650 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-gray-900">Inquiry Submitted Successfully!</h4>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-gray-800">{successTicket.name}</span>. Your ticket has been logged inside our prioritised queue.
                </p>
              </div>

              {/* Ticket specs card */}
              <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-4 max-w-sm mx-auto text-left relative">
                <div className="absolute top-1/2 left-0 w-3 h-6 bg-white border-r border-dashed border-gray-200 rounded-r-full -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-0 w-3 h-6 bg-white border-l border-dashed border-gray-200 rounded-l-full -translate-y-1/2"></div>

                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-3 border-b border-gray-100 pb-2">
                  <Ticket className="w-4 h-4" /> Reference: {successTicket.id}
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600">
                  <div><strong>Interested Service:</strong></div>
                  <div>{successTicket.serviceType}</div>
                  <div><strong>Destination:</strong></div>
                  <div>{successTicket.destination}</div>
                  <div><strong>Queue Status:</strong></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Pending Review</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-150 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2 max-w-sm mx-auto">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Our certified consul officers will contact you at <strong>{successTicket.phone}</strong> or email <strong>{successTicket.email}</strong>
                </span>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <a
                  href={`https://wa.me/+923000590935?text=Hi%20Kamal%20Express,%20I%20just%20submitted%20inquiry%20ticket%20${successTicket.id}%20for%20${successTicket.serviceType}.%20Please%20assist%20me.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-white fill-current" /> Priority WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>

            </div>
          ) : (
            /* Inquiry Entry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field - hidden from users but filled by bots */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Error messages box */}
              {errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Please solve the following issues:</span>
                    <ul className="list-disc pl-4 text-xs mt-1 space-y-0.5">
                      {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-750 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-gray-250 rounded-lg px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-650/40 outline-none transition-all"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-750 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm border border-gray-250 rounded-lg px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-650/40 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-750 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm border border-gray-250 rounded-lg px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-650/40 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-gray-750 uppercase">Desired Service</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full text-sm border border-gray-250 rounded-lg px-3 py-2.5 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-650/40 outline-none transition-all"
                  >
                    <option value="Visa Consultancy">Visa Consultancy</option>
                    <option value="Air Ticketing">Air Ticketing</option>
                    <option value="Hotel Reservation">Hotel Reservation</option>
                    <option value="Umrah Packages">Umrah Packages</option>
                    <option value="Tour Packages">Tour Packages</option>
                    <option value="Travel Insurance">Travel Insurance</option>
                    <option value="Visa Appointments">Visa Appointments</option>
                    <option value="Apostille & Attestation">Apostille & Attestation</option>
                  </select>
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-750 uppercase">Destination Country / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Turkey, Dubai, Skardu"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-sm border border-gray-250 rounded-lg px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-650/40 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-750 uppercase">Special Requirements / Flight Details</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your preferred dates, total travelers, budget constraints, or visa requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm border border-gray-250 rounded-lg px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-650/40 outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Terms disclaimer */}
              <p className="text-[10px] text-gray-400 text-center leading-normal">
                By clicking Submit, you agree to share your coordinates with Kamal Express. We protect your data securely and use it solely to coordinate travel plans.
              </p>

              {/* Action Buttons row */}
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors order-2 sm:order-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold text-slate-950 bg-gold hover:bg-gold-hover disabled:bg-emerald-450 rounded-lg shadow-md cursor-pointer transition-colors order-1 sm:order-2 flex items-center justify-center gap-2 shrink-0 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
