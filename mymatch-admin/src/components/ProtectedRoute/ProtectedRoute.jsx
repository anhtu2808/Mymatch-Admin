import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  if (!token && false) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute