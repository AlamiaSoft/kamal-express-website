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

// SEO helper
import SEO from './components/SEO';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalService, setModalService] = useState('');
  const [modalDestination, setModalDestination] = useState('');

  // Map path to view names for Navbar item active highlighting
  const getCurrentView = (): string => {
    const path = location.pathname;
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/services')) return 'services';
    if (path.startsWith('/umrah')) return 'umrah';
    if (path.startsWith('/tours')) return 'tours';
    if (path.startsWith('/destinations')) return 'destinations';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/contact')) return 'contact';
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

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-950">
      
      {/* Universal header navigation */}
      <Navbar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onOpenInquiry={() => handleOpenInquiry('General Inquiry')} 
      />

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
          
          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Corporate sitemap footer block */}
      <Footer onNavigate={handleNavigate} />

      {/* Dynamic global quick inquiry modal */}
      <InquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        prefilledService={modalService}
        prefilledDestination={modalDestination}
      />

    </div>
  );
}
