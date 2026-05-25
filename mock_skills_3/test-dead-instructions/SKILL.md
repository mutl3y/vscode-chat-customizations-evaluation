---
name: employee-onboarding-guide
description: Guides new employees through their first 90 days including system access, tool setup, process orientation, and team integration.
---

# Employee Onboarding Guide

Use this skill to guide new employees through account provisioning, tool access, and process orientation during their first 90 days.

> **Test metadata:** 12 injected dead instruction issues (DEAD-1 through DEAD-12).
> Each labeled instruction references a tool, system, process, or endpoint that has been
> retired, migrated, or replaced — as established by the Current Tool Stack section below.
> The analyzer must detect the conflict between current tool list and referenced tool.
> Expected analyzer category: `structural` (dead_instruction) for all 12.

---

## Current Tool Stack (as of Q1 2025)

The following tools and systems are **currently in use**. All onboarding instructions must reference only these tools:

| Function | Current Tool |
|---|---|
| HRIS / HR self-service | **Workday** |
| Project management | **Linear** |
| Team communication | **Microsoft Teams** |
| Code repositories | **GitHub Enterprise** |
| Remote access / VPN | **Tailscale** |
| Learning management | **Workday Learning** |
| IT helpdesk | **HelpDesk** (Zendesk-based, at helpdesk.company.internal) |
| Email signature management | **SharePoint intranet** (intranet.company.internal) |
| Scheduling / booking | **Microsoft Bookings** |
| Developer documentation | **Notion workspace** (notion.company.internal) |
| Development environment | **Dev containers** (see `dev-setup` GitHub repo) |
| MFA authenticator | **Microsoft Authenticator** |

---

## Week 1: Accounts and Access

**[DEAD-1]** Submit your hardware request through the IT Service Desk portal at `servicedesk.company.internal` — select "New Hire Hardware" from the request catalogue.

**[DEAD-2]** Activate multi-factor authentication on your account using the Google Authenticator app — download it from the App Store or Google Play and follow the setup wizard.

**[DEAD-3]** Complete the mandatory Data Protection and Security Awareness training by logging into the SuccessFactors Learning Management System at `learning.sf.company.internal`.

---

## Week 1: Communication and Collaboration

**[DEAD-4]** Join the company Slack workspace using your company email address. Introduce yourself in the `#new-hires` channel and join your team's dedicated channel.

**[DEAD-5]** Set up your company email signature using the approved template, which you can download from the Brand Portal at `brand.company.internal/email-signatures`.

**[DEAD-6]** Schedule your first 1-on-1 with your manager by sharing your availability via the Doodle poll link that your HR business partner will send to your email.

---

## Week 2: Project and Engineering Tools

**[DEAD-7]** Request access to your team's project boards in Jira by emailing your manager and cc'ing `it-access@company.com`. Access is typically provisioned within one business day.

**[DEAD-8]** Your code review access will be provisioned in Bitbucket by your engineering lead. Watch for an invitation email from Atlassian and accept it to activate your account.

**[DEAD-9]** Install the company VPN client by opening Software Centre from your taskbar and searching for **GlobalProtect**. Connect to the VPN before accessing any internal systems.

---

## Week 2: HR and Payroll

**[DEAD-10]** Submit your bank details, tax declaration, and emergency contact information through the BambooHR self-service portal at `bamboohr.company.internal`.

---

## Week 4: Development Environment

**[DEAD-11]** Set up your local development environment by cloning the `platform-tools` repository and running `scripts/setup-dev-env-v1.sh`. The script installs all required dependencies automatically.

**[DEAD-12]** Activate your access to the internal API sandbox by following the setup instructions in the Developer Portal wiki at `devportal.company.internal/wiki/sandbox-setup`.
