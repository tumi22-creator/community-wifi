import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { useEffect, useState } from "react";



import Login from "./Login";
import Sidebar from "./Sidebar";
import api from "./api";
import Vouchers from "./Vouchers";
import WifiUsers from "./WifiUsers";
import Sessions from "./Sessions";
import Security from "./Security";

type Hotspot = {
  id: string;
  name: string;
  location: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  maxUsers: number;
  createdAt: string;
};

type DashboardData = {
  overview: {
    totalHotspots: number;
    onlineHotspots: number;
    offlineHotspots: number;
    maintenanceHotspots: number;
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    activeSessions: number;
    totalDataUsedMb: number;
    totalVouchers: number;
    activeVouchers: number;
    usedVouchers: number;
    expiredVouchers: number;
    disabledVouchers: number;
  };
  recentLogins: any[];
  recentSecurityEvents: any[];
};

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [data, setData] = useState<DashboardData | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/dashboard");
        setData(response.data);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Dashboard Error</h2>
        <p>{error || "No dashboard data available."}</p>
      </div>
    );
  }

  const overview = data.overview;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1 }}>
        <header
          style={{
            background: "#ffffff",
            padding: "20px 32px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>
              Dashboard
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#6b7280",
              }}
            >
              Community WiFi Management
            </p>
          </div>

          <div>
            <span style={{ marginRight: "15px" }}>
              {user.name} ({user.role})
            </span>

            <button onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main style={{ padding: "32px" }}>
          <h2>Overview</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Hotspots</span>
              <strong>{overview.totalHotspots}</strong>
            </div>

            <div className="stat-card">
              <span>Online Hotspots</span>
              <strong>
                {overview.onlineHotspots}
              </strong>
            </div>

            <div className="stat-card">
              <span>WiFi Users</span>
              <strong>{overview.totalUsers}</strong>
            </div>

            <div className="stat-card">
              <span>Active Sessions</span>
              <strong>
                {overview.activeSessions}
              </strong>
            </div>

            <div className="stat-card">
              <span>Data Used</span>
              <strong>
                {overview.totalDataUsedMb} MB
              </strong>
            </div>

            <div className="stat-card">
              <span>Active Vouchers</span>
              <strong>
                {overview.activeVouchers}
              </strong>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-panel">
              <h2>Hotspot Status</h2>

              <p>
                Online: {overview.onlineHotspots}
              </p>

              <p>
                Offline: {overview.offlineHotspots}
              </p>

              <p>
                Maintenance:{" "}
                {overview.maintenanceHotspots}
              </p>
            </section>

            <section className="dashboard-panel">
              <h2>Voucher Status</h2>

              <p>
                Active: {overview.activeVouchers}
              </p>

              <p>
                Used: {overview.usedVouchers}
              </p>

              <p>
                Expired: {overview.expiredVouchers}
              </p>

              <p>
                Disabled: {overview.disabledVouchers}
              </p>
            </section>
          </div>

          <section className="dashboard-panel">
            <h2>Recent Login Activity</h2>

            {data.recentLogins.length === 0 ? (
              <p>No login activity.</p>
            ) : (
              data.recentLogins.map((login: any) => (
                <div
                  className="activity-row"
                  key={login.id}
                >
                  <strong>{login.email}</strong>

                  <span>{login.status}</span>

                  <span>
                    {login.ipAddress ||
                      "Unknown IP"}
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="dashboard-panel">
            <h2>Security Events</h2>

            {data.recentSecurityEvents.length ===
            0 ? (
              <p>
                No security events recorded.
              </p>
            ) : (
              data.recentSecurityEvents.map(
                (event: any) => (
                  <div
                    className="activity-row"
                    key={event.id}
                  >
                    <strong>{event.type}</strong>

                    <span>
                      {event.severity}
                    </span>

                    <span>
                      {event.description}
                    </span>
                  </div>
                )
              )
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Hotspots() {
  const [hotspots, setHotspots] = useState<
    Hotspot[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] =
    useState<Hotspot["status"]>("OFFLINE");
  const [maxUsers, setMaxUsers] = useState(50);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  async function loadHotspots() {
    try {
      setLoading(true);

      const response = await api.get("/hotspots");

      setHotspots(response.data.hotspots || []);
      setError("");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load hotspots"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotspots();
  }, []);

  function resetForm() {
    setName("");
    setLocation("");
    setStatus("OFFLINE");
    setMaxUsers(50);
    setEditingId(null);
  }

  function editHotspot(hotspot: Hotspot) {
    setEditingId(hotspot.id);
    setName(hotspot.name);
    setLocation(hotspot.location);
    setStatus(hotspot.status);
    setMaxUsers(hotspot.maxUsers);
  }

  async function submitForm(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      const payload = {
        name,
        location,
        status,
        maxUsers: Number(maxUsers),
      };

      if (editingId) {
        await api.put(
          `/hotspots/${editingId}`,
          payload
        );
      } else {
        await api.post("/hotspots", payload);
      }

      resetForm();
      await loadHotspots();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to save hotspot"
      );
    }
  }

  async function deleteHotspot(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hotspot?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/hotspots/${id}`);
      await loadHotspots();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to delete hotspot"
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1 }}>
        <header
          style={{
            background: "#ffffff",
            padding: "20px 32px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1 style={{ margin: 0 }}>
            Hotspot Management
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginBottom: 0,
            }}
          >
            Manage Community WiFi locations.
          </p>
        </header>

        <main style={{ padding: "32px" }}>
          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          <section
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "10px",
              marginBottom: "24px",
            }}
          >
            <h2>
              {editingId
                ? "Edit Hotspot"
                : "Add Hotspot"}
            </h2>

            <form onSubmit={submitForm}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                <div>
                  <label>Hotspot Name</label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "6px",
                      boxSizing: "border-box",
                    }}
                    placeholder="Soweto Community WiFi"
                  />
                </div>

                <div>
                  <label>Location</label>

                  <input
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "6px",
                      boxSizing: "border-box",
                    }}
                    placeholder="Soweto, Johannesburg"
                  />
                </div>

                <div>
                  <label>Status</label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as Hotspot["status"]
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "6px",
                    }}
                  >
                    <option value="ONLINE">
                      Online
                    </option>

                    <option value="OFFLINE">
                      Offline
                    </option>

                    <option value="MAINTENANCE">
                      Maintenance
                    </option>
                  </select>
                </div>

                <div>
                  <label>Maximum Users</label>

                  <input
                    type="number"
                    min="1"
                    value={maxUsers}
                    onChange={(event) =>
                      setMaxUsers(
                        Number(event.target.value)
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "6px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button type="submit">
                  {editingId
                    ? "Update Hotspot"
                    : "Create Hotspot"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "10px",
            }}
          >
            <h2>Hotspots</h2>

            {loading ? (
              <p>Loading hotspots...</p>
            ) : hotspots.length === 0 ? (
              <p>No hotspots found.</p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Name
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Location
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Max Users
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {hotspots.map(
                      (hotspot) => (
                        <tr key={hotspot.id}>
                          <td
                            style={{
                              padding: "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            {hotspot.name}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            {hotspot.location}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            {hotspot.status}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            {hotspot.maxUsers}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <button
                              onClick={() =>
                                editHotspot(
                                  hotspot
                                )
                              }
                              style={{
                                marginRight:
                                  "8px",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteHotspot(
                                  hotspot.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotspots"
          element={
            <ProtectedRoute>
              <Hotspots />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vouchers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Vouchers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wifi-users"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WifiUsers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Sessions />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Security />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}