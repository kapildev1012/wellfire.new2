import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Using external video URL to bypass Git LFS issue
const heroVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const Hero = () => {
  const videoRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isTouchDevice = "ontouchstart" in window;
      setIsMobile(width < 768 || isTouchDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      console.log('Video loaded successfully');
    };
    
    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      console.log('Video can play');
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      setIsVideoLoaded(true); // Show video even if there's an error
    };

    video.addEventListener("loadeddata", handleLoadedData);

    return () => video.removeEventListener("loadeddata", handleLoadedData);
  }, []);

  // Handle video and text timing - Fixed syntax error
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;

      // Fixed the visibility ranges syntax
      const shouldShow =
        (t >= 14.7 && t <= 37) || (t >= 42 && t <= 62.7) ;

      if (shouldShow !== showText) {
        setShowText(shouldShow);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [showText]);

  return (
    <div
      className="w-full"
      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "800" }}
    >
      {/* Full Screen Video Background */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-full overflow-hidden bg-black"
        style={{ 
          height: isMobile ? '30vh' : '100vh',
          margin: 0,
          padding: 0,
     
         
        }}
      >
        {/* Loading placeholder */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="animate-pulse text-white text-lg">
              Loading...
            </div>
          </div>
        )}

        {/* Full Screen Video */}
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          poster=""
          className={`absolute inset-0 w-full h-full object-cover ${
            !isVideoLoaded ? "hidden" : ""
          }`}
          style={{
            margin: 0,
            padding: 0,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none"></div>

        {/* Content Overlay - Using timing logic (Hidden on mobile) */}
        <AnimatePresence>
          {showText && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="text-center text-white uppercase tracking-wider max-w-4xl mx-auto">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-3xl sm:text-4xl md:text-4xl lg:text-6xl text-center mb-6 sm:mb-8 max-w-7xl leading-tight"
                  style={{ textShadow: "4px 4px 8px rgba(0,0,0,0.8)" }}
                >
                  
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className=" sm:text-lg md:text-lg lg:text-sm text-center mb-6 sm:mb-10 max-w-6xl "
                  style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.8)" }}
                >
                 
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.section>
    </div>
  );
};

export default Hero;