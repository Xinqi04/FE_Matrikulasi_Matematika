import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ role, children }) => {
  const token = sessionStorage.getItem("token")
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")

  if (!token) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
