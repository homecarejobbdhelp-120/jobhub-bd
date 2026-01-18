import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Award, BookOpen, Phone, User, Send, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Training = () => {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleOpenModal = (courseType: string) => {
    setSelectedCourse(courseType);
    setOpenModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setOpenModal(false);
        toast({
            title: "রিকুয়েস্ট সফল হয়েছে!",
            description: "আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।",
            className: "bg-emerald-500 text-white border-none"
        });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-[#1e40af] pt-16 pb-24 px-4 text-center rounded-b-[2rem] shadow-xl">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">দক্ষতা অর্জন করুন, <br/> স্বাবলম্বী হোন</h1>
        <p className="text-blue-100 text-sm md:text-lg max-w-2xl mx-auto px-2 leading-relaxed">
          সারা টেকনিক্যাল ইনস্টিটিউটের সাথে আপনার ক্যারিয়ার গড়ুন। সরকারি সনদের নিশ্চয়তা সহ প্রশিক্ষণ।
        </p>
      </div>

      {/* Main Tabs */}
      <div className="container mx-auto px-4 -mt-12 mb-16 relative z-10">
        <Tabs defaultValue="short-course" className="w-full max-w-4xl mx-auto">
          
          <div className="w-full bg-white p-1.5 rounded-2xl shadow-lg border border-blue-100 mb-8 overflow-x-auto no-scrollbar">
            <TabsList className="flex w-full bg-transparent h-auto gap-2">
              <TabsTrigger value="short-course" className="flex-1 py-3 px-4 text-xs md:text-sm font-bold uppercase whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all">
                 🎓 ৭ দিনের শর্ট কোর্স
              </TabsTrigger>
              <TabsTrigger value="rpl" className="flex-1 py-3 px-4 text-xs md:text-sm font-bold uppercase whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl transition-all">
                 🏆 RPL সার্টিফিকেট
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* TAB 1: Short Course */}
          <TabsContent value="short-course">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-blue-600 h-3 w-full"></div>
              <CardHeader className="p-6 md:p-10 pb-2">
                 <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-red-500 text-white font-bold px-4 py-1.5 rounded-full shadow-sm">থাকা ফ্রি 🏠</Badge>
                    <Award className="text-blue-600 h-8 w-8 bg-blue-50 p-1.5 rounded-full" />
                 </div>
                 <CardTitle className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">ইন্টেন্সিভ কেয়ারগিভিং শর্ট কোর্স</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 pt-4 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100 items-center">
                    <div className="bg-white p-2 rounded-full shadow-sm"><Clock className="text-blue-600 h-6 w-6 shrink-0" /></div>
                    <div><h4 className="font-bold text-slate-800">কোর্সের ধরণ</h4><p className="text-sm text-slate-600 font-medium tracking-tight">৭-১০ দিন (আবাসিক)</p></div>
                  </div>
                  <div className="flex gap-4 p-5 bg-purple-50 rounded-2xl border border-purple-100 items-center">
                     <div className="bg-white p-2 rounded-full shadow-sm"><Award className="text-purple-600 h-6 w-6 shrink-0" /></div>
                    <div><h4 className="font-bold text-slate-800">সার্টিফিকেট</h4><p className="text-sm text-slate-600 font-medium tracking-tight">৩ মাস মেয়াদী সরকারি সনদ</p></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 md:p-10 rounded-3xl border border-slate-100">
                   <h4 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> কোর্সের সুবিধাসমূহ</h4>
                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["থাকা একদম ফ্রি", "নিজ খরচে (সেলফ ফাইন্যান্স)", "হাতে-কলমে প্রশিক্ষণ", "কোর্স শেষে চাকরির সহায়তা"].map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm font-bold text-slate-700 bg-white p-3.5 rounded-xl shadow-sm border border-slate-50">
                           <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0" /> {item}
                        </li>
                      ))}
                   </ul>
                </div>

                <Button onClick={() => handleOpenModal('Short Course (7 Days)')} className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-transform active:scale-[0.98]">
                    ভর্তি হতে ক্লিক করুন
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* TAB 2: RPL Content */}
          <TabsContent value="rpl">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-emerald-600 h-3 w-full"></div>
              <CardHeader className="p-6 md:p-10 pb-2">
                 <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-full shadow-sm">NSDA 🇧🇩</Badge>
                    <Briefcase className="text-emerald-600 h-8 w-8 bg-emerald-50 p-1.5 rounded-full" />
                 </div>
                 <CardTitle className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">RPL সার্টিফিকেট (অভিজ্ঞদের জন্য)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 pt-4 space-y-8">
                 <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-emerald-800 font-bold text-lg leading-relaxed">
                      "যাদের কাজের অভিজ্ঞতা আছে এবং NSDA লেভেল ২, ৩, ৪ সার্টিফিকেট দরকার, তাদের জন্য পরীক্ষা ও সার্টিফিকেটের নিশ্চয়তা।"
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm text-center">
                      <h4 className="font-bold text-slate-700 mb-1">লেভেলসমূহ</h4>
                      <p className="text-slate-500 font-bold">Level 2, 3, 4</p>
                    </div>
                    <div className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm text-center">
                      <h4 className="font-bold text-slate-700 mb-1">প্রসেস</h4>
                      <p className="text-slate-500 font-bold">মাত্র ৩ দিন</p>
                    </div>
                 </div>

                 <Button onClick={() => handleOpenModal('RPL Assessment')} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-transform active:scale-[0.98]">
                    যোগাযোগ করুন
                 </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Other Courses & Contact Form */}
      <div className="container mx-auto px-4 mb-24">
        <div className="max-w-5xl mx-auto space-y-16">
            
            {/* List Section */}
            <div>
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center justify-center">
                    <BookOpen className="mr-2 h-6 w-6 text-blue-600" />
                    আমাদের অন্যান্য রেগুলার কোর্সসমূহ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { name: "Junior Nursing", duration: "১ বছর", type: "ডিপ্লোমা" },
                        { name: "Pharmacy Course", duration: "৬ মাস", type: "লাইসেন্স সহ" },
                        { name: "LMAF (পল্লী চিকিৎসক)", duration: "৬ মাস", type: "সার্টিফিকেট" },
                        { name: "DMA (Medical Asst.)", duration: "১/২/৪ বছর", type: "ডিপ্লোমা" },
                        { name: "CMA (Medical Asst.)", duration: "৬ মাস", type: "সার্টিফিকেট" },
                        { name: "MCH (মা ও শিশু স্বাস্থ্য)", duration: "৩ মাস", type: "শর্ট কোর্স" },
                    ].map((course, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group">
                        <div>
                            <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{course.name}</h4>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block uppercase">{course.type}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold">{course.duration}</Badge>
                        </div>
                    ))}
                </div>
            </div>

            {/* STATIC CONTACT FORM SECTION */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="bg-[#1e40af] p-10 md:p-14 text-white flex flex-col justify-center">
                        <h3 className="text-3xl font-black mb-4 leading-tight">ভর্তি হতে আজই <br/> আবেদন করুন</h3>
                        <p className="text-blue-100 mb-8">আপনার তথ্য দিন, আমরাই আপনার সাথে যোগাযোগ করে ভর্তির বিস্তারিত জানিয়ে দেব।</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/30 p-2 rounded-full"><Phone className="h-5 w-5" /></div>
                                <p className="font-bold text-lg">01337-572825</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 md:p-14">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 font-bold">আপনার নাম</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input id="name" placeholder="আপনার নাম লিখুন" className="pl-10 h-12 rounded-xl bg-slate-50" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-700 font-bold">মোবাইল নম্বর</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input id="phone" placeholder="017xxxxxxxx" className="pl-10 h-12 rounded-xl bg-slate-50" type="tel" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">কোর্স সিলেক্ট করুন</Label>
                                <select className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>শর্ট কোর্স (৭ দিন)</option>
                                    <option>RPL সার্টিফিকেট</option>
                                    <option>জুনিয়র নার্সিং</option>
                                    <option>ফার্মেসী কোর্স</option>
                                    <option>অন্যান্য</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-xl" disabled={loading}>
                                {loading ? "লোডিং..." : "সাবমিট করুন"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
      </div>
      
      <Footer />

      {/* Modal for Header Buttons */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
                <DialogTitle className="font-bold text-xl text-white">ভর্তি সংক্রান্ত যোগাযোগ</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">আপনার পছন্দের কোর্স: <b>{selectedCourse}</b></DialogDescription>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">নাম</Label>
                        <Input placeholder="নাম লিখুন" className="h-12 rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">মোবাইল নম্বর</Label>
                        <Input placeholder="017xxxxxxxx" className="h-12 rounded-xl" type="tel" required />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">সাবমিট করুন</Button>
                </form>
                <div className="mt-6 text-center border-t pt-4">
                    <p className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-wider">অথবা সরাসরি কল করুন</p>
                    <Button variant="outline" className="w-full h-12 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl font-black" onClick={() => window.location.href = 'tel:+8801337572825'}>
                        <Phone className="mr-2 h-5 w-5" /> 01337-572825
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Training;