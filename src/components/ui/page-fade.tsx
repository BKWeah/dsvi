import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Simple page transition wrapper without framer-motion
interface PageTransitionProps {
  children: React.ReactNode
}

export const PageFade: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')
  
  useEffect(() => {
    // Check if navigation has a smooth transition state
    const smoothTransition = location.state && location.state.smoothTransition
    
    if (location !== displayLocation && smoothTransition) {
      setTransitionStage('fadeOut')
      setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('fadeIn')
      }, 300) // Match this with the transition duration
    } else {
      setDisplayLocation(location)
      setTransitionStage('fadeIn')
    }
  }, [location, displayLocation])

  return (
    <div
      className={`transition-opacity duration-300 ${
        transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
