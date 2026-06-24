import { Sparkles, Compass, Hotel, ShieldAlert, CheckCircle, HelpCircle, FileText, Gift } from 'lucide-react';
import { PILGRIMAGE_UMRAH } from '../data';

interface UmrahViewProps {
  onOpenInquiry: (service?: string, notes?: string) => void;
  pageContent?: {
    intro_desc?: string;
  };
}

export default function UmrahView({ onOpenInquiry, pageContent }: UmrahViewProps) {
  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <section className="relative bg-teal-950 py-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1580418827493-f2b22c0a76ae?q=80&w=1200&auto=format&fit=crop" 
            alt="Makkah Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-teal-950/90"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" /> Licensed Umrah Operator (DTCD Registry)
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Sacred Umrah Pilgrimage Packages</h1>
          <p className="text-teal-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {pageContent?.intro_desc || PILGRIMAGE_UMRAH.description}
          </p>
        </div>
      </section>

      {/* Package grid lists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Packages</h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Choose from near-Haram 5-star packages, budget friendly family arrangements, or completely tailored schedules according to your group limits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PILGRIMAGE_UMRAH.packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`bg-white rounded-2xl border flex flex-col justify-between shadow-xs transition-all relative overflow-hidden ${
                pkg.id === 'umrah-prem' 
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10' 
                  : 'border-gray-150 hover:border-gray-300'
              }`}
            >
              {pkg.id === 'umrah-prem' && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-widest px-3.5 py-1 rounded-bl-lg">
                  Highly Rated Comfort
                </div>
              )}

              {/* Package Content */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-950 mb-2">{pkg.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">{pkg.tagline}</p>
                </div>

                <div className="text-2xl md:text-3xl font-bold text-gray-950 border-y border-gray-100 py-3.5 flex items-baseline gap-1">
                  {pkg.price}
                  {pkg.id !== 'umrah-custom' && <span className="text-xs font-semibold text-gray-500">/ Pilgrim rate</span>}
                </div>

                {/* Specs elements */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-800 shrink-0 w-24 block">Stay Duration:</span>
                    <span className="text-gray-600">{pkg.duration}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-800 shrink-0 w-24 block">Makkah Stay:</span>
                    <span className="text-gray-600">{pkg.makkahHotel}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-800 shrink-0 w-24 block">Madinah Stay:</span>
                    <span className="text-gray-600">{pkg.madinahHotel}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-gray-800 shrink-0 w-24 block">Transfers:</span>
                    <span className="text-gray-600 leading-normal">{pkg.transport}</span>
                  </div>
                </div>

                {/* Highlights checkboxes */}
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Inclusions:</span>
                  <ul className="space-y-2">
                    {pkg.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Package CTA */}
              <div className="p-6 md:p-8 pt-0 border-t border-gray-50">
                <button
                  onClick={() => onOpenInquiry('Umrah Packages', `Interested in ${pkg.title}. Please provide flight configurations, departure options, and total cost reviews.`)}
                  className={`w-full font-bold text-sm py-3 rounded-lg transition-all cursor-pointer ${
                    pkg.id === 'umrah-prem'
                      ? 'bg-gold hover:bg-gold-hover text-slate-950 shadow-md'
                      : 'bg-[#076eff] hover:bg-[#0056cc] text-white'
                  }`}
                >
                  Inquire This Package
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Full spiritual checklist guides */}
      <section className="bg-slate-50 py-16 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Our Spiritual Assurance</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              Performing Umrah is a sacred life-defining milestone. We treat every detail from visa approvals to transport handovers with the highest level of priority to preserve peace of mind for you and your elders.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                  <Hotel className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-950">Guaranteed Near Hotels</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">No misleading hotel details. We book verified coordinates corresponding exactly to Makkah and Madinah blocks listed in your invoice.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-950 font-sans">Complementary Pilgrims Gift Pack</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">Includes compliant drawstring bags, daily prayer guide handbooks, custom shoe bags, Saudi SIM cards, and 5 liters of active Zamzam water bottles.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-950 font-sans">Hassle-Free Saudi eVisa Registry</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">Fast, secure, error-free visa checks registered in less than 24 hours via our direct, certified Saudi Business Agency account.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-emerald-800 rounded-full opacity-35 z-0"></div>
            
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] text-emerald-350 font-bold uppercase tracking-widest block">Mutawwif Scholar Support</span>
              <h3 className="text-xl md:text-2xl font-extrabold leading-tight">Ziyarah Travel Seminars & Guidelines</h3>
              <p className="text-xs md:text-sm text-emerald-100 leading-relaxed font-normal">
                Prior to your departure, our Shariah guide <strong>Mufti Muhammad Imran</strong> conducts interactive, step-by-step physical seminars covering crucial Ihram rules, Tawaf methodologies, and historic battlefield coordinates.
              </p>
              
              <div className="border-t border-emerald-800 pt-6 space-y-2 text-xs text-emerald-150">
                <span className="font-bold text-white block">Interactive Ziyarah Locations covered:</span>
                <span className="block">• Makkah: Cave of Hira, Cave of Thawr, Jabal al-Rahmah (Arafat), Mina tents & Muzdalifah paths.</span>
                <span className="block">• Madinah: Masjid al-Qiblatayn, Mount Uhud battlefield, Masjid Quba & Date Palms Gardens.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
