import React, { useState } from 'react';
import PageManager from './website/PageManager';
import BlogManager from './website/BlogManager';
import PackageManager from './website/PackageManager';
import DestinationManager from './website/DestinationManager';
import FaqManager from './website/FaqManager';

interface WebsiteManagerProps {
  token: string | null;
  role: string;
  fullName: string;
  username: string;
  onSessionExpired: () => void;
}

type SubTab = 'pages' | 'blogs' | 'packages' | 'destinations' | 'faqs';

export default function WebsiteManager({ token, role, fullName, username, onSessionExpired }: WebsiteManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('pages');

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left animate-in fade-in duration-200">
      {/* Sub-tab Navigation */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('pages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pages'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pages SEO & Content
          </button>
          <button
            onClick={() => setActiveSubTab('blogs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'blogs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Blogs
          </button>
          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'packages'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Travel Packages
          </button>
          <button
            onClick={() => setActiveSubTab('destinations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'destinations'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Visa Guides
          </button>
          <button
            onClick={() => setActiveSubTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'faqs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            FAQs
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeSubTab === 'pages' && (
          <PageManager token={token} role={role} onSessionExpired={onSessionExpired} />
        )}
        {activeSubTab === 'blogs' && (
          <BlogManager token={token} role={role} fullName={fullName} username={username} onSessionExpired={onSessionExpired} />
        )}
        {activeSubTab === 'packages' && (
          <PackageManager token={token} role={role} onSessionExpired={onSessionExpired} />
        )}
        {activeSubTab === 'destinations' && (
          <DestinationManager token={token} role={role} onSessionExpired={onSessionExpired} />
        )}
        {activeSubTab === 'faqs' && (
          <FaqManager token={token} role={role} onSessionExpired={onSessionExpired} />
        )}
      </div>
    </div>
  );
}
