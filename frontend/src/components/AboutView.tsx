import { Shield, Sparkles, Building2, MapPin, Eye, Compass, Users2, Award } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="space-y-16 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <section className="relative bg-slate-950 py-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop" 
            alt="Travel background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/90"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Our Story & Guiding Principles</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Pioneering seamless visa consultancies, pilgrimage journeys, and custom leisure tours for corporate and leisure clients across Pakistan.
          </p>
        </div>
      </section>

      {/* 2. Core Story Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              The Journey of Kamal Express
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-normal">
              <p>
                Founded with a dedicated mission to simplify complicated visa routes and optimize sky travel fares, <strong>Kamal Express</strong> has evolved from a boutique ticketing agency into raw power inside Islamabad's Blue Area travel ecosystem. 
              </p>
              <p>
                From our corporate offices inside Aalay Plaza, Blue Area, we have successfully drafted thousands of application folders representing tourist, business, student, and family migration streams. We maintain active direct integration with major regional and global travel networks, unlocking discounted wholesale room supplies and secure transport lines for our pilgrims.
              </p>
              <p>
                We do not just hand over itinerary plans; we take complete end-to-end accountability. That means checking your active bank records prior to dossier submission, conducting live mock physical interviews, scheduling biometric checkpoints early, and having physical on-ground coordinators travel alongside our Umrah and Northern Area retreat caravans.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" 
              alt="Airplane window view" 
              className="w-full h-full object-cover"
            />
            {/* Embedded stats badge */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xs rounded-xl p-5 shadow-lg border border-gray-100 flex items-center justify-around">
              <div>
                <span className="block text-2xl font-bold text-emerald-700">18K+</span>
                <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Approved Visas</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <span className="block text-2xl font-bold text-emerald-700">100%</span>
                <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Hassle Free Stays</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision & Mission Cards */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-950">Our Vision</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              To be recognized as the most reliable, transparent, and profile-focused travel consulting agency in South Asia, enabling hassle-free visual gateways to the world while preserving authentic spiritual and cultural exploration values.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-950">Our Mission</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              To deliver pristine flight ticketing, customized near-Haram Umrah logistics, and comprehensive, highly audited visa consultancy operations that maximize success ratios through personalized profiles, transparent pricing, and stellar direct physical care.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Strategic Team Profiles (Hidden for now) */}
      {/*
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase">
            <Users2 className="w-3.5 h-3.5" /> Team Excellence
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Meet Our Travel Experts</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
            Driven by senior visa consultants and certified religious advisors with centuries of combined operations intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-xs flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <span className="block text-xs font-bold text-emerald-700 uppercase">Founder & CEO</span>
              <h3 className="text-lg font-bold text-gray-950">Sohail Kamal</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                A pioneer in international visa consultancy and business trip modeling. Sohail personally audits all complex Schengen, Canadian, and UK files.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-gray-100 text-xs text-gray-400">
              Email: <span className="text-gray-700 font-semibold">sohail@kamalexpress.com.pk</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-xs flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <span className="block text-xs font-bold text-emerald-700 uppercase">Director of Air Ticketing & Global Tours</span>
              <h3 className="text-lg font-bold text-gray-950">Amir Sohail</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                An expert on global aviation ticketing loops, consolidator pricing grids, and local customized tourism logistics in Pakistan.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-gray-100 text-xs text-gray-400">
              Email: <span className="text-gray-700 font-semibold">amir@kamalexpress.com.pk</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-xs flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <span className="block text-xs font-bold text-emerald-700 uppercase">Chief Shariah Umrah Counselor</span>
              <h3 className="text-lg font-bold text-gray-950">Mufti Muhammad Imran</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reviews all customized and economic caravan setups to ensure seamless conformity with Islamic pilgrimage rites and scholar guidelines.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-gray-100 text-xs text-gray-400">
              Role: <span className="text-gray-700 font-semibold">Ziyarah Guide Leadership</span>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* 5. Certifications & Badges */}
      <section className="bg-slate-100/60 py-16 border-y border-gray-150 text-center space-y-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">National & International Licenses</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Approved by respective aviation & tourism ministry boards</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3.5 border border-gray-150 shadow-2xs">
              <Award className="w-6 h-6 text-emerald-700 font-bold shrink-0" />
              <div className="text-left leading-normal">
                <span className="block text-xs font-bold text-gray-800">IATA Accredited</span>
                <span className="block text-[10px] text-gray-400">International Aviation Partner</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3.5 border border-gray-150 shadow-2xs">
              <Building2 className="w-6 h-6 text-emerald-700 font-bold shrink-0" />
              <div className="text-left leading-normal">
                <span className="block text-xs font-bold text-gray-800">DTCD Certified</span>
                <span className="block text-[10px] text-gray-400">Department of Tourist Services Pakistan</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3.5 border border-gray-150 shadow-2xs">
              <Shield className="w-6 h-6 text-emerald-700 font-bold shrink-0" />
              <div className="text-left leading-normal">
                <span className="block text-xs font-bold text-gray-800">Ministry of Umrah</span>
                <span className="block text-[10px] text-gray-400">Licensed Group Tour Integrator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
