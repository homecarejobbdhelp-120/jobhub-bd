import { Link } from "react-router-dom";
import { Facebook, Linkedin, Instagram, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* === কোম্পানি ইনফো === */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              HomeCare <span className="text-green-500">Job BD</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Bangladesh's most trusted platform connecting compassionate caregivers & nurses with families in need. Verified professionals, secure jobs.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-green-500 transition"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-green-500 transition"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-green-500 transition"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* === কুইক লিংকস (Training যোগ করা হয়েছে) === */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-green-500 transition">Home</Link></li>
              <li><Link to="/jobs" className="hover:text-green-500 transition">Browse Jobs</Link></li>
              <li><Link to="/training" className="hover:text-green-500 transition font-bold text-green-400">Training</Link></li>
              <li><Link to="/post-job" className="hover:text-green-500 transition">Post a Job</Link></li>
              <li><Link to="/login" className="hover:text-green-500 transition">Login / Sign Up</Link></li>
            </ul>
          </div>

          {/* === সাপোর্ট === */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-green-500 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-green-500 transition">Terms of Service</Link></li>
              <li><Link to="/help" className="hover:text-green-500 transition">Help Center</Link></li>
              <li><Link to="/about" className="hover:text-green-500 transition">About Us</Link></li>
            </ul>
          </div>

          {/* === ঠিকানা ও যোগাযোগ (আপডেট করা হয়েছে) === */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Bagdad Tanzia Tower, Gazipur Chowrasta, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>01345412116</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a href="mailto:homecarejobbd.help@gmail.com" className="hover:text-white">
                  homecarejobbd.help@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
          <p>&copy; 2026 HomeCare Job BD. All rights reserved. Made with ❤️ in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;