import { Destination, TourPackage, BlogPost, FAQ, VisaService } from './types';

export const VISA_SERVICES: VisaService[] = [
  {
    id: 'visa-consultancy',
    title: 'Visa Consultancy',
    description: 'Navigate international travel with confidence through our expert visa consultancy in Pakistan. At Kamal Express & Holidays, we minimize rejection risks with our rigorous document pre-screening and professional visa assistance. Whether for business or tourism, our experts streamline your path to approval.',
    features: [
      'Expert Visa Eligibility Assessment in Pakistan',
      'Professional Visa Document Pre-Screening Services',
      'End-to-End Visa Application Management',
      'Specialized Visa Interview Preparation & Coaching'
    ],
    iconName: 'FileText',
    ctaText: 'Get your customized visa consultation today.'
  },
  {
    id: 'air-ticketing',
    title: 'Air Ticketing',
    description: 'Secure the best travel deals with our comprehensive air ticketing services in Pakistan. At Kamal Express & Holidays, we leverage our global partnerships to provide competitive fares on international and domestic flights. Enjoy a smooth, reliable booking experience tailored exactly to your itinerary requirements.',
    features: [
      'Competitive International Flight Booking',
      'Affordable Domestic Air Ticketing Solutions',
      'Real-Time Flight Schedule & Price Alerts',
      'Seamless Group & Corporate Travel Ticketing'
    ],
    iconName: 'Plane',
    ctaText: 'Book Your Flights Today'
  },
  {
    id: 'hotel-reservations',
    title: 'Hotel Reservations',
    description: 'Experience stress-free stays with our premium hotel booking services in Pakistan and beyond. At Kamal Express & Holidays, we curate a selection of luxury and budget accommodations to ensure your comfort is our priority. From international hotel reservations to boutique local stays, we guarantee the best rates for your journey.',
    features: [
      'Best Hotel Deals & Competitive Rates',
      'Global Luxury & Budget Hotel Reservations',
      'Verified Accommodation & Trusted Stays',
      'Customized Hotel Packages for Business & Leisure'
    ],
    iconName: 'Hotel',
    ctaText: 'Find Your Perfect Stay'
  },
  {
    id: 'travel-insurance',
    title: 'Travel Insurance',
    description: 'Comprehensive global travel protection plans covering medical emergencies, baggage loss, trip delays, and visa requirements.',
    features: [
      'Schengen-compliant policies accepted by major embassies',
      'Emergency medical evacuations and overseas hospitalization support',
      'Immediate claim assistance and multi-trip policy alternatives',
      'Specialized packages for students, families, and high-altitude treks'
    ],
    iconName: 'ShieldCheck'
  },
  {
    id: 'visa-appointments',
    title: 'Visa Appointments',
    description: 'Efficient booking and scheduling systems for biometrics, interview drop-box, and physical interviews across different embassies.',
    features: [
      'Early slot alerts and schedule monitoring systems',
      'Biometric scheduling assistance for VFS Global, TLS contact, and BLS',
      'Physical mock interviews and professional prep calls',
      'Drop-box profile eligibility assessment and sorting'
    ],
    iconName: 'Calendar'
  },
  {
    id: 'apostille-attestation',
    title: 'Apostille & Attestation',
    description: 'Secure, hassle-free clearance and document verification services from chambers of commerce, MOFA, and embassies.',
    features: [
      'Attestation services for degrees, transcripts, and marriage certificates',
      'MOFA (Ministry of Foreign Affairs) authorized routing',
      'Speedy processing pathways for urgent student intakes',
      'Confidential document tracking systems with secure courier handover'
    ],
    iconName: 'FileCheck'
  }
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'dest-uae',
    name: 'United Arab Emirates (UAE)',
    slug: 'uae',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    visaType: 'Tourist eVisa (30 Days / 60 Days)',
    processingTime: '2 - 3 Working Days',
    stayDuration: '30 or 60 Days from entry',
    validity: '60 Days from issuance date',
    price: 'USD 110',
    requiredDocuments: [
      'Clear, scanned copy of Passport’s first/second pages (minimum 6 months validity)',
      'Scanned passport-sized photograph with a white background',
      'Confirmed return flight tickets (recommended)',
      'Proof of accommodation or host credentials'
    ],
    faqs: [
      {
        question: 'Can I extend my UAE tourist visa within the country?',
        answer: 'Yes, UAE visa rules permit inside-country extensions of up to 30 additional days twice. Our team can process this for you seamlessly without exit.'
      },
      {
        question: 'Is a bank statement required for a UAE tourist visa?',
        answer: 'For standard 30 and 60 days tourist eVisas, a formal bank statement is generally not requested from tourists of most South Asian or Commonwealth passports, but having general travel funds is advised.'
      }
    ]
  },
  {
    id: 'dest-saudi',
    name: 'Saudi Arabia',
    slug: 'saudi-arabia',
    image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76ae?q=80&w=800&auto=format&fit=crop',
    visaType: 'Tourist / Umrah eVisa',
    processingTime: '1 - 2 Working Days',
    stayDuration: '90 Days',
    validity: '1 Year (Multiple Entry) or 90 Days (Single Entry)',
    price: 'USD 140',
    requiredDocuments: [
      'Valid passport passport with at least 6 months validity',
      'Recent color passport-sized digital photograph with white background',
      'Active medical coverage (included automatically in eVisa fee)',
      'Schengen/UK/US visa holder details if qualifying for tourist eVisa'
    ],
    faqs: [
      {
        question: 'Can I perform Umrah with a Saudi Tourist eVisa?',
        answer: 'Yes, tourists holding a Saudi multiple-entry tourist eVisa or single-entry eVisa are fully permitted to perform Umrah. No hidden pilgrimage upgrades are required.'
      },
      {
        question: 'Who qualifies for the direct Saudi eVisa?',
        answer: 'Citizens of GCC countries, select developed markets (USA, EU, UK, Canada, Japan, etc.), or individuals holding an active, used US, UK or Schengen business/tourist visa qualify for Saudi eVisa.'
      }
    ]
  },
  {
    id: 'dest-turkey',
    name: 'Turkey',
    slug: 'turkey',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop',
    visaType: 'Sticker Tourist/Business Visa & eVisa',
    processingTime: '10 - 15 Working Days',
    stayDuration: '30 Days (Single Entry)',
    validity: '90 Days from issuance date',
    price: 'USD 195 (Sticker Service Fee Included)',
    requiredDocuments: [
      'Original Passport + old passports (6 months valid)',
      'Biometric photo size 5x5 cm (white background)',
      'Verified bank statement with a strong balance (minimum 6 months) + Account maintenance letter',
      'Work source validation (Salary slips, Chamber of commerce registration, tax filings)',
      'Hotel & Flight bookings'
    ],
    faqs: [
      {
        question: 'Who can apply for a Turkey eVisa?',
        answer: 'Passport holders from eligible developing markets with a valid Schengen, UK, or US sticker visa or residence permit can apply for single entry Turkey eVisa online. Others must submit sticker files via official visa centers.'
      },
      {
        question: 'What is the required minimum bank balance for a Turkey visa?',
        answer: 'We generally suggest maintaining a clear, consistent closing balance equivalent to USD 3,000 to USD 5,500 per applicant, accompanied by matching source-of-income proof.'
      }
    ]
  },
  {
    id: 'dest-malaysia',
    name: 'Malaysia',
    slug: 'malaysia',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?q=80&w=800&auto=format&fit=crop',
    visaType: 'eVisa (Tourist / Business)',
    processingTime: '3 - 5 Working Days',
    stayDuration: '30 Days',
    validity: '90 Days',
    price: 'USD 65',
    requiredDocuments: [
      'Clear digital scan of passport information and cover pages',
      'High-quality digital photograph (white solid background)',
      'Confirmed return flight tickets with booking reference code',
      'Proof of hotel bookings or travel plan timeline',
      'Recent 3-months bank statement proving adequate financial capability'
    ],
    faqs: [
      {
        question: 'Is MDAC traveler card required for Malaysia?',
        answer: 'Yes, all foreign travelers entering Malaysia must fill out the Malaysia Digital Arrival Card (MDAC) within 3 days prior to their arrival date. We assist our clients with this registration.'
      },
      {
        question: 'What happens if my eVisa gets delayed?',
        answer: 'Delays are generally associated with blur document uploads. If any document is rejected, we re-compile and re-upload inside our priority business panel.'
      }
    ]
  },
  {
    id: 'dest-thailand',
    name: 'Thailand',
    slug: 'thailand',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop',
    visaType: 'Sticker Visa / Destination Thailand Visa (DTV) / eVisa',
    processingTime: '7 - 10 Working Days',
    stayDuration: '60 Days',
    validity: '90 Days (Single) or 180 Days (Multiple)',
    price: 'USD 85 (Sticker Single)',
    requiredDocuments: [
      'Original passport (minimum 6 months valid)',
      'Two recent photos (white background size 3.5 x 4.5 cm)',
      'Detailed bank statement (6-month history showing active transactions & account maintenance certificate)',
      'Employment confirmation letter showing salary and title',
      'Confirmed return air tickets & reserve credentials for transit hotels'
    ],
    faqs: [
      {
        question: 'How long can I stay on a Thailand sticker visa?',
        answer: 'Thailand sticker visas grant a 60-day maximum stay period that can be extended once by an additional 30 days at an immigration center in Thailand.'
      }
    ]
  },
  {
    id: 'dest-uk',
    name: 'United Kingdom (UK)',
    slug: 'united-kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?q=80&w=800&auto=format&fit=crop',
    visaType: 'Standard Visitor Visa (6 Months / 2 Years)',
    processingTime: '15 - 20 Working Days',
    stayDuration: '6 Months (Multiple Entry)',
    validity: '6 Months to up to 10 Years',
    price: 'USD 240 (6 Months Embassy Fee Extra)',
    requiredDocuments: [
      'Current passport valid with blank pages for sticker visa placement',
      'Tax filings, income pay-slips (6 months) or verified audit report for companies',
      'Bank statement (6 months) with strong, verifiable, and consistent balances',
      'Family registration certificate & property papers (if highlighting ties to home country)',
      'Detailed daily itinerary outline + explanation statement of intent letter'
    ],
    faqs: [
      {
        question: 'What is the UK Visa Application Centre process?',
        answer: 'You will need to attend an in-person biometrics appointment at VFS Global. We look after all slot scheduling, scanning your support documents, and composing your summary sheets.'
      }
    ]
  },
  {
    id: 'dest-europe',
    name: 'Schengen Europe',
    slug: 'europe',
    image: 'https://images.unsplash.com/photo-1473984849538-57b96953771d?q=80&w=800&auto=format&fit=crop',
    visaType: 'Schengen C-Type short stay visa',
    processingTime: '15 - 30 Working Days',
    stayDuration: 'Depends on Travel Plans (Up to 90 Days)',
    validity: 'Up to 90 days stay within any 180-day period',
    price: 'USD 280 (Full preparation including appointment scheduling)',
    requiredDocuments: [
      'Valid passport (minimum 2 blank pages and 6-month validity after returning)',
      'National ID card + Family registration certificate (FRC)',
      'Biometric Schengen-compliant photos (white background, glossy finish)',
      'Compliant travel insurance coverage minimum equivalent of EUR 30,000',
      'Strongly structured personal cover letter outlining daily tour structure and return pledge'
    ],
    faqs: [
      {
        question: 'Which country embassy should I apply through?',
        answer: 'You must apply to the embassy of the country where you will spend the maximum duration of stay. If duration is equal, your entry point country will host the application.'
      }
    ]
  },
  {
    id: 'dest-canada',
    name: 'Canada',
    slug: 'canada',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop',
    visaType: 'Temporary Resident Visa (TRV) / Visitor Visa',
    processingTime: '30 - 45 Working Days',
    stayDuration: 'Up to 6 Months per entry',
    validity: 'Up to 10 Years (or until passport expiry)',
    price: 'USD 260 (Consultancy & Digital Profile Setup)',
    requiredDocuments: [
      'All current and expired passports scans',
      'National ID (CNIC) translated and aligned details',
      'Comprehensive bank statements (last 6 months) including business registration files if self-employed',
      'Provable assets (commercial/residential property values, savings certifications)',
      'FRC (Family Registration Certificate) and MRC (Marriage Registration Certificate)'
    ],
    faqs: [
      {
        question: 'Is Canada visitor visa processed online?',
        answer: 'Yes, Canadian tourist visas are processed entirely online via the IRCC portal. Biometrics are captured afterward at a local VFS Global desk.'
      }
    ]
  }
];

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: 'tour-turkey',
    title: 'Scenic Wonders of Turkey',
    location: 'Istanbul, Cappadocia & Antalya',
    duration: '8 Days & 7 Nights',
    price: '$799',
    category: 'International',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop',
    description: 'A magical journey through history and geography. Witness the architectural gems of Istanbul and take an unforgettable hot-air balloon ride in Cappadocia.',
    highlights: [
      'Hot air balloon flight over Cappadocia’s fairy chimneys',
      'Full day guided tour of legendary Blue Mosque, Hagia Sophia & Grand Bazaar',
      'Evening dinner cruise on the beautiful Bosphorus Strait',
      'Cave hotel luxury accommodation options in Goreme'
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Istanbul', description: 'Meet and assist on arrival. Transfer to the boutique hotel. Leisure evening with optional Bosphorus dinner walk.' },
      { day: 2, title: 'Historic Istanbul Landmarks Tour', description: 'Visits to Topkapi Palace, Hagia Sophia monument, Blue Mosque, and the sprawling Grand Bazaar with an English-certified guide.' },
      { day: 3, title: 'Bosphorus Cruise & Cappadocia Flyout', description: 'Bosphorus boat tour followed by flight to Cappadocia. Check in to classic volcanic cave suites.' },
      { day: 4, title: 'Hot Air Balloons & Fairy Chimneys', description: 'Early morning hot-air balloon ride. Red tour around Goreme Open Air Museum and volcanic valleys.' },
      { day: 5, title: 'Antalya Coastal Flight & Leisure', description: 'Fly to Antalya, the resort coastal city. Walk through Kaleici (Old Town) and historic marina.' },
      { day: 6, title: 'Waterfalls & Beach Retreat', description: 'Scenic boat ride near Duden Waterfalls. Enjoy private leisure beaches and regional Mediterranean dinners.' },
      { day: 7, title: 'Return to Istanbul Shopping Peak', description: 'Fly back to Istanbul. Afternoon free for luxury shopping plazas and modern spice markets.' },
      { day: 8, title: 'Airport Departure', description: 'Private transfer to Istanbul Airport for onward homebound flights.' }
    ],
    included: [
      '4-Star standard hotels / Boutique Cave suites (Double share)',
      'Daily breakfast buffet + 2 premium dinners',
      'All internal airport transfers via luxury private coaches',
      'Schengen or Turkey expert visa drafting assistance',
      'Experienced local multilingual tour guide'
    ],
    excluded: [
      'International flights tickets (available on request)',
      'Turkey sticker visa embassy fee',
      'Personal dynamic expenditures (laundry, specific tips)'
    ]
  },
  {
    id: 'tour-dubai',
    title: 'Modern Luxury Dubai Experience',
    location: 'Burj Khalifa, Desert Safari & Marina Shoreline',
    duration: '5 Days & 4 Nights',
    price: '$450',
    category: 'International',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    description: 'Indulge in futuristic skylines, expansive sand architectures, luxury cruises, and shopping sprees in the world’s most exciting oasis.',
    highlights: [
      'Burj Khalifa 124th & 125th floor premium deck entry tickets',
      'Adventure 4x4 red dune desert safari + traditional BBQ belly dance show',
      'Modern glass-bottom luxury yacht tour around Dubai Marina',
      'Exclusive day access pass to Aquaventure Waterpark'
    ],
    itinerary: [
      { day: 1, title: 'Welcome to Dubai Luxury', description: 'Transfer to your high-floor suite at Dubai Marina. Evening walk through Marina Promenade walkways.' },
      { day: 2, title: 'Futuristic City Sights & Burj Peak', description: 'Explore Jumeirah Mosque, Burj Al Arab hotel views, and access top viewing deck of Burj Khalifa.' },
      { day: 3, title: 'Red Dune Safari Expedition', description: 'Thrill land bashing over high dunes, camel rides, Arabic costumes photography, and Arabian BBQ banquet under the stars.' },
      { day: 4, title: 'Mall of the Emirates & Marina Yacht Cruise', description: 'Enjoy duty-free shopping and evening luxury private class yacht cruise with executive foods.' },
      { day: 5, title: 'Departure Flight', description: 'Relax at your hotel. Transfer to Dubai International Airport (DXB).' }
    ],
    included: [
      '4 nights accommodation in a 4-Star deluxe room',
      'Everyday breakfast buffer in hotel + Safari BBQ feast',
      'Visa process documentation fees (eVisa included)',
      'All local transfers via private air-conditioned vehicles'
    ],
    excluded: [
      'Aero flight tickets (We quote best rate based on your dates)',
      'Tourism Dirham tax paid directly to the hotel (Approx $4/night)'
    ]
  },
  {
    id: 'tour-thailand',
    title: 'Phuket & Krabi Coastal Escape',
    location: 'Phuket Island & Krabi Seaside Caves',
    duration: '7 Days & 6 Nights',
    price: '$499',
    category: 'International',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop',
    description: 'Lounge on white sand shores, speed among high-rising karst formations, dive into clear emerald waters, and explore bustling night bazaars.',
    highlights: [
      'Phi Phi Islands speedboat day tour with snorkeling and buffet lunch',
      'Four Islands longtail boat experience in scenic Krabi',
      'Elephant sanctuary ethical interaction experience',
      'Explore Patong Night Market and cultural theater'
    ],
    itinerary: [
      { day: 1, title: 'Welcome to Phuket Resort Stay', description: 'Airport transfer to luxury Patong Beach Resort. Private evening tour around vibrant street food bazaars.' },
      { day: 2, title: 'Phi Phi & Maya Bay Speedboat Ride', description: 'High speed boat journey. Swim at Pileh Lagoon and watch monkeys at Monkey Beach. Snorkeling and foods included.' },
      { day: 3, title: 'Phuket Viewpoints & Big Buddha Tour', description: 'Visit Chalong Temple, Promthep Cape, and the giant marble Buddha sitting on Nakkerd Hill.' },
      { day: 4, title: 'Krabi Private Cruise Transfer', description: 'Ferry transfer to Krabi. Check-in to Ao Nang cliff villa. Relaxing evening during sunset.' },
      { day: 5, title: 'Scenic Krabi Four-Island tour', description: 'Visiting Koh Poda, Phranang Cave Beach, Tup, and Chicken Islands with crystalline water snorkel slots.' },
      { day: 6, title: 'Krabi Romantic Hot Springs Visit', description: 'Hot spring relax sessions and Emerald Pool healthy water trekking guides.' },
      { day: 7, title: 'Krabi Airport Fly Home', description: 'Morning breakfast. Direct airport transfers leading to sweet return lines.' }
    ],
    included: [
      '3-nights patong resort + 3-nights krabi cliff accommodations',
      'Daily meals and gourmet lunches during full-day boat cruises',
      'Private car transfer services throughout the island routes',
      'Complementary snorkeling equipment and national park entry passes'
    ],
    excluded: [
      'Flight tickets',
      'Thailand visa sticker stamp cost'
    ]
  },
  {
    id: 'tour-hunza',
    title: 'Ethereal Hunza Valley Expedition',
    location: 'Gilgit, Hunza, Attabad Lake & Khunjerab Pass',
    duration: '7 Days & 6 Nights',
    price: '$350',
    category: 'Domestic',
    image: 'https://images.unsplash.com/photo-1627664813835-24c6570aa617?q=80&w=800&auto=format&fit=crop',
    description: 'Immerse into the majestic Karakoram Range. Experience rich culture, azure lakes, high suspension bridges, and sky-touching peaks.',
    highlights: [
      'Speedboat rides on majestic deep-blue Attabad Lake',
      'Walk over active, thrilling Hussaini Suspension Bridge',
      'Visits to 800+ years old Baltit & Altit historical Forts',
      'Drive up to Khunjerab Pass (Pakistan-China Border at 15,397 ft)'
    ],
    itinerary: [
      { day: 1, title: 'Islamabad to Chilas Journey', description: 'Drive along Hazara Motorway and Karakoram Highway. View lush forest gaps. Overnight in Chilas.' },
      { day: 2, title: 'Chilas to Hunza Karimabad', description: 'Stopovers at unique three mountain ranges confluence (Himalayas, Karakoram, Hindu Kush) and Rakaposhi Viewpoint (25,551 ft). Check in to Karimabad.' },
      { day: 3, title: 'Ancient Forts & Local Culture', description: 'Morning walk in Altit Fort gardens. Explore Baltit Fort architecture overlooking the Hunza Valley. Taste organic organic local dry fruits.' },
      { day: 4, title: 'Attabad Lake & Hussaini Hanging Bridge', description: 'Ride boats and Jet-Ski in turquoise water of Attabad. Cross Passu Cones views and cross the swinging Hussaini suspension bridge.' },
      { day: 5, title: 'Khunjerab Border Summit', description: 'Scale high Karakoram Highway to reach Khunjerab Pass (China Border). Check out the high-latitude snow peaks. Return to Passu for the night.' },
      { day: 6, title: 'Passu to Naran or Besham', description: 'Drive back to green plains of Naran or Besham with multiple waterfall photos and river stops.' },
      { day: 7, title: 'Return Journey to Islamabad', description: 'Afternoon drive back to Islamabad. Drop-off at designated terminal.' }
    ],
    included: [
      '6 nights hotel stays in premium standard rooms (Double occupancy)',
      'Dedicated private brand-new Toyota Corolla or Prado with driver-meals',
      'Guide, fuel, tolls, and 24/7 dedicated control backup call support',
      'Daily breakfast plates with local mountain green teas'
    ],
    excluded: [
      'Lunches, dinners, and personal snacks',
      'Attabad Lake boating and sports rental items'
    ]
  },
  {
    id: 'tour-skardu',
    title: 'Skardu Shangrila Dream Tour',
    location: 'Skardu, Shangrila Resort, Cold Desert & Sadpara Lake',
    duration: '6 Days & 5 Nights',
    price: '$390',
    category: 'Domestic',
    image: 'https://images.unsplash.com/photo-1622322482325-17e997bd0b53?q=80&w=800&auto=format&fit=crop',
    description: 'Explore the high-altitude cold desert, scenic heart-shaped Shangrila Resort, historic Shigar Fort, and the serene Sadpara Lake.',
    highlights: [
      'Scenic photography at the private heart-shaped Shangrila Lake',
      'Thilling ATV rides in high-altitude Sarfaranga Cold Desert',
      'Visit to Upper Kachura Lake for local trout activities',
      'Walk tour inside majestic Shigar Fort, a restored heritage palace'
    ],
    itinerary: [
      { day: 1, title: 'Flight or Drive to Skardu', description: 'Fly from Islamabad overlooking K2 and Nanga Parbat, or drive via scenic Indus highway. Check into lakeside resort.' },
      { day: 2, title: 'Shangrila Resort & Kachura Lake', description: 'Visit beautiful Shangrila gardens, boat inside Lower Kachura, and trek 15 mins to crystal clear Upper Kachura Lake.' },
      { day: 3, title: 'Shigar Valley & Sarfaranga Dunes', description: 'Drive into fruit orchards of Shigar. Slide down cold dunes, try desert ATV rides, and explore the wooden Shigar heritage Mosque.' },
      { day: 4, title: 'Sadpara Lake & Deosai National Plains', description: 'Trek to Deosai (the Land of Giants), cross Sheosar Lake, and visit fresh streams surrounding the area.' },
      { day: 5, title: 'Khaplu Palace Historical Tour', description: 'Day trip to Khaplu, a beautiful valley holding the historical Royal Palace. Walk beautiful organic walnut orchards.' },
      { day: 6, title: 'Return Flights to Rawalpindi/Islamabad', description: 'Early morning flight check-in with gorgeous views of high cold peaks.' }
    ],
    included: [
      '5 nights luxury hotel stays including Shangrila and Shigar Valley',
      'All local 4x4 Prado or Grand Cabin transits',
      'Warm traditional meals (Breakfast & Dinner setups daily)',
      'Local experienced Skardu specialist tour guide'
    ],
    excluded: [
      'Air Tickets (Rawalpindi-Skardu-Rawalpindi)'
    ]
  }
];

