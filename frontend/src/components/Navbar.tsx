import { useState } from 'react';
import { Menu, X, ChevronDown, Phone, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenInquiry: () => void;
}

export default function Navbar({ currentView, onNavigate, onOpenInquiry }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(false);

  const handleNavLink = (view: string, params?: any) => {
    onNavigate(view, params);
    setIsOpen(false);
    setServicesOpen(false);
    setToursOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-xs">
      {/* Top Banner Contact bar */}
      <div className="bg-emerald-800 text-white text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> (051) 2726807
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">customercare@kamalexpress.com.pk</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Hours: Mon-Sat 09:00 AM - 06:00 PM</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/923000590935?text=${encodeURIComponent("Hi Kamal Express, I would like to inquire about your services.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" /> Fast WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Primary Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Brand */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavLink('home')}>
            <img
              className="h-14 w-auto object-contain rounded-md"
              src="/logo.jpeg"
              alt="Kamal Express Logo"
            />
          </div>

          {/* Large Screen Nav Menu */}
          <nav className="hidden lg:flex space-x-1 xl:space-x-4 items-center">

            {/* Home */}
            <button
              onClick={() => handleNavLink('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home'
                ? 'text-emerald-700 bg-emerald-50/50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
            >
              Home
            </button>

            {/* About Us */}
            <button
              onClick={() => handleNavLink('about')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'about'
                ? 'text-emerald-700 bg-emerald-50/50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
            >
              About Us
            </button>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setServicesOpen(true)}
                onClick={() => handleNavLink('services')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'services'
                  ? 'text-emerald-700 bg-emerald-50/50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Box */}
              {servicesOpen && (
                <div
                  className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-white border border-gray-100 ring-1 ring-black/5 py-1 z-50 divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-100"
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    onClick={() => handleNavLink('services', { serviceId: 'visa-consultancy' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Visa Consultancy
                  </button>
                  <button
                    onClick={() => handleNavLink('services', { serviceId: 'air-ticketing' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Air Ticketing
                  </button>
                  <button
                    onClick={() => handleNavLink('services', { serviceId: 'hotel-reservations' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Hotel Reservation
                  </button>
                  <button
                    onClick={() => handleNavLink('services', { serviceId: 'travel-insurance' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Travel Insurance
                  </button>
                  <button
                    onClick={() => handleNavLink('services', { serviceId: 'visa-appointments' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Visa Appointments
                  </button>
                  <button
                    onClick={() => handleNavLink('services', { serviceId: 'apostille-attestation' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Apostille & Attestation
                  </button>
                </div>
              )}
            </div>

            {/* Umrah */}
            <button
              onClick={() => handleNavLink('umrah')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'umrah'
                ? 'text-emerald-700 bg-emerald-50/50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
            >
              Umrah
            </button>

            {/* Tours Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setToursOpen(true)}
                onClick={() => handleNavLink('tours')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'tours'
                  ? 'text-emerald-700 bg-emerald-50/50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
              >
                Tours
                <ChevronDown className={`w-4 h-4 transition-transform ${toursOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Box */}
              {toursOpen && (
                <div
                  className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white border border-gray-100 ring-1 ring-black/5 py-1 z-50 divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-100"
                  onMouseLeave={() => setToursOpen(false)}
                >
                  <button
                    onClick={() => handleNavLink('tours', { category: 'International' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    International Tours
                  </button>
                  <button
                    onClick={() => handleNavLink('tours', { category: 'Domestic' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Domestic Tours
                  </button>
                  <button
                    onClick={() => handleNavLink('tours', { category: 'Customized' })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Customized Tours
                  </button>
                </div>
              )}
            </div>

            {/* Destinations */}
            <button
              onClick={() => handleNavLink('destinations')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'destinations'
                ? 'text-emerald-700 bg-emerald-50/50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
            >
              Destinations
            </button>

            {/* Blog */}
            <button
              onClick={() => handleNavLink('blog')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'blog'
                ? 'text-emerald-700 bg-emerald-50/50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
            >
              Blog
            </button>

            {/* Contact */}
            <button
              onClick={() => handleNavLink('contact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'contact'
                ? 'text-emerald-700 bg-emerald-50/50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
            >
              Contact
            </button>

          </nav>

          {/* Quick Inquiry Button */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={onOpenInquiry}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-bold text-slate-950 bg-gold hover:bg-gold-hover shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
            >
              Free Consultation
            </button>
          </div>

          {/* Hamburger Menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-left">
            <button
              onClick={() => handleNavLink('home')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold ${currentView === 'home' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavLink('about')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold ${currentView === 'about' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              About Us
            </button>

            {/* Mobile Services list */}
            <div>
              <div className="px-3 py-2 font-semibold text-gray-400 text-xs tracking-wider uppercase">
                Our Services
              </div>
              <div className="pl-4 space-y-1">
                <button
                  onClick={() => handleNavLink('services', { serviceId: 'visa-consultancy' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Visa Consultancy
                </button>
                <button
                  onClick={() => handleNavLink('services', { serviceId: 'air-ticketing' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Air Ticketing
                </button>
                <button
                  onClick={() => handleNavLink('services', { serviceId: 'hotel-reservations' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Hotel Reservation
                </button>
                <button
                  onClick={() => handleNavLink('services', { serviceId: 'travel-insurance' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Travel Insurance
                </button>
                <button
                  onClick={() => handleNavLink('services', { serviceId: 'visa-appointments' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Visa Appointments
                </button>
                <button
                  onClick={() => handleNavLink('services', { serviceId: 'apostille-attestation' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Apostille & Attestation
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavLink('umrah')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold ${currentView === 'umrah' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              Umrah Pilgrimage
            </button>

            {/* Mobile Tours list */}
            <div>
              <div className="px-3 py-2 font-semibold text-gray-400 text-xs tracking-wider uppercase">
                Tour Packages
              </div>
              <div className="pl-4 space-y-1">
                <button
                  onClick={() => handleNavLink('tours', { category: 'International' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  International Tours
                </button>
                <button
                  onClick={() => handleNavLink('tours', { category: 'Domestic' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Domestic Tours
                </button>
                <button
                  onClick={() => handleNavLink('tours', { category: 'Customized' })}
                  className="block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                >
                  Customized Tours
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavLink('destinations')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold ${currentView === 'destinations' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              Destinations
            </button>

            <button
              onClick={() => handleNavLink('blog')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold ${currentView === 'blog' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              Blog
            </button>

            <button
              onClick={() => handleNavLink('contact')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold ${currentView === 'contact' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
            >
              Contact
            </button>

            <div className="pt-4 pb-2 px-3">
              <button
                onClick={() => {
                  onOpenInquiry();
                  setIsOpen(false);
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-base font-bold text-slate-950 bg-gold hover:bg-gold-hover shadow-xs cursor-pointer"
              >
                Free Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
