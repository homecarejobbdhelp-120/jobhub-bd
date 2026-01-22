import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Terms of Service</h1>
        <div className="space-y-6 text-gray-700">
          <p>Welcome to HomeCare Job BD. By using our website, you agree to the following terms:</p>
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. User Responsibilities</h2>
            <p>You agree to provide accurate information. Caregivers must provide valid proof of training or experience if requested by employers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Safe Conduct</h2>
            <p>We have a zero-tolerance policy for harassment or fraudulent activities. Any user found violating these rules will be banned immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Our Role</h2>
            <p>HomeCare Job BD acts as a bridge connecting employers and employees. We are not responsible for direct employment contracts or disputes, though we will assist in mediation where possible.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Terms;