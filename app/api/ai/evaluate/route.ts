import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      scenarioTitle,
      score,
      passed,
      hazardsDetectedCount,
      totalHazards,
      decisionCorrect,
      quizScore,
      completionTimeSeconds,
    } = body

    const isMock = process.env.MOCK_AI === 'true' || !process.env.GROQ_API_KEY

    if (!isMock && process.env.GROQ_API_KEY) {
      try {
        const prompt = `You are a certified senior workplace safety auditor and instructor for SafeGuard AI. 
Provide a concise, highly professional 2-3 paragraph performance debrief for an employee who just completed the following safety simulation:

Scenario: ${scenarioTitle || 'Forklift Blind Corner'}
Final Composite Score: ${score}% (${passed ? 'PASSED' : 'FAILED / NEEDS RETAKE'})
Hazards Detected: ${hazardsDetectedCount} out of ${totalHazards}
3D Spatial Decision Compliant: ${decisionCorrect ? 'Yes (Followed correct safety protocol)' : 'No (Safety violation occurred)'}
Quiz Knowledge Score: ${quizScore}%
Completion Duration: ${completionTimeSeconds} seconds

Provide:
1. Direct evaluation of their practical response vs OSHA standard protocols
2. Key strength demonstrated
3. Specific actionable recommendation for continuous improvement in field operations.`

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 350,
          }),
          signal: AbortSignal.timeout(10000),
        })

        if (groqRes.ok) {
          const data = await groqRes.json()
          const feedback = data.choices[0]?.message?.content
          if (feedback) {
            return NextResponse.json({ feedback })
          }
        }
      } catch (e) {
        console.warn('Groq API call failed in evaluation route, fallback to generated template', e)
      }
    }

    // High quality contextual template fallback
    const feedback = passed
      ? `Demonstrated solid situational awareness by successfully identifying ${hazardsDetectedCount}/${totalHazards} active warehouse hazards and maintaining compliant stop-and-look protocols at blind intersections.\n\nKey Strength: Your adherence to pedestrian-vehicle separation rules and quick recognition of the approaching forklift prevented high-risk collision vectors.\n\nRecommendation: Continue reinforcing 100% verbal or hand-signal verification with material handling equipment operators prior to stepping past perimeter racking.`
      : `Critical procedural lapses were identified during the blind corner approach. Stepping into an active forklift trajectory without a designated full stop violates OSHA 1910.178 intersection standards.\n\nKey Improvement Area: Prioritize physical boundary checks and mirror scans before entering shared transport aisles.\n\nAction Required: We recommend reviewing the positive demonstration video and re-attempting this simulation module until attaining an 80%+ safety threshold.`

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('API /api/ai/evaluate error:', error)
    return NextResponse.json(
      {
        feedback: 'Simulation performance recorded. Please review the highlighted safety standards and verify all intersection points before proceeding in shared work zones.',
      },
      { status: 200 }
    )
  }
}
