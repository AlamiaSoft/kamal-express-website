import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, Globe } from 'lucide-react';

interface PageItem {
  id: number;
  route_path: string;
  content: Record<string, any> | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface PageManagerProps {
  token: string | null;
  role: string;
  onSessionExpired: () => void;
}

export default function PageManager({ token, role, onSessionExpired }: PageManagerProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(null);

  // Form Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [contentFields, setContentFields] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/admin/seo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        onSessionExpired();
        throw new Error('Session expired. Please log in again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch pages.');
      }
      const data = await response.json();
      setPages(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPage = (page: PageItem) => {
    setSelectedPage(page);
    setMetaTitle(page.meta_title || '');
    setMetaDescription(page.meta_description || '');
    setMetaKeywords(page.meta_keywords || '');
    
    // Parse content JSON into individual fields
    const defaultFields: Record<string, string> = {};
    if (page.route_path === '') {
      defaultFields.hero_title = page.content?.hero_title || 'Decades of Spiritual & Leisure Travel Heritage';
      defaultFields.hero_subtitle = page.content?.hero_subtitle || 'We provide seamless flight ticketing, Shariah-guided Umrah logistics, and comprehensive visa consultancy.';
    } else if (page.route_path === 'about') {
      defaultFields.story_p1 = page.content?.story_p1 || '';
      defaultFields.story_p2 = page.content?.story_p2 || '';
      defaultFields.story_p3 = page.content?.story_p3 || '';
      defaultFields.vision = page.content?.vision || '';
      defaultFields.mission = page.content?.mission || '';
    } else if (page.route_path === 'umrah') {
      defaultFields.intro_desc = page.content?.intro_desc || '';
    } else if (page.route_path === 'contact') {
      defaultFields.address = page.content?.address || '';
      defaultFields.phone = page.content?.phone || '';
      defaultFields.email = page.content?.email || '';
      defaultFields.gmaps_iframe = page.content?.gmaps_iframe || '';
    }
    setContentFields(defaultFields);
  };

  const handleContentFieldChange = (key: string, value: string) => {
    setContentFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    if (!metaTitle.trim() || !metaDescription.trim()) {
      alert('Meta Title and Description are required.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/seo/${selectedPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meta_title: metaTitle.trim(),
          meta_description: metaDescription.trim(),
          meta_keywords: metaKeywords.trim(),
          content: Object.keys(contentFields).length > 0 ? contentFields : null
        })
      });

      if (response.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update page.');
      }

