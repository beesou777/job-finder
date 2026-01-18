import { Metadata } from "next";
import { Coffee, CheckCircle2, ShieldCheck, Mail, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About KamKhoj | Nepal's Job Discovery Platform",
  description: "Learn about KamKhoj, a simple job discovery platform built to help people in Nepal find job opportunities in one place.",
};

export default function AboutPage() {

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              About KamKhoj
            </h1>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
              A simple job discovery platform built to help people in Nepal find job opportunities in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* What is KamKhoj? */}
          <div className="max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Info className="w-8 h-8 text-[#0A66C2]" />
              What is KamKhoj?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Instead of visiting multiple job portals every day, KamKhoj brings publicly available job listings together so job seekers can discover opportunities faster and easier.
            </p>
            <p className="text-gray-600 leading-relaxed">
              KamKhoj does <strong>not</strong> replace job portals. It helps people find them.
            </p>
          </div>

          {/* Why KamKhoj Exists */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Why KamKhoj Exists</h2>
            <div className="bg-[#0A66C2]/5 border-l-4 border-[#0A66C2] p-8 rounded-r-xl mb-8">
              <blockquote className="text-xl font-semibold text-gray-800 italic">
                "Make job discovery easier."
              </blockquote>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { label: "No accounts", icon: Users },
                { label: "No paywalls", icon: ShieldCheck },
                { label: "No spam", icon: CheckCircle2 }
              ].map((item) => (
                <div key={item.label} className="p-6 bg-gray-50 rounded-xl flex flex-col items-center gap-3">
                  <item.icon className="w-6 h-6 text-[#0A66C2]" />
                  <span className="font-bold text-gray-900">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How KamKhoj Works</h2>
            <ul className="space-y-4">
              {[
                "KamKhoj collects publicly available job listings from various job portals and company career pages.",
                "Each job always links back to the original source.",
                "Job postings remain the property of their respective platforms and employers.",
                "KamKhoj only helps users discover jobs — not apply on their behalf."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#0A66C2] shrink-0" />
                  <p className="text-gray-600 leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* What KamKhoj IS/IS NOT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-100 bg-green-50/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                   KamKhoj IS:
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li>• A job discovery tool</li>
                  <li>• A time-saver for job seekers</li>
                  <li>• A transparent job aggregator</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-red-100 bg-red-50/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                   KamKhoj is NOT:
                </h3>
                <ul className="space-y-2 text-red-800">
                  <li>• A recruitment agency</li>
                  <li>• A job posting platform (yet)</li>
                  <li>• An official partner of job portals</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Support Section */}
          <Card className="border-2 border-orange-100 bg-orange-50/50 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
                <Coffee className="w-8 h-8 text-orange-600" />
                Support KamKhoj
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                KamKhoj is completely free to use. If it has helped you discover a job or saved you time, you can support its development and server costs directly.
              </p>
              
              <div className="flex items-center justify-center">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center gap-4">
                  <div className="relative w-48 h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <img 
                      src="/support.jpeg" 
                      alt="Support QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Scan to Support
                  </span>
                </div>
              </div>

              <p className="mt-8 text-sm text-gray-500 italic font-medium">
                Even a small contribution means a lot ❤️
              </p>
            </CardContent>
          </Card>

          {/* Contact & Transparency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0A66C2]" />
                Transparency Promise
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Always credit original sources</li>
                <li>• Never sell user data</li>
                <li>• Remain simple and accessible</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0A66C2]" />
                Contact
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                If you have feedback or suggestions:<br />
                <a href="https://www.linkedin.com/in/beesou-shah/" className="text-[#0A66C2] font-semibold hover:underline">Bishwa Shah</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
