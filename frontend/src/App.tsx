import APIKeys from "./pages/APIKeys";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OAuthCallback from "./pages/OAuthCallback";
import Dashboard from "./pages/Dashboard";
import { APIError, getCurrentUser } from "./lib/api";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import LandingMobile from "./pages/LandingMobile";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Gauge,
  LockKeyhole,
  Network,
  Server,
  Tags,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type GlowButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  showArrow?: boolean;
  onClick?: () => void;
};

function GlowButton({
  children,
  variant = "primary",
  showArrow = true,
  onClick,
}: GlowButtonProps) {
  const variants = {
    primary: {
      className:
        "border border-white/10 bg-white text-black hover:bg-zinc-100",
      hoverShadow:
        "0 0 0 1px rgba(139,92,246,0.25), 0 0 35px rgba(139,92,246,0.22)",
      tapShadow:
        "0 0 0 2px rgba(167,139,250,0.45), 0 0 50px rgba(139,92,246,0.4)",
    },

    secondary: {
      className:
        "border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white",
      hoverShadow:
        "0 0 0 1px rgba(139,92,246,0.22), 0 0 28px rgba(139,92,246,0.18)",
      tapShadow:
        "0 0 0 2px rgba(167,139,250,0.4), 0 0 45px rgba(139,92,246,0.35)",
    },

    ghost: {
      className:
        "border border-transparent bg-transparent text-zinc-300 hover:text-white",
      hoverShadow:
        "0 0 25px rgba(139,92,246,0.15)",
      tapShadow:
        "0 0 0 1px rgba(139,92,246,0.3), 0 0 35px rgba(139,92,246,0.25)",
    },
  };

  const style = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.035,
        boxShadow: style.hoverShadow,
      }}
      whileTap={{
        scale: 0.96,
        boxShadow: style.tapShadow,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 22,
      }}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${style.className}`}
    >
      {children}

      {showArrow && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ArrowRight size={16} />
        </motion.span>
      )}
    </motion.button>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* =========================================================
          ANIMATED BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.75, 0.5],
            x: ["-50%", "-46%", "-50%"],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-[-220px] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]"
          animate={{
            y: [0, -60, 0],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle technical grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"
      >
        {/* Logo */}

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{
              boxShadow:
                "0 0 25px rgba(139,92,246,0.35)",
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 shadow-lg shadow-violet-900/20"
          >
            <ShieldCheck size={20} className="text-violet-300" />
          </motion.div>

          <span className="text-lg font-semibold tracking-tight">
            AegisFlow
          </span>
        </motion.div>

        {/* Desktop navigation */}

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {["Platform", "BYOK", "Security", "Developers", "Pricing"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              whileHover={{
                y: -2,
                color: "#ffffff",
              }}
              transition={{ duration: 0.2 }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* Authentication / CTA */}

        <div className="flex items-center gap-2 sm:gap-3">
          <GlowButton
            variant="ghost"
            showArrow={false}
            onClick={() => navigate("/login")}
          >
            Log in
          </GlowButton>

          <GlowButton
            variant="primary"
            onClick={() => navigate("/signup")}
          >
            Start Building
          </GlowButton>
        </div>
      </motion.nav>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-10">
        {/* Badge */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease,
          }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/5 px-4 py-2 text-sm text-violet-200 shadow-lg shadow-violet-950/20"
        >
          <motion.span
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap size={15} />
          </motion.span>

          AI traffic control infrastructure
        </motion.div>

        {/* Main heading */}

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-8xl"
        >
          <motion.span
            variants={{
              hidden: {
                opacity: 0,
                y: 35,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.9,
                  ease,
                },
              },
            }}
            className="block"
          >
            Control every
          </motion.span>

          <motion.span
            variants={{
              hidden: {
                opacity: 0,
                y: 35,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.9,
                  ease,
                },
              },
            }}
            className="block bg-gradient-to-r from-white via-violet-200 to-violet-500 bg-clip-text text-transparent"
          >
            AI request.
          </motion.span>
        </motion.h1>

        {/* Description */}

        <motion.p
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease,
          }}
          className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg"
        >
          AegisFlow sits between your application and AI providers,
          controlling authentication, rate limits, caching, budgets,
          reliability, and observability.
        </motion.p>

        {/* Hero CTAs */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.65,
            ease,
          }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <GlowButton
            variant="primary"
            onClick={() => navigate("/signup")}
          >
            Start building with AegisFlow
          </GlowButton>

          <GlowButton
            variant="secondary"
            onClick={() => {
              document
                .getElementById("platform")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Explore the architecture
          </GlowButton>
        </motion.div>

        {/* =========================================================
            ARCHITECTURE
        ========================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 60,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            delay: 0.9,
            ease,
          }}
          className="mt-20 w-full max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-blue-500/[0.04]" />

            <div className="relative grid gap-4 md:grid-cols-5 md:items-center">
              <ArchitectureCard
                title="Your Application"
                description="Requests enter AegisFlow"
              />

              <TrafficLine />

              <ArchitectureCard
                title="AegisFlow"
                description="Policy, cache, limits & tracing"
                highlighted
              />

              <TrafficLine />

              <ArchitectureCard
                title="AI Provider"
                description="Controlled model execution"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          PLATFORM / FEATURES
      ========================================================= */}

      <section
        id="platform"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-28 lg:px-10"
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.8,
            ease,
          }}
          className="mb-14 max-w-2xl"
        >
          <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
            <Sparkles size={15} />
            Built for AI infrastructure
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your AI traffic.
            <span className="block text-zinc-500">
              Under your control.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={<ShieldCheck size={20} />}
            title="Control"
            description="Centralize authentication, rate limits, budgets and policies."
            delay={0}
          />

          <Feature
            icon={<Gauge size={20} />}
            title="Protect"
            description="Prevent runaway traffic and unnecessary duplicate AI spend."
            delay={0.1}
          />

          <Feature
            icon={<Network size={20} />}
            title="Observe"
            description="Track requests, latency, tokens, costs and cache performance."
            delay={0.2}
          />
        </div>
      </section>
       {/* =========================================================
          BYOK / PROVIDER CONTROL
      ========================================================= */}

      <BYOKSection />


      {/* =========================================================
          WHY AEGISFLOW / SECURITY
      ========================================================= */}

      <section
        id="security"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-28 lg:px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-violet-300">
            <ShieldCheck size={15} />
            Why AegisFlow
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your provider runs the model.
            <span className="block text-zinc-500">
              AegisFlow controls the traffic around it.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            AI providers can give your application access to models and
            provider-side controls. AegisFlow adds an application-level
            control layer in front of those providers, so your team can
            centralize request controls, budgets, caching and observability.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<LockKeyhole size={20} />}
            title="Authentication"
            description="Put a controlled gateway between your application and external AI traffic."
            delay={0}
          />

          <Feature
            icon={<Gauge size={20} />}
            title="Traffic limits"
            description="Apply request-rate controls before traffic reaches the model provider."
            delay={0.08}
          />

          <Feature
            icon={<WalletCards size={20} />}
            title="Budget controls"
            description="Track usage and enforce application-level monthly AI spending limits."
            delay={0.16}
          />

          <Feature
            icon={<BarChart3 size={20} />}
            title="Observability"
            description="Inspect requests, latency, tokens, costs, failures and cache performance."
            delay={0.24}
          />
        </div>
      </section>

      {/* =========================================================
          DIRECT PROVIDER VS AEGISFLOW
      ========================================================= */}

      <section className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-28 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
            <Network size={15} />
            The control layer
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Why put a gateway in the middle?
          </h2>

          <p className="mt-5 text-sm leading-7 text-zinc-500 sm:text-base">
            You can call an AI provider directly. AegisFlow is useful when
            you want these application-level controls to live in one place
            instead of being repeated across individual services.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <ComparisonPanel
            title="Direct provider"
            icon={<Server size={19} />}
            items={[
              "Application connects directly to provider",
              "Controls can become scattered across services",
              "Caching and rate limits are application concerns",
              "Usage visibility depends on what the application records",
            ]}
          />

          <div className="hidden items-center justify-center lg:flex">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-300"
            >
              Control layer
            </motion.div>
          </div>

          <ComparisonPanel
            title="Application + AegisFlow"
            icon={<ShieldCheck size={19} />}
            highlighted
            items={[
              "Application sends AI traffic through one gateway",
              "Authentication and rate limits are centralized",
              "Caching, budgets and retries are handled at the gateway",
              "Requests, latency, tokens and costs are observable in one place",
            ]}
          />
        </div>
      </section>

      {/* =========================================================
          PRICING
      ========================================================= */}

      <section
        id="pricing"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-28 lg:px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-violet-300">
            <Tags size={15} />
            Pricing
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Start simple.
            <span className="block text-zinc-500">
              Scale when you need to.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Explore the planned AegisFlow product tiers. Paid plans are
            presented as coming soon until billing and production limits are
            fully implemented.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          <PricingCard
            name="Free"
            price="$0"
            description="For learning, experiments and small projects."
            features={[
              "AI gateway access",
              "API authentication",
              "Rate limiting",
              "Request observability",
              "Basic response caching",
            ]}
            buttonLabel="Start free"
            onClick={() => navigate("/signup")}
          />

          <PricingCard
            name="Pro"
            price="Coming soon"
            description="For applications with growing AI traffic."
            features={[
              "Everything in Free",
              "Higher traffic limits",
              "Advanced budget controls",
              "Expanded analytics",
              "Team-oriented controls",
            ]}
            highlighted
            buttonLabel="Coming soon"
          />

          <PricingCard
            name="Enterprise"
            price="Let's talk"
            description="For larger teams with advanced infrastructure needs."
            features={[
              "Custom traffic controls",
              "Organization-level policies",
              "Advanced observability",
              "Deployment guidance",
              "Dedicated support options",
            ]}
            buttonLabel="Contact us"
            onClick={() => navigate("/contact")}
          />
        </div>
      </section>

      {/* =========================================================
          DEVELOPER EXPERIENCE
      ========================================================= */}

      <section
        id="developers"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-28 lg:px-10"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
              <Code2 size={15} />
              Developer experience
            </div>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              One gateway.
              <span className="block text-zinc-500">
                One place to observe your AI traffic.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Keep your application focused on its product logic while
              AegisFlow handles the infrastructure concerns around AI
              requests.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["FastAPI", "PostgreSQL", "Redis", "OpenRouter"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-[#090a10] shadow-2xl shadow-violet-950/20"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-zinc-600">
                AegisFlow request
              </span>
            </div>

            <pre className="overflow-x-auto p-6 text-xs leading-7 text-zinc-400 sm:text-sm">
              <code>{`POST /v1/chat

X-AegisFlow-Key: ••••••••••••

{
  "prompt": "Hello AegisFlow",
  "model": "openrouter/free"
}

→ authenticated
→ rate limit checked
→ cache checked
→ provider called
→ request recorded`}</code>
            </pre>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-500/[0.06] px-6 py-16 text-center shadow-2xl shadow-violet-950/20 sm:px-12"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[100px]" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Ready to build?
            </div>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Put your AI traffic
              <span className="block text-zinc-500">
                behind a control plane.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Create an AegisFlow account and explore the gateway dashboard.
            </p>

            <div className="mt-8 flex justify-center">
              <GlowButton
                variant="primary"
                onClick={() => navigate("/signup")}
              >
                Start building with AegisFlow
              </GlowButton>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer
        id="contact"
        className="relative z-10 border-t border-white/10 bg-black/20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
                <ShieldCheck size={19} className="text-violet-300" />
              </div>
              <span className="text-lg font-semibold">AegisFlow</span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600">
              AI Gateway & Infrastructure Layer for controlling,
              protecting and observing application AI traffic.
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-300">Product</div>
            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <a className="block transition hover:text-white" href="#platform">
                Platform
              </a>
              <a className="block transition hover:text-white" href="#security">
                Security
              </a>
              <a className="block transition hover:text-white" href="#developers">
                Developers
              </a>
              <a className="block transition hover:text-white" href="#pricing">
                Pricing
              </a>
              <button
                onClick={() => navigate("/pricing")}
                className="block transition hover:text-white"
              >
                Pricing page
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="block transition hover:text-white"
              >
                Dashboard
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-300">Get started</div>
            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <button
                onClick={() => navigate("/signup")}
                className="block transition hover:text-white"
              >
                Create account
              </button>
              <button
                onClick={() => navigate("/login")}
                className="block transition hover:text-white"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="block transition hover:text-white"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/10 px-6 py-6 text-xs text-zinc-700 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>© 2026 AegisFlow · AI Gateway & Infrastructure Layer</span>
          <span>Built for controlled AI traffic.</span>
        </div>
      </footer>
    </main>
  );
}
/* ===============================================================
   BYOK / PROVIDER CONTROL
=============================================================== */

/* ===============================================================
   BYOK / PROVIDER CONTROL
=============================================================== */

function BYOKSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Authentication",
    "Policy check",
    "Cache check",
    "Provider routing",
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [steps.length]);

  return (
    <section
      id="byok"
      className="relative z-10 overflow-hidden border-t border-white/10"
    >
      {/* =========================================================
          AMBIENT BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.1, 0.22, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-20 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -35, 0],
            opacity: [0.04, 0.12, 0.04],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[5%] top-[40%] h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            opacity: [0.03, 0.09, 0.03],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[5%] top-[35%] h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10">

        {/* =======================================================
            HEADING
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 flex items-center justify-center gap-2 text-sm text-violet-300">
            <LockKeyhole size={15} />

            <span>Bring your own key</span>

            <motion.span
              animate={{
                opacity: [0.35, 1, 0.35],
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.9)]"
            />
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Your keys.
            <span className="block bg-gradient-to-r from-white via-violet-200 to-violet-500 bg-clip-text text-transparent">
              Your provider. Your control.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Connect your own OpenRouter credential and let AegisFlow control
            the traffic around your AI provider.
          </p>
        </motion.div>

        {/* =======================================================
            MAIN CONTROL PLANE
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 55, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="relative mx-auto mt-16 max-w-6xl"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08090f]/90 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur-2xl sm:p-8 lg:p-10">

            {/* Technical grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "55px 55px",
              }}
            />

            {/* Top status */}
            <div className="relative mb-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.9, 1.15, 0.9],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                />

                <span className="text-xs text-zinc-500">
                  AI traffic control plane
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                <LockKeyhole size={11} />
                Encrypted
              </div>
            </div>

            {/* ===================================================
                DESKTOP FLOW
            =================================================== */}

            <div className="relative hidden lg:grid lg:grid-cols-[1fr_110px_1.35fr_110px_1fr] lg:items-center lg:gap-3">

              {/* Application */}
              <BYOKNode
                icon={<Code2 size={21} />}
                label="Your Application"
                description="Your AI traffic"
              />

              {/* Request flow */}
              <BYOKTraffic
                label="REQUEST"
                reverse={false}
              />

              {/* AegisFlow */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 1px rgba(139,92,246,0.18), 0 0 25px rgba(139,92,246,0.06)",
                    "0 0 0 1px rgba(139,92,246,0.42), 0 0 65px rgba(139,92,246,0.18)",
                    "0 0 0 1px rgba(139,92,246,0.18), 0 0 25px rgba(139,92,246,0.06)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative min-h-[330px] rounded-3xl border border-violet-400/30 bg-violet-500/[0.055] p-6"
              >
                {/* lock */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    borderColor: [
                      "rgba(167,139,250,0.2)",
                      "rgba(167,139,250,0.5)",
                      "rgba(167,139,250,0.2)",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border bg-[#0b0b12]"
                >
                  <LockKeyhole size={13} className="text-violet-300" />
                </motion.div>

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 text-violet-300">
                      <ShieldCheck size={22} />
                    </div>

                    <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-violet-300">
                      Control Plane
                    </div>

                    <h3 className="mt-2 text-xl font-medium">
                      AegisFlow
                    </h3>
                  </div>

                  <motion.div
                    animate={{
                      opacity: [0.35, 1, 0.35],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                    className="mt-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] text-emerald-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Processing
                  </motion.div>
                </div>

                {/* Processing pipeline */}
                <div className="mt-7 space-y-2">
                  {steps.map((step, index) => {
                    const active = index === activeStep;
                    const completed = index < activeStep;

                    return (
                      <motion.div
                        key={step}
                        animate={{
                          opacity: active || completed ? 1 : 0.35,
                          x: active ? 3 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                          active
                            ? "border-violet-400/25 bg-violet-400/[0.07]"
                            : "border-transparent bg-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <motion.span
                            animate={
                              active
                                ? {
                                    scale: [1, 1.3, 1],
                                    opacity: [0.6, 1, 0.6],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 1.2,
                              repeat: active ? Infinity : 0,
                            }}
                            className={`h-1.5 w-1.5 rounded-full ${
                              completed
                                ? "bg-emerald-400"
                                : active
                                  ? "bg-violet-300"
                                  : "bg-zinc-700"
                            }`}
                          />

                          <span className="text-[11px] text-zinc-400">
                            {step}
                          </span>
                        </div>

                        <span className="text-[9px] uppercase tracking-wider">
                          {completed ? (
                            <span className="text-emerald-400">
                              done
                            </span>
                          ) : active ? (
                            <span className="text-violet-300">
                              active
                            </span>
                          ) : (
                            <span className="text-zinc-700">
                              waiting
                            </span>
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Encrypted credential */}
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                  <LockKeyhole
                    size={12}
                    className="text-violet-300"
                  />

                  <div className="flex-1 overflow-hidden">
                    <div className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
                      Provider credential
                    </div>

                    <motion.div
                      animate={{
                        x: ["0%", "-18%", "0%"],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mt-1 whitespace-nowrap text-[10px] tracking-[0.18em] text-zinc-600"
                    >
                      ••••••••••••••••••••••••••••••
                    </motion.div>
                  </div>

                  <span className="text-[8px] text-emerald-400">
                    SEALED
                  </span>
                </div>
              </motion.div>

              {/* Provider flow */}
              <BYOKTraffic
                label="ROUTE"
                reverse={false}
              />

              {/* Provider */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 1px rgba(255,255,255,0.08)",
                    "0 0 0 1px rgba(139,92,246,0.25), 0 0 30px rgba(139,92,246,0.08)",
                    "0 0 0 1px rgba(255,255,255,0.08)",
                  ],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="rounded-3xl border border-white/10 bg-black/20 p-7 text-center"
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300"
                >
                  <Network size={21} />
                </motion.div>

                <h3 className="mt-5 text-base font-medium">
                  OpenRouter
                </h3>

                <p className="mt-2 text-xs text-zinc-600">
                  AI model provider
                </p>

                <div className="mt-5 flex items-center justify-center gap-2">
                  <motion.span
                    animate={{
                      opacity: [0.35, 1, 0.35],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />

                  <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                    Available
                  </span>
                </div>
              </motion.div>
            </div>

            {/* ===================================================
                MOBILE FLOW
            =================================================== */}

            <div className="flex flex-col items-center lg:hidden">

              <BYOKNode
                icon={<Code2 size={21} />}
                label="Your Application"
                description="Your AI traffic"
              />

              <BYOKVerticalTraffic label="REQUEST" />

              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 1px rgba(139,92,246,0.18)",
                    "0 0 0 1px rgba(139,92,246,0.4), 0 0 45px rgba(139,92,246,0.15)",
                    "0 0 0 1px rgba(139,92,246,0.18)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-violet-500/[0.055] p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 text-violet-300">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300">
                      Control Plane
                    </div>

                    <h3 className="mt-1 text-lg font-medium">
                      AegisFlow
                    </h3>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step}
                      animate={{
                        borderColor:
                          index === activeStep
                            ? "rgba(167,139,250,0.3)"
                            : "rgba(255,255,255,0.05)",
                        backgroundColor:
                          index === activeStep
                            ? "rgba(139,92,246,0.07)"
                            : "rgba(255,255,255,0.015)",
                      }}
                      className="rounded-xl border px-3 py-3 text-[10px] text-zinc-500"
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                  <LockKeyhole size={12} className="text-violet-300" />
                  <span className="text-[9px] tracking-[0.15em] text-zinc-600">
                    ••••••••••••••••••••
                  </span>
                  <span className="ml-auto text-[8px] text-emerald-400">
                    SEALED
                  </span>
                </div>
              </motion.div>

              <BYOKVerticalTraffic label="ROUTE" />

              <BYOKNode
                icon={<Network size={21} />}
                label="OpenRouter"
                description="AI model provider"
              />
            </div>

            {/* ===================================================
                LIVE REQUEST STATUS
            =================================================== */}

            <div className="relative mt-8 grid gap-3 sm:grid-cols-4">

              <BYOKStatus
                label="Authentication"
                value="Verified"
                active={activeStep === 0}
              />

              <BYOKStatus
                label="Policy"
                value="Allowed"
                active={activeStep === 1}
              />

              <BYOKStatus
                label="Cache"
                value="Checked"
                active={activeStep === 2}
              />

              <BYOKStatus
                label="Routing"
                value="OpenRouter"
                active={activeStep === 3}
              />

            </div>

            {/* Bottom explanation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="relative mt-5 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-center"
            >
              <span className="text-xs leading-6 text-zinc-600">
                Provider credentials are encrypted at rest and isolated to
                the owning account. AegisFlow uses them only when routing
                that user's AI traffic.
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* =======================================================
            FEATURE CHIPS
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease,
          }}
          className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3"
        >
          {[
            "Bring your own key",
            "Encrypted credentials",
            "Per-user isolation",
            "Application-level control",
          ].map((item, index) => (
            <motion.div
              key={item}
              whileHover={{
                y: -3,
                borderColor: "rgba(167,139,250,0.25)",
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-zinc-500"
            >
              <motion.span
                animate={{
                  opacity: [0.35, 1, 0.35],
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.25,
                  repeat: Infinity,
                }}
                className="h-1.5 w-1.5 rounded-full bg-violet-400"
              />

              {item}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


/* ===============================================================
   BYOK NODE
=============================================================== */

function BYOKNode({
  icon,
  label,
  description,
}: {
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="w-full max-w-[220px] shrink-0 rounded-3xl border border-white/10 bg-black/20 p-7 text-center"
    >
      <motion.div
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300"
      >
        {icon}
      </motion.div>

      <h3 className="mt-5 text-base font-medium">
        {label}
      </h3>

      <p className="mt-2 text-xs leading-5 text-zinc-600">
        {description}
      </p>
    </motion.div>
  );
}


/* ===============================================================
   HORIZONTAL TRAFFIC
=============================================================== */

function BYOKTraffic({
  label,
  reverse = false,
}: {
  label: string;
  reverse?: boolean;
}) {
  return (
    <div className="relative h-10 w-full">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />

      <motion.div
        className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-violet-300 shadow-[0_0_15px_rgba(167,139,250,1)]"
        animate={{
          left: reverse
            ? ["100%", "0%"]
            : ["0%", "100%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.7,
          repeat: Infinity,
          repeatDelay: 0.25,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-violet-400/70 to-transparent"
        animate={{
          opacity: [0.15, 0.8, 0.15],
        }}
        transition={{
          duration: 1.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-[8px] uppercase tracking-[0.2em] text-zinc-700">
        {label}
      </div>
    </div>
  );
}


/* ===============================================================
   VERTICAL TRAFFIC
=============================================================== */

function BYOKVerticalTraffic({
  label,
}: {
  label: string;
}) {
  return (
    <div className="relative h-14 w-px bg-white/10">
      <motion.div
        className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_15px_rgba(167,139,250,1)]"
        animate={{
          top: ["0%", "100%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.2,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/70 to-transparent"
        animate={{
          opacity: [0.1, 0.8, 0.1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />

      <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] uppercase tracking-[0.18em] text-zinc-700">
        {label}
      </span>
    </div>
  );
}


/* ===============================================================
   LIVE STATUS
=============================================================== */

function BYOKStatus({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <motion.div
      animate={{
        borderColor: active
          ? "rgba(167,139,250,0.28)"
          : "rgba(255,255,255,0.07)",
        backgroundColor: active
          ? "rgba(139,92,246,0.055)"
          : "rgba(255,255,255,0.015)",
      }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] text-zinc-600">
          {label}
        </span>

        <motion.span
          animate={{
            opacity: active ? [0.5, 1, 0.5] : 0.45,
          }}
          transition={{
            duration: 1.4,
            repeat: active ? Infinity : 0,
          }}
          className="h-1.5 w-1.5 rounded-full bg-violet-400"
        />
      </div>

      <div className="mt-2 text-xs text-zinc-400">
        {value}
      </div>
    </motion.div>
  );
}

function ComparisonPanel({
  title,
  icon,
  items,
  highlighted = false,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  highlighted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className={`rounded-3xl border p-7 ${
        highlighted
          ? "border-violet-400/25 bg-violet-500/[0.06] shadow-xl shadow-violet-950/20"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <div className="mt-7 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-6 text-zinc-500">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}


function ContactPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-8 lg:px-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
              <ShieldCheck size={19} className="text-violet-300" />
            </div>
            <span className="font-semibold">AegisFlow</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            Back to home
          </button>
        </div>

        <section className="mx-auto max-w-3xl py-20 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-violet-300">
            <Sparkles size={15} />
            Contact AegisFlow
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Let's talk about
            <span className="block text-zinc-500">your AI infrastructure.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Have a question about the gateway, architecture, integrations or
            the project? Use the contact details configured for your deployment
            or connect with the project team.
          </p>

          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="text-sm text-zinc-500">Product</div>
              <h2 className="mt-2 text-xl font-medium">AegisFlow</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                AI Gateway & Infrastructure Layer for controlled AI traffic.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="text-sm text-zinc-500">Before deployment</div>
              <h2 className="mt-2 text-xl font-medium">Configure contact</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Add your real support email or contact integration here before
                publishing the production website.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-violet-400/20 bg-violet-500/[0.05] p-7 text-left">
            <div className="text-sm font-medium text-violet-200">
              Contact integration
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              This page is now connected to the product navigation. Before
              production, replace this panel with your real support email,
              contact form backend, or ticketing integration.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-100"
              >
                Create account
              </button>

              <button
                onClick={() => navigate("/pricing")}
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-violet-400/30 hover:text-white"
              >
                View pricing
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  buttonLabel,
  highlighted = false,
  onClick,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonLabel: string;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-3xl border p-7 ${
        highlighted
          ? "border-violet-400/30 bg-violet-500/[0.07] shadow-2xl shadow-violet-950/20"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      {highlighted && (
        <div className="absolute right-6 top-6 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-violet-300">
          Coming soon
        </div>
      )}

      <div className="text-sm text-zinc-400">{name}</div>

      <div className="mt-5 text-3xl font-semibold tracking-tight">
        {price}
      </div>

      <p className="mt-3 min-h-[48px] text-sm leading-6 text-zinc-600">
        {description}
      </p>

      <div className="my-7 h-px bg-white/10" />

      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex gap-3 text-sm leading-6 text-zinc-400"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onClick}
        disabled={!onClick}
        className={`mt-8 w-full rounded-full border px-5 py-2.5 text-sm font-medium transition ${
          onClick
            ? "border-white/10 bg-white text-black hover:bg-zinc-100"
            : "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-600"
        }`}
      >
        {buttonLabel}
      </button>
    </motion.div>
  );
}

function PricingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[-260px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[150px]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
              <ShieldCheck size={19} className="text-violet-300" />
            </div>
            <span className="font-semibold">AegisFlow</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            Back to home
          </button>
        </div>

        <section className="py-20">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-violet-300">
              <Tags size={15} />
              AegisFlow pricing
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Choose how you want to
              <span className="block text-zinc-500">
                build with AegisFlow.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
              The Free tier is intended for experimentation. Paid tiers are
              shown as coming soon until billing, quotas and production
              entitlements are implemented.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <PricingCard
              name="Free"
              price="$0"
              description="For learning, experiments and small projects."
              features={[
                "AI gateway access",
                "API authentication",
                "Rate limiting",
                "Request observability",
                "Basic response caching",
              ]}
              buttonLabel="Create free account"
              onClick={() => navigate("/signup")}
            />

            <PricingCard
              name="Pro"
              price="Coming soon"
              description="For applications with growing AI traffic."
              features={[
                "Everything in Free",
                "Higher traffic limits",
                "Advanced budget controls",
                "Expanded analytics",
                "Team-oriented controls",
              ]}
              highlighted
              buttonLabel="Coming soon"
            />

            <PricingCard
              name="Enterprise"
              price="Let's talk"
              description="For larger teams with advanced infrastructure needs."
              features={[
                "Custom traffic controls",
                "Organization-level policies",
                "Advanced observability",
                "Deployment guidance",
                "Dedicated support options",
              ]}
              buttonLabel="Contact us"
              onClick={() => navigate("/contact")}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (active) {
          setAuthenticated(false);
          setChecking(false);
        }
        return;
      }

      try {
        await getCurrentUser(token);

        if (active) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Session validation failed:", error);

        /*
         * Only destroy the local session when the backend
         * explicitly says the token is invalid or expired.
         */
        if (error instanceof APIError && error.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          localStorage.removeItem("aegisflow_api_key");

          if (active) {
            setAuthenticated(false);
          }

          return;
        }

        /*
         * Backend/network failure:
         * Keep the existing session instead of logging
         * the user out unnecessarily.
         */
        if (active) {
          setAuthenticated(true);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    validateSession();

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05060a] text-white">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-4 w-4 rounded-full border-2 border-violet-400/20 border-t-violet-300"
          />
          Verifying session...
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function ResponsiveLanding() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  if (isMobile) {
    return <LandingMobile />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ResponsiveLanding />} />
      <Route path="/login" element={<Login />} />
      <Route
  path="/oauth/callback"
  element={<OAuthCallback />}
/>
      <Route path="/signup" element={<Signup />} />
      <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
      <Route
  path="/reset-password"
  element={<ResetPassword />}
/>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/api-keys"
        element={
          <ProtectedRoute>
            <APIKeys />
          </ProtectedRoute>
        }
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
    </Routes>
  );
}

