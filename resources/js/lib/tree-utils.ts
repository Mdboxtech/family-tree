import * as d3 from 'd3';
import { TreeNode } from '@/types/family';

/**
 * Gender-based node colors.
 */
export const GENDER_COLORS = {
    male: { border: '#1e3a5f', bg: 'rgba(30, 58, 95, 0.3)', text: '#7eb8f0' },
    female: { border: '#8b2252', bg: 'rgba(139, 34, 82, 0.3)', text: '#e88bc0' },
    other: { border: '#6b5b95', bg: 'rgba(107, 91, 149, 0.3)', text: '#b8a9d9' },
};

export const ROOT_RING_COLOR = '#d4a843';
export const NODE_SIZE = 52;
export const ROOT_NODE_SIZE = 64;

/**
 * Get initials from a name.
 */
export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format a year for display.
 */
export function formatYear(year?: number | null): string {
    return year ? String(year) : '?';
}

/**
 * Format birth/death for display.
 */
export function formatLifespan(birthYear?: number | null, deathYear?: number | null): string {
    if (!birthYear && !deathYear) return '';
    if (birthYear && !deathYear) return `b. ${birthYear}`;
    if (birthYear && deathYear) return `${birthYear} – ${deathYear}`;
    return '';
}

/**
 * Check if a member is deceased.
 */
export function isDeceased(deathYear?: number | null): boolean {
    return deathYear !== null && deathYear !== undefined;
}

/**
 * Create a D3 hierarchy from tree data.
 */
export function createHierarchy(data: TreeNode): d3.HierarchyNode<TreeNode> {
    return d3.hierarchy<TreeNode>(data, (d) => d.children);
}

/**
 * Calculate tree layout dimensions based on number of nodes.
 */
export function calculateTreeDimensions(nodeCount: number): { width: number; height: number } {
    const width = Math.max(800, nodeCount * 120);
    const height = Math.max(600, Math.ceil(Math.log2(nodeCount + 1)) * 220);
    return { width, height };
}

/**
 * Generate a curved link path for parent-child connections.
 */
export function generateLinkPath(
    source: { x: number; y: number },
    target: { x: number; y: number }
): string {
    const midY = (source.y + target.y) / 2;
    return `M${source.x},${source.y} C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y}`;
}

/**
 * Generate a horizontal dashed line path for spouse connections.
 */
export function generateSpouseLinkPath(
    source: { x: number; y: number },
    target: { x: number; y: number }
): string {
    return `M${source.x},${source.y} L${target.x},${target.y}`;
}

/**
 * Debounce function for search.
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
