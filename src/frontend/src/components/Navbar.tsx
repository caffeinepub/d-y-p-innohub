import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import UploadProjectModal from "./UploadProjectModal";

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (e: any) {
        if (e?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const principal = identity?.getPrincipal().toString();
  const displayName =
    profile?.displayName ||
    (principal ? `${principal.slice(0, 8)}...` : "User");

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.18 0.04 240), oklch(0.26 0.06 230))",
        }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
            <img
              src="/assets/generated/innohub-logo-transparent.dim_80x80.png"
              alt="D.Y.P.InnoHub Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-white font-bold text-lg leading-none">
                D.Y.P.InnoHub
              </span>
              <span className="text-white/60 text-[10px] leading-none">
                D.Y.Patil Pratishtan's College of Engineering
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              data-ocid="nav.link"
            >
              Explore
            </Link>
            <a
              href="/#community"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              data-ocid="nav.link"
            >
              Community
            </a>
            <a
              href="/#about"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              data-ocid="nav.link"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Button
                onClick={() => setUploadOpen(true)}
                className="rounded-full text-foreground font-semibold text-sm px-4 py-1.5 h-auto hidden sm:flex"
                style={{ background: "oklch(0.82 0.1 55)" }}
                data-ocid="nav.open_modal_button"
              >
                + Upload Project
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" data-ocid="nav.link">
                  <Avatar className="w-8 h-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAuth}
                  className="text-white/70 hover:text-white hover:bg-white/10 hidden md:flex"
                  data-ocid="nav.button"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleAuth}
                disabled={loginStatus === "logging-in"}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="nav.button"
              >
                {loginStatus === "logging-in" ? "Logging in..." : "Login"}
              </Button>
            )}

            <button
              type="button"
              className="md:hidden text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.toggle"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="md:hidden border-t border-white/10"
            style={{ background: "oklch(0.18 0.04 240)" }}
          >
            <div className="container px-4 py-4 flex flex-col gap-3">
              <Link
                to="/"
                className="text-white/80 text-sm py-1"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                Explore
              </Link>
              <button
                type="button"
                className="text-white/80 text-sm py-1 text-left"
                onClick={() => {
                  window.location.href = "/#community";
                  setMobileOpen(false);
                }}
                data-ocid="nav.link"
              >
                Community
              </button>
              <button
                type="button"
                className="text-white/80 text-sm py-1 text-left"
                onClick={() => {
                  window.location.href = "/#about";
                  setMobileOpen(false);
                }}
                data-ocid="nav.link"
              >
                About
              </button>
              {isAuthenticated && (
                <Button
                  onClick={() => {
                    setUploadOpen(true);
                    setMobileOpen(false);
                  }}
                  className="rounded-full text-foreground font-semibold text-sm w-fit"
                  style={{ background: "oklch(0.82 0.1 55)" }}
                  data-ocid="nav.open_modal_button"
                >
                  + Upload Project
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {uploadOpen && (
        <UploadProjectModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </>
  );
}
