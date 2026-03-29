import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { fetchStats, fetchAppointments, updateAppointmentStatus } from '../api/appointments';
import { fetchClients } from '../api/clients';
import { formatPrice, statusChip, titleCase } from '../utils/helpers';
import styles from './Admin.module.css';

/* ── Icons (inline SVG) ──────────────────────────────────────────────── */
const Icon = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <rect x="3" y="4" width="18" height="18" rx="0" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const NAV = [
  { to: '/admin', end: true, icon: Icon.dashboard, label: 'Dashboard' },
  { to: '/admin/appointments', icon: Icon.calendar, label: 'Appointments' },
  { to: '/admin/clients', icon: Icon.users, label: 'Clients' },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <span className={styles.sidebarLogo}>TBA</span>
          <nav className={styles.sidebarNav}>
            {NAV.map(({ to, end, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
                }
                title={label}
              >
                {icon}
                <span className={styles.sidebarLabel}>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <span className={styles.userInitial}>{user?.name?.charAt(0) || 'A'}</span>
            <div>
              <p className={styles.userName}>{user?.name}</p>
              <p className="caption">{user?.role}</p>
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            {Icon.logout}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className={styles.content}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clients" element={<Clients />} />
        </Routes>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── Dashboard */
function Dashboard() {
  const today = format(new Date(), 'EEEE, MMMM d');

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });

  const { data } = useQuery({
    queryKey: ['appointments', { date: format(new Date(), 'yyyy-MM-dd') }],
    queryFn: () => fetchAppointments({ date: format(new Date(), 'yyyy-MM-dd'), limit: 20 }),
  });

  const todayAppts = data?.data || [];

  return (
    <div>
      <div className={styles.pageHead}>
        <div>
          <p className="label" style={{ color: 'var(--color-primary)' }}>{today}</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Today's Bookings"
          value={stats?.todayBookings ?? '–'}
          sub="appointments"
        />
        <StatCard
          label="Expected Revenue"
          value={stats ? formatPrice(stats.todayRevenue) : '–'}
          sub="today's forecast"
        />
        <StatCard
          label="New Clients"
          value={stats?.weekNewClients ?? '–'}
          sub="this week"
        />
        <StatCard
          label="VIP Clients"
          value={stats?.vipClients ?? '–'}
          sub="total"
          accent
        />
      </div>

      {/* Today's schedule */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Today's Schedule</h2>
        {todayAppts.length === 0 ? (
          <p className="caption" style={{ padding: 'var(--sp-8) 0' }}>No appointments today.</p>
        ) : (
          <AppointmentList appointments={todayAppts} />
        )}
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────── Appointments */
function Appointments() {
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', { date: dateFilter }],
    queryFn: () => fetchAppointments({ date: dateFilter, limit: 50 }),
  });

  const appointments = data?.data || [];

  return (
    <div>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Appointments</h1>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={styles.dateInput}
        />
      </div>
      {isLoading ? (
        <p className="caption">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="caption" style={{ padding: 'var(--sp-8) 0' }}>No appointments for this date.</p>
      ) : (
        <AppointmentList appointments={appointments} editable />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── Clients */
function Clients() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: () => fetchClients({ search: debouncedSearch || undefined, limit: 50 }),
  });

  const clients = data?.data || [];

  return (
    <div>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Clients</h1>
        <input
          type="search"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.dateInput}
          style={{ width: 280 }}
        />
      </div>

      {isLoading ? (
        <p className="caption">Loading…</p>
      ) : (
        <div className={styles.clientTable}>
          <div className={`${styles.clientRow} ${styles.clientHeader}`}>
            <span>Name</span>
            <span>Phone</span>
            <span>Email</span>
            <span>Status</span>
            <span>Joined</span>
          </div>
          {clients.map((c) => (
            <div key={c._id} className={styles.clientRow}>
              <span style={{ color: 'var(--color-on-bg)', fontWeight: 500 }}>{c.name}</span>
              <span className="caption">{c.phone}</span>
              <span className="caption">{c.email || '—'}</span>
              <span>
                {c.isVip
                  ? <span className={`chip ${styles.vipChip}`}>VIP</span>
                  : <span className="caption">Regular</span>}
              </span>
              <span className="caption">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Shared components ───────────────────────────────────────────────── */

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statCardAccent : ''}`}>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
      <p className="caption">{sub}</p>
    </div>
  );
}

function AppointmentList({ appointments, editable }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return (
    <div className={styles.apptList}>
      {appointments.map((a) => (
        <div key={a._id} className={styles.apptRow}>
          <div className={styles.apptTime}>
            <span>{a.timeSlot}</span>
            <span className="caption">{a.service?.duration} min</span>
          </div>
          <div className={styles.apptInfo}>
            <p className={styles.apptClient}>{a.client?.name}</p>
            <p className="caption">{a.service?.name} · {a.barber?.name}</p>
          </div>
          <span className={styles.apptPrice}>{formatPrice(a.price)}</span>
          <span className={statusChip(a.status)}>{titleCase(a.status)}</span>
          {editable && (
            <select
              className={styles.statusSelect}
              value={a.status}
              onChange={(e) => mutation.mutate({ id: a._id, status: e.target.value })}
              aria-label="Update status"
            >
              {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].map((s) => (
                <option key={s} value={s}>{titleCase(s)}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── useDebounce hook ───────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

