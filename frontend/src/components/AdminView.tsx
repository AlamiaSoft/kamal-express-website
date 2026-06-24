import React, { useState, useEffect } from 'react';
import {
  Lock, User, LogOut, X, AlertCircle, RefreshCw, Layers,
  ChevronRight, Shield, Globe, Award, Menu, FileText, PlusCircle, Users, MessageSquare
} from 'lucide-react';
import InquiryManager from './admin/InquiryManager';
import SalesManager from './admin/SalesManager';
import UserManager from './admin/UserManager';
import WebsiteManager from './admin/WebsiteManager';
import SmsManager from './admin/SmsManager';

export default function AdminView() {
  // Mobile menu open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication states
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('ke_admin_token'));
  const [username, setUsername] = useState<string>(sessionStorage.getItem('ke_admin_user') || '');
  const [role, setRole] = useState<string>(sessionStorage.getItem('ke_admin_role') || 'Viewer');
  const [fullName, setFullName] = useState<string>(sessionStorage.getItem('ke_admin_fullname') || '');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'inquiries' | 'record-sale' | 'sales-records' | 'users' | 'website-manager' | 'sms-logs'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'record-sale' | 'sales-records' | 'users' | 'website-manager' | 'sms-logs'>('inquiries');

  // Reload trigger to refresh database data in mounted sub-components
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Dynamically inject manifest and register service worker on admin dashboard mount
  useEffect(() => {
    // 1. Inject manifest.json link tag
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    manifestLink.id = 'pwa-manifest';
    document.head.appendChild(manifestLink);

    // 2. Inject apple-touch-icon link tag
    const appleIconLink = document.createElement('link');
    appleIconLink.rel = 'apple-touch-icon';
    appleIconLink.href = '/icons/icon-192x192.png';
    appleIconLink.id = 'pwa-apple-icon';
    document.head.appendChild(appleIconLink);

    // 3. Register service worker with dynamic scope (subdomain root '/' vs local testing '/admin')
    const scope = window.location.hostname.includes('aladmin') ? '/' : '/admin';
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', { scope })
        .then(reg => {
          console.log('CRM PWA Service Worker registered successfully for scope:', reg.scope);
        })
        .catch(err => {
          console.error('CRM PWA Service Worker registration failed:', err);
        });
    }

    // Cleanup on unmount
    return () => {
      const existingManifest = document.getElementById('pwa-manifest');
      if (existingManifest) existingManifest.remove();

      const existingAppleIcon = document.getElementById('pwa-apple-icon');
      if (existingAppleIcon) existingAppleIcon.remove();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginUser,
          password: loginPass
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      sessionStorage.setItem('ke_admin_token', data.token);
      sessionStorage.setItem('ke_admin_user', data.username);
      sessionStorage.setItem('ke_admin_role', data.role);
      sessionStorage.setItem('ke_admin_fullname', data.fullName);
      setToken(data.token);
      setUsername(data.username);
      setRole(data.role);
      setFullName(data.fullName);
    } catch (err: any) {
      setLoginError(err.message || 'Connection failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ke_admin_token');
    sessionStorage.removeItem('ke_admin_user');
    sessionStorage.removeItem('ke_admin_role');
    sessionStorage.removeItem('ke_admin_fullname');
    setToken(null);
    setUsername('');
    setRole('Viewer');
    setFullName('');
    setActiveTab('inquiries');
  };

  if (!token) {
    /* ==================== 1. VUEXY INSPIRED LOGIN ==================== */
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center lg:grid lg:grid-cols-12 relative overflow-hidden font-sans">
        {/* Left Side Brand Column - Vuexy Style */}
        <div className="hidden lg:flex lg:col-span-8 bg-slate-900 min-h-screen flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#076eff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-left">
            <img
              src="/logo.jpeg"
              alt="Kamal Express Logo"
              className="h-12 w-auto object-contain rounded-lg border border-slate-750 shadow-md bg-white p-1"
            />
          </div>

          <div className="space-y-6 relative z-10 max-w-xl text-left my-auto">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Manage Your Agency <br />
              <span className="text-emerald-500">Leads & Caravans</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed font-semibold">
              Welcome to the official administration CRM portal. Meticulously manage visa consultancy portfolios, air ticket flight bookings, and pilgrimage Caravan queues in real time.
            </p>
            <div className="flex gap-4 pt-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750"><Shield className="w-4 h-4 text-emerald-500" /> Secure SSL</span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750"><Globe className="w-4 h-4 text-emerald-500" /> cPanel API</span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750"><Award className="w-4 h-4 text-emerald-500" /> IATA Panel</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 relative z-10 text-left font-bold">
            © 2026 Kamal Express. Authorized Personnel Access Only.
          </div>
        </div>

        {/* Right Side Login Form Column */}
        <div className="col-span-12 lg:col-span-4 min-h-screen flex items-center justify-center p-8 bg-white relative">
          <div className="max-w-md w-full space-y-8 text-left">
            {/* Mobile Branding Header */}
            <div className="lg:hidden text-center space-y-4 mb-10">
              <img
                src="/logo.jpeg"
                alt="Kamal Express Logo"
                className="h-16 w-auto object-contain mx-auto rounded-xl shadow-md border border-slate-100 p-1 bg-white"
              />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kamal Express CRM</h2>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight hidden lg:block">Welcome to Staff Portal!</h2>
              <p className="text-slate-450 text-xs sm:text-sm font-semibold">
                Please sign-in to your admin credentials and start monitoring active agency inquiries.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              {loginError && (
                <div className="bg-red-50/70 border border-red-200/50 rounded-xl p-4 flex gap-3 text-xs text-red-650 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5 font-bold">
                  <label className="text-xs text-slate-650 block">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/50 font-semibold"
                      placeholder="admin"
                    />
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 font-bold">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-650 block">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/50 font-semibold"
                      placeholder="••••••••"
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/15 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== 2. VUEXY INSPIRED DASHBOARD ==================== */
  return (
    <div className="min-h-screen bg-[#f8f7fa] flex text-slate-800 font-sans relative">
      {/* MOBILE SIDEBAR NAVIGATION DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="relative flex w-64 max-w-xs bg-slate-900 text-white flex-col justify-between shrink-0 h-full shadow-2xl transition-all duration-300 ease-in-out">
            {/* Drawer Top Header & Logo */}
            <div className="space-y-8">
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-850 bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.jpeg"
                    alt="Kamal Express Logo"
                    className="h-9 w-auto object-contain rounded-lg border border-slate-750 shadow-sm bg-white p-0.5"
                  />
                  <span className="text-xs font-black tracking-tight text-white">Kamal Express</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links list */}
              <div className="px-4 space-y-1">
                <button
                  onClick={() => { setActiveTab('inquiries'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'inquiries'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" /> Inquiries Board
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => { setActiveTab('record-sale'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'record-sale'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4" /> Record Sale Form
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => { setActiveTab('sales-records'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'sales-records'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" /> Sales Records
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {role === 'Admin' && (
                  <button
                    onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                      activeTab === 'users'
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" /> Users & Roles
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('website-manager'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                    activeTab === 'website-manager'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4" /> Website Manager
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {role === 'Admin' && (
                  <button
                    onClick={() => { setActiveTab('sms-logs'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                      activeTab === 'sms-logs'
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4" /> SMS Gateway Logs
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Bottom User session block */}
            <div className="p-4 border-t border-slate-850 space-y-3 bg-slate-950/20">
              <div className="flex items-center gap-3 text-left">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center font-bold text-sm">
                  {username ? username.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-bold text-white block truncate max-w-[130px]">{username}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Staff Operations</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-350 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-750 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION - Vuexy Style */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col justify-between shrink-0 relative z-25 border-r border-slate-850 shadow-md">
        {/* Sidebar Top Header & Logo */}
        <div className="space-y-8">
          <div className="h-20 flex items-center justify-center px-6 border-b border-slate-850 bg-slate-950/20">
            <img
              src="/logo.jpeg"
              alt="Kamal Express Logo"
              className="h-10 w-auto object-contain rounded-lg border border-slate-750 shadow-sm bg-white p-0.5"
            />
          </div>

          {/* Navigation Links list */}
          <div className="px-4 space-y-1">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" /> Inquiries Board
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('record-sale')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'record-sale'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" /> Record Sale Form
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('sales-records')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'sales-records'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" /> Sales Records
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {role === 'Admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                  activeTab === 'users'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" /> Users & Roles
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('website-manager')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                activeTab === 'website-manager'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" /> Website Manager
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {role === 'Admin' && (
              <button
                onClick={() => setActiveTab('sms-logs')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs cursor-pointer text-left transition-all ${
                  activeTab === 'sms-logs'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-semibold'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" /> SMS Gateway Logs
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Bottom User session block */}
        <div className="p-4 border-t border-slate-850 space-y-3 bg-slate-950/20">
          <div className="flex items-center gap-3 text-left">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center font-bold text-sm">
              {username ? username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-white block truncate max-w-[130px]">{fullName || username}</span>
              <span className="text-[10px] text-slate-400 font-medium block">{role} Portal</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-350 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-750 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-screen">
        {/* Right Header Navbar */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center z-20 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            {/* Mobile Logo Brand */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-650 hover:bg-slate-50 border border-slate-150 transition-colors mr-1 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img
                src="/logo.jpeg"
                alt="Kamal Express Logo"
                className="h-9 w-auto object-contain rounded-lg border border-slate-100 p-0.5 bg-white shadow-xs"
              />
              <span className="text-sm font-extrabold text-slate-900 tracking-tight block">Kamal Express</span>
            </div>

            {/* Breadcrumb Title */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">Administration</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-450" />
              <span className="text-slate-855">
                {activeTab === 'inquiries' && 'Inquiries Board'}
                {activeTab === 'record-sale' && 'Record Sale Form'}
                {activeTab === 'sales-records' && 'Sales Records Ledger'}
                {activeTab === 'users' && 'System Users & Access Roles'}
                {activeTab === 'website-manager' && 'Website Content Manager'}
                {activeTab === 'sms-logs' && 'SMS Gateway Logs'}
              </span>
            </div>

            {/* Quick Actions navbar tools */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReloadTrigger(prev => prev + 1)}
                className="text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-slate-150 bg-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reload Database</span>
              </button>

              {/* Mobile Logout trigger */}
              <button
                onClick={handleLogout}
                className="lg:hidden text-slate-550 hover:text-red-650 p-2 rounded-xl hover:bg-red-50 border border-slate-150 bg-white transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-grow space-y-6">
          {/* Welcome Dashboard Banner - Vuexy Card style */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left relative overflow-hidden">
            <div className="space-y-1.5 z-10 relative">
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Welcome Back, {fullName || username}!</h2>
              <p className="text-slate-450 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
                {activeTab === 'inquiries' && 'Monitor and manage visitor contact requests, spiritual retreat itineraries, and general business leads.'}
                {activeTab === 'record-sale' && 'Submit details of flight bookings, visa consultancies, or hotel vouchers for database ledger bookkeeping.'}
                {activeTab === 'sales-records' && 'Verify and authorize registered sales invoices, check payments received, and export data records.'}
                {activeTab === 'users' && 'Add staff access credentials, assign system authorizations, or edit active access roles.'}
                {activeTab === 'website-manager' && 'Manage page variables, customize sliders, write travel blogs, and update visa requirements.'}
                {activeTab === 'sms-logs' && 'Inspect, filter, or delete SMS messages forwarded from your mobile SMS gateway app.'}
              </p>
            </div>
          </div>

          {/* ACTIVE TAB RENDER BLOCK */}
          {activeTab === 'inquiries' && (
            <InquiryManager 
              key={`inquiries-${reloadTrigger}`} 
              token={token} 
              role={role} 
              onSessionExpired={handleLogout} 
            />
          )}

          {(activeTab === 'record-sale' || activeTab === 'sales-records') && (
            <SalesManager 
              key={`sales-${activeTab}-${reloadTrigger}`}
              token={token} 
              role={role} 
              fullName={fullName}
              username={username}
              mode={activeTab === 'record-sale' ? 'record' : 'ledger'}
              onSessionExpired={handleLogout} 
            />
          )}

          {activeTab === 'users' && role === 'Admin' && (
            <UserManager 
              key={`users-${reloadTrigger}`} 
              token={token} 
              role={role} 
              username={username} 
              onSessionExpired={handleLogout} 
            />
          )}

          {activeTab === 'website-manager' && (
            <WebsiteManager 
              key={`website-${reloadTrigger}`} 
              token={token} 
              role={role} 
              fullName={fullName}
              username={username}
              onSessionExpired={handleLogout} 
            />
          )}

          {activeTab === 'sms-logs' && role === 'Admin' && (
            <SmsManager 
              key={`sms-${reloadTrigger}`} 
              token={token} 
              role={role} 
              onSessionExpired={handleLogout} 
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 text-slate-455 py-5 text-xs font-semibold">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between">
            <p>© 2026 Kamal Express. All rights reserved.</p>
            <p className="mt-1 sm:mt-0 text-slate-400">Authorized personnel operations.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
