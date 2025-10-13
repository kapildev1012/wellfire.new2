import React, { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import Navbar from "./Navbar";

const TransparentNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const hideLogoPages = ["/services", "/investors", "/photo", "/Latestcollection1"];
  const shouldHideLogo = hideLogoPages.includes(location.pathname);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll detection - for all pages (all start transparent)
  useEffect(() => {
    // Reset scroll state when page changes
    setIsScrolled(false);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      if (isHomePage) {
        // For home page: transparent during Hero (100vh), then black
        const heroHeight = window.innerHeight; // 100vh
        setIsScrolled(scrollPosition > heroHeight * 0.9); // Trigger at 90% of Hero height
      } else {
        // For other pages: transparent at top, black after scrolling 50px
        setIsScrolled(scrollPosition > 50); // Trigger after 50px scroll
      }
    };

    // Initial scroll check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/LatestCollection1", label: "Projects" },
    { to: "/investors", label: "Investors" },
    { to: "/AboutPreview", label: "About" },
    { to: "/contact", label: "Contact Us" },
  ];

  // Use regular Navbar for mobile devices
  if (isMobile) {
    return <Navbar />;
  }

  return (
    <>
      {/* Transparent Navbar - Desktop Only */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-8 md:px-12 py-2 md:py-3 transition-all duration-500 ${
        isScrolled
          ? 'bg-black shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo - Hidden on Services and Investors pages */}
          {!shouldHideLogo && (
            <Link
              to="/"
              className="flex items-center h-20 w-auto transition-all duration-300 hover:opacity-90"
              onClick={() => window.scrollTo(0, 0)}
            >
              <img
                src={logo}
                alt="Wellfire Logo"
                className="h-full w-auto object-contain"
              />
            </Link>
          )}

          {/* Spacer for logo when hidden */}
          {shouldHideLogo && <div className="h-16 w-auto" />}

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium text-white hover:text-gray-300 transition-all duration-500 relative group ${
                  !isScrolled ? 'drop-shadow-lg' : ''
                }`}
                style={{
                  textShadow: !isScrolled ? (isHomePage ? '2px 2px 4px rgba(0,0,0,0.9)' : '1px 1px 2px rgba(0,0,0,0.6)') : 'none'
                }}
                onClick={() => window.scrollTo(0, 0)}
              >
                {label}
                {/* Hover underline effect */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden p-2 text-white rounded transition-all duration-300 hover:bg-white/20 ${
              !isScrolled ? 'drop-shadow-lg' : ''
            }`}
          >
            <FaBars className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-90"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full bg-black text-white z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with Wellfire branding - Hidden */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white tracking-wide opacity-0">Wellfire</span>
            <span className="text-sm text-gray-400">Menu</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col p-4">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => {
                setMobileOpen(false);
                window.scrollTo(0, 0);
              }}
              className="flex items-center py-3 px-3 rounded mb-2 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default TransparentNavbar;