/* ===============================================================
   ARCHITECTURE CARD
=============================================================== */

function ArchitectureCard({
  title,
  description,
  highlighted = false,
}: {
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.015,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`rounded-2xl border p-6 text-left transition ${
        highlighted
          ? "border-violet-400/30 bg-violet-500/[0.08] shadow-lg shadow-violet-950/30"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="mb-5 flex items-center gap-2">
        <motion.div
          animate={{
            opacity: [0.45, 1, 0.45],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/70"
        />

        {highlighted && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">
            Control Layer
          </span>
        )}
      </div>

      <h3 className="text-base font-medium">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </motion.div>
  );
}

/* ===============================================================
   ANIMATED TRAFFIC LINE
=============================================================== */

function TrafficLine() {
  return (
    <div className="relative hidden h-px overflow-visible bg-white/10 md:block">
      {/* Moving request */}

      <motion.div
        className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-violet-300 shadow-[0_0_14px_rgba(167,139,250,0.9)]"
        animate={{
          left: ["0%", "100%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 0.7,
          ease: "linear",
        }}
      />

      {/* Flow glow */}

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
        animate={{
          opacity: [0.2, 0.8, 0.2],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ===============================================================
   FEATURE CARD
=============================================================== */

function Feature({
  icon,
  title,
  description,
  delay,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease,
      }}
      whileHover={{
        y: -7,
      }}
      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors duration-300 hover:border-violet-400/20 hover:bg-white/[0.035]"
    >
      <motion.div
        whileHover={{
          rotate: 8,
          scale: 1.08,
        }}
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300"
      >
        {icon}
      </motion.div>

      <h3 className="text-xl font-medium">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </motion.div>
  );
}

export default App;