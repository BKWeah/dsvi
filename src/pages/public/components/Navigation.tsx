import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onLoginClick: () => void;
  heroRef: React.RefObject<HTMLElement>; // Add heroRef prop
}

export const Navigation: React.FC<NavigationProps> = ({ onLoginClick, heroRef }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true); // New state for hero intersection
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Updated navigation structure with dropdown sections
  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { 
      label: 'Team', 
      href: '#team',
      dropdownItems: [
        { label: 'Leadership', href: '#leadership' },
        { label: 'Operations', href: '#operations' },
        { label: 'IT', href: '#it' },
        { label: 'Support', href: '#support' },
        { label: 'Media', href: '#media' }
      ]
    },
    // { label: 'How It Works', href: '#how-it-works' },
    { label: 'Packages', href: '#packages' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
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

    // Scroll detection
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for hero section
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverHero(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the hero section is visible
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, [heroRef]); // Add heroRef to dependency array

  const handleSmoothScroll = (href: string) => {
    setIsMenuOpen(false); // Close mobile menu on click

    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        // If not on home page, navigate to home and then scroll
        navigate(`/${href}`, { state: { smoothTransition: true } }); // Pass state for smooth transition
      } else {
        // If already on home page, just scroll
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (href.startsWith('/')) {
      // Handle route navigation for non-hash links with smooth transition
      navigate(href, { state: { smoothTransition: true } });
    }
  };

  // Determine text color and background based on scroll and hero intersection
  const navBackgroundClass = !isScrolled 
    ? 'bg-white backdrop-blur-md shadow-lg border-b border-gray-200' 
    : (isOverHero 
        ? 'bg-transparent backdrop-blur-md border-b-transparent' 
        : 'bg-transparent backdrop-blur-md border-b-transparent');

  const textColorClass = `${!isScrolled ? 'text-gray-900' : (isOverHero ? 'text-white' : 'text-gray-900')} transition-colors duration-300`;
  
  const subTextColorClass = `${!isScrolled ? 'text-gray-500' : (isOverHero ? 'text-gray-200' : 'text-gray-500')} transition-colors duration-300`;
  
  const navItemColorClass = `${!isScrolled ? 'text-gray-600 hover:text-blue-600' : (isOverHero ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-blue-600')} transition-colors duration-300`;
  
  const loginButtonClass = `${!isScrolled ? 'hover:scale-105 transition-transform' : (isOverHero ? 'text-white hover:bg-white/20' : 'hover:scale-105 transition-transform')} transition-colors duration-300`;

  const mobileMenuButtonClass = `${!isScrolled ? 'stroke-gray-900 fill-none' : (isOverHero ? 'stroke-white fill-none' : 'stroke-gray-900 fill-none')} transition-colors duration-300`;

  const mobileMenuBorderClass = `${!isScrolled || (!isOverHero && isScrolled)
    ? 'border-gray-200' // White background states
    : 'border-b-transparent'} transition-colors duration-300`; // Transparent background states

  const mobileLoginButtonClass = `${!isScrolled || (!isOverHero && isScrolled)
    ? '' // Default for outline button (inherits from Button component)
    : 'text-white border-gray-700 hover:bg-white/20'} transition-colors duration-300`;

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
                        onClick={() => handleSmoothScroll(subItem.href)}
                        className="hover:bg-blue-50 cursor-pointer"
                      >
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleSmoothScroll(item.href)}
                  className={`${navItemColorClass} font-medium hover:scale-105 transform`}
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
          
          {/* Desktop Actions */}
          <div ref={actionsRef} className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" onClick={onLoginClick} className={loginButtonClass}>
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
                        <button
                          key={subItem.label}
                          onClick={() => handleSmoothScroll(subItem.href)}
                          className={`${navItemColorClass} text-sm block`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => handleSmoothScroll(item.href)}
                    className={`${navItemColorClass} font-medium text-left`}
                  >
                    {item.label}
                  </button>
                )
              ))}
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" onClick={onLoginClick} className={`w-full ${mobileLoginButtonClass}`}>
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
