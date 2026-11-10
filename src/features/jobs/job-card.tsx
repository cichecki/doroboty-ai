import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { usePrototype } from "@/features/prototype/store";
import { Frame } from "@/sandbox/noir/comic";
import { IconBookmark, IconLevel, IconPin, IconWorkMode } from "@/sandbox/noir/icons";
import type { JobWithCompany } from "./types";
import { categoryLabels, functionLabels, remoteLabels, seniorityLabels } from "./presentation";
import { SalaryFact } from "./salary-fact";

/** Stable per-job seed, so every card keeps its own skewed frame between renders. */
function seedFor(id: string) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h;
}

/* Noir job card: skewed comic frame, display title, salary marker and a primary action. */
export function JobCard({ job, saved }: { job: JobWithCompany; saved?: boolean }) {
  const { run } = usePrototype();
  const seed = seedFor(job.id);
  return (
    <Frame
      as="article"
      seed={seed}
      skew={10 + (seed % 9)}
      hoverMorph
      dots
      className="jcard"
      aria-labelledby={`job-${job.id}`}
    >
      <div className="jcard__main">
        <p className="jcard__topline">
          <Link className="jcard__company" to={`/firmy/${job.company.slug}`}>
            {job.company.name}
          </Link>
          <span className="tag-cat tag-cat--sm tag-cat--grey">{categoryLabels[job.category]}</span>
          <span className="tag-cat tag-cat--sm tag-cat--grey">{functionLabels[job.function]}</span>
        </p>
        <h3 className="jcard__title pp-job-title" id={`job-${job.id}`}>
          <Link to={`/oferty/${job.slug}`}>{job.title}</Link>
        </h3>
        <p className="jcard__facts">
          <span>
            <IconPin /> {job.locations.join(" / ")}
          </span>
          <span>
            <IconWorkMode mode={job.remoteStatus} /> {remoteLabels[job.remoteStatus]}
          </span>
          <span>
            <IconLevel level={job.seniority} /> {seniorityLabels[job.seniority]}
          </span>
        </p>
      </div>
      <div className="jcard__side" data-frame-divider>
        <div className="jcard__sidetop">
          <span className="jcard__date">
            {new Intl.DateTimeFormat("pl-PL").format(new Date(job.publishedAt))}
          </span>
          {saved !== undefined && (
            <button
              type="button"
              className={`jcard__save${saved ? " is-on" : ""}`}
              aria-label={`Zapisz ofertę: ${job.title}`}
              aria-pressed={saved}
              onClick={() => run({ type: "toggle_saved", jobId: job.id })}
            >
              <IconBookmark on={saved} />
            </button>
          )}
        </div>
        <SalaryFact job={job} />
        <Link className={buttonVariants({ size: "sm" })} to={`/oferty/${job.slug}`}>
          Zobacz rolę <ArrowRight />
        </Link>
      </div>
    </Frame>
  );
}
