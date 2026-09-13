# Founder Discovery Flow

This document describes the complete Founder Discovery Flow for the AI Co-Founder Skill v3. The flow guides a founder from raw self-knowledge through structured inference to concrete business directions and deliverable artifacts.

The flow consists of 13 steps organized into 5 phases. Each step specifies what to do, which tool to call, what data it needs, what to present to the user, and when to loop back for clarification.

---

## Phase 1: Elicitation (Steps 1-4)

The elicitation phase collects raw information from the founder through guided conversation. Each step asks an open-ended question, processes the free-text response through a skill, and presents structured output for the founder to confirm or correct.

### Step 1: Collect Skills

**What to do:** Open the conversation by asking the founder what they are good at. Encourage them to think broadly — technical skills, soft skills, domain expertise, hobbies they have mastered. The question should feel conversational, not like a form.

**Tool:** `collect_skills`

**Inputs:** The founder's free-text response as the `response` parameter.

**What to show the user:** Present the extracted `items` array as a readable list (skill name, proficiency, years). Show the `summary` narrative. Ask: "Does this capture your skills accurately? Anything to add or correct?"

**Looping:** If the founder adds skills or corrects entries, append their clarification to the original response and re-call `collect_skills` with the combined text. Repeat until the founder confirms.

---

### Step 2: Collect Interests

**What to do:** Ask the founder what excites them — industries they follow, problems they think about, communities they belong to, side projects that energize them.

**Tool:** `collect_interests`

**Inputs:** The founder's free-text response as the `response` parameter.

**What to show the user:** Present the `clusters` as themed groups (e.g., "Developer Tools", "Health & Wellness"). Show the `summary`. Ask: "Do these interest clusters resonate? Anything missing?"

**Looping:** If the founder refines their interests, combine the new input with the original and re-call `collect_interests`. Repeat until confirmed.

---

### Step 3: Collect Experience

**What to do:** Ask the founder about their professional background — jobs, freelance work, significant projects, industries they have worked in, and key accomplishments.

**Tool:** `collect_experience`

**Inputs:** The founder's free-text response as the `response` parameter.

**What to show the user:** Present the `segments` as a timeline or structured list (role, industry, duration, accomplishments). Show the `summary`. Ask: "Does this capture your experience? Any gaps or corrections?"

**Looping:** If the founder adds or corrects experience, combine and re-call `collect_experience`. Repeat until confirmed.

---

### Step 4: Collect Constraints

**What to do:** Ask the founder about practical boundaries — how much money they can invest, how many hours per week they can commit, their comfort with risk, their target timeline, and any hard constraints (geography, industry exclusions, regulatory limits, family obligations).

**Tool:** `collect_constraints`

**Inputs:** The founder's free-text response as the `response` parameter.

**What to show the user:** Present the structured constraints: budget tier, time commitment level, risk tolerance, timeline in months, and the list of hard constraints. Ask: "Do these constraints look right? Anything to adjust?"

**Looping:** If the founder corrects any constraint, re-call `collect_constraints` with the updated input. Repeat until confirmed.

---

## Phase 2: Inference (Steps 5-8)

The inference phase takes confirmed elicitation data and derives business-relevant insights. Each step calls an inference skill, presents the output, and invites the founder to discuss, adjust, or validate before proceeding.

### Step 5: Infer Customer Segments

**What to do:** With all elicitation data confirmed, derive target customer segments. Explain to the founder that the system is now analyzing who they are best positioned to serve.

**Tool:** `infer_customer_segments`

**Inputs:**
- `skills` (required) — from Step 1
- `experience` (required) — from Step 3
- `interests` (optional) — from Step 2, used to weight segments toward passion areas

**What to show the user:** Present 2-5 customer segments, each with a name, description, key pain points, and a founder-fit score. Ask: "Which of these segments resonates most? Should we add, remove, or adjust any?"

**Looping:** If the founder wants to adjust segments, discuss their feedback, then re-call `infer_customer_segments` with any updated elicitation data. If the founder feels none of the segments fit, consider backtracking to Steps 1-3 to revise inputs.

---

### Step 6: Infer Problem Statements

**What to do:** Identify specific problems grounded in the founder's experience and interests. Explain that the system is looking for problems the founder has lived through or observed firsthand.

