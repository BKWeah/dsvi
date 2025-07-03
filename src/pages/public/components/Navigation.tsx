import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { departments } from '@/data/teamData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  // No props needed for navigation as it will use react-router-dom directly
}

export const Navigation: React.FC<NavigationProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true); // New state for hero intersection
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Updated navigation structure with dynamic dropdown sections
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { 
      label: 'Team', 
      href: '/team',
      dropdownItems: departments.map(dept => ({
        label: dept.name,
        href: `/team/${dept.name.toLowerCase()}`
      }))
    },
    // { label: 'How It Works', href: '/how-it-works' }, // Assuming this will be a separate page
    { label: 'Packages', href: '/packages' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' }
  ];

  useEffect(() => {
    // Initial animation
    const tl = gsap.timeline();
    
    gsap.set([logoRef.current, menuItemsRef.current, actionsRef.current], {
      opacity: 0,
      y: -20
    });

    tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .to(menuItemsRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
      .to(actionsRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");

    // Scroll detection (still needed for the main landing page, but not for internal navigation)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for hero section (only if on the home page)
    // This logic might need to be moved to the Index component if heroRef is only relevant there
    // For now, removing heroRef prop and related logic from Navigation
    // const observer = new IntersectionObserver(
    //   ([entry]) => {
    //     setIsOverHero(entry.isIntersecting);
    //   },
    //   {
    //     root: null, // viewport
    //     rootMargin: '0px',
    //     threshold: 0.1, // Trigger when 10% of the hero section is visible
    //   }
    // );

    // if (heroRef.current) {
    //   observer.observe(heroRef.current);
    // }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // if (heroRef.current) {
      //   observer.unobserve(heroRef.current);
      // }
    };
  }, []); // Removed heroRef from dependency array

  // Determine text color and background based on scroll and hero intersection
  // This logic might need to be simplified or moved if heroRef is removed
  const navBackgroundClass = !isScrolled 
    ? 'bg-white backdrop-blur-md shadow-lg border-b border-gray-200' 
    : 'bg-transparent backdrop-blur-md border-b-transparent'; // Simplified, assuming no hero intersection logic here

  const textColorClass = `${!isScrolled ? 'text-gray-900' : 'text-gray-900'} transition-colors duration-300`; // Simplified
  
  const subTextColorClass = `${!isScrolled ? 'text-gray-500' : 'text-gray-500'} transition-colors duration-300`; // Simplified
  
  const navItemColorClass = `${!isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`; // Simplified
  
  const loginButtonClass = `${!isScrolled ? 'hover:scale-105 transition-transform' : 'hover:scale-105 transition-transform'} transition-colors duration-300`; // Simplified

  const mobileMenuButtonClass = `${!isScrolled ? 'stroke-gray-900 fill-none' : 'stroke-gray-900 fill-none'} transition-colors duration-300`; // Simplified

  const mobileMenuBorderClass = `${!isScrolled ? 'border-gray-200' : 'border-gray-200'} transition-colors duration-300`; // Simplified

  const mobileLoginButtonClass = `${!isScrolled ? '' : ''} transition-colors duration-300`; // Simplified

  const dropdownMenuTriggerClass = `${navItemColorClass} font-medium hover:scale-105 transform flex items-center gap-1 cursor-pointer`;

  return (
    <nav 
      ref={navRef} 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackgroundClass}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div ref={logoRef}>
            <Link to="/" className="flex items-center space-x-3 group">
              <img src="/updates_assets/DSVI Official Logo.png" alt="DSVI Official Logo" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              <div>
                <span className={`text-xl font-black ${textColorClass}`}>DSVI</span>
                <p className={`text-xs ${subTextColorClass} -mt-1`}>Digital School Visibility Initiative</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div ref={menuItemsRef} className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              item.dropdownItems ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={dropdownMenuTriggerClass}>
                    {item.label} <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="bg-white shadow-lg rounded-md p-2 min-w-[150px]">
                    {item.dropdownItems.map((subItem) => (
                      <DropdownMenuItem 
                        key={subItem.label}
                        onClick={() => {
                          setIsMenuOpen(false); // Close mobile menu on click
                          navigate(subItem.href, { state: { smoothTransition: true } });
                        }}
                        className="hover:bg-blue-50 cursor-pointer"
                      >
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  state={{ smoothTransition: true }}
                  className={`${navItemColorClass} font-medium hover:scale-105 transform`}
                  onClick={() => setIsMenuOpen(false)} // Close mobile menu on click
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
          
          {/* Desktop Actions */}
          <div ref={actionsRef} className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className={loginButtonClass}>
              Admin Planet
            </Button>
            <Link to="/register" state={{ smoothTransition: true }}>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Onboard Your School
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div
            className={`lg:hidden hover:scale-110 transition-transform cursor-pointer`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen 
              ? <X className={`h-6 w-6 ${mobileMenuButtonClass}`} /> 
              : <Menu className={`h-6 w-6 ${mobileMenuButtonClass}`} />}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden mt-4 pb-4 border-t animate-in slide-in-from-top-5 duration-300 ${mobileMenuBorderClass}`}>
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                item.dropdownItems ? (
                  <div key={item.label} className="space-y-2">
                    <div className={`${navItemColorClass} font-medium`}>
                      {item.label}
                    </div>
                    <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                      {item.dropdownItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          state={{ smoothTransition: true }}
                          className={`${navItemColorClass} text-sm block`}
                          onClick={() => setIsMenuOpen(false)} // Close mobile menu on click
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    state={{ smoothTransition: true }}
                    className={`${navItemColorClass} font-medium text-left`}
                    onClick={() => setIsMenuOpen(false)} // Close mobile menu on click
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/login');
                }} className={`w-full ${mobileLoginButtonClass}`}>
                  Admin Planet
                </Button>
                <Link to="/register" className="w-full" state={{ smoothTransition: true }}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600">
                    Onboard Your School
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
