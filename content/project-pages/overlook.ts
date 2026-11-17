import type { ProjectPage } from "@/features/project-page/types";

/** Transcribed from docs/design/project-page.png; draft. The two repeat "Extensive Tagging" slides are as in the mock. */
export const overlook: ProjectPage = {
  platform: "Android",
  builtWith:
    "React Native, TypeScript, Supabase, Claude API, React Query, Claude Code",
  blocks: [
    {
      type: "paragraph",
      text: "Overlook was born out of a conversation I had at a community tech demo event about AI assistants and their potential. I went home thinking about where an AI assistant could be most useful to me right now. The one area I find most tedious and demanding of my time is often large data management. I'm constantly screenshotting recipes, outfits and places, and thousands of them pile up on my phone. I wanted an app that can tag and sort them. This way I can **turn my absentminded bookmarks into a functioning library.**",
    },
    {
      type: "image-text",
      image: { alt: "[IMAGE: Overlook 1]", ratio: 3 / 1 },
      imageSide: "left",
      text: "Pinterest is the closest thing I'd found to what I needed, but it relies on static albums and doesn't organize with the depth and responsivity I wanted. Using it for my screenshots would mean uploading every one by hand. The pins I already save there get lost easily unless I painstakingly sort them into very organized boards.",
    },
    {
      type: "paragraph",
      text: "Overlook solves this with **an extensive tagging system that's fully searchable** and connects every image into one complete database. Broad categories form a organizational base and each image is allotted its own niche details on top. For example: A recipe from a Reddit post is categorized as “social” and “food”, then it's also tagged with its cuisine, dish, and any other identifiable details.",
    },
    {
      type: "slideshow",
      image: { alt: "[IMAGE: Overlook tagging]", ratio: 1.7 },
      imageSide: "left",
      slides: [
        {
          title: "Extensive Tagging",
          paragraphs: [
            "Pinterest solves part of this, but it relies on static albums and doesn't organize with the depth and responsivity I wanted. I have all these pins, and it's impossible to find what I want.",
          ],
        },
        {
          title: "Extensive Tagging",
          paragraphs: [
            "Pinterest solves part of this, but it relies on static albums and doesn't organize with the depth and responsivity I wanted. I have all these pins, and it's impossible to find what I want.",
          ],
        },
        {
          title: "Extensive Tagging",
          paragraphs: [
            "Pinterest solves part of this, but it relies on static albums and doesn't organize with the depth and responsivity I wanted. I have all these pins, and it's impossible to find what I want.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "two-columns",
      columns: [
        "V1 was built in a week when I was very new to coding. I first spent a few days on the spec,  the user flow, essential features and basic UX/UI. I experimented building with Claude Code for the first time. It was a frenzy of hyper fixation where every growing piece gave me extreme satisfication. It was exhilarating seeing how to turn my ideas into working code.",
        "It became close to fully matching the spec I had built and I even added some stretch features, but It had bugs I didn't know how to fix yet. These bugs became impossible and I saw that **I hit the wall of “vibe coding”.**",
      ],
    },
    {
      type: "slideshow",
      image: { alt: "[IMAGE: Overlook album problem]", ratio: 1.7 },
      imageSide: "right",
      slides: [
        {
          title: "The Album Problem",
          paragraphs: [
            "Overlook didn't know where my screenshots were. Claude Code skipped the onboarding step from my spec where you confirm which album to watch. The code guessed at an album named “Screenshots” instead. If that album didn't exist it fell back to my entire photo library including camera photos.",
          ],
        },
        {
          paragraphs: [
            "Photo access ran on workarounds Overlook never needed. Claude Code used an outdated file tool that couldn't read Android's app photos in content:// addresses. The code got around this by copying every screenshot into a temporary file before sending it to Claude's API. The code also built each address by hand to force photos to appear on phones whose photo library wouldn't look them up.",
            "I found that these workarounds came from running Overlook inside Expo Go's shared test app with its fixed set of tools. Overlook now runs on its own development build with current tools and reads photos the standard way.",
          ],
        },
        {
          paragraphs: [
            "I put a lot of work into V1's bulk upload flow with batches to review and a way to pick up where left off. I wanted the user to have control over which screenshots came into the app and have Claude analyze only those. I didn't know enough yet to see that choosing and uploading didn't have to be the same step.",
            "Now Overlook reads your album directly without any uploading. The sorting will be part of a feature of the app. Untagged screenshots are flagged until handled manually or with the API.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "paragraph",
      text: "Overlook v1 did work with uploaded images and tagging, but **V1 was built for things going right.** Claude Code didn't plan for missing albums, failed saves or lost connection. I'm currently working on broad fixes with proper error handling and testing. Overlook is still a work in progress. When the fixes are implimented I plan to improve the Claude API prompt and then finalize the UI. When this is all done I hope to make it open source for all the other screenshot happy people in this world.",
    },
  ],
};
