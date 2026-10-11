import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy" };

const lastUpdated = "July 29, 2026";

export default function PrivacyPage() {
  return (
    <div className="container max-w-[760px] py-20">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-gold">Legal</p>
      <h1 className="mb-2 font-display text-[36px] font-medium">Privacy Policy</h1>
      <p className="mb-12 text-[13px] text-muted-foreground">Last updated: {lastUpdated}</p>

      <div className="flex flex-col gap-8 text-[14.5px] leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-medium [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:ps-5 [&_li]:mb-1.5">
        <section>
          <h2>1. Who we are</h2>
          <p>
            {siteConfig.productName} ("NEXORA Menu", "we", "us") is a digital menu platform for
            restaurants, cafés, and lounges, operated as a product of NEXORA. This policy explains
            what data we collect from restaurant owners (our customers, "you") and from their
            guests who view a published menu, and how that data is used.
          </p>
        </section>

        <section>
          <h2>2. Information we collect</h2>
          <p>From restaurant owners and staff who create an account:</p>
          <ul>
            <li>Account information: name, email address, and authentication data (handled by Supabase Auth — we never see or store your raw password).</li>
            <li>Restaurant data you provide: restaurant name, business type, contact details, address, menu content, images, and pricing.</li>
            <li>Billing information: when you subscribe to a paid plan, payment details are collected and processed directly by Stripe — we do not store full card numbers on our servers.</li>
            <li>Usage data: pages visited within the dashboard, feature usage, and log data for security and debugging.</li>
          </ul>
          <p>From guests who view a published restaurant menu:</p>
          <ul>
            <li>Anonymous analytics: QR scans, menu views, device type, approximate location (country/city level), and which products are viewed — used to power the restaurant owner's Analytics dashboard.</li>
            <li>We do not require guests to create an account or provide personal information to view a menu.</li>
          </ul>
        </section>

        <section>
          <h2>3. How we use information</h2>
          <ul>
            <li>To operate and maintain your restaurant dashboard and public menu.</li>
            <li>To process subscription payments and manage billing.</li>
            <li>To generate the analytics shown in your dashboard (scans, popular items, traffic patterns).</li>
            <li>To communicate service updates, security notices, and — where you've agreed to receive them — product updates.</li>
            <li>To detect, investigate, and prevent fraudulent or unauthorized activity.</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-party processors</h2>
          <p>We rely on the following sub-processors to run the service:</p>
          <ul>
            <li><strong className="text-foreground">Supabase</strong> — authentication and database hosting.</li>
            <li><strong className="text-foreground">Stripe</strong> — subscription billing and payment processing.</li>
          </ul>
          <p>
            Each of these providers processes data under their own privacy policy and security
            standards; we select and review sub-processors for their data-protection practices.
          </p>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>
            We use strictly necessary cookies to keep you signed in and to remember your language
            preference. If we add advertising or analytics cookies beyond what's described here
            (for example, for marketing campaign tracking), we will update this policy and request
            consent where required by law before doing so.
          </p>
        </section>

        <section>
          <h2>6. Data retention</h2>
          <p>
            We retain account and restaurant data for as long as your account is active. If you
            delete your restaurant or account, we remove your data within a reasonable period,
            except where we're required to retain it for legal, tax, or fraud-prevention purposes.
          </p>
        </section>

        <section>
          <h2>7. Your rights</h2>
          <p>
            Depending on where you're located, you may have the right to access, correct, export,
            or delete your personal data, and to object to certain processing. To exercise any of
            these rights, contact us using the details below.
          </p>
        </section>

        <section>
          <h2>8. Children's privacy</h2>
          <p>{siteConfig.productName} is intended for business use by restaurant operators and is not directed at children.</p>
        </section>

        <section>
          <h2>9. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be reflected by
            updating the "Last updated" date above, and — for significant changes — by notifying
            account holders directly.
          </p>
        </section>

        <section>
          <h2>10. Contact us</h2>
          <p>Questions about this policy or your data can be sent to the contact details provided on our website.</p>
        </section>
      </div>
    </div>
  );
}
