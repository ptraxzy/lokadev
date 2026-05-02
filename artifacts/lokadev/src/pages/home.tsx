import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Terminal, Zap, Shield, Database, LayoutGrid, ArrowRight, Download, Server, Cpu } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm font-mono text-muted-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            LokaDev v1.0 is now available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            The local dev environment you've been waiting for.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Think Laragon, but supercharged. Isolated dev containers, native performance, multiple PHP/Node versions, and zero configuration. Fast, powerful, and native to Windows & Linux.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/download">
              <Button size="lg" className="h-12 px-8 font-mono text-base gap-2 w-full sm:w-auto">
                <Download size={18} />
                Download for Free
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="h-12 px-8 font-mono text-base gap-2 w-full sm:w-auto border-border/50 bg-secondary/30 hover:bg-secondary/80">
                <Terminal size={18} />
                Read the Docs
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-xl blur-xl opacity-50" />
            <div className="relative rounded-xl border border-border/50 bg-card overflow-hidden shadow-2xl shadow-black/50 aspect-video">
              <img 
                src="/hero-dashboard.png" 
                alt="LokaDev Dashboard Interface" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Metrics Strip */}
      <section className="border-y border-border/40 bg-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/40">
            <div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">&lt; 2s</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Startup Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">100%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Isolated</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">Zero</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Config Needed</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">Native</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Performance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need.<br/>Nothing you don't.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">A full DevOps stack right on your laptop, packaged into a beautiful, intuitive interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="col-span-1 md:col-span-2 bg-secondary/30 border border-border/50 rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <LayoutGrid size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Run multiple projects simultaneously</h3>
              <p className="text-muted-foreground leading-relaxed">
                No more port conflicts or service crashes. Each project gets its own isolated network space. Run your Laravel monolith, Node microservices, and Python API all at the same time, flawlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="col-span-1 bg-secondary/30 border border-border/50 rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Docker-like Isolation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Per-project environments without the Dockerfile overhead. Clean, contained, and secure.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="col-span-1 bg-secondary/30 border border-border/50 rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Built-in Databases</h3>
              <p className="text-muted-foreground leading-relaxed">
                MySQL, PostgreSQL, SQLite, MongoDB. Spin them up with a single click. Manage them right from the dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="col-span-1 md:col-span-2 bg-secondary/30 border border-border/50 rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Server size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Multiple Versions & Servers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Need PHP 7.4 for legacy, and PHP 8.3 for your new project? Nginx for one, Apache for another? LokaDev handles multiple language versions and web servers out of the box. No global pollution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-card border-y border-border/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why LokaDev is better than Laragon</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Laragon was great, but modern web development has moved on. We built LokaDev to solve the pain points of managing complex, modern stacks locally.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Zap size={14} />
                  </div>
                  <div>
                    <strong className="block text-foreground mb-1">True Containerization</strong>
                    <span className="text-sm text-muted-foreground">Not just a glorified WAMP stack. Real isolation without the Docker setup headache.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Cpu size={14} />
                  </div>
                  <div>
                    <strong className="block text-foreground mb-1">Native Cross-Platform</strong>
                    <span className="text-sm text-muted-foreground">First-class citizens on both Windows and Linux. Same beautiful UI, same fast core.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Terminal size={14} />
                  </div>
                  <div>
                    <strong className="block text-foreground mb-1">Polyglot by Design</strong>
                    <span className="text-sm text-muted-foreground">PHP, Node.js, Python, Go. Switch between runtimes instantly per project.</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-secondary/40 border border-border/50 rounded-xl p-6 font-mono text-sm shadow-2xl relative">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/40 text-muted-foreground">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="ml-2">lokadev-cli</span>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="text-primary">❯</span>
                  <span className="text-foreground">lokadev create my-saas</span>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="text-green-400">✔ Creating isolated network</div>
                  <div className="text-green-400">✔ Provisioning database (PostgreSQL 15)</div>
                  <div className="text-green-400">✔ Setting up Nginx & Node.js 20</div>
                  <div className="text-primary mt-2">✨ Project ready at https://my-saas.test</div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-2">
                  <span className="text-primary">❯</span>
                  <span className="animate-pulse bg-foreground w-2 h-4 inline-block"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your workflow?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of developers who have already made the switch. Free and open source.
          </p>
          <Link href="/download">
            <Button size="lg" className="h-14 px-10 font-mono text-lg gap-3">
              <Download size={20} />
              Download LokaDev
            </Button>
          </Link>
          <p className="mt-6 text-sm text-muted-foreground font-mono">
            v1.0.4 - Available for Windows (.exe) & Linux (.deb, .rpm)
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
