import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-1 border-b border-white/5 flex justify-between items-center bg-void-black/80 backdrop-blur-md">
        <div className="w-1/3 flex justify-start items-center">
          <a href="#" className="flex items-center gap-3 hover-trigger group">
            <img src="/logomain.png?v=2" alt="Voidwallz Logo" className="w-11 h-11 object-contain group-hover:scale-105 transition-transform duration-500 ease-out" />
            <h1 className="hidden sm:block text-base md:text-lg font-light tracking-tighter font-serif italic text-white select-none">
              voidwallz
            </h1>
          </a>
        </div>
        <div className="w-1/3 flex justify-center">
          <nav className="hidden md:flex space-x-8 text-[11px] uppercase tracking-[0.2em] opacity-60">
            <a
              href="#"
              className="hover:opacity-100 text-white opacity-100 transition-opacity"
            >
              Home
            </a>
            <a href="#desktop" className="hover:opacity-100 transition-opacity">
              Desktop
            </a>
            <a href="#phone" className="hover:opacity-100 transition-opacity">
              Phone
            </a>
          </nav>
        </div>
        <div className="w-1/3 flex justify-end md:hidden">
          <button 
            onClick={() => setIsOpen(true)}
            className="text-white opacity-60 hover:opacity-100"
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="hidden w-1/3 flex justify-end md:flex">
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-void-black/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white opacity-60 hover:opacity-100 p-2"
            >
              <X size={32} />
            </button>
            <nav className="flex flex-col space-y-8 text-center text-sm uppercase tracking-[0.3em] opacity-80">
              <a
                href="#"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-100 text-white transition-opacity"
              >
                Home
              </a>
              <a 
                href="#desktop" 
                onClick={() => setIsOpen(false)}
                className="hover:opacity-100 transition-opacity"
              >
                Desktop
              </a>
              <a 
                href="#phone" 
                onClick={() => setIsOpen(false)}
                className="hover:opacity-100 transition-opacity"
              >
                Phone
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
