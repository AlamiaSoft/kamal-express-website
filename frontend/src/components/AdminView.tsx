import { useState, useEffect } from 'react';
import { 
  Lock, User, LogOut, Search, Filter, Download, 
  Phone, Mail, MessageSquare, Save, X, Calendar, 
  CheckCircle, Clock, AlertCircle, RefreshCw, Layers
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
    /* ==================== 1. LOGIN CONTAINER ==================== */
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background visual accents */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-700/60 shadow-xl relative z-10 text-left">
          
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">CRM Staff Portal</h2>
            <p className="text-sm text-slate-400">Kamal Express Corporate Administration</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-xs text-red-400 font-semibold leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Enter staff username"
                  />
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

        </div>
      </div>
    );
  }

  /* ==================== 2. ADMIN DASHBOARD ==================== */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-950">
      
      {/* Top Header navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-sm tracking-wider shadow-sm">
              KE CRM
            </span>
            <span className="text-sm font-bold tracking-tight hidden sm:inline text-slate-300">
              Staff Portal • {username}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchInquiries}
              disabled={isLoading}
              className="text-slate-350 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-750"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Page Title */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leads & Inquiries Board</h1>
          <p className="text-xs text-slate-400 leading-normal">
            Direct customer submissions from the website forms. Review client coordinates, take action, and log internal remarks.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Leads</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700"><Layers className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-black text-slate-900">{totalLeads}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Tasks</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700"><Clock className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-black text-slate-900">{pendingLeads}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">In Contact</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700"><MessageSquare className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-black text-slate-900">{contactedLeads}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Closed Leads</span>
              <div className="p-1.5 rounded-lg bg-green-50 text-green-700"><CheckCircle className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-black text-slate-900">{closedLeads}</p>
          </div>

        </div>

        {/* Filter Toolbar & Search */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between gap-4 text-left">
          
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search name, ref, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-slate-50/50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Status Filter */}
            <div className="relative w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-slate-50/50 appearance-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="Closed">Closed</option>
              </select>
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Service Type Filter */}
            <div className="relative w-full md:w-56">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-slate-50/50 appearance-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="All">All Services</option>
                {uniqueServices.map(srv => (
                  <option key={srv} value={srv}>{srv}</option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredInquiries.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              filteredInquiries.length === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-150' 
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>

        </div>

        {/* Primary Workspace: Left side inquiries list, Right side details panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel Table Board */}
          <div className={`bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden ${selectedInquiry ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading data from cPanel server...</p>
              </div>
            ) : errorMsg ? (
              <div className="py-16 text-center space-y-3 max-w-sm mx-auto text-xs text-red-500 font-semibold">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p>{errorMsg}</p>
                <button 
                  onClick={fetchInquiries}
                  className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors cursor-pointer border border-slate-150"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-800">No matching inquiries</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Try typing different search queries or adjusting filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Ref ID</th>
                      <th className="py-3.5 px-5">Client Info</th>
                      <th className="py-3.5 px-5">Service / Destination</th>
                      <th className="py-3.5 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredInquiries.map((item) => (
                      <tr 
                        key={item.id}
                        onClick={() => handleSelectInquiry(item)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          selectedInquiry?.id === item.id ? 'bg-emerald-500/5 hover:bg-emerald-500/5' : ''
                        }`}
                      >
                        <td className="py-4 px-5 font-bold text-slate-900 space-y-0.5">
                          <span>{item.reference_id}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-5 space-y-0.5">
                          <span className="font-bold text-slate-850 block">{item.name}</span>
                          <span className="text-[11px] text-slate-450 font-normal block">{item.email}</span>
                          <span className="text-[11px] text-slate-450 font-normal block">{item.phone}</span>
                        </td>
                        <td className="py-4 px-5 space-y-0.5 font-medium text-slate-800">
                          <span className="block truncate max-w-[180px]">{item.service_type}</span>
                          {item.destination && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded block w-max mt-0.5">
                              {item.destination}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'Pending' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                              : item.status === 'Contacted'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                              : 'bg-green-50 text-green-700 border border-green-200/50'
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

          {/* Right panel Inquiry details panel */}
          {selectedInquiry && (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-md text-left space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* Header with Close */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Lead Details
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {selectedInquiry.reference_id}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client Info Block */}
              <div className="space-y-4">
                
                {/* Meta details table */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
                    <p className="font-bold text-slate-800">{selectedInquiry.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Submitted Date</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
                    <p className="font-medium text-slate-800 break-all">{selectedInquiry.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Phone</span>
                    <p className="font-medium text-slate-800">{selectedInquiry.phone}</p>
                  </div>
                </div>

                {/* Quick actions line */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
                  <a 
                    href={`tel:${selectedInquiry.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all"
                  >
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>Call Client</span>
                  </a>
                  <a 
                    href={`mailto:${selectedInquiry.email}?subject=Kamal%20Express%20Inquiry%20${selectedInquiry.reference_id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all"
                  >
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>Send Email</span>
                  </a>
                  <a 
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedInquiry.name)},%20this%20is%20Kamal%20Express%20regarding%20your%20inquiry%2520${selectedInquiry.reference_id}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold transition-all border border-emerald-200/40"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Chat</span>
                  </a>
                </div>

              </div>

              {/* Inquiry details */}
              <div className="space-y-4 border-t border-slate-100 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Requested Service</span>
                    <p className="font-bold text-slate-800">{selectedInquiry.service_type}</p>
                  </div>
                  {selectedInquiry.destination && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Target Destination</span>
                      <p className="font-bold text-slate-800">{selectedInquiry.destination}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Client Message / Notes</span>
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-medium">
                    {selectedInquiry.notes || 'No message provided.'}
                  </div>
                </div>
              </div>

              {/* Edit Status & Remarks Form */}
              <form onSubmit={handleUpdateInquiry} className="space-y-4 border-t border-slate-100 pt-4 text-xs text-left">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">
                      Lead Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  
                  {selectedInquiry.ip_address && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">IP Address</span>
                      <p className="font-medium text-slate-500 py-2">{selectedInquiry.ip_address}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">
                    Internal Staff Remarks / Notes
                  </label>
                  <textarea
                    rows={4}
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="Type call logs, visa slot details, or general follow-up notes here..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-white leading-relaxed font-semibold text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
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

      {/* Admin Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-450 py-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between">
          <p>© 2026 Kamal Express. All rights reserved.</p>
          <p className="mt-1 sm:mt-0 text-slate-500">Authorized personnel access only.</p>
        </div>
      </footer>

    </div>
  );
}