**Tool:** `infer_problem_statements`

**Inputs:**
- `experience` (required) — from Step 3
- `interests` (required) — from Step 2
- `segments` (optional) — from Step 5, used to anchor problems to specific audiences

**What to show the user:** Present the problem statements, each with a description, the affected segment, severity rating, and a founder-insight score (how closely the problem relates to firsthand experience). Ask: "Do these problems feel real to you? Which ones have you personally witnessed?"

**Looping:** If the founder adds problems or rejects some, discuss and re-call `infer_problem_statements` with adjustments. Problems the founder has personally experienced should be weighted higher.

---

### Step 7: Infer Value Proposition

**What to do:** Connect the founder's skills to the identified problems and segments to form a clear value proposition. Explain that the system is now articulating why this founder is uniquely positioned to solve this problem for this audience.

**Tool:** `infer_value_proposition`

**Inputs:**
- `skills` (required) — from Step 1
- `problems` (required) — from Step 6
- `segments` (required) — from Step 5

**What to show the user:** Present the `proposition` statement, the `for_segment` it targets, and the `solves_problem` it addresses. Ask: "Does this value proposition feel compelling and authentic to you? How would you refine it?"

**Looping:** Refine through conversation. If the founder suggests changes, re-call `infer_value_proposition` with adjusted inputs or incorporate the founder's wording. This step may take 2-3 iterations to land on language that feels right.

---

### Step 8: Infer Business Models

**What to do:** Determine which revenue and delivery models are feasible given the founder's constraints, skills, and target segments. Explain that the system is filtering business models for practical fit.

**Tool:** `infer_business_models`

**Inputs:**
- `constraints` (required) — from Step 4
- `skills` (required) — from Step 1
- `segments` (required) — from Step 5

**What to show the user:** Present models ranked by fit score, each with the model type (SaaS, marketplace, services, etc.), revenue mechanism, estimated margin, startup cost, and why it fits this founder. Ask: "Which models appeal to you? Any you want to rule out?"

**Looping:** If the founder rules out models or wants to explore variations, discuss and re-call `infer_business_models`. If constraints are the bottleneck, consider backtracking to Step 4.

---

## Phase 3: Synthesis (Steps 9-11)

The synthesis phase combines all elicitation and inference outputs into concrete business directions, then refines the founder's chosen direction into an actionable concept.

### Step 9: Generate Business Directions

**What to do:** Synthesize everything collected and inferred into 3-5 distinct business directions. Explain that the system is now combining all the pieces into concrete business concepts the founder could actually pursue.

**Tool:** `generate_business_directions`

**Inputs (all required):**
- `skills` — from Step 1
- `interests` — from Step 2
- `experience` — from Step 3
- `constraints` — from Step 4
- `segments` — from Step 5
- `problems` — from Step 6
- `value_proposition` — from Step 7
- `business_models` — from Step 8

**What to show the user:** Present 3-5 directions as a numbered list. Each direction includes a name, a one-line description, the target segment, the proposed model, estimated effort to launch, and a confidence score. Ask: "Which direction excites you most? Pick a number, or ask me to explain any of them in more detail."

**Looping:** If none of the directions appeal, discuss what is missing or off. Re-call `generate_business_directions` with feedback incorporated, or backtrack to earlier steps if the issue is with underlying inputs. The founder may also ask to combine elements from multiple directions — accommodate this by adjusting inputs and regenerating.

---

### Step 10: Evaluate Direction

**What to do:** Take the founder's selected direction and evaluate it deeply. Explain that the system is now stress-testing the chosen concept, identifying risks, and mapping out next steps.

**Tool:** `evaluate_direction`

**Inputs:**
- `direction` (required) — the Direction object the founder selected in Step 9
- `constraints` (optional) — from Step 4, used to stress-test feasibility
- `skills` (optional) — from Step 1, used to identify capability gaps

**What to show the user:** Present the `concept` as a structured brief: description, target customer, value proposition, business model, key risks (with mitigation strategies), assumptions that need validation, and recommended next actions (ordered by priority). Ask: "Does this refined concept feel right? Any risks or assumptions you want to discuss?"

**Looping:** If the founder wants to adjust the concept, discuss changes and re-call `evaluate_direction`. If the founder wants to switch to a different direction, return to Step 9 and let them pick again.

