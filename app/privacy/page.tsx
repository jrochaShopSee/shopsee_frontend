import React from "react";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { Card } from "../components/ui/Card";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Page() {
  const newDate = new Date();
  return (
    <BasePage>
      <div className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <Container size="md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <Card variant="default" className="bg-white p-8 md:p-12">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">ShopSee Privacy Policy</h2>
          <ol className="list-decimal ml-5 mb-6">
            <li>
              <h4 className="text-lg font-semibold">
                <strong>Introduction</strong>
              </h4>
            </li>
          </ol>
          <p className="mb-4">Welcome to ShopSee!</p>
          <p className="mb-4">
            As part of our mission to help make commerce better for everyone,
            ShopSee, Inc. and its affiliates (collectively, “ShopSee”) collect
            and process a lot of information. This Privacy Policy is intended to
            help you better understand how we collect, use, and store your
            personal information—whether you are a merchant or end user that
            uses ShopSee’s products, applications, or services (together, the
            “Services”), a customer that shops at a store using our technology,
            a participant in ShopSee’s “Partners” program, or whether you’re
            simply visiting this website. By using any of ShopSee’s Services, or
            by dealing with a merchant using ShopSee’s Services, you are
            agreeing to the terms of this Privacy Policy and, as applicable, the{" "}
            <Link href="/Terms" className="text-blue-500 underline">
              ShopSee Terms of Service
            </Link>
            .
          </p>
          <p className="mb-4">
            We may update this Privacy Policy from time to time in order to
            reflect, for example, changes to our privacy practices or for other
            operational, legal, or regulatory reasons. If we make material
            changes to this Privacy Policy, we will give you notice of such
            changes by posting the revised policy on this Website, and where
            appropriate, by other means. By continuing to use this Website or
            the Support Service after these changes are posted, you agree to the
            revised policy.
          </p>
          <ol start={2} className="list-decimal ml-5 mb-6">
            <li>
              <strong>Information from merchants</strong>
            </li>
          </ol>
          <p className="mb-4">
            Privacy matters! If you are a merchant, your customers need to
            understand how you (and how ShopSee) collects and processes their
            personal information as the data controller. Accordingly, if you use
            the Services, you agree to post an up-to-date and accurate privacy
            policy on your storefront that complies with the laws applicable to
            your business. You also agree to obtain consent from your customers
            for the use and access of their personal information by ShopSee and
            other third parties. In addition, if you are collecting any
            sensitive personal information from your customers (including
            information relating to medical or health conditions, racial or
            ethnic origin, political opinions, religious or philosophical
            beliefs, trade union membership, or sexuality), you agree to obtain
            affirmative, express consent from your customers for the use and
            access of sensitive personal information by ShopSee and other third
            parties.
          </p>
          <p className="mb-4">
            <strong>
              What information do we collect from merchants and why?
            </strong>
          </p>
          <ul className="list-disc ml-5 mb-4">
            <li>
              We collect your name, company name, address, email address, phone
              number(s), and payment details (for example, your credit card
              information) directly from you.
              <ul className="list-disc ml-5">
                <li>
                  We use this information to provide you with our Services; for
                  example, to confirm your identity, contact you, provide you
                  with advertising and marketing, and invoice you. We also use
                  this information to make sure that we comply with legal
                  requirements.
                </li>
              </ul>
            </li>
            <li>
              We collect data about the ShopSee websites that you visit from
              your device. We also collect data about how and when you access
              your account and the ShopSee platform, including information about
              the device and browser you use, your network connection, your IP
              address, and information about how you browse through the ShopSee
              interface.
              <ul className="list-disc ml-5">
                <li>
                  We use this information to give you access to and improve our
                  Services; for example, to make our platform interface easier
                  to use. We also use this information to personalize the
                  Services for you; for example, by shifting the order of apps
                  in the ShopSee app store to show you apps we believe may be of
                  interest to you. Finally, we may use this information to
                  provide you with advertising or marketing.
                </li>
              </ul>
            </li>
            <li>
              We may collect personal information about your customers that you
              share with us or that customers provide while shopping or during
              checkout.
              <ul className="list-disc ml-5">
                <li>
                  We may use this information to provide you with our Services
                  and so that you can process orders and better serve your
                  customers.
                </li>
              </ul>
            </li>
            <li>
              Where we need to verify your identity (for example, if there are
              concerns around identity theft, or if you call into support and we
              need to authenticate your account), we may request that you
              provide us with government-issued identification information.
            </li>
            <li>
              We use some of the personal information you provide us to conduct
              some level of automated decision-making &#8212; for example, we
              use certain personal information to help us screen accounts for
              risk or fraud concerns.
            </li>
            <li>
              We will also use personal information in other cases where you
              have given us your express permission.
            </li>
          </ul>
          <p className="mb-4">
            <strong>When do we collect this information?</strong>
          </p>
          <ul className="list-disc ml-5 mb-4">
            <li>
              We collect personal information when you sign up for our Services,
              when you access our Services or otherwise provide us with the
              information.
            </li>
            <li>
              We also partner with third parties who provide us information
              about merchants or prospective merchants, for example to help us
              screen out merchants associated with fraud.
            </li>
          </ul>
          <p className="mb-4">
            <strong>
              When and why do we share this information with third parties?
            </strong>
          </p>
          <ul className="list-disc ml-5 mb-4">
            <li>
              ShopSee works with or may work with a variety of third parties and
              service providers to help provide you with our Services and we may
              share personal information with them to support these efforts.
            </li>
            <li>
              We may also share your information in the following circumstances:
              <ul className="list-disc ml-5">
                <li>
                  To prevent, investigate, or take action regarding illegal
                  activities, suspected fraud, situations involving potential
                  threats to the physical safety of any person, violations of
                  our Terms of Service or any other agreement related to the
                  Services, or as otherwise required by law.
                </li>
                <li>
                  To help us conduct marketing and/or advertising campaigns.
                </li>
                <li>
                  To conform to legal requirements, or to respond to lawful
                  court orders, subpoenas, warrants, or other requests by public
                  authorities (including to meet national security or law
                  enforcement requirements).
                </li>
              </ul>
            </li>
            <li>
              Personal information may also be shared with a company that
              acquires our business, whether through merger, acquisition,
              bankruptcy, dissolution, reorganization, or other similar
              transaction or proceeding. If this happens, we will post a notice
              on our home page.
            </li>
            <li>
              ShopSee will always ask for your consent before sharing your
              personal information with third parties for purposes other than
              those described in this Section 2.
            </li>
            <li>
              ShopSee is responsible for all onward transfers of personal
              information to third parties in accordance with the EU-U.S.
              Privacy Shield Framework, the Swiss-U.S. Privacy Shield Framework,
              and Canada’s Personal Information Protection and Electronic
              Documents.
            </li>
          </ul>
          <p className=" mb-4">
            <strong>
              What information do we collect from our merchants’ customers and
              why?
            </strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              We collect our merchants’ customers’ name, email, shipping and
              billing address, payment details, company name, phone number, IP
              address, information about orders you initiate, information about
              the ShopSee-supported merchant stores that you visit, and
              information about the device and browser you use.
              <ul className="list-disc pl-5">
                <li className="mb-2">
                  We use this information to provide our merchants with the
                  Services, including supporting and processing orders, risk and
                  fraud screening, authentication, and payments. We also use
                  this information to improve our Services.
                </li>
                <li>
                  If you opt into ShopSee, we store and use this information to
                  pre-fill your checkout information. We additionally use this
                  information to help customize and improve your experience when
                  you visit a merchant store by presenting to you goods and
                  services that are more likely to be of interest to you.
                </li>
              </ul>
            </li>
            <li>
              We use some of the personal information you provide us to conduct
              some level of automated decision-making &#8212; for example, we
              use certain personal information (for example, IP addresses or
              payment information) to automatically block certain potentially
              fraudulent transactions for a short period of time.
            </li>
          </ul>
          <p className="mb-4">
            <strong>When do we collect this information?</strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              We collect this information directly from you or your device when
              you use or access a store that uses our Services, such as when you
              visit a merchant’s site, place an order or sign up for an account
              on a merchant’s site.
            </li>
            <li className="mb-2">
              We also collect this information when you opt into ShopSee or use
              ShopSee to pre-fill your checkout information.
            </li>
            <li>
              Additionally, we partner with third parties who provide us
              information about our merchants’ customers, for example to help us
              screen out merchants associated with fraud.
            </li>
          </ul>
          <p className="mb-4">
            <strong>
              When and why do we share this information with third parties?
            </strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              ShopSee works with or may work with a variety of third parties and
              service providers to help provide our merchants with the Services
              and we may share personal information with them to support these
              efforts.
            </li>
            <li className="mb-2">
              We may also share your information in the following circumstances:
              <ul className="list-disc pl-5">
                <li className="mb-2">
                  to prevent, investigate, or take action regarding illegal
                  activities, suspected fraud, situations involving potential
                  threats to the physical safety of any person, violations of
                  our Terms of Service or any other agreement related to the
                  Services, or as otherwise required by law.
                </li>
                <li className="mb-2">
                  If the merchant whose store you visit or access directs us to
                  transfer this information (for example, if they enable a
                  third-party app that accesses customer personal information).
                </li>
                <li>
                  to conform to legal requirements, or to respond to lawful
                  court orders, subpoenas, warrants, or other requests by public
                  authorities (including to meet national security or law
                  enforcement requirements).
                </li>
              </ul>
            </li>
            <li className="mb-2">
              Personal information may also be shared with a company that
              acquires our business or the business of a merchant whose store
              you visit or access, whether through merger, acquisition,
              bankruptcy, dissolution, reorganization, or other similar
              transaction or proceeding.
            </li>
            <li>
              ShopSee is responsible for all onward transfers of personal
              information to third parties in accordance with the EU-U.S.
              Privacy Shield Framework, the Swiss-U.S. Privacy Shield Framework,
              and Canada’s Personal Information Protection and Electronic
              Documents Act (PIPEDA).
            </li>
          </ul>
          <ol start={4} className="list-decimal ml-5 mb-6">
            <li>
              <strong>Information from partners</strong>
            </li>
          </ol>
          <p className="mb-4">
            Partners are individuals or businesses that have agreed to the terms
            of the{" "}
            <Link href="Terms" className="link-primary">
              ShopSee Partner Program
            </Link>{" "}
            to work with ShopSee to promote the Services by:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">Referring clients to ShopSee</li>
            <li className="mb-2">
              Developing ShopSee affiliates for merchant use
            </li>
            <li className="mb-2">
              Developing apps using the ShopSee Application Interface (API) for
              merchant use
            </li>
          </ul>

          <p className="mb-4">
            <strong>
              What information do we collect from partners and why?
            </strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              We collect your name, company name, website, social media handles,
              phone number(s), address, business type, email address, PayPal
              account, and GST/HST number directly from you.
              <ul className="list-disc pl-5 mb-4">
                <li className="mb-2">
                  We use this information to work with you, confirm your
                  identity, contact you, pay you, and to screen for risk, fraud,
                  or other similar issues.
                </li>
              </ul>
            </li>
            <li className="mb-2">
              We collect data about the ShopSee websites you visit, how and when
              you access your account, and the ShopSee platform. This includes
              information about the device and browser you use, your network
              connection, IP address, and browsing behavior.
              <ul className="list-disc pl-5 mb-4">
                <li className="mb-2">
                  We use this information to give you access to and improve our
                  Services. For example, we personalize the platform for you and
                  optimize the app store by prioritizing apps that may interest
                  you.
                </li>
              </ul>
            </li>
            <li className="mb-2">
              We collect personal information about your customers that you
              share with us or that they provide to us directly.
              <ul className="list-disc pl-5 mb-4">
                <li className="mb-2">
                  We use this information to work with you and provide our
                  Services to your customers.
                </li>
              </ul>
            </li>
            <li className="mb-2">
              We will also use personal information in other cases where you
              have given us express permission.
            </li>
          </ul>

          <p className="mb-4">
            <strong>When do we collect this information?</strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              We collect this information when you sign up for a partner
              account, sign up a customer for our Services, or when your
              customers sign up themselves. Additional information you provide
              is also collected.
            </li>
          </ul>

          <p className="mb-4">
            <strong>
              When and why do we share this information with third parties?
            </strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              ShopSee works with third parties and service providers to help
              provide you with our Services. We may share personal information
              with them to support these efforts.
            </li>
            <li className="mb-2">
              We may also share your information in the following circumstances:
              <ul className="list-disc pl-5 mb-4">
                <li className="mb-2">
                  To prevent, investigate, or take action regarding illegal
                  activities, suspected fraud, physical threats, violations of
                  our Terms of Service, or as required by law.
                </li>
                <li className="mb-2">
                  To help us conduct marketing and/or advertising campaigns.
                </li>
                <li className="mb-2">
                  To conform to legal requirements or respond to lawful court
                  orders, subpoenas, warrants, or other requests by public
                  authorities.
                </li>
              </ul>
            </li>
            <li className="mb-2">
              Personal information may also be shared with a company that
              acquires our business through merger, acquisition, bankruptcy, or
              similar transactions. If this happens, we will post a notice on
              our home page.
            </li>
            <li className="mb-2">
              ShopSee will always ask for your consent before sharing your
              personal information with third parties for purposes other than
              those described in this section.
            </li>
            <li className="mb-2">
              ShopSee is responsible for onward transfers of personal
              information to third parties in compliance with the EU-U.S.
              Privacy Shield Framework, Swiss-U.S. Privacy Shield Framework, and
              Canada’s Personal Information Protection and Electronic Documents
              Act (PIPEDA).
            </li>
          </ul>

          <ol start={5} className="list-decimal ml-5 mb-6">
            <li>
              <strong>
                Information from ShopSee website visitors and support users
              </strong>
            </li>
          </ol>

          <p className="mb-4">
            <strong>What information do we collect and why?</strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              As you browse ShopSee websites, we collect information about your
              device and browser, your network connection, your IP address, and
              the cookies installed on your device.
            </li>
            <li className="mb-2">
              We may receive personal information when you make purchases or
              other requests via our websites.
            </li>
            <li className="mb-2">
              From telephone support users, we collect phone numbers, call
              audio, and other personal details provided during calls.
              Additional documentation may be requested for identity
              verification.
            </li>
            <li className="mb-2">
              From chat support users, we collect names, email addresses, device
              and browser details, network connection, IP addresses, chat
              transcripts, and other personal information provided during chats.
              Additional documentation may also be requested.
            </li>
            <li className="mb-2">
              From forum users, we collect names, email addresses, website URLs,
              and other posted personal information.
            </li>
          </ul>

          <p className="mb-4">
            We use this information to verify your account, enhance our
            Services, support your account, and answer any questions.
          </p>

          <p className="mb-4">
            <strong>When do we collect this information?</strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>
              We collect this information when you visit ShopSee websites, use
              website Services, engage with us via email, web forms, instant
              messages, or phone, or post content on our websites, including
              forums.
            </li>
          </ul>

          <ol start={6} className="list-decimal ml-5 mb-6">
            <li>
              <strong>
                {" "}
                Information from cookies and similar tracking technologies
              </strong>
            </li>
          </ol>
          <p className="mb-4">
            What is a cookie? A cookie is a small amount of data, which may
            include a unique identifier. Cookies are sent to your browser from a
            website and stored on your device. We assign a different cookie to
            each device that accesses our website.
          </p>
          <p className="mb-4">
            <strong>
              Why does ShopSee use cookies and similar tracking technology?
            </strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              We use cookies to recognize your device and provide you with a
              personalized experience on our websites, or otherwise through the
              Services. We also use cookies as part of the Services, for example
              to operate the shopping cart for our merchants’ stores. Read more
              about how we use cookies on our sites and our merchants’ sites in
              our Cookie Policy.
            </li>
            <li className="mb-2">
              We also use cookies, and other information from your browser
              and/or device to provide you with personalized advertising, ad
              delivery, and reporting across multiple sessions and devices.
            </li>
            <li className="mb-2">
              Our third-party advertising partners use cookies to track your
              prior visits to our websites and elsewhere on the Internet in
              order to serve you targeted ads. For more information about
              targeted or behavioral advertising, please visit{" "}
              <a href="https://www.networkadvertising.org/understanding-online-advertising">
                https://www.networkadvertising.org/understanding-online-advertising
              </a>
              .
            </li>
            <li className="mb-2">
              Opting out: You can opt out of targeted ads served via specific
              third party vendors by visiting the Digital Advertising Alliance’s{" "}
              <a href="http://optout.aboutads.info/#!/">Opt-Out page</a> or the
              Network Advertising Initiative’s{" "}
              <a href="http://optout.networkadvertising.org/?c=1">
                Opt-Out page
              </a>
              .
            </li>
            <li className="mb-2">
              We may also use web beacons, software development kits, and other
              automated tracking methods on our websites, in communications with
              you, and in our products and services, to measure performance and
              engagement.
            </li>
            <li className="mb-2">
              Please note that because there is no consistent industry
              understanding of how to respond to “Do Not Track” signals, we do
              not alter our data collection and usage practices when we detect
              such a signal from your browser.
            </li>
          </ul>
          <ol start={7} className="list-decimal ml-5 mb-6">
            <li>
              <strong> Third party apps</strong>
            </li>
          </ol>
          <ul className="list-disc pl-5 mb-4">
            <li>
              ShopSee’s platform may allow merchants to connect their stores
              with third party applications to alter or provide new
              functionalities in their store. Unless listed as “Made by
              ShopSee,” ShopSee is not responsible for and has no control over
              how these apps function. Merchants ultimately can control which
              apps they choose to use with their stores, and are responsible for
              making sure that they do so in compliance with relevant privacy
              and data protection requirements.
            </li>
          </ul>
          <ol start={8} className="list-decimal ml-5 mb-6">
            <li>
              <strong>
                {" "}
                For how long do we retain your personal information?
              </strong>
            </li>
          </ol>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              In general, we keep your personal information throughout your
              relationship with us. For merchants, this means we will keep your
              information as long as you maintain a store on our platform. For
              partners, this means we will keep your information until you
              inform us that you wish to terminate your partner relationship
              with us. We may purge personal information after receiving a
              merchant or partner deletion request.
            </li>
            <li className="mb-2">
              For our merchants’ customers, we generally process your
              information solely as a data processor on behalf of our merchants,
              and it is up to the merchant to determine how long they will store
              your information in our systems.
            </li>
            <li className="mb-2">
              ShopSee acts as a data processor on behalf of our merchants,
              except where personal data of merchants’ customers is used for the
              purposes specified for us in Section 3 ‘What do we use this data
              for?’ Purposes include for risk and fraud screening.
            </li>
            <li className="mb-2">
              Once you terminate your relationship with us, we generally will
              continue to store archived copies of your personal information for
              legitimate business purposes such as to defend a contractual claim
              or for audit purposes and to comply with the law, except when we
              receive a valid erasure request, or, if you are a merchant, you
              terminate your account and your personal information is purged
              pursuant to our standard purge process.
            </li>
            <li className="mb-2">
              We will continue to store anonymous or anonymized information,
              such as website visits, without identifiers, in order to improve
              our Services.
            </li>
          </ul>
          <ol start={9} className="list-decimal ml-5 mb-6">
            <li>
              <strong> What we don’t do with your personal information</strong>
            </li>
          </ol>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              We do not and will never share, disclose, sell, rent, or otherwise
              provide personal information to other companies (other than to
              specific ShopSee merchants you are interacting with, or to third
              party apps or service providers being used by those merchants if
              you are a consumer, or Partners that you hire if you are a
              merchant) for the marketing of their own products or services. We
              also do not and will not “sell” your customers’ information, as
              that term is used in California law.
            </li>
            <li className="mb-2">
              If you are a merchant using ShopSee’s Services, we do not use the
              personal information we collect from you or your customers to
              independently contact or market to your customers. However,
              ShopSee may contact or market to your customers if we obtain their
              information from another source, such as from the customers
              themselves (for example, if they use ShopSee consumer-facing
              services).
            </li>
            <li className="mb-2">
              We will not charge you more or provide you with a different level
              of service if you exercise your privacy rights.
            </li>
          </ul>
          <ol start={10} className="list-decimal ml-5 mb-6">
            <li>
              <strong> How do we keep your personal information secure?</strong>
            </li>
          </ol>
          <ul className="list-disc ml-5 mb-6">
            <li className="mb-2">
              We follow industry standards on information security management to
              safeguard sensitive information, such as financial information,
              intellectual property, employee details and any other personal
              information entrusted to us. Our information security systems
              apply to people, processes and information technology systems on a
              risk management basis.
            </li>
            <li className="mb-2">
              We work hard to ensure our handling of your credit card
              information aligns with industry guidelines.
            </li>
            <li className="mb-2">
              No method of transmission over the Internet, or method of
              electronic storage, is 100% secure. Therefore, we cannot guarantee
              the absolute security of your personal information.
            </li>
          </ul>
          <ol start={11} className="list-decimal ml-5 mb-6">
            <li>
              <strong> Residents of the European Economic Area (“EEA”)</strong>
            </li>
          </ol>
          <p className="mb-4">
            ShopSee works with merchants and users around the world, including
            in the EEA. If you are located in the EEA, your personal information
            will or may be processed by a ShopSee affiliate. As part of our
            service, we may transfer your personal information to other regions,
            including to Canada and the United States. In order to ensure that
            your information is protected when transferred out of the EEA,
            ShopSee relies on the EU-U.S. Privacy Shield (described in more
            detail below), as well as inter-company agreements between our
            various affiliates that may process your information on behalf of
            ShopSee.
          </p>
          <p className="mb-4">
            If you are located in the EEA, you have certain rights under
            European law with respect to your personal data, including the right
            to request access to, correct, amend, delete, port to another
            service provider, or object to certain uses of your personal data.
            If you are a merchant, a partner, a visitor of ShopSee’s websites,
            or a user of ShopSee’s support services and wish to exercise these
            rights, please reach out to us using the contact information below.
            If you are a customer of a merchant who uses ShopSee’s platform and
            wish to exercise these rights, please contact the merchants you
            interacted with directly &#8212; we serve as a processor on their
            behalf, and can only forward your request to them to allow them to
            respond.
          </p>
          <p className="mb-4">
            If you are unhappy with the response that you receive from us we
            hope that you would contact us to resolve the issue but you also
            have the right to lodge a complaint with the relevant data
            protection authority in your jurisdiction at any time.
          </p>
          <p className="mb-4">
            Additionally, if you are located in the EEA, we note that we are
            generally processing your information in order to fulfill contracts
            we might have with you (for example if you make an order through the
            Site), or otherwise to pursue our legitimate business interests
            listed above, unless we are required by law to obtain your consent
            for a particular processing operation. In particular we process your
            personal data to pursue the following legitimate interests, either
            for ourselves, our merchants, our partners, or other third parties
            (including our merchants’ customers):
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li className="mb-2">
              To provide merchants and others with our services and
              applications;
            </li>
            <li className="mb-2">To prevent risk and fraud on our platform;</li>
            <li className="mb-2">
              To provide communications, marketing, and advertising;
            </li>
            <li className="mb-2">To provide reporting and analytics;</li>
            <li className="mb-2">
              To help merchants find and integrate with apps through our app
              store;
            </li>
            <li className="mb-2">
              To provide troubleshooting, support services, or to answer
              questions;
            </li>
            <li className="mb-2">
              To test out features or additional services; and
            </li>
            <li className="mb-2">
              To improve our services, applications, and websites.
            </li>
          </ul>
          <p className="mb-4">
            When we process personal information to pursue these legitimate
            interests, we do so where we believe the nature of the processing,
            the information being processed, and the technical and
            organizational measures employed to protect that information can
            help mitigate the risks to the data subject.
          </p>
          <ol start={12} className="list-decimal ml-5 mb-6">
            <li>
              <strong>
                {" "}
                How do we protect your personal information across borders?
              </strong>
            </li>
          </ol>
          <p className="mb-4">
            While ShopSee, Inc. is a United States company that can and intends
            to provide services to individuals and companies and our technology
            processes data from users around the world. Accordingly, ShopSee may
            transmit your personal information outside of the country, state, or
            province in which you are located. Transferred data may be subject
            to the laws of those countries. ShopSee does, and will, not transfer
            or store data in countries that do not have a robust regime of data
            protection.
          </p>
          <p className="mb-4">
            ShopSee (and any of ShopSee’s affiliates) complies with the EU-U.S.
            Privacy Shield Framework, regarding the collection, use, and
            retention of personal information from data subjects in the European
            Economic Area (“EEA”), and with the Swiss-U.S. Privacy Shield
            Framework regarding the collection, use and retention of personal
            information from data subjects in Switzerland. In this regard, we
            have certified that we adhere to the Privacy Shield Principles of
            notice, choice, accountability for onward transfers, security, data
            integrity and purpose limitation, access, recourse, enforcement and
            liability.
          </p>
          <p className="mb-4">
            If you are located in the EEA or in Switzerland, and believe that
            your personal information has been used in a manner that is not
            consistent with the relevant privacy policies listed above, please
            contact us using the information below. If your complaint or dispute
            remains unresolved, you may also contact the International Centre
            for Dispute Resolution®, the international division of the American
            Arbitration Association® (ICDR/AAA). This organization provides
            independent dispute resolution services, at no charge to you.
            ICDR/AAA can be contacted at{" "}
            <a href="http://go.adr.org/privacyshield.html">
              http://go.adr.org/privacyshield.html
            </a>
            .
          </p>
          <p className="mb-4">
            If, after attempting to resolve a dispute through ICDR/AAA, you feel
            that your concerns about the use of your personal information have
            not been resolved, you may seek resolution of the issue through
            binding arbitration. For more information about the binding
            arbitration process, please visit{" "}
            <a href="http://www.privacyshield.gov/">
              http://www.privacyshield.gov
            </a>
            .
          </p>
          <p className="mb-4">
            By participating in the EU-U.S. Privacy Shield Framework and the
            Swiss-U.S. Privacy Shield Framework, ShopSee’s participating U.S.
            entities are subject to the investigatory and enforcement powers of
            the U.S. Federal Trade Commission. For more information about the
            EU-U.S. Privacy Shield and the Swiss-U.S. Privacy Shield, please
            visit{" "}
            <a href="https://www.privacyshield.gov/">
              https://www.privacyshield.gov
            </a>
            .
          </p>
          <ol start={13} className="list-decimal ml-5 mb-6">
            <li>
              <strong> Automated Decision-Making</strong>
            </li>
          </ol>
          <p className="mb-4">
            In the course of offering our services, ShopSee intends to use a
            number of machine learning algorithms and forms of automated
            decision-making. For example, we use automated decision-making: to
            prevent risk and fraud by merchants; to help merchants avoid
            fraudulent transactions from their customers; to personalize
            merchants’ experience when they use our admin and app store; and to
            determine eligibility for certain services.
          </p>
          <p className="mb-4">
            Most of these algorithms (excluding the personalization features and
            a subset of customer risk/fraud screening, discussed in more detail
            below) are not fully automated and include some human intervention
            (for example, customer risk and fraud scores are provided to
            merchants, who must intentionally decide how to act on them). Our
            personalization algorithms are intended to be fully automated, but
            only affect display features like how apps in the app store are
            presented to you. Similarly, we intend to maintain a small subset of
            fully automated fraud screening blacklists, which, if we believe a
            transaction was made using stolen or fraudulent payment information,
            may stop a customer from completing a transaction&#8211;but only for
            a period of between a few hours and a few days.
          </p>
          <ol start={14} className="list-decimal ml-5 mb-6">
            <li>
              <strong>
                {" "}
                Control over and access to your personal information
              </strong>
            </li>
          </ol>
          <p className="mb-4">
            ShopSee understands that you have rights over your personal
            information, and takes reasonable steps to allow you to access,
            correct, amend, delete, port, or limit the use of your personal
            information. If you are a merchant or a partner, you can update many
            types of personal information, such as payment or contact
            information, directly within your account settings. If you are
            unable to change your personal information within your account
            settings, or if you are concerned about data collected as you visit
            ShopSee’s websites or use our support services, please contact us to
            make the required changes.
          </p>
          <p className="mb-4">
            Please note that if you send us a request relating to your personal
            information, we have to make sure that it is you before we can
            respond. In order to do so, we may ask to see documentation
            verifying your identity, which we will discard after verification.
          </p>
          <p className="mb-4">
            If you would like to designate an authorized agent to exercise your
            rights for you, please email us from the email address we have on
            file for you. If you email us from a different email address, we
            cannot determine if the request is coming from you and will not be
            able to accommodate your request. In your email, please include the
            name and email address of your authorized agent.
          </p>
          <p className="mb-4">
            If you are a merchant’s customer and wish to exercise these rights,
            please contact the merchants you interacted with directly &#8212; we
            serve as a processor on their behalf, and can only forward your
            request to them to allow them to respond.
          </p>
          <p className="mb-4">
            It’s important to remember that if you delete or limit the use of
            your personal information, the Services may not function properly.
            Additionally, if you use ShopSee and would like to have your
            personal information erased, please use the “Opt Out” tool.
          </p>
          <ol start={15} className="list-decimal ml-5 mb-6">
            <li>
              <strong> How to contact ShopSee</strong>
            </li>
          </ol>
          <p className="list-decimal ml-5 mb-6">
            If you have any questions about your personal information or this
            policy, or if you would like to make a complaint about how ShopSee
            processes your personal data, please contact ShopSee by email at{" "}
            <a href="mailto:privacy@myshopsee.com">privacy@myshopsee.com</a>.
          </p>
          <p className="list-decimal ml-5 mb-6">
            Last updated: February 7, 2021
            <br />© {newDate.getFullYear()} ShopSee, Inc.
          </p>
            </div>
          </Card>
        </Container>
      </div>
    </BasePage>
  );
}
