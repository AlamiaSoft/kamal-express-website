import { useState, useEffect, FormEvent } from 'react';
import {
  FileText, Plane, Hotel, ShieldCheck, Calendar, FileCheck,
  ArrowRight, Star, Award, Shield, Users, MapPin, Sparkles, HelpCircle
} from 'lucide-react';
import { VISA_SERVICES, DESTINATIONS, TOUR_PACKAGES } from '../data';
import { TourPackage } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenInquiry: (service?: string, destination?: string) => void;
  pageContent?: {
    hero_title?: string;
    hero_subtitle?: string;
  };
}

const iconMap: Record<string, any> = {
  FileText: FileText,
  Plane: Plane,
  Hotel: Hotel,
  ShieldCheck: ShieldCheck,
  Calendar: Calendar,
  FileCheck: FileCheck,
};

export default function HomeView({ onNavigate, onOpenInquiry, pageContent }: HomeViewProps) {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryService, setInquiryService] = useState('Visa Consultancy');
  const [inquiryDest, setInquiryDest] = useState('');

  const [destinationsList, setDestinationsList] = useState(DESTINATIONS);
  const [packagesList, setPackagesList] = useState(TOUR_PACKAGES);

  useEffect(() => {
    // Fetch destinations
    fetch('/api/public/destinations')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(d => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            image: d.image || '',
            visaType: d.visa_type || d.visaType || '',
            processingTime: d.processing_time || d.processingTime || '',
            stayDuration: d.stay_duration || d.stayDuration || '',
            validity: d.validity || '',
            price: d.price || '',
            requiredDocuments: Array.isArray(d.required_documents) ? d.required_documents : (Array.isArray(d.requiredDocuments) ? d.requiredDocuments : []),
            faqs: Array.isArray(d.faqs) ? d.faqs : []
          }));
          setDestinationsList(mapped);
        }
      })
      .catch(err => console.warn("Home: destinations fallback active:", err));

    // Fetch packages
    fetch('/api/public/packages')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setPackagesList(data);
        }
      })
      .catch(err => console.warn("Home: packages fallback active:", err));
  }, []);

  const handleHeroInquiry = (e: FormEvent) => {
    e.preventDefault();
    onOpenInquiry(inquiryService, inquiryDest);
  };

  return (
    <div className="space-y-20 pb-16 animate-in fade-in duration-300">

      {/* 1. Hero Banner with Quick Inquiry Form Overlaid */}
      <section className="relative bg-slate-900 overflow-hidden min-h-[550px] lg:min-h-[620px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/header-hero-image.webp"
            alt="Travel Hero Banner"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Your Ultimate Travel Partner
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {pageContent?.hero_title || "Your Trusted Visa Consultant & Travel Agency in Pakistan."}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              {pageContent?.hero_subtitle || "From stress-free visa processing to custom international tour packages, Kamal Express & Holidays ensures your travel plans are in safe hands. Let our experts handle the paperwork while you pack your bags."}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('services')}
                className="bg-emerald-600 text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-lg hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-2"
              >
                Explore All Services <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="bg-slate-800 text-white border border-slate-700 font-semibold text-sm px-6 py-3.5 rounded-lg hover:bg-slate-700 transition-all cursor-pointer"
              >
                Contact Us
              </button>
            </div>

          </div>

          {/* Quick Inquiry Form Block Overlay (Right) */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-150/80 text-left w-full h-full">
            <h2 className="text-lg font-bold text-gray-950">Quick Travel Plan Inquiry</h2>
            <p className="text-xs text-gray-500 mt-1 mb-6">Let Pakistan’s top certified travel consultants reach back to you instantly.</p>

            <form onSubmit={handleHeroInquiry} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase">Select Service</label>
                <select
                  value={inquiryService}
                  onChange={(e) => setInquiryService(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-3 bg-gray-50 outline-none focus:bg-white focus:border-emerald-600 transition-all"
                >
                  <option value="Visa Consultancy">Visa Consultancy</option>
                  <option value="Air Ticketing">Air Ticketing (Flights)</option>
                  <option value="Hotel Reservation">Hotel Reservations</option>
                  <option value="Umrah Packages">Umrah Pilgrimage</option>
                  <option value="Tour Packages">Tour Packages</option>
                  <option value="Travel Insurance">Travel Insurance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase">Target Destination / City</label>
                <input
                  type="text"
                  placeholder="e.g. Turkey, Dubai, Skardu, UK"
                  value={inquiryDest}
                  onChange={(e) => setInquiryDest(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-3 bg-gray-50 outline-none focus:bg-white focus:border-emerald-600 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-slate-950 font-bold text-sm py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Request Free Call <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 2. Core Services Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Our Premium Travel Services
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            From digital profiling, embassy slot coordination, and legal validations, to lowest ticketing quotes and five-star lodging reservation, we execute with complete trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {VISA_SERVICES.map((s) => {
            const IconComp = iconMap[s.iconName] || FileText;
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-100 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-250">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-950 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-normal mb-4">{s.description}</p>
                </div>
                <button
                  onClick={() => onNavigate('services', { serviceId: s.id })}
                  className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 hover:text-emerald-800 transition-all cursor-pointer mt-2"
                >
                  Learn Detailed Features <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Visa Destinations (UAE, Saudi, Turkey, UK, Europe, Canada etc) */}
      <section className="bg-slate-50 py-16 text-center space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-left">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Featured Visa Consultancies</h2>
              <p className="text-gray-500 text-sm md:text-base">Get complete document lists, current pricing models, and fast approval times.</p>
            </div>
            <button
              onClick={() => onNavigate('destinations')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-all shrink-0 cursor-pointer"
            >
              See All 8 Hot Destinations <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {destinationsList.slice(0, 4).map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => onNavigate('destinations', { slug: d.slug })}
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 rounded-md px-2.5 py-1 text-[10px] font-bold text-gray-800 tracking-wide uppercase shadow-xs">
                      {d.visaType.split('(')[0]}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-gray-950">{d.name}</h3>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Processing Window:</span>
                        <span className="font-semibold text-gray-800">{d.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visa Standard Fee:</span>
                        <span className="font-semibold text-emerald-700">{d.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>View Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Beautiful Tour Packages (Domestic vs International) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-left">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Popular Tour Packages</h2>
            <p className="text-gray-500 text-sm md:text-base">Designed by experts: comfortable stays, licensed navigators, and pristine timelines.</p>
          </div>
          <button
            onClick={() => onNavigate('tours')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-all shrink-0 cursor-pointer"
          >
            Filter All Packages <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {packagesList.slice(0, 3).map((pkg: TourPackage) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-150/80 hover:border-emerald-100 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover hover:scale-102 transition-transform duration-250"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    {pkg.category} Tour
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white rounded-md px-2.5 py-1 text-xs font-bold shadow-xs">
                    {pkg.duration}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-gray-950 leading-snug">{pkg.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{pkg.description}</p>

                  <div className="pt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Highlights Include:</span>
                    <ul className="space-y-1">
                      {pkg.highlights.slice(0, 2).map((hl, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                          <span className="text-emerald-600 shrink-0 font-bold">•</span> {hl}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Pricing From</span>
                    <span className="text-xl font-bold text-gray-950">{pkg.price}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('tours', { selectedTourId: pkg.id })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    View Itinerary
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Choose Kamal Express */}
      <section className="bg-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Why Travelers Choose Kamal Express</h2>
            <p className="text-slate-400 text-sm md:text-base">
              Decades of excellence in the trade, fully authorized and integrated with global travel consortia. We bridge trust and ease for Pakistani passport holders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">IATA Certified Agency</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Direct booking access with international carriers, promising the absolute lowest rates and immediate ticketiing routing validations.
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Expert Legal Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Your application files go through a rigid 3-layer internal pre-screening audit before we present your dossier to any embassy.
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Spiritual Comfort</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                We possess certified Ministry connections for Umrah Pilgrimage visas, securing reliable hotel placements blocks directly from Haram doors.
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Premier Blue Area Location</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Visit our state-of-the-art hospitality suite inside Aalay Plaza, Blue Area, Islamabad for convenient physical document drop-offs.
              </p>
            </div>
          </div>

          {/* Quick numbers tracker counter */}
          <div className="border-t border-slate-800 pt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-emerald-400">18+ Years</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Industry Heritage</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-emerald-400">98.4%</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Visa Audit Success</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-emerald-400">12,000+</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Satisfied Pilgrims</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-emerald-400">220+</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Global Hotel partners</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Customer Testimonials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">What Our Applicants Are Saying</h2>
          <p className="text-gray-500 text-sm md:text-base">Real experiences from travelers, business owners, and families.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between space-y-6">
            <p className="text-sm text-gray-600 leading-relaxed italic font-normal">
              "We applied for a Canada Tourist Visa for our family through Sohail at Kamal Express. His detailed checklist and file review were impeccable. We received our 10-year multiple entries in less than 35 days, with zero headaches!"
            </p>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-100 font-bold text-sm text-emerald-800 flex items-center justify-center">MH</span>
              <div>
                <span className="block text-sm font-bold text-gray-950">Mian Hammad</span>
                <span className="block text-xs text-gray-400">Business Exporter, Faisalabad</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between space-y-6">
            <p className="text-sm text-gray-600 leading-relaxed italic font-normal">
              "Our premium 10-day Umrah package with Swissotel Makkah booking was beautifully structured. The Haramain bullet train slots, hotel zero-meter transfers, and child wheelchair accessibility setups were meticulously delivered."
            </p>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-100 font-bold text-sm text-emerald-800 flex items-center justify-center">SN</span>
              <div>
                <span className="block text-sm font-bold text-gray-950">Sadia Najeeb</span>
                <span className="block text-xs text-gray-400">Homemaker, Islamabad</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between space-y-6">
            <p className="text-sm text-gray-600 leading-relaxed italic font-normal">
              "Kamal Express planned our coastal honeymoon package to Thailand and Malaysia. Absolutely flawless! The luxury beach speedboats, private English guide coordination, and premium resorts matched our specs down to the penny."
            </p>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-100 font-bold text-sm text-emerald-800 flex items-center justify-center">AZ</span>
              <div>
                <span className="block text-sm font-bold text-gray-950">Adnan & Zainab</span>
                <span className="block text-xs text-gray-400">Newlyweds, Lahore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