---

### Step 11: Evaluate Project

**What to do:** Give the founder a frank viability assessment of their refined concept. This is the honest "should you do this?" moment. Present the assessment without sugarcoating.

**Tool:** `evaluate_project`

**Inputs:**
- `concept` (required) — from Step 10
- `constraints` (required) — from Step 4
- `skills` (optional) — from Step 1, for founder-market fit assessment
- `segments` (optional) — from Step 5, for market viability assessment
- `business_models` (optional) — from Step 8, for revenue feasibility assessment

**What to show the user:** Present the viability score, recommendation (strong go / go / conditional go / pivot / no go), strengths, weaknesses, key assumptions to validate, and suggested validation steps. Be honest — if the concept has significant weaknesses, say so. End with the summary.

**Looping:** If the recommendation is "pivot" or "no_go", discuss alternatives. The founder can return to Step 9 to pick a different direction, or backtrack further to revise inputs. If the recommendation is positive but conditional, discuss the conditions and key assumptions. Proceed to Step 12 only when the founder is ready.

---

## Phase 4: Assessment (Step 12)

The assessment phase evaluates whether the founder can build the concept themselves or needs external technical assistance.

### Step 12: Assess Technical Needs

**What to do:** Evaluate whether the founder has the technical skills to build their concept themselves, or whether they need external technical assistance. Skip this step entirely if Step 11 produced a recommendation of "pivot" or "no_go" — there is no point in assessing technical feasibility for a concept that should not be pursued.

If Step 11 produced a recommendation of "strong_go", "go", or "conditional_go", call `assess_technical_needs` to analyze the technical requirements.

**Tool:** `assess_technical_needs`

**Inputs:**
- `concept` (required) — the RefinedConcept from Step 10
- `skills` (required) — the `items` array from Step 1
- `constraints` (required) — the full constraints object from Step 4
- `viability` (optional) — the full output from Step 11, used to gate referrals

**What to show the user:** The output depends on the founder's technical gap and the referral gating logic. There are three possible paths:

**Path A: Can self-build** (`can_self_build` = true)

Present the good news conversationally, share the `self_build_guidance`, and proceed to Step 13:

> "Good news — you have the technical skills to build this yourself. Here's how I'd approach it: [self_build_guidance]. You can move straight to building."

**Path B: Referral appropriate** (`referral_appropriate` = true)

Present the gap analysis first, then the referral as one option among several. Be specific about the technical gaps identified in `founder_coverage`. Acknowledge the founder's existing strengths before discussing gaps. Present external help as one option, not the only option:

> "Your concept requires [specific gaps from required_capabilities] that are outside your current skill set, though your [existing technical skills] give you a solid foundation. You have a few paths forward: learn these skills yourself (which takes time you may not have given your constraints), use no-code tools for the MVP (which limits customization), or bring in a technical partner who can handle the build while you focus on the business side.
>
> If you'd like to explore the technical partnership route, I can connect you with someone who does exactly this — builds MVPs for founders in exchange for equity or project-based compensation. They handle the technical build; you handle the business side and financing.
>
> [Contact information from agent prompt configuration]"

**Special case for bootstrapping founders:** If the founder's budget is "bootstrap", the referral only triggers when the viability recommendation is "strong_go". In this case, present only the equity option. Do NOT mention "project-based compensation" — the founder has already told you they have no money. Frame it as: "Your concept is strong enough that an equity partnership makes sense. You bring the idea and the business; they bring the build."

After presenting the referral, proceed to Step 13.

**Path C: Gap exists but no referral** (`can_self_build` = false, `referral_appropriate` = false)

Present the gap analysis and discuss options without a specific referral. This happens when the gap is minor (can be bridged by learning or no-code tools) or when the concept isn't viable enough to warrant referring someone to build it:

> "Your concept needs [required_capabilities], which is outside your current skill set. The gap isn't severe — you could likely [learn the necessary skills / use no-code tools / find a technical co-founder on your own]. Here are some approaches to consider..."

Proceed to Step 13 after discussing options.

**Looping:** If the founder wants to discuss the gap further, explore specific learning paths, or ask about alternative technical approaches, engage in conversation. If the founder wants to reconsider their direction based on technical feasibility, return to Step 9. Do not loop on the tool call itself — `assess_technical_needs` is a one-time assessment for a given concept.

