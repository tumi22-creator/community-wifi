import { useEffect, useState } from "react";
import api from "./api";

type Hotspot = {
  id: string;
  name: string;
};

type WifiUser = {
  id: string;
  name: string;
  email?: string | null;
  device?: string | null;
  status: "ACTIVE" | "BLOCKED";
  hotspotId: string;
  hotspot?: Hotspot;
  createdAt: string;
};

export default function WifiUsers() {
  const [users, setUsers] = useState<WifiUser[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [device, setDevice] = useState("");
  const [hotspotId, setHotspotId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [usersResponse, hotspotsResponse] = await Promise.all([
        api.get("/wifi-users"),
        api.get("/hotspots"),
      ]);

     const usersData = Array.isArray(usersResponse.data)
  ? usersResponse.data
  : usersResponse.data.data || [];

const hotspotsData = Array.isArray(hotspotsResponse.data)
  ? hotspotsResponse.data
  : hotspotsResponse.data.data || [];

setUsers(usersData);
setHotspots(hotspotsData);

if (!hotspotId && hotspotsData.length > 0) {
  setHotspotId(hotspotsData[0].id);
}
}catch (error) {
      console.error("Failed to load WiFi users:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setDevice("");
    setEditingId(null);

    if (hotspots.length > 0) {
      setHotspotId(hotspots[0].id);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !hotspotId) {
      alert("Name and hotspot are required.");
      return;
    }

    try {
      const data = {
        name: name.trim(),
        email: email.trim() || null,
        device: device.trim() || null,
        hotspotId,
      };

      if (editingId) {
        await api.put(`/wifi-users/${editingId}`, data);
      } else {
        await api.post("/wifi-users", data);
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to save WiFi user:", error);
      alert("Failed to save WiFi user.");
    }
  };

  const handleEdit = (user: WifiUser) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email || "");
    setDevice(user.device || "");
    setHotspotId(user.hotspotId);
  };

  const handleBlockToggle = async (user: WifiUser) => {
    try {
      if (user.status === "ACTIVE") {
        await api.patch(`/wifi-users/${user.id}/block`);
      } else {
        await api.patch(`/wifi-users/${user.id}/unblock`);
      }

      await loadData();
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert("Failed to update user status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this WiFi user?")) {
      return;
    }

    try {
      await api.delete(`/wifi-users/${id}`);

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      console.error("Failed to delete WiFi user:", error);
      alert("Failed to delete WiFi user.");
    }
  };

  return (
    <div>
      <h1>WiFi Users</h1>

      <p style={{ color: "#666" }}>
        Manage users connected to your community WiFi hotspots.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "600px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="text"
          placeholder="Device (optional)"
          value={device}
          onChange={(event) => setDevice(event.target.value)}
        />

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

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit">
            {editingId ? "Update User" : "Add User"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
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
              <th>Name</th>
              <th>Email</th>
              <th>Device</th>
              <th>Hotspot</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const hotspot = hotspots.find(
                (item) => item.id === user.hotspotId
              );

              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.device || "-"}</td>
                  <td>{hotspot?.name || "-"}</td>
                  <td>{user.status}</td>

                  <td>
                    <button onClick={() => handleEdit(user)}>
                      Edit
                    </button>{" "}

                    <button onClick={() => handleBlockToggle(user)}>
                      {user.status === "ACTIVE" ? "Block" : "Unblock"}
                    </button>{" "}

                    <button onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <p style={{ marginTop: "20px" }}>
            No WiFi users found.
          </p>
        )}
      </div>
    </div>
  );
}