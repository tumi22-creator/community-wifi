import { useEffect, useState } from "react";
import api from "./api";

type Hotspot = {
  id: string;
  name: string;
};

type WifiUser = {
  id: string;
  name: string;
};

type Session = {
  id: string;
  wifiUserId: string;
  hotspotId: string;
  device?: string | null;
  ipAddress?: string | null;
  startTime: string;
  endTime?: string | null;
  dataUsedMb: number;
};

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<WifiUser[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const [wifiUserId, setWifiUserId] = useState("");
  const [hotspotId, setHotspotId] = useState("");
  const [device, setDevice] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [dataUsedMb, setDataUsedMb] = useState("0");

  const loadData = async () => {
    try {
      const [sessionsResponse, usersResponse, hotspotsResponse] =
        await Promise.all([
          api.get("/sessions"),
          api.get("/wifi-users"),
          api.get("/hotspots"),
        ]);

      const sessionsData = Array.isArray(sessionsResponse.data)
  ? sessionsResponse.data
  : sessionsResponse.data.sessions ||
    sessionsResponse.data.data ||
    [];

const usersData = Array.isArray(usersResponse.data)
  ? usersResponse.data
  : usersResponse.data.users ||
    usersResponse.data.data ||
    [];

const hotspotsData = Array.isArray(hotspotsResponse.data)
  ? hotspotsResponse.data
  : hotspotsResponse.data.hotspots ||
    hotspotsResponse.data.data ||
    [];

      setSessions(sessionsData);
      setUsers(usersData);
      setHotspots(hotspotsData);

      if (!wifiUserId && usersData.length > 0) {
        setWifiUserId(usersData[0].id);
      }

      if (!hotspotId && hotspotsData.length > 0) {
        setHotspotId(hotspotsData[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setDevice("");
    setIpAddress("");
    setDataUsedMb("0");
  };

  const handleStartSession = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wifiUserId || !hotspotId) {
      alert("Select a WiFi user and hotspot.");
      return;
    }

    try {
      await api.post("/sessions/start", {
        wifiUserId,
        hotspotId,
        device: device.trim() || null,
        ipAddress: ipAddress.trim() || null,
      });

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session.");
    }
  };

  const handleUpdateUsage = async (id: string) => {
    const value = Number(dataUsedMb);

    if (Number.isNaN(value) || value < 0) {
      alert("Enter a valid data usage amount.");
      return;
    }

    try {
      await api.patch(`/sessions/${id}/usage`, {
        dataUsedMb: value,
      });

      await loadData();
    } catch (error) {
      console.error("Failed to update usage:", error);
      alert("Failed to update usage.");
    }
  };

  const handleEndSession = async (id: string) => {
    if (!window.confirm("End this session?")) {
      return;
    }

    try {
      await api.patch(`/sessions/${id}/end`);
      await loadData();
    } catch (error) {
      console.error("Failed to end session:", error);
      alert("Failed to end session.");
    }
  };

  const getUserName = (id: string) => {
    return users.find((user) => user.id === id)?.name || "Unknown";
  };

  const getHotspotName = (id: string) => {
    return hotspots.find((hotspot) => hotspot.id === id)?.name || "Unknown";
  };

  return (
    <div>
      <h1>Usage Sessions</h1>

      <p style={{ color: "#666" }}>
        Monitor active and completed WiFi usage sessions.
      </p>

      <form
        onSubmit={handleStartSession}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "600px",
          marginBottom: "30px",
        }}
      >
        <select
          value={wifiUserId}
          onChange={(event) => setWifiUserId(event.target.value)}
        >
          <option value="">Select WiFi user</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={hotspotId}
          onChange={(event) => setHotspotId(event.target.value)}
        >
          <option value="">Select hotspot</option>

          {hotspots.map((hotspot) => (
            <option key={hotspot.id} value={hotspot.id}>
              {hotspot.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Device (optional)"
          value={device}
          onChange={(event) => setDevice(event.target.value)}
        />

        <input
          type="text"
          placeholder="IP address (optional)"
          value={ipAddress}
          onChange={(event) => setIpAddress(event.target.value)}
        />

        <button type="submit">Start Session</button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>User</th>
              <th>Hotspot</th>
              <th>Device</th>
              <th>IP Address</th>
              <th>Started</th>
              <th>Ended</th>
              <th>Data Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => {
              const active = !session.endTime;

              return (
                <tr key={session.id}>
                  <td>{getUserName(session.wifiUserId)}</td>
                  <td>{getHotspotName(session.hotspotId)}</td>
                  <td>{session.device || "-"}</td>
                  <td>{session.ipAddress || "-"}</td>

                  <td>
                    {new Date(session.startTime).toLocaleString()}
                  </td>

                  <td>
                    {session.endTime
                      ? new Date(session.endTime).toLocaleString()
                      : "-"}
                  </td>

                  <td>{session.dataUsedMb} MB</td>

                  <td>{active ? "ACTIVE" : "ENDED"}</td>

                  <td>
                    {active && (
                      <>
                        <button
                          onClick={() => handleUpdateUsage(session.id)}
                        >
                          Update Usage
                        </button>{" "}

                        <button
                          onClick={() => handleEndSession(session.id)}
                        >
                          End Session
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sessions.length === 0 && (
          <p style={{ marginTop: "20px" }}>
            No usage sessions found.
          </p>
        )}
      </div>
    </div>
  );
}