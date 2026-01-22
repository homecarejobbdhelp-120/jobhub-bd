import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Terms of Service</h1>
        <p>Welcome to HomeCare Job BD. By using our website, you agree to provide accurate information and maintain professional conduct.</p>
      </div>
      <Footer />
    </div>
  );
};
export default Terms;