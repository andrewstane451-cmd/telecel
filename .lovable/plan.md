

## Telecel Loan App

A mobile-first, Telecel-branded (red/white) loan application with a multi-step flow stored in local storage.

### Flow & Pages

**1. Loan Requirements Page (`/`)**
- Telecel logo + red gradient header
- Checklist of requirements: Valid Ghana Card/ID, Active Telecel number, Must be 18+, Steady income source, No outstanding loans
- "Continue" button at bottom

**2. Loan Application Form (`/apply`)**
- Fields: First Name, Last Name, Date of Birth, Email (optional), Telecel Phone Number
- "Check Loan Limit" button → opens modal:
  - Circular progress animation (spinner)
  - After 2-3s reveals random loan limit (GHS 100–5,000)
  - Drag slider for repayment period (1–6 months)
  - Shows interest: 0% for ≤6 months, 12% after 6 months
  - Shows monthly repayment calculation
  - "Continue" button saves data to localStorage and closes modal
- "Submit Application" button → navigates to verification

**3. Phone Verification Page (`/verify`)**
- Telecel-branded page matching the uploaded screenshot design
- Account type dropdown (Mobile)
- Phone number input (020XXXXXXX format)
- "Next" and "Go Back" buttons

**4. Password Page (`/password`)**
- Password input field
- "Next" button

**5. OTP Page (`/otp`)**
- 4-6 digit OTP input with individual digit boxes
- Resend OTP timer
- "Verify" button

**6. PIN Page (`/pin`)**
- "Create 4-digit PIN" with 4 input boxes
- "Confirm" button

**7. Success Page (`/success`)**
- Clears localStorage data
- Success checkmark animation
- Shows loan amount, repayment period, interest, monthly payment
- "Your loan is being approved and will be disbursed within 12 hours"
- "Done" button returns to home

### Design System
- Primary: Telecel Red (#E30613)
- Background: Light gray (#F5F5F5) / White
- Mobile-first layout (max-width ~420px centered)
- Rounded buttons, red fill for primary actions, red outline for secondary

