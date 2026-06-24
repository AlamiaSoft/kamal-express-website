import React, { useState, useEffect } from 'react';
import { Search, Save, X, RefreshCw, AlertCircle, PlusCircle } from 'lucide-react';

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

interface FaqManagerProps {
  token: string | null;
  role: string;
  onSessionExpired: () => void;
}

export default function FaqManager({ token, role, onSessionExpired }: FaqManagerProps) {
  const [faqsList, setFaqsList] = useState<FaqItem[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  // Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [faqModalError, setFaqModalError] = useState('');
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  // Form Fields
  const [faqCategory, setFaqCategory] = useState('Visa Services');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

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

  const handleOpenFaqModal = (faq: FaqItem | null = null) => {
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
          question: faqQuestion.trim(),
          answer: faqAnswer.trim()
        })
      });

      if (res.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }

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
      if (res.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete FAQ.');
      }
      fetchFaqs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System FAQs</h4>
        <button
          onClick={() => handleOpenFaqModal(null)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {isContentLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading FAQs...</p>
        </div>
      ) : contentErrorMsg ? (
        <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p>{contentErrorMsg}</p>
        </div>
      ) : (
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
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-655 font-semibold leading-relaxed">
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
                {role === 'Viewer' ? (
                  <div className="w-1/2 bg-slate-100 border border-slate-200 text-slate-500 font-bold py-3.5 rounded-xl text-center">
                    ReadOnly Access
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSavingFaq}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSavingFaq ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save FAQ</>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
