import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Compass, MapPin, Search, Calendar, FileText, HelpCircle, 
  ArrowRight, ShieldCheck, CheckCircle2, DollarSign, X, MessageSquare 
} from 'lucide-react';
import { DESTINATIONS } from '../data';
import { Destination } from '../types';

interface DestinationsViewProps {
  initialSlug?: string;
  onOpenInquiry: (service?: string, destination?: string) => void;
}

export default function DestinationsView({ initialSlug, onOpenInquiry }: DestinationsViewProps) {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  // Focus a specific destination if slug passed (from homepage clicks or footer links)
  useEffect(() => {
    const targetSlug = slug || initialSlug;
    if (targetSlug) {
      const match = DESTINATIONS.find(d => d.slug === targetSlug);
      if (match) {
        setActiveDestination(match);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    } else {
      setActiveDestination(null);
    }
  }, [slug, initialSlug]);

  const filteredDestinations = DESTINATIONS.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.visaType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackToList = () => {
    navigate('/destinations');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleDetailClick = (d: Destination) => {
    navigate(`/destinations/${d.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 animate-in fade-in duration-300">
      
      {activeDestination ? (
        /* ==================== 1. DETAILED DESTINATION SUB-PAGE ==================== */
        <div className="space-y-12 text-left animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Breadcrumb row & Back button */}
          <div className="flex justify-between items-center bg-slate-50 border border-gray-150 p-3 rounded-xl mb-4 text-xs font-semibold">
            <div className="text-gray-400">
              <span className="hover:text-emerald-700 cursor-pointer" onClick={handleBackToList}>Destinations</span>
              <span className="mx-2">/</span>
              <span className="text-gray-800">{activeDestination.name} Visa Requirements</span>
            </div>
            <button 
              onClick={handleBackToList}
              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer font-bold"
            >
              ← Back to All Destinations
            </button>
          </div>

          {/* Hero Header panel */}
          <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 bg-slate-100 shadow-xs">
            <img 
              src={activeDestination.image} 
              alt={activeDestination.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/45 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 md:left-8 right-6">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 rounded px-2.5 py-1 uppercase tracking-wider block mb-2 w-max">
                {activeDestination.visaType.split('(')[0]}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{activeDestination.name}</h1>
            </div>
          </div>

          {/* Core Specs Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-gray-150 rounded-2xl p-6">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Standard Processing</span>
              <span className="text-sm font-bold text-gray-950">{activeDestination.processingTime}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Base Visa Fee</span>
              <span className="text-sm font-bold text-emerald-700">{activeDestination.price}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Maximum Stay Limit</span>
              <span className="text-sm font-bold text-gray-950">{activeDestination.stayDuration}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Visa Validity Window</span>
              <span className="text-sm font-bold text-gray-950">{activeDestination.validity}</span>
            </div>
          </div>

          {/* Requirements & Documents checklists (Dynamic) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            <div className="lg:col-span-8 space-y-8">
              
              {/* Document checklists */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-950 border-b border-gray-100 pb-2">
                  Required Documents Checklist
                </h3>
                <p className="text-xs text-gray-500 font-medium">To avoid application delays, please compile the following high-contrast scanned files:</p>
                
                <div className="space-y-3">
                  {activeDestination.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex gap-3 bg-white border border-gray-150 rounded-xl p-4 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-700 font-semibold leading-relaxed block">{doc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific FAQs for Country */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-950 border-b border-gray-100 pb-2">
                  Frequently Asked Questions ({activeDestination.name})
                </h3>
                
                <div className="space-y-4">
                  {activeDestination.faqs.map((f, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-5 border border-gray-150">
                      <h4 className="text-sm font-semibold text-gray-900 flex gap-2 items-center">
                        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                        {f.question}
                      </h4>
                      <p className="text-xs text-gray-500 font-normal leading-relaxed mt-2.5 pl-6">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Side block local Inquiry Panel */}
            <div className="lg:col-span-4 bg-emerald-990 text-white rounded-2xl p-6 space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-44 h-44 bg-emerald-800 rounded-full opacity-30 z-0"></div>
              
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold">Apply for {activeDestination.name} Visa</h3>
                <p className="text-xs text-emerald-100 leading-normal font-normal">
                  Our certified visa advisers will review your bank credentials and draft a pristine application file.
                </p>
                <div className="space-y-2 border-t border-emerald-800 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span>Base Fee:</span>
                    <span className="font-bold text-emerald-300">{activeDestination.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-bold">Visa Consultancy</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenInquiry('Visa Consultancy', `Hi, I want to apply for a ${activeDestination.name} visitor visa. Please assist with coordinates, forms checklists, and appointments scheduling.`)}
                  className="w-full bg-gold hover:bg-gold-hover text-slate-950 font-bold text-xs py-3.5 rounded-lg shadow-md transition-colors cursor-pointer"
                >
                  Start My Application
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ==================== 2. GRID LIST OF ALL DESTINATIONS ==================== */
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Header block with search widgets */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8">
            <div className="text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Explore Destinations & Travel Rules
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Click on any popular country card to see processing periods, document checklists, physical embassy protocols, and direct inquiry guides.
              </p>
            </div>
            
            {/* Search inputs bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search destination country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-600 transition-colors bg-slate-50/50"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Cards dynamic render list */}
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {filteredDestinations.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleDetailClick(d)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-150 hover:border-emerald-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-slate-50 border-b border-gray-50">
                      <img 
                        src={d.image} 
                        alt={d.name} 
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 rounded px-2 py-1 text-[9px] font-bold text-gray-800 shadow-2xs uppercase tracking-wide">
                        {d.processingTime}
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-gray-950 leading-tight">{d.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{d.visaType}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>View Requirements Sheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
              <Compass className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">No Destination Matches</h3>
                <p className="text-xs text-gray-500 leading-normal font-normal">
                  We currently support specialized visa structures for these 8 leading worldwide countries. Please type other search words or reach our ticketing team.
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
              >
                Clear Search Query
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
