

import type { ReactNode } from "react";



import { Link } from "react-router-dom";



import {



  ArrowRight,



  BarChart3,



  Check,



  ChevronRight,



  Gauge,



  LockKeyhole,



  ShieldCheck,



  Sparkles,



  Zap,



} from "lucide-react";







export default function LandingMobile() {



  return (



    <main className="min-h-screen w-full max-w-[100vw] min-w-0 overflow-x-hidden overscroll-x-none bg-[#05060a] text-white">







      {/* =========================================================**



**          BACKGROUND**



**      ========================================================= */}







      <div className="pointer-events-none fixed inset-0 -z-10 w-full max-w-[100vw] overflow-hidden">



        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/[0.10] blur-[110px]" />







        <div className="absolute bottom-[20%] right-[-180px] h-[320px] w-[320px] rounded-full bg-violet-500/[0.06] blur-[100px]" />







        <div



          className="absolute inset-0 opacity-[0.025]"



          style={{



            backgroundImage:



              "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",



            backgroundSize: "64px 64px",



          }}



        />



      </div>







      {/* =========================================================**



**          NAVBAR**



**      ========================================================= */}







      <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#05060a]/90 px-4 py-3 backdrop-blur-xl">



        <div className="mx-auto flex w-full max-w-full min-w-0 items-center justify-between">







          <Link



            to="/"



            className="flex min-w-0 items-center gap-2.5"



          >



            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/[0.08]">



              <ShieldCheck



                size={19}



                strokeWidth={1.8}



                className="text-violet-300"



              />



            </div>







            <span className="truncate text-[17px] font-semibold tracking-[-0.02em]">



              AegisFlow



            </span>



          </Link>







          <div className="flex shrink-0 items-center gap-2">



            <Link



              to="/login"



              className="px-2 py-2 text-xs font-medium text-zinc-400"



            >



              Log in



            </Link>







            <Link



              to="/signup"



              className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold" style={{ color: "#000000", WebkitTextFillColor: "#000000" }}



            >



              Start free



            </Link>



          </div>







        </div>



      </header>







      {/* =========================================================**



**          HERO**



**      ========================================================= */}







      <section className="mx-auto w-full max-w-full min-w-0 px-4 pb-14 pt-10 sm:px-5">







        {/* Eyebrow */}



        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.06] px-3.5 py-2">



          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15">



            <Zap



              size={11}



              className="text-violet-300"



            />



          </span>







          <span className="truncate text-[11px] font-medium tracking-wide text-violet-200">



            AI traffic control infrastructure



          </span>



        </div>







        {/* Heading */}



        <h1 className="mt-7 text-[43px] font-semibold leading-[0.98] tracking-[-0.045em]">



          Control every



          <span className="mt-1 block text-violet-300">



            AI request.



          </span>



        </h1>







        {/* Description */}



        <p className="mt-6 w-full max-w-[370px] break-words text-[15px] leading-7 text-zinc-400">



          AegisFlow sits between your application and AI



          providers, controlling authentication, rate limits,



          caching, budgets, reliability, and observability.



        </p>







        {/* CTA */}



        <div className="mt-8 flex w-full max-w-full min-w-0 flex-col gap-3">







          <Link



            to="/signup"



            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold" style={{ color: "#000000", WebkitTextFillColor: "#000000" }}



          >



            Start building with AegisFlow



            <ArrowRight size={17} />



          </Link>







          <a



            href="#architecture"



            className="flex min-h-[54px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] px-5 text-sm font-medium text-zinc-300"



          >



            Explore the architecture



          </a>







        </div>







        {/* Small trust line */}



        <div className="mt-7 flex items-center gap-2 text-[11px] text-zinc-600">



          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />



          Built for controlled AI traffic



        </div>







      </section>







      {/* =========================================================**



**          MINI GATEWAY VISUAL**



**      ========================================================= */}







      <section className="mx-auto w-full max-w-full min-w-0 px-4 pb-14 sm:px-5">







        <div className="w-full max-w-full min-w-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-4">







          <div className="mb-4 flex items-center justify-between px-1">



            <div>



              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300">



                Request flow



              </p>







              <p className="mt-1 text-sm font-medium text-zinc-300">



                Controlled AI traffic



              </p>



            </div>







            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/20">



              <Sparkles



                size={15}



                className="text-violet-300"



              />



            </div>



          </div>







          <div className="space-y-2">







            <FlowNode



              label="Your Application"



              description="Request"



            />







            <FlowConnector />







            <FlowNode



              label="AegisFlow"



              description="Policy · Cache · Limits"



              active



            />







            <FlowConnector />







            <FlowNode



              label="AI Provider"



              description="Controlled execution"



            />







          </div>







        </div>







      </section>







      {/* =========================================================**



**          ARCHITECTURE**



**      ========================================================= */}







      <section



        id="architecture"



        className="mx-auto w-full max-w-full min-w-0 px-4 py-12 sm:px-5"



      >







        <SectionHeading



          eyebrow="Architecture"



          title="One control layer."



          description="Every AI request passes through the same infrastructure before reaching the model provider."



        />







        <div className="mt-8 grid gap-3">







          <ArchitectureCard



            number="01"



            title="Application"



            description="Your product sends an AI request through one controlled gateway."



          />







          <ArchitectureCard



            number="02"



            title="AegisFlow"



            description="Authentication, policies, limits, caching and tracing happen here."



            active



          />







          <ArchitectureCard



            number="03"



            title="AI Provider"



            description="Only approved and controlled traffic reaches the external model."



          />







        </div>







      </section>







      {/* =========================================================**



**          CONTROLS**



**      ========================================================= */}







      <section



        id="controls"



        className="mx-auto w-full max-w-full min-w-0 px-4 py-12 sm:px-5"



      >







        <SectionHeading



          eyebrow="Control layer"



          title="Protect every request."



          description="Infrastructure controls designed around real AI application traffic."



        />







        <div className="mt-8 grid gap-3">







          <FeatureCard



            icon={<LockKeyhole size={20} />}



            title="Authentication"



            description="Put a controlled gateway between your application and external AI traffic."



          />







          <FeatureCard



            icon={<Gauge size={20} />}



            title="Traffic limits"



            description="Apply request-rate controls before traffic reaches the model provider."



          />







          <FeatureCard



            icon={<BarChart3 size={20} />}



            title="Budget controls"



            description="Track usage and enforce application-level AI spending limits."



          />







          <FeatureCard



            icon={<Zap size={20} />}



            title="Response caching"



            description="Prevent unnecessary duplicate requests and reduce provider costs."



          />







        </div>







      </section>







      {/* =========================================================**



**          OBSERVABILITY STRIP**



**      ========================================================= */}







      <section className="mx-auto w-full max-w-full min-w-0 px-4 py-9 sm:px-5">







        <div className="rounded-[28px] border border-violet-400/15 bg-violet-500/[0.045] p-6">







          <div className="flex min-w-0 items-center gap-3">



            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">



              <BarChart3



                size={19}



                className="text-violet-300"



              />



            </div>







            <div>



              <p className="text-sm font-medium">



                Request observability



              </p>







              <p className="mt-1 text-xs text-zinc-500">



                Know what your AI traffic is doing.



              </p>



            </div>



          </div>







          <div className="mt-6 grid grid-cols-3 divide-x divide-white/10">







            <Metric



              value="100%"



              label="Tracked"



            />







            <Metric



              value="24/7"



              label="Visibility"



            />







            <Metric



              value="1"



              label="Gateway"



            />







          </div>







        </div>







      </section>







      {/* =========================================================**



**          PRICING**



**      ========================================================= */}







      <section



        id="pricing"



        className="py-16"



      >







        <div className="mx-auto w-full max-w-[430px] px-5">







          <SectionHeading



            eyebrow="Pricing"



            title="Start simple."



            description="Start free and upgrade when your AI traffic grows."



          />







        </div>







        {/* Mobile pricing stays fully inside the viewport */}



        <div className="mx-auto mt-9 grid w-full max-w-[430px] min-w-0 gap-4 px-4 sm:px-5">







          {/* FREE */}



          <div className="w-full min-w-0 max-w-[430px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">







            <div className="flex min-w-0 items-start justify-between">







              <div>



                <p className="text-sm font-medium text-zinc-300">



                  Free



                </p>







                <p className="mt-3 text-5xl font-semibold tracking-[-0.04em]">



                  $0



                </p>



              </div>







              <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">



                Available



              </div>







            </div>







            <p className="mt-5 text-sm leading-6 text-zinc-500">



              For learning, experiments and small projects.



            </p>







            <div className="my-7 h-px bg-white/10" />







            <div className="space-y-4">







              <PricingFeature text="AI gateway access" />



              <PricingFeature text="API authentication" />



              <PricingFeature text="Rate limiting" />



              <PricingFeature text="Request observability" />



              <PricingFeature text="Basic response caching" />







            </div>







            <Link



              to="/signup"



              className="mt-8 flex min-h-[52px] items-center justify-center rounded-2xl bg-white text-sm font-semibold" style={{ color: "#000000", WebkitTextFillColor: "#000000" }}



            >



              Start free



            </Link>







          </div>







          {/* PRO */}



          <div className="w-full min-w-0 max-w-[430px] overflow-hidden rounded-[28px] border border-violet-400/20 bg-violet-500/[0.045] p-5 sm:p-7">







            <div className="flex min-w-0 items-start justify-between">







              <div>



                <p className="text-sm font-medium text-zinc-300">



                  Pro



                </p>







                <p className="mt-3 text-5xl font-semibold tracking-[-0.04em]">



                  Soon



                </p>



              </div>







              <div className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-violet-300">



                Coming soon



              </div>







            </div>







            <p className="mt-5 text-sm leading-6 text-zinc-500">



              For applications with growing AI traffic.



            </p>







            <div className="my-7 h-px bg-white/10" />







            <div className="space-y-4">







              <PricingFeature text="Advanced traffic controls" />



              <PricingFeature text="Higher request limits" />



              <PricingFeature text="Advanced observability" />



              <PricingFeature text="Budget enforcement" />



              <PricingFeature text="Priority infrastructure" />







            </div>







            <button



              disabled



              className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/10 text-sm font-medium text-zinc-500"



            >



              Coming soon



            </button>







          </div>







        </div>







      </section>







      {/* =========================================================**



**          FINAL CTA**



**      ========================================================= */}







      <section className="mx-auto w-full max-w-full min-w-0 px-4 py-12 sm:px-5">







        <div className="relative w-full max-w-full min-w-0 overflow-hidden rounded-[30px] border border-violet-400/20 bg-violet-500/[0.055] p-6 sm:p-7">







          <div className="absolute right-[-70px] top-[-70px] h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />







          <div className="relative">







            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">



              <ShieldCheck



                size={19}



                className="text-violet-300"



              />



            </div>







            <h2 className="mt-6 text-2xl font-semibold tracking-tight">



              Put AI traffic



              <span className="block text-violet-300">



                under control.



              </span>



            </h2>







            <p className="mt-4 text-sm leading-6 text-zinc-500">



              Start building with AegisFlow and add a control



              layer between your application and AI providers.



            </p>







            <Link



              to="/signup"



              className="mt-7 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold" style={{ color: "#000000", WebkitTextFillColor: "#000000" }}



            >



              Start building



              <ArrowRight size={17} />



            </Link>







          </div>







        </div>







      </section>







      {/* =========================================================**



**          FOOTER — VERTICAL**



**      ========================================================= */}







      {/* =========================================================**



**    FOOTER — MOBILE TWO COLUMN**



**========================================================= */}







<footer className="border-t border-white/[0.07]">







  <div className="mx-auto w-full max-w-full min-w-0 px-4 pb-10 pt-10 sm:px-5">







    {/* Brand */}



    <div className="flex min-w-0 items-center gap-3">







      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/[0.08]">



        <ShieldCheck



          size={20}



          className="text-violet-300"



        />



      </div>







      <div>



        <p className="font-semibold text-white">



          AegisFlow



        </p>







        <p className="mt-1 text-xs text-zinc-600">



          AI Gateway & Infrastructure Layer



        </p>



      </div>







    </div>







    {/* Footer navigation */}



    <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">







      {/* Product */}



      <div>







        <h3 className="text-sm font-semibold text-zinc-300">



          Product



        </h3>







        <div className="mt-4 space-y-1">







          <a



            href="#architecture"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Platform



          </a>







          <a



            href="#controls"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Security



          </a>







          <a



            href="#architecture"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Developers



          </a>







          <a



            href="#pricing"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Pricing



          </a>







        </div>







      </div>







      {/* Get started */}



      <div>







        <h3 className="text-sm font-semibold text-zinc-300">



          Get started



        </h3>







        <div className="mt-4 space-y-1">







          <Link



            to="/signup"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Create account



          </Link>







          <Link



            to="/login"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Log in



          </Link>







          <a



            href="mailto:contact@aegisflow.com"



            className="block py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"



          >



            Contact



          </a>







        </div>







      </div>







    </div>







    {/* Bottom */}



    <div className="mt-10 border-t border-white/[0.07] pt-6">







      <p className="text-xs leading-5 text-zinc-700">



        © 2026 AegisFlow · AI Gateway & Infrastructure Layer.



      </p>







      <p className="mt-1 text-xs text-zinc-700">



        Built for controlled AI traffic.



      </p>







    </div>







  </div>







</footer>



    </main>



  );



}

















