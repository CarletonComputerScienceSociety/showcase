import * as d3 from 'd3';

// #region Types

interface StudentNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  url: string;
  year: number;
  inRing: boolean;
}

interface GraphLinkData {
  source: string;
  target: string;
}

interface GraphData {
  nodes: StudentNode[];
  links: GraphLinkData[];
}

interface GraphLink {
  source: StudentNode;
  target: StudentNode;
}

// #endregion

// #region DOM elements

const dataElement = document.querySelector<HTMLScriptElement>('#webring-data');

const svgElement = document.querySelector<SVGSVGElement>('#webring-graph-svg');

const tooltipElement =
  document.querySelector<HTMLDivElement>('#webring-tooltip');

if (!dataElement || !svgElement) {
  throw new Error('Webring graph elements could not be found.');
}

// #endregion

// #region Parse graph data

const dataText = dataElement.textContent;

if (!dataText) {
  throw new Error('Webring graph data could not be found.');
}

let graphData: GraphData;

try {
  graphData = JSON.parse(dataText);
} catch {
  throw new Error('Webring graph data contains invalid JSON.');
}

// #endregion

// #region SVG setup

const container = svgElement.parentElement;

if (!container) {
  throw new Error('Webring graph container could not be found.');
}

let width = container.clientWidth || 800;
let height = width;

const svg = d3.select(svgElement);
svg
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('style', 'max-width: 100%; height: auto;');

const graphGroup = svg
  .append('g')
  .attr('id', 'ring-graph')
  .attr('class', 'ring-graph');

// #endregion

// #region Zooming/Panning

const zoom = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.75, 1.25])
  .extent([
    [0, 0],
    [width, height],
  ])
  .translateExtent([
    [-100, -100],
    [width + 100, height + 100],
  ])
  .on('zoom', (event) => {
    graphGroup.attr('transform', event.transform);
  });

svg.call(zoom);

// #endregion

// #region Links

const visibleNodes = graphData.nodes;

const nodeById = new Map(visibleNodes.map((node) => [node.id, node]));

const visibleLinks: GraphLink[] = graphData.links.map((link) => {
  const source = nodeById.get(link.source);
  const target = nodeById.get(link.target);

  if (!source || !target) {
    throw new Error(`Invalid graph link: ${link.source} -> ${link.target}`);
  }

  return { source, target };
});

const linkGroup = graphGroup.append('g').attr('class', 'ring-edge');

const links = linkGroup
  .selectAll<SVGLineElement, GraphLink>('line')
  .data(visibleLinks)
  .join('line')
  .attr('class', 'ring-edge');

// #endregion

// #region Nodes

const nodeGroup = graphGroup.append('g').attr('class', 'ring-nodes');

const nodes = nodeGroup
  .selectAll<SVGGElement, StudentNode>('g')
  .data(visibleNodes)
  .join('g')
  .attr('class', 'ring-node is-match')
  .attr('tabindex', 0)
  .attr('role', 'link')
  .attr('aria-label', (d) => `${d.name}, class of ${d.year}`)
  .attr('data-name', (d) => d.name)
  .attr('data-year', (d) => String(d.year))
  .attr('data-url', (d) => d.url);

// Node circles
nodes.append('circle').attr('class', 'ring-node-circle').attr('r', 10);

// Node labels
nodes
  .append('text')
  .attr('class', 'ring-label')
  .attr('x', 14)
  .attr('y', 4)
  .text((d) => d.name);

// Clickable nodes
nodes.on('click', (_event, d) => {
  window.open(d.url, '_blank', 'noopener,noreferrer');
});

// Keyboard accessibility
nodes.on('keydown', (event, d) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();

    window.open(d.url, '_blank', 'noopener,noreferrer');
  }
});

// #endregion

// #region Tooltip

