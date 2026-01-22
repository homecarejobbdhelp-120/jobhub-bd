import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Help = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Help Center</h1>
        <p>If you need assistance, please email us at: <span className="font-bold">homecarejobbd.help@gmail.com</span></p>
      </div>
      <Footer />
    </div>
  );
};
export default Help;