import React from "react";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { Card } from "../components/ui/Card";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function Page() {
    //const newDate = new Date();
    return (
        <BasePage>
          <div className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
            <Container size="md">
              <div className="flex items-center justify-center gap-3 mb-8">
                <FileText className="w-10 h-10 text-secondary" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Terms of Use</h1>
              </div>

              <Card variant="default" className="bg-white p-8 md:p-12">
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-secondary prose-a:no-underline hover:prose-a:underline">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">ShopSee Terms of Use</h2>
                    <p className="mb-4">Last updated on: January 5, 2020</p>
                    <p className="mb-4">By signing up for a ShopSee Account (as defined in Section 1) or by using any ShopSee Services (as defined below), you are agreeing to be bound by the following terms and conditions (the “Terms of Service”).</p>
                    <p className="mb-4">As used in these Terms of Service, “we”, “us” and “ShopSee” means the applicable ShopSee Contracting Party (as defined in Section 4 below).</p>
                    <p className="mb-4">
                        The services offered by ShopSee under the Terms of Service include various products and services to help you sell goods and services to buyers online (“Online Services”). Any such services offered by ShopSee are referred to in these Terms of Services as the “Services”. Any new features or tools which are added to the current Services shall be also subject to the Terms of Service. You can review the current version of the Terms of Service at any time at
                        https://myshopsee.com/TermsOfUse. ShopSee reserves the right to update and change the Terms of Service by posting updates and changes to the ShopSee website. You are advised to check the Terms of Service from time to time for any updates or changes that may impact you. and if you do not accept such amendments, you must cease using the Services.
                    </p>
                    <p className="mb-4">
                        You must read, agree with and accept all of the terms and conditions contained or expressly referenced in these Terms of Service, including ShopSee’s <a href="#">Acceptable Use Policy (“AUP”)</a>
                        and Privacy Policy, and, if applicable, the ShopSee <a href="#">API License and Terms of Use (“API Terms”)</a> and the ShopSee <a href="#">Data Processing Addendum (“DPA”)</a> before you may sign up for a ShopSee Account or use any ShopSee Service.
                    </p>
                    <p className="mb-4">
                        <strong>Everyday language summaries are provided for convenience only and appear in bold under each section, but these summaries are not legally binding. Please read the Terms of Service, including any document referred to in these Terms of Service, for the complete picture of your legal requirements. By using ShopSee or any ShopSee services, you are agreeing to these terms. Be sure to occasionally check back for updates.</strong>
                    </p>
                    <p className="mb-4">
                        <strong>1. Account Terms</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">To access and use the Services, you must register for a ShopSee account (“Account”) by providing your full legal name, current address, phone number, a valid email address, and any other information indicated as required. ShopSee may reject your application for an Account, or cancel an existing Account, for any reason, in our sole discretion.</li>
                        <li className="ms-2">You must be the older of: (i) 18 years, or (ii) at least the age of majority in the jurisdiction where you reside and from which you use the Services to open an Account.</li>
                        <li className="ms-2">You confirm that you are receiving any Services provided by ShopSee for the purposes of carrying on a business activity and not for any personal, household or family purpose.</li>
                        <li className="ms-2">You acknowledge that ShopSee will use the email address you provide on opening an Account or as updated by you from time to time as the primary method for communication with you.</li>
                        <li className="ms-2">You are responsible for keeping your password secure. ShopSee cannot and will not be liable for any loss or damage from your failure to maintain the security of your Account and password.</li>
                        <li className="ms-2">You are responsible for all activity and content such as photos, images, videos, graphics, written content, audio files, code, information, or data uploaded, collected, generated, stored, displayed, distributed, transmitted or exhibited on or in connection with your Account (“Materials”).</li>
                        <li className="ms-2">A breach or violation of any term in the Terms of Service, including the AUP, as determined in the sole discretion of ShopSee may result in an immediate termination of your Services.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">You are responsible for your Account and any Materials you upload to the ShopSee Service. Remember that if you violate these terms we may cancel your service.</p>
                    <p className="mb-4">If we need to reach you, we will send you an email.</p>
                    <p className="mb-4">
                        <strong>2. Account Activation</strong>
                    </p>
                    <p className="mb-4">
                        <strong>2.1 Store Owner</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">Subject to section 2.1(2), the person signing up for the Service by opening an Account will be the contracting party (“Store Owner”) for the purposes of our Terms of Service and will be the person who is authorized to use any corresponding Account we may provide to the Store Owner in connection with the Service.</li>
                        <li className="ms-2">If you are signing up for the Services on behalf of your employer, your employer shall be the Store Owner. If you are signing up for the Services on behalf of your employer, then you must use your employer-issued email address and you represent and warrant that you have the authority to bind your employer to our Terms of Service.</li>
                        <li className="ms-2">Your ShopSee Store can only be associated with one Store Owner. A Store Owner may have multiple ShopSee Stores. “Store” means the online store or physical retail location(s) associated with the Account.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>2.2 Staff Accounts</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">The Store Owner is responsible and liable for the acts, omissions and defaults arising from use of their Account in the performance of obligations under these Terms of Service.</li>
                        <li className="ms-2">The Store Owner and the users under Store Owner are each referred to as a “ShopSee User”.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>2.3 ShopSee Payments Accounts</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">Upon completion of sign up for the Service, ShopSee will create a create a ShopSee Payments account on your behalf.</li>
                        <li className="ms-2">You acknowledge that ShopSee Payments will be your default payments gateway(s) and that it is your sole responsibility as the Store Owner to activate and maintain these accounts.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>3. General Conditions</strong>
                    </p>
                    <p className="mb-4">
                        You must read, agree with and accept all of the terms and conditions contained in these Terms of Service, including the <a href="#">AUP</a> and the <Link href="/privacy">Privacy Policy</Link> before you may become a ShopSee User.
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">Technical support in respect of the Services is only provided to ShopSee Users.</li>
                        <li className="ms-2">The Terms of Service shall be governed by and interpreted in accordance with the laws of the State of Delaware of the United States applicable therein, without regard to principles of conflicts of laws. The United Nations Convention on Contracts for the International Sale of Goods will not apply to these Terms of Service and is hereby expressly excluded.</li>
                        <li className="ms-2">
                            You acknowledge and agree that ShopSee may amend these Terms of Service at any time by posting the relevant amended and restated Terms of Service on ShopSee’s website, available at <a href="#">https://myshopsee.com/TermsOfUse</a> and such amendments to the Terms of Service are effective as of the date of posting. Your continued use of the Services after the amended Terms of Service are posted to ShopSee’s website constitutes your agreement to, and acceptance of, the
                            amended Terms of Service. If you do not agree to any changes to the Terms of Service, do not continue to use the Service.
                        </li>
                        <li className="ms-2">You may not use the ShopSee Services for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws), the laws applicable to you in your customer’s jurisdiction, or the laws of the United States. You will comply with all applicable laws, rules and regulations in your use of the Service and your performance of obligations under the Terms of Service.</li>
                        <li className="ms-2">
                            The ShopSee API License and Terms of Use at <Link href="/terms">https://myshopsee.com/TermsOfUse</Link>
                            govern your access to and use of the ShopSee API (as defined therein). You are solely responsible for the activity that occurs using your API Credentials (as defined in the API Terms) and for keeping your API Credentials secure.
                        </li>
                        <li className="ms-2">You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Services, or access to the Services without the express written permission by ShopSee.</li>
                        <li className="ms-2">You shall not purchase search engine or other pay per click keywords (such as Google AdWords), or domain names that use ShopSee or ShopSee trademarks and/or variations and misspellings thereof.</li>
                        <li className="ms-2">Questions about the Terms of Service should be sent to ShopSee Support.</li>
                        <li className="ms-2">You understand that your Materials (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</li>
                        <li className="ms-2">You acknowledge and agree that your use of the Services, including information transmitted to or stored by ShopSee, is governed by its privacy policy at https://myshopsee.com/PrivacyPolicy</li>
                        <li className="ms-2">
                            The Terms of Service may be available in languages other than English. To the extent of any inconsistencies or conflicts between these English Terms of Service and ShopSee’s Terms of Service available in another language, the most current English version of the Terms of Service at <Link href="/terms">https://myshopsee.com/TermsOfUse</Link> will prevail.
                        </li>
                        <li className="ms-2">
                            All the terms and provisions of the Terms of Service shall be binding upon and inure to the benefit of the parties to the Terms of Service and to their respective heirs, successors, permitted assigns and legal representatives. ShopSee shall be permitted to assign these Terms of Service without notice to you or consent from you. You shall have no right to assign or otherwise transfer the Terms of Service, or any of your rights or obligations hereunder, to any third
                            party without ShopSee’s prior written consent, to be given or withheld in ShopSee’s sole discretion.
                        </li>
                        <li className="ms-2">
                            If any provision, or portion of the provision, in these Terms of Service is, for any reason, held to be invalid, illegal or unenforceable in any respect, then such invalidity, illegality or unenforceability will not affect any other provision (or the unaffected portion of the provision) of the Terms of Service, and the Terms of Service will be construed as if such invalid, illegal or unenforceable provision, or portion of the provision, had never been contained within
                            the Terms of Service.
                        </li>
                        <li className="ms-2">Sections 1, 3(2)-(5), 4, 6-8, 11-12, 14(9)-(11), 16, 18 and 19 will survive the termination or expiration of these Terms of Service.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">The ShopSee service belongs to us. You are not allowed to rip it off or use it for any illegal or sketchy purpose. If you or your employees or contractors use ShopSee’s APIs, you will comply with our API terms.</p>
                    <p className="mb-4">Your Materials may be transferred unencrypted and may be altered, but credit card information is always encrypted.</p>
                    <p className="mb-4">
                        <strong>4. ShopSee Contracting Party</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">If the billing address of your Store is located in the United States or Canada, this Section 4(1) applies to you:</li>
                    </ol>
                    <p className="mb-4">a. “ShopSee Contracting Party” means ShopSee, Inc., a United States corporation, with offices located in California, USA.</p>
                    <p className="mb-4">b. The parties irrevocably and unconditionally submit to the exclusive jurisdiction of the courts of Delaware in the USA with respect to any dispute or claim arising out of or in connection with the Terms of Service. The United Nations Convention on Contracts for the International Sale of Goods will not apply to these Terms of Service and is hereby expressly excluded.</p>
                    <p className="mb-4">
                        <strong>5. ShopSee Rights</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">We reserve the right to modify or terminate the Services for any reason, without notice at any time. Not all Services and features are available in every jurisdiction and we are under no obligation to make any Services or features available in any jurisdiction.</li>
                        <li className="ms-2">We reserve the right to refuse service to anyone for any reason at any time.</li>
                        <li className="ms-2">
                            We may, but have no obligation to, remove Materials and suspend or terminate Accounts if we determine in our sole discretion that the goods or services offered via a Store, or the Materials uploaded or posted to a Store, violate our <a href="#">Acceptable Use Policy (“AUP”)</a> or these Terms of Service.
                        </li>
                        <li className="ms-2">Verbal or written abuse of any kind (including threats of abuse or retribution) of any ShopSee customer, ShopSee employee, member, or officer will result in immediate Account termination.</li>
                        <li className="ms-2">ShopSee does not pre-screen Materials and it is in our sole discretion to refuse or remove any Materials from the Service, including your Store.</li>
                        <li className="ms-2">We reserve the right to provide our services to your competitors and make no promise of exclusivity in any particular market segment. You further acknowledge and agree that ShopSee employees and contractors may also be ShopSee customers/merchants and that they may compete with you, although they may not use your Confidential Information (as defined in Section 6) in doing so.</li>
                        <li className="ms-2">In the event of a dispute regarding Account ownership, we reserve the right to request documentation to determine or confirm Account ownership. Documentation may include, but is not limited to, a scanned copy of your business license, government issued photo ID, the last four digits of the credit card on file, your status as an employee of an entity, etc.</li>
                        <li className="ms-2">ShopSee retains the right to determine, in our sole judgment, rightful Account ownership and transfer an Account to the rightful Store Owner. If we are unable to reasonably determine the rightful Store Owner, without prejudice to our other rights and remedies, ShopSee reserves the right to temporarily disable an Account until resolution has been determined between the disputing parties.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">We can modify, cancel or refuse the service at anytime.</p>
                    <p className="mb-4">In the event of an ownership dispute over a ShopSee account, we can freeze the account or transfer it to the rightful owner, as determined by us.</p>
                    <p className="mb-4">
                        <strong>6. Confidentiality</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">
                            “Confidential Information”&nbsp;shall include, but shall not be limited to, any and all information associated with a party’s business and not publicly known, including specific business information, technical processes and formulas, software, customer lists, prospective customer lists, names, addresses and other information regarding customers and prospective customers, product designs, sales, costs (including any relevant processing fees), price lists, and other
                            unpublished financial information, business plans and marketing data, and any other confidential and proprietary information, whether or not marked as confidential or proprietary. ShopSee’s Confidential Information includes all information that you receive relating to us, or to the Services, that is not known to the general public including information related to our security program and practices.
                        </li>
                        <li className="ms-2">
                            Each party agrees to use the other party’s Confidential Information solely as necessary for performing its obligations under these Terms of Service and in accordance with any other obligations in these Terms of Service including this Section 6. Each party agrees that it shall take all reasonable steps, at least substantially equivalent to the steps it takes to protect its own proprietary information, to prevent the duplication, disclosure or use of any such
                            Confidential Information, other than (i) by or to its employees, agents and subcontractors who must have access to such Confidential Information to perform such party’s obligations hereunder, who each shall treat such Confidential Information as provided herein, and who are each subject to obligations of confidentiality to such party that are at least as stringent as those contained herein; or (ii) as required by any law, regulation, or order of any court of proper
                            jurisdiction over the parties and the subject matter contained in these Terms of Service, provided that, if legally permitted, the receiving party shall give the disclosing party prompt written notice and use commercially reasonable efforts to ensure that such disclosure is accorded confidential treatment. Confidential Information shall not include any information that the receiving party can prove: (A) was already in the public domain, or was already known by or in
                            the possession of the receiving party, at the time of disclosure of such information; (B) is independently developed by the receiving party without use of or reference to the other party’s Confidential Information, and without breaching any provisions of these Terms of Service; or (C) is thereafter rightly obtained by the receiving party from a source other than the disclosing party without breaching any provision of these Terms of Service.
                        </li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">Both you and ShopSee agree to use the Confidential Information of the other only to perform the obligations in these Terms of Service. Confidential Information must be protected and respected.</p>
                    <p className="mb-4">
                        <strong>7. Limitation of Liability</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">You expressly understand and agree that, to the extent permitted by applicable laws, ShopSee shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use of or inability to use the Service.</li>
                        <li className="ms-2">
                            To the extent permitted by applicable laws, in no event shall ShopSee or our suppliers be liable for lost profits or any special, incidental or consequential damages arising out of or in connection with our site, our Services or these Terms of Service (however arising including negligence). You agree to indemnify and hold us and (as applicable) our parent, subsidiaries, affiliates, ShopSee partners, officers, directors, agents, employees, and suppliers harmless from
                            any claim or demand, including reasonable attorneys’ fees, made by any third party due to or arising out of your breach of these Terms of Service or the documents it incorporates by reference (including the AUP), or your violation of any law or the rights of a third party.
                        </li>
                        <li className="ms-2">Your use of the Services is at your sole risk. The Services are provided on an “as is” and “as available” basis without any warranty or condition, express, implied or statutory.</li>
                        <li className="ms-2">ShopSee does not warrant that the Services will be uninterrupted, timely, secure, or error-free.</li>
                        <li className="ms-2">ShopSee does not warrant that the results that may be obtained from the use of the Services will be accurate or reliable.</li>
                        <li className="ms-2">ShopSee does not warrant that the quality of any products, services, information, or other materials purchased or obtained by you through the Services will meet your expectations, or that any errors in the Services will be corrected.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">We are not responsible if you break the law, breach this agreement or go against the rights of a third party, especially if you get sued.</p>
                    <p className="mb-4">Service is “as is” so it may have errors or interruptions and we provide no warranties and our liability is limited.</p>
                    <p className="mb-4">
                        <strong>8. Waiver and Complete Agreement</strong>
                    </p>
                    <p className="mb-4">
                        The failure of ShopSee to exercise or enforce any right or provision of the Terms of Service shall not constitute a waiver of such right or provision. The Terms of Service, including the documents it incorporates by reference, constitute the entire agreement between you and ShopSee and govern your use of the Services and your Account, superseding any prior agreements between you and ShopSee (including, but not limited to, any prior versions of the Terms of Service).
                    </p>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">If ShopSee chooses not to enforce any of these provisions at any time, it does not mean that we give up that right later.</p>
                    <p className="mb-4">These Terms of Service make up the agreement that applies to you. This means that any previous agreements between you and ShopSee don’t apply if they conflict with these terms.</p>
                    <p className="mb-4">
                        <strong>9. Intellectual Property and Customer Content</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">We do not claim any intellectual property rights over the Materials you provide to the ShopSee Service. All Materials you upload remains yours. You can remove your ShopSee Store at any time by deleting your Account.</li>
                        <li className="ms-2">By uploading Materials, you agree: (a) to allow other internet users to view the Materials you post publicly to your Store; (b) to allow ShopSee to store, and in the case of Materials you post publicly, display and use your Materials; and (c) that ShopSee can, at any time, review and delete all the Materials submitted to its Service, although ShopSee is not obligated to do so.</li>
                        <li className="ms-2">You retain ownership over all Materials that you upload to the Store; however, by making your Store public, you agree to allow others to view Materials that you post publicly to your Store. You are responsible for compliance of the Materials with any applicable laws or regulations.</li>
                        <li className="ms-2">ShopSee shall have the non-exclusive right and license to use the names, trademarks, service marks and logos associated with your Store to promote the Service.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">Anything you upload remains yours and is your responsibility.</p>
                    <p className="mb-4">
                        <strong>10. ShopSee Shipping</strong>
                    </p>
                    <p className="mb-4">
                        In addition to these Terms of Service, your access to and use of ShopSee Shipping is subject to the ShopSee Shipping Terms of Service, located at (a)&nbsp;
                        <Link href="/terms">https://myshopsee.com/TermsOfUse</Link> if you are located in the United States.
                    </p>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">If you use ShopSee Shipping you must comply with the ShopSee Shipping Terms of Service.</p>
                    <p className="mb-4">
                        <strong>11. Payment of Fees</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">
                            You will pay the Fees applicable to your subscription to Online Service (“Subscription Fees”) and any other applicable fees, including but not limited to applicable fees relating to the value of sales made through your Store (“Transaction Fees”), and any fees relating to your purchase or use of any products or services such as ShopSee Payments, shipping, apps, Experts Marketplace, or Third Party Services (“Additional Fees”). Together, the Subscription Fees,
                            Transaction Fees and the Additional Fees are referred to as the “Fees”.
                        </li>
                        <li className="ms-2">
                            You must keep a valid payment method on file with us to pay for all incurred and recurring Fees. ShopSee will charge applicable Fees to any valid payment method that you authorize (“Authorized Payment Method”), and ShopSee will continue to charge the Authorized Payment Method for applicable Fees until the Services are terminated, and any and all outstanding Fees have been paid in full. Unless otherwise indicated, all Fees and other charges are in U.S. dollars, and all
                            payments shall be in U.S. currency.
                        </li>
                        <li className="ms-2">
                            Subscription Fees are paid in advance and will be billed in 30 day intervals (each such date, a “Billing Date”). Transaction Fees and Additional Fees will be charged from time to time at ShopSee’s discretion. You will be charged on each Billing Date for all outstanding Fees that have not previously been charged. Fees will appear on the Account Information page of your Store’s administration console. Users have approximately two weeks to bring up and settle any issues
                            with the billing of Subscription Fees.
                        </li>
                        <li className="ms-2">
                            If we are not able to process payment of Fees using an Authorized Payment Method, we may suspend and revoke access to your Account and the Services. Your Account will be reactivated upon your payment of any outstanding Fees, plus the Fees applicable to your next billing cycle. You may not be able to access your Account or your storefront during any period of suspension. If the outstanding Fees remain unpaid for 60 days following the date of suspension, ShopSee
                            reserves the right to terminate your Account.
                        </li>
                        <li className="ms-2">All Fees are exclusive of applicable federal, provincial, state, local or other governmental sales, goods and services (including Goods and Sales Tax under the Goods and Services Tax Act, Chapter 117A of Singapore), harmonized or other taxes, fees or charges now in force or enacted in the future (“Taxes”).</li>
                        <li className="ms-2">
                            You are responsible for all applicable Taxes that arise from or as a result of your subscription to or purchase of ShopSee’s products and services. To the extent that ShopSee charges these Taxes, they are calculated using the tax rates that apply based on the billing address you provide to us. Such amounts are in addition to the Fees for such products and services and will be billed to your Authorized Payment Method. If you are exempt from payment of such Taxes, you
                            must provide us with evidence of your exemption, which in some jurisdictions includes an original certificate that satisfies applicable legal requirements attesting to tax-exempt status. Tax exemption will only apply from and after the date we receive evidence satisfactory to ShopSee of your exemption. If you are not charged Taxes by ShopSee, you are responsible for determining if Taxes are payable, and if so, self-remitting Taxes to the appropriate tax authorities in
                            your jurisdiction.
                        </li>
                        <li className="ms-2">
                            For the avoidance of doubt, all sums payable by you to ShopSee under these Terms of Service shall be paid free and clear of any deductions or withholdings whatsoever. Other than Taxes charged by ShopSee to you and remitted to the appropriate tax authorities on your behalf, any deductions or withholdings that are required by law shall be borne by you and paid separately to the relevant taxation authority. ShopSee shall be entitled to charge the full amount of Fees
                            stipulated under these Terms of Service to your Authorized Payment Method ignoring any such deduction or withholding that may be required.
                        </li>
                        <li className="ms-2">You must maintain an accurate location in the administration menu of your ShopSee Store. If you change jurisdictions you must promptly update your location in the administration menu.</li>
                        <li className="ms-2">ShopSee does not provide refunds.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">A valid payment method (like a credit card) is required for all stores. You will be billed for your Subscription Fees every 30 days. Any Transaction Fees or Additional Fees will be charged to your payment method. If we are not able to process payment of Fees using your payment method, ShopSee may freeze your store. You may be required to remit Taxes to ShopSee or to self-remit to your local taxing authority. No refunds.</p>
                    <p className="mb-4">
                        <strong>12. Cancellation and Termination</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">
                            You may cancel your Account and terminate the Terms of Service at any time by contacting <a href="#">ShopSee Support</a> and then following the specific instructions indicated to you in ShopSee’s response.
                        </li>
                        <li className="ms-2">
                            Upon termination of the Services by either party for any reason:{" "}
                            <ol type="1" className="list-decimal ms-5 mb-6">
                                <li className="ms-2">ShopSee will cease providing you with the Services and you will no longer be able to access your Account;</li>
                                <li className="ms-2">unless otherwise provided in the Terms of Service, you will not be entitled to any refunds of any Fees, pro rata or otherwise;</li>
                                <li className="ms-2">any outstanding balance owed to ShopSee for your use of the Services through the effective date of such termination will immediately become due and payable in full; and</li>
                                <li className="ms-2">your Store website will be taken offline.</li>
                            </ol>
                        </li>
                        <li className="ms-2">If at the date of termination of the Service, there are any outstanding Fees owing by you, you will receive one final invoice via email. Once that invoice has been paid in full, you will not be charged again.</li>
                        <li className="ms-2">We reserve the right to modify or terminate the ShopSee Service, the Terms of Service and/or your Account for any reason, without notice at any time. Termination of the Terms of Service shall be without prejudice to any rights or obligations which arose prior to the date of termination.</li>
                        <li className="ms-2">Fraud: Without limiting any other remedies, ShopSee may suspend or terminate your Account if we suspect that you (by conviction, settlement, insurance or escrow investigation, or otherwise) have engaged in fraudulent activity in connection with the use of the Services.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">To initiate a termination contact Support. ShopSee will respond with specific information regarding the termination process for your account. Once termination is confirmed, domains purchased through ShopSee will no longer be automatically renewed. If you cancel in the middle of your billing cycle, you’ll have one last invoice.</p>
                    <p className="mb-4">We may change or terminate your account at any time. Any fraud and we will suspend or terminate your account.</p>
                    <p className="mb-4">
                        <strong>13. Modifications to the Service and Prices</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">Prices for using the Services are subject to change upon 30 days’ notice from ShopSee. Such notice may be provided at any time by posting the changes to the ShopSee Site (myshopsee.com) or the administration menu of your ShopSee Store via an announcement.</li>
                        <li className="ms-2">ShopSee reserves the right at any time, and from time to time, to modify or discontinue, the Services (or any part thereof) with or without notice.</li>
                        <li className="ms-2">ShopSee shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">We may change or discontinue the service at anytime, without liability.</p>
                    <p className="mb-4">
                        <strong>14. Third Party Services, Experts, and Experts Marketplace</strong>
                    </p>
                    <ol className="list-decimal ms-5 mb-6">
                        <li className="ms-2">
                            ShopSee may from time to time recommend, provide you with access to, or enable third party software, applications (“Apps”), products, services or website links (collectively, “Third Party Services”) for your consideration or use, including via the ShopSee App Store, or Experts Marketplace. Such Third Party Services are made available only as a convenience, and your purchase, access or use of any such Third Party Services is solely between you and the applicable third
                            party services provider (“Third Party Provider”). In addition to these Terms of Service, you also agree to be bound by the additional service-specific terms applicable to services you purchase from, or that are provided by, Third Party Providers.
                        </li>
                        <li className="ms-2">ShopSee Experts is an online directory of independent third parties (“Experts”) that can help you build and operate your ShopSee Store.&nbsp;</li>
                        <li className="ms-2">You can engage and work with an Expert directly or through Experts Marketplace. Experts Marketplace provides you with recommendations on Experts that can assist you with different aspects of your Store. Using Experts Marketplace, you can find, hire, and communicate with Experts directly from your Account admin.</li>
                        <li className="ms-2">
                            Any use by you of Third Party Services offered through the Services, ShopSee Experts, Experts Marketplace or ShopSee’s website is entirely at your own risk and discretion, and it is your responsibility to read the terms and conditions and/or privacy policies applicable to such Third Party Services before using them. In some instances, ShopSee may receive a revenue share from Third Party Providers that ShopSee recommends to you or that you otherwise engage through your
                            use of the Services, ShopSee Experts, Experts Marketplace or ShopSee’s website.
                        </li>
                        <li className="ms-2">
                            We do not provide any warranties or make representations to you with respect to Third Party Services. You acknowledge that ShopSee has no control over Third Party Services and shall not be responsible or liable to you or anyone else for such Third Party Services. The availability of Third Party Services on ShopSee’s websites, including the ShopSee App Store or Experts Marketplace, or the integration or enabling of such Third Party Services with the Services does not
                            constitute or imply an endorsement, authorization, sponsorship, or affiliation by or with ShopSee. ShopSee does not guarantee the availability of Third Party Services and you acknowledge that ShopSee may disable access to any Third Party Services at any time in its sole discretion and without notice to you. ShopSee is not responsible or liable to anyone for discontinuation or suspension of access to, or disablement of, any Third Party Service. ShopSee strongly
                            recommends that you seek specialist advice before using or relying on Third Party Services, to ensure they will meet your needs. In particular, tax calculators should be used for reference only and not as a substitute for independent tax advice, when assessing the correct tax rates you should charge to your customers.
                        </li>
                        <li className="ms-2">
                            If you install or enable a Third Party Service for use with the Services, you grant us permission to allow the applicable Third Party Provider to access your data and other Materials and to take any other actions as required for the interoperation of the Third Party Service with the Services, and any exchange of data or other Materials or other interaction between you and the Third Party Provider is solely between you and such Third Party Provider. ShopSee is not
                            responsible for any disclosure, modification or deletion of your data or other Materials, or for any corresponding losses or damages you may suffer, as a result of access by a Third Party Service or a Third Party Provider to your data or other Materials.
                        </li>
                        <li className="ms-2">
                            You acknowledge and agree that: (i) by submitting a request for assistance or other information through Experts Marketplace, you consent to being contacted by one or more Experts at the Store Owner’s registered email address (or such other email address provided by you) as well as the applicable user email address; and (ii) ShopSee will receive all email communications exchanged via Experts Marketplace or in any reply emails (each a “Reply”) that originate from
                            Experts Marketplace (directly or indirectly) between yourself and Experts. You further agree that ShopSee may share your contact details and the background information that you submit via the Experts Marketplace with Experts. Experts may require access to certain admin pages on your ShopSee Store. You choose the pages that the Experts can access.
                        </li>
                        <li className="ms-2">The relationship between you and any Third Party Provider is strictly between you and such Third Party Provider, and ShopSee is not obligated to intervene in any dispute arising between you and a Third Party Provider.</li>
                        <li className="ms-2">
                            Under no circumstances shall ShopSee be liable for any direct, indirect, incidental, special, consequential, punitive, extraordinary, exemplary or other damages whatsoever, that result from any Third Party Services or your contractual relationship with any Third Party Provider, including any Expert. These limitations shall apply even if ShopSee has been advised of the possibility of such damages. The foregoing limitations shall apply to the fullest extent permitted by
                            applicable law.
                        </li>
                        <li className="ms-2">You agree to indemnify and hold us and (as applicable) our parent, subsidiaries, affiliates, ShopSee partners, officers, directors, agents, employees, and suppliers harmless from any claim or demand, including reasonable attorneys’ fees, arising out of your use of a Third Party Service or your relationship with a Third Party Provider.</li>
                    </ol>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">We are not responsible for third party services so use them at your own risk. If you use Third Party Services on the ShopSee platform, you permit us to send your data to those services. If you use Third Party Services you agree that we do not provide a warranty, so get advice beforehand.</p>
                    <p className="mb-4">
                        <strong>15. Beta Services</strong>
                    </p>
                    <p className="mb-4">
                        From time to time, ShopSee may, in its sole discretion, invite you to use, on a trial basis, pre-release or beta features that are in development and not yet available to all merchants (“Beta Services”). Beta Services may be subject to additional terms and conditions, which ShopSee will provide to you prior to your use of the Beta Services. Such Beta Services and all associated conversations and materials relating thereto will be considered ShopSee Confidential
                        Information and subject to the confidentiality provisions in this agreement. Without limiting the generality of the foregoing, you agree that you will not make any public statements or otherwise disclose your participation in the Beta Services without ShopSee’s prior written consent. ShopSee makes no representations or warranties that the Beta Services will function. ShopSee may discontinue the Beta Services at any time in its sole discretion. ShopSee will have no
                        liability for any harm or damage arising out of or in connection with a Beta Service. The Beta Services may not work in the same way as a final version. ShopSee may change or not release a final or commercial version of a Beta Service in our sole discretion.
                    </p>
                    <p className="mb-4">
                        <strong>16. Feedback and Reviews</strong>
                    </p>
                    <p className="mb-4">
                        ShopSee welcomes any ideas and/or suggestions regarding improvements or additions to the Services. Under no circumstances shall any disclosure of any idea, suggestion or related material or any review of the Services, Third Party Services or any Third Party Provider (collectively, “Feedback&#8221;) to ShopSee be subject to any obligation of confidentiality or expectation of compensation. By submitting Feedback to ShopSee (whether submitted directly to ShopSee or posted on
                        any ShopSee hosted forum or page), you waive any and all rights in the Feedback and that ShopSee is free to implement and use the Feedback if desired, as provided by you or as modified by ShopSee, without obtaining permission or license from you or from any third party. Any reviews of a Third Party Service or Third Party Provider that you submit to ShopSee must be accurate to the best of your knowledge, and must not be illegal, obscene, threatening, defamatory, invasive
                        of privacy, infringing of intellectual property rights, or otherwise injurious to third parties or objectionable. ShopSee reserves the right (but not the obligation) to remove or edit Feedback of Third Party Services or Third Party Providers, but does not regularly inspect posted Feedback.
                    </p>
                    <p className="mb-4">
                        <strong>17. DMCA Notice and Takedown Procedure</strong>
                    </p>
                    <p className="mb-4">
                        ShopSee supports the protection of intellectual property and asks ShopSee merchants to do the same. It’s our policy to respond to all notices of alleged copyright infringement. If someone believes that one of our merchants is infringing their intellectual property rights, they can send a DMCA Notice to ShopSee’s designated agent using our form or if the form is not available via email. Upon receiving a DMCA Notice, we may remove or disable access to the Materials claimed
                        to be a copyright infringement. Once provided with a notice of takedown, the merchant can reply with a counter notification using our form if they object to the complaint. The original complainant has 14 business days after we receive a counter notification to seek a court order restraining the merchant from engaging in the infringing activity, otherwise we restore the material.
                    </p>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">ShopSee respects intellectual property rights and you should too. If we receive a DMCA Notice, we may disable access or remove the allegedly infringing content from your website. If you don’t think the claim is valid, you can proceed with a counter notification.</p>
                    <p className="mb-4">If you believe one of our merchants is infringing your intellectual property rights, you can send ShopSee a DMCA Notice. We will expeditiously disable access or remove the content and notify the merchant. Be advised that we post all notices we receive.</p>
                    <p className="mb-4">
                        <strong>18. Rights of Third Parties</strong>
                    </p>
                    <p className="mb-4">
                        Save for ShopSee and its affiliates, ShopSee Users or anyone accessing ShopSee Services pursuant to these Terms of Service, unless otherwise provided in these Terms of Service, no person or entity who is not a party to these Terms of Service shall have any right to enforce any term of these Terms of Service, regardless of whether such person or entity has been identified by name, as a member of a class or as answering a particular description. For the avoidance of doubt,
                        this shall not affect the rights of any permitted assignee or transferee of these Terms.
                    </p>
                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>
                    <p className="mb-4">Only ShopSee, ShopSee Users and persons accessing ShopSee Services have any rights under these Terms of Service.</p>

                    <p className="mb-4">
                        <strong>19. Privacy &amp; Data Protection</strong>
                    </p>
                    <p className="mb-4">
                        ShopSee is firmly committed to protecting the privacy of your personal information and the personal information of your customers. By using the Service, you acknowledge and agree that ShopSee’s collection, usage and disclosure of this personal information is governed by our <Link href="/privacy">Privacy Policy</Link>.
                    </p>
                    <p className="mb-4">
                        Additionally, if: (a) you are established in the European Economic Area (EEA); (b) you provide goods or services to customers in the EEA; or (c) you are otherwise subject to the requirements of the EU General Data Protection Regulation, ShopSee’s collection and use of personal information of any European residents is also subject to our <a href="#">Data Processing Addendum</a>.
                    </p>

                    <p className="mb-4">
                        <strong>Which means</strong>
                    </p>

                    <p className="mb-4">ShopSee's use and collection of personal information is governed by our Privacy Policy. Additionally, if you or your customers are located in Europe, ShopSee's use and collection of European personal information is further governed by our Data Processing Addendum.</p>
                </div>
              </Card>
            </Container>
          </div>
        </BasePage>
    );
}
