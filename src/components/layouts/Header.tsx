import React, { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        {/* โลโก้ */}
        <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
          MyBrand
        </a>

        {/* เมนู Desktop */}
        <nav className="hidden md:flex items-center gap-10 text-gray-700 font-medium text-lg">
          <a href="#" className="hover:text-blue-600 transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600 hover:after:w-full after:transition-all after:duration-300">
            Home
          </a>

          {/* Products (มีเมนูย่อย) */}
          <div className="relative group">
            <button
              className="inline-flex items-center gap-1 hover:text-blue-600 transition-all duration-200 focus:outline-none hover:scale-105"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              Products
              <svg width="16" height="16" viewBox="0 0 20 20" className="mt-[2px] transition-transform duration-200 group-hover:rotate-180">
                <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            {/* Dropdown */}
            <div
              className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100
                         absolute left-0 top-full mt-4 min-w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-lg shadow-2xl transition-all
                         duration-200 ease-out transform group-hover:translate-y-0 translate-y-2"
              role="menu"
            >
              <div className="py-3">
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">All Products</a>
                <hr className="my-2 border-gray-100" />
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">New Arrivals</a>
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Best Sellers</a>
                <div className="px-5 py-2 text-xs uppercase text-gray-400 font-semibold tracking-wider">Categories</div>
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Accessories</a>
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Apparel</a>
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Gadgets</a>
              </div>
            </div>
          </div>

          {/* Services (มีเมนูย่อย) */}
          <div className="relative group">
            <button
              className="inline-flex items-center gap-1 hover:text-blue-600 transition-all duration-200 focus:outline-none hover:scale-105"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              Services
              <svg width="16" height="16" viewBox="0 0 20 20" className="mt-[2px] transition-transform duration-200 group-hover:rotate-180">
                <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <div
              className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100
                         absolute left-0 top-full mt-4 min-w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-lg shadow-2xl transition-all
                         duration-200 ease-out transform group-hover:translate-y-0 translate-y-2"
              role="menu"
            >
              <div className="py-3">
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Consulting</a>
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Customization</a>
                <a href="#" className="block px-5 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-lg mx-2">Support</a>
              </div>
            </div>
          </div>

          <a href="#" className="hover:text-blue-600 transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600 hover:after:w-full after:transition-all after:duration-300">
            About
          </a>
          <a href="#" className="hover:text-blue-600 transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600 hover:after:w-full after:transition-all after:duration-300">
            Contact
          </a>
        </nav>

        {/* ปุ่ม Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-6 py-3 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium text-base">
            Login
          </button>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium text-base">
            Sign Up
          </button>
        </div>

        {/* Hamburger (Mobile) */}
        <button
          className="md:hidden text-gray-700 hover:text-blue-600 transition-all duration-200 hover:scale-110"
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform duration-200">
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* เมนู Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-2xl border-t border-gray-100 animate-slideDown">
          <nav className="flex flex-col px-6 py-4 text-gray-700 font-medium">
            <a href="#" className="py-3 hover:text-blue-600 transition-all duration-200 hover:translate-x-2 border-b border-gray-100">Home</a>

            {/* Products (Accordion) */}
            <button
              className="py-3 flex items-center justify-between hover:text-blue-600 transition-all duration-200 border-b border-gray-100"
              onClick={() => setOpenSub(openSub === "products" ? null : "products")}
              aria-expanded={openSub === "products"}
            >
              <span>Products</span>
              <svg width="20" height="20" viewBox="0 0 20 20" className={`transition-transform duration-300 ${openSub === "products" ? "rotate-180" : ""}`}>
                <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {openSub === "products" && (
              <div className="pl-4 pb-3 space-y-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg my-2 py-2 animate-slideDown">
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">All Products</a>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">New Arrivals</a>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Best Sellers</a>
                <div className="pt-2 text-xs uppercase text-gray-400 font-semibold tracking-wider">Categories</div>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Accessories</a>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Apparel</a>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Gadgets</a>
              </div>
            )}

            {/* Services (Accordion) */}
            <button
              className="py-3 flex items-center justify-between hover:text-blue-600 transition-all duration-200 border-b border-gray-100"
              onClick={() => setOpenSub(openSub === "services" ? null : "services")}
              aria-expanded={openSub === "services"}
            >
              <span>Services</span>
              <svg width="20" height="20" viewBox="0 0 20 20" className={`transition-transform duration-300 ${openSub === "services" ? "rotate-180" : ""}`}>
                <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {openSub === "services" && (
              <div className="pl-4 pb-3 space-y-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg my-2 py-2 animate-slideDown">
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Consulting</a>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Customization</a>
                <a href="#" className="block py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-2">Support</a>
              </div>
            )}

            <a href="#" className="py-3 hover:text-blue-600 transition-all duration-200 hover:translate-x-2 border-b border-gray-100">About</a>
            <a href="#" className="py-3 hover:text-blue-600 transition-all duration-200 hover:translate-x-2 border-b border-gray-100">Contact</a>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="px-4 py-3 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105 font-medium">
                Login
              </button>
              <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 font-medium">
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}