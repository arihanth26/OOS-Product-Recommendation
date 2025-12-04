import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3GMMGraphProps {
  onClose?: () => void;
  onSwitchLayout?: (layout: 'hierarchical' | 'gmm') => void;
}

export function D3GMMGraph({ onClose, onSwitchLayout }: D3GMMGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);
    const root = svg.append('g').attr('class', 'root');

    // Load the graph data
    d3.json("/data/processed/drilldown_graph.json").then((graphData: any) => {
      d3.json("/data/processed/drilldown_graph_gmm.json").then((gmmData: any) => {
        buildGraph(graphData, gmmData);
      }).catch(() => buildGraph(graphData, null));
    });

    function buildGraph(graph: any, gmmAug: any) {
      // Visualize clusters; aisles are used as endpoints for P2_P3 edges
      const aisles = graph.nodes.filter((d: any) => d.type === 'P3_Aisle');
      const clusters = graph.nodes.filter((d: any) => d.type === 'P2_Cluster');

      if (gmmAug) {
        const augMap = new Map();
        gmmAug.nodes.filter((n: any) => n.type === 'P2_Cluster').forEach((n: any) => augMap.set(n.id, n));
        clusters.forEach((c: any) => {
          const aug = augMap.get(c.id);
          if (aug && aug.centroid_x !== undefined) {
            c.centroid_x = aug.centroid_x;
            c.centroid_y = aug.centroid_y;
            c.eig1 = aug.eig1;
            c.eig2 = aug.eig2;
            c.angle_deg = aug.angle_deg;
          }
        });
      }

      const color = d3.scaleOrdinal()
        .domain(aisles.map((a: any) => a.name))
        .range(d3.schemeTableau10.concat(d3.schemeCategory10));

      // Place aisles (not rendered) to serve as link endpoints for P2_P3
      const aisleCols = Math.ceil(Math.sqrt(aisles.length));
      const aisleGapX = Math.max(140, width / Math.max(aisleCols, 1));
      const aisleGapY = 180;
      aisles.forEach((a: any, i: number) => {
        const col = i % aisleCols;
        const row = Math.floor(i / aisleCols);
        a.x = 80 + col * aisleGapX;
        a.y = 80 + row * aisleGapY;
      });

      // Initialize cluster positions to GMM centroids when available
      const margin = 60;
      clusters.forEach((c: any) => {
        if (c.centroid_x !== undefined) {
          c.x = margin + c.centroid_x * (width - margin * 2);
          c.y = margin + c.centroid_y * (height - margin * 2);
        } else {
          c.x = width / 2 + (Math.random() - 0.5) * 100;
          c.y = height / 2 + (Math.random() - 0.5) * 100;
        }
      });

      // Render edges: P2_P3 and P2_P2 with different styles
      const linksP2P3 = graph.links.filter((l: any) => l.type === 'P2_P3');
      const linksP2P2 = graph.links.filter((l: any) =>
        l.type === 'P2_P2' || l.type === 'P2_P2_SIMILARITY' || l.type === 'P2_P2_Similarity' || l.type === 'P2_P2_similarity'
      );

      const edgeLayer = root.append('g').attr('class', 'edge-layer');
      const linkP2P3 = edgeLayer
        .append('g')
        .attr('stroke', '#9aa0a6')
        .attr('stroke-opacity', 0.55)
        .selectAll('line')
        .data(linksP2P3)
        .join('line')
        .attr('stroke-width', 1.1)
        .attr('x1', (d: any) => clusters.find((c: any) => c.id === d.source).x)
        .attr('y1', (d: any) => clusters.find((c: any) => c.id === d.source).y)
        .attr('x2', (d: any) => aisles.find((a: any) => a.id === d.target).x)
        .attr('y2', (d: any) => aisles.find((a: any) => a.id === d.target).y);

      const linkP2P2 = edgeLayer
        .append('g')
        .attr('stroke', '#0d6efd')
        .attr('stroke-opacity', 0.35)
        .selectAll('line')
        .data(linksP2P2)
        .join('line')
        .attr('stroke-width', 1.6)
        .attr('x1', (d: any) => clusters.find((c: any) => c.id === d.source).x)
        .attr('y1', (d: any) => clusters.find((c: any) => c.id === d.source).y)
        .attr('x2', (d: any) => clusters.find((c: any) => c.id === d.target).x)
        .attr('y2', (d: any) => clusters.find((c: any) => c.id === d.target).y);

      function clusterNumber(d: any) {
        if (d.cluster_id !== undefined) return d.cluster_id;
        const parts = (d.name || '').split(/\s+/);
        const num = +parts[1];
        return isNaN(num) ? '' : num;
      }

      const ellipseLayer = root.append('g').attr('class', 'ellipse-layer');

      const clusterGroup = root
        .append('g')
        .selectAll('g.cluster-group')
        .data(clusters)
        .join('g')
        .attr('class', 'cluster-group')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
        .style('cursor', 'pointer')
        .on('click', (_event: any, d: any) => openClusterPanel(d));

      clusterGroup
        .append('circle')
        .attr('class', 'node cluster')
        .attr('r', 16)
        .attr('fill', (d: any) => color(d.aisle_name) as string)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2);

      clusterGroup
        .append('text')
        .attr('class', 'cluster-id')
        .attr('dy', '0.35em')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#fff')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text((d: any) => clusterNumber(d));

      const clusterNode = clusterGroup.select('circle.cluster');

      function ellipseRadiiScale() {
        return 80;
      }

      const ellipses = ellipseLayer
        .selectAll('ellipse')
        .data(clusters.filter((c: any) => c.eig1 !== undefined))
        .join('ellipse')
        .attr('class', 'cluster-ellipse')
        .attr('cx', (c: any) => c.x)
        .attr('cy', (c: any) => c.y)
        .attr('rx', (c: any) => c.eig1 * ellipseRadiiScale())
        .attr('ry', (c: any) => c.eig2 * ellipseRadiiScale())
        .attr('transform', (c: any) => `translate(${c.x},${c.y}) rotate(${c.angle_deg || 0}) translate(${-c.x},${-c.y})`)
        .attr('stroke', (c: any) => color(c.aisle_name) as string)
        .attr('fill', (c: any) => {
          const col = d3.color(color(c.aisle_name) as string);
          return col ? col.copy({ opacity: 0.12 }).toString() : 'rgba(0,0,0,0.12)';
        })
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '8,4')
        .style('pointer-events', 'none');

      function computeBounds() {
        const all = clusters.concat(aisles);
        const pad = 50;
        const minX = Number(d3.min(all, (d: any) => d.x - 16) || 0) - pad;
        const maxX = Number(d3.max(all, (d: any) => d.x + 16) || width) + pad;
        const minY = Number(d3.min(all, (d: any) => d.y - 16) || 0) - pad;
        const maxY = Number(d3.max(all, (d: any) => d.y + 16) || height) + pad;
        return { minX, minY, maxX, maxY };
      }

      function fitView(animated = true) {
        const b = computeBounds();
        const vw = width;
        const vh = height;
        const bw = b.maxX - b.minX;
        const bh = b.maxY - b.minY;
        const scale = Math.min((vw - 40) / bw, (vh - 40) / bh);
        const tx = vw / 2 - (b.minX + bw / 2) * scale;
        const ty = vh / 2 - (b.minY + bh / 2) * scale;
        const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        if (animated) {
          svg.transition().duration(650).call(zoom.transform as any, transform);
        } else {
          svg.call(zoom.transform as any, transform);
        }
      }

      const zoom = d3.zoom()
        .scaleExtent([0.3, 6])
        .on('zoom', (event: any) => {
          root.attr('transform', event.transform);
        });

      svg.call(zoom as any);

      d3.select(container).select('#fit-btn').on('click', () => fitView(true));
      
      // Cluster filter dropdown
      const clusterFilter = d3.select(container).select('#cluster-filter');
      clusterFilter.on('change', function () {
        const selected = (this as HTMLSelectElement).value;
        if (selected === 'all') {
          // Show all clusters and ellipses normally
          clusterGroup.style('opacity', 1);
          ellipses.style('opacity', 1).attr('stroke-width', 1);
        } else {
          const clusterId = parseInt(selected);
          // Dim non-selected clusters
          clusterGroup.style('opacity', (d: any) => clusterNumber(d) == clusterId ? 1 : 0.15);
          // Highlight selected ellipse
          ellipses
            .style('opacity', (d: any) => clusterNumber(d) == clusterId ? 1 : 0.1)
            .attr('stroke-width', (d: any) => clusterNumber(d) == clusterId ? 3 : 1);
          
          // Focus on selected cluster
          const targetCluster = clusters.find((c: any) => clusterNumber(c) == clusterId);
          if (targetCluster) {
            focusNode(targetCluster);
          }
        }
      });

      let clusterSim: any = null;

      function activateGmmLayout() {
        ellipses
          .attr('cx', (c: any) => c.x)
          .attr('cy', (c: any) => c.y)
          .attr('rx', (c: any) => c.eig1 * ellipseRadiiScale())
          .attr('ry', (c: any) => c.eig2 * ellipseRadiiScale())
          .attr('transform', (c: any) => `translate(${c.x},${c.y}) rotate(${c.angle_deg || 0}) translate(${-c.x},${-c.y})`);

        clusterSim = d3
          .forceSimulation(clusters)
          .force('charge', d3.forceManyBody().strength(-40))
          .force('collision', d3.forceCollide().radius(22))
          .alphaDecay(0.05)
          .on('tick', () => {
            clusterGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
            ellipses
              .attr('cx', (d: any) => d.x)
              .attr('cy', (d: any) => d.y)
              .attr('transform', (d: any) => `translate(${d.x},${d.y}) rotate(${d.angle_deg || 0}) translate(${-d.x},${-d.y})`);
            linkP2P3
              .attr('x1', (d: any) => clusters.find((c: any) => c.id === d.source).x)
              .attr('y1', (d: any) => clusters.find((c: any) => c.id === d.source).y)
              .attr('x2', (d: any) => aisles.find((a: any) => a.id === d.target).x)
              .attr('y2', (d: any) => aisles.find((a: any) => a.id === d.target).y);
            linkP2P2
              .attr('x1', (d: any) => clusters.find((c: any) => c.id === d.source).x)
              .attr('y1', (d: any) => clusters.find((c: any) => c.id === d.source).y)
              .attr('x2', (d: any) => clusters.find((c: any) => c.id === d.target).x)
              .attr('y2', (d: any) => clusters.find((c: any) => c.id === d.target).y);
          });

        clusterGroup.call(
          d3.drag()
            .on('start', (event: any, d: any) => {
              if (!event.active) clusterSim.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on('drag', (event: any, d: any) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on('end', (event: any, d: any) => {
              if (!event.active) clusterSim.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }) as any
        );

        fitView(true);
        d3.select(container).select('#search-status').text('GMM layout active. Drag clusters; click a cluster to explore products.');
      }

      // Search functionality
      const searchInput = d3.select(container).select('#search-input');
      const searchStatus = d3.select(container).select('#search-status');

      function focusNode(node: any) {
        if (!node) return;
        const targetScale = 1.8;
        const clampScale = Math.min(Math.max(targetScale, 0.3), 6);
        const tx = width / 2 - node.x * clampScale;
        const ty = height / 2 - node.y * clampScale;
        const transform = d3.zoomIdentity.translate(tx, ty).scale(clampScale);
        svg.transition().duration(600).call(zoom.transform as any, transform);

        if (node.type === 'P2_Cluster') {
          clusterNode.classed('highlight', (c: any) => c === node);
          setTimeout(() => clusterNode.classed('highlight', false), 1800);
        }
      }

      function search(termRaw: string) {
        const term = (termRaw || '').trim().toLowerCase();
        if (!term) {
          searchStatus.text('');
          return;
        }

        let node = aisles.find((a: any) => a.name.toLowerCase() === term);

        if (!node) {
          const m = term.match(/^cluster\s*(\d+)$/);
          if (m) {
            node = clusters.find((c: any) => clusterNumber(c) == +m[1]);
          } else {
            const numOnly = term.match(/^(\d+)$/);
            if (numOnly) {
              node = clusters.find((c: any) => clusterNumber(c) == +numOnly[1]);
            }
          }
        }

        if (!node) {
          node = aisles.find((a: any) => a.name.toLowerCase().includes(term));
        }

        let product: any = null;
        if (!node) {
          const allProducts = Object.values(graph.drilldown.cluster_to_products).flat() as any[];
          product = allProducts.find((p: any) => p.name && p.name.toLowerCase().includes(term));
          if (product) {
            node = clusters.find((c: any) => clusterNumber(c) == product.cluster_id);
          }
        }

        if (node) {
          focusNode(node);
          searchStatus.text(
            product
              ? 'Focused product in cluster ' + clusterNumber(node)
              : 'Focused ' + node.type.replace('_', ' ').toLowerCase()
          );
          if (product) {
            openClusterPanel(node);
          }
        } else {
          searchStatus.text('Not found');
        }
      }

      searchInput.on('keydown', (event: any) => {
        if (event.key === 'Enter') {
          search((event.target as HTMLInputElement).value);
        }
      });

      // Drilldown panel logic
      const overlay = d3.select(container).select('#overlay');
      const panelTitle = d3.select(container).select('#panel-title');
      const productsSvg = d3.select(container).select('#products-svg');
      const tooltip = d3.select(container).select('#tooltip');

      d3.select(container).select('#close-btn').on('click', closePanel);

      function parseClusterId(cluster: any) {
        if (cluster.cluster_id !== undefined) return cluster.cluster_id;
        const parts = (cluster.name || '').split(/\s+/);
        const num = +parts[1];
        return isNaN(num) ? cluster.name : num;
      }

      function getClusterBuckets(cluster: any) {
        const cid = parseClusterId(cluster);
        const items = graph.drilldown.cluster_to_products[cid] || graph.drilldown.cluster_to_products[String(cid)] || [];
        return items.filter((item: any) => item.type === 'P1_Bucket');
      }

      function openClusterPanel(cluster: any) {
        clusterNode.classed('highlight', (c: any) => c === cluster);
        const buckets = getClusterBuckets(cluster);
        const aisleNames = cluster.aisle_name || 'Unknown Aisle';
        panelTitle.text(`${cluster.name} – ${aisleNames} – P1 Buckets (${buckets.length})`);
        overlay.style('display', 'flex');
        renderBuckets(buckets, cluster);
      }

      function closePanel() {
        overlay.style('display', 'none');
        productsSvg.selectAll('*').remove();
        clusterNode.classed('highlight', false);
        hideTooltip();
      }

      function renderBuckets(buckets: any[], cluster: any) {
        productsSvg.selectAll('*').remove();
        const panelBody = container.querySelector('#panel-body') as HTMLElement;
        const pw = panelBody.clientWidth;
        const ph = panelBody.clientHeight;
        productsSvg.attr('viewBox', `0 0 ${pw} ${ph}`);

        const list = buckets;
        const productsRoot = productsSvg.append('g').attr('class', 'products-root');

        // Build P1-P1 links: each bucket to its nearest neighbor only
        const p1Links: any[] = [];
        list.forEach((bucket: any) => {
          let nearest: any = null;
          let minDist = Infinity;
          list.forEach((other: any) => {
            if (bucket === other) return;
            const dx = (bucket.x || 0) - (other.x || 0);
            const dy = (bucket.y || 0) - (other.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              nearest = other;
            }
          });
          if (nearest && !p1Links.some(l => 
            (l.source === bucket && l.target === nearest) || 
            (l.source === nearest && l.target === bucket)
          )) {
            p1Links.push({ source: bucket, target: nearest });
          }
        });

        const linkG = productsRoot
          .append('g')
          .attr('class', 'p1-links')
          .selectAll('line')
          .data(p1Links)
          .join('line')
          .attr('stroke', '#4a90e2')
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 2);

        const nodeG = productsRoot
          .append('g')
          .selectAll('g.bucket')
          .data(list, (d: any) => d.id)
          .enter()
          .append('g')
          .attr('class', 'bucket')
          .call(drag as any);

        nodeG
          .append('circle')
          .attr('class', 'bucket-node')
          .attr('r', 22)
          .attr('fill', cluster ? (color(cluster.aisle_name) as string) : '#888')
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
          .style('cursor', 'grab')
          .on('mouseover', (event: any, d: any) => showTooltip(event, d.name))
          .on('mouseout', hideTooltip);

        nodeG
          .append('text')
          .attr('class', 'bucket-label')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', '9px')
          .style('font-weight', '600')
          .style('fill', '#fff')
          .style('pointer-events', 'none')
          .text((_d: any, i: number) => i + 1);

        const sim = d3
          .forceSimulation(list)
          .force('charge', d3.forceManyBody().strength(-30))
          .force('center', d3.forceCenter(pw / 2, ph / 2))
          .force('collision', d3.forceCollide().radius(26))
          .force('link', d3.forceLink(p1Links).distance(80).strength(0.3))
          .on('tick', ticked);

        function ticked() {
          linkG
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);
          nodeG.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        }

        const productsZoom = d3
          .zoom()
          .scaleExtent([0.3, 4])
          .on('zoom', (event: any) => {
            productsRoot.attr('transform', event.transform);
          });
        productsSvg.call(productsZoom as any);

        function drag(simulation: any) {
          function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          }
          function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
          }
          function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }
          return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
        }
      }

      function showTooltip(event: any, text: string) {
        tooltip
          .style('display', 'block')
          .html(text)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY + 10 + 'px');
      }

      function hideTooltip() {
        tooltip.style('display', 'none');
      }

      fitView(false);
      activateGmmLayout();

      if (!clusters.some((c: any) => c.centroid_x !== undefined)) {
        searchStatus.text('GMM layout unavailable: run export_gmm_layout_json.py then refresh.');
      }
      
      // Populate cluster dropdown
      const clusterSelect = container.querySelector('#cluster-filter') as HTMLSelectElement;
      if (clusterSelect) {
        clusters
          .map((c: any) => ({ id: clusterNumber(c), name: c.name, aisle: c.aisle_name }))
          .sort((a: any, b: any) => a.id - b.id)
          .forEach((c: any) => {
            const option = document.createElement('option');
            option.value = c.id;
            option.text = `${c.name} (${c.aisle})`;
            clusterSelect.appendChild(option);
          });
      }
    }

    // Cleanup
    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#f8f9fa' }}>
      {/* UI Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: '#212529',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '0 24px',
          fontFamily: 'system-ui, Arial, sans-serif',
          zIndex: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '320px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', letterSpacing: '.5px', lineHeight: '1.2' }}>
            Product Substitution – GMM Layout
          </div>
          <div style={{ fontSize: '11px', color: '#adb5bd', fontWeight: '400', lineHeight: '1.3' }}>
            Click clusters to view P1 buckets with nearest-neighbor links
          </div>
        </div>
        <input
          id="search-input"
          type="text"
          placeholder="Search aisle / cluster / product"
          style={{
            flex: 1,
            maxWidth: '280px',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #555',
            background: '#343a40',
            color: '#fff',
            fontSize: '14px',
          }}
        />
        <select
          id="cluster-filter"
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #555',
            background: '#343a40',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Clusters</option>
        </select>
        <button
          id="fit-btn"
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            border: '1px solid #888',
            borderRadius: '4px',
            background: '#fff',
            color: '#222',
            cursor: 'pointer',
          }}
        >
          Fit View
        </button>
        {onSwitchLayout && (
          <button
            onClick={() => onSwitchLayout('hierarchical')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              border: '1px solid #198754',
              borderRadius: '4px',
              background: '#198754',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Hierarchical Layout
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            border: '1px solid #888',
            borderRadius: '4px',
            background: '#dc3545',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
        <div id="search-status" style={{ minWidth: '160px', fontSize: '13px', color: '#adb5bd' }}></div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          background: '#f8f9fa',
          marginTop: '70px',
        }}
      />

      {/* Drilldown Overlay */}
      <div
        id="overlay"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          id="panel"
          style={{
            width: '90%',
            maxWidth: '1100px',
            height: '80%',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            id="panel-header"
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e2e2',
              background: '#fafafa',
            }}
          >
            <div id="panel-title" style={{ fontSize: '16px', fontWeight: '600' }}>
              Cluster
            </div>
            <button
              id="close-btn"
              style={{
                background: '#dc3545',
                border: 'none',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
          <div id="panel-body" style={{ flex: 1, position: 'relative' }}>
            <svg id="products-svg" style={{ width: '100%', height: '100%', background: '#fff' }}></svg>
            <div
              id="tooltip"
              className="tooltip"
              style={{
                position: 'absolute',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                padding: '4px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                pointerEvents: 'none',
                display: 'none',
              }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        .highlight { stroke: #d62728 !important; stroke-width: 3px !important; }
      `}</style>
    </div>
  );
}
