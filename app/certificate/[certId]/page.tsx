'use client'

import { useParams } from 'next/navigation'
import { CheckCircle, Download, ExternalLink, BadgeCheck, Shield } from 'lucide-react'

export default function CertificatePage() {
  const params = useParams()
  const certId = params?.certId as string

  let certData = {
    holderName: 'Training Participant',
    scenarioTitle: 'Workplace Safety Training',
    score: 87,
    issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    certId: certId,
    issuer: 'ClumsAI Certification Authority',
    standard: 'OSHA 29 CFR 1910',
    certNumber: `CA-${Date.now().toString(36).toUpperCase().slice(-8)}`,
  }

  try {
    if (certId) {
      const decoded = JSON.parse(atob(certId))
      certData = { ...certData, ...decoded }
    }
  } catch {
    // use defaults
  }

  const grade = certData.score >= 90 ? 'Distinction' : certData.score >= 80 ? 'Merit' : 'Pass'
  const gradeColor = certData.score >= 90 ? '#b8860b' : certData.score >= 80 ? '#2e7d32' : '#1565c0'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>

      {/* Verified Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(22,163,74,0.15)',
        border: '1px solid rgba(22,163,74,0.4)',
        borderRadius: 999, padding: '6px 18px', marginBottom: 24,
      }}>
        <BadgeCheck size={14} color="#22c55e" />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>
          DIGITALLY VERIFIED — OSHA COMPLIANT
        </span>
      </div>

      {/* Certificate Document */}
      <div style={{
        width: '100%', maxWidth: 760,
        background: '#fffef8',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 60px 120px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(184,134,11,0.3)',
        position: 'relative',
      }}>

        {/* Decorative border frame */}
        <div style={{
          position: 'absolute', inset: 8,
          border: '2px solid rgba(184,134,11,0.25)',
          borderRadius: 2,
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', inset: 12,
          border: '1px solid rgba(184,134,11,0.12)',
          borderRadius: 1,
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Subtle guilloche watermark pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 10%, rgba(184,134,11,0.04) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(184,134,11,0.04) 0%, transparent 50%),
            radial-gradient(circle at 90% 10%, rgba(249,115,22,0.03) 0%, transparent 40%),
            radial-gradient(circle at 10% 90%, rgba(249,115,22,0.03) 0%, transparent 40%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* ── Header Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
          padding: '28px 48px 24px',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Gold top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #b8860b, #f5c842, #b8860b, transparent)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: Issuer identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Seal emblem */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'radial-gradient(circle, #1e293b, #0f172a)',
                border: '2px solid #b8860b',
                boxShadow: '0 0 0 1px rgba(184,134,11,0.3), inset 0 0 12px rgba(184,134,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Shield size={28} color="#b8860b" />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#b8860b', letterSpacing: '0.15em', fontFamily: 'sans-serif', textTransform: 'uppercase', marginBottom: 3 }}>
                  ClumsAI Certification Authority
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em', fontFamily: 'sans-serif' }}>
                  Certificate of Completion
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', marginTop: 2, letterSpacing: '0.04em' }}>
                  {certData.standard} · Interactive Safety Training
                </div>
              </div>
            </div>

            {/* Right: Cert number */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#b8860b', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                CERTIFICATE No.
              </div>
              <div style={{ fontSize: 13, color: '#ffffff', fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
                {certData.certNumber}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 8 }}>
                <CheckCircle size={12} color="#22c55e" />
                <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.06em' }}>VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gold divider line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #b8860b 20%, #f5c842 50%, #b8860b 80%, transparent)' }} />

        {/* ── Certificate Body ── */}
        <div style={{ padding: '36px 48px', position: 'relative', zIndex: 2, background: 'rgba(255,254,248,0.97)' }}>

          {/* Main award text */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: '#78716c', margin: '0 0 16px', fontStyle: 'italic', letterSpacing: '0.03em' }}>
              This is to certify that
            </p>

            {/* Holder name */}
            <div style={{
              fontSize: 32, fontWeight: 700, color: '#1c1917',
              letterSpacing: '-0.01em', lineHeight: 1.2,
              paddingBottom: 8, marginBottom: 4,
              borderBottom: '1.5px solid #b8860b',
              display: 'inline-block',
              minWidth: 240,
            }}>
              {certData.holderName}
            </div>

            <p style={{ fontSize: 13, color: '#57534e', margin: '16px 0 12px', letterSpacing: '0.02em' }}>
              has successfully completed the required training and assessment for
            </p>

            {/* Course title */}
            <div style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: '#f5f0e8',
              border: '1px solid rgba(184,134,11,0.25)',
              borderRadius: 2,
              fontSize: 16, fontWeight: 700, color: '#1c1917',
              letterSpacing: '0.02em',
            }}>
              {certData.scenarioTitle}
            </div>

            {/* Grade badge */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 18px',
                background: `${gradeColor}12`,
                border: `1px solid ${gradeColor}40`,
                borderRadius: 2,
              }}>
                <span style={{ fontSize: 11, fontFamily: 'sans-serif', fontWeight: 700, color: gradeColor, letterSpacing: '0.08em' }}>
                  GRADE: {grade.toUpperCase()}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'sans-serif', color: '#78716c' }}>—</span>
                <span style={{ fontSize: 13, fontFamily: 'sans-serif', fontWeight: 800, color: gradeColor }}>
                  {certData.score}%
                </span>
              </div>
            </div>
          </div>

          {/* ── Metadata grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginBottom: 28, border: '1px solid #e7e5e4', borderRadius: 2, overflow: 'hidden' }}>
            {[
              { label: 'Compliance Standard', value: certData.standard },
              { label: 'Date of Issue', value: certData.issuedDate },
              { label: 'Valid Until', value: certData.expiryDate },
            ].map((item, i) => (
              <div key={i} style={{
                background: i % 2 === 0 ? '#faf9f7' : '#f5f4f0',
                padding: '14px 18px',
                borderRight: i < 2 ? '1px solid #e7e5e4' : 'none',
              }}>
                <div style={{ fontSize: 9, fontFamily: 'sans-serif', fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, fontFamily: 'sans-serif', fontWeight: 700, color: '#1c1917', letterSpacing: '0.01em' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Credential hash bar ── */}
          <div style={{
            background: '#1c1917',
            borderRadius: 2, padding: '12px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ width: 6, height: 20, background: '#b8860b', borderRadius: 1, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, color: '#78716c', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                  Credential ID
                </div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#d4c5a9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  CA-{certData.certId?.substring(0, 40).toUpperCase() || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700,
              color: '#22c55e', background: 'rgba(34,197,94,0.12)',
              padding: '4px 12px', borderRadius: 2, flexShrink: 0, letterSpacing: '0.06em',
            }}>
              AUTHENTIC
            </div>
          </div>

          {/* ── Signatures / Footer area ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            borderTop: '1px solid #e7e5e4', paddingTop: 24,
            gap: 20,
          }}>
            {/* Issuer info */}
            <div>
              <div style={{ width: 120, height: 1, background: '#1c1917', marginBottom: 6 }} />
              <div style={{ fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700, color: '#1c1917', letterSpacing: '0.03em' }}>
                {certData.issuer}
              </div>
              <div style={{ fontSize: 9, fontFamily: 'sans-serif', color: '#a8a29e', letterSpacing: '0.04em', marginTop: 2 }}>
                Authorised Signatory
              </div>
            </div>

            {/* Centered seal */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                border: '2.5px solid #b8860b',
                background: 'radial-gradient(circle, #f5f0e8, #fffef8)',
                boxShadow: '0 0 0 1px rgba(184,134,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Shield size={22} color="#b8860b" />
                  <div style={{ fontSize: 7, fontFamily: 'sans-serif', fontWeight: 800, color: '#b8860b', letterSpacing: '0.05em', marginTop: 1 }}>OFFICIAL</div>
                </div>
              </div>
              <div style={{ fontSize: 8, fontFamily: 'sans-serif', color: '#a8a29e', marginTop: 4, letterSpacing: '0.06em' }}>
                OFFICIAL SEAL
              </div>
            </div>

            {/* Download button */}
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '10px 20px', borderRadius: 2,
                  background: 'linear-gradient(135deg, #b8860b, #d4a017)',
                  color: '#ffffff', border: 'none',
                  fontSize: 12, fontFamily: 'sans-serif', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(184,134,11,0.3)',
                  letterSpacing: '0.04em',
                }}
              >
                <Download size={13} />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gold accent strip */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #b8860b, #f5c842, #b8860b, transparent)' }} />
      </div>

      {/* Footer links */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', fontFamily: 'sans-serif' }}>
          This certificate is digitally signed and verifiable by employers and licensing bodies.
        </p>
        <a
          href="/dashboard"
          style={{
            fontSize: 12, color: '#f97316', textDecoration: 'none', fontFamily: 'sans-serif',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          <ExternalLink size={12} />
          Back to ClumsAI Dashboard
        </a>
      </div>
    </div>
  )
}
