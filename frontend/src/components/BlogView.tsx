import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Calendar, User, ArrowRight, Search, 
  Tag, Clock, ArrowLeft, Heart, Share2, AlertCircle 
} from 'lucide-react';
import { BLOG_POSTS } from '../data';
import { BlogPost } from '../types';

interface BlogViewProps {
  initialSlug?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenInquiry: (service?: string) => void;
}

export default function BlogView({ initialSlug, onNavigate, onOpenInquiry }: BlogViewProps) {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load specific post if slug param matches (e.g. from homepage links)
  useEffect(() => {
    const targetSlug = slug || initialSlug;
    if (targetSlug) {
      const match = BLOG_POSTS.find(p => p.slug === targetSlug);
      if (match) {
        setActivePost(match);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    } else {
      setActivePost(null);
    }
  }, [slug, initialSlug]);

  const categories = ['All', 'Visa Updates', 'Travel Tips', 'Country Guides', 'Umrah Guides'];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBackToList = () => {
    navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectPost = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 animate-in fade-in duration-300">
      
      {activePost ? (
        /* ==================== 1. DETAILED SINGLE BLOG POST VIEW ==================== */
        <article className="max-w-4xl mx-auto text-left space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Back Trigger */}
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog & Guides
          </button>

          {/* Category Badging & Title */}
          <div className="space-y-4">
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">
              {activePost.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-950 leading-tight">
              {activePost.title}
            </h1>

            {/* Author Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-y border-gray-100 py-3.5">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" /> By {activePost.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" /> {activePost.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> 5 Min Read
              </span>
            </div>
          </div>

          {/* Post cover image */}
          <div className="h-64 sm:h-96 rounded-2xl overflow-hidden bg-slate-50 border border-gray-100 shadow-xs">
            <img 
              src={activePost.image} 
              alt={activePost.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Render article contents with simple markdown style dividers */}
          <div className="text-gray-700 leading-relaxed text-sm sm:text-base font-normal space-y-6">
            {activePost.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('###')) {
                return (
                  <h3 key={index} className="text-lg sm:text-xl font-bold text-gray-950 pt-4 border-b border-gray-100 pb-1 font-sans">
                    {paragraph.replace('###', '').trim()}
                  </h3>
                );
              }
              if (paragraph.startsWith('1.') || paragraph.startsWith('-')) {
                return (
                  <div key={index} className="pl-4 border-l-2 border-emerald-600 space-y-1 my-2 bg-slate-50/50 p-2 py-1 rounded">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="text-xs sm:text-sm text-gray-650 leading-normal font-semibold">
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                );
              }
              return (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Footer Direct CTA inside article */}
          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-950">Questions on these legal updates?</h4>
              <p className="text-xs text-gray-500 leading-normal">
                Let our certified pre-screening managers review your bank accounts and application portfolios.
              </p>
            </div>
            <button
              onClick={() => onOpenInquiry('Visa Consultancy')}
              className="bg-gold hover:bg-gold-hover text-slate-950 font-bold text-xs px-5 py-3 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Consult My File Offline
            </button>
          </div>

        </article>
      ) : (
        /* ==================== 2. GRID LIST OF ALL POSTS ==================== */
        <div className="space-y-10 animate-in fade-in duration-300">
          
          {/* Header row */}
          <div className="text-left space-y-4 border-b border-gray-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Visa News, Handbooks & Travel Guides
              </h1>
              <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
                Stay updated with Schengen standard visa updates, step-by-step physical Umrah checklists, smart luggage roll packing procedures and aviation guidelines.
              </p>
            </div>

            {/* Direct SEARCH input bar inside list */}
            <div className="relative w-full md:w-80 shrink-0">
              <input
                type="text"
                placeholder="Search articles & guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-600 transition-colors bg-slate-50/50"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Category horizontal scroll navigation buttons bar */}
          <div className="flex flex-wrap items-center gap-2 text-left bg-slate-50 border border-gray-150 p-2 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-750 text-white shadow-xs'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid render matching elements */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-150 hover:border-emerald-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 bg-slate-50 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover hover:scale-103 transition-transform duration-250"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 text-gray-800 rounded px-2 py-1 text-[9px] font-bold tracking-wide uppercase shadow-2xs">
                        {post.category}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>By {post.author.split(' ')[0]}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-950 leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 font-normal">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>Read Full Handbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">No Articles Found</h3>
                <p className="text-xs text-gray-500 leading-normal font-normal">
                  No blog posts match your search parameters. Please try select other categories or clear search filters.
                </p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-xs font-bold bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
              >
                Reset Filter Settings
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
