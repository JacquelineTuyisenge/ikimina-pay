# Ikimina Pay

## Overview
Ikimina Pay is a web application that helps savings groups (ibimina) collect member contributions through mobile money and keep an accurate, shared record of who has paid. It replaces paper notebooks and WhatsApp messages with one system that the group admin, treasurer and members can all trust.

## Problem Statement
Many savings groups in Rwanda still manage contributions manually:

- Contributions are recorded in notebooks or chat messages, which are easy to lose or dispute.
- Treasurers spend time chasing members and checking who has paid.
- Members have no reliable proof of payment.
- Cash and mobile money transfers are hard to match against what each member owes.
- Nobody has a clear, up-to-date view of the group's total collected and outstanding amounts.

## Proposed Solution
Ikimina Pay gives each group a single place to manage contributions:

- Any registered user can create a group and becomes its admin. The admin adds the members and chooses a treasurer.
- A contribution (for example, 5,000 RWF per month with a due date) is set up, and every member then owes that amount.
- Members see what they owe and pay with MTN MoMo or Airtel Money through a payment request sent to their phone.
- The backend confirms each payment with the provider before marking it as paid, and ignores duplicate callbacks.
- The admin and treasurer see who has paid, who is waiting and who is late, plus the total collected.
- Members receive an email receipt and an SMS confirmation.

## Core Features
- User registration and login
- Group and member management with admin, treasurer and member roles (per group)
- Contributions with an amount and due date
- Mobile money payments with MTN MoMo and Airtel Money
- Payment confirmation through verified provider callbacks
- Payment tracking: paid, waiting, late and total collected
- Payment notifications (email receipts and SMS confirmation)

## Technology Stack
- React + TypeScript (Vite, Tailwind CSS)
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- Zod for input validation
- MTN MoMo Collections API and Airtel Money API (sandbox)
- Africa's Talking (SMS) and a transactional email provider
- Vercel and Railway for deployment

## Project Status
Planning and requirements definition.

> **Note:** This project runs against the providers' sandbox (test) environments. Test transactions are labelled as such and no real money is handled.