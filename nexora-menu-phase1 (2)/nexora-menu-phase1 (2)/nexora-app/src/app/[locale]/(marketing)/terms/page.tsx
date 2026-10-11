import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Terms of Service" };

const lastUpdated = "July 29, 2026";

export default function TermsPage() {
  return (
    <div className="container max-w-[760px] py-20">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-gold">Legal</p>
      <h1 className="mb-2 font-display text-[36px] font-medium">Terms of Service</h1>
      <p className="mb-12 text-[13px] text-muted-foreground">Last updated: {lastUpdated}</p>

      <div className="flex flex-col gap-8 text-[14.5px] leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-medium [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:ps-5 [&_li]:mb-1.5">
        <section>
          <h2>1. Agreement to terms</h2>
          <p>
            These Terms of Service govern your access to and use of {siteConfig.productName}. By
            creating an account, you agree to these terms. If you're using {siteConfig.productName}{" "}
            on behalf of a business, you're agreeing on that business's behalf and confirming you
            have the authority to do so.
          </p>
        </section>

        <section>
          <h2>2. Your account</h2>
          <ul>
            <li>You're responsible for the accuracy of the information you provide and for keeping your login credentials secure.</li>
            <li>You must be legally able to enter into a binding contract to create an account.</li>
            <li>You're responsible for all activity that happens under your account.</li>
          </ul>
        </section>

        <section>
          <h2>3. Subscriptions and billing</h2>
          <ul>
            <li>Paid plans are billed in advance on a recurring basis (monthly or yearly, as selected) via Stripe.</li>
            <li>You can upgrade, downgrade, or cancel your subscription at any time from your dashboard; changes take effect according to the billing cycle in progress.</li>
            <li>Fees are non-refundable except where required by law or explicitly stated otherwise.</li>
            <li>We may change our pricing with advance notice; continued use after a price change takes effect constitutes acceptance of the new pricing.</li>
          </ul>
        </section>

        <section>
          <h2>4. Acceptable use</h2>
          <p>You agree not to use {siteConfig.productName} to:</p>
          <ul>
            <li>Publish menu content that's illegal, fraudulent, or infringes on someone else's intellectual property.</li>
            <li>Attempt to gain unauthorized access to another restaurant's data or account.</li>
            <li>Interfere with or disrupt the integrity or performance of the service.</li>
            <li>Use the platform to send unsolicited communications.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your content</h2>
          <p>
            You retain ownership of the menu content, images, and branding you upload. By
            publishing content on {siteConfig.productName}, you grant us a license to host, display,
            and distribute that content solely for the purpose of operating your public menu page
            and related features (like QR codes linking to it).
          </p>
        </section>

        <section>
          <h2>6. Service availability</h2>
          <p>
            We aim to keep {siteConfig.productName} available and reliable, but we don't guarantee
            uninterrupted access. We may perform maintenance, and functionality may change as the
            product evolves.
          </p>
        </section>

        <section>
          <h2>7. Termination</h2>
          <p>
            You may stop using {siteConfig.productName} and delete your account at any time. We may
            suspend or terminate accounts that violate these terms or applicable law, with notice
            where reasonably possible.
          </p>
        </section>

        <section>
          <h2>8. Disclaimers and limitation of liability</h2>
          <p>
            {siteConfig.productName} is provided "as is." To the maximum extent permitted by law, we
            disclaim warranties of any kind and are not liable for indirect, incidental, or
            consequential damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2>9. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be reflected by
            updating the "Last updated" date above, and — for significant changes — by notifying
            account holders directly.
          </p>
        </section>

        <section>
          <h2>10. Contact us</h2>
          <p>Questions about these terms can be sent to the contact details provided on our website.</p>
        </section>
      </div>
    </div>
  );
}
