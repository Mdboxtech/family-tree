import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { usePage } from '@inertiajs/react';
import { TreeNode } from '@/types/family';
import { GENDER_COLORS, ROOT_RING_COLOR, getInitials, formatLifespan, isDeceased } from '@/lib/tree-utils';
import MemberPanel from './MemberPanel';

interface FamilyTreeProps {
    className?: string;
}

export default function FamilyTree({ className }: FamilyTreeProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const { settings } = usePage().props as any;
    const themeColor = settings?.theme_color || '#d4a843';
    const bgImage = settings?.background_image;

    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
    const [currentRootId, setCurrentRootId] = useState<number | null>(null);

    // Refs for D3 objects
    const rootRef = useRef<any>(null);
    const updateRef = useRef<((source: any) => void) | null>(null);

    // Fetch hierarchy data
    useEffect(() => {
        setLoading(true);
        const url = currentRootId ? `/api/tree/hierarchy?root_id=${currentRootId}` : '/api/tree/hierarchy';
        fetch(url)
            .then((res) => res.json())
            .then((data: TreeNode) => {
                setTreeData(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [currentRootId]);

    // Handle node click
    const handleNodeClick = useCallback((nodeId: number) => {
        setSelectedMemberId(nodeId);
        setPanelOpen(true);

        fetch(`/api/member/${nodeId}/relatives`)
            .then((res) => res.json())
            .then((data) => {
                const ids = new Set<number>();
                ids.add(nodeId);
                data.parents?.forEach((p: { id: number }) => ids.add(p.id));
                data.spouses?.forEach((s: { id: number }) => ids.add(s.id));
                data.children?.forEach((c: { id: number }) => ids.add(c.id));
                data.siblings?.forEach((s: { id: number }) => ids.add(s.id));
                setHighlightedIds(ids);
            });
    }, []);

    const handlePanelClose = useCallback(() => {
        setPanelOpen(false);
        setHighlightedIds(new Set());
    }, []);

    const handleNavigate = useCallback((id: number) => {
        handleNodeClick(id);
    }, [handleNodeClick]);

    const handleFocusTree = useCallback((id: number) => {
        setCurrentRootId(id);
        setPanelOpen(false);
        setHighlightedIds(new Set());
    }, []);

    // Render D3 Collapsible Tree
    useEffect(() => {
        if (!treeData || (Array.isArray(treeData) && treeData.length === 0) || !treeData.id || !svgRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const width = containerRect.width;
        const height = containerRect.height;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        svg.attr('width', width).attr('height', height);

        const g = svg.append('g');

        // Setup Defs for Image clipping
        const defs = svg.append('defs');
        defs.append('clipPath').attr('id', 'clip-root').append('circle').attr('r', 32);
        defs.append('clipPath').attr('id', 'clip-member').append('circle').attr('r', 26);

        // Setup Zoom
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.15, 3])
            .on('zoom', (event) => g.attr('transform', event.transform.toString()));
        svg.call(zoom);
        zoomRef.current = zoom;

        let i = 0;
        const duration = 500;

        // Create Hierarchy
        const root = d3.hierarchy<any>(treeData, (d) => d.children) as any;
        
        // Initial position
        root.x0 = 0;
        root.y0 = 0;

        // Initialize state (Collapse nodes > depth 1)
        root.descendants().forEach((d: any) => {
            d.id = d.data.id || ++i;
            d._children = d.children;
            if (d.depth > 0 && d.children) {
                d.children = null;
            }
        });

        const treeLayout = d3.tree<any>()
            .nodeSize([180, 240]) // Horizontal, Vertical spacing
            .separation((a, b) => {
                const aSpouses = a.data.spouses?.length || 0;
                const bSpouses = b.data.spouses?.length || 0;
                // Add 0.55 units (approx 100px) of space per spouse to prevent overlap with ANY adjacent sibling
                return (a.parent === b.parent ? 1 : 1.5) + ((aSpouses + bSpouses) * 0.55);
            });

        const linkGenerator = d3.linkVertical<any, any>().x((d) => d.x).y((d) => d.y);

        function update(source: any) {
            const treeNodes = treeLayout(root);
            const nodes = treeNodes.descendants();
            const links = treeNodes.links();

            const transition = d3.transition().duration(duration) as any;

            // ─── Draw Links ──────────────────────────────────────────────
            const linkSelection = g.selectAll('.link').data(links, (d: any) => d.target.id);

            const linkEnter = linkSelection.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('fill', 'none')
                .attr('stroke', 'rgba(255,255,255,0.12)')
                .attr('stroke-width', 1.5)
                .attr('d', () => {
                    const o = { x: source.x0, y: source.y0 };
                    return linkGenerator({ source: o, target: o } as any);
                });

            linkSelection.merge(linkEnter as any).transition(transition)
                .attr('d', (d: any) => linkGenerator(d));

            linkSelection.exit().transition(transition)
                .attr('d', () => {
                    const o = { x: source.x, y: source.y };
                    return linkGenerator({ source: o, target: o } as any);
                })
                .remove();

            // ─── Draw Main Nodes ─────────────────────────────────────────
            const nodeSelection = g.selectAll('.node-group').data(nodes, (d: any) => d.id);

            const nodeEnter = nodeSelection.enter().append('g')
                .attr('class', (d: any) => `node-group node-${d.data.id}`)
                .attr('transform', () => `translate(${source.x0}, ${source.y0})`);

            // Spouses (appended inside the node group so they move together)
            nodeEnter.each(function(d: any) {
                const nodeGroup = d3.select(this);
                if (d.data.spouses && d.data.spouses.length > 0) {
                    d.data.spouses.forEach((spouse: any, index: number) => {
                        const offset = (index + 1) * 90;
                        const prevOffset = index * 90;
                        
                        // Connector Line
                        nodeGroup.append('line')
                            .attr('class', 'spouse-link')
                            .attr('x1', prevOffset).attr('y1', 0).attr('x2', offset).attr('y2', 0)
                            .attr('stroke', 'rgba(212, 168, 67, 0.3)')
                            .attr('stroke-width', 1.5)
                            .attr('stroke-dasharray', '6 4');
                            
                        // Heart Icon
                        nodeGroup.append('text')
                            .attr('class', 'spouse-heart')
                            .attr('x', prevOffset + 45)
                            .attr('y', -8)
                            .attr('text-anchor', 'middle')
                            .attr('font-size', '10px')
                            .attr('fill', themeColor)
                            .text('♥');

                        // Spouse Group
                        const spouseG = nodeGroup.append('g')
                            .attr('class', 'spouse-node')
                            .attr('transform', `translate(${offset}, 0)`)
                            .style('cursor', 'pointer')
                            .on('click', (event) => {
                                event.stopPropagation(); // Prevent main node click
                                handleNodeClick(spouse.id);
                            });

                        const colors = GENDER_COLORS[spouse.gender as keyof typeof GENDER_COLORS] || GENDER_COLORS.other;

                        spouseG.append('circle')
                            .attr('r', 26)
                            .attr('fill', colors.bg)
                            .attr('stroke', colors.border)
                            .attr('stroke-width', 2)
                            .attr('stroke-dasharray', isDeceased(spouse.death_year) ? '4 2' : 'none')
                            .attr('opacity', isDeceased(spouse.death_year) ? 0.6 : 1);

                        if (spouse.photo_url) {
                            spouseG.append('image')
                                .attr('href', spouse.photo_url)
                                .attr('x', -26)
                                .attr('y', -26)
                                .attr('width', 52)
                                .attr('height', 52)
                                .attr('clip-path', 'url(#clip-member)')
                                .attr('preserveAspectRatio', 'xMidYMid slice')
                                .attr('opacity', isDeceased(spouse.death_year) ? 0.6 : 1);
                        } else {
                            spouseG.append('text')
                                .attr('text-anchor', 'middle')
                                .attr('dy', '0.35em')
                                .attr('fill', colors.text)
                                .attr('font-size', '12px')
                                .attr('font-weight', '700')
                                .attr('font-family', "'DM Sans', sans-serif")
                                .text(getInitials(spouse.name.split(' ')[0], spouse.name.split(' ').slice(-1)[0]));
                        }

                        // Drill-down Plus Icon
                        if (spouse.has_children) {
                            spouseG.append('circle')
                                .attr('cy', 26)
                                .attr('r', 8)
                                .attr('fill', '#0f1117')
                                .attr('stroke', themeColor)
                                .attr('stroke-width', 1.5)
                                .on('click', (event) => {
                                    event.stopPropagation();
                                    handleFocusTree(spouse.id);
                                });

                            spouseG.append('text')
                                .attr('y', 26)
                                .attr('dy', '0.3em')
                                .attr('text-anchor', 'middle')
                                .attr('fill', themeColor)
                                .attr('font-size', '12px')
                                .attr('font-weight', 'bold')
                                .style('pointer-events', 'none')
                                .text('+');
                        }

                        spouseG.append('text')
                            .attr('text-anchor', 'middle')
                            .attr('dy', 44)
                            .attr('fill', 'rgba(255,255,255,0.7)')
                            .attr('font-size', '11px')
                            .attr('font-family', "'Cormorant Garamond', serif")
                            .attr('font-weight', '600')
                            .text(spouse.name);
                    });
                }
            });

            // Main Member Group
            const mainMember = nodeEnter.append('g')
                .attr('class', 'main-member')
                .style('cursor', 'pointer')
                .on('click', (event, d: any) => {
                    // Toggle children
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                    }
                    update(d);
                    handleNodeClick(d.data.id);
                });

            // Glow for Root
            mainMember.append('circle')
                .attr('class', 'root-glow')
                .attr('r', (d: any) => d.data.is_root ? 38 : 32)
                .attr('fill', 'none')
                .attr('stroke', (d: any) => d.data.is_root ? ROOT_RING_COLOR : 'transparent')
                .attr('stroke-width', (d: any) => d.data.is_root ? 2 : 0)
                .attr('opacity', 0.3)
                .attr('filter', (d: any) => d.data.is_root ? 'blur(4px)' : 'none');

            // Circle
            mainMember.append('circle')
                .attr('class', 'main-circle')
                .attr('r', (d: any) => d.data.is_root ? 32 : 26)
                .attr('fill', (d: any) => (GENDER_COLORS[d.data.gender as keyof typeof GENDER_COLORS] || GENDER_COLORS.other).bg)
                .attr('stroke', (d: any) => d.data.is_root ? ROOT_RING_COLOR : (GENDER_COLORS[d.data.gender as keyof typeof GENDER_COLORS] || GENDER_COLORS.other).border)
                .attr('stroke-width', (d: any) => d.data.is_root ? 3 : 2)
                .attr('stroke-dasharray', (d: any) => isDeceased(d.data.death_year) ? '4 2' : 'none')
                .attr('opacity', (d: any) => isDeceased(d.data.death_year) ? 0.7 : 1);

            // Expand/Collapse Indicator
            mainMember.filter((d: any) => d._children && d._children.length > 0)
                .append('circle')
                .attr('class', 'expand-indicator-bg')
                .attr('cx', 0)
                .attr('cy', (d: any) => d.data.is_root ? 30 : 24)
                .attr('r', 8)
                .attr('fill', '#1a1d27')
                .attr('stroke', (d: any) => d.data.is_root ? ROOT_RING_COLOR : (GENDER_COLORS[d.data.gender as keyof typeof GENDER_COLORS] || GENDER_COLORS.other).border)
                .attr('stroke-width', 1.5);

            mainMember.filter((d: any) => d._children && d._children.length > 0)
                .append('text')
                .attr('class', 'expand-indicator-text')
                .attr('x', 0)
                .attr('y', (d: any) => d.data.is_root ? 34 : 28)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .text((d: any) => d.children ? '-' : '+');

            // Initials (if no photo)
            mainMember.filter((d: any) => !d.data.photo_url)
                .append('text')
                .attr('class', 'initials')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', (d: any) => (GENDER_COLORS[d.data.gender as keyof typeof GENDER_COLORS] || GENDER_COLORS.other).text)
                .attr('font-size', (d: any) => d.data.is_root ? '14px' : '12px')
                .attr('font-weight', '700')
                .attr('font-family', "'DM Sans', sans-serif")
                .text((d: any) => getInitials(d.data.first_name || d.data.name.split(' ')[0], d.data.last_name || d.data.name.split(' ').slice(-1)[0]));

            // Photo (if available)
            mainMember.filter((d: any) => d.data.photo_url)
                .append('image')
                .attr('class', 'photo')
                .attr('href', (d: any) => d.data.photo_url)
                .attr('x', (d: any) => d.data.is_root ? -32 : -26)
                .attr('y', (d: any) => d.data.is_root ? -32 : -26)
                .attr('width', (d: any) => d.data.is_root ? 64 : 52)
                .attr('height', (d: any) => d.data.is_root ? 64 : 52)
                .attr('clip-path', (d: any) => d.data.is_root ? 'url(#clip-root)' : 'url(#clip-member)')
                .attr('preserveAspectRatio', 'xMidYMid slice')
                .attr('opacity', (d: any) => isDeceased(d.data.death_year) ? 0.7 : 1);

            // Name Label
            mainMember.append('text')
                .attr('class', 'name-label')
                .attr('text-anchor', 'middle')
                .attr('dy', (d: any) => d.data.is_root ? 55 : 48)
                .attr('fill', 'rgba(255,255,255,0.8)')
                .attr('font-size', '12px')
                .attr('font-family', "'Cormorant Garamond', serif")
                .attr('font-weight', '600')
                .text((d: any) => d.data.name);

            // Lifespan Label
            mainMember.append('text')
                .attr('class', 'lifespan-label')
                .attr('text-anchor', 'middle')
                .attr('dy', (d: any) => d.data.is_root ? 69 : 62)
                .attr('fill', 'rgba(255,255,255,0.3)')
                .attr('font-size', '9px')
                .attr('font-family', "'DM Sans', sans-serif")
                .text((d: any) => formatLifespan(d.data.birth_year, d.data.death_year));

            // Hover effects
            mainMember
                .on('mouseenter', function () {
                    d3.select(this).select('.main-circle').transition().duration(200).attr('stroke-width', 4);
                })
                .on('mouseleave', function (event, d: any) {
                    d3.select(this).select('.main-circle').transition().duration(200).attr('stroke-width', d.data.is_root ? 3 : 2);
                });

            // Update existing nodes (positions + indicator)
            const nodeUpdate = nodeSelection.merge(nodeEnter as any).transition(transition)
                .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

            nodeUpdate.select('.expand-indicator-text')
                .text((d: any) => d.children ? '-' : '+');

            // Exit nodes
            nodeSelection.exit().transition(transition)
                .attr('transform', () => `translate(${source.x}, ${source.y})`)
                .style('opacity', 0)
                .remove();

            // Save old positions for transitions
            nodes.forEach((d: any) => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Initialize display
        rootRef.current = root;
        updateRef.current = update;
        update(root);

        // Center on root initially
        setTimeout(() => {
            const scale = 0.85;
            // The tree nodeSize centers at x=0, and root is at depth=0 -> y=0.
            const tx = width / 2;
            const ty = height / 4; 
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        }, 100);

    }, [treeData, handleNodeClick]);

    // Highlighting & Search logic stays similar, but targets .node-group, .main-member, .spouse-node
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        const filterActive = highlightedIds.size > 0 || (searchQuery && searchQuery.length > 0);

        if (!filterActive) {
            svg.selectAll('.main-member').style('opacity', '1').style('filter', 'none');
            svg.selectAll('.spouse-node').style('opacity', '1').style('filter', 'none');
            return;
        }

        const query = searchQuery.toLowerCase();

        // 1. Auto-expand hidden nodes that match the search query
        if (query && rootRef.current && updateRef.current) {
            let changed = false;

            const expandParents = (node: any) => {
                if (node.parent) {
                    if (!node.parent.children && node.parent._children) {
                        node.parent.children = node.parent._children;
                        changed = true;
                    }
                    expandParents(node.parent);
                }
            };

            const searchNode = (node: any) => {
                let match = node.data.name.toLowerCase().includes(query);
                if (node.data.spouses) {
                    for (const s of node.data.spouses) {
                        if (s.name.toLowerCase().includes(query)) match = true;
                    }
                }
                if (match) {
                    expandParents(node);
                }
                
                const childrenToSearch = node._children || node.children;
                if (childrenToSearch) {
                    childrenToSearch.forEach(searchNode);
                }
            };

            searchNode(rootRef.current);

            if (changed) {
                updateRef.current(rootRef.current);
            }
        }

        // 2. Apply Visual Highlighting to DOM
        svg.selectAll('.node-group').each(function () {
            const nodeGroup = d3.select(this);
            const d = nodeGroup.datum() as any;
            if (!d) return;

            // Check main member
            const mainMatch = (highlightedIds.size > 0 && highlightedIds.has(d.data.id)) || 
                              (searchQuery && d.data.name.toLowerCase().includes(query));
            
            nodeGroup.select('.main-member')
                .style('opacity', mainMatch ? '1' : '0.15')
                .style('filter', mainMatch ? 'none' : 'grayscale(80%) brightness(0.4)');

            // Check spouses
            if (d.data.spouses) {
                nodeGroup.selectAll('.spouse-node').each(function(spouseD, i) {
                    const spouseNode = d3.select(this);
                    const spouse: any = d.data.spouses[i];
                    
                    const spouseMatch = (highlightedIds.size > 0 && highlightedIds.has(spouse.id)) || 
                                        (searchQuery && spouse.name.toLowerCase().includes(query));
                    
                    spouseNode
                        .style('opacity', spouseMatch ? '1' : '0.15')
                        .style('filter', spouseMatch ? 'none' : 'grayscale(80%) brightness(0.4)');
                });
            }
        });
    }, [highlightedIds, searchQuery, panelOpen]);

    const zoomIn = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3); };
    const zoomOut = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7); };
    const resetZoom = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity); };
    const fitToScreen = () => {
        if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
        const svg = d3.select(svgRef.current);
        const g = svg.select<SVGGElement>('g');
        const bounds = g.node()?.getBBox();
        const containerRect = containerRef.current.getBoundingClientRect();
        if (bounds) {
            const scale = Math.min(containerRect.width / (bounds.width + 200), containerRect.height / (bounds.height + 200), 1) * 0.85;
            const tx = (containerRect.width - bounds.width * scale) / 2 - bounds.x * scale;
            const ty = (containerRect.height - bounds.height * scale) / 2 - bounds.y * scale;
            svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        }
    };

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className || ''}`} style={{ background: '#0f1117' }}>
            {/* Background image or noise texture */}
            {bgImage ? (
                <div className="absolute inset-0 opacity-40 pointer-events-none bg-cover bg-center bg-no-repeat"
                     style={{ backgroundImage: `url(${bgImage})` }}
                />
            ) : (
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                     style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(30, 58, 95, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 34, 82, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(212, 168, 67, 0.05) 0%, transparent 50%)' }}
                />
            )}

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: themeColor, borderTopColor: 'transparent' }} />
                        <span className="text-sm font-medium" style={{ color: themeColor }}>Loading family tree...</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && (!treeData || (Array.isArray(treeData) && treeData.length === 0) || !treeData.id) && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `rgba(${parseInt(themeColor.slice(1,3),16)}, ${parseInt(themeColor.slice(3,5),16)}, ${parseInt(themeColor.slice(5,7),16)}, 0.1)` }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: themeColor, fontFamily: "'Cormorant Garamond', serif" }}>
                            No Family Members Yet
                        </h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Add members through the admin panel to start building your tree.
                        </p>
                    </div>
                </div>
            )}

            {/* Reset Focus Button */}
            {currentRootId !== null && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
                    <button
                        onClick={() => setCurrentRootId(null)}
                        className="glass px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                        style={{ color: '#0f1117', background: themeColor }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Reset to Main Family
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="absolute top-4 left-4 z-30">
                <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ width: '280px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search family members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full placeholder-white/30" style={{ color: 'rgba(255,255,255,0.8)' }} />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
                {[
                    { label: '+', action: zoomIn, title: 'Zoom In' },
                    { label: '−', action: zoomOut, title: 'Zoom Out' },
                    { label: '⟲', action: resetZoom, title: 'Reset' },
                    { label: '⊞', action: fitToScreen, title: 'Fit to Screen' },
                ].map((btn) => (
                    <button key={btn.title} onClick={btn.action} title={btn.title} className="glass w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200 hover:scale-105" style={{ color: themeColor }} onMouseEnter={(e) => (e.currentTarget.style.background = `rgba(${parseInt(themeColor.slice(1,3),16)}, ${parseInt(themeColor.slice(3,5),16)}, ${parseInt(themeColor.slice(5,7),16)}, 0.15)`)} onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* SVG Canvas */}
            <svg ref={svgRef} className="w-full h-full" />

            {/* Member Panel */}
            <MemberPanel 
                memberId={selectedMemberId} 
                isOpen={panelOpen} 
                onClose={handlePanelClose} 
                onNavigate={handleNavigate} 
                onFocusTree={handleFocusTree}
            />
        </div>
    );
}
