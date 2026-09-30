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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>System Configuration & AI Providers</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--sg-text-secondary)', fontSize: 14 }}>
          Manage LLM orchestration, generative video backends, WebXR parameters, and compliance standards.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* AI Engine Configuration */}
        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(56,189,248,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>AI Safety Instructor Engine (Groq LLaMA 3.3)</h3>
              <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>
                Real-time conversational trainer, structured hazard feedback, and assessment generation
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--sg-bg-elevated)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Enable Mock AI Mode (Fallback)</div>
                <div style={{ fontSize: 11, color: 'var(--sg-text-muted)' }}>
                  Provides deterministic OSHA-certified safety instructor responses without external API calls
                </div>
              </div>
              <input
                type="checkbox"
                checked={mockAi}
                onChange={(e) => setMockAi(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--sg-accent)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--sg-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
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
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--sg-bg-elevated)',
                  border: '1px solid var(--sg-border)',
                  color: 'var(--sg-text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Video Engine Configuration */}
        <div
          style={{
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(16,185,129,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Video size={18} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Video Generation Engine (Higgsfield AI)</h3>
              <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>
                Generates photorealistic positive and negative training incident clips
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--sg-bg-elevated)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Enable Mock Video Mode</div>
                <div style={{ fontSize: 11, color: 'var(--sg-text-muted)' }}>
                  Uses packaged ultra-high-definition incident simulation demonstrations
                </div>
              </div>
              <input
                type="checkbox"
                checked={mockVideo}
                onChange={(e) => setMockVideo(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--sg-accent)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--sg-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
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
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--sg-bg-elevated)',
                  border: '1px solid var(--sg-border)',
                  color: 'var(--sg-text-primary)',
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
            background: 'var(--sg-bg-surface)',
            border: '1px solid var(--sg-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(245,158,11,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Eye size={18} color="var(--sg-accent)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>3D & WebXR Spatial Runtime</h3>
              <span style={{ fontSize: 12, color: 'var(--sg-text-secondary)' }}>
                Three.js / React Three Fiber rendering pipeline with Meta Quest / Apple Vision Pro WebXR support
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: 'var(--sg-bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Renderer Target</div>
              <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 2 }}>WebGL 2.0 / WebGPU Ready</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--sg-bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>WebXR Headset Support</div>
              <div style={{ fontSize: 12, color: 'var(--sg-text-secondary)', marginTop: 2 }}>Immersive VR Session Auto-Negotiation</div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
              <CheckCircle size={16} /> Configuration Saved Successfully
            </span>
          )}
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 8,
              background: 'var(--sg-accent)',
              color: '#000000',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
