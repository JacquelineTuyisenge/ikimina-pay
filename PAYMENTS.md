# Ikimina Pay: Payments

## 1. Purpose
Members pay their contributions with mobile money. This document explains how a payment works, what it needs, what the first version achieves, and what comes later.

## 2. How a payment works (MTN MoMo)

1. **Pay.** A member opens their group and taps the yellow **Pay with MTN MoMo** button on an unpaid contribution. No phone number is typed: the app uses the phone saved on the member's account.
2. **Checks.** The backend checks that the contribution belongs to the member, is still pending, and has no payment already in progress.
3. **Save first.** The backend creates a `Payment` record with status `PENDING` and a unique reference.
4. **Ask MTN.** The backend sends MTN a request to collect the money for that reference. MTN replies that the request was accepted and sends a prompt to the member's phone.
5. **Approve.** The member approves the prompt and enters their PIN on their own phone. The app never sees the PIN.
6. **Wait.** The screen says "Check your phone and approve" and checks the payment status every few seconds.
7. **Verify.** The backend asks MTN directly for the result of that reference. Only if MTN confirms success does the backend mark the payment `SUCCESSFUL` and the contribution `PAID`, in one transaction. If MTN reports failure, the payment becomes `FAILED` and the member can try again.
8. **Callback.** MTN may also call our server when the status changes. The callback is only a signal to run the same check as in step 7. Its content is never trusted, and a repeated callback changes nothing.

## 3. What we need

| Need | Details |
| --- | --- |
| MTN MoMo developer account | Subscribed to the **Collections** product, with its primary key |
| Sandbox API user and API key | Created once through MTN's sandbox API, required before any payment request |
| Environment variables (backend only) | `MTN_SUBSCRIPTION_KEY`, `MTN_API_USER`, `MTN_API_KEY`, `MTN_TARGET_ENVIRONMENT`, `MTN_CURRENCY`, `MTN_CALLBACK_URL` |
| Public callback address | The deployed backend address, because MTN cannot reach `localhost` |
| Database | The `Payment` table, with a unique `providerReference` |
| Code structure | A `PaymentProvider` interface, with an MTN MoMo adapter behind it |

No payment key ever goes in the frontend or in Git.

## 4. What the first version achieves
- A member can start a payment with one tap.
- A contribution becomes paid only after MTN confirms it.
- A repeated confirmation never counts a payment twice.
- A contribution cannot have two payments in progress.
- A failed or cancelled payment can be retried.
- Admins and treasurers see updated paid counts.

## 5. Security rules
- A member can only pay their own contribution.
- The payment prompt can only go to the phone saved on the member's account.
- The browser's result is never trusted. The backend always asks MTN.
- Callbacks are signals only. The backend verifies with MTN before changing anything.
- Payment records cannot be marked successful by hand.
- Every payment has a unique reference, enforced by the database.
- Keys live in environment variables and are never committed.

## 6. Sandbox limits (stated honestly)
- Payments run in MTN's **sandbox**: they are simulated and no real money moves.
- The sandbox only accepts the **EUR** currency, so test payments are stored as EUR and marked `isSandbox`.
- MTN provides special test phone numbers for different outcomes, such as success and failure.
- Going live needs MTN's production approval (a business review, KYC), which is outside this project.

## 7. Future implementation

| Improvement | Why |
| --- | --- |
| Airtel Money adapter | Same interface and flow, a second provider (first built against a mock until Airtel credentials exist) |
| Production go-live | Real RWF payments after MTN approval |
| Change or choose the payment phone number | The saved number may not be the member's MoMo number |
| Scheduled reminders by email and SMS | Remind members before and after the due date |
| Email receipt and SMS confirmation | Proof of payment after a successful payment |
| Payment history page | Every attempt with its status and date |
| Unique database rule for pending payments | Fully prevents two payments in progress, even under a double-click race |
| Reconciliation job | Re-checks old pending payments with MTN, in case a status was missed |
| Refunds | Not supported by the Collections product, so it needs a separate flow |
| Bank cards | A separate payment provider |