export const PILGRIMAGE_UMRAH = {
  description: 'Kamal Express brings decades of dedicated spiritual travel experience. Our Umrah experts design economy, executive, and bespoke VIP packages with priority flights, proximate hotel layouts, secure ground transits, and hassle-free visa pathways.',
  packages: [
    {
      id: 'umrah-eco',
      title: 'Economy Umrah Package (15 Days)',
      price: '$1,150',
      tagline: 'Ideal for families seeking a budget-friendly spiritual journey with comfortable essential services.',
      duration: '15 Days (7 Nights Makkah, 7 Nights Madinah)',
      makkahHotel: 'Al-Kiswah Towers (approx 900m, free 24/7 shuttle)',
      madinahHotel: 'Sajaa Al Madinah (approx 450m from Masjid Nabawi)',
      transport: 'Standard shared VIP transport (Makkah-Madinah-Jeddah dynamic line)',
      visaIncluded: true,
      flightsIncluded: false, // Standard dynamic flight quote
      highlights: [
        'Complete Umrah Visa issuance support within 24 hours',
        'Ziyarah visits in Makkah and Madinah with historic scholar guidance',
        '24/7 dedicated Pakistani / multi-lingual helpline coordinators',
        'Complimentary Saudi mobile Sim card packaging and travel gift bags'
      ]
    },
    {
      id: 'umrah-prem',
      title: 'Premium Near-Haram Package (10 Days)',
      price: '$1,950',
      tagline: 'A seamless, ultra-comfortable spiritual retreat with high-rated 5-star comfort footsteps away from both Holy Masjids.',
      duration: '10 Days (5 Nights Makkah, 5 Nights Madinah)',
      makkahHotel: 'Swissôtel Makkah or Pullman Zamzam (Zero meter inside Clock Tower)',
      madinahHotel: 'Anwar Al Madinah Mövenpick (Zero meter Haram view)',
      transport: 'High-speed Haramain Bullet Train VIP tickets + private luxury SUV airport transfers',
      visaIncluded: true,
      flightsIncluded: false,
      highlights: [
        'Luxury 5-Star luxury room with Holy Kaaba or Masjd Nabawi view potentials',
        'Executive bullet train transfers enabling rapid heat-free transits',
        'Exclusive premium hotel breakfast buffets with international selections',
        'One-on-one guide (Mutawwif) for performing initial Umrah rituals'
      ]
    },
    {
      id: 'umrah-custom',
      title: 'Bespoke Custom Umrah Planning',
      price: 'Custom Quote',
      tagline: 'Completely customized from duration, hotel ranks, direct flights, and special medical/wheelchair transit services.',
      duration: 'Tailored to your needs (7 to 28 Days)',
      makkahHotel: 'Select from 3-Star, 4-Star or Grand 5-Star clock tower locations',
      madinahHotel: 'Choose standard boutique stays or ultra-luxe courtyards',
      transport: 'Private Lexus or GMC Yukon at your absolute disposal 24/7',
      visaIncluded: true,
      flightsIncluded: true,
      highlights: [
        'Tailored itinerary perfectly suited for senior citizens or infants',
        'Wheelchair assistance inside both Harams with dedicated staff support',
        'Ziyarah of key historic battlefields and Quran archive museums',
        'Flexible multi-city schedules (Combine Umrah with Dubai or Istanbul tours)'
      ]
    }
  ]
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-schengen-2026',
    title: 'Schengen Visa Fee Changes 2026: An In-Depth Applicant Guide',
    slug: 'schengen-visa-updates-2026',
    category: 'Visa Updates',
    summary: 'The European Union has updated standard visa fees and document screening rules for certain South Asian and Global South passport holders. Learn about the new standard charges and how to audit your application profile.',
    content: `Starting in early 2026, the European Commission has implemented revised service and processing rules for Schengen C-Type short stay tourist and business visas. While the standard fee has updated slightly to €90 for adult applicants, the requirement for absolute clarity in banking trails and physical ties to home countries has been highly elevated.

### What are the key updates you must know?
1. **Financial History Audit**: Embassies now explicitly request an account history showing consistent average balances spanning at least 180 continuous days. Avoid single large deposits just prior to filing, as they trigger immediate profile flags.
2. **Mandatory Standard Insurance**: Your medical coverage MUST specifically cover up to €30,000 for emergency repatriation, unexpected medical operations, and urgent hospitalization, signed with an internationally registered reinsurer.
3. **Verified Accommodation Coordinates**: Embassies are actively cross-verifying hotel reservation codes. Ensure your bookings are completely active and match structural names on the application forms.

Our expert consultancy services at Kamal Express ensure your Schengen application fully respects the refined 2026 regulations, saving you from stressful visa refusals and delay loops.`,
    image: 'https://images.unsplash.com/photo-1473984849538-57b96953771d?q=80&w=800&auto=format&fit=crop',
    date: 'April 12, 2026',
    author: 'Sohail Kamal'
  },
  {
    id: 'blog-umrah-checklist',
    title: 'Comprehensive Physical & Spiritual Preparation Guide for performing Umrah',
    slug: 'umrah-preparation-guide',
    category: 'Umrah Guides',
    summary: 'Performing Umrah requires deep spiritual focus alongside physical endurance. Our step-by-step checklist covers crucial visas, clothing standards, handy apps, and must-know rituals.',
    content: `Preparing for your spiritual pilgrimage to the Holy Lands of Makkah and Madinah is a lifetime honor. Drawing from decades of managing Umrah caravans, Kamal Express is pleased to present this handbook to maximize your safety, focus, and comfort.

### 1. Crucial Documents Checklist
- Keep multiple high-contrast printed copies of your Saudi eVisa, Nusuk app booking confirmations, and passport bio-page.
- Always save digitized PDF versions on your cloud folder or emergency contact chat apps.

### 2. Smartphone Applications You Must Initialise
- **Nusuk App**: Essential for scheduling your access slots to the Rawdah Al-Sharifa in Masjid Nabawi. Download and register your visa ID numbers the moment your passport receives approval.
- **Tawakkalna Services**: Keep active for general digital portal permissions and emergency maps.

### 3. Smart Packing Tips
- Pack solid, durable, and lightweight sandals with thick cushioning to handle miles of walking over marble floors.
- Pack unscented liquid soap, light travel-size umbrellas, and high-quality white cotton Ihrams for ease and hygiene.

Our specialized Premium and Economy Umrah packages are fully equipped with dedicated Pakistani guides who stay alongside your group, steering you confidently through every holy stage.`,
    image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76ae?q=80&w=800&auto=format&fit=crop',
    date: 'May 08, 2026',
    author: 'Mufti Muhammad Imran'
  },
  {
    id: 'blog-packing-tips',
    title: '5 Crucial Packing Tactics for Seamless International Travel',
    slug: 'international-packing-tactics',
    category: 'Travel Tips',
    summary: 'Travel smart and avoid airport luggage penalties with these lightweight packing habits compiled by our corporate tour managers.',
    content: `Packing can easily make or break a luxury vacation. Too many suitcases lead to fatigue and costly airline penalties, while under-packing leaves you spending precious holiday hours chasing items.

### 1. Use the Rolling Method & Compression Cubes
Rolling clothes tightly rather than folding them flat compresses the height dramatically. Using dedicated fabric compression cubes lets you isolate shirts, pants, and socks beautifully, making hotel room unpacking a total breeze.

### 2. The 3-1-1 Rule for Cabin Liquids
Any carry-on dynamic liquid must reside inside a travel bottle of 100ml or less. Ensure everything lives in a clear, zip-close standard one-quart plastic bag. 

### 3. Distribute Cash and Credit Layers
Never keep all credit cards and primary cash portfolios in a single travel wallet. Split them across your carry-on luggage, secure jacket pockets, and safe hotel locker units.

Reach out to the Air Ticketing desk at Kamal Express to learn about the exact baggage allowances of your specific airlines before boarding.`,
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?q=80&w=800&auto=format&fit=crop',
    date: 'May 22, 2026',
    author: 'Amir Sohail'
  }
];

