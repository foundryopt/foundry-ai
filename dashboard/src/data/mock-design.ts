import type { FinishSelection } from '@/lib/types';

/**
 * SandBox Project Finish Selections
 * Project ID: sandbox-001
 * Comprehensive finish selections across all rooms
 */
export const SB_FINISHES: FinishSelection[] = [
  // Kitchen (6 items)
  {
    id: 'sb-fin-001',
    projectId: 'sandbox-001',
    room: 'Kitchen',
    category: 'Flooring',
    item: 'White Oak Engineered',
    spec: '5" wide planks, wire-brushed finish, UV oil',
    costCode: '09-65',
    baseCost: 12,
    imageUrl: '/images/finishes/kitchen-flooring.jpg',
    upgrades: [
      {
        name: 'Wide Plank',
        priceDelta: 4,
        spec: '7" wide plank construction'
      },
      {
        name: 'Herringbone',
        priceDelta: 8,
        spec: 'Herringbone pattern installation'
      }
    ]
  },
  {
    id: 'sb-fin-002',
    projectId: 'sandbox-001',
    room: 'Kitchen',
    category: 'Countertop',
    item: 'Quartz - Caesarstone Calacatta Nuvo',
    spec: '3cm thickness, polished finish, eased edge',
    costCode: '12-30',
    baseCost: 85,
    selectedUpgrade: 'Marble',
    imageUrl: '/images/finishes/kitchen-countertop.jpg',
    upgrades: [
      {
        name: 'Marble',
        priceDelta: 45,
        spec: 'Calacatta Gold marble, honed finish'
      },
      {
        name: 'Porcelain',
        priceDelta: 15,
        spec: 'Large format porcelain slab, book-matched'
      }
    ]
  },
  {
    id: 'sb-fin-003',
    projectId: 'sandbox-001',
    room: 'Kitchen',
    category: 'Cabinetry',
    item: 'Shaker Style - Painted White',
    spec: 'Full overlay, soft-close hinges, plywood construction',
    costCode: '06-20',
    baseCost: 350,
    imageUrl: '/images/finishes/kitchen-cabinetry.jpg',
    upgrades: [
      {
        name: 'Custom Inset',
        priceDelta: 150,
        spec: 'Inset door construction with reveal'
      },
      {
        name: 'Walnut',
        priceDelta: 200,
        spec: 'Natural walnut veneer, clear finish'
      }
    ]
  },
  {
    id: 'sb-fin-004',
    projectId: 'sandbox-001',
    room: 'Kitchen',
    category: 'Tile',
    item: 'Porcelain Subway 3x12',
    spec: 'Glossy white, standard running bond, white grout',
    costCode: '09-30',
    baseCost: 18,
    imageUrl: '/images/finishes/kitchen-tile.jpg',
    upgrades: [
      {
        name: 'Zellige',
        priceDelta: 22,
        spec: 'Handmade zellige tile, irregular finish'
      },
      {
        name: 'Marble Mosaic',
        priceDelta: 35,
        spec: 'Marble mosaic pattern, mixed finish'
      }
    ]
  },
  {
    id: 'sb-fin-005',
    projectId: 'sandbox-001',
    room: 'Kitchen',
    category: 'Hardware',
    item: 'Brushed Brass Pulls 5"',
    spec: 'Solid brass, lacquered finish, 5" center-to-center',
    costCode: '08-71',
    baseCost: 15,
    selectedUpgrade: 'Knurled',
    imageUrl: '/images/finishes/kitchen-hardware.jpg',
    upgrades: [
      {
        name: 'Unlacquered Brass',
        priceDelta: 12,
        spec: 'Living finish, develops patina over time'
      },
      {
        name: 'Knurled',
        priceDelta: 8,
        spec: 'Knurled detail for enhanced grip'
      }
    ]
  },
  {
    id: 'sb-fin-006',
    projectId: 'sandbox-001',
    room: 'Kitchen',
    category: 'Appliances',
    item: 'Wolf 36" Range',
    spec: 'Dual fuel, 6 burners, convection oven, stainless steel',
    costCode: '11-40',
    baseCost: 8500,
    imageUrl: '/images/finishes/kitchen-appliances.jpg',
    upgrades: [
      {
        name: '48" Range',
        priceDelta: 4500,
        spec: '48" dual fuel range with 8 burners'
      },
      {
        name: 'Induction',
        priceDelta: 1200,
        spec: '36" induction cooktop upgrade'
      }
    ]
  },

  // Master Bath (5 items)
  {
    id: 'sb-fin-007',
    projectId: 'sandbox-001',
    room: 'Master Bath',
    category: 'Flooring',
    item: 'Porcelain Tile 24x24',
    spec: 'Rectified edges, matte finish, neutral gray',
    costCode: '09-30',
    baseCost: 14,
    imageUrl: '/images/finishes/master-bath-flooring.jpg',
    upgrades: [
      {
        name: 'Heated',
        priceDelta: 8,
        spec: 'Radiant heat mat installation'
      },
      {
        name: 'Natural Stone',
        priceDelta: 25,
        spec: 'Marble tile, honed finish'
      }
    ]
  },
  {
    id: 'sb-fin-008',
    projectId: 'sandbox-001',
    room: 'Master Bath',
    category: 'Tile',
    item: 'Large Format Wall Tile',
    spec: '12x24 porcelain, vertical installation, minimal grout lines',
    costCode: '09-30',
    baseCost: 16,
    imageUrl: '/images/finishes/master-bath-tile.jpg',
    upgrades: [
      {
        name: 'Book-Match',
        priceDelta: 30,
        spec: 'Book-matched marble slab installation'
      },
      {
        name: 'Fluted',
        priceDelta: 18,
        spec: 'Fluted porcelain tile feature wall'
      }
    ]
  },
  {
    id: 'sb-fin-009',
    projectId: 'sandbox-001',
    room: 'Master Bath',
    category: 'Fixtures',
    item: 'Kohler Composed Faucet',
    spec: 'Single-hole, lever handle, brushed nickel finish',
    costCode: '22-40',
    baseCost: 485,
    selectedUpgrade: 'Brizo',
    imageUrl: '/images/finishes/master-bath-fixtures.jpg',
    upgrades: [
      {
        name: 'Waterworks',
        priceDelta: 850,
        spec: 'Waterworks faucet, premium finish'
      },
      {
        name: 'Brizo',
        priceDelta: 320,
        spec: 'Brizo Litze collection, articulating design'
      }
    ]
  },
  {
    id: 'sb-fin-010',
    projectId: 'sandbox-001',
    room: 'Master Bath',
    category: 'Cabinetry',
    item: 'Floating Vanity - White Oak',
    spec: '60" wide, wall-mounted, soft-close drawers, natural finish',
    costCode: '06-20',
    baseCost: 2800,
    imageUrl: '/images/finishes/master-bath-cabinetry.jpg',
    upgrades: [
      {
        name: 'Custom Double',
        priceDelta: 1500,
        spec: 'Double vanity configuration, 72" wide'
      },
      {
        name: 'Stone Integrated',
        priceDelta: 2200,
        spec: 'Integrated stone countertop and sink'
      }
    ]
  },
  {
    id: 'sb-fin-011',
    projectId: 'sandbox-001',
    room: 'Master Bath',
    category: 'Lighting',
    item: 'Recessed LED 4"',
    spec: 'Dimmable, 3000K color temperature, IC-rated',
    costCode: '26-50',
    baseCost: 85,
    imageUrl: '/images/finishes/master-bath-lighting.jpg',
    upgrades: [
      {
        name: 'Decorative Sconces',
        priceDelta: 180,
        spec: 'Wall sconces, flanking mirror'
      },
      {
        name: 'Linear',
        priceDelta: 350,
        spec: 'Linear vanity light, integrated LED'
      }
    ]
  },

  // Guest Bath (3 items)
  {
    id: 'sb-fin-012',
    projectId: 'sandbox-001',
    room: 'Guest Bath',
    category: 'Tile',
    item: 'Ceramic Subway',
    spec: '3x6 ceramic subway tile, white gloss, running bond',
    costCode: '09-30',
    baseCost: 12,
    imageUrl: '/images/finishes/guest-bath-tile.jpg',
    upgrades: []
  },
  {
    id: 'sb-fin-013',
    projectId: 'sandbox-001',
    room: 'Guest Bath',
    category: 'Fixtures',
    item: 'Standard Chrome Faucet',
    spec: 'Single-hole, lever handle, chrome finish',
    costCode: '22-40',
    baseCost: 285,
    imageUrl: '/images/finishes/guest-bath-fixtures.jpg',
    upgrades: []
  },
  {
    id: 'sb-fin-014',
    projectId: 'sandbox-001',
    room: 'Guest Bath',
    category: 'Lighting',
    item: 'Standard Vanity Light',
    spec: '3-light bar, brushed nickel, frosted glass shades',
    costCode: '26-50',
    baseCost: 120,
    imageUrl: '/images/finishes/guest-bath-lighting.jpg',
    upgrades: []
  },

  // Living Room (3 items)
  {
    id: 'sb-fin-015',
    projectId: 'sandbox-001',
    room: 'Living Room',
    category: 'Flooring',
    item: 'White Oak Engineered',
    spec: '5" wide planks, wire-brushed finish, UV oil',
    costCode: '09-65',
    baseCost: 12,
    imageUrl: '/images/finishes/living-room-flooring.jpg',
    upgrades: []
  },
  {
    id: 'sb-fin-016',
    projectId: 'sandbox-001',
    room: 'Living Room',
    category: 'Paint',
    item: 'Benjamin Moore White Dove',
    spec: 'OC-17, matte finish, walls and ceiling',
    costCode: '09-91',
    baseCost: 65,
    imageUrl: '/images/finishes/living-room-paint.jpg',
    upgrades: []
  },
  {
    id: 'sb-fin-017',
    projectId: 'sandbox-001',
    room: 'Living Room',
    category: 'Lighting',
    item: 'Recessed LED 6"',
    spec: 'Dimmable, 2700K color temperature, IC-rated',
    costCode: '26-50',
    baseCost: 95,
    imageUrl: '/images/finishes/living-room-lighting.jpg',
    upgrades: []
  },

  // Bedroom (2 items)
  {
    id: 'sb-fin-018',
    projectId: 'sandbox-001',
    room: 'Bedroom',
    category: 'Flooring',
    item: 'Carpet - Shaw Anso',
    spec: 'Nylon fiber, medium pile, neutral beige',
    costCode: '09-68',
    baseCost: 8,
    imageUrl: '/images/finishes/bedroom-flooring.jpg',
    upgrades: []
  },
  {
    id: 'sb-fin-019',
    projectId: 'sandbox-001',
    room: 'Bedroom',
    category: 'Paint',
    item: 'Benjamin Moore White Dove',
    spec: 'OC-17, eggshell finish, walls only',
    costCode: '09-91',
    baseCost: 65,
    imageUrl: '/images/finishes/bedroom-paint.jpg',
    upgrades: []
  },

  // Common Area (1 item)
  {
    id: 'sb-fin-020',
    projectId: 'sandbox-001',
    room: 'Common Area',
    category: 'Flooring',
    item: 'Polished Concrete',
    spec: 'Mechanically polished, sealed, exposed aggregate',
    costCode: '03-35',
    baseCost: 6,
    imageUrl: '/images/finishes/common-area-flooring.jpg',
    upgrades: []
  }
];

