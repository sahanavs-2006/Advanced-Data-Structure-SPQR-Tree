import React, { useState, useCallback, useEffect } from 'react';
import { Graph, Node, Edge, ToolMode, AnalysisResult } from '@/types/graph';
import { networkPresets } from '@/data/presets';
import { analyzeGraph, findBridges, findArticulationPoints } from '@/lib/graphAnalysis';
import { applyAutoLayout } from '@/lib/autoLayout';
import { Header } from '@/components/Header';
import { NetworkGraph } from '@/components/NetworkGraph';
import { Toolbar } from '@/components/Toolbar';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { PresetSelector } from '@/components/PresetSelector';
import { SimulationPanel } from '@/components/SimulationPanel';
import { SPQRTreePanel } from '@/components/SPQRTreePanel';
import { PathfindingPanel } from '@/components/PathfindingPanel';
import { StatsBar } from '@/components/StatsBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const Index = () => {
  const [graph, setGraph] = useState<Graph>(networkPresets[0].graph);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(networkPresets[0].id);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [disabledEdges, setDisabledEdges] = useState<Set<string>>(new Set());
  const [highlightedElements, setHighlightedElements] = useState<{
    nodes: Set<string>;
    edges: Set<string>;
  }>({ nodes: new Set(), edges: new Set() });

  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);

  const handleAutoLayout = useCallback(() => {
    const optimizedGraph = applyAutoLayout(graph);
    setGraph(optimizedGraph);
  }, [graph]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'v': setToolMode('select'); break;
        case 'n': setToolMode('addNode'); break;
        case 'e': setToolMode('addEdge'); break;
        case 'd': setToolMode('delete'); break;
        case 's': setToolMode('simulate'); break;
        case 'l': handleAutoLayout(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAutoLayout]);

  // Resize handlers
  const startResizingRight = useCallback(() => setIsResizingRight(true), []);
  const startResizingLeft = useCallback(() => setIsResizingLeft(true), []);
  const stopResizing = useCallback(() => {
    setIsResizingRight(false);
    setIsResizingLeft(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingRight) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setRightSidebarWidth(newWidth);
      }
    } else if (isResizingLeft) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 450) {
        setLeftSidebarWidth(newWidth);
      }
    }
  }, [isResizingRight, isResizingLeft]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handlePresetSelect = useCallback((preset: typeof networkPresets[0]) => {
    setGraph(preset.graph);
    setSelectedPresetId(preset.id);
    setAnalysisResult(null);
    setDisabledEdges(new Set());
  }, []);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);

    // Simulate analysis delay for UX
    setTimeout(() => {
      const result = analyzeGraph(graph, disabledEdges);

      // Update graph with critical markers
      const bridges = findBridges(graph, disabledEdges);
      const articulationPoints = findArticulationPoints(graph, disabledEdges);

      const bridgeIds = new Set(bridges.map(e => e.id));
      const apIds = new Set(articulationPoints.map(n => n.id));

      setGraph(prev => ({
        nodes: prev.nodes.map(n => ({ ...n, isCritical: apIds.has(n.id) })),
        edges: prev.edges.map(e => ({ ...e, isBridge: bridgeIds.has(e.id), isCritical: bridgeIds.has(e.id) }))
      }));

      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 800);
  }, [graph, disabledEdges]);

  // Update analysis when disabledEdges changes (without delay for smoother UX)
  useEffect(() => {
    if (analysisResult) {
      const updatedResult = analyzeGraph(graph, disabledEdges);
      setAnalysisResult(prev => prev ? {
        ...updatedResult,
        // Keep some properties if needed, but analyzeGraph returns a full result
      } : null);
    }
  }, [disabledEdges, graph]);

  const handleReset = useCallback(() => {
    const preset = networkPresets.find(p => p.id === selectedPresetId);
    if (preset) {
      setGraph(preset.graph);
      setAnalysisResult(null);
      setDisabledEdges(new Set());
    }
  }, [selectedPresetId]);

  const handleToggleEdge = useCallback((edgeId: string) => {
    setDisabledEdges(prev => {
      const next = new Set(prev);
      if (next.has(edgeId)) {
        next.delete(edgeId);
      } else {
        next.add(edgeId);
      }
      return next;
    });
  }, []);

  const handleEdgeClick = useCallback((edge: Edge) => {
    if (toolMode === 'simulate') {
      handleToggleEdge(edge.id);
    }
  }, [toolMode, handleToggleEdge]);

  const handleHighlightBridge = useCallback((edge: Edge) => {
    setHighlightedElements({
      nodes: new Set([edge.source, edge.target]),
      edges: new Set([edge.id])
    });
  }, []);

  const handleHighlightNode = useCallback((node: Node) => {
    setHighlightedElements({
      nodes: new Set([node.id]),
      edges: new Set()
    });
  }, []);

  const handleClearHighlight = useCallback(() => {
    setHighlightedElements({ nodes: new Set(), edges: new Set() });
  }, []);

  const handleHighlightComponent = useCallback((nodeIds: string[], edgeIds: string[]) => {
    setHighlightedElements({
      nodes: new Set(nodeIds),
      edges: new Set(edgeIds)
    });
  }, []);

  const handleHighlightPath = useCallback((nodeIds: string[], edgeIds: string[]) => {
    setHighlightedElements({
      nodes: new Set(nodeIds),
      edges: new Set(edgeIds)
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Presets */}
        <aside
          className="relative border-r border-border bg-card/30 flex-shrink-0"
          style={{ width: `${leftSidebarWidth}px` }}
        >
          <ScrollArea className="h-full">
            <div className="p-4">
              <PresetSelector
                presets={networkPresets}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handlePresetSelect}
              />
            </div>
          </ScrollArea>

          {/* Resize Handle */}
          <div
            className={cn(
              "absolute right-0 top-0 w-1 h-full cursor-col-resize z-50 transition-colors",
              isResizingLeft ? "bg-primary" : "hover:bg-primary/50"
            )}
            onMouseDown={startResizingLeft}
          />
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 flex justify-center">
            <Toolbar
              toolMode={toolMode}
              onToolModeChange={setToolMode}
              onReset={handleReset}
              onAnalyze={handleAnalyze}
              onAutoLayout={handleAutoLayout}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Graph Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <NetworkGraph
              graph={graph}
              onGraphChange={setGraph}
              toolMode={toolMode}
              disabledEdges={disabledEdges}
              highlightedElements={highlightedElements}
              onEdgeClick={handleEdgeClick}
            />

            {/* Mode indicator */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-lg">
              <span className="text-xs text-muted-foreground">Mode: </span>
              <span className="text-xs font-semibold text-primary capitalize">{toolMode}</span>
            </div>
          </div>

          {/* Stats Bar */}
          <StatsBar graph={graph} analysisResult={analysisResult} />
        </main>

        {/* Right Sidebar - Analysis */}
        <aside
          className="relative border-l border-border bg-card/30 flex-shrink-0"
          style={{ width: `${rightSidebarWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className={cn(
              "absolute left-0 top-0 w-1 h-full cursor-col-resize z-50 transition-colors",
              isResizingRight ? "bg-primary" : "hover:bg-primary/50"
            )}
            onMouseDown={startResizingRight}
          />

          <Tabs defaultValue="analysis" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 py-0 h-12 overflow-x-auto">
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs"
              >
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="spqr"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs"
              >
                SPQR
              </TabsTrigger>
              <TabsTrigger
                value="paths"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs"
              >
                Paths
              </TabsTrigger>
              <TabsTrigger
                value="simulation"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs"
              >
                Simulate
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="analysis" className="m-0">
                <AnalysisPanel
                  result={analysisResult}
                  onHighlightBridge={handleHighlightBridge}
                  onHighlightNode={handleHighlightNode}
                  onClearHighlight={handleClearHighlight}
                />
              </TabsContent>

              <TabsContent value="spqr" className="m-0">
                <SPQRTreePanel
                  graph={graph}
                  disabledEdges={disabledEdges}
                  onHighlightComponent={handleHighlightComponent}
                  onClearHighlight={handleClearHighlight}
                />
              </TabsContent>

              <TabsContent value="paths" className="m-0">
                <PathfindingPanel
                  graph={graph}
                  disabledEdges={disabledEdges}
                  onHighlightPath={handleHighlightPath}
                  onClearHighlight={handleClearHighlight}
                />
              </TabsContent>

              <TabsContent value="simulation" className="m-0">
                <SimulationPanel
                  graph={graph}
                  disabledEdges={disabledEdges}
                  onToggleEdge={handleToggleEdge}
                  onResetSimulation={() => setDisabledEdges(new Set())}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
};

export default Index;
