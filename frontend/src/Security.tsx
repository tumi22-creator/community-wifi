import { useEffect, useState } from "react";
import api from "./api";

type SecurityEvent = {
  id: string;
  type: string;
  severity: string;
  ipAddress?: string | null;
  description: string;
  resolved: boolean;
  createdAt: string;
};

type LoginAudit = {
  id: string;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
};

export default function Security() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [logins, setLogins] = useState<LoginAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/dashboard");

      const data = response.data?.data || response.data;

      setEvents(data.recentSecurityEvents || []);
      setLogins(data.recentLogins || []);
    } catch (error) {
      console.error("Failed to load security data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const failedLogins = logins.filter(
    (login) => login.status === "FAILED"
  ).length;

  const successfulLogins = logins.filter(
    (login) => login.status === "SUCCESS"
  ).length;

  const unresolvedEvents = events.filter(
    (event) => !event.resolved
  ).length;

  const criticalEvents = events.filter(
    (event) => event.severity === "CRITICAL"
  ).length;

  return (
    <div>
      <h1>Security Monitoring</h1>

      <p style={{ color: "#666" }}>
        Monitor authentication activity and security events.
      </p>

      {loading ? (
        <p>Loading security data...</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              margin: "25px 0",
            }}
          >
            <div className="card">
              <h3>Failed Logins</h3>
              <strong>{failedLogins}</strong>
            </div>

            <div className="card">
              <h3>Successful Logins</h3>
              <strong>{successfulLogins}</strong>
            </div>

            <div className="card">
              <h3>Unresolved Events</h3>
              <strong>{unresolvedEvents}</strong>
            </div>

            <div className="card">
              <h3>Critical Events</h3>
              <strong>{criticalEvents}</strong>
            </div>
          </div>

          <section style={{ marginTop: "35px" }}>
            <h2>Recent Login Activity</h2>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {logins.map((login) => (
                    <tr key={login.id}>
                      <td>{login.email}</td>
                      <td>{login.status}</td>
                      <td>{login.ipAddress || "-"}</td>
                      <td>{login.userAgent || "-"}</td>
                      <td>
                        {new Date(
                          login.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logins.length === 0 && (
              <p>No login activity recorded.</p>
            )}
          </section>

          <section style={{ marginTop: "35px" }}>
            <h2>Security Events</h2>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>IP Address</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{event.type}</td>
                      <td>{event.severity}</td>
                      <td>{event.ipAddress || "-"}</td>
                      <td>{event.description}</td>
                      <td>
                        {event.resolved ? "RESOLVED" : "OPEN"}
                      </td>
                      <td>
                        {new Date(
                          event.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {events.length === 0 && (
              <p>No security events recorded.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}