if (tooltipElement) {
  const tooltip = d3.select(tooltipElement);
  const tooltipName = tooltip.select('.tooltip-name');
  const tooltipYear = tooltip.select('.tooltip-year');
  const tooltipStatus = tooltip.select('.tooltip-status');
  const tooltipHostname = tooltip.select('.tooltip-hostname');

  function showTooltip(event: MouseEvent, d: StudentNode) {
    tooltip
      .style('display', 'block')
      .style('left', `${event.clientX + 12}px`)
      .style('top', `${event.clientY + 12}px`);

    tooltipName.text(d.name);
    tooltipYear.text(`Class of ${d.year}`);
    tooltipStatus.text(`Currently in the webring`);
    tooltipHostname.text(d.url);
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }

  nodes
    .select<SVGCircleElement>('.ring-node-circle')
    .on('mouseenter', showTooltip)
    .on('mousemove', showTooltip)
    .on('mouseleave', hideTooltip);
}

// #endregion

// #region Boundary containment

const nodeRadius = 10;
const boundaryPadding = nodeRadius + 4;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// #endregion

// #region Force simulation

const simulation = d3
  .forceSimulation<StudentNode>(visibleNodes)
  .force(
    'link',
    d3
      .forceLink<StudentNode, GraphLink>(visibleLinks)
      .id((d) => d.id)
      .distance(100)
      .strength(0.7),
  )
  .force('charge', d3.forceManyBody<StudentNode>().strength(-300))
  .force('collision', d3.forceCollide<StudentNode>().radius(45));

function updateForces(): void {
  simulation
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('x', d3.forceX<StudentNode>(width / 2).strength(0.1))
    .force('y', d3.forceY<StudentNode>(height / 2).strength(0.1));
}

updateForces();

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

if (prefersReducedMotion) {
  simulation.tick(300);
  renderGraph();
  simulation.stop();
}

// #endregion

// #region Dragging

nodes.call(
  d3
    .drag<SVGGElement, StudentNode>()
    .on('start', (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0.2).restart();
      }

      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = clamp(event.x, boundaryPadding, width - boundaryPadding);
      d.fy = clamp(event.y, boundaryPadding, height - boundaryPadding);
    })
    .on('end', (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      d.fx = null;
      d.fy = null;
    }),
);

// #endregion

// #region Simulation tick

simulation.on('tick', renderGraph);

function renderGraph(): void {
  visibleNodes.forEach((d) => {
    d.x = clamp(d.x ?? 0, boundaryPadding, width - boundaryPadding);
    d.y = clamp(d.y ?? 0, boundaryPadding, height - boundaryPadding);
  });

  links
    .attr('x1', (d) => d.source.x ?? 0)
    .attr('y1', (d) => d.source.y ?? 0)
    .attr('x2', (d) => d.target.x ?? 0)
    .attr('y2', (d) => d.target.y ?? 0);

  nodes.attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
}

// #endregion

// #region Responsive resizing

const resizeObserver = new ResizeObserver(() => {
  width = container.clientWidth || 800;
  height = width;

  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  zoom
    .extent([
      [0, 0],
      [width, height],
    ])
    .translateExtent([
      [-100, -100],
      [width + 100, height + 100],
    ]);

  updateForces();

  if (prefersReducedMotion) {
    simulation.tick(30);
    renderGraph();
    simulation.stop();
  } else {
    simulation.alpha(0.2).restart();
  }
});

resizeObserver.observe(container);

// #endregion

// #region Search hook (dormant)

/*
 * Exposed for the "Ring graph search" ticket. Not wired to any UI.
 * Search is expected to call these once it can resolve a query to
 * one or more student IDs.
 *
 * highlight(ids):
 *   Adds the "is-match" class to nodes whose id is in `ids`, and adds
 *   "is-dimmed" to all others, so search can visually emphasize matches
 *   without altering layout or removing any nodes/links.
 *
 * clear():
 *   Removes "is-match"/"is-dimmed" from every node, restoring the default
 *   appearance. Should be called when the search query is cleared.
 */
export function highlight(ids: string[]): void {
  const matchSet = new Set(ids);

  nodes
    .classed('is-match', (d) => matchSet.has(d.id))
    .classed('is-dimmed', (d) => !matchSet.has(d.id));
}

export function clear(): void {
  nodes.classed('is-match', false).classed('is-dimmed', false);
}

// #endregion
