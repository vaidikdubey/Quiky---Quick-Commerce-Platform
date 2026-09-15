import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    Play,
    Copy,
    Check,
    Zap,
    Terminal,
    Search,
    KeyRound,
    Clock,
    Layers,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { ALL_ENDPOINTS, API_MODULES, API_BASE_URL } from "../data/endpoints";

export default function PlaygroundPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const endpointParam = searchParams.get("endpoint");

    // Selected Endpoint state
    const [selectedEndpoint, setSelectedEndpoint] = useState(() => {
        return (
            ALL_ENDPOINTS.find((e) => e.path === endpointParam) ||
            ALL_ENDPOINTS[0]
        );
    });

    // Request Form States
    const [method, setMethod] = useState(selectedEndpoint.method);
    const [path, setPath] = useState(selectedEndpoint.path);
    const [authToken, setAuthToken] = useState(
        () => localStorage.getItem("quiky_auth_token") || "",
    );
    const [requestBody, setRequestBody] = useState(
        selectedEndpoint.sampleBody || "{\n  \n}",
    );
    const [activeReqTab, setActiveReqTab] = useState("body"); // 'body' | 'headers' | 'code'

    // Response States
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedRes, setCopiedRes] = useState(false);

    // Endpoint Filter sidebar state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModule, setSelectedModule] = useState("all");

    // Save auth token in local storage for quick testing
    const handleTokenChange = (val) => {
        setAuthToken(val);
        localStorage.setItem("quiky_auth_token", val);
    };

    // Sync selected endpoint when url query params or selection changes
    const handleSelectEndpoint = (ep) => {
        setSelectedEndpoint(ep);
        setMethod(ep.method);
        setPath(ep.path);
        setRequestBody(ep.sampleBody || "{\n  \n}");
        setSearchParams({ endpoint: ep.path });
        setResponse(null);
    };

    // Execute Request handler
    const handleExecute = async (e) => {
        e?.preventDefault();
        setIsLoading(true);
        setResponse(null);

        const fullUrl = `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
        const startTime = performance.now();

        const headers = {
            "Content-Type": "application/json",
        };
        if (authToken.trim()) {
            headers["Authorization"] = `Bearer ${authToken.trim()}`;
        }

        try {
            let parsedBody = undefined;
            if (
                ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
                requestBody.trim()
            ) {
                try {
                    parsedBody = JSON.parse(requestBody);
                } catch (err) {
                    const errorMessage =
                        err instanceof Error
                            ? err.message
                            : "Invalid JSON format in request body";
                    console.error("Error: ", errorMessage);
                    toast.error("Invalid JSON format in request body!");
                    setIsLoading(false);
                    return;
                }
            }

            const res = await axios({
                method: method.toLowerCase(),
                url: fullUrl,
                headers,
                data: parsedBody,
                validateStatus: () => true, // Handle non-2xx statuses gracefully
            });

            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);

            setResponse({
                status: res.status,
                statusText: res.statusText,
                data: res.data,
                headers: res.headers,
                latency,
            });

            if (res.status >= 200 && res.status < 300) {
                toast.success(`Request Success [${res.status}]`);
            } else {
                toast.error(`Request Failed [${res.status}]`);
            }
        } catch (error) {
            const endTime = performance.now();
            setResponse({
                status: error.response?.status || 500,
                statusText: "Network Error / CORS Error",
                data: error.response?.data || {
                    message: error.message || "Failed to reach server",
                },
                headers: error.response?.headers || {},
                latency: Math.round(endTime - startTime),
            });
            toast.error("Request error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Generate cURL Code snippet
    const generateCurl = () => {
        const fullUrl = `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
        let curl = `curl -X ${method} "${fullUrl}" \\\n  -H "Content-Type: application/json"`;
        if (authToken) {
            curl += ` \\\n  -H "Authorization: Bearer ${authToken}"`;
        }
        if (["POST", "PUT", "PATCH"].includes(method) && requestBody.trim()) {
            curl += ` \\\n  -d '${requestBody.replace(/\n/g, "")}'`;
        }
        return curl;
    };

    // Badge styles for HTTP methods
    const getMethodBadgeClass = (m) => {
        switch (m) {
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

    const filteredEndpoints = ALL_ENDPOINTS.filter((ep) => {
        const matchesSearch =
            ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ep.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesModule =
            selectedModule === "all" || ep.module === selectedModule;
        return matchesSearch && matchesModule;
    });

    return (
        <div className="min-h-screen bg-linear-to-b from-pink-50/50 via-sky-50/30 to-teal-50/20 text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900 flex flex-col">
            {/* Top Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-pink-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                Back to Home
                            </span>
                        </Link>
                        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-xs">
                                <Zap className="w-4 h-4 fill-white" />
                            </div>
                            <span className="font-extrabold text-slate-900 text-base tracking-tight">
                                Quiky Playground
                            </span>
                        </div>
                    </div>

                    {/* Bearer Token Quick Input Header */}
                    <div className="flex items-center gap-2 max-w-xs sm:max-w-sm w-full justify-end">
                        <div className="relative w-full">
                            <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Paste Bearer Token for Auth routes..."
                                value={authToken}
                                onChange={(e) =>
                                    handleTokenChange(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar: Route Selector */}
                <div className="lg:col-span-4 flex flex-col gap-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-xs h-[calc(100vh-6rem)] sticky top-20 overflow-hidden">
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-pink-500" />
                            Endpoint Catalog
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Select a backend route to test
                        </p>
                    </div>

                    {/* Search bar inside sidebar */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter routes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 transition-all"
                        />
                    </div>

                    {/* Module Pill Filter */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            onClick={() => setSelectedModule("all")}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                                selectedModule === "all"
                                    ? "bg-pink-500 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            All
                        </button>
                        {API_MODULES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedModule(m.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                                    selectedModule === m.id
                                        ? "bg-pink-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>

                    {/* List of Endpoints */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                        {filteredEndpoints.map((ep, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelectEndpoint(ep)}
                                className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 border ${
                                    selectedEndpoint.path === ep.path
                                        ? "bg-linear-to-r from-pink-50 to-sky-50 border-pink-300 shadow-xs"
                                        : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/50"
                                }`}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span
                                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getMethodBadgeClass(ep.method)}`}
                                        >
                                            {ep.method}
                                        </span>
                                        <code className="text-xs font-mono font-bold text-slate-800 truncate">
                                            {ep.path}
                                        </code>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                        {ep.description}
                                    </p>
                                </div>
                                <ChevronRight
                                    className={`w-3.5 h-3.5 shrink-0 ${selectedEndpoint.path === ep.path ? "text-pink-500" : "text-slate-300"}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Area: Request Execution Console */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Request Input Card */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-md">
                        {/* Request Bar */}
                        <form
                            onSubmit={handleExecute}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4"
                        >
                            {/* Method Selector */}
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="px-3 py-2.5 rounded-2xl bg-slate-100 text-slate-800 font-mono font-extrabold text-xs border border-slate-200 focus:outline-none focus:border-pink-400"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>

                            {/* Endpoint Path Input */}
                            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-pink-400 focus-within:bg-white transition-all min-w-0">
                                <span className="text-xs font-mono text-slate-400 select-none truncate shrink-0 max-w-30 sm:max-w-none">
                                    {API_BASE_URL}
                                </span>
                                <input
                                    type="text"
                                    value={path}
                                    onChange={(e) => setPath(e.target.value)}
                                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none pl-1"
                                />
                            </div>

                            {/* Execute Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-pink-500 to-sky-400 text-white font-bold text-xs hover:from-pink-600 hover:to-sky-500 transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shrink-0"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Play className="w-3.5 h-3.5 fill-white" />
                                )}
                                <span>Send</span>
                            </button>
                        </form>

                        {/* Request Options Tabs */}
                        <div className="border-b border-slate-100 flex items-center gap-4 text-xs font-bold mb-3">
                            <button
                                type="button"
                                onClick={() => setActiveReqTab("body")}
                                className={`pb-2 border-b-2 transition-colors ${
                                    activeReqTab === "body"
                                        ? "border-pink-500 text-pink-600"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                JSON Body
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveReqTab("headers")}
                                className={`pb-2 border-b-2 transition-colors ${
                                    activeReqTab === "headers"
                                        ? "border-pink-500 text-pink-600"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                Headers
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveReqTab("code")}
                                className={`pb-2 border-b-2 transition-colors ${
                                    activeReqTab === "code"
                                        ? "border-pink-500 text-pink-600"
                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                cURL Snippet
                            </button>
                        </div>

                        {/* Request Tab Contents */}
                        {activeReqTab === "body" && (
                            <div>
                                <textarea
                                    rows={6}
                                    value={requestBody}
                                    onChange={(e) =>
                                        setRequestBody(e.target.value)
                                    }
                                    disabled={method === "GET"}
                                    placeholder={
                                        method === "GET"
                                            ? "GET requests do not accept body payloads."
                                            : "Enter JSON payload..."
                                    }
                                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        )}

                        {activeReqTab === "headers" && (
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
                                <div>Content-Type: application/json</div>
                                <div>
                                    Authorization:{" "}
                                    {authToken
                                        ? `Bearer ${authToken.slice(0, 10)}...`
                                        : "(None)"}
                                </div>
                            </div>
                        )}

                        {activeReqTab === "code" && (
                            <div className="relative">
                                <pre className="p-3 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto whitespace-pre">
                                    {generateCurl()}
                                </pre>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            generateCurl(),
                                        );
                                        setCopiedCode(true);
                                        toast.success("cURL copied!");
                                        setTimeout(
                                            () => setCopiedCode(false),
                                            2000,
                                        );
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                                >
                                    {copiedCode ? (
                                        <Check className="w-3.5 h-3.5 text-teal-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Response Inspector Card */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-teal-100 shadow-md flex-1 flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-teal-600" />
                                <h3 className="font-extrabold text-slate-900 text-sm">
                                    Response Output
                                </h3>
                            </div>

                            {response && (
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                                            response.status >= 200 &&
                                            response.status < 300
                                                ? "bg-teal-100 text-teal-700 border-teal-300"
                                                : "bg-rose-100 text-rose-700 border-rose-300"
                                        }`}
                                    >
                                        {response.status} {response.statusText}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />{" "}
                                        {response.latency} ms
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Response Body Display */}
                        {isLoading ? (
                            <div className="flex-1 min-h-50 flex flex-col items-center justify-center gap-2 text-slate-400">
                                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-mono">
                                    Querying backend route...
                                </span>
                            </div>
                        ) : response ? (
                            <div className="relative flex-1">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            JSON.stringify(
                                                response.data,
                                                null,
                                                2,
                                            ),
                                        );
                                        setCopiedRes(true);
                                        toast.success("Response JSON copied!");
                                        setTimeout(
                                            () => setCopiedRes(false),
                                            2000,
                                        );
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                >
                                    {copiedRes ? (
                                        <Check className="w-3.5 h-3.5 text-teal-600" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                                <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-auto max-h-100 leading-relaxed">
                                    {JSON.stringify(response.data, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex-1 min-h-50 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-xs font-semibold">
                                    Click "Send" above to execute request
                                    against your backend.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
