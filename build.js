const fs = require('fs');
const path = require('path');

const publicHtml = path.join(__dirname, 'public_html');
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const apiDir = path.join(__dirname, 'api');

console.log('Starting assembly of public_html...');

// 1. Clean public_html (preserving .htaccess if already exists, or we will rewrite it)
// We clean everything except .htaccess, or we can just clean and rewrite .htaccess
if (fs.existsSync(publicHtml)) {
  fs.rmSync(publicHtml, { recursive: true, force: true });
}
fs.mkdirSync(publicHtml);

// 2. Copy Frontend Dist to public_html
if (fs.existsSync(frontendDist)) {
  console.log('Copying frontend build assets...');
  fs.cpSync(frontendDist, publicHtml, { recursive: true });
} else {
  console.error('Error: Frontend dist folder not found. Run build first.');
  process.exit(1);
}

// 3. Copy API to public_html/api
if (fs.existsSync(apiDir)) {
  console.log('Copying API files...');
  const apiDest = path.join(publicHtml, 'api');
  fs.cpSync(apiDir, apiDest, {
    recursive: true,
    filter: (src) => {
      const basename = path.basename(src);
      if (basename === '.git' || basename === '.gitignore') {
        return false;
      }
      return true;
    }
  });
} else {
  console.warn('Warning: API directory not found. Skipping backend copy.');
}

// Write .htaccess file to public_html
const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # If the requested filename exists as a file or directory, serve it directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Otherwise, redirect to index.html to let React Router handle client-side routing
  RewriteRule ^ index.html [L]
