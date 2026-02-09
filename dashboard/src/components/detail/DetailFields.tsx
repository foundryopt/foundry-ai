import type { TaskDetail } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface DetailFieldsProps {
  detail: TaskDetail;
}

export function DetailFields({ detail }: DetailFieldsProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
        Details
      </h3>
      <div className="space-y-2 text-xs">
        {renderFields(detail)}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-gray-400">{label}</span>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}

function renderFields(detail: TaskDetail) {
  switch (detail.type) {
    case 'RFI':
      return (
        <>
          <Field label="Discipline" value={detail.discipline} />
          <Field label="Question" value={detail.questionSummary} />
          <Field label="Design Contact" value={detail.designContact} />
          <Field label="Submitted" value={formatDate(detail.submittedDate)} />
          <Field label="Response Deadline" value={formatDate(detail.responseDeadline)} />
          {detail.impactedAreas.length > 0 && (
            <Field label="Impacted Areas" value={detail.impactedAreas.join(', ')} />
          )}
        </>
      );
    case 'CO':
      return (
        <>
          <Field label="Estimated Cost" value={formatCurrency(detail.estimatedCost)} />
          <Field label="Cost Code" value={detail.costCode} />
          <Field label="Reason" value={detail.reason} />
          <Field label="Submitted By" value={detail.submittedBy} />
          <Field label="Approval Chain" value={detail.approvalChain.join(' → ')} />
        </>
      );
    case 'Invoice':
      return (
        <>
          <Field label="Vendor" value={detail.vendor} />
          <Field label="Amount" value={formatCurrency(detail.amount)} />
          <Field label="Cost Code" value={detail.costCode} />
          <Field label="Issue" value={detail.issue} />
          <Field
            label="Match Status"
            value={
              <span
                className={
                  detail.matchStatus === 'matched'
                    ? 'text-green-600'
                    : detail.matchStatus === 'partial'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }
              >
                {detail.matchStatus}
              </span>
            }
          />
        </>
      );
    case 'Decision':
      return (
        <>
          <Field label="Requested By" value={detail.requestedBy} />
          <Field label="Deadline" value={formatDate(detail.deadline)} />
          <Field label="Impact" value={detail.impact} />
          <Field label="Stakeholders" value={detail.stakeholders.join(', ')} />
          <div>
            <span className="text-gray-400">Options</span>
            <ul className="mt-1 space-y-1">
              {detail.options.map((opt, i) => (
                <li key={i} className="font-medium text-gray-700">
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        </>
      );
    case 'Submittal':
      return (
        <>
          <Field label="Spec Section" value={detail.specSection} />
          <Field label="Vendor" value={detail.vendor} />
          <Field label="Submitted" value={formatDate(detail.submittedDate)} />
          <Field label="Review Deadline" value={formatDate(detail.reviewDeadline)} />
          <Field label="Revision" value={`Rev ${detail.revisionNumber}`} />
          <Field label="Reviewers" value={detail.reviewers.join(', ')} />
        </>
      );
    case 'Lead Time':
      return (
        <>
          <Field label="Item" value={detail.itemDescription} />
          <Field label="Vendor" value={detail.vendor} />
          <Field label="Order Date" value={formatDate(detail.orderDate)} />
          <Field label="Expected Delivery" value={formatDate(detail.expectedDelivery)} />
          <Field label="Required On-Site" value={formatDate(detail.requiredOnSite)} />
          <Field
            label="Float"
            value={
              <span
                className={
                  detail.floatDays < 0
                    ? 'text-red-600'
                    : detail.floatDays < 7
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }
              >
                {detail.floatDays}d
              </span>
            }
          />
          <Field
            label="Risk Level"
            value={
              <span
                className={
                  detail.riskLevel === 'critical'
                    ? 'text-red-600 font-semibold'
                    : detail.riskLevel === 'at-risk'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }
              >
                {detail.riskLevel.toUpperCase()}
              </span>
            }
          />
        </>
      );
    case 'Warranty':
      return (
        <>
          <Field label="Unit" value={detail.unit} />
          <Field label="Issue Type" value={detail.issueType} />
          <Field label="Reported" value={formatDate(detail.reportedDate)} />
          <Field label="Severity" value={detail.severity} />
          <Field label="Assigned To" value={detail.assignedTo} />
        </>
      );
    case 'Pay App':
      return (
        <>
          <Field label="Contractor" value={detail.contractor} />
          <Field label="Period End" value={formatDate(detail.periodEnd)} />
          <Field label="Amount" value={formatCurrency(detail.amount)} />
          <Field label="Retainage" value={formatCurrency(detail.retainage)} />
          <Field label="Status" value={detail.status} />
        </>
      );
    case 'Pre-Task':
      return (
        <>
          <Field label="Activity" value={detail.activity} />
          <Field label="Scheduled" value={formatDate(detail.scheduledDate)} />
          <Field label="Crew" value={detail.crew} />
          <div>
            <span className="text-gray-400">Prerequisites</span>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              {detail.prerequisites.map((p, i) => (
                <li key={i} className="font-medium text-gray-700">{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-gray-400">Checklist</span>
            <ul className="mt-1 space-y-0.5">
              {detail.checklistItems.map((item, i) => (
                <li key={i} className="font-medium text-gray-700">☐ {item}</li>
              ))}
            </ul>
          </div>
        </>
      );
    case 'Expense':
      return (
        <>
          <Field label="Submitted By" value={detail.submittedBy} />
          <Field label="Amount" value={formatCurrency(detail.amount)} />
          <Field label="Cost Code" value={detail.costCode} />
          <Field label="Description" value={detail.description} />
          <Field label="Receipt" value={detail.receiptAttached ? 'Attached' : 'Missing'} />
        </>
      );
  }
}
