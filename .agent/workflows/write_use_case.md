---
description: Guide to writing effective software use cases based on industry best practices.
---

# Workflow: Writing Effective Software Use Cases

Follow this workflow to create clear, comprehensive, and standardized use cases for your software project.

## Step 1: Define the Scope & Type
Determine if you are writing a **Business Use Case** or a **System Use Case**.
- **Business Use Case:** High-level, technology-agnostic. Focuses on *what* the business process is (e.g., "Process Order").
- **System Use Case:** Detailed, specific to the software. Focuses on *how* the system interacts with the user (e.g., "Validate Payment").

## Step 2: Establish the Core Components
Define the header information for your use case. This provides context.
1.  **Title:** Use a verb-noun phrase (e.g., "Register Account").
2.  **Actor(s):** Who is interacting? (Primary vs. Secondary).
3.  **Goal:** What is the successful outcome?
4.  **Preconditions:** What must be true *before* this starts? (e.g., "User is logged in").
5.  **Triggers:** What specific event starts this interaction?

## Step 3: Write the Main Flow (Happy Path)
Describe the perfect sequence of steps to achieve the goal.
- **Rule:** Use active voice ("User enters email").
- **Rule:** Keep it concise (6-10 steps ideally).
- **Rule:** avoid UI specifics ("Submit form" instead of "Click blue button").

**Template:**
1. [Actor] initiates [action].
2. System validates [data].
3. System displays [response].
4. [Actor] confirms [action].
5. ...

## Step 4: Define Alternate & Exception Flows
Identify "else" and "error" paths. This is critical for robust software.
- **Alternate:** User chooses a different valid option (e.g., "User selects PayPal instead of Credit Card").
- **Exception:** System validation fails or error occurs (e.g., "Payment Declined").

## Step 5: Review & Refine
Check your use case against these best practices:
- [ ] **One Goal per Case:** Is this trying to do too much?
- [ ] **Testable Preconditions:** Can a tester easily set this up?
- [ ] **User Perspective:** Does it describe what the user *does*?
- [ ] **Completeness:** Did you cover failure states?

## Example Structure
```markdown
# Use Case: Complete Online Purchase
**Actor:** Customer
**Precondition:** Cart has items.

**Main Flow:**
1. Customer initiates checkout.
2. System verification addresses.
3. ...

**Exception Flow (Payment Failed):**
3a. Payment Gateway rejects transaction.
3b. System displays error.
```
