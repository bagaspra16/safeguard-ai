import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      scenarioId,
      scenarioTitle,
      scenarioCategory,
      scenarioDescription,
      environment,
      learningObjectives,
      positiveCase,
      negativeCase,
      score,
      passed,
      hazardsDetectedCount,
      totalHazards,
      decisionCorrect,
      quizScore,
      completionTimeSeconds,
    } = body

    const title = scenarioTitle || 'Workplace Safety Drill'
    const cat = scenarioCategory || ''
    const isFire = (scenarioId && scenarioId.includes('fire')) || cat === 'fire_safety'
    const isFall = (scenarioId && scenarioId.includes('fall')) || cat === 'construction_safety'
    const isChemical = (scenarioId && scenarioId.includes('chemical')) || cat === 'chemical_safety'
    const isLOTO = (scenarioId && scenarioId.includes('loto')) || cat === 'electrical_safety'
    const isForklift = (scenarioId && scenarioId.includes('forklift')) || cat === 'warehouse_safety'

    const isMock = process.env.MOCK_AI === 'true' || !process.env.GROQ_API_KEY

    if (!isMock && process.env.GROQ_API_KEY) {
      try {
        const prompt = `You are a certified senior workplace safety auditor and enterprise EHS instructor for ClumsAI. 
Provide a concise, highly professional 2-3 paragraph performance debrief for an employee who just completed the following safety simulation:

SCENARIO DETAILS:
- Title: ${title}
- Category: ${cat || 'Industrial Safety'}
- Environment: ${environment || 'Industrial Facility'}
- Core Learning Objectives: ${Array.isArray(learningObjectives) ? learningObjectives.join('; ') : 'Hazard mitigation'}
- Target Standard Procedure: ${positiveCase || 'Follow compliant safety protocols'}
- Unsafe Failure Mode: ${negativeCase || 'Deviated from safety protocols'}

EMPLOYEE PERFORMANCE METRICS:
- Final Composite Score: ${score}% (${passed ? 'PASSED / COMPLIANT' : 'FAILED / NON-COMPLIANT - NEEDS RETAKE'})
- Hazards Identified: ${hazardsDetectedCount} out of ${totalHazards}
- Practical 3D Decision Compliant: ${decisionCorrect ? 'Yes (Followed standard safety procedure)' : 'No (Safety violation / deviation occurred)'}
- Knowledge Check Quiz Score: ${quizScore}%
- Completion Duration: ${completionTimeSeconds} seconds

AUDIT INSTRUCTIONS:
1. Provide a direct evaluation of their practical response versus relevant OSHA, NFPA, or ANSI standards for THIS specific scenario.
2. Highlight the key operational strength demonstrated.
3. Provide a concrete, actionable recommendation for continuous improvement during daily shift operations.
4. STRICT RULE: Maintain enterprise EHS tone with NO emojis or casual language.`

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 380,
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

    // High quality contextual template fallback based on exact scenario category
    let feedback = ''

    if (isFire) {
      feedback = passed
        ? `Demonstrated disciplined execution of the RACE emergency fire protocol by identifying ${hazardsDetectedCount}/${totalHazards} fire outbreak factors, immediately prioritizing manual alarm activation, and maintaining smoke-layer containment.\n\nKey Strength: Excellent hazard classification selecting Class B suppression guidelines (avoiding water on solvent flash fires) and practicing low-crawl airway protection.\n\nRecommendation: Continue verifying fire barrier integrity and ensure designated muster point reporting is confirmed within 90 seconds of initial alarm sounding.`
        : `Critical life-safety violations were noted during the fire outbreak response. Attempting improper suppression without pulling the manual pull station or leaving fire doors unlatched compromises facility-wide containment.\n\nKey Improvement Area: Prioritize Rescue and Alarm before any suppression attempt. Solvent flash fires expand rapidly and exceed single-operator extinguisher thresholds within 60 seconds.\n\nAction Required: Review the positive RACE demonstration module and complete a retake session to achieve compliance.`
    } else if (isFall) {
      feedback = passed
        ? `Demonstrated rigorous adherence to OSHA 1926.502 fall protection standards by identifying ${hazardsDetectedCount}/${totalHazards} elevated hazards, maintaining 100% continuous dual-lanyard tie-off, and tagging out unpinned cantilever planks.\n\nKey Strength: Active exercise of Stop Work Authority to secure the unclipped coworker before proceeding with structural steel installation.\n\nRecommendation: Maintain pre-shift harness inspections for webbing abrasion, stitch degradation, and D-ring deformation prior to all work exceeding 6 feet (1.8m).`
        : `High-risk procedural infractions were identified at height. Disconnecting both lanyards simultaneously or stepping onto unpinned scaffolding boards creates an immediate fatal fall hazard under OSHA 1926 Subpart M.\n\nKey Improvement Area: Apply the dual-lanyard leapfrog technique at all times so that at least one snap hook remains locked to a 5,000-lb rated anchor.\n\nAction Required: Retake the elevated fall protection simulation to verify 100% tie-off compliance.`
    } else if (isChemical) {
      feedback = passed
        ? `Successfully managed the chemical spill containment drill by identifying ${hazardsDetectedCount}/${totalHazards} hazardous conditions, isolating the perimeter upwind, and donning Level B respiratory PPE.\n\nKey Strength: Accurate identification of SDS Class 8 corrosive properties and proper deployment of neutralizer containment socks.\n\nRecommendation: Continue conducting secondary vapor concentration checks before releasing containment perimeters to maintenance crews.`
        : `Hazardous vapor exposure violation recorded. Approaching an acid spill downwind without certified respiratory PPE creates acute inhalation hazard.\n\nKey Improvement Area: Always verify wind direction and retreat to an upwind perimeter before deploying containment spill kits.\n\nAction Required: Review SDS Class 8 emergency response guidelines and retake this simulation.`
    } else if (isLOTO) {
      feedback = passed
        ? `Executed flawless OSHA 1910.147 Control of Hazardous Energy (LOTO) protocols by verifying zero energy with a calibrated multimeter and applying personal padlocks and danger tags.\n\nKey Strength: Verification of residual capacitor discharge and adherence to the NFPA 70E Arc Flash boundary.\n\nRecommendation: Continue practicing three-point multimeter testing (Live-Dead-Live) before every panel intrusion.`
        : `Critical electrical safety violation recorded. Accessing 480V distribution terminals without multimeter zero-energy verification and padlock lockout creates lethal shock and arc flash exposure.\n\nKey Improvement Area: Never rely solely on the breaker handle position. Always apply personal hasps and test line-to-line and line-to-ground voltage.\n\nAction Required: Review 6-step LOTO procedures and retake this module.`
    } else if (isForklift) {
      feedback = passed
        ? `Demonstrated solid situational awareness by successfully identifying ${hazardsDetectedCount}/${totalHazards} active warehouse hazards and maintaining compliant stop-and-look protocols at blind intersections.\n\nKey Strength: Your adherence to pedestrian-vehicle separation rules and quick recognition of the approaching forklift prevented high-risk collision vectors.\n\nRecommendation: Continue reinforcing 100% verbal or hand-signal verification with material handling equipment operators prior to stepping past perimeter racking.`
        : `Critical procedural lapses were identified during the blind corner approach. Stepping into an active forklift trajectory without a designated full stop violates OSHA 1910.178 intersection standards.\n\nKey Improvement Area: Prioritize physical boundary checks and mirror scans before entering shared transport aisles.\n\nAction Required: We recommend reviewing the positive demonstration video and re-attempting this simulation module until attaining an 80%+ safety threshold.`
    } else {
      feedback = passed
        ? `Demonstrated solid situational awareness for ${title} by successfully identifying ${hazardsDetectedCount}/${totalHazards} active hazards and executing the correct standard operating procedure: ${positiveCase || 'Compliant hazard control'}.\n\nKey Strength: Proactive risk mitigation and adherence to core industry standards.\n\nRecommendation: Continue applying designated PPE and operational safety protocols during all shift operations.`
        : `Safety deviations were identified during the ${title} drill. Failure to adhere to standard procedures (${negativeCase || 'Unsafe practice'}) increases workplace incident probability.\n\nKey Improvement Area: Review all mandatory control points: ${Array.isArray(learningObjectives) ? learningObjectives[0] : 'Safety controls'}.\n\nAction Required: We recommend reviewing the training materials and re-attempting this module to achieve passing certification.`
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('API /api/ai/evaluate error:', error)
    return NextResponse.json(
      {
        feedback: 'Simulation performance recorded. Please review the highlighted safety standards and verify all operational controls before proceeding in active work zones.',
      },
      { status: 200 }
    )
  }
}
