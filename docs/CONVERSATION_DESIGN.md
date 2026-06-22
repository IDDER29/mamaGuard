# MamaGuard — Conversation Design Spec

The patient-facing "frontend" of MamaGuard is a **WhatsApp + SMS conversation in Moroccan
Darija**. There is no screen, no buttons by default — for many of our mothers the chat thread
*is* the entire product. This document specifies how that conversation should behave: its
principles, message types, flows, copy, and the gaps we still need to close.

It is grounded in the real pipeline:

- `app/api/webhook/route.ts` — inbound message handling: transcribe → triage → save → grounded
  LLM reply → send; appointment confirm/cancel intent; partner notification on critical.
- `lib/triage.ts` — deterministic WHO-ANC-DAK danger-sign engine (`assessTriage`), urgency levels,
  postpartum signs, negation handling, never-downgrade rule.
- `lib/generateMamaResponse.ts` — the "Mama AI" Darija persona, language routing, grounding block,
  `FALLBACK_DARIJA`.
- `lib/content.ts` — vetted weekly / postpartum guidance + knowledge base used for grounding.
- `lib/transcribe.ts` — Whisper Darija STT, hallucination guard, returns `""` on low confidence.
- `app/actions/patients.ts` — welcome message + consent at registration.

> **Two roles, one rule.** The **rule engine (`assessTriage`) decides urgency. The LLM only
> phrases it.** Every flow below assumes this separation. The model may make a critical message
> warmer, but it must never make it less urgent.

---

## 1. Principles

1. **Warm, in Darija.** Mama AI is a caring older-sister/auntie figure (see `MAMA_SYSTEM_BASE` in
   `generateMamaResponse.ts`). Speak Darija by default; Latin or Arabic script both fine. French /
   MSA / Tamazight / English allowed when the patient's `language` says so (`LANGUAGE_INSTRUCTION`).
2. **Voice-first.** Many mothers prefer to *talk*, not type. Voice notes are first-class input
   (Whisper `language: 'ar'`). We should also reply by voice (TTS exists, not yet wired — see §5, §11).
