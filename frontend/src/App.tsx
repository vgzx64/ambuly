import { useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/911', label: '911 ECC' },
  { to: '/hospital', label: 'Hospital ED' },
  { to: '/monitoring', label: 'Monitoring' }
];

const emergencyStatuses = [
  'CREATED',
  'HOSPITAL_NOTIFIED',
  'HOSPITAL_ACCEPTED',
  'HOSPITAL_REJECTED',
  'AMBULANCE_DISPATCHED',
  'EN_ROUTE_TO_SCENE',
  'AT_SCENE',
  'EN_ROUTE_TO_HOSPITAL',
  'ARRIVED_AT_HOSPITAL',
  'HANDED_OVER',
  'COMPLETED',
  'CANCELLED'
] as const;

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

interface EmergencyCase {
  emergencyId: string;
  status: string;
  priority: string;
  incidentType: string;
  hospitalId: string;
  ambulanceId?: string;
  locationRef?: string;
  organization: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  history: Array<{ eventType: string; timestamp: string; status: string }>;
}

interface EmergencyListResponse {
  success: boolean;
  data: EmergencyCase[];
  service: string;
  organization: string;
}

interface ServiceHealthResponse {
  status: string;
  service: string;
}

interface ActivityLog {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
  timestamp: string;
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? 'Request failed');
  }

  return payload as T;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const notify = (message: string, type: ActivityLog['type'] = 'info') => {
    setActivityLog((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        message,
        timestamp: new Date().toISOString()
      },
      ...current
    ].slice(0, 10));
  };

  const refresh = () => {
    setRefreshToken((value) => value + 1);
  };

  return (
    <>
      <nav className="topbar">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to}>{item.label}</Link>
        ))}
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard refreshToken={refreshToken} notify={notify} />} />
          <Route path="/911" element={<Org911 refreshToken={refreshToken} notify={notify} refresh={refresh} />} />
          <Route path="/hospital" element={<OrgHospital refreshToken={refreshToken} notify={notify} refresh={refresh} />} />
          <Route path="/monitoring" element={<Monitoring refreshToken={refreshToken} activityLog={activityLog} />} />
        </Routes>
      </main>
    </>
  );
}