function SectionHeading({



  eyebrow,



  title,



  description,



}: {



  eyebrow: string;



  title: string;



  description: string;



}) {



  return (



    <div>



      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">



        {eyebrow}



      </p>







      <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em]">



        {title}



      </h2>







      <p className="mt-3 w-full max-w-full text-sm leading-6 text-zinc-500">



        {description}



      </p>



    </div>



  );



}











function FlowNode({



  label,



  description,



  active = false,



}: {



  label: string;



  description: string;



  active?: boolean;



}) {



  return (



    <div



      className={`flex items-center justify-between rounded-2xl border p-4 ${



        active



          ? "border-violet-400/25 bg-violet-500/[0.07]"



          : "border-white/[0.07] bg-black/20"



      }`}



    >



      <div className="flex min-w-0 items-center gap-3">







        <span



          className={`h-2 w-2 shrink-0 rounded-full ${



            active ? "bg-violet-300" : "bg-zinc-700"



          }`}



        />







        <div className="min-w-0">



          <p className="truncate text-sm font-medium text-zinc-200">



            {label}



          </p>







          <p className="mt-0.5 truncate text-[11px] text-zinc-600">



            {description}



          </p>



        </div>







      </div>







      {active && (



        <span className="ml-3 shrink-0 text-[9px] uppercase tracking-widest text-violet-300">



          Active



        </span>



      )}



    </div>



  );



}











