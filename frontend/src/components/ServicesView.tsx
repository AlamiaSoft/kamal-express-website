import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Plane, Hotel, ShieldCheck, Calendar, FileCheck, 
  HelpCircle, ArrowRight, CheckCircle2, Phone 
} from 'lucide-react';
import { VISA_SERVICES } from '../data';

interface ServicesViewProps {
  initialServiceId?: string;
  onOpenInquiry: (service?: string) => void;
}

const iconMap: Record<string, any> = {
  FileText: FileText,
  Plane: Plane,
  Hotel: Hotel,
  ShieldCheck: ShieldCheck,
  Calendar: Calendar,
  FileCheck: FileCheck,
};

export default function ServicesView({ initialServiceId, onOpenInquiry }: ServicesViewProps) {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const navigate = useNavigate();
  const [activeServiceId, setActiveServiceId] = useState(VISA_SERVICES[0].id);

  // Focus service if passed globally on tab navigating
  useEffect(() => {
    const targetId = serviceId || initialServiceId;
    if (targetId) {
      setActiveServiceId(targetId);
    }
  }, [serviceId, initialServiceId]);

  const activeService = VISA_SERVICES.find(s => s.id === activeServiceId) || VISA_SERVICES[0];
  const ActiveIcon = iconMap[activeService.iconName] || FileText;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="text-left space-y-4 mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          Our Core Travel & Consultancy Services
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-3xl leading-relaxed">
          From legalizations and early VFS booking appointments to cheap airfares and comprehensive tourist visa dossiers, we manage everything with maximum precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Services menu list tabs */}
        <div className="lg:col-span-4 space-y-2 text-left">
          <div className="bg-white rounded-xl border border-gray-150 p-2 space-y-1 shadow-2xs">
            {VISA_SERVICES.map((s) => {
              const TabIcon = iconMap[s.iconName] || FileText;
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/services/${s.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                    activeServiceId === s.id 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-slate-50 hover:text-emerald-700'
                  }`}
                >
                  <TabIcon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-gray-150 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Need Custom Assistance?</h4>
            <p className="text-xs text-gray-400 leading-normal">
              Get an instant quotation on bulk ticketing fares, composite family visa files, and embassy coordination.
            </p>
            <button
              onClick={() => onOpenInquiry('Custom Travel Service')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Direct Multi-Route Quote
            </button>
          </div>
        </div>

        {/* Right Side: Detailed Service View Panels */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 p-6 md:p-8 text-left space-y-8 shadow-xs">
          
          {/* Header block with icon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
              <ActiveIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-950">{activeService.title}</h2>
              <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase mt-0.5 inline-block bg-emerald-50/70 p-1 px-2.5 rounded">
                Kamal Express Trusted Service
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Overview</h3>
            <p className="text-sm md:text-base text-gray-650 leading-relaxed font-normal">
              {activeService.description}
            </p>
          </div>

          {/* Detailed features bullet checkmarks list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">What We Handle For You</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeService.features.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 font-semibold leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Service specs content mapping */}
          {activeService.id === 'visa-consultancy' && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 text-xs text-amber-900 leading-relaxed space-y-2">
              <span className="font-bold text-amber-800 uppercase tracking-wider block">Important Tip:</span>
              <p>
                A high score on a visa is always about a beautifully organized dossier that leaves zero doubts regarding your income source and your intention to return. We cross-audit marriage certificates, tax documents, and property assets meticulously to guarantee perfect presentation.
              </p>
            </div>
          )}

          {activeService.id === 'air-ticketing' && (
            <div className="border border-slate-200 rounded-xl p-5 space-y-4 text-xs text-gray-600">
              <span className="font-bold text-gray-950 uppercase tracking-wider block">Special Flight Services</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-800 block mb-0.5">• Multi-Stop Journeys</strong>
                  Plan complex schedules involving multiple airlines and stopovers under a single check-in.
                </div>
                <div>
                  <strong className="text-gray-800 block mb-0.5">• Date Modifications</strong>
                  Priority ticket swaps and rerouting with reduced airline reissue fees.
                </div>
              </div>
            </div>
          )}

          {/* CTA Box */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/30 p-4 rounded-xl">
            <div className="text-left">
              <span className="text-xs font-bold text-gray-500 block">Questions about {activeService.title}?</span>
              <span className="text-sm font-semibold text-gray-800">Speak directly to an operations agent inside Blue Area.</span>
            </div>
            <button
              onClick={() => onOpenInquiry(activeService.title)}
              className="bg-gold hover:bg-gold-hover text-slate-950 font-bold text-sm px-6 py-3 rounded-lg shadow-md transition-colors cursor-pointer shrink-0"
            >
              Inquire Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
