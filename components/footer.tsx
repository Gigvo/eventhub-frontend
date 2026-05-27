import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16 px-60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Section - Logo and Copyright */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2">EventHub</h3>
            <p className="text-sm text-gray-600">
              © 2024 EventHub. Platform Matching Sponsor Terpercaya.
            </p>
          </div>

          {/* Right Section - Links */}
          <div className="flex gap-6">
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
