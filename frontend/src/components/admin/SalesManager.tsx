import React, { useState, useEffect } from 'react';
import {
  Search, Calendar, DollarSign, X, Save, RefreshCw, AlertCircle, CheckCircle, Download, FileText
} from 'lucide-react';

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

interface SalesManagerProps {
  token: string | null;
  role: string;
  fullName: string;
  username: string;
  mode: 'record' | 'ledger';
  onSessionExpired: () => void;
}

export default function SalesManager({ token, role, fullName, username, mode, onSessionExpired }: SalesManagerProps) {
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
  const [saleCollectorsName, setSaleCollectorsName] = useState(fullName || username);
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [saleSuccessMsg, setSaleSuccessMsg] = useState('');
  const [saleErrorMsg, setSaleErrorMsg] = useState('');

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

  useEffect(() => {
    if (token && mode === 'ledger') {
      fetchSales();
    }
  }, [token, mode]);

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
        onSessionExpired();
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
        onSessionExpired();
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
        onSessionExpired();
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

  if (mode === 'record') {
    return (
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
            <div className="bg-red-50/70 border border-red-200/50 rounded-2xl p-4 flex gap-3 text-xs text-red-655 font-semibold leading-relaxed animate-in fade-in">
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
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 bg-white"
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
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 font-semibold text-slate-700 bg-white"
              />
            </div>

            {/* Serial Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Serial Number</label>
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
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 bg-white"
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
              <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Vendor Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Qatar Airways"
                value={saleVendorName}
                onChange={(e) => setSaleVendorName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Country <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Saudi Arabia"
                value={saleCountry}
                onChange={(e) => setSaleCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Sector <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. ISB-JED-ISB"
                value={saleSector}
                onChange={(e) => setSaleSector(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/30 bg-white"
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
                className="w-full bg-emerald-600 hover:bg-emerald-755 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-extrabold"
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
    );
  }

  // Else render mode === 'ledger'
  return (
    <div className="space-y-6">
      {/* Sales Metrics Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded</p>
          <p className="text-lg font-black text-slate-900 mt-1">{totalSalesCount}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
          <p className="text-lg font-black text-slate-900 mt-1">{pendingSalesCount}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left border-l-4 border-l-green-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Sales</p>
          <p className="text-lg font-black text-slate-900 mt-1">{approvedSalesCount}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected Entries</p>
          <p className="text-lg font-black text-slate-900 mt-1">{rejectedSalesCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sales Table Card */}
        <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left ${selectedSale ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-extrabold text-slate-900 block tracking-tight">Sales Transactions Ledger</h3>
              <button
                onClick={handleExportSalesCSV}
                disabled={filteredSales.length === 0}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${filteredSales.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'bg-emerald-550 border-emerald-600 text-white hover:bg-emerald-600 shadow-sm'
                  }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

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
                            ? 'bg-amber-55 text-amber-800 border border-amber-100'
                            : item.status === 'Approved'
                              ? 'bg-green-55 text-green-800 border border-green-100'
                              : 'bg-red-55 text-red-800 border border-red-100'
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
                <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-slate-855">
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateSaleStatus(selectedSale.id, 'Rejected')}
                      className="bg-red-50 hover:bg-red-100 text-red-655 font-bold py-2.5 rounded-xl border border-red-250/50 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
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
    </div>
  );
}
