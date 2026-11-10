import { CompanyLogoImage } from "@/features/jobs/company-logo-image";
import { companyInitials, companyLogoUrl } from "@/features/jobs/company-logos";
import type { Company } from "@/features/jobs/types";
import { cn } from "@/lib/utils";

export function CompanyLogo({
  company,
  size = "default",
}: {
  company: Pick<Company, "name" | "slug" | "logoUrl">;
  size?: "default" | "large";
}) {
  const src = companyLogoUrl(company);
  const dimension = size === "large" ? 80 : 56;
  const initials = companyInitials(company.name);

  return (
    <span
      aria-hidden="true"
      data-company-logo={company.slug}
      className={cn("nlogo-box n-outline shrink-0", size === "large" ? "size-20" : "size-14")}
    >
      {src ? <CompanyLogoImage src={src} dimension={dimension} initials={initials} /> : initials}
    </span>
  );
}
