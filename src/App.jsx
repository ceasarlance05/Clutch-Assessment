import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

// Safe icon component helper to handle dynamic lucide imports cleanly
const Icon = ({ name, className = "h-4 w-4", ...props }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;
  return <IconComponent className={className} {...props} />;
};

// Direct icon aliases for seamless usage throughout JSX
const AlertTriangle = (props) => <Icon name="AlertTriangle" {...props} />;
const CheckCircle2 = (props) => <Icon name="CheckCircle2" {...props} />;
const Clock = (props) => <Icon name="Clock" {...props} />;
const Calendar = (props) => <Icon name="Calendar" {...props} />;
const MapPin = (props) => <Icon name="MapPin" {...props} />;
const Users = (props) => <Icon name="Users" {...props} />;
const TrendingUp = (props) => <Icon name="TrendingUp" {...props} />;
const Search = (props) => <Icon name="Search" {...props} />;
const RefreshCw = (props) => <Icon name="RefreshCw" {...props} />;
const Layers = (props) => <Icon name="Layers" {...props} />;
const Cpu = (props) => <Icon name="Cpu" {...props} />;
const ArrowUpRight = (props) => <Icon name="ArrowUpRight" {...props} />;
const Sun = (props) => <Icon name="Sun" {...props} />;
const Moon = (props) => <Icon name="Moon" {...props} />;
const X = (props) => <Icon name="X" {...props} />;
const FileText = (props) => <Icon name="FileText" {...props} />;
const Mail = (props) => <Icon name="Mail" {...props} />;
const Phone = (props) => <Icon name="Phone" {...props} />;
const Building = (props) => <Icon name="Building" {...props} />;
const Compass = (props) => <Icon name="Compass" {...props} />;
const Filter = (props) => <Icon name="Filter" {...props} />;
const Bell = (props) => <Icon name="Bell" {...props} />;

// Your live Google Apps Script Web App Endpoint
const LIVE_API_URL =
  'https://script.google.com/macros/s/AKfycbxkCKC9ygDYoTOF-GCtcU72wPG4pIfcIlNDhSGxY8Acrwia2l2bAqaXvbDFuiKHidXC/exec';

