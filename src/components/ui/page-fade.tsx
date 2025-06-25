import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Simple page transition wrapper with scroll-to-top functionality
interface PageTransitionProps {
  children: React.ReactNode
}

export const PageFade: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')
  
  useEffect(() => {
    // Always scroll to top when location changes
    window.scrollTo(0, 0)
    
    // Check if navigation has a smooth transition state
    const smoothTransition = location.state && location.state.smoothTransition
    
    if (location !== displayLocation) {
      if (smoothTransition) {
        // Start fade out
        setTransitionStage('fadeOut')
        
        // After fade out completes, update content and fade in
        const timer = setTimeout(() => {
          setDisplayLocation(location)
          setTransitionStage('fadeIn')
        }, 150) // Reduced timeout for smoother transition
        
        return () => clearTimeout(timer)
      } else {
        // Immediate update for direct navigation
        setDisplayLocation(location)
        setTransitionStage('fadeIn')
      }
    }
  }, [location, displayLocation])

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        minHeight: transitionStage === 'fadeOut' ? '100vh' : 'auto'
      }}
    >
      {React.cloneElement(children as React.ReactElement, { key: displayLocation.pathname })}
    </div>
  )
}
