import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: January 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>To provide our services, we may collect your name, phone number, email address, and professional details (for caregivers) when you register on our site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. How We Use Your Data</h2>
            <p>Your data is used solely for the purpose of connecting employers with job seekers. We do not sell your personal data to third-party marketing agencies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Data Security</h2>
            <p>We implement strict security measures to protect your information. Your password is encrypted, and your contact details are shared only when you apply for a job or post one.</p>
          </section>

          <section>
             <h2 className="text-xl font-bold text-gray-900 mb-2">4. Contact Us</h2>
             <p>If you have questions about your data, please contact us at: <span className="font-bold">homecarejobbd.help@gmail.com</span></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Privacy;