# ÉcoMetric

**A schedule-builder that estimates a student's annual emissions** — built for Université de Moncton's *"Agir pour notre environnement"* sustainability initiative.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-prototype%20live-brightgreen?style=flat-square)

🔗 **Live prototype:** [mathisjean.github.io/student_eco_tracker](https://mathisjean.github.io/student_eco_tracker)

---

## The problem

Most students don't know what to actually do about their individual environmental impact — one commonly cited figure is that **73% of students nationally don't know what individual action to take** on climate change (Data for Progress, 2022). UdeM has a 2040 carbon-neutrality target, but individual action toward it is barely measured anywhere.

## What it does

ÉcoMetric lets a student build their full course schedule and get an estimate of their annual emissions from it, using established environmental data. The full proposal (below) extends this with peer comparison and personalized AI-generated suggestions for reducing impact — the working prototype covers the schedule-building and estimation core.

## Why this design

The proposal leans on two specific ideas from behavioral economics:

> "If you want to encourage a behavior, make it easy and make the benefits visible." — Richard H. Thaler, *Nudge*

and Barry Schwartz's *The Paradox of Choice* — that people hesitate in proportion to the number of options in front of them. ÉcoMetric tries to remove that friction: instead of an overwhelming menu of ways to reduce emissions, it narrows things down to small, personalized, achievable steps.

<details>
<summary><strong>The fuller proposal (submitted to a judged campus competition)</strong></summary>

I authored and submitted a full research-backed proposal for an expanded version of this tool — peer comparison against the student community average, AI-generated reduction suggestions, and a path to expansion across UdeM's three campuses. It included a costed budget (~$14,700 CAD across development stipends, tooling, AI integration, and testing incentives) and a two-semester rollout plan: data integration and interface work in fall 2026, user testing with a 20-student group in winter 2027, and official deployment in spring 2027.

It was judged against other submissions and didn't win, so the expanded version was never built — but the prototype below stands on its own, and the proposal itself was a complete, researched, budgeted deliverable.

**Sources cited:** Data for Progress (2022); Jones & Kammen (2011), *Environmental Science & Technology*; Kelleher & Wagener (2011), *Computers & Education*; Luckin et al. (2016), *Intelligence Unleashed*; Schwartz (2004), *The Paradox of Choice*; Seker, Sahin & Hacıeminoğlu (2024), *Sustainability*; Thaler & Sunstein (2008), *Nudge*.

</details>

## Tech

- Drag-and-drop schedule-building UI
- JSON database of emissions data
- Emissions estimates currently sourced from an AI model as a placeholder ahead of fully verified environmental data integration

---

*Built for UdeM's "Agir pour notre environnement" initiative — prototype and proposal, Feb–Mar 2025.*
