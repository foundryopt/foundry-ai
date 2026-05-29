# Warranty Landing Page — www.shb.studio/warranty

## Page Overview

A clean, mobile-first landing page for homeowners to:
1. File a new warranty claim
2. Check status of existing claim

---

## Page Structure

```
┌─────────────────────────────────────────────────┐
│                   HEADER                        │
│              SHB Studio Logo                    │
│         "Warranty Service Center"               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                 HERO SECTION                    │
│                                                 │
│   "We stand behind our work"                    │
│                                                 │
│   [File a Claim]     [Check Status]             │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              HOW IT WORKS                       │
│                                                 │
│   1. Submit claim with photos                   │
│   2. We review within 48 hours                  │
│   3. Contractor assigned & repair scheduled     │
│   4. Verify repair & sign off                   │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              CONTACT METHODS                    │
│                                                 │
│   📧 Email: support@shb.studio                  │
│   📞 Phone: (XXX) XXX-XXXX                      │
│   🌐 Online form below                          │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           EMBEDDED GHL FORM                     │
│         (File New Claim section)                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│          STATUS CHECK SECTION                   │
│                                                 │
│   Claim Number: [____________]                  │
│   Email:        [____________]                  │
│                                                 │
│        [Check Status]                           │
│                                                 │
│   ┌───────────────────────────┐                │
│   │    Status Result Card     │                │
│   │    (populated via API)    │                │
│   └───────────────────────────┘                │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                  FOOTER                         │
│   © SHB Studio | Privacy | Terms                │
└─────────────────────────────────────────────────┘
```

---

## Implementation Options

### Option A: GHL Funnel Page (Recommended)

Build entirely in GHL:
- Use GHL's funnel/website builder
- Embed the warranty form directly
- Add custom HTML block for status check with JavaScript

**Pros**: All in one platform, easy to manage
**Cons**: Limited design flexibility

### Option B: Custom Page + GHL Form Embed

Build page separately (Webflow, Squarespace, custom):
- Embed GHL form via iframe
- Custom status check section

**Pros**: Full design control
**Cons**: Two systems to maintain

### Option C: Full Custom (Next.js/React)

Build as part of shb.studio website:
- Custom form that calls API directly
- Full status tracking UI

**Pros**: Complete control, best UX
**Cons**: More development work

---

## Status Check Implementation

### HTML Structure

```html
<section id="status-check" class="status-section">
  <h2>Check Your Claim Status</h2>
  
  <form onsubmit="checkStatus(event)">
    <div class="form-group">
      <label for="claimNumber">Claim Number</label>
      <input type="text" id="claimNumber" placeholder="WC-XXX-001" required />
    </div>
    
    <div class="form-group">
      <label for="email">Email Address</label>
      <input type="email" id="email" placeholder="your@email.com" required />
    </div>
    
    <button type="submit" class="btn-primary">Check Status</button>
  </form>
  
  <div id="status-result" class="status-result"></div>
</section>
```

### JavaScript