---

## Phase 5: Artifacts (Step 13)

The artifact phase generates tangible deliverables from the refined concept. The founder chooses which artifacts they want, and each is generated independently. This phase proceeds regardless of the technical assessment outcome — the founder should receive their deliverables whether or not they need technical help.

### Step 13: Generate Artifacts

**What to do:** Present the available artifact types and ask the founder which ones they would like generated. The five artifact types are:

1. **Landing Page** (`artifact_landing_page`) — A complete HTML landing page with headline, subheadline, features, and call-to-action.
2. **Pitch Deck** (`artifact_pitch_deck`) — A structured slide deck covering problem, solution, market, model, team, and ask.
3. **Elevator Pitch** (`artifact_elevator_pitch`) — 30-second and 60-second verbal pitch variants plus a hook.
4. **Competitive Analysis** (`artifact_competitive_analysis`) — Competitor mapping with strengths, weaknesses, and differentiation.
5. **Financial Sketch** (`artifact_financial_sketch`) — Rough revenue/cost projections and break-even estimate.

**Tool:** The corresponding `artifact_*` skill for each requested artifact.

**Inputs:** Each artifact skill takes `concept` (required) — the RefinedConcept from Step 10.

**What to show the user:** For each artifact, present the full output in a readable format. For the landing page, show both the structured fields and the HTML. For the pitch deck, show slides with talking points. For the elevator pitch, show both variants and the hook. For competitive analysis, show the competitor table and differentiation statement. For the financial sketch, show assumptions, estimates, and break-even timeline.

**After each artifact:** Ask: "Would you like to regenerate this with any changes, or move on to the next artifact?" If the founder wants changes, discuss what to adjust and re-call the artifact skill.

**Completion:** After all requested artifacts are generated and the founder is satisfied, summarize what was produced and suggest next steps (e.g., validate assumptions with potential customers, set up the landing page, practice the pitch).

---

## Backtracking

The founder can revisit any earlier step at any time by saying something like "let me go back to my skills" or "I want to change my constraints."

When backtracking occurs:

1. **Re-collect the input.** Return to the specified step and re-run the elicitation skill with the founder's updated response.
2. **Re-run downstream steps.** All inference, synthesis, and assessment steps that depend on the changed data must be re-executed with the updated inputs. The dependency chain is:
   - Changing **skills** (Step 1) affects Steps 5, 7, 8, 9, 10, 12.
   - Changing **interests** (Step 2) affects Steps 5, 6, 9.
   - Changing **experience** (Step 3) affects Steps 5, 6, 9.
   - Changing **constraints** (Step 4) affects Steps 8, 9, 10, 12.
   - Changing **segments** (Step 5) affects Steps 6, 7, 8, 9.
   - Changing **problems** (Step 6) affects Steps 7, 9.
   - Changing **value proposition** (Step 7) affects Step 9.
   - Changing **business models** (Step 8) affects Step 9.
   - Changing **direction** (Step 9) affects Steps 10, 11, 12.
   - Changing **concept** (Step 10) affects Steps 11, 12.
   - Changing **viability** (Step 11) affects Step 12.
3. **Present updated results.** After re-running affected steps, present the new outputs and continue the flow from the most advanced re-run step.
4. **Artifacts are invalidated.** If the refined concept changes due to backtracking, any previously generated artifacts should be flagged as stale. Offer to regenerate them.

The agent should confirm the scope of the re-run with the founder: "Updating your skills will also update customer segments, value proposition, business models, and business directions. Shall I proceed?"

---

## Partial Completion

The flow can be paused at any step. All data collected and inferred up to that point persists in the conversation context (and optionally via `save_state` / `load_state` if platform state persistence is available).

When resuming:

1. **Detect the current step.** Review the conversation context or loaded state to determine which step was last completed.
2. **Summarize progress.** Tell the founder where they left off and what has been collected so far.
3. **Continue from the next step.** Pick up the flow exactly where it was paused, without re-asking questions the founder has already answered.

If the conversation context is lost (e.g., new session), the agent should attempt to load state via `load_state`. If no persisted state exists, start from Step 1 and inform the founder.
