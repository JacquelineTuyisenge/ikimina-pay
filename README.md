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

- An admin creates a group and adds members.
- A contribution cycle is set up (for example, 10,000 RWF per month).
- Members see what they owe and pay through an MTN MoMo payment request sent to their phone.
- The backend confirms each payment with the provider before marking it as paid, and ignores duplicate callbacks.
- The treasurer sees a live dashboard of who has paid, who is late and the total collected.
- Members receive an email receipt and an SMS confirmation.

## Core Features
- User authentication with admin, treasurer and member roles
- Savings group and member management
- Contribution cycles and tracking
- Mobile money payments (MTN MoMo Collections)
- Payment confirmation through verified provider callbacks
- Treasurer dashboard and payment history
- Payment notifications (email receipts and SMS confirmation)

## Technology Stack
- React + TypeScript (Vite, Tailwind CSS)
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- Zod for input validation
- MTN MoMo Collections API (sandbox)
- Africa's Talking (SMS) and a transactional email provider
- Vercel and Railway for deployment

## Project Status
Planning and requirements definition.

> **Note:** This project runs against the MTN MoMo sandbox. Test transactions are labelled as such and no real money is handled.
