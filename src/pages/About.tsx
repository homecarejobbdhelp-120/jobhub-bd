import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-blue-900 mb-6">About Us</h1>
        <div className="prose prose-lg text-gray-700">
          <p className="text-xl font-medium text-gray-600 mb-8">
            Connecting families with compassionate care across Bangladesh.
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Mission</h3>
          <p>
            At <strong>HomeCare Job BD</strong>, our mission is simple: to create a trusted bridge between skilled caregivers, nurses, and families who need them.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default About;