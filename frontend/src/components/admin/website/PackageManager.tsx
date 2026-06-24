import React, { useState, useEffect } from 'react';
import { Search, Calendar, Save, X, RefreshCw, AlertCircle, PlusCircle, Globe } from 'lucide-react';

interface TourPackage {
  id: string;
  title: string;
  location: string;
  duration: string;
  price: string;
  category: 'International' | 'Domestic' | 'Customized';
  image: string | null;
  description: string;
  highlights: string[];
  itinerary: any[];
  included: string[];
  excluded: string[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

interface PackageManagerProps {
  token: string | null;
  role: string;
  onSessionExpired: () => void;
}

export default function PackageManager({ token, role, onSessionExpired }: PackageManagerProps) {
  const [packagesList, setPackagesList] = useState<TourPackage[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  // Modal states
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<TourPackage | null>(null);
  const [pkgModalError, setPkgModalError] = useState('');
  const [isSavingPkg, setIsSavingPkg] = useState(false);

  // Form Fields
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

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

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

  const handleOpenPkgModal = (pkg: TourPackage | null = null) => {
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
      setMetaTitle(pkg.meta_title || '');
      setMetaDescription(pkg.meta_description || '');
      setMetaKeywords(pkg.meta_keywords || '');
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
      setMetaTitle('');
      setMetaDescription('');
      setMetaKeywords('');
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
          id: pkgId.trim(),
          title: pkgTitle.trim(),
          location: pkgLocation.trim(),
          duration: pkgDuration.trim(),
          price: pkgPrice.trim(),
          category: pkgCategory,
          image: pkgImage.trim() || null,
          description: pkgDescription.trim(),
          highlights,
          itinerary,
          included,
          excluded,
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
      if (res.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete package.');
      }
      fetchPackages();
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
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Travel Packages</h4>
        <button
          onClick={() => handleOpenPkgModal(null)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Package
        </button>
      </div>

      {isContentLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading travel packages...</p>
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

            <form onSubmit={handleSavePkg} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {pkgModalError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-655 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{pkgModalError}</span>
                </div>
              )}

              {/* SECTION 1: MAIN DETAILS */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">Package Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Package ID (Unique Key)</label>
                    <input
                      type="text"
                      required
                      disabled={!!selectedPkg}
                      value={pkgId}
                      onChange={(e) => setPkgId(e.target.value)}
                      placeholder="e.g. pkg-hunza-summer"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white disabled:bg-slate-100 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Title</label>
                    <input
                      type="text"
                      required
                      value={pkgTitle}
                      onChange={(e) => setPkgTitle(e.target.value)}
                      placeholder="e.g. Hunza Blossom Holiday Caravan"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Destination Location</label>
                    <input
                      type="text"
                      required
                      value={pkgLocation}
                      onChange={(e) => setPkgLocation(e.target.value)}
                      placeholder="e.g. Hunza Valley, Pakistan"
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
                      placeholder="e.g. 5 Days & 4 Nights"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider block">Starting Price</label>
                    <input
                      type="text"
                      required
                      value={pkgPrice}
                      onChange={(e) => setPkgPrice(e.target.value)}
                      placeholder="e.g. PKR 95,000"
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
                    rows={5}
                    value={pkgItineraryText}
                    onChange={(e) => setPkgItineraryText(e.target.value)}
                    placeholder={'[\n  {\n    "day": 1,\n    "title": "Arrival",\n    "description": "Pickup and transit..."\n  }\n]'}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
              </div>

              {/* SECTION 2: YOAST SEO CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Yoast SEO Optimization</h4>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm text-left">
                  <div className="text-[10px] text-slate-400 font-semibold truncate">
                    https://kamalexpress.com.pk › tours › {pkgCategory.toLowerCase()} › {pkgId || 'package-id'}
                  </div>
                  <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer truncate">
                    {metaTitle || pkgTitle || 'Please enter a Meta Title'}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-normal break-words font-medium">
                    {metaDescription || pkgDescription || 'Provide a compelling description here to preview it in Google results.'}
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
                      placeholder={pkgTitle || "Enter optimized title"}
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
                      placeholder={pkgDescription || "Enter optimized summary description"}
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
                      placeholder="luxury tours, domestic retreats, family holiday caravan"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsPkgModalOpen(false); setSelectedPkg(null); }}
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
                    disabled={isSavingPkg}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSavingPkg ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Package & SEO</>
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
