import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Book, Terminal, Code, Cpu } from "lucide-react";

export default function DocsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Nav */}
        <aside className="md:w-64 shrink-0 border-r border-border/40 pr-6 hidden md:block">
          <div className="sticky top-24">
            <h3 className="font-mono font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Getting Started</h3>
            <ul className="space-y-2 mb-8">
              <li><a href="#introduction" className="text-sm text-foreground hover:text-primary font-medium transition-colors">Introduction</a></li>
              <li><a href="#installation" className="text-sm text-muted-foreground hover:text-primary transition-colors">Installation</a></li>
              <li><a href="#quickstart" className="text-sm text-muted-foreground hover:text-primary transition-colors">Quickstart</a></li>
            </ul>

            <h3 className="font-mono font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Core Concepts</h3>
            <ul className="space-y-2 mb-8">
              <li><a href="#projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Managing Projects</a></li>
              <li><a href="#databases" className="text-sm text-muted-foreground hover:text-primary transition-colors">Databases</a></li>
              <li><a href="#services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services & Runtimes</a></li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 max-w-3xl pb-20 prose prose-invert prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border/50">
          <h1 id="introduction" className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Learn how to install, configure, and use LokaDev for your local development workflow.
          </p>

          <div className="h-px w-full bg-border/40 my-8"></div>

          <h2 id="installation" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DownloadIcon className="text-primary" /> Installation
          </h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Windows</h3>
          <p>
            Download the <code>.exe</code> installer from the <a href="/download" className="text-primary hover:underline">Download page</a>. 
            Run the installer as Administrator. LokaDev will automatically install necessary dependencies and configure your hosts file.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Linux</h3>
          <p>For Debian/Ubuntu based systems:</p>
          <pre className="p-4 rounded-lg bg-secondary/30 border border-border/50 font-mono text-sm overflow-x-auto text-muted-foreground mt-2 mb-4">
            <code>
sudo dpkg -i lokadev_1.0.4_amd64.deb<br/>
sudo apt-get install -f
            </code>
          </pre>

          <div className="h-px w-full bg-border/40 my-10"></div>

          <h2 id="quickstart" className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="text-primary" /> Quickstart
          </h2>
          <p>
            Once installed, open the LokaDev dashboard. You can create a new project via the UI, or use the CLI:
          </p>
          <pre className="p-4 rounded-lg bg-secondary/30 border border-border/50 font-mono text-sm overflow-x-auto text-muted-foreground mt-2 mb-4">
            <code>lokadev create new-app --template=laravel</code>
          </pre>
          <p>
            This will automatically provision a new isolated container, setup a database, configure a local SSL certificate, and bind it to <code>https://new-app.test</code>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="border border-border/50 bg-secondary/20 p-5 rounded-lg">
              <h4 className="font-bold mb-2 text-foreground">Services</h4>
              <p className="text-sm text-muted-foreground">Manage Nginx, Apache, PHP versions, and Node.js globally or per-project.</p>
            </div>
            <div className="border border-border/50 bg-secondary/20 p-5 rounded-lg">
              <h4 className="font-bold mb-2 text-foreground">Databases</h4>
              <p className="text-sm text-muted-foreground">Built-in tools to manage MySQL, PostgreSQL, and Redis instances.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function DownloadIcon(props: any) {
  return <Cpu {...props} size={24} />;
}
