# GHL Warranty Claim Form — Configuration

## Form URL
`https://app.gohighlevel.com/v2/location/{LOCATION_ID}/launchpad/website-builder`

Or embed at: `www.shb.studio/warranty`

---

## Form Fields

### Required Fields

| Field Name | Type | GHL Field ID | Validation |
|------------|------|--------------|------------|
| Full Name | Text | `name` | Required |
| Email | Email | `email` | Required, valid email |
| Phone | Phone | `phone` | Required |
| Unit/Address | Text | `unit` | Required |
| Issue Category | Dropdown | `category` | Required, see options below |
| Description | Textarea | `description` | Required, min 20 chars |

### Optional Fields

| Field Name | Type | GHL Field ID |
|------------|------|--------------|
| Priority | Dropdown | `priority` | Default: "standard" |
| Photos | File Upload | `photos` | Multiple, images only |
| Preferred Contact Method | Radio | `contact_preference` |

### Category Options
```
- General Maintenance
- Roofing/Exterior
- Mechanical (HVAC)
- Plumbing
- Electrical
- Waterproofing
- Appliances
- Interior Finishes
- Structural
- Other
```

### Priority Options
```
- Emergency (safety issue, no water/heat)
- Urgent (major inconvenience)
- Standard (routine repair)
```

---

## Webhook Configuration

### Step 1: Create Workflow Trigger

1. Go to **Automation** → **Workflows**
2. Create new workflow: "Warranty Claim Intake"
3. Trigger: **Form Submitted** → Select warranty form

### Step 2: Add Webhook Action

1. Add action: **Webhook**
2. Configure:

```
URL: https://YOUR-API-URL/api/warranty/webhook/ghl-intake
Method: POST
Content-Type: application/json
```

### Step 3: Map Form Fields to Payload

```json
{
  "project_id": "sandbox",
  "unit": "{{contact.unit}}",
  "name": "{{contact.name}}",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "category": "{{contact.category}}",
  "description": "{{contact.description}}",
  "priority": "{{contact.priority}}",
  "has_photos": true,
  "photo_urls": "{{contact.photos}}",
  "ghl_contact_id": "{{contact.id}}",
  "ghl_conversation_id": "{{conversation.id}}"
}
```

---

## Homeowner Signoff Workflow

### Trigger: Signoff Request Sent

When backend calls GHL to send signoff request:

1. **Create new workflow**: "Warranty Homeowner Signoff"
2. **Trigger**: Tag Added → `warranty-signoff-pending`
3. **Action 1**: Send SMS
   ```
   Hi {{contact.name}}, your warranty repair at {{contact.unit}} is complete. 
   Please verify: {{contact.signoff_link}}
   Reply DONE to approve or call us if there's an issue.
   ```
4. **Action 2**: Send Email with signoff form link
5. **Action 3**: Wait 24 hours
6. **Action 4**: If no response → Webhook to auto-approve

### Signoff Form

Create a separate GHL form for signoff:

| Field | Type | Required |
|-------|------|----------|
| Claim Number | Hidden | Yes (pre-filled) |
| Email | Hidden | Yes (pre-filled) |
| Satisfied with Repair | Radio | Yes: "Yes" / "No, I have concerns" |
| Digital Signature | Signature | Yes |
| Additional Comments | Textarea | No |

### Signoff Webhook

```
URL: https://YOUR-API-URL/api/warranty/webhook/homeowner-signoff
Method: POST
Payload:
{
  "claim_number": "{{contact.claim_number}}",
  "email": "{{contact.email}}",
  "satisfied": "{{contact.satisfied}}",
  "signature_url": "{{contact.signature}}",
  "notes": "{{contact.comments}}"
}
```

---

## Status Check Page

### GHL Page: "Check Warranty Status"

Create a page with:
1. **Claim Number Input** — Text field
2. **Email Input** — Email field for verification
3. **Check Status Button** — JavaScript API call

### JavaScript Integration

```html
<script>
const API_URL = 'https://YOUR-API-URL';

async function checkStatus() {
  const claimNumber = document.getElementById('claimNumber').value;
  const email = document.getElementById('email').value;
  
  const res = await fetch(
    `${API_URL}/api/warranty/status/public?claimNumber=${claimNumber}&email=${email}`
  );
  
  if (!res.ok) {
    document.getElementById('result').innerHTML = 
      '<p class="error">Claim not found. Please check your claim number and email.</p>';
    return;
  }
  
  const data = await res.json();
  document.getElementById('result').innerHTML = `
    <div class="status-card">
      <h3>Claim ${data.claimNumber}</h3>
      <p><strong>Status:</strong> ${data.statusLabel}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Reported:</strong> ${new Date(data.dateReported).toLocaleDateString()}</p>
      ${data.responseDue ? `<p><strong>Response Due:</strong> ${new Date(data.responseDue).toLocaleDateString()}</p>` : ''}
      ${data.dateRepairScheduled ? `<p><strong>Repair Scheduled:</strong> ${new Date(data.dateRepairScheduled).toLocaleDateString()}</p>` : ''}
      <div class="progress">
        <div class="progress-bar" style="width: ${data.progressPercent}%"></div>
      </div>
      <p class="progress-label">${data.progressPercent}% Complete</p>
    </div>
  `;
}
</script>
```

---

## Testing Checklist

- [ ] Form submits successfully
- [ ] Webhook receives data
- [ ] Claim created in database
- [ ] Confirmation email sent
- [ ] Slack notification posted
- [ ] Status lookup works
- [ ] Signoff form works
- [ ] 24-hour auto-approve triggers
