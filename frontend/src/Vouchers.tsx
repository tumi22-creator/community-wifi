import { useEffect, useState } from "react";
import api from "./api";

type Hotspot = {
  id: string;
  name: string;
};

type Voucher = {
  id: string;
  code: string;
  duration: number;
  status: "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";
  expiresAt: string | null;
  usedAt: string | null;
  hotspotId: string;
  createdAt: string;
  hotspot?: Hotspot;
};

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const [duration, setDuration] = useState(4);
  const [hotspotId, setHotspotId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const voucherResponse = await api.get("/vouchers");

      const voucherData = voucherResponse.data;

      const loadedVouchers = Array.isArray(voucherData)
        ? voucherData
        : voucherData?.vouchers ||
          voucherData?.data ||
          [];

      setVouchers(loadedVouchers);

      const hotspotResponse = await api.get("/hotspots");

      const hotspotData = hotspotResponse.data;

      const loadedHotspots = Array.isArray(hotspotData)
        ? hotspotData
        : hotspotData?.hotspots ||
          hotspotData?.data ||
          [];

      setHotspots(loadedHotspots);

      if (!hotspotId && loadedHotspots.length > 0) {
        setHotspotId(loadedHotspots[0].id);
      }
    } catch (error: any) {
      console.error("Voucher page API error:", error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        setError("Authentication expired. Please log in again.");
      } else if (status === 403) {
        setError("You are not authorized to access vouchers.");
      } else if (status === 404) {
        setError("Voucher API endpoint was not found.");
      } else {
        setError(
          message ||
            error.message ||
            "Failed to load vouchers"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createVoucher(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!hotspotId) {
      setError("Please select a hotspot.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/vouchers", {
        duration: Number(duration),
        hotspotId,
      });

      await loadData();
    } catch (error: any) {
      console.error("Create voucher error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create voucher"
      );
    } finally {
      setSaving(false);
    }
  }

  async function disableVoucher(id: string) {
    try {
      setError("");

      await api.patch(`/vouchers/${id}/disable`);

      await loadData();
    } catch (error: any) {
      console.error("Disable voucher error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to disable voucher"
      );
    }
  }

  async function deleteVoucher(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this voucher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/vouchers/${id}`);

      await loadData();
    } catch (error: any) {
      console.error("Delete voucher error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete voucher"
      );
    }
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  }

  return (
    <div>
      <header
        style={{
          background: "#ffffff",
          padding: "20px 32px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ margin: 0 }}>
          Voucher Management
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: 0,
          }}
        >
          Generate and manage WiFi access vouchers.
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
          <h2>Generate Voucher</h2>

          <form onSubmit={createVoucher}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label>Hotspot</label>

                <select
                  value={hotspotId}
                  onChange={(event) =>
                    setHotspotId(event.target.value)
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px",
                  }}
                >
                  <option value="">
                    Select hotspot
                  </option>

                  {hotspots.map((hotspot) => (
                    <option
                      key={hotspot.id}
                      value={hotspot.id}
                    >
                      {hotspot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Duration (hours)</label>

                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      Number(event.target.value)
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{ marginTop: "20px" }}
            >
              {saving
                ? "Generating..."
                : "Generate Voucher"}
            </button>
          </form>
        </section>

        <section
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "10px",
          }}
        >
          <h2>Vouchers</h2>

          {loading ? (
            <p>Loading vouchers...</p>
          ) : vouchers.length === 0 ? (
            <p>No vouchers found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Code
                    </th>

                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Hotspot
                    </th>

                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Duration
                    </th>

                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Status
                    </th>

                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Expires
                    </th>

                    <th style={{ textAlign: "left", padding: "12px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id}>
                      <td
                        style={{
                          padding: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                          fontWeight: 700,
                          letterSpacing: "1px",
                        }}
                      >
                        {voucher.code}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {voucher.hotspot?.name ||
                          hotspots.find(
                            (hotspot) =>
                              hotspot.id ===
                              voucher.hotspotId
                          )?.name ||
                          voucher.hotspotId}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {voucher.duration} hours
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {voucher.status}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {formatDate(voucher.expiresAt)}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {voucher.status === "ACTIVE" && (
                          <button
                            onClick={() =>
                              disableVoucher(voucher.id)
                            }
                            style={{
                              marginRight: "8px",
                            }}
                          >
                            Disable
                          </button>
                        )}

                        <button
                          onClick={() =>
                            deleteVoucher(voucher.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}