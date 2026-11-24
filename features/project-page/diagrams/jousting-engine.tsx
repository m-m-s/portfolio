function Box({
  title,
  detail,
  step,
  active,
}: {
  title: string;
  detail?: string;
  step?: string | string[];
  active?: string;
}) {
  return (
    <div
      data-active={active && step ? [step].flat().includes(active) : undefined}
      className="group border border-ink/30 bg-page px-2.5 py-2 font-grotesk text-[0.6875rem] leading-snug transition-[opacity,border-color] duration-(--slide-move) data-[active=false]:opacity-35 data-[active=true]:border-ink sm:text-xs"
    >
      <p>{title}</p>
      {detail && (
        <p className="mt-0.5 text-ink/60 max-sm:hidden max-sm:group-data-[active=true]:block">
          {detail}
        </p>
      )}
    </div>
  );
}

const Arrow = ({ children = "↓" }: { children?: string }) => (
  <div
    aria-hidden="true"
    className="py-0.5 text-center font-grotesk text-xs text-ink/40"
  >
    {children}
  </div>
);

const Lane = ({ children }: { children: string }) => (
  <p className="pb-1.5 text-center font-grotesk text-[0.6875rem] text-ink/60 sm:text-xs">
    {children}
  </p>
);

export function JoustingEngine({ active }: { active?: string }) {
  const at = { active };
  return (
    <figure aria-label="How Film Jousting builds its recommendations: it searches TMDB, or your Letterboxd lists when you add one, then filters and scores every film">
      <Box
        title="Your filters"
        detail="Genres, rating, runtime, years, language, keywords, cast and crew. Vetoed genres are left out."
      />
      <div className="grid grid-cols-2">
        <Arrow>↙</Arrow>
        <Arrow>↘</Arrow>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        <div>
          <Lane>No list: search TMDB</Lane>
          <Box
            title="One TMDB call per genre"
            detail="And per language"
            step="genres"
            {...at}
          />
          <Arrow />
          <Box
            title="TMDB’s first page of popular films + 3 random deeper pages"
            detail="Films with under 200 votes are left out"
            step="discovery"
            {...at}
          />
        </div>
        <div>
          <Lane>With a Letterboxd list</Lane>
          <Box
            title="Username, list URL or boxd.it link"
            detail="Usernames become watchlists, short links are followed, URLs are trimmed to the list"
            step="letterboxd"
            {...at}
          />
          <Arrow />
          <Box
            title="Scrape every page with Cheerio"
            detail="Follows each list to its last page, all lists at once"
            step="letterboxd"
            {...at}
          />
          <Arrow />
          <Box
            title="Match each title to TMDB"
            detail="By title and year, then count the lists each film is on"
            step="letterboxd"
            {...at}
          />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <Arrow>↘</Arrow>
        <Arrow>↙</Arrow>
      </div>
      <Box
        title="Filter and score every film"
        detail="List films go through the same filters. Score: TMDB rating × each matching genre’s weight (Yes over Maybe) × +50% for every extra list it’s on"
        step={["scoring", "letterboxd"]}
        {...at}
      />
      <Arrow />
      <Box title="Ranked recommendations" />
    </figure>
  );
}
