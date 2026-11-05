import { useState } from "react";
import {
  categoryLabels,
  contractLabels,
  functionLabels,
  remoteLabels,
  seniorityLabels,
} from "@/features/jobs/presentation";
import type { JobWithCompany } from "@/features/jobs/types";
import { NButton } from "./button";
import { Frame } from "./comic";
import { IconArrow, IconBookmark, IconLevel, IconPin, IconWorkMode } from "./icons";

export function JobCard({ job, seed }: { job: JobWithCompany; seed: number }) {
  const [saved, setSaved] = useState(false);
  const amount = [job.salaryMin, job.salaryMax]
    .filter((x): x is number => x !== undefined)
    .map((x) => new Intl.NumberFormat("pl-PL").format(x))
    .join("–");
  return (
    <Frame
      as="article"
      seed={seed}
      skew={10 + ((seed * 7) % 9)}
      hoverMorph
      dots
      className="jcard"
      aria-labelledby={`${job.id}-t`}
    >
      <div className="jcard__main">
        <p className="jcard__topline">
          <span className="jcard__company">{job.company.name}</span>
          <span className="tag-cat tag-cat--sm tag-cat--grey">{categoryLabels[job.category]}</span>
          <span className="tag-cat tag-cat--sm tag-cat--grey">{functionLabels[job.function]}</span>
        </p>
        <h3 className="jcard__title" id={`${job.id}-t`}>
          {job.title}
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
          <button
            type="button"
            className={`jcard__save${saved ? " is-on" : ""}`}
            aria-pressed={saved}
            aria-label={`Zapisz ofertę: ${job.title}`}
            onClick={() => setSaved((s) => !s)}
          >
            <IconBookmark on={saved} />
          </button>
        </div>
        {amount ? (
          <div className="jcard__salary">
            <span className="salary-tag">
              {amount} {job.salaryCurrency === "EUR" ? "EUR" : "zł"}
            </span>
            <p className="jcard__contract">
              {contractLabels[job.contract]} · {job.salaryKind === "net" ? "netto" : "brutto"} /{" "}
              {job.salaryPeriod === "year" ? "rok" : "mies."}
            </p>
          </div>
        ) : (
          <span className="jcard__contract jcard__salary">Nie podano wynagrodzenia</span>
        )}
        <NButton variant="primary" size="sm">
          Zobacz rolę <IconArrow />
        </NButton>
      </div>
    </Frame>
  );
}
