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
    answer: "kamkhoj is a job aggregator that collects job listings from various Nepali job portals including MeroJob, Kantipur Job, Jobs Nepal, and more. We use automated systems to gather publicly available job postings, ensuring you have access to the latest opportunities all in one place. You can search, filter, and apply directly through our platform."
  },
  {
    question: "Is kamkhoj free to use?",
    answer: "Yes, kamkhoj is completely free to use. There's no sign-up required, no hidden fees, and no premium memberships. You can browse all job listings, search by category, location, or job type, and apply directly to jobs without any cost."
  },
  {
    question: "How often are job listings updated?",
    answer: "Our automated system scrapes the latest job postings daily from top Nepali job portals. New opportunities are added regularly, ensuring you never miss a chance to apply for your dream job. We recommend checking back daily for the freshest opportunities."
  },
  {
    question: "Do I need to create an account?",
    answer: "No, you don't need to create an account to browse or search for jobs on kamkhoj. However, when you click 'Apply Now' on a job listing, you'll be redirected to the original job portal where you may need to create an account to submit your application, depending on their requirements."
  },
  {
    question: "How do I apply for a job?",
    answer: "Simply click the 'Apply Now' button on any job card. This will redirect you to the original job portal where the position was posted. You'll complete the application process directly on that portal. kamkhoj acts as a search and discovery platform, while applications are handled by the original job sources."
  },
  {
    question: "Can I filter jobs by location?",
    answer: "Yes! You can filter jobs by location, job type (full-time, part-time, internship), category, and more. Use the search bar and filters on the jobs page to narrow down opportunities based on your preferences. We cover jobs from Kathmandu, Pokhara, Lalitpur, and cities throughout Nepal."
  },
  {
    question: "Are the job listings accurate and up-to-date?",
    answer: "We strive to provide the most accurate and up-to-date information. Our system updates job listings daily from multiple sources. However, since we aggregate from various portals, we recommend verifying details on the original job portal before applying. Some jobs may expire or be filled, so we display deadline information when available."
  },
  {
    question: "What types of jobs are available?",
    answer: "kamkhoj aggregates various types of opportunities including full-time jobs, part-time positions, internships, contract work, and remote positions across multiple industries such as IT, Finance, Marketing, Healthcare, Education, and more. You can filter by job type to find exactly what you're looking for."
  },
  {
    question: "How do you collect job listings?",
    answer: "We use automated web scraping systems to collect publicly available job postings from major Nepali job portals. We only gather information that is already publicly accessible and respect the terms of service of the original sources. All applications are handled directly through the original job portals."
  },
  {
    question: "Can I save jobs for later?",
    answer: "Currently, kamkhoj doesn't have a built-in save feature. However, you can bookmark job pages in your browser or keep track of job IDs. We recommend applying to jobs as soon as possible since positions can fill quickly. You can always use the search and filter features to find jobs again."
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
            Everything you need to know about using kamkhoj to find your next opportunity
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

