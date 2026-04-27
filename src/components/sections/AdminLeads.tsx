import React from 'react';
import axios from 'axios';
import { Download, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../ui/Toast';

type LeadItem = {
  id: string;
  name: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  source: string;
  createdAt: string;
};

type AuditAction = 'view_leads' | 'export_leads';

type AuditItem = {
  id: string;
  adminEmail: string;
  action: AuditAction;
  metadata: Record<string, unknown>;
  sourceIp: string;
  createdAt: string;
};

const ADMIN_EMAIL = 'elyrazen.in@gmail.com';

function toCsv(rows: LeadItem[]) {
  const header = ['id', 'name', 'phone', 'city', 'service', 'source', 'message', 'createdAt'];
  const escapeCell = (value: string) => `"${String(value || '').replace(/"/g, '""')}"`;
  const body = rows.map((row) => [
    row.id,
    row.name,
    row.phone,
    row.city,
    row.service,
    row.source,
    row.message,
    row.createdAt,
  ].map(escapeCell).join(','));
  return [header.join(','), ...body].join('\n');
}

function toAuditCsv(rows: AuditItem[]) {
  const header = ['id', 'adminEmail', 'action', 'sourceIp', 'createdAt', 'metadata'];
  const escapeCell = (value: string) => `"${String(value || '').replace(/"/g, '""')}"`;
  const body = rows.map((row) => [
    row.id,
    row.adminEmail,
    row.action,
    row.sourceIp,
    row.createdAt,
    JSON.stringify(row.metadata || {}),
  ].map(escapeCell).join(','));
  return [header.join(','), ...body].join('\n');
}

function formatAuditMetadata(metadata: Record<string, unknown>) {
  const normalized = metadata || {};
  const pieces: string[] = [];

  const addPiece = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return;
    pieces.push(`${label}: ${String(value)}`);
  };

  addPiece('query', normalized.query);
  addPiece('count', normalized.count);
  addPiece('result', normalized.resultCount);

  const knownKeys = new Set(['query', 'count', 'resultCount']);
  const extraEntries = Object.entries(normalized).filter(([key]) => !knownKeys.has(key));
  if (extraEntries.length > 0) {
    const extrasText = extraEntries
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | ');
    if (extrasText) {
      pieces.push(extrasText);
    }
    if (extraEntries.length > 2) {
      pieces.push(`+${extraEntries.length - 2} more`);
    }
  }

  if (pieces.length === 0) {
    return 'No metadata';
  }

  return pieces.join(' | ');
}

