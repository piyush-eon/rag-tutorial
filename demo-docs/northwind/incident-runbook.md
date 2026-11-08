# Incident Runbook

**Owner:** Site Reliability · **Version:** 3.3 · **Last updated:** 27 February 2026

## 1. Severity levels

| Level | Meaning | Response |
|---|---|---|
| Sev 1 | Service is down for many customers | Page on-call now, update every 15 min |
| Sev 2 | Major feature broken or degraded | Respond in 30 minutes |
| Sev 3 | Minor issue, workaround exists | Next working day |

## 2. When an alert fires
1. Acknowledge the page within 5 minutes.
2. Open an incident channel named `inc-YYYYMMDD-short-name`.
3. Assign an Incident Commander. They coordinate and do not fix.
4. Assign a Communications lead for customer updates.
5. Post a first status update within 15 minutes.

## 3. Fixing
- Check the dashboards and the last deploy first.
- If a recent release looks responsible, roll it back.
- Write down every action in the incident channel with a timestamp.

## 4. Closing
The Incident Commander declares the incident resolved and posts a final update on the status page.

## 5. Postmortem
Hold a blameless postmortem within 5 working days of every Sev 1 and Sev 2. It covers the timeline, root cause, what went well and follow-up actions with owners.

## 6. Escalation
If the on-call engineer cannot be reached within 10 minutes, the system pages the engineering manager, then the Head of Engineering.