      // Update pages list
      setPages(prev => prev.map(p => p.id === selectedPage.id ? data.page : p));
      setSelectedPage(null);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  // Yoast indicator helper
  const getIndicatorColor = (length: number, min: number, max: number) => {
    if (length === 0) return 'bg-slate-200';
    if (length >= min && length <= max) return 'bg-green-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading website pages...</p>
        </div>
      ) : errorMsg ? (
        <div className="py-20 text-center space-y-4 max-w-xs mx-auto text-xs text-red-500 font-semibold">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p>{errorMsg}</p>
        </div>
      ) : selectedPage ? (
        <form onSubmit={handleUpdatePage} className="space-y-6 max-w-4xl text-xs font-semibold">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-900">
              Editing WordPress-style Page: <span className="text-emerald-600">/{selectedPage.route_path || 'home'}</span>
            </h4>
            <button
              type="button"
              onClick={() => setSelectedPage(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Back to List
            </button>
          </div>

          {/* DYNAMIC PAGE CONTENT SECTIONS (ACF fields) */}
          {Object.keys(contentFields).length > 0 && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 shadow-sm text-left">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Page Content Blocks (ACF)</h4>
              
              {/* Home Fields */}
              {selectedPage.route_path === '' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-650 block">Hero Title Header</label>
                    <input
                      type="text"
                      required
                      value={contentFields.hero_title || ''}
                      onChange={(e) => handleContentFieldChange('hero_title', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-650 block">Hero Subtitle Text</label>
                    <textarea
                      required
                      rows={3}
                      value={contentFields.hero_subtitle || ''}
                      onChange={(e) => handleContentFieldChange('hero_subtitle', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* About Fields */}
              {selectedPage.route_path === 'about' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-650 block">Our Story Paragraph 1</label>
                    <textarea
                      required
                      rows={3}
                      value={contentFields.story_p1 || ''}
                      onChange={(e) => handleContentFieldChange('story_p1', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-650 block">Our Story Paragraph 2</label>
                    <textarea
                      required
                      rows={3}
                      value={contentFields.story_p2 || ''}
                      onChange={(e) => handleContentFieldChange('story_p2', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-650 block">Our Story Paragraph 3</label>
                    <textarea
                      required
                      rows={3}
                      value={contentFields.story_p3 || ''}
                      onChange={(e) => handleContentFieldChange('story_p3', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-650 block">Our Vision Statement</label>
                      <textarea
                        required
                        rows={3}
                        value={contentFields.vision || ''}
                        onChange={(e) => handleContentFieldChange('vision', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-650 block">Our Mission Statement</label>
                      <textarea
                        required
                        rows={3}
                        value={contentFields.mission || ''}
                        onChange={(e) => handleContentFieldChange('mission', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Umrah Fields */}
              {selectedPage.route_path === 'umrah' && (
                <div className="space-y-1.5">
                  <label className="text-slate-650 block">Umrah Services Introduction</label>
                  <textarea
                    required
                    rows={4}
                    value={contentFields.intro_desc || ''}
                    onChange={(e) => handleContentFieldChange('intro_desc', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {/* Contact Fields */}
              {selectedPage.route_path === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-655 block">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={contentFields.phone || ''}
                        onChange={(e) => handleContentFieldChange('phone', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-655 block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contentFields.email || ''}
                        onChange={(e) => handleContentFieldChange('email', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-655 block">Office Address</label>
                      <input
                        type="text"
                        required
                        value={contentFields.address || ''}
                        onChange={(e) => handleContentFieldChange('address', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-655 block">Google Maps Iframe Embed URL</label>
                    <textarea
                      required
                      rows={3}
                      value={contentFields.gmaps_iframe || ''}
                      onChange={(e) => handleContentFieldChange('gmaps_iframe', e.target.value)}
                      placeholder="https://www.google.com/maps/embed?..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* YOAST SEO CARD & SNIPPET PREVIEW */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
              <Globe className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Yoast SEO Engine Preview</h4>
            </div>

            {/* Google snippet preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm text-left">
              <div className="text-[10px] text-slate-400 font-semibold truncate">
                https://kamalexpress.com.pk{selectedPage.route_path ? ` › ${selectedPage.route_path}` : ''}
              </div>
              <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer truncate">
                {metaTitle || 'Please enter a Meta Title'}
              </div>
              <div className="text-[11px] text-slate-600 leading-normal break-words font-medium">
                {metaDescription || 'Provide a compelling description here to preview it in Google results.'}
              </div>
            </div>

            <div className="space-y-4">
              {/* Meta Title Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-655 font-bold block">SEO Meta Title</label>
                  <span className="text-[10px] text-slate-400 font-semibold">{metaTitle.length} / 60 chars</span>
                </div>
                <input
                  type="text"
                  required
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                  placeholder="Focus Title"
                />
                <div className={`h-1.5 w-full rounded-full overflow-hidden bg-slate-200`}>
                  <div 
                    className={`h-full transition-all duration-300 ${getIndicatorColor(metaTitle.length, 50, 60)}`}
                    style={{ width: `${Math.min(100, (metaTitle.length / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Description Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-655 font-bold block">SEO Meta Description</label>
                  <span className="text-[10px] text-slate-400 font-semibold">{metaDescription.length} / 160 chars</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                  placeholder="Focus Description"
                />
                <div className={`h-1.5 w-full rounded-full overflow-hidden bg-slate-200`}>
                  <div 
                    className={`h-full transition-all duration-300 ${getIndicatorColor(metaDescription.length, 120, 160)}`}
                    style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Keywords Input */}
              <div className="space-y-1.5">
                <label className="text-slate-655 font-bold block">SEO Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                  placeholder="travel agency, tour guides, cheap flights"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3 text-left">
            <button
              type="button"
              onClick={() => setSelectedPage(null)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            {role === 'Viewer' ? (
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl p-3 text-center text-slate-500 font-bold">
                View-only access restricted.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Page Content & Metadata
              </button>
            )}
          </div>
        </form>
      ) : (
        // SEO Pages Table List
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
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/30">
                  <td className="py-4 px-6 font-bold text-emerald-800 text-left">
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
                      onClick={() => handleEditPage(page)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-750 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                    >
                      Edit Content & SEO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
