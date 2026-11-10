import { Link, Route, Routes } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/911', label: '911 ECC' },
  { to: '/hospital', label: 'Hospital ED' },
  { to: '/monitoring', label: 'Monitoring' }
];

function Dashboard() {
  return (
    <section>
      <h1>Emergency Response Coordination Platform</h1>
      <p>Shared operational state and coordination for emergency case processing.</p>
      <div className="cards">
        <article>
          <h3>Active Cases</h3>
          <strong>14</strong>
        </article>
        <article>
          <h3>Completed</h3>
          <strong>92</strong>
        </article>
        <article>
          <h3>Security Alerts</h3>
          <strong>2</strong>
        </article>
      </div>
    </section>
  );
}

function Org911() {
  return (
    <section>
      <h2>911 ECC Workspace</h2>
      <ul>
        <li>Create Emergency</li>
        <li>Assign Ambulance</li>
        <li>Update Transport Status</li>
        <li>Review Hospital Response</li>
      </ul>
    </section>
  );
}

function OrgHospital() {
  return (
    <section>
      <h2>Hospital ED Workspace</h2>
      <ul>
        <li>Incoming Emergency Requests</li>
        <li>Acceptance or Rejection</li>
        <li>Arrival Confirmation</li>
        <li>Patient Handover</li>
      </ul>
    </section>
  );
}

function Monitoring() {
  return (
    <section>
      <h2>Monitoring and Security</h2>
      <ul>
        <li>Unauthorized Operation Alerts</li>
        <li>Duplicate Event Tracking</li>
        <li>Fabric Transaction Overview</li>
        <li>Reconciliation Status</li>
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <>
      <nav className="topbar">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to}>{item.label}</Link>
        ))}
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/911" element={<Org911 />} />
          <Route path="/hospital" element={<OrgHospital />} />
          <Route path="/monitoring" element={<Monitoring />} />
        </Routes>
      </main>
    </>
  );
}
