import React from 'react'
import { Spin } from 'antd'
import './Preloading.css'

export const Preloading = ({ isLoading, tip = 'Loading...' }) => {
  if (!isLoading) return null

  return (
    <div className="preloading-overlay">
      <Spin size="large" tip={tip} />
    </div>
  )
}
