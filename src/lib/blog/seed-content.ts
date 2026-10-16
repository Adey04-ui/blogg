export type SeedArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  excerpt: string;
  meta: string;
  image: string;
  alt: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  daysAgo: number;
  content: string;
};

export const SEED_ARTICLES: SeedArticle[] = [
  {
    slug: "finish-the-piece",
    title: "How to write an article people actually finish",
    seoTitle: "How to write articles readers finish",
    excerpt:
      "Most posts lose the reader between the second paragraph and the first subheading. Structure is a kindness, not a trick.",
    meta: "A practical structure for articles people finish: promise, proof, and a next step that respects the reader’s time.",
    image: "/media/desk.jpg",
    alt: "A sunlit oak desk with a notebook, tea, and a pen beside a window",
    author: "adaeze-okonkwo",
    category: "craft",
    tags: ["writing", "typography"],
    featured: true,
    daysAgo: 2,
    content: `A finished article is not a long one. It is an article whose next sentence keeps earning the one before it. Independent sites often do the opposite: they open with a definition nobody asked for, wander through three anecdotes, and bury the useful part under a subscribe box.

## Start with the job, not the topic

The topic of this piece could be “content quality.” The job is narrower. Someone has a draft that looks finished and still feels unread. They need a way to tell, before they hit publish, whether a stranger will reach the end.

Write the job in one sentence and put it above the draft, where you can see it. If a paragraph does not help that sentence, it is a note to yourself. Notes belong in a notebook. Readers came for the job.

## Give the piece a spine

A reliable spine for an essay of this length has four parts:

1. The concrete problem, in the reader’s words.
2. Why the usual fix fails.
3. A method they can try on the next draft.
4. A short example that shows the method under pressure.

That is not a formula for virality. It is a way to keep your own attention honest. When you know the fourth part is coming, you stop adding a fifth introduction.

## Cut the throat-clearing

Read only the first 120 words. If they could sit on any other article on the same subject, they are throat-clearing. “In today’s fast-paced digital landscape” is throat-clearing. So is a history of the printing press when the reader wants to fix a headline.

Replace the opening with a scene or a stake. A scene: a draft, a tab, a person about to leave. A stake: what it costs them if the piece stays vague. Then get to the method.

## Subheadings are promises

A subheading is a contract. “Give the piece a spine” tells the reader what the next section will do. If the section does something else, rename it or rewrite it. Search engines use headings as clues, but readers use them as a table of contents they did not ask to open. Both deserve the truth.

For a deeper look at how those headings help someone move through a site, see [internal links as a reading tool](/journal/internal-links-for-readers).

## End on a next action

The last paragraph should name one action that fits in a single sitting. Not “build a content empire.” Something like: print the draft, highlight every sentence that does not serve the job sentence, and delete the highlighted ones before you add anything new.

> Finish is a feeling the reader has, not a word count you hit.

If you want the same care applied to the page itself, [type that survives a phone](/journal/type-on-a-phone) is the companion piece. The words can be good and still be hard to read.`,
  },
  {
    slug: "vitals-for-publishers",
    title: "Core Web Vitals, explained for people who publish",
    seoTitle: "Core Web Vitals for publishers",
    excerpt:
      "LCP, INP, and CLS are not a leaderboard. They describe whether the page stays still, appears quickly, and answers a tap.",
    meta: "A publisher’s guide to Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift without the jargon.",
    image: "/media/hands.jpg",
    alt: "Hands holding a printed page near a bright window",
    author: "jonah-pell",
    category: "search",
    tags: ["web-vitals", "mobile"],
    featured: false,
    daysAgo: 6,
    content: `Search reports a handful of numbers about how a page feels. They are not a ranking guarantee, and they are not a design award. They answer three questions a reader could ask without knowing the names: Did the main thing show up quickly? Did the page jump while I was trying to read? Did the screen respond when I tapped?

## Largest Contentful Paint

Largest Contentful Paint, or LCP, marks when the biggest visible element finishes painting. On a journal that is usually the hero photograph or the headline block. A slow LCP often means the image is heavier than it needs to be, the font blocks the text, or the server waits on a database call before it can send HTML.

What helps in practice:

- Send the article HTML from the server, with the words already in it.
- Give the hero image a real width and height so the browser can reserve space.
- Do not lazy-load the first picture. Lazy-load the ones below the fold.
- Avoid a pile of scripts before the story.

## Interaction to Next Paint

Interaction to Next Paint, or INP, watches how long the page takes to show a response after a tap or click. Heavy menus, third-party ad scripts, and chat widgets are common causes. A quiet reading page should need very little JavaScript. Save the interactive code for the desk, the consent choice, and the occasional chart.

If an advertisement must be on the page, load it after the story has painted, and do not let it push the text down once the reader has started. That is a layout problem as much as a speed problem.

## Cumulative Layout Shift

Cumulative Layout Shift, or CLS, adds up unexpected movement. Images without dimensions, late fonts, and ad slots that collapse and then expand are the usual suspects. Reserve the space. Use a font that can swap without a dramatic jump, or a fallback with a similar size.

## What these numbers are not

A green report does not mean the article is good. A red one does not mean the site is doomed. Field data, from real visits, matters more than a single lab test on a laptop. Treat the report as a list of frictions, fix the ones readers would notice, and measure again. The unglamorous version of this work is in [being found](/journal/unglamorous-search).`,
  },
  {
    slug: "privacy-page-that-holds",
    title: "A privacy page that actually holds",
    seoTitle: "Write a privacy page that holds up",
    excerpt:
      "Readers and ad partners both look for a plain account of what the site stores. Vague reassurance reads like a missing page.",
    meta: "What a small publisher should say about analytics, ads, cookies, and contact mail — without pretending to be a law firm.",
    image: "/media/library.jpg",
    alt: "Clothbound books on library shelves in warm side light",
    author: "mira-chen",
    category: "publishing",
    tags: ["privacy", "adsense"],
    featured: false,
    daysAgo: 9,
    content: `A privacy page is a description of the site’s behavior, not a costume. If you run advertising or measure visits, say so in words a tired person can follow. If you do not sell personal data, say that too, and do not bury it under a wall of definitions copied from a company that does something else entirely.

## Name the categories, not every cookie

Group what the site does:

- Pages and files needed to show the journal.
- A first-party note of which articles were opened, stored without a raw IP address.
- Optional advertising and measurement, which wait for a choice where the law or your own policy requires one.
- Messages people send on purpose through the contact form.

That is enough structure for a small publication. You can name a specific product, such as Google AdSense or Google Analytics, when it is actually in use. Do not list tools you turned off last year.

## Say how long, and how to reach you

Retention can be simple. “We keep contact messages so we can reply, and we delete them when the conversation is over.” “We keep aggregated visit counts to understand which essays are read.” Give a real email. A privacy page with no person at the end of it feels like a locked door.

## Separate choice from the story

Consent, if you ask for it, should be a clear yes and a clear no. It should not hide the article, shake the screen, or pretend that “continue” means “accept everything” in six-point type. Advertising has to look like advertising. The essay has to look like an essay. Mixing them is how readers stop trusting both.

This is not legal advice. Laws differ by country, and a template cannot know your contracts. Use the page to tell the truth you can stand behind, then ask a qualified person to read it if you are unsure. The sister page on this site is the [disclaimer](/disclaimer), which says the same thing in public.

If you are deciding whether ads belong here at all, read [what original means when ads pay the bills](/journal/original-enough) before you add another unit.`,
  },
  {
    slug: "internal-links-for-readers",
    title: "Internal links are a reading tool",
    seoTitle: "Internal links that help readers",
    excerpt:
      "A link in the middle of a paragraph should answer a question the reader just had, not fill a quota.",
    meta: "How to link between your own articles so people keep reading, and crawlers can understand the site without a trick.",
    image: "/media/press.jpg",
    alt: "Metal letterpress type in a composing stick inside a print workshop",
    author: "jonah-pell",
    category: "search",
    tags: ["linking", "writing"],
    featured: false,
    daysAgo: 13,
    content: `Internal links became a chore because people were told to add them, not why a reader would tap them. The useful test is local. At this sentence, is there a specific gap a patient person might want filled? If yes, link to the piece that fills it. If you are linking because a checklist said “three internal links,” you are writing for the checklist.

## Anchor text should say where it goes

“Click here” says nothing. “Core Web Vitals, in publisher language” says enough to decide. The words inside the link are also what many people scan. Make them a short title, not a wink.

Use the real address of the article and keep it stable. If the address must change, redirect the old one. A link that 404s is a broken promise, including the ones inside your own archive. This journal keeps those redirects on purpose; see [the unglamorous work of being found](/journal/unglamorous-search).

## Link from the strong page to the new one, and back

A new essay has no reputation of its own. An older essay that already matches the question can point to it in a sentence that was true anyway. The new essay should point back only when the older one helps, not as a tax.

Do not build a page whose only purpose is to be a pile of links. Archives, categories, and tags can be real pages: a sentence about what the group is, then the work itself. That is a library, not a doorway with nothing behind it.

## Related stories are an editorial act

A “related” row at the end is fine when a person chose those neighbors. Automatic neighbors are fine when they share a real subject. Either way, three careful links beat eight random ones. The reader is deciding whether to stay. Help them choose, then let them go.

> A site that only points outward is a brochure. A site that only points inward is a maze. Point where the next honest question is.`,
  },
  {
    slug: "original-enough",
    title: "What “original” means when ads pay the bills",
    seoTitle: "Original content for ad-supported sites",
    excerpt:
      "Rewriting the top result in thinner words is not a publication. Original, here, means a person stood behind a useful claim.",
    meta: "How small publishers can think about original content, AdSense policies, and usefulness without treating approval as a promise.",
    image: "/media/pen.jpg",
    alt: "A fountain pen, olive sprig, and folded letter on dark wood",
    author: "adaeze-okonkwo",
    category: "publishing",
    tags: ["adsense", "writing"],
    featured: true,
    daysAgo: 16,
    content: `Advertising programs ask for content that is useful to a person who arrived on purpose. They do not owe anyone an account, and a clean technical setup does not compel an approval. The decision sits with the program. What you can control is whether the site would still be worth opening if the ad units vanished tomorrow.

## Useful is specific

A useful page answers a real question with enough detail to act. “SEO is important” is not useful. “Put the job of the article in one sentence and delete paragraphs that do not serve it” is useful, because someone can try it today. Specific does not mean long. A short page that settles the question beats a long page that restates it.

## Original is accountable

You do not need a private invention in every paragraph. You do need a point of view that is yours: what you tried, what you refused, what you would tell a friend who asked. Quoting a public document is fine. Pretending a paraphrase of ten other blogs is a reported piece is how sites get thin in a hurry.

Add your name. Add a way to write to you. Correct the article when you learn you were wrong, and show the updated date. Accountability is a publishing habit, not a schema tag.

## Ads are guests

If you do run ads, they are guests in a room that already has a purpose. A reader should be able to tell the essay from the placement without squinting. Do not pop a unit over the text, do not slide a fake button next to a real one, and do not ask for a click. Programs forbid misleading placements because readers hate them, not because the rule is decorative.

Keep a [privacy page](/privacy) that matches the code, a contact path, and enough articles that the homepage is not a single post surrounded by units. Then apply if you want to. Expect a review. Do not treat a checklist, including the one in this journal’s desk, as a promise.

The money question, separate from approval, is in [estimating revenue without lying to yourself](/journal/honest-revenue).`,
  },
  {
    slug: "type-on-a-phone",
    title: "Type that survives a phone screen",
    seoTitle: "Mobile typography for long reading",
    excerpt:
      "A phone is a narrow column with a bright thumb. The type has to work there before it looks clever on a desktop.",
    meta: "Line length, size, contrast, and image behavior for essays people read on a phone.",
    image: "/media/headland.jpg",
    alt: "A wooden bench on a coastal path facing a pale sea at first light",
    author: "mira-chen",
    category: "craft",
    tags: ["typography", "mobile"],
    featured: false,
    daysAgo: 20,
    content: `Most of the people who find an independent journal will read it on a phone, standing somewhere they did not plan to stay. The type does not need to be fashionable. It needs to stay comfortable for six minutes.

## Size and measure

Body text around 18 or 19 pixels, with a line height near 1.6, is a reasonable start for a serif on a small screen. The line itself should not run the full width of a large monitor; a measure near 65 characters is easier to track back to the start of the next line. On a phone the screen already enforces a short measure. On a laptop you have to enforce it yourself.

Headlines can be expressive. Body text should be boring in the best way: familiar shapes, clear counters, no light weight that disappears in sunlight.

## Contrast is not a mood

Grey text on a grey card looks designed and reads poorly outside. Aim for a dark ink on a paper background, and check both in a bright room and in a dark one. If you offer a dark theme, do not invert thoughtlessly. A near-black paper and a warm off-white ink is kinder than pure white on pure black.

Links need a cue besides color, because color is not reliable for everyone. An underline, or a clear weight change plus an underline on hover, keeps the link visible.

## Pictures should not shove the text

Give every image its ratio in CSS or with width and height attributes. The hero can be eager. Everything else can wait. A photograph that loads late and pushes the paragraph you were reading is a failure of manners, not a flourish.

Buttons and links that people tap should be large enough for a thumb, with space around them. A theme switch the size of a punctuation mark will be mis-tapped.

The writing advice that pairs with this is [how to finish the piece](/journal/finish-the-piece). Readable type cannot rescue a piece that never gets to the point, and a tight piece still fails if the type is a strain.`,
  },
  {
    slug: "unglamorous-search",
    title: "The unglamorous work of being found",
    seoTitle: "Technical SEO for a small journal",
    excerpt:
      "Titles, descriptions, a sitemap, stable addresses, and a habit of fixing what broke. None of it is magic, and none of it is optional.",
    meta: "A practical SEO routine for a small site: titles, canonicals, sitemaps, redirects, and structured data without superstition.",
    image: "/media/rain.jpg",
    alt: "A quiet city street after rain, with shop lamps reflected on wet stone",
    author: "adaeze-okonkwo",
    category: "search",
    tags: ["linking", "web-vitals"],
    featured: false,
    daysAgo: 24,
    content: `Search engines can read a normal page. You do not need to speak to them in a special voice. You do need to stop getting in their way, and stop getting in the reader’s way at the same time.

## One title, one description, one address

Each public URL should have a title that names the piece and a description that says why it is worth opening. The title in the browser tab and the title on the page can differ slightly, but they should not argue. The description is not a keyword list. It is a sentence.

Pick one address as canonical and mean it. If the same essay is reachable two ways, choose one. When a slug changes, redirect the old address with a permanent redirect so the history of the link survives. Delete the redirect only when you are sure nothing still uses it. That includes your own older essays. [Internal links](/journal/internal-links-for-readers) rot quietly.

## Pages that should not compete

Search results for your own site search, the desk where you edit, and thank-you states do not belong in an index. Mark them noindex. Leave the essays, the category archives, the about page, and the policy pages available. A sitemap that lists the public URLs, and a robots.txt that points to the sitemap, is the boring half of the job. Submit the sitemap in Google Search Console when you have verified the site. Verification is a meta tag or a file you control. It is not a ranking.

## Structured data is a label, not a boost

A BlogPosting object can tell a machine the headline, the date, the author, and the image. It should match the page. Do not mark a page as a review or a product if it is an essay. Breadcrumbs help a reader see where they are; the matching structured data should describe those same crumbs.

## Routine, not a ritual

Once a month, open the coverage report, look for excluded pages you meant to include, click a sample of articles on a phone, and fix the broken links you find. Speed work belongs in that same hour. [Core Web Vitals](/journal/vitals-for-publishers) are part of the routine, not a separate religion.

None of this promises a position. It makes the site legible. Legible is the part you can finish.`,
  },
  {
    slug: "honest-revenue",
    title: "Estimating ad revenue without lying to yourself",
    seoTitle: "How to estimate ad revenue honestly",
    excerpt:
      "Page views are not a paycheck. A page RPM is a guess until a report says otherwise.",
    meta: "Why traffic times a guessed RPM is only a model, and how to record real advertising figures without mixing the two.",
    image: "/media/harbor.jpg",
    alt: "Wooden boats resting in a still harbor at dawn",
    author: "jonah-pell",
    category: "measurement",
    tags: ["analytics", "adsense"],
    featured: false,
    daysAgo: 30,
    content: `It is tempting to multiply yesterday’s page views by a number you saw on a forum and call the result “earnings.” That number is a story about someone else’s ads, in someone else’s countries, in someone else’s season. Your figure will differ. Geography, advertiser demand, viewability, invalid traffic, and whether an ad rendered at all all sit between a visit and a deposit.

## Two columns, never one

Keep two ideas apart.

The first is a model. Pick an assumed page RPM, which means revenue per thousand page views, and write it down as an assumption. The arithmetic is simple:

Estimated revenue = (page views ÷ 1,000) × assumed page RPM.

Label it as a model every time you show it. Change the assumption in the open, not in a footnote nobody sees. If you include sample or historical demo traffic in the page-view count, say that too. A model fed with imaginary visits is imaginary twice.

The second column is recorded revenue. That is a number you typed from an official report, or a number an official reporting API returned into your own database. It has a date range. It may have impressions. Impression RPM, when you truly have impressions, is revenue per thousand impressions, not per thousand page views. Many page views never become an impression. Do not rename one into the other.

## What a model is good for

A model is good for a conversation: “If the page RPM stayed near this assumption, this week’s traffic would be worth about this much, before adjustments.” It is a bad forecast and a worse tax document. Use it to decide whether a topic is worth the evening, not to tell a partner what cleared the bank.

## What to collect instead of hope

If a reporting API is available and you are allowed to connect it, store the returned totals and keep them labeled as reported. If it is not, enter the totals by hand from the product you actually use. Note the day, the amount, and, when you know it, the article. Leave the cell blank rather than invent a figure to make a chart look alive.

This journal’s desk follows that split on purpose. The model updates when you change the assumed RPM. The recorded rows stay empty until you import or type them. Neither column is a promise from an ad network.

For the content side of the same decision, [original work and advertising](/journal/original-enough) is the piece to read next. For the measurement of visits themselves, keep the method written down where you can see it. A number without a method is just a mood.`,
  },
];