```javascript
const API_BASE = 'https://YOUR-API-URL'; // Replace with deployed URL

async function checkStatus(event) {
  event.preventDefault();
  
  const claimNumber = document.getElementById('claimNumber').value.trim();
  const email = document.getElementById('email').value.trim();
  const resultDiv = document.getElementById('status-result');
  
  resultDiv.innerHTML = '<p class="loading">Checking...</p>';
  
  try {
    const response = await fetch(
      `${API_BASE}/api/warranty/status/public?claimNumber=${encodeURIComponent(claimNumber)}&email=${encodeURIComponent(email)}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        resultDiv.innerHTML = `
          <div class="status-card error">
            <p>No claim found with that number and email.</p>
            <p>Please check your information and try again.</p>
          </div>
        `;
        return;
      }
      throw new Error('Failed to check status');
    }
    
    const data = await response.json();
    resultDiv.innerHTML = renderStatusCard(data);
    
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="status-card error">
        <p>Unable to check status. Please try again or contact support@shb.studio</p>
      </div>
    `;
  }
}

function renderStatusCard(claim) {
  const statusColors = {
    'open': '#FFA500',
    'assigned': '#2196F3',
    'in-repair': '#9C27B0',
    'resolved': '#4CAF50',
    'closed': '#607D8B',
    'disputed': '#F44336'
  };
  
  const statusLabels = {
    'open': 'Claim Received',
    'assigned': 'Contractor Assigned',
    'in-repair': 'Repair In Progress',
    'resolved': 'Repair Complete - Awaiting Your Approval',
    'closed': 'Claim Closed',
    'disputed': 'Under Review'
  };
  
  return `
    <div class="status-card">
      <div class="status-header">
        <h3>Claim ${claim.claimNumber}</h3>
        <span class="status-badge" style="background: ${statusColors[claim.status] || '#999'}">
          ${statusLabels[claim.status] || claim.status}
        </span>
      </div>
      
      <div class="status-details">
        <p><strong>Category:</strong> ${claim.category}</p>
        <p><strong>Unit:</strong> ${claim.unitLocation}</p>
        <p><strong>Reported:</strong> ${formatDate(claim.dateReported)}</p>
        ${claim.responseDue ? `<p><strong>Response Due:</strong> ${formatDate(claim.responseDue)}</p>` : ''}
        ${claim.dateRepairScheduled ? `<p><strong>Repair Scheduled:</strong> ${formatDate(claim.dateRepairScheduled)}</p>` : ''}
        ${claim.responsibleContractor ? `<p><strong>Assigned To:</strong> ${claim.responsibleContractor}</p>` : ''}
      </div>
      
      <div class="status-progress">
        <div class="progress-steps">
          <div class="step ${getStepStatus(claim, 1)}">
            <div class="step-circle">1</div>
            <span>Received</span>
          </div>
          <div class="step ${getStepStatus(claim, 2)}">
            <div class="step-circle">2</div>
            <span>Assigned</span>
          </div>
          <div class="step ${getStepStatus(claim, 3)}">
            <div class="step-circle">3</div>
            <span>In Repair</span>
          </div>
          <div class="step ${getStepStatus(claim, 4)}">
            <div class="step-circle">4</div>
            <span>Complete</span>
          </div>
        </div>
      </div>
      
      ${claim.status === 'resolved' ? `
        <div class="signoff-prompt">
          <p>Your repair is complete! Please review and sign off.</p>
          <a href="${claim.signoffLink}" class="btn-primary">Approve Repair</a>
        </div>
      ` : ''}
    </div>
  `;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getStepStatus(claim, step) {
  const statusOrder = ['open', 'assigned', 'in-repair', 'resolved', 'closed'];
  const currentIndex = statusOrder.indexOf(claim.status);
  
  if (step <= currentIndex + 1) return 'completed';
  if (step === currentIndex + 2) return 'current';
  return 'pending';
}
```

### CSS

```css
.status-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.status-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.status-card.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-details p {
  margin: 0.5rem 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step.completed .step-circle {
  background: #22c55e;
  color: white;
}

.step.current .step-circle {
  background: #2563eb;
  color: white;
}

.step span {
  font-size: 0.75rem;
  color: #64748b;
}

.signoff-prompt {
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
}

.loading {
  text-align: center;
  color: #64748b;
}
```

---

## Mobile Considerations

- Form inputs should be full width on mobile
- Touch-friendly button sizes (min 44px height)
- Status card should stack vertically on narrow screens
- Progress steps can use icons instead of numbers on mobile

---

## SEO & Meta

```html
<title>Warranty Service | SHB Studio</title>
<meta name="description" content="File a warranty claim or check your claim status. SHB Studio stands behind our work with responsive warranty service." />
<meta name="robots" content="index, follow" />
```

---

## Analytics Events

Track these events for reporting:
- `warranty_page_view` — Page loaded
- `warranty_form_start` — User starts filling form
- `warranty_form_submit` — Form submitted
- `warranty_status_check` — Status lookup performed
- `warranty_signoff_click` — User clicks signoff link