function Dashboard({ refreshToken, notify }: { refreshToken: number; notify: (message: string, type?: ActivityLog['type']) => void }) {
  const emergencyQuery = useQuery({
    queryKey: ['emergencyList', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<EmergencyListResponse>('http://localhost:3001/api/v1/emergencies');
      return response.data ?? [];
    },
    retry: 1
  });

  const hospitalHealthQuery = useQuery({
    queryKey: ['hospitalHealth', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<ServiceHealthResponse>('http://localhost:3002/health');
      return response;
    },
    retry: 1
  });

  const emergencyCases = emergencyQuery.data ?? [];

  const stats = useMemo(() => {
    const active = emergencyCases.filter((caseItem) => !['COMPLETED', 'CANCELLED'].includes(caseItem.status)).length;
    const completed = emergencyCases.filter((caseItem) => caseItem.status === 'COMPLETED').length;
    const critical = emergencyCases.filter((caseItem) => caseItem.priority === 'CRITICAL').length;
    const accepted = emergencyCases.filter((caseItem) => caseItem.status === 'HOSPITAL_ACCEPTED' || caseItem.status === 'ARRIVED_AT_HOSPITAL' || caseItem.status === 'HANDED_OVER').length;
    return { active, completed, critical, accepted };
  }, [emergencyCases]);

  const latestCases = emergencyCases.slice(0, 5);

  const healthStatus = hospitalHealthQuery.isError ? 'Unavailable' : hospitalHealthQuery.data?.status ?? 'Checking';

  if (emergencyQuery.isError) {
    notify('911 service is offline or unavailable.', 'error');
  }

  return (
    <section className="panel">
      <div className="page-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>Emergency Response Coordination Platform</h1>
        </div>
        <div className="status-pill success">{healthStatus}</div>
      </div>

      <div className="cards">
        <article className="metric-card">
          <h3>Active cases</h3>
          <strong>{stats.active}</strong>
        </article>
        <article className="metric-card">
          <h3>Completed</h3>
          <strong>{stats.completed}</strong>
        </article>
        <article className="metric-card">
          <h3>Critical priority</h3>
          <strong>{stats.critical}</strong>
        </article>
        <article className="metric-card">
          <h3>Accepted by ED</h3>
          <strong>{stats.accepted}</strong>
        </article>
      </div>

      <div className="content-grid two-column">
        <div className="panel-block">
          <h2>Recent operations</h2>
          {latestCases.length === 0 ? (
            <p className="muted">No emergency cases have been created yet.</p>
          ) : (
            <div className="stack-list">
              {latestCases.map((caseItem) => (
                <div className="case-row" key={caseItem.emergencyId}>
                  <div>
                    <strong>{caseItem.emergencyId}</strong>
                    <div className="muted">{caseItem.incidentType}</div>
                  </div>
                  <div className="badge-row">
                    <span className="tag">{caseItem.priority}</span>
                    <span className="tag secondary">{caseItem.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-block">
          <h2>Service health</h2>
          <div className="stack-list compact">
            <div className="service-status">
              <span>911 ECC</span>
              <span className={emergencyQuery.isError ? 'text-danger' : 'text-success'}>
                {emergencyQuery.isError ? 'Offline' : 'Healthy'}
              </span>
            </div>
            <div className="service-status">
              <span>Hospital ED</span>
              <span className={hospitalHealthQuery.isError ? 'text-danger' : 'text-success'}>
                {hospitalHealthQuery.isError ? 'Offline' : 'Healthy'}
              </span>
            </div>
            <div className="service-status">
              <span>Monitoring</span>
              <span className="text-success">Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Org911({ refreshToken, notify, refresh }: { refreshToken: number; notify: (message: string, type?: ActivityLog['type']) => void; refresh: () => void }) {
  const initialForm = {
    emergencyId: `EMG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    priority: 'HIGH' as (typeof priorityOptions)[number],
    incidentType: 'TRAFFIC_ACCIDENT',
    hospitalId: 'HOSP-01',
    locationRef: 'Main St & 5th Ave',
    createdBy: 'dispatcher-001'
  };

  const [form, setForm] = useState(initialForm);
  const [ambulanceId, setAmbulanceId] = useState('AMB-74');
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['emergencyList', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<EmergencyListResponse>('http://localhost:3001/api/v1/emergencies');
      return response.data ?? [];
    },
    retry: 1
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await fetchJson('http://localhost:3001/api/v1/emergencies', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      setForm({
        ...initialForm,
        emergencyId: `EMG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      });
      notify(`Emergency ${form.emergencyId} created successfully.`, 'success');
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Failed to create emergency', 'error');
    }
  };

  const onDispatch = async (caseItem: EmergencyCase) => {
    try {
      await fetchJson(`http://localhost:3001/api/v1/emergencies/${caseItem.emergencyId}/dispatch`, {
        method: 'POST',
        body: JSON.stringify({ ambulanceId: ambulanceId || 'AMB-UNKNOWN' })
      });
      notify(`Ambulance assigned to ${caseItem.emergencyId}.`, 'success');
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Dispatch failed', 'error');
    }
  };

  const onStatusUpdate = async (caseItem: EmergencyCase) => {
    const nextStatus = statusMap[caseItem.emergencyId] ?? 'HOSPITAL_NOTIFIED';

    try {
      await fetchJson(`http://localhost:3001/api/v1/emergencies/${caseItem.emergencyId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus })
      });
      notify(`Status updated for ${caseItem.emergencyId} to ${nextStatus}.`, 'success');
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Status update failed', 'error');
    }
  };

  return (
    <section className="panel">
      <div className="page-header">
        <div>
          <p className="eyebrow">911 emergency communications center</p>
          <h1>Dispatch operations</h1>
        </div>
      </div>

      <div className="content-grid two-column">
        <form className="panel-block" onSubmit={onCreate}>
          <h2>Create emergency case</h2>

          <div className="field-grid">
            <label>
              Emergency ID
              <input value={form.emergencyId} onChange={(event) => handleChange('emergencyId', event.target.value)} />
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(event) => handleChange('priority', event.target.value)}>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label>
              Incident type
              <input value={form.incidentType} onChange={(event) => handleChange('incidentType', event.target.value)} />
            </label>
            <label>
              Hospital ID
              <input value={form.hospitalId} onChange={(event) => handleChange('hospitalId', event.target.value)} />
            </label>
            <label className="full-width">
              Location reference
              <input value={form.locationRef} onChange={(event) => handleChange('locationRef', event.target.value)} />
            </label>
            <label className="full-width">
              Created by
              <input value={form.createdBy} onChange={(event) => handleChange('createdBy', event.target.value)} />
            </label>
          </div>

          <button className="primary-button" type="submit">Create emergency</button>
        </form>

        <div className="panel-block">
          <h2>Quick dispatch</h2>
          <label>
            Assigned ambulance
            <input value={ambulanceId} onChange={(event) => setAmbulanceId(event.target.value)} />
          </label>
          <p className="muted">This value will be reused for the next dispatch action.</p>
        </div>
      </div>

      <div className="panel-block table-panel">
        <h2>Emergency queue</h2>

        {query.isLoading ? (
          <p className="muted">Loading cases…</p>
        ) : query.isError ? (
          <p className="text-danger">Unable to load emergency data from 911 service.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Transit</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(query.data ?? []).map((caseItem) => (
                  <tr key={caseItem.emergencyId}>
                    <td>{caseItem.emergencyId}</td>
                    <td>{caseItem.priority}</td>
                    <td>{caseItem.status}</td>
                    <td>{caseItem.ambulanceId ?? 'Unassigned'}</td>
                    <td>{formatTime(caseItem.updatedAt)}</td>
                    <td>
                      <div className="button-stack">
                        <button type="button" onClick={() => onDispatch(caseItem)}>Dispatch</button>
                        <select
                          value={statusMap[caseItem.emergencyId] ?? 'HOSPITAL_NOTIFIED'}
                          onChange={(event) => setStatusMap((current) => ({ ...current, [caseItem.emergencyId]: event.target.value }))}
                        >
                          {emergencyStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button type="button" className="secondary-button" onClick={() => onStatusUpdate(caseItem)}>
                          Apply status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function OrgHospital({ refreshToken, notify, refresh }: { refreshToken: number; notify: (message: string, type?: ActivityLog['type']) => void; refresh: () => void }) {
  const emergencyQuery = useQuery({
    queryKey: ['emergencyList', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<EmergencyListResponse>('http://localhost:3001/api/v1/emergencies');
      return response.data ?? [];
    },
    retry: 1
  });

  const hospitalHealthQuery = useQuery({
    queryKey: ['hospitalHealth', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<ServiceHealthResponse>('http://localhost:3002/health');
      return response;
    },
    retry: 1
  });

  const handleHospitalAction = async (id: string, endpoint: 'accept' | 'reject' | 'arrival' | 'handover') => {
    try {
      await fetchJson(`http://localhost:3002/api/v1/emergencies/${id}/${endpoint}`, {
        method: 'POST'
      });
      notify(`Hospital action ${endpoint} completed for ${id}.`, 'success');
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : `Hospital ${endpoint} failed`, 'error');
    }
  };

  const cases = emergencyQuery.data ?? [];

  return (
    <section className="panel">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital emergency department</p>
          <h1>Patient intake workflow</h1>
        </div>
        <div className={`status-pill ${hospitalHealthQuery.isError ? 'danger' : 'success'}`}>
          {hospitalHealthQuery.isError ? 'Hospital offline' : 'Hospital online'}
        </div>
      </div>

      <div className="panel-block table-panel">
        <h2>Incoming emergency requests</h2>

        {emergencyQuery.isLoading ? (
          <p className="muted">Loading requests…</p>
        ) : emergencyQuery.isError ? (
          <p className="text-danger">Unable to load incoming requests from 911 service.</p>
        ) : cases.length === 0 ? (
          <p className="muted">No incoming emergency cases.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.emergencyId}>
                    <td>{caseItem.emergencyId}</td>
                    <td>{caseItem.incidentType}</td>
                    <td>{caseItem.status}</td>
                    <td>{caseItem.priority}</td>
                    <td>
                      <div className="button-stack wrap">
                        <button type="button" onClick={() => handleHospitalAction(caseItem.emergencyId, 'accept')}>Accept</button>
                        <button type="button" className="secondary-button" onClick={() => handleHospitalAction(caseItem.emergencyId, 'reject')}>
                          Reject
                        </button>
                        <button type="button" className="secondary-button" onClick={() => handleHospitalAction(caseItem.emergencyId, 'arrival')}>
                          Arrival
                        </button>
                        <button type="button" className="secondary-button" onClick={() => handleHospitalAction(caseItem.emergencyId, 'handover')}>
                          Handover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Monitoring({ refreshToken, activityLog }: { refreshToken: number; activityLog: ActivityLog[] }) {
  const emergencyQuery = useQuery({
    queryKey: ['emergencyList', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<EmergencyListResponse>('http://localhost:3001/api/v1/emergencies');
      return response.data ?? [];
    },
    retry: 1
  });

  const hospitalHealthQuery = useQuery({
    queryKey: ['hospitalHealth', refreshToken],
    queryFn: async () => {
      const response = await fetchJson<ServiceHealthResponse>('http://localhost:3002/health');
      return response;
    },
    retry: 1
  });

  const emergencyCases = emergencyQuery.data ?? [];

  const insights = useMemo(() => {
    const alerts = emergencyCases.filter((caseItem) => caseItem.priority === 'CRITICAL' || caseItem.status === 'HOSPITAL_REJECTED').length;
    const active = emergencyCases.filter((caseItem) => !['COMPLETED', 'CANCELLED'].includes(caseItem.status)).length;
    const delivered = emergencyCases.filter((caseItem) => caseItem.status === 'HANDED_OVER' || caseItem.status === 'COMPLETED').length;

    return { alerts, active, delivered };
  }, [emergencyCases]);

  return (
    <section className="panel">
      <div className="page-header">
        <div>
          <p className="eyebrow">Monitoring and security</p>
          <h1>Operational oversight</h1>
        </div>
      </div>

      <div className="cards">
        <article className="metric-card">
          <h3>Active workflow</h3>
          <strong>{insights.active}</strong>
        </article>
        <article className="metric-card">
          <h3>Alerts</h3>
          <strong>{insights.alerts}</strong>
        </article>
        <article className="metric-card">
          <h3>Delivered</h3>
          <strong>{insights.delivered}</strong>
        </article>
      </div>

      <div className="content-grid two-column">
        <div className="panel-block">
          <h2>System summary</h2>
          <ul className="check-list">
            <li>911 ECC: {emergencyQuery.isError ? 'offline' : 'responding'}</li>
            <li>Hospital ED: {hospitalHealthQuery.isError ? 'offline' : 'responding'}</li>
            <li>Duplicate event checks: enabled</li>
            <li>State validation: active</li>
            <li>Reconciliation: enabled</li>
          </ul>
        </div>

        <div className="panel-block">
          <h2>Recent activity</h2>
          {activityLog.length === 0 ? (
            <p className="muted">No actions have been recorded yet.</p>
          ) : (
            <div className="activity-feed">
              {activityLog.map((entry) => (
                <div key={entry.id} className={`activity-item ${entry.type}`}>
                  <div>{entry.message}</div>
                  <small>{formatTime(entry.timestamp)}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default App;
