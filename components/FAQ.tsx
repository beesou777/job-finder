"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { generateFAQSchema } from "@/lib/seo";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does kamkhoj work?",
    answer: "KamKhoj organizes publicly available job listings from Nepali sources so candidates can search, compare, and then continue to the original posting for the final application process."
  },
  {
    question: "Is kamkhoj free to use?",
    answer: "Yes. KamKhoj is free to browse and does not require a paid subscription to search jobs, internships, or career guides."
  },
  {
    question: "How often are job listings updated?",
    answer: "Listings are refreshed regularly, but the original source remains the final authority because deadlines, availability, and eligibility can change after a page is collected."
  },
  {
    question: "Do I need to create an account?",
    answer: "No account is required to browse KamKhoj. Some original job portals or employer pages may require their own account when you leave KamKhoj to apply."
  },
  {
    question: "How do I apply for a job?",
    answer: "Open the listing, review the job details, and then use the source link or apply button to continue on the original portal or employer page. KamKhoj does not submit the application for you."
  },
  {
    question: "Can I filter jobs by location?",
    answer: "Yes. You can narrow results by location, job type, category, and keywords so you spend less time opening listings that do not match your needs."
  },
  {
    question: "Are the job listings accurate and up-to-date?",
    answer: "KamKhoj tries to keep listings useful, but candidates should always verify the final salary, deadline, eligibility, documents, and instructions on the original source before applying."
  },
  {
    question: "What types of jobs are available?",
    answer: "The site includes full-time jobs, internships, remote roles, and other opportunities across categories such as IT, banking, marketing, operations, and more."
  },
  {
    question: "How do you collect job listings?",
    answer: "KamKhoj uses automated collection and site organization for publicly available listings, then links candidates back to the original source for verification and application."
  },
  {
    question: "What should I do if a listing is wrong or outdated?",
    answer: "Use the contact page to send the job title, company, source URL, and the issue you found. KamKhoj can review correction or removal requests."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ schema for SEO
  const faqSchema = generateFAQSchema(faqData);

  return (
    <section className="bg-zinc-950 py-20 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-2.5 w-2.5 bg-primary" />
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Useful answers about how KamKhoj handles listings, source links, and job-search workflows
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <Card
              key={index}
              className={`border bg-[#18181a] transition-all duration-300 ${
                openIndex === index
                  ? "border-primary/70"
                  : "border-white/10 hover:border-primary/40"
              }`}
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none rounded-lg transition-colors"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-lg font-black text-white pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

