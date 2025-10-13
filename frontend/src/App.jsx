import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

// Animation Components
import LoadingScreen from "./components/LoadingScreen";
import PageTransition from "./components/PageTransition";

// Layout Components
import AboutPreview from "./components/AboutPreview";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TransparentNavbar from "./components/TransparentNavbar";

import ScrollToTop from "./components/ScrollToTop";

// Pages
import LatestCollection1 from "./components/LatestCollection1";
import About from "./pages/About";
import CategoryPage from "./pages/CategoryPage";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import InvestorProduct from "./pages/InvestorProduct";
import Investors from "./pages/Investors";
import Login from "./pages/Login";
import Photo from "./pages/Photo";
import ProfileEdit from "./pages/ProfileEdit";
import Services from "./pages/Services";

const App = () => {
  const location = useLocation();
  const isContactPage = location.pathname === "/contact";
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Page change loading effect
  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen 
        isLoading={isLoading} 
        onComplete={() => setShowContent(true)} 
      />

      {/* Main App Content */}
      <AnimatePresence mode="wait">
        {showContent && (
          <PageTransition key={location.pathname}>
            {/* ✅ Scroll to top on route change */}
            <ScrollToTop />
            
            {/* ✅ Toast Notification */}
            <ToastContainer
              position="top-center"
              autoClose={1000}
              limit={1}
              hideProgressBar
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
            />

            {/* ✅ Conditional Navbar - TransparentNavbar for all pages */}
            <TransparentNavbar />

            {/* ✅ Main Routes */}
            <div className="px-0">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/investors" element={<Investors />} />
                  <Route path="/investorproduct/:id?" element={<InvestorProduct />} />
                  <Route path="/profile-edit" element={<ProfileEdit />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/aboutpreview" element={<AboutPreview showViewMore={false} />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/category/:categoryName" element={<CategoryPage />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/Latestcollection1" element={<LatestCollection1 />} />
                  <Route path="/photo" element={<Photo />} />
                </Routes>
              </AnimatePresence>

              <Footer />
            </div>
          </PageTransition>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
