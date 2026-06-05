import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Compass, MapPin, Calendar, Clock, ArrowRight, CheckCircle, 
  X, AlertCircle, ShoppingBag, Landmark, Star 
} from 'lucide-react';
import { TOUR_PACKAGES } from '../data';
import { TourPackage } from '../types';

interface ToursViewProps {
  onOpenInquiry: (service?: string, notes?: string) => void;
}

export default function ToursView({ onOpenInquiry }: ToursViewProps) {
  const { category, selectedTourId } = useParams<{ category?: string; selectedTourId?: string }>();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<'All' | 'International' | 'Domestic' | 'Customized'>(
    'All'
  );
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);

  // Apply filters on URL parameter changes
  useEffect(() => {
    if (category) {
      const matchedCat = (['All', 'International', 'Domestic', 'Customized'] as const).find(
        c => c.toLowerCase() === category.toLowerCase()
      );
      if (matchedCat) {
        setActiveCategory(matchedCat);
      }
    } else {
      setActiveCategory('All');
    }

    if (selectedTourId) {
      const matched = TOUR_PACKAGES.find(p => p.id === selectedTourId);
      if (matched) {
        setSelectedTour(matched);
        // Scroll to the top of the detail sheet
        setTimeout(() => {
          const el = document.getElementById('tour-detail-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else {
      setSelectedTour(null);
    }
  }, [category, selectedTourId]);

  // Filter package matching categories
  const filteredPackages = TOUR_PACKAGES.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category === activeCategory;
  });

  const handleSelectTour = (pkg: TourPackage) => {
    navigate(`/tours/${pkg.category}/${pkg.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="text-left space-y-4 mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          Inspiring Tour Packages & Expeditions
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
          Sourced by our travel advisors. Experience top rated boutique accommodations, premium airport transits, secure custom tour guides, and meticulously detailed itineraries.
        </p>
      </div>

      {/* Category selector tabs row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-5 mb-10 text-left">
        {(['All', 'International', 'Domestic', 'Customized'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              if (cat === 'All') {
                navigate('/tours');
              } else {
                navigate(`/tours/${cat}`);
              }
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'All' ? 'All Packages' : `${cat} Packages`}
          </button>
        ))}
      </div>

      {/* Primary Panels: Left side lists, Right side detail board if selected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: List Cards */}
        <div className={`space-y-6 ${selectedTour ? 'lg:col-span-6' : 'lg:col-span-12'} text-left`}>
          {activeCategory === 'Customized' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-emerald-990">Bespoke Tour Planner</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Don't see a perfect template for your business? We build customized tours tailored strictly to your schedule, desired airline, stars of hotels, and direct local guide specifications.
              </p>
              <button
                onClick={() => onOpenInquiry('Tour Packages', 'I want to customize a tourist package. Let us know hotel star preferences, traveler counts, and targets.')}
                className="bg-gold hover:bg-gold-hover text-slate-950 text-xs font-bold px-5 py-3 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Inquire Bespoke Package
              </button>
            </div>
          )}

          <div className={`grid gap-6 ${selectedTour ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handleSelectTour(pkg)}
                className={`bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTour?.id === pkg.id 
                    ? 'border-emerald-600 shadow-md ring-2 ring-emerald-550/10' 
                    : 'border-gray-150 hover:border-gray-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={pkg.image} 
                      alt={pkg.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded">
                      {pkg.duration}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-gray-950 leading-tight">{pkg.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{pkg.location}</span>
                    </div>

                    <div className="pt-2">
                      <ul className="space-y-1 text-xs text-gray-500">
                        {pkg.highlights.slice(0, 2).map((h, i) => (
                          <li key={i} className="flex items-start gap-1"><span className="text-emerald-600 font-bold">•</span> {h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-bold">Rates From</span>
                    <span className="text-base font-bold text-gray-950">{pkg.price}</span>
                  </div>
                  <span className="text-emerald-700 flex items-center gap-1">
                    See Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed expanded view active block */}
        {selectedTour && (
          <div 
            id="tour-detail-anchor"
            className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-left space-y-8 shadow-md"
          >
            {/* Header section with closing button */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold uppercase tracking-wider px-2 py-1 rounded">
                  {selectedTour.category} Tour • {selectedTour.duration}
                </span>
                <h2 className="text-2xl font-extrabold text-gray-950 mt-2 leading-tight">{selectedTour.title}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600" /> {selectedTour.location}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (activeCategory === 'All') {
                    navigate('/tours');
                  } else {
                    navigate(`/tours/${activeCategory}`);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main graphic banner block */}
            <div className="h-56 rounded-xl overflow-hidden bg-slate-50 border border-gray-100">
              <img 
                src={selectedTour.image} 
                alt={selectedTour.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {selectedTour.description}
              </p>
            </div>

            {/* What is Included / Excluded Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-gray-100 py-6 text-xs text-left">
              <div className="space-y-3">
                <span className="font-bold text-emerald-800 uppercase tracking-wider block">✓ Included In Fare:</span>
                <ul className="space-y-2">
                  {selectedTour.included.map((inc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium leading-relaxed">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-red-800 uppercase tracking-wider block">✗ Excluded:</span>
                <ul className="space-y-2">
                  {selectedTour.excluded.map((exc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                      <span className="text-gray-500 leading-relaxed">{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed daily itinerary timeline */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day-by-Day Itinerary</h3>
              <div className="border-l border-gray-150 pl-5 space-y-6 relative ml-1">
                {selectedTour.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="relative text-left">
                    {/* Circle bullet indicator */}
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-600 border border-white ring-4 ring-emerald-50"></div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider mb-0.5">Day {dayPlan.day}</span>
                    <h4 className="text-sm font-bold text-gray-950 font-sans leading-snug">{dayPlan.title}</h4>
                    <p className="text-xs text-gray-500 leading-normal font-normal mt-1">{dayPlan.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/50 p-4 rounded-xl">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Standard rate</span>
                <span className="text-xl font-bold text-emerald-700">{selectedTour.price}</span>
              </div>
              <button
                onClick={() => onOpenInquiry('Tour Packages', `I would like to book or inquire about: "${selectedTour.title}" (${selectedTour.duration} tour). Please quote detailed airfares, visa status, or customizations.`)}
                className="bg-gold hover:bg-gold-hover text-slate-950 font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-colors cursor-pointer"
              >
                Inquire This Tour Package
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
