import { NetworkPreset } from '@/types/graph';

export const networkPresets: NetworkPreset[] = [
  {
    id: 'city-roads',
    name: 'City Road Network',
    description: 'Urban traffic infrastructure with complex nested structural zones',
    icon: '🏙️',
    graph: {
      nodes: [
        { id: 'entry', x: 50, y: 200, label: 'Main Entrance', iconType: 'terminal' },
        { id: 'gate', x: 150, y: 200, label: 'Security Gate', iconType: 'building' },
        { id: 'n1', x: 300, y: 150, label: 'Downtown A', iconType: 'building' },
        { id: 'n2', x: 450, y: 100, label: 'Downtown B', iconType: 'building' },
        { id: 'n3', x: 300, y: 350, label: 'Downtown C', iconType: 'building' },
        { id: 'n4', x: 450, y: 300, label: 'Downtown D', iconType: 'building' },
        { id: 'b1', x: 600, y: 150, label: 'North Bypass', iconType: 'router' },
        { id: 'b2', x: 600, y: 350, label: 'South Bypass', iconType: 'router' },
        { id: 'dest', x: 750, y: 250, label: 'City Hospital', iconType: 'hospital' },
        { id: 'p1', x: 450, y: 450, label: 'Public Park', iconType: 'park' },
      ],
      edges: [
        // S-Node Section (Linear chain from Entry)
        { id: 'e1', source: 'entry', target: 'gate' },
        { id: 'e2', source: 'gate', target: 'n1' },

        // R-Node Section (The 'Downtown Core' Mesh)
        { id: 'e3', source: 'n1', target: 'n2' },
        { id: 'e4', source: 'n2', target: 'n4' },
        { id: 'e5', source: 'n4', target: 'n3' },
        { id: 'e6', source: 'n3', target: 'n1' },
        { id: 'e7', source: 'n1', target: 'n4' },
        { id: 'e8', source: 'n2', target: 'n3' },

        // P-Node Section (Parallel Highways to Hospital)
        { id: 'e9', source: 'n2', target: 'b1' },
        { id: 'e10', source: 'b1', target: 'dest' },
        { id: 'e11', source: 'n4', target: 'b2' },
        { id: 'e12', source: 'b2', target: 'dest' },

        // Extra connection
        { id: 'e13', source: 'n3', target: 'p1' },
      ]
    }
  },
  {
    id: 'power-grid',
    name: 'Power Grid',
    description: 'High-resilience electrical grid with redundant cores',
    icon: '⚡',
    graph: {
      nodes: [
        { id: 'p1', x: 100, y: 100, label: 'Main Plant', iconType: 'factory' },
        { id: 'h1', x: 250, y: 100, label: 'Distribution Hub', iconType: 'substation' },
        { id: 's1', x: 400, y: 50, label: 'Substation A', iconType: 'substation' },
        { id: 's2', x: 550, y: 50, label: 'Substation B', iconType: 'substation' },
        { id: 's3', x: 400, y: 150, label: 'Substation C', iconType: 'substation' },
        { id: 's4', x: 550, y: 150, label: 'Substation D', iconType: 'substation' },
        { id: 't1', x: 700, y: 100, label: 'Trans Tower', iconType: 'router' },
        { id: 'd1', x: 850, y: 100, label: 'District 1', iconType: 'building' },
        { id: 'd2', x: 850, y: 250, label: 'District 2', iconType: 'building' },
      ],
      edges: [
        { id: 'pe1', source: 'p1', target: 'h1' },

        // Nested R-Node (The Grid Core)
        { id: 'pe2', source: 'h1', target: 's1' },
        { id: 'pe3', source: 's1', target: 's2' },
        { id: 'pe4', source: 's2', target: 's4' },
        { id: 'pe5', source: 's4', target: 's3' },
        { id: 'pe6', source: 's3', target: 'h1' },
        { id: 'pe7', source: 'h1', target: 's4' },
        { id: 'pe8', source: 's1', target: 's3' },

        // P-Node (Parallel redundant feed to Tower)
        { id: 'pe9', source: 's2', target: 't1' },
        { id: 'pe10', source: 's4', target: 't1' },

        // Distribution
        { id: 'pe11', source: 't1', target: 'd1' },
        { id: 'pe12', source: 'd1', target: 'd2' },
      ]
    }
  },
  {
    id: 'railway',
    name: 'Railway Network',
    description: 'High-speed rail network with interconnected hubs',
    icon: '🚂',
    graph: {
      nodes: [
        { id: 'r1', x: 80, y: 200, label: 'Mumbai Terminus', iconType: 'train' },
        { id: 'r2', x: 200, y: 100, label: 'Pune Junction', iconType: 'train' },
        { id: 'h1', x: 400, y: 100, label: 'Central Hub A', iconType: 'building' },
        { id: 'h2', x: 550, y: 100, label: 'Central Hub B', iconType: 'building' },
        { id: 'h3', x: 400, y: 300, label: 'Central Hub C', iconType: 'building' },
        { id: 'h4', x: 550, y: 300, label: 'Central Hub D', iconType: 'building' },
        { id: 'r5', x: 700, y: 200, label: 'Chennai Junction', iconType: 'train' },
        { id: 'r6', x: 850, y: 100, label: 'Kolkata Main', iconType: 'train' },
        { id: 'r7', x: 850, y: 300, label: 'Vizag Port', iconType: 'train' },
      ],
      edges: [
        { id: 're1', source: 'r1', target: 'r2' },
        { id: 're2', source: 'r2', target: 'h1' },

        // Rigid Core (The Central Hub Mesh)
        { id: 're3', source: 'h1', target: 'h2' },
        { id: 're4', source: 'h2', target: 'h4' },
        { id: 're5', source: 'h4', target: 'h3' },
        { id: 're6', source: 'h3', target: 'h1' },
        { id: 're7', source: 'h1', target: 'h4' },
        { id: 're8', source: 'h2', target: 'h3' },

        // Parallel Redundancy to Chennai
        { id: 're9', source: 'h2', target: 'r5' },
        { id: 're10', source: 'h4', target: 'r5' },

        // Final legs
        { id: 're11', source: 'r5', target: 'r6' },
        { id: 're12', source: 'r5', target: 'r7' },
        { id: 're13', source: 'r6', target: 'r7' },
      ]
    }
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'Cloud-native architecture with clustered data layers',
    icon: '🔗',
    graph: {
      nodes: [
        { id: 'gateway', x: 50, y: 200, label: 'API Gateway', iconType: 'router' },
        { id: 'lb', x: 150, y: 200, label: 'Load Balancer', iconType: 'router' },
        { id: 's1', x: 300, y: 100, label: 'Auth Service', iconType: 'server' },
        { id: 's2', x: 300, y: 300, label: 'Order Service', iconType: 'server' },
        { id: 'db1', x: 500, y: 100, label: 'DB Cluster A', iconType: 'database' },
        { id: 'db2', x: 650, y: 100, label: 'DB Cluster B', iconType: 'database' },
        { id: 'db3', x: 500, y: 300, label: 'DB Cluster C', iconType: 'database' },
        { id: 'db4', x: 650, y: 300, label: 'DB Cluster D', iconType: 'database' },
        { id: 'cache', x: 800, y: 200, label: 'Redis Cache', iconType: 'server' },
      ],
      edges: [
        { id: 'me1', source: 'gateway', target: 'lb' },

        // Parallel feeds to services
        { id: 'me2', source: 'lb', target: 's1' },
        { id: 'me3', source: 'lb', target: 's2' },

        // Shared access to DB Core (Rigid Mesh)
        { id: 'me4', source: 's1', target: 'db1' },
        { id: 'me5', source: 's2', target: 'db3' },
        { id: 'me6', source: 'db1', target: 'db2' },
        { id: 'me7', source: 'db2', target: 'db4' },
        { id: 'me8', source: 'db4', target: 'db3' },
        { id: 'me9', source: 'db3', target: 'db1' },
        { id: 'me10', source: 'db1', target: 'db4' },
        { id: 'me11', source: 'db2', target: 'db3' },

        // Final cache layer
        { id: 'me12', source: 'db2', target: 'cache' },
        { id: 'me13', source: 'db4', target: 'cache' },
      ]
    }
  },
  {
    id: 'internet',
    name: 'ISP Backbone',
    description: 'Tier-1 provider backbone with core router mesh',
    icon: '🌐',
    graph: {
      nodes: [
        { id: 'pop', x: 50, y: 200, label: 'Access POP', iconType: 'router' },
        { id: 'c1', x: 250, y: 150, label: 'Core A', iconType: 'router' },
        { id: 'c2', x: 450, y: 150, label: 'Core B', iconType: 'router' },
        { id: 'c3', x: 250, y: 350, label: 'Core C', iconType: 'router' },
        { id: 'c4', x: 450, y: 350, label: 'Core D', iconType: 'router' },
        { id: 'e1', x: 650, y: 150, label: 'Edge 1', iconType: 'router' },
        { id: 'e2', x: 650, y: 350, label: 'Edge 2', iconType: 'router' },
        { id: 'cloud', x: 850, y: 250, label: 'Global Cloud', iconType: 'cloud' },
      ],
      edges: [
        { id: 'ie1', source: 'pop', target: 'c1' },
        { id: 'ie2', source: 'pop', target: 'c3' },

        // Core Mesh (Rigid)
        { id: 'ie3', source: 'c1', target: 'c2' },
        { id: 'ie4', source: 'c2', target: 'c4' },
        { id: 'ie5', source: 'c4', target: 'c3' },
        { id: 'ie6', source: 'c3', target: 'c1' },
        { id: 'ie7', source: 'c1', target: 'c4' },
        { id: 'ie8', source: 'c2', target: 'c3' },

        // Parallel Edge Links
        { id: 'ie9', source: 'c2', target: 'e1' },
        { id: 'ie10', source: 'c4', target: 'e1' },
        { id: 'ie11', source: 'c2', target: 'e2' },
        { id: 'ie12', source: 'c4', target: 'e2' },

        // Cloud uplink
        { id: 'ie13', source: 'e1', target: 'cloud' },
        { id: 'ie14', source: 'e2', target: 'cloud' },
      ]
    }
  },
  {
    id: 'vlsi-circuit',
    name: 'VLSI Circuit',
    description: 'Complex logic block with redundant timing paths',
    icon: '🔌',
    graph: {
      nodes: [
        { id: 'in', x: 50, y: 250, label: 'DATA_IN', iconType: 'terminal' },
        { id: 'g1', x: 150, y: 250, label: 'BUFFER', iconType: 'inv' },
        { id: 'r1', x: 350, y: 150, label: 'REG_A1', iconType: 'nand' },
        { id: 'r2', x: 550, y: 150, label: 'REG_A2', iconType: 'nand' },
        { id: 'r3', x: 350, y: 350, label: 'REG_B1', iconType: 'nand' },
        { id: 'r4', x: 550, y: 350, label: 'REG_B2', iconType: 'nand' },
        { id: 'sum', x: 750, y: 250, label: 'ALU_SUM', iconType: 'nor' },
        { id: 'out', x: 900, y: 250, label: 'DATA_OUT', iconType: 'terminal' },
        { id: 'vdd', x: 450, y: 20, label: 'VDD', iconType: 'vdd' },
        { id: 'gnd', x: 450, y: 450, label: 'GND', iconType: 'gnd' },
      ],
      edges: [
        { id: 've1', source: 'in', target: 'g1' },

        // Parallel branching to two registers
        { id: 've2', source: 'g1', target: 'r1' },
        { id: 've3', source: 'g1', target: 'r3' },

        // Rigid Register Block Mesh
        { id: 've4', source: 'r1', target: 'r2' },
        { id: 've5', source: 'r2', target: 'r4' },
        { id: 've6', source: 'r4', target: 'r3' },
        { id: 've7', source: 'r3', target: 'r1' },
        { id: 've8', source: 'r1', target: 'r4' },
        { id: 've9', source: 'r2', target: 'r3' },

        // Final Path to Out
        { id: 've10', source: 'r2', target: 'sum' },
        { id: 've11', source: 'r4', target: 'sum' },
        { id: 've12', source: 'sum', target: 'out' },

        // Supplies
        { id: 've13', source: 'r1', target: 'vdd' },
        { id: 've14', source: 'r3', target: 'gnd' },
      ]
    }
  }
];
