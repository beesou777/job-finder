import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, MapPin, Info, Shield, FileText } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
          Nepal&apos;s most comprehensive job search platform - aggregating
          opportunities from all major portals
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Search className="w-8 h-8 text-gray-600" />}
          title="Comprehensive Search"
          description="Search across multiple job portals from one place. Filter by category, location, job type, and more to find exactly what you're looking for."
        />
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-gray-600" />}
          title="Updated Daily"
          description="Our automated system scrapes the latest job postings daily from top Nepali job portals, ensuring you never miss an opportunity."
        />
        <FeatureCard 
          icon={<MapPin className="w-8 h-8 text-gray-600" />}
          title="Nepal-Wide Coverage"
          description="Find opportunities in Kathmandu, Pokhara, Lalitpur, and cities throughout Nepal. Remote and on-site positions available."
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
      <CardContent className="pt-8 pb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-4 bg-gray-100 rounded-lg shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScrapingInfoSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="bg-blue-50/50">
        <CardContent className="pt-8 pb-8 px-6 md:px-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg shrink-0">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                About Our Service
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                kamkhoj is a job aggregator that collects job listings from
                various Nepali job portals to provide you with a comprehensive
                search experience. We use automated systems to gather publicly
                available job postings, ensuring you have access to the latest
                opportunities all in one place.
              </p>
              <div className="flex items-start gap-3 mt-4 p-4 bg-white/80 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Ethical & Transparent
                  </p>
                  <p className="text-sm text-gray-600">
                    We only collect publicly available information. We don&apos;t
                    break any terms of service, and we respect the original
                    job sources. All job applications are handled directly
                    through the original job portals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function ResourcesSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
            Resources to Help You Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to land your dream job in Nepal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <ResourceCard 
            icon={<FileText className="w-8 h-8 text-gray-600" />}
            title="Resume Tips"
            description="Learn how to create a standout resume that gets noticed by employers. Get tips on formatting, keywords, and highlighting your achievements."
          />
          <ResourceCard 
            icon={<Zap className="w-8 h-8 text-gray-600" />}
            title="Interview Prep"
            description="Master your next interview with our guides on common questions, body language, and following up. Build confidence and land the offer."
          />
          <ResourceCard 
            icon={<MapPin className="w-8 h-8 text-gray-600" />}
            title="Career Paths"
            description="Explore different industries and career paths in Nepal. Understand salary trends, required skills, and growth opportunities."
          />
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
      <CardContent className="pt-8 pb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-4 bg-gray-100 rounded-lg shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
