import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, DollarSign, Briefcase, GraduationCap, ArrowRight } from "lucide-react";

interface RemoteJobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    company_logo?: string;
    locations?: string[];
    functions?: string[];
    experience_level?: string[];
    travel_requirements?: string;
    type?: string;
    min_salary?: number;
    max_salary?: number;
    currency_type?: string;
    salary_period?: number;
    posting_id: string;
    company_id?: string;
    start_date?: number;
  };
}

export function RemoteJobCard({ job }: RemoteJobCardProps) {
  // Format salary
  const formatSalary = () => {
    if (!job.min_salary && !job.max_salary) return null;
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: job.currency_type || 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const periodMap: Record<number, string> = {
      1: 'hour',
      2: 'day',
      3: 'week',
      4: 'month',
      5: 'year',
    };
    
    const period = periodMap[job.salary_period || 5] || 'year';
    
    if (job.min_salary && job.max_salary) {
      return `${formatCurrency(job.min_salary)} - ${formatCurrency(job.max_salary)}/${period}`;
    } else if (job.min_salary) {
      return `From ${formatCurrency(job.min_salary)}/${period}`;
    } else if (job.max_salary) {
      return `Up to ${formatCurrency(job.max_salary)}/${period}`;
    }
    
    return null;
  };

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo <= 7) return `${daysAgo} days ago`;
    if (daysAgo <= 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const salaryText = formatSalary();
  const postedDate = formatDate(job.start_date);

  return (
    <Card className="h-full flex flex-col border border-gray-300 bg-white hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 leading-snug text-gray-900">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {job.company_logo && (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="w-8 h-8 rounded object-contain"
                />
              )}
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span className="truncate text-sm font-medium text-gray-700">{job.company_name}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-6 pb-6">
        {/* Horizontal Badges for Key Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.travel_requirements && (
            <Badge className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 border-0 font-normal rounded-md flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{job.travel_requirements}</span>
            </Badge>
          )}
          {job.locations && job.locations.length > 0 && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5 max-w-full">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              <span className="truncate max-w-[200px]">{job.locations[0]}</span>
              {job.locations.length > 1 && (
                <span className="text-gray-500">+{job.locations.length - 1}</span>
              )}
            </Badge>
          )}
          {job.type && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">{job.type}</span>
            </Badge>
          )}
          {job.experience_level && job.experience_level.length > 0 && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">{job.experience_level[0]}</span>
            </Badge>
          )}
          {salaryText && (
            <Badge className="text-xs px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 border-0 font-normal rounded-md flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{salaryText}</span>
            </Badge>
          )}
        </div>

        {job.functions && job.functions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.functions.slice(0, 3).map((func, idx) => (
              <Badge key={idx} className="text-xs px-2 py-0.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-normal">
                <span className="truncate block">{func}</span>
              </Badge>
            ))}
            {job.functions.length > 3 && (
              <Badge className="text-xs px-2 py-0.5 border border-gray-300 bg-white text-gray-500 font-normal">
                +{job.functions.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {postedDate && (
          <div className="text-xs text-gray-500 mb-4">
            Posted {postedDate}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <a
            href={`https://simplify.jobs/p/${job.posting_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary hover:text-primary/90 font-medium text-sm"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

