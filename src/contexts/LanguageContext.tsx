import React, { createContext, useContext, useState, useEffect } from "react";

// ১. ডিকশনারি (যেখানে সব বাংলা/ইংরেজি শব্দ থাকবে)
const translations = {
  bn: {
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
    hero_title: "দক্ষতা অর্জন করুন, স্বাবলম্বী হোন",
    hero_subtitle: "সরকারি সনদের নিশ্চয়তা সহ কেয়ারগিভিং ট্রেনিং।",
    btn_get_job: "আজই জয়েন করুন",
    btn_post_job: "জব পোস্ট করুন"
  },
  en: {
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
    hero_title: "Find Trusted Home Care Jobs",
    hero_subtitle: "The most professional platform for Caregivers & Nurses.",
    btn_get_job: "Get a Job Today",
    btn_post_job: "Post a Job"
  }
};

type LanguageContextType = {
  language: "bn" | "en";
  setLanguage: (lang: "bn" | "en") => void;
  t: (key: keyof typeof translations.bn) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<"bn" | "en">("bn"); // ডিফল্ট ভাষা বাংলা

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