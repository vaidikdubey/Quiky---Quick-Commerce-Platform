import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Search,
  Copy,
  Check,
  Play,
  Layers,
  Lock,
  Bike,
  Store,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Terminal,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import {FaGithub} from "react-icons/fa"

import toast from "react-hot-toast";
import { ALL_ENDPOINTS, API_MODULES, ENDPOINT_STATS } from "../data/endpoints";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("curl");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseUrl = "https://quiky-backend.onrender.com";
  const githubRepoUrl = "https://github.com/vaidikdubey/Quiky---Quick-Commerce-Platform/tree/main/backend";

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    toast.success("Base URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEndpoints = ALL_ENDPOINTS.filter((ep) => {
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = selectedModule === "all" || ep.module === selectedModule;

    return matchesSearch && matchesModule;
  });

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case "GET":
        return "bg-sky-100 text-sky-700 border-sky-300";
      case "POST":
        return "bg-pink-100 text-pink-700 border-pink-300";
      case "PUT":
      case "PATCH":
        return "bg-teal-100 text-teal-700 border-teal-300";
      case "DELETE":
        return "bg-rose-100 text-rose-700 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50/60 via-sky-50/40 to-teal-50/30 text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden">
      
      {/* Background Soft Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-pink-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-sky-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-teal-200/40 rounded-full blur-3xl" />
      </div>

      {/* Responsive Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-pink-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-linear-to-tr from-pink-400 via-sky-300 to-teal-300 p-0.5 shadow-md shadow-pink-200">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 fill-pink-500" />
              </div>
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2">
              Quiky
              <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 border border-pink-200">
                DEV HUB
              </span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#endpoints" className="hover:text-pink-600 transition-colors">Endpoints</a>
            <a href="#modules" className="hover:text-sky-600 transition-colors">Modules</a>
            <a href="#roles" className="hover:text-teal-600 transition-colors">Roles & Security</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/playground"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-linear-to-r from-teal-400 to-sky-400 text-white hover:from-teal-500 hover:to-sky-500 transition-all shadow-md shadow-teal-200/60 flex items-center gap-1.5 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden xs:inline">Test API Live</span>
              <span className="xs:hidden">Studio</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-3 shadow-lg">
            <a
              href="#endpoints"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-pink-600 py-1"
            >
              Endpoints
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-sky-600 py-1"
            >
              Modules
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-teal-600 py-1"
            >
              Roles & Security
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-pink-200 shadow-xs text-xs font-bold text-pink-600 max-w-full truncate">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="truncate">Backend Test Environment • Quick Commerce Engine</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Explore & Query the <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 via-sky-400 to-teal-400">
                  Quiky API Services
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                An interactive developer interface for Quiky’s quick commerce platform. Seamlessly test customer registration, rider geolocation, store operations, and order lifecycle endpoints.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/playground"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-pink-500 text-white font-bold text-sm hover:bg-pink-600 transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Terminal className="w-4 h-4" />
                  Launch Interactive Studio
                </Link>

                <button
                  onClick={handleCopyBaseUrl}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:border-sky-300 hover:bg-sky-50/50 transition-all flex items-center justify-center gap-2.5 shadow-xs active:scale-95 group"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-sky-400 group-hover:text-pink-500 shrink-0" />
                  )}
                  <span className="font-mono text-xs truncate max-w-50 sm:max-w-none">{baseUrl}</span>
                </button>
              </div>

              {/* Real Metrics (No Fake Response Latencies) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80">
                <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-pink-100 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-pink-500">{ENDPOINT_STATS.totalEndpoints}+</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Endpoints</div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-sky-500">{ENDPOINT_STATS.modulesCount}</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Modules</div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-teal-100 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-teal-500">{ENDPOINT_STATS.rolesCount}</div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Role Policies</div>
                </div>
              </div>
            </div>

            {/* Right Light-Mode Code Playground Preview */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-3xl border border-sky-100 bg-white/90 shadow-2xl shadow-sky-100/60 backdrop-blur-xl overflow-hidden max-w-full">
                
                {/* Header Bar */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-300 shrink-0" />
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-300 shrink-0" />
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-300 shrink-0" />
                    <span className="ml-1 text-[11px] sm:text-xs font-mono font-bold text-slate-500 truncate">POST /orders/create</span>
                  </div>

                  <div className="flex bg-slate-200/60 p-0.5 sm:p-1 rounded-xl font-mono text-[10px] sm:text-[11px] font-bold shrink-0">
                    <button
                      onClick={() => setActiveTab("curl")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        activeTab === "curl"
                          ? "bg-white text-pink-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveTab("json")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        activeTab === "json"
                          ? "bg-white text-teal-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Response
                    </button>
                  </div>
                </div>

                {/* Code Body */}
                <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto min-h-62.5 sm:min-h-70 bg-slate-50/30">
                  {activeTab === "curl" ? (
                    <div className="space-y-1.5 text-slate-700 whitespace-pre">
                      <div><span className="text-pink-600 font-bold">curl</span> -X POST https://quiky-backend.onrender.com/api/v1/orders/create \</div>
                      <div className="pl-4 text-slate-500">-H <span className="text-teal-600">"Authorization: Bearer &lt;TOKEN&gt;"</span> \</div>
                      <div className="pl-4 text-slate-500">-H <span className="text-teal-600">"Content-Type: application/json"</span> \</div>
                      <div className="pl-4 text-slate-500">-d <span className="text-sky-600">&#123;</span></div>
                      <div className="pl-8 text-sky-700">"storeId": <span className="text-pink-600">"store_9921"</span>,</div>
                      <div className="pl-8 text-sky-700">"items": [<span className="text-slate-600">&#123; "id": "prod_01", "qty": 2 &#125;</span>],</div>
                      <div className="pl-8 text-sky-700">"addressId": <span className="text-pink-600">"addr_4410"</span></div>
                      <div className="pl-4 text-sky-600">&#125;</div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-slate-700 whitespace-pre">
                      <div className="text-teal-600 font-bold">// Status: 201 Created</div>
                      <div className="text-sky-600">&#123;</div>
                      <div className="pl-4"><span className="text-pink-600 font-semibold">"success"</span>: <span className="text-teal-600">true</span>,</div>
                      <div className="pl-4"><span className="text-pink-600 font-semibold">"message"</span>: <span className="text-slate-600">"Order dispatched to rider pool"</span>,</div>
                      <div className="pl-4"><span className="text-pink-600 font-semibold">"data"</span>: &#123;</div>
                      <div className="pl-8"><span className="text-pink-600">"orderId"</span>: <span className="text-teal-600">"ord_882941"</span>,</div>
                      <div className="pl-8"><span className="text-pink-600">"status"</span>: <span className="text-sky-600">"SEARCHING_RIDER"</span></div>
                      <div className="pl-4">&#125;</div>
                      <div className="text-sky-600">&#125;</div>
                    </div>
                  )}
                </div>

                <div className="px-4 sm:px-5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    Live Environment
                  </span>
                  <span className="text-pink-500 font-semibold">Sandbox Connected</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modules Explorer Section */}
      <section id="modules" className="py-12 sm:py-16 bg-white/60 border-y border-pink-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">API Modules</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Filter route catalog by application domain.</p>
            </div>
            <div className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl self-start">
              10 Core Service Domains
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {API_MODULES.map((mod) => (
              <button
                key={mod.id}
                onClick={() => {
                  setSelectedModule(mod.id);
                  document.getElementById("endpoints")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all border group ${
                  selectedModule === mod.id
                    ? "bg-gradient-to-br from-pink-100 via-sky-50 to-teal-50 border-pink-300 shadow-md shadow-pink-100"
                    : "bg-white border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {mod.count}
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-pink-600 transition-colors truncate">{mod.name}</h3>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                  View routes <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </p>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Endpoint Search & Responsive Catalog */}
      <section id="endpoints" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Endpoint Catalog</h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Search or execute available backend REST routes.</p>
          </div>

          {/* Search Bar & Horizontal Module Filters */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 items-center justify-between">
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search endpoints (/register, rider)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedModule("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedModule === "all"
                    ? "bg-pink-500 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              {API_MODULES.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModule(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedModule === m.id
                      ? "bg-pink-500 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint List */}
          <div className="rounded-3xl border border-sky-100 bg-white/90 shadow-xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-sky-50/30 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border tracking-wide shrink-0 ${getMethodBadgeClass(
                            ep.method
                          )}`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-xs sm:text-sm font-mono font-bold text-slate-800 break-all sm:break-normal group-hover:text-pink-600 transition-colors">
                          {ep.path}
                        </code>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                          {ep.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{ep.description}</p>
                    </div>

                    <Link
                      to={`/playground?endpoint=${encodeURIComponent(ep.path)}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-pink-500 hover:text-white transition-all text-xs font-bold font-mono flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0 w-full sm:w-auto"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Test Route
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 text-sm font-medium">
                  No matching endpoints found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Role Access Section */}
      <section id="roles" className="py-12 sm:py-16 bg-white/60 border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Access Roles</h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
              Role-Based Access Control (RBAC) powering customer, partner, rider, and admin security layers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <RoleCard
              bgColor="bg-pink-50"
              borderColor="border-pink-200"
              icon={<Lock className="w-5 h-5 text-pink-500" />}
              title="Customer"
              desc="Address book management, product catalog search, order creation, notifications, and profile controls."
            />
            <RoleCard
              bgColor="bg-sky-50"
              borderColor="border-sky-200"
              icon={<Bike className="w-5 h-5 text-sky-500" />}
              title="Delivery Rider"
              desc="Rider onboarding, real-time live location pinging, delivery assignments, ratings, and payout earnings."
            />
            <RoleCard
              bgColor="bg-teal-50"
              borderColor="border-teal-200"
              icon={<Store className="w-5 h-5 text-teal-600" />}
              title="Partner Store"
              desc="Product catalog creation, store profile modifications, inventory availability toggles, store order feeds."
            />
            <RoleCard
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
              icon={<ShieldAlert className="w-5 h-5 text-purple-500" />}
              title="Platform Admin"
              desc="High-level dashboard statistics, account approvals, status overrides, broadcast notifications, and analytics."
            />
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 sm:py-8 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          {/* Copyright Left */}
          <p className="text-xs font-semibold text-slate-600">
            © {new Date().getFullYear()} Quiky. All rights reserved.
          </p>

          {/* GitHub Link Right */}
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-pink-600 transition-colors bg-slate-100 hover:bg-pink-50 px-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-pink-200"
          >
            <FaGithub className="w-4 h-4" />
            <span>Backend GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

        </div>
      </footer>

    </div>
  );
}

function RoleCard({ bgColor, borderColor, icon, title, desc }) {
  return (
    <div className={`p-5 sm:p-6 rounded-3xl ${bgColor} border ${borderColor} shadow-xs hover:shadow-md transition-all`}>
      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-3.5 shadow-xs">
        {icon}
      </div>
      <h3 className="font-extrabold text-slate-900 text-base mb-1">{title}</h3>
      <p className="text-xs font-medium text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}