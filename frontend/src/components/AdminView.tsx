import { useState, useEffect } from 'react';
import {
  Lock, User, LogOut, Search, Filter, Download,
  Phone, Mail, MessageSquare, Save, X, Calendar,
  CheckCircle, Clock, AlertCircle, RefreshCw, Layers,
  ChevronRight, ArrowRight, Shield, Globe, Award
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

export default function AdminView() {
  // Authentication states
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('ke_admin_token'));
  const [username, setUsername] = useState<string>(sessionStorage.getItem('ke_admin_user') || '');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  // Load inquiries if authenticated
  useEffect(() => {
    if (token) {
      fetchInquiries();
    }
  }, [token]);

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
      setToken(data.token);
      setUsername(data.username);
    } catch (err: any) {
      setLoginError(err.message || 'Connection failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ke_admin_token');
    sessionStorage.removeItem('ke_admin_user');
    setToken(null);
    setUsername('');
    setInquiries([]);
    setSelectedInquiry(null);
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
    <div className="min-h-screen bg-[#f8f7fa] flex text-slate-800 font-sans">

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
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/10 cursor-pointer text-left">
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" /> Inquiries Board
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
              <span className="text-xs font-bold text-white block truncate max-w-[130px]">{username}</span>
              <span className="text-[10px] text-slate-400 font-medium block">Staff Operations</span>
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
              <span className="text-slate-800">Inquiries Dashboard</span>
            </div>

            {/* Quick Actions navbar tools */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchInquiries}
                disabled={isLoading}
                className="text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-slate-150 bg-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
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
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Welcome Back, {username}!</h2>
              <p className="text-slate-450 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
                You have <span className="text-emerald-700 font-bold">{pendingLeads} pending inquiry tickets</span> requiring immediate coordination or VFS embassy booking actions.
              </p>
            </div>
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
          </div>

          {/* Metrics Dashboard Row */}
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

          {/* Grid Layout: Left is list card, Right is details slide-over */}
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
                      <tr className="bg-[#fcfbfd] border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        <th className="py-4 px-6">Ref ID / Date</th>
                        <th className="py-4 px-6">Client Info</th>
                        <th className="py-4 px-6">Service / Target</th>
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
                          <td className="py-4.5 px-6 font-bold text-slate-900 space-y-0.5">
                            <span className="block">{item.reference_id}</span>
                            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 space-y-0.5 text-slate-800">
                            <span className="font-extrabold block text-slate-900">{item.name}</span>
                            <span className="text-[11px] text-slate-450 font-normal block">{item.email}</span>
                            <span className="text-[11px] text-slate-450 font-normal block">{item.phone}</span>
                          </td>
                          <td className="py-4.5 px-6 space-y-1 font-medium text-slate-850">
                            <span className="block truncate max-w-[150px] font-semibold">{item.service_type}</span>
                            {item.destination && (
                              <span className="text-[9px] bg-slate-100 text-slate-650 font-bold px-2 py-0.5 rounded-md block w-max mt-0.5">
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
                      href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedInquiry.name)},%20this%20is%20Kamal%20Express%2520regarding%252520your%25252520inquiry%2525252520${selectedInquiry.reference_id}.`}
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
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value="Pending">Pending Action</option>
                        <option value="Contacted">Contacted Client</option>
                        <option value="Closed">Closed / Resolved</option>
                      </select>
                    </div>

                    {selectedInquiry.ip_address && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Sender IP Address</span>
                        <p className="font-semibold text-slate-400 py-2.5">{selectedInquiry.ip_address}</p>
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
                      placeholder="Type details of your call, passport submissions, or travel coordinates changes..."
                      className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white leading-relaxed font-semibold text-slate-750"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs"
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

                </form>

              </div>
            )}

          </div>

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
