'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ClaimStatus {
  id: string;
  status: 'received' | 'reviewing' | 'scheduled' | 'in-progress' | 'completed';
  submittedDate: string;
  lastUpdate: string;
  category: string;
  description: string;
  nextStep?: string;
}

const statusLabels = {
  received: 'Claim Received',
  reviewing: 'Under Review',
  scheduled: 'Repair Scheduled',
  'in-progress': 'Repair In Progress',
  completed: 'Completed',
};

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
};

export default function StatusPage() {
  const [lookupType, setLookupType] = useState<'claim' | 'email'>('claim');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [claim, setClaim] = useState<ClaimStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setNotFound(false);
    setClaim(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock result for demo
    if (searchValue.toLowerCase().includes('demo') || searchValue.includes('1234')) {
      setClaim({
        id: 'WC-2026-1234',
        status: 'scheduled',
        submittedDate: '2026-05-15',
        lastUpdate: '2026-05-28',
        category: 'Plumbing',
        description: 'Leak under kitchen sink cabinet',
        nextStep: 'Technician visit scheduled for June 2, 2026 between 9 AM - 12 PM',
      });
    } else {
      setNotFound(true);
    }

    setIsSearching(false);
  };

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
          <p className="text-accent mb-4">Check Status</p>
          <h1 className="font-serif text-display-lg md:text-display-xl max-w-3xl">
            Claim Status Lookup
          </h1>
        </Container>
      </section>

      {/* Search Form */}
      <section className="section-padding bg-cream">
        <Container>
          <div className="max-w-xl mx-auto">
            {/* Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  setLookupType('claim');
                  setSearchValue('');
                  setClaim(null);
                  setNotFound(false);
                }}
                className={`px-6 py-3 text-sm font-medium rounded-full transition-colors ${
                  lookupType === 'claim'
                    ? 'bg-charcoal text-cream'
                    : 'bg-light-gray text-charcoal hover:bg-charcoal/10'
                }`}
              >
                Claim Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupType('email');
                  setSearchValue('');
                  setClaim(null);
                  setNotFound(false);
                }}
                className={`px-6 py-3 text-sm font-medium rounded-full transition-colors ${
                  lookupType === 'email'
                    ? 'bg-charcoal text-cream'
                    : 'bg-light-gray text-charcoal hover:bg-charcoal/10'
                }`}
              >
                Email Address
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6">
              <Input
                label={
                  lookupType === 'claim'
                    ? 'Enter your claim number (e.g., WC-2026-1234)'
                    : 'Enter the email address used to file your claim'
                }
                name="search"
                type={lookupType === 'email' ? 'email' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Look Up Claim'}
              </Button>
            </form>

            {/* Not Found */}
            {notFound && (
              <div className="mt-12 p-8 bg-light-gray/50 text-center animate-fade-in">
                <p className="text-warm-gray mb-4">
                  We couldn&apos;t find a claim matching your search.
                </p>
                <p className="text-sm text-warm-gray">
                  Please check your {lookupType === 'claim' ? 'claim number' : 'email address'}{' '}
                  and try again, or{' '}
                  <a
                    href="mailto:support@shb.studio"
                    className="text-charcoal underline"
                  >
                    contact support
                  </a>
                  .
                </p>
              </div>
            )}

            {/* Claim Result */}
            {claim && (
              <div className="mt-12 animate-fade-in">
                <div className="bg-white border border-light-gray p-8">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-sm text-warm-gray">
                      {claim.id}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        statusColors[claim.status]
                      }`}
                    >
                      {statusLabels[claim.status]}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      {Object.keys(statusLabels).map((s, i) => (
                        <div
                          key={s}
                          className={`text-xs ${
                            Object.keys(statusLabels).indexOf(claim.status) >= i
                              ? 'text-charcoal'
                              : 'text-warm-gray/50'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                      <div
                        className="h-full bg-charcoal rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            ((Object.keys(statusLabels).indexOf(claim.status) + 1) /
                              Object.keys(statusLabels).length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-3 border-b border-light-gray">
                      <span className="text-warm-gray">Category</span>
                      <span className="font-medium">{claim.category}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-light-gray">
                      <span className="text-warm-gray">Submitted</span>
                      <span className="font-medium">{claim.submittedDate}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-light-gray">
                      <span className="text-warm-gray">Last Updated</span>
                      <span className="font-medium">{claim.lastUpdate}</span>
                    </div>
                    <div className="py-3">
                      <span className="text-warm-gray block mb-2">
                        Description
                      </span>
                      <span>{claim.description}</span>
                    </div>
                  </div>

                  {/* Next Step */}
                  {claim.nextStep && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800">
                        Next Step
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {claim.nextStep}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact */}
                <p className="mt-6 text-sm text-warm-gray text-center">
                  Questions about your claim?{' '}
                  <a
                    href="mailto:support@shb.studio"
                    className="text-charcoal underline"
                  >
                    Contact support
                  </a>
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
