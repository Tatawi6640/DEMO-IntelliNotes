import React from 'react'
import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div>
      <div className="publicShell">
        <div className="container" style={{ padding: '28px 0' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

