'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { LeasingUnit, ShowroomEvent, POSItem, Membership } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SalesShowroomProps {
  leasing: LeasingUnit[];
  events: ShowroomEvent[];
  pos: POSItem[];
  memberships: Membership[];
}

type SubTab = 'leasing' | 'events' | 'pos' | 'memberships';

export function SalesShowroom({ leasing, events, pos, memberships }: SalesShowroomProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('leasing');

  // Leasing calculations
  const leasingStats = {
    total: leasing.length,
    leased: leasing.filter(u => u.status === 'leased').length,
    pending: leasing.filter(u => u.status === 'pending').length,
    available: leasing.filter(u => u.status === 'available').length,
    occupied: leasing.filter(u => u.status === 'occupied').length,
    monthlyRevenue: leasing
      .filter(u => u.status === 'leased' || u.status === 'pending')
      .reduce((sum, u) => sum + (u.monthlyRent ?? 0), 0),
  };

  // Events grouped by month
  const eventsByMonth = events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, event) => {
      const month = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {} as Record<string, ShowroomEvent[]>);

  // POS calculations
  const posTotal = pos.reduce((sum, item) => sum + (item.price * item.sold), 0);

  // Memberships by tier
  const membershipStats = {
    vip: memberships.filter(m => m.tier === 'vip').length,
    premium: memberships.filter(m => m.tier === 'premium').length,
    basic: memberships.filter(m => m.tier === 'basic').length,
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'leased': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'available': return 'bg-blue-100 text-blue-700';
      case 'occupied': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'open-house': return 'bg-blue-100 text-blue-700';
      case 'broker-tour': return 'bg-purple-100 text-purple-700';
      case 'investor-meeting': return 'bg-green-100 text-green-700';
      case 'community': return 'bg-orange-100 text-orange-700';
      case 'private': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-purple-100 text-purple-700';
      case 'premium': return 'bg-blue-100 text-blue-700';
      case 'basic': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRowBgColor = (status: string) => {
    switch (status) {
      case 'leased': return 'bg-green-50';
      case 'pending': return 'bg-yellow-50';
      case 'available': return 'bg-blue-50';
      case 'occupied': return 'bg-gray-50';
      default: return '';
    }
  };

  // ── Summary computations ──
  const leasedPct = leasingStats.total > 0 ? Math.round(((leasingStats.leased + leasingStats.occupied) / leasingStats.total) * 100) : 0;
  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date()).length;
  const activeMemberships = memberships.filter((m) => m.status === 'active').length;

  // Leasing status segments for progress bar
  const leasingSegments = [
    { label: 'Leased', count: leasingStats.leased, color: 'bg-green-500' },
    { label: 'Occupied', count: leasingStats.occupied, color: 'bg-gray-500' },
    { label: 'Pending', count: leasingStats.pending, color: 'bg-yellow-500' },
    { label: 'Available', count: leasingStats.available, color: 'bg-blue-400' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Summary Overview Strip ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900 tabular-nums">{leasingStats.total}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Units</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-green-700 tabular-nums">{leasedPct}%</p>
            <p className="text-[10px] text-green-600 uppercase tracking-wider font-semibold">Leased</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-blue-700 tabular-nums">{upcomingEvents}</p>
            <p className="text-[10px] text-blue-500 uppercase tracking-wider font-semibold">Upcoming Events</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-amber-700 tabular-nums">{formatCurrency(posTotal)}</p>
            <p className="text-[10px] text-amber-500 uppercase tracking-wider font-semibold">POS Revenue</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-purple-700 tabular-nums">{activeMemberships}</p>
            <p className="text-[10px] text-purple-500 uppercase tracking-wider font-semibold">Active Members</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-indigo-700 tabular-nums">{formatCurrency(leasingStats.monthlyRevenue)}</p>
            <p className="text-[10px] text-indigo-500 uppercase tracking-wider font-semibold">Monthly Rev.</p>
          </div>
        </div>

        {/* Occupancy / Leasing Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Occupancy Overview</span>
            <span className="text-[10px] text-gray-400">{leasedPct}% leased or occupied</span>
          </div>
          {leasingStats.total > 0 ? (
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              {leasingSegments.map((seg) =>
                seg.count > 0 ? (
                  <div
                    key={seg.label}
                    className={clsx('h-full transition-all', seg.color)}
                    style={{ width: `${(seg.count / leasingStats.total) * 100}%` }}
                    title={`${seg.label}: ${seg.count} units`}
                  />
                ) : null,
              )}
            </div>
          ) : (
            <div className="h-4 rounded-full bg-gray-100" />
          )}
          <div className="flex items-center gap-4 mt-1.5">
            {leasingSegments.map((seg) => (
              <span key={seg.label} className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className={clsx('w-2 h-2 rounded-full inline-block', seg.color)} />
                {seg.label} ({seg.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('leasing')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'leasing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Leasing
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'events'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Event Calendar
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'pos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          POS
        </button>
        <button
          onClick={() => setActiveTab('memberships')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'memberships'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Memberships
        </button>
      </div>

      {/* Leasing Tab */}
      {activeTab === 'leasing' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Total Units</div>
              <div className="text-2xl font-bold text-gray-900">{leasingStats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Leased</div>
              <div className="text-2xl font-bold text-green-600">{leasingStats.leased}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{leasingStats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Available</div>
              <div className="text-2xl font-bold text-blue-600">{leasingStats.available}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Occupied</div>
              <div className="text-2xl font-bold text-gray-600">{leasingStats.occupied}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Monthly Revenue</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(leasingStats.monthlyRevenue)}</div>
            </div>
          </div>

          {/* Leasing Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 w-16"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sqft</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease Start</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leasing.map((unit, idx) => (
                    <tr key={idx} className={getRowBgColor(unit.status)}>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-0.5">
                          <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Conversation">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                          </button>
                          <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Attachments">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.sqft.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStatusBadgeColor(unit.status))}>
                          {unit.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.tenant || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(unit.monthlyRent ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.leaseStart ? formatDate(unit.leaseStart) : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.leaseEnd ? formatDate(unit.leaseEnd) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
              <div className="grid gap-4">
                {monthEvents.map((event, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(event.date)}</span>
                            <span className="mx-2">•</span>
                            <span className="font-medium">Time:</span>
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium">Location:</span>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-medium">Attendees:</span>
                            <span>{event.attendees}</span>
                          </div>
                          {event.notes && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-medium">Notes:</span> {event.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Conversation">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                        </button>
                        <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Attachments">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                          </svg>
                        </button>
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap', getEventTypeBadgeColor(event.type))}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(eventsByMonth).length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              No events scheduled
            </div>
          )}
        </div>
      )}

      {/* POS Tab */}
      {activeTab === 'pos' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 w-16"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pos.map((item, idx) => (
                  <tr key={idx} className={clsx(item.stock < 10 && 'bg-amber-50')}>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-0.5">
                        <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Conversation">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                        </button>
                        <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Attachments">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={clsx('font-medium', item.stock < 10 ? 'text-amber-600' : 'text-gray-900')}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.sold}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.price * item.sold)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={7} className="px-4 py-3 text-sm text-gray-900 text-right">Total Revenue</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(posTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Memberships Tab */}
      {activeTab === 'memberships' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">VIP Members</div>
              <div className="text-2xl font-bold text-purple-600">{membershipStats.vip}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Premium Members</div>
              <div className="text-2xl font-bold text-blue-600">{membershipStats.premium}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-xs text-gray-500">Basic Members</div>
              <div className="text-2xl font-bold text-gray-600">{membershipStats.basic}</div>
            </div>
          </div>

          {/* Memberships Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 w-16"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships.map((member, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-0.5">
                          <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Conversation">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                          </button>
                          <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Attachments">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getTierBadgeColor(member.tier))}>
                          {member.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStatusBadgeColor(member.status))}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(member.startDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(member.endDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
