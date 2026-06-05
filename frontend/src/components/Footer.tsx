import { Plane, MapPin, Phone, Mail, Clock, MessageCircle, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLink = (view: string, params?: any) => {
    onNavigate(view, params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">

      {/* Upper CTA block */}
      <div className="bg-emerald-850 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
              Ready to Plan Your Next Journey?
            </h3>
            <p className="text-emerald-100 text-sm md:text-base max-w-2xl">
              Get in touch with our certified visa consultants and experienced travel advisors today for a completely free virtual consultation call.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleLink('contact')}
              className="inline-flex items-center gap-2 bg-white text-emerald-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-emerald-50 shadow-md transition-all cursor-pointer"
            >
              Get In Touch <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href="https://wa.me/923000590935?text=Hi%20Kamal%20Express,%20I'm%20visiting%20your%20website%20and%20want%2520to%20know%20more%20about%20visa%20or%20tour%20options."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-current" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Sitemap Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">

          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => handleLink('home')}>
              <img
                src="/logo.jpeg"
                alt="Kamal Express Logo"
                className="h-16 w-auto object-contain bg-white p-1 rounded-md"
              />
            </div>
            <p className="text-sm text-slate-350 leading-relaxed font-normal">
              Award-winning travel, visa, and tourism company based in Pakistan. Offering trusted visa approvals, lowest airfares, luxury hotel stays, and inspiring customized tour packages.
            </p>
            <div className="pt-2 text-xs text-slate-350">
              <span className="font-semibold text-white">Registered Partner:</span> IATA Approved Agency, DTCD (Government of Pakistan), Ministry of Religious Affairs (Hajj-Umrah Certified Registry).
            </div>
          </div>

          {/* Services Links Code */}
          <div className="space-y-4">
            <h4 className="text-white text-base font-semibold tracking-wider uppercase">Our Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => handleLink('services', { serviceId: 'visa-consultancy' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium"
                >
                  Visa Consultancy Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('services', { serviceId: 'air-ticketing' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium"
                >
                  Air Ticketing (Domestic & International)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('services', { serviceId: 'hotel-reservations' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium"
                >
                  Hotel Reservations & Stays
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('services', { serviceId: 'travel-insurance' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium"
                >
                  Global Travel Protection Insurance
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('services', { serviceId: 'visa-appointments' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium"
                >
                  Embassy Slot Booking & Scheduling
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('services', { serviceId: 'apostille-attestation' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium"
                >
                  Apostille & Attestation Services
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Destinations Col */}
          <div className="space-y-4">
            <h4 className="text-white text-base font-semibold tracking-wider uppercase">Top Visa Destinations</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-300">
              <button onClick={() => handleLink('destinations', { slug: 'uae' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">UAE</button>
              <button onClick={() => handleLink('destinations', { slug: 'saudi-arabia' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">Saudi Arabia</button>
              <button onClick={() => handleLink('destinations', { slug: 'turkey' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">Turkey</button>
              <button onClick={() => handleLink('destinations', { slug: 'malaysia' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">Malaysia</button>
              <button onClick={() => handleLink('destinations', { slug: 'thailand' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">Thailand</button>
              <button onClick={() => handleLink('destinations', { slug: 'united-kingdom' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">United Kingdom</button>
              <button onClick={() => handleLink('destinations', { slug: 'europe' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium font-medium">Schengen Europe</button>
              <button onClick={() => handleLink('destinations', { slug: 'canada' })} className="hover:text-emerald-400 transition-colors cursor-pointer text-left font-medium">Canada</button>
            </div>
            <div className="pt-4 space-y-2">
              <h4 className="text-white text-xs font-semibold tracking-wider uppercase">Pilgrimage & Sacred Tours</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li>
                  <button onClick={() => handleLink('umrah')} className="hover:text-emerald-400 transition-colors text-left font-medium">
                    Economy & Premium Umrah Packages
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Coordinates Col */}
          <div className="space-y-4">
            <h4 className="text-white text-base font-semibold tracking-wider uppercase">Kamal Express Office</h4>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Office No. 05, 2nd Floor, Aalay Plaza, 7th Ave, near Kalsoom Hospital, G-6/3 G 6/2 Blue Area, Islamabad, 46000
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>(051) 2726807</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:customercare@kamalexpress.com.pk" className="hover:text-emerald-400 transition-colors font-medium">
                  customercare@kamalexpress.com.pk
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Mon - Sat: 09:00 AM - 06:00 PM</span>
                  <span className="text-xs text-slate-400 block font-normal">Sunday: Closed for maintenance</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub Footer Copyright */}
      <div className="border-t border-slate-800 bg-slate-950/60 py-6 px-4 text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-normal">
          <p>© {currentYear} Kamal Express. All rights reserved. Registered DTCD License 3546/ISB.</p>
          <div className="flex gap-4 text-slate-300">
            <button onClick={() => handleLink('about')} className="hover:text-emerald-400 transition-colors font-medium">Our Story</button>
            <span>•</span>
            <button onClick={() => handleLink('contact')} className="hover:text-emerald-400 transition-colors font-medium">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => handleLink('contact')} className="hover:text-emerald-400 transition-colors font-medium">Terms of Service</button>
          </div>
        </div>
      </div>

    </footer>
  );
}
