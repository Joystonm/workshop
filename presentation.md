# Workshop — Online Video Demo (my voice)

**Live URL:** https://fastidious-elephant-84.convex.site
**Runtime:** 5:00–6:30, recorded in one take.
**How to read this:** text in `[BRACKETS]` is what happens on screen. The rest is what I say. I've written it like I'm talking, not presenting.

> **Video description (paste under the video):**
> I built Workshop for the Convex hackathon. Four virtual labs — CAD, physics, chemistry, Earth & Climate — and an AI tutor that actually sees your experiment. Free, no signup. https://fastidious-elephant-84.convex.site

---

## Chapters

```
00:00  The thing that bugged me
00:30  What I built
01:00  Physics demo
02:00  Chemistry demo
03:00  CAD demo
03:50  Earth & Climate demo
04:30  How the AI tutor actually works
05:15  Why I think this one matters
05:45  The honest weaknesses
06:10  Close
```

---

## 1. The thing that bugged me — 30 seconds

`[ON-SCREEN: black, then the URL stamps in lower-right and stays there for the whole video.]`

I hated physics class. Not the physics — the physics is fine. I hated that they made me memorize the answer and never let me run the experiment to check it. Took me until college to find out that a pendulum's period doesn't depend on its mass. I just… never had the apparatus in front of me.

And the apparatus is the actual problem. A real chemistry lab is tens of thousands of dollars in fume hoods and reagents. CAD software runs four hundred a month. A wind tunnel for climate work is a research grant, not a classroom. Most of what I wanted to try, I couldn't afford to try. So I never got to find out if I even liked it.

`[CUT TO HOMEPAGE.]`

So I built the thing I wanted at fifteen.

---

## 2. What I built — 30 seconds

`[ON-SCREEN: scroll down the homepage, stop on the four workshop cards.]`

Workshop. Four labs — CAD, Physics, Chemistry, Earth & Climate. Thirty-nine experiments across them. Free. No signup, no install, no credit card, no "subscribe to keep going". You click, you're in.

`[ON-SCREEN: pointer hovers each card for half a second as I name them.]`

The thing I'm proudest of is the AI tutor in the corner of every workshop. It's not a chatbot bolted on. It watches what you're doing and answers about your experiment, not a generic one. I'll show you.

`[ON-SCREEN: pointer moves to "Start Building". Click.]`

---

## 3. Demo

### Beat 1 — Physics. ~50 seconds

`[CUT. Physics lab opens. Pendulum is already running.]`

Pendulum. Period top right is 2.1 seconds.

`[ON-SCREEN: drag the mass slider from 1 to 2 kg. Period doesn't move.]`

Doubled the mass. Period still 2.1.

`[ON-SCREEN: click Ask Agent. Type "why didn't the period change when I doubled the mass?" Send.]`

`[ON-SCREEN: while the answer streams, PIP bottom-right shows the snapshot the model actually got — length, mass, angle, period. Hold 2s.]`

`[ON-SCREEN: PIP goes away. The reply is on screen. Highlight the line that names the period.]`

It told me the period is independent of mass. That's correct. But the interesting part isn't the answer — it's that it cited *my* period, *my* length, *my* mass. The model didn't guess. It read what I was doing.

`[CUT. Chemistry lab.]`

### Beat 2 — Chemistry. ~50 seconds

`[ON-SCREEN: two beakers — HCl on the left, NaOH on the right. Nothing has happened yet.]`

Chemistry lab. I've got hydrochloric acid on the left, sodium hydroxide on the right.

`[ON-SCREEN: drag HCl into NaOH. pH swings 1→7. Temperature rises.]`

Neutralization. Exothermic. ΔH about −57 kJ/mol.

`[ON-SCREEN: open Ask Agent. Type "what just happened, and why is it exothermic?" Send.]`

`[ON-SCREEN: PIP shows the snapshot the model got. NOT "reaction 5". It got the actual reaction string, the ΔH value, the temperature delta. Hold 2s.]`

`[ON-SCREEN: PIP away. Highlight the line in the reply that names the reaction.]`

Every workshop sends the AI labels, not raw indices. That's why the chemistry tutor knows which reaction you picked, and the CAD tutor knows which joint you loaded, and neither one of them ever has to guess.

`[CUT. CAD viewport.]`

### Beat 3 — CAD. ~45 seconds

`[ON-SCREEN: empty 3D grid. Drop four cubes. Stack them.]`

3D viewport. I'm stacking four cubes.

`[ON-SCREEN: click Test Load. Tower bends. Bottom joint cracks.]`

