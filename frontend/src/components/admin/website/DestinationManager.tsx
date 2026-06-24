import React, { useState, useEffect } from 'react';
import { Search, Calendar, Save, X, RefreshCw, AlertCircle, PlusCircle, Globe } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  visa_type: string;
  processing_time: string;
  stay_duration: string;
  validity: string;
  price: string;
  required_documents: string[];
  faqs: any[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

interface DestinationManagerProps {
  token: string | null;
  role: string;
  onSessionExpired: () => void;
}

export default function DestinationManager({ token, role, onSessionExpired }: DestinationManagerProps) {
  const [destinationsList, setDestinationsList] = useState<Destination[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  // Modal states
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [destModalError, setDestModalError] = useState('');
  const [isSavingDest, setIsSavingDest] = useState(false);

  // Form Fields
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

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

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

  const handleOpenDestModal = (dest: Destination | null = null) => {
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
      setMetaTitle(dest.meta_title || '');
      setMetaDescription(dest.meta_description || '');
      setMetaKeywords(dest.meta_keywords || '');
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
      setMetaTitle('');
      setMetaDescription('');
      setMetaKeywords('');
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
          id: destId.trim(),
          name: destName.trim(),
          slug: destSlug.trim(),
          image: destImage.trim() || null,
          visa_type: destVisaType.trim(),
          processing_time: destProcessingTime.trim(),
          stay_duration: destStayDuration.trim(),
          validity: destValidity.trim(),
          price: destPrice.trim(),
          required_documents,
          faqs,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          meta_keywords: metaKeywords.trim() || null
        })
      });

      if (res.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }

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
      if (res.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete destination.');
      }
      fetchDestinations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getIndicatorColor = (length: number, min: number, max: number) => {
    if (length === 0) return 'bg-slate-200';
    if (length >= min && length <= max) return 'bg-green-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Visa Guides</h4>
        <button
          onClick={() => handleOpenDestModal(null)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Visa Guide
        </button>
      </div>

      {isContentLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading visa guides...</p>
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

            <form onSubmit={handleSaveDest} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {destModalError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-655 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{destModalError}</span>
                </div>
              )}

              {/* SECTION 1: CONTENT DETAILS */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">Visa Details</h4>
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
                    rows={4}
                    value={destFaqsText}
                    onChange={(e) => setDestFaqsText(e.target.value)}
                    placeholder={'[\n  {\n    "question": "FAQ Question?",\n    "answer": "FAQ Answer."\n  }\n]'}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
              </div>

              {/* SECTION 2: YOAST SEO PREVIEW CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Yoast SEO Optimization</h4>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm text-left">
                  <div className="text-[10px] text-slate-400 font-semibold truncate">
                    https://kamalexpress.com.pk › destinations › {destSlug || 'visa-slug'}
                  </div>
                  <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer truncate">
                    {metaTitle || destName || 'Please enter a Meta Title'}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-normal break-words font-medium">
                    {metaDescription || `Apply for ${destVisaType} for ${destName} starting from ${destPrice}.`}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <label className="text-slate-655 uppercase block">SEO Meta Title</label>
                      <span>{metaTitle.length} / 60 chars</span>
                    </div>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={destName || "Enter optimized title"}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                    />
                    <div className="h-1.5 w-full rounded-full overflow-hidden bg-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${getIndicatorColor(metaTitle.length, 50, 60)}`}
                        style={{ width: `${Math.min(100, (metaTitle.length / 60) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <label className="text-slate-655 uppercase block">SEO Meta Description</label>
                      <span>{metaDescription.length} / 160 chars</span>
                    </div>
                    <textarea
                      rows={2.5}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={`Apply for ${destVisaType} for ${destName} starting from ${destPrice}.`}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                    />
                    <div className="h-1.5 w-full rounded-full overflow-hidden bg-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${getIndicatorColor(metaDescription.length, 120, 160)}`}
                        style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">SEO Focus Keywords</label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="visa guide, document checklist, embassy requirements"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsDestModalOpen(false); setSelectedDest(null); }}
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
                    disabled={isSavingDest}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSavingDest ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Guide & SEO</>
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
