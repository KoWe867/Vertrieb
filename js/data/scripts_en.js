// English call script for international leads (USA, UK, Canada, Australia, rest of world).
window.ALWINE_SCRIPTS_EN = {
  phasen: [
    { id: "vorbereitung", kurz: "Prep", titel: "0. Before the call (30 seconds)", ziel: "Know who you are calling and why this company.",
      text: ["Look at their website for 20 seconds: what is obviously outdated or missing?", "Have the hook in mind: {aufhaenger}", "Goal of the call: NOT to sell, but to book a 15-minute call.", "Time zone check: it must be business hours where they are."] },
    { id: "zentrale", kurz: "Gatekeeper", titel: "1. Front desk / gatekeeper", ziel: "Get transferred to the owner, or get their name and best time.",
      text: ["“Hi, this is {ich} with Alwine. I'm trying to reach the owner – who would that be?”", "(Write the name down.) “Thanks. Is {ansprechpartner} available right now?”", "If “What's this regarding?”: “It's about {aufhaenger} – a quick thing I'd like to run by {ansprechpartner} directly.”", "If “Send an email”: “Happy to. So it actually gets read – who should it go to, and when is {ansprechpartner} usually easiest to reach by phone?”"],
      tipps: ["Friendly, calm, matter-of-fact. Never lie about a prior relationship.", "The front desk is your ally – remember their name."] },
    { id: "opener", kurz: "Opener", titel: "2. Opener with the decision maker (max. 20 sec.)", ziel: "Get permission for 30 seconds – it drops resistance immediately.",
      text: ["“Hi {ansprechpartner}, this is {ich} with Alwine. We haven't spoken before – I'll tell you in 30 seconds why I'm calling, and you decide if it's worth continuing. Fair enough?”", "(Wait for the yes.)", "“{opener_branche}”", "Alternative if you saw something specific: “I just looked at your website and noticed that … [specific observation]. Is that on purpose, or did it just slip through the cracks?”"],
      tipps: ["“Fair enough?” is the most important line in the script.", "After the opener: stop talking. They speak next.", "Don't open with “How are you today?” – it flags you as a telemarketer."] },
    { id: "qualifizierung", kurz: "Questions", titel: "3. Qualify (ask, listen)", ziel: "Find out if there is a real problem and whether it hurts.",
      text: ["Situation: “How are things working right now with [website / leads / bookings / videos]?”", "Problem: “What's the most annoying part of that?” / “What happens if it stays that way?”", "Implication: “Roughly what does that cost you per month – in time or in lost jobs?”", "Payoff: “If that were solved – what would that change for you?”", "Decision: “Who else besides you would be involved in a decision like this?”"],
      tipps: ["SPIN order: Situation → Problem → Implication → Need-payoff.", "Rule of thumb: they talk 70 %, you talk 30 %.", "Mirror back: “So what you're saying is … – did I get that right?”"] },
    { id: "pitch", kurz: "Pitch", titel: "4. Short pitch (only the matching solution)", ziel: "Show one solution, not the whole catalog.",
      text: ["“That's exactly what we do: [service in one sentence].”", "“Concretely for you: [benefit 1], [benefit 2].”", "“Example: [similar client / situation].”", "“And the key part: you don't have to manage anything – we build it and host it 24/7, and you can still change anything yourself.”"],
      tipps: ["Benefits, not features.", "One example beats three arguments.", "Prices on the phone only as a range (“starting at …”)."] },
    { id: "abschluss", kurz: "Close", titel: "5. Close = book the meeting", ziel: "Fixed date and time, calendar invite sent immediately.",
      text: ["“Here's what I suggest: a 15-minute video call, I show you 2–3 examples, and we see if it's a fit. Does Tuesday at 10 or Thursday at 3 work better for you?”", "“Great, Thursday at 3 your time. I'll send a calendar invite – what's the best email?”", "“So I can prepare: what's the one thing you'd want us to cover?”", "“Talk Thursday, {ansprechpartner}. Thanks for your time.”"],
      tipps: ["Alternative close (A or B), never “Do you have time sometime?”.", "Confirmation email within 5 minutes. Reminder the day before.", "Always state the time in THEIR time zone."] },
    { id: "mailbox", kurz: "Voicemail", titel: "Voicemail (max. 20 sec.)", ziel: "Create curiosity, make the callback easy – leave a message on attempt 1 and 3 only.",
      text: ["“Hi {ansprechpartner}, this is {ich} with Alwine, {telefon}. I'm calling about {aufhaenger} at {firma}. I'll try again tomorrow morning – or feel free to call me back at {telefon}. Again, {ich}, Alwine, {telefon}. Thanks!”"],
      tipps: ["Say the number twice, slowly.", "No pitch on voicemail.", "Follow with a short email as an anchor."] }
  ],
  einwaende: [
    { einwand: "“Not interested.”", antwort: "“Totally fair – I hear that a lot before people know what it's about. Can I ask one question, and if the answer is no, I'll hang up: are you getting regular inquiries through your website right now?”", hinweis: "Don't argue. One question, then silence." },
    { einwand: "“I don't have time.”", antwort: "“I believe you, that's why I'll keep it short. When's better – today at 4 or tomorrow at 8?”", hinweis: "Time is almost never the real objection. Fix a callback time." },
    { einwand: "“Send me some information.”", antwort: "“Happy to. So I don't send you 20 pages nobody reads: what exactly would be useful – website, online booking, or videos? … Got it. I'll send you one example on that and call Friday to see if it fits. Sound good?”", hinweis: "Email only with a callback date, otherwise it's a polite no." },
    { einwand: "“We already have an agency / a web guy.”", antwort: "“Great, so it's clearly important to you. How happy are you with turnaround time and cost when you need a change? … That's exactly where we're different: changes are included in the monthly fee. Worth a 15-minute comparison?”", hinweis: "Never badmouth the competitor. Ask about turnaround and change costs." },
    { einwand: "“Too expensive / no budget.”", antwort: "“Understood. What are you comparing it to? … Most of our clients pay less than their phone bill per month and get someone who actually takes care of it. But whether it pays off depends on what one extra inquiry a week is worth to you – roughly, what would that be?”", hinweis: "Anchor the price in everyday terms. Never discount first." },
    { einwand: "“We do it ourselves.”", antwort: "“That's great that someone's on it. How often does the site actually get updated? … If you like, we look at it together on the call – often it's enough if we take over just the part that keeps slipping.”", hinweis: "Don't belittle. Ask about frequency and results." },
    { einwand: "“All our business comes from referrals.”", antwort: "“That's the best sign of good work. And when someone gets the referral, what's the first thing they do? They Google you. What do they find? … That's exactly the point: making sure the referral doesn't die on the website.”", hinweis: "Turn the referral objection into the opportunity." },
    { einwand: "“Bad experience with agencies.”", antwort: "“I hear that a lot, unfortunately. What went wrong back then? … That's why we work on a fixed price, you see progress every week, and you keep all logins. I can show you how that works on the call.”", hinweis: "Listen, capture the specific pain, state the difference." },
    { einwand: "“I need to talk to my partner.”", antwort: "“Makes sense. Easiest is if they join the 15-minute call – then you don't have to relay anything. When works for both of you?”", hinweis: "Bring the decision maker into the meeting." },
    { einwand: "“Where did you get my number?”", antwort: "“From your website / public business listing. I'm calling businesses in your industry because this topic affects a lot of them right now. If you'd rather not get calls, I'll note that right away.”", hinweis: "Answer honestly, respect the wish, mark the lead 'Do not call'." },
    { einwand: "“You're calling from Germany? Why?”", antwort: "“Yes – we're a German software and web studio, and we work with clients remotely in the US and UK. For you that means European quality at a rate that's usually well below local agencies, and we're online during your morning. Fair to give it 15 minutes?”", hinweis: "Turn the foreign angle into a benefit: quality, price, availability." }
  ],
  goldene_regeln: [
    "The goal of the call is the meeting, not the sale.",
    "Ask permission, then 30 seconds, then a question.",
    "They talk 70 %. Ask, listen, mirror.",
    "A no is information, not a verdict. Next call.",
    "Every call gets logged with outcome and next step.",
    "At least 6–8 touches per company over 4 weeks before a lead is dead.",
    "Confirmation within 5 minutes after every booked meeting."
  ]
};
