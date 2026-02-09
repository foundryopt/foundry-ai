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

  return (
    <div className="space-y-6">
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
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap', getEventTypeBadgeColor(event.type))}>
                        {event.type}
                      </span>
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
                  <td colSpan={6} className="px-4 py-3 text-sm text-gray-900 text-right">Total Revenue</td>
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
