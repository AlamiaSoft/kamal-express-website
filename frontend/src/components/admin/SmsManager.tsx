import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Phone, Clock, Calendar, Trash2, 
  RefreshCw, Search, X, AlertTriangle, Code, ArrowRight
} from 'lucide-react';

interface SmsItem {
  id: number;
  sender: string | null;
  message: string | null;
  sent_stamp: string | null;
  received_stamp: string | null;
  raw_payload: string | null;
  created_at: string;
  updated_at: string;
}

interface SmsManagerProps {
  token: string | null;
  role: string;
  onSessionExpired: () => void;
}

export default function SmsManager({ token, role, onSessionExpired }: SmsManagerProps) {
  const [smsLogs, setSmsLogs] = useState<SmsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected SMS for detail viewing
  const [selectedSms, setSelectedSms] = useState<SmsItem | null>(null);

  // Bulk Operations State
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  const fetchSmsLogs = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/admin/sms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        onSessionExpired();
        throw new Error('Session expired. Please log in again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch SMS logs.');
      }
      const data = await response.json();
      setSmsLogs(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSms = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this SMS log?')) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/sms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }
      if (response.status === 403) {
        throw new Error('Action denied: View-only account access.');
      }
      if (!response.ok) {
        throw new Error('Failed to delete SMS log.');
      }

      setSuccessMsg('SMS log deleted successfully.');
      if (selectedSms?.id === id) {
        setSelectedSms(null);
      }
      fetchSmsLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    }
  };

  const handleClearAllSms = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/admin/sms', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }
      if (response.status === 403) {
        throw new Error('Action denied: View-only account access.');
      }
      if (!response.ok) {
        throw new Error('Failed to clear SMS logs.');
      }

      setSuccessMsg('All forwarded SMS logs cleared.');
      setIsClearConfirmOpen(false);
      setSelectedSms(null);
      setSmsLogs([]);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter logs based on search query and date
  const filteredLogs = smsLogs.filter(log => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (log.sender && log.sender.toLowerCase().includes(query)) ||
      (log.message && log.message.toLowerCase().includes(query)) ||
      (log.id.toString() === query);

    const matchesDate = !dateFilter || 
      (log.created_at && log.created_at.startsWith(dateFilter));

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center gap-3 text-xs">
          <RefreshCw className="w-5 h-5 shrink-0 animate-spin-once" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by sender, message content or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all bg-slate-50/50"
            />
          </div>

          {/* Date Filter */}
          <div className="relative min-w-[150px]">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all bg-slate-50/50"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || dateFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setDateFilter(''); }}
              className="text-xs text-red-500 hover:text-red-650 font-bold px-3 py-2 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSmsLogs}
            disabled={isLoading}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer transition-all flex items-center justify-center disabled:opacity-50"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {role === 'Admin' && smsLogs.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Clear All Logs
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Logs Table (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Forwarded SMS Logs ({filteredLogs.length})
            </h2>
            {isLoading && <span className="text-[10px] text-slate-400 font-semibold animate-pulse">Loading logs...</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Sender</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SMS Message</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32">Forwarded</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-450">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="font-semibold text-xs">No forwarded SMS logs found.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Logs will appear here once forwarded from your Android app webhook.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedSms(log)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedSms?.id === log.id ? 'bg-emerald-500/5 font-medium border-l-2 border-l-emerald-600' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-450">#{log.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700">{log.sender || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="line-clamp-2 text-slate-650 max-w-[320px]">{log.message || 'No text content'}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-455 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{log.created_at.substring(0, 16)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSms(log)}
                            className="p-1.5 hover:bg-slate-100 text-slate-550 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Log"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          {role === 'Admin' && (
                            <button
                              onClick={() => handleDeleteSms(log.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-450 hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection Panel (Span 1) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/20">
            <h3 className="text-xs font-bold text-slate-850 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-600" /> Log Inspection Detail
            </h3>
          </div>

          {!selectedSms ? (
            <div className="px-6 py-16 text-center text-slate-455">
              <MessageSquare className="w-8 h-8 text-slate-350 mx-auto mb-3" />
              <p className="font-semibold text-xs">No log selected</p>
              <p className="text-[10px] text-slate-400 mt-1">Select an SMS row on the left to inspect its parameters, timestamps, and raw JSON payload.</p>
            </div>
          ) : (
            <div className="p-6 space-y-5 text-xs">
              {/* Actions Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">ID: #{selectedSms.id}</span>
                {role === 'Admin' && (
                  <button
                    onClick={() => handleDeleteSms(selectedSms.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Log
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-slate-450 font-bold uppercase tracking-wider text-[9px] mb-1">Sender</h4>
                <p className="font-mono text-sm text-slate-800 font-bold">{selectedSms.sender || 'N/A'}</p>
              </div>

              <div>
                <h4 className="text-slate-455 font-bold uppercase tracking-wider text-[9px] mb-1">Message Content</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-750 leading-relaxed break-words whitespace-pre-line font-mono text-[11px]">
                  {selectedSms.message || 'No text content'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-slate-455 font-bold uppercase tracking-wider text-[9px] mb-1">Sent Stamp</h4>
                  <p className="font-mono text-slate-700">{selectedSms.sent_stamp || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-slate-455 font-bold uppercase tracking-wider text-[9px] mb-1">Received Stamp</h4>
                  <p className="font-mono text-slate-700">{selectedSms.received_stamp || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-slate-455 font-bold uppercase tracking-wider text-[9px] mb-1">Forwarded Time</h4>
                <p className="text-slate-700 font-semibold">{selectedSms.created_at}</p>
              </div>

              <div>
                <h4 className="text-slate-455 font-bold uppercase tracking-wider text-[9px] mb-2">Raw Webhook JSON Payload</h4>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-350 p-4 rounded-xl text-[10px] font-mono overflow-x-auto max-h-60 leading-relaxed select-all">
                    {selectedSms.raw_payload ? selectedSms.raw_payload : '{}'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Clear Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center text-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-650 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Clear All SMS Logs?</h3>
              <p className="text-slate-450 text-[11px] leading-relaxed">
                This action will delete all forwarded SMS entries from the database permanently. This process cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleClearAllSms}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-red-600/10 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Clearing...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
