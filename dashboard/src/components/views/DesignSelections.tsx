'use client';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { FinishSelection, RoomType, FinishCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface DesignSelectionsProps {
  finishes: FinishSelection[];
  isAllProjects: boolean;
}

const categoryColors: Record<FinishCategory, string> = {
  Flooring: 'bg-amber-100 text-amber-800',
  Countertop: 'bg-stone-100 text-stone-800',
  Cabinetry: 'bg-orange-100 text-orange-800',
  Tile: 'bg-cyan-100 text-cyan-800',
  Paint: 'bg-violet-100 text-violet-800',
  Fixtures: 'bg-blue-100 text-blue-800',
  Hardware: 'bg-gray-100 text-gray-700',
  Lighting: 'bg-yellow-100 text-yellow-800',
  Appliances: 'bg-red-100 text-red-800',
};

function getProjectFromId(id: string): string {
  if (id.startsWith('sb-')) return 'SandBox';
  if (id.startsWith('gf-')) return 'Greenfield';
  return 'Unknown';
}

export function DesignSelections({ finishes, isAllProjects }: DesignSelectionsProps) {
  // Initialize selected upgrades from finish data
  const initialSelectedUpgrades = useMemo(() => {
    const selected: Record<string, string | null> = {};
    finishes.forEach(finish => {
      selected[finish.id] = finish.selectedUpgrade || null;
    });
    return selected;
  }, [finishes]);

  const [selectedUpgrades, setSelectedUpgrades] = useState<Record<string, string | null>>(initialSelectedUpgrades);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(() => {
    const rooms = new Set<string>();
    finishes.forEach(f => rooms.add(isAllProjects ? `${getProjectFromId(f.id)}-${f.room}` : f.room));
    return rooms;
  });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(() => {
    if (!isAllProjects) return new Set();
    const projects = new Set<string>();
    finishes.forEach(f => projects.add(getProjectFromId(f.id)));
    return projects;
  });

  // Calculate summary statistics
  const summary = useMemo(() => {
    let totalBase = 0;
    let totalWithUpgrades = 0;
    const uniqueRooms = new Set<string>();

    finishes.forEach(finish => {
      totalBase += finish.baseCost;
      uniqueRooms.add(finish.room);

      const selectedUpgradeId = selectedUpgrades[finish.id];
      if (selectedUpgradeId && finish.upgrades) {
        const upgrade = finish.upgrades.find(u => u.name === selectedUpgradeId);
        if (upgrade) {
          totalWithUpgrades += finish.baseCost + upgrade.priceDelta;
        } else {
          totalWithUpgrades += finish.baseCost;
        }
      } else {
        totalWithUpgrades += finish.baseCost;
      }
    });

    return {
      totalBase,
      totalWithUpgrades,
      upgradeDelta: totalWithUpgrades - totalBase,
      itemCount: finishes.length,
      roomCount: uniqueRooms.size,
    };
  }, [finishes, selectedUpgrades]);

  // Group finishes by project and room
  const groupedFinishes = useMemo(() => {
    if (isAllProjects) {
      const byProject: Record<string, Record<string, FinishSelection[]>> = {};
      finishes.forEach(finish => {
        const project = getProjectFromId(finish.id);
        if (!byProject[project]) byProject[project] = {};
        if (!byProject[project][finish.room]) byProject[project][finish.room] = [];
        byProject[project][finish.room].push(finish);
      });
      return byProject;
    } else {
      const byRoom: Record<string, FinishSelection[]> = {};
      finishes.forEach(finish => {
        if (!byRoom[finish.room]) byRoom[finish.room] = [];
        byRoom[finish.room].push(finish);
      });
      return { single: byRoom };
    }
  }, [finishes, isAllProjects]);

  const toggleRoom = (roomKey: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomKey)) {
        next.delete(roomKey);
      } else {
        next.add(roomKey);
      }
      return next;
    });
  };

  const toggleProject = (project: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(project)) {
        next.delete(project);
      } else {
        next.add(project);
      }
      return next;
    });
  };

  const handleUpgradeSelect = (finishId: string, upgradeId: string | null) => {
    setSelectedUpgrades(prev => ({
      ...prev,
      [finishId]: upgradeId,
    }));
  };

  const calculateItemTotal = (finish: FinishSelection): number => {
    const selectedUpgradeId = selectedUpgrades[finish.id];
    if (selectedUpgradeId && finish.upgrades) {
      const upgrade = finish.upgrades.find(u => u.name === selectedUpgradeId);
      if (upgrade) {
        return finish.baseCost + upgrade.priceDelta;
      }
    }
    return finish.baseCost;
  };

  const calculateRoomTotal = (items: FinishSelection[]): number => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const renderFinishItem = (finish: FinishSelection) => {
    const itemTotal = calculateItemTotal(finish);
    const selectedUpgradeId = selectedUpgrades[finish.id];

    return (
      <div key={finish.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex gap-4">
          {/* Image placeholder */}
          <div className="flex-shrink-0 w-[120px] h-[80px] bg-gray-100 rounded flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500 text-center px-2">{finish.item}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{finish.item}</h4>
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  categoryColors[finish.category]
                )}>
                  {finish.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{formatCurrency(itemTotal)}</div>
                <div className="text-xs text-gray-500">Line Total</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-1">{finish.spec}</div>
            <div className="text-xs text-gray-400 font-mono mb-3">{finish.costCode}</div>

            <div className="mb-3">
              <div className="text-sm text-gray-700 mb-1">
                Base Cost: <span className="font-medium">{formatCurrency(finish.baseCost)}</span>
              </div>
            </div>

            {/* Upgrades section */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Upgrade Options:</div>
              {finish.upgrades && finish.upgrades.length > 0 ? (
                <div className="space-y-2">
                  {/* Standard (Base) option */}
                  <button
                    onClick={() => handleUpgradeSelect(finish.id, null)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded border transition-colors',
                      selectedUpgradeId === null
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        selectedUpgradeId === null ? 'border-blue-500' : 'border-gray-300'
                      )}>
                        {selectedUpgradeId === null && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Standard (Base)</div>
                        <div className="text-xs text-gray-500">{finish.spec}</div>
                      </div>
                    </div>
                  </button>

                  {/* Upgrade options */}
                  {finish.upgrades.map(upgrade => (
                    <button
                      key={upgrade.name}
                      onClick={() => handleUpgradeSelect(finish.id, upgrade.name)}
                      className={clsx(
                        'w-full text-left px-3 py-2 rounded border transition-colors',
                        selectedUpgradeId === upgrade.name
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          selectedUpgradeId === upgrade.name ? 'border-blue-500' : 'border-gray-300'
                        )}>
                          {selectedUpgradeId === upgrade.name && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{upgrade.name}</span>
                            <span className={clsx(
                              'text-sm font-medium',
                              upgrade.priceDelta > 0 ? 'text-orange-600' : 'text-green-600'
                            )}>
                              {upgrade.priceDelta > 0 ? '+' : ''}{formatCurrency(upgrade.priceDelta)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">{upgrade.spec}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No upgrade options</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRoom = (room: string, items: FinishSelection[], roomKey: string) => {
    const isExpanded = expandedRooms.has(roomKey);
    const roomTotal = calculateRoomTotal(items);

    return (
      <div key={roomKey} className="mb-4">
        <button
          onClick={() => toggleRoom(roomKey)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg
              className={clsx('w-5 h-5 text-gray-600 transition-transform', isExpanded && 'rotate-90')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">{room}</h3>
            <span className="text-sm text-gray-500">({items.length} items)</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(roomTotal)}</div>
        </button>

        {isExpanded && (
          <div className="mt-3 pl-4">
            {items.map(renderFinishItem)}
            <div className="mt-2 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Room Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(roomTotal)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-5 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Base Cost</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBase)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Total with Upgrades</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalWithUpgrades)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Upgrade Delta</div>
            <div className={clsx(
              'text-2xl font-bold',
              summary.upgradeDelta > 0 ? 'text-orange-600' : summary.upgradeDelta < 0 ? 'text-green-600' : 'text-gray-900'
            )}>
              {summary.upgradeDelta > 0 ? '+' : ''}{formatCurrency(summary.upgradeDelta)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Items</div>
            <div className="text-2xl font-bold text-gray-900">{summary.itemCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Rooms</div>
            <div className="text-2xl font-bold text-gray-900">{summary.roomCount}</div>
          </div>
        </div>
      </div>

      {/* Grouped content */}
      <div className="space-y-4">
        {isAllProjects ? (
          // All Projects mode: group by project then room
          Object.entries(groupedFinishes).map(([project, rooms]) => {
            const isProjectExpanded = expandedProjects.has(project);
            const projectTotal = Object.values(rooms).flat().reduce((sum, item) => sum + calculateItemTotal(item), 0);
            const projectItemCount = Object.values(rooms).flat().length;

            return (
              <div key={project} className="bg-white border border-gray-300 rounded-lg p-4">
                <button
                  onClick={() => toggleProject(project)}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={clsx('w-6 h-6 text-gray-600 transition-transform', isProjectExpanded && 'rotate-90')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900">{project}</h2>
                    <span className="text-sm text-gray-500">({projectItemCount} items)</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(projectTotal)}</div>
                </button>

                {isProjectExpanded && (
                  <div className="space-y-4">
                    {Object.entries(rooms).map(([room, items]) =>
                      renderRoom(room, items, `${project}-${room}`)
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Single project mode: group by room only
          Object.entries(groupedFinishes.single).map(([room, items]) =>
            renderRoom(room, items, room)
          )
        )}
      </div>
    </div>
  );
}
