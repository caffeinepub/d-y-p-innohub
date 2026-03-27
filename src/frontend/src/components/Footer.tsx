import { GraduationCap } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);

  return (
    <footer
      className="text-white/70 text-sm"
      style={{ background: "oklch(0.18 0.04 240)" }}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold">D.Y.P.InnoHub</span>
                <span className="text-white/50 text-[10px]">
                  D.Y.Patil Pratishtan's College of Engineering
                </span>
              </div>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              A platform for students to share ideas,
              <br />
              collaborate, and inspire innovation.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  All Projects
                </a>
              </li>
              <li>
                <a
                  href="/#community"
                  className="hover:text-white transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Profile
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">
              Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="/?category=Technology"
                  className="hover:text-white transition-colors"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="/?category=Science"
                  className="hover:text-white transition-colors"
                >
                  Science
                </a>
              </li>
              <li>
                <a
                  href="/?category=Art+%26+Design"
                  className="hover:text-white transition-colors"
                >
                  Art &amp; Design
                </a>
              </li>
              <li>
                <a
                  href="/?category=Engineering"
                  className="hover:text-white transition-colors"
                >
                  Engineering
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">
            &copy; {year} D.Y.Patil Pratishtan's College of Engineering. Built
            with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/70 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-white/50 mt-1">
            Created by Rushiraj Amrutraj Desai
          </p>
        </div>
      </div>
    </footer>
  );
}
