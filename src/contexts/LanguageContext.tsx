import React, { createContext, useContext, useState } from "react";

// ১. ডিকশনারি (শব্দভাণ্ডার)
const translations = {
  bn: {
    // Navbar
    nav_home: "হোম",
    nav_training: "ট্রেনিং",
    nav_contact: "যোগাযোগ",
    nav_login: "লগইন",
    nav_signup: "রেজিস্ট্রেশন",
    nav_feed: "জব ফিড",
    nav_profile: "আমার প্রোফাইল",
    nav_dashboard: "ড্যাশবোর্ড",
    nav_settings: "সেটিংস",
    nav_share: "শেয়ার অ্যাপ",
    nav_logout: "লগআউট",
    nav_language: "ভাষা",
    
    // Home Page Hero
    hero_title_1: "খুঁজুন",
    hero_title_highlight: "বিশ্বস্ত হোম কেয়ার",
    hero_title_2: "চাকরি (বাংলাদেশ)",
    hero_subtitle: "কেয়ারগিভার এবং নার্সদের জন্য সবচেয়ে প্রফেশনাল প্ল্যাটফর্ম। ভেরিফাইড হোমকেয়ার সার্ভিসের সাথে যুক্ত হোন।",
    btn_get_job: "আজই জয়েন করুন",
    btn_post_job: "জব পোস্ট করুন",
    btn_training: "ট্রেনিং দরকার?",
    search_placeholder: "কাজের নাম...",
    location_placeholder: "এলাকা...",
    btn_search: "সার্চ করুন",

    // Stats
    stats_jobs: "এক্টিভ জব",
    stats_caregivers: "কেয়ারগিভার",
    stats_companies: "কোম্পানি",
    stats_success: "সাকসেস রেট",

    // Recent Jobs
    recent_ops: "নতুন জবের সুযোগ",
    recent_sub: "আপনার ক্যারিয়ার গড়ুন",
    view_all: "সব দেখুন",
    salary_negotiable: "আলোচনা সাপেক্ষ",
    
    // Footer
    footer_trusted: "১০০+ হোমকেয়ার সার্ভিস দ্বারা ভেরিফাইড।"
  },
  en: {
    // Navbar
    nav_home: "Home",
    nav_training: "Training",
    nav_contact: "Contact Us",
    nav_login: "Login",
    nav_signup: "Sign Up",
    nav_feed: "Job Feed",
    nav_profile: "My Profile",
    nav_dashboard: "Dashboard",
    nav_settings: "Settings",
    nav_share: "Share App",
    nav_logout: "Logout",
    nav_language: "Language",

    // Home Page Hero
    hero_title_1: "Find",
    hero_title_highlight: "Trusted Home Care",
    hero_title_2: "Jobs in Bangladesh",
    hero_subtitle: "The most professional platform for Caregivers & Nurses. Connect with verified homecare services and build your career.",
    btn_get_job: "Get a HomeCare Job Today",
    btn_post_job: "Post a Job",
    btn_training: "Need Training?",
    search_placeholder: "Job title...",
    location_placeholder: "Location...",
    btn_search: "Search Jobs",

    // Stats
    stats_jobs: "Active Jobs",
    stats_caregivers: "Caregivers",
    stats_companies: "Companies",
    stats_success: "Success Rate",

    // Recent Jobs
    recent_ops: "Recent Opportunities",
    recent_sub: "Find your next career move",
    view_all: "View All",
    salary_negotiable: "Negotiable",

    // Footer
    footer_trusted: "Trusted by 100+ homecare services."
  }
};

type LanguageContextType = {
  language: "bn" | "en";
  setLanguage: (lang: "bn" | "en") => void;
  t: (key: keyof typeof translations.bn) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<"bn" | "en">("bn"); 

  const t = (key: keyof typeof translations.bn) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};