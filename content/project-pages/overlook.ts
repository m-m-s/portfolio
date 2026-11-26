import type { ProjectPage } from "@/features/project-page/types";

const screen = 1080 / 2210;

export const overlook: ProjectPage = {
  platform: "Android",
  status: "In progress",
  repo: "[github.com/m-m-s/overlook](https://github.com/m-m-s/overlook)",
  builtWith:
    "React Native, Expo, TypeScript, Supabase, Claude API, Claude Code",
  blocks: [
    {
      type: "text",
      paragraphs: [
        `Overlook started with a conversation at a community tech demo about what AI assistants could do. I went home that night thinking about where one would actually help me. On my phone I’m constantly screenshotting recipes, outfits, and to-dos. Thousands of them pile up in an unorganized gallery. Sorting them is the kind of tedious job I never get to. I wanted an assistant app that could tag and sort them for me and **turn my ceaseless bookmarks into a functioning library.**`,
      ],
    },
    {
      type: "image-row",
      images: [
        {
          src: "/projects/overlook/sidebar.webp",
          alt: "Overlook’s sidebar: a search box and filters for category, urgency, resonance, status, and difficulty",
          ratio: screen,
        },
        {
          src: "/projects/overlook/home-full.webp",
          alt: "Overlook’s home screen: rows of screenshots sorted under Urgent, Food, Fashion, and Art",
          ratio: screen,
        },
        {
          src: "/projects/overlook/nail-detail.webp",
          alt: "A saved photo of colorblock nails opened in Overlook, with its Fashion category, the title Claude wrote for it, and its tags",
          ratio: screen,
        },
      ],
      onPhone: 2,
    },
    {
      type: "text",
      paragraphs: [
        `Pinterest is the closest thing I’d found to what I needed, but its boards are static and only as organized as I make them. Using it for my screenshots would mean uploading every one by hand. Even the pins I already save there tend to get lost.`,
        "Overlook solves this with **an extensive tagging system that’s fully searchable.** Every screenshot sits in broad categories and carries its own niche details, so one search can pull up every knitting pattern or every concert I meant to get tickets for.",
      ],
    },
    { type: "break" },
    {
      type: "slideshow",
      image: {
        src: "/projects/overlook/tagging.webp",
        alt: "A recipe screenshot’s details: Claude’s tags for the dish, subject, technique, and ingredients",
        ratio: screen,
      },
      imageSide: "left",
      slides: [
        {
          title: "Tagging",
          paragraphs: [
            "Tags cover what a screenshot is and what’s in it. Users can let Claude analyze and tag a screenshot, tag it by hand, or do both. Claude’s tags have their own look that sets them apart from manual tags, so users can always tell what Claude guessed and correct it.",
            "For example, a recipe from a Reddit post is categorized as “social” and “food,” then also tagged with the cuisine, dish, and any other identifiable details.",
          ],
        },
        {
          title: "Privacy",
          image: {
            src: "/projects/overlook/privacy.webp",
            alt: "Onboarding screen: Local-first by default. Screenshots stay on the phone and only text metadata is stored",
            ratio: screen,
          },
          paragraphs: [
            "Screenshots can hold private details like addresses or messages. Images stay on users’ phones and only leave when sent to Claude’s API for analysis. The database stores only text about each screenshot (its tags, status, urgency and links) and never the image itself.",
          ],
        },
        {
          title: "Smart albums",
          image: {
            src: "/projects/overlook/save-album.webp",
            alt: "Saving the Food filter as a smart album named Recipes to try, with a 🍳 emoji icon, pinned to the home screen",
            ratio: screen,
          },
          paragraphs: [
            "Users can organize the library however they want by saving a collection of tags into smart albums. New screenshots with matching tags are automatically sorted into an album.",
          ],
        },
        {
          title: "Status and urgency",
          image: {
            src: "/projects/overlook/status-rug.webp",
            alt: "A Persian rug listing tagged by Claude, including its $950 price, with urgency set to Expires soon and status to Need to research",
            ratio: screen,
          },
          paragraphs: [
            "Users can give each screenshot a status like “Ready to do” or “Need supplies” and an urgency from “Today” to “Someday.” These tags call out the screenshots that need attention so they don’t get lost in the library. Claude sets urgency automatically when it spots a date or a deal.",
          ],
        },
        {
          title: "Action links",
          image: {
            src: "/projects/overlook/action-links.webp",
            alt: "A concert ticket screenshot marked This week, with links to StubHub, Google Maps, and tickets",
            ratio: screen,
          },
          paragraphs: [
            "Claude pulls the useful links out of every screenshot it analyzes: tickets for a concert, directions to a restaurant, a place to buy an outfit. Users can add any links Claude missed.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "I built V1 of Overlook in a week when I was very new to coding. I spent the first few days on the spec, the user flow, essential features, and the basic UX/UI, then started building in Claude Code for the first time. It was a frenzy of hyperfixation. Watching my ideas turn into working code was exhilarating.",
        `By the end of the week the app came close to fully matching my spec, and I’d even added some stretch features. It also had bugs I didn’t know how to fix yet. The bugs kept spreading until they became impossible to manage. That’s when I realised **I had hit the wall of “vibe coding.”**`,
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "When I came back to read the code I didn’t write, I found big structural issues under the bugs.",
      ],
    },
    {
      type: "image-row",
      images: [
        {
          src: "/projects/overlook/bulk-upload.webp",
          alt: "V1's Bulk upload screen: 34 new screenshots in the album and a batch size picker",
          ratio: screen,
        },
        {
          src: "/projects/overlook/review-batch.webp",
          alt: "V1's Review batch screen: a grid of 34 screenshots ready to process",
          ratio: screen,
        },
        {
          src: "/projects/overlook/processing.webp",
          alt: "V1 processing a batch with AI tagging: 1 of 30 done",
          ratio: screen,
        },
      ],
    },
    {
      type: "slideshow",
      slides: [
        {
          title: "The album problem",
          paragraphs: [
            "I didn’t catch that Claude Code skipped the onboarding step from my spec where users confirm which album to watch. Without it the code had to guess where screenshots were kept. It looked for an album named “Screenshots” and fell back to the entire photo library whenever that album didn’t exist. That meant personal camera photos could be sent to Claude.",
            "Now users choose which album Overlook watches. A dedicated album is safer because Overlook’s code only requests photos from that one album and leaves the rest of the photo library alone. If Overlook can’t find that album it stops and asks.",
          ],
        },
        {
          title: "Photo access workarounds",
          paragraphs: [
            "V1 reached photos through a stack of workarounds. An outdated file tool couldn’t read the content:// addresses Android gives photos, so the code copied every screenshot into a temporary file before sending it to Claude’s API. That was a lot of extra handling in an app built around keeping photos private.",
            "The root cause was running Overlook inside Expo Go, a test app with a fixed set of tools. Claude Code patched around what Expo Go was missing instead of setting up what Overlook actually needed. I didn’t think to question it. Overlook now runs on its own development build and reads photos the standard way.",
          ],
        },
        {
          title: "Cutting bulk upload",
          paragraphs: [
            "I put a lot of work into a bulk upload flow for V1 with batches to review and a way to pick up where I left off. I wanted users to control which screenshots came into the app and have Claude analyze only those.",
            "With album selection in place I cut the upload flow entirely. Choosing the album gives users that control now. New screenshots land in Untagged until users tag them by hand or send them to Claude.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "Overlook V1 did work, but **it was built for the happy path.** Nothing handled missing albums, failed saves, or a lost connection, and I didn’t know enough to tell bad code from a simple bug. Now I write a spec for each feature, review Claude Code’s plan before it writes any code, test what happens when things go wrong, and push back on poorly built code. I’m currently working on broad fixes with proper error handling and automated tests. Once those are in, I’ll improve the API prompt and finalize the UI. Eventually, I hope to make Overlook open source for all the other screenshot-loving people in this world.",
      ],
    },
  ],
};
