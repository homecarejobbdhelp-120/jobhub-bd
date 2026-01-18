import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, MapPin, Award, Phone, User, BookOpen, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Training = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "রিকুয়েস্ট পাঠানো হয়েছে!",
        description: "আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#1e40af] text-white py-16 px-4 text-center rounded-b-[3rem] shadow-xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">দক্ষতা অর্জন করুন, স্বাবলম্বী হোন</h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-lg">
          সরকারি সনদের নিশ্চয়তা সহ কেয়ারগিভিং এবং নার্সিং ট্রেনিং। <br className="hidden md:block"/>
          সারা টেকনিক্যাল ইনস্টিটিউটের সাথে আপনার ক্যারিয়ার গড়ুন।
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: Main Courses (Tabs) */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="short-course" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <TabsTrigger value="short-course" className="text-sm md:text-base font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all">
                  🎓 ৭ দিনের শর্ট কোর্স (নতুনদের জন্য)
                </TabsTrigger>
                <TabsTrigger value="rpl" className="text-sm md:text-base font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg transition-all">
                  🏆 RPL সার্টিফিকেট (অভিজ্ঞদের জন্য)
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Short Course */}
              <TabsContent value="short-course" className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-t-4 border-t-blue-600 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-800">ইন্টেন্সিভ কেয়ারগিভিং শর্ট কোর্স</CardTitle>
                        <CardDescription className="text-base mt-2">নতুনদের জন্য হাতে-কলমে প্রশিক্ষণ</CardDescription>
                      </div>
                      <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1">থাকা ফ্রি 🏠</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Clock className="text-blue-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800">সময়সীমা</h4>
                        <p className="text-sm text-slate-600">৭ - ১০ দিন (আবাসিক)</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <Award className="text-purple-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800">সার্টিফিকেট</h4>
                        <p className="text-sm text-slate-600">৩ মাস মেয়াদী সরকারি সার্টিফিকেট (কারিগরি বোর্ড)</p>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-800 mt-4">কোর্সের সুবিধাসমূহ:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <li className="flex items-center text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> থাকা একদম ফ্রি</li>
                      <li className="flex items-center text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> সেলফ ফাইন্যান্স (নিজ খরচে)</li>
                      <li className="flex items-center text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> হাতে-কলমে প্র্যাকটিক্যাল</li>
                      <li className="flex items-center text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> কোর্স শেষে জবের সহায়তা</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: RPL */}
              <TabsContent value="rpl" className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-t-4 border-t-emerald-600 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-800">RPL অ্যাসেসমেন্ট (অভিজ্ঞদের জন্য)</CardTitle>
                        <CardDescription className="text-base mt-2">কোনো ক্লাস ছাড়াই সরাসরি সরকারি সার্টিফিকেট</CardDescription>
                      </div>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1">NSDA 🇧🇩</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                        <p className="text-emerald-800 font-medium">
                          "আপনার কি কাজের অভিজ্ঞতা আছে কিন্তু সার্টিফিকেট নেই? তাহলে এটি আপনার জন্য।"
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-bold text-slate-700">লেভেলসমূহ</h4>
                          <p className="text-sm text-slate-500">Level 2, 3, 4</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-bold text-slate-700">সময়</h4>
                          <p className="text-sm text-slate-500">মাত্র ৩ দিন (পরীক্ষা)</p>
                        </div>
                     </div>

                    <h4 className="font-bold text-slate-800 mt-4">কেন RPL করবেন?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2"/> বিদেশে (UK, Japan) যাওয়ার জন্য ভেরিফাইড সার্টিফিকেট</li>
                      <li className="flex items-center text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2"/> স্কিল পোর্টাল বা সরকারি ডেটাবেসে নাম থাকবে</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Other Courses Section */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                আমাদের অন্যান্য রেগুলার কোর্সসমূহ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Junior Nursing", duration: "১ বছর", type: "ডিপ্লোমা" },
                  { name: "Pharmacy Course", duration: "৬ মাস", type: "লাইসেন্স সহ" },
                  { name: "LMAF (পল্লী চিকিৎসক)", duration: "৬ মাস", type: "সার্টিফিকেট" },
                  { name: "DMA (Medical Asst.)", duration: "১/২/৪ বছর", type: "ডিপ্লোমা" },
                  { name: "CMA (Medical Asst.)", duration: "৬ মাস", type: "সার্টিফিকেট" },
                  { name: "MCH (মা ও শিশু স্বাস্থ্য)", duration: "৩ মাস", type: "শর্ট কোর্স" },
                ].map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all">
                    <div>
                      <h4 className="font-bold text-slate-700">{course.name}</h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{course.type}</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600">{course.duration}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Quick Inquiry Form (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl border-blue-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white text-center">
                  <h3 className="font-bold text-lg">ভর্তির জন্য যোগাযোগ</h3>
                  <p className="text-blue-100 text-xs">আপনার তথ্য দিন, আমরাই কল করব</p>
                </div>
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleInquiry} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">আপনার নাম</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="নাম লিখুন" className="pl-9" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">মোবাইল নম্বর</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="017xxxxxxxx" className="pl-9" type="tel" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">আগ্রহী কোর্স</label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>শর্ট কোর্স (৭ দিন)</option>
                        <option>RPL (অভিজ্ঞদের জন্য)</option>
                        <option>নার্সিং / ফার্মেসী / অন্যান্য</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? "পাঠানো হচ্ছে..." : (
                        <span className="flex items-center">
                          কল রিকোয়েস্ট পাঠান <Send className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">অথবা সরাসরি কল করুন</span></div>
                  </div>

                  <Button variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => window.location.href = 'tel:+8801337572825'}>
                    <Phone className="mr-2 h-4 w-4" /> 01337-572825
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Training;