/**
 * Greenfield Project Finish Selections
 * Project ID: greenfield-002
 * Early-stage selections, simpler specification
 */
export const GF_FINISHES: FinishSelection[] = [
  // Kitchen (3 items)
  {
    id: 'gf-fin-001',
    projectId: 'greenfield-002',
    room: 'Kitchen',
    category: 'Flooring',
    item: 'Oak Engineered',
    spec: '5" wide planks, natural finish',
    costCode: '09-65',
    baseCost: 10,
    imageUrl: '/images/finishes/kitchen-flooring.jpg',
    upgrades: [
      {
        name: 'Wide Plank',
        priceDelta: 3,
        spec: '7" wide plank option'
      }
    ]
  },
  {
    id: 'gf-fin-002',
    projectId: 'greenfield-002',
    room: 'Kitchen',
    category: 'Countertop',
    item: 'Quartz - Standard',
    spec: '3cm thickness, polished finish',
    costCode: '12-30',
    baseCost: 65,
    imageUrl: '/images/finishes/kitchen-countertop.jpg',
    upgrades: [
      {
        name: 'Premium Quartz',
        priceDelta: 25,
        spec: 'Designer quartz with veining'
      }
    ]
  },
  {
    id: 'gf-fin-003',
    projectId: 'greenfield-002',
    room: 'Kitchen',
    category: 'Cabinetry',
    item: 'Shaker Style - White',
    spec: 'Full overlay, standard construction',
    costCode: '06-20',
    baseCost: 300,
    imageUrl: '/images/finishes/kitchen-cabinetry.jpg',
    upgrades: [
      {
        name: 'Soft-Close Upgrade',
        priceDelta: 50,
        spec: 'Soft-close hinges and drawer glides'
      }
    ]
  },

  // Master Bath (2 items)
  {
    id: 'gf-fin-004',
    projectId: 'greenfield-002',
    room: 'Master Bath',
    category: 'Tile',
    item: 'Porcelain Tile 12x24',
    spec: 'Matte finish, neutral gray',
    costCode: '09-30',
    baseCost: 12,
    imageUrl: '/images/finishes/bath-tile.jpg',
    upgrades: [
      {
        name: 'Large Format',
        priceDelta: 8,
        spec: '24x48 large format tile'
      }
    ]
  },
  {
    id: 'gf-fin-005',
    projectId: 'greenfield-002',
    room: 'Master Bath',
    category: 'Fixtures',
    item: 'Standard Faucet Set',
    spec: 'Chrome finish, lever handles',
    costCode: '22-40',
    baseCost: 350,
    selectedUpgrade: 'Brushed Nickel',
    imageUrl: '/images/finishes/bath-fixtures.jpg',
    upgrades: [
      {
        name: 'Brushed Nickel',
        priceDelta: 50,
        spec: 'Upgraded finish in brushed nickel'
      },
      {
        name: 'Designer Collection',
        priceDelta: 200,
        spec: 'Designer fixture collection'
      }
    ]
  },

  // Living Room (2 items)
  {
    id: 'gf-fin-006',
    projectId: 'greenfield-002',
    room: 'Living Room',
    category: 'Flooring',
    item: 'Oak Engineered',
    spec: '5" wide planks, natural finish',
    costCode: '09-65',
    baseCost: 10,
    imageUrl: '/images/finishes/living-room-flooring.jpg',
    upgrades: []
  },
  {
    id: 'gf-fin-007',
    projectId: 'greenfield-002',
    room: 'Living Room',
    category: 'Paint',
    item: 'Sherwin Williams Alabaster',
    spec: 'SW 7008, eggshell finish',
    costCode: '09-91',
    baseCost: 55,
    imageUrl: '/images/finishes/living-room-paint.jpg',
    upgrades: []
  },

  // Bedroom (1 item)
  {
    id: 'gf-fin-008',
    projectId: 'greenfield-002',
    room: 'Bedroom',
    category: 'Flooring',
    item: 'Carpet - Standard',
    spec: 'Polyester fiber, low pile, neutral tone',
    costCode: '09-68',
    baseCost: 6,
    imageUrl: '/images/finishes/bedroom-flooring.jpg',
    upgrades: [
      {
        name: 'Premium Carpet',
        priceDelta: 3,
        spec: 'Nylon fiber upgrade, stain resistant'
      }
    ]
  }
];
