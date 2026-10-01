'use client'

import { useState } from 'react'
import {
  Settings,
  Cpu,
  Video,
  Eye,
  Shield,
  Key,
  CheckCircle,
  Save,
  Server,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function AdminPage() {
  const [groqApiKey, setGroqApiKey] = useState('')
  const [higgsfieldApiKey, setHiggsfieldApiKey] = useState('')
  const [mockAi, setMockAi] = useState(true)
  const [mockVideo, setMockVideo] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* ── Top Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            System Configuration & AI Providers
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Manage LLM orchestration, generative 360° video backends, WebXR parameters, and OSHA compliance flags.
          </p>
        </div>

        {saved && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 13, fontWeight: 700 }}>
            <CheckCircle size={16} /> Saved Successfully
          </span>
        )}
      </div>

      {/* ── 3 Quick System Health Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Active Simulation Engine</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>SIVS v1.0 Runtime</div>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>● Fully Operational</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>LLM Instructor Core</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>LLaMA 3.3 (OSHA)</div>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>● Deterministic Mode Ready</div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Generative 360 Video</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>Higgsfield AI</div>
          <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>● Mock Mode Active</div>
        </div>
      </div>

      {/* ── Settings Sections ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* AI Engine Configuration Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(56,189,248,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>AI Safety Instructor Engine (Groq LLaMA 3.3)</h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Real-time conversational debriefs, adaptive difficulty, and automated knowledge evaluations
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #edf2f7',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Enable Mock AI Mode (Fallback)</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Uses bundled OSHA-certified instructor response matrix without requiring API keys
                </div>
              </div>
              <input
                type="checkbox"
                checked={mockAi}
                onChange={(e) => setMockAi(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                Groq API Key
              </label>
              <input
                type="password"
                placeholder={mockAi ? 'Operating in Mock AI Mode (Key not required)' : 'gsk_...'}
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                disabled={mockAi}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Video Engine Configuration Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(22,163,74,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <Video size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>360° Video Generation (Higgsfield AI)</h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Generates photorealistic equirectangular incident and safe response video tracks per SIVS v1.0
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #edf2f7',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Enable Mock Video Mode</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Plays bundled 360° incident recreation video streams
                </div>
              </div>
              <input
                type="checkbox"
                checked={mockVideo}
                onChange={(e) => setMockVideo(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                Higgsfield API Key
              </label>
              <input
                type="password"
                placeholder={mockVideo ? 'Operating in Bundled Demonstration Video Mode' : 'hg_...'}
                value={higgsfieldApiKey}
                onChange={(e) => setHiggsfieldApiKey(e.target.value)}
                disabled={mockVideo}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* WebXR & Spatial Engine */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(249,115,22,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316',
              }}
            >
              <Eye size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>3D & WebXR Spatial Runtime</h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Three.js / React Three Fiber rendering pipeline with Meta Quest & WebXR support
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #edf2f7' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Renderer Target</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>WebGL 2.0 / WebGPU Pipeline</div>
            </div>
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #edf2f7' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>WebXR Headset Support</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Meta Quest 2 & 3 VR Session Auto-Negotiation</div>
            </div>
          </div>
        </div>

        {/* Save Settings Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}
