export interface VisaService {
  id: string;
  title: string;
  description: string;
  features: string[];
  iconName: string;
  ctaText?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  location: string;
  duration: string;
  price: string;
  category: 'International' | 'Domestic' | 'Customized';
  image: string;
  description: string;
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
  included: string[];
  excluded: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  image: string;
  visaType: string;
  processingTime: string;
  stayDuration: string;
  validity: string;
  price: string;
  requiredDocuments: string[];
  faqs: { question: string; answer: string }[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'Visa Updates' | 'Travel Tips' | 'Country Guides' | 'Umrah Guides' | 'Airline News' | 'Travel Insurance Advice';
  summary: string;
  content: string;
  image: string;
  date: string;
  author: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface FAQ {
  id: string;
  category: 'Visa Services' | 'Air Ticketing' | 'Hotel Booking' | 'Umrah' | 'Tour Packages' | 'Travel Insurance';
  question: string;
  answer: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  destination: string;
  notes: string;
  date: string;
  status: 'Pending' | 'Contacted' | 'Closed';
}
