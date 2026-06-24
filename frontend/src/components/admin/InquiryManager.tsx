import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Layers, Clock, MessageSquare, CheckCircle, 
  Phone, Mail, Save, X, RefreshCw, AlertCircle, Download
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

interface InquiryManagerProps {
  token: string | null;
  role: string;
  onSessionExpired: () => void;
}

export default function InquiryManager({ token, role, onSessionExpired }: InquiryManagerProps) {
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

  useEffect(() => {
    fetchInquiries();
  }, []);

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
        onSessionExpired();
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
        onSessionExpired();
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

      // Update active selection view
      setSelectedInquiry(prev => prev ? {
        ...prev,
        status: editStatus,
        admin_notes: editAdminNotes
      } : null);

      alert('Inquiry status updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update inquiry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredInquiries.length === 0) return;
    
    // Headers definition
    const headers = ['ID', 'Reference ID', 'Name', 'Email', 'Phone', 'Service Type', 'Destination', 'Notes', 'Admin Notes', 'Status', 'Date'];
    const rows = filteredInquiries.map(item => [
      item.id,
      `"${item.reference_id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${item.phone.replace(/"/g, '""')}"`,
      `"${item.service_type.replace(/"/g, '""')}"`,
      `"${(item.destination || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      `"${(item.admin_notes || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      item.status,
      new Date(item.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kamal_express_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculations
  const totalLeads = inquiries.length;
  const pendingLeads = inquiries.filter(i => i.status === 'Pending').length;
  const contactedLeads = inquiries.filter(i => i.status === 'Contacted').length;
  const closedLeads = inquiries.filter(i => i.status === 'Closed').length;

  // Filter lists based on states
  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesService = serviceFilter === 'All' || item.service_type === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  const uniqueServices = Array.from(new Set(inquiries.map(i => i.service_type))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header and CSV Export */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Inquiries Board</h2>
          <p className="text-slate-455 text-xs sm:text-sm font-semibold max-w-xl">
            You have <span className="text-emerald-700 font-bold">{pendingLeads} pending inquiry tickets</span> requiring immediate coordination or VFS embassy booking actions.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredInquiries.length === 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer z-10 relative ${
            filteredInquiries.length === 0
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
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Closed Deals</span>
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
              <p className="text-xs text-slate-400">Loading records from database...</p>
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
                      className={`hover:bg-slate-50/55 transition-all cursor-pointer ${
                        selectedInquiry?.id === item.id ? 'bg-emerald-500/5 hover:bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-4.5 px-6 font-bold text-slate-900 space-y-0.5 text-left">
                        <span className="block">{item.reference_id}</span>
                        <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(item.created_at).toLocaleDateString()}
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold ${
                          item.status === 'Pending'
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
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">User Inquiry Message</span>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-slate-700 font-medium leading-relaxed italic max-h-40 overflow-y-auto">
                {selectedInquiry.notes || "No additional comments provided."}
              </div>
            </div>

            {/* Action form notes */}
            <form onSubmit={handleUpdateInquiry} className="space-y-4 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Staff Notes & Internal Logs</span>
                <textarea
                  rows={3}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Record call responses, follow-up dates, or pricing calculations..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-medium"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ticket Status</span>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="w-1/2 flex items-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Ticket</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
