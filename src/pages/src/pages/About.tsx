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
            At <strong>HomeCare Job BD</strong>, our mission is simple: to create a trusted bridge between skilled caregivers, nurses, and families who need them. We believe that everyone deserves to age with dignity and receive professional care in the comfort of their own home.
          </p>
          
          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">What We Do</h3>
          <p>
            We are not just a job portal; we are a community. We verify job postings to ensure safety for our caregivers, and we help families find trained professionals for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
             <li>Elderly Care & Companion Services</li>
             <li>Post-Surgery & Patient Care</li>
             <li>Baby Sitting & Nanny Services</li>
             <li>Hospital Duty Assistance</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Choose Us?</h3>
          <p>
            We prioritize <strong>trust, transparency, and training</strong>. Whether you are looking for a job or looking for care, we are here to support you every step of the way.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default About;