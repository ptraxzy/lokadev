import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Terminal, Zap, Shield, Database, LayoutGrid, Download, Server, Cpu, ChevronRight, Check } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";

const TerminalMockup = () => {
  return (
    <div className="relative rounded-lg border border-primary/20 bg-black/80 font-mono text-sm shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="mx-auto text-xs text-muted-foreground flex items-center gap-2">
          <Terminal size={12} /> root@lokadev
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 space-y-4 text-gray-300">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="text-primary font-bold">❯</span>
          <span className="text-white">lokadev init saas-app --stack=laravel-vue</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pl-5 space-y-2 border-l border-white/10"
        >
          <div className="flex items-center gap-2 text-green-400">
            <Check size={14} /> Creating isolated network...
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Check size={14} /> Provisioning PostgreSQL 15...
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Check size={14} /> Setting up Nginx, PHP 8.3 & Node.js 20...
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="pl-5 py-2 text-primary"
        >
          ✨ Environment ready at https://saas-app.test
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="flex items-center gap-3"
        >
          <span className="text-primary font-bold">❯</span>
          <motion.div 
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-4 bg-white"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <MainLayout>
      <div className="selection:bg-primary/30 selection:text-primary">
        
        {/* Grid Background Pattern */}
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* HERO SECTION - Asymmetrical Split */}
        <section className="relative min-h-[85vh] flex items-center pt-24 pb-12 border-b border-border/40">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-8 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-xs font-mono text-primary uppercase tracking-wider"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  LokaDev v1.0 / Stable
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] text-foreground"
                >
                  Local dev.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    Uncompromised.
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-xl font-mono leading-relaxed"
                >
                  Think Laragon, but engineered for the modern era. Isolated containers, native speed, polyglot environments. Zero config required.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-start gap-4 pt-4"
                >
                  <Link href="/download" data-testid="link-download">
                    <Button size="lg" className="h-14 px-8 font-mono text-sm rounded-none bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto relative group overflow-hidden">
                      <span className="relative z-10 flex items-center gap-2">
                        <Download size={16} />
                        Download for Free
                      </span>
                      <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                    </Button>
                  </Link>
                  <Link href="/docs" data-testid="link-docs">
                    <Button size="lg" variant="outline" className="h-14 px-8 font-mono text-sm rounded-none border-border hover:bg-white/5 w-full sm:w-auto">
                      <Terminal size={16} className="mr-2" />
                      Read Docs
                    </Button>
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-8 flex gap-6 text-sm font-mono text-muted-foreground"
                >
                  <span className="flex items-center gap-2"><Check size={14} className="text-primary"/> Windows</span>
                  <span className="flex items-center gap-2"><Check size={14} className="text-primary"/> Linux</span>
                  <span className="flex items-center gap-2 opacity-50">macOS (Coming Soon)</span>
                </motion.div>
              </div>

              {/* Right Visual */}
              <div className="lg:col-span-5 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {/* Decorative background elements for the terminal */}
                  <div className="absolute -inset-4 border border-primary/20 bg-primary/5 -z-10 translate-x-4 translate-y-4" />
                  <div className="absolute -inset-4 border border-white/5 bg-transparent -z-20 translate-x-8 translate-y-8" />
                  <TerminalMockup />
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* METRICS STRIP */}
        <section className="border-b border-border/40 bg-black/40 backdrop-blur-md">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40 font-mono">
              {[
                { label: "Startup", value: "< 2s" },
                { label: "Isolation", value: "100%" },
                { label: "Config", value: "Zero" },
                { label: "Speed", value: "Native" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="py-8 px-4 text-center group hover:bg-white/5 transition-colors"
                >
                  <div className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES - Bento / Structural Grid */}
        <section className="py-32 border-b border-border/40">
          <div className="container mx-auto px-6 md:px-12">
            
            <div className="max-w-2xl mb-20">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                Engineered for <br/>
                <span className="text-muted-foreground">complex workflows.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-mono">
                Stop fighting with Dockerfiles and reverse proxies. LokaDev abstracts the pain while keeping the power.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-1 auto-rows-fr bg-border/40 p-[1px]">
              
              {/* Feature 1 */}
              <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="md:col-span-8 bg-background p-10 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LayoutGrid size={120} />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="w-12 h-12 border border-primary/30 text-primary flex items-center justify-center mb-8 bg-primary/5">
                    <LayoutGrid size={20} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-mono tracking-tight">Multi-Project Nirvana</h3>
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-md">
                    Run your Laravel monolith, Node microservices, and Python API simultaneously. Perfect port management, automatic local domains, zero conflicts.
                  </p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="md:col-span-4 bg-background p-10 relative group"
              >
                <div className="w-12 h-12 border border-primary/30 text-primary flex items-center justify-center mb-8 bg-primary/5">
                  <Shield size={20} />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-mono tracking-tight">Pure Isolation</h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  Docker-like environments without the Dockerfile overhead. Clean, contained, and completely secure per project.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="md:col-span-5 bg-background p-10 relative group"
              >
                <div className="w-12 h-12 border border-primary/30 text-primary flex items-center justify-center mb-8 bg-primary/5">
                  <Database size={20} />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-mono tracking-tight">Database Hub</h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  PostgreSQL, MySQL, Redis, MongoDB. Spin them up with a single click. Connect instantly using auto-generated credentials.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="md:col-span-7 bg-background p-10 relative group overflow-hidden"
              >
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="w-12 h-12 border border-primary/30 text-primary flex items-center justify-center mb-8 bg-primary/5">
                    <Server size={20} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-mono tracking-tight">Polyglot Runtimes</h3>
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-md">
                    Need PHP 7.4 for a legacy client, and PHP 8.3 for your new project? Nginx for one, Apache for another? Instantly switch runtimes per project.
                  </p>
                </div>
                
                {/* Decorative visual for runtime */}
                <div className="absolute right-10 bottom-10 flex gap-2 opacity-50 font-mono text-xs hidden sm:flex">
                  <div className="px-3 py-1 border border-border bg-black">PHP 8.3</div>
                  <div className="px-3 py-1 border border-primary bg-primary/10 text-primary">Node 20</div>
                  <div className="px-3 py-1 border border-border bg-black">Go 1.21</div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* COMPARISON - Laragon vs LokaDev */}
        <section className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">Evolution, not iteration.</h2>
                <p className="text-xl text-muted-foreground font-mono">Why developers are migrating from Laragon.</p>
              </div>
              <div className="hidden md:block text-muted-foreground font-mono text-sm opacity-50">
                LOKADEV_VS_LARAGON.MD
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 font-mono text-sm">
              {/* Laragon Side */}
              <div className="border border-border/50 bg-black/20 p-8 opacity-70 grayscale">
                <div className="text-muted-foreground mb-8 pb-4 border-b border-border/50 uppercase tracking-widest text-xs">
                  Legacy / Laragon
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="text-destructive mt-0.5">✕</span>
                    <div>
                      <div className="text-foreground mb-1">Global pollution</div>
                      <div className="text-muted-foreground">Dependencies are installed globally, causing version conflicts between projects.</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-destructive mt-0.5">✕</span>
                    <div>
                      <div className="text-foreground mb-1">Manual configuration</div>
                      <div className="text-muted-foreground">Editing hosts files and server blocks manually.</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-destructive mt-0.5">✕</span>
                    <div>
                      <div className="text-foreground mb-1">Windows only</div>
                      <div className="text-muted-foreground">No native Linux or macOS support.</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* LokaDev Side */}
              <div className="border border-primary/30 bg-primary/5 p-8 relative shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.15)]">
                <div className="text-primary font-bold mb-8 pb-4 border-b border-primary/20 uppercase tracking-widest text-xs flex justify-between">
                  <span>Modern / LokaDev</span>
                  <span className="animate-pulse w-2 h-4 bg-primary inline-block"></span>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="text-primary mt-0.5"><Check size={16} /></span>
                    <div>
                      <div className="text-foreground mb-1 font-bold">True Containerization</div>
                      <div className="text-muted-foreground">Real isolation without Docker setup headache. Clean environments.</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-primary mt-0.5"><Check size={16} /></span>
                    <div>
                      <div className="text-foreground mb-1 font-bold">Zero Config</div>
                      <div className="text-muted-foreground">Automatic DNS resolution, SSL certificates, and port routing.</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-primary mt-0.5"><Check size={16} /></span>
                    <div>
                      <div className="text-foreground mb-1 font-bold">Cross-Platform Native</div>
                      <div className="text-muted-foreground">First-class citizens on Windows and Linux. Same beautiful UI.</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 border-t border-border/40 relative">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Deploy to localhost.</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-mono">
              Join the developers who demand better tooling. Open source and free forever.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/download" data-testid="link-bottom-download">
                <Button size="lg" className="h-16 px-12 font-mono text-base rounded-none bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all">
                  <Download size={20} className="mr-3" />
                  curl -sS lokadev.dev/install
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-muted-foreground font-mono text-sm opacity-60">
              v1.0.4 — Windows (.exe) & Linux (.deb, .rpm)
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
