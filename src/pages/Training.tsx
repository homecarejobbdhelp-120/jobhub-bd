import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Award, BookOpen } from "lucide-react";

const Training = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <Navbar />
      
      <div className="bg-[#1e40af] pt-16 pb-24 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">দক্ষতা অর্জন করুন, স্বাবলম্বী হোন</h1>
        <p className="text-blue-100 text-sm md:text-lg max-w-2xl mx-auto px-2">
          সারা টেকনিক্যাল ইনস্টিটিউটের সাথে আপনার ক্যারিয়ার গড়ুন। সরকারি সনদের নিশ্চয়তা সহ প্রশিক্ষণ।
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-10 mb-20 relative z-10">
        <Tabs defaultValue="short-course" className="w-full">
          {/* ✨ FIXED: Horizontal scroll for mobile to prevent overflow */}
          <div className="w-full bg-white p-1 rounded-2xl shadow-xl border mb-10 overflow-x-auto no-scrollbar">
            <TabsList className="flex w-full bg-transparent h-auto">
              <TabsTrigger value="short-course" className="flex-1 py-4 text-xs md:text-base font-black uppercase tracking-wider whitespace-nowrap">
                 🎓 ৭ দিনের শর্ট কোর্স
              </TabsTrigger>
              <TabsTrigger value="rpl" className="flex-1 py-4 text-xs md:text-base font-black uppercase tracking-wider whitespace-nowrap">
                 🏆 RPL সার্টিফিকেট
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="short-course">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-blue-600 h-2 w-full"></div>
              <CardHeader className="p-6 md:p-10 pb-0">
                 <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-red-500 text-white font-bold px-4 py-1">থাকা ফ্রি 🏠</Badge>
                    <Award className="text-blue-600 h-8 w-8" />
                 </div>
                 <CardTitle className="text-2xl md:text-4xl font-black text-slate-800">ইন্টেন্সিভ কেয়ারগিভিং শর্ট কোর্স</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 pt-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100 items-center">
                    <Clock className="text-blue-600 h-6 w-6 shrink-0" />
                    <div><h4 className="font-bold text-slate-800">সময়সীমা</h4><p className="text-sm text-slate-500">৭ - ১০ দিন (আবাসিক)</p></div>
                  </div>
                  <div className="flex gap-4 p-6 bg-purple-50 rounded-2xl border border-purple-100 items-center">
                    <Award className="text-purple-600 h-6 w-6 shrink-0" />
                    <div><h4 className="font-bold text-slate-800">সার্টিফিকেট</h4><p className="text-sm text-slate-500">৩ মাস মেয়াদী সরকারি সনদ</p></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 md:p-10 rounded-3xl">
                   <h4 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> কোর্সের সুবিধাসমূহ</h4>
                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["থাকা একদম ফ্রি", "সেলফ ফাইন্যান্স (নিজ খরচে)", "হাতে-কলমে প্র্যাকটিক্যাল", "কোর্স শেষে জবের সহায়তা"].map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm md:text-base font-medium text-slate-700 bg-white p-4 rounded-xl shadow-sm">
                           <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0" /> {item}
                        </li>
                      ))}
                   </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ... RPL Content (Repeat card style) */}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Training;