3. **Low-literacy by design.** Short sentences, one idea per message, concrete actions ("sir l
   sbitar daba"), numbered menus over free text where a choice is needed (§3, §8).
4. **Never dismissive.** The persona is explicitly forbidden from saying "machi serious" / "wait
   and see" on danger signs (CLINICAL SAFETY block in the system prompt). Always validate feeling
   first, then guide.
5. **Honest — "not a diagnosis."** Every escalation and the welcome message carry the disclaimer:
   *"ana machi 3iwad 3la tbib"* (I am not a substitute for a doctor). We orient, we do not diagnose.
6. **Safety over reassurance.** When the rule engine and the patient's reassurance disagree, safety
   wins. The LLM **must never downgrade** the rule-based urgency (`patients.risk_level` is set from
   `triage.urgency` only, in the webhook). Conservative co-occurrence escalation (e.g. pre-eclampsia
   cluster) is honoured in the copy.
7. **Privacy & consent.** Consent is captured at onboarding (`consent_given`, `consent_at`,
   `consent_version` in `patients.ts`). Partner/family notification only fires with explicit
   `partner_opt_in` and shares **no medical detail** — just an urgent request to help (webhook §2.4).

---

## 2. Message taxonomy

| # | Type | Trigger | Goal | Initiator |
|---|------|---------|------|-----------|
| 1 | **Onboarding / welcome** | Clinician registers patient (`registerPatient`) | Introduce Mama AI, set expectations, deliver safety disclaimer | System (outbound) |
| 2 | **Consent** | First contact / registration | Get explicit opt-in to messaging + data use; record version | System → patient |
| 3 | **Free-form Q&A** | Patient asks a question (text/voice) | Answer with vetted, grounded guidance (`buildGroundingBlock`) | Patient |
| 4 | **Symptom report** | Patient describes how she feels | Run triage, respond with tone matched to urgency | Patient |
| 5 | **Danger-sign escalation** | `assessTriage` returns high/critical | Unambiguous "go to care now" + emergency number + partner alert | System (rule-driven) |
| 6 | **Proactive check-in** | Cron (`app/api/cron/check-in`) | Catch silent deterioration; keep relationship warm | System (outbound) |
| 7 | **ANC / immunization reminder** | Scheduled appointment / EPI calendar | Drive attendance at visits & vaccines | System (outbound) |
| 8 | **Appointment confirm / reschedule** | Reminder reply OR spontaneous | Update `appointments.status` from patient words | Patient → System |
| 9 | **Postpartum** | `postpartum = true` | Switch guidance + danger signs to postpartum mode | Both |
| 10 | **Partner / family notification** | New **critical** escalation + `partner_opt_in` | Mobilise family to help her reach care | System → partner |
| 11 | **System / fallback** | LLM empty/failed, STT failed, unknown sender | Degrade gracefully, never go silent on a worried mother | System |

---

## 3. Onboarding + consent flow

### Current state (real code)

On `registerPatient()` the clinician onboards the mother; we immediately send the Darija welcome
from `buildWelcomeMessage()` in `app/actions/patients.ts`:

> **Welcome (verbatim from code):**
> *"Salam {name}! 🧸 Ana Mama AI, l-moussa3ida dyalk f l-7aml. Tsjalti m3ana l-youm. Nti daba f
> l-osbou3 {week}. Ghadi nbqa nti3lk l-akhbar dima bach n-t'amno 3lik. Ila 7ssiti b chi haja, goliha
> liya hna! 🇲🇦*
>
> *⚠️ Mouhim: ana machi 3iwad 3la tbib. Ila 7ssiti b chi 3arad khatir bhal nazif (dem), sda3 qwi
> bezzaf, l-bsar mcha-wach, chi tachannoj, wla l-bebe ma bqach kaytharrak — sir l-aqrab sbitar daba
> wla 3ayyti l-ist3ajalat."*

Consent today is captured **in the registration form** (`consent_given`) — i.e. by the clinician,
not in the chat. The welcome message does **not** ask for an in-chat confirmation, and the patient
is never offered a language choice in the thread.

### Recommended flow (target)

```
First contact
  └─ M1  Welcome + who I am + what I'll do  (the copy above)
  └─ M2  Safety disclaimer                  (already in welcome; keep it as its own visual block)
  └─ M3  Consent ask  (in-chat, numbered)   ← GAP: not asked in chat today
  └─ M4  Language choice (numbered)         ← GAP: language is set in form, never confirmed in chat
```

**M3 — In-chat consent (recommended copy):**

> *Bach nqder nsift lik t-tadkirat w nsa3dek, khassni l-idn dyalek. L-ma3loumat dyalek t-bqa
> mahmiya w ma t-tchark m3a 7ta wa7ed bla l-idn dyalek.*
> *Jawbi b raqm:*
> *1️⃣ Wakha, mwafqa (Yes, I agree)*
> *2️⃣ Bghit n3ref aktar (Tell me more first)*

**M4 — Language choice (recommended copy):**

> *Ach-mn loǧa b-bghiti n-hadro? Jawbi b raqm:*
> *1️⃣ Darija 🇲🇦  2️⃣ Français  3️⃣ العربية  4️⃣ Tamazight  5️⃣ English*

> **GAP flagged:** the conversation is **free-text only** today. There are **no WhatsApp
> interactive quick-reply buttons / list messages**. M3/M4 above are written as **numbered text
> menus** so they work even before buttons are wired, but we should implement WhatsApp interactive
> buttons (`type: "interactive"`) for these. See §8 and §11.

---

## 4. Symptom-report → triage → escalation flow

The pipeline (webhook):
`message → assessTriage() → set patients.risk_level (rule only) → insert alert if not low →
generateMamaResponse() with risk_level in context → send`.

`assessTriage` returns one of four urgencies; the **copy tone is a pure function of that urgency**.
The LLM receives `risk_level` and the CLINICAL SAFETY block — its job is phrasing, not deciding.

### Urgency → tone mapping

| Urgency | Source signs (examples) | Tone | Required content |
|---------|-------------------------|------|------------------|
| **low** | none matched | Reassure + everyday guidance | Validate, give vetted tip, invite follow-up |
| **medium** | painful urination, dizziness, GDM signs, mastitis | Take seriously, advise review | Acknowledge, advise contacting clinic/midwife soon, watch-for list |
| **high** | severe headache, bleeding (non-crit context), swelling, fever, leaking fluid, preterm contractions, postpartum infection/depression | **Urge care today** | Clear "go to clinic today", what to bring, do-not-wait |
| **critical** | vaginal bleeding, convulsions, loss of consciousness, no fetal movement, severe breathing difficulty, postpartum haemorrhage / self-harm; pre-eclampsia cluster (escalated) | **Emergency — go now** | Unambiguous "go to hospital NOW", emergency number, partner alert if consented |

### Example Darija copy per level

**LOW** (reassure + guidance):
> *Bghir 3lik, hada chi 3adi f had l-mar7ala. {grounded tip}. Ila tzad chi 7aja wla 7ssiti b chi
> 3arad jdid, goliha liya hna. Ana m3ak. 💛*

**MEDIUM** (review + advise):
> *Smahti li 3la had l-7ala, fhmtek. Hadi 7aja khassek tchoufiha m3a tbiba wla qabla f l-iyyam
> jay. Tbi3i n9oulha lik: ila zad l-waja3, wla bda chi nzif, wla skhana — ma t-tssnaych, sir
> mubachara. T-bghi n3awnek t9addmi maw3id?*

**HIGH** (go to clinic today):
> *Had l-3arad khassou intibah. 3afak sir l-aqrab markaz s7i wla sbitar **l-youm** bach
> y-fa7souk nti w l-bebe. Khoudi m3ak l-carnet d l-7aml. Ma t-tssnaych. Goli li mnin t-touslii temma. 🙏*

**CRITICAL** (emergency now):
> *⚠️ Had l-3alama خطيرة. **Sir l-sbitar daba, daba — ma t-tssnaych.** Ila ma qderti tmchii b
> raskk, 3ayyti l-ist3ajalat: **150** (SAMU) wla **15**. Ila kayn chi 7ed 7dak, gouli lih
> y-3awnek دابا. Ana ghadi nbeqqa m3ak, walakin l-ahamm daba howa toussli l t-tbib. 🤲*

> If the mother is consented (`partner_opt_in` + `spouse_partner_phone`) and this is a **new**
> critical escalation (`becameCritical`), the webhook also sends the **partner message** (verbatim
> in code):
> *"Salam 🧸. Hada blagh mosta3jal mn Mama AI bekhsous {name}. Ymken t7taj mosa3ada s7iya daba.
> 3afak tssl biha w 3awnha bach toussel l aqrab sbitar wla qabla. Choukran 3la l-mosa3ada dyalk. 🇲🇦"*

**Never-downgrade contract (must hold in copy):** if `triage.urgency` is high/critical, the reply
**cannot** contain reassuring "it's probably nothing" framing, even if the patient adds "but I feel
fine now" or "it stopped." Negation handling lives in the rule engine (`isNegated`), not the LLM —
so if the engine still flagged it, the engine wins.

> **Morocco emergency numbers** to standardise on: **150** (SAMU / medical) and **15** (ambulance);
> include in all critical copy. (Confirm the canonical number with the deploying clinic and pin it
> in config.)

---

## 5. Voice handling

### Intake (working today)

Audio messages are downloaded via the Graph API and transcribed by `transcribeAudio()` (Whisper,
forced `language: 'ar'`, Darija medical priming prompt). The transcript flows through the **identical**
triage → reply path as text. The message metadata records `source: "voice_note"`.

### Transcription-failure UX

`transcribeAudio` returns `""` when: API fails after retries, the segments look like silence
(`no_speech_prob > 0.6`), or the text matches a known hallucination pattern. Today the webhook
simply **drops empty transcripts** (`if (!userText.trim()) return;`) — the mother gets **no reply**.
That is unacceptable for a worried patient.

**Recommended behaviour:**

1. **Gentle re-ask** when STT yields nothing:
   > *Smahti li, ma fhemtch mzyan l-message s-soti. Wach t9dri t3awdi tssجliه b-chwiya w f blasa
   > hadya? Wla ktbi li b l-7rouf ila bghiti. Ana hna. 💛*
2. **Conservative escalation despite low confidence:** before discarding, run the **raw low-confidence
   transcript** (or even keyword spotting on it) through `assessTriage`. If *any* danger word appears
   (dem / nazif / tachannoj / ma kaytharkach / …), **escalate as if confident** and send the §4 HIGH/
   CRITICAL copy rather than the re-ask. Under-reacting to a garbled "I'm bleeding" is the worst
   failure mode. (Implementation note: this means STT should expose the low-confidence text to the
   caller instead of collapsing it to `""`.)

### Voice replies — GAP

`lib/speak.ts` (`generateSpeech`, ElevenLabs `eleven_multilingual_v2`) exists and the webhook
**does** attempt a voice reply when `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` are configured
(upload to WhatsApp media → send `type: "audio"`). However this is **best-effort and config-gated**:
if keys are unset/placeholder it is silently skipped, so in practice most mothers receive **text
only**. For a low-literacy, voice-first audience this should be the **default**, not an optional add-on.

> **GAP flagged:** make Darija voice replies a first-class, on-by-default reply mode (especially for
> patients whose inbound was a voice note, and for all critical escalations where reading is a
> barrier). Confirm the ElevenLabs voice is acceptable for Darija; keep text as the accessible
> fallback/transcript alongside the audio.

---

## 6. Reminders copy

Reminders are outbound, scheduled (ANC check-ins via the cron job; immunization via the EPI calendar
seeded in `setPostpartumStatus` → `buildImmunizationAppointments`).

**Tone:** friendly nudge, never nagging or shaming. Frame the visit as care *for her and the baby*,
not an obligation. Always offer the confirm/reschedule reply so the message is two-way.

**ANC visit reminder:**
> *Salam {name} 💛. Tfekkir sghir: 3andek maw3id dyal l-mraqaba {date} f {place}. Hadak l-fa7s mohim
> bach n-t'akkdo belli nti w l-bebe b-khir. Wach ghadi tji? Jawbi: **Wakha** (ghadi nji) wla **Bdel**
> (n-bghi n-bddel l-maw3id).*

**Immunization reminder (Morocco EPI):**
> *Tfekkir: l-bebe 3andou maw3id d l-tatعim (vaccin) {date}. Hada kayحmih mn amrad khatira. 3afak
> dirou f l-waqt. Wach ghadi tjiw? **Wakha** / **Bdel**.*

**Proactive check-in (cron):**
> *Salam {name} 🧸. Kif dayra l-youm? Kif l-7aml? Ila bghiti tgouli li chi 7aja wla 3andek chi
> sou'al, ana hna. T9dri tssجli li b-soutk wla tkتbi.*

**Timing:** ANC reminder ~48h and ~3h before; immunization ~3 days before; gentle check-ins on the
patient's `voice_reporting_frequency` / `preferred_checkup_time`. Quiet hours: no non-urgent messages
late night/early morning. (Urgent/escalation messages ignore quiet hours.)

**Opt-out:** every reminder is governed by consent and STOP (see §7). On STOP, only legally/clinically
required safety messages continue; reminders pause.

---

## 7. Keywords & controls

### Already parsed by the webhook (verbatim from `route.ts`)

These drive **appointment confirm/cancel** (`handleAppointmentIntent`). **Cancel takes precedence**
over confirm (safer to surface a cancellation than a false confirm).

- **Confirm words:** `wakha, ok, okay, oui, yes, na3am, نعم, واخا, غادي نجي, ايه, d'accord, confirm,
  نأكد, ايوا`
- **Cancel / reschedule words:** `ma neqderch, ma ghadich, ma nqderch, can't, cannot, annuler,
  cancel, reporter, reschedule, ما نقدرش, ما غاديش, بدل, نأجل`

### Recommended control keywords (to add)

- **STOP** — `STOP`, `قف`, `w9ef`, `bla rsayl`, `unsubscribe` → pause non-essential messaging, record
  consent withdrawal, confirm in Darija (see §9).
- **HELP** — `HELP`, `3awn`, `مساعدة`, `aide`, `info` → short menu of what Mama AI can do + how to
  reach a human + emergency numbers.
- **Language switch** — `LANG`, `loǧa`, `langue`, plus the numbered menu in §3/§8 → update
  `patients.language` (this then routes both reply language and Whisper STT). **GAP: no
  language-switch keyword exists today** (language is set only in the registration form).

> Keyword matching should reuse the same `normalize()` philosophy as triage (lowercase, strip Arabic
> diacritics) so Latin/Arabic variants both hit.

---

## 8. Quick-reply / menu patterns

Audience is low-literacy and often new to apps; copy the proven **MomConnect / USSD** pattern:
**short prompt + numbered options**, where a single digit is a valid reply.

**Main menu (HELP):**
> *Ana Mama AI 🧸. Ach n9der ndir lik? Jawbi b raqm:*
> *1️⃣ 3andi sou'al 3la l-7aml*
> *2️⃣ Bghit ngoul kif 7assa (3arad/symptom)*
> *3️⃣ L-maw3id dyali (rendez-vous)*
> *4️⃣ Bddel l-loǧa (language)*
> *5️⃣ Bghit nhdar m3a chi 7ed (human / qabla)*

**Symptom triage menu** (when she picks 2 but gives no detail):
> *Fhmtek. Ach li 7assa bih? Jawbi b raqm wla goliha b kلامk:*
> *1️⃣ Nzif / dem (bleeding)*
> *2️⃣ Sda3 qwi / l-bsar (headache / vision)*
> *3️⃣ L-bebe ma kaytharrakch (baby not moving)*
> *4️⃣ Skhana / waja3 l-kرش (fever / belly pain)*
> *5️⃣ Chi 7aja okhra (something else)*

**Appointment menu (reminder reply):**
> *3andek maw3id {date}. Jawbi:*
> *1️⃣ Wakha, ghadi nji  2️⃣ Bddel l-maw3id  3️⃣ Goli li 3la l-maw3id*

> Free-text answers must still work everywhere — a mother who types/says "kanzef" instead of pressing
> 1 must hit the same triage path. The menus are an **aid**, not a gate.
>
> **Implementation:** prefer WhatsApp **interactive list/button messages** (`type: "interactive"`)
> for these; SMS / no-smartphone patients (`preferred_channel = "sms"`) fall back to the numbered text
> form above. Map digit replies in the webhook the same way confirm/cancel words are mapped today.

---

## 9. Edge cases & safety nets

| Case | Behaviour |
|------|-----------|
| **Unknown sender** | Webhook auto-creates a `patients` row (`name: "New Mother", risk_level: "low"`). Reply should *still* run triage, but **not** assume consent — send a short who-am-I + consent ask (§3) and avoid sharing any data. Flag for clinician review. |
| **Empty / garbled audio** | STT returns `""`. Don't go silent — gentle re-ask (§5) AND danger-word check on low-confidence text → conservative escalation. |
| **Off-topic** (non-pregnancy) | Stay warm, gently redirect to what Mama AI helps with; offer HELP menu. Never refuse coldly. |
| **Abuse / spam / sexual content** | Do not engage on content; respond once with boundaries + HELP/human option; flag for clinician. Never reciprocate. |
| **Multiple rapid messages** | Each message is deduped by `metadata->>wamid`. Risk: several replies fire at once. Recommend short debounce / batch so the mother gets one coherent reply, and so a danger sign split across two messages ("kanzef" then "bzaf") isn't under-triaged. |
| **Consent withdrawal (STOP)** | Record withdrawal + version + timestamp; confirm in Darija: *"W9eft l-rsayl. Ila bghiti t<rja3i 3awtani, sift li 'START'. Tbqay daiman t9dri tsir l-sbitar f ay waqt ila 7tajiti."* Pause reminders/check-ins. |
| **Emergency outside scope** (e.g. accident, domestic violence) | Do not try to manage clinically. Give emergency numbers (150 / 15 / police 19) and a human-handoff path; flag critical to clinicians. |
| **LLM failure / empty completion** | `generateMamaResponse` returns `FALLBACK_DARIJA`: *"Ana smahiti, ma tqderch t7awl daba… Baraka min fadlik tsajli m3a tabiba wla qabla…"* Acceptable, but for high/critical urgency the fallback must be **replaced by the deterministic escalation copy (§4)** — never let an LLM outage swallow an emergency. |
| **Provider down (no OpenAI/MiniMax)** | Today `generateMamaResponse` throws → background error → silent. Recommend a templated, rule-driven reply keyed off `triage.urgency` so the mother always gets *something*, especially when urgency ≠ low. |

---

## 10. Tone & copy guidelines

**Do**
- Open by acknowledging the feeling: *"Fhmtek"*, *"Smahti li 3la had l-7ala"*, *"Bghir 3lik."*
- One idea per message; short lines; concrete verbs (*"sir"*, *"3ayyti"*, *"khoudi m3ak"*).
- Use the patient's name and gestational week when known (already injected via patient context).
- Keep the safety disclaimer present on escalations: *"ana machi 3iwad 3la tbib."*
- Offer a next step or a reply option, so the thread stays two-way.

**Don't**
- Don't diagnose ("3andek pre-eclampsia"). Describe + orient instead.
- Don't minimise on danger signs ("machi serious", "tssناي w chوfi") — forbidden by the persona's
  CLINICAL SAFETY block.
- Don't write a wall of text; don't use clinical jargon untranslated.
- Don't promise outcomes ("kolchi ghadi ykoun mzyan") on a critical case.

**Example phrases (Latin Darija)**
- Reassure: *"Hada chi 3adi f had l-mar7ala, ma t-9el9iych."*
- Validate + escalate: *"Smahti li, hada 3arad khassou intibah. Sir l-sbitar daba."*
- Invite voice: *"T9dri tssجli li b-soutk ila s-hel 3lik."*
- Close warmly: *"Ana m3ak, 3lah ma t-tردي li goli kif bقiti. 💛"*

**Emoji:** sparing and warm — 💛 🧸 🤲 🙏 🍼 🇲🇦 align with the existing persona. Use **⚠️** to mark
danger/escalation blocks. Never use playful emoji on a critical message.

**Length:** Q&A / reassurance 1–3 short sentences. Escalations: lead with the **action** in the first
line (so it survives a notification preview), then the why, then support.

---

## 11. Gaps to close

1. **Quick replies / interactive menus.** Conversation is free-text only. Add WhatsApp interactive
   button/list messages for consent, language, appointments, and the symptom menu (§3, §8); keep
   numbered-text fallback for SMS / no-smartphone patients.
2. **Voice replies wired & default.** `speak.ts` + the webhook's voice-note path exist but are
   config-gated and best-effort; many mothers get text only. Make Darija TTS the default reply mode
   (at least for voice-in patients and all escalations), with text as transcript/fallback (§5).
3. **Confidence-gated fallback for STT.** Today an empty/garbled transcript = silence. Implement the
   gentle re-ask **plus** danger-word escalation on low-confidence text, and stop collapsing
   low-confidence audio to `""` before triage sees it (§5, §9).
4. **Language-switch keyword.** Language is only set in the registration form; there's no in-chat way
   to change it. Add a `LANG` keyword + numbered menu that updates `patients.language` (which already
   routes both reply language and Whisper STT) (§3, §7).
5. **Partner-consent capture in chat.** `partner_opt_in` / `spouse_partner_phone` are only set by the
   clinician. Add an in-chat consent step so the mother herself can opt her partner in/out and provide
   the number, with clear privacy framing (§1, §4).
6. **STOP / HELP keywords.** Neither is parsed today; add them with Darija confirmations and consent-
   withdrawal recording (§7, §9).
7. **Deterministic escalation copy on LLM/provider failure.** When `generateMamaResponse` falls back
   or throws and `triage.urgency` is high/critical, send templated escalation copy instead of the
   generic `FALLBACK_DARIJA` or silence (§4, §9).
8. **Message debounce / batching.** Coalesce rapid consecutive messages so danger signs split across
   messages are triaged together and the mother gets one coherent reply (§9).
