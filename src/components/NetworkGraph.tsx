import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Graph, Node, Edge, ToolMode } from '@/types/graph';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, RotateCcw, Edit2, Router, Server, Database, Monitor, Cloud, Zap, Cpu, Battery, ZapOff, Building, Plane, Factory, TrainFront, Hospital, Trees, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkGraphProps {
  graph: Graph;
  onGraphChange: (graph: Graph) => void;
  toolMode: ToolMode;
  disabledEdges: Set<string>;
  highlightedElements: { nodes: Set<string>; edges: Set<string> };
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
}

const NodeIcon: React.FC<{ node: Node; isHighlighted: boolean; isCritical: boolean; isSelected: boolean }> = ({
  node, isHighlighted, isCritical, isSelected
}) => {
  const iconSize = 32;
  const color = isCritical ? 'hsl(var(--critical))' :
    isHighlighted || isSelected ? 'hsl(var(--primary))' :
      'hsl(var(--muted-foreground))';

  const renderIcon = () => {
    switch (node.iconType) {
      case 'router': return <Router size={iconSize} color={color} />;
      case 'server': return <Server size={iconSize} color={color} />;
      case 'database': return <Database size={iconSize} color={color} />;
      case 'workstation': return <Monitor size={iconSize} color={color} />;
      case 'cloud': return <Cloud size={iconSize} color={color} />;
      case 'building': return <Building size={iconSize} color={color} />;
      case 'airport': return <Plane size={iconSize} color={color} />;
      case 'factory': return <Factory size={iconSize} color={color} />;
      case 'train': return <TrainFront size={iconSize} color={color} />;
      case 'hospital': return <Hospital size={iconSize} color={color} />;
      case 'park': return <Trees size={iconSize} color={color} />;
      case 'substation': return <Zap size={iconSize} color={color} />;
      case 'terminal': return <CircleDot size={iconSize} color={color} />;

      // VLSI Logic Gates (Custom SVG)
      case 'nand':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M5 10 V30 H20 A10 10 0 0 0 20 10 Z" fill={isHighlighted || isSelected ? 'hsl(var(--primary) / 0.1)' : 'transparent'} />
            <circle cx="33" cy="20" r="3" />
          </svg>
        );
      case 'nor':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M5 10 Q15 20 5 30 Q25 30 30 20 Q25 10 5 10 Z" fill={isHighlighted || isSelected ? 'hsl(var(--primary) / 0.1)' : 'transparent'} />
            <circle cx="33" cy="20" r="3" />
          </svg>
        );
      case 'inv':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M10 10 L30 20 L10 30 Z" fill={isHighlighted || isSelected ? 'hsl(var(--primary) / 0.1)' : 'transparent'} />
            <circle cx="34" cy="20" r="3" />
          </svg>
        );
      case 'vdd':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M20 30 V10 M15 15 L20 10 L25 15 M10 10 H30" />
            <text x="5" y="38" fontSize="10" stroke="none" fill={color} fontWeight="bold">VDD</text>
          </svg>
        );
      case 'gnd':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M20 10 V25 M10 25 H30 M15 30 H25 M18 35 H22" />
          </svg>
        );
      case 'res':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M5 20 H10 L13 14 L17 26 L21 14 L25 26 L29 20 H35" />
          </svg>
        );
      case 'cap':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2">
            <path d="M5 20 H17 M23 20 H35 M17 10 V30 M23 10 V30" />
          </svg>
        );

      default:
        return (
          <circle
            cx={20}
            cy={20}
            r={16}
            fill={isCritical ? 'hsl(var(--critical) / 0.3)' : isHighlighted || isSelected ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--secondary))'}
            stroke={color}
            strokeWidth={2}
          />
        );
    }
  };

  return (
    <g transform={`translate(-20, -20)`}>
      {renderIcon()}
    </g>
  );
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graph,
  onGraphChange,
  toolMode,
  disabledEdges,
  highlightedElements,
  onNodeClick,
  onEdgeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);
  const [newNodePos, setNewNodePos] = useState<{ x: number, y: number } | null>(null);
  const [nodeName, setNodeName] = useState("");
  const [nodeIconType, setNodeIconType] = useState<string>("default");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;
  const ZOOM_PADDING = 50;

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (!svgRef.current || graph.nodes.length === 0) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const width = svgRect.width;
    const height = svgRect.height;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    graph.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    });

    // Add padding to bounding box
    const contentWidth = (maxX - minX) + ZOOM_PADDING * 2;
    const contentHeight = (maxY - minY) + ZOOM_PADDING * 2;

    const zoomX = width / contentWidth;
    const zoomY = height / contentHeight;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));

    // Center content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = width / 2 - centerX * newZoom;
    const newPanY = height / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [graph.nodes]);

  // Auto-fit on mount or graph identity change
  useEffect(() => {
    handleZoomToFit();
    // Delay slightly to ensure rects are calculated if it's the first render
    const timer = setTimeout(handleZoomToFit, 100);
    return () => clearTimeout(timer);
  }, [graph.nodes.length, graph.edges.length]);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

  const getMousePosition = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  }, [zoom, pan]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getMousePosition(e);

    // Middle mouse button or space + click for panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (toolMode === 'addNode') {
      setNewNodePos(pos);
      setNodeName(`Node ${graph.nodes.length + 1}`);
      setEditingNodeId(null);
      setIsNamingDialogOpen(true);
    }
  }, [toolMode, graph.nodes.length]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: Node) => {
    e.stopPropagation();

    if (toolMode === 'select') {
      setDraggingNode(node.id);
      setSelectedNode(node.id);
      onNodeClick?.(node);
    } else if (toolMode === 'addEdge') {
      if (edgeStart === null) {
        setEdgeStart(node.id);
      } else if (edgeStart !== node.id) {
        const newEdge: Edge = {
          id: `e${Date.now()}`,
          source: edgeStart,
          target: node.id
        };
        onGraphChange({
          ...graph,
          edges: [...graph.edges, newEdge]
        });
        setEdgeStart(null);
      }
    } else if (toolMode === 'delete') {
      onGraphChange({
        nodes: graph.nodes.filter(n => n.id !== node.id),
        edges: graph.edges.filter(e => e.source !== node.id && e.target !== node.id)
      });
    } else if (toolMode === 'simulate') {
      onNodeClick?.(node);
    }
  }, [toolMode, edgeStart, graph, onGraphChange, onNodeClick]);

  const handleNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setNodeName(node.label);
    setNodeIconType(node.iconType || "default");
    setNewNodePos(null);
    setIsNamingDialogOpen(true);
  }, []);

  const handleNameSubmit = () => {
    if (editingNodeId) {
      // Editing existing node
      onGraphChange({
        ...graph,
        nodes: graph.nodes.map(n => n.id === editingNodeId ? { ...n, label: nodeName, iconType: nodeIconType as any } : n)
      });
    } else if (newNodePos) {
      // Adding new node
      const newNode: Node = {
        id: `n${Date.now()}`,
        x: newNodePos.x,
        y: newNodePos.y,
        label: nodeName || `Node ${graph.nodes.length + 1}`,
        iconType: nodeIconType as any
      };
      onGraphChange({
        ...graph,
        nodes: [...graph.nodes, newNode]
      });
    }
    setIsNamingDialogOpen(false);
    setEditingNodeId(null);
    setNewNodePos(null);
    setNodeIconType("default");
  };

  const handleEdgeClick = useCallback((e: React.MouseEvent, edge: Edge) => {
    e.stopPropagation();

    if (toolMode === 'delete') {
      onGraphChange({
        ...graph,
        edges: graph.edges.filter(ed => ed.id !== edge.id)
      });
    } else if (toolMode === 'simulate' || toolMode === 'select') {
      onEdgeClick?.(edge);
    }
  }, [toolMode, graph, onGraphChange, onEdgeClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const pos = getMousePosition(e);
    setMousePos(pos);

    if (draggingNode && toolMode === 'select') {
      onGraphChange({
        ...graph,
        nodes: graph.nodes.map(n =>
          n.id === draggingNode ? { ...n, x: pos.x, y: pos.y } : n
        )
      });
    }
  }, [isPanning, panStart, draggingNode, toolMode, graph, onGraphChange, getMousePosition]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingNode(null);
      setIsPanning(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const getNodeById = (id: string) => graph.nodes.find(n => n.id === id);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="w-8 h-8 bg-card/90 backdrop-blur-sm border-border hover:bg-muted"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="w-8 h-8 bg-card/90 backdrop-blur-sm border-border hover:bg-muted"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetZoom}
          className="w-8 h-8 bg-card/90 backdrop-blur-sm border-border hover:bg-muted"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 right-14 px-2 py-1 bg-card/90 backdrop-blur-sm border border-border rounded text-xs text-muted-foreground">
        {Math.round(zoom * 100)}%
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full circuit-pattern"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {graph.edges.map(edge => {
            const source = getNodeById(edge.source);
            const target = getNodeById(edge.target);
            if (!source || !target) return null;

            const isDisabled = disabledEdges.has(edge.id);
            const isHighlighted = highlightedElements.edges.has(edge.id);
            const isCritical = edge.isBridge || edge.isCritical;

            return (
              <g key={edge.id} onClick={(e) => handleEdgeClick(e, edge)} className="cursor-pointer">
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className={cn(
                    'transition-all duration-300',
                    isDisabled && 'opacity-20',
                    isHighlighted && !isDisabled && 'stroke-primary',
                    isCritical && !isDisabled && 'stroke-critical',
                    edge.type === 'parallel' && 'stroke-node-p stroke-dasharray-[8,4]',
                    edge.type === 'series' && 'stroke-node-s'
                  )}
                  stroke={
                    isDisabled ? 'hsl(var(--muted-foreground))' :
                      isCritical ? 'hsl(var(--critical))' :
                        isHighlighted ? 'hsl(var(--primary))' :
                          edge.type === 'parallel' ? 'hsl(var(--node-p))' :
                            edge.type === 'series' ? 'hsl(var(--node-s))' :
                              'hsl(var(--muted-foreground))'
                  }
                  strokeWidth={isCritical && !isDisabled ? 3 : 2}
                  strokeDasharray={edge.type === 'parallel' ? '8,4' : undefined}
                  style={{
                    filter: isCritical && !isDisabled ? 'drop-shadow(0 0 6px hsl(var(--critical) / 0.8))' : undefined
                  }}
                />
                {/* Invisible wider line for easier clicking */}
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="transparent"
                  strokeWidth={12}
                />
              </g>
            );
          })}

          {/* Drawing edge preview */}
          {edgeStart && toolMode === 'addEdge' && (
            <line
              x1={getNodeById(edgeStart)?.x || 0}
              y1={getNodeById(edgeStart)?.y || 0}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.6}
            />
          )}

          {/* Nodes */}
          {graph.nodes.map(node => {
            const isHighlighted = highlightedElements.nodes.has(node.id);
            const isCritical = node.isCritical;
            const isSelected = selectedNode === node.id;
            const isEdgeStartNode = edgeStart === node.id;

            return (
              <g
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
                className="cursor-pointer"
              >
                {/* Glow effect for critical/highlighted nodes */}
                {(isCritical || isHighlighted || isSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill={
                      isCritical ? 'hsl(var(--critical) / 0.2)' :
                        'hsl(var(--primary) / 0.2)'
                    }
                    className="animate-pulse-subtle"
                  />
                )}

                {/* Main node icon/shape */}
                <g transform={`translate(${node.x}, ${node.y})`}>
                  <NodeIcon
                    node={node}
                    isHighlighted={isHighlighted}
                    isCritical={isCritical}
                    isSelected={isSelected}
                  />
                </g>

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 35}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground font-medium pointer-events-none select-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Naming Dialog */}
      <Dialog open={isNamingDialogOpen} onOpenChange={setIsNamingDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              {editingNodeId ? "Rename Infrastructure" : "Name New Infrastructure"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-muted-foreground">
                Label
              </Label>
              <Input
                id="name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="col-span-3 bg-muted border-border text-foreground"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit();
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right text-muted-foreground">
                Type
              </Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Select value={nodeIconType} onValueChange={setNodeIconType}>
                  <SelectTrigger className="flex-1 bg-muted border-border text-foreground overflow-hidden">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground max-h-[300px]">
                    <SelectItem value="default">Circle (Default)</SelectItem>
                    <SelectItem value="res">Resistor (VLSI)</SelectItem>
                    <SelectItem value="cap">Capacitor (VLSI)</SelectItem>
                    <SelectItem value="vdd">Power (VDD)</SelectItem>
                    <SelectItem value="gnd">Ground (GND)</SelectItem>
                    <SelectItem value="nand">NAND Gate</SelectItem>
                    <SelectItem value="nor">NOR Gate</SelectItem>
                    <SelectItem value="inv">Inverter</SelectItem>
                    <SelectItem value="router">Router (Net)</SelectItem>
                    <SelectItem value="server">Server (Net)</SelectItem>
                    <SelectItem value="database">Database (Net)</SelectItem>
                    <SelectItem value="workstation">PC (Net)</SelectItem>
                    <SelectItem value="building">Building (Urban)</SelectItem>
                    <SelectItem value="airport">Airport (Urban)</SelectItem>
                    <SelectItem value="hospital">Hospital (Urban)</SelectItem>
                    <SelectItem value="park">Park (Urban)</SelectItem>
                    <SelectItem value="factory">Power Plant (Infra)</SelectItem>
                    <SelectItem value="substation">Substation (Infra)</SelectItem>
                    <SelectItem value="train">Station (Rail)</SelectItem>
                    <SelectItem value="terminal">IO Terminal (VLSI)</SelectItem>
                    <SelectItem value="cloud">Cloud (Net)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-10 h-10 rounded border border-border flex items-center justify-center bg-muted overflow-hidden">
                  <svg width="40" height="40" className="scale-75 translate-x-[2px] translate-y-[2px]">
                    <g transform="translate(20, 20)">
                      <NodeIcon
                        node={{ iconType: nodeIconType as any } as any}
                        isHighlighted={false}
                        isCritical={false}
                        isSelected={false}
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNamingDialogOpen(false)}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNameSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editingNodeId ? "Update" : "Add Node"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
