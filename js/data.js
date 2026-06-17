// dcoric.dev ARCADE - all profile content lives here.
// Sourced from dcoric.dev + github.com/dcoric README.
window.DATA = {
  player: {
    name: "Denis Ćorić",
    handle: "dcoric",
    title: "Full-Stack Engineer",
    guild: "G-Research",
    location: "Belgrade, Serbia",
    avatarUrl: "https://avatars.githubusercontent.com/u/5342224?v=4",
    tagline:
      "Building resilient trading platforms, developer tools, and open-source infrastructure.",
    level: 10,
    yearsXp: "10+ Years of experience",
    repos: "60+ Public repositories",
    orgs: "4+ OSS organizations",
  },

  about: {
    heading: "Crafting software with purpose and precision",
    body: [
      "I'm a senior engineer at G-Research in Belgrade, Serbia, where I build reliable trading and data platforms. My work spans from architecting React/Next.js frontends to designing Node.js services and cloud-native infrastructure.",
      "I care deeply about developer experience, code quality, and the open-source community. When I'm not coding, you'll find me on the golf course or experimenting with 3D modeling and embedded hardware projects.",
    ],
    stats: [
      { label: "EXP", value: "10+ Years", icon: "⏳" },
      { label: "REPOS", value: "60+", icon: "📦" },
      { label: "GUILDS", value: "4+ OSS", icon: "🏰" },
    ],
    bio: [
      "🌍 Based in Belgrade, collaborating remotely across EU/UK time zones.",
      "🧠 10+ years spanning frontend platforms, API design, and DevOps automation.",
      "🧑‍🤝‍🧑 Leadership focus on mentoring, design systems, testing & observability culture.",
      "📬 Always open to OSS collaborations, DX initiatives, and data-heavy product work.",
    ],
    focus: [
      {
        title: "Frontend platforms",
        text: "Next.js/React architectures, performance budgets, data viz, design systems, Storybook-driven handoffs.",
      },
      {
        title: "Backend & data",
        text: "Event-driven Node.js services, GraphQL/REST APIs, PostgreSQL, Redis, serverless, security-first workflows.",
      },
      {
        title: "DevEx & platform enablement",
        text: "CI/CD, policy automation, traceability, and tooling that helps teams ship faster without sacrificing quality.",
      },
    ],
  },

  // Skills rendered as a skill tree / armory with levels.
  skills: {
    groups: [
      {
        name: "Frontend",
        color: "#5ad2ff",
        skills: [
          { name: "TypeScript", level: 10 },
          { name: "React", level: 9 },
          { name: "Next.js", level: 9 },
          { name: "Tailwind CSS", level: 8 },
          { name: "Remix", level: 7 },
          { name: "Storybook", level: 7 },
        ],
      },
      {
        name: "Backend & Data",
        color: "#7CFC8A",
        skills: [
          { name: "Node.js", level: 9 },
          { name: "REST", level: 9 },
          { name: "GraphQL", level: 8 },
          { name: "PostgreSQL", level: 8 },
          { name: "Redis", level: 7 },
          { name: "Python", level: 6 },
          { name: "Java", level: 5 },
        ],
      },
      {
        name: "Platform & Ops",
        color: "#ffd166",
        skills: [
          { name: "AWS", level: 8 },
          { name: "Docker", level: 8 },
          { name: "GitHub Actions", level: 8 },
          { name: "Grafana", level: 8 },
          { name: "Kubernetes", level: 7 },
          { name: "OpenTelemetry", level: 7 },
          { name: "Terraform", level: 6 },
        ],
      },
      {
        name: "Embedded",
        color: "#ff7ad9",
        skills: [
          { name: "C", level: 6 },
          { name: "ESP32", level: 5 },
          { name: "LVGL", level: 5 },
        ],
      },
    ],
  },

  // Projects as quest cards.
  projects: [
    {
      id: "reportpilot",
      name: "ReportPilot",
      tagline: "AI-powered NL-to-SQL reporting workspace.",
      desc: "Ask questions in plain language, inspect generated SQL, run safe read-only queries, and schedule report delivery.",
      tags: ["TypeScript", "AI / NLP", "SQL"],
      difficulty: 4,
      reward: 850,
      link: "https://github.com/dcoric/report-pilot",
    },
    {
      id: "traceviewer",
      name: "Grafana Trace Viewer",
      tagline: "Incremental distributed trace analysis.",
      desc: "Grafana plugin for incremental distributed trace analysis. Supports Tempo API and custom production backends for complex observability workflows.",
      tags: ["TypeScript", "Grafana", "Observability"],
      difficulty: 4,
      reward: 900,
      link: "https://github.com/G-Research/grafana-incremental-trace-viewer",
    },
    {
      id: "gitproxy",
      name: "Git Proxy",
      tagline: "Enterprise Git push protection & compliance.",
      desc: "FINOS project enforcing customizable Git push protections and compliance policies. Essential for regulated industries requiring audit trails.",
      tags: ["TypeScript", "Security", "FINOS"],
      difficulty: 5,
      reward: 1200,
      link: "https://github.com/finos/git-proxy",
    },
    {
      id: "redstone",
      name: "Redstone",
      tagline: "Cross-platform knowledge management.",
      desc: "Knowledge management app inspired by Obsidian. Markdown file storage, editing, and sync across web and mobile platforms.",
      tags: ["TypeScript", "React", "Cross-platform"],
      difficulty: 3,
      reward: 600,
      link: "https://github.com/dcoric/redstone",
    },
    {
      id: "weatherstation",
      name: "Weather Station",
      tagline: "ESP32 TFT weather display with LVGL.",
      desc: "ESP32 weather display with 2.8\" TFT LCD using the LVGL graphics library. A hardware project blending embedded C with beautiful UI.",
      tags: ["C", "ESP32", "LVGL"],
      difficulty: 3,
      reward: 550,
      link: "https://github.com/dcoric/weather-station",
    },
    {
      id: "newsfeed",
      name: "News Feed",
      tagline: "Real-time breaking news aggregation.",
      desc: "Breaking news aggregation platform with multi-source article search. Real-time access to news content from sources and blogs worldwide.",
      tags: ["TypeScript", "API", "Real-time"],
      difficulty: 2,
      reward: 400,
      link: "https://github.com/dcoric/news-feed",
    },
    {
      id: "ipgeo",
      name: "IP Geolocation",
      tagline: "Drop-in GeoIP enrichment at the edge.",
      desc: "GeoIP enrichment service combining Cloudflare headers, MaxMind fallbacks, and resilient caching strategies for edge workloads.",
      tags: ["TypeScript", "Edge", "Caching"],
      difficulty: 3,
      reward: 500,
      link: "https://github.com/dcoric/ip-geolocation",
    },
    {
      id: "yunikornhs",
      name: "YuniKorn History Server",
      tagline: "K8s scheduler historical data service.",
      desc: "Historical data service for K8s clusters using the YuniKorn scheduler, built with Go. My first open-source project.",
      tags: ["Go", "Kubernetes", "Data"],
      difficulty: 3,
      reward: 450,
      link: "https://github.com/dcoric/yunikorn-history-server",
    },
  ],

  // Open source "guilds" contributed to.
  oss: [
    {
      org: "FINOS",
      name: "git-proxy",
      role: "Core Contributor",
      desc: "Enterprise Git push protection and compliance policy enforcement.",
      link: "https://github.com/finos/git-proxy",
      badge: "🛡️",
    },
    {
      org: "Apache",
      name: "YuniKorn Web",
      role: "Contributor",
      desc: "Cluster scheduling visualization and developer experience improvements.",
      link: "https://github.com/apache/yunikorn-web",
      badge: "🪶",
    },
    {
      org: "Spotify",
      name: "Backstage",
      role: "Contributor",
      desc: "Open platform for building developer portals.",
      link: "https://github.com/backstage/backstage",
      badge: "🎸",
    },
    {
      org: "G-Research",
      name: "Grafana Plugins",
      role: "Maintainer",
      desc: "Incremental trace viewer for distributed system observability.",
      link: "https://github.com/G-Research/grafana-incremental-trace-viewer",
      badge: "📊",
    },
  ],

  // GitHub achievements + custom in-game achievements.
  achievements: [
    {
      id: "pullshark",
      name: "Pull Shark",
      tier: "x3",
      desc: "Opened pull requests that were merged upstream.",
      icon: "🦈",
      source: "GitHub",
    },
    {
      id: "pair",
      name: "Pair Extraordinaire",
      tier: "x2",
      desc: "Co-authored commits with fellow adventurers.",
      icon: "🤝",
      source: "GitHub",
    },
    {
      id: "yolo",
      name: "YOLO",
      tier: "",
      desc: "Merged a pull request without review. Living dangerously.",
      icon: "🎲",
      source: "GitHub",
    },
    {
      id: "quickdraw",
      name: "Quickdraw",
      tier: "",
      desc: "Closed an issue or PR within 5 minutes of opening.",
      icon: "⚡",
      source: "GitHub",
    },
    // In-game achievements unlocked by playing.
    { id: "explorer", name: "Cartographer", tier: "", desc: "Discovered every location on the world map.", icon: "🗺️", source: "Game", hidden: false },
    { id: "scholar", name: "Scholar", tier: "", desc: "Read every quest on the Quest Board.", icon: "📜", source: "Game", hidden: false },
    { id: "armorer", name: "Armorer", tier: "", desc: "Inspected every skill tree branch.", icon: "⚔️", source: "Game", hidden: false },
    { id: "guildmaster", name: "Guildmaster", tier: "", desc: "Visited every open-source guild.", icon: "🏰", source: "Game", hidden: false },
    { id: "konami", name: "The Konami Code", tier: "", desc: "↑↑↓↓←→←→ B A — you know the rest.", icon: "🎮", source: "Game", hidden: true },
    { id: "social", name: "Connected", tier: "", desc: "Opened a channel from the Mailbox.", icon: "📬", source: "Game", hidden: false },
  ],

  contact: [
    { label: "GitHub", handle: "@dcoric", url: "https://github.com/dcoric", icon: "💻" },
    { label: "LinkedIn", handle: "coricdenis", url: "https://www.linkedin.com/in/coricdenis", icon: "💼" },
    { label: "X / Twitter", handle: "@_dcoric_", url: "https://x.com/_dcoric_", icon: "🐦" },
    { label: "Portfolio", handle: "dcoric.dev", url: "https://dcoric.dev", icon: "🌐" },
  ],

  toolbox: {
    Frontend: ["React", "Next.js", "Remix", "Tailwind", "Styled Components", "CSS/Sass", "Storybook", "Testing Library", "Jest"],
    "Backend & Data": ["Node.js", "TypeScript", "Python", "Java", "GraphQL", "REST", "gRPC", "PostgreSQL", "MongoDB", "Redis"],
    "Platform & Ops": ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Argo", "Grafana", "Tempo", "OpenTelemetry"],
  },
};