Load test. The tower fails at the bottom joint.

`[ON-SCREEN: open Ask Agent. Type "would this survive a magnitude 6 quake? what's the weakest joint?"]`

`[ON-SCREEN: PIP shows the CAD snapshot — mesh, joints, load, stress result. Hold 2s.]`

`[ON-SCREEN: PIP away. Highlight the model's recommendation about the weakest joint.]`

Same AI. Different lab. It knows the shape I built, the load I applied, the joint that failed. It tells me what to fix.

`[CUT. Earth & Climate.]`

### Beat 4 — Earth & Climate. ~30 seconds

`[ON-SCREEN: panels — earthquake feed, air quality, ocean temperature. Numbers moving.]`

Last lab. This one's different — it's not a simulation.

`[ON-SCREEN: zoom on the earthquake feed. A quake from somewhere in the Pacific Rim pops in.]`

That's the USGS seismic network. NASA's Earth observation. NOAA buoys. Live. When something shakes right now, that panel moves before the news does.

`[HOLD FOR ONE FULL SECOND. NO VOICEOVER.]`

---

## 4. How the AI tutor works — 40 seconds

`[ON-SCREEN: a simple three-box diagram. Workshops on the left, Convex in the middle, the AI tutor on the right. Arrows show what flows where.]`

Three things about how this is built, then I'll stop being an engineer about it.

**One.** Convex runs the whole thing. Every slider, every query, every message to the AI — it's a Convex function. Real-time sync isn't a feature I added. It's a default. One command deploys it.

**Two.** The trick is what each workshop sends the AI. Three things — a plain-English summary of what's happening, the parameter definitions with their labels and units, and the raw state. The model reads the labels first. It never has to interpret a raw index.

**Three.** The site you're watching this video on is served from the same Convex backend that runs the experiments. Static hosting, queries, actions, storage — all one place.

---

## 5. Why I think this one matters — 30 seconds

I think it matters for two reasons.

One — the AI is honest about your experiment, not about a textbook. When you ask a question in Workshop, the answer starts from what *you* did. If the model doesn't know, it goes to the web and comes back. If it does know, it's because the lab told it.

Two — the kid in a school that can't afford a chemistry lab gets to run the experiment tonight. Same labs, same data, same AI tutor, same access. It costs nothing. It runs in a browser. It works on a school-issued Chromebook. The only thing a student needs is curiosity and a link.

`[PAUSE HALF A SECOND.]`

That's the difference between a tutor and a chatbot. And it's the difference between a demo project and something that could actually matter.

---

## 6. The honest weaknesses — 25 seconds

`[ON-SCREEN: text cards, one per weakness. Don't sugarcoat.]`

I want to be upfront about three things.

**One.** The AI can still be wrong. The snapshot trick cuts down on hallucination, but it doesn't eliminate it. If you ask a question it can't ground in your experiment, it might guess.

**Two.** Earth & Climate depends on three external APIs. If one of them rate-limits me, that panel goes dark. I have fallbacks but they're not perfect.

**Three.** The mobile experience is bad. I optimized for a laptop. On a phone it's cramped. I knew this when I shipped it and I shipped it anyway because the hackathon deadline was the deadline.

I'd rather be honest about those than pretend they're not there.

---

## 7. Close — 10 seconds

`[ON-SCREEN: URL fills the screen. Big. Holds for 5 seconds.]`

It's live. **fastidious-elephant-84.convex.site**. Try it. Break it. Tell me what's wrong with it.

`[FADE TO BLACK. URL HOLDS 2 MORE SECONDS.]`

---

## Notes for me when I record

- **Time check.** Target 5:30. If I'm over 6:30, cut Earth & Climate to one sentence. The three AI beats are the part that matters.
- **The PIP timing matters.** Exactly 2 seconds, same crop position every time. That's the visual proof that the AI isn't guessing.
- **Don't say "as you can see".** Cut it before I record. Same for "let me show you". Both sound like filler.
- **The AI won't reply word-for-word the same every run.** Don't try to lock the script to specific wording. Highlight whatever line the model gives me that cites my numbers. If it ever says "as an AI", I stop and say "watch — it cited the actual ΔH".
- **URL stays on screen the whole time.** Bottom-right, small, semi-transparent. Don't take it off for any reason.
- **Captions.** Auto-captions will destroy "neutralization", "exothermic", "kilojoules", "ΔH". Burn them in.
- **One take.** Don't try to be perfect. The slightly-rough delivery is the point. If I sound too polished it sounds AI-written. I want it to sound like me on a Tuesday night, because that's when I built it.