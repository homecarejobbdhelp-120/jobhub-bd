import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>
        <p>To provide our services, we may collect your name, phone number, and email address. We do not sell your personal data.</p>
      </div>
      <Footer />
    </div>
  );
};
export default Privacy;