function FlowConnector() {



  return (



    <div className="flex h-3 items-center justify-center">



      <div className="h-3 w-px bg-violet-400/20" />



    </div>



  );



}











function ArchitectureCard({



  number,



  title,



  description,



  active = false,



}: {



  number: string;



  title: string;



  description: string;



  active?: boolean;



}) {



  return (



    <div



      className={`rounded-3xl border p-6 ${



        active



          ? "border-violet-400/25 bg-violet-500/[0.055]"



          : "border-white/[0.08] bg-white/[0.018]"



      }`}



    >







      <div className="flex min-w-0 items-start justify-between">







        <span className="text-[10px] font-medium tracking-[0.2em] text-zinc-600">



          {number}



        </span>







        {active && (



          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-violet-300">



            Control layer



          </span>



        )}







      </div>







      <h3 className="mt-7 text-xl font-medium">



        {title}



      </h3>







      <p className="mt-2 text-sm leading-6 text-zinc-500">



        {description}



      </p>







      <div className="mt-5 flex items-center gap-2 text-xs text-zinc-600">



        <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70" />



        Controlled traffic



      </div>







    </div>



  );



}











function FeatureCard({



  icon,



  title,



  description,



}: {



  icon: ReactNode;



  title: string;



  description: string;



}) {



  return (



    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018] p-5 sm:p-6">







      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.07] text-violet-300">



        {icon}



      </div>







      <h3 className="mt-5 text-lg font-medium">



        {title}



      </h3>







      <p className="mt-2.5 text-sm leading-6 text-zinc-500">



        {description}



      </p>







      <div className="mt-5 flex items-center gap-1 text-[11px] font-medium text-violet-300">



        AegisFlow control



        <ChevronRight size={13} />



      </div>







    </div>



  );



}











function Metric({



  value,



  label,



}: {



  value: string;



  label: string;



}) {



  return (



    <div className="px-2 text-center">



      <p className="text-lg font-semibold">



        {value}



      </p>







      <p className="mt-1 text-[10px] text-zinc-600">



        {label}



      </p>



    </div>



  );



}











function PricingFeature({



  text,



}: {



  text: string;



}) {



  return (



    <div className="flex items-center gap-3 text-sm text-zinc-300">



      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10">



        <Check



          size={12}



          className="text-violet-300"



        />



      </span>







      <span>{text}</span>



    </div>



  );



}










