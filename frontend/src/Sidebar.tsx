import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Hotspots", path: "/hotspots", icon: "◉" },
    { name: "Vouchers", path: "/vouchers", icon: "▣" },
    { name: "WiFi Users", path: "/wifi-users", icon: "♟" },
    { name: "Usage Sessions", path: "/sessions", icon: "◷" },
    { name: "Security", path: "/security", icon: "⚠" },
  ];

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#111827",
        color: "#ffffff",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "32px", padding: "0 12px" }}>
        <h2 style={{ margin: 0 }}>Community WiFi</h2>
        <p
          style={{
            margin: "6px 0 0",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          Management System
        </p>
      </div>

      <nav>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              marginBottom: "6px",
              borderRadius: "8px",
              textDecoration: "none",
              color: isActive ? "#ffffff" : "#9ca3af",
              background: isActive ? "#2563eb" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}