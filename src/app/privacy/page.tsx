import { LegalPage } from "@/components/features/Legal";
import { BRAND } from "@/config/brand";
export const metadata = { title: "Privacy Policy" };

export default function Page() {
  const L = BRAND.legal, N = BRAND.name;
  return (
    <LegalPage title="Privacy Policy">
      <p>{L.entity} (“we”) runs {N}. This policy explains what personal data we collect, why, and the choices you have. We process personal data in line with applicable law, including India&apos;s Digital Personal Data Protection Act, 2023 and, where relevant, the GDPR.</p>
      <h2>1. Data we collect</h2>
      <ul>
        <li><b>Account data:</b> name, username, email address, password (stored only as a salted hash), and profile photo if you add one. If you sign in with Google or GitHub we receive your name, email and avatar from them.</li>
        <li><b>Learning activity:</b> problems solved, bookmarks, revision flags, personal notes, quiz answers, roadmap progress, study time, streaks and content you view.</li>
        <li><b>Community content:</b> interview experiences and comments you post.</li>
        <li><b>Payment data:</b> order reference, amount, status and time. Card and UPI details are handled by the payment provider and are not stored by us.</li>
        <li><b>Technical data:</b> IP address, device and browser type, and security logs.</li>
      </ul>
      <h2>2. How we use it</h2>
      <p>To create and secure your account; to deliver the Service and personalise your dashboard and recommendations; to verify purchases and unlock content; to show your email as a watermark on protected content and detect leaks; to send service messages (for example password resets and announcements); to moderate content; and to improve and protect the Service. We do not sell your personal data.</p>
      <h2>3. Basis for processing</h2>
      <p>We process your data with your consent (given when you sign up), to perform our contract with you, to comply with legal obligations, and for legitimate uses such as fraud prevention and security. You can withdraw consent at any time; some features will then stop working.</p>
      <h2>4. Cookies and storage</h2>
      <p>We use strictly necessary cookies to keep you signed in (httpOnly, secure session cookies). We store your light/dark theme choice in your browser. We do not use advertising cookies. If we add analytics we will update this policy and ask for consent where required.</p>
      <h2>5. Who we share data with</h2>
      <p>Service providers that process data on our behalf: hosting (our front end and API hosts), our database and storage provider, email delivery, the payment provider, and sign-in providers (Google, GitHub). Content you post publicly (such as comments) is visible to other users under your username; interview experiences may be shown anonymously. We may disclose data when required by law or to protect rights and safety.</p>
      <h2>6. Retention</h2>
      <p>We keep account and activity data while your account is active and delete or anonymise it within a reasonable period after you ask us to delete it, except where we must keep records (for example payment records for tax and accounting).</p>
      <h2>7. Your rights</h2>
      <p>You can access, correct, update or delete your data, withdraw consent, and nominate someone to exercise your rights if you cannot. You can edit your profile in the app; for other requests write to <a href={`mailto:${L.email}`}>{L.email}</a>. We will respond within the time required by law. You may also complain to the relevant data protection authority.</p>
      <h2>8. Security</h2>
      <p>We use encryption in transit, hashed passwords, access controls and monitoring. No system is perfectly secure; if a breach affects your data we will notify you and the authorities as the law requires.</p>
      <h2>9. Children</h2>
      <p>If you are under 18, you may use the Service only with verifiable parental or guardian consent. We do not knowingly track or target advertising at children.</p>
      <h2>10. International transfers</h2>
      <p>Our providers may process data in other countries. Where we transfer data, we do so as permitted by law and with appropriate safeguards.</p>
      <h2>11. Grievance officer</h2>
      <p>{L.grievanceOfficer}, {L.entity}, {L.address}. Email: <a href={`mailto:${L.email}`}>{L.email}</a>.</p>
      <h2>12. Changes</h2>
      <p>We will post updates here and, for material changes, notify you in the Service or by email.</p>
    </LegalPage>
  );
}
