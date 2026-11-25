import type { ProjectPage } from "@/features/project-page/types";

export const filmJousting: ProjectPage = {
  platform: "Web",
  builtWith:
    "React, TypeScript, Vite, Tailwind, Express, TMDB API, Letterboxd (scraped with Cheerio), Claude Code",
  hosting: "Vercel and Render",
  status:
    "Live at [film-jousting.vercel.app](https://film-jousting.vercel.app)",
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
        "What movie should I watch right now? That question can lead down a rabbit hole of frustrating searching and debating, whether you’re deciding alone or with friends. An online search brings up top 100 lists of all time, best movies of the year, scariest movies ever, but I wanted more, more nuance, more diversity. **I built Film Jousting to dig past those lists and end the debate over what to watch.**",
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
            "Users can search the full TMDB movie database with filters for genre, rating, runtime, year, language, keywords, and cast and crew. Each search pulls popular films along with random pages from deeper in the catalog for greater variety and hidden gems. Discover again with the same filters to dig further.",
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
          title: "The joust",
          image: {
            src: "/projects/film-jousting/joust-blade-runner.webp",
            alt: "A Round 2 matchup: Blade Runner 2049 against The Vast of Night",
            ratio: 1.5,
          },
          paragraphs: [
            "Turn Discover results into a tournament of top films. Joust the films head to head and round by round until one film is crowned champion. This is designed to help users and their friends finally decide what to watch. It is easier to choose between two films at a time than to survive the long argument that inevitably ensues over multiple options.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "**I wanted users to have as much control over their search as possible.** I chose TMDB as the most extensive movie database with a free API and built a filter for everything its search allows. Each filter starts on a default I picked as my recommendation. Anyone can hit Discover straight away and get good results, while anyone who wants more control can open a filter and change it. All that control makes Film Jousting’s UI essentially a long list of buttons and dropdowns.",
        "How do you make that look good? To match the jousting tournament, I wanted the page to look like a medieval manuscript. I sourced illustrations of knights, heraldic crests, and vine borders and built a custom UI around what I collected. Instead of boxes and dropdown arrows, each filter is a heading with its current setting written underneath. Two vine borders frame the filters as one section. I made the Discover and Joust buttons by laying the site’s font over illustrations of a ship and a knight. Custom UI let me build onto the page like a painting.",
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
            "TMDB’s API can only sort by rating or popularity within one call. **I built a custom scoring engine to weigh everything a user asks for at once.** Each movie’s score starts from its TMDB rating as a measure of quality. Genres marked “Yes” outweigh those marked “Maybe.” Films that appear on more than one Letterboxd list rank higher.",
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
            "TMDB returns 20 movies a page, and I turned that to Film Jousting’s advantage. Each genre’s call takes TMDB’s default first page of popular picks, plus three random pages from deeper in the results for lesser-known ones. A 200-vote minimum strips out films with too few votes for their rating to mean much. (Something that can be overruled in the advanced filters.) When running the same search again, the call pulls the next page and draws a new set of random pages. This continues until the pool is exhausted.",
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
        "To test the quality of the scoring engine, I ran parameters for films I would recommend to specific people and checked whether they ranked high in the results. I knew the engine was working when I saw the films I would pick organically rank high along with additional films I was excited to see. A friend who’s a big film enthusiast tested the site and told me **it gave them movies they’d be interested in but wouldn’t have found on their own.** Not everything went smoothly, though. People overcomplicated the genre selection because they thought they had to make a call on every single genre. To solve this I added more direct guidance to each filter’s pop-up.",
        "Building this project was a good lesson in working with external databases and APIs and deploying a front end and back end separately on Vercel and Render. It also taught me a lot about building UX/UI for user understanding and scoping a project. **The hardest part isn’t knowing what to build next, but knowing when to stop.** I originally planned a whole multiplayer system, but it didn’t seem necessary once the site worked without it. With the discovery turning up great films people wouldn’t find on their own and the jousting tournament working, I’m happy to say the site is where I want it to be.",
      ],
    },
  ],
};
