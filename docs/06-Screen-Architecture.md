# MG Supermart — Screen Architecture

Version: 1.0
Status: Approved
Document: 06
Milestone: 3
Owner: Ajeet Kumar
Last Updated: July 2026

Table of Contents

0. Preface

1. Experience Principles

2. Screen Inventory

3. Flow Architecture

4. Navigation Architecture

5. Information Hierarchy

6. Entry Points

7. Exit Points

8. Trust Journey

9. Conversion Strategy

10. Scalability Principles

11. Future Capability Readiness

12. Cross References

13. Assumptions

14. Architecture Validation

15. Document Status & Closure

Version History

---

# 0. Preface

## 0.1 Purpose

Documents 01–05 decided **what MG Supermart is** (Founder Brief), **why customers choose it** (Product Strategy), **how it must behave** (Design Principles), **how it is organized** (Information Architecture) and **what every screen must obey** (Bargad Design Language).

This document decides **what the screens are, what each one is for, and how they relate to one another**.

It is the bridge between the Information Architecture (a map of the territory) and the future UI design (a picture of each place). It contains no layouts, no visuals, no components and no code.

## 0.2 Authority and precedence

Documents 01–05 are finalized, approved and immutable. This document is subordinate to all of them.

Where this document appears to conflict with 01–05, **01–05 win** and this document is defective and must be corrected.

Nothing here re-opens a settled decision. Where a decision already exists, this document cites it rather than restating it.

| Precedence | Document | What it governs here |
|---|---|---|
| 1 | 01 — Founder Brief | Business rules, non-goals, long-term vision |
| 2 | 02 — Product Strategy | Positioning, personas, feature priority, prohibitions |
| 3 | 03 — Design Principles | Experience philosophy, hierarchy, tone |
| 4 | 04 — Information Architecture | Navigation, site map, page hierarchy, flows |
| 5 | 05 — Bargad Design Language | Tokens, components, states, motion, seasonal contract |
| 6 | 06 — Screen Architecture (this) | Screen definition, purpose, relationships, criteria |

## 0.3 Scope of Part 1

Part 1 contains exactly two sections:

1. **Experience Principles** — how the product must feel across the full customer arc, with the reasoning behind each principle.
2. **Screen Inventory** — every screen the platform requires, defined by purpose, goal, user, entry, exit, relationships, dependencies, actions and success criteria.

Part 1 deliberately excludes screen flows, state machines, edge-case matrices, content models and the admin/SEE configuration model. Those belong to later parts of Milestone 3.

## 0.4 How to read this document

- **Experience Principles are testable claims, not sentiment.** Each carries an ID (`EP-x.y`) so a future screen, review or pull request can be judged against a specific line rather than a mood.
- **Screens carry IDs** (`MKT-01`, `CHK-04`, …). Every later document, design file, route and ticket must use these IDs. A screen that does not appear in this inventory does not exist; adding one is a change to this document, not a decision made in a design file.
- **Release tags** follow Product Strategy §10 exactly: `MVP`, `V2`, `Future`. No feature is promoted or demoted here.

---

# 1. Experience Principles

## 1.1 Why this section exists before the screen list

A screen list written first becomes a checklist of pages. A screen list written *after* the experience is defined becomes a set of obligations — each screen exists to carry one part of a relationship forward.

Design Principles §17 defines good design as an outcome: customers trust the platform, understand it immediately, purchase confidently, and return. Those outcomes do not happen on a screen. They happen **across** screens, over months, in a customer's memory. This section defines that continuity so that no individual screen can be designed in isolation and still be correct.

## 1.2 The arc

The Founder Brief describes a neighbourhood shop; the Product Strategy §7 describes a journey that ends in recommendation. Together they define a seven-stage arc. It is one continuous relationship, not seven funnels.

```
First Visit → Browsing → Purchase → Delivery → Repeat Purchase → Community Membership → Advocacy
```

| Stage | The customer's real question | Their emotional state | The product's job | Failure mode we are designing against |
|---|---|---|---|---|
| First Visit | "Is this actually my shop, and does it serve me?" | Curious, sceptical, slightly wary of "another app" | Prove identity, prove service area, promise nothing false | The visitor cannot tell this is the Pipra shop, or cannot tell whether we deliver to them |
| Browsing | "Do they have what I buy, at a price I know?" | Comparing against the counter, from memory | Show the real shelf honestly and let them move without effort | Browsing feels like operating software instead of walking aisles |
| Purchase | "If I hand over this order, will it be honoured?" | Highest anxiety of the entire arc | Remove every surprise before payment | A cost, rule or condition appears at the last step |
| Delivery | "Where is my order, and when does it arrive?" | Anxious waiting, no control | Narrate the wait truthfully, unasked | Silence — the customer has to chase us |
| Repeat Purchase | "Is doing this again easier than walking to the shop?" | Habit forming or habit dying | Make the second order cost almost nothing | The second order costs the same effort as the first |
| Community | "Are these my people?" | Belonging, or the fear of spam | Invite after value, state exactly what will be sent | The community feels like a marketing list |
| Advocacy | "Would I tell my neighbour about this?" | Confident, generous | Make the recommendation one tap and one honest sentence | We ask for advocacy before earning it, or pay for it |

## 1.3 EP-0 — Laws that apply to every stage

These bind every screen in Section 2 without exception. A screen that violates an EP-0 law is not shipped, regardless of how well it performs.

| ID | Principle | Reasoning |
|---|---|---|
| EP-0.1 | **One shop, one voice.** Website, WhatsApp, phone call, delivery handover and the physical counter are one continuous conversation with one person: the shopkeeper. | Our customers live within 5 km and already know the shop in person (Founder Brief §2). If the website's register differs from the counter's, the website reads as an outside vendor wearing the shop's name — and apnāpan, the one asset national platforms cannot copy (Bargad §01), is spent instead of carried. |
| EP-0.2 | **The arc is inherited, not restarted.** Every screen assumes the stage before it happened and prepares the stage after it. No screen treats the customer as a stranger who arrived from nowhere. | Trust compounds only if it accumulates. A confirmation screen that does not prepare the wait, or a tracking screen that does not prepare the reorder, drops the thread and forces the relationship to restart at zero on the next visit — which is exactly how transactional platforms behave and why nobody feels loyal to them. |
| EP-0.3 | **Language is dignity, not a feature.** Hindi and English are equal at every stage; switching changes words, never structure, hierarchy or capability. The choice is honoured for the rest of the relationship. | Bargad §08 already settled this typographically. The experience consequence is that no stage may be *shallower* in Hindi — an English-only tracking page or an English-only error message tells a Hindi-speaking customer, correctly, that the product was built for someone else. |
| EP-0.4 | **A slow network is a customer, not an edge case.** Every stage must complete on a ₹6,000 Android phone on 3G. Loading, empty, offline and error are designed states of the arc, not defects in it. | Founder Brief §5 names slow connections as an audience characteristic, not a risk. If the arc breaks under bad network, we have not built a rural-first product — we have built an urban product that rural customers occasionally fail to use. |
| EP-0.5 | **No dark patterns, at any stage, for any metric.** No fake scarcity, no countdowns, no pre-ticked boxes, no guilt copy, no buried costs, no obstructed exits. | Product Strategy §12 is absolute. Beyond ethics, it is arithmetic: our customers can walk into the shop tomorrow and check. A trick that works once online costs a relationship that was worth years of orders offline. |
| EP-0.6 | **Reversibility.** Every step has a visible way back and a visible way out. No dead ends, no traps, no unexplained disabled states. | IA §16 requires navigation to always answer "how do I return?". For a first-time internet user, an irreversible step is a reason to stop using the internet — not a reason to complete the step. |
| EP-0.7 | **The resting state is complete.** The arc must work fully with no campaign, no festival, no theme and no personalization active. | Bargad §25: the courtyard doesn't change, the rangoli does. An arc that only feels good during Diwali is a campaign, not a product — and the Seasonal Experience Engine is explicitly out of MVP scope (Founder Brief §20). |
| EP-0.8 | **Human contact is a feature of every stage, never an admission of failure.** WhatsApp and Call are reachable from anywhere in the arc. | Founder Brief §14 and Bargad §21 place the community bridge on-screen permanently. In a shop-based relationship, "let me just ask them" is the normal resolution path — hiding it behind a support form would make us more distant than the shop we are digitizing. |

## 1.4 EP-1 — First Visit

**What must be felt:** *"This is the shop I already know. It is open, it serves my area, and it is not going to trick me."*

The first visit is not a conversion event. It is an identification event. Almost every visitor will arrive from Google Business, an Instagram bio, a WhatsApp forward, a printed QR at the counter, or word of mouth — with an existing offline impression of MG Supermart. The site's first job is to match that impression, not to replace it.

| ID | Principle | Reasoning |
|---|---|---|
| EP-1.1 | **Prove the shop is real before asking for anything.** The identity, area served, working hours and human reality of the shop are visible without any interaction. | A customer within 5 km can verify us by walking in (Bargad §15). Photography, address and real people therefore *earn* trust at no cost — while a generic ecommerce shell forces the visitor to ask "who actually runs this?", which is the exact doubt our physical presence exists to eliminate. |
| EP-1.2 | **Answer the delivery question in the first screenful:** do you deliver to me, when, and what does it cost. | This is the only question that determines whether the rest of the site has any value to this person. Deferring it to checkout wastes the visitor's data and time, and Founder Brief §9 forbids delivery surprises. The delivery strip (Bargad §21) exists for this and must never be decorative. |
| EP-1.3 | **Ask for nothing at the door.** No login wall, no signup modal, no location permission prompt, no notification permission prompt, no newsletter interruption, no app install nag. | For a first-time internet user, every prompt is a risk with unknown consequences. Requests made before value is delivered are read as extraction, not onboarding. Guest browsing and guest checkout are already committed (Founder Brief §11), so no gate has a business justification. |
| EP-1.4 | **State the ₹500 minimum and the oils/loose-sugar exception early and politely — never at payment.** | Founder Brief §9 makes this a business rule and explicitly forbids surprising customers during checkout. Told early, the rule reads as honesty and becomes a reason to trust us; told at payment, the identical rule reads as a trap and becomes a reason never to return. Same fact, opposite outcomes — timing is the entire design. |
| EP-1.5 | **The first visit loads on 3G.** LCP under 2.5 s is an experience requirement of this stage, not a performance target owned by engineering. | Design Principles §14: fast experiences build trust. On a first visit there is no accumulated goodwill to spend on waiting — a slow first paint is indistinguishable from a shop that is closed. |
| EP-1.6 | **The customer's language is one tap away, everywhere, from the first screen — and is then remembered.** | Bargad §21: nobody should hunt through Settings to be spoken to properly. If the first screen speaks the wrong language, the visitor evaluates our competence in a language they are still translating — an unfair test we imposed on ourselves. |
| EP-1.7 | **Promise only what the shop can keep.** No delivery-time claims, no "fastest", no borrowed quick-commerce vocabulary. | Founder Brief §6 and Product Strategy §4: we do not compete on delivery speed. A borrowed promise invites a comparison we would lose, and breaks the moment we miss it — trading our one durable advantage (being believed) for a temporary one (sounding impressive). |

## 1.5 EP-2 — Browsing

**What must be felt:** *"I am walking my own shop's aisles. The prices are the prices. Nothing here is shouting at me."*

Browsing is the longest stage by time and the cheapest to get wrong. It is also where the "not Blinkit" decision (Founder Brief §6, §18) is either real or merely stated.

| ID | Principle | Reasoning |
|---|---|---|
| EP-2.1 | **Browsing is never an interrogation.** No login, no pincode gate, no location permission and no account are required to see products, prices or availability. | Trust before conversion (Design Principles §3). A price hidden behind a form implies the price depends on who is asking — the precise opposite of the transparent pricing our customers already know us for (Product Strategy §5). |
| EP-2.2 | **One glance = the whole truth.** Price, unit, availability and saving are readable together, in rupees, without tapping. Out of stock says so and offers a next step. | Bargad §20 makes the card the shopkeeper's arithmetic said aloud. Hiding the unit, or hiding stock until the cart, converts a browsing decision into a checkout ambush — and the customer discovers it at the stage where our trust budget is thinnest. |
| EP-2.3 | **Two equal doors: Search and Categories.** Neither is the "real" way in. | Typing is a barrier for elderly and low-literacy customers; scrolling a category tree is a barrier for customers who already know they want Sarso Tel 1 L. Both are named personas (Founder Brief §5). Optimizing one door at the expense of the other silently excludes an audience we committed to serve. |
| EP-2.4 | **Three taps to any product, from anywhere.** Navigation depth is capped, not merely "minimized". | IA §2 requires minimized depth and IA §16 requires important actions within one or two taps. A cap is enforceable; "minimized" is an opinion. Depth is also the cheapest thing to accidentally add as the catalogue grows, so it needs a hard number now, not later. |
| EP-2.5 | **The shelf never shouts.** No countdown timers, no fake scarcity, no red prices, one accent per view. | Bargad §03 and §06. A bazaar shouts from every stall; a trusted shop speaks once. Because red only ever means something is genuinely wrong, our customers can stop bracing — and that felt safety is the product. |
| EP-2.6 | **The basket survives.** The cart persists across sessions, reloads, network drops and device switches (once identified), and is always visible. | Grocery baskets are built over hours, not minutes — a list gets added to as the household remembers things. On unreliable networks a lost cart is a lost order and a lost customer. Bargad §21 already keeps the cart permanently on-screen; persistence is the same promise across time. |
| EP-2.7 | **Quantity is the unit of grocery.** Changing quantity never costs a detour out of the shelf. | Bargad §20: pantry shopping means quantities, and a trip to the cart for "2 kg instead of 1" is a tax on every single order. Multiply it across a monthly grocery list and it becomes the reason to walk to the shop instead. |
| EP-2.8 | **Discovery may be seasonal; the shelf stays stable.** Festivals add collections and greetings, never rearrange navigation or relabel categories. | Bargad §25 and Design Principles §15: MG Supermart must stay recognizable in every season. A customer who learned where dal lives in October must still find it there in November, or the site punishes the loyalty it was built to earn. |
| EP-2.9 | **Empty and zero-result states are shop assistants, not apologies.** Every empty state names a next step. | Design Principles §13. In a physical shop, "we don't have that" is always followed by "but try this" — a screen that ends the conversation at "no results" is behaving worse than the counter it represents. |

## 1.6 EP-3 — Purchase

**What must be felt:** *"I know exactly what I am paying, exactly when it comes, and I can stop at any point without losing anything."*

This is the highest-anxiety stage and the shortest. For a first-time online buyer, the fear is not price — it is irreversibility.

| ID | Principle | Reasoning |
|---|---|---|
| EP-3.1 | **No surprises.** Every rupee — items, delivery, minimum-order status, coupon, loyalty — is on screen and settled before the payment step. | Founder Brief §9, stated as an absolute. The ₹500 rule and its oils/sugar exception must be resolved in the cart (Bargad §17), because a customer who discovers a condition at payment learns that we withhold conditions — a lesson that outlives the order. |
| EP-3.2 | **Guest checkout is a first-class path, not a punishment.** It is never slower, never fewer options, never a worse price. | Founder Brief §11 commits to guest checkout. Degrading it to force registration is a dark pattern (EP-0.5) and self-defeating: the account is worth having only if the first order succeeds. |
| EP-3.3 | **Identity is a phone number, not a password.** | Bargad §19: in Pipra a phone number is an identity and an email address often is not. Passwords are the largest abandonment point for new internet users, and a forgotten password at the purchase stage destroys the order at its most fragile moment. |
| EP-3.4 | **An address is a landmark.** The address model bends to how people here actually give directions. | Bargad §19. Forcing a Bangalore address schema onto Pipra produces addresses that are technically valid and practically undeliverable — and tells the customer this was built somewhere else. The delivery stage inherits every defect introduced here. |
| EP-3.5 | **A slot is a promise.** Only slots the shop will actually keep are offered; full slots stay visible and honestly marked. | Bargad §19 shows full slots struck through rather than hidden, because a disappearing option looks like a broken screen while an honest one looks like a real shop with real limits. Every offered slot is a commitment the delivery stage must honour (EP-4.1). |
| EP-3.6 | **One decision per step, and the number of steps is visible and finite.** | Design Principles §5 and Bargad §18: one primary action per screen. At the point of highest anxiety, an unknown number of remaining steps is itself a reason to abandon. IA §10 already fixes the sequence; the customer must be able to see it. |
| EP-3.7 | **Cash on delivery is a legitimate first choice, not a fallback — and a failed payment never destroys the order.** | Many first-time online buyers will not risk digital payment with a shop until the first box physically arrives. Treating cash as second-class insults the majority path. Bargad §06 already scripts the failure copy: explain, then offer cash — a failure that keeps the order is a trust event, not a loss. |
| EP-3.8 | **The confirmation must be portable, and the celebration happens once.** The order is delivered to the customer's own phone (WhatsApp/SMS) and does not live only in a browser tab. | Shared and reset devices are normal here; a receipt that exists only in session state does not exist. Bargad §16 rations celebration to a single 600 ms tick precisely so that it lands — and then the screen's job becomes preparing the wait (EP-0.2), not congratulating itself. |

## 1.7 EP-4 — Delivery

**What must be felt:** *"I don't have to chase anyone. They told me before I had to ask."*

Between confirmation and handover, the customer has paid (or committed) and holds nothing. This is the only stage where the product's job is almost entirely narration.

| ID | Principle | Reasoning |
|---|---|---|
| EP-4.1 | **The customer never has to ask where the order is.** Status changes are pushed to them; the tracking screen is a confirmation of what they already know, not the only source of it. | Bargad §20: anxiety, not price, is the real enemy of first online orders. A shopkeeper who has your money and says nothing is not behaving like a neighbour. Pull-only tracking silently outsources our anxiety to the customer. |
| EP-4.2 | **Tracking requires no login.** An order reference plus the phone number opens the truth. | Orders here are household events: the link gets forwarded on WhatsApp, the phone belongs to one family member, the person home at 6 pm is someone else. An auth wall in front of "where is my dal" converts a 5-second reassurance into a support call — and support calls we caused are not apnāpan, they are our failure billed to the customer. |
| EP-4.3 | **Delays are announced with a cause and a next step, before the customer notices.** | Bargad §06: a warning always names its cause ("बारिश की वजह से…") because a shopkeeper never just says "problem". A disclosed delay costs one order's inconvenience; a discovered delay costs the relationship, because it proves we knew and stayed quiet. |
| EP-4.4 | **A human is one tap away throughout the wait.** | Founder Brief §14 and EP-0.8. During the wait the customer has no leverage and no visibility — this is exactly when a support form is an insult and a WhatsApp reply is the whole brand. |
| EP-4.5 | **The handover is a relationship moment, not a logistics event.** The customer knows who is coming. | Bargad §01's apnāpan is "the warmth of being known" — and it runs both ways. "Ramesh is on the way" converts a delivery into a neighbour, which is the entire structural advantage we hold over a platform with anonymous riders. |
| EP-4.6 | **Short supply and substitution are a conversation, not a silent edit.** Nothing is swapped, removed or re-priced without the customer's word. | Product Strategy §5 rests on genuine products and transparent pricing. A silent substitution is the single fastest way to prove that the online shop and the counter are not the same shop — and to make the customer re-check every future order. |

## 1.8 EP-5 — Repeat Purchase

**What must be felt:** *"Ordering again took me one minute. Why would I do it any other way?"*

Repeat purchase is where the platform either becomes a habit or reveals itself as a novelty. Product Strategy §9 names repeat purchase rate as a core metric; this stage is where it is won.

| ID | Principle | Reasoning |
|---|---|---|
| EP-5.1 | **The system remembers so the customer doesn't.** Addresses, preferred slot, language, and past baskets persist and are offered, never re-asked. | Every re-asked field is a small interrogation (Bargad §19), and interrogations erode apnāpan. The offline shop's superpower is that it already knows you — a website that forgets you between orders is worse than the counter it replaced, and the customer will notice within two orders. |
| EP-5.2 | **Reorder is the shortest path in the entire product.** Repeating a previous order must be materially fewer taps than building it. | Founder Brief §11 commits to reordering previous purchases. Household grocery is 60–80% the same basket every month; if the product does not exploit that, it is asking the customer to re-do known work — which is precisely the effort walking to the shop avoids. |
| EP-5.3 | **The monthly grocery is a rhythm, not a campaign.** The product supports the household's cycle instead of interrupting it. | IA §5 places Monthly Grocery in the homepage architecture as a standing section, not a promotion. Salaries, school fees and festivals set the local shopping calendar; a product aligned to that rhythm gets ordered without being marketed. |
| EP-5.4 | **Nudges are useful, never pursuing.** Reminders follow the customer's own rhythm, are infrequent, are stoppable in one step, and never manufacture urgency. | Founder Brief §18 forbids overwhelming users with offers; EP-0.5 forbids fake urgency. A reminder that arrives when the atta actually runs out is service; the same reminder three times a week is spam — and spam is uninstalled, muted and remembered. |
| EP-5.5 | **Loyalty is arithmetic the customer can do in their head.** Points are stated in rupees, earned visibly, spent obviously, and never expire silently. | Bargad §06 tells savings as a gain in green ("₹40 की बचत"). A loyalty scheme whose value cannot be calculated by the customer is indistinguishable from a scheme designed not to be calculated — and silent expiry is a broken promise the customer discovers alone, which is the worst way to discover anything. |
| EP-5.6 | **Prices do not move quietly.** A repeat customer's known basket does not change price without the change being visible. | Transparent pricing is a stated differentiator (Product Strategy §5), and repeat customers are the ones who would notice. They are also the ones we cannot afford to teach that our prices depend on being watched. |

## 1.9 EP-6 — Community Membership

**What must be felt:** *"These are my people, and they'll tell me what's worth knowing — not sell to me every day."*

Community is a stated primary goal (Founder Brief §3) and a stated differentiator (Product Strategy §6). It is also the easiest thing in this document to turn into spam by accident.

| ID | Principle | Reasoning |
|---|---|---|
| EP-6.1 | **Invite after value, never before it.** The community ask comes after the first order arrives — not on the homepage, not at signup, not in checkout. | An invitation before value is an extraction attempt wearing a friendly word. After a kept promise, the same invitation is a natural next step — the customer has evidence. This is trust before conversion (Design Principles §3) applied to the community goal instead of to the sale. |
| EP-6.2 | **State exactly what will be sent and how often, before joining.** | Founder Brief §18 forbids overwhelming customers with offers, and EP-0.5 forbids surprises. WhatsApp is the customer's most personal channel; entering it without disclosed terms is the fastest way to be blocked — permanently losing a channel we cannot rebuild. |
| EP-6.3 | **Meet the customer where they already live.** WhatsApp, Instagram and Google are the community's homes; we do not build a chat, a feed or a forum to compete with them. | Founder Brief §14 names these integrations. A first-time internet user will not learn a proprietary community feature, and Product Strategy §11 requires every feature to earn its place. Building our own would be a feature that exists to serve us, not them. |
| EP-6.4 | **Greetings are given, not sold.** A festival greeting with no call to action is a legitimate, intentional communication. | Festival greetings are listed under Community (Founder Brief §13, §14), not under Offers. A greeting with a coupon stapled to it is an advertisement, and the customer will read every future greeting as one — which spends the whole channel to sell one campaign. |
| EP-6.5 | **The customer is visible inside the shop.** Real reviews, real names, real photos — with consent, and children only with a parent's. | Bargad §15: photography is proof, not decoration. Community that is only ever *mentioned* is marketing copy; community that is *shown* is evidence — and evidence is the only thing that competes with a customer's memory of the counter. |
| EP-6.6 | **Leaving is as easy as joining, and costs nothing else.** | An exit that is harder than the entrance is a dark pattern (EP-0.5) and it poisons the entrance: customers only join freely when they believe they can leave freely. A visible exit is what makes the invitation honest. |

## 1.10 EP-7 — Customer Advocacy

**What must be felt:** *"I'd tell my sister to order from here — and it took me one tap to do it."*

Local word-of-mouth is a named success metric (Founder Brief §17). Advocacy is not a growth mechanic bolted on at the end; it is the observable output of the previous six stages.

| ID | Principle | Reasoning |
|---|---|---|
| EP-7.1 | **Advocacy is earned first, then made easy.** The product asks only after a promise has been kept — and then asks once. | An unearned ask is noise; a repeated ask is pressure. In a 5 km community, one over-eager request travels further than any campaign we could run — and it travels as an opinion about our character, not about our groceries. |
| EP-7.2 | **Sharing is one tap, into WhatsApp, in a sentence a human would actually send.** | Founder Brief §5: this audience is WhatsApp-native. A share flow producing marketing copy will be edited or abandoned, because nobody forwards an advertisement to their sister — they forward a recommendation. The message must sound like the customer, not like us. |
| EP-7.3 | **Reviews are asked once, never bought.** No discounts, points or entries in exchange for a rating; the review lives where it helps the reader. | Product Strategy §12 forbids sacrificing trust for growth, and a purchased review is a false signal that damages exactly the asset it was meant to build. Google Business visibility (Founder Brief §3) built on incentivized reviews is a number, not a reputation. |
| EP-7.4 | **A referral programme — when built — rewards both sides transparently and never touches contacts without permission.** | Referral is `Future` (Product Strategy §10), which is precisely why the constraint is recorded now: a contact-scraping referral flow would violate EP-0.5 and be nearly impossible to remove once shipped. Architecture decisions made in advance are cheap; retractions are not. |
| EP-7.5 | **No advocacy mechanic may compensate for a broken promise.** If the arc fails at Delivery, the answer is to fix Delivery — not to increase referral rewards. | Advocacy is a symptom. Treating it as a lever inverts the entire product philosophy (Founder Brief §8: long-term relationships before transactions) and produces the thing we explicitly refuse to become — a growth funnel operating under a neighbourhood shop's name. |

## 1.11 Using these principles

- Every screen in Section 2 must be traceable to at least one stage of the arc.
- Every future design review asks: *which EP does this screen carry, and which EP could this screen break?*
- A screen that carries no EP is a screen that does not need to exist (Product Strategy §11).
- Where two EPs appear to conflict on a screen, the earlier stage wins — trust must exist before it can be spent.

---

# 2. Screen Inventory

## 2.1 Conventions

**Screen ID format:** `GRP-NN`, where `GRP` is the domain prefix below and `NN` is a stable number. IDs are permanent: a retired screen's ID is never reused.

| Prefix | Domain |
|---|---|
| `MKT` | Marketing website |
| `SHP` | Customer shopping |
| `SRC` | Search |
| `CAT` | Categories |
| `DIS` | Product discovery |
| `CHK` | Checkout |
| `ACC` | Customer account |
| `LOY` | Loyalty |
| `ORD` | Orders |
| `SUP` | Support & system |
| `WHL` | Wholesale |
| `ADM` | Admin panel |

**What counts as a screen.** A screen is a destination with its own URL/route, its own purpose, and its own back-behaviour. Bottom sheets, dialogs, steppers, filter panels and mega-menus are **components** (Bargad Part C) and are not listed here — except where a step is a genuine destination in a flow (e.g. checkout steps, which must be linkable, resumable and reversible under EP-0.6).

**Release tags** are taken verbatim from Product Strategy §10 and are not re-decided here: `MVP`, `V2`, `Future`.

**Each domain is defined by three linked tables:**

- **Table A — Definition:** Purpose · Primary Goal · Primary User · Release
- **Table B — Flow:** Entry Points · Exit Points · Relationships · Dependencies
- **Table C — Behaviour:** Key Actions · Success Criteria

Rows in all three tables are keyed by the same screen ID.

**Primary user** vocabulary follows Product Strategy §8: Family Shopper, Working Professional, Student, Wholesale Customer — plus Visitor (unidentified, pre-first-order), Returning Customer, and Staff/Admin.

**Dependencies** refer to platform capabilities, not to specific technologies (technology is settled in Founder Brief §16 and is not re-opened here).

---

## 2.2 Marketing Website (`MKT`)

The marketing surface exists to make the shop identifiable and trustworthy to someone who has never bought online. It carries EP-1 almost entirely.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| MKT-01 | Homepage | MVP | The shop's front door and identity: who we are, where we deliver, what's worth buying today | Move the visitor into browsing with the delivery question already answered | Visitor / Returning Customer |
| MKT-02 | About MG Supermart | MVP | The story, the family, the shop, the people, the 5 km promise | Convert offline reputation into online belief | Visitor |
| MKT-03 | Community | MVP | Show the shop inside its neighbourhood: WhatsApp community, Instagram, Google reviews, real customers | Make joining the community feel like belonging, not subscribing | Visitor / Returning Customer |
| MKT-04 | Contact & Visit the Store | MVP | Address, map, hours, phone, WhatsApp — the shop as a physical place | Let anyone reach a human or walk in within seconds | Visitor / Returning Customer |
| MKT-05 | Membership | MVP | Explain what membership is, what it costs, what it gives, who it suits | Let a customer decide about membership without asking anyone | Family Shopper |
| MKT-06 | Policy Page (template) | MVP | Privacy, Terms, Shipping, Cancellation & Refund — stated plainly, in both languages | Make our rules readable before they matter, not after | Visitor / Returning Customer |
| MKT-07 | Blog / Journal | Future | Local stories, festival guides, shopping advice | Earn search visibility and community relevance without advertising | Visitor |
| MKT-08 | Careers | Future | Hiring for the shop and the platform | Attract local staff | Visitor |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| MKT-01 | Direct / Google Business / Instagram bio / WhatsApp forward / counter QR / logo tap from anywhere | CAT-01, CAT-02, SRC-01, DIS-01, DIS-02, SHP-02, MKT-02, MKT-03, SHP-04 | Root of the entire site map (IA §4); homepage section order fixed by IA §5 | Catalogue, inventory, delivery-area & slot config, offers, homepage merchandising config (ADM-15), SEE config (Future) |
| MKT-02 | Homepage, footer, main nav, Google search | MKT-03, MKT-04, CAT-01, SHP-01 | Sibling of MKT-03/MKT-04; supplies the trust context assumed by SHP-02 and CHK | Store content (ADM-16), real store photography |
| MKT-03 | Homepage community section, footer, order confirmation (CHK-07), delivery completion (ORD-02) | WhatsApp community, Instagram, Google reviews, MKT-01 | Receives the EP-6.1 invitation from CHK-07/ORD-02; never invites before an order | Community links config, reviews feed, consent-cleared customer photos |
| MKT-04 | Header, footer, floating call/WhatsApp, Google Maps, homepage "Visit our store" | Phone dialler, WhatsApp, Google Maps, SUP-01 | Terminal by design; the human fallback for every stage (EP-0.8) | Store profile config, map embed |
| MKT-05 | Main nav, homepage, ACC-04, LOY-01 | ACC-10, ACC-01, SHP-01 | Marketing view of the same object ACC-10 shows as status | Membership plan config (ADM-11) |
| MKT-06 | Footer, CHK-04, SHP-04 (₹500 rule link), ORD-05 | Back to referrer | Referenced from cart and checkout so rules are read before they bind (EP-3.1) | Legal content (ADM-16) |
| MKT-07 | Footer, homepage, search engines | SHP-02, DIS-02, CAT-02 | Feeds discovery; never a substitute for a product page | Content management (ADM-16) |
| MKT-08 | Footer | MKT-04 | Independent | Content management (ADM-16) |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| MKT-01 | Switch language · Search · Open a category · Add to cart from a shelf · Open cart · See delivery area + next slot · Read the ₹500 rule · Join community | A first-time visitor can state, without scrolling twice: this is the Pipra shop, it delivers to me, and here is when. LCP < 2.5 s on 3G. Entry to browsing without any prompt, gate or modal (EP-1.2, EP-1.3, EP-1.5) |
| MKT-02 | Read the story · View store & team photos · Open the map · Start shopping | A visitor who has never entered the shop describes it accurately afterwards. Zero stock imagery (Bargad §15) |
| MKT-03 | Join WhatsApp community · Follow Instagram · Read Google reviews · Leave a review | Community joins arrive from customers with ≥1 delivered order; the page never appears as an interruption elsewhere (EP-6.1) |
| MKT-04 | Call · WhatsApp · Open in Maps · Read hours | A customer reaches a human in under two taps from any screen in the product |
| MKT-05 | Compare plan benefits · Join/Upgrade · Read terms | A customer decides without contacting the shop; no benefit is described that ACC-10 cannot evidence |
| MKT-06 | Read · Switch language · Return | Every rule that can affect money is readable before the step that applies it (EP-3.1) |
| MKT-07 | Read · Share on WhatsApp · Shop the related collection | Organic search entry that ends in browsing, not bouncing |
| MKT-08 | Read role · Apply via WhatsApp/phone | Local applicants reach the shop directly |

---

## 2.3 Customer Shopping (`SHP`)

The shelf and the basket. Carries EP-2 end to end and hands EP-3 to checkout.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| SHP-01 | Shop Landing | MVP | The whole shop as one entrance: categories, deals, new arrivals, best sellers, festival collections (IA §4) | Give a customer with no specific intent a confident first move | Visitor / Family Shopper |
| SHP-02 | Product Detail | MVP | The complete, honest truth about one product | Let the customer decide to add it without doubt | Family Shopper / Working Professional |
| SHP-03 | Wishlist | MVP | A private, persistent list of things to buy later | Turn intention into a future order | Returning Customer |
| SHP-04 | Cart | MVP | The basket, the arithmetic, and the rules — before any commitment | Get the order correct and fully priced before checkout begins | Family Shopper |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| SHP-01 | Main nav "Shop", homepage, breadcrumb | CAT-01, CAT-02, CAT-03, DIS-01…DIS-06, SHP-02, SRC-01 | Parent of the catalogue branch (IA §4); mirrors homepage merchandising without duplicating it | Catalogue, merchandising config (ADM-15) |
| SHP-02 | Any product card (MKT-01, CAT-03, SRC-02, DIS-*, SHP-03, ORD-02), external link, search engine | SHP-04, CAT-03, SHP-02 (related), SHP-03, SRC-01 | Terminal leaf of every discovery path; structure fixed by IA §8 | Catalogue, inventory, pricing, offers, delivery slot config, related-product logic, reviews (V2) |
| SHP-03 | Header/account nav, product card, ACC-04 | SHP-02, SHP-04, CAT-01 | Bridge between browsing and a later purchase; feeds EP-5 | Wishlist store (guest-local, merged on identification), inventory, price-change signal |
| SHP-04 | Header cart, product card add, SHP-02, ORD-04 (reorder), SRC-02 | CHK-01, SHP-01, SHP-02, MKT-06 | Only route into checkout; structure fixed by IA §9 | Cart persistence, pricing, coupons, loyalty balance, ₹500 rule engine, slot availability |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| SHP-01 | Browse categories · Open a collection · Add to cart · Search · Filter/sort | Any product is reachable in ≤3 taps from here (EP-2.4); no dead entrance |
| SHP-02 | View gallery · Read unit, price, saving, availability · Set quantity · Add to cart · Wishlist · See delivery info · Notify when back · Open related products | Price, unit, availability and delivery expectation are visible without scrolling on mobile; out-of-stock offers a real next step (EP-2.2); no urgency device anywhere on the page (EP-2.5) |
| SHP-03 | Add/remove · Move to cart · See price/stock changes · Share list | Wishlist survives sessions and identification; a returning customer resumes without rebuilding (EP-5.1) |
| SHP-04 | Adjust quantity · Remove · Apply coupon · Apply loyalty points · See ₹500 status incl. the oils/loose-sugar exception · Choose a slot · Review totals · Proceed | Every rupee and every rule that will apply at payment is already visible and settled here (EP-3.1, EP-1.4); cart survives reload, network loss and session end (EP-2.6) |

---

## 2.4 Search (`SRC`)

One of the two equal doors (EP-2.3). Search success rate is a named metric (Product Strategy §9).

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| SRC-01 | Search Entry | MVP | The moment of asking: recent searches, popular searches, category shortcuts | Turn a vague intention into a query without typing much | Working Professional / Returning Customer |
| SRC-02 | Search Results | MVP | The shop's answer to a question, ranked honestly | Get the customer to the right product on the first screen | Working Professional / Family Shopper |
| SRC-03 | Zero Results | MVP | The shop's "we don't have that — but try this" | Never end the conversation at "not found" | Visitor / Family Shopper |
| SRC-04 | Voice Search | Future | Asking by speaking, in Hindi or English | Remove typing as a barrier entirely | Family Shopper / Senior customers |
| SRC-05 | Barcode Search | Future | Scanning a pack to reorder it | Turn a physical pantry into a basket | Returning Customer |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| SRC-01 | Search field (every screen), bottom nav "Search" | SRC-02, SRC-03, CAT-03, SHP-02 | Global; reachable from every screen per IA §16 | Recent-search store, popular-search config, catalogue index |
| SRC-02 | SRC-01, submitted query, external/search-engine query link | SHP-02, SHP-04 (direct add), CAT-03, SRC-03, SRC-01 | Peer of CAT-03 — same card, same filters, same order (EP-2.3) | Search index (Hindi + English + local spellings + brands + typo tolerance, IA §7), inventory, pricing |
| SRC-03 | SRC-02 with no matches | SRC-01, CAT-01, WhatsApp ("ask the shop"), SHP-02 (suggestions) | Never terminal (EP-2.9, Design Principles §13) | Suggestion logic, category tree, community bridge |
| SRC-04 | SRC-01 microphone | SRC-02, SRC-03 | Alternate input to SRC-02 — never a separate result experience | Speech recognition (hi-IN, en-IN), permission handling |
| SRC-05 | SRC-01 scan action | SHP-02, SRC-03 | Alternate input to SHP-02 | Camera permission, barcode → SKU mapping (ADM-08) |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| SRC-01 | Type · Pick a recent search · Pick a popular search · Clear history · Cancel | Search is reachable in one tap from anywhere; recents make the second search cheaper than the first (EP-5.1) |
| SRC-02 | Refine · Filter · Sort · Add to cart · Open product | A customer typing "atta", "आटा", or "ata" reaches the same shelf (IA §7); the intended product appears on the first screen; adding never leaves the results |
| SRC-03 | See close matches · Browse the nearest category · Ask on WhatsApp · Search again | The customer always leaves with a next action, never with a dead end (EP-2.9) |
| SRC-04 | Speak a query in Hindi/English · Confirm the transcription · Search | Spoken Hindi produces the same results as typed Hindi; no permission is requested before use |
| SRC-05 | Scan · Confirm the product · Add to cart | A scanned pack reaches its product page or an honest "not stocked" with a next step |

---

## 2.5 Categories (`CAT`)

The aisle system. Structure is fixed by IA §6 and is not re-decided here.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| CAT-01 | Category Index | MVP | The whole shop's aisle map on one screen | Let a customer who cannot or will not type find their aisle | Family Shopper / Senior customers |
| CAT-02 | Category Landing (L1) | MVP | One department (e.g. Food Grains): its sub-aisles, its deals, its best sellers | Narrow intent one honest level | Family Shopper |
| CAT-03 | Subcategory Listing (L2) | MVP | The shelf itself (e.g. Atta): every product, filterable, sortable | Get the customer to the right pack and quantity | Family Shopper |
| CAT-04 | Brand Index | MVP | Shop by brand, for customers who buy by trust in a name | Serve brand-loyal buying without breaking the aisle model | Family Shopper |
| CAT-05 | Brand Page | MVP | One brand's products across categories | Let a brand-loyal customer fill a basket in one place | Family Shopper |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| CAT-01 | Bottom nav "Categories", main nav, homepage category section, SHP-01, SRC-03 | CAT-02, CAT-03, SHP-02 | Root of the category tree (IA §6); depth cap of 3 taps to product measured from here (EP-2.4) | Category tree, category imagery, inventory (to avoid empty aisles) |
| CAT-02 | CAT-01, mega-menu (desktop), breadcrumb, homepage | CAT-03, SHP-02, DIS-01 | Parent of CAT-03; may host seasonal emphasis without renaming itself (EP-2.8) | Category tree, merchandising config, offers |
| CAT-03 | CAT-02, CAT-01, mega-menu, SRC-02, breadcrumb, SHP-02 (breadcrumb back) | SHP-02, SHP-04, CAT-02 | Peer of SRC-02 — identical card, filters and behaviour | Catalogue, inventory, pricing, filter/sort service, offers |
| CAT-04 | Homepage "Shop by Brand", SHP-01, footer | CAT-05, SHP-02 | Cross-cut of the category tree; never replaces it | Brand registry (ADM-07) |
| CAT-05 | CAT-04, SHP-02 (brand link), SRC-02 | SHP-02, SHP-04, CAT-03 | Behaves as a listing (peer of CAT-03) | Catalogue, brand mapping, inventory |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| CAT-01 | Open a category · Search · Jump to a subcategory | Every aisle in IA §6 is visible without a search; no aisle leads to an empty shelf |
| CAT-02 | Open a subcategory · View department deals · Add to cart | The customer reaches their shelf in one further tap; the department's name never changes with a campaign (EP-2.8) |
| CAT-03 | Filter · Sort · Set quantity · Add to cart · Open product · Load more | Adding two of something never leaves the shelf (EP-2.7); price, unit, saving and stock are readable on the card (EP-2.2) |
| CAT-04 | Open a brand · Search brands | Brand-led shopping never requires knowing the category tree |
| CAT-05 | Filter · Add to cart · Open product | A brand-loyal basket can be filled without returning to CAT-01 |

---

## 2.6 Product Discovery (`DIS`)

Merchandised shelves. These are the surfaces the future Seasonal Experience Engine will configure — which is why they must be complete and meaningful with no campaign running (EP-0.7).

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| DIS-01 | Offers & Deals | MVP | Everything genuinely discounted right now, in one honest place | Let value-seeking customers find savings without being chased by them | Family Shopper / Student |
| DIS-02 | Seasonal / Festival Collection | MVP | A festival as a complete shopping experience, not a banner (Product Strategy §6) | Make festival shopping feel prepared-for, not marketed-at | Family Shopper |
| DIS-03 | Best Sellers | MVP | What this neighbourhood actually buys | Use local consensus as a shortcut for undecided customers | Visitor / Family Shopper |
| DIS-04 | New Arrivals | MVP | What the shop has started stocking | Reward regular customers with a reason to look | Returning Customer |
| DIS-05 | Monthly Grocery | MVP | The household's standing monthly list as a shoppable shelf | Make the biggest, most repetitive basket of the month effortless | Family Shopper |
| DIS-06 | Popular Near You | MVP | What people in the delivery area are buying (IA §5) | Make hyperlocal relevance visible, not merely claimed | Visitor / Family Shopper |
| DIS-07 | Recommended For You | Future | Personalized shelves | Reduce effort for the individual household | Returning Customer |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| DIS-01 | Main nav "Offers", homepage offers section, CAT-02, LOY-04 | SHP-02, SHP-04, CAT-03 | Listing behaviour identical to CAT-03; never a separate visual language | Offers engine, inventory, pricing |
| DIS-02 | Homepage hero/festival section, main nav emphasis, MKT-03, WhatsApp campaign, DIS-01 | SHP-02, SHP-04, CAT-03, MKT-03 | Configured by SEE (Future); must render as a normal collection when SEE is absent (EP-0.7) | Collection config (ADM-14), catalogue, festival content (ADM-16) |
| DIS-03 | Homepage, SHP-01, CAT-02 | SHP-02, SHP-04 | Listing peer of CAT-03 | Order analytics, inventory |
| DIS-04 | Homepage, SHP-01 | SHP-02, SHP-04 | Listing peer of CAT-03 | Catalogue (stocked-date), inventory |
| DIS-05 | Homepage, SHP-01, ORD-04, ACC-04 | SHP-04, SHP-02, ORD-04 | Sits between discovery and reorder; supports EP-5.2/EP-5.3 | Catalogue, purchase history (identified customers), inventory |
| DIS-06 | Homepage, SHP-01 | SHP-02, SHP-04 | Listing peer of CAT-03; scope limited to the 5 km service area | Order analytics scoped to delivery area |
| DIS-07 | Homepage, ACC-04, SHP-01 | SHP-02, SHP-04 | Personalized variant of DIS-03/DIS-05 | Recommendation service, purchase history, consent |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| DIS-01 | Browse offers · Filter by category · Add to cart · Read offer terms | Every saving is stated in rupees as a gain (Bargad §06); no timers, no fake scarcity, no red pricing (EP-2.5) |
| DIS-02 | Browse the collection · Read the festival guide · Add to cart · Share on WhatsApp · Read the greeting | The collection is useful as a shelf even to someone ignoring the festival; brand remains recognizable throughout (Design Principles §15); ≤10% of the screen is festival-tinted (Bargad §25) |
| DIS-03 | Browse · Add to cart · Open product | Reduces decision cost for a first-time customer with no basket history |
| DIS-04 | Browse · Add to cart · Notify me | Returning customers find something new without hunting |
| DIS-05 | Add a whole list to cart · Adjust quantities · Save as a list · Reorder | A monthly basket is assembled in materially fewer actions than building it item by item (EP-5.2, EP-5.3) |
| DIS-06 | Browse · Add to cart | The claim of hyperlocality is evidenced by real local data, not editorial choice (Product Strategy §6) |
| DIS-07 | Browse · Add to cart · Dismiss a suggestion | Recommendations reduce effort and are explainable to the customer; never used to surface higher-margin items covertly (EP-0.5) |

---

## 2.7 Checkout (`CHK`)

The shortest, highest-stakes stage. Sequence is fixed by IA §10. Every step is a linkable, resumable, reversible destination (EP-0.6, EP-3.6).

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| CHK-01 | Checkout Gateway | MVP | The guest-or-login fork (IA §10) | Let the order proceed without an account, and make login attractive rather than mandatory | Visitor / Family Shopper |
| CHK-02 | Delivery Address | MVP | Where the order goes, in landmark terms (Bargad §19) | Capture a deliverable address with the fewest possible fields | Family Shopper |
| CHK-03 | Delivery Slot | MVP | When the order arrives — a promise, not a preference | Get a commitment the shop will keep | Family Shopper |
| CHK-04 | Order Review | MVP | The last honest look: items, address, slot, rules, every rupee | Remove the last doubt before payment | Family Shopper |
| CHK-05 | Payment | MVP | Choosing how to pay, including cash on delivery as a first-class option | Complete the order without fear | Family Shopper / Working Professional |
| CHK-06 | Payment Failure Recovery | MVP | A failed payment explained, with the order intact | Keep the order and the trust after a failure | Family Shopper |
| CHK-07 | Order Success | MVP | The confirmation and the beginning of the wait | Confirm, celebrate once, and hand the customer to the delivery stage | Family Shopper |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| CHK-01 | SHP-04 only | CHK-02 (guest), ACC-01 (login), SHP-04 (back) | Single gate into checkout; guest path must be equal (EP-3.2) | Cart, auth service |
| CHK-02 | CHK-01, ACC-06 (saved address selection), CHK-04 (edit) | CHK-03, CHK-01 (back), ACC-06 | Writes to ACC-06 for identified customers (EP-5.1); serviceability decided here | Address model (landmark-based), delivery-area rules (5 km), pincode/area validation |
| CHK-03 | CHK-02, CHK-04 (edit) | CHK-04, CHK-02 (back) | Consumes the same slot inventory shown in SHP-04 and SHP-02 | Slot capacity, shop hours, delivery-area config |
| CHK-04 | CHK-03, CHK-06 | CHK-05, CHK-02/CHK-03 (edit), SHP-04 (back), MKT-06 (rules) | Last reversible step; the ₹500 rule and its exception must already be resolved (EP-3.1) | Pricing, coupons, loyalty, ₹500 rule engine, inventory re-check |
| CHK-05 | CHK-04 | CHK-07, CHK-06 | Terminal step of the flow; cash and digital are peers (EP-3.7) | Payment provider, COD policy, order service |
| CHK-06 | CHK-05 on failure | CHK-05 (retry), CHK-04 (change to COD), SUP-03, WhatsApp | The order survives; never a dead end (EP-0.6) | Payment provider status, order-hold service |
| CHK-07 | CHK-05 on success | ORD-03, ORD-02, MKT-03 (community invite), SHP-01, WhatsApp receipt | Hands the arc to EP-4; the only legitimate place for the community invite before delivery (EP-6.1) | Order service, WhatsApp/SMS receipt, notification service |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| CHK-01 | Continue as guest · Login with phone · Return to cart | Guest checkout is never slower or poorer than the account path; no screen implies a penalty for guests (EP-3.2) |
| CHK-02 | Select a saved address · Add a new one (landmark-first) · Confirm serviceability · Back | Serviceability is answered here, never later; an address a delivery person can actually find (EP-3.4); errors never erase typed input (Bargad §19) |
| CHK-03 | Choose a slot · See full slots honestly · Back | Only keepable slots are offered; full slots stay visible and marked (EP-3.5) |
| CHK-04 | Review items · Edit address/slot · Apply/see coupon and loyalty · Read the ₹500 status · Proceed to payment | Nothing about money, timing or rules changes after this screen (EP-3.1); every element is editable without losing the order (EP-0.6) |
| CHK-05 | Choose cash on delivery · Choose digital payment · Pay · Back | Cash is presented as a legitimate first choice, not a fallback (EP-3.7); one primary action only (Bargad §18) |
| CHK-06 | Retry · Switch to cash on delivery · Contact the shop · Return to review | The order is never lost by a payment failure; the message names the cause and offers a way forward (Bargad §06, Design Principles §12) |
| CHK-07 | Track the order · Save the receipt · Get the WhatsApp/SMS confirmation · Continue shopping · Join the community | Confirmation reaches the customer's phone independently of the browser (EP-3.8); celebration plays once (Bargad §16); the wait is prepared, not merely announced (EP-0.2) |

---

## 2.8 Customer Account (`ACC`)

Identity, not a dashboard. The account exists to make the second order cheaper than the first (EP-5.1) — nothing else justifies its existence.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| ACC-01 | Login | MVP | Identify by phone number, no password (Bargad §19) | Identify the customer with the least possible friction | Returning Customer |
| ACC-02 | OTP Verification | MVP | Prove the phone belongs to the person | Complete identification without penalty or pressure | Returning Customer |
| ACC-03 | Complete Profile | MVP | The minimum needed to serve someone: name, language, optional email | Turn a first order into a relationship without an interrogation | Family Shopper |
| ACC-04 | Account Home | MVP | The customer's own counter: orders, loyalty, addresses, membership, support | Get to any personal task in one tap (IA §11) | Returning Customer |
| ACC-05 | Profile | MVP | Name, phone, language, optional email | Let a customer correct their own details | Returning Customer |
| ACC-06 | Saved Addresses | MVP | The household's places | Make address entry a one-time cost (EP-5.1) | Family Shopper |
| ACC-07 | Address Editor | MVP | Add or correct one address, landmark-first | Produce an address a delivery person can find | Family Shopper |
| ACC-08 | Notifications | MVP | Order updates, shop news, festival greetings — and control over them | Keep the customer informed without ever becoming spam | Returning Customer |
| ACC-09 | Settings | MVP | Language, notification preferences, account deletion | Give the customer control over their own relationship | Returning Customer |
| ACC-10 | Membership Status | MVP | What the customer has, what it gives, when it renews | Make membership value visible without contacting the shop | Family Shopper |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| ACC-01 | Bottom nav "Account", CHK-01, ORD-01, LOY-01, any identified-only action | ACC-02, CHK-01 (back to guest), SHP-01 | Never a wall in front of browsing (EP-2.1) | Auth service, SMS/OTP delivery |
| ACC-02 | ACC-01 | ACC-03 (new), ACC-04 (returning), CHK-02 (resume checkout), ACC-01 (back) | Must resume the interrupted intent, never drop to Account Home | OTP service, session, resume-intent state |
| ACC-03 | ACC-02 (first identification), CHK-07 (post-first-order) | ACC-04, CHK-02, SHP-01 | Optional at checkout; never blocks an order (EP-3.2) | Customer profile |
| ACC-04 | Bottom nav "Account", ACC-02, header | ORD-01, SHP-03, LOY-01, ACC-10, ACC-06, ACC-05, ACC-08, ACC-09, SUP-01 | Hub defined by IA §11; hosts EP-5 shortcuts (reorder, monthly grocery) | Customer profile, order summary, loyalty balance |
| ACC-05 | ACC-04, ACC-09 | ACC-04 | Sibling of ACC-09 | Customer profile |
| ACC-06 | ACC-04, CHK-02 | ACC-07, CHK-02, ACC-04 | Shared object with CHK-02 — one address book, two entry points | Address model, delivery-area rules |
| ACC-07 | ACC-06, CHK-02 | ACC-06, CHK-03 | Same component contract in both contexts (Bargad §19) | Address model, serviceability check |
| ACC-08 | ACC-04, push/SMS/WhatsApp link | ORD-02, DIS-02, ACC-09, MKT-03 | Delivers EP-4.1 and EP-5.4; controlled from ACC-09 | Notification service, message log |
| ACC-09 | ACC-04, ACC-08 | ACC-05, ACC-04, MKT-06 | Contains the one-step exit required by EP-6.6 | Preferences store, account deletion |
| ACC-10 | ACC-04, MKT-05, LOY-01 | MKT-05, LOY-01, SUP-03 | Status view of the object MKT-05 markets | Membership service (ADM-11) |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| ACC-01 | Enter phone · Request OTP · Switch language · Go back | No password anywhere; a customer can always retreat to guest browsing or guest checkout (EP-3.2, EP-3.3) |
| ACC-02 | Enter OTP · Resend without penalty · Edit the number · Go back | No time limit, no lockout, no punishment for a resend (Bargad §22); identification returns the customer to what they were doing |
| ACC-03 | Enter name · Confirm language · Skip | Skippable; never blocks an order; asks nothing that is not used (EP-5.1, Bargad §19) |
| ACC-04 | Reorder · Track the current order · Open orders, loyalty, addresses, membership · Contact the shop | Every personal task is one tap away (IA §11); the most common task (reorder) is the most prominent (EP-5.2) |
| ACC-05 | Edit name/language/email · Save | Corrections take effect immediately and are confirmed quietly (Bargad §06) |
| ACC-06 | Select · Add · Edit · Delete · Set default | Address is entered once and never re-asked (EP-5.1) |
| ACC-07 | Enter landmark, area, pincode · Confirm serviceability · Save | Serviceability is answered here, not at checkout; input is never erased by an error (EP-3.4) |
| ACC-08 | Read updates · Open the related order/collection · Manage preferences | Order updates arrive before the customer asks (EP-4.1); nothing arrives that the customer did not agree to (EP-5.4) |
| ACC-09 | Change language · Change notification preferences · Leave the community · Delete the account | Leaving is as easy as joining (EP-6.6); deletion is honoured and explained, never obstructed (EP-0.5) |
| ACC-10 | View benefits · View renewal date · Renew · Cancel · Get help | Every marketed benefit (MKT-05) is evidenced here in rupees or in kept promises |

---

## 2.9 Loyalty (`LOY`)

Loyalty must be arithmetic the customer can do in their head (EP-5.5). Any screen here that requires explanation has failed Design Principles §3.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| LOY-01 | Loyalty Home | MVP | What I have, what it is worth in rupees, how I get more | Make the value obvious in one glance | Returning Customer |
| LOY-02 | Points History | MVP | Every point earned and spent, with the order that caused it | Make the balance verifiable, not merely stated | Returning Customer |
| LOY-03 | Rewards & Redemption | MVP | What points can become, and how | Turn a balance into a saving without confusion | Family Shopper |
| LOY-04 | My Coupons | MVP | Coupons available, used and expired, in plain terms | Let a customer use what they were given without hunting | Family Shopper / Student |
| LOY-05 | Referral | Future | Reward both sides of a real recommendation | Make advocacy easy after it is earned (EP-7.3) | Returning Customer |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| LOY-01 | ACC-04, SHP-04 (points available), CHK-04, ACC-08 | LOY-02, LOY-03, LOY-04, SHP-04, ACC-10 | Hub of the loyalty branch (IA §11) | Loyalty ledger (ADM-12), order history |
| LOY-02 | LOY-01 | ORD-02, LOY-01 | Every entry traces to an ORD-02 | Loyalty ledger, order service |
| LOY-03 | LOY-01, SHP-04, CHK-04 | SHP-04, LOY-01 | Redemption is applied in SHP-04/CHK-04, never invented at payment (EP-3.1) | Loyalty ledger, pricing, rewards config (ADM-12) |
| LOY-04 | LOY-01, ACC-04, SHP-04, DIS-01, ACC-08 | SHP-04, DIS-01 | Coupons apply in the cart so their effect is visible before payment | Coupon service (ADM-13) |
| LOY-05 | LOY-01, ACC-04, ORD-02 (post-delivery) | WhatsApp share, LOY-01 | Gated by a delivered order (EP-7.1) | Referral service, order history, WhatsApp share |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| LOY-01 | See balance in ₹ · See how to earn · Open history · Redeem · Open coupons | The balance is stated in rupees, not only in points (EP-5.5); no expiry is ever a surprise |
| LOY-02 | Review entries · Open the source order · Filter by period | Every point is traceable to an order; the customer can audit us (Product Strategy §5) |
| LOY-03 | Choose a reward · Apply to the cart · Understand the terms | Redemption requires no explanation; value is visible before commitment (Design Principles §3) |
| LOY-04 | See available coupons · Apply · Read terms · See why one doesn't apply | A coupon that cannot apply says why, in the cart, never at payment (EP-3.1, Bargad §18) |
| LOY-05 | Share on WhatsApp · Track referrals · See rewards | One tap, a human-sounding message, no contact access (EP-7.2, EP-7.3) |

---

## 2.10 Orders (`ORD`)

The delivery stage's screens plus the repeat-purchase engine. Carries EP-4 and EP-5.2.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| ORD-01 | Order History | MVP | Every order this household has placed | Turn history into the fastest route to the next order | Returning Customer |
| ORD-02 | Order Detail | MVP | One order in full: items, money, address, slot, status, people | Answer every question about one order without contacting anyone | Family Shopper |
| ORD-03 | Track Order (public) | MVP | Where the order is, for anyone holding the reference and the phone number — no login (IA §4, EP-4.2) | End the "where is my order" anxiety in seconds | Family Shopper / any household member |
| ORD-04 | Reorder | MVP | A previous order rebuilt as a cart, adjustable before committing | Make the second order cost almost nothing (EP-5.2) | Returning Customer |
| ORD-05 | Cancel Order | MVP | Cancelling honestly, with the rules stated up front | Let a customer withdraw without a fight | Family Shopper |
| ORD-06 | Invoice / Receipt | MVP | The order as a document the customer can keep or forward | Give a real receipt, like the counter does | Family Shopper / Wholesale Customer |
| ORD-07 | Rate Your Order | V2 | Ask once, after a kept promise | Convert a good delivery into a public signal, unbribed (EP-7.3) | Returning Customer |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| ORD-01 | ACC-04, header, ACC-08 | ORD-02, ORD-04, ORD-03 | Parent of ORD-02; primary launchpad for EP-5.2 | Order service, customer identity |
| ORD-02 | ORD-01, ACC-08, CHK-07, WhatsApp/SMS link, ADM-04 (customer link) | ORD-03, ORD-04, ORD-05, ORD-06, SUP-03, WhatsApp, MKT-03 | The order's home; hosts the post-delivery community invite (EP-6.1) and ORD-07 (V2) | Order service, inventory, payment status, delivery status |
| ORD-03 | CHK-07, WhatsApp/SMS link, footer "Track Order", ACC-08, MKT-01 | ORD-02 (if identified), SUP-03, WhatsApp, MKT-01 | Zero-auth peer of ORD-02 — same truth, no login (EP-4.2) | Order lookup by reference + phone, delivery status, rate limiting |
| ORD-04 | ORD-01, ORD-02, ACC-04, DIS-05 | SHP-04, SHP-02 | Writes into SHP-04; never places an order directly without review (EP-0.6) | Order history, catalogue, inventory, pricing (with honest change disclosure, EP-5.6) |
| ORD-05 | ORD-02, ORD-03, SUP-03 | ORD-02, SUP-03, WhatsApp, MKT-06 | Governed by the cancellation policy (MKT-06) | Order service, refund policy, payment provider |
| ORD-06 | ORD-02, ACC-08, WHL flows | Download/share, ORD-02 | Bilingual; must survive being forwarded on WhatsApp | Invoice generation, order service |
| ORD-07 | ORD-02 after delivery, ACC-08 | MKT-03, Google review, ORD-02 | Asked once per order, never incentivized (EP-7.1, EP-7.3) | Reviews service (ADM-17) |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| ORD-01 | Open an order · Reorder · Track the live order · Search history | Reorder is reachable in one tap from the list (EP-5.2); a live order is always the first thing visible |
| ORD-02 | See status · See items and totals · Cancel · Reorder · Get the invoice · Contact the shop · See who is delivering | The customer never needs to ask anything this screen could have told them (EP-4.1); status is honest, including delays with causes (EP-4.3); the delivery person is named (EP-4.5) |
| ORD-03 | Look up by reference + phone · See status · Contact the shop | A forwarded WhatsApp link resolves to the truth without an account (EP-4.2); no personal data beyond the order is exposed |
| ORD-04 | Load a previous basket into the cart · Adjust · Remove unavailable items · Review price changes | Fewer actions than rebuilding manually; every unavailable item and every price change is disclosed, never silently applied (EP-5.6, EP-4.6) |
| ORD-05 | Read the policy · Cancel · Give a reason (optional) · Contact the shop instead | Cancellation is never obstructed and never blames the customer (EP-0.5, Design Principles §12) |
| ORD-06 | View · Download · Share on WhatsApp | Reads like a shop receipt in either language; totals match the counter's arithmetic exactly |
| ORD-07 | Rate the order · Add a comment · Leave a Google review | Asked once, after a kept promise; no reward offered (EP-7.1, EP-7.3) |

---

## 2.11 Support & System (`SUP`)

Support screens exist so that a human is never more than a tap away (EP-0.8), and system screens exist because slow and broken networks are designed states (EP-0.4).

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| SUP-01 | Help Center | MVP | Everything a customer might need to ask, answered in the shopkeeper's voice | Answer the question before a call is needed — without hiding the call | Visitor / Returning Customer |
| SUP-02 | Help Article / FAQ | MVP | One question answered plainly, in both languages | Resolve one doubt completely | Visitor / Returning Customer |
| SUP-03 | Contact Support | MVP | Reach a human about a specific order or issue | Get a person, fast, with context already attached | Family Shopper |
| SUP-04 | Not Found (404) | MVP | An honest wrong turn, with a way back | Return the customer to the shop, never to a dead end | Visitor |
| SUP-05 | Offline / Network Error | MVP | The network failed; the shop did not | Preserve the basket and the customer's confidence | Family Shopper |
| SUP-06 | Maintenance | MVP | The shop is briefly closed for work, and says so | Keep an outage honest and finite | Visitor |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| SUP-01 | Footer, ACC-04, ORD-02, SRC-03, MKT-01 | SUP-02, SUP-03, MKT-04, WhatsApp | Hub of the help branch (IA §15); never a substitute for MKT-04 or the WhatsApp bridge | Help content (ADM-16), search |
| SUP-02 | SUP-01, search engines, in-context links (SHP-04 ₹500 rule, CHK-*) | SUP-01, SUP-03, MKT-06, back to referrer | Referenced in-context so answers arrive where doubts arise | Help content (ADM-16) |
| SUP-03 | SUP-01, ORD-02, ORD-03, ORD-05, CHK-06, ACC-10 | WhatsApp, phone dialler, ORD-02 | Always carries order context; complements, never replaces, the floating WhatsApp/Call actions | Order context, WhatsApp/phone links |
| SUP-04 | Any broken/expired URL | MKT-01, SRC-01, CAT-01 | Always offers a real next step (Design Principles §13) | Route handling, illustration set (Bargad §14) |
| SUP-05 | Any screen on network failure | Retry, cached cart, MKT-04 | The cart survives (EP-2.6); explains and offers retry (Bargad §22) | Offline handling, cart persistence |
| SUP-06 | Any screen during planned downtime | MKT-04, WhatsApp | Rare, honest, time-boxed | Maintenance flag, store contact |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| SUP-01 | Search help · Browse topics · Open an article · Call · WhatsApp | The shop's phone and WhatsApp are visible on the help screen itself — help never traps the customer in self-service (EP-0.8) |
| SUP-02 | Read · Switch language · Contact the shop · Return | One question, one plain answer, both languages, no jargon (Bargad §22) |
| SUP-03 | Choose the order · Describe the issue · Send on WhatsApp · Call | The customer reaches a human with the order already attached — they never re-explain what we already know (EP-0.1, EP-5.1) |
| SUP-04 | Search · Go home · Browse categories | Never a dead end; the tone never blames the customer (Design Principles §12) |
| SUP-05 | Retry · View the saved cart · Call the shop | The basket is intact when the network returns (EP-2.6, EP-0.4) |
| SUP-06 | Read the reason and the expected return · Call · WhatsApp | Honest cause, honest duration, human alternative |

---

## 2.12 Wholesale (`WHL`)

Wholesale is a separate relationship with a separate door. Founder Brief §12 and IA §12 are absolute: wholesale prices are never public, and wholesale customers never enter the retail shopping flow.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| WHL-01 | Wholesale Landing | MVP | Explain what wholesale with MG Supermart means, and who it is for | Qualify a business owner and invite a request — without showing a single price | Wholesale Customer |
| WHL-02 | Request Access | MVP | Collect the business information needed to begin a relationship | Start a conversation with enough context for a human to continue it | Wholesale Customer |
| WHL-03 | Request Received | MVP | Acknowledge the request and set an honest expectation | Replace uncertainty with a named next step and a timeframe | Wholesale Customer |
| WHL-04 | Verification Status | MVP | Where the request stands | Let a business check progress without chasing anyone | Wholesale Customer |
| WHL-05 | Wholesale Contact | MVP | The direct human line for wholesale relationships | Make the relationship personal from the first message | Wholesale Customer |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| WHL-01 | Footer, MKT-02, direct link, word of mouth | WHL-02, WHL-05, MKT-04 | Behind its own quiet door — never in retail navigation (IA §12, Bargad §21) | Wholesale content (ADM-16) |
| WHL-02 | WHL-01 | WHL-03, WHL-01 (back) | Feeds the admin verification queue (ADM-22) | Wholesale request service, business-info model |
| WHL-03 | WHL-02 on submit | WHL-04, WHL-05, MKT-01 | Confirms; never promises a price | Notification (WhatsApp/SMS) |
| WHL-04 | WHL-03, WhatsApp/SMS link | WHL-05, MKT-04 | Mirrors the state of ADM-22 | Wholesale request service |
| WHL-05 | WHL-01, WHL-03, WHL-04 | WhatsApp, phone dialler | Terminal by design — relationship pricing happens with a person (Founder Brief §12) | Wholesale contact config |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| WHL-01 | Understand the offer · Request access · Contact the team | Not one wholesale price is visible to the public (Founder Brief §12); no path from here leads into the retail cart (IA §12) |
| WHL-02 | Enter business details · Submit · Contact instead | Asks only what a human needs to begin; a business can always choose to talk instead of type (EP-0.8) |
| WHL-03 | See the next step and timeframe · Message the team · Check status | The applicant leaves knowing who will contact them and roughly when (EP-4.3 logic applied to onboarding) |
| WHL-04 | Check status · Contact the team | Status is truthful and the human path is always visible; never a silent queue |
| WHL-05 | WhatsApp · Call | A wholesale customer reaches a person, not a form (Founder Brief §12) |

---

## 2.13 Admin Panel (`ADM`)

The admin panel is the shop's back room. It inherits Bargad in full (roots and trunk are shared — Bargad §01), and it is where the promises the customer screens make are actually kept. Its primary user throughout is Staff/Admin.

### Table A — Definition

| ID | Screen | Release | Purpose | Primary Goal | Primary User |
|---|---|---|---|---|---|
| ADM-01 | Admin Login | MVP | Controlled entry to the back room | Identify staff safely without slowing the shop | Staff / Admin |
| ADM-02 | Dashboard | MVP | Today's shop at a glance: orders to pack, slots, stock alerts | Tell staff what needs doing right now | Staff / Admin |
| ADM-03 | Orders | MVP | Every order, by status and slot | Never miss a promised slot (EP-3.5) | Staff |
| ADM-04 | Order Detail & Fulfilment | MVP | One order: pack it, update it, deliver it, talk to the customer | Keep the promise made at CHK-03 and narrate it (EP-4.1) | Staff |
| ADM-05 | Products | MVP | The catalogue as the shop sees it | Keep the online shelf equal to the physical shelf | Admin |
| ADM-06 | Product Editor | MVP | One product's truth: name (both languages), unit, price, MRP, photo, stock | Make honesty on the card cheap to maintain (EP-2.2) | Admin |
| ADM-07 | Categories & Brands | MVP | The aisle map and brand registry (IA §6) | Keep the customer's mental map stable (EP-2.8) | Admin |
| ADM-08 | Inventory | MVP | What is actually in stock, right now | Never sell what the shop cannot deliver (EP-4.6) | Staff / Admin |
| ADM-09 | Customers | MVP | The people the shop serves | Recognize a customer when they call (EP-0.1) | Staff / Admin |
| ADM-10 | Customer Detail | MVP | One household: orders, addresses, loyalty, membership, notes | Let any staff member continue a relationship they didn't start | Staff |
| ADM-11 | Membership | MVP | Plans, members, renewals | Make membership a kept promise, not a marketing claim (ACC-10) | Admin |
| ADM-12 | Loyalty | MVP | Earn rules, redemption rules, ledger | Keep loyalty arithmetic honest and auditable (EP-5.5) | Admin |
| ADM-13 | Coupons | MVP | Create, limit, expire and audit coupons | Ensure a coupon's terms are true wherever it is shown (LOY-04) | Admin |
| ADM-14 | Seasonal Campaigns | Future | The SEE console: themes, collections, greetings, dates (Founder Brief §20) | Let the shop change its rangoli without touching the courtyard (Bargad §25) | Admin |
| ADM-15 | Homepage Manager | MVP | Order and content of homepage sections within the fixed IA §5 structure | Merchandise the front door without redesigning it | Admin |
| ADM-16 | Content Management | MVP | Marketing, policy, help and festival content, in both languages | Keep both languages equal without a developer (EP-0.3) | Admin |
| ADM-17 | Reviews | V2 | Moderate product and order reviews | Keep reviews real, and keep them honest (EP-7.3) | Admin |
| ADM-18 | Analytics | MVP | The metrics named in Product Strategy §9 | Let the founder judge the arc, not just the sales | Admin |
| ADM-19 | Notifications | MVP | Templates, campaigns, sending rules and frequency caps | Make EP-5.4 and EP-6.2 structurally enforceable, not merely intended | Admin |
| ADM-20 | Settings | MVP | Delivery area, slots, hours, minimum order, the oils/loose-sugar rule, store profile | Encode the Founder Brief's business rules in one place | Admin |
| ADM-21 | User Roles | MVP | Who in the shop can do what | Protect customers and money from accidents | Admin |
| ADM-22 | Wholesale Requests | MVP | The verification queue behind WHL-02 | Turn a request into a relationship, with a named owner | Admin |

### Table B — Flow

| ID | Entry Points | Exit Points | Relationships | Dependencies |
|---|---|---|---|---|
| ADM-01 | Admin URL | ADM-02 | Gate to the entire admin branch (IA §13) | Staff auth, roles (ADM-21) |
| ADM-02 | ADM-01, admin logo | ADM-03, ADM-04, ADM-08, ADM-18 | Root of IA §13 | Orders, inventory, slots, analytics |
| ADM-03 | ADM-02, notification | ADM-04, ADM-10 | Parent of ADM-04; scoped by ADM-21 roles | Order service, slot config |
| ADM-04 | ADM-03, ADM-10, ADM-02 | ADM-03, ADM-10, WhatsApp to customer, ORD-02 (customer view) | Writes the status that ORD-02/ORD-03 read (EP-4.1) | Order service, inventory, notification service, payment status |
| ADM-05 | ADM-02, ADM-07 | ADM-06, ADM-08 | Parent of ADM-06 | Catalogue |
| ADM-06 | ADM-05, ADM-08 | ADM-05 | Directly determines SHP-02 and every product card | Catalogue, media storage, pricing |
| ADM-07 | ADM-02, ADM-05 | ADM-05, ADM-15 | Defines CAT-01…CAT-05 (IA §6) | Category tree, brand registry |
| ADM-08 | ADM-02, ADM-05, ADM-06 | ADM-06, ADM-04 | Feeds every "out of stock" the customer sees (EP-2.2) | Inventory service |
| ADM-09 | ADM-02 | ADM-10 | Parent of ADM-10; access limited by role | Customer service, roles |
| ADM-10 | ADM-09, ADM-03, ADM-04 | ADM-04, ADM-11, ADM-12, WhatsApp to customer | Gives staff the context EP-0.1 requires | Customer, order, loyalty, membership services |
| ADM-11 | ADM-02, ADM-10 | ADM-10, ADM-13 | Source of truth for MKT-05 and ACC-10 | Membership service, payments |
| ADM-12 | ADM-02, ADM-10 | ADM-10, ADM-13 | Source of truth for LOY-01…LOY-03 | Loyalty ledger, pricing |
| ADM-13 | ADM-02, ADM-12 | ADM-12, ADM-15 | Source of truth for LOY-04 and DIS-01 | Coupon service, pricing |
| ADM-14 | ADM-02, ADM-15 | ADM-15, ADM-16 | Configures DIS-02 and themeable slots only (Bargad §25); never touches navigation or semantics | SEE token/theme contract, collections, content |
| ADM-15 | ADM-02, ADM-14 | ADM-05, ADM-13, ADM-16 | Configures MKT-01 within the fixed IA §5 order | Merchandising config, catalogue, offers |
| ADM-16 | ADM-02 | ADM-15, ADM-14 | Source of truth for MKT-02…MKT-08, SUP-01/SUP-02, WHL-01 | Content store, bilingual content model |
| ADM-17 | ADM-02 | ADM-06, ADM-10 | Governs SHP-02 reviews and ORD-07 | Reviews service |
| ADM-18 | ADM-02 | ADM-03, ADM-09 | Reports against Product Strategy §9 | Analytics pipeline |
| ADM-19 | ADM-02, ADM-13, ADM-14 | ADM-16 | Enforces frequency caps that ACC-08/ACC-09 expose to customers | Notification service, message log, consent store |
| ADM-20 | ADM-02 | ADM-21, ADM-16 | Encodes Founder Brief §9 rules used by SHP-04, CHK-02, CHK-03 | Config store |
| ADM-21 | ADM-02, ADM-20 | ADM-02 | Scopes every other admin screen | Roles & permissions service |
| ADM-22 | ADM-02, notification from WHL-02 | ADM-10, WhatsApp to applicant | Mirrors what WHL-04 shows the applicant | Wholesale request service |

### Table C — Behaviour

| ID | Key Actions | Success Criteria |
|---|---|---|
| ADM-01 | Log in · Recover access | Only authorized staff enter; access is per-role from the first screen (ADM-21) |
| ADM-02 | See today's orders, slots and stock alerts · Jump to what's urgent | A staff member knows what to do next within five seconds (Design Principles §5) |
| ADM-03 | Filter by status/slot · Open an order · Print/pack lists | No promised slot is ever missed for lack of visibility (EP-3.5) |
| ADM-04 | Update status · Record short supply · Message the customer · Assign the delivery person · Cancel/refund | Every status change is visible to the customer without them asking (EP-4.1); substitutions require the customer's word (EP-4.6); the delivery person's name reaches ORD-02 (EP-4.5) |
| ADM-05 | Search · Filter · Bulk-edit · Open a product | The online shelf can be corrected as fast as the physical shelf changes |
| ADM-06 | Edit both language names · Set unit, price, MRP · Upload photos · Set stock · Publish | A product cannot be published without unit, price and a real photo — the card's honesty is enforced at the source (EP-2.2, Bargad §15, §20) |
| ADM-07 | Add/rename/reorder categories · Manage brands | Renaming an aisle is a deliberate, visible act — never a side effect of a campaign (EP-2.8) |
| ADM-08 | Adjust stock · Mark out of stock · Set low-stock alerts · Enable "notify me" | The customer never sees an available item the shop cannot deliver (EP-2.2, EP-4.6) |
| ADM-09 | Search · Filter · Open a household | Any staff member can recognize a caller in seconds (EP-0.1) |
| ADM-10 | View orders, addresses, loyalty, membership · Add a note · Message on WhatsApp | A customer never re-explains their own history to us (EP-5.1) |
| ADM-11 | Create/edit plans · View members · Handle renewals | Every benefit shown on MKT-05 is one the system can actually deliver (ACC-10) |
| ADM-12 | Set earn/redeem rules · Audit the ledger · Adjust with a reason | Loyalty is auditable end-to-end; no silent expiry can be configured (EP-5.5) |
| ADM-13 | Create · Set limits and expiry · Deactivate · Audit usage | A coupon's stated terms are always the terms enforced in the cart (EP-3.1) |
| ADM-14 | Define a theme · Schedule with auto-revert · Attach collections and greetings · Preview | Only themeable slots are configurable; buttons, navigation and semantic colors are untouchable; no forgotten Diwali banner in January (Bargad §25) |
| ADM-15 | Reorder/toggle homepage sections · Attach collections · Schedule | The homepage can be merchandised without breaking IA §5 order or the resting state (EP-0.7) |
| ADM-16 | Edit content in both languages · Publish · Version | Publishing is blocked while one language is missing — parity is structural, not aspirational (EP-0.3) |
| ADM-17 | Approve/reject · Reply · Report | No incentivized or fake review can be published (EP-7.3) |
| ADM-18 | View the metrics of Product Strategy §9 · Filter by period · Export | The founder can see repeat rate, AOV, search success and community growth — not only revenue |
| ADM-19 | Create templates in both languages · Set frequency caps · Send · Audit | Frequency caps are enforced by the system, not by discipline (EP-5.4, EP-6.2) |
| ADM-20 | Set delivery area, slots, hours, ₹500 rule and its oils/loose-sugar exception · Update store profile | The Founder Brief §9 rules exist in exactly one place and are read by SHP-04, CHK-02 and CHK-03 |
| ADM-21 | Create roles · Assign staff · Revoke access | Nobody can accidentally do a thing they were never meant to do |
| ADM-22 | Review a request · Verify · Assign an owner · Message the applicant · Approve/decline | Every wholesale request has a named human owner; the applicant's WHL-04 always reflects reality |

---

## 2.14 Inventory summary

| Domain | MVP | V2 | Future | Total |
|---|---|---|---|---|
| Marketing (`MKT`) | 6 | 0 | 2 | 8 |
| Customer Shopping (`SHP`) | 4 | 0 | 0 | 4 |
| Search (`SRC`) | 3 | 0 | 2 | 5 |
| Categories (`CAT`) | 5 | 0 | 0 | 5 |
| Product Discovery (`DIS`) | 6 | 0 | 1 | 7 |
| Checkout (`CHK`) | 7 | 0 | 0 | 7 |
| Customer Account (`ACC`) | 10 | 0 | 0 | 10 |
| Loyalty (`LOY`) | 4 | 0 | 1 | 5 |
| Orders (`ORD`) | 6 | 1 | 0 | 7 |
| Support & System (`SUP`) | 6 | 0 | 0 | 6 |
| Wholesale (`WHL`) | 5 | 0 | 0 | 5 |
| Admin (`ADM`) | 21 | 1 | 1 | 23 |
| **Total** | **83** | **2** | **7** | **92** |

## 2.15 Coverage check against the Information Architecture

| IA section | Covered by |
|---|---|
| §4 Site Map | MKT-01, SHP-01…SHP-04, CAT-01…CAT-03, SRC-01…SRC-03, CHK-01…CHK-07, ORD-01…ORD-03, ACC-04…ACC-10, MKT-02…MKT-04, SUP-01 |
| §5 Homepage Architecture | MKT-01 (composition), ADM-15 (management) |
| §6 Category Structure | CAT-01…CAT-05, ADM-07 |
| §7 Search Architecture | SRC-01…SRC-03 (MVP), SRC-04, SRC-05 (Future) |
| §8 Product Detail Architecture | SHP-02 |
| §9 Cart Architecture | SHP-04 |
| §10 Checkout Architecture | CHK-01…CHK-07 |
| §11 Customer Account | ACC-04…ACC-10, ORD-01, SHP-03, LOY-01, SUP-03 |
| §12 Wholesale Flow | WHL-01…WHL-05, ADM-22 |
| §13 Admin IA | ADM-01…ADM-22 |
| §14 SEE Integration | DIS-02, ADM-14, ADM-15 (structure only; not implemented in MVP) |
| §15 Footer Architecture | MKT-02, MKT-03, MKT-04, MKT-06, MKT-07, MKT-08, SUP-01, ORD-03, WHL-01 |
| §16 Navigation Principles | Enforced across every screen via EP-0.6 and Bargad §21 |
| §17 Scalability | ID scheme (§2.1), Future-tagged screens, ADM-14 |

## 2.16 Open questions carried into Part 2

Recorded here so they are decided deliberately later, not accidentally during design:

1. Whether `SHP-01 Shop Landing` and `CAT-01 Category Index` remain distinct screens on mobile, or whether Shop is a desktop-only entrance — the IA lists both, and the 3-tap depth cap (EP-2.4) must be measured before deciding.
2. Whether `DIS-05 Monthly Grocery` is a merchandised collection, a saved household list, or both — this determines whether it depends on identification.
3. The exact identity boundary for `ORD-03 Track Order` (reference + phone) versus rate limiting and privacy — an EP-4.2 versus data-exposure trade-off.
4. Whether membership and loyalty are one object with two views (`ACC-10` / `LOY-01`) or two objects — affects ADM-11 and ADM-12.
5. Whether `SUP-03 Contact Support` needs a form at all, or should be a WhatsApp handoff with order context attached (EP-0.8 argues for the latter).

---

# 3. Flow Architecture

## 3.1 Purpose of this section

Part 1 defined *what the screens are*. This part defines *what happens between them*.

A screen inventory can be complete and the product still fail, because customers do not experience screens — they experience sequences. Trust is spent and earned in the joints: the moment after payment fails, the moment the OTP does not arrive, the moment the atta in a reorder is out of stock. Those moments are not owned by any single screen, which is exactly why they get designed last and badly. This section designs them first.

Each flow below is the contract that later UI design, engineering and QA must satisfy.

## 3.2 Conventions

**Flow ID format:** `FLW-NN`. Permanent, never reused.

**Every flow is defined by seven parts**, in this fixed order:

| Part | What it answers | Discipline it enforces |
|---|---|---|
| Goal | What the customer is actually trying to do | Prevents flows designed around what *we* want |
| Trigger | What starts it, in the customer's real life | Forces the flow to begin outside the product |
| Steps | The happy path, screen by screen | Makes the sequence auditable |
| Decision Points | Where the flow branches, and by what rule | Removes ambiguity from design and code |
| Edge Cases | What must happen when reality intervenes | Makes EP-0.4 structural, not aspirational |
| Friction Points | Every place effort or doubt is imposed | Names the cost we are charging the customer |
| Optimization Opportunities | What would make it cheaper, and when | Separates MVP discipline from V2/Future ambition |

**Friction is classified, not merely listed.** Some friction is the product working correctly.

| Class | Meaning | Action |
|---|---|---|
| `ACCEPTED` | Necessary friction that protects trust, money or truth | Keep. Design it to feel purposeful, never apologetic |
| `REDUCIBLE` | Real cost with a known cure that is out of MVP scope | Keep now, fix on a named release |
| `DEFECT` | Friction with no justification under Documents 01–05 | Must not ship |

**Decision points** are labelled `D1`, `D2`… within a flow. **Edge cases** are labelled `E1`, `E2`… within a flow. These labels are local to the flow and are referenced as `FLW-03/D2`.

**Notation:** `→` means "goes to". `⇄` means "returns to the same point without loss". Screen IDs are from Part 1 §2.

## 3.3 Flow map

The seventeen flows are not peers. They are the arc (Part 1 §1.2) made operational, plus the machinery that serves it.

| Arc stage | Flows that carry it |
|---|---|
| First Visit | FLW-01 |
| Browsing | FLW-01, FLW-02, FLW-09, FLW-10, FLW-15 |
| Purchase | FLW-03, FLW-04, FLW-06, FLW-08 |
| Delivery | FLW-12, FLW-13 |
| Repeat Purchase | FLW-02, FLW-05, FLW-07, FLW-11, FLW-14 |
| Community | FLW-14, FLW-15 |
| Advocacy | FLW-16 |
| *(Separate relationship — outside the retail arc)* | FLW-17 |

**Chaining rule (EP-0.2).** Flows hand off; they do not restart. FLW-01 must end in a state FLW-02 can inherit. FLW-03 must end in a state FLW-12 can inherit. Any flow that ends by dropping the customer at the homepage with no thread has failed, regardless of whether its own steps completed.

## 3.4 One structural correction before the flows

The brief for this part names a **"Forgot Password"** flow. Under the finalized documents, MG Supermart has no passwords: Bargad §19 fixes identity as phone + OTP ("No password needed"), and EP-3.3 states the reasoning — passwords are the largest abandonment point for new internet users.

A password-recovery flow therefore cannot be designed without contradicting Document 05, which this document is not permitted to do.

The real failure it was meant to cover is genuine and more common here than a forgotten password: **the customer cannot get in.** That flow exists and is designed as **FLW-07 — Account Recovery**, covering the three cases that actually occur in Pipra:

1. The OTP does not arrive (network, SMS delay, wrong number).
2. The phone number is lost, changed, or belongs to a family member who is unavailable.
3. The device is shared, and the previous person's session is still active.

FLW-07 is the honest replacement, not an omission.

---

## 3.5 FLW-01 — New Visitor

**Carries:** EP-1.1 – EP-1.7, EP-2.1 · **Arc stage:** First Visit → Browsing
**Release:** MVP

### Goal

*Customer's goal:* "Find out whether this is the shop I know, and whether it delivers to me."
*Product's goal:* Answer the delivery question before it is asked, prove the shop is real, and end with the visitor browsing — having been asked for nothing.

### Trigger

A Google Business listing, an Instagram bio link, a WhatsApp forward from a neighbour, a QR code printed at the counter, a Google search for "grocery Pipra", or a card handed over at the shop.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | MKT-01 | Homepage paints. Identity, area served and next slot are visible in the first screenful. No modal, no prompt, no gate. | EP-1.1, EP-1.2, EP-1.3, EP-1.5 |
| 2 | MKT-01 | Language is visibly one tap away (अ/A). If tapped, choice is stored and honoured for the rest of the relationship. | EP-1.6, EP-0.3 |
| 3 | MKT-01 | The ₹500 minimum and the oils/loose-sugar exception are stated on the page, as information, not as a warning. | EP-1.4 |
| 4 | MKT-01 → CAT-01 / SRC-01 / DIS-01 | Visitor takes a first move: a category, a search, or an offer shelf. | EP-2.3 |
| 5 | CAT-03 / SRC-02 / SHP-02 | Prices, units, savings and stock are visible with no login and no pincode gate. | EP-2.1, EP-2.2 |
| 6 | SHP-04 | First add-to-cart. Cart persists immediately, before any identification. | EP-2.6 |
| — | *(exit)* | Either → FLW-03 (guest checkout) or abandonment with a surviving basket that FLW-02 will inherit. | EP-0.2 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is this visitor inside the 5 km service area? | Yes → normal flow · Unknown → normal flow, stated honestly · Explicitly outside → honest message + store address + WhatsApp | Never block browsing to determine this. Serviceability is *stated*, then confirmed at CHK-02 — never guessed via a permission prompt (EP-1.3) |
| D2 | Which language does the first screen speak? | Stored preference → use it · Browser hint → use it as a *default*, never a lock · Unknown → default per shop policy, toggle visible | The toggle must be visible regardless of which branch fired (EP-1.6) |
| D3 | Did the visitor arrive on a deep link (product, collection, tracking)? | Yes → serve that screen with full context and a route back to MKT-01 · No → MKT-01 | A deep-linked visitor is still a New Visitor and still needs EP-1.1/EP-1.2 answered on that screen |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | 2G / very slow network | Skeletons, not spinners; identity, delivery strip and search render first; images lazy and pre-sized. LCP < 2.5 s target holds (EP-0.4, EP-1.5, Bargad §16) |
| E2 | Visitor is outside the delivery area | Say so plainly, offer the store address, hours, map and WhatsApp. Never a dead end, never a fake "coming soon" (EP-0.6, EP-1.7) |
| E3 | Arrived from a WhatsApp in-app browser | Full functionality; no "open in browser" nag; language toggle still works |
| E4 | Shop is closed / outside hours | Browsing continues normally; the delivery strip states the next real slot, not "closed" (EP-3.5) |
| E5 | Catalogue partially unavailable | Show what loads; never a blank page. An empty shelf explains and offers search (EP-2.9) |
| E6 | Visitor is elderly / low literacy | Every icon carries its word; nothing depends on a hidden gesture (Bargad §13, §22) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Visitor must self-assess serviceability from the delivery strip rather than being auto-located | `ACCEPTED` | A location prompt on first visit costs more trust than it saves effort (EP-1.3). The strip answers it without asking |
| Language may be wrong for the first three seconds | `ACCEPTED` | Unavoidable without a prompt. The toggle's visibility is the mitigation (EP-1.6) |
| The ₹500 rule is a condition learned at the door | `ACCEPTED` | Founder Brief §9 makes early disclosure mandatory. The friction is the point — it is honesty, and it is cheaper here than at CHK-05 |
| No product-level personalization on a first visit | `ACCEPTED` | We have no data and will not pretend to. DIS-06 (Popular Near You) supplies local consensus instead |
| Any signup/notification/app-install modal | `DEFECT` | Must not ship (EP-1.3) |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Serviceability inferred from the entry link (QR at the counter ⇒ definitely in-area) | V2 | Removes D1's ambiguity without a permission prompt |
| Pre-warmed homepage shelf cache for repeat 3G visitors | V2 | EP-1.5 is a trust requirement, not a performance nicety |
| Language inferred from the referring channel (Hindi WhatsApp forward ⇒ Hindi) | V2 | Reduces D2's error rate with no prompt |
| DIS-07 recommendations replacing DIS-06 on a first visit | Never | We have no basis. Faking local relevance breaks EP-1.7 |

---

## 3.6 FLW-02 — Returning Customer

**Carries:** EP-0.2, EP-2.6, EP-5.1, EP-5.2 · **Arc stage:** Browsing → Repeat Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Get the things I need, faster than last time."
*Product's goal:* Prove the relationship persisted — resume the basket, surface the last order, and make reordering the shortest visible path.

### Trigger

A WhatsApp reminder, a monthly rhythm (salary, festival, the atta running out), a bookmark, a repeat Google search, or a notification from ACC-08.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | MKT-01 | Homepage opens in the customer's stored language. A live order, if any, is surfaced before anything else. | EP-0.3, EP-4.1 |
| 2 | MKT-01 | The surviving cart is intact and visible in the header — nothing was lost since the last session. | EP-2.6 |
| 3 | MKT-01 / ACC-04 | Reorder and Monthly Grocery are reachable without hunting. | EP-5.2, EP-5.3 |
| 4a | ORD-04 | → FLW-11 (Reorder), or | EP-5.2 |
| 4b | SRC-01 / CAT-01 / SHP-03 | → normal browsing, with recents making the second search cheaper than the first. | EP-2.3, EP-5.1 |
| 5 | SHP-04 | Basket assembled; saved address and preferred slot are already known. | EP-5.1 |
| 6 | → FLW-04 | Logged-in checkout. | EP-3.1 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is this customer identified? | Session valid → identified experience · Session expired but device known → offer one-tap re-identify, never force it · Unknown → treat as FLW-01 with a surviving cart | Identity is never a prerequisite for browsing (EP-2.1) |
| D2 | Is there a live order? | Yes → its status is the first thing shown, above merchandising · No → normal homepage | During the wait, the order outranks the shop (EP-4.1) |
| D3 | Does a surviving cart exist, and has anything in it changed? | Unchanged → restore silently · Price or stock changed → restore *and* disclose the change | Never silently repair a basket (EP-5.6, EP-4.6) |
| D4 | Guest cart + now identified? | Merge, then show what merged | Merging must be explained, never surprising |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Cart contains an item now out of stock | Keep it visible, mark it honestly, offer notify-me and an alternative. Never delete it silently (EP-4.6) |
| E2 | Cart item price changed since last session | Show old → new, plainly. The customer decides (EP-5.6) |
| E3 | Session expired mid-basket | Basket survives; identification is offered, never demanded (EP-2.1) |
| E4 | Shared family device, different member returns | The identified session is honoured; switching identity is one visible action, and the previous person's data is never merged into the new one (see FLW-07/E3) |
| E5 | Customer returns after a failed previous order | The failure is acknowledged and resolved before anything is merchandised at them (EP-0.2) |
| E6 | Language preference conflicts with device language | Stored preference wins. It was a deliberate choice (EP-0.3) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Re-identification after session expiry | `ACCEPTED` | Phone+OTP is one screen and no password (EP-3.3). Long sessions are the mitigation, not weaker identity |
| Disclosure of price/stock changes adds a step to a resumed cart | `ACCEPTED` | The step *is* the honesty (EP-5.6). Removing it would be a dark pattern |
| Reorder competes for homepage space with merchandising | `REDUCIBLE` (V2) | Resolve with ADM-15 configuration and DIS-07, not by demoting EP-5.2 |
| Homepage identical for a 20-order customer and a 1-order customer | `REDUCIBLE` (Future) | DIS-07 is the named cure. Not an MVP defect |
| Any re-asking of name, address or language | `DEFECT` | Violates EP-5.1 outright |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Live-order strip pinned above the fold during the wait | MVP | Directly delivers EP-4.1; cheap and high-value |
| "Buy again" shelf built from actual purchase history | V2 | The single highest-leverage repeat lever (EP-5.2) |
| Household-cycle timing for reminders (atta ~every 30 days) | Future | EP-5.4: useful, not pursuing — requires real history to be honest |
| DIS-07 personalized shelves | Future | Already scoped in Part 1; must stay explainable (EP-0.5) |

---

## 3.7 FLW-03 — Guest Checkout

**Carries:** EP-3.1 – EP-3.8 · **Arc stage:** Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Place this order without creating an account, and without being tricked."
*Product's goal:* Complete the order at equal quality to the logged-in path, and end with the customer holding a receipt on their own phone.

### Trigger

The customer taps Checkout from SHP-04.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | SHP-04 | Every rupee and every rule already resolved here: items, delivery, ₹500 status incl. the oils/loose-sugar exception, coupon, slot availability. | EP-3.1, EP-1.4 |
| 2 | CHK-01 | Guest or login. Guest is a peer, not a penalty — same wording weight, same position. | EP-3.2 |
| 3 | CHK-02 | Address entered landmark-first. Serviceability confirmed here. | EP-3.4 |
| 4 | CHK-03 | Slot chosen from real, keepable slots. Full slots visible and struck, not hidden. | EP-3.5 |
| 5 | CHK-04 | Final review. Everything editable ⇄ without losing the order. Nothing about money changes after this screen. | EP-3.1, EP-0.6 |
| 6 | CHK-05 | Payment: cash on delivery and digital presented as peers. | EP-3.7 |
| 7 | CHK-07 | Confirmation. One 600 ms celebration. Receipt sent to the phone via WhatsApp/SMS. The wait is prepared, not just announced. | EP-3.8, EP-0.2 |
| 8 | → FLW-12 | Tracking, reachable with no account (ORD-03). | EP-4.2 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Guest or identify? | Guest → CHK-02 · Login → FLW-06, then resume at CHK-02 with the cart and intent intact | Login must return the customer to *exactly* where they left (EP-0.2) |
| D2 | Is the ₹500 minimum met, excluding oils and loose sugar? | Met → proceed · Not met → stated in SHP-04 with the shortfall in rupees and a route to fix it | Never enforced first at CHK-05 (Founder Brief §9, EP-3.1) |
| D3 | Is the address serviceable? | Yes → CHK-03 · No → say so here, offer store pickup/WhatsApp, keep the cart | Serviceability is answered at CHK-02, never later (EP-3.4) |
| D4 | Are slots available? | Yes → choose · All full → show the next real day honestly; never offer a slot we cannot keep | EP-3.5 |
| D5 | Payment method? | COD → CHK-07 directly · Digital → provider → CHK-07 or CHK-06 | COD is a first choice, not a fallback (EP-3.7) |
| D6 | Digital payment failed? | → CHK-06, order intact, cause named, COD offered | The order survives the failure (EP-3.7) |
| D7 | Does the guest want an account afterwards? | Offered *once*, at CHK-07, after value | Never before, never as a condition (EP-6.1, EP-3.2) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Item goes out of stock between SHP-04 and CHK-04 | Disclose at CHK-04 before payment, offer removal or an alternative, recompute the ₹500 status openly. Never discovered after payment (EP-4.6, EP-3.1) |
| E2 | Chosen slot fills while the customer is at CHK-04 | Say so, offer the nearest real alternative, never auto-assign silently (EP-3.5) |
| E3 | Network drops mid-checkout | Cart and entered data survive; the customer resumes at the same step (EP-0.4, EP-2.6, Bargad §19: errors never erase input) |
| E4 | Payment succeeded but confirmation did not render | The order exists. The WhatsApp/SMS receipt is the authority; ORD-03 lookup resolves it (EP-3.8) |
| E5 | Double submission / double tap | One order. The button narrates and keeps its width; it never silently duplicates (Bargad §18) |
| E6 | Guest phone number matches an existing account | The order proceeds as guest. We do not force a merge or reveal that an account exists mid-checkout — that is a privacy and pressure failure. Association is offered at CHK-07 |
| E7 | Coupon becomes invalid at CHK-04 | Explain why, in the review, before payment. Never at CHK-05 (EP-3.1, Part 1 LOY-04) |
| E8 | Customer abandons at CHK-04 | Cart survives fully. No chase message, no urgency, no "your cart is expiring" (EP-0.5, EP-5.4) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Address must be typed on the first order | `ACCEPTED` | Unavoidable once. FLW-08 ensures it is a one-time cost forever after (EP-5.1) |
| A phone number is still required from a guest | `ACCEPTED` | Delivery is impossible without it, and EP-4.2 tracking depends on it. It is collected as a delivery necessity, not as an identity grab |
| Seven screens between cart and confirmation | `ACCEPTED` | IA §10 fixes the sequence; EP-3.6 requires one decision per step. Fewer steps at this anxiety level means more decisions per step, which is worse |
| Guest data is not reusable next time | `REDUCIBLE` (V2) | Cure is FLW-05 offered at CHK-07, after value — not a forced account (EP-6.1) |
| Guest OTP verification of the phone number | `REDUCIBLE` (V2) | Only if fraud makes it necessary. Adding it to MVP would make guest slower than logged-in and break EP-3.2 |
| Any degradation of the guest path (fewer slots, no coupons, worse price) | `DEFECT` | Direct violation of EP-3.2 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Landmark autocomplete from previously delivered addresses in the same locality | V2 | Cuts the largest real friction without asking for more data (EP-3.4) |
| Recognize a returning guest device and pre-fill the address, editable and never assumed | V2 | Delivers EP-5.1 without forcing FLW-05 |
| ₹500 shortfall shown with a one-tap "add the cheapest qualifying item" helper | V2 | Turns a rule into service; must never become an upsell (EP-0.5) |
| Slot capacity shown while browsing, not only at CHK-03 | V2 | Moves a surprise earlier, which is always cheaper (EP-3.1) |
| Digital payment retry inside CHK-06 without re-entering the order | MVP | Failure must never cost the basket (EP-3.7) |

---

## 3.8 FLW-04 — Logged-in Checkout

**Carries:** EP-3.1 – EP-3.8, EP-5.1 · **Arc stage:** Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Place my usual order in under a minute."
*Product's goal:* Spend the relationship: everything already known is offered, nothing known is re-asked, and the review step remains as honest as a guest's.

### Trigger

Checkout tapped from SHP-04 with a valid session, or FLW-06 completing inside FLW-03.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | SHP-04 | Cart, rules, coupons and *available loyalty points* all resolved here. | EP-3.1, EP-5.5 |
| 2 | CHK-02 | Saved addresses offered; default pre-selected but visibly changeable. | EP-5.1 |
| 3 | CHK-03 | Preferred slot pre-highlighted from history; never pre-committed. | EP-5.1, EP-3.5 |
| 4 | CHK-04 | Review: items, address, slot, coupon, points applied, final total. | EP-3.1 |
| 5 | CHK-05 | Payment; last-used method offered first, never pre-selected. | EP-3.7 |
| 6 | CHK-07 | Confirmation, receipt to phone, points earned stated in rupees. | EP-3.8, EP-5.5 |
| 7 | → FLW-12 / FLW-14 | Tracking; and the community invite becomes eligible only after delivery. | EP-4.1, EP-6.1 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Does a default address exist and is it still serviceable? | Yes → pre-select, show it, allow change · No/unserviceable → CHK-02 selection with the reason stated | Pre-selected ≠ pre-committed. It is always visible and always editable (EP-0.6) |
| D2 | Does the customer have redeemable points? | Yes → offered in SHP-04/CHK-04 with the rupee value stated · No → nothing shown | Points are never auto-applied. Silent redemption is a decision taken *for* the customer (EP-5.5, EP-0.5) |
| D3 | Coupon and points both applicable? | Apply the stacking rule from ADM-13/ADM-12 and *show the arithmetic* | Whatever the rule, the customer must be able to verify it (Product Strategy §5) |
| D4 | Is the customer a member (ACC-10)? | Yes → member benefit visible in the totals, named · No → nothing implied | Every benefit marketed on MKT-05 must appear as a line the customer can see |
| D5 | Session expired at CHK-04? | Re-identify in place, return to CHK-04 with the order intact | Never restart checkout (EP-0.2, EP-0.6) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Saved address is no longer serviceable (area rules changed) | Say so at CHK-02 with the cause, offer another saved address or a new one. Never fail at CHK-05 (EP-4.3 logic) |
| E2 | Points balance changed since the cart was built | Recompute openly at CHK-04, show old → new. Never a silent total change (EP-5.5) |
| E3 | Membership expired mid-checkout | The benefit shown at CHK-04 is honoured for this order; renewal is offered afterwards, never as a checkout blocker (EP-3.2 spirit) |
| E4 | Two devices, same account, two carts | One cart of record; the merge is explained, never silent (FLW-02/D4) |
| E5 | Household member checks out on someone else's session | Not solvable technically — solvable by never surprising: address and slot are always visible before payment (EP-3.1) |
| E6 | Payment failure on a logged-in order | Identical to FLW-03/D6. Being known does not entitle us to a worse failure experience |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| CHK-04 exists even when everything is known | `ACCEPTED` | It is the last honest look (EP-3.1). Removing it for known customers would penalize trust with less transparency |
| Slot must still be chosen every order | `ACCEPTED` | A slot is a promise (EP-3.5). Auto-selecting one commits the customer to a time they did not agree to |
| Points require an explicit apply action | `ACCEPTED` | Auto-apply is a decision made for the customer, and silent spending of a balance is the fastest way to make loyalty feel like a trick (EP-5.5) |
| Still 5 screens for a known customer with a known basket | `REDUCIBLE` (V2) | Cure is FLW-11 (reorder) collapsing steps 1–3, not deleting the review step |
| Pre-selecting the last payment method as *committed* | `DEFECT` | Pre-ticked choices are forbidden (EP-0.5, Bargad §19) |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Reorder → single review screen (address, slot, total) with everything editable | V2 | Fastest legitimate path; EP-5.2 without touching EP-3.1 |
| Preferred slot pre-highlighted from real history | MVP | Reduces a decision without making it (EP-5.1) |
| Subscription / standing monthly order | Future | Already scoped in Founder Brief §17; only honest once slot reliability is proven |
| "Same as last time" basket comparison at CHK-04 | V2 | Catches the household's own mistakes — service, not upsell |

---

## 3.9 FLW-05 — Registration

**Carries:** EP-3.2, EP-5.1, EP-6.1 · **Arc stage:** Purchase → Repeat Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Make the next order easier — without filling a form."
*Product's goal:* Convert a delivered promise into a persistent relationship, asking for the minimum, at the only moment we have earned the right to ask.

### Trigger

CHK-07 after a successful order (the intended path); or a deliberate tap on Account from the bottom nav; or an identified-only action (Wishlist sync, ORD-01, LOY-01).

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | CHK-07 / ACC-01 | The offer is made once, stating the benefit in concrete terms ("your address and orders will be here next time"). | EP-6.1, EP-6.2 |
| 2 | ACC-01 | Phone number entered. No password field exists anywhere in this flow. | EP-3.3 |
| 3 | ACC-02 | OTP. Numeric keypad, resend after 30 s, no penalty, no lockout, no timer pressure. | Bargad §19, §22 |
| 4 | ACC-03 | Name and language. Email is optional and explicitly marked optional. Everything is skippable. | EP-5.1, Bargad §19 |
| 5 | — | The just-placed guest order, the guest cart, the wishlist and any loyalty accrued against that phone number are attached to the new account, and *shown* as attached. | EP-0.2, EP-5.5 |
| 6 | ACC-04 / ORD-02 | Returned to exactly where they were, not dumped at a dashboard. | EP-0.2 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Does this phone number already have an account? | Yes → this is FLW-06 (login), silently and without an error · No → create | "This number already exists" is an error message for a system with passwords. We have none, so there is no error to show |
| D2 | Is there guest history on this number? | Yes → attach it and show what was attached · No → clean account | The attachment is the entire value proposition. Hiding it wastes it |
| D3 | Is ACC-03 (name) skipped? | Account is fully functional | A name is for warmth, not for function. Blocking on it makes it a toll (Bargad §19) |
| D4 | Where did the flow start? | Return to that exact point with the intent intact | Registration is never a destination (EP-0.2) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | OTP never arrives | → FLW-07. Resend, alternate channel, then a human. Never a dead end (EP-0.6, EP-0.8) |
| E2 | The number belongs to a family member's phone | Permitted and normal here. One number = one household account is the working model; FLW-07/E3 covers switching |
| E3 | The number is typed wrong | Editable at ACC-02 without restarting; entered input is never erased (Bargad §19) |
| E4 | Registration abandoned at ACC-02 | The order still exists. The guest order is untouched and trackable via ORD-03 (EP-4.2) |
| E5 | Registration attempted on a shared/public device | Session is explicit and exitable; no permanent silent persistence on a device the customer does not control |
| E6 | Customer registers months after several guest orders | All orders on that number attach. Retroactive recognition is the strongest apnāpan signal we can send cheaply (EP-0.1) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| OTP round-trip (one screen, ~30 s on a good network) | `ACCEPTED` | It is the entire security model, and it replaces a password — a trade that is strongly positive for this audience (EP-3.3) |
| ACC-03 exists at all | `ACCEPTED` | One optional screen, fully skippable. A name is what makes the delivery message a greeting rather than a dispatch |
| OTP delivery is unreliable on rural networks | `REDUCIBLE` (V2) | Cure is a WhatsApp OTP channel, not a password. See FLW-07 |
| Registration is offered at CHK-07, when the customer wants to be done | `ACCEPTED` | It is the only post-value moment before they leave. Offered once, dismissible, never repeated in the session (EP-6.1) |
| Any registration wall before browsing or checkout | `DEFECT` | EP-2.1, EP-3.2 |
| Any pre-ticked marketing consent in ACC-03 | `DEFECT` | EP-0.5, EP-6.2 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| WhatsApp OTP as a primary channel with SMS as fallback | V2 | This audience is WhatsApp-native (Founder Brief §5); it fixes the largest real failure in this flow |
| Auto-read OTP from SMS on Android | V2 | Removes the flow's only typing on the device 90%+ of customers use |
| "You already have ₹40 in points" shown *at the moment of registering* | MVP | Attachment (D2) is the value; showing it is nearly free and is the strongest reason to complete |
| Silent account creation from a guest order | Never | An account the customer did not ask for is a decision made for them (EP-0.5) |

---

## 3.10 FLW-06 — Login

**Carries:** EP-3.3, EP-0.2, EP-2.1 · **Arc stage:** Any
**Release:** MVP

### Goal

*Customer's goal:* "Get back into my own history — quickly."
*Product's goal:* Identify by phone, restore the relationship, and return the customer to what they were doing.

### Trigger

Account tapped in the bottom nav; CHK-01 login chosen; an identified-only action tapped (ORD-01, LOY-01, ACC-06); or a session expiring mid-task.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | ACC-01 | Phone number. `+91` fixed, numeric keypad, spaces forgiven, no password field. | EP-3.3, Bargad §19 |
| 2 | ACC-02 | OTP. Auto-focus, resend at 30 s without penalty, no lockout, no countdown pressure. | Bargad §22 |
| 3 | — | Session established. Guest cart merged (explained, not silent). Language preference restored. | FLW-02/D4, EP-0.3 |
| 4 | *(origin)* | Return to the exact screen and intent that triggered the flow — CHK-02, ORD-01, LOY-01, or ACC-04 only if Account was the origin. | EP-0.2 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Does the number exist? | Yes → OTP · No → OTP anyway, then FLW-05 (ACC-03) | Never disclose whether a number is registered. It is a privacy leak *and* an unnecessary error state (FLW-05/D1) |
| D2 | Where did the flow start? | Checkout → CHK-02 · Orders → ORD-01 · Loyalty → LOY-01 · Nav → ACC-04 | Dumping everyone at ACC-04 breaks EP-0.2 and is the most common version of this bug |
| D3 | Is a guest cart present? | Merge and show the result · Conflict → the customer chooses, we never pick | We do not edit a basket on the customer's behalf (EP-4.6 logic) |
| D4 | OTP failed 3+ times? | Keep helping: resend, alternate channel, human. Never lock out | A lockout at this audience's literacy and network reality punishes the customer for our infrastructure (EP-0.6, Bargad §22: no time limits) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | OTP delayed beyond 30 s | Resend available, no penalty; after two failures, WhatsApp and Call are offered (EP-0.8) |
| E2 | Wrong number entered | Edit in place at ACC-02; nothing is lost (Bargad §19) |
| E3 | Login triggered mid-checkout | Resume at the exact step. The cart, address and slot are untouched (EP-0.2) |
| E4 | Session expires during a long browse | Browsing continues unaffected; identification is only requested when an identified action is taken (EP-2.1) |
| E5 | Login on a shared device with an existing session | Switching identity is one visible action; the previous session ends cleanly, and no data crosses over |
| E6 | Number changed since the account was created | → FLW-07 |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Two screens and an SMS round-trip | `ACCEPTED` | This is the cost of having no passwords — and it is far cheaper than the password reset flow it replaces (EP-3.3) |
| Dependent on SMS delivery, which rural networks make unreliable | `REDUCIBLE` (V2) | WhatsApp OTP. Named, scheduled, not hand-waved |
| Manual OTP entry | `REDUCIBLE` (V2) | Android SMS auto-read |
| Login required to view *own* orders | `ACCEPTED` | Order *contents* are private. Order *status* is not — which is precisely why ORD-03 exists without auth (EP-4.2) |
| Any lockout, cooldown or captcha as a first response | `DEFECT` | Bargad §22 forbids time limits; punishing a customer for a slow network is punishing them for being rural |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Long-lived sessions (months) on personal devices | MVP | The cheapest possible fix: the best login is the one that never happens |
| WhatsApp OTP primary | V2 | Fixes the root cause of nearly every failure here |
| Android SMS auto-read | V2 | Removes the last typing step |
| Passwords, "for convenience" | Never | Bargad §19 and EP-3.3 are settled |

---

## 3.11 FLW-07 — Account Recovery *(replaces "Forgot Password" — see §3.4)*

**Carries:** EP-0.6, EP-0.8, EP-3.3 · **Arc stage:** Any
**Release:** MVP

### Goal

*Customer's goal:* "I can't get in. Fix it — I don't care how."
*Product's goal:* Never let a customer be locked out of their own history by our infrastructure, and always end with a human if the machine cannot help.

### Trigger

OTP does not arrive; the phone number is lost, changed, or in someone else's hands; a shared device holds someone else's session; or repeated failed attempts.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | ACC-02 | Resend after 30 s. No penalty, no counter, no shame. | Bargad §19 |
| 2 | ACC-02 | Second failure → alternate channel offered (WhatsApp OTP, V2 / voice call, V2). | EP-0.4 |
| 3 | ACC-02 → SUP-03 | Third failure → the human path becomes the primary action: WhatsApp or Call, with the number already attached so nothing is re-explained. | EP-0.8, EP-5.1 |
| 4 | SUP-03 / ADM-10 | Staff verify identity the way a shopkeeper does — recent orders, address, landmark — and restore access or update the number. | EP-0.1 |
| 5 | *(origin)* | Return to the interrupted intent. | EP-0.2 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Which failure is this? | No OTP → channels · Number changed → staff-verified change · Shared device → session switch, no recovery needed | Diagnosing correctly is the whole flow. A single "try again" for all three is why lockouts happen |
| D2 | Can the machine solve it? | Yes → resolve · No → hand to a human within three attempts | Three is the ceiling. Beyond that we are pretending (EP-0.8) |
| D3 | Number change requested — verified how? | By facts only the household knows (recent orders, address, landmark), recorded in ADM-10 with the staff member's name | An account holds an address and an order history. Transferring it on an unverified claim is a real harm |
| D4 | Is the customer blocked from anything urgent? | If a live order exists, ORD-03 already answers it with no login at all (EP-4.2) | Recovery must never be the only path to knowing where your groceries are |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | SMS gateway is down entirely | WhatsApp/Call become the primary path immediately, not after three failures. The shop still works (EP-0.4) |
| E2 | Customer changed their SIM but kept the number | Nothing to recover; OTP works |
| E3 | Shared family phone, two people's histories | This is not recovery — it is identity switching. One visible action, clean session end, no data merged (FLW-06/E5) |
| E4 | Number recycled by the telecom operator to a new person | Staff-verified change only (D3). Never automatic; an address book is at stake |
| E5 | Customer has no other channel and cannot reach a phone | The physical shop is 5 km away and is a legitimate, stated recovery path. We are a neighbourhood shop; this is a feature, not an embarrassment (EP-0.1) |
| E6 | Repeated recovery attempts from the same number | Still no lockout. Rate-limit the *sending*, never the *customer's* access to a human (Bargad §22) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Staff verification for a number change | `ACCEPTED` | Slow on purpose. An account holds a home address; an automated transfer is a safety failure, not a convenience |
| Recovery may require talking to a person | `ACCEPTED` | EP-0.8: a human is a feature. For this audience, "call the shop" is the *most* familiar recovery mechanism in existence |
| No self-service number change | `REDUCIBLE` (V2) | Only with old-number OTP + new-number OTP. Anything weaker is not worth the risk |
| Dependence on a single SMS provider | `REDUCIBLE` (V2) | WhatsApp channel + a second SMS provider |
| Security questions, email resets, or passwords as a recovery mechanism | `DEFECT` | Contradicts Bargad §19 and EP-3.3; also unusable for a customer with no email |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| WhatsApp OTP as a parallel channel from the first attempt | V2 | Removes ~most of this flow's existence |
| Voice-call OTP for elderly customers and dead-data areas | V2 | Named persona in Founder Brief §5; the network they have is voice |
| Self-service number change: OTP to old + OTP to new | V2 | Safe automation of D3's common case |
| Staff-side "recover access" action with a full audit trail in ADM-10 | MVP | Makes the human path fast and accountable (ADM-21) |

---

## 3.12 FLW-08 — Address Management

**Carries:** EP-3.4, EP-5.1 · **Arc stage:** Purchase → Repeat Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Tell them where I live, once — the way I'd tell a person."
*Product's goal:* Capture an address a delivery person can actually find, and never ask for it again.

### Trigger

First checkout (CHK-02); a deliberate visit to ACC-06; a delivery that went wrong; or a household move.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | ACC-06 / CHK-02 | Saved addresses listed; default marked, changeable. | EP-5.1 |
| 2 | ACC-07 | Add/edit: landmark-first — "पहचान का निशान" is a first-class field, not an afterthought. | EP-3.4, Bargad §19 |
| 3 | ACC-07 | Area and pincode; serviceability checked and answered here, in words. | EP-3.4 |
| 4 | ACC-07 | Optional label (Home, Shop, Maa's house) and delivery notes. | EP-5.1 |
| 5 | ACC-06 / CHK-03 | Saved and reusable forever. If the flow began at checkout, it continues to CHK-03 — it does not dump the customer at ACC-06. | EP-0.2 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is the address inside the 5 km radius? | Yes → save · No → say so kindly here, offer store pickup and WhatsApp, keep the cart | Never at CHK-05 (EP-3.1). Founder Brief §9 fixes the radius |
| D2 | Is this the first address? | Yes → default automatically · No → default only if chosen | Auto-defaulting the *first* is convenience; auto-changing an *existing* default is a decision taken for them |
| D3 | Where did the flow start? | Checkout → CHK-03 · Account → ACC-06 | EP-0.2 |
| D4 | Editing an address attached to a live order? | Editing creates the new version; the live order keeps the address it was placed with, and a change requires the shop to confirm | An order in transit cannot silently change destination (EP-4.6) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Customer does not know their pincode | It must not be a blocker. Landmark + area is what actually delivers here; pincode is derived or asked, never gating (EP-3.4) |
| E2 | The landmark is ambiguous ("near the temple") | Accept it and let the delivery person call. This is precisely how the shop already works — forcing precision we do not need is imposing a Bangalore schema on Pipra (Bargad §19) |
| E3 | Address is just inside/outside the boundary | Serviceable per ADM-20 rules; borderline cases resolve toward the human (WhatsApp), never toward a silent rejection |
| E4 | Deleting the only saved address | Allowed. Next checkout asks for one. Never block a deletion to protect our data (EP-0.5) |
| E5 | The same address entered twice with different landmarks | Allowed. Households do this; deduplication that deletes their words is not our decision |
| E6 | Delivery failed at this address | The failure is attached to the address in ADM-10 so the next delivery is better — surfaced to staff, not as a scolding to the customer (Design Principles §12) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| An address must be typed once, on a phone keypad | `ACCEPTED` | Irreducible for the first order. FLW-08 exists so it is a one-time cost forever (EP-5.1) |
| The landmark field asks for something no national platform asks for | `ACCEPTED` | It is the field that makes the delivery work here, and it silently says "this was built for here" (Bargad §19) |
| Serviceability check requires area/pincode | `ACCEPTED` | Answering it here prevents the worst surprise in the product (EP-3.1) |
| No map pin | `REDUCIBLE` (V2) | GPS accuracy in rural lanes is poor and a map prompt on the first order violates EP-1.3. Optional map assist, later |
| Typing Devanagari on an unfamiliar keyboard | `REDUCIBLE` (V2) | Accept either script; never validate one away |
| Rejecting an address for failing a format regex | `DEFECT` | Bargad §19: forgiving inputs. Our schema must bend to Pipra, not the reverse |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Locality/landmark autocomplete built from real delivered addresses | V2 | Uses what we already know; asks for nothing new (EP-5.1) |
| Optional map pin *after* the address is saved, never before | V2 | Assists the delivery person without gating the customer (EP-1.3) |
| Share-your-location via WhatsApp for a difficult delivery | V2 | The channel they already use; solves the real problem where it occurs |
| "Deliver to a different address this time" without editing the saved one | MVP | Households order for relatives constantly. Cheap, and prevents address-book corruption |

---

## 3.13 FLW-09 — Search

**Carries:** EP-2.3, EP-2.9, EP-5.1 · **Arc stage:** Browsing
**Release:** MVP

### Goal

*Customer's goal:* "I know what I want. Give it to me."
*Product's goal:* Understand the customer's own words — Hindi, English, local spelling, brand, or typo — and end on the right shelf on the first screen.

### Trigger

Bottom nav Search; the search field on any screen; a zero-result recovery; a spoken/scanned query (Future).

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | SRC-01 | Recents and popular searches offered before a single character is typed. | EP-5.1, EP-2.3 |
| 2 | SRC-01 | Typing produces suggestions across product names, brands and categories, in both scripts. | IA §7 |
| 3 | SRC-02 | Results: same card, same filters, same order as CAT-03 — the shelf does not change identity because the door did. | EP-2.3, EP-2.2 |
| 4 | SRC-02 | Add to cart directly from results; quantity adjusts in place. | EP-2.7 |
| 5 | SHP-02 / SHP-04 | Or open the product, or check out. | — |
| — | SRC-03 | If nothing matches → recovery, never a dead end. | EP-2.9 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Which script/language is the query? | Devanagari, Latin, or transliterated Latin ("ata", "atta", "आटा") → the same shelf | IA §7 requires local spellings, Hindi terms, English terms and common typos. Transliteration is not a feature — it is the baseline |
| D2 | Does the query name a category, a brand, or a product? | Category → offer the shelf · Brand → CAT-05 · Product → SHP-02 or a results set | Guessing wrong is recoverable; refusing to guess is not |
| D3 | Zero results? | → SRC-03 with close matches, the nearest category, and "ask the shop" on WhatsApp | Silence is worse than "we don't have it" (EP-2.9) |
| D4 | Results but nothing in stock? | Show them, honestly marked, with notify-me | Hiding out-of-stock results looks like we don't stock it at all (EP-2.2) |
| D5 | Did the customer search something we should stock? | Zero-result queries flow to ADM-18 as a stocking signal | Search is the cheapest market research the shop will ever get |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Typo ("saban", "sabun", "सबुन") | Resolves to soap. Typo tolerance is mandated by IA §7 |
| E2 | Local/colloquial name differing from the pack name | Synonym mapping maintained in ADM-05/ADM-07. The customer's word is correct by definition |
| E3 | Query in mixed script ("Tata namak") | Handled. This is how people actually type here |
| E4 | Very slow network | Search must degrade to a plain query → results without suggestions. It must never be the feature that breaks first (EP-0.4) |
| E5 | Query is a person's name, an address, or nonsense | SRC-03 with a graceful route, never an error tone (Design Principles §12) |
| E6 | Recents contain something private on a shared device | Clearing recents is one visible action (Part 1, SRC-01) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Typing at all | `ACCEPTED` for now | It is why CAT-01 exists as an equal door (EP-2.3). SRC-04/SRC-05 are the eventual cure |
| Devanagari typing is slow on most keyboards | `ACCEPTED` | Mitigated by accepting Latin transliteration — the customer chooses their own effort |
| Recents are per-device, not per-account | `REDUCIBLE` (V2) | Account-synced recents; blocked only by not wanting to sync private data by default |
| No filters until results exist | `ACCEPTED` | Filtering before a result set is a hypothesis, not a search |
| Zero results ending the conversation | `DEFECT` | EP-2.9, Design Principles §13 |
| Ranking that promotes margin over relevance | `DEFECT` | EP-0.5. Search is a promise to answer the customer's question, not ours |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Zero-result queries surfaced to ADM-18 as a stocking backlog | MVP | Nearly free; directly grows the catalogue the neighbourhood actually wants |
| Synonym dictionary maintained by shop staff, not developers | V2 | The staff know the local word. ADM-05 should let them add it |
| SRC-04 voice search in Hindi | Future | Removes typing entirely for elderly customers (EP-2.3) |
| SRC-05 barcode scan | Future | Turns a physical pantry into a basket (EP-5.2) |
| Personalized ranking from purchase history | Future | Only with explainability; ranking must never become invisible persuasion (EP-0.5) |

---

## 3.14 FLW-10 — Wishlist

**Carries:** EP-2.6, EP-5.1, EP-5.6 · **Arc stage:** Browsing → Repeat Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Not now — but don't make me find it again."
*Product's goal:* Hold an intention safely across days and devices, and honour it when it becomes an order.

### Trigger

A wishlist tap on any product card or SHP-02; an item wanted but out of stock; a basket over budget this week; planning ahead for a festival.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | SHP-02 / any card | Wishlist tapped. Works for guests — stored locally, no login demanded. | EP-2.1 |
| 2 | SHP-03 | The list: current price, current stock, and any change since it was saved. | EP-2.2, EP-5.6 |
| 3 | SHP-03 → SHP-04 | Move to cart, individually or several at once. | EP-2.7 |
| 4 | — | On identification, the guest list merges into the account list and the merge is shown. | FLW-02/D4 |
| 5 | ACC-08 | Notify-me on a wishlisted out-of-stock item fires when it returns — once, not repeatedly. | EP-5.4 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Guest or identified? | Guest → local, works fully, warned honestly that it lives on this device · Identified → synced | A wishlist behind a login wall is a login wall wearing a heart icon (EP-2.1) |
| D2 | Price changed since saving? | Show old → new on the item | The wishlist is a memory. Editing the memory silently is EP-5.6's exact prohibition |
| D3 | Item now out of stock? | Keep it, mark it, offer notify-me | Removing it deletes the customer's intention (EP-2.2) |
| D4 | Item discontinued? | Say so, suggest the nearest real alternative, let the customer remove it | We do not tidy up the customer's list for them |
| D5 | Notify-me fires — how often? | Once per restock, per item, through the customer's chosen channel | EP-5.4: useful, not pursuing |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Guest wishlist on a device that gets cleared | Data is lost. Stated honestly at D1 — never claimed to be safe when it isn't (EP-0.5) |
| E2 | Guest and account lists both exist at login | Union, shown. Never overwrite one with the other |
| E3 | Wishlist grows to hundreds of items | Still usable — search and category filter within the list. A wishlist that becomes unusable is a wishlist that gets abandoned |
| E4 | Wishlisted item's price *dropped* | Say so as a gain, in green. This is the one nudge that is pure service (Bargad §06, EP-5.5) |
| E5 | Wishlist shared on a family device | It is a household list in practice. Do not design against reality; do not expose it beyond the device/session |
| E6 | Adding to wishlist while offline | Queue locally, sync later; never lose the tap (EP-0.4) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Guest wishlists are device-bound | `ACCEPTED` | The alternative is a login wall (EP-2.1). Honesty about the limit is the mitigation |
| Wishlist is a second place to look, competing with the cart | `ACCEPTED` | They are different intentions: "buying now" vs "wanting later". Collapsing them loses the second |
| Moving to cart is per-item by default | `REDUCIBLE` (MVP fix) | Multi-select move is cheap and obviously right for grocery |
| Wishlist is not visible on the homepage | `REDUCIBLE` (V2) | A "waiting for you" shelf for identified customers |
| Using the wishlist as a marketing trigger list | `DEFECT` | It is the customer's private intention, not a lead list (EP-5.4, EP-6.2) |
| "Only 2 left — your wishlisted item is running out!" | `DEFECT` | Fake urgency around a saved item is the purest form of the pattern we refuse (EP-0.5, EP-2.5) |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Move all in-stock items to cart in one action | MVP | Grocery wishlists are lists, not single objects |
| Price-drop notification, once, stated as a gain | V2 | Service that happens to sell (EP-5.5) |
| Wishlist → Monthly Grocery list promotion (DIS-05) | V2 | The bridge from intention to rhythm (EP-5.3) |
| Festival wishlist ("saving for Diwali") | Future | Only via SEE (ADM-14); must not touch navigation (EP-2.8) |

---

## 3.15 FLW-11 — Reorder

**Carries:** EP-5.1, EP-5.2, EP-5.6, EP-4.6 · **Arc stage:** Repeat Purchase
**Release:** MVP

### Goal

*Customer's goal:* "Same as last month. Don't make me build it again."
*Product's goal:* Be the shortest path in the entire product — and never repeat the basket dishonestly.

### Trigger

ORD-01 or ORD-02 reorder action; ACC-04's primary shortcut; DIS-05 Monthly Grocery; an ACC-08 reminder at the household's own rhythm.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | ORD-01 / ORD-02 / ACC-04 | Reorder tapped on a previous order. | EP-5.2 |
| 2 | ORD-04 | The previous basket is rebuilt with today's reality: current prices, current stock, changes disclosed line by line. | EP-5.6, EP-4.6 |
| 3 | ORD-04 | Customer adjusts: quantities, removals, substitutions of their own choosing. | EP-2.7, EP-0.6 |
| 4 | SHP-04 | Cart, with the ₹500 rule and the oils/loose-sugar exception recomputed openly. | EP-3.1 |
| 5 | → FLW-04 | Logged-in checkout, with the saved address and preferred slot already known. | EP-5.1 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is every item still available? | Yes → straight to SHP-04 · No → ORD-04 lists exactly what is missing and why | The whole flow's value is speed; the whole flow's integrity is disclosure. Both, or neither |
| D2 | Have prices changed? | Show old → new per line, with the basket delta in rupees | A silently more expensive "same as last time" is the fastest way to make repeat customers check us (EP-5.6) |
| D3 | Item discontinued? | Offer the nearest real alternative — the customer accepts it or not | Substitution is a conversation (EP-4.6). Auto-substitution is not permitted, even for convenience |
| D4 | Reorder placed straight to checkout, or via the cart? | Always via a reviewable cart | A one-tap order that skips review is an irreversible step, which EP-0.6 forbids |
| D5 | Which order should ACC-04 offer to repeat? | The most recent completed order, and the monthly-grocery pattern if one exists (DIS-05) | Offering, not choosing |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Half the previous basket is unavailable | Still worth doing — rebuild what exists, name what doesn't, offer alternatives. Never abandon the flow (EP-2.9) |
| E2 | The previous order was cancelled or failed | Reorder is still offered; the previous failure is acknowledged, not hidden (EP-0.2) |
| E3 | Pack size changed (1 kg → 900 g) | Treated as a change and disclosed. Grocery households notice this before we do; pretending otherwise costs everything |
| E4 | Reorder built from an order placed as a guest, now identified | Works — the order attached at FLW-05/D2 |
| E5 | Reorder brings the basket below ₹500 after removals | Stated in SHP-04 with the shortfall in rupees and a route to fix it, never at CHK-05 (Founder Brief §9) |
| E6 | Reordering a festival basket out of season | Allowed. Seasonal items honestly marked as unavailable if they are (EP-2.8) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| ORD-04 review screen exists at all | `ACCEPTED` | It is where D1–D3 are honoured. Deleting it makes the flow one tap faster and dishonest |
| Change disclosure lengthens the fastest flow in the product | `ACCEPTED` | The disclosure *is* the relationship. A repeat customer is the one who will notice — and the one we cannot afford to lose |
| Reorder only works from a full previous order, not a partial list | `REDUCIBLE` (V2) | DIS-05 saved lists are the cure |
| Reorder is per-order, not per-habit | `REDUCIBLE` (Future) | Standing/subscription orders; only honest once slots are reliably kept |
| Auto-substituting an unavailable item to keep the basket "complete" | `DEFECT` | EP-4.6, absolutely |
| Placing a reorder with a single tap and no review | `DEFECT` | EP-0.6 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Reorder → single review screen (basket + address + slot + total) | V2 | The legitimate way to make this the shortest flow (EP-5.2) without touching EP-3.1 |
| Saved named lists ("Monthly", "Puja") in DIS-05 | V2 | Households already think in lists; the product should too (EP-5.3) |
| Reminder timed to the household's actual cycle | Future | EP-5.4 — needs real history to be service rather than spam |
| "You usually also buy…" on ORD-04 | V2 | Only from the household's own history, and only as a reminder — never as an upsell (EP-0.5) |

---

## 3.16 FLW-12 — Order Tracking

**Carries:** EP-4.1 – EP-4.5, EP-0.8 · **Arc stage:** Delivery
**Release:** MVP

### Goal

*Customer's goal:* "Where is my order? When is it coming?"
*Product's goal:* Make the question unnecessary — and when it is asked, answer it in seconds, with no login, to whoever in the household is asking.

### Trigger

CHK-07; a WhatsApp/SMS status message; a footer "Track Order" tap; ACC-08; the customer simply wondering.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | CHK-07 | The wait is prepared: the slot is restated, the next update is promised, and tracking is one tap away. | EP-0.2, EP-4.1 |
| 2 | — | Status changes are **pushed** — WhatsApp/SMS — as they happen: received → packed → on the way → delivered. | EP-4.1 |
| 3 | ORD-03 | Any household member can open the forwarded link and see the truth with a reference + phone, no login. | EP-4.2 |
| 4 | ORD-02 | An identified customer sees the same truth plus the full order. | — |
| 5 | ORD-02 / ORD-03 | The delivery person is named. WhatsApp and Call are present throughout. | EP-4.5, EP-0.8 |
| 6 | ORD-02 | Delivered. → FLW-14 community invite eligibility, FLW-16 advocacy eligibility, ORD-07 (V2). | EP-6.1, EP-7.1 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Push or pull? | Both — but push is primary | A tracking page that is the *only* source of truth means the customer must remember to worry (EP-4.1) |
| D2 | Identified or not? | ORD-02 (full order) vs ORD-03 (status + slot + contact, no personal data beyond the order) | Status is not private. Order contents and history are (EP-4.2) |
| D3 | Is the order running late? | Announce it *with the cause* before the slot ends — never after the customer notices | A disclosed delay costs one order. A discovered delay costs the relationship (EP-4.3) |
| D4 | Item short-supplied during packing? | Contact the customer and get their word before dispatch | EP-4.6. No silent edits, ever |
| D5 | Delivery attempted, nobody home? | Call first, then a stated retry or a return with the money handled honestly | Never mark "attempted" and vanish |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Rain, flood, blocked road | Warning with the cause in the shopkeeper's voice ("बारिश की वजह से…"), a new expectation, and a human path (Bargad §06, EP-4.3) |
| E2 | Customer never receives the SMS | ORD-03 exists, the reference is on the WhatsApp receipt, and Call/WhatsApp are always present (EP-0.8) |
| E3 | The link is forwarded to a relative in another city | It works — it shows status only. This is why D2 exists |
| E4 | Order marked delivered but the customer says it wasn't | Human path first, immediately. The customer is never argued with by an interface (Design Principles §12) |
| E5 | COD order, cash not ready | Handled at the door by a person, as it always has been. The product does not create a confrontation |
| E6 | Two orders in one day | Both tracked independently; ORD-01/ACC-04 shows the live ones first |
| E7 | Order tracked at 11 pm from a shared phone | Works. No login, no personal data exposed (EP-4.2) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Reference + phone required for ORD-03 | `ACCEPTED` | The minimum that stops an order status from being publicly enumerable. Two knowable facts, no account (EP-4.2) |
| No live map / rider GPS | `ACCEPTED` | We do not compete on delivery theatre (Founder Brief §6, EP-1.7). Four honest dots plus a named person is more trustworthy and always accurate |
| Status granularity depends on staff updating ADM-04 | `REDUCIBLE` (V2) | Real dependency. Cure is making ADM-04 fast enough that updating is easier than not — not a promise of automation |
| Pushed updates depend on SMS/WhatsApp delivery | `REDUCIBLE` (V2) | ORD-03 is the fallback; WhatsApp-first is the fix |
| Silence during the wait | `DEFECT` | The exact failure this flow exists to prevent (EP-4.1) |
| A tracking page behind a login | `DEFECT` | EP-4.2 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| WhatsApp as the primary status channel, SMS as fallback | V2 | Founder Brief §5: this audience lives there |
| "Ramesh is on the way" with a name and a callable number | MVP | The single highest-trust element in the entire arc, and it costs nothing (EP-4.5) |
| Staff one-tap status updates from a phone in ADM-04 | MVP | Push quality is a back-room design problem, not a customer-side one |
| Proactive delay message triggered by slot risk, not by complaints | V2 | Turns EP-4.3 from a policy into a mechanism |
| Live rider GPS | Never (as a promise) | An unkeepable promise is worse than no promise (EP-1.7) |

---

## 3.17 FLW-13 — Order Cancellation

**Carries:** EP-0.5, EP-0.6, EP-4.3 · **Arc stage:** Delivery
**Release:** MVP

### Goal

*Customer's goal:* "I changed my mind, or I made a mistake. Undo it without a fight."
*Product's goal:* Let the customer withdraw with dignity, state the rules before they bind, and keep the relationship intact — a well-handled cancellation is a retention event.

### Trigger

An ordering mistake; a change of plan; a delay; a duplicate order; a household member already bought the same thing.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | ORD-02 / ORD-03 | Cancel is visible, not buried. | EP-0.6 |
| 2 | ORD-05 | The cancellation policy is stated plainly *before* confirming, including refund timing for a paid order. | EP-3.1, EP-1.4 logic |
| 3 | ORD-05 | Confirm. Reason is optional and never a gate. | EP-0.5 |
| 4 | — | Confirmation to the phone. Refund, if any, is initiated with a stated timeline. | EP-3.8, EP-4.3 |
| 5 | ORD-02 / MKT-01 | The customer is left with a route back, not an exit door. | EP-0.6 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | What stage is the order in? | Received → immediate cancel · Packed → cancel with the shop's confirmation · On the way → human path (WhatsApp/Call) · Delivered → returns/refund policy | The rule must be *stated on ORD-05 before the tap*, never discovered after it |
| D2 | Was it paid digitally? | Refund initiated automatically with a stated timeline · COD → nothing to refund | Refund timing is a promise. Only state what we will keep (EP-3.5 logic, EP-1.7) |
| D3 | Is a reason required? | Never | A required reason is a toll on leaving (EP-0.5, EP-6.6 logic) |
| D4 | Can the shop cancel? | Only with a cause given to the customer and a human contact, never a silent status flip | Our cancellation is a broken promise; it must be handled as one (EP-4.3) |
| D5 | Partial cancellation (one item)? | Human path in MVP; structured later | Better an honest "talk to us" than a half-built self-service that mangles the money |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Cancelled after packing | Allowed with the shop's confirmation. The shop absorbs small costs to keep a neighbour — Founder Brief §8: relationships before transactions |
| E2 | Cancelled while the rider is at the door | Human. No interface should mediate this (EP-0.8) |
| E3 | Digital refund delayed by the provider | Say so, with the cause and a new expectation. Never silence (EP-4.3) |
| E4 | Loyalty points were used on the order | Returned to the balance, visibly, and stated on ORD-05 before confirming (EP-5.5) |
| E5 | A coupon was used | Restored where the coupon's own terms allow; the terms are stated *before* cancelling, never after (EP-3.1) |
| E6 | Repeated cancellations from one customer | A shopkeeper's conversation, not an automated penalty. No silent blocking (EP-0.1) |
| E7 | Customer cancels because of *our* delay | The apology is ours, and the refund is unconditional. Never a policy quotation (Design Principles §12) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| A confirmation step before cancelling | `ACCEPTED` | It is the last chance to state the refund terms honestly. One step, not three |
| Cancellation after packing needs the shop's confirmation | `ACCEPTED` | Real goods were really packed. The friction is truthful, and the answer should almost always be yes |
| Refund timing depends on a payment provider | `ACCEPTED` | Stated honestly, never promised away |
| No self-service partial cancellation | `REDUCIBLE` (V2) | Human path is honest in MVP; automate once the money model is proven |
| Any retention offer during cancellation ("wait, here's 10% off") | `DEFECT` | Guilt/pressure copy is forbidden (EP-0.5, Bargad §17) |
| A required cancellation reason | `DEFECT` | A toll on leaving (EP-0.5) |
| Cancel hidden inside Help | `DEFECT` | EP-0.6 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| Refund status visible on ORD-02 without asking | MVP | EP-4.1 applied to money — the highest-anxiety object in the arc |
| A short "undo" window immediately after CHK-07 | V2 | Catches the honest mis-tap before any cost is incurred by anyone |
| Cancellation reasons (optional) surfaced to ADM-18 | V2 | Free diagnosis of where the arc is actually breaking |
| Self-service partial cancellation before packing | V2 | The most common real request after "cancel everything" |

---

## 3.18 FLW-14 — Loyalty Enrollment

**Carries:** EP-5.5, EP-6.1, EP-6.2 · **Arc stage:** Repeat Purchase → Community
**Release:** MVP

### Goal

*Customer's goal:* "Am I getting anything for shopping here regularly?"
*Product's goal:* Make loyalty a discovered fact rather than a signup — the balance already exists, in rupees, earned by orders they already placed.

### Architectural position

Founder Brief §11 commits to earning loyalty rewards; nothing in Documents 01–05 requires an enrollment *step*. Under EP-6.1 (invite after value) and EP-5.5 (arithmetic the customer can do in their head), the strongest available model is:

> **Points accrue to the phone number from the first order — including guest orders — and are claimed, not joined.** Identification (FLW-05/FLW-06) reveals a balance that already exists.

This makes "enrollment" a moment of recognition rather than a form. It is recorded as a **recommendation requiring the founder's confirmation** (see §3.22, Q1), not as a reinterpretation of the approved documents.

### Trigger

CHK-07 stating points earned on this order; ACC-04/LOY-01; SHP-04 showing an available balance; a WhatsApp message after delivery.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | CHK-07 | "आपने ₹12 कमाए" — earned on *this* order, stated in rupees, no signup asked. | EP-5.5, EP-6.1 |
| 2 | ORD-02 (delivered) / ACC-08 | After the promise is kept, the balance is mentioned once, with a plain explanation. | EP-6.1, EP-6.2 |
| 3 | FLW-06 / FLW-05 | The customer identifies — for their own reasons — and the accrued balance attaches and is *shown*. | FLW-05/D2 |
| 4 | LOY-01 | Balance in rupees, how it grows, what it can become. Nothing requires interpretation. | EP-5.5 |
| 5 | SHP-04 / CHK-04 | Redemption happens in the cart, visible before payment. | EP-3.1 |
| 6 | LOY-02 | Every point traces to an order. The customer can audit us. | Product Strategy §5 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is enrollment a step or a consequence? | **Consequence** (recommended) — accrual by phone number, claimed on identification | An enrollment form before value is an ask before value (EP-6.1). Pending founder confirmation (§3.22 Q1) |
| D2 | Do guest orders earn? | Yes — against the phone number used for delivery | Otherwise loyalty is a hidden penalty for guests, which breaks EP-3.2 |
| D3 | Is loyalty the same object as membership (ACC-10)? | Open — Part 1 §2.16 Q4 | Must be settled before ADM-11/ADM-12 are built |
| D4 | Do points expire? | If yes, it is stated at LOY-01 and warned *before* expiry, by the customer's chosen channel | Silent expiry is a broken promise discovered alone — the worst kind (EP-5.5) |
| D5 | Is enrollment consent for marketing? | **No.** Loyalty and community (FLW-15/MKT-03) are separate consents | Bundling them makes the balance a Trojan horse (EP-6.2) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Guest orders on one number, then registers with the same number | All accrued points attach and are shown at the moment of registering (FLW-05, and the flow's best moment) |
| E2 | Household uses two numbers | Two balances. Merging is a staff-verified action (ADM-12), never automatic — it moves money-like value |
| E3 | Order cancelled after points were earned | Points reverse, visibly, with the reason on the ledger (FLW-13/E4) |
| E4 | Points earned on an order that was refunded | Same as E3. The ledger tells the truth or it is worthless |
| E5 | Balance too small to redeem | Say the threshold plainly at LOY-01. Never show a balance whose uselessness is a surprise |
| E6 | Rules change | Existing balances honoured under the old rules; changes announced before they apply (EP-5.6 logic) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| The customer must identify to *use* points | `ACCEPTED` | A balance is money-like; spending it requires knowing who is spending. Earning does not (D2) |
| A redemption threshold exists | `ACCEPTED` if stated up front | Thresholds are normal; *undisclosed* thresholds are a trick (EP-5.5) |
| Points are a second currency to understand | `ACCEPTED` only because they are stated in rupees | The moment a customer must convert in their head, this flow has failed Design Principles §3 |
| Loyalty is invisible until CHK-07 | `REDUCIBLE` (V2) | A quiet, honest earn indicator in SHP-04 |
| An enrollment form before the first order | `DEFECT` | EP-6.1 |
| Auto-applying points at checkout | `DEFECT` | Spending someone's balance for them (EP-5.5, EP-0.5) |
| Bundling loyalty enrollment with WhatsApp marketing consent | `DEFECT` | EP-6.2 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| "You already have ₹40" shown at the exact moment of identifying | MVP | The single most persuasive honest sentence available to us (FLW-05/D2) |
| Points shown in rupees everywhere, points-as-units nowhere | MVP | EP-5.5, at essentially zero cost |
| Expiry warning well before expiry, in the customer's channel | MVP if expiry exists | A silent expiry would undo more trust than the entire scheme creates |
| Festival bonus earn rates via ADM-12 + ADM-14 | Future | Seasonal generosity that touches no navigation (EP-2.8) |

---

## 3.19 FLW-15 — Festival Shopping

**Carries:** EP-0.7, EP-2.8, EP-6.4 · **Arc stage:** Browsing → Community
**Release:** MVP (as a curated collection) · Automated via SEE: Future

### Goal

*Customer's goal:* "Get everything for Chhath without forgetting anything."
*Product's goal:* Be prepared for the festival the way the shop already is — a complete shopping experience, not a banner (Product Strategy §6) — while remaining unmistakably MG Supermart.

### Trigger

The Bihar calendar (Bargad §25); a WhatsApp community greeting; a homepage collection; a neighbour's forward; the customer's own planning, weeks ahead.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | MKT-01 | The festival is present as a greeting and a collection entry — inside the same courtyard. Navigation and category names are untouched. | EP-2.8, Bargad §25 |
| 2 | DIS-02 | The collection: puja essentials, gift ideas, a shopping guide — organized the way the festival is actually shopped. | Founder Brief §13 |
| 3 | DIS-02 / SHP-02 | Products added; the card, the button and the semantics are identical to any other day. | EP-2.8 |
| 4 | SHP-04 → FLW-03/FLW-04 | Checkout is unchanged. Festival pressure never touches money or machinery. | EP-0.5, Bargad §25 |
| 5 | MKT-03 / WhatsApp | The greeting is given with no call to action attached. | EP-6.4 |
| 6 | — | Auto-revert on the scheduled date. No forgotten Diwali banner in January. | Bargad §25 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is a campaign active? | Yes → themed slots only · No → the resting state, which must feel complete on an ordinary Tuesday | EP-0.7. A shop that only feels good during Diwali is a campaign |
| D2 | What may a theme change? | Only the themeable slots: festival accent, surface, hero art, greeting, one collection section, badges, motifs | Bargad §25 is a closed list. Buttons, navigation and semantic colors are untouchable |
| D3 | Ordering ahead for a festival date? | Slot availability is stated honestly; festival-week capacity is a real constraint and must never be over-promised | EP-3.5, EP-1.7 |
| D4 | Item runs out mid-festival | Say so, offer notify-me and an alternative. Festivals do not license fake scarcity — they make it more tempting and more damaging | EP-2.5 |
| D5 | Greeting or offer? | A greeting is a greeting. An offer is an offer. They do not travel together | EP-6.4 — otherwise every future greeting reads as an ad |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | Customer does not celebrate this festival | The collection is useful as a shelf regardless; nothing assumes the customer's religion or participation (Design Principles §11) |
| E2 | Festival demand exceeds delivery capacity | Reduce the slots offered, honestly. Never sell a slot that will be missed (EP-3.5) — a broken Chhath delivery is remembered for years |
| E3 | The campaign is not deactivated on time | Auto-revert dates are mandatory, not manual discipline (Bargad §25, ADM-14) |
| E4 | Two festivals overlap | One accent + one surface per theme; two festival hues maximum on a screen (Bargad §25) |
| E5 | SEE is not built yet (MVP reality) | DIS-02 is a hand-curated collection managed via ADM-15/ADM-16 and behaves identically to the customer. SEE automates the shop's work, not the customer's experience |
| E6 | Festival prices rise (real market movement) | Stated plainly. Transparent pricing does not take festivals off (Product Strategy §5) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Festival planning happens weeks ahead; slots do not exist that far out | `ACCEPTED` | We will not promise a slot we cannot keep (EP-3.5). The wishlist (FLW-10) is the honest holding place |
| Manual curation of DIS-02 in MVP | `ACCEPTED` | Founder Brief §20 explicitly places SEE outside MVP. Manual is honest and shippable |
| Festival collections compete with normal shelves | `ACCEPTED` | ≤10% of pixels; one collection section (Bargad §25). The constraint is the design |
| No festival reminders in MVP | `REDUCIBLE` (V2) | Once ADM-19 frequency caps exist. Founder Brief §18 governs |
| Countdown timers, "festival stock running out", pressure copy | `DEFECT` | EP-2.5, EP-0.5. Most tempting here; most destructive here |
| Recoloring the logo, buttons or navigation for a festival | `DEFECT` | Bargad §02, §25 |
| A greeting with a coupon stapled to it | `DEFECT` | EP-6.4 |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| A festival shopping guide/checklist ("everything for Chhath") as content, not merchandising | MVP | This is what the shop already does across the counter — pure service, and the strongest possible differentiator |
| Festival-week slot capacity planned and published in advance (ADM-20) | MVP | The one operational failure customers will not forgive |
| Wishlist → festival basket (FLW-10) | V2 | Honest way to serve planning without promising slots |
| SEE (ADM-14) with themes, scheduling and auto-revert | Future | Founder Brief §20. Architecture ready now, implementation later |
| Community greeting with no CTA, sent via WhatsApp | MVP | EP-6.4; the cheapest, warmest thing in the entire document |

---

## 3.20 FLW-16 — Referral

**Carries:** EP-7.1 – EP-7.5 · **Arc stage:** Advocacy
**Release:** Future (Product Strategy §10) — designed now so it cannot be built badly later

### Goal

*Customer's goal:* "This was good. My sister should use it."
*Product's goal:* Make an already-formed recommendation one tap — and never manufacture one.

### Trigger

A delivered order that went well (ORD-02, post-delivery); LOY-05; a customer already telling people, offline.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | ORD-02 (delivered) / LOY-05 | The share is offered *after* a kept promise, once. | EP-7.1 |
| 2 | LOY-05 | The reward is stated plainly for both sides, before sharing. | EP-7.3, EP-0.5 |
| 3 | LOY-05 → WhatsApp | One tap. The message is a sentence a human would actually send, editable, in the customer's language. | EP-7.2 |
| 4 | — | The friend arrives as a New Visitor (FLW-01) with a normal, ungated experience. | EP-1.3 |
| 5 | LOY-05 | The referrer sees the status honestly; the reward pays when it was said it would. | EP-7.3 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Has this customer earned the right to be asked? | ≥1 successfully delivered order → offer once · Otherwise → never | Asking before earning is noise that travels as an opinion about our character (EP-7.1) |
| D2 | Are contacts accessed? | **Never.** The customer chooses the recipient inside WhatsApp | Contact access would be the largest EP-0.5 violation available to us |
| D3 | Does the referred friend land in a special flow? | No — FLW-01, unchanged, no gate | A referral landing page that demands a signup before showing the shop breaks EP-1.3 and wastes the referrer's credibility |
| D4 | When does the reward pay? | On the friend's first *delivered* order — stated up front | Paying on signup incentivizes fake accounts, and the referrer's own credibility is what would be spent |
| D5 | Is the referrer told who joined? | Only what the friend would expect them to know | The friend is a customer, not a lead |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | The friend already has an account | No reward; said plainly, no accusation. Nobody is a fraudster for having shopped here (Design Principles §12) |
| E2 | The friend is outside the 5 km radius | The link still works; FLW-01/E2 handles it kindly. No reward, honestly explained |
| E3 | The friend's first order is cancelled | Reward follows the stated rule; the rule was visible before sharing (D4) |
| E4 | Referral used to farm rewards | Handled by a person, with the account's history in ADM-10. Never an automated accusation |
| E5 | Referrer shares to a group | Allowed. It is how WhatsApp works here. Rewards follow D4 regardless |
| E6 | The referred friend has a bad first delivery | The referrer's credibility is the real cost. This is why EP-7.5 exists: fix delivery, never raise the reward |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| Only offered after a delivered order | `ACCEPTED` | The gate *is* the design (EP-7.1) |
| Reward pays only on the friend's delivered order | `ACCEPTED` | Aligns the reward with the thing being recommended, not with a signup |
| No contact access, so sharing takes the customer's own choice | `ACCEPTED` | EP-7.3, non-negotiable |
| Referral does not exist in MVP | `ACCEPTED` | Product Strategy §10. Word of mouth in a 5 km town does not require a feature — it requires kept promises (EP-7.5) |
| Contact-list scraping | `DEFECT` | EP-7.3 |
| Repeated referral prompts | `DEFECT` | EP-7.1: once |
| Referral rewards raised to compensate for weak retention | `DEFECT` | EP-7.5. Advocacy is a symptom; treating it as a lever inverts the product |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| A plain WhatsApp share of the shop/product with no reward at all | V2 | Advocacy without a mechanic; the honest first version (EP-7.2) |
| Referral rewards in loyalty rupees for both sides | Future | Legible arithmetic (EP-5.5), and it keeps value inside the shop |
| Message drafted in the customer's language, fully editable | Future | Nobody forwards an advertisement to their sister (EP-7.2) |
| Referral leaderboards, tiers, gamification | Never | Product Strategy §12; turns neighbours into a sales channel |

---

## 3.21 FLW-17 — Wholesale Inquiry

**Carries:** EP-0.1, EP-0.6, EP-0.8 · **Arc stage:** Outside the retail arc
**Release:** MVP

### Goal

*Customer's goal:* "I run a shop. Can I buy from you in bulk, and at what terms?"
*Product's goal:* Start a human relationship with enough context to continue it — without publishing a single wholesale price.

### Trigger

A footer link; word of mouth from another business owner; a conversation at the counter; a direct link shared by the shop.

### Steps

| # | Screen | What happens | Carries |
|---|---|---|---|
| 1 | WHL-01 | What wholesale here means and who it is for. No prices, no retail navigation, no cart. | Founder Brief §12, IA §12 |
| 2 | WHL-02 | Business information — only what a human needs to begin. | EP-0.1 |
| 3 | WHL-03 | Acknowledged, with a named next step and an honest timeframe. | EP-4.3 logic |
| 4 | ADM-22 | A staff member owns it by name, verifies, and contacts. | EP-0.1, ADM-21 |
| 5 | WHL-04 | The applicant can check status without chasing anyone; it mirrors ADM-22 truthfully. | EP-4.1 logic |
| 6 | WHL-05 | Relationship pricing is agreed with a person, not a screen. | Founder Brief §12 |

### Decision Points

| ID | Question | Branches | Rule |
|---|---|---|---|
| D1 | Is any price ever shown? | **No** | Founder Brief §12: wholesale prices are never public. Not on WHL-01, not "indicative", not "starting from" |
| D2 | Can a wholesale customer enter the retail flow? | No — the doors are separate | IA §12 is absolute. Not a UX preference: mixing them corrupts both pricing models |
| D3 | Form or conversation? | Both offered; the form is never mandatory | A business owner who prefers to call is a *better* lead, not a worse one (EP-0.8) |
| D4 | Verification standard? | Owned by a named staff member in ADM-22, with an audit trail | Relationship pricing without verification is a pricing leak |
| D5 | Request declined? | A human says so, with a reason, and the door stays open | This person is a neighbour and probably also a retail customer (EP-0.1) |

### Edge Cases

| ID | Case | Required behaviour |
|---|---|---|
| E1 | A retail customer lands on WHL-01 out of curiosity | Nothing is hidden or embarrassing; there is simply nothing to buy here. A clear route back to the shop (EP-0.6) |
| E2 | The applicant is also a retail customer | Both relationships coexist; ADM-10 shows both. They are never merged into one price |
| E3 | Nobody responds to the request | Structurally prevented: ADM-22 assigns a named owner, and WHL-04 shows the truth. A silent queue is the failure this flow exists to prevent |
| E4 | The applicant expects a price on the website | WHL-01 states plainly that pricing is a conversation. Expectation set at the door, not after the form (EP-3.1 logic) |
| E5 | Business is outside the service area | A human decision, not a radius rule. Wholesale logistics are not retail logistics (Founder Brief §9 applies to retail delivery) |
| E6 | Request submitted at 11 pm | WHL-03 states a real, working-hours timeframe. Never "we'll respond immediately" (EP-1.7) |

### Friction Points

| Friction | Class | Verdict |
|---|---|---|
| No prices anywhere | `ACCEPTED` | Founder Brief §12 is a business rule, not a UX choice. It is also the model: relationship pricing cannot be published |
| A human must respond before anything progresses | `ACCEPTED` | It *is* the product (Founder Brief §12). Wholesale here is a relationship, and relationships have people in them |
| The form asks for business details before any value is shown | `ACCEPTED` | Symmetric: a wholesale relationship requires disclosure from both sides. The alternative — publishing prices — is forbidden |
| Verification timeframe measured in days, not minutes | `ACCEPTED` if stated | Honesty about pace is itself a signal of a serious counterparty |
| No self-service wholesale ordering | `REDUCIBLE` (Future) | Only after relationships exist and prices are agreed. Vendor Portal is already Future-scoped |
| Wholesale entries appearing in retail navigation | `DEFECT` | IA §12, Bargad §21 — a quiet door |
| An auto-reply pretending to be a person | `DEFECT` | EP-0.1. One shop, one voice — and that voice belongs to a real person |

### Optimization Opportunities

| Opportunity | Release | Why |
|---|---|---|
| WhatsApp as the primary wholesale channel, the form as the alternative | MVP | Business owners here already run their businesses on WhatsApp (EP-0.8) |
| ADM-22 assigns a named owner and an SLA on submission | MVP | Structurally prevents E3, the only failure that matters in this flow |
| A downloadable capability/category sheet — categories and pack sizes, no prices | V2 | Gives a serious inquirer something real without breaking D1 |
| Wholesale order history and repeat ordering after verification | Future | Vendor Portal (Founder Brief §4); a separate arc, designed separately |

---

## 3.22 Open questions carried into Part 3

Recorded so they are decided deliberately rather than settled by accident in a design file:

| # | Question | Blocks | Recommendation |
|---|---|---|---|
| Q1 | Is loyalty **enrolled** or **accrued by phone number and claimed** (FLW-14/D1)? | LOY-01, ADM-12, FLW-05 | Accrued and claimed — it is the only model consistent with EP-6.1 and EP-3.2. Requires the founder's confirmation |
| Q2 | Do **guest orders earn** loyalty (FLW-14/D2)? | ADM-12, FLW-03 | Yes. Otherwise loyalty is a hidden penalty on the guest path (EP-3.2) |
| Q3 | Do points **expire**, and on what terms (FLW-14/D4)? | LOY-01, ADM-12 | If yes, warn well before, in the customer's channel. Silent expiry is prohibited by EP-5.5 |
| Q4 | Is a **household one account** (one phone) or many (FLW-05/E2, FLW-07/E3)? | ACC-*, ADM-09, ADM-10 | One number = one household account, with a clean identity switch. Matches reality here |
| Q5 | Is **WhatsApp OTP** in V2 or MVP (FLW-06, FLW-07)? | Auth infrastructure | It is the root cure for the most common failure in the product. Strong candidate for MVP |
| Q6 | **Cancellation window** by order stage, and refund SLA (FLW-13/D1, D2)? | ORD-05, ADM-20, MKT-06 | Founder decision; must be stated on ORD-05 *before* the tap, per EP-3.1 |
| Q7 | **Festival-week slot capacity** policy (FLW-15/E2)? | ADM-20, CHK-03 | Plan and publish in advance. A missed Chhath delivery is remembered for years |
| Q8 | Does **ORD-03** need rate limiting, and at what threshold (FLW-12/D2)? | ORD-03 | Yes — rate-limit the lookup, never the customer's access to a human (EP-0.8) |

---

# 4. Navigation Architecture

## 4.1 The gap this section fills

Three documents already touch navigation, and none of them decides its behaviour:

| Document | What it already settled | What it deliberately left open |
|---|---|---|
| 04 — Information Architecture §3, §4, §15, §16 | **What** is in the navigation, the site map, the footer groups, and the three questions navigation must always answer | How it behaves across breakpoints, what happens on a deep link, what "back" means, how depth is enforced |
| 05 — Bargad §21 | **What it looks like and how it feels**: bottom bar, labels on every icon, the अ/A toggle, cart always visible, the floating community bridge, breadcrumbs on inner pages | Which screens get which tier, how parity is guaranteed, what the rules are when two navigations compete |
| 06 — Part 1 §2, Part 2 §3 | **What the screens and flows are** | How a customer moves between them when they did not follow the flow |

This section is that middle layer: **the law of movement**. IA says what exists, Bargad says what it looks like, Part 3 says how it behaves and what may never happen.

It designs for the customer who did not read the flow — who arrived on a product page from a WhatsApp forward, on a tracking page at 11 pm, on a 404 from a stale Google result. Flows describe the intended path. Navigation is what carries someone who is not on it.

## 4.2 The acceptance test

IA §16 fixes the test, and it is not a metaphor. Every screen, at every breakpoint, in both languages, must answer:

| Question | Answered by | Failure looks like |
|---|---|---|
| **Where am I?** | Identity (header/logo), context (breadcrumb or back with a label), and the active tier indicator | The customer cannot tell a category from a collection from a search result |
| **Where can I go next?** | Primary tier (always visible), contextual navigation (earned, relevant) | A leaf screen with no onward move except back |
| **How do I return?** | Back, breadcrumb, bottom bar, logo — at least two of the four on every screen | A dead end, a browser-back trap, a lost basket |

A screen that fails any one of these does not ship, regardless of how it looks.

## 4.3 Navigation Hierarchy

Six tiers. Every navigational element in the product belongs to exactly one. A tier is not a visual weight — it is a **promise about persistence**.

| Tier | Name | Promise | Contents | Persistence |
|---|---|---|---|---|
| **T0** | Global Utility | Always reachable, on every screen, in every state | Identity/logo, Search, Language (अ/A), Cart, Account, WhatsApp, Call | Never absent. Never behind a menu. Never hidden on scroll |
| **T1** | Primary Destinations | The shop's main rooms | Desktop: Home, Shop, Categories, Offers, Membership, About, Contact (IA §3) · Mobile: Home, Categories, Search, Cart, Account (IA §3) | Always one tap from any screen |
| **T2** | Category System | The aisle map | CAT-01 → CAT-02 → CAT-03; brands (CAT-04, CAT-05) | Reachable from T1 in one tap; stable across seasons (EP-2.8) |
| **T3** | Contextual | Earned, screen-specific onward moves | Breadcrumbs, related products, reorder, track, notify-me, "ask the shop" | Present only where relevant and truthful |
| **T4** | Directory | The complete map for those who want it | Footer (IA §15): About, Customer, Policies, Community, Contact | End of every page; never the *only* route to anything a customer needs mid-task |
| **T5** | Quiet Doors | Deliberately outside the retail arc | Wholesale (WHL-01, via footer only), Admin (ADM-01, direct URL only) | Never in retail navigation (IA §12, Bargad §21) |

**Tier law (`NAV-R1`).** A destination may not appear in two tiers with different labels, and may not move between tiers by campaign, personalization or A/B test. The tier a thing lives in is a promise; changing it silently breaks the customer's learned map (EP-2.8).

## 4.4 Desktop Navigation

Desktop is the same shop with a wider counter (Bargad §23). It gains room, never capability.

### Structure

| Row | Contents | Behaviour |
|---|---|---|
| Announcement bar | One line, one fact | No carousel, no rotation, no dismissal-required state (Bargad §21) |
| Primary bar | Identity · Search · अ/A · Wishlist · Account · Cart | Search is present here, not an icon that expands (EP-2.3) |
| Category row | Home · Shop · Categories · Offers · Membership · About · Contact (IA §3) | Categories opens a mega-menu **on hover** and a full page **on tap** (Bargad §21) |
| Breadcrumb | On every inner page | See §4.9 |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R2` | The mega-menu is an accelerator, never a requirement. Everything in it is reachable by tapping Categories → CAT-01. | Hover is an enhancement only (Bargad §23). A customer on a touch laptop, or using a keyboard, must lose nothing |
| `NAV-R3` | Nothing is revealed exclusively on hover — no hover-only links, prices, actions or truth. | Bargad §23. Hover does not exist for ~90% of our customers; a hover-only affordance is a desktop feature that violates parity |
| `NAV-R4` | The desktop category row order matches IA §3 exactly and does not reorder by traffic, season or personalization. | Navigation is a learned map. Reordering it optimizes a click and costs the map (EP-2.8) |
| `NAV-R5` | Content is capped at 1200 px; navigation does not run edge-to-edge. | Bargad §09: edge-to-edge reads as "platform", and we are deliberately not one |
| `NAV-R6` | The mega-menu closes on Escape, on outside click, and on scroll. It never traps focus. | EP-0.6, Bargad §22: a keyboard path through every flow |

### Desktop → Mobile parity map

Bargad §23 is absolute: *nothing exists on desktop that a mobile customer cannot do.* Since the mobile bottom bar carries five destinations and the desktop row carries seven, parity must be **named**, not assumed.

| Desktop T1 destination | Mobile route | Taps from mobile home |
|---|---|---|
| Home | Bottom bar → Home | 1 |
| Shop (SHP-01) | Bottom bar → Categories (CAT-01), which carries the collection entries · Footer → Shop | 1 |
| Categories (CAT-01) | Bottom bar → Categories | 1 |
| Offers (DIS-01) | Homepage "Today's Offers" section · CAT-01 collections strip | 1–2 |
| Membership (MKT-05) | Bottom bar → Account → Membership (ACC-10 ⇄ MKT-05) · Footer | 2 |
| About (MKT-02) | Footer · Homepage "Why MG Supermart" | 1–2 |
| Contact (MKT-04) | T0 floating Call/WhatsApp (0 taps) · Footer · Homepage "Visit our store" | 0–1 |
| Wishlist (SHP-03) | Bottom bar → Account → Wishlist · The wishlist affordance on every product card | 2 |

**Resolution of Part 1 §2.16 Q1.** On mobile, the Categories tab resolves to **CAT-01**, and CAT-01 carries a collections strip (Offers, Best Sellers, New Arrivals, the active Festival collection) above the aisle map. **SHP-01 becomes the desktop-primary entrance** and remains reachable on mobile via the footer and breadcrumbs.

*Reasoning:* the mobile bottom bar is labelled "Categories" (IA §3), so it must land on categories — a tab whose label and destination disagree is the fastest way to break "where am I". Duplicating a second shop-landing screen in the mobile bar would cost a bottom-bar slot we do not have and add a tap to every product (§4.15). This changes no hierarchy in IA §4: breadcrumbs still read `Home › Shop › Food Grains › Atta`. Recorded for the founder's confirmation (§4.17, Q1).

## 4.5 Mobile Navigation

Mobile is the original, not the compromise (Bargad §09, §23). 90%+ of customers will only ever see this.

### The vertical stack (Bargad §21, fixed)

| # | Element | Tier | Behaviour |
|---|---|---|---|
| 1 | Announcement bar | T0 | One line, one fact, no carousel |
| 2 | Identity row + अ/A | T0 | Language toggle present on **every** screen, including checkout and error screens |
| 3 | Search | T0 | 48 px, the widest thing on screen (Bargad §21) |
| 4 | Delivery strip | T0 (informational) | Area + next real slot. Never decorative; never a fake promise (EP-1.2, EP-3.5) |
| 5 | *(screen content)* | — | — |
| 6 | Floating actions: WhatsApp, Call | T0 | 52 px discs above the bottom bar (Bargad §21) |
| 7 | Bottom bar | T1 | Home · Categories · Search · Cart · Account |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R7` | Back is always top-left on inner pages, and it always carries the name of where it goes. | Bargad §21. An unlabelled arrow answers "how do I return?" with "somewhere" |
| `NAV-R8` | Back never exits to the browser. If the customer arrived by deep link, back goes to the **canonical parent** (product → its subcategory; tracking → home). | The most common real entry here is a forwarded WhatsApp link. Back must be the shop, not the void (EP-0.6) |
| `NAV-R9` | The delivery strip states the next slot the shop will actually keep — never a marketing line, never "fast delivery". | EP-1.2, EP-1.7, EP-3.5. The strip is the answer to the only question a first visitor has |
| `NAV-R10` | The floating Call/WhatsApp discs are suppressed **only** on CHK-02 → CHK-05, where the sticky money action occupies the thumb zone. The human path stays in the header on those screens. | EP-0.8 requires reach, not obstruction. A 56 px money action and a 52 px disc competing for the same thumb is a mis-tap around payment — the most expensive trust failure available (Bargad §18) |
| `NAV-R11` | No hamburger menu anywhere in the customer product. | Five labelled destinations plus a footer is the whole map. A hamburger hides the map behind a symbol a first-time internet user has no reason to understand (Bargad §13: an unlabelled icon is a locked door) |

## 4.6 Bottom Navigation

Five fixed destinations. This is the most consequential navigation decision in the product, because for most customers it *is* the product's navigation.

| Slot | Destination | Screen | Why it earns a slot |
|---|---|---|---|
| 1 | Home | MKT-01 | The way back to zero. Also the identity anchor |
| 2 | Categories | CAT-01 | Door one of two (EP-2.3) — for customers who will not type |
| 3 | Search | SRC-01 | Door two of two — for customers who know what they want |
| 4 | Cart | SHP-04 | The basket must always be visible (IA §16, Bargad §21) |
| 5 | Account | ACC-04 | Identity, orders, loyalty, addresses, membership, wishlist, help |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R12` | The bottom bar **never hides on scroll**. | Bargad §21: saving 64 px is not worth a customer wondering where the shop went. Predictability beats pixels |
| `NAV-R13` | Every item carries its word. No icon-only state, ever, at any size. | Bargad §13, §21: for a first-time user an icon-only bar is five locked doors |
| `NAV-R14` | Active state = filled icon **+** Banyan **+** bold label. Never colour alone. | Bargad §21, §22: meaning never by colour alone — sunlight, cheap panels, colour-blindness |
| `NAV-R15` | The cart badge is Haldi and counts items. It never pulses, animates, or says "expiring". | Bargad §21: cart count is good news, not alarm. EP-0.5: no manufactured urgency |
| `NAV-R16` | The five destinations never change — not by campaign, not by season, not by personalization. A festival never buys a slot. | Bargad §25: the courtyard doesn't change, the rangoli does. Navigation is courtyard |
| `NAV-R17` | Tapping the active tab returns that tab to its root and scrolls to top; it never reloads or loses the cart. | The standard, learned behaviour. It is also the cheapest "how do I return?" answer we have |
| `NAV-R18` | The bottom bar persists during checkout **except** where a sticky full-width money action replaces it (Bargad §18). Leaving checkout remains possible via back at all times. | One primary action per screen at the point of highest anxiety (EP-3.6) — but never a trap (EP-0.6) |

**Wishlist is not in the bottom bar.** IA §3 places it in the desktop utility row, not the mobile bar. It lives at Account → Wishlist plus the affordance on every product card — two taps, and reachable from the exact place the intention forms (FLW-10). Promoting it would cost the Search or Categories slot, and both are load-bearing under EP-2.3.

## 4.7 Global Utility Navigation (T0)

T0 is defined by a single promise: **it is never absent**. Not on error screens, not in checkout, not offline, not during a festival.

| Element | Present on | Behaviour | Rule |
|---|---|---|---|
| Identity / logo | Every screen | Tap → MKT-01. Never recoloured for a festival (Bargad §02) | `NAV-R19`: the logo is the universal escape hatch and must always work |
| Search | Every screen | Tap → SRC-01 (a destination, not an inline expansion) | `NAV-R20`: search is a door, not a widget. It opens with recents already offered (EP-5.1) |
| Language अ/A | **Every** screen — including CHK-*, ORD-03, SUP-04, SUP-05 | One tap. Choice persists across sessions and devices once identified | `NAV-R21`: language is dignity; nobody hunts through Settings to be spoken to properly (Bargad §21, EP-0.3) |
| Cart | Every screen except where a sticky money action supersedes it | Always visible, always counted, never emptied silently | `NAV-R22`: IA §16 — the cart stays visible. EP-2.6 — the basket survives |
| Account | Every screen (mobile bar / desktop utility row) | Never a wall in front of browsing | `NAV-R23`: tapping Account is an offer to be known, never a demand (EP-2.1) |
| WhatsApp / Call | Every screen except CHK-02 → CHK-05 (see `NAV-R10`) | Opens the real channel with context attached where available | `NAV-R24`: talking to a human is a feature, not a failure (Founder Brief §14, EP-0.8) |

**The T0 error test (`NAV-R25`).** On SUP-04 (404), SUP-05 (offline) and SUP-06 (maintenance), T0 must still function: identity, language, cart, and a human. A shop whose door still opens when a page breaks is a shop; one whose utility vanishes is a website.

## 4.8 Footer Navigation (T4)

The footer is the complete map for the customer who wants one. IA §15 fixes its five groups; this section fixes its behaviour.

| Group (IA §15) | Contains | Tier note |
|---|---|---|
| About | Our Story (MKT-02) · Careers (MKT-08, Future) · Blog (MKT-07, Future) | — |
| Customer | Help Center (SUP-01) · Contact (MKT-04) · Track Order (ORD-03) · FAQs (SUP-02) | Track Order here is load-bearing — see `NAV-R27` |
| Policies | Privacy · Terms · Shipping · Cancellation & Refund (MKT-06 ×4) | Also linked in-context (§4.10) |
| Community | Instagram · WhatsApp Community · Google Business Profile · Facebook (MKT-03) | Outbound; opens the real channel |
| Contact | Store address · Phone · Email · Working hours · Google Maps (MKT-04) | The shop as a physical place |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R26` | The footer is identical on every screen and in both languages. It is a map, not merchandising. No offers, no campaigns, no seasonal content, no newsletter capture. | Founder Brief §18: do not overwhelm with offers. A footer that sells is a footer nobody reads, and then the map is gone |
| `NAV-R27` | The footer is never the **only** route to anything needed mid-task. Track Order also lives on CHK-07, ACC-08 and every status message; policies also live in SHP-04 and CHK-04. | A rule reachable only by scrolling to the bottom of a page is a rule we disclosed technically and hid practically (EP-3.1) |
| `NAV-R28` | Wholesale (WHL-01) appears in the footer only. It is never in T1, never in the mega-menu, never in the bottom bar. | IA §12, Bargad §21: a quiet door. Mixing it into retail navigation corrupts both pricing models (FLW-17/D2) |
| `NAV-R29` | Every footer group carries the same five headings in both languages, in the same order. | Bargad §08: switching language changes the words, never the structure |
| `NAV-R30` | On mobile the footer is fully expanded, not collapsed into accordions. | Bargad §22: no swipe-only or tap-to-reveal for the directory of last resort. It is long; length is not a problem, hiding is |

## 4.9 Breadcrumb Strategy

Breadcrumbs are the answer to "where am I", and on desktop they appear on every inner page (Bargad §21). They are also where a deep-linked customer is rescued.

### The canonical path rule (`NAV-R31`)

**A breadcrumb reflects the taxonomy, not the click history.** A customer who reached Atta from a search sees `Home › Shop › Food Grains › Atta`, not `Home › Search › Atta`.

*Reasoning:* a breadcrumb's job is to teach the shop's shape. A history trail teaches the customer about their own last five minutes — which they already know — and teaches them nothing about where dal lives. It also makes the same screen show different breadcrumbs to different people, which destroys the map (EP-2.8).

### Per-screen strategy

| Screen | Desktop breadcrumb | Mobile equivalent |
|---|---|---|
| CAT-02 | `Home › Shop › Food Grains` | Back → CAT-01, labelled |
| CAT-03 | `Home › Shop › Food Grains › Atta` | Back → CAT-02, labelled |
| SHP-02 | `Home › Shop › Food Grains › Atta › Aashirvaad Atta 5 kg` | Back → canonical subcategory, labelled (`NAV-R8`) |
| SRC-02 | *No taxonomy path.* A context line: `Search: "आटा" — 14 results` | Same context line + back → SRC-01 |
| DIS-01, DIS-02, DIS-03, DIS-04, DIS-06 | `Home › Shop › Offers` / `› Chhath Collection` etc. | Back → origin, labelled |
| CAT-05 | `Home › Shop › Brands › Aashirvaad` | Back → CAT-04 |
| CHK-02 → CHK-05 | **No breadcrumb.** A step indicator instead: "Step 2 of 4" | Same |
| ACC-*, ORD-*, LOY-* | `Home › My Account › Orders › Order #1284` | Back → parent, labelled |
| ORD-03 (public) | **No breadcrumb** — the customer may have no account and no history here | Back → MKT-01 |
| SUP-04, SUP-05, SUP-06 | No breadcrumb | Forward actions only (§4.12) |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R32` | Checkout uses a **step indicator**, never a breadcrumb. | A breadcrumb implies a hierarchy you can climb; checkout is a sequence you can reverse. EP-3.6 requires the step count to be visible and finite — that is a different promise, and it deserves a different device |
| `NAV-R33` | Every breadcrumb segment except the current one is tappable, and the last segment is never a link. | Standard, learned, and it prevents the "clicked and nothing happened" moment that reads as broken |
| `NAV-R34` | Breadcrumbs truncate from the **middle** on narrow screens, never from the start. `Home › … › Atta › Aashirvaad 5 kg`. | Home is the escape hatch and the leaf is the context. The middle is the least load-bearing |
| `NAV-R35` | A product in multiple categories has exactly one canonical breadcrumb path, set in ADM-07. | Two paths to one product means two answers to "where am I", which is one too many. It is also an SEO requirement (Founder Brief §16) |
| `NAV-R36` | Breadcrumbs never include a festival or campaign segment. | Bargad §25: navigation is untouchable. `Home › Diwali › Shop › Atta` would relabel the aisle map for a month (EP-2.8) |

## 4.10 Contextual Navigation (T3)

T3 is the navigation a screen earns by being where the customer is. It is the most useful tier and the easiest to corrupt into merchandising.

### The catalogue

| From | Contextual move | Carries | Condition |
|---|---|---|---|
| SHP-02 | Related products · Recently viewed · Back to the subcategory | EP-2.4 | Related must be genuinely related and in stock |
| SHP-02 (out of stock) | Notify me · Nearest real alternative | EP-2.2 | Never a substitution presented as equivalent (EP-4.6) |
| SHP-04 | The ₹500 rule → MKT-06 · Slot availability → CHK-03 · Points → LOY-01 | EP-3.1 | Rules link *out* from where they bind |
| SRC-03 | Nearest category · Close matches · Ask the shop on WhatsApp | EP-2.9 | Never terminal |
| CHK-06 | Retry · Switch to COD · Contact the shop | EP-3.7 | The order survives |
| CHK-07 | Track order · Continue shopping · Save the receipt | EP-0.2 | The wait is prepared |
| ORD-02 (delivered) | Reorder · Rate (V2) · Join the community (FLW-14/FLW-15) | EP-6.1 | Community invite only **after** delivery |
| ORD-01 | Reorder on every row · The live order first | EP-5.2, EP-4.1 | — |
| LOY-02 | Every entry → its source order (ORD-02) | Product Strategy §5 | The customer can audit us |
| ACC-04 | Reorder · Track · Orders · Loyalty · Addresses · Help | IA §11 | Most common task most prominent |
| CAT-03 | Sibling subcategories · Parent category | EP-2.4 | — |
| WHL-01 | Request access · Talk to a person | FLW-17/D3 | Never a route into the retail cart |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R37` | Contextual navigation supplements the primary tiers; it never replaces them. A screen whose only onward move is contextual has failed the acceptance test. | T3 is conditional by definition. If it is empty (no related products, no history), the screen must still answer "where can I go next?" |
| `NAV-R38` | Contextual navigation is truthful: no out-of-stock items in "related", no expired offers, no dead links. | Bargad §17: honest about money, works on slow days. A related shelf full of unavailable goods is a shop with empty shelves at the till |
| `NAV-R39` | Contextual navigation never carries urgency, scarcity, or persuasion. "You may also like" is a suggestion; "Only 2 left!" is forbidden. | EP-2.5, EP-0.5 |
| `NAV-R40` | Maximum **one** contextual block competing with the primary action on any screen. | Bargad §18: one primary per screen. A product page with four cross-sell rails has no primary action, it has a bazaar |
| `NAV-R41` | The community invite is contextual to **delivered orders only** (ORD-02, CHK-07 as a single offer). It is never a global element. | EP-6.1: invite after value. A permanent "Join our WhatsApp" is an ask before value, on every screen, forever |
| `NAV-R42` | Rules and policies link *from the screen where they bind*, not only from the footer. | EP-3.1, `NAV-R27`. The ₹500 rule belongs in the cart (Bargad §17), with the full text one tap away |

## 4.11 Search-first Navigation

Search is not a feature inside navigation. Under EP-2.3 it is **one of the two doors**, and Bargad §21 makes it the widest element on the mobile screen — a structural statement, not a styling one.

### Behaviour

| Aspect | Decision | Reasoning |
|---|---|---|
| Placement | Persistent field in the mobile stack (position 3) and the desktop primary bar; plus a bottom-bar slot | It is a destination *and* an affordance. The field invites; the tab guarantees |
| Activation | Tap → SRC-01 (a real screen), never an inline overlay that hijacks the current one | A screen has a back button and a URL. An overlay has neither, and traps a customer whose first instinct is the system back gesture |
| Before typing | Recents and popular searches are already on screen | EP-5.1: the second search must be cheaper than the first. Also: for a customer unsure what to type, recents *are* the navigation |
| Scope | **Global by default.** Scoping to the current category is explicit, visible and dismissible in one tap | A scoped search that silently returns nothing looks like an empty shop. If we scope, we say so and we offer the un-scoped result |
| Script | Devanagari, Latin and transliterated Latin resolve to the same shelf | IA §7. This is baseline, not a feature (FLW-09/D1) |
| Zero results | → SRC-03, never a terminal state | EP-2.9 |
| Degradation | On a slow network, search degrades to query → results without suggestions. It never becomes the thing that breaks first | EP-0.4. Search is a door; a door that only opens on 4G is a wall |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R43` | Search is never collapsed behind an icon on mobile. | Bargad §21 makes it the widest thing on screen. Collapsing it demotes one of the two doors to a symbol (Bargad §13) |
| `NAV-R44` | Search results (SRC-02) and category listings (CAT-03) use the same card, the same filters, in the same order. | EP-2.3: the shelf does not change identity because the door did. Two shelf designs means two things to learn |
| `NAV-R45` | Search ranking answers the customer's question, never ours. No margin-weighted or paid placement, ever. | EP-0.5. Search is the one place where the customer states exactly what they want; monetizing that is the purest betrayal available in this product |
| `NAV-R46` | Search never requires identification, location, or a permission. | EP-2.1, EP-1.3 |
| `NAV-R47` | Zero-result queries flow to ADM-18 as a stocking signal. | FLW-09/D5. Search is the cheapest market research the shop will ever get, and the aisle map should learn from it |

## 4.12 Error Navigation

Errors are where navigation matters most, because the customer has already lost their footing. Design Principles §12 fixes the tone; this section fixes the movement.

### The three-part error contract (`NAV-R48`)

Every error screen and every error state carries, without exception:

1. **What happened**, in the shopkeeper's voice, naming the cause where we know it.
2. **At least one forward action** — a real next step, not "go home" alone.
3. **The human path** — WhatsApp or Call (EP-0.8).

And it preserves state: the cart, the typed input, the order.

### Per-screen

| Screen | What happened | Forward actions | State preserved |
|---|---|---|---|
| SUP-04 (404) | The page moved or the link is old. Never "you did something wrong" | Search · Categories · Home | Cart |
| SUP-05 (offline) | The network dropped — **the shop did not** | Retry · View the saved cart · Call the shop | **Cart, absolutely** (EP-2.6) |
| SUP-06 (maintenance) | Honest cause, honest duration | Call · WhatsApp | Cart |
| SRC-03 (zero results) | We don't stock that / no match | Close matches · Nearest category · Ask the shop | Query, editable |
| CHK-06 (payment failed) | The cause, then: retry or pay cash | Retry · Switch to COD · Contact the shop | **The order** (EP-3.7) |
| CHK-02 (unserviceable address) | We deliver within 5 km; this is outside it | Store pickup · Another address · WhatsApp | **The cart** (FLW-08/D1) |
| SHP-04 (item unavailable) | This ran out since you added it | Remove · Alternative · Notify me | Everything else in the basket |
| ACC-02 (OTP failing) | Nothing blamed. Resend, then a human | Resend · Alternate channel · Call | The number, editable (FLW-07) |
| Empty states (SHP-03, ORD-01, LOY-01) | Not an error — an invitation | A real first action | — |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `NAV-R49` | An error never blames the customer, and never uses Sindoor red unless something is genuinely wrong. | Design Principles §12; Bargad §06's red discipline. When every red is real, one red earns instant attention |
| `NAV-R50` | "Go to homepage" is never the only forward action. | It is the navigational equivalent of a shrug. It answers "how do I return?" and ignores "where can I go next?" |
| `NAV-R51` | T0 survives every error (`NAV-R25`). | A shop whose door still opens when a page breaks is a shop |
| `NAV-R52` | An error never erases what the customer typed or built. | Bargad §19. Re-typing an address on a phone keypad because our validation fired is a punishment for our defect |
| `NAV-R53` | Offline state is designed, not defaulted. A blank page or a browser error screen is a defect. | EP-0.4: 2G is a design constraint, not an edge case |
| `NAV-R54` | Empty states are navigation, not decoration: every one names a next action. | Design Principles §13; Bargad §14 — empty is an invitation, never a dead end |

## 4.13 Navigation Rules — consolidated

`NAV-R1` … `NAV-R54` above are binding. The following are the ones that would most commonly be broken by a well-meaning designer, gathered so a review can check them in one pass:

| ID | The rule, in one line |
|---|---|
| `NAV-R1` | A destination has one tier and one label, forever |
| `NAV-R11` | No hamburger menu in the customer product |
| `NAV-R12` | The bottom bar never hides on scroll |
| `NAV-R13` | Every navigation item carries its word |
| `NAV-R14` | Active state is never colour alone |
| `NAV-R16` | The five bottom destinations never change — a festival never buys a slot |
| `NAV-R8` | Back never exits to the browser |
| `NAV-R21` | The language toggle is on every screen, including checkout and errors |
| `NAV-R28` | Wholesale is a footer-only quiet door |
| `NAV-R31` | Breadcrumbs follow the taxonomy, not the click history |
| `NAV-R36` | No festival segment in a breadcrumb |
| `NAV-R43` | Search is never collapsed behind an icon on mobile |
| `NAV-R45` | Search ranking answers the customer's question, never ours |
| `NAV-R48` | Every error: cause + forward action + human path + state preserved |
| `NAV-R50` | "Go home" is never the only way out |

## 4.14 Navigation Consistency Principles

Rules prevent specific failures. These prevent the slow rot.

| ID | Principle | Reasoning |
|---|---|---|
| `NAV-C1` | **One vocabulary.** The same destination has the same name in the bottom bar, the mega-menu, the footer, a breadcrumb and a WhatsApp message. "Orders", not "My Orders" here and "Order History" there. | Every synonym is a new thing to learn. For a customer reading slowly in their second script, two names for one place is two places |
| `NAV-C2` | **One geometry.** Website, admin panel and the future Android app share one navigation model — the trunk (Bargad §01). | Staff are customers too, and the app inherits this or the brand splits in two |
| `NAV-C3` | **Position is memory.** Nothing moves between screens: back is top-left, cart is top-right, language is in the identity row, the primary action is at the bottom on mobile. | Bargad §21: predictability beats pixels. Motor memory is the accessibility feature elderly customers actually use |
| `NAV-C4` | **Order is a promise.** IA §3 order on desktop, IA §5 section order on the homepage, IA §15 group order in the footer. Merchandising configures *content within* a section (ADM-15); it never reorders the sections. | EP-2.8. A customer who learned where dal lives in October must find it there in November |
| `NAV-C5` | **Parity is named, not assumed.** Every desktop destination has a written mobile route (§4.4), and every new destination must declare one before it ships. | Bargad §23. Parity that is not written down is parity that erodes on the first deadline |
| `NAV-C6` | **Language changes words, never structure.** Same tiers, same order, same positions, same tap counts — with ~15% extra width budgeted for Hindi labels. | Bargad §08. A Hindi navigation with fewer items or a different order says Hindi customers matter less |
| `NAV-C7` | **Navigation is courtyard, never rangoli.** The Seasonal Experience Engine (ADM-14) may touch hero art, greetings, one collection section and the festival accent. It may never touch a tier, a label, a breadcrumb or a bottom-bar slot. | Bargad §25 is explicit: buttons, navigation and semantic colours are untouchable |
| `NAV-C8` | **No personalized navigation.** DIS-07 (Future) may personalize *shelves*; it may never reorder tiers or rename destinations. | The map must be the same map for everyone, or word of mouth breaks: "it's under Categories" must be true for the neighbour too (EP-7.2) |
| `NAV-C9` | **Every interactive element is keyboard-reachable and screen-reader-labelled, in the right language.** | Bargad §22: `lang` per element, focus ring on everything, a keyboard path through every flow including checkout |

## 4.15 Depth budget

EP-2.4 caps depth at three taps to any product. Part 3 formalizes the measurement, because "reaching a product" was ambiguous and ambiguity is how depth budgets are quietly exceeded.

**Measurement rule (`NAV-R55`).** A product is **reached** when it is visible and addable — i.e. its card is on screen. Because Bargad §20 makes the card fully transactional (price, unit, saving, stock, and an in-place ADD stepper), the shelf *is* the product for buying purposes. Opening SHP-02 is a deliberate request for more, not a step toward the purchase.

### Audit — mobile, from a cold Home

| Path | Taps to the shelf | Within budget? |
|---|---|---|
| Home → Search → results | 2 | ✅ |
| Home → Categories → Atta (L2 exposed on CAT-01) | 2 | ✅ |
| Home → Categories → Food Grains → Atta | 3 | ✅ |
| Home → homepage category tile → Atta | 2 | ✅ |
| Home → homepage shelf (Best Sellers, Offers, Festival) | 0–1 | ✅ |
| Home → Categories → Food Grains → Atta → **SHP-02** | 4 | ✅ (SHP-02 is beyond the shelf, by `NAV-R55`) |
| Home → Account → Wishlist → item | 2 | ✅ |
| Home → Categories → Brands → Aashirvaad | 3 | ✅ |

**Consequence (`NAV-R56`).** CAT-01 must expose the L2 subcategories (IA §6's second level) directly, not only the L1 departments. If CAT-01 lists departments alone, every category-door product costs three taps to the shelf and a fourth to the detail — and the door for customers who will not type becomes the slower door, inverting EP-2.3.

**Consequence (`NAV-R57`).** No new navigational level may be introduced between CAT-01 and CAT-03 without a written budget re-audit in this document. Depth is the cheapest thing to add accidentally as the catalogue grows (IA §17), which is why it needs a number now.

## 4.16 Admin navigation

The admin panel inherits the trunk (Bargad §01, `NAV-C2`) and the IA §13 hierarchy. Its navigation differs in exactly three ways, each justified:

| Difference | Reasoning |
|---|---|
| A persistent left sidebar replaces the bottom bar on desktop; staff work on wider screens for long sessions, and IA §13 lists 16+ destinations — more than five | Five slots is a customer constraint born of thumbs and first-time users. Staff are trained, repeat users of a tool |
| Navigation is **scoped by role** (ADM-21). A staff member without a permission does not see a disabled item — they do not see the item | Bargad §18: a disabled state must say why. There is no honest "why" for "you are not allowed to know this exists" |
| Mobile admin carries a reduced set — Dashboard, Orders, Order Detail, Inventory — because ADM-04 status updates happen from a phone while packing | FLW-12: push quality is a back-room design problem. If updating status is harder than not updating it, EP-4.1 fails at the source |

Everything else holds: labels carry words, the language toggle persists, errors follow `NAV-R48`, and no destination changes tier by campaign.

## 4.17 Navigation — open questions for Part 4

| # | Question | Recommendation |
|---|---|---|
| Q1 | Does CAT-01 become the mobile Shop entrance, making SHP-01 desktop-primary (§4.4)? | Yes — resolves Part 1 §2.16 Q1 and protects the depth budget. Needs the founder's confirmation |
| Q2 | Does CAT-01 expose L2 subcategories directly (`NAV-R56`)? | Yes — it is the difference between a 2-tap and a 4-tap category door |
| Q3 | Is the announcement bar dismissible, and does it persist per session? | Dismissible, remembered, never re-shown in the same session. It is one fact, not a campaign slot |
| Q4 | Does the delivery strip persist on inner pages or only on MKT-01? | MKT-01 and CAT/SRC/SHP-02; suppressed in checkout where CHK-03 owns the slot truth. Needs a call |
| Q5 | Where does Membership sit for a **guest** on mobile (no Account content yet)? | Account tab → MKT-05 marketing view. Confirms that Account is never a wall (`NAV-R23`) |

---

# 5. Information Hierarchy

## 5.1 Purpose

Navigation decides where a customer can go. Information hierarchy decides what they understand when they arrive.

Design Principles §5 sets the test — every page answers three questions within five seconds, nothing competes for attention, the primary action is always obvious. Bargad §03 sets the proportion (70/20/10) and §18 sets the rule (one primary per screen). What none of them says is **which facts are primary on which screen** — and that is where a screen quietly becomes a bazaar: not by adding a banner, but by promoting six things to equal weight.

This section classifies information so that later design has a rule to obey instead of a taste to exercise.

## 5.2 The classification

| Tier | Definition | Test | Consequence of getting it wrong |
|---|---|---|---|
| **Primary** | The one thing this screen exists to say, and the one action it exists to enable | Remove it — does the screen still have a purpose? If yes, it wasn't primary | The customer cannot answer "what should I do next?" (Design Principles §5) |
| **Secondary** | What most customers need to act on the primary, on the same screen, subordinate to it | Would most customers be unable to decide without it? | The primary action is taken on incomplete information — a decision we caused |
| **Tertiary** | What some customers need, some of the time. Present, findable, never competing | Would *some* customers want this, and would nobody be angry to look for it? | Clutter that costs the primary its clarity |

**The anger test (`IH-1`).** *Would the customer be angry to discover this later?* If yes, it is **never tertiary** and it is **never progressively disclosed**, regardless of how well it would tidy the screen.

*Reasoning:* this single question resolves almost every real hierarchy argument in this product. Price, unit, availability, the ₹500 rule, the oils/loose-sugar exception, delivery cost, refund timing, points expiry — all of them are tidier when hidden and all of them are trust failures when discovered late. Founder Brief §9 states the principle ("never surprise customers during checkout"); `IH-1` is the operational form of it.

## 5.3 Primary Information

**Definition.** The screen's reason to exist, plus its one action (Bargad §18).

| Screen | Primary information | Primary action |
|---|---|---|
| MKT-01 | This is MG Supermart, Pipra · we deliver in your area · next slot is X | Start browsing (search / category) |
| CAT-01 | The aisle map | Open an aisle |
| CAT-03 / SRC-02 / DIS-* | The products: name, unit, price, saving, availability | Add to cart |
| SHP-02 | This exact product: photo, name, unit, price, saving, availability, delivery expectation | Add to cart |
| SHP-04 | The basket and the true total, including the ₹500 status | Proceed to checkout |
| CHK-02 | Where this order goes | Confirm the address |
| CHK-03 | When it arrives — real slots only | Choose a slot |
| CHK-04 | Everything that is about to be committed, in rupees | Proceed to payment |
| CHK-05 | How to pay — cash and digital as peers | Pay / Place the order |
| CHK-07 | The order is placed, and here is when it arrives | Track the order |
| ORD-02 / ORD-03 | Where the order is and when it comes | *(none — this screen is an answer, not a request)* |
| LOY-01 | Your balance, in rupees | Redeem |
| ACC-04 | Your live order · Reorder | Reorder |
| SRC-03 | We don't have that — here's what's near | Try the nearest thing |
| SUP-04 / SUP-05 | What broke, and that the shop is fine | A real forward action |
| WHL-01 | What wholesale here means and that pricing is a conversation | Request access / talk to a person |
| ADM-02 | What needs doing right now | Open the urgent thing |
| ADM-04 | This order's contents and status | Update the status |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `IH-2` | Exactly one primary action per screen. Two primaries means zero. | Bargad §18, Design Principles §5. Our personas include people shopping online for the first time — the green button *is* the answer to "what should I do next?" |
| `IH-3` | **Money is always primary or secondary — never tertiary.** Price, unit, total, delivery cost, and the rules that change any of them. | EP-3.1, EP-2.2, Bargad §17. A price the customer has to hunt for is a price they will not believe |
| `IH-4` | **Availability is always primary or secondary.** Out of stock says so on the card, not on the detail page, not at checkout. | EP-2.2. Discovering unavailability at CHK-04 is a surprise; discovering it after payment is a broken promise (EP-4.6) |
| `IH-5` | **During the wait, the order outranks the shop.** A live order is primary on MKT-01 and ACC-04, above all merchandising. | EP-4.1, FLW-02/D2. A customer with an undelivered order is not shopping — they are waiting |
| `IH-6` | **An error outranks everything except the way out.** | Design Principles §12, `NAV-R48` |
| `IH-7` | Ordinary state must feel complete. The resting screen — no campaign, no festival, no personalization — is the canonical hierarchy. | EP-0.7, Bargad §25: "the shop on an ordinary Tuesday" |

## 5.4 Secondary Information

**Definition.** What most customers need in order to act on the primary — present on the same screen, visibly subordinate.

| Screen | Secondary |
|---|---|
| MKT-01 | Category tiles · today's offers · best sellers · monthly grocery · the ₹500 rule · why MG Supermart |
| CAT-03 / SRC-02 | Filters · sort · subcategory siblings · result count |
| SHP-02 | Gallery · delivery information · applicable offers · quantity stepper · brand · related products |
| SHP-04 | Coupon · loyalty points available · slot preview · per-line saving · the oils/loose-sugar exception |
| CHK-04 | Address · slot · coupon and points applied · edit affordances |
| CHK-07 | Order reference · slot restated · receipt on WhatsApp/SMS · community invite (once) |
| ORD-02 | Items and totals · address · slot · the delivery person's name · cancel · reorder |
| LOY-01 | How points are earned · redemption threshold · expiry terms (if any) |
| ACC-04 | Orders · loyalty · addresses · membership · wishlist · help |
| WHL-01 | Who wholesale is for · what happens next · the timeframe |
| ADM-04 | Customer contact · packing list · short-supply action · payment status |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `IH-8` | Secondary information is subordinate by **space and type weight**, never by concealment. It is quieter, not hidden. | Bargad §10: proximity and air do the explaining, so boxes and borders don't have to. Hiding secondary information to "clean up" a screen converts a design problem into a trust problem |
| `IH-9` | The MRP strikethrough is secondary and quiet (khadi), never red. The saving is secondary and green, stated in rupees. | Bargad §06, §20. Red prices are adrenaline; we tell savings as a gain |
| `IH-10` | Filters are secondary on a listing and do not exist before a result set. | FLW-09. Filtering before results is a hypothesis, not a search |
| `IH-11` | Delivery information on SHP-02 is secondary — never absent. The customer decides to add based partly on when it arrives. | EP-1.2 applied at the shelf |

## 5.5 Tertiary Information

**Definition.** What some customers want, sometimes. Always available, never competing, never load-bearing for a decision.

| Screen | Tertiary |
|---|---|
| MKT-01 | Instagram feed · customer reviews · store photos · WhatsApp community · footer |
| SHP-02 | Full description · ingredients · manufacturer details · recently viewed · reviews (V2) |
| SHP-04 | Full policy text (linked) · the arithmetic behind a coupon's terms |
| CHK-* | Full T&Cs (linked, but see `IH-13`) |
| ORD-02 | Invoice PDF · full status history with timestamps |
| LOY-01 | Full ledger (LOY-02) · programme terms |
| ACC-04 | Settings · notification preferences · profile fields |
| CAT-03 | Category description · SEO copy |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `IH-12` | Tertiary information may be progressively disclosed. Primary and secondary may not. | This is the whole reason the tiers exist |
| `IH-13` | **A policy's *effect* is never tertiary, even when its *text* is.** The ₹500 rule's effect is stated in the cart; the full clause is a link. The refund timeline is stated on ORD-05; the full policy is a link. | Founder Brief §9, EP-3.1. Linking to a policy is not the same as disclosing a rule — the first is legal, the second is honest, and we owe the second |
| `IH-14` | Nothing tertiary appears above anything secondary, in any language, at any breakpoint. | Bargad §08: switching language must never change the design — only the words |
| `IH-15` | Marketing content (Instagram, reviews, community) is tertiary on transactional screens and absent from checkout entirely. | Founder Brief §18: do not overwhelm with offers. At the point of highest anxiety, our marketing is noise the customer is paying for in attention |

## 5.6 Content Prioritization

When two things want the same space, these decide — in order. Each rule outranks the ones below it.

| # | Rule | Reasoning |
|---|---|---|
| `CP-1` | **Truth outranks everything.** Price, unit, availability, slot reality, the rules that bind money. | Product Strategy §5. Our differentiator is that a customer 5 km away can walk in and check |
| `CP-2` | **The customer's live question outranks our message.** A live order, a failed payment, an unserviceable address, a zero-result query — these own the screen until resolved. | EP-4.1, `IH-5`. Merchandising at someone who is waiting for their dal is not merchandising, it is noise |
| `CP-3` | **The primary action outranks all supporting content.** | Bargad §18, `IH-2` |
| `CP-4` | **Real outranks promoted.** Genuine best sellers over editorial picks; real photos over stock; real reviews over testimonials. | Bargad §15: photography is proof, not decoration. Product Strategy §6: hyperlocality must be evidenced, not claimed |
| `CP-5` | **Section order is fixed; content within a section is configurable.** IA §5's 18 homepage sections keep their order and purpose; ADM-15 configures what fills them. | EP-2.8, `NAV-C4`. Merchandising is a tenant, not the landlord |
| `CP-6` | **Festival content is capped at ≤10% of any screen's pixels**, one accent, one surface, one collection section. | Bargad §25, verbatim |
| `CP-7` | **The 70/20/10 proportion holds on every screen**: ~70% warm air, ~20% structure and photos, ~10% brand. | Bargad §03. If a screen feels off-brand it is almost always this ratio, broken by promoting too many things |
| `CP-8` | **Bilingual parity of hierarchy.** The same tier in both languages, in the same order, with ~15% extra width budgeted for Hindi and extra height for matras. | Bargad §08, EP-0.3 |
| `CP-9` | **Accessibility outranks density.** 48 px targets, 56 px for money, 16 px body, ≥8 px between targets — even when it costs a row. | Bargad §10, §22. Whitespace is motor accessibility for the personas we named first |

**The tie-break (`CP-10`).** When two elements survive all of the above, the one that serves the earlier arc stage wins (Part 1 §1.11: trust must exist before it can be spent). A trust element beats a conversion element. Always.

## 5.7 Progressive Disclosure

### Definition and legitimate patterns

Progressive disclosure means revealing detail as it is requested, so that the primary is not drowned by the exhaustive. It is a tool for **tertiary information only** (`IH-12`).

| Pattern | Where it is legitimate | Example |
|---|---|---|
| **Hierarchy of screens** | Index → detail, where the index is complete enough to act on | CAT-03 card → SHP-02. The card already carries price, unit, saving and stock, so the detail page is a request for *more*, not for the *truth* (`NAV-R55`) |
| **In-place expansion** | Genuinely optional depth on a screen whose primary is already answered | SHP-02 "full description" · CAT-03 "category description" · LOY-01 "programme terms" |
| **Sequenced steps** | A flow where each step is a real decision, visible in count, and reversible | CHK-01 → CHK-07. EP-3.6: one decision per step, step count visible and finite |
| **Bottom sheets** | A focused choice that returns you where you were | Slot selection, filters, select inputs (Bargad §19, §23) |

### What may never be progressively disclosed (`IH-16`)

Each of these fails the anger test (`IH-1`). This list is closed and binding:

| Never hidden | Where it must be | Source |
|---|---|---|
| Price and unit | On the card | EP-2.2, Bargad §20 |
| Availability / out of stock | On the card | EP-2.2 |
| The ₹500 minimum and the oils/loose-sugar exception | Homepage and cart — before checkout | Founder Brief §9, EP-1.4 |
| Delivery cost and delivery area | First screenful, and CHK-02 | EP-1.2, EP-3.4 |
| The real slot | CHK-03, and the delivery strip | EP-3.5 |
| The final total | CHK-04, before payment | EP-3.1 |
| Cancellation terms and refund timing | ORD-05, **before** the cancel tap | FLW-13, EP-3.1 |
| Points expiry and redemption threshold | LOY-01, before a balance means anything | EP-5.5, FLW-14/D4 |
| What a community join sends, and how often | Before joining | EP-6.2 |
| A referral's reward terms | Before sharing | EP-7.3, FLW-16/D4 |
| Price or stock changes on a resumed cart or a reorder | On restore, line by line | EP-5.6, EP-4.6 |
| That wholesale pricing is a conversation, not a page | WHL-01, at the door | FLW-17/E4 |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `IH-17` | **Disclosure timing is a trust decision, not a layout decision.** It is settled by `IH-1`, never by how crowded a screen looks. | This is the sentence that prevents the entire category of failure Founder Brief §9 legislates against. A tidy screen that surprises someone at CHK-05 is not a tidy screen; it is a trap with good spacing |
| `IH-18` | Anything disclosed progressively must be reachable in **one action**, and that action must be labelled with what it reveals. "Full ingredients", not "More". | Bargad §13: an unlabelled affordance is a locked door. "More" is a promise with no content |
| `IH-19` | Nothing is revealed only on hover, only on long-press, or only by swipe. | Bargad §22, §23: no long-press-only or swipe-only actions; hover is enhancement only |
| `IH-20` | Collapsed content is still findable by in-page search and by screen readers, and expansion state never resets while the customer is reading. | Bargad §22. A screen reader user who cannot find a fact has been lied to as effectively as one who was shown nothing |
| `IH-21` | An accordion may never hide a price, a unit, a stock state, a total, or a rule that changes money. | The single most common way `IH-16` gets violated in practice, by someone tidying a layout with good intentions |

## 5.8 Information hierarchy anti-patterns

Recorded so they are recognized in review rather than discovered in production. Each is a `DEFECT` in the Part 2 sense: it must not ship.

| Anti-pattern | Why it is forbidden |
|---|---|
| The unit buried inside the product name ("Atta 5 kg Aashirvaad Premium…") | Bargad §20: the unit is always separate. Price-per-unit is the arithmetic a grocery customer does; burying it makes comparison impossible |
| "View details" required to see the price | `IH-3`, `IH-21` |
| Terms linked at CHK-05 rather than stated at SHP-04 | `IH-13`, EP-3.1, Founder Brief §9 |
| Six equally weighted things on the homepage | `IH-2`, `CP-7`. This is what "off-brand" actually is |
| A festival banner outranking a live order's status | `IH-5`, `CP-2` |
| An out-of-stock item silently removed from a listing or a cart | EP-2.2, EP-4.6. Removing the truth is worse than showing bad news |
| A countdown, a "2 left", or a red price | EP-2.5, Bargad §06 |
| Hindi content shown as an afterthought below English on the same screen | Bargad §08. Both are the reference experience, never a stack |
| A promoted product in a "best sellers" shelf | `CP-4`. It makes the entire shelf a claim we cannot back |
| Marketing content inside the checkout flow | `IH-15` |
| An empty state that just says "nothing here" | `NAV-R54`, Design Principles §13 |

## 5.9 Information hierarchy — open questions for Part 4

| # | Question | Recommendation |
|---|---|---|
| Q6 | Does the delivery strip count as primary on inner screens, or secondary (§4.17 Q4)? | Primary on MKT-01, secondary on shelves, replaced by CHK-03's slot truth in checkout |
| Q7 | Are reviews (V2) secondary or tertiary on SHP-02? | Tertiary at launch, secondary once volume is real. Never primary — the product's truth outranks opinion about it |
| Q8 | Is "Popular Near You" (DIS-06) primary enough to sit above "Today's Offers" on MKT-01? | No — IA §5 fixes the order and `CP-5` protects it. This is a merchandising question for ADM-15, not a hierarchy question |
| Q9 | How is the per-unit price (₹/kg) surfaced without breaking the card's calm (Bargad §20)? | Secondary, on the card, quiet — it is the grocery customer's real arithmetic. Needs a design answer in Milestone 4, not a hierarchy exception |
| Q10 | Does the ₹500 rule appear on every shelf, or only on MKT-01 and SHP-04? | MKT-01 and SHP-04. On every shelf it becomes wallpaper, and wallpaper is not disclosure |


# 6. Entry Points

## 6.1 Why entry points are architecture, not marketing

Part 2 designed seventeen flows. Every one of them assumes a beginning. Reality does not supply one.

Customers arrive mid-sentence: on a product page from a WhatsApp forward, on a tracking page at 11 pm, on a 404 from a stale Google result, on the homepage from a QR printed on a bill six weeks ago. Part 1 §1.4 established that the first visit is an **identification event, not a conversion event** — but *which* screen must do the identifying depends entirely on where the customer came in.

This section makes that explicit, because the failure it prevents is invisible until it is expensive: a beautifully designed homepage that answers EP-1.1 and EP-1.2 perfectly, and a product page — where 60% of first visits will actually land — that answers neither.

## 6.2 The entry contract

**`ENT-R1` — Every entry point lands on a screen that carries the full first-visit obligation itself.**

Whatever screen a stranger lands on must, on that screen, without a scroll to the footer and without a trip to the homepage:

| Obligation | Delivered by | Source |
|---|---|---|
| Prove this is the real MG Supermart, Pipra | Identity row, real photography, store presence | EP-1.1 |
| Answer "do you deliver to me, when, at what cost" | Delivery strip (`NAV-R9`) | EP-1.2 |
| Ask for nothing — no gate, no modal, no permission | The absence of them | EP-1.3 |
| Speak the customer's language, one tap away | अ/A on every screen (`NAV-R21`) | EP-1.6 |
| Offer a way onward and a way back | T0 + T1 + a canonical back (`NAV-R8`) | EP-0.6 |

*Reasoning:* the homepage is not the front door. It is **one** of eleven front doors, and probably not the busiest. Treating it as the only place where trust gets established means every other entry inherits a shop that has not introduced itself.

**`ENT-R2` — No entry point receives a different product.** No entry-specific landing page with fewer capabilities, a gate, or a variant flow. A referral link, a QR scan and a Google result all land in the same shop.

*Reasoning:* Product Strategy §12 forbids dark patterns, and the most common one is a landing page that exists to capture rather than to serve. It also breaks EP-7.2: a customer who forwards a link is staking their own credibility, and the friend must get the shop, not a funnel.

**`ENT-R3` — No entry point may be tracked in a way we would not explain to the customer at the counter.** Attribution is permitted; surveillance is not. No cross-site pixels serving third parties, no contact scraping, no behavioural profiles sold or shared.

*Reasoning:* Founder Brief §2 — customers know us because of transparent pricing and personal relationships. A shop that reads its customers' movements around town in order to sell them more is not that shop, whatever the homepage says.

## 6.3 Entry inventory

| ID | Entry point | Release | Trust carried in | Typical landing | Handoff |
|---|---|---|---|---|---|
| `ENT-01` | Google Search (organic) | MVP | **Low** — a stranger, comparing | MKT-01, SHP-02, CAT-03, MKT-07 | FLW-01 |
| `ENT-02` | Google Business Profile | MVP | **High** — reviews, photos, hours already seen | MKT-01, MKT-04 | FLW-01 |
| `ENT-03` | Instagram | MVP | **Medium** — brand-aware, not need-aware | MKT-01, DIS-02 | FLW-01 |
| `ENT-04` | WhatsApp Community | MVP | **Highest** — an existing customer, in their own space | DIS-02, SHP-02, DIS-01 | FLW-02, FLW-15 |
| `ENT-05` | QR codes (counter, bill, box, poster) | MVP | **High** — physically standing in the shop, or holding our box | MKT-01, ORD-03 | FLW-01, FLW-12 |
| `ENT-06` | Direct URL | MVP | **Medium** — word of mouth, typed deliberately | MKT-01 | FLW-01, FLW-02 |
| `ENT-07` | Shared product links | MVP | **Borrowed** — trust in the sender, not in us | SHP-02, DIS-02 | FLW-01 |
| `ENT-08` | Referral | Future | **Borrowed and staked** | MKT-01 (unchanged) | FLW-01, FLW-16 |
| `ENT-09` | Returning customer | MVP | **Earned** — ours to lose | MKT-01, ACC-04, ORD-03 | FLW-02, FLW-11 |
| `ENT-10` | Email campaigns | Future | **Consented** | MKT-01, DIS-02 | FLW-02 |
| `ENT-11` | Push notifications | Future | **Consented, revocable, fragile** | ORD-02, DIS-02 | FLW-12, FLW-02 |

**The trust-carried column is the design input.** A `ENT-04` arrival needs no persuasion and would be insulted by it. A `ENT-01` arrival needs proof and would be lost without it. Same shop, different first sentence.

## 6.4 `ENT-01` — Google Search (organic)

| Attribute | Definition |
|---|---|
| **Who arrives** | A stranger with a need ("grocery delivery Pipra") or a product query ("Aashirvaad atta 5 kg price") |
| **What they know** | Nothing about us. They are comparing, possibly with a national platform |
| **Landing** | MKT-01, SHP-02, CAT-03, MKT-07 (Future) |
| **Must prove** | We are real (EP-1.1), we are local, we deliver to them (EP-1.2), the price is honest (EP-2.2) |
| **Must never** | Interstitial, signup gate, "app is better" banner, location permission (EP-1.3) |
| **Handoff** | FLW-01 |
| **Metric** | Search entry → first shelf reached (not bounce rate — see §7.6) |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R4` | Every SHP-02, CAT-03 and DIS-02 is a legitimate landing page and carries the full entry contract (`ENT-R1`). | Founder Brief §16 commits to SEO-first. Succeeding at SEO means most organic entries land *below* the homepage. A product page without the delivery strip is an SEO win that converts nothing |
| `ENT-R5` | Structured data (product, price, availability, LocalBusiness, hours) is accurate or absent — never optimistic. | A rich result showing "in stock" for an item we do not have is a lie told at Google's scale, and the customer finds out in one tap (EP-2.2) |
| `ENT-R6` | One canonical URL per product, matching the canonical breadcrumb (`NAV-R35`). | Two URLs for one product splits ranking and gives two answers to "where am I" |
| `ENT-R7` | Local intent is served honestly: we rank for Pipra and East Champaran, and we do not chase queries we cannot serve. | EP-1.7. Ranking for "grocery delivery Patna" earns a visitor we must immediately disappoint (FLW-01/E2) |

## 6.5 `ENT-02` — Google Business Profile

| Attribute | Definition |
|---|---|
| **Who arrives** | Someone who already searched for us or for a shop near them, and has seen our photos, hours and reviews |
| **What they know** | A great deal. This is the highest-trust *public* entry we have |
| **Landing** | MKT-01, MKT-04 |
| **Must prove** | That the website matches the listing — same shop, same hours, same photos, same phone (EP-0.1) |
| **Must never** | Contradict the listing. Different hours on the site than on Google is a small lie with a large cost |
| **Handoff** | FLW-01 |
| **Metric** | Google Business interactions (Product Strategy §9), and GBP → first shelf |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R8` | GBP hours, phone, address and photos are the same objects as MKT-04's, sourced from ADM-20. They cannot drift. | EP-0.1: one shop, one voice. Drift here is discovered by a customer standing outside a closed shutter |
| `ENT-R9` | Reviews are earned, asked once, never incentivized (EP-7.3, FLW-16). | Founder Brief §3 names Google visibility as a goal. Visibility built on bought reviews is a number, not a reputation |
| `ENT-R10` | GBP is a first-class product surface owned in ADM-16, not a marketing afterthought. | For a Tier-3 shop it is plausibly the single highest-traffic surface we have. It deserves the same governance as MKT-01 |

## 6.6 `ENT-03` — Instagram

| Attribute | Definition |
|---|---|
| **Who arrives** | Brand-aware, need-unaware. Often browsing, not shopping. Frequently young; often a Student persona (Product Strategy §8) |
| **What they know** | Our face, our festivals, our people. Not our prices or our radius |
| **Landing** | MKT-01 (bio link), DIS-02 (festival post) |
| **Must prove** | That the warmth of the feed is the warmth of the shop, and that we deliver to them |
| **Must never** | Bait: a festival post linking to a homepage with no festival collection behind it |
| **Handoff** | FLW-01, FLW-15 |
| **Metric** | Instagram followers (Founder Brief §17); Instagram → shelf |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R11` | A post that promotes a collection links to that collection (DIS-02), not to the homepage. | The link is a promise. Landing someone on a generic homepage after a Chhath post makes them do our navigation for us, at the exact moment their intent was highest |
| `ENT-R12` | Instagram content on the site (IA §5) is tertiary (`IH-15`) and never blocks or delays a shelf. | It is proof of life, not merchandising. A third-party embed that costs 800 ms on 3G is a trust cost paid for a decoration (EP-1.5) |
| `ENT-R13` | Instagram never becomes a support channel by accident. DMs route to the same human path as WhatsApp (EP-0.8). | One shop, one voice (EP-0.1). A customer who asks about their order on Instagram must not get a worse shop |

## 6.7 `ENT-04` — WhatsApp Community

| Attribute | Definition |
|---|---|
| **Who arrives** | An existing customer, in their most personal channel, who joined *after* we kept a promise (EP-6.1) |
| **What they know** | Everything. This is the highest-trust entry point in the entire product |
| **Landing** | DIS-02, DIS-01, SHP-02 — a specific thing, because the message was about a specific thing |
| **Must prove** | Nothing. Proving would be an insult. It must simply *deliver what the message said* |
| **Must never** | Send more than was agreed (EP-6.2); send a greeting with a coupon stapled to it (EP-6.4); link to something that no longer exists |
| **Handoff** | FLW-02, FLW-15 |
| **Metric** | WhatsApp Community members (Founder Brief §17); message → shelf; **and the block/leave rate, which is the real health metric** |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R14` | Every community message links to a real, live destination. A dead link here costs more than a dead link anywhere else. | This is the channel we cannot rebuild. A customer who blocks us is gone from the one place they actually live (Founder Brief §5) |
| `ENT-R15` | Frequency caps are enforced by ADM-19, not by discipline. | EP-5.4, EP-6.2. "We'll be careful" is not an architecture. A cap that a busy festival week can override is not a cap |
| `ENT-R16` | Transactional messages (order status, OTP, refund) and promotional messages (offers, festivals) are separate channels with separate consent and separate caps. | Bundling them means a customer who mutes our marketing loses their order updates — which breaks EP-4.1 as punishment for exercising EP-6.6 |
| `ENT-R17` | Leaving is one step and costs nothing else (EP-6.6). | An exit harder than the entrance poisons the entrance |

## 6.8 `ENT-05` — QR Codes

| Attribute | Definition |
|---|---|
| **Who arrives** | Someone physically holding our proof: standing at the counter, holding a bill, opening a delivered box, reading a poster |
| **What they know** | The shop is real — they can see it. `ENT-R1`'s first obligation is already satisfied by the world |
| **Landing** | MKT-01 (counter, bill, poster) · **ORD-03** (delivery box) |
| **Must prove** | That the website is worth the walk they just avoided. Speed is the proof (EP-1.5) |
| **Must never** | Require an app, a login, or a permission. Fail on the shop's own weak signal |
| **Handoff** | FLW-01, FLW-12 |
| **Metric** | QR scans → first shelf; QR → first order (the cleanest offline→online attribution we will ever have) |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R18` | QR destinations are short, human-readable, and typeable by hand. | Scanning fails constantly on cheap cameras in poor light. A URL a person can read aloud across a counter is the fallback — and the shopkeeper can say it |
| `ENT-R19` | A QR is placed where the customer's hands are free and their intent is formed: the bill, the box, the counter — not the shutter. | This is the highest-conviction entry we have. Wasting it on a location nobody scans is wasting our only free acquisition channel |
| `ENT-R20` | The delivery-box QR lands on **ORD-03**, not on the homepage. | The person holding the box is answering "did everything come?" — not shopping. Landing them on merchandising ignores the question they actually have (`CP-2`) |
| `ENT-R21` | QR entries must work on the shop's own in-store network conditions, on a ₹6,000 phone. | EP-0.4. A QR that fails at the counter is a demo that failed in front of the customer *and* the shopkeeper |

## 6.9 `ENT-06` — Direct URL

| Attribute | Definition |
|---|---|
| **Who arrives** | Someone told by a neighbour, a relative, or the shopkeeper — and typing it in. The word-of-mouth channel Founder Brief §17 names as a success metric |
| **What they know** | That someone they trust said to try this |
| **Landing** | MKT-01 |
| **Must prove** | That the recommendation was correct (EP-7.1) |
| **Must never** | Be hard to type, hard to say, or hard to remember |
| **Handoff** | FLW-01, FLW-02 |
| **Metric** | Direct traffic; local word-of-mouth (Founder Brief §17) |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R22` | The domain must be sayable across a counter in Hindi, in one breath, and typed correctly on the first attempt. | This is the entry point for the channel we most want to grow. Every character is a tax paid by a 55-year-old with a keypad memory of Latin script |
| `ENT-R23` | Common typos and the non-`www` form resolve. | A typo that 404s is a word-of-mouth referral destroyed by a DNS record |

## 6.10 `ENT-07` — Shared Product Links

| Attribute | Definition |
|---|---|
| **Who arrives** | Someone whose relative forwarded a product: "is this the one?" Household shopping is a group activity here |
| **What they know** | Nothing about us. They trust the sender, not the shop. **The trust is borrowed** |
| **Landing** | SHP-02, DIS-02 |
| **Must prove** | Everything, on the product page: real shop, delivery, honest price (`ENT-R1`) |
| **Must never** | Break the sender's credibility with a gate, a 404, or a stale price |
| **Handoff** | FLW-01 |
| **Metric** | Shared-link entries → shelf → cart |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R24` | Every SHP-02 carries a share affordance that produces a WhatsApp message a human would actually send — the product name, the price, the link. Editable. | EP-7.2. Nobody forwards an advertisement to their sister. If our share text reads like marketing, it gets rewritten or dropped |
| `ENT-R25` | A shared link to an out-of-stock or discontinued product resolves honestly, with the alternative and a route to the shelf — never a 404. | EP-2.2, `NAV-R48`. The sender's credibility is the asset at risk, and it is not ours to spend |
| `ENT-R26` | Link previews (OG tags) show the real product, the real price and the real photo. | The preview *is* the first screen for most recipients. An inaccurate preview is a lie told before we load |
| `ENT-R27` | Back from a shared-link landing goes to the canonical subcategory, never out of the site (`NAV-R8`). | The most common real entry into this product is a forwarded link. Back must be the shop |

## 6.11 `ENT-08` — Referral *(Future)*

| Attribute | Definition |
|---|---|
| **Who arrives** | A friend of an existing customer, sent deliberately, with a reward attached (FLW-16) |
| **What they know** | That someone staked their own credibility on us |
| **Landing** | MKT-01 — **unchanged, ungated** (FLW-16/D3) |
| **Must prove** | The same things as any first visit. Nothing more, nothing less |
| **Must never** | Demand a signup to "claim" a reward before showing the shop |
| **Handoff** | FLW-01, then FLW-16 |
| **Metric** | Referrals → **delivered** first orders (never signups — FLW-16/D4) |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R28` | A referral link lands in the normal shop. There is no referral landing page. | `ENT-R2`. A page that gates the shop behind a reward claim breaks EP-1.3, and it spends the referrer's credibility on our capture mechanism |
| `ENT-R29` | The referred friend's experience is never degraded to make the reward mechanic work. | EP-7.5. If the arc fails for the friend, the referrer paid with a relationship and we paid with two customers |

## 6.12 `ENT-09` — Returning Customer

| Attribute | Definition |
|---|---|
| **Who arrives** | Someone who already trusted us with money and an address. **This trust is earned and ours to lose** |
| **What they know** | Whether we kept the last promise |
| **Landing** | MKT-01, ACC-04, ORD-03, or a deep link from a status message |
| **Must prove** | That the relationship persisted: the basket survived, the address is known, the live order is on top |
| **Must never** | Re-ask anything (EP-5.1); make the second order cost what the first did |
| **Handoff** | FLW-02, FLW-11 |
| **Metric** | Repeat purchase rate; customer retention (Product Strategy §9) |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R30` | A returning customer with a live order sees its status before anything else (`IH-5`, FLW-02/D2). | They are not shopping. They are waiting |
| `ENT-R31` | A returning customer whose last order failed is met with that, resolved, before any merchandising. | EP-0.2. Selling to someone whose complaint we have not answered is how a shop becomes a platform |
| `ENT-R32` | Sessions on personal devices are long-lived, so that the best login is the one that never happens (FLW-06). | Every forced re-identification is an interrogation we chose to run (EP-5.1) |

## 6.13 `ENT-10` — Email Campaigns *(Future)*

| Attribute | Definition |
|---|---|
| **Who arrives** | A consented customer — a minority here. Email is optional at ACC-03 and many customers will never give one |
| **What they know** | Us, and what they agreed to receive |
| **Landing** | MKT-01, DIS-02 |
| **Must prove** | That the email was worth opening |
| **Must never** | Exist without explicit, separate, revocable consent |
| **Handoff** | FLW-02 |
| **Metric** | Unsubscribe rate first; opens second |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R33` | Email is never the primary channel and never carries anything the customer can only get by email. | Founder Brief §5: this audience is WhatsApp-native and many have no working email. An email-only offer is an offer withheld from most of our customers |
| `ENT-R34` | Email consent is separate from loyalty (FLW-14/D5), from the community (EP-6.2) and from transactional messages (`ENT-R16`). | Bundled consent is consent we did not get |
| `ENT-R35` | Unsubscribe is one click and honoured immediately (EP-6.6). | An exit harder than the entrance poisons the entrance |

## 6.14 `ENT-11` — Push Notifications *(Future)*

| Attribute | Definition |
|---|---|
| **Who arrives** | A consented customer, tapping a notification |
| **What they know** | Us. Permission is the most fragile thing we will ever be given |
| **Landing** | ORD-02 (transactional), DIS-02 (promotional) |
| **Must prove** | That the interruption was worth it |
| **Must never** | Be requested on a first visit (EP-1.3); be used to manufacture urgency (EP-0.5); carry cart-abandonment pressure |
| **Handoff** | FLW-12, FLW-02 |
| **Metric** | Permission-revoke rate and uninstall rate first; taps second |

### Rules

| ID | Rule | Reasoning |
|---|---|---|
| `ENT-R36` | The permission is requested **after** a delivered order, in context, with the reason stated — never on arrival. | EP-1.3, EP-6.1. A permission prompt on a first visit is an ask before value, and it is answered "no" forever |
| `ENT-R37` | Transactional pushes (order status) and promotional pushes are separately consented and separately capped (`ENT-R16`, ADM-19). | Muting our offers must never cost a customer their delivery updates (EP-4.1) |
| `ENT-R38` | No push ever says "your cart is expiring", "only 2 left", or "come back". | EP-0.5, EP-2.5, EP-5.4. Push is the most intrusive channel we have; using it for manufactured urgency is the loudest possible version of the thing we refuse to be |
| `ENT-R39` | Push presupposes an Android app (Founder Brief §4, Future). Nothing in the web product depends on it. | Founder Brief §4: future features must not affect the simplicity of the current website |

## 6.15 Entry rules — consolidated

| ID | The rule, in one line |
|---|---|
| `ENT-R1` | Every landing screen carries the full first-visit obligation itself |
| `ENT-R2` | No entry point gets a different product |
| `ENT-R3` | Attribution yes; surveillance no |
| `ENT-R4` | Product and category pages are landing pages and must behave like it |
| `ENT-R14` | Every community message links to something real and live |
| `ENT-R16` | Transactional and promotional are separate channels with separate consent |
| `ENT-R20` | The delivery-box QR lands on tracking, not on merchandising |
| `ENT-R25` | A shared link never 404s; it resolves honestly |
| `ENT-R28` | A referral lands in the normal, ungated shop |
| `ENT-R30` | A live order outranks everything for a returning customer |
| `ENT-R36` | Push permission is asked after a delivered order, never on arrival |
| `ENT-R38` | No push ever manufactures urgency |

---

# 7. Exit Points

## 7.1 The distinction that governs this section

Most products treat every exit as a failure. That framing produces cart-expiry timers, exit-intent popups and guilt copy — every one of which Product Strategy §12 and EP-0.5 forbid.

MG Supermart makes a different distinction:

| Type | Definition | Correct response |
|---|---|---|
| **Natural exit** | The customer finished. The product worked | Let them go, cleanly, with the thread prepared for next time (EP-0.2) |
| **Abandonment** | The customer stopped mid-task, intending to continue or not | Preserve state. Diagnose the cause. Fix the cause. Contact only if it is useful *to them* |

**`EXT-R1` — The default response to any exit is: preserve everything and leave them alone.**

*Reasoning:* our customers live within 5 km and can walk into the shop tomorrow. We are not competing for a session that will never return; we are protecting a relationship that continues offline whether we message them or not. A chase message costs a relationship that would have come back anyway. Founder Brief §8: long-term relationships before transactions.

## 7.2 Natural Exits

These are successes. They must be designed as carefully as any conversion.

| Exit | From | The customer's state | What the product must do | Carries |
|---|---|---|---|---|
| Order placed | CHK-07 | Committed, slightly anxious | Send the receipt to their phone; prepare the wait; make tracking one tap | EP-3.8, EP-0.2 |
| Order delivered | ORD-02 | Satisfied, if we kept the promise | Close the loop; make reorder obvious; become eligible for the community invite (once) | EP-6.1 |
| Question answered | SUP-02, MKT-04, ORD-03 | Reassured | Nothing. The answer *was* the product | EP-0.8 |
| Browsing satisfied | SHP-03, SHP-04 | Intent parked | Persist the wishlist and the cart, silently and completely | EP-2.6 |
| Handed to a human | WhatsApp, Call | In good hands | Carry the context so nothing is re-explained | EP-0.1, EP-5.1 |
| Sent to Google Maps / the shop | MKT-04 | Coming in person | Nothing. A walk-in is a win — we are a shop | Founder Brief §2 |
| Community joined | MKT-03 | Belonging | Send exactly what was promised, at exactly the stated frequency | EP-6.2 |

**`EXT-R2` — A natural exit is never interrupted.** No "before you go", no exit-intent overlay, no "are you sure?", no survey in the doorway.

*Reasoning:* the moment after a kept promise is the most valuable moment we have. Spending it on an interception converts gratitude into irritation, and it is the last impression the customer carries until the next order.

**`EXT-R3` — Every natural exit leaves a thread.** The receipt on their phone, the persisted basket, the tracking link, the known address. The next flow inherits; it does not restart (EP-0.2).

## 7.3 Abandonment Points

Mapped by where they occur, what they mean, and what we are permitted to do. **The cause column is the useful one** — nearly every entry here is fixed by design, not by a message.

| ID | Where | Observable | Most likely real cause | Permitted response | Forbidden response |
|---|---|---|---|---|---|
| `ABD-01` | MKT-01, first visit, <10 s | No interaction | The delivery question was not answered, or the page was slow | **Fix the screen** (EP-1.2, EP-1.5). No message — we have no relationship and no contact | Any popup, any permission prompt |
| `ABD-02` | Browsing, no cart | Shelves viewed, nothing added | Price, unavailability, or we don't stock what they came for | Feed zero-result and stock signals to ADM-18 (`NAV-R47`) | Retargeting a stranger |
| `ABD-03` | Cart abandoned (guest) | Items in cart, no checkout | ₹500 shortfall · price · deciding · interrupted · comparing with the counter | **Persist the cart, in full, indefinitely.** Nothing else — we have no consent | Any message. We have a phone number only if they reached CHK-02, and it was given for delivery, not marketing (`ENT-R3`) |
| `ABD-04` | Cart abandoned (identified, consented) | Same | Same | **One** WhatsApp message, ≥24 h later, useful in tone, stoppable in one step | Urgency, expiry, discount-chasing, repetition (EP-0.5, EP-5.4) |
| `ABD-05` | CHK-01 | Gateway reached, no choice made | Login demanded, or perceived to be | **Fix CHK-01** — guest must read as a peer (EP-3.2) | Making guest worse to force accounts |
| `ABD-06` | CHK-02 | Address started, not finished | Typing on a keypad · unclear fields · a rejected format · unserviceable | Preserve every character (`NAV-R52`); fix the field model (FLW-08) | Blaming a "wrong" address format |
| `ABD-07` | CHK-03 | No slot chosen | No slot they can be home for | **Publish honest capacity**; do not invent slots (EP-3.5) | Auto-assigning a slot |
| `ABD-08` | CHK-04 | Review reached, no payment | A surprise appeared — a cost, a rule, a change | **This is our defect.** Diagnose it: a CHK-04 abandonment means EP-3.1 failed upstream | Hiding the surprise better |
| `ABD-09` | CHK-05 | Payment screen, no payment | Fear of digital payment · no balance · not ready | Ensure COD reads as a peer (EP-3.7) | Hiding COD, or pricing it worse |
| `ABD-10` | CHK-06 | Payment failed, not retried | Provider failure · lost confidence | The order survives; the cause is named; COD is offered (EP-3.7) | Silence |
| `ABD-11` | ACC-02 | OTP not completed | The OTP did not arrive | FLW-07 — channels, then a human. **This is our infrastructure failing**, not their attention | A lockout, a cooldown, a captcha |
| `ABD-12` | ORD-05 | Cancellation | A mistake, a delay, a change of mind | Let them go, cleanly. Fix the cause if it was ours (FLW-13/E7) | A retention offer in the doorway |
| `ABD-13` | Post-delivery, no second order | Silence for 60+ days | The promise was broken · price · they walked to the shop instead | **Ask a human question, once**, if they consented. Or accept it — they may simply prefer the counter | A win-back discount ladder |
| `ABD-14` | Community | Left or blocked | We sent too much, or sent the wrong things | Honour it instantly. Feed it to ADM-19 as a cap violation | Re-adding them. Ever |

## 7.4 Recovery Strategy

**`RCV-R1` — Recovery is a service, not a pursuit.** A recovery message is permitted only if a reasonable customer would be glad to receive it.

*Reasoning:* EP-5.4 already fixed this for reminders: useful, not pursuing. Recovery is the same act under a different name, and renaming it does not grant new permissions.

### The four gates

A recovery message must pass **all four** or it is not sent:

| Gate | Test | Source |
|---|---|---|
| **1. Consent** | Did they agree to this *category* of message, separately from transactional? | `ENT-R16`, EP-6.2 |
| **2. Usefulness** | Would they be glad to get it? Not "would it work" — "would they be glad" | EP-5.4 |
| **3. Honesty** | Zero urgency, zero scarcity, zero guilt. It is a reminder, not a lever | EP-0.5, EP-2.5 |
| **4. Frequency** | Within ADM-19's caps, enforced by the system, not by discipline | `ENT-R15` |

### The transactional / promotional line (`RCV-R2`)

| Class | Examples | Consent | Cap | Timing |
|---|---|---|---|---|
| **Transactional** | OTP · order received · packed · on the way · delivered · delay + cause · refund status · short-supply confirmation | **Not required** — the customer asked for this by ordering | **None** — EP-4.1 requires them | Immediate, event-driven |
| **Promotional** | Cart reminder · offers · festival collections · win-back · referral | **Required, explicit, separate, revocable** | ADM-19 caps | See §7.5 |

*Reasoning:* this line is the whole architecture of §7. Blurring it produces the two classic failures at once — a customer who mutes marketing and loses their delivery updates (breaking EP-4.1 as a punishment for exercising EP-6.6), or a "your order is confirmed" message with three offers stapled underneath (breaking EP-6.4 and teaching them to ignore the channel that carries EP-4.1).

### What recovery may never do

| Forbidden | Why |
|---|---|
| "Your cart is expiring" | The cart does not expire. It is a lie, and EP-2.6 says the basket survives |
| "Only 2 left — hurry" | EP-2.5, EP-0.5. Manufactured scarcity |
| A countdown of any kind | Bargad §06, EP-2.5 |
| A discount that appears *because* they abandoned | Teaches customers that hesitation is rewarded, which prices every future order dishonestly (Product Strategy §5) |
| More than one message per abandonment | EP-5.4. The second message is pursuit |
| Confirmshaming ("No thanks, I'd rather pay more") | EP-0.5, Design Principles §11 |
| An exit-intent popup | `EXT-R2` |
| Contacting a guest who gave a phone number for delivery | `ENT-R3`. That number was given for a purpose. Using it for another is a betrayal disguised as a growth tactic |

## 7.5 Recovery Timing

Timing is where an ethical intent becomes an unethical product. These are binding.

| Abandonment | Wait | Channel | Frequency | Content | Then |
|---|---|---|---|---|---|
| `ABD-03` guest cart | — | **None** | — | — | Persist the cart. Forever |
| `ABD-04` identified cart | **≥24 h** | WhatsApp | **Once. Ever, per cart** | "आपका सामान कार्ट में है" + the link. No price pressure, no offer | Silence. The cart is still there when they return |
| `ABD-08` CHK-04 | — | None | — | — | **Diagnose, don't message.** A surprise at CHK-04 is our defect (EP-3.1) |
| `ABD-10` payment failed | **Immediate** | WhatsApp/SMS — **transactional** | Once | The cause + "pay cash instead?" + the order is safe | Human path (EP-0.8) |
| `ABD-11` OTP failed | **Immediate** | Alternate channel, then human | Until resolved — this is us failing, not them | FLW-07 | Never a lockout |
| Delivery delay | **Before the slot ends** | WhatsApp/SMS — **transactional** | As often as the truth changes | Cause + new expectation (EP-4.3) | — |
| `ABD-13` dormant 60 d | **≥60 days** | WhatsApp, only with consent | **Once per quarter, maximum** | A human question, not an offer. "Everything alright?" is a shopkeeper. "20% off!" is a platform | Accept the answer, including silence |
| Festival | Per ADM-14 schedule | WhatsApp | Per ADM-19 caps | A greeting with **no CTA** (EP-6.4) | Auto-revert (Bargad §25) |
| `ABD-14` left the community | — | **None** | **Never** | — | Honour it instantly |

**`RCV-R3` — No recovery message is ever sent during the customer's own session.** No "wait!", no re-engagement while they are still on the screen.

**`RCV-R4` — Silence is a permitted, and often correct, response.** A recovery strategy with a "do nothing" branch is a strategy. One without it is a chase.

*Reasoning:* our customers can walk into the shop. Many abandonments end at the counter, which is a completed sale for the same business (Founder Brief §2). Measuring only online recovery would make us optimize against our own shop.

## 7.6 Re-engagement Channels

| Channel | Release | Trust | Best for | Cap | Rule |
|---|---|---|---|---|---|
| **WhatsApp** | MVP | Highest, most fragile | Transactional; consented reminders; greetings | ADM-19 | `ENT-R14`–`ENT-R17`. The channel we cannot rebuild |
| **SMS** | MVP | Medium, reliable | Transactional fallback (OTP, status) | None for transactional | Never promotional. SMS marketing is what a stranger does |
| **A phone call** | MVP | Highest of all | Anything genuinely wrong; a wholesale relationship; a difficult delivery | Human judgement | The most powerful re-engagement tool we own, and it does not need a feature (EP-0.8) |
| **Google Business** | MVP | Public | Discovery, hours, reviews | — | `ENT-R8`–`ENT-R10` |
| **Instagram** | MVP | Medium | Brand, festivals, community proof | — | Never a support channel by accident (`ENT-R13`) |
| **In-store** | MVP | Absolute | Everything | — | The shopkeeper mentioning the website is our highest-conversion channel and costs nothing |
| **Email** | Future | Low here | A minority of customers | ADM-19 | `ENT-R33`–`ENT-R35` |
| **Push** | Future | Consented, fragile | Order status | ADM-19 | `ENT-R36`–`ENT-R39` |

**`RCV-R5` — The shop counter is a re-engagement channel and is designed as one.** The bill QR (`ENT-05`), the box QR (`ENT-R20`), and the shopkeeper's own sentence are the cheapest, highest-trust re-engagement we have.

*Reasoning:* every competitor must buy attention. We have a room that our customers walk into voluntarily. Ignoring it in favour of digital channels would be building a Bangalore growth stack on top of a Pipra advantage.

## 7.7 Success Metrics

Product Strategy §9 and Founder Brief §17 fix the metrics. This section fixes **how they are read**, because the wrong reading of a right metric is how ethical products decay.

### The metrics that matter

| Category | Metric | Source | Read it as |
|---|---|---|---|
| Business | Online orders | PS §9 | Volume |
| Business | Average order value | PS §9 | Basket depth — **never** a target to raise by pressure |
| Business | **Repeat purchase rate** | PS §9 | **The single most honest number in the product.** It cannot be faked by a dark pattern, because it measures whether the promise was kept |
| Business | Customer retention | PS §9 | The arc holding |
| Marketing | WhatsApp Community growth | PS §9 | Belonging — **read alongside the block/leave rate, always** |
| Marketing | Instagram growth | PS §9 | Awareness |
| Marketing | Google Business interactions | PS §9 | Discovery |
| Experience | Conversion rate | PS §9 | Whether trust and relevance were sufficient — never a lever to pull directly |
| Experience | Checkout completion | PS §9 | Whether EP-3.1 held |
| Experience | **Search success rate** | PS §9 | Whether the aisle map matches the neighbourhood's vocabulary |
| Experience | Customer satisfaction | PS §9 | — |
| Trust | Local word-of-mouth | FB §17 | Direct + QR + shared-link entries; the truest measure of EP-7.5 |

### Metrics per entry and exit

| Point | Metric | Why this one |
|---|---|---|
| `ENT-01` Google | Entry → first shelf | Bounce rate punishes a page that answered the question in five seconds. `ENT-R1` is designed to do exactly that |
| `ENT-02` GBP | GBP interactions; GBP → shelf | PS §9 |
| `ENT-04` WhatsApp | Message → shelf, **and block/leave rate** | The leave rate is the health metric. Growth without it is a vanity number |
| `ENT-05` QR | Scan → shelf; scan → first order | Our cleanest offline→online attribution |
| `ENT-07` Shared links | Entry → cart | Measures whether borrowed trust converts |
| `ENT-09` Returning | Repeat purchase rate | PS §9 |
| `ENT-11` Push (Future) | **Revoke rate first**, taps second | The permission is the asset; taps spend it |
| Natural exit — order placed | Checkout completion | PS §9 |
| Natural exit — delivered | Delivery-on-slot rate | The number the entire arc rests on (EP-3.5) |
| `ABD-04` cart | Return rate **without** a message | Isolates whether the product works, versus whether the message worked |
| `ABD-08` CHK-04 | Rate, as a **defect signal** | Any non-trivial rate means EP-3.1 failed upstream |
| `ABD-11` OTP | Failure rate | An infrastructure metric wearing a customer's clothes (FLW-07, Part 2 §3.22 Q5) |
| `ABD-13` dormant | 60/90-day dormancy | Read against footfall — they may just be shopping in person |

### Metrics we will not optimize (`RCV-R6`)

Recording these matters as much as recording the real ones, because these are what get optimized by default.

| Anti-metric | Why we refuse it |
|---|---|
| Time on site / session duration | A grocery customer who ordered in 90 seconds is a triumph. Optimizing this optimizes against EP-5.2 |
| Sessions per user | Rewards nagging |
| Page views per session | Rewards depth, and we capped depth at three taps (EP-2.4) |
| Notification opt-in rate as a target | Rewards prompt pressure — the exact thing `ENT-R36` forbids |
| Community size alone | Rewards adding people who will block us |
| Recovered-cart revenue | Rewards sending more messages. Measure returns *without* a message (`ABD-04`) |
| First-order conversion rate as **the** headline | Rewards pressure at the point of highest anxiety. Repeat rate is the honest headline |
| App installs (Future) | Founder Brief §4: future features must not compromise the current website |

**`RCV-R7` — Any metric may be measured; not every metric may be optimized.** A number becomes a target only if a rule in Documents 01–06 cannot be broken while moving it.

*Reasoning:* this is the mechanism by which good products become bad ones. Nobody decides to add a countdown timer. Someone is given a conversion target, tries the honest levers, exhausts them, and reaches for the dishonest one — and the metric rewards them. The prohibition therefore has to live on the target, not on the tactic.

---

# 8. Trust Journey

## 8.1 Reconciling this with the arc

Part 1 §1.2 defined a seven-stage arc. This section maps nine stages, adding **Product** and **Cart** as distinct moments. These are the same journey at finer resolution — Product and Cart are sub-stages of Browsing and the approach to Purchase.

| This section's stages | Part 1 arc stage |
|---|---|
| First Visit | First Visit |
| Browsing · Product · Cart | Browsing |
| Checkout | Purchase |
| Delivery | Delivery |
| Repeat Purchase | Repeat Purchase |
| Community | Community Membership |
| Advocacy | Customer Advocacy |

No stage is added or removed. Product and Cart get their own rows because they are where trust is most concretely spent — the card's arithmetic and the basket's total are the two places a customer can catch us being dishonest in a single glance.

## 8.2 The trust ledger

Trust behaves like a balance, and the model has three properties that determine every decision below.

| Property | Consequence for design |
|---|---|
| **Asymmetric.** Deposits are small and slow; withdrawals are large and instant | One hidden fee undoes twenty honest orders. This is why disclosure timing (`IH-17`) is a trust decision rather than a layout decision |
| **Verifiable.** Our customers live within 5 km and can walk in and check | We cannot get away with anything, which is our greatest structural advantage. It means honesty is not only right, it is the only strategy available |
| **Transferable.** Trust arrives borrowed (`ENT-07`) and leaves as reputation (EP-7.2) | A withdrawal is never charged to one account. It travels through a WhatsApp group of neighbours |

**`TJ-R1` — Trust is spent in the same order it is earned.** A later stage may only spend what an earlier stage deposited (Part 1 §1.11). This is why an unearned community invite (EP-6.1) or an unearned referral ask (EP-7.1) fails: they attempt to withdraw against a balance that does not exist yet.

## 8.3 Stage 1 — First Visit

| Aspect | Definition |
|---|---|
| **Trust question** | "Is this actually my shop, and does it serve me?" |
| **Balance** | Near zero for `ENT-01`; substantial for `ENT-02`, `ENT-04`, `ENT-05` |
| **Deposits** | Real photos of the real shop · the address and the hours · the delivery strip answering before being asked · a page that loads on 3G · the ₹500 rule told at the door · अ/A visible |
| **Withdrawals** | A signup modal · a location prompt · a slow first paint · stock photography · "fastest delivery" · a rule discovered later |
| **Trust-critical moment** | **The first screenful.** Whether the delivery question is answered before it is asked |
| **Evidence we hold** | A physical shop 5 km away, with a face, photographable |
| **Cost of failure** | Total and silent. They leave and never say why |
| **Carried by** | EP-1.1–1.7, `ENT-R1`, FLW-01 |

## 8.4 Stage 2 — Browsing

| Aspect | Definition |
|---|---|
| **Trust question** | "Do they have what I buy, at the price I know?" |
| **Balance** | Small, and being tested against the counter — the customer knows what atta costs |
| **Deposits** | Prices matching the shop · out-of-stock said honestly · no login to look · two equal doors · a calm shelf · a search that understands "ata" |
| **Withdrawals** | A price higher than the counter without a reason · a pincode gate · a shelf that shouts · a category renamed for a festival |
| **Trust-critical moment** | **The first price they recognize.** The moment a known price matches, we become the same shop |
| **Evidence** | Their own memory of the counter — an audit we cannot fail quietly |
| **Cost of failure** | They stop believing the prices, and then nothing else matters |
| **Carried by** | EP-2.1–2.9, FLW-01, FLW-02, FLW-09 |

## 8.5 Stage 3 — Product

| Aspect | Definition |
|---|---|
| **Trust question** | "Is this the exact thing I want, and is that the real price for that quantity?" |
| **Balance** | Enough to look; not yet enough to commit |
| **Deposits** | Unit stated separately from the name · ₹/kg legible · MRP struck quietly, saving in green rupees · a real photo of the real pack · honest stock · delivery expectation on the page |
| **Withdrawals** | The unit buried in the name · a price behind "view details" · a stock photo of a different pack size · a saving that does not survive arithmetic · "2 left" |
| **Trust-critical moment** | **The arithmetic.** A grocery customer converts to ₹/kg in their head. If our number and theirs disagree, we are lying — no other conclusion is available to them |
| **Evidence** | The pack itself, which they have held |
| **Cost of failure** | Every future price becomes suspect. The withdrawal is retroactive |
| **Carried by** | EP-2.2, Bargad §20, `IH-3`, `IH-16`, `IH-21` |

## 8.6 Stage 4 — Cart

| Aspect | Definition |
|---|---|
| **Trust question** | "Is this the number I will actually pay?" |
| **Balance** | Rising — they have decided to buy something |
| **Deposits** | Every rupee visible · the ₹500 rule *with* the oils/loose-sugar exception, resolved here · the coupon's effect shown · points in rupees · the basket surviving a reload · slot reality visible |
| **Withdrawals** | A fee appearing later · a rule that "applies at checkout" · a silently repaired basket · an auto-applied coupon or point · a total that changes on the next screen |
| **Trust-critical moment** | **The ₹500 rule and its exception.** This is the single most delicate object in the product: an unusual rule, with an exception, involving money. Told here it is honesty; told at CHK-05 it is a trap |
| **Evidence** | The total, which they can add up themselves |
| **Cost of failure** | The customer proceeds to checkout braced — and a braced customer reads every subsequent screen looking for the trick |
| **Carried by** | EP-3.1, EP-2.6, Founder Brief §9, Bargad §17, FLW-03/D2 |

## 8.7 Stage 5 — Checkout

| Aspect | Definition |
|---|---|
| **Trust question** | "If I hand this over, will it be honoured?" |
| **Balance** | Highest anxiety of the arc. Everything deposited so far is now at stake |
| **Deposits** | Guest as a true peer · no password · a landmark address · only keepable slots, full ones shown honestly · one decision per step, count visible · COD as a first choice · a failure that keeps the order · a receipt on their own phone |
| **Withdrawals** | A surprise · a forced account · a slot we will miss · a pre-ticked anything · an order destroyed by a payment failure · a confirmation that exists only in a tab |
| **Trust-critical moment** | **The instant after the payment tap.** The gap between commitment and confirmation, on a slow network, is the loneliest moment in the product |
| **Evidence** | None. This is the one stage that runs on trust alone — which is why nothing may be spent here that was not deposited earlier (`TJ-R1`) |
| **Cost of failure** | Catastrophic and vocal. A failed first order is discussed at the counter, in the WhatsApp group, and across the street |
| **Carried by** | EP-3.1–3.8, FLW-03, FLW-04 |

## 8.8 Stage 6 — Delivery

| Aspect | Definition |
|---|---|
| **Trust question** | "Where is my order, and will it come as promised?" |
| **Balance** | Fully committed, zero control. The customer holds nothing but our word |
| **Deposits** | Status pushed before they ask · tracking with no login · a delay announced *with a cause*, before they notice · a named delivery person · short supply asked about, not decided for them · a human one tap away |
| **Withdrawals** | **Silence** · a delay discovered · a silent substitution · a login wall in front of "where is my dal" · a rider with no name |
| **Trust-critical moment** | **The handover.** A real person, at their door, with their name and ours. This is the moment the digital shop becomes the neighbourhood shop — or fails to |
| **Evidence** | The box. The most physical, least deniable proof in the arc |
| **Cost of failure** | The relationship. And it converts every earlier deposit into a story about how we let them down |
| **Carried by** | EP-4.1–4.6, FLW-12 |

## 8.9 Stage 7 — Repeat Purchase

| Aspect | Definition |
|---|---|
| **Trust question** | "Is doing this again easier than walking to the shop?" |
| **Balance** | Positive, if we kept the promise. This is the first stage we are *spending* rather than earning |
| **Deposits** | Address and slot remembered · reorder in one tap · price changes disclosed line by line · loyalty in rupees they can verify · a reminder timed to their rhythm, not ours |
| **Withdrawals** | Re-asking anything · a quietly more expensive "same as last time" · an auto-substitution · a silent expiry · a nudge that became a nag |
| **Trust-critical moment** | **The second order's price.** A repeat customer is precisely the person who remembers what it cost last month. `ABD-13` is usually this |
| **Evidence** | Their own order history, which they can read (LOY-02, ORD-01) |
| **Cost of failure** | Not anger — drift. They simply walk to the shop instead, and we never learn why |
| **Carried by** | EP-5.1–5.6, FLW-11 |

## 8.10 Stage 8 — Community

| Aspect | Definition |
|---|---|
| **Trust question** | "Are these my people, or is this a marketing list?" |
| **Balance** | Enough to be invited — because a promise was kept first |
| **Deposits** | Invited only after delivery · told exactly what will be sent and how often · greetings with no CTA · real customers shown with consent · leaving as easy as joining |
| **Withdrawals** | An invite before value · one message more than promised · a greeting with a coupon stapled to it · a hard exit |
| **Trust-critical moment** | **The third message.** The first is welcome, the second is fine, the third is where a customer decides whether we are a neighbour or a broadcaster |
| **Evidence** | Their own inbox — the most honest analytics dashboard in existence |
| **Cost of failure** | A block. Permanent, in the one channel we cannot rebuild (`ENT-04`) |
| **Carried by** | EP-6.1–6.6, `ENT-R14`–`ENT-R17`, FLW-14, FLW-15 |

## 8.11 Stage 9 — Advocacy

| Aspect | Definition |
|---|---|
| **Trust question** | "Would I put my own name behind this?" |
| **Balance** | Surplus. Advocacy is only possible from a positive balance — it is the customer lending us their credit |
| **Deposits** | Every kept promise, from stages 1–8. There is no other deposit available here |
| **Withdrawals** | Asking before earning · asking twice · paying for reviews · touching their contacts · raising a referral reward to paper over a delivery problem |
| **Trust-critical moment** | **Their friend's first delivery.** The referrer's credibility, not ours, is what is on the line — and EP-7.5 exists because this is not a lever we can pull |
| **Evidence** | Us, as experienced by someone they care about |
| **Cost of failure** | Two customers, and a story that travels 5 km in an afternoon |
| **Carried by** | EP-7.1–7.5, FLW-16 |

## 8.12 The nine trust-critical moments

Consolidated, because these nine are where the product is actually decided. Every one is cheap to get right and expensive to get wrong.

| # | Stage | The moment | The rule that protects it |
|---|---|---|---|
| 1 | First Visit | The first screenful answers the delivery question | EP-1.2, `NAV-R9` |
| 2 | Browsing | The first price they recognize | EP-2.2 |
| 3 | Product | The ₹/kg arithmetic agreeing with theirs | Bargad §20, `IH-3` |
| 4 | Cart | The ₹500 rule and its exception, told here | Founder Brief §9, EP-3.1 |
| 5 | Checkout | The gap after the payment tap | EP-3.8, EP-3.7 |
| 6 | Delivery | The handover, by a named person | EP-4.5 |
| 7 | Repeat | The second order's price | EP-5.6 |
| 8 | Community | The third message | EP-6.2, `ENT-R15` |
| 9 | Advocacy | Their friend's first delivery | EP-7.5 |

**`TJ-R2` — These nine moments may not be optimized against.** They may be made faster, clearer or warmer. They may never be made more persuasive.

*Reasoning:* each is a point where the customer is deciding whether we are honest. A moment engineered to *look* honest is the one thing worse than a moment that fails — because when it is found out, and within 5 km it will be, the withdrawal is charged against every stage at once.

---

# 9. Conversion Strategy

## 9.1 What conversion means here

Product Strategy §4 is explicit: we are not competing to be India's fastest grocery platform. Founder Brief §8 puts long-term relationships before transactions. Conversion therefore cannot mean *this session's order*.

**`CV-1` — Conversion means a customer ordering again.** The first order is a hypothesis. The second is the conversion.

*Reasoning:* first-order conversion can be bought with pressure; repeat purchase cannot. A dark pattern raises the first number and lowers the second, so a product optimized on first-order conversion will systematically destroy the business it appears to be growing. Repeat purchase rate is the only number in Product Strategy §9 that no trick can move (§7.7).

## 9.2 The conversion equation

Everything in this section derives from one identity:

> **Conversion = (Trust × Relevance) ÷ Effort**

| Term | What raises it, honestly |
|---|---|
| **Trust** | Section 8 — the deposits, in order |
| **Relevance** | The right products, the right prices, an aisle map that matches the neighbourhood's vocabulary, a search that understands "ata" |
| **Effort** | Taps, typing, waiting, doubt, decisions, re-asked questions |

**`CV-2` — Every permitted conversion lever raises trust, raises relevance, or lowers effort. Nothing else is a lever.**

*Reasoning:* dark patterns do not appear in this equation. They work by *substituting* for trust — manufacturing an emotion (fear, urgency, shame) that produces a click without the belief that should precede it. That is why they cannot be tuned into acceptability, and why they are prohibited by principle rather than adjudicated case by case.

## 9.3 Permitted levers

| ID | Lever | Moves | Where it applies |
|---|---|---|---|
| `CV-3` | **Answer the question before it is asked** — the delivery strip, the ₹500 rule at the door | Trust ↑ | Stage 1 (`ENT-R1`) |
| `CV-4` | **Prove reality** — real photos, the address, hours, named people | Trust ↑ | Stages 1, 6 (Bargad §15) |
| `CV-5` | **Tell the truth earlier than we have to** — a price change on a resumed cart, an out-of-stock item on the card | Trust ↑ | Stages 2–4 (`IH-1`) |
| `CV-6` | **Remove a tap** — reorder, saved addresses, in-card quantity, recents | Effort ↓ | Stages 7, 2 (EP-5.1) |
| `CV-7` | **Remove a decision without making it** — pre-highlighting the usual slot, never pre-committing it | Effort ↓ | Stage 5 (FLW-04/D1) |
| `CV-8` | **Remove a doubt** — a step count, a visible total, an editable review step | Trust ↑, Effort ↓ | Stage 5 (EP-3.6) |
| `CV-9` | **Be faster** — LCP under 2.5 s on 3G | Trust ↑, Effort ↓ | All (EP-1.5) |
| `CV-10` | **Be reachable** — WhatsApp and Call, always | Trust ↑ | All (EP-0.8) |
| `CV-11` | **Remember** — address, slot, language, basket, history | Effort ↓ | Stage 7 (EP-5.1) |
| `CV-12` | **Show the neighbourhood** — real best sellers, Popular Near You, real reviews | Relevance ↑ | Stage 2 (`CP-4`) |
| `CV-13` | **Stock what they searched for** — zero-result queries into ADM-18 | Relevance ↑ | Stage 2 (`NAV-R47`) |
| `CV-14` | **Speak their language and their words** — अ/A everywhere, local synonyms | Trust ↑, Relevance ↑ | All (EP-0.3) |
| `CV-15` | **Keep the promise** — deliver on the slot | Trust ↑ | Stage 6. **The highest-leverage conversion lever in the entire product** |
| `CV-16` | **Say the saving as a gain, in rupees** — "₹40 की बचत" | Trust ↑ | Stages 3, 4 (Bargad §06) |
| `CV-17` | **Be honest about a failure** — the cause, the next step, the order intact | Trust ↑ | Stages 5, 6 (EP-3.7, EP-4.3) |

**`CV-18` — `CV-15` outranks every other lever.** A delivery kept on the promised slot converts more than every UI decision in this document combined, and no UI decision can compensate for its absence (EP-7.5).

## 9.4 Forbidden levers

Prohibited absolutely, in every flow, on every screen, at every release, regardless of measured effect.

| Dark pattern | What it looks like here | Forbidden by |
|---|---|---|
| **Manufactured urgency** | Countdowns, "offer ends in", flash timers | EP-2.5, EP-0.5, Bargad §06 |
| **Manufactured scarcity** | "Only 2 left", "5 people viewing this" | EP-2.5, EP-0.5 |
| **Drip pricing** | A fee revealed at CHK-05; the ₹500 rule enforced first at payment | Founder Brief §9, EP-3.1 |
| **Hidden costs** | Delivery charges not in the cart | EP-3.1, `IH-3` |
| **Forced registration** | An account required to check out | EP-3.2, FLW-03 |
| **Degraded guest path** | Guest gets fewer slots, no coupons, worse price | EP-3.2 |
| **Confirmshaming** | "No thanks, I like paying full price" | EP-0.5, Design Principles §11 |
| **Pre-ticked boxes** | Consent, add-ons, insurance, auto-tips | EP-0.5, Bargad §19 |
| **Sneak into basket** | Anything added the customer did not add | EP-4.6, EP-0.5 |
| **Roach motel** | Easy to join, hard to leave | EP-6.6 |
| **Obstruction** | Cancel buried in Help; a required cancellation reason | EP-0.6, FLW-13/D3 |
| **Nagging** | Repeated prompts for push, reviews, referrals, accounts | EP-1.3, EP-5.4, EP-7.1 |
| **Trick questions** | Double negatives in consent copy | Design Principles §11 |
| **Disguised ads** | A promoted product inside "Best Sellers" | `CP-4` |
| **Friend spam** | Contact access for referral | EP-7.3, FLW-16/D2 |
| **Bait and switch** | A festival post linking to no festival collection | `ENT-R11` |
| **Privacy zuckering** | Location, contacts, or notification permission on arrival | EP-1.3, `ENT-R36` |
| **Auto-applied points** | Spending their balance for them | EP-5.5, FLW-04/D2 |
| **Silent expiry** | Points that vanish without warning | EP-5.5 |
| **Exit-intent capture** | A popup at the doorway | `EXT-R2` |
| **Cart-expiry pressure** | "Your cart expires in 2 hours" | EP-2.6, `RCV-R2` |
| **Abandonment discounts** | A price that appears because they hesitated | §7.4, Product Strategy §5 |
| **Incentivized reviews** | Points for a rating | EP-7.3 |
| **Fake social proof** | Invented review counts, "trending" | `CP-4`, EP-0.5 |
| **Retention offers at cancellation** | "Wait — 10% off?" | EP-0.5, FLW-13 |

## 9.5 Conversion by stage

For each stage: the honest lever, and the shortcut it exists to make unnecessary.

| Stage | The honest lever | The forbidden shortcut it replaces |
|---|---|---|
| First Visit | Answer the delivery question in the first screenful (`CV-3`) | An email-capture popup |
| Browsing | Honest prices and honest stock (`CV-5`) | "Hurry, limited stock" |
| Product | Legible ₹/kg arithmetic; the saving as a gain (`CV-16`) | A red price and a struck-through MRP inflated to make it look bigger |
| Cart | The ₹500 rule resolved here, with the exception (`CV-5`) | Discovering the rule at payment |
| Checkout | Guest as a true peer; COD as a first choice; a visible step count (`CV-8`) | Forced registration; hiding COD |
| Delivery | Push the status; name the person; announce delays with a cause (`CV-15`) | Silence, then apology |
| Repeat | Reorder in one tap; disclose price changes (`CV-6`, `CV-5`) | A win-back discount ladder |
| Community | Invite after delivery; state exactly what will be sent (`CV-4`) | A permanent "Join our WhatsApp!" on every screen |
| Advocacy | Keep the promise; make sharing one tap (`CV-15`) | Contact scraping and referral gamification |

## 9.6 The experiment rule

**`CV-19` — A dark pattern will win the A/B test. That is precisely why it is settled by principle and not by experiment.**

*Reasoning:* a countdown timer raises this week's conversion. It also raises the number of customers who feel hustled — a quantity that shows up months later as repeat rate, and never with a clean attribution back to the timer. Testing it therefore does not answer the question; it produces a number that argues for shipping it. Product Strategy §12 has already decided. Re-litigating a settled decision with a metric is how it gets un-decided.

**`CV-20` — Tests choose between permitted options only.** Two honest layouts, two honest wordings, two honest orderings. Never honest versus dishonest.

**`CV-21` — No test may violate a rule in Documents 01–06 "temporarily, to learn."** There is nothing to learn. We already know it works; that is the objection.

**`CV-22` — Every test declares the guardrail metric it must not harm**, and repeat purchase rate is a guardrail on every test in the product.

## 9.7 Governance

**`CV-23` — Two questions decide any proposed conversion change.**

1. **Which term of the equation does this move — Trust, Relevance, or Effort?** If the answer is "none, but it works", it is a dark pattern wearing a business case.
2. **Would we say this to the customer's face, across the counter, in Hindi?** If the sentence would be embarrassing spoken aloud by the shopkeeper to a neighbour, it does not ship.

*Reasoning:* the second question is the more useful of the two, because it is the actual standard. Everything in this product is ultimately said by the shop to someone who will be back on Thursday. "This offer expires in 4 minutes" is not something a shopkeeper says to a neighbour buying atta. It becomes sayable only when it is written on a screen and attributed to nobody — and that anonymity is the whole mechanism by which good people ship dark patterns.

**`CV-24` — Conversion work that fails `CV-23` is not a trade-off to weigh. It is out of scope.** Product Strategy §12 is not a preference; it is the position.

## 9.8 Open questions for Part 5

| # | Question | Recommendation |
|---|---|---|
| Q11 | Is `ABD-04` (the single, ≥24 h, consented cart reminder) in MVP or V2? | V2. It requires ADM-19's caps to exist first. Shipping the message before the cap is how caps stop existing |
| Q12 | What is the dormancy threshold for `ABD-13` — 60 or 90 days? | 90 days, read against store footfall. Many "dormant" customers are shopping at the counter |
| Q13 | Does a guest who reached CHK-02 but abandoned get *any* contact? | **No** (`ENT-R3`). The number was given for delivery. Recorded so it is not quietly reinterpreted later |
| Q14 | Who owns the ADM-19 frequency caps operationally, and can they be overridden in a festival week? | Founder-owned; **not overridable**. A cap a busy week can override is not a cap (`ENT-R15`) |
| Q15 | Is `ENT-11` (push) contingent on the Android app, or does the web product carry web-push? | App-only. Founder Brief §4: future features must not affect the simplicity of the current website (`ENT-R39`) |
| Q16 | Should delivery-on-slot rate be a published, customer-visible number? | Worth considering post-MVP. It would be the strongest possible expression of `CV-15` — and we should only publish it once it is good |

# 10. Scalability Principles

## 10.1 The claim, and how it is tested

IA §17 makes a promise: *"No future feature should require rebuilding the existing navigation or page hierarchy."* Founder Brief §4 makes a stronger one: *"These future features should NOT affect the simplicity of the current website."*

A promise like that is worthless unless it is falsifiable. So this section first defines what would count as breaking it.

**Architectural redesign** — the thing we are claiming not to need — means any one of:

| # | Redesign indicator | Why it counts |
|---|---|---|
| 1 | A navigation tier, label or bottom-bar slot changes | `NAV-C4`, EP-2.8 — the customer's learned map breaks |
| 2 | An existing screen's purpose changes, or a Screen ID is retired | Part 1 §2.1 — IDs are permanent contracts |
| 3 | The identity model changes (phone + OTP → anything else) | Bargad §19, EP-3.3 |
| 4 | A second source of truth appears for a fact that already has one | `SC-3` below |
| 5 | The customer experience degrades to enable an internal capability | Founder Brief §4 |
| 6 | An existing flow must be re-walked by the customer | EP-5.1, EP-0.2 |

**The test (`SC-0`).** A future capability is architecturally supported if it can be added by (a) new screens under a new prefix, (b) new configuration in an existing admin screen, (c) new data on an existing object, or (d) a new consumer of an existing service — **and nothing in the table above happens.**

Everything in §11 is assessed against that test. Where a capability fails it, this document says so rather than asserting readiness.

## 10.2 The seams

Ten decisions already made in Parts 1–4 are what make the claim true. They are recorded here as **seams** — the places where future capability plugs in without cutting.

| ID | Seam | Already fixed by | What plugs into it |
|---|---|---|---|
| `S1` | **Identity is a phone number, verified by OTP** — no passwords, no email dependency | Bargad §19, EP-3.3, FLW-05/FLW-06 | Android app, Delivery app, Vendor portal, Subscription, Multi-store |
| `S2` | **One catalogue, one inventory, one source of truth** — ADM-05/ADM-06/ADM-08 | Part 1 §2.13 | Inventory sync, AI assistant, Multi-store, Vendor portal |
| `S3` | **The order is an object with a status owned by ADM-04**, read by ORD-02/ORD-03 | Part 1 §2.10, §2.13; FLW-12 | Delivery app (writes status), Android app, Subscription |
| `S4` | **Business rules are configuration, not code** — radius, slots, hours, ₹500 rule, the oils/loose-sugar exception all live in ADM-20 | Part 1 §2.13, ADM-20 | Multi-store, Subscription, Delivery app |
| `S5` | **Content is bilingual data in ADM-16**, with publish blocked on missing parity | Part 1 §2.13 (ADM-16), EP-0.3 | Android app, SEE, AI assistant |
| `S6` | **One trunk, many branches** — website, admin and future app share one navigation geometry | Bargad §01, `NAV-C2` | Android app, Delivery app, Vendor portal |
| `S7` | **Stable IDs** — `MKT-01`, `FLW-03`, `EP-3.1`, `NAV-R8` are permanent references | Part 1 §2.1, Part 2 §3.2 | Everything. A capability can cite what it inherits |
| `S8` | **The SEE contract: themeable slots only** — hero art, greeting, festival accent, one collection section, badges, motifs | Bargad §25, `NAV-C7`, ADM-14 | Seasonal Experience Engine |
| `S9` | **Transactional and promotional are separate channels** with separate consent and separate caps | `ENT-R16`, `RCV-R2`, ADM-19 | Push, Email, Subscription reminders, Delivery app messaging |
| `S10` | **Zero-auth order lookup** — reference + phone (ORD-03) | EP-4.2, Part 1 §2.10 | Delivery app handover, Android app deep links, Multi-store |

**`SC-1` — Scale by configuration, not redesign.** Every capability in §11 must be reachable by adding data, screens or consumers to these ten seams.

*Reasoning:* IA §17 requires it, and it is also the only affordable model. A shop in Pipra cannot fund a rebuild every time it grows a capability; the architecture has to absorb growth or the growth does not happen.

## 10.3 Scalability principles

| ID | Principle | Reasoning |
|---|---|---|
| `SC-2` | **The trunk is shared; the branches vary.** Every future surface — app, delivery app, vendor portal — inherits the roots and trunk (Bargad §01): identity, tokens, tone, error contract, navigation geometry. It varies only in its branches. | Founder Brief §19: every future product inherits the values defined in these documents. A second surface that invents its own trunk is a second brand, and we have one shop |
| `SC-3` | **One source of truth per fact.** Price, stock, address, order status, business rules, content — each has exactly one owner, named in §10.2. | The moment two systems can both say what the price is, the shop starts lying to itself and then to the customer (`CP-1`). Every "sync" capability in §11 is really a question about who owns the fact |
| `SC-4` | **Additive, never mutative.** New capability adds screens under a new prefix, new configuration, new fields. It never renames, reorders or repurposes what exists. | `NAV-C4`, EP-2.8, Part 1 §2.1. A customer who learned where dal lives must find it there after every future release |
| `SC-5` | **The resting state stays complete.** Every capability must be absent without the product feeling broken. | EP-0.7, Bargad §25. This is what makes a capability optional, and optionality is what makes it deferrable |
| `SC-6` | **Inherit values; never renegotiate them.** A new surface does not get its own answer to "do we use dark patterns", "do we need a password", or "is the guest path equal". | Founder Brief §19. Values renegotiated per surface are values held by nobody. The delivery app is where "just this once" gets proposed first |
| `SC-7` | **Every future capability must satisfy at least one of Product Strategy §11's six principles** — increase trust, reduce effort, strengthen local identity, improve convenience, encourage repeat, support scalability. | Product Strategy §11: if it satisfies none, it is not built. This applies to future work exactly as it applies to MVP work |
| `SC-8` | **The current website's simplicity is a constraint on every future feature**, not a starting point to be traded away. | Founder Brief §4, stated as a rule. Most platforms decay by accretion: each capability is individually justified and collectively fatal |
| `SC-9` | **Parity is named before it ships.** Every new destination on any surface declares its route on every other surface. | `NAV-C5`, Bargad §23. Parity that is not written down is parity that erodes on the first deadline |
| `SC-10` | **Deferred is not undecided.** A Future capability's constraints are recorded now, while they are free. | FLW-16 is the precedent: referral is Future, but "never touch contacts" is recorded today because it would be nearly impossible to remove once shipped. Architecture decided in advance is cheap; retraction is not |
| `SC-11` | **The depth budget is re-audited by every capability.** Three taps to the shelf (`NAV-R55`, `NAV-R57`). | Depth is the cheapest thing to add accidentally as the catalogue and the capability set grow (IA §17) |
| `SC-12` | **We scale the shop, not the platform.** No capability may convert MG Supermart into a marketplace, an aggregator, or a delivery network for others. | Founder Brief §6: we are not trying to become Blinkit, Instamart or BigBasket. Multi-store means more of *our* shops (§11.8), not other people's |
| `SC-13` | **No capability creates a second identity system, a second catalogue, a second order object, or a second content store.** | `SC-3`, restated as a prohibition because this is the specific failure mode. Every one of these has an innocent-sounding first version: "the delivery app just needs its own login" |
| `SC-14` | **Cheap-now decisions are made now.** See §10.4. | The whole section is an application of `SC-10` |

## 10.4 Cheap now, expensive later

This is the operative part of Part 5. Each of the following costs almost nothing in MVP and is a near-impossible retrofit afterwards. They are the actual mechanism by which "no redesign" becomes true rather than aspirational.

| # | Decision to make in MVP | Cost now | Cost as a retrofit | Unlocks |
|---|---|---|---|---|
| 1 | **`store_id` on every product, price, inventory row, order, slot and business rule** — with exactly one store | A column and a constant | Rewriting every query, every admin screen and every historical row | Multi-store (§11.8) |
| 2 | **API-first: the website consumes the same API the app will** | Discipline, not effort — Founder Brief §16 already commits to "modern API architecture" | Building a second backend for the app, then reconciling two truths | Android app, Delivery app, Vendor portal, AI assistant |
| 3 | **SKU + barcode as first-class product fields** | Two fields in ADM-06 | Backfilling thousands of SKUs by hand | Inventory sync, SRC-05 barcode search |
| 4 | **Unit and pack size as structured fields, never free text inside the name** | Bargad §20 already requires the unit to be separate | Parsing "Atta 5kg Premium" with regex, forever, wrongly | ₹/kg (§5.9 Q9), AI assistant, Subscription, Inventory sync |
| 5 | **Order status as an enum with an audit trail: who, when, why** | A table | Reconstructing history that was never recorded | Delivery app, EP-4.3 delay causes, ADM-18 |
| 6 | **Idempotency keys on order creation** | A header | Duplicate orders on 3G retries, discovered by customers | Android app, EP-0.4 |
| 7 | **Human-sayable order references** — readable across a counter, dictatable on a phone call | A format decision | Every reference already printed on every bill | ORD-03, `ENT-R20`, EP-0.8 |
| 8 | **Consent as a matrix: channel × category × timestamp**, not a boolean | A table instead of a flag | Untangling who agreed to what, with no evidence | Push, Email, Subscription, `ENT-R16` |
| 9 | **Price as a versioned fact with effective dates** | A table shape | No ability to honour a subscription price or disclose a change (EP-5.6) | Subscription, EP-5.6, ADM-18 |
| 10 | **Themeable slots registered explicitly** — a closed list, not "whatever the CSS allows" | Naming ~7 slots | An SEE that can recolour a button, which Bargad §25 forbids | SEE (§11.5) |
| 11 | **Address as landmark-structured data**, not one text blob | FLW-08 already requires it | No route optimization, no delivery-app usefulness, ever | Delivery app |
| 12 | **Bilingual content with parity enforced at publish** | ADM-16 already requires it | A Hindi app with 60% of the English content | Android app, EP-0.3 |
| 13 | **Loyalty as a ledger, not a balance field** | A table instead of a column | An unauditable balance, which EP-5.5 forbids | LOY-02, Subscription, Referral |
| 14 | **Role-scoped admin from day one (ADM-21)** | Already scoped in Part 1 | Retrofitting permissions onto a tool where everyone could do everything | Delivery app, Vendor portal, Multi-store |

**`SC-15` — These fourteen are MVP scope.** Not because MVP needs them, but because *`SC-1` is a lie without them.* A capability is only "addable later" if the seam it needs exists now.

---

# 11. Future Capability Readiness

Each capability is assessed against `SC-0`. Each carries a verdict:

| Verdict | Meaning |
|---|---|
| **Ready** | The seams exist. Add screens/config/consumers and it lands |
| **Ready with preconditions** | The seams exist *if* a named §10.4 decision is made in MVP |
| **At risk** | An open decision could force a redesign. Named, with the decision required |

## 11.1 Android App

**Source:** Founder Brief §4, §19; IA §17; Product Strategy §10 (Future).

### What it is

A native Android app for the same customers, doing the same things — Founder Brief §5 names Android users as the audience. It is a **branch**, not a new tree (`SC-2`).

### Why no redesign is needed

| The app needs | Already carried by |
|---|---|
| Identity | `S1` — phone + OTP. No password migration, no email dependency, no account merge |
| Navigation | `S6` + Part 3 §4.6 — the five-slot bottom bar *is* an app navigation model. It was designed mobile-first (Bargad §09), so the app inherits it rather than reinterpreting it |
| Screens | `S7` — Part 1 §2's inventory is surface-agnostic. `MKT-01` is a screen, not a web page |
| Flows | Part 2's seventeen flows are stated in screens and decisions, not in routes |
| Content | `S5` — bilingual data, parity enforced at publish |
| Data | §10.4 #2 — the app consumes the same API the website does |
| Order status | `S3` + `S10` — deep links resolve, tracking works without login |
| Push | `S9` + `ENT-R36`–`ENT-R39` — consent model already separated |

### What would break it

| Risk | Prevention |
|---|---|
| A web-only session model that the app cannot inherit | §10.4 #2: API-first from day one |
| The app inventing its own navigation "because native patterns differ" | `SC-2`, `NAV-C2`. Bottom bar, labels on every icon, no hamburger (`NAV-R11`) |
| The app becoming the "real" product and the website the fallback | Founder Brief §4: future features must not affect the simplicity of the current website. `ENT-R39`: nothing in the web product may depend on the app |
| "Install our app" interstitials on the website | EP-1.3. A modal at the door is forbidden regardless of what it advertises |
| Push permission on first launch | `ENT-R36`: after a delivered order, in context, with a reason |
| The app renegotiating values ("native users expect urgency badges") | `SC-6`, EP-0.5 |

### Preconditions

§10.4 #2 (API-first), #6 (idempotency), #8 (consent matrix), #12 (bilingual parity).

**Verdict: Ready with preconditions.** The app is the *least* risky capability here, because Parts 1–4 were written mobile-first and surface-agnostic. It adds no new prefix and no new tier — it is the same shop on a different branch.

## 11.2 Delivery App

**Source:** Founder Brief §4; IA §17 ("Delivery Partner App"); Product Strategy §10 (Future).

### What it is

A staff tool for the person carrying the box. Its entire purpose is to make ADM-04's status update easier than not doing it — because EP-4.1 fails at the source if updating is a chore (Part 2 FLW-12).

### Why no redesign is needed

| It needs | Already carried by |
|---|---|
| Auth | `S1` + ADM-21 — staff identity, role-scoped |
| The order | `S3` — the object already exists, with a status owned by ADM-04 |
| Status writes | `S3` + §10.4 #5 — an enum with an audit trail: who, when, why |
| The address | §10.4 #11 + FLW-08 — landmark-structured, because a text blob is not navigable |
| Customer contact | ADM-10 + `S9` — the human path, with context |
| Short supply | FLW-12/D4 — the conversation already exists as a flow, and EP-4.6 already forbids the silent edit |
| The customer's view | `S3` + `S10` — ORD-02/ORD-03 read what the delivery app writes. **No new customer screen is required** |

### The key insight

The delivery app is **a second writer to an existing object**, not a new system. Part 1 already put the delivery person's name on ORD-02 (EP-4.5) and Part 2 already made status changes push-first (FLW-12). The app does not add a capability to the customer experience — it lowers the cost of a promise already made.

### What would break it

| Risk | Prevention |
|---|---|
| A separate login for delivery staff | `SC-13`. It is ADM-21 with a role |
| A separate order object "because the app needs a simpler shape" | `SC-3`, `SC-13`. One order, one status, one truth |
| Status written to the app but not to ORD-02 | `S3`. The customer's screen reads the same field, or EP-4.1 is theatre |
| Live GPS shipped because the app makes it easy | FLW-12: never as a promise. EP-1.7 — we do not compete on delivery theatre. The named person is the trust object, not the moving dot |
| Rider-facing metrics that pressure staff into false status updates | `RCV-R7`, `CP-1`. A "delivered" tap made to hit a number corrupts the one field the entire arc depends on |
| Messaging the customer from the app outside the transactional channel | `S9`, `ENT-R16` |

### Preconditions

§10.4 #5 (status audit trail), #11 (structured address), #14 (roles). All three are MVP scope per `SC-15`.

**Verdict: Ready.** The seams are the strongest of any capability here, because FLW-12 was written with this app in mind — it names ADM-04's speed as the mechanism.

## 11.3 Vendor Portal

**Source:** Founder Brief §4; IA §17; Product Strategy §10 (Future).

### What it is

A surface for the shop's **suppliers** — purchase orders, deliveries into the shop, invoices, stock arriving. It faces upstream, away from the customer.

### The scope boundary that must be stated now

**`SC-16` — The vendor portal is a procurement tool. It is never a marketplace.** No third-party seller lists products for our customers; no vendor sets a customer-facing price; no vendor sees a customer.

*Reasoning:* Founder Brief §6 (we are not becoming BigBasket) and Product Strategy §5 (our products are genuine, our pricing is transparent) both rest on the shop owning what it sells. A vendor who can list is a marketplace with our name on it, and every trust deposit in §8 was made by *us*, not by a stranger with a login. `SC-12`. This is the capability most likely to drift, because "let the vendor manage their own listings" sounds like efficiency and is a change of business model.

### Why no redesign is needed

| It needs | Already carried by |
|---|---|
| Auth | `S1` + ADM-21 — vendors are a role, not a new identity system |
| The catalogue | `S2` — vendors map their SKUs to ours; ours stay ours (`SC-3`) |
| Inventory in | ADM-08 — the same object stock arrives into |
| A new surface | A new prefix (`VND-`) under `SC-4`. **Zero customer screens change** |
| A quiet door | `NAV-R28`'s precedent — WHL-01 is already footer-only; VND is direct-URL only, like ADM-01 |
| Wholesale relationships | Distinct from vendors. WHL is a *customer* buying in bulk (FLW-17); VND is a supplier selling to us. Two directions, two prefixes, no overlap |

### What would break it

| Risk | Prevention |
|---|---|
| Vendors listing products directly to customers | `SC-16` |
| Vendor-managed pricing reaching the shelf | `SC-3` — ADM-06 owns price. Product Strategy §5 |
| Vendor content (photos, descriptions) bypassing ADM-06's publish rules | Bargad §15 requires real photography. A vendor's stock render is exactly what §15 forbids |
| Vendors appearing in customer navigation | `SC-4`, `NAV-R28` |
| A vendor SLA promise leaking into a customer-facing delivery promise | EP-1.7, EP-3.5 |

### Preconditions

§10.4 #1 (`store_id` — vendors will eventually supply multiple stores), #3 (SKU/barcode — the mapping key), #14 (roles).

**Verdict: Ready with preconditions** — and with `SC-16` recorded now, per `SC-10`, because it is the constraint that would be impossible to reinstate once relaxed.

## 11.4 Inventory Sync

**Source:** Founder Brief §4; IA §17 ("Inventory Synchronization"); Product Strategy §10 (Future).

### What it is

Keeping the online shelf equal to the physical shelf without a human retyping it — which is what ADM-08 exists to guarantee (EP-2.2, EP-4.6).

### The question this capability actually is

**Every sync is a question about who owns the fact (`SC-3`).** The screens are trivial; the ownership is not.

**`SC-17` — One system owns stock. The other reflects it.** Which one is a founder decision (§11.9 Q17), and it must be made *before* the sync is built, not discovered during it.

| Model | Who owns stock | Consequence |
|---|---|---|
| **A — ERP upstream** | The shop's existing billing/ERP system | ADM-08 becomes a read-only mirror + an override log. Counter sales decrement automatically. Highest fidelity; hardest integration |
| **B — Platform upstream** | ADM-08 | The ERP reflects online orders. Simpler, but counter sales must reach ADM-08 or the shelf lies |
| **C — Both write** | — | **Forbidden.** `SC-3`, `SC-13`. This is the model that gets chosen by accident and produces a shop that oversells atta on a Saturday |

*Reasoning for making this a named decision now:* the entire trust deposit at §8.4 is "out of stock says so honestly". A dual-write inventory produces exactly the failure EP-4.6 forbids — a customer's basket silently wrong — and it produces it at festival volume, when it costs the most.

### Why no redesign is needed

| It needs | Already carried by |
|---|---|
| A stock object | `S2` / ADM-08 |
| A mapping key | §10.4 #3 — SKU + barcode |
| Structured units | §10.4 #4 — "5 kg" as data, not text inside a name |
| An override path | ADM-08 already has manual adjustment with a reason |
| Customer honesty | EP-2.2 already requires out-of-stock on the card; the sync changes the *freshness* of that fact, not the contract |
| Store scoping | §10.4 #1 — `store_id` |

### What would break it

| Risk | Prevention |
|---|---|
| Dual-write (Model C) | `SC-17`. Decide before building |
| Sync failure silently showing stale stock | The failure must be visible in ADM-02 and must degrade toward *conservative* (show fewer items available), never optimistic. An optimistic stale stock is a promise we cannot keep, at scale |
| Free-text units making the mapping unreliable | §10.4 #4, Bargad §20 |
| The ERP's product names reaching the shelf | ADM-06 owns customer-facing names, in both languages (`S5`). ERP names are for the back room |

### Preconditions

§10.4 #1, #3, #4. And `SC-17` answered.

**Verdict: At risk** — not technically, but because `SC-17` is unanswered. Q17 is the highest-value open question in Part 5.

## 11.5 Seasonal Experience Engine

**Source:** Founder Brief §13, §20; Product Strategy §6; IA §14; Bargad §25.

### What it is

The capability to change the shop's rangoli — not its courtyard (Bargad §25) — by configuration, on a schedule, with auto-revert.

### Why this is the best-prepared capability in the document

SEE is the one future capability that Documents 01–05 architected explicitly. Founder Brief §20 states the requirement and the deferral in the same breath; Bargad §25 closes the list of what a theme may touch; IA §14 lists the configurable sections and says implementation is not required for MVP. Parts 1–4 then wrote every relevant screen to that contract.

| It needs | Already carried by |
|---|---|
| A theme contract | `S8` + Bargad §25 — a **closed list**: festival accent, festival surface, hero art, greeting, one collection section, badges, motifs |
| A console | ADM-14 (Part 1 §2.13) — themes, scheduling, auto-revert, preview |
| A collection surface | DIS-02 — which in MVP is hand-curated via ADM-15/ADM-16 and **behaves identically to the customer** (FLW-15/E5) |
| Homepage slots | ADM-15, within IA §5's fixed section order (`CP-5`) |
| Content | `S5` / ADM-16 — bilingual, parity enforced |
| Greetings | EP-6.4 — given, not sold. Already a rule, already channel-separated (`S9`) |
| A resting state | EP-0.7, `SC-5` — the shop on an ordinary Tuesday must feel complete |

### What would break it

| Risk | Prevention |
|---|---|
| A theme touching navigation, buttons or semantic colours | `NAV-C7`, Bargad §25 — the list is closed. §10.4 #10: register the themeable slots explicitly, so "themeable" is a set of names and not "whatever CSS reaches" |
| A festival segment appearing in a breadcrumb | `NAV-R36` |
| A festival buying a bottom-bar slot | `NAV-R16` |
| A forgotten Diwali banner in January | Auto-revert dates are mandatory, not manual discipline (Bargad §25, FLW-15/E3) |
| Festival pressure reaching money or machinery | FLW-15: checkout is unchanged. `CP-6`: ≤10% of pixels |
| A greeting with a coupon stapled to it | EP-6.4 |
| The MVP's manual curation being treated as a stopgap that must be replaced urgently | FLW-15/E5: SEE automates *the shop's work*, not the customer's experience. Manual is honest and shippable; the customer cannot tell |

### Preconditions

§10.4 #10 (registered themeable slots), and ADM-15/ADM-16 existing in MVP — which Part 1 already scopes.

**Verdict: Ready.** SEE is a configuration console over a contract that already exists. This is what `SC-1` looks like when it is done properly, and it is worth noting as the model for the rest.

## 11.6 AI Shopping Assistant

**Source:** Founder Brief §4; IA §17; Product Strategy §10 (Future).

### What it is

Help finding, choosing, or reordering — in the customer's own words. Genuinely useful for the personas Founder Brief §5 names: first-time online buyers, senior citizens, customers who will not type a category tree.

### The constraints that must be recorded now (`SC-10`)

This is the capability most capable of violating the most rules, so its boundaries are written while they are free.

| ID | Constraint | Reasoning |
|---|---|---|
| `SC-18` | **The assistant never replaces the human path.** WhatsApp and Call remain one tap away, always, and the assistant hands off rather than deflects. | EP-0.8. In a shop-based relationship "let me just ask them" is the normal resolution path. An AI that exists to reduce contact is an AI that exists to make us less reachable — the opposite of the brand |
| `SC-19` | **It never persuades.** No upsell, no margin-weighting, no urgency, no scarcity, no "customers like you also bought" as a sales device. | EP-0.5, `NAV-R45`. An assistant is a shopkeeper's voice; a shopkeeper who steers you to the higher-margin dal is a shopkeeper you stop trusting. The most dangerous property of this capability is that its persuasion would be invisible and unauditable |
| `SC-20` | **It never invents a fact about stock, price, delivery or a rule.** It reads from `S2`/`S4` or it says it doesn't know and offers a human. | `CP-1`, EP-2.2, EP-3.1. A hallucinated price is our price as far as the customer is concerned, and §8.5's trust-critical moment is the arithmetic |
| `SC-21` | **It is an accelerator, never a required door.** Search (`SRC-01`) and Categories (`CAT-01`) remain the two equal doors. | EP-2.3, `NAV-R2`'s precedent. An assistant-only path excludes anyone who will not converse with a machine — which, for this audience, is most of them at first |
| `SC-22` | **It does not become a chat product.** We do not build a feed, a forum or a messenger to compete with WhatsApp. | EP-6.3: meet the customer where they already live |
| `SC-23` | **It is capped by the same channel rules.** It never initiates contact, never nags, never re-engages. | `ENT-R16`, EP-5.4 |

### Why no redesign is needed

| It needs | Already carried by |
|---|---|
| Catalogue truth | `S2` + §10.4 #3, #4 — structured units and SKUs are what make an assistant answerable rather than plausible |
| Business rules | `S4` — the ₹500 rule and its exception as data, so the assistant reads them instead of paraphrasing them |
| Order context | `S3` |
| A surface | An affordance on existing screens + a new prefix if it needs its own. **No tier changes** (`SC-4`, `NAV-C8`) |
| Language | `S5` — and the assistant must be as good in Hindi as in English, or `EP-0.3` fails at the exact place it matters most |
| Escalation | `S9` + EP-0.8 — the human path already exists everywhere |

### What would break it

Every one of `SC-18`–`SC-23`, plus: an assistant that reorders navigation per user (`NAV-C8`), an assistant whose answers cannot be traced to a source (`CP-1`), or an assistant deployed as a cost-reduction measure for support (`SC-18`).

**Verdict: Ready with preconditions**, structurally — and **the highest-risk capability in this document** behaviourally. Its seams are fine; its temptations are not. That is exactly why §10.4 #4 and `SC-18`–`SC-23` are recorded now.

## 11.7 Subscription Orders

**Source:** Founder Brief §11 ("Schedule Deliveries", "Reorder Previous Purchases"); IA §17; Part 2 FLW-04, FLW-11 (Future).

### What it is

A standing order — the monthly grocery as a rhythm the shop keeps, rather than a task the household re-performs (EP-5.3).

### The precondition that is not technical

**`SC-24` — Subscription may not ship until delivery-on-slot is reliably kept.**

*Reasoning:* Part 2 stated this twice (FLW-04, FLW-11) and it is the most important sentence in this section. A subscription is a repeated promise. EP-3.5 says a slot is a promise; a subscription multiplies one promise into twelve. A shop that misses 1 in 10 slots does not have a subscription product — it has an automated way to disappoint the same customer monthly, and `CV-15` says the kept delivery is the highest-leverage lever we have. Shipping subscription before reliability inverts it.

### Why no redesign is needed

| It needs | Already carried by |
|---|---|
| A basket | ORD-04 / DIS-05 — saved lists are already the V2 path (FLW-11) |
| Address + slot | `S4` + ACC-06 + CHK-03 |
| Identity | `S1` |
| The order object | `S3` — a subscription *generates* orders; it does not create a second kind of order (`SC-13`) |
| Price honesty | §10.4 #9 — versioned prices with effective dates. **Without this, EP-5.6 is unimplementable for a standing order** |
| Change disclosure | EP-5.6, EP-4.6 — already the rule for reorder (FLW-11/D2, D3) |
| Reminders | `S9` + EP-5.4 — and a subscription reminder is *transactional* in nature but must not become a promotional channel by drift |
| Cancellation | FLW-13's rules apply: never obstructed, no retention offer, no required reason |

### What would break it

| Risk | Prevention |
|---|---|
| Forced continuity — hard to cancel, easy to start | EP-6.6, EP-0.5, §9.4. This is the classic subscription dark pattern and it is already forbidden |
| A generated order placed without a reviewable window | EP-0.6, FLW-11/D4 — a one-tap order that skips review is an irreversible step. A subscription order must be pausable and editable *before* it is dispatched, with notice |
| Silent price changes across months | EP-5.6 + §10.4 #9 |
| Auto-substitution when an item is unavailable | EP-4.6. Absolutely — and subscriptions make this tempting because "the box must ship" |
| A subscription discount that makes the non-subscribed price a punishment | Product Strategy §5, EP-3.2's logic |
| Membership (ACC-10) and subscription conflated | Part 1 §2.16 Q4 / Part 2 §3.22 — still open. Two objects or one must be settled first |

### Preconditions

§10.4 #9 (versioned prices), #8 (consent matrix), plus `SC-24`, plus Part 2 Q4 (membership vs loyalty vs subscription object model).

**Verdict: Ready with preconditions** — where the binding precondition is operational, not architectural.

## 11.8 Multi-store Support

**Source:** IA §17; Founder Brief §19 (a foundation for future products).

### What it is

More MG Supermart shops — a second branch in another town, each with its own radius, slots, stock, staff and possibly its own prices.

**It is not a marketplace** (`SC-12`, `SC-16`). Founder Brief §6 forecloses that, and every trust deposit in §8 was made by *this* shop.

### The decision that makes it free or fatal

**`SC-25` — The customer never chooses a store. Their address does.**

*Reasoning:* Product Strategy §6 makes hyperlocality the first differentiator — *"every customer should feel that MG Supermart belongs to their neighbourhood."* A store picker destroys that in one screen: it converts "my shop" into "a chain, and here are the branches", which is precisely the corporate feeling Founder Brief §7 forbids. Serviceability is already answered by the address at CHK-02 (EP-3.4, FLW-08/D1); multi-store makes that answer select a store instead of pass/fail. **This is the difference between a `store_id` column and a redesign of the entire browsing experience.**

### Why no redesign is needed

| It needs | Already carried by |
|---|---|
| Store scoping | §10.4 #1 — `store_id` on every product, price, inventory row, order, slot and rule. **This is the whole capability** |
| Per-store rules | `S4` / ADM-20 already owns radius, slots, hours, minimum order and the oils/loose-sugar exception — as configuration. Multi-store makes ADM-20 per-store |
| Per-store stock | `S2` / ADM-08 + `store_id` |
| Store resolution | CHK-02's serviceability check (FLW-08/D1) becomes a store lookup instead of a boolean |
| Staff scoping | ADM-21 — roles gain a store scope |
| Navigation | **Unchanged.** No new tier, no store picker, no slot in the bottom bar (`NAV-R16`) |
| Content | `S5` — shared brand content; per-store facts (address, hours, phone) already live in ADM-20 |
| Identity | `S1` — one customer, one number, across stores |

### What would break it

| Risk | Prevention |
|---|---|
| A store picker in navigation | `SC-25`, `NAV-R16`, Product Strategy §6 |
| Per-store deployments instead of `store_id` | §10.4 #1. This is the redesign we are avoiding, and it is avoided with a column |
| Third-party stores under our name | `SC-12`, `SC-16` |
| Price differing between stores without a stated reason | Product Strategy §5. Differences are legitimate (different costs) but must never be discoverable as a *surprise* by a customer who moved (EP-5.6's logic) |
| The brand becoming "a chain" in tone | Founder Brief §7: never corporate. Each store keeps its own address, hours, photos and people (Bargad §15) |
| Two customers at one address, two stores | Address resolves to one store, deterministically, and it is stated |

### Preconditions

§10.4 #1 (`store_id`, from day one, with one store), #14 (roles). And `SC-25` recorded now.

**Verdict: Ready with preconditions.** Multi-store is the clearest illustration of `SC-14`: a column added on day one, or a rebuild in year three.

## 11.9 Readiness summary

| Capability | Verdict | Binding precondition | Key constraint recorded here |
|---|---|---|---|
| Android App | Ready with preconditions | API-first (§10.4 #2) | Nothing in the web product may depend on the app (`ENT-R39`) |
| Delivery App | **Ready** | Status audit trail (§10.4 #5) | It is a second writer to an existing order, not a new system |
| Vendor Portal | Ready with preconditions | SKU/barcode (§10.4 #3) | `SC-16` — procurement, never a marketplace |
| Inventory Sync | **At risk** | `SC-17` unanswered | One system owns stock. Dual-write is forbidden |
| Seasonal Experience Engine | **Ready** | Registered themeable slots (§10.4 #10) | The list of themeable slots is closed (Bargad §25) |
| AI Shopping Assistant | Ready with preconditions | Structured units (§10.4 #4) | `SC-18`–`SC-23`. Highest behavioural risk in the document |
| Subscription Orders | Ready with preconditions | `SC-24` — reliability first | A subscription is a promise multiplied by twelve |
| Multi-store | Ready with preconditions | `store_id` (§10.4 #1) | `SC-25` — the address chooses the store, never the customer |

---

# 12. What *would* force a redesign

`SC-0` is only credible if this list exists. These are not forbidden by this document — several are forbidden by Documents 01–02 — but each would break the architecture, and they are recorded so that a future proposal is recognized for what it is rather than debated as a feature.

| # | The change | What breaks | Forbidden by |
|---|---|---|---|
| 1 | **Third-party sellers listing to our customers** | The entire trust model of §8. Every deposit was made by *our* shop | Founder Brief §6, `SC-12`, `SC-16` |
| 2 | **A quick-commerce promise (10-minute delivery)** | The slot model, CHK-03, FLW-12, and EP-1.7 — a promise we cannot keep | Founder Brief §6, Product Strategy §4 |
| 3 | **Passwords or email-primary identity** | `S1`, and with it FLW-05, FLW-06, FLW-07 and every future surface's auth | Bargad §19, EP-3.3 |
| 4 | **Per-store deployments** instead of `store_id` | §11.8 entirely, plus every admin screen | §10.4 #1 |
| 5 | **Public wholesale pricing** | FLW-17, the wholesale relationship model, and the retail price model with it | Founder Brief §12 |
| 6 | **Personalized navigation** | `NAV-C8`, EP-7.2 — "it's under Categories" must be true for the neighbour too | `NAV-C8` |
| 7 | **Dual-write inventory** | `SC-3`, EP-2.2, EP-4.6 — a shop that lies to itself | `SC-17` |
| 8 | **A store picker** | Product Strategy §6's hyperlocality, in one screen | `SC-25` |
| 9 | **First-order conversion as the headline metric** | Not the architecture — the *values*, which is worse, because the architecture would be dismantled to serve it | `CV-1`, `RCV-R7` |

**`SC-26` — Anything on this list is a change of business model, not a feature request.** It is decided by the founder against Documents 01–02, never inside a design review or a sprint.

*Reasoning:* every one of these arrives disguised as an increment. "Let vendors manage their own listings." "Let's just try a 30-minute slot." "The delivery app needs its own login." The disguise is the mechanism; naming the list is the defence.

---

# 13. Open questions for Part 6

| # | Question | Blocks | Recommendation |
|---|---|---|---|
| Q17 | **`SC-17` — which system owns stock: the shop's existing ERP, or ADM-08?** | Inventory sync, ADM-08's entire design, `SC-3` | Decide before ADM-08 is built, not during the sync. Model A or B — never C. **The highest-value open question in Part 5** |
| Q18 | Are the fourteen §10.4 decisions accepted as MVP scope (`SC-15`)? | Every capability in §11 | Yes. Without them, `SC-1` is a claim rather than an architecture |
| Q19 | Do prices differ per store in the multi-store model (§11.8)? | `store_id` design, ADM-06 | Allow the shape; decide the policy later. The column is cheap, the retrofit is not |
| Q20 | Is membership (ACC-10) the same object as subscription? | §11.7, ADM-11, and Part 2 §3.22 Q4 — **still open across three parts** | Settle in Part 6. It now blocks two capabilities |
| Q21 | Does the Android app carry Cowork-style offline order composition (build a basket offline, submit when connected)? | §11.1 scope | Worth scoping. EP-0.4 makes it more valuable here than in most markets |
| Q22 | Who owns `SC-18`–`SC-23` enforcement when the AI assistant is built? | §11.6 | The founder, against this document. An assistant's persuasion is invisible; the constraint cannot be delegated to whoever ships it |

---

# 14. Cross References

## 14.1 The layering model

Six documents now govern this product. They do not overlap, because each answers a different question about the same thing.

| # | Document | The one question it answers | Its verbs |
|---|---|---|---|
| 01 | Founder Brief | **Why does this exist, and what is it not?** | believes, refuses, requires |
| 02 | Product Strategy | **Why would a customer choose us?** | competes, prioritizes, never does |
| 03 | Design Principles | **How should it feel?** | prefers, avoids, before |
| 04 | Information Architecture | **What exists, and how is it organized?** | contains, sits under, connects to |
| 05 | Bargad Design Language | **What does it look like, and what is it made of?** | is 48 px, is Banyan, is 600 ms |
| 06 | Screen Architecture *(this)* | **How does it behave, and what may never happen?** | must, never, because |

**`XR-1` — Document 06 owns behaviour and prohibition. It owns nothing else.**

*Reasoning:* the failure this prevents is the one that kills documentation sets. When a document restates a decision from another document, the restatement eventually drifts, and now there are two answers to one question with no way to tell which is current. Documents 01–05 are the source of truth; 06's value is entirely in the layer between them — the layer where "warm and trustworthy" (03) and "48 px touch targets" (05) become "the ₹500 rule is disclosed in the cart, not at payment, because a rule discovered at CHK-05 is a trap regardless of how warm the copy is."

## 14.2 The non-duplication test

**`XR-2` — If a fact appears in 01–05, Document 06 cites it. If Document 06 restates it, that is a defect in Document 06.**

The test in practice:

| Pattern | Verdict | Example |
|---|---|---|
| 06 states a fact that 01–05 already state | **Duplication — defect** | Restating "the delivery radius is 5 km" as though 06 decided it |
| 06 cites a fact and derives a behaviour from it | **Extension — correct** | "Founder Brief §9 fixes the ₹500 rule → therefore `EP-1.4`: it is stated at the door and resolved in the cart, never first enforced at payment" |
| 06 decides something 01–05 left open | **Extension — correct, and must be flagged** | See §14.8 |
| 06 contradicts 01–05 | **Defect in 06** | See §14.9 |

**`XR-3` — Citation is by section, permanently.** `Founder Brief §9`, `Bargad §25`, `IA §16`. Sections are stable; page numbers and paraphrases are not.

## 14.3 Extension of 01 — Founder Brief

**What it decided and 06 never re-decided:** the vision, the 5 km radius, the ₹500 minimum and its oils/loose-sugar exception, the brand position ("we are not Blinkit"), the personality, the product philosophy, the non-goals, the technical direction, the success metrics, the Seasonal Experience Engine as a Future capability.

**What 06 added:**

| Founder Brief § | It decided | 06 extended it into |
|---|---|---|
| §2, §14 (the shop is real, in a community) | Identity and trust are physical | `EP-1.1`, `ENT-R1` — *every* landing screen carries the proof, not just the homepage; `ENT-02`/`ENT-05` — GBP and QR as first-class architecture; §8's trust ledger — "verifiable" as a structural advantage |
| §4 (future features must not affect current simplicity) | A constraint | `SC-8`; `ENT-R39`; §11's eight readiness assessments; `SC-26` — the list of changes that are business-model decisions, not features |
| §5 (audience characteristics) | Who they are | `EP-0.4` — slow networks as a design constraint, not an edge case; `ASM-09`–`ASM-19`; `NAV-R11` — no hamburger; `ENT-R22` — a domain sayable across a counter |
| §8 (product philosophy) | Priorities in the abstract | `CP-10` — the tie-break: when two elements survive every other rule, the earlier arc stage wins |
| **§9 (the ₹500 rule)** | A business rule | `EP-1.4`, `EP-3.1`, `IH-16`, `FLW-03/D2`, §8.6 — *the single most extended clause in the entire document.* An unusual rule, with an exception, involving money, is the most delicate object in the product |
| §11 (shopping experience) | A capability list | Parts 1–2 — 92 screens and 17 flows |
| §12 (wholesale) | A separate relationship | `FLW-17`, `WHL-01`–`WHL-05`, `ADM-22`, `NAV-R28`, `SC-16` |
| §13, §20 (seasonality, SEE) | A long-term capability | `EP-0.7` — the resting state must be complete; `FLW-15`; `S8`; §11.5 |
| §17, §18 (metrics, non-goals) | What to grow, what to refuse | `RCV-R6` — the anti-metrics; `RCV-R7` — measurable ≠ optimizable; `CV-1` — conversion means ordering *again* |
| §19 (future products inherit these values) | An instruction | `SC-2`, `SC-6` — the trunk is shared; values are inherited, never renegotiated per surface |

**What 06 deliberately did not touch:** the vision, the brand position, the technical stack, the business rules themselves. 06 never sets a radius, a minimum, or a price.

## 14.4 Extension of 02 — Product Strategy

**What it decided and 06 never re-decided:** the mission, positioning, the six differentiators, the customer journey, the four personas, the success metrics, the MVP/V2/Future split, the six product principles, and the twelve prohibitions.

**What 06 added:**

| Product Strategy § | It decided | 06 extended it into |
|---|---|---|
| §4 (we don't compete on speed) | A position | `EP-1.7` — promise only what the shop can keep; `FLW-12` — no live rider GPS, ever, as a promise; `SC-26` #2 — quick commerce is a business-model change |
| §5 (value proposition) | Why they choose us | §8's nine trust-critical moments — the operational form of "pricing is transparent" |
| §6 (hyperlocal) | A differentiator | **`SC-25`** — the address chooses the store, never the customer. A store picker would destroy hyperlocality in one screen |
| §6 (festival commerce) | Festivals are experiences | `FLW-15`; `CP-6` — ≤10% of pixels; `NAV-C7` — navigation is courtyard, never rangoli |
| §8 (personas) | Who we serve | The Primary User column on all 92 screens; `EP-2.3` — two equal doors, because typing excludes one persona and a category tree excludes another |
| §9 (metrics) | What to measure | §7.7 — *how to read them*; `RCV-R6`/`RCV-R7`; `CV-1` — repeat rate is the only number no trick can move |
| §10 (feature priority) | MVP/V2/Future | Release tags on every screen and every optimization in Parts 1–4. **06 never promoted or demoted a single item** |
| §11 (six product principles) | The test for a feature | `SC-7` — applied to future capability exactly as to MVP |
| **§12 (what we will never do)** | Twelve prohibitions | §9.4 — the 25-row dark-pattern catalogue; `CV-19` — *a dark pattern will win the A/B test, which is why it is settled by principle and not by experiment*; `CV-23` — the two governance questions |

## 14.5 Extension of 03 — Design Principles

**What it decided and 06 never re-decided:** the design philosophy, the six core principles, visual personality, the five-second test, colour philosophy, typography priorities, motion, imagery, language, error handling, empty states, performance, seasonality, originality, and the definition of good design.

**What 06 added:**

| Design Principles § | It decided | 06 extended it into |
|---|---|---|
| §3 (trust before conversion) | An ordering | `TJ-R1` — trust is spent in the order it is earned; `EP-6.1`/`EP-7.1` — invite and ask *after* value; `CP-10` |
| §3 (clarity before creativity) | A preference | `IH-2` — one primary action; `IH-1` — **the anger test**, which resolves nearly every real hierarchy argument |
| §5 (the five-second test) | A test | §4.2 — the acceptance test applied per screen, per breakpoint, per language; §5.3 — what is primary on each of the 92 screens |
| §11 (tone) | A voice | `EP-0.1` — one shop, one voice, across web, WhatsApp, phone and counter; `CV-23` #2 — *would we say this across the counter, in Hindi?* |
| §12 (error handling) | Three requirements | `NAV-R48` — the three-part error contract, applied to every error screen *and* every error state, with state preservation added |
| §13 (empty states) | Educate, suggest | `NAV-R54` — empty states are navigation; `EP-2.9`; `SRC-03` as a screen |
| §14 (performance) | Fast builds trust | `EP-1.5` — LCP < 2.5 s as an *experience* requirement of the first-visit stage, owned by this document rather than by engineering |
| §15 (seasonal design) | Enhance, don't replace | `EP-0.7`, `EP-2.8`, `FLW-15` |
| §17 (definition of good design) | Outcomes | Part 1 §1.1 — *those outcomes do not happen on a screen; they happen across screens.* The reason the Experience Principles exist |

## 14.6 Extension of 04 — Information Architecture

**What it decided and 06 never re-decided:** the primary navigation contents, the site map, the homepage section order, the category structure, the search requirements, the product/cart/checkout/account architectures, the wholesale flow, the admin IA, the footer groups, the navigation principles, and the scalability requirement.

**What 06 added:**

| IA § | It decided | 06 extended it into |
|---|---|---|
| §2 (minimize depth) | An intention | `EP-2.4` — a **cap** of three taps; `NAV-R55` — the measurement rule; `NAV-R56`/`NAV-R57` — the consequences and the re-audit obligation. *"Minimized" is an opinion; a cap is enforceable* |
| §3 (nav contents) | What is in the nav | §4.3 — six tiers as **promises about persistence**; §4.4 — the desktop→mobile parity map, because 7 desktop items and 5 mobile slots require the difference to be *named* (`NAV-C5`) |
| §4 (site map) | The hierarchy | Part 1 §2 — 92 screens with purpose, goal, user, entry, exit, relationships, dependencies, actions, criteria |
| §5 (homepage architecture) | 18 sections, in order | `CP-5` — the order is fixed; ADM-15 configures content *within* sections, never the sections |
| §6 (category structure) | The aisles | `NAV-R56` — CAT-01 must expose L2 or the depth budget fails; `NAV-R35` — one canonical breadcrumb per product |
| §7 (search) | Requirements | `EP-2.3` — search as one of two **equal doors**; `NAV-R44` — same card, same filters as CAT-03; `NAV-R45` — ranking answers the customer's question, never ours; `NAV-R47` — zero-results into ADM-18 |
| §8–§11 (PDP, cart, checkout, account) | Sequences | Parts 1–2 — screens, decision points, edge cases, friction classification |
| §12 (wholesale never enters retail) | A prohibition | `FLW-17/D2`, `NAV-R28`, `SC-16` |
| §13 (admin IA) | 16 destinations | Part 1 §2.13 — 23 admin screens, incl. **`ADM-22`, added** (§14.8) |
| §14 (SEE integration) | Structure without implementation | `S8`, §11.5 — a configuration console over a contract that already exists |
| §15 (footer) | Five groups | `NAV-R26`–`NAV-R30` — a map, not merchandising; `NAV-R27` — never the *only* route to anything needed mid-task |
| **§16 (navigation principles)** | Three questions | §4.2 — the acceptance test; `NAV-R8` — back never exits to the browser; the whole of §4 |
| §17 (scalability) | A promise | **The whole of Part 5** — `SC-0` makes the promise falsifiable; §10.4 makes it true; §12 names what would break it |

## 14.7 Extension of 05 — Bargad Design Language

**What it decided and 06 never re-decided:** every token, colour, type scale, spacing rule, component contract, state, motion timing, photography rule, accessibility requirement, responsive rule, and the seasonal theming contract. **Document 06 contains no visual design and no component specification.**

**What 06 added:**

| Bargad § | It decided | 06 extended it into |
|---|---|---|
| §01 (roots and trunk; apnāpan) | The metaphor and the shared trunk | `SC-2` — every future surface inherits the trunk; `NAV-C2` — one navigation geometry across web, admin and app |
| §03, §06 (proportion; colour meaning) | 70/20/10; red discipline | `CP-7`; `EP-2.5` — the shelf never shouts; §9.4 — urgency and scarcity as forbidden levers |
| §08 (bilingual type) | Two scripts, one design | `EP-0.3` — language is dignity; `CP-8` — hierarchy parity + ~15% width budget; `NAV-C6` — language changes words, never structure |
| §13 (icons carry words) | A rule | `NAV-R11` — no hamburger; `NAV-R13` — every nav item carries its word; `IH-18` — "Full ingredients", not "More" |
| §15 (photography is proof) | Real over stock | `EP-1.1`; `CP-4` — real outranks promoted; `ADM-06`'s publish rule; `ASM-31` — and its cost |
| §17, §18 (cart honesty; one primary) | Component contracts | `EP-3.1`; `IH-2`; `NAV-R10` — the floating discs yield to the money action in checkout |
| **§19 (identity is a phone number; no password)** | An identity model | `EP-3.3`; `FLW-05`, `FLW-06`; **`FLW-07`** — Account Recovery, because a "Forgot Password" flow cannot exist here (§14.8); `S1` — the seam every future surface plugs into |
| §21 (navigation components) | Bottom bar, cart, अ/A, quiet doors | The whole of §4 — behaviour, tiers, parity, breadcrumb strategy, error navigation |
| §22 (accessibility) | Requirements | `NAV-C9`; `IH-19`, `IH-20`; `FLW-06/D4` — no lockouts, because a lockout punishes a customer for a rural network |
| §23 (responsive) | Mobile is the original | `NAV-R2`, `NAV-R3` — hover is enhancement only; §4.4's parity map; `SC-9` |
| **§25 (seasonal theming)** | A closed list of themeable slots | `EP-0.7`; `NAV-C7`; `S8`; §10.4 #10 — *register the themeable slots explicitly, so "themeable" is a set of names and not "whatever CSS reaches"* |

## 14.8 Where Document 06 went beyond its sources

Recorded because `XR-2` demands it: these are decisions **06 made** that Documents 01–05 do not dictate. Each is a recommendation carrying the founder's confirmation, not an inherited fact. This register is the honest counterpart to the claim that 06 does not reinterpret its sources.

| # | 06's decision | Where | Basis | Status |
|---|---|---|---|---|
| 1 | **`FLW-07` Account Recovery replaces "Forgot Password"** | Part 2 §3.4 | Bargad §19 has no passwords, so the requested flow could not be designed without contradicting Document 05 | Substitution stated openly; needs acknowledgement |
| 2 | **Loyalty is accrued to the phone number and claimed, not enrolled** | Part 2 §3.18 | Founder Brief §11 commits to earning rewards but specifies no enrollment step; `EP-6.1` forbids an ask before value | **`OQ-05` — open, blocking** |
| 3 | **`ADM-22` Wholesale Requests added** | Part 1 §2.13 | IA §13 does not list it, but `WHL-02` has nowhere to land without it | Flagged at Part 1 delivery |
| 4 | **`SUP-04`–`SUP-06` (404, offline, maintenance) added under Support** | Part 1 §2.11 | IA lists no system screens; `EP-0.4` makes them designed states of the arc | Accepted implicitly |
| 5 | **CAT-01 is the mobile Shop entrance; SHP-01 becomes desktop-primary** | Part 3 §4.4 | IA §3 labels the tab "Categories"; the depth budget fails otherwise | **`OQ-01` — open** |
| 6 | **`NAV-R55` — a product is "reached" when its card is visible and addable** | Part 3 §4.15 | `EP-2.4` was 06's own principle and was ambiguous; Bargad §20 makes the card transactional | Recorded; internally consistent |
| 7 | **`SC-16` — the vendor portal is procurement, never a marketplace** | Part 5 §11.3 | Derived from Founder Brief §6 + Product Strategy §5; not stated anywhere as such | Recorded per `SC-10` |
| 8 | **`SC-25` — the address chooses the store, never the customer** | Part 5 §11.8 | Derived from Product Strategy §6 | Recorded per `SC-10` |
| 9 | **`SC-24` — subscription may not ship before delivery reliability** | Part 5 §11.7 | Derived from `EP-3.5` + `CV-15` | Recorded |
| 10 | **`RCV-R7` — any metric may be measured; not every metric may be optimized** | Part 4 §7.7 | Derived from Product Strategy §12; the enforcement mechanism is 06's | Recorded |
| 11 | **The transactional / promotional channel split (`ENT-R16`)** | Part 4 §6.7 | Not stated in 01–05; derived from `EP-4.1` + `EP-6.2` | Recorded; feeds `ADM-19` |
| 12 | **The ten seams and the fourteen cheap-now decisions** | Part 5 §10.2, §10.4 | IA §17 requires the outcome; the mechanism is 06's | **`OQ-18` — needs acceptance as MVP scope** |

## 14.9 Conflict protocol

**`XR-4` — Precedence is 01 → 02 → 03 → 04 → 05 → 06.** Where 06 appears to conflict with 01–05, **06 is defective** and is corrected. The senior document is never amended to accommodate the junior one.

**`XR-5` — A conflict is a document event, not a design-review event.** It is recorded, the correction is made in 06, and the version history says so. It is never resolved by a designer choosing the more convenient reading in the moment.

**`XR-6` — Where 01–05 are silent, 06 may decide — and must flag it in §14.8.** Silence is not permission to be quiet about it.

*Reasoning for all three:* a documentation set decays through small, reasonable, undocumented reinterpretations. Each is defensible; collectively they mean the approved documents no longer describe the product. The protocol costs a paragraph and prevents that.

---

# 15. Assumptions

Every architecture rests on things it did not verify. Recording them converts a hidden risk into a testable one.

**Confidence:** `High` — stated in 01–05 or directly observable. `Medium` — reasonable, unverified. `Low` — a real risk to the architecture.

## 15.1 Business assumptions

| ID | Assumption | Basis | Conf. | If wrong |
|---|---|---|---|---|
| `ASM-01` | The shop's offline reputation is positive and transfers online | Founder Brief §2 | High | The whole trust model of §8 inverts — the website would have to *build* trust rather than reflect it |
| `ASM-02` | The 5 km radius and ₹500 minimum are stable through MVP | Founder Brief §9 | High | `ADM-20` absorbs it — they are configuration (`S4`), not code |
| `ASM-03` | Cooking oils and loose sugar are the **only** minimum-order carve-outs | Founder Brief §9 names exactly these | Medium | A second exception makes the cart's arithmetic harder to state plainly, and §8.6's trust-critical moment gets more delicate |
| `ASM-04` | The shop can staff same/next-day slots reliably enough to honour `EP-3.5` | Implied by Founder Brief §11 | **Low** | The most dangerous assumption in the document. `CV-15` names the kept delivery as the highest-leverage lever; `SC-24` blocks subscription on it; §8.8's withdrawal is "the relationship" |
| `ASM-05` | Wholesale pricing stays relationship-based and private | Founder Brief §12 | High | `FLW-17` and `SC-26` #5 |
| `ASM-06` | One store at launch | Founder Brief §2 | High | §10.4 #1 (`store_id`) exists precisely so this can change cheaply |
| `ASM-07` | COD is operationally viable and is the majority payment method initially | Derived from Founder Brief §5 | Medium | `EP-3.7` treats it as a first-class peer either way; cash handling and reconciliation are an operational load this document does not size |
| `ASM-08` | The shop can absorb small costs from post-packing cancellations | `FLW-13/E1`; Founder Brief §8 | Medium | `FLW-13` would need a stated cancellation window with real consequences — still honest, but less generous |
| `ASM-09` | Delivery staff exist, are known, and can be named to the customer | `EP-4.5` | Medium | §8.8's trust-critical moment (the handover) loses its mechanism |

## 15.2 Customer and context assumptions

| ID | Assumption | Basis | Conf. | If wrong |
|---|---|---|---|---|
| `ASM-10` | Android-dominant, low-end devices | Founder Brief §5 | High | — |
| `ASM-11` | 2G/3G is typical and intermittent | Founder Brief §5 | High | `EP-0.4` and every degradation rule |
| `ASM-12` | A phone number is a workable identity, and **one number per household** is the working model | Bargad §19; `FLW-05/E2` | Medium | `OQ-08`. If households need multiple identities, `ACC-*`, `ADM-09`/`ADM-10` and loyalty all change shape |
| `ASM-13` | WhatsApp is near-universal in this audience | Founder Brief §5, §14 | High | `S9`, `ENT-04`, and most of §7.6 |
| `ASM-14` | Many customers have no working email | Founder Brief §5 (no email in the audience description); `ACC-03` makes it optional | High | `ENT-R33` — email is never the primary channel |
| `ASM-15` | **Hindi + English covers the audience's *reading*, even though East Champaran's spoken language is largely Bhojpuri** | Founder Brief §10 specifies English and Hindi | **Low** | Reading in Hindi is standard here, so the *written* product is probably safe. But `SRC-04` (voice search, Future) assumes spoken Hindi, and a customer who *speaks* Bhojpuri to a Hindi recognizer gets a broken feature. Flagged now per `SC-10` |
| `ASM-16` | Customers can read at a level that makes labelled navigation sufficient | Founder Brief §5; Bargad §13 | Medium | Icons-plus-words is the mitigation; voice (`SRC-04`) is the eventual answer |
| `ASM-17` | Landmark-first addressing is how delivery actually works here | Bargad §19; `FLW-08` | High | `EP-3.4`, §10.4 #11, the delivery app's usefulness |
| `ASM-18` | Shared and family devices are common | `FLW-06/E5`, `FLW-07/E3` | Medium | Session and identity-switch behaviour |
| `ASM-19` | Customers verify our prices against the counter from memory | Founder Brief §2; §8.4 | High | This is our exposure *and* our advantage — it is why honesty is the only available strategy (§8.2) |
| `ASM-20` | Most first-time online buyers fear irreversibility more than price | Part 2 §3.7 | Medium | `EP-3.6`, `EP-0.6`, the entire checkout design |

## 15.3 Technical assumptions

| ID | Assumption | Basis | Conf. | If wrong |
|---|---|---|---|---|
| `ASM-21` | **API-first is adopted: the website consumes the same API the app will** | Founder Brief §16 ("modern API architecture"); §10.4 #2 | Medium | §11.1, §11.2, §11.3, §11.6 all degrade to "build a second backend, then reconcile two truths" (`SC-3`) |
| `ASM-22` | SMS deliverability is unreliable enough to make `FLW-07` load-bearing | `FLW-06`, `FLW-07` | High | `OQ-09` — WhatsApp OTP would move from V2 to MVP |
| `ASM-23` | WhatsApp Business API is available and affordable at this scale | `S9`, §7.6 | **Low** | `ENT-04`, `RCV-R2` and most of the re-engagement model assume it. If it is not affordable, SMS + the phone carry the load and `EP-4.1` gets more expensive |
| `ASM-24` | A payment provider supports UPI and coexists with COD reconciliation | `CHK-05` | Medium | `EP-3.7` |
| `ASM-25` | The catalogue is low thousands of SKUs, not hundreds of thousands | Implied by a single neighbourhood supermarket | High | Search, `CAT-01`'s L2 exposure (`NAV-R56`), and `ASM-31` all scale on this |
| `ASM-26` | Launch order volume is tens per day, not thousands | Implied by Founder Brief §2 | High | `ADM-03`/`ADM-04` design; slot capacity |
| `ASM-27` | Staff have smartphones capable of running `ADM-04` while packing | Part 3 §4.16 | Medium | `EP-4.1` fails at the source (`FLW-12`) |
| `ASM-28` | Hosting/CDN can serve Bihar at the latency `EP-1.5` requires | Founder Brief §16 (performance-first) | Medium | `EP-1.5` is a *trust* requirement, not a performance target |
| `ASM-29` | The fourteen §10.4 decisions are accepted as MVP scope | `SC-15` | **Unconfirmed** | **`SC-1` becomes a claim rather than an architecture.** `OQ-18` |

## 15.4 Operational assumptions

| ID | Assumption | Basis | Conf. | If wrong |
|---|---|---|---|---|
| `ASM-30` | A named human answers WhatsApp within working hours | `EP-0.8`, §7.6 | Medium | `EP-0.8` is load-bearing in ~30 rules. An unanswered WhatsApp is worse than no WhatsApp |
| `ASM-31` | **Real photography is producible at catalogue scale** | Bargad §15; `ADM-06`'s publish rule | **Low** | `ADM-06` currently forbids publishing without a real photo. At ~2,000 SKUs this is a real constraint. **Recommended reading:** a photograph of *the actual pack the shop stocks* satisfies Bargad §15 (it is proof); a lifestyle or stock render does not. Needs confirmation — `OQ-24` |
| `ASM-32` | Staff will update order status if it is fast enough | `FLW-12`, Part 3 §4.16 | Medium | Push-first tracking becomes theatre; `EP-4.1` fails |
| `ASM-33` | The `ADM-19` frequency caps have a named owner and cannot be overridden | Part 4 `OQ-14` | **Unconfirmed** | `ENT-R15`. A cap a festival week can override is not a cap |
| `ASM-34` | Shop staff can maintain bilingual content in `ADM-16` | `S5`, `EP-0.3` | Medium | Content parity becomes a developer dependency, and Hindi silently degrades |
| `ASM-35` | Shop staff can maintain local synonyms in `ADM-05`/`ADM-07` | `FLW-09/E2` | Medium | Search fails on the neighbourhood's own vocabulary — the thing it exists to understand |
| `ASM-36` | The festival calendar is known far enough ahead to plan slot capacity | `FLW-15/E2` | High | The one operational failure customers will not forgive |

## 15.5 Content, commercial and regulatory assumptions

| ID | Assumption | Basis | Conf. | If wrong |
|---|---|---|---|---|
| `ASM-37` | **The tax/GST treatment of orders does not change `ORD-06`, `ADM-06` or price display** | **No basis — Documents 01–06 are silent on tax** | **Low** | **See gap `G-04`.** A GST-registered supermart issuing tax invoices implies HSN codes and tax rates on `ADM-06`, a compliant `ORD-06`, and a decision on inclusive vs exclusive price display — which touches `EP-2.2` and §8.5's arithmetic. This is the largest unexamined area in the document |
| `ASM-38` | A legal entity and real policy text exist for `MKT-06` | IA §15 | Medium | `MKT-06`, `FLW-13`, `IH-13` |
| `ASM-39` | Commercial WhatsApp messaging is permissible with the consent model in `S9` | `ENT-R16` | Medium | §7 |
| `ASM-40` | Customer photographs can be used with the consent model in `EP-6.5` | Bargad §15 | Medium | §8.10 |

## 15.6 Scope assumptions

| ID | Assumption | Basis | Conf. |
|---|---|---|---|
| `ASM-41` | MVP is the website only; no Android app | Product Strategy §10 | High |
| `ASM-42` | SEE is hand-curated in MVP; `ADM-14` is Future | Founder Brief §20; `FLW-15/E5` | High |
| `ASM-43` | Referral, reviews and recommendations are not in MVP | Product Strategy §10 | High |
| `ASM-44` | Wholesale in MVP is inquiry-to-human only; no self-service ordering | Founder Brief §12; `FLW-17` | High |

**`ASM-R1` — Assumptions are re-read at the start of every milestone.** The four `Low`-confidence entries (`ASM-04`, `ASM-15`, `ASM-23`, `ASM-31`, `ASM-37`) are the ones that would change this architecture rather than merely inconvenience it.

---

# 16. Architecture Validation Checklist

## 16.1 Method

Each criterion is stated as a **test**, answered with **evidence** (by ID, so it is checkable), and given a verdict:

| Verdict | Meaning |
|---|---|
| **PASS** | The test is met by the document as written |
| **CONDITIONAL** | Met, provided a named decision is made or a named gap is closed |
| **GAP** | Not met. Stated plainly |

A validation section that returns seven passes has validated nothing. Three of the seven below are not clean passes.

## 16.2 ✓ Every screen has a purpose

| | |
|---|---|
| **Test** | Does every screen in the inventory state a purpose, a primary goal and a primary user — and would its absence be felt? |
| **Evidence** | Part 1 §2 — 92 screens across 12 domains, each with Table A (Purpose · Primary Goal · Primary User · Release), Table B (Entry · Exit · Relationships · Dependencies), Table C (Key Actions · Success Criteria). Part 1 §1.11 applies Product Strategy §11's test: *a screen that carries no `EP` is a screen that does not need to exist.* Part 1 §2.15 traces every IA section to the screens that cover it |
| **Verdict** | **PASS** |
| **Residual** | `ADM-22` was added beyond IA §13 (§14.8 #3). `SUP-04`–`SUP-06` were added beyond IA §4 (§14.8 #4). Both are declared, neither is silent |

## 16.3 ✓ Every journey is complete

| | |
|---|---|
| **Test** | Does every journey a real customer can take have a defined path, with decision points, edge cases and failure handling — and does every screen belong to at least one journey? |
| **Evidence** | Part 2 §3 — 17 flows, each with Goal, Trigger, Steps, Decision Points, Edge Cases, Friction (classified `ACCEPTED`/`REDUCIBLE`/`DEFECT`) and Optimization Opportunities. Part 2 §3.3 maps every flow to an arc stage. `EP-0.2` requires flows to hand off rather than restart |
| **Verdict** | **CONDITIONAL** |
| **Residual gaps** | **`G-05` — Store pickup** appears as an exit in `FLW-08/D1`, `FLW-03/D3` and §4.12's error navigation, but it is **not a screen in Part 1 and not a flow in Part 2.** It is currently an escape hatch with no architecture behind it. **`G-06` — Membership purchase and renewal has no flow.** `MKT-05` markets it and `ACC-10` shows its status, but nothing designs the act of joining, paying or renewing. **`G-07` — `ORD-07` (Rate Your Order)** is `V2` with no flow, which is acceptable, but it is the mechanism `EP-7.1` depends on. **`G-01`** — without a state model, "complete" means complete at the flow level, not at the state level |

## 16.4 ✓ Navigation is consistent

| | |
|---|---|
| **Test** | Does the same destination behave the same way everywhere, at every breakpoint, in both languages — and can it drift? |
| **Evidence** | Part 3 §4 — six tiers as persistence promises (§4.3); 57 rules (`NAV-R1`–`NAV-R57`); nine consistency principles (`NAV-C1`–`NAV-C9`). `NAV-C1` one vocabulary; `NAV-C3` position is memory; `NAV-C4` order is a promise; `NAV-C5` parity named, not assumed; `NAV-C6` language changes words, never structure; `NAV-C7` navigation is courtyard, never rangoli; `NAV-C8` no personalized navigation. §4.4 — the desktop→mobile parity map. §4.13 — the fifteen rules most likely to be broken by a well-meaning designer, gathered for one-pass review |
| **Verdict** | **PASS** |
| **Residual** | `OQ-01` and `OQ-02` (CAT-01 as the mobile Shop entrance; CAT-01 exposing L2) are recommendations awaiting confirmation. If `OQ-02` is declined, §4.15's depth budget fails and `NAV-R56` must be reopened |

## 16.5 ✓ Mobile-first

| | |
|---|---|
| **Test** | Was the mobile experience designed first and the desktop derived — or the reverse, dressed up? |
| **Evidence** | Part 3 §4.5 — *"Mobile is the original, not the compromise"* (Bargad §09, §23); the fixed vertical stack; `NAV-R11` no hamburger; `NAV-R12` the bottom bar never hides. §4.6 — five slots, each justified, with the Wishlist exclusion argued rather than assumed. §4.15 — a depth budget audited from a cold mobile home. §4.4 — desktop framed as *"the same shop with a wider counter"*; `NAV-R2`/`NAV-R3` make hover an enhancement only. Part 2 — every flow's edge cases are written for 2G, shared devices and keypad typing (`EP-0.4`). Part 1 §2.13 — even the admin panel's mobile subset is justified by `FLW-12`, not by symmetry |
| **Verdict** | **PASS** |
| **Residual** | None. This is the criterion the document meets most completely, because Documents 03 and 05 had already settled it and 06 only had to hold the line |

## 16.6 ✓ Accessibility

| | |
|---|---|
| **Test** | Is the product usable by elderly customers, first-time smartphone users, users on slow connections, users with limited digital literacy, and users of assistive technology — as a **requirement**, not a feature (Design Principles §3)? |
| **Evidence** | `NAV-R13` every nav item carries its word; `NAV-R14` active state never colour alone; `NAV-C9` keyboard reachability and screen-reader labelling in the right language; `IH-19` nothing revealed only on hover, long-press or swipe; `IH-20` collapsed content findable by screen readers; `CP-9` accessibility outranks density; `EP-0.3` language parity; `EP-0.4` slow networks as a design constraint; `FLW-06/D4` **no lockouts** — a lockout punishes a customer for a rural network; `EP-2.3` two equal doors, because typing excludes one persona and a category tree excludes another; Bargad §22 inherited whole |
| **Verdict** | **CONDITIONAL** |
| **Residual gaps** | **`G-08` — no conformance target is named anywhere in Documents 01–06.** "Accessibility is a requirement, not a feature" (Design Principles §3) is a value; WCAG 2.2 AA is a testable claim. Without one, accessibility is asserted per rule and audited by nobody. **`ASM-15`** — voice search (`SRC-04`) assumes spoken Hindi in a Bhojpuri-speaking district; the accessibility feature aimed at elderly and low-literacy customers is the one this assumption threatens. **`ASM-16`** — literacy is assumed sufficient for labelled navigation, unverified |

## 16.7 ✓ Future scalability

| | |
|---|---|
| **Test** | Can the eight future capabilities be added without architectural redesign — and is that claim falsifiable? |
| **Evidence** | Part 5 §10.1 — `SC-0` defines what "redesign" means (six indicators), making the claim testable rather than rhetorical. §10.2 — ten seams (`S1`–`S10`). §10.3 — fifteen principles. §10.4 — fourteen cheap-now/expensive-later decisions. §11 — eight readiness assessments with honest verdicts, including one **At risk**. §12 — nine changes that *would* force a redesign, so the claim has a boundary. `SC-26` — those nine are business-model decisions, not feature requests |
| **Verdict** | **CONDITIONAL** |
| **Residual gaps** | **`OQ-17`** — who owns stock (the ERP or `ADM-08`) is unanswered, and it determines `ADM-08`'s design *in MVP*. Inventory Sync is assessed **At risk** for this reason. **`OQ-18`** — the fourteen §10.4 decisions are unconfirmed; without them `SC-1` is a claim, not an architecture. **`OQ-05`** — the loyalty object model is open across three parts and now blocks two capabilities |

## 16.8 ✓ Implementation readiness

| | |
|---|---|
| **Test** | Can Milestone 4 (design) and engineering begin from this document? |
| **Evidence for** | 92 screens with permanent IDs, purpose, entry/exit, dependencies and success criteria · 17 flows with decision points and edge cases · 57 navigation rules · 21 information-hierarchy rules · a classified friction register · an entry/exit model · a trust map with nine critical moments · a conversion policy with an explicit prohibition catalogue · a scalability model with fourteen named MVP data decisions |
| **Evidence against** | **`G-01`** — no state architecture. **`G-02`** — no content model, though `ADM-16` is cited 20+ times. **`G-03`** — no configuration model, though `ADM-20` is load-bearing for `S4`, `SC-25` and multi-store. **`G-04`** — tax/GST unaddressed across all six documents. **26 open questions**, three of them blocking. **`G-05`**, **`G-06`** — two journeys with no architecture |
| **Verdict** | **CONDITIONAL — split by discipline** |

| Discipline | Ready? | Reasoning |
|---|---|---|
| **Design (Milestone 4)** | **Yes, for the customer surface** | Every screen has a purpose, a primary action, an information hierarchy and a navigation contract. A designer can start on `MKT-01`, `CAT-03`, `SHP-02`, `SHP-04` and `CHK-*` today |
| **Design — admin** | **Partially** | `ADM-14`, `ADM-15`, `ADM-16`, `ADM-19` and `ADM-20` all depend on the configuration and content models that `G-02`/`G-03` do not provide |
| **Engineering — data model** | **No** | `G-01`, `G-02`, `G-03`, `OQ-17`, `OQ-18`. The fourteen §10.4 decisions must be accepted first, because they are the schema |
| **Engineering — API** | **No** | Depends on the data model |
| **Engineering — frontend scaffolding** | Yes | Routes, navigation, tiers, tokens (Bargad) are all settled |

**`VAL-1` — Implementation readiness is not a single state.** Declaring the whole document "ready" would be the most consequential inaccuracy it could contain, because it would authorize schema decisions that §16.7 has already flagged as unmade.

## 16.9 Consolidated gap register

| ID | Gap | Severity | Where it bites | Recommendation |
|---|---|---|---|---|
| `G-01` | **State architecture unwritten** — deferred from Parts 3, 4 and 5, then displaced by closure | **Blocking** for engineering | Every screen's loading/empty/error/offline states are *ruled* (`NAV-R48`, `NAV-R54`, `IH-16`) but never *modelled*. Session, cart persistence, order state machine, identity switching | **Document 07 — State Architecture.** Not a Part 7 of 06; this document is closed |
| `G-02` | **Content model unwritten** | **Blocking** for `ADM-16` | `ADM-16` is cited 20+ times and required to enforce bilingual parity at publish (`S5`, `EP-0.3`) | Document 07 or 08 |
| `G-03` | **Configuration model unwritten** | **Blocking** for `ADM-20`, multi-store | `S4` and `SC-25` both rest on business rules being data. `ADM-20` is the single source for radius, slots, hours, the ₹500 rule and its exception | Document 07 or 08 |
| `G-04` | **Tax/GST unaddressed in Documents 01–06** | **High** | `ORD-06` (invoice), `ADM-06` (HSN, tax rate), price display (inclusive/exclusive), which touches `EP-2.2` and §8.5's arithmetic | Founder decision, then amend `ADM-06`/`ORD-06`. `ASM-37` |
| `G-05` | **Store pickup has no screen and no flow** | Medium | Used as an exit in `FLW-08/D1`, `FLW-03/D3` and §4.12 | Either architect it (a `SHP-` or `CHK-` screen + a flow) or remove it from the error paths. An escape hatch with nothing behind it is worse than no escape hatch |
| `G-06` | **Membership purchase/renewal has no flow** | Medium | `MKT-05` markets it; `ACC-10` shows status; nothing designs joining or paying | Blocked by `OQ-05` (the object model) |
| `G-07` | **`ORD-07` has no flow** | Low | `V2`; but `EP-7.1` depends on it | Acceptable for now; flag at Milestone for V2 |
| `G-08` | **No accessibility conformance target** | Medium | §16.6 | Name one (WCAG 2.2 AA is the reasonable default) so the value becomes testable |
| `G-09` | **Open-question numbering collided across parts** | Low — now closed | Parts 1 and 2 used local series; Parts 3–5 shared `Q1`–`Q22` | Fixed by the canonical `OQ-` register in §17.2 |
| `G-10` | **`ADM-06`'s "no publish without a real photo" may be unaffordable at catalogue scale** | Medium | `ASM-31`, Bargad §15 | Confirm the reading: a photo of the actual stocked pack is proof; a stock render is not. `OQ-24` |

---

# 17. Document Status & Closure

## 17.1 What Document 06 is

Document 06 is the behavioural layer of the MG Supermart platform: **92 screens, 17 flows, and roughly 200 numbered rules that say what must happen and what may never happen** — each one traced to a clause in Documents 01–05 or declared in §14.8 as a decision this document made.

It contains no UI, no wireframes, no mockups and no code, by design.

Its central claim is that a neighbourhood shop's advantages — being real, being 5 km away, being verifiable, being answerable — are not a constraint to be worked around but the strongest architecture available in this market. Almost every rule in this document is a consequence of taking that seriously.

## 17.2 Canonical open questions

Parts 1–5 each carried questions forward to a part that would resolve them. The document now closes, so they resolve here — into one register with permanent IDs. **This register supersedes the local numbering in Part 1 §2.16, Part 2 §3.22, Part 3 §4.17/§5.9, Part 4 §9.8 and Part 5 §13**, which collided (`G-09`).

### Blocking — decide before engineering begins

| ID | Question | Origin | Recommendation |
|---|---|---|---|
| `OQ-17` | **Which system owns stock — the shop's existing ERP, or `ADM-08`?** | P5 Q17 | Model A or B, never C (dual-write). It determines `ADM-08`'s design *in MVP*, and deciding it during the integration is how Model C gets chosen by accident |
| `OQ-18` | **Are the fourteen §10.4 cheap-now decisions accepted as MVP scope?** | P5 Q18 | Yes. They are the schema. Without them `SC-1` is a claim, not an architecture |
| `OQ-05` | **Membership, loyalty and subscription: one object, two, or three?** | P1 Q4 · P2 Q4 · P5 Q20 | **Open across three parts.** Now blocks `ADM-11`, `ADM-12`, `G-06` and §11.7 |

### High — decide before or during Milestone 4

| ID | Question | Origin | Recommendation |
|---|---|---|---|
| `OQ-01` | Is CAT-01 the mobile Shop entrance, making SHP-01 desktop-primary? | P1 Q1 · P3 Q1 | Yes (Part 3 §4.4) |
| `OQ-02` | Does CAT-01 expose L2 subcategories directly? | P3 Q2 | Yes — or §4.15's depth budget fails (`NAV-R56`) |
| `OQ-03` | Loyalty: enrolled, or accrued by phone number and claimed? | P2 Q1 | Accrued and claimed — the only model consistent with `EP-6.1` and `EP-3.2` |
| `OQ-04` | Do guest orders earn loyalty? | P2 Q2 | Yes. Otherwise loyalty is a hidden penalty on the guest path |
| `OQ-06` | Do points expire, and on what terms? | P2 Q3 | If yes: warned well before, in the customer's channel. Silent expiry is prohibited by `EP-5.5` |
| `OQ-08` | Is a household one account (one phone) or many? | P2 Q4 | One number = one household account, with a clean identity switch |
| `OQ-09` | Is WhatsApp OTP MVP or V2? | P2 Q5 | **Strong MVP candidate.** It is the root cure for the most common failure in the product (`ASM-22`) |
| `OQ-10` | Cancellation window by order stage, and refund SLA? | P2 Q6 | Founder decision; must be stated on `ORD-05` *before* the tap (`EP-3.1`) |
| `OQ-11` | Festival-week slot capacity policy? | P2 Q7 | Plan and publish in advance. A missed Chhath delivery is remembered for years |
| `OQ-14` | Who owns `ADM-19`'s caps, and can a festival week override them? | P4 Q14 | Founder-owned; **not overridable** (`ASM-33`) |
| `OQ-24` | Does a photo of the actual stocked pack satisfy Bargad §15? | `G-10` | Yes — it is proof. A stock render is not |
| `OQ-25` | **What is the tax/GST treatment, and does it change `ORD-06`, `ADM-06` or price display?** | `G-04` | New. The largest unexamined area in the document |
| `OQ-26` | **Is store pickup real? If so it needs a screen and a flow; if not, remove it from the error paths.** | `G-05` | New |

### Medium — resolve during Milestone 4

| ID | Question | Origin |
|---|---|---|
| `OQ-07` | Does `ORD-03` need rate limiting, and at what threshold? *(Yes — rate-limit the lookup, never access to a human)* | P1 Q3 · P2 Q8 |
| `OQ-12` | Is `DIS-05` Monthly Grocery a collection, a saved list, or both? | P1 Q2 |
| `OQ-13` | Does `SUP-03` need a form, or is it a WhatsApp handoff with order context? *(`EP-0.8` argues for the latter)* | P1 Q5 |
| `OQ-15` | Announcement bar: dismissible, and persisted per session? | P3 Q3 |
| `OQ-16` | Does the delivery strip persist on inner pages? | P3 Q4 · P3 Q6 |
| `OQ-19` | Where does Membership sit for a guest on mobile? | P3 Q5 |
| `OQ-20` | Reviews on `SHP-02`: secondary or tertiary? | P3 Q7 |
| `OQ-21` | How is ₹/kg surfaced without breaking the card's calm? | P3 Q9 |
| `OQ-22` | Does the ₹500 rule appear on every shelf, or only `MKT-01` + `SHP-04`? | P3 Q10 |
| `OQ-23` | Is the `ABD-04` cart reminder MVP or V2? *(V2 — it requires `ADM-19`'s caps to exist first)* | P4 Q11 |
| `OQ-27` | Dormancy threshold: 60 or 90 days? *(90, read against footfall)* | P4 Q12 |
| `OQ-28` | Do prices differ per store in multi-store? *(Allow the shape; decide the policy later)* | P5 Q19 |
| `OQ-29` | Does the Android app carry offline basket composition? | P5 Q21 |
| `OQ-30` | Who enforces `SC-18`–`SC-23` when the AI assistant is built? *(The founder, against this document)* | P5 Q22 |

**Settled by this document, recorded so they are not reopened:** `OQ-31` — a guest who abandons at `CHK-02` gets **no** contact (`ENT-R3`; P4 Q13). `OQ-32` — push presupposes the Android app; the web product carries none (`ENT-R39`; P4 Q15). `OQ-33` — publishing the delivery-on-slot rate is worth considering post-MVP, once it is good (P4 Q16).

## 17.3 Change control

| ID | Rule | Reasoning |
|---|---|---|
| `DOC-1` | **IDs are permanent.** `MKT-01`, `FLW-07`, `EP-3.1`, `NAV-R8`, `OQ-17` are never reused, and a retired ID is marked retired, never recycled | `S7`. Every future document, design file, ticket and pull request cites them |
| `DOC-2` | **Amendments are versioned in §Version History with a reason**, never made silently | `XR-5` |
| `DOC-3` | **A conflict with 01–05 is a defect in 06** and is corrected in 06 (`XR-4`) | The senior document is never amended to accommodate the junior one |
| `DOC-4` | **A new screen, flow or rule enters by amending this document**, not by appearing in a design file | Part 1 §2.1: a screen that does not appear in the inventory does not exist |
| `DOC-5` | **§14.8 is maintained.** Any further decision 06 makes beyond its sources is added there | `XR-6`: silence is not permission to be quiet about it |
| `DOC-6` | **Assumptions (§15) are re-read at every milestone start** (`ASM-R1`) | The five `Low`-confidence entries would change this architecture, not merely inconvenience it |

## 17.4 Recommendation on closure

Document 06 is complete as scoped. It is **not** a complete architecture, and the difference is `G-01`–`G-04`.

The four gaps share a shape: they are all **models**, not behaviours. This document owns behaviour (`XR-1`), and behaviour is now thoroughly specified — which is precisely why the absence of the underlying models is now the binding constraint rather than a background concern. `ADM-16` is cited twenty times and specified nowhere. `ADM-20` is the single source of truth for five business rules and has no schema. Every screen's error and empty states are ruled and none are modelled.

**Recommendation: Document 07 — State, Content & Configuration Architecture**, covering `G-01`, `G-02`, `G-03`, with `G-04` (tax) resolved as a founder decision first because it changes `ADM-06`. It is a separate document rather than a seventh part because it answers a different question — *what is the shape of the data* — and `XR-1` says one document, one question.

Three decisions are worth making before anything else, because each one gets more expensive every week: **`OQ-17`** (who owns stock — it determines `ADM-08`, which is MVP), **`OQ-18`** (the fourteen cheap-now decisions — they are the schema), and **`OQ-05`** (the loyalty object model — open across three parts and now blocking two capabilities and one gap).

---

**END OF DOCUMENT 06 — SCREEN ARCHITECTURE**
**Milestone 3 complete.**

---

# Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 (Part 1) | July 2026 | Experience Principles and Screen Inventory — 92 screens across 12 domains |
| 1.0 (Part 2) | July 2026 | Flow Architecture — 17 end-to-end user flows; "Forgot Password" recorded as `FLW-07` Account Recovery per Bargad §19 |
| 1.0 (Part 3) | July 2026 | Navigation Architecture (`NAV-R1`…`NAV-R57`, `NAV-C1`…`NAV-C9`) and Information Hierarchy (`IH-1`…`IH-21`, `CP-1`…`CP-10`) |
| 1.0 (Part 4) | July 2026 | Entry Points (`ENT-R1`…`ENT-R39`), Exit Points (`ABD-01`…`ABD-14`, `RCV-R1`…`RCV-R7`), Trust Journey (`TJ-R1`, `TJ-R2`), Conversion Strategy (`CV-1`…`CV-24`) |
| 1.0 (Part 5) | July 2026 | Scalability Principles (`SC-0`…`SC-26`), ten seams (`S1`…`S10`), fourteen cheap-now decisions, readiness for eight future capabilities |
| 1.0 (Part 6) | July 2026 | Cross References (`XR-1`…`XR-6`), the derived-decisions register (§14.8), 44 Assumptions (`ASM-01`…`ASM-44`), the Architecture Validation Checklist (§16), the consolidated gap register (`G-01`…`G-10`), the canonical open-question register (`OQ-01`…`OQ-33`), and change control (`DOC-1`…`DOC-6`). **Document closed at six parts. State Architecture not written — recorded as `G-01` and recommended as Document 07** |