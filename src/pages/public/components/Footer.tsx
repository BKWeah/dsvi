import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageSquare, Globe, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleSmoothScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img src="/updates_assets/DSVI Official Logo.png" alt="DSVI Official Logo" className="h-10 w-10 object-contain" />
              <div>
                <span className="text-xl font-bold">DSVI</span>
                <p className="text-xs text-gray-400 -mt-1">Digital School Visibility Initiative</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering Liberian educational institutions with modern digital solutions for enhanced visibility and community engagement.
            </p>
            <div className="flex space-x-4">
              <a href="https://wa.me/2317739102999" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare className="h-5 w-5" />
              </a>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
              <a href="tel:+2317739102999" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="h-5 w-5" />
              </a>
              <a href="https://libdsvi.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Main Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Main Pages</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#home')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#about')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#team')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Team
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#how-it-works')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#packages')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Website Packages
                </button>
              </li>
            </ul>
          </div>
          
          {/* Services & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services & Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#testimonials')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSmoothScroll('#faq')}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white cursor-pointer transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white cursor-pointer transition-colors">
                  Register Your School
                </Link>
              </li>
              <li className="text-green-400 font-medium">
                24/7 Support Available
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@libdsvi.com" className="hover:text-white transition-colors">
                  info@libdsvi.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <div className="space-y-1">
                  <a href="tel:+2317739102999" className="hover:text-white transition-colors block">
                    +231-77 391 0299
                  </a>
                  <a href="tel:+2315551827422" className="hover:text-white transition-colors block">
                    +231-55 518 2742
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <a href="https://wa.me/2317739102999" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Support (+231-77 391 0299)
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                <div>
                  <p>DSVI Office</p>
                  <p>Outland Community, Opp. LTC Compound</p>
                  <p>Paynesville, Montserrado County</p>
                  <p>Republic of Liberia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-12 text-center text-gray-400">
          <div className="mb-4">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
              Onboard Your School Today
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <p>&copy; 2025 Digital School Visibility Initiative (DSVI). All rights reserved.</p>
          <p className="text-sm mt-2">Empowering Liberian education through digital innovation • Serving all 15 counties of Liberia</p>
        </div>
      </div>
    </footer>
  );
};
