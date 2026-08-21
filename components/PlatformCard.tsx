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
      className="block group transition-transform duration-200 hover:-translate-y-0.5"
    >
      <Card className="h-full border border-white/10 bg-[#18181a] text-white shadow-sm hover:border-primary/60 transition-shadow duration-200">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-950 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
            {logoUrl ? (
              <img src={logoUrl} alt={`${name} logo`} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-lg font-black text-zinc-400 group-hover:text-primary transition-colors">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-white truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {shortDescription && (
              <p className="text-sm text-zinc-400 line-clamp-2 leading-6">{shortDescription}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
