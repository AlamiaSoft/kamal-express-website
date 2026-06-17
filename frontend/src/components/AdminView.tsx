import React, { useState, useEffect } from 'react';
import {
  Lock, User, LogOut, Search, Filter, Download,
  Phone, Mail, MessageSquare, Save, X, Calendar,
  CheckCircle, Clock, AlertCircle, RefreshCw, Layers,
  ChevronRight, ArrowRight, Shield, Globe, Award, Menu,
  DollarSign, FileText, Check, PlusCircle, Users
} from 'lucide-react';

interface InquiryItem {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  destination: string;
  notes: string;
  admin_notes: string | null;
  status: 'Pending' | 'Contacted' | 'Closed';
  ip_address: string | null;
  created_at: string;
}

interface SalesTransaction {
  id: number;
  reference_id: string;
  full_name: string;
  date: string;
  serial_number: string;
  services: string[];
  vendor_name: string;
  country: string;
  sector: string;
  total_amount: number;
  received_amount: number;
  remaining_amount: number;
  collectors_name: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  ip_address: string | null;
  created_at: string;
}

export default function AdminView() {
  // Mobile menu open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication states
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('ke_admin_token'));
  const [username, setUsername] = useState<string>(sessionStorage.getItem('ke_admin_user') || '');
  const [role, setRole] = useState<string>(sessionStorage.getItem('ke_admin_role') || 'Viewer');
  const [fullName, setFullName] = useState<string>(sessionStorage.getItem('ke_admin_fullname') || '');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Users management states
  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersErrorMsg, setUsersErrorMsg] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // User Form fields
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'Admin' | 'Staff' | 'Viewer'>('Staff');
  const [userStatus, setUserStatus] = useState<'Active' | 'Suspended'>('Active');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userModalError, setUserModalError] = useState('');

  // CRM Data states
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Contacted' | 'Closed'>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  // Detail panel states
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [editStatus, setEditStatus] = useState<'Pending' | 'Contacted' | 'Closed'>('Pending');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Navigation active tab: 'inquiries' | 'record-sale' | 'sales-records' | 'users' | 'website-manager'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'record-sale' | 'sales-records' | 'users' | 'website-manager'>('inquiries');

  // Sales Records Data states
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [salesErrorMsg, setSalesErrorMsg] = useState('');
  
  // Sales Filtering states
  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState<'All' | 'Pending Approval' | 'Approved' | 'Rejected'>('All');
  const [salesServiceFilter, setSalesServiceFilter] = useState<string>('All');
  
  // Sales Detail panel states
  const [selectedSale, setSelectedSale] = useState<SalesTransaction | null>(null);

  // Get today's date in YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Record Sale Form states
  const [saleFullName, setSaleFullName] = useState('');
  const [saleDate, setSaleDate] = useState(getTodayDateString());
  const [saleSerialNumber, setSaleSerialNumber] = useState('');
  const [saleServices, setSaleServices] = useState<string[]>([]);
  const [saleOtherServiceText, setSaleOtherServiceText] = useState('');
  const [saleVendorName, setSaleVendorName] = useState('');
  const [saleCountry, setSaleCountry] = useState('');
  const [saleSector, setSaleSector] = useState('');
  const [saleTotalAmount, setSaleTotalAmount] = useState('');
  const [saleReceivedAmount, setSaleReceivedAmount] = useState('');
  const [saleRemainingAmount, setSaleRemainingAmount] = useState('');
  const [saleCollectorsName, setSaleCollectorsName] = useState(sessionStorage.getItem('ke_admin_fullname') || sessionStorage.getItem('ke_admin_user') || '');
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [saleSuccessMsg, setSaleSuccessMsg] = useState('');
  const [saleErrorMsg, setSaleErrorMsg] = useState('');

  // Website Manager States
  const [activeSubTab, setActiveSubTab] = useState<'seo' | 'blogs' | 'packages' | 'destinations' | 'faqs'>('seo');
  const [seoPages, setSeoPages] = useState<any[]>([]);
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [destinationsList, setDestinationsList] = useState<any[]>([]);
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  // SEO Editing Form States
  const [selectedSeo, setSelectedSeo] = useState<any | null>(null);
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoMetaKeywords, setSeoMetaKeywords] = useState('');
  const [isSavingSeo, setIsSavingSeo] = useState(false);

  // Blog Editor Modal & Form States
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCategory, setBlogCategory] = useState('Visa Updates');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogDate, setBlogDate] = useState('');
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [blogModalError, setBlogModalError] = useState('');

  // Package Builder Modal & Form States
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [pkgId, setPkgId] = useState('');
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgLocation, setPkgLocation] = useState('');
  const [pkgDuration, setPkgDuration] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgCategory, setPkgCategory] = useState<'International' | 'Domestic' | 'Customized'>('International');
  const [pkgImage, setPkgImage] = useState('');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgHighlightsText, setPkgHighlightsText] = useState('');
  const [pkgInclusionsText, setPkgInclusionsText] = useState('');
  const [pkgExclusionsText, setPkgExclusionsText] = useState('');
  const [pkgItineraryText, setPkgItineraryText] = useState('');
  const [isSavingPkg, setIsSavingPkg] = useState(false);
  const [pkgModalError, setPkgModalError] = useState('');

  // Destination Builder Modal & Form States
  const [selectedDest, setSelectedDest] = useState<any | null>(null);
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [destId, setDestId] = useState('');
  const [destName, setDestName] = useState('');
  const [destSlug, setDestSlug] = useState('');
  const [destImage, setDestImage] = useState('');
  const [destVisaType, setDestVisaType] = useState('');
  const [destProcessingTime, setDestProcessingTime] = useState('');
  const [destStayDuration, setDestStayDuration] = useState('');
  const [destValidity, setDestValidity] = useState('');
  const [destPrice, setDestPrice] = useState('');
  const [destDocsText, setDestDocsText] = useState('');
  const [destFaqsText, setDestFaqsText] = useState('');
  const [isSavingDest, setIsSavingDest] = useState(false);
  const [destModalError, setDestModalError] = useState('');

  // FAQ Modal & Form States
  const [selectedFaq, setSelectedFaq] = useState<any | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqCategory, setFaqCategory] = useState('Visa Services');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [faqModalError, setFaqModalError] = useState('');

  const fetchSeoPages = async () => {
    setIsContentLoading(true);
    setContentErrorMsg('');
    try {
      const res = await fetch('/api/public/seo');
      if (!res.ok) throw new Error('Failed to load SEO pages');
      const data = await res.json();
      setSeoPages(data);
    } catch (e: any) {
      setContentErrorMsg(e.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setIsContentLoading(true);
    setContentErrorMsg('');
    try {
      const res = await fetch('/api/public/blogs');
      if (!res.ok) throw new Error('Failed to load blogs');
      const data = await res.json();
      setBlogsList(data);
    } catch (e: any) {
      setContentErrorMsg(e.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const fetchPackages = async () => {
    setIsContentLoading(true);
    setContentErrorMsg('');
    try {
      const res = await fetch('/api/public/packages');
      if (!res.ok) throw new Error('Failed to load packages');
      const data = await res.json();
      setPackagesList(data);
    } catch (e: any) {
      setContentErrorMsg(e.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const fetchDestinations = async () => {
    setIsContentLoading(true);
    setContentErrorMsg('');
    try {
      const res = await fetch('/api/public/destinations');
      if (!res.ok) throw new Error('Failed to load destinations');
      const data = await res.json();
      setDestinationsList(data);
    } catch (e: any) {
      setContentErrorMsg(e.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const fetchFaqs = async () => {
    setIsContentLoading(true);
    setContentErrorMsg('');
    try {
      const res = await fetch('/api/public/faqs');
      if (!res.ok) throw new Error('Failed to load FAQs');
      const data = await res.json();
      setFaqsList(data);
    } catch (e: any) {
      setContentErrorMsg(e.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleEditSeo = (seo: any) => {
    setSelectedSeo(seo);
    setSeoMetaTitle(seo.meta_title);
    setSeoMetaDescription(seo.meta_description);
    setSeoMetaKeywords(seo.meta_keywords || '');
  };

  const handleUpdateSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeo) return;
    setIsSavingSeo(true);
    try {
      const res = await fetch(`/api/admin/seo/${selectedSeo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meta_title: seoMetaTitle,
          meta_description: seoMetaDescription,
          meta_keywords: seoMetaKeywords
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update SEO meta.');
      alert('SEO metadata updated and pre-rendered server files updated successfully!');
      setSelectedSeo(null);
      fetchSeoPages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingSeo(false);
    }
  };

  const handleOpenBlogModal = (blog: any = null) => {
    setSelectedBlog(blog);
    setBlogModalError('');
    if (blog) {
      setBlogTitle(blog.title);
      setBlogSlug(blog.slug);
      setBlogCategory(blog.category);
      setBlogSummary(blog.summary);
      setBlogContent(blog.content);
      setBlogImage(blog.image || '');
      setBlogAuthor(blog.author);
      setBlogDate(blog.date);
    } else {
      setBlogTitle('');
      setBlogSlug('');
      setBlogCategory('Visa Updates');
      setBlogSummary('');
      setBlogContent('');
      setBlogImage('');
      setBlogAuthor(fullName || username);
      setBlogDate(new Date().toISOString().split('T')[0]);
    }
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogModalError('');
    setIsSavingBlog(true);
    const url = selectedBlog ? `/api/admin/blogs/${selectedBlog.id}` : '/api/admin/blogs';
    const method = selectedBlog ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: blogTitle,
          slug: blogSlug,
          category: blogCategory,
          summary: blogSummary,
          content: blogContent,
          image: blogImage,
          author: blogAuthor,
          date: blogDate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save blog post.');
      setIsBlogModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      setBlogModalError(err.message);
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete blog.');
      }
      fetchBlogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenPkgModal = (pkg: any = null) => {
    setSelectedPkg(pkg);
    setPkgModalError('');
    if (pkg) {
      setPkgId(pkg.id);
      setPkgTitle(pkg.title);
      setPkgLocation(pkg.location);
      setPkgDuration(pkg.duration);
      setPkgPrice(pkg.price);
      setPkgCategory(pkg.category);
      setPkgImage(pkg.image || '');
      setPkgDescription(pkg.description);
      setPkgHighlightsText(Array.isArray(pkg.highlights) ? pkg.highlights.join('\n') : '');
      setPkgInclusionsText(Array.isArray(pkg.included) ? pkg.included.join('\n') : '');
      setPkgExclusionsText(Array.isArray(pkg.excluded) ? pkg.excluded.join('\n') : '');
      setPkgItineraryText(Array.isArray(pkg.itinerary) ? JSON.stringify(pkg.itinerary, null, 2) : '[]');
    } else {
      setPkgId('');
      setPkgTitle('');
      setPkgLocation('');
      setPkgDuration('');
      setPkgPrice('');
      setPkgCategory('International');
      setPkgImage('');
      setPkgDescription('');
      setPkgHighlightsText('');
      setPkgInclusionsText('');
      setPkgExclusionsText('');
      setPkgItineraryText('[\n  {\n    "day": 1,\n    "title": "Arrival",\n    "description": "Airport pickup and hotel check-in."\n  }\n]');
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePkg = async (e: React.FormEvent) => {
    e.preventDefault();
    setPkgModalError('');
    setIsSavingPkg(true);

    let highlights = pkgHighlightsText.split('\n').map(h => h.trim()).filter(h => h !== '');
    let included = pkgInclusionsText.split('\n').map(i => i.trim()).filter(i => i !== '');
    let excluded = pkgExclusionsText.split('\n').map(ex => ex.trim()).filter(ex => ex !== '');
    let itinerary = [];
    try {
      itinerary = JSON.parse(pkgItineraryText);
    } catch (err) {
      setPkgModalError('Invalid itinerary JSON format. Must be a valid JSON array.');
      setIsSavingPkg(false);
      return;
    }

    const url = selectedPkg ? `/api/admin/packages/${selectedPkg.id}` : '/api/admin/packages';
    const method = selectedPkg ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: pkgId,
          title: pkgTitle,
          location: pkgLocation,
          duration: pkgDuration,
          price: pkgPrice,
          category: pkgCategory,
          image: pkgImage,
          description: pkgDescription,
          highlights,
          itinerary,
          included,
          excluded
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save package.');
      setIsPkgModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      setPkgModalError(err.message);
    } finally {
      setIsSavingPkg(false);
    }
  };

  const handleDeletePkg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete package.');
      }
      fetchPackages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenDestModal = (dest: any = null) => {
    setSelectedDest(dest);
    setDestModalError('');
    if (dest) {
      setDestId(dest.id);
      setDestName(dest.name);
      setDestSlug(dest.slug);
      setDestImage(dest.image || '');
      setDestVisaType(dest.visa_type);
      setDestProcessingTime(dest.processing_time);
      setDestStayDuration(dest.stay_duration);
      setDestValidity(dest.validity);
      setDestPrice(dest.price);
      setDestDocsText(Array.isArray(dest.required_documents) ? dest.required_documents.join('\n') : '');
      setDestFaqsText(Array.isArray(dest.faqs) ? JSON.stringify(dest.faqs, null, 2) : '[]');
    } else {
      setDestId('');
      setDestName('');
      setDestSlug('');
      setDestImage('');
      setDestVisaType('');
      setDestProcessingTime('');
      setDestStayDuration('');
      setDestValidity('');
      setDestPrice('');
      setDestDocsText('');
      setDestFaqsText('[\n  {\n    "question": "FAQs Question",\n    "answer": "FAQs Answer."\n  }\n]');
    }
    setIsDestModalOpen(true);
  };

  const handleSaveDest = async (e: React.FormEvent) => {
    e.preventDefault();
    setDestModalError('');
    setIsSavingDest(true);

    let required_documents = destDocsText.split('\n').map(d => d.trim()).filter(d => d !== '');
    let faqs = [];
    try {
      faqs = JSON.parse(destFaqsText);
    } catch (err) {
      setDestModalError('Invalid FAQs JSON format. Must be a valid JSON array.');
      setIsSavingDest(false);
      return;
    }

    const url = selectedDest ? `/api/admin/destinations/${selectedDest.id}` : '/api/admin/destinations';
    const method = selectedDest ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: destId,
          name: destName,
          slug: destSlug,
          image: destImage,
          visa_type: destVisaType,
          processing_time: destProcessingTime,
          stay_duration: destStayDuration,
          validity: destValidity,
          price: destPrice,
          required_documents,
          faqs
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save destination.');
      setIsDestModalOpen(false);
      fetchDestinations();
    } catch (err: any) {
      setDestModalError(err.message);
    } finally {
      setIsSavingDest(false);
    }
  };

  const handleDeleteDest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
      const res = await fetch(`/api/admin/destinations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete destination.');
      }
      fetchDestinations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenFaqModal = (faq: any = null) => {
    setSelectedFaq(faq);
    setFaqModalError('');
    if (faq) {
      setFaqCategory(faq.category);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
    } else {
      setFaqCategory('Visa Services');
      setFaqQuestion('');
      setFaqAnswer('');
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqModalError('');
    setIsSavingFaq(true);
    const url = selectedFaq ? `/api/admin/faqs/${selectedFaq.id}` : '/api/admin/faqs';
    const method = selectedFaq ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: faqCategory,
          question: faqQuestion,
          answer: faqAnswer
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save FAQ.');
      setIsFaqModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      setFaqModalError(err.message);
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete FAQ.');
      }
      fetchFaqs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Auto calculate remaining balance on total/received change
  useEffect(() => {
    const total = parseFloat(saleTotalAmount) || 0;
    const received = parseFloat(saleReceivedAmount) || 0;
    const remaining = Math.max(0, total - received);
    setSaleRemainingAmount(remaining.toString());
  }, [saleTotalAmount, saleReceivedAmount]);

  // Sync collector's name with current logged-in user name
  useEffect(() => {
    if (fullName) {
      setSaleCollectorsName(fullName);
    } else if (username) {
      setSaleCollectorsName(username);
    }
  }, [fullName, username]);

  // Load appropriate lists depending on token and active tab
  useEffect(() => {
    if (token) {
      if (activeTab === 'sales-records') {
        fetchSales();
      } else if (activeTab === 'inquiries') {
        fetchInquiries();
      } else if (activeTab === 'users' && role === 'Admin') {
        fetchUsers();
      } else if (activeTab === 'website-manager') {
        if (activeSubTab === 'seo') fetchSeoPages();
        if (activeSubTab === 'blogs') fetchBlogs();
        if (activeSubTab === 'packages') fetchPackages();
        if (activeSubTab === 'destinations') fetchDestinations();
        if (activeSubTab === 'faqs') fetchFaqs();
      }
    }
  }, [token, activeTab, activeSubTab]);

  // Dynamically inject manifest and register service worker on admin dashboard mount
  useEffect(() => {
    // 1. Inject manifest.json link tag
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    manifestLink.id = 'pwa-manifest';
    document.head.appendChild(manifestLink);

    // 2. Inject apple-touch-icon link tag
    const appleIconLink = document.createElement('link');
    appleIconLink.rel = 'apple-touch-icon';
    appleIconLink.href = '/icons/icon-192x192.png';
    appleIconLink.id = 'pwa-apple-icon';
    document.head.appendChild(appleIconLink);

    // 3. Register service worker with dynamic scope (subdomain root '/' vs local testing '/admin')
    const scope = window.location.hostname.includes('aladmin') ? '/' : '/admin';
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', { scope })
        .then(reg => {
          console.log('CRM PWA Service Worker registered successfully for scope:', reg.scope);
        })
        .catch(err => {
          console.error('CRM PWA Service Worker registration failed:', err);
        });
    }

    // Cleanup on unmount
    return () => {
      const existingManifest = document.getElementById('pwa-manifest');
      if (existingManifest) existingManifest.remove();

      const existingAppleIcon = document.getElementById('pwa-apple-icon');
      if (existingAppleIcon) existingAppleIcon.remove();
    };
  }, []);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersErrorMsg('');
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        throw new Error('Session expired or unauthorized.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch users.');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setUsersErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setIsSavingUser(true);
    try {
      const isEdit = !!selectedUser;
      const url = isEdit ? `/api/admin/users/${selectedUser.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';
      
      const bodyPayload: any = {
        username: userUsername,
        fullName: userFullName,
        email: userEmail,
        role: userRole,
        status: userStatus
      };
      
      if (userPassword.trim()) {
        bodyPayload.password = userPassword;
      } else if (!isEdit) {
        throw new Error('Password is required for new users.');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (response.status === 401 || response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && errData.message) {
          throw new Error(errData.message);
        }
        handleLogout();
        throw new Error('Session expired or unauthorized.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(' ') : 'Failed to save user.'));
      }

      fetchUsers();
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setUserModalError(err.message || 'An error occurred.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && errData.message) {
          throw new Error(errData.message);
        }
        handleLogout();
        throw new Error('Session expired or unauthorized.');
      }

      if (!response.ok) {
        throw new Error('Failed to delete user.');
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const fetchSales = async () => {
    setIsSalesLoading(true);
    setSalesErrorMsg('');
    try {
      const response = await fetch('/api/admin/sales', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch sales records.');
      }
      const data = await response.json();
      setSales(data);
    } catch (err: any) {
      setSalesErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSalesLoading(false);
    }
  };

  const handleRecordSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleSuccessMsg('');
    setSaleErrorMsg('');

    let finalServices = [...saleServices];
    if (saleServices.includes('other') && saleOtherServiceText.trim()) {
      finalServices = finalServices.filter(s => s !== 'other');
      finalServices.push(saleOtherServiceText.trim());
    }

    if (finalServices.length === 0) {
      setSaleErrorMsg('Please select at least one service.');
      return;
    }

    setIsSavingSale(true);
    try {
      const response = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: saleFullName,
          date: saleDate,
          serialNumber: saleSerialNumber,
          services: finalServices,
          vendorName: saleVendorName,
          country: saleCountry,
          sector: saleSector,
          totalAmount: parseFloat(saleTotalAmount) || 0,
          receivedAmount: parseFloat(saleReceivedAmount) || 0,
          remainingAmount: parseFloat(saleRemainingAmount) || 0,
          collectorsName: saleCollectorsName
        })
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(' ') : 'Failed to record sale.'));
      }

      setSaleSuccessMsg(`Sales transaction recorded successfully! Reference ID: ${data.reference_id}`);
      
      // Reset form
      setSaleFullName('');
      setSaleDate(getTodayDateString());
      setSaleSerialNumber('');
      setSaleServices([]);
      setSaleOtherServiceText('');
      setSaleVendorName('');
      setSaleCountry('');
      setSaleSector('');
      setSaleTotalAmount('');
      setSaleReceivedAmount('');
      setSaleRemainingAmount('');
      setSaleCollectorsName(fullName || username);
    } catch (err: any) {
      setSaleErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSavingSale(false);
    }
  };

  const handleUpdateSaleStatus = async (saleId: number, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`/api/admin/sales/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error('Session expired.');
      }

      if (!response.ok) {
        throw new Error('Failed to update transaction status.');
      }

      // Update in local state
      setSales(prev => prev.map(s => {
        if (s.id === saleId) {
          return { ...s, status: newStatus };
        }
        return s;
      }));

      // Update active selection
      setSelectedSale(prev => prev && prev.id === saleId ? { ...prev, status: newStatus } : prev);

    } catch (err: any) {
      alert(err.message || 'Failed to update transaction status.');
    }
  };

  const fetchInquiries = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch CRM inquiries.');
      }
      const data = await response.json();
      setInquiries(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginUser,
          password: loginPass
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      sessionStorage.setItem('ke_admin_token', data.token);
      sessionStorage.setItem('ke_admin_user', data.username);
      sessionStorage.setItem('ke_admin_role', data.role);
      sessionStorage.setItem('ke_admin_fullname', data.fullName);
      setToken(data.token);
      setUsername(data.username);
      setRole(data.role);
      setFullName(data.fullName);
    } catch (err: any) {
      setLoginError(err.message || 'Connection failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ke_admin_token');
    sessionStorage.removeItem('ke_admin_user');
    sessionStorage.removeItem('ke_admin_role');
    sessionStorage.removeItem('ke_admin_fullname');
    setToken(null);
    setUsername('');
    setRole('Viewer');
    setFullName('');
    setInquiries([]);
    setSelectedInquiry(null);
    setSales([]);
    setSelectedSale(null);
    setActiveTab('inquiries');
  };

  const handleSelectInquiry = (item: InquiryItem) => {
    setSelectedInquiry(item);
    setEditStatus(item.status);
    setEditAdminNotes(item.admin_notes || '');
  };

  const handleUpdateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          admin_notes: editAdminNotes
        })
      });
      if (response.status === 401) {
        handleLogout();
        throw new Error('Session expired.');
      }
      if (!response.ok) {
        throw new Error('Failed to update inquiry.');
      }

      // Update local state list
      setInquiries(prev => prev.map(item => {
        if (item.id === selectedInquiry.id) {
          return {
            ...item,
            status: editStatus,
            admin_notes: editAdminNotes
          };
        }
        return item;
      }));

      // Update active selection
      setSelectedInquiry(prev => prev ? {
        ...prev,
        status: editStatus,
        admin_notes: editAdminNotes
      } : null);

    } catch (err: any) {
      alert(err.message || 'Failed to update record.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get unique list of service types for filter dropdown
  const uniqueServices = Array.from(
    new Set(inquiries.map(item => item.service_type))
  );

  // Filter inquiries
  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch =
      item.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesService = serviceFilter === 'All' || item.service_type === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  // Calculate Metrics
  const totalLeads = inquiries.length;
  const pendingLeads = inquiries.filter(i => i.status === 'Pending').length;
  const contactedLeads = inquiries.filter(i => i.status === 'Contacted').length;
  const closedLeads = inquiries.filter(i => i.status === 'Closed').length;

  // Filter Sales Transactions
  const filteredSales = sales.filter(item => {
    const matchesSearch =
      item.reference_id.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
      item.full_name.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
      item.vendor_name.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
      item.collectors_name.toLowerCase().includes(salesSearchQuery.toLowerCase());

    const matchesStatus = salesStatusFilter === 'All' || item.status === salesStatusFilter;
    
    const matchesService = salesServiceFilter === 'All' || item.services.some(s => 
      s.toLowerCase().includes(salesServiceFilter.toLowerCase())
    );

    return matchesSearch && matchesStatus && matchesService;
  });

  // Calculate Sales Metrics
  const totalSalesCount = sales.length;
  const pendingSalesCount = sales.filter(s => s.status === 'Pending Approval').length;
  const approvedSalesCount = sales.filter(s => s.status === 'Approved').length;
  const rejectedSalesCount = sales.filter(s => s.status === 'Rejected').length;

  // Extract unique sales services for filters
  const uniqueSalesServices = Array.from(
    new Set(sales.flatMap(item => item.services || []))
  );

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filteredInquiries.length === 0) return;

    // Header
    const headers = ['Reference ID', 'Date', 'Name', 'Email', 'Phone', 'Service Type', 'Destination', 'Client Notes', 'Admin Remarks', 'Status'];

    // Rows
    const rows = filteredInquiries.map(item => [
      item.reference_id,
      new Date(item.created_at).toLocaleDateString(),
      `"${item.name.replace(/"/g, '""')}"`,
      item.email,
      `'${item.phone}`, // Prefix quote to prevent excel clipping
      `"${item.service_type.replace(/"/g, '""')}"`,
      `"${item.destination.replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(item.admin_notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      item.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kamal_express_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSalesCSV = () => {
    if (filteredSales.length === 0) return;

    const headers = [
      'Reference ID', 'Date', 'Client Name', 'Serial Number', 'Services', 
      'Vendor Name', 'Country', 'Sector', 'Total Amount', 'Received Amount', 
      'Remaining Amount', 'Collector Name', 'Status', 'IP Address'
    ];

    const rows = filteredSales.map(item => [
      item.reference_id,
      new Date(item.date).toLocaleDateString(),
      `"${item.full_name.replace(/"/g, '""')}"`,
      `"${item.serial_number.replace(/"/g, '""')}"`,
      `"${(item.services || []).join(', ').replace(/"/g, '""')}"`,
      `"${item.vendor_name.replace(/"/g, '""')}"`,
      `"${item.country.replace(/"/g, '""')}"`,
      `"${item.sector.replace(/"/g, '""')}"`,
      item.total_amount,
      item.received_amount,
      item.remaining_amount,
      `"${item.collectors_name.replace(/"/g, '""')}"`,
      item.status,
      item.ip_address || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kamal_express_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    /* ==================== 1. VUEXY INSPIRED LOGIN ==================== */
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center lg:grid lg:grid-cols-12 relative overflow-hidden font-sans">

        {/* Left Side Brand Column - Vuexy Style */}
        <div className="hidden lg:flex lg:col-span-8 bg-slate-900 min-h-screen flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#076eff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <img
              src="/logo.jpeg"
              alt="Kamal Express Logo"
              className="h-12 w-auto object-contain rounded-lg border border-slate-750 shadow-md bg-white p-1"
            />
          </div>

          <div className="space-y-6 relative z-10 max-w-xl text-left my-auto">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Manage Your Agency <br />
              <span className="text-emerald-500">Leads & Caravans</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Welcome to the official administration CRM portal. Meticulously manage visa consultancy portfolios, air ticket flight bookings, and pilgrimage Caravan queues in real time.
            </p>
            <div className="flex gap-4 pt-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750"><Shield className="w-4 h-4 text-emerald-500" /> Secure SSL</span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750"><Globe className="w-4 h-4 text-emerald-500" /> cPanel API</span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750"><Award className="w-4 h-4 text-emerald-500" /> IATA Panel</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 relative z-10 text-left">
            © 2026 Kamal Express. Authorized Personnel Access Only.
          </div>
        </div>

        {/* Right Side Login Form Column */}
        <div className="col-span-12 lg:col-span-4 min-h-screen flex items-center justify-center p-8 bg-white relative">
          <div className="max-w-md w-full space-y-8 text-left">

            {/* Mobile Branding Header */}
            <div className="lg:hidden text-center space-y-4 mb-10">
              <img
                src="/logo.jpeg"
                alt="Kamal Express Logo"
                className="h-16 w-auto object-contain mx-auto rounded-xl shadow-md border border-slate-100 p-1 bg-white"
              />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kamal Express CRM</h2>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight hidden lg:block">Welcome to Staff Portal!</h2>
              <p className="text-slate-450 text-xs sm:text-sm font-semibold">
                Please sign-in to your admin credentials and start monitoring active agency inquiries.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              {loginError && (
                <div className="bg-red-50/70 border border-red-200/50 rounded-xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 block">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/50"
                      placeholder="admin"
                    />
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-650 block">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/50"
                      placeholder="••••••••"
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/15 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

          </div>
        </div>

      </div>
    );
  }

  /* ==================== 2. VUEXY INSPIRED DASHBOARD ==================== */
  return (
    <div className="min-h-screen bg-[#f8f7fa] flex text-slate-800 font-sans relative">

      {/* MOBILE SIDEBAR NAVIGATION DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="relative flex w-64 max-w-xs bg-slate-900 text-white flex-col justify-between shrink-0 h-full shadow-2xl transition-all duration-300 ease-in-out">
            
            {/* Drawer Top Header & Logo */}
            <div className="space-y-8">
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-850 bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.jpeg"
                    alt="Kamal Express Logo"
                    className="h-9 w-auto object-contain rounded-lg border border-slate-750 shadow-sm bg-white p-0.5"
                  />
                  <span className="text-xs font-black tracking-tight text-white">Kamal Express</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links list */}
              <div className="px-4 space-y-1">
                <button
                  onClick={() => { setActiveTab('inquiries'); setSelectedInquiry(null); setSelectedSale(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'inquiries'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" /> Inquiries Board
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => { setActiveTab('record-sale'); setSelectedInquiry(null); setSelectedSale(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'record-sale'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4" /> Record Sale Form
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => { setActiveTab('sales-records'); setSelectedInquiry(null); setSelectedSale(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'sales-records'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" /> Sales Records
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {role === 'Admin' && (
                  <button
                    onClick={() => { setActiveTab('users'); setSelectedInquiry(null); setSelectedSale(null); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                      activeTab === 'users'
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" /> Users & Roles
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('website-manager'); setSelectedInquiry(null); setSelectedSale(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'website-manager'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4" /> Website Manager
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Template links to look professional */}
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold text-xs cursor-not-allowed text-left transition-colors">
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4" /> Destination Config
                  </span>
                </button>
              </div>
            </div>

            {/* Sidebar Bottom User session block */}
            <div className="p-4 border-t border-slate-850 space-y-3 bg-slate-950/20">
              <div className="flex items-center gap-3 text-left">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center font-bold text-sm">
                  {username ? username.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-bold text-white block truncate max-w-[130px]">{username}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Staff Operations</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-350 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-750 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION - Vuexy Style */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col justify-between shrink-0 relative z-25 border-r border-slate-850 shadow-md">

        {/* Sidebar Top Header & Logo */}
        <div className="space-y-8">
          <div className="h-20 flex items-center justify-center px-6 border-b border-slate-850 bg-slate-950/20">
            <img
              src="/logo.jpeg"
              alt="Kamal Express Logo"
              className="h-10 w-auto object-contain rounded-lg border border-slate-750 shadow-sm bg-white p-0.5"
            />
          </div>

          {/* Navigation Links list */}
          <div className="px-4 space-y-1">
            <button
              onClick={() => { setActiveTab('inquiries'); setSelectedInquiry(null); setSelectedSale(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" /> Inquiries Board
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => { setActiveTab('record-sale'); setSelectedInquiry(null); setSelectedSale(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'record-sale'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" /> Record Sale Form
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => { setActiveTab('sales-records'); setSelectedInquiry(null); setSelectedSale(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'sales-records'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" /> Sales Records
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {role === 'Admin' && (
              <button
                onClick={() => { setActiveTab('users'); setSelectedInquiry(null); setSelectedSale(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                  activeTab === 'users'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" /> Users & Roles
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => { setActiveTab('website-manager'); setSelectedInquiry(null); setSelectedSale(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'website-manager'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" /> Website Manager
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Template links to look professional */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold text-xs cursor-not-allowed text-left transition-colors">
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" /> Destination Config
              </span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold text-xs cursor-not-allowed text-left transition-colors">
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" /> Umrah Caravans
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom User session block */}
        <div className="p-4 border-t border-slate-850 space-y-3 bg-slate-950/20">
          <div className="flex items-center gap-3 text-left">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center font-bold text-sm">
              {username ? username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-white block truncate max-w-[130px]">{fullName || username}</span>
              <span className="text-[10px] text-slate-400 font-medium block">{role} Portal</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-350 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-750 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-screen">

        {/* Right Header Navbar */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center z-20 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">

            {/* Mobile Logo Brand */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-650 hover:bg-slate-50 border border-slate-150 transition-colors mr-1 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img
                src="/logo.jpeg"
                alt="Kamal Express Logo"
                className="h-9 w-auto object-contain rounded-lg border border-slate-100 p-0.5 bg-white shadow-xs"
              />
              <span className="text-sm font-extrabold text-slate-900 tracking-tight block">Kamal Express</span>
            </div>

            {/* Breadcrumb Title */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">Administration</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-450" />
              <span className="text-slate-800">
                {activeTab === 'inquiries' && 'Inquiries Board'}
                {activeTab === 'record-sale' && 'Record Sale Form'}
                {activeTab === 'sales-records' && 'Sales Records'}
              </span>
            </div>

            {/* Quick Actions navbar tools */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (activeTab === 'sales-records') fetchSales();
                  else if (activeTab === 'users') fetchUsers();
                  else fetchInquiries();
                }}
                disabled={isLoading || isSalesLoading || isUsersLoading}
                className="text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-slate-150 bg-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSalesLoading || isUsersLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reload Database</span>
              </button>

              {/* Mobile Logout trigger */}
              <button
                onClick={handleLogout}
                className="lg:hidden text-slate-550 hover:text-red-650 p-2 rounded-xl hover:bg-red-50 border border-slate-150 bg-white transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-grow space-y-6">

          {/* Welcome Dashboard Banner - Vuexy Card style */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left relative overflow-hidden">
            <div className="space-y-1.5 z-10 relative">
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Welcome Back, {fullName || username}!</h2>
              <p className="text-slate-450 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
                {activeTab === 'inquiries' && (
                  <>You have <span className="text-emerald-700 font-bold">{pendingLeads} pending inquiry tickets</span> requiring immediate coordination or VFS embassy booking actions.</>
                )}
                {activeTab === 'sales-records' && (
                  <>You have <span className="text-amber-700 font-bold">{pendingSalesCount} pending sales transactions</span> requiring approval from the administrator.</>
                )}
                {activeTab === 'record-sale' && (
                  <>Fill out the sales transaction details below to submit a new record for verification and approval.</>
                )}
                {activeTab === 'users' && (
                  <>Manage application users, assign operational roles, or suspend access credentials.</>
                )}
                {activeTab === 'website-manager' && (
                  <>Manage SEO page tags, publish blog posts, configure travel packages, and update visa requirements checklist.</>
                )}
              </p>
            </div>
            {activeTab === 'inquiries' && (
              <button
                onClick={handleExportCSV}
                disabled={filteredInquiries.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer z-10 relative ${filteredInquiries.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-150'
                    : 'bg-emerald-600 hover:bg-emerald-750 text-white shadow-md shadow-emerald-600/10'
                  }`}
              >
                <Download className="w-4 h-4" />
                <span>Export filtered CSV</span>
              </button>
            )}
            {activeTab === 'sales-records' && (
              <button
                onClick={handleExportSalesCSV}
                disabled={filteredSales.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer z-10 relative ${filteredSales.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-150'
                    : 'bg-emerald-600 hover:bg-emerald-750 text-white shadow-md shadow-emerald-600/10'
                  }`}
              >
                <Download className="w-4 h-4" />
                <span>Export Sales CSV</span>
              </button>
            )}
            {activeTab === 'users' && role === 'Admin' && (
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserUsername('');
                  setUserPassword('');
                  setUserFullName('');
                  setUserEmail('');
                  setUserRole('Staff');
                  setUserStatus('Active');
                  setUserModalError('');
                  setIsUserModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer z-10 relative bg-emerald-600 hover:bg-emerald-750 text-white shadow-md shadow-emerald-600/10"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            )}
          </div>

          {/* Metrics Dashboard Row */}
          {/* Metrics Dashboard Row */}
          {(activeTab === 'inquiries' || activeTab === 'sales-records') && (
            activeTab === 'inquiries' ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Leads</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{totalLeads}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Pending Tasks</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{pendingLeads}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">In Contact</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{contactedLeads}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 border border-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Closed Stays</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{closedLeads}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Sales</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{totalSalesCount}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Pending Approval</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{pendingSalesCount}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 border border-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Approved</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{approvedSalesCount}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Rejected</span>
                    <p className="text-xl font-black text-slate-900 leading-tight">{rejectedSalesCount}</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Grid Layout: Left is list card, Right is details slide-over */}
          {activeTab === 'inquiries' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Inquiries table card */}
              <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left ${selectedInquiry ? 'lg:col-span-7' : 'lg:col-span-12'}`}>

                {/* Table Toolbar controls */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 block tracking-tight">Lead Submissions</h3>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Search input */}
                    <div className="relative w-full sm:w-48">
                      <input
                        type="text"
                        placeholder="Search name, ref..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-medium"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>

                    {/* Service Dropdown */}
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer max-w-[120px]"
                    >
                      <option value="All">All Services</option>
                      {uniqueServices.map(srv => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data Table */}
                {isLoading ? (
                  <div className="py-24 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Loading records from database Capsule...</p>
                  </div>
                ) : errorMsg ? (
                  <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p>{errorMsg}</p>
                    <button
                      onClick={fetchInquiries}
                      className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-slate-150"
                    >
                      Retry Fetching
                    </button>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <Search className="w-8 h-8 text-slate-350 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No leads match filters</h4>
                    <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                          <th className="py-4 px-6 text-left">Ref ID / Date</th>
                          <th className="py-4 px-6 text-left">Client Info</th>
                          <th className="py-4 px-6 text-left">Service / Target</th>
                          <th className="py-4 px-6 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredInquiries.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => handleSelectInquiry(item)}
                            className={`hover:bg-slate-50/50 transition-all cursor-pointer ${selectedInquiry?.id === item.id ? 'bg-emerald-500/5 hover:bg-emerald-500/5' : ''
                              }`}
                          >
                            <td className="py-4.5 px-6 font-bold text-slate-900 space-y-0.5 text-left">
                              <span className="block">{item.reference_id}</span>
                              <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 space-y-0.5 text-slate-800 text-left">
                              <span className="font-extrabold block text-slate-900">{item.name}</span>
                              <span className="text-[11px] text-slate-455 font-normal block">{item.email}</span>
                              <span className="text-[11px] text-slate-455 font-normal block">{item.phone}</span>
                            </td>
                            <td className="py-4.5 px-6 space-y-1 font-medium text-slate-855 text-left">
                              <span className="block truncate max-w-[150px] font-semibold">{item.service_type}</span>
                              {item.destination && (
                                <span className="text-[9px] bg-slate-100 text-slate-655 font-bold px-2 py-0.5 rounded-md block w-max mt-0.5">
                                  {item.destination}
                                </span>
                              )}
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold ${item.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-100'
                                  : item.status === 'Contacted'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-100'
                                    : 'bg-green-50 text-green-800 border border-green-100'
                                }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

              {/* Right side Vuexy Slide-over Detail card */}
              {selectedInquiry && (
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-md text-left space-y-6 animate-in slide-in-from-right-4 duration-300">

                  {/* Header with Close */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg block w-max mb-1.5">
                        {selectedInquiry.status} Lead
                      </span>
                      <h3 className="text-base font-extrabold text-slate-950 leading-tight">
                        Ticket: {selectedInquiry.reference_id}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Meta details grids */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Client Name</span>
                        <p className="font-extrabold text-slate-900">{selectedInquiry.name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submitted Date</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(selectedInquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                        <p className="font-semibold text-slate-800 break-all">{selectedInquiry.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                        <p className="font-semibold text-slate-800">{selectedInquiry.phone}</p>
                      </div>
                    </div>

                    {/* Call redirect CTA buttons row */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold transition-all border border-slate-200/40"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Call Now</span>
                      </a>
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Kamal%20Express%20Inquiry%20${selectedInquiry.reference_id}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold transition-all border border-slate-200/40"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Send Mail</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${selectedInquiry.name}, this is Kamal Express regarding your inquiry ${selectedInquiry.reference_id}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-850 text-[10px] font-extrabold transition-all border border-emerald-200/30"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Client</span>
                      </a>
                    </div>
                  </div>

                  {/* Lead Service and Original client message */}
                  <div className="space-y-4 border-t border-slate-100 pt-4 text-xs text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Category</span>
                        <p className="font-extrabold text-slate-900">{selectedInquiry.service_type}</p>
                      </div>
                      {selectedInquiry.destination && (
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visa Country</span>
                          <p className="font-extrabold text-slate-900">{selectedInquiry.destination}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Client Request Details</span>
                      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-150 text-slate-750 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-medium">
                        {selectedInquiry.notes || 'No notes left by client.'}
                      </div>
                    </div>
                  </div>

                  {/* Edit Form status + remarks */}
                  <form onSubmit={handleUpdateInquiry} className="space-y-4 border-t border-slate-100 pt-4 text-xs text-left">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block">
                          Work Status
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          disabled={role === 'Viewer'}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="Pending">Pending Action</option>
                          <option value="Contacted">Contacted Client</option>
                          <option value="Closed">Closed / Resolved</option>
                        </select>
                      </div>

                      {selectedInquiry.ip_address && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Sender IP Address</span>
                          <p className="font-semibold text-slate-455 py-2.5">{selectedInquiry.ip_address}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">
                        Internal Staff Remarks / Notes
                      </label>
                      <textarea
                        rows={4}
                        value={editAdminNotes}
                        onChange={(e) => setEditAdminNotes(e.target.value)}
                        disabled={role === 'Viewer'}
                        placeholder={role === 'Viewer' ? 'No notes available.' : 'Type details of your call, passport submissions, or travel coordinates changes...'}
                        className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white leading-relaxed font-semibold text-slate-750 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    {role === 'Viewer' ? (
                      <div className="text-center p-3 bg-slate-100 rounded-xl text-slate-500 font-bold text-xs border border-slate-200 w-full">
                        View-only Mode: You do not have permission to save updates.
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Saving remarks...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save Ticket Updates
                          </>
                        )}
                      </button>
                    )}

                  </form>

                </div>
              )}

            </div>
          )}

          {/* Record Sale Form Tab */}
          {activeTab === 'record-sale' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm text-left space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Record Sale Transaction</h3>
                <p className="text-xs text-slate-450 font-semibold mt-1">Submit new sales transaction details for administrator approval.</p>
              </div>

              <form onSubmit={handleRecordSaleSubmit} className="space-y-6">
                {saleSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-250/50 rounded-2xl p-4 flex gap-3 text-xs text-emerald-800 font-bold leading-relaxed animate-in fade-in">
                    <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>{saleSuccessMsg}</span>
                  </div>
                )}

                {saleErrorMsg && (
                  <div className="bg-red-50/70 border border-red-200/50 rounded-2xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>{saleErrorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Enter client's full name"
                      value={saleFullName}
                      onChange={(e) => setSaleFullName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Date of Sale <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 font-semibold text-slate-700"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Serial Number</label>
                    <input
                      type="text"
                      disabled
                      readOnly
                      placeholder="Auto-generated (SF-YYMMDD-XXXX)"
                      value={saleSerialNumber}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Collector's Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Collector's Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Enter staff who collected payment"
                      value={saleCollectorsName}
                      onChange={(e) => setSaleCollectorsName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30"
                    />
                  </div>
                </div>

                {/* Services Checkboxes */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Services Required <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {['Ticket', 'Visa', 'Hotel Booking', 'Insurance', 'Apostille', 'Case Preparation', 'Umrah', 'Hajj', 'Appointment'].map((srv) => {
                      const isChecked = saleServices.includes(srv);
                      return (
                        <label key={srv} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none text-[11px] font-semibold ${
                          isChecked 
                            ? 'bg-emerald-500/5 border-emerald-500 text-emerald-850' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSaleServices(prev => [...prev, srv]);
                              } else {
                                setSaleServices(prev => prev.filter(s => s !== srv));
                              }
                            }}
                          />
                          <span>{srv}</span>
                        </label>
                      );
                    })}
                    
                    {/* Other Checkbox */}
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none text-[11px] font-semibold ${
                      saleServices.includes('other') 
                        ? 'bg-emerald-500/5 border-emerald-500 text-emerald-850' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                        checked={saleServices.includes('other')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSaleServices(prev => [...prev, 'other']);
                          } else {
                            setSaleServices(prev => prev.filter(s => s !== 'other'));
                          }
                        }}
                      />
                      <span>Other Service</span>
                    </label>
                  </div>

                  {saleServices.includes('other') && (
                    <div className="pt-2 animate-in fade-in duration-200 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Please specify other service name"
                        value={saleOtherServiceText}
                        onChange={(e) => setSaleOtherServiceText(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Vendor, Country, Sector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Vendor Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Qatar Airways"
                      value={saleVendorName}
                      onChange={(e) => setSaleVendorName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Country <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saudi Arabia"
                      value={saleCountry}
                      onChange={(e) => setSaleCountry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Sector <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ISB-JED-ISB"
                      value={saleSector}
                      onChange={(e) => setSaleSector(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs border-t border-slate-100 pt-4 bg-slate-50/40 p-4 rounded-2xl border border-slate-150">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Total Amount <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="0.00"
                        value={saleTotalAmount}
                        onChange={(e) => setSaleTotalAmount(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white font-bold"
                      />
                      <span className="text-slate-400 text-[10px] font-bold absolute left-3.5 top-3">PKR</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Received Amount <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="0.00"
                        value={saleReceivedAmount}
                        onChange={(e) => setSaleReceivedAmount(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white font-bold text-emerald-700"
                      />
                      <span className="text-slate-400 text-[10px] font-bold absolute left-3.5 top-3">PKR</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Remaining Balance</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={Number(saleRemainingAmount).toLocaleString()}
                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-xs bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
                      />
                      <span className="text-slate-400 text-[10px] font-bold absolute left-3.5 top-3">PKR</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {role === 'Viewer' ? (
                    <div className="text-center p-3 bg-slate-100 rounded-xl text-slate-500 font-bold text-xs border border-slate-200">
                      View-only Mode: You do not have permission to record transactions.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSavingSale}
                      className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                    >
                      {isSavingSale ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Recording transaction...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save & Request Approval
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Sales Records Ledger Tab */}
          {activeTab === 'sales-records' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sales Table Card */}
              <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left ${selectedSale ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 block tracking-tight">Sales Transactions Ledger</h3>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-48">
                      <input
                        type="text"
                        placeholder="Search name, ref, serial..."
                        value={salesSearchQuery}
                        onChange={(e) => setSalesSearchQuery(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-medium"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={salesStatusFilter}
                      onChange={(e) => setSalesStatusFilter(e.target.value as any)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending Approval">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    {/* Service Dropdown */}
                    <select
                      value={salesServiceFilter}
                      onChange={(e) => setSalesServiceFilter(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer max-w-[120px]"
                    >
                      <option value="All">All Services</option>
                      {uniqueSalesServices.map(srv => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table Data */}
                {isSalesLoading ? (
                  <div className="py-24 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Loading sales ledgers...</p>
                  </div>
                ) : salesErrorMsg ? (
                  <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p>{salesErrorMsg}</p>
                    <button
                      onClick={fetchSales}
                      className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-slate-150"
                    >
                      Retry Fetching
                    </button>
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <Search className="w-8 h-8 text-slate-350 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No transactions match filters</h4>
                    <p className="text-[11px] text-slate-400">Try adjusting your keywords or filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                          <th className="py-4 px-6 text-left">Ref ID / Date</th>
                          <th className="py-4 px-6 text-left">Client / Collector</th>
                          <th className="py-4 px-6 text-left">Services / Sector</th>
                          <th className="py-4 px-6 text-right">Amounts</th>
                          <th className="py-4 px-6 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredSales.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedSale(item)}
                            className={`hover:bg-slate-50/50 transition-all cursor-pointer ${selectedSale?.id === item.id ? 'bg-emerald-500/5 hover:bg-emerald-500/5' : ''}`}
                          >
                            <td className="py-4.5 px-6 font-bold text-slate-900 space-y-0.5 text-left">
                              <span className="block">{item.reference_id}</span>
                              <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 space-y-0.5 text-slate-800 text-left">
                              <span className="font-extrabold block text-slate-900">{item.full_name}</span>
                              <span className="text-[10px] text-slate-400 font-bold block">Coll: {item.collectors_name}</span>
                            </td>
                            <td className="py-4.5 px-6 space-y-1 font-medium text-slate-855 text-left">
                              <span className="block truncate max-w-[150px] font-bold">{(item.services || []).join(', ')}</span>
                              <span className="text-[9px] bg-slate-100 text-slate-655 font-bold px-2 py-0.5 rounded-md block w-max mt-0.5">
                                {item.country} ({item.sector})
                              </span>
                            </td>
                            <td className="py-4.5 px-6 text-right space-y-0.5 font-semibold">
                              <div className="text-slate-900"><span className="text-[10px] text-slate-400 font-medium">Tot:</span> {Number(item.total_amount).toLocaleString()}</div>
                              <div className="text-emerald-600"><span className="text-[10px] text-slate-400 font-medium">Rec:</span> {Number(item.received_amount).toLocaleString()}</div>
                              {Number(item.remaining_amount) > 0 && (
                                <div className="text-amber-600"><span className="text-[10px] text-slate-400 font-medium">Bal:</span> {Number(item.remaining_amount).toLocaleString()}</div>
                              )}
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold ${
                                item.status === 'Pending Approval'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-100'
                                  : item.status === 'Approved'
                                    ? 'bg-green-50 text-green-800 border border-green-100'
                                    : 'bg-red-50 text-red-800 border border-red-100'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sales Detail Sidebar Slideover */}
              {selectedSale && (
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-md text-left space-y-6 animate-in slide-in-from-right-4 duration-300">
                  
                  {/* Close and Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg block w-max mb-1.5 ${
                        selectedSale.status === 'Pending Approval' 
                          ? 'bg-amber-50 text-amber-800 border border-amber-250/20' 
                          : selectedSale.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/20'
                            : 'bg-red-50 text-red-800 border border-red-250/20'
                      }`}>
                        {selectedSale.status}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-950 leading-tight">
                        Transaction: {selectedSale.reference_id}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedSale(null)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body details */}
                  <div className="space-y-4 text-xs font-semibold text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Client Name</span>
                        <p className="font-extrabold text-slate-900">{selectedSale.full_name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(selectedSale.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Serial Number</span>
                        <p className="font-semibold text-slate-800">{selectedSale.serial_number}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Collector Name</span>
                        <p className="font-semibold text-slate-800">{selectedSale.collectors_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4 text-xs text-left animate-in fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vendor Name</span>
                        <p className="font-extrabold text-slate-900">{selectedSale.vendor_name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Country & Sector</span>
                        <p className="font-extrabold text-slate-900">{selectedSale.country} ({selectedSale.sector})</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Services Requested</span>
                      <div className="flex flex-wrap gap-1.5 font-semibold">
                        {(Array.isArray(selectedSale.services) ? selectedSale.services : []).map((srv, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-855 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/50">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4 text-xs font-semibold text-left">
                    <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Financial Summary</span>
                    <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-150 space-y-2 font-medium">
                      <div className="flex justify-between text-slate-655">
                        <span>Total Amount:</span>
                        <span className="font-bold text-slate-900">{Number(selectedSale.total_amount).toLocaleString()} PKR</span>
                      </div>
                      <div className="flex justify-between text-slate-655">
                        <span>Received Amount:</span>
                        <span className="font-bold text-emerald-600">{Number(selectedSale.received_amount).toLocaleString()} PKR</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-slate-850">
                        <span>Remaining Balance:</span>
                        <span className={Number(selectedSale.remaining_amount) > 0 ? 'text-amber-600 font-black' : 'text-slate-900 font-bold'}>
                          {Number(selectedSale.remaining_amount).toLocaleString()} PKR
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedSale.ip_address && (
                    <div className="text-[10px] text-slate-455 border-t border-slate-100 pt-3 text-left">
                      Logged from IP: <span className="font-semibold">{selectedSale.ip_address}</span>
                    </div>
                  )}

                  {selectedSale.status === 'Pending Approval' && (
                    <div className="pt-3 border-t border-slate-100">
                      {role === 'Admin' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleUpdateSaleStatus(selectedSale.id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateSaleStatus(selectedSale.id, 'Rejected')}
                            className="bg-red-50 hover:bg-red-150 text-red-650 font-bold py-2.5 rounded-xl border border-red-250/50 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-3 bg-slate-100 rounded-xl text-slate-500 font-semibold text-xs border border-slate-200 italic">
                          Pending approval by an Administrator.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Users & Roles Management Tab */}
          {activeTab === 'users' && role === 'Admin' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left animate-in fade-in duration-200">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 block tracking-tight">System Users & Access Roles</h3>
              </div>

              {isUsersLoading ? (
                <div className="py-24 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading system users...</p>
                </div>
              ) : usersErrorMsg ? (
                <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p>{usersErrorMsg}</p>
                  <button
                    onClick={fetchUsers}
                    className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-slate-150"
                  >
                    Retry Fetching
                  </button>
                </div>
              ) : users.length === 0 ? (
                <div className="py-24 text-center space-y-3">
                  <User className="w-8 h-8 text-slate-350 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">No users found</h4>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                        <th className="py-4 px-6 text-left">User Details</th>
                        <th className="py-4 px-6 text-left">Email Address</th>
                        <th className="py-4 px-6 text-center">Role</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-4.5 px-6 space-y-0.5 text-left">
                            <span className="font-extrabold block text-slate-900">{u.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block">@{u.username}</span>
                          </td>
                          <td className="py-4.5 px-6 text-left font-semibold text-slate-800">
                            {u.email}
                          </td>
                          <td className="py-4.5 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === 'Admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                : u.role === 'Staff'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              u.status === 'Active'
                                ? 'bg-green-50 text-green-800 border border-green-100'
                                : 'bg-red-50 text-red-800 border border-red-100'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setUserUsername(u.username);
                                setUserPassword('');
                                setUserFullName(u.full_name);
                                setUserEmail(u.email);
                                setUserRole(u.role);
                                setUserStatus(u.status);
                                setUserModalError('');
                                setIsUserModalOpen(true);
                              }}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-750 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all"
                            >
                              Edit
                            </button>
                            {u.username !== username && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-100 transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Website Content Manager Tab */}
          {activeTab === 'website-manager' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left animate-in fade-in duration-200">
              {/* Sub-tab Navigation */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveSubTab('seo')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'seo'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    SEO & Pages
                  </button>
                  <button
                    onClick={() => setActiveSubTab('blogs')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'blogs'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Blogs
                  </button>
                  <button
                    onClick={() => setActiveSubTab('packages')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'packages'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Travel Packages
                  </button>
                  <button
                    onClick={() => setActiveSubTab('destinations')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'destinations'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Visa Guides
                  </button>
                  <button
                    onClick={() => setActiveSubTab('faqs')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'faqs'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    FAQs
                  </button>
                </div>

                {/* Create/Action Buttons */}
                {activeSubTab === 'blogs' && (
                  <button
                    onClick={() => handleOpenBlogModal()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Blog Post
                  </button>
                )}
                {activeSubTab === 'packages' && (
                  <button
                    onClick={() => handleOpenPkgModal()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Package
                  </button>
                )}
                {activeSubTab === 'destinations' && (
                  <button
                    onClick={() => handleOpenDestModal()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Visa Guide
                  </button>
                )}
                {activeSubTab === 'faqs' && (
                  <button
                    onClick={() => handleOpenFaqModal()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Add FAQ
                  </button>
                )}
              </div>

              {/* Loader */}
              {isContentLoading ? (
                <div className="py-24 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading website contents...</p>
                </div>
              ) : contentErrorMsg ? (
                <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p>{contentErrorMsg}</p>
                </div>
              ) : (
                <div className="p-6">
                  
                  {/* SEO SUB-TAB CONTENT */}
                  {activeSubTab === 'seo' && (
                    <div className="space-y-6">
                      {selectedSeo ? (
                        // SEO Update Form
                        <form onSubmit={handleUpdateSeo} className="space-y-4 max-w-xl text-xs font-semibold">
                          <h4 className="text-sm font-bold text-slate-900">Edit Meta Tags for route: <span className="text-emerald-600">/{selectedSeo.route_path}</span></h4>
                          <div className="space-y-1.5">
                            <label className="text-slate-650 block">Meta Title</label>
                            <input
                              type="text"
                              required
                              value={seoMetaTitle}
                              onChange={(e) => setSeoMetaTitle(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/20 text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-slate-650 block">Meta Description</label>
                            <textarea
                              required
                              rows={3}
                              value={seoMetaDescription}
                              onChange={(e) => setSeoMetaDescription(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/20 text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-slate-650 block">Keywords (Comma separated)</label>
                            <input
                              type="text"
                              value={seoMetaKeywords}
                              onChange={(e) => setSeoMetaKeywords(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/20 text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                              placeholder="travel, tourism, caravans"
                            />
                          </div>
                          <div className="pt-2 flex gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedSeo(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-center"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingSeo}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              {isSavingSeo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save & Sync Page
                            </button>
                          </div>
                        </form>
                      ) : (
                        // SEO Pages Table
                        <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                                <th className="py-4 px-6 text-left">Route / Page</th>
                                <th className="py-4 px-6 text-left">Meta Title</th>
                                <th className="py-4 px-6 text-left">Meta Description</th>
                                <th className="py-4 px-6 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {seoPages.map((page) => (
                                <tr key={page.id} className="hover:bg-slate-50/30">
                                  <td className="py-4 px-6 font-bold text-slate-900 text-left">
                                    /{page.route_path || 'home'}
                                  </td>
                                  <td className="py-4 px-6 text-slate-800 text-left font-semibold truncate max-w-[200px]">
                                    {page.meta_title}
                                  </td>
                                  <td className="py-4 px-6 text-slate-450 text-left font-medium truncate max-w-[350px]">
                                    {page.meta_description}
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                    <button
                                      onClick={() => handleEditSeo(page)}
                                      className="text-xs font-bold text-emerald-600 hover:text-emerald-750 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                                    >
                                      Edit Meta
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BLOGS SUB-TAB CONTENT */}
                  {activeSubTab === 'blogs' && (
                    <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                            <th className="py-4 px-6 text-left">Post Details</th>
                            <th className="py-4 px-6 text-left">Category</th>
                            <th className="py-4 px-6 text-left">Author & Date</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {blogsList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">No dynamic blogs found. Standard fallback active.</td>
                            </tr>
                          ) : (
                            blogsList.map((blog) => (
                              <tr key={blog.id} className="hover:bg-slate-50/30">
                                <td className="py-4 px-6 text-left space-y-1">
                                  <span className="font-extrabold text-slate-900 block">{blog.title}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[280px] font-medium">{blog.summary}</span>
                                </td>
                                <td className="py-4 px-6 text-left font-bold text-slate-700">
                                  {blog.category}
                                </td>
                                <td className="py-4 px-6 text-left space-y-0.5 font-semibold text-slate-650">
                                  <span className="block font-bold">By {blog.author}</span>
                                  <span className="text-[10px] text-slate-400 block">{new Date(blog.date).toLocaleDateString()}</span>
                                </td>
                                <td className="py-4 px-6 text-center space-x-2">
                                  <button
                                    onClick={() => handleOpenBlogModal(blog)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-750 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBlog(blog.id)}
                                    className="text-xs font-bold text-red-650 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* PACKAGES SUB-TAB CONTENT */}
                  {activeSubTab === 'packages' && (
                    <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                            <th className="py-4 px-6 text-left">Package Title</th>
                            <th className="py-4 px-6 text-left">Category & Location</th>
                            <th className="py-4 px-6 text-left">Duration & Price</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {packagesList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">No dynamic packages found. Standard fallback active.</td>
                            </tr>
                          ) : (
                            packagesList.map((pkg) => (
                              <tr key={pkg.id} className="hover:bg-slate-50/30">
                                <td className="py-4 px-6 text-left font-extrabold text-slate-900">
                                  {pkg.title}
                                </td>
                                <td className="py-4 px-6 text-left space-y-0.5 font-bold text-slate-700">
                                  <span className="block">{pkg.category}</span>
                                  <span className="text-[10px] text-slate-400 block font-semibold">{pkg.location}</span>
                                </td>
                                <td className="py-4 px-6 text-left space-y-0.5 font-semibold text-slate-650">
                                  <span className="block">{pkg.duration}</span>
                                  <span className="text-[10px] text-emerald-600 block font-black">{pkg.price}</span>
                                </td>
                                <td className="py-4 px-6 text-center space-x-2">
                                  <button
                                    onClick={() => handleOpenPkgModal(pkg)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-750 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePkg(pkg.id)}
                                    className="text-xs font-bold text-red-655 hover:text-red-750 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* VISA GUIDES / DESTINATIONS SUB-TAB CONTENT */}
                  {activeSubTab === 'destinations' && (
                    <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                            <th className="py-4 px-6 text-left">Country Name</th>
                            <th className="py-4 px-6 text-left">Visa Type</th>
                            <th className="py-4 px-6 text-left">Processing & Price</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {destinationsList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">No dynamic destinations found. Standard fallback active.</td>
                            </tr>
                          ) : (
                            destinationsList.map((dest) => (
                              <tr key={dest.id} className="hover:bg-slate-50/30">
                                <td className="py-4 px-6 text-left font-extrabold text-slate-900">
                                  {dest.name} (/{dest.slug})
                                </td>
                                <td className="py-4 px-6 text-left font-bold text-slate-700">
                                  {dest.visa_type}
                                </td>
                                <td className="py-4 px-6 text-left space-y-0.5 font-semibold text-slate-650">
                                  <span className="block">{dest.processing_time}</span>
                                  <span className="text-[10px] text-emerald-600 block font-black">{dest.price}</span>
                                </td>
                                <td className="py-4 px-6 text-center space-x-2">
                                  <button
                                    onClick={() => handleOpenDestModal(dest)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-750 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDest(dest.id)}
                                    className="text-xs font-bold text-red-655 hover:text-red-750 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* FAQS SUB-TAB CONTENT */}
                  {activeSubTab === 'faqs' && (
                    <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                            <th className="py-4 px-6 text-left">Faq Question</th>
                            <th className="py-4 px-6 text-left">Category</th>
                            <th className="py-4 px-6 text-left">Answer Preview</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {faqsList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">No dynamic FAQs found. Standard fallback active.</td>
                            </tr>
                          ) : (
                            faqsList.map((faq) => (
                              <tr key={faq.id} className="hover:bg-slate-50/30">
                                <td className="py-4 px-6 text-left font-extrabold text-slate-900 max-w-[200px]">
                                  {faq.question}
                                </td>
                                <td className="py-4 px-6 text-left font-bold text-slate-700">
                                  {faq.category}
                                </td>
                                <td className="py-4 px-6 text-left text-slate-450 truncate max-w-[300px] font-medium">
                                  {faq.answer}
                                </td>
                                <td className="py-4 px-6 text-center space-x-2">
                                  <button
                                    onClick={() => handleOpenFaqModal(faq)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-750 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFaq(faq.id)}
                                    className="text-xs font-bold text-red-655 hover:text-red-755 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* User Add/Edit Dialog Modal */}
          {isUserModalOpen && role === 'Admin' && (
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-150 text-left animate-in zoom-in-95 duration-250">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-950">
                    {selectedUser ? 'Edit User Credentials' : 'Add System User'}
                  </h3>
                  <button
                    onClick={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
                    className="text-slate-400 hover:text-slate-650 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUserSubmit} className="p-6 space-y-4">
                  {userModalError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{userModalError}</span>
                    </div>
                  )}

                  <div className="space-y-4 text-xs font-semibold">
                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Username</label>
                      <input
                        type="text"
                        required
                        disabled={!!selectedUser}
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value)}
                        placeholder="john_doe"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        required
                        value={userFullName}
                        onChange={(e) => setUserFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="john@kamalexpress.com"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">
                        Password {selectedUser && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                      </label>
                      <input
                        type="password"
                        required={!selectedUser}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder={selectedUser ? '••••••••' : 'Enter password'}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-all bg-white"
                      />
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Access Role</label>
                        <select
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value as any)}
                          disabled={selectedUser?.username === username}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white text-slate-700 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Staff">Staff</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider block">Account Status</label>
                        <select
                          value={userStatus}
                          onChange={(e) => setUserStatus(e.target.value as any)}
                          disabled={selectedUser?.username === username}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white text-slate-700 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="Active">Active</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingUser}
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingUser ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Blog Editor Dialog Modal */}
          {isBlogModalOpen && (
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-150 text-left animate-in zoom-in-95 duration-250">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-950">
                    {selectedBlog ? 'Edit Blog Post' : 'Add Blog Post'}
                  </h3>
                  <button
                    onClick={() => { setIsBlogModalOpen(false); setSelectedBlog(null); }}
                    className="text-slate-400 hover:text-slate-655 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveBlog} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {blogModalError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{blogModalError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Title</label>
                      <input
                        type="text"
                        required
                        value={blogTitle}
                        onChange={(e) => {
                          setBlogTitle(e.target.value);
                          if (!selectedBlog) {
                            setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                          }
                        }}
                        placeholder="e.g. Hunza Travel Guide"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Slug</label>
                      <input
                        type="text"
                        required
                        value={blogSlug}
                        onChange={(e) => setBlogSlug(e.target.value)}
                        placeholder="hunza-travel-guide"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Category</label>
                      <select
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="Visa Updates">Visa Updates</option>
                        <option value="Travel Tips">Travel Tips</option>
                        <option value="Country Guides">Country Guides</option>
                        <option value="Umrah Guides">Umrah Guides</option>
                        <option value="Airline News">Airline News</option>
                        <option value="Travel Insurance Advice">Travel Insurance Advice</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Cover Image URL</label>
                      <input
                        type="text"
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Author Name</label>
                      <input
                        type="text"
                        required
                        value={blogAuthor}
                        onChange={(e) => setBlogAuthor(e.target.value)}
                        placeholder="System Administrator"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Publish Date</label>
                      <input
                        type="date"
                        required
                        value={blogDate}
                        onChange={(e) => setBlogDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Summary / Subtitle</label>
                    <textarea
                      required
                      rows={2}
                      value={blogSummary}
                      onChange={(e) => setBlogSummary(e.target.value)}
                      placeholder="Brief excerpt summarizing the blog post..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Full Article Content (HTML/Text)</label>
                    <textarea
                      required
                      rows={8}
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      placeholder="Type the full article content here. You can use standard HTML paragraph tags like <p>...</p>."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsBlogModalOpen(false); setSelectedBlog(null); }}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingBlog}
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingBlog ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Article</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Package Builder Dialog Modal */}
          {isPkgModalOpen && (
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-150 text-left animate-in zoom-in-95 duration-250">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-950">
                    {selectedPkg ? 'Edit Travel Package' : 'Create Travel Package'}
                  </h3>
                  <button
                    onClick={() => { setIsPkgModalOpen(false); setSelectedPkg(null); }}
                    className="text-slate-400 hover:text-slate-655 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePkg} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {pkgModalError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{pkgModalError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Package ID (Unique Key)</label>
                      <input
                        type="text"
                        required
                        disabled={!!selectedPkg}
                        value={pkgId}
                        onChange={(e) => setPkgId(e.target.value)}
                        placeholder="e.g. tour-hunza"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white disabled:bg-slate-100 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Package Title</label>
                      <input
                        type="text"
                        required
                        value={pkgTitle}
                        onChange={(e) => setPkgTitle(e.target.value)}
                        placeholder="Hunza Dream Tour"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Location / Scope</label>
                      <input
                        type="text"
                        required
                        value={pkgLocation}
                        onChange={(e) => setPkgLocation(e.target.value)}
                        placeholder="Hunza Valley"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Duration</label>
                      <input
                        type="text"
                        required
                        value={pkgDuration}
                        onChange={(e) => setPkgDuration(e.target.value)}
                        placeholder="7 Days / 6 Nights"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Starting Price (PKR/USD)</label>
                      <input
                        type="text"
                        required
                        value={pkgPrice}
                        onChange={(e) => setPkgPrice(e.target.value)}
                        placeholder="PKR 85,000"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Category</label>
                      <select
                        value={pkgCategory}
                        onChange={(e) => setPkgCategory(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="International">International</option>
                        <option value="Domestic">Domestic</option>
                        <option value="Customized">Customized</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Image URL</label>
                      <input
                        type="text"
                        value={pkgImage}
                        onChange={(e) => setPkgImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={pkgDescription}
                      onChange={(e) => setPkgDescription(e.target.value)}
                      placeholder="Detailed overview about the travel itinerary..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Highlights (One per line)</label>
                      <textarea
                        rows={4}
                        value={pkgHighlightsText}
                        onChange={(e) => setPkgHighlightsText(e.target.value)}
                        placeholder="Attabad Lake Boating&#10;Khunjerab Border Crossing"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Inclusions (One per line)</label>
                      <textarea
                        rows={4}
                        value={pkgInclusionsText}
                        onChange={(e) => setPkgInclusionsText(e.target.value)}
                        placeholder="Premium Transport&#10;Breakfast Buffet"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Exclusions (One per line)</label>
                      <textarea
                        rows={4}
                        value={pkgExclusionsText}
                        onChange={(e) => setPkgExclusionsText(e.target.value)}
                        placeholder="Lunch & Dinner&#10;Personal Porter Fees"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Itinerary Steps (JSON Array)</label>
                    <textarea
                      required
                      rows={6}
                      value={pkgItineraryText}
                      onChange={(e) => setPkgItineraryText(e.target.value)}
                      placeholder={'[\n  {\n    "day": 1,\n    "title": "Arrival",\n    "description": "Pickup and transit..."\n  }\n]'}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsPkgModalOpen(false); setSelectedPkg(null); }}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPkg}
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingPkg ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Package</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Destination Builder Dialog Modal */}
          {isDestModalOpen && (
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-150 text-left animate-in zoom-in-95 duration-250">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-950">
                    {selectedDest ? 'Edit Visa Guide' : 'Create Visa Guide'}
                  </h3>
                  <button
                    onClick={() => { setIsDestModalOpen(false); setSelectedDest(null); }}
                    className="text-slate-400 hover:text-slate-655 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveDest} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {destModalError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{destModalError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Destination ID</label>
                      <input
                        type="text"
                        required
                        disabled={!!selectedDest}
                        value={destId}
                        onChange={(e) => setDestId(e.target.value)}
                        placeholder="e.g. dest-uae"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white disabled:bg-slate-100 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Country Name</label>
                      <input
                        type="text"
                        required
                        value={destName}
                        onChange={(e) => setDestName(e.target.value)}
                        placeholder="United Arab Emirates"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Slug (URL Path)</label>
                      <input
                        type="text"
                        required
                        value={destSlug}
                        onChange={(e) => setDestSlug(e.target.value)}
                        placeholder="uae"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Visa Type Details</label>
                      <input
                        type="text"
                        required
                        value={destVisaType}
                        onChange={(e) => setDestVisaType(e.target.value)}
                        placeholder="Tourist eVisa (30 Days)"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Processing Duration</label>
                      <input
                        type="text"
                        required
                        value={destProcessingTime}
                        onChange={(e) => setDestProcessingTime(e.target.value)}
                        placeholder="2 - 3 Working Days"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Stay Limit</label>
                      <input
                        type="text"
                        required
                        value={destStayDuration}
                        onChange={(e) => setDestStayDuration(e.target.value)}
                        placeholder="30 Days from entry"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Validity Period</label>
                      <input
                        type="text"
                        required
                        value={destValidity}
                        onChange={(e) => setDestValidity(e.target.value)}
                        placeholder="60 Days from issuance"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Starting Fee</label>
                      <input
                        type="text"
                        required
                        value={destPrice}
                        onChange={(e) => setDestPrice(e.target.value)}
                        placeholder="USD 110"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Image URL</label>
                      <input
                        type="text"
                        value={destImage}
                        onChange={(e) => setDestImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Required Documents List (One per line)</label>
                    <textarea
                      required
                      rows={4}
                      value={destDocsText}
                      onChange={(e) => setDestDocsText(e.target.value)}
                      placeholder="Passport Scan (min 6 months validity)&#10;White Background Photo"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Destination Specific FAQs (JSON Array)</label>
                    <textarea
                      required
                      rows={5}
                      value={destFaqsText}
                      onChange={(e) => setDestFaqsText(e.target.value)}
                      placeholder={'[\n  {\n    "question": "FAQ Question?",\n    "answer": "FAQ Answer."\n  }\n]'}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsDestModalOpen(false); setSelectedDest(null); }}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingDest}
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingDest ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Guide</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* FAQ Dialog Modal */}
          {isFaqModalOpen && (
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-150 text-left animate-in zoom-in-95 duration-250">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-950">
                    {selectedFaq ? 'Edit FAQ Item' : 'Add FAQ Item'}
                  </h3>
                  <button
                    onClick={() => { setIsFaqModalOpen(false); setSelectedFaq(null); }}
                    className="text-slate-400 hover:text-slate-655 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveFaq} className="p-6 space-y-4">
                  {faqModalError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{faqModalError}</span>
                    </div>
                  )}

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Category</label>
                      <select
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="Visa Services">Visa Services</option>
                        <option value="Air Ticketing">Air Ticketing</option>
                        <option value="Hotel Booking">Hotel Booking</option>
                        <option value="Umrah">Umrah</option>
                        <option value="Tour Packages">Tour Packages</option>
                        <option value="Travel Insurance">Travel Insurance</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Question</label>
                      <input
                        type="text"
                        required
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="e.g. Do I need a transit visa?"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Answer Details</label>
                      <textarea
                        required
                        rows={4}
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Explain the answer thoroughly..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsFaqModalOpen(false); setSelectedFaq(null); }}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingFaq}
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingFaq ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save FAQ</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 text-slate-450 py-5 text-xs font-semibold">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between">
            <p>© 2026 Kamal Express. All rights reserved.</p>
            <p className="mt-1 sm:mt-0 text-slate-400">Authorized personnel operations.</p>
          </div>
        </footer>

      </div>

    </div>
  );
}
