import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Project } from "../backend.d";
import CommunitySection from "../components/CommunitySection";
import ProjectCard from "../components/ProjectCard";
import { useGetProjects } from "../hooks/useQueries";

const CATEGORIES = [
  "All",
  "Technology",
  "Science",
  "Art & Design",
  "Engineering",
  "Business",
  "Other",
];
const POPULAR_TAGS = [
  "AI",
  "Machine Learning",
  "Robotics",
  "Sustainability",
  "IoT",
  "3D Printing",
  "Data Science",
  "Blockchain",
];

const SAMPLE_PROJECTS: Project[] = [
  {
    id: BigInt(1),
    title: "AI-Powered Smart Study Assistant",
    authorId: {} as any,
    authorName: "Priya Sharma",
    createdAt: BigInt(Date.now()),
    tags: ["AI", "Education", "NLP"],
    description:
      "A personalized study assistant that adapts to individual learning styles using natural language processing to summarize textbooks and generate quizzes.",
    likedBy: [{} as any, {} as any, {} as any],
    innovationSummary:
      "Combines GPT-based summarization with spaced repetition algorithms to increase retention by 40%.",
    viewCount: BigInt(312),
    commentCount: BigInt(18),
    category: "Technology",
    fileBlobIds: [],
  },
  {
    id: BigInt(2),
    title: "Biodegradable Microplastic Filter",
    authorId: {} as any,
    authorName: "Miguel Torres",
    createdAt: BigInt(Date.now()),
    tags: ["Sustainability", "Environmental", "Chemistry"],
    description:
      "A novel filtration material made from agricultural waste that captures microplastics from wastewater with 94% efficiency.",
    likedBy: [{} as any, {} as any],
    innovationSummary:
      "First biodegradable filter medium derived from rice husk that outperforms synthetic alternatives.",
    viewCount: BigInt(248),
    commentCount: BigInt(11),
    category: "Science",
    fileBlobIds: [],
  },
  {
    id: BigInt(3),
    title: "Haptic Feedback Prosthetic Hand",
    authorId: {} as any,
    authorName: "Yuki Tanaka",
    createdAt: BigInt(Date.now()),
    tags: ["Bioengineering", "3D Printing", "Robotics"],
    description:
      "A low-cost 3D-printed prosthetic hand with embedded pressure sensors that transmit tactile feedback to the residual limb via vibration motors.",
    likedBy: [{} as any, {} as any, {} as any, {} as any],
    innovationSummary:
      "Reduces prosthetic cost by 80% while adding sensory feedback functionality previously only found in $50,000+ devices.",
    viewCount: BigInt(501),
    commentCount: BigInt(32),
    category: "Engineering",
    fileBlobIds: [],
  },
  {
    id: BigInt(4),
    title: "Generative Urban Mural Designer",
    authorId: {} as any,
    authorName: "Amara Osei",
    createdAt: BigInt(Date.now()),
    tags: ["Generative Art", "Urban Design", "AI"],
    description:
      "An interactive tool that uses Stable Diffusion fine-tuned on local cultural motifs to help communities co-design public murals.",
    likedBy: [{} as any],
    innovationSummary:
      "Democratizes public art creation by enabling non-artists to participate in urban beautification through AI.",
    viewCount: BigInt(189),
    commentCount: BigInt(7),
    category: "Art & Design",
    fileBlobIds: [],
  },
  {
    id: BigInt(5),
    title: "Peer-to-Peer Campus Marketplace",
    authorId: {} as any,
    authorName: "Carlos Reyes",
    createdAt: BigInt(Date.now()),
    tags: ["Blockchain", "Business", "Web3"],
    description:
      "A decentralized marketplace for students to buy, sell, and rent textbooks and equipment using smart contracts to eliminate platform fees.",
    likedBy: [{} as any, {} as any],
    innovationSummary:
      "Saves the average student $400/year on textbooks through trustless peer transactions.",
    viewCount: BigInt(276),
    commentCount: BigInt(14),
    category: "Business",
    fileBlobIds: [],
  },
  {
    id: BigInt(6),
    title: "Vertical Hydroponic Farm Controller",
    authorId: {} as any,
    authorName: "Fatima Al-Hassan",
    createdAt: BigInt(Date.now()),
    tags: ["IoT", "Agriculture", "Sustainability"],
    description:
      "An IoT system for monitoring and automating indoor vertical farms: nutrient dosing, LED spectrum control, and yield prediction using ML.",
    likedBy: [{} as any, {} as any, {} as any],
    innovationSummary:
      "Increases crop yield by 60% and reduces water usage by 85% vs. traditional farming.",
    viewCount: BigInt(398),
    commentCount: BigInt(21),
    category: "Technology",
    fileBlobIds: [],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: projects, isLoading } = useGetProjects(
    activeCategory === "All" ? undefined : activeCategory,
    search || undefined,
  );

  const displayProjects =
    projects && projects.length > 0
      ? projects
      : SAMPLE_PROJECTS.filter((p) => {
          const catMatch =
            activeCategory === "All" || p.category === activeCategory;
          const searchMatch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
          return catMatch && searchMatch;
        });

  const handleSearch = () => setSearch(searchInput);

  return (
    <div>
      <section
        className="relative min-h-[420px] flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-students.dim_1600x700.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 240 / 0.82), oklch(0.3 0.1 185 / 0.70))",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/70 text-sm font-medium mb-2 tracking-widest uppercase"
          >
            D.Y.Patil Pratishtan's College of Engineering
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          >
            D.Y.P.InnoHub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/80 text-lg mb-8 max-w-xl mx-auto"
          >
            A platform for students to showcase projects, collaborate, and turn
            ideas into reality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-2 max-w-xl mx-auto mb-8"
          >
            <Input
              placeholder="Search projects, topics, innovations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 rounded-full h-12 px-5 bg-white text-foreground placeholder:text-muted-foreground border-0 shadow-md"
              data-ocid="hero.search_input"
            />
            <Button
              onClick={handleSearch}
              className="rounded-full h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="hero.button"
            >
              <Search className="w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Button
              onClick={() =>
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full px-8 h-11 bg-primary text-primary-foreground font-semibold"
              data-ocid="hero.primary_button"
            >
              Browse Projects
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/profile" })}
              className="rounded-full px-8 h-11 border-white text-white hover:bg-white hover:text-foreground font-semibold"
              data-ocid="hero.secondary_button"
            >
              Share Your Work
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="projects" className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-56 flex-shrink-0">
              <div className="bg-card rounded-xl shadow-card p-5 mb-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">
                  Categories
                </h3>
                <ul className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}
                        data-ocid="sidebar.tab"
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      onClick={() => {
                        setSearchInput(tag);
                        setSearch(tag);
                      }}
                      data-ocid="sidebar.toggle"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-foreground">
                  {activeCategory === "All" ? "All Projects" : activeCategory}
                  {search && (
                    <span className="text-muted-foreground font-normal text-base ml-2">
                      for &ldquo;{search}&rdquo;
                    </span>
                  )}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {displayProjects.length} projects
                </span>
              </div>

              {isLoading ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  data-ocid="projects.loading_state"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden">
                      <Skeleton className="h-36 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayProjects.length === 0 ? (
                <div
                  className="text-center py-16 text-muted-foreground"
                  data-ocid="projects.empty_state"
                >
                  <p className="text-lg font-medium mb-2">No projects found</p>
                  <p className="text-sm">Try a different search or category</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.06 } },
                    hidden: {},
                  }}
                >
                  {displayProjects.map((project, i) => (
                    <motion.div
                      key={project.id.toString()}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <ProjectCard project={project} index={i + 1} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CommunitySection />

      <section id="about" className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            D.Y.P.InnoHub
          </h2>
          <p className="text-primary text-sm font-medium mb-4">
            D.Y.Patil Pratishtan's College of Engineering
          </p>
          <p className="text-muted-foreground leading-relaxed">
            D.Y.P.InnoHub is a collaborative platform built for students of
            D.Y.Patil Pratishtan's College of Engineering to showcase their
            academic projects, research, and innovations. Whether you&apos;re
            building an AI model, designing sustainable solutions, or creating
            art, this is your space to share, inspire, and connect with fellow
            innovators.
          </p>
        </div>
      </section>
    </div>
  );
}
