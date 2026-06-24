import React, { useState, useEffect } from 'react';
import { Search, Calendar, Layers, Clock, MessageSquare, CheckCircle, Save, X, RefreshCw, AlertCircle, PlusCircle, Globe } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  image: string | null;
  date: string;
  author: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

interface BlogManagerProps {
  token: string | null;
  role: string;
  fullName: string;
  username: string;
  onSessionExpired: () => void;
}

export default function BlogManager({ token, role, fullName, username, onSessionExpired }: BlogManagerProps) {
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  // Editor Modal states
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [blogModalError, setBlogModalError] = useState('');
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // Form Fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCategory, setBlogCategory] = useState('Visa Updates');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogDate, setBlogDate] = useState('');

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

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

  const handleOpenBlogModal = (blog: BlogPost | null = null) => {
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
      setMetaTitle(blog.meta_title || '');
      setMetaDescription(blog.meta_description || '');
      setMetaKeywords(blog.meta_keywords || '');
    } else {
      setBlogTitle('');
      setBlogSlug('');
      setBlogCategory('Visa Updates');
      setBlogSummary('');
      setBlogContent('');
      setBlogImage('');
      setBlogAuthor(fullName || username);
      setBlogDate(new Date().toISOString().split('T')[0]);
      setMetaTitle('');
      setMetaDescription('');
      setMetaKeywords('');
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
          title: blogTitle.trim(),
          slug: blogSlug.trim(),
          category: blogCategory,
          summary: blogSummary.trim(),
          content: blogContent.trim(),
          image: blogImage.trim() || null,
          author: blogAuthor.trim(),
          date: blogDate,
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
      if (res.status === 401) {
        onSessionExpired();
        throw new Error('Session expired.');
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete blog.');
      }
      fetchBlogs();
    } catch (err: any) {
      alert(err.message);
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
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Blog Articles</h4>
        <button
          onClick={() => handleOpenBlogModal(null)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Blog Post
        </button>
      </div>

      {isContentLoading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading dynamic blogs...</p>
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
                        className="text-xs font-bold text-red-655 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-all cursor-pointer"
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

            <form onSubmit={handleSaveBlog} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {blogModalError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-xs text-red-655 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{blogModalError}</span>
                </div>
              )}

              {/* SECTION 1: ARTICLE CONTENT */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">Article Details</h4>
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
                    rows={7}
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Type the full article content here. You can use standard HTML paragraph tags like <p>...</p>."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
              </div>

              {/* SECTION 2: YOAST SEO PREVIEW & OPTIMIZATION CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Yoast SEO Optimization</h4>
                </div>

                {/* Google Search Snippet Preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm text-left">
                  <div className="text-[10px] text-slate-400 font-semibold truncate">
                    https://kamalexpress.com.pk › blog › {blogSlug || 'post-slug'}
                  </div>
                  <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer truncate">
                    {metaTitle || blogTitle || 'Please enter a Meta Title'}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-normal break-words font-medium">
                    {metaDescription || blogSummary || 'Provide a compelling description here to preview it in Google results.'}
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
                      placeholder={blogTitle || "Enter optimized title"}
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
                      placeholder={blogSummary || "Enter optimized summary description"}
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
                      placeholder="travel alerts, visa instructions, guide, Islamabad"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsBlogModalOpen(false); setSelectedBlog(null); }}
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
                    disabled={isSavingBlog}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSavingBlog ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Article & SEO</>
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
