import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Help Center & FAQ</h1>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">How do I create an account?</AccordionTrigger>
            <AccordionContent>
              Click on the "Login / Join" button in the top right corner. Select "Sign Up" and enter your email and password. It's free!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold">Is this service free for Caregivers?</AccordionTrigger>
            <AccordionContent>
              Yes, creating a profile and browsing jobs is completely free for caregivers and nurses.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-semibold">How do I post a job?</AccordionTrigger>
            <AccordionContent>
              If you need a caregiver, simply create an account and click "Post a Job". Fill in the details about the patient and salary, and your job will be live.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-semibold">I forgot my password, what do I do?</AccordionTrigger>
            <AccordionContent>
              On the login page, click "Forgot Password" to receive a reset link in your email.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center bg-blue-50 p-6 rounded-xl">
            <p className="font-bold text-blue-900">Still have questions?</p>
            <p className="text-gray-600 mt-2">Call us at: <span className="font-bold">01345412116</span></p>
            <p className="text-gray-600">Or email: homecarejobbd.help@gmail.com</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Help;