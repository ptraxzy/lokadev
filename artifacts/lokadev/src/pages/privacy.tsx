import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="mb-12">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 2, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Overview</h2>
            <p>
              LokaDev is an open-source, locally-run development environment. This Privacy Policy explains what
              information we collect, why we collect it, and how it is used. Because LokaDev runs entirely on
              your own machine, virtually all data stays on your device — we collect very little, and only with
              your awareness.
            </p>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-semibold text-foreground mt-5 mb-2">2.1 Information You Do Not Send Us</h3>
            <p>
              LokaDev does <strong className="text-foreground">not</strong> collect, transmit, or store any of the
              following:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Your project files, source code, or databases</li>
              <li>Your local domain names or hostnames</li>
              <li>Credentials stored in your projects (database passwords, API keys, etc.)</li>
              <li>Browsing activity within your local applications</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-2">2.2 Anonymous Telemetry (Opt-in)</h3>
            <p>
              If you choose to enable anonymous telemetry, LokaDev may send the following aggregate data to
              help us improve the product:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>LokaDev version and OS type (Windows / Linux distro)</li>
              <li>Which features are used (e.g., "created a project", "started MySQL")</li>
              <li>Crash reports with stack traces (no personal data included)</li>
            </ul>
            <p className="mt-3">
              Telemetry is <strong className="text-foreground">disabled by default</strong>. You can enable or
              disable it at any time in Settings &rarr; Privacy.
            </p>

            <h3 className="text-base font-semibold text-foreground mt-6 mb-2">2.3 Website Analytics</h3>
            <p>
              When you visit the LokaDev website (lokadev.app), we may collect standard web analytics data
              including page views, referrer URL, browser type, and country-level location. This data is
              anonymous and aggregated, and is never linked to a personal identity.
            </p>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Information</h2>
            <p>Any data collected is used solely to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Diagnose and fix bugs and crashes</li>
              <li>Understand which features are most useful</li>
              <li>Improve stability and performance of future releases</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share any collected data with third parties for marketing or
              advertising purposes.
            </p>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Storage & Security</h2>
            <p>
              All project data, databases, and configuration files are stored locally on your device. LokaDev
              does not have a cloud sync feature. You are responsible for the security of your own machine and
              local data.
            </p>
            <p className="mt-3">
              Any anonymous telemetry sent to our servers is stored in aggregate form, protected by industry-
              standard encryption in transit (TLS 1.3) and at rest.
            </p>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
            <p>LokaDev may integrate with the following third-party services:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>
                <strong className="text-foreground">GitHub</strong> — for checking for updates and downloading
                release packages. GitHub's{" "}
                <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  Privacy Statement
                </a>{" "}
                applies.
              </li>
              <li>
                <strong className="text-foreground">OS Package Managers</strong> — dnf (Fedora), apt (Debian/Ubuntu),
                winget (Windows) — used for installing runtimes. These operate entirely locally.
              </li>
            </ul>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Children's Privacy</h2>
            <p>
              LokaDev is a developer tool intended for users aged 13 and older. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an
              updated "Last updated" date. For significant changes, we will include a notice in the next
              application release notes.
            </p>
          </section>

          <div className="h-px bg-border/40" />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or how LokaDev handles your data, you can open
              an issue on our{" "}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
