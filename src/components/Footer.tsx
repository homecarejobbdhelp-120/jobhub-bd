import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] border-t border-slate-800 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              HomeCare <span className="text-emerald-500">Job BD</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Bangladesh's most trusted platform connecting compassionate caregivers & nurses with families in need. Verified professionals, secure jobs.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-emerald-500 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <span>›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <span>›</span> Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/dashboard/company?tab=post" className="hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <span>›</span> Post a Job
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <span>›</span> Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-6">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-500 transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-500 transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>House 12, Road 5, Dhanmondi,<br />Dhaka-1209, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>+880 1712 345 678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>support@homecarejobbd.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} HomeCare Job BD. All rights reserved. Made with ❤️ in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;