export default function AdminLeads() {
  const { user, session, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'leads' | 'audit'>('leads');
  const [leads, setLeads] = React.useState<LeadItem[]>([]);
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [auditLogs, setAuditLogs] = React.useState<AuditItem[]>([]);
  const [isAuditLoading, setIsAuditLoading] = React.useState(false);
  const [auditActionFilter, setAuditActionFilter] = React.useState<'all' | AuditAction>('all');
  const [auditStartDate, setAuditStartDate] = React.useState('');
  const [auditEndDate, setAuditEndDate] = React.useState('');
  const [toastState, setToastState] = React.useState<{ open: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  });

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const showToast = React.useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToastState({ open: true, type, title, message });
  }, []);

  const loadLeads = React.useCallback(async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/leads', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        params: {
          query: query.trim() || undefined,
        },
      });

      setLeads(Array.isArray(response.data?.leads) ? response.data.leads : []);
    } catch (error) {
      showToast('error', 'Unable to load leads', 'Please verify admin access and retry.');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, query, showToast]);

  React.useEffect(() => {
    if (!isAdmin || !session?.access_token) return;
    loadLeads();
  }, [isAdmin, session?.access_token, loadLeads]);

  const loadAuditLogs = React.useCallback(async () => {
    if (!session?.access_token) return;

    setIsAuditLoading(true);
    try {
      const response = await axios.get('/api/admin/audit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        params: {
          limit: 500,
        },
      });

      const nextLogs = Array.isArray(response.data?.logs) ? response.data.logs : [];
      setAuditLogs(nextLogs);
    } catch (error) {
      showToast('error', 'Unable to load audit logs', 'Please verify admin access and retry.');
    } finally {
      setIsAuditLoading(false);
    }
  }, [session?.access_token, showToast]);

  React.useEffect(() => {
    if (activeTab !== 'audit' || !isAdmin || !session?.access_token) return;
    loadAuditLogs();
  }, [activeTab, isAdmin, session?.access_token, loadAuditLogs]);

  const logAdminAudit = React.useCallback(
    async (action: 'view_leads' | 'export_leads', metadata: Record<string, unknown>) => {
      if (!session?.access_token) return;
      try {
        await axios.post(
          '/api/admin/audit',
          { action, metadata },
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
      } catch (_error) {
        // Best-effort logging only.
      }
    },
    [session?.access_token],
  );

  const exportCsv = () => {
    if (!leads.length) {
      showToast('info', 'No data to export', 'Load leads first, then try export.');
      return;
    }

    const csv = toCsv(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elyra-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    void logAdminAudit('export_leads', {
      count: leads.length,
      query: query.trim() || null,
    });

    showToast('success', 'Export ready', 'Leads CSV downloaded successfully.');
  };

  const filteredAuditLogs = React.useMemo(() => {
    const startTs = auditStartDate ? new Date(`${auditStartDate}T00:00:00`).getTime() : null;
    const endTs = auditEndDate ? new Date(`${auditEndDate}T23:59:59.999`).getTime() : null;

    return auditLogs.filter((log) => {
      if (auditActionFilter !== 'all' && log.action !== auditActionFilter) {
        return false;
      }

      const createdTs = new Date(log.createdAt).getTime();
      if (startTs !== null && createdTs < startTs) {
        return false;
      }
      if (endTs !== null && createdTs > endTs) {
        return false;
      }

      return true;
    });
  }, [auditLogs, auditActionFilter, auditStartDate, auditEndDate]);

  const exportAuditCsv = () => {
    if (!filteredAuditLogs.length) {
      showToast('info', 'No audit logs to export', 'Adjust filters or refresh audit logs first.');
      return;
    }

    const csv = toAuditCsv(filteredAuditLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elyra-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('success', 'Audit export ready', 'Audit history CSV downloaded successfully.');
  };

  if (loading) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading admin access...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-black">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">Please sign in with the authorized Google account to view leads.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-lg font-bold">Access denied</h2>
        </div>
        <p className="mt-2 text-sm text-red-700">
          Only {ADMIN_EMAIL} can access this dashboard. You are signed in as {user.email || 'unknown user'}.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-[34px] border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <Toast
        open={toastState.open}
        type={toastState.type}
        title={toastState.title}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] gold-text mb-2">Admin Only</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Operations Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">Manage leads and review admin audit history.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={activeTab === 'leads' ? loadLeads : loadAuditLogs}
            disabled={activeTab === 'leads' ? isLoading : isAuditLoading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            {(activeTab === 'leads' ? isLoading : isAuditLoading) ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={activeTab === 'leads' ? exportCsv : exportAuditCsv}
            className="inline-flex items-center gap-2 rounded-full border gold-border gold-bg px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-95"
          >
            <Download className="w-4 h-4" />
            {activeTab === 'leads' ? 'Export Leads CSV' : 'Export Audit CSV'}
          </button>
        </div>
      </div>

      <div className="mt-5 inline-flex rounded-full border border-gray-300 bg-white p-1">
        <button
          onClick={() => setActiveTab('leads')}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'leads'
              ? 'gold-bg text-black'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'audit'
              ? 'gold-bg text-black'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Audit
        </button>
      </div>

      {activeTab === 'leads' && (
        <>
          <div className="mt-5 flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, city, service, or source"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={loadLeads}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100"
            >
              Search
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Created</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">City</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Service</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Source</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{new Date(lead.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-black whitespace-nowrap">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{lead.city}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{lead.service}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                          {lead.source || 'conversion_form'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 min-w-[280px]">{lead.message || '-'}</td>
                    </tr>
                  ))}
                  {!isLoading && leads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No leads found for this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'audit' && (
        <>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value as 'all' | AuditAction)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All actions</option>
              <option value="view_leads">View leads</option>
              <option value="export_leads">Export leads</option>
            </select>
            <input
              type="date"
              value={auditStartDate}
              onChange={(e) => setAuditStartDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={auditEndDate}
              onChange={(e) => setAuditEndDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                setAuditActionFilter('all');
                setAuditStartDate('');
                setAuditEndDate('');
              }}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100"
            >
              Reset filters
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            Showing {filteredAuditLogs.length} of {auditLogs.length} audit records.
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Timestamp</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Admin</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">IP</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{log.adminEmail}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{log.sourceIp || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 min-w-[320px] break-words">{formatAuditMetadata(log.metadata || {})}</td>
                    </tr>
                  ))}
                  {!isAuditLoading && filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">No audit records found for this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
