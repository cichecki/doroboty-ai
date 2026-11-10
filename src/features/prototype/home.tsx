import { useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { buttonVariants, MasterBody, masterClassName } from "@/components/ui/button";
import { JobCard } from "@/features/jobs/job-card";
import { Frame, SpeechBubble } from "@/sandbox/noir/comic";
import advisorImg from "@/sandbox/noir/img/doradca-cut.webp";
import { usePrototype } from "./store";
import { publishedJobs } from "./model";

const categories = [
  {
    slug: "build",
    label: "Build",
    description: "Tworzysz modele, systemy i produkty wykorzystujące AI.",
  },
  {
    slug: "apply",
    label: "Apply",
    description: "Używasz AI, żeby lepiej wykonywać swoją właściwą pracę.",
  },
  {
    slug: "lead",
    label: "Lead",
    description: "Prowadzisz zmianę, decyzje i zespoły w świecie AI.",
  },
] as const;

export default function HomePage() {
  const { state } = usePrototype();
  const latestJobs = publishedJobs(state).slice(0, 4);
  const advisor = useRef<HTMLImageElement>(null);

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__copy">
            <span className="tag-cat tag-cat--grey">Dobra robota. Z AI w środku.</span>
            <h1>
              Praca dla ludzi, którzy <span className="n-accent">dowożą z AI.</span>
            </h1>
            <p className="n-lead">
              Wyselekcjonowane role, w których AI jest częścią odpowiedzialności, decyzji i wyniku
              pracy — nie dopiskiem w employer brandingu.
            </p>
            <div className="home-hero__actions">
              <Link to="/oferty" className={masterClassName("lg")}>
                <MasterBody>
                  Zobacz oferty <ArrowRight />
                </MasterBody>
              </Link>
              <Link
                to="/metodologia"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Jak wybieramy role
              </Link>
            </div>
          </div>
          <div className="home-hero__art" aria-hidden="true">
            <SpeechBubble
              variant="burst"
              className="home-hero__bubble"
              target={advisor}
              gap={40}
              tailWidth={14}
            >
              AI w roli, nie w nagłówku!
            </SpeechBubble>
            <img ref={advisor} className="home-hero__advisor" src={advisorImg} alt="" />
          </div>
        </div>
      </section>

      <section className="n-section">
        <div className="n-section__head">
          <div>
            <p className="n-kicker">Trzy sposoby pracy z AI</p>
            <h2>
              Build. Apply. <span className="n-accent">Lead.</span>
            </h2>
          </div>
        </div>
        <div className="home-cats">
          {categories.map((category, index) => (
            <Frame
              as="article"
              key={category.slug}
              seed={40 + index * 7}
              skew={12 + index * 3}
              hoverMorph
              dots
              className="home-cat"
            >
              <span className="kadr__caption">0{index + 1}</span>
              <h3 className="home-cat__title">{category.label}</h3>
              <p className="home-cat__text">{category.description}</p>
              <Link
                className={buttonVariants({ variant: "link" })}
                to={`/oferty?category=${category.slug}`}
              >
                Przeglądaj role <ArrowRight />
              </Link>
            </Frame>
          ))}
        </div>
      </section>

      <section className="n-band">
        <div className="n-section">
          <div className="n-section__head">
            <div>
              <p className="n-kicker">Aktualne role</p>
              <h2>Najnowsze oferty</h2>
            </div>
            <Link className={buttonVariants({ variant: "outline", size: "sm" })} to="/oferty">
              Wszystkie oferty <ArrowRight />
            </Link>
          </div>
          <div className="pp-job-list">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
