import { LegalPage } from "@/components/features/Legal";
import { BRAND } from "@/config/brand";
export const metadata = { title: "Terms of Service" };

export default function Page() {
  const L = BRAND.legal, N = BRAND.name;
  return (
    <LegalPage title="Terms of Service">
      <p>These Terms govern your use of {N} (the “Service”), operated by {L.entity}, {L.address} (“we”, “us”). By creating an account or using the Service you agree to them. If you do not agree, do not use the Service.</p>
      <h2>1. Eligibility and accounts</h2>
      <p>You must provide accurate information and keep your credentials confidential. You are responsible for activity on your account. If you are under 18, you confirm that a parent or guardian has consented to your use of the Service. One account is for one person; sharing accounts is not allowed.</p>
      <h2>2. What the Service provides</h2>
      <p>The Service offers learning material (DSA sheets, core CS and aptitude notes, roadmaps, cheat sheets, interview experiences) and tools to track your progress. Problem links point to third-party sites (for example LeetCode) that have their own terms; we do not control them. We do not guarantee any placement, interview result or salary outcome.</p>
      <h2>3. Free and premium content</h2>
      <p>Some content is free, some is private to selected users, and some is premium. Premium content is unlocked for your account after we verify your payment. Prices are shown in INR before you pay. Access is personal, non-transferable and limited to viewing inside the Service.</p>
      <h2>4. Payments and refunds</h2>
      <p>Payments are processed by third-party payment providers; we do not store your card or UPI credentials. Content unlocks only after the payment is confirmed by the provider or verified by us, which can take a short while. If you believe you were charged without receiving access, contact {L.email} with your order reference. Unless the law requires otherwise, digital content that has been unlocked is not refundable, except that you may request a refund within {L.refundDays} days of purchase if the content is materially not as described or you were unable to access it due to a fault on our side.</p>
      <h2>5. Content licence and restrictions</h2>
      <p>All notes, cheat sheets, roadmaps, sheets and other material are owned by us or our licensors and are licensed to you for personal, non-commercial study. You must not copy, screenshot for distribution, download, scrape, resell, publish, or share premium or protected content, or attempt to bypass the viewer, watermark or access controls. Watermarks identify your account; leaked content may be traced to it.</p>
      <h2>6. Your contributions</h2>
      <p>If you post interview experiences, comments or notes, you confirm they are your own honest account, do not breach any confidentiality obligation or non-disclosure agreement, and do not contain personal data of others. You grant us a non-exclusive, worldwide, royalty-free licence to host, display and moderate them on the Service. We may remove content that breaks these Terms or the law.</p>
      <h2>7. Acceptable use</h2>
      <p>Do not harass others, post unlawful or misleading content, probe or attack the Service, use automated tools to access it at scale, or interfere with other users&apos; access.</p>
      <h2>8. Suspension and termination</h2>
      <p>We may suspend or terminate accounts that breach these Terms. You may stop using the Service and request deletion of your account at any time by writing to {L.email}.</p>
      <h2>9. Disclaimers and liability</h2>
      <p>The Service and its content are provided “as is”. Content may contain errors or become outdated. To the extent permitted by law, we are not liable for indirect or consequential loss, and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing here limits liability that cannot be limited by law.</p>
      <h2>10. Changes</h2>
      <p>We may update these Terms. If a change is material we will notify you in the Service or by email. Continued use after the change means you accept it.</p>
      <h2>11. Governing law</h2>
      <p>These Terms are governed by the laws of {L.jurisdiction}. Courts at {L.courts} have jurisdiction, subject to any consumer rights you have to bring a claim elsewhere.</p>
      <h2>12. Contact</h2>
      <p>{L.entity} · {L.address} · <a href={`mailto:${L.email}`}>{L.email}</a></p>
    </LegalPage>
  );
}