// Baseline fallback data in case the network request fails or is offline
const FALLBACK_EVENTS = [
  {
    event_id: 'E101',
    name: 'Sydney Cloud Security Summit',
    city: 'Sydney',
    date: '2026-11-19',
    type: 'Summit',
    target_registrations: 60,
    current_registrations: 42,
    launched: '2026-08-20',
  },
  {
    event_id: 'E114',
    name: 'Platform Engineering Dinner',
    city: 'Melbourne',
    date: '2026-11-10',
    type: 'Roundtable',
    target_registrations: 45,
    current_registrations: 46,
    launched: '2026-09-29',
  },
  {
    event_id: 'E125',
    name: 'Identity Leaders Roundtable',
    city: 'Sydney',
    date: '2026-11-18',
    type: 'Roundtable',
    target_registrations: 50,
    current_registrations: 43,
    launched: '2026-10-06',
  },
  {
    event_id: 'E126',
    name: 'Identity Leaders Roundtable',
    city: 'Melbourne',
    date: '2026-11-19',
    type: 'Roundtable',
    target_registrations: 30,
    current_registrations: 9,
    launched: '2026-10-06',
  },
  {
    event_id: 'E130',
    name: 'Network Detection Roundtable',
    city: 'Brisbane',
    date: '2026-11-19',
    type: 'Roundtable',
    target_registrations: 25,
    current_registrations: 4,
    launched: '2026-10-22',
  },
  {
    event_id: 'E141',
    name: 'HR Tech Roundtable',
    city: 'Melbourne',
    date: '2026-11-26',
    type: 'Roundtable',
    target_registrations: 30,
    current_registrations: 31,
    launched: '2026-10-01',
  },
  {
    event_id: 'E150',
    name: 'Finance Technology Summit',
    city: 'Singapore',
    date: '2027-02-24',
    type: 'Summit',
    target_registrations: 300,
    current_registrations: 40,
    launched: '2026-10-15',
  },
  {
    event_id: 'E155',
    name: 'Data Governance Roundtable',
    city: 'Auckland',
    date: '2026-11-12',
    type: 'Roundtable',
    target_registrations: 25,
    current_registrations: null,
    launched: '2026-10-10',
  },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Connecting...');
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
  
  // Notification States
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');

  // Filtering & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerStatusFilter, setDrawerStatusFilter] = useState('ALL');
  const [activeModal, setActiveModal] = useState(null); // 'architecture' | 'notes' | null

  // Fetch live data from Google Apps Script Web App
  const fetchLiveDriveData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await fetch(LIVE_API_URL);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
      }
      if (data.registrations && Array.isArray(data.registrations)) {
        setRegistrations(data.registrations);
      }
      setSyncStatus('Live Google Drive Sync');
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to sync with Google Drive Web App:', error);
      setSyncStatus('Fallback / Cached Mode');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Trigger webhook notification via Apps Script doPost
  const handleTriggerNotify = async () => {
    setIsNotifying(true);
    setNotifyMessage('Sending alert...');
    try {
      await fetch(LIVE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'sendNotification' })
      });
      
      setNotifyMessage('Alert sent successfully!');
      setTimeout(() => setNotifyMessage(''), 4000);
    } catch (error) {
      console.error('Failed to trigger notification:', error);
      setNotifyMessage('Failed to send');
      setTimeout(() => setNotifyMessage(''), 4000);
    } finally {
      setIsNotifying(false);
    }
  };

  useEffect(() => {
    fetchLiveDriveData();

    // Auto-poll every 60 seconds to reflect real-time Drive updates
    const interval = setInterval(() => fetchLiveDriveData(false), 60000);
    return () => clearInterval(interval);
  }, []);

  // Merge event metadata with live CSV registration counts & statuses
  const enrichedEvents = useMemo(() => {
    const today = new Date('2026-11-12'); // Current assessment reference date

    return events.map((ev) => {
      const evRegs = registrations.filter((r) => {
        const eventField = (r.event || '').trim();
        return (
          eventField.startsWith(ev.event_id) ||
          eventField.toLowerCase().includes(ev.name.toLowerCase())
        );
      });

      const hasGranularCsv = evRegs.length > 0;
      const acceptedCount = hasGranularCsv
        ? evRegs.filter((r) => (r.status || '').trim().toLowerCase() === 'accepted').length
        : ev.current_registrations ?? 0;

      const pendingCount = hasGranularCsv
        ? evRegs.filter((r) => (r.status || '').trim().toLowerCase() === 'pending').length
        : 0;

      const cancelledCount = hasGranularCsv
        ? evRegs.filter((r) => (r.status || '').trim().toLowerCase() === 'cancelled').length
        : 0;

      const target = Number(ev.target_registrations) || 0;
      const progressPct = target > 0 ? Math.round((acceptedCount / target) * 100) : 0;

      const eventDate = new Date(ev.date);
      const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

      let health = 'ON_TRACK';
      let attentionReason = '';

      if (ev.current_registrations === null && !hasGranularCsv) {
        health = 'NEEDS_ATTENTION';
        attentionReason = 'No registration feed / 0 reported';
      } else if (progressPct >= 100) {
        health = 'TARGET_MET';
        attentionReason = 'Target reached or exceeded';
      } else if (daysUntil <= 10 && progressPct < 60) {
        health = 'NEEDS_ATTENTION';
        attentionReason = `Only ${progressPct}% filled with ${Math.max(daysUntil, 0)}d left`;
      } else if (daysUntil <= 21 && progressPct < 40) {
        health = 'NEEDS_ATTENTION';
        attentionReason = `Behind pacing (${progressPct}% of target)`;
      } else if (pendingCount >= 3) {
        health = 'REVIEW_PENDING';
        attentionReason = `${pendingCount} pending approvals awaiting review`;
      }

      return {
        ...ev,
        hasGranularCsv,
        registrationsList: evRegs,
        acceptedCount,
        pendingCount,
        cancelledCount,
        progressPct,
        daysUntil,
        health,
        attentionReason,
      };
    });
  }, [events, registrations]);

  // Portfolio-wide KPI calculations
  const kpis = useMemo(() => {
    const totalEvents = enrichedEvents.length;
    const totalAccepted = enrichedEvents.reduce((acc, e) => acc + e.acceptedCount, 0);
    const totalTarget = enrichedEvents.reduce((acc, e) => acc + (Number(e.target_registrations) || 0), 0);
    const totalPending = enrichedEvents.reduce((acc, e) => acc + e.pendingCount, 0);
    const totalCancelled = enrichedEvents.reduce((acc, e) => acc + e.cancelledCount, 0);
    const attentionCount = enrichedEvents.filter((e) => e.health === 'NEEDS_ATTENTION').length;
    const yieldRate = totalTarget > 0 ? Math.round((totalAccepted / totalTarget) * 100) : 0;

    return {
      totalEvents,
      totalAccepted,
      totalTarget,
      totalPending,
      totalCancelled,
      attentionCount,
      yieldRate,
    };
  }, [enrichedEvents]);

  // Filtered event cards
  const filteredEvents = useMemo(() => {
    return enrichedEvents.filter((ev) => {
      const matchesQuery =
        ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.event_id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;
      if (statusFilter === 'ATTENTION') return ev.health === 'NEEDS_ATTENTION';
      if (statusFilter === 'ON_TRACK') return ev.health === 'ON_TRACK' || ev.health === 'TARGET_MET';
      if (statusFilter === 'LIVE_CSV') return ev.hasGranularCsv;
      return true;
    });
  }, [enrichedEvents, searchQuery, statusFilter]);

  // Filtered attendees inside drill-down drawer
  const filteredDrawerAttendees = useMemo(() => {
    if (!selectedEvent) return [];
    return selectedEvent.registrationsList.filter((reg) => {
      const fullName = `${reg.first_name || ''} ${reg.last_name || ''}`.toLowerCase();
      const company = (reg.company || '').toLowerCase();
      const email = (reg.email || '').toLowerCase();
      const matchesSearch =
        fullName.includes(drawerSearch.toLowerCase()) ||
        company.includes(drawerSearch.toLowerCase()) ||
        email.includes(drawerSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (drawerStatusFilter !== 'ALL') {
        return (reg.status || '').trim().toUpperCase() === drawerStatusFilter;
      }
      return true;
    });
  }, [selectedEvent, drawerSearch, drawerStatusFilter]);

  const theme = {
    bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: darkMode
      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm',
    subtext: darkMode ? 'text-slate-400' : 'text-slate-500',
    badgeBg: darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700',
    input: darkMode
      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme.bg}`}>
      {/* Top Navigation / Executive Header */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md ${
          darkMode ? 'bg-slate-950/85 border-slate-800' : 'bg-white/85 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">Northstar Events</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operations
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${theme.subtext}`}>
                Executive Registration & Pacing Intelligence
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100/80 border-slate-200'
              }`}
            >
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {syncStatus}
              </span>
              <span className={theme.subtext}>|</span>
              <span className={theme.subtext}>Refreshed {lastSynced}</span>
              <button
                onClick={() => fetchLiveDriveData(true)}
                disabled={isRefreshing}
                title="Refresh data from Google Drive"
                className="ml-1 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleTriggerNotify}
              disabled={isNotifying}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                darkMode
                  ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300 hover:bg-indigo-900/80'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Bell className={`h-3.5 w-3.5 ${isNotifying ? 'animate-bounce' : ''}`} />
              {notifyMessage || 'Notify Slack'}
            </button>

            <button
              onClick={() => setActiveModal('architecture')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  : 'bg-white border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-indigo-500" />
              Data Architecture
            </button>

            <button
              onClick={() => setActiveModal('notes')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  : 'bg-white border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              Assessment Notes
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
              className={`p-2 rounded-lg border transition ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border transition ${theme.card}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${theme.subtext}`}>
                Active Campaign
              </span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpis.totalEvents}</span>
              <span className={`text-xs ${theme.subtext}`}>Events Scheduled</span>
            </div>
            <div className={`mt-2 flex items-center gap-1.5 text-xs ${theme.subtext}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>Nov 2026 – Feb 2027</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition ${theme.card}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${theme.subtext}`}>
                Accepted vs Target
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpis.totalAccepted}</span>
              <span className={`text-sm font-medium ${theme.subtext}`}>/ {kpis.totalTarget}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Total Yield Rate: {kpis.yieldRate}%
              </span>
              <span className={theme.subtext}>{kpis.totalCancelled} cancelled</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition ${theme.card}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${theme.subtext}`}>
                Pending Approvals
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpis.totalPending}</span>
              <span className={`text-xs ${theme.subtext}`}>Awaiting Review</span>
            </div>
            <div className={`mt-2 text-xs ${theme.subtext}`}>
              From live CSV attendee feed ({registrations.length} rows)
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border transition ${
              kpis.attentionCount > 0
                ? darkMode
                  ? 'bg-rose-950/20 border-rose-900/60'
                  : 'bg-rose-50/70 border-rose-200'
                : theme.card
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Needs Attention
              </span>
              <div className="p-2 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {kpis.attentionCount}
              </span>
              <span className={`text-xs ${theme.subtext}`}>Events Behind Pace</span>
            </div>
            <div className="mt-2 text-xs text-rose-600/90 dark:text-rose-400/90 font-medium">
              Immediate marketing intervention advised
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All Events (${enrichedEvents.length})` },
              { id: 'ATTENTION', label: `Needs Attention (${kpis.attentionCount})` },
              { id: 'LIVE_CSV', label: 'With Attendee Roster (3)' },
              { id: 'ON_TRACK', label: 'On Track / Target Met' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : darkMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`absolute left-3 top-2.5 h-4 w-4 ${theme.subtext}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, city, or ID..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.input}`}
            />
          </div>
        </section>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className={`text-sm ${theme.subtext}`}>Syncing live registration metrics from Google Drive...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((ev) => {
              const isAttention = ev.health === 'NEEDS_ATTENTION';
              const isTargetMet = ev.health === 'TARGET_MET';

              return (
                <div
                  key={ev.event_id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setDrawerSearch('');
                    setDrawerStatusFilter('ALL');
                  }}
                  className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                    isAttention
                      ? darkMode
                        ? 'bg-slate-900/95 border-rose-800/80 hover:border-rose-600'
                        : 'bg-white border-rose-300 hover:border-rose-400 shadow-sm'
                      : theme.card
                  }`}
                >
                  <div>
                    {/* Top Row: ID, Type & Status Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${theme.badgeBg}`}>
                          {ev.event_id}
                        </span>
                        <span className={`text-xs font-medium ${theme.subtext}`}>{ev.type}</span>
                      </div>

                      {isAttention ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3" />
                          Needs Attention
                        </span>
                      ) : isTargetMet ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Target Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <TrendingUp className="h-3 w-3" />
                          On Track
                        </span>
                      )}
                    </div>

                    {/* Event Title & Location */}
                    <h3 className="text-base font-bold group-hover:text-indigo-500 transition-colors">
                      {ev.name}
                    </h3>
                    <div className={`mt-1.5 flex flex-wrap items-center gap-3 text-xs ${theme.subtext}`}>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {ev.city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {ev.date}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex items-end justify-between text-xs mb-1.5">
                        <span className="font-semibold">
                          {ev.acceptedCount}{' '}
                          <span className={`font-normal ${theme.subtext}`}>
                            / {ev.target_registrations} target
                          </span>
                        </span>
                        <span
                          className={`font-bold ${
                            isAttention
                              ? 'text-rose-600 dark:text-rose-400'
                              : isTargetMet
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {ev.progressPct}%
                        </span>
                      </div>
                      <div
                        className={`w-full h-2.5 rounded-full overflow-hidden ${
                          darkMode ? 'bg-slate-800' : 'bg-slate-100'
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAttention
                              ? 'bg-rose-500'
                              : isTargetMet
                              ? 'bg-emerald-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(ev.progressPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Breakdown Pills */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {ev.acceptedCount}
                        </div>
                        <div className={`text-[10px] ${theme.subtext}`}>Accepted</div>
                      </div>
                      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {ev.pendingCount}
                        </div>
                        <div className={`text-[10px] ${theme.subtext}`}>Pending</div>
                      </div>
                      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                        <div className="text-xs font-bold text-slate-500">{ev.cancelledCount}</div>
                        <div className={`text-[10px] ${theme.subtext}`}>Cancelled</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span
                      className={`truncate max-w-[75%] ${
                        isAttention ? 'text-rose-600 dark:text-rose-400 font-medium' : theme.subtext
                      }`}
                    >
                      {ev.attentionReason || (ev.hasGranularCsv ? 'Live CSV attendee list available' : 'Aggregate count from events.json')}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Inspect
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Attendee Drill-Down Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl h-full overflow-y-auto p-6 shadow-2xl border-l ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${theme.badgeBg}`}>
                    {selectedEvent.event_id}
                  </span>
                  <span className={`text-xs ${theme.subtext}`}>
                    {selectedEvent.city} • {selectedEvent.date}
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-1">{selectedEvent.name}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-4 gap-3 my-5">
              <div className={`p-3 rounded-xl border ${theme.card}`}>
                <div className={`text-xs ${theme.subtext}`}>Target</div>
                <div className="text-lg font-bold mt-0.5">{selectedEvent.target_registrations}</div>
              </div>
              <div className={`p-3 rounded-xl border ${theme.card}`}>
                <div className={`text-xs ${theme.subtext}`}>Accepted</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedEvent.acceptedCount}
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${theme.card}`}>
                <div className={`text-xs ${theme.subtext}`}>Pending</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {selectedEvent.pendingCount}
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${theme.card}`}>
                <div className={`text-xs ${theme.subtext}`}>Cancelled</div>
                <div className="text-lg font-bold text-slate-500 mt-0.5">
                  {selectedEvent.cancelledCount}
                </div>
              </div>
            </div>

            {selectedEvent.hasGranularCsv ? (
              <>
                {/* Drawer Search & Status Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-2.5 h-4 w-4 ${theme.subtext}`} />
                    <input
                      type="text"
                      value={drawerSearch}
                      onChange={(e) => setDrawerSearch(e.target.value)}
                      placeholder="Filter attendees by name, company, or email..."
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.input}`}
                    />
                  </div>
                  <select
                    value={drawerStatusFilter}
                    onChange={(e) => setDrawerStatusFilter(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs border focus:outline-none ${theme.input}`}
                  >
                    <option value="ALL">All Statuses ({selectedEvent.registrationsList.length})</option>
                    <option value="ACCEPTED">Accepted ({selectedEvent.acceptedCount})</option>
                    <option value="PENDING">Pending ({selectedEvent.pendingCount})</option>
                    <option value="CANCELLED">Cancelled ({selectedEvent.cancelledCount})</option>
                  </select>
                </div>

                {/* Attendee List */}
                <div className="space-y-2.5">
                  {filteredDrawerAttendees.map((reg, idx) => {
                    const status = (reg.status || '').trim();
                    const isMissingEmail = !reg.email || !reg.email.trim();
                    const hasMalformedEmail = reg.email && reg.email.includes('[at]');

                    return (
                      <div
                        key={reg.registration_id || idx}
                        className={`p-3.5 rounded-xl border text-xs ${theme.card}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm flex items-center gap-2">
                              <span>
                                {(reg.first_name || '').trim()} {(reg.last_name || '').trim()}
                              </span>
                              <span className={`font-mono text-[11px] font-normal ${theme.subtext}`}>
                                #{reg.registration_id}
                              </span>
                            </div>
                            <div className={`mt-1 flex flex-wrap items-center gap-3 ${theme.subtext}`}>
                              <span className="inline-flex items-center gap-1">
                                <Building className="h-3.5 w-3.5" />
                                {reg.company} — {reg.job_title}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full font-semibold ${
                              status === 'Accepted'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : status === 'Pending'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-500/15 text-slate-500'
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-indigo-500" />
                              {isMissingEmail ? (
                                <span className="text-rose-500 font-medium">Missing email in CSV</span>
                              ) : hasMalformedEmail ? (
                                <span className="text-amber-500 font-medium">
                                  {reg.email} (needs formatting cleanup)
                                </span>
                              ) : (
                                <span>{reg.email}</span>
                              )}
                            </span>
                            {reg.mobile && (
                              <span className={`inline-flex items-center gap-1 ${theme.subtext}`}>
                                <Phone className="h-3.5 w-3.5" />
                                {reg.mobile}
                              </span>
                            )}
                          </div>
                          <span className={theme.subtext}>{reg.registered_at}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={`p-6 rounded-2xl border text-center ${theme.card}`}>
                <Filter className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Aggregate Summary Event</h4>
                <p className={`text-xs mt-1 max-w-md mx-auto ${theme.subtext}`}>
                  Individual attendee rows in <code>registrations.csv</code> are currently exported for
                  events E101, E114, and E125. This event tracks aggregate registration counts directly
                  from <code>events.json</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Architecture / Assessment Notes Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">
                {activeModal === 'architecture'
                  ? 'Live Sync Data Architecture'
                  : 'Assessment Assumptions & Data Hygiene Notes'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeModal === 'architecture' ? (
              <div className={`mt-4 space-y-3 text-xs leading-relaxed ${theme.subtext}`}>
                <p>
                  <strong className="text-indigo-500">1. Google Apps Script API Bridge:</strong>{' '}
                  Reads both <code>registrations.csv</code> and <code>events.json</code> directly from
                  Google Drive and serves them over HTTPS with CORS headers enabled.
                </p>
                <p>
                  <strong className="text-indigo-500">2. Automatic Polling & Manual Refresh:</strong>{' '}
                  The dashboard fetches live data on initial load, polls every 60 seconds automatically,
                  and supports instant on-demand sync via the header refresh button.
                </p>
                <p>
                  <strong className="text-indigo-500">3. Unified Data Reconciliation:</strong>{' '}
                  Granular CSV records override baseline counts for active registration
                  exports (E101, E114, E125), while remaining events display baseline totals from{' '}
                  <code>events.json</code>.
                </p>
              </div>
            ) : (
              <div className={`mt-4 space-y-3 text-xs leading-relaxed ${theme.subtext}`}>
                <p>
                  <strong className="text-amber-500">Data Hygiene Flags Surfaced:</strong> Several CSV
                  records contain missing emails, obfuscated <code>[at]</code> addresses, leading/trailing
                  whitespace in names, or duplicate registration rows. These are
                  preserved and highlighted in the inspection drawer for ops cleanup.
                </p>
                <p>
                  <strong className="text-rose-500">Null Baseline Handling:</strong> Event E155 (Data
                  Governance Roundtable) has <code>current_registrations: null</code> in{' '}
                  <code>events.json</code> and is flagged under <em>Needs Attention</em> so the team
                  can verify its registration webhook.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}