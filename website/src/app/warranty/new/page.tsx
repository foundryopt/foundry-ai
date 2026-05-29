'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  projectName: string;
  completionDate: string;
  issueCategory: string;
  issueDescription: string;
}

const issueCategories = [
  'Structural',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Finishes',
  'Windows/Doors',
  'Roofing',
  'Other',
];

export default function NewClaimPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    projectName: '',
    completionDate: '',
    issueCategory: '',
    issueDescription: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-cream min-h-screen">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-green-100 rounded-full">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="font-serif text-display-md mb-6">
              Claim Submitted Successfully
            </h1>
            <p className="text-warm-gray text-lg mb-4">
              Thank you for submitting your warranty claim. We&apos;ve sent a
              confirmation email to <strong>{formData.email}</strong>.
            </p>
            <p className="text-warm-gray mb-8">
              Our team will review your claim and contact you within 2 business
              days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/warranty">Back to Warranty Portal</Button>
              <Button href="/" variant="outline">
                Return Home
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12 bg-cream">
        <Container>
          <nav className="mb-8">
            <Link href="/warranty" className="text-accent link-underline">
              &larr; Warranty Portal
            </Link>
          </nav>
          <p className="text-accent mb-4">File a Claim</p>
          <h1 className="font-serif text-display-lg md:text-display-xl max-w-3xl">
            New Warranty Claim
          </h1>
        </Container>
      </section>

      {/* Progress */}
      <section className="py-8 bg-cream border-b border-light-gray">
        <Container>
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? 'bg-charcoal text-cream'
                      : 'bg-light-gray text-warm-gray'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-px mx-2 ${
                      step > s ? 'bg-charcoal' : 'bg-light-gray'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <p className="text-accent">
              {step === 1 && 'Contact Information'}
              {step === 2 && 'Project Details'}
              {step === 3 && 'Issue Description'}
            </p>
          </div>
        </Container>
      </section>

      {/* Form */}
      <section className="section-padding bg-cream">
        <Container>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            {/* Step 1: Contact Info */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="font-serif text-display-sm mb-8">
                  Your Contact Information
                </h2>
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Property Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
                <div className="pt-4">
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="font-serif text-display-sm mb-8">
                  Project Details
                </h2>
                <Input
                  label="Project Name (if known)"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
                <div>
                  <label htmlFor="completionDate" className="sr-only">
                    Approximate Completion Date
                  </label>
                  <input
                    id="completionDate"
                    name="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Approximate Completion Date"
                  />
                  <p className="mt-2 text-sm text-warm-gray">
                    Approximate project completion date
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Issue Description */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="font-serif text-display-sm mb-8">
                  Describe the Issue
                </h2>
                <div>
                  <label htmlFor="issueCategory" className="sr-only">
                    Issue Category
                  </label>
                  <select
                    id="issueCategory"
                    name="issueCategory"
                    value={formData.issueCategory}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Issue Category</option>
                    {issueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Please describe the issue in detail"
                  name="issueDescription"
                  type="textarea"
                  rows={6}
                  value={formData.issueDescription}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-warm-gray">
                  Please include when you first noticed the issue and any
                  relevant details about the affected area.
                </p>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Container>
      </section>
    </>
  );
}
