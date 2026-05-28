import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Section - Logo and Copyright */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-2">EventHub</h3>
            <p className="text-sm text-gray-600">
              © 2026 EventHub. Platform Matching Sponsor Terpercaya.
            </p>
          </div>

          {/* Right Section - Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            <a
              href="/privacy-policy"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/bantuan"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Bantuan
            </a>
            <a
              href="/contact-us"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
