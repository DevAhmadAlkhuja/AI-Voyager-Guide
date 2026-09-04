import { Navigate } from "react-router-dom";

const AdminPanel = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return <Navigate to="/admin" replace />;
};

export default AdminPanel;
