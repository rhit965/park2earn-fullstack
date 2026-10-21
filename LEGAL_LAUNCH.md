# Park2Earn — India commercial launch preparation

Prepared 20 October 2026. This is an implementation/decision checklist, not a legal opinion or a certification of compliance. The app remains test-only. Consult an Indian lawyer familiar with vehicle rental/transport regulation and a chartered accountant for the actual operating model.

## The key business question

The existing idea lets people list idle privately owned vehicles. Do not assume a private vehicle registration, owner's consent or personal motor insurance authorises paid self-drive rental. MoRTH identifies operator licensing under the Rent-a-Cab and Rent-a-Motorcycle schemes. Determine with Maharashtra transport authorities which operator, vehicle, permit, registration and insurance requirements apply to the planned marketplace and each vehicle class. A partner model using appropriately licensed rental operators is a model to evaluate, not an automatically approved workaround.

## Before real rentals or live payments

| Area | Required decision/evidence | Current delivery |
|---|---|---|
| Business identity | Actual legal operator, address, reachable contacts, registrations and bank details applicable to its form | Configurable fields; no invented company |
| Transport model | Written professional advice and relevant authority/operator/vehicle permissions | Not verified; real rentals disabled |
| Vehicle onboarding | Authority to rent, registration, required permits, current coverage, maintenance and eligibility process | Not implemented |
| Driver eligibility | Appropriate valid driving licence, identity/age checks, consent and secure document handling | Adult self-declaration only |
| Insurance | Explicit coverage for the intended commercial rental, claims and damage/liability process | Not implemented |
| Payment onboarding | Gateway approves this exact business category/model, merchant KYC and refund/dispute processes | Test integration only |
| Owner settlements | Approved merchant/marketplace flow, payout reconciliation, fees, tax and accounting | No owner payouts or escrow |
| Contract and disclosure | Reviewed rental terms, cancellation/refund rules, handover/return, fuel, damage, deposits and dispute handling | Draft test policies only |
| Consumer redressal | Identified grievance officer and real operating response process, seller details and complaint record copies | Ticket storage/copy UI; staffing/details pending |
| Privacy | Accurate notice, data mapping, lawful processing, rights workflow, retention, contracts, security and breach response | Draft notice and manual request intake |
| Taxes/invoicing | CA-approved treatment for operator vs marketplace, applicable registrations and invoice format | No tax invoice generation |
| Technical operations | Independent security review, browser/device QA, backups/restore, observability, secret rotation, reconciliation and incident handling | Automated local checks; external QA pending |

## Consumer protection

Official government material describes the existing e-commerce grievance obligation as acknowledging complaints within 48 hours and redressing them within one month. Do not publish those as operational promises until a named person and process can deliver them. Seller information and grievance contacts also need appropriate disclosure; a marketplace cannot rely on a generic “only an intermediary” response.

The September 2026 government announcement states that the 2026 e-commerce amendments take effect on 1 January 2027. It describes additional requirements around complaint copies, NCH participation, transparent search/sponsored listings, discounts and dark-pattern controls. Review the actual applicable notification with counsel before launch. This package includes complaint-copy download; it does not claim NCH registration or issue a self-audit compliance certificate.

## Privacy timing

The DPDP Rules 2025 use phased commencement: the Gazette sets immediate, one-year and eighteen-month groups of rules. Do not assume every provision has the same effective date. Counsel should map applicable obligations and transitional dates to the planned launch. The current privacy page explicitly discloses that retention periods and automatic deletion are not implemented; configure and review these before collecting real customer/driver documents.

## What you need to provide next

1. Whether Park2Earn will serve licensed rental businesses, individual private owners, or another reviewed model.
2. Operating state/cities and intended vehicle classes.
3. Actual business/operator name, address, support contacts and grievance officer details.
4. Gateway onboarding status, approved settlement model and whether the next stage is sandbox testing or a reviewed live release.
5. Your professional review outcome on transport permissions, insurance and applicable taxes.

Do not send secret keys, identity documents or banking credentials in chat. Configure credentials privately in the hosting dashboard.

## Official sources consulted

- MoRTH / PIB advisory on Rent-a-Cab and Rent-a-Motorcycle schemes (1 June 2020): https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1628362&lang=2&reg=48
- Department of Consumer Affairs parliamentary response explaining existing grievance requirements: https://fcainfoweb.nic.in/PMS/writereaddata/2026_LS_B_361.pdf
- Government announcement of 2026 e-commerce amendments and January 2027 commencement: https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=294532
- MeitY DPDP Rules Gazette (phased commencement): https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

Sources establish relevant frameworks; they do not establish that this business or any specific vehicle is authorised.
