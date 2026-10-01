'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Film, Brain, BarChart3, ArrowRight } from 'lucide-react'
import { ClumsAILogo } from '@/components/ui/ClumsAILogo'
import HeroSimulator from '@/components/landing/simulator/HeroSimulator'
import { Reveal } from '@/components/landing/Reveal'
import styles from './landing.module.css'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={styles.root}>

      {/* ── Navbar ── */}
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.navContainer}>
          <nav className={styles.headerBar}>
            <Link href="/" className={styles.brandLink}>
              <ClumsAILogo height={24} darkMode={true} />
            </Link>

            <div className={styles.navLinks}>
              <a href="#features" className={styles.navLink}>Features</a>
              <a href="#how-it-works" className={styles.navLink}>How It Works</a>
              <Link href="/dashboard/scenarios" className={styles.navLink}>Scenarios</Link>
            </div>

            <div className={styles.navActions}>
              <Link href="/dashboard" className={styles.navBtnPrimary}>
                <span>Enter Platform</span>
                <ArrowRight size={13} className={styles.btnArrow} />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroCanvas}><HeroSimulator /></div>
        <div className={styles.heroOverlay} />

        <div className={`${styles.container} ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>
            Pass your safety license.<br />
            <span className={styles.heroAccentIndustrial}>Learn by doing.</span>
          </h1>

          <p className={styles.heroLead}>
            Real workplace incidents. Interactive 3D drills.<br />
            Build reflexes, not just memorised answers.
          </p>

          <div className={styles.btnRow}>
            <Link href="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
              Start Free Drill <span className={styles.arrow}>→</span>
            </Link>
            <Link href="/dashboard/training/forklift-blind-corner-001" className={`${styles.btn} ${styles.btnGhost}`}>
              Preview a Scenario
            </Link>
          </div>
        </div>
      </section>

      {/* ── Proof strip ── */}
      <section className={styles.strip}>
        <div className={styles.container}>
          <div className={styles.stripRow}>
            {['OSHA 10 & 30', 'Forklift Certification', 'Construction Safety', 'WebXR Ready'].map((t) => (
              <span key={t} className={styles.stripTag}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it works ── */}
      <section id="features" className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <Reveal className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Why ClumsAI Works</p>
            <h2 className={styles.sectionTitle}>Training that sticks.</h2>
          </Reveal>

          <div className={styles.cards}>
            {[
              { Icon: Film,     title: 'See what goes wrong',     desc: 'Watch the unsafe incident, then the correct procedure side by side.' },
              { Icon: Brain,    title: 'AI instructor, on demand', desc: 'Ask anything mid-drill. It knows your scenario and explains every answer.' },
              { Icon: BarChart3,title: 'Earn your certificate',    desc: 'Complete the drill. Get a verifiable credential for OSHA licence prep.' },
            ].map(({ Icon, title, desc }, i) => (
              <Reveal key={title} className={styles.card} delay={i * 80}>
                <div className={styles.cardIcon}><Icon size={20} /></div>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardDesc}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className={styles.section}>
        <div className={`${styles.container} ${styles.narrow}`}>
          <Reveal className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>One drill. Five minutes. Certified.</h2>
          </Reveal>

          <div>
            {[
              { n: '01', label: 'Watch the incident',      desc: 'Identify the moment things go wrong.' },
              { n: '02', label: 'AI hazard assessment',    desc: 'Answer targeted questions about what you saw.' },
              { n: '03', label: '3D simulation',           desc: 'Enter the environment. Make real decisions.' },
              { n: '04', label: 'Correct procedure video', desc: 'See the safe response demonstrated.' },
              { n: '05', label: 'Quiz & certificate',      desc: 'Pass the quiz. Earn your credential.' },
            ].map((s) => (
              <Reveal key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepLabel}>{s.label}</div>
                  <div className={styles.stepDesc}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <Reveal className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <div className={styles.ctaBody}>
              <h2 className={styles.ctaTitle}>Your first drill is free.</h2>
              <p className={styles.ctaLead}>Full simulation with incident video, 3D drill, AI coaching, and certificate.</p>
              <div className={styles.btnRow}>
                <Link href="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Start Free Drill <span className={styles.arrow}>→</span>
                </Link>
                <Link href="/dashboard/scenarios" className={`${styles.btn} ${styles.btnGhost}`}>
                  Browse Scenarios
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <span>© 2026 ClumsAI</span>
            <span className={styles.footerNote}>
              Demo Mode • <span className={styles.footerSafe}>All features available</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
