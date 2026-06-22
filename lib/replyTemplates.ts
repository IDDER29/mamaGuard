// lib/replyTemplates.ts
// Plan E1.4 — vetted canned replies a clinician can insert into the WhatsApp
// composer. Darija (Latin script) first; keep tone warm and non-diagnostic.

export interface ReplyTemplate {
  id: string;
  label: string; // short chip label (clinician-facing)
  body: string; // message inserted into the composer (patient-facing, Darija)
}

export const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "go-now",
    label: "Go to clinic now",
    body: "3afak sir l aqrab sbitar wla merkez s-se77a daba bach ychoufok tbib. Hadi haja mhimma, ma t-t'akhrich.",
  },
  {
    id: "reassure",
    label: "Reassure (low risk)",
    body: "Ma t-qelqich, li 7essiti bih 3adi f l-7aml. 7awli terta7i o tchrbi l-ma bzaf, o ila tzadat chi 7aja goli liya.",
  },
  {
    id: "come-appt",
    label: "Come to appointment",
    body: "Tdekkri b l-maw3id dyalek f l-merkez. Ila ma qderitich tji, goli liya bach n-bedloh.",
  },
  {
    id: "send-vitals",
    label: "Ask for BP",
    body: "Wach 3andek tension (l-pression) l-youm? Ila qderti 3tini l-arqam (s-systolique o d-diastolique) bach nt'akkdo.",
  },
  {
    id: "more-info",
    label: "Ask for detail",
    body: "Bach n3awnek mzyan, 3afak wsefi liya ktar: fuqach bdat, ch7al hadi, o wach kayna chi 7aja okhra m3aha?",
  },
  {
    id: "followup",
    label: "Follow-up check",
    body: "Salam, kif dayra l-youm? Wach t7sneti? Goli liya ila bqa 3andek chi 7aja kat-qelqek.",
  },
];
