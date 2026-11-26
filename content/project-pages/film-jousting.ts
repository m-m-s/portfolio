import type { ProjectPage } from "@/features/project-page/types";

export const filmJousting: ProjectPage = {
  platform: "Web",
  builtWith:
    "React, TypeScript, Vite, Tailwind, Express, TMDB API, Letterboxd (scraped with Cheerio), Claude Code",
  hosting: "Vercel and Render",
  status:
    "Live at [film-jousting.vercel.app](https://film-jousting.vercel.app)",
  repo: "[github.com/m-m-s/filmJousting](https://github.com/m-m-s/filmJousting)",
  blocks: [
    {
      type: "image",
      image: {
        src: "/projects/film-jousting/search-page.webp",
        alt: "Film Jousting’s search page: jousting knights over a vine border, the filters, a Letterboxd search box, and the Discover and Joust buttons",
        ratio: 16 / 9,
      },
    },
    {
      type: "text",
      paragraphs: [
        "What movie should I watch right now? Whether you’re deciding alone or with friends, that question can lead down a rabbit hole of searching and debating. An online search brings up the top 100 films of all time, the best movies of the year and the scariest movies ever. I wanted more nuance and more diversity. **I built Film Jousting to dig past those lists and end the debate over what to watch.**",
      ],
    },
    { type: "break" },
    {
      type: "slideshow",
      image: {
        src: "/projects/film-jousting/discover-results.webp",
        alt: "Discover results: a grid of film posters under the hint “Press Discover again for more obscure films!”",
        ratio: 1.5,
      },
      imageSide: "left",
      slides: [
        {
          title: "Film discovery",
          paragraphs: [
            "Users can search the full TMDB movie database with filters for genre, rating, runtime, year, language, keywords, and cast and crew. Each search pulls popular films along with random pages from deeper in the catalog for greater variety and hidden gems. Users who want stranger picks can exclude the most popular films or include extremely obscure ones with fewer than 200 votes. Those get truly bizarre. Discover again with the same filters to dig further.",
          ],
        },
        {
          title: "Letterboxd lists",
          image: {
            src: "/projects/film-jousting/letterboxd-lists.webp",
            alt: "The Search within Letterboxd box with two more lists added below the first",
            ratio: 1.5,
          },
          paragraphs: [
            "Import any Letterboxd watchlist or public list and search it with the same filters. Add several lists at once, like multiple friends’ watchlists or a public list. Overlapping movies score higher in the recommendations.",
          ],
        },
        {
          title: "Jousting",
          image: {
            src: "/projects/film-jousting/joust-blade-runner.webp",
            alt: "A Round 2 matchup: Blade Runner 2049 against The Vast of Night",
            ratio: 1.5,
          },
          paragraphs: [
            "Turn Discover results into a tournament. Users build their own bracket of 8, 16 or 32 films and choose whether contenders are picked by recommendation, rating or popularity. They can also favor hidden gems, skip the most popular films or shuffle the lineup at random. The films face off head to head, round by round, until one is crowned champion. Choosing between two films at a time is far easier than surviving the argument that breaks out over twenty.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "**I wanted users to have as much control over their search as possible.** I chose TMDB because it’s the most extensive movie database with a free API, and I built a filter for everything its search allows. Each filter starts on a default I picked as my recommendation. Anyone can hit Discover straight away and get good results, while anyone who wants more control can open a filter and change it. All that control makes Film Jousting’s UI essentially a long list of buttons and dropdowns.",
        "How do you make that look good? To match the jousting tournament, I wanted the page to look like a medieval manuscript. I sourced illustrations of knights, heraldic crests, and vine borders and built a custom UI around what I collected. Instead of boxes and dropdown arrows, each filter is a heading with its current setting written underneath. This lets the page read like a manuscript, with every setting visible at a glance. I made the Discover and Joust buttons by laying the site’s font over illustrations of a ship and a knight. Custom UI let me build onto the page like a painting.",
      ],
    },
    { type: "break" },
    {
      type: "slideshow",
      diagram: "jousting-engine",
      imageSide: "right",
      slides: [
        {
          title: "Scoring",
          step: "scoring",
          paragraphs: [
            "TMDB’s API can only sort by rating or popularity within one call. **I built a custom scoring engine to weigh everything a user asks for at once.** Every film starts from its TMDB rating as a measure of quality. Genre matches multiply that score instead of adding to it, so a great film gains more from a match than a mediocre one. A “Yes” counts for more than a “Maybe.” If you mark Sci-Fi as “Yes,” a 6.9 sci-fi film scores 10.4 and outranks an 8.2 drama with no genre match. Films get another boost for every extra Letterboxd list they appear on.",
            "[View source →](https://github.com/m-m-s/filmJousting/blob/main/client/src/lib/scoring.ts)",
          ],
        },
        {
          title: "Genre management",
          step: "genres",
          paragraphs: [
            "TMDB treats every genre in a search equally and ranks the results by popularity. This leads to popular genres like action cannibalizing niche ones like documentary. In Film Jousting the server makes a separate call to TMDB for each genre. This guarantees every genre’s best results will be included in the pool for scoring.",
          ],
        },
        {
          title: "Discovery",
          step: "discovery",
          paragraphs: [
            "TMDB’s 20-movies-per-call cap started as a limitation I had to work around. Then I realized I could turn it into Film Jousting’s advantage. Each genre’s call takes TMDB’s first page of popular picks plus three random pages from deeper in the results. I wanted lesser-known films to outnumber the popular picks without losing them entirely. A 200-vote minimum strips out films with too few votes for their rating to mean much, with the option to override it within the advanced filters. Running the same search again pulls the next page and a new set of random pages until the pool runs out.",
          ],
        },
        {
          title: "Letterboxd scraping",
          step: "letterboxd",
          paragraphs: [
            "I planned for Letterboxd lists from the start because that’s where many film enthusiasts track and gather the movies they want to watch. Letterboxd has no open API, so the Film Jousting server scrapes each list with Cheerio and follows its pages to the end. It then matches every title to TMDB by title and year to pull in the rating and genres the scoring engine needs. The server accepts a username, a list URL, or a boxd.it short link.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "To test the scoring engine, I searched for films I’d recommend to people I know and checked where they ranked. My picks consistently ranked near the top. Even better, the engine turned up films I hadn’t thought of that I was excited to watch. Then I handed the site to eight people. A friend who’s a big film enthusiast said **it found movies they’d be interested in but would never have found on their own.** Genre selection tripped a few people up because they thought they had to make a call on every single genre. I added help notes on how “Maybe” and “Veto” work and made guidance throughout the site bolder.",
        "Building Film Jousting was a crash course in external APIs and deploying a front end and back end separately on Vercel and Render. The server handles what the browser can’t, like calling TMDB with a private key and scraping Letterboxd. Scoring runs in the browser, so changing a joust setting re-ranks results instantly. **The hardest part of scoping wasn’t knowing what to build next, but knowing when to stop.** I originally planned a whole multiplayer system, but it didn’t seem necessary once friends could joust together on one screen. I’m happy to say the site is where I want it to be.",
      ],
    },
  ],
};
