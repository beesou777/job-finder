import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlatformCardProps {
  name: string;
  website: string;
  logoUrl?: string;
  shortDescription?: string;
}

export function PlatformCard({ name, website, logoUrl, shortDescription }: PlatformCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <a
      href={website}
      target="_blank"
      rel="nofollow noopener"
      className="block group transition-transform duration-200 hover:-translate-y-1"
    >
      <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-[#0A66C2]/20 group-hover:bg-[#0A66C2]/5 transition-colors">
            {logoUrl ? (
              <img src={logoUrl} alt={`${name} logo`} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-lg font-bold text-gray-400 group-hover:text-[#0A66C2] transition-colors">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-[#0A66C2] transition-colors">
                {name}
              </h3>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {shortDescription && (
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {shortDescription}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
