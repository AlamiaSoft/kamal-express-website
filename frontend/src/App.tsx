import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InquiryModal from './components/InquiryModal';

// Views
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ServicesView from './components/ServicesView';
import UmrahView from './components/UmrahView';
import ToursView from './components/ToursView';
import DestinationsView from './components/DestinationsView';
import BlogView from './components/BlogView';
import ContactView from './components/ContactView';
import AdminView from './components/AdminView';

// SEO helper
import SEO from './components/SEO';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAladminSubdomain = 
    window.location.hostname.startsWith('aladmin') || 
    window.location.hostname.includes('aladmin');
    
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalService, setModalService] = useState('');
  const [modalDestination, setModalDestination] = useState('');

  // Map path to view names for Navbar item active highlighting
  const getCurrentView = (): string => {
    if (isAladminSubdomain) return 'admin';

    const path = location.pathname;
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/services')) return 'services';
    if (path.startsWith('/umrah')) return 'umrah';
    if (path.startsWith('/tours')) return 'tours';
    if (path.startsWith('/destinations')) return 'destinations';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/admin')) return 'admin';
    return 'home';
  };

  const handleNavigate = (view: string, params: any = null) => {
    let path = '/';
    if (view === 'about') {
      path = '/about';
    } else if (view === 'services') {
      path = params?.serviceId ? `/services/${params.serviceId}` : '/services';
    } else if (view === 'umrah') {
      path = '/umrah';
    } else if (view === 'tours') {
      if (params?.category) {
        path = params?.selectedTourId ? `/tours/${params.category}/${params.selectedTourId}` : `/tours/${params.category}`;
      } else {
        path = '/tours';
      }
    } else if (view === 'destinations') {
      path = params?.slug ? `/destinations/${params.slug}` : '/destinations';
    } else if (view === 'blog') {
      path = params?.slug ? `/blog/${params.slug}` : '/blog';
    } else if (view === 'contact') {
      path = '/contact';
    }

    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenInquiry = (service: string = '', destination: string = '') => {
    setModalService(service);
    setModalDestination(destination);
    setIsModalOpen(true);
  };

  const currentView = getCurrentView();

  if (isAladminSubdomain) {
    return (
      <div className="min-h-screen bg-[#f8f7fa] text-slate-800 font-sans flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-950">
        <SEO 
          title="CRM Staff Portal - Kamal Express" 
          description="Internal CRM portal for staff members to access inquiry records."
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<AdminView />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-950">
      
      {/* Universal header navigation */}
      {currentView !== 'admin' && (
        <Navbar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          onOpenInquiry={() => handleOpenInquiry('General Inquiry')} 
        />
      )}

      {/* Main routing views */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <>
              <SEO 
                title="Home - Approved Visas, Lowest Fares & Custom Tours" 
                description="Kamal Express is Pakistan's premium visa consulting, air ticketing, hotel booking, and pilgrimage Umrah caravan service agency in Islamabad Blue Area."
                keywords="visa consultancy Islamabad, travel agency Blue Area, Umrah packages Pakistan, discount flights Islamabad"
              />
              <HomeView onNavigate={handleNavigate} onOpenInquiry={handleOpenInquiry} />
            </>
          } />
          
          <Route path="/about" element={
            <>
              <SEO 
                title="About Us - Decades of Travel Industry Heritage" 
                description="Learn about the history, vision, and Mufti-led leadership team of Kamal Express, a certified IATA and Ministry-licensed agency."
              />
              <AboutView />
            </>
          } />
          
          <Route path="/services" element={
            <>
              <SEO 
                title="Our Services - Visa Consulting, Tickets & Lodging" 
                description="Explore our core ticketing, hotel reservation, travel insurance, apostille stamp verification, and embassy slot coordinates."
              />
              <ServicesView onOpenInquiry={(s) => handleOpenInquiry(s)} />
            </>
          } />
          
          <Route path="/services/:serviceId" element={
            <>
              <SEO 
                title="Services - Detailed Visa, Fares & Protection Guidelines" 
                description="Explore our core ticketing, hotel reservation, travel insurance, apostille stamp verification, and embassy slot coordinates."
              />
              <ServicesView onOpenInquiry={(s) => handleOpenInquiry(s)} />
            </>
          } />
          
          <Route path="/umrah" element={
            <>
              <SEO 
                title="Umrah Packages - Economy & Premium Haram Caravan Plans" 
                description="Book custom boutique 3-Star, 4-Star, and Grand 5-Star clock tower near-Haram Umrah groups. Direct support and Shariah guide review."
              />
              <UmrahView onOpenInquiry={(s, notes) => handleOpenInquiry(s, notes)} />
            </>
          } />
          
          <Route path="/tours" element={
            <>
              <SEO 
                title="Tours & Holiday Packages - Leisure Explorations" 
                description="Book top-rated customizable domestic and international vacation itineraries with dedicated transit drivers and expert guides."
              />
              <ToursView onOpenInquiry={(s, notes) => handleOpenInquiry(s, notes)} />
            </>
          } />
          
          <Route path="/tours/:category" element={
            <>
              <SEO 
                title="Tours Packages - Customized Vacation Retributions" 
                description="Book top-rated customizable domestic and international vacation itineraries with dedicated transit drivers and expert guides."
              />
              <ToursView onOpenInquiry={(s, notes) => handleOpenInquiry(s, notes)} />
            </>
          } />
          
          <Route path="/tours/:category/:selectedTourId" element={
            <>
              <SEO 
                title="Tour Itinerary Details - Kamal Express" 
                description="Book top-rated customizable domestic and international vacation itineraries with dedicated transit drivers and expert guides."
              />
              <ToursView onOpenInquiry={(s, notes) => handleOpenInquiry(s, notes)} />
            </>
          } />
          
          <Route path="/destinations" element={
            <>
              <SEO 
                title="Destinations & Visa Rules - Embassy Guidelines" 
                description="Search visa requirements, fee indexes, valid stays, and required documents for UAE, UK, Schengen, Turkey, Canada, and more."
              />
              <DestinationsView onOpenInquiry={handleOpenInquiry} />
            </>
          } />
          
          <Route path="/destinations/:slug" element={
            <>
              <SEO 
                title="Visa Requirements & Guidelines - Kamal Express" 
                description="Search visa requirements, fee indexes, valid stays, and required documents for UAE, UK, Schengen, Turkey, Canada, and more."
              />
              <DestinationsView onOpenInquiry={handleOpenInquiry} />
            </>
          } />
          
          <Route path="/blog" element={
            <>
              <SEO 
                title="Blog, Travel Updates & Handbooks - Kamal Express" 
                description="Read international visa update notifications, physical Umrah check packing handbooks, and luggage baggage travel tips."
              />
              <BlogView onNavigate={handleNavigate} onOpenInquiry={(s) => handleOpenInquiry(s)} />
            </>
          } />
          
          <Route path="/blog/:slug" element={
            <>
              <SEO 
                title="Blog & Update Details - Kamal Express" 
                description="Read international visa update notifications, physical Umrah check packing handbooks, and luggage baggage travel tips."
              />
              <BlogView onNavigate={handleNavigate} onOpenInquiry={(s) => handleOpenInquiry(s)} />
            </>
          } />
          
          <Route path="/contact" element={
            <>
              <SEO 
                title="Contact Us - Corporate Office Blue Area Islamabad" 
                description="Visit our office at Aalay Plaza Blue Area, call (051) 2726807, or submit a priority contact ticket for quick support response."
              />
              <ContactView />
            </>
          } />
          
          <Route path="/admin" element={
            isLocalhost ? (
              <>
                <SEO 
                  title="CRM Staff Portal - Kamal Express" 
                  description="Internal CRM portal for staff members to access inquiry records."
                />
                <AdminView />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />
          
          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Corporate sitemap footer block */}
      {currentView !== 'admin' && <Footer onNavigate={handleNavigate} />}

      {/* Dynamic global quick inquiry modal */}
      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        prefilledService={modalService}
        prefilledDestination={modalDestination}
      />

      {/* Sticky WhatsApp branded floating button */}
      {currentView !== 'admin' && (
        <a
          href={`https://wa.me/923000590935?text=${encodeURIComponent("Hi Kamal Express, I would like to inquire about your services.")}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" fillRule="evenodd"></path>
          </svg>
          <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md">
            Chat on WhatsApp
          </span>
        </a>
      )}

    </div>
  );
}