</IfModule>
`;
fs.writeFileSync(path.join(publicHtml, '.htaccess'), htaccessContent, 'utf8');
console.log('Created .htaccess file in public_html');

// 4. Run Static Pre-rendering (SSG) for SEO Optimization
console.log('Running SEO static pre-rendering...');

const templatePath = path.join(publicHtml, 'index.html');
if (fs.existsSync(templatePath)) {
  const template = fs.readFileSync(templatePath, 'utf8');
  
  const routes = [
    {
      path: '', // Home
      title: 'Kamal Express - Approved Visas, Lowest Fares & Custom Tours',
      description: 'Kamal Express is Pakistan\'s premium visa consulting, air ticketing, hotel booking, and pilgrimage Umrah caravan service agency in Islamabad Blue Area.',
      keywords: 'visa consultancy Islamabad, travel agency Blue Area, Umrah packages Pakistan, discount flights Islamabad',
      content: `
        <h1>Kamal Express - Travel & Visa Consultants</h1>
        <p>Welcome to Kamal Express, a certified IATA and Ministry-licensed travel agency offering premium visa consultancy, cheap airfares, hotel booking, and custom Umrah caravans.</p>
        <h2>Our Core Offerings</h2>
        <ul>
          <li><strong>Visa Consultancy:</strong> Expert documentation review and submission file preparation for UK, USA, Schengen, Canada, and Turkey.</li>
          <li><strong>Air Ticketing:</strong> Lowest rates on domestic and international flights.</li>
          <li><strong>Umrah Caravans:</strong> Group and custom family packages under Shariah guide supervision.</li>
          <li><strong>Holiday Tours:</strong> Customized local and international itineraries with premium transport.</li>
        </ul>
        <p>Visit our office at Aalay Plaza, Blue Area, Islamabad or call us at (051) 2726807.</p>
      `
    },
    {
      path: 'about',
      title: 'About Us - Decades of Travel Industry Heritage | Kamal Express',
      description: 'Learn about the history, vision, and Mufti-led leadership team of Kamal Express, a certified IATA and Ministry-licensed agency.',
      keywords: 'about Kamal Express, travel history, leadership team, IATA certified travel agent Islamabad',
      content: `
        <h1>About Kamal Express</h1>
        <p>With decades of experience in the travel industry, Kamal Express has established itself as Islamabad\'s leading agency for visa consulting, ticketing, and Islamic pilgrimage services.</p>
        <h2>Our Leadership</h2>
        <p>Led by Shariah advisors and industry veterans, our team ensures every caravan, visa file, and booking is done with the highest integrity and compliance.</p>
        <h2>Certifications & Licensing</h2>
        <ul>
          <li>Certified IATA Member Agency</li>
          <li>Licensed Ministry of Hajj and Umrah Agent</li>
          <li>ISO-Compliant Quality Assurance standards</li>
        </ul>
      `
    },
    {
      path: 'services',
      title: 'Our Services - Visa Consulting, Tickets & Lodging | Kamal Express',
      description: 'Explore our core ticketing, hotel reservation, travel insurance, apostille stamp verification, and embassy slot coordinates.',
      keywords: 'visa services, flight booking, hotel reservation, travel insurance, document legalization',
      content: `
        <h1>Our Core Travel & Consultancy Services</h1>
        <p>Kamal Express provides comprehensive services to make international travel seamless, secure, and affordable.</p>
        <h2>Services Listing</h2>
        <ul>
          <li><strong>Visa Consultancy & Documentation:</strong> Pre-screen bank statements and prepare pristine files.</li>
          <li><strong>Air Ticketing:</strong> Lowest fare deals on domestic and international flights.</li>
          <li><strong>Hotel Reservations:</strong> Confirmed hotel vouchers and lodgings worldwide.</li>
          <li><strong>Travel Insurance:</strong> High-coverage embassy compliant protection policies.</li>
          <li><strong>Embassy Appointments & Slots:</strong> Fast queue registrations.</li>
          <li><strong>Apostille & Legalization:</strong> Attestation for documents at MOFA and embassies.</li>
        </ul>
      `
    },
    {
      path: 'services/visa-consultancy',
      title: 'Visa Consultancy & Documentation Services | Kamal Express',
      description: 'Professional visa consulting for UK, USA, Schengen, Canada, Turkey, and UAE. Get bank statement pre-checks and checklist preparation.',
      keywords: 'visa consultancy Islamabad, Schengen visa support, UK visitor visa help',
      content: `
        <h1>Visa Consultancy Services</h1>
        <p>Our expert advisors specialize in high-contrast visa filing dossiers for popular destinations. We offer meticulous audits of bank statements, assets documentation, and embassy forms.</p>
      `
    },
    {
      path: 'services/air-ticketing',
      title: 'Worldwide Air Ticketing & Cheap Flights | Kamal Express',
      description: 'Book discount air tickets with major domestic and international airlines. Real-time availability, date change, and cancellation support.',
      keywords: 'cheap flights Islamabad, international airline tickets, IATA booking agency',
      content: `
        <h1>Worldwide Air Ticketing</h1>
        <p>As IATA certified ticketing partners, we offer direct access to low fares, flexible date swaps, multi-stop routes, and group discounts for corporate entities.</p>
      `
    },
    {
      path: 'services/hotel-reservations',
      title: 'International Hotel Bookings & Lodging | Kamal Express',
      description: 'Secure budget-friendly and premium hotel reservations worldwide. VFS/Embassy confirmed vouchers and instant confirmation.',
      keywords: 'hotel booking Islamabad, travel vouchers, premium hotel reservations',
      content: `
        <h1>Hotel Booking Services</h1>
        <p>We provide confirmed, embassy-recognized hotel reservations and lodging vouchers worldwide. Select from 3-star budget to luxury 5-star properties.</p>
      `
    },
    {
      path: 'services/travel-insurance',
      title: 'Travel Insurance Plans & COVID Coverage | Kamal Express',
      description: 'Get international travel insurance plans accepted by Schengen and global embassies. Comprehensive medical and luggage loss coverage.',
      keywords: 'travel insurance Schengen, travel health coverage Pakistan',
      content: `
        <h1>Embassy-Approved Travel Insurance</h1>
        <p>Our custom insurance policies provide international medical coverage, emergency hospitalization protection, and luggage loss coverage conforming to all visa criteria.</p>
      `
    },
    {
      path: 'services/visa-appointments',
      title: 'Embassy Slots & VFS Appointments Coordination | Kamal Express',
      description: 'Struggling to book appointments? We monitor and book early embassy interview and biometric slots for UK, USA, and Schengen.',
      keywords: 'VFS appointments Islamabad, Germany visa slots, Schengen booking help',
      content: `
        <h1>Embassy Appointments Coordination</h1>
        <p>We handle quick scheduling for early biometric and interview appointments at VFS Global, Gerry\'s, and embassy portals.</p>
      `
    },
    {
      path: 'services/apostille-attestation',
      title: 'MOFA Attestation & Document Legalization | Kamal Express',
      description: 'Attestation and legalization for educational degrees, marriage certificates, and business documents from MOFA and embassies.',
      keywords: 'MOFA attestation Islamabad, degree legalization, apostille stamps',
      content: `
        <h1>Apostille & Legalization Services</h1>
        <p>Accelerate your certificate attestations, marriage registry legalizations, and degree apostille requirements through our secure liaison channels.</p>
      `
    },
    {
      path: 'umrah',
      title: 'Umrah Packages - Economy & Premium Haram Caravan Plans | Kamal Express',
      description: 'Book custom boutique 3-Star, 4-Star, and Grand 5-Star clock tower near-Haram Umrah groups. Direct support and Shariah guide review.',
      keywords: 'Umrah packages 2026, Umrah Islamabad, cheap Umrah packages, premium Umrah group',
      content: `
        <h1>Umrah Pilgrimage Caravans</h1>
        <p>We design customizable and group Umrah packages tailored to your spiritual needs. Every caravan is backed by direct transportation and proximity to Haram.</p>
      `
    },
    {
      path: 'tours',
      title: 'Tours & Holiday Packages - Leisure Explorations | Kamal Express',
      description: 'Book top-rated customizable domestic and international vacation itineraries with dedicated transit drivers and expert guides.',
      keywords: 'holiday packages, leisure tours, tour packages Pakistan, international tours Islamabad',
      content: `
        <h1>Customized Tour & Holiday Packages</h1>
        <p>Experience seamless leisure travel with our handpicked domestic and international holiday plans. We manage hotels, local transport, and custom site plans.</p>
      `
    },
    {
      path: 'tours/International',
      title: 'International Tour & Holiday Packages | Kamal Express',
      description: 'Explore custom international holiday packages to Turkey, Baku, Dubai, Malaysia, Thailand, and Europe.',
      keywords: 'international tours, Turkey vacation package, Baku holiday package',
      content: `
        <h1>International Tour Packages</h1>
        <p>Book flights, guides, and hotels for Dubai, Turkey, Thailand, Malaysia, Azerbaijan, and European Schengen states with local support.</p>
      `
    },
    {
      path: 'tours/Domestic',
      title: 'Domestic Tours & Northern Areas Packages | Kamal Express',
      description: 'Bespoke domestic tours to Hunza, Skardu, Swat, Naran, and Kashmir with dedicated vehicles and guides.',
      keywords: 'Hunza tour package, Skardu trip, northern areas tour',
      content: `
        <h1>Domestic Tours Pakistan</h1>
        <p>Explore Hunza, Skardu, Gilgit, Chitral, Swat, and Naran Valley with premium 4x4 transport, family-friendly hotel setups, and professional local guides.</p>
      `
    },
    {
      path: 'tours/Customized',
      title: 'Bespoke Holiday & Customized Tour Planner | Kamal Express',
      description: 'Design your custom travel itinerary with custom flights, selected hotels, and private drivers tailored for families.',
      keywords: 'custom tour packages, family holiday planner',
      content: `
        <h1>Customized Travel Planners</h1>
        <p>Design your own holiday. Tell us your budget, star preferences, target destinations, and traveler counts, and we will build a unique itinerary.</p>
      `
    },
    {
      path: 'tours/International/tour-turkey',
      title: 'Historical Turkey Tour Package | Kamal Express',
      description: 'Book a 7 Days / 6 Nights tour to Istanbul, Cappadocia, and Antalya. Explore Bosphorus cruises, cave dwellings, and historical landmarks.',
      keywords: 'Turkey tour package, Istanbul holiday, Cappadocia cave hotel',
      content: `
        <h1>Historical Turkey & Cappadocia Cave Dwellings</h1>
        <p>Enjoy luxury Bosphorus cruises, hot air balloon flights in Cappadocia, and historic guided tours around Hagia Sophia, Blue Mosque, and Ephesus ruins.</p>
      `
    },
    {
      path: 'tours/International/tour-dubai',
      title: 'Modern Dubai Highlights Holiday | Kamal Express',
      description: '5 Days / 4 Nights modern Dubai package. Inclusions: Desert safari, yacht cruise, Burj Khalifa entry, and shopping tours.',
      keywords: 'Dubai holiday package, desert safari Dubai, Burj Khalifa tour',
      content: `
        <h1>Modern Dubai Highlights & Desert Safari</h1>
        <p>Experience the tallest tower in the world, dune bashing, traditional Arabian BBQ, Marina yacht cruises, and high-end shopping transits.</p>
      `
    },
    {
      path: 'tours/International/tour-thailand',
      title: 'Phuket & Krabi Coastal Escape Tour | Kamal Express',
      description: '7 Days / 6 Nights Thailand beach holiday. Island hopping by speedboat, snorkeling, Patong night markets, and cliff side stays.',
      keywords: 'Thailand beach package, Phuket tour, Krabi island hopping',
      content: `
        <h1>Phuket & Krabi Beach Escape</h1>
        <p>Discover Maya Bay, Phi Phi Islands, snorkel in crystal clear lagoons, visit local sanctuaries, and stay at ao nang beach resorts.</p>
      `
    },
    {
      path: 'tours/Domestic/tour-hunza',
      title: 'Ethereal Hunza Valley Expedition | Kamal Express',
      description: '7 Days / 6 Nights Hunza Valley trip. Attabad lake boating, Hussaini bridge, Baltit Fort, and China border Khunjerab pass.',
      keywords: 'Hunza Valley package, northern areas tour, Gilgit Baltistan trip',
      content: `
        <h1>Hunza Valley & Khunjerab Pass Expedition</h1>
        <p>Journey along the Karakoram Highway. View Passu cones, cross hanging suspension bridges, and see the highest border crossing at China Border.</p>
      `
    },
    {
      path: 'tours/Domestic/tour-skardu',
      title: 'Skardu Shangrila Dream Tour | Kamal Express',
      description: '6 Days / 5 Nights Skardu package. Stays at Shangrila Resort, ATV rides in cold desert, Shigar Fort, and Sadpara Lake.',
      keywords: 'Skardu tour package, Shangrila resort Skardu, cold desert ATV',
      content: `
        <h1>Skardu Shangrila & Cold Desert Adventure</h1>
        <p>Explore high-altitude deserts, historical palaces, Kachura lakes, and the beautiful cold plains of Deosai National Park.</p>
      `
    },
    {
      path: 'destinations',
      title: 'Destinations & Visa Rules - Embassy Guidelines | Kamal Express',
      description: 'Search visa requirements, fee indexes, valid stays, and required documents for UAE, UK, Schengen, Turkey, Canada, and more.',
      keywords: 'visa requirements Pakistan, Schengen visa documents, UK visa requirements, UAE visa fee',
      content: `
        <h1>Popular International Destinations</h1>
        <p>Read detailed visa documentation rules, biometric steps, and processing durations for leading global destinations.</p>
      `
    },
    {
      path: 'destinations/uae',
      title: 'United Arab Emirates (UAE) Visa Rules & Fees | Kamal Express',
      description: 'Get UAE tourist visa details, 30 days and 60 days entry requirements, and express processing guidelines.',
      keywords: 'Dubai visa requirements, UAE entry visa fee',
      content: `
        <h1>United Arab Emirates Visa Guidelines</h1>
        <p>Information on 30-day and 60-day Dubai/UAE tourist visas. Required documents include CNIC copy, white background photograph, and passport scans.</p>
      `
    },
    {
      path: 'destinations/saudi-arabia',
      title: 'Saudi Arabia Visa Requirements & Guidelines | Kamal Express',
      description: 'Check Umrah visa requirements, tourist visa guidelines, processing times, and fees for Pakistani citizens.',
      keywords: 'Saudi Arabia visa requirements, Umrah visa checklist',
      content: `
        <h1>Saudi Arabia Visa Requirements</h1>
        <p>Verify requirements for Umrah, tourist, and business visas to Saudi Arabia, including passport validity and photo specifications.</p>
      `
    },
    {
      path: 'destinations/turkey',
      title: 'Turkey Visa Application Checklist & E-Visa | Kamal Express',
      description: 'Required documents for Turkey sticker visa and e-visa credentials. Processing times, fees, and appointment details.',
      keywords: 'Turkey visa documents, Istanbul e-visa Pakistan',
      content: `
        <h1>Turkey Visa Requirements Sheet</h1>
        <p>Complete documentation checklists for sticker visa submissions through Gerry\'s, and eligibility conditions for electronic e-visas.</p>
      `
    },
    {
      path: 'destinations/malaysia',
      title: 'Malaysia E-Visa & Sticker Visa Requirements | Kamal Express',
      description: 'Apply for Malaysia tourist e-visa. Online fee index, processing period, flight itinerary, and hotel reservations required.',
      keywords: 'Malaysia e-visa requirements, Malaysia sticker visa',
      content: `
        <h1>Malaysia Visa Requirements</h1>
        <p>Required documentation for online Malaysia e-visa, including return tickets, confirmed hotel vouchers, and passport copy files.</p>
      `
    },
    {
      path: 'destinations/thailand',
      title: 'Thailand Visa Checklist & Required Documents | Kamal Express',
      description: 'Detailed documents checklist for Thailand tourist visa. Bank statement requirements, processing period, and sticker visa fees.',
      keywords: 'Thailand visa Pakistan, Gerrys Thailand checklist',
      content: `
        <h1>Thailand Tourist Visa Guidelines</h1>
        <p>Verify requirements for Thailand visa, including bank statement requirements, flight details, CNIC copy, and application forms.</p>
      `
    },
    {
      path: 'destinations/united-kingdom',
      title: 'United Kingdom (UK) Visitor Visa Requirements | Kamal Express',
      description: 'Check UK standard visitor visa documents list, bank balance recommendations, and VFS Islamabad submission rules.',
      keywords: 'UK tourist visa requirements, London visa Islamabad',
      content: `
        <h1>United Kingdom standard visitor visa</h1>
        <p>Detailed steps for UK BRP applications, VFS bookings, and preparing financial statements and property asset justifications.</p>
      `
    },
    {
      path: 'destinations/europe',
      title: 'Europe Schengen Visa Requirements & Appointments | Kamal Express',
      description: 'Comprehensive guidelines for Schengen visa application for Germany, France, Italy, Spain, and other EU countries.',
      keywords: 'Schengen visa requirements, European visa Islamabad',
      content: `
        <h1>Schengen Visa Guidelines</h1>
        <p>Learn how to apply for Germany, France, Spain, or Italy. Essential files include travel plan, travel insurance, and bank balance statement.</p>
      `
    },
    {
      path: 'destinations/canada',
      title: 'Canada Visitor Visa Checklist & Bank Statement | Kamal Express',
      description: 'Required documents for Canada tourist and family visit visa. Bank statements pre-checks, biometrics, and processing periods.',
      keywords: 'Canada visitor visa requirements, Canada visa Islamabad',
      content: `
        <h1>Canada Visitor Visa Requirements</h1>
        <p>Guidance on biometric registrations, family information forms (IMM5645), and proof of financial assets for Canadian visitor applications.</p>
      `
    },
    {
      path: 'blog',
      title: 'Blog, Travel Updates & Handbooks | Kamal Express',
      description: 'Read international visa update notifications, physical Umrah check packing handbooks, and luggage baggage travel tips.',
      keywords: 'travel blog Pakistan, visa updates, Umrah guide, travel tips',
      content: `
        <h1>Travel Blog & Guides</h1>
        <p>Stay informed with visa regulations, pack lists, flight policies, and destination guides published by our advisors.</p>
      `
    },
    {
      path: 'blog/schengen-visa-updates-2026',
      title: 'Schengen Visa Bank Statement Requirements Guide | Kamal Express',
      description: 'Learn how to prepare your bank statement for Schengen visa application. Recommendations on balance, transaction history, and source of funds.',
      keywords: 'Schengen visa bank statement, visa application bank balance',
      content: `
        <h1>Schengen Visa Bank Statement Requirements Guide</h1>
        <p>Understand how embassies evaluate your bank history, regular income flows, source of funds, and required minimum balances for European travel.</p>
      `
    },
    {
      path: 'blog/umrah-preparation-guide',
      title: 'Essential Umrah Packing & Preparation Checklist | Kamal Express',
      description: 'Physical checklist for Umrah pilgrims. Ihram details, travel documents, medications, and packing tips for Makkah and Madinah.',
      keywords: 'Umrah packing checklist, what to pack for Umrah',
      content: `
        <h1>Umrah Packing & Preparation Checklist</h1>
        <p>A comprehensive physical check-list for pilgrims: Ihram guidelines, footwear, travel documents, medicine recommendations, and mobile apps (Nusuk).</p>
      `
    },
    {
      path: 'blog/international-packing-tactics',
      title: 'Smart International Packing & Luggage Tactics | Kamal Express',
      description: 'How to pack smart for international flights. Learn weight optimization, carry-on limits, packing lists, and restriction guidelines.',
      keywords: 'international luggage tips, packing tactics airlines',
      content: `
        <h1>Smart International Packing & Luggage Tactics</h1>
        <p>Maximize your baggage allowance. Tips on rolling clothes, weight check-in scales, toiletries restrictions, and essential electronics placement.</p>
      `
    },
    {
      path: 'contact',
      title: 'Contact Us - Corporate Office Blue Area Islamabad | Kamal Express',
      description: 'Visit our office at Aalay Plaza Blue Area, call (051) 2726807, or submit a priority contact ticket for quick support response.',
      keywords: 'contact Kamal Express, travel agency phone, office address Islamabad, Blue Area travel agent',
      content: `
        <h1>Contact Kamal Express</h1>
        <p>We are situated in the heart of Islamabad\'s commercial district. Get in touch for immediate assistance with tickets, visa consultancy, or Umrah booking.</p>
        <p><strong>Address:</strong> Aalay Plaza, Blue Area, Islamabad, Pakistan</p>
        <p><strong>Phone:</strong> (051) 2726807</p>
        <p><strong>Email:</strong> admin@kamalexpress.com.pk</p>
      `
    }
  ];

  routes.forEach(route => {
    let customHtml = template;
    
    // Replace the default title with custom route title
    customHtml = customHtml.replace(
      '<title>Kamal Express - Approved Visas, Lowest Fares & Custom Tours</title>',
      `<title>${route.title}</title>`
    );
    
    // Create the meta tags snippet
    const metaTags = `
    <meta name="description" content="${route.description}" />
    <meta name="keywords" content="${route.keywords || ''}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />`;
    
    // Insert meta tags before the closing </head>
    customHtml = customHtml.replace('</head>', `${metaTags}\n  </head>`);
    
    // Inject the structured semantic HTML content into <div id="root">
    const rootSnippet = `<div id="root">
    <!-- Static SEO Pre-rendered Content -->
    <header style="display:none;">
      <h1>${route.title}</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About Us</a>
        <a href="/services">Services</a>
        <a href="/umrah">Umrah Packages</a>
        <a href="/tours">Tours & Holidays</a>
        <a href="/destinations">Destinations & Visas</a>
        <a href="/blog">Blog & Guides</a>
        <a href="/contact">Contact Us</a>
      </nav>
    </header>
    <main style="display:none;">
      ${route.content}
    </main>
    <footer style="display:none;">
      <p>© 2026 Kamal Express. All rights reserved. Registered IATA Agent in Islamabad.</p>
    </footer>
  </div>`;
    
    customHtml = customHtml.replace('<div id="root"></div>', rootSnippet);
    
    if (route.path === '') {
      // Root index.html
      fs.writeFileSync(templatePath, customHtml, 'utf8');
      console.log('Pre-rendered root index.html');
    } else {
      // Subpage index.html
      const dirPath = path.join(publicHtml, route.path);
      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(path.join(dirPath, 'index.html'), customHtml, 'utf8');
      console.log(`Pre-rendered route: /${route.path}`);
    }
  });
} else {
  console.error('Error: index.html not found in public_html to use as template.');
}

console.log('Successfully assembled public_html folder!');