export const GENERAL_FAQS: FAQ[] = [
  {
    id: 'faq-v1',
    category: 'Visa Services',
    question: 'What is the processing window for a Canada Tourist Visa?',
    answer: 'Standard processing cycles for a Canadian Temporary Resident Visa (TRV) usually average between 30 and 45 business days. This timeline is highly dependent on biometric collection bookings at local VFS Global counters and seasonal volume loads.'
  },
  {
    id: 'faq-v2',
    category: 'Visa Services',
    question: 'How many months of valid bank statements do UK/Schengen embassies require?',
    answer: 'Embassies strictly require a minimum of 6 continuous months of bank statements, issued and stamped by the respective banking branch within 3 to 7 days prior to file submission. An account maintenance letter is also highly recommended.'
  },
  {
    id: 'faq-v3',
    category: 'Visa Services',
    question: 'Can you assist with mock interviews for complex US/EU visas?',
    answer: 'Yes, our premium consultancy includes mock interview drills with our seasoned visa officers. We review custom files, spot weak travel ties, and build confident profile answers with you.'
  },
  {
    id: 'faq-a1',
    category: 'Air Ticketing',
    question: 'Can I secure special fares for large group travel or corporate events?',
    answer: 'Absolutely. We hold direct consolidator routing agreements with airlines like Emirates, Qatar Airways, Saudia, and PIA. We can block seat layouts for corporate groups and offer up to 15% discount packages.'
  },
  {
    id: 'faq-a2',
    category: 'Air Ticketing',
    question: 'How do I handle flight changes or cancellations last minute?',
    answer: 'We operate a dedicated 24/7 hotline. Instead of holding on long airline support lines, our ticket desks can process instant flight swaps, refunds, and changes.'
  },
  {
    id: 'faq-h1',
    category: 'Hotel Booking',
    question: 'Are there options for free room upgrades or early check-ins?',
    answer: 'Through our partner agreements and wholesale channels, we can often request early check-ins and high-floor room allocations, as well as infant or child-friendly customized layouts.'
  },
  {
    id: 'faq-u1',
    category: 'Umrah',
    question: 'Is it possible to customize an Umrah Package with custom flight routes?',
    answer: 'Yes, we are experts in designing bespoke packages. You can choose premium direct flights, adjust stay durations between Makkah and Madinah, choose custom hotel distances, or extend transit routes into nearby global hubs like Dubai, Amman, or Cairo.'
  },
  {
    id: 'faq-u2',
    category: 'Umrah',
    question: 'Does your guide accompany pilgrims during the actual tawaf and saee?',
    answer: 'Yes! For our group tour packages, an experienced Pakistani Mutawwif remains with the travel caravan, leading prayers and guiding you through all rituals successfully.'
  },
  {
    id: 'faq-t1',
    category: 'Tour Packages',
    question: 'What is included inside your domestic Hunza and Skardu tour packages?',
    answer: 'Our domestic tours are exceptionally complete. They cover transport (reliable Toyota Prado 4x4 or spacious modern Grand Cabins), experienced mountaineer drivers, standard quality hotel rooms, daily breakfast sets, local sight fees, and active helpline trackers.'
  }
];
