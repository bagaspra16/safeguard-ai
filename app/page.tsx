'use client'

import Link from 'next/link'
import { ShieldAlert, Brain, Boxes, Glasses, Film, BarChart3, Zap } from 'lucide-react'
import HeroSimulator from '@/components/landing/simulator/HeroSimulator'
import { Reveal } from '@/components/landing/Reveal'
import styles from './landing.module.css'

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className={styles.root}>
      {/* Navigation */}
      <header className={styles.header}>
        <div className={styles.container}>
          <nav className={styles.headerBar}>
            <div className={styles.brand}>
              <div className={styles.logoMark}>S</div>
              <span className={styles.brandName}>SafeGuard AI</span>
              <span className={styles.badge}>Beta</span>
            </div>
            <div className={styles.navLinks}>
              <a href="#features" className={styles.navLink}>Features</a>
              <a href="#how-it-works" className={styles.navLink}>How It Works</a>
              <Link href="/dashboard" className={`${styles.btnSm} ${styles.btnPrimary}`}>
                Enter Platform
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        {/* 3D simulator */}
        <div className={styles.heroCanvas}>
          <HeroSimulator />
        </div>

        {/* Gradient overlay */}
        <div className={styles.heroOverlay} />

        {/* Hero content */}
        <div className={`${styles.container} ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <div className={styles.badge}>
              <Zap size={13} /> AI-Powered Safety Training
            </div>
          </div>

          <h1 className={styles.heroTitle}>
            Turn safety training into a<br />
            <span className={styles.accent}>decision-making</span>{' '}
            simulation.
          </h1>

          <p className={styles.heroLead}>
            AI-generated workplace safety drills combining realistic incident videos, interactive 3D environments, WebXR training, and adaptive personalized feedback.
          </p>

          <p className={styles.heroSub}>
            Built for warehouse safety • forklift operations • OSHA compliance
          </p>

          <div>
            <div className={styles.btnRow}>
              <Link href="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                Explore Safety Simulation&nbsp;<span className={styles.arrow}>→</span>
              </Link>
              <Link href="/dashboard/training/forklift-blind-corner-001" className={`${styles.btn} ${styles.btnLight}`}>
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className={styles.highlights}>
        <div className={styles.container}>
          <div className={`${styles.hairline} ${styles.highlightRow}`}>
            {[
              { Icon: ShieldAlert, label: 'Live Hazard Detection' },
              { Icon: Brain, label: 'AI Safety Instructor' },
              { Icon: Boxes, label: 'Interactive 3D Warehouse' },
              { Icon: Glasses, label: 'WebXR / Quest 2 Ready' },
            ].map(({ Icon, label }, i) => (
              <Reveal key={label} className={styles.highlight} delay={i * 90}>
                <Icon size={16} className={styles.icon} />
                <span>{label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <Reveal className={styles.sectionHeader}>
            <div className={`${styles.badge} ${styles.badgeOnDark}`}>Platform Capabilities</div>
            <h2 className={styles.sectionTitle}>One scenario. Every training format.</h2>
            <p className={styles.sectionLead}>
              SafeGuard AI transforms a single safety incident into a synchronized multi-modal training experience.
            </p>
          </Reveal>

          <div className={styles.featureGrid}>
            {[
              {
                Icon: Film,
                title: 'Positive & Negative Videos',
                desc: 'AI-generated incident videos showing exactly what went wrong and the correct safe procedure — side by side.',
              },
              {
                Icon: Boxes,
                title: 'Interactive 3D Simulation',
                desc: 'Walk through a full warehouse environment. Identify hazards, make decisions, and see real-time consequences.',
              },
              {
                Icon: Glasses,
                title: 'WebXR Training',
                desc: 'Enter immersive VR mode on Meta Quest 2 directly from the browser. Same scene, no app install required.',
              },
              {
                Icon: Brain,
                title: 'AI Safety Instructor',
                desc: 'An AI trainer who knows your scenario, asks probing questions, evaluates your answers, and adapts to your performance.',
              },
              {
                Icon: BarChart3,
                title: 'Performance Analytics',
                desc: 'Track hazard detection rate, decision accuracy, quiz scores, and reaction times across your entire team.',
              },
              {
                Icon: Zap,
                title: 'Scenario Engine',
                desc: 'One structured scenario powers every format — video, 3D, VR, quiz, and AI feedback all share the same data source.',
              },
            ].map(({ Icon, title, desc }, i) => (
              <article key={title} className={styles.featureCell}>
                {/* Only the content animates so the grid divider lines stay put */}
                <Reveal delay={(i % 3) * 90}>
                  <h3 className={styles.featureTitle}>
                    <Icon size={16} className={styles.icon} />
                    <span>{title}</span>
                  </h3>
                  <p className={styles.featureDesc}>{desc}</p>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className={styles.section}>
        <div className={`${styles.container} ${styles.narrow}`}>
          <Reveal className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Training Flow</h2>
            <p className={styles.sectionLead}>
              Every training session follows the same structured journey from incident to insight.
            </p>
          </Reveal>

          <div>
            {[
              { step: '01', label: 'Watch the Incident', desc: 'See the negative case — what went wrong and why.' },
              { step: '02', label: 'AI Question', desc: 'The AI instructor asks you to identify the critical mistake.' },
              { step: '03', label: 'Enter 3D Simulation', desc: 'Walk through the environment. Find the hazards yourself.' },
              { step: '04', label: 'Make a Decision', desc: 'Stop and check, or continue? Your choice, real consequences.' },
              { step: '05', label: 'Watch Correct Response', desc: 'See the positive case — the correct procedure in action.' },
              { step: '06', label: 'Quiz & Feedback', desc: 'Test your knowledge. AI evaluates and explains every answer.' },
              { step: '07', label: 'Performance Report', desc: 'Score, reaction time, hazard detection, and improvement areas.' },
            ].map((s) => (
              <Reveal key={s.step} className={styles.step}>
                <div className={styles.stepNumber}>{s.step}</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepLabel}>{s.label}</div>
                  <div className={styles.stepDesc}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <Reveal className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <div className={styles.ctaBody}>
              <h2 className={styles.ctaTitle}>
                Ready to run your first simulation?
              </h2>
              <p className={styles.ctaLead}>
                The Forklift Blind Corner scenario runs in full demo mode — no API keys required.
              </p>
              <div className={styles.btnRow}>
                <Link href="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Start Demo Training&nbsp;<span className={styles.arrow}>→</span>
                </Link>
                <Link href="/dashboard/admin" className={`${styles.btn} ${styles.btnLight}`}>
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div>
              © 2026 SafeGuard AI. Industrial safety training platform.
            </div>
            <div className={styles.footerNote}>
              Running in Demo Mode — <span className={styles.footerSafe}>All features available</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
