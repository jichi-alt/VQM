import type { ArchiveItem } from './src/types';

export const NOISE_BG = "url(https://lh3.googleusercontent.com/aida-public/AB6AXuA7JVUjnFtcriFYjqtYvTegrhC9RaIIhQWX0WMSwdNG3idCEhluS-U0E3OCXaL337YmL5TevFvkVE2_f7e4gAVA6YRTVEqWDA0UJbStLT4V_z66THrduz4f0wZezi3DBcMIEJ_2tbMTSvq1fNmzLcL4r_NF96tnlmc4Vl6y44_9pVZDDef-OsDtMa97Bd-0jFCKqGDZVM4KjIA9-Zsc0mS0O-Gv98fw5mqL-eVODlnw9kDs6xGoVQke4se1bz1HniQqSCR0qXTi0M0)";

export const SVG_DOTS = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjRmNGY1Ii8+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTRlNGU3IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+`;

export const SVG_GRID = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB2aWV3Qm94PSIwIDAgNCA0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoNHY0SDBWMHptMiAyaDJ2MkgyejIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+`;

export const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E`;

export const BARCODE_URL = "https://upload.wikimedia.org/wikipedia/commons/5/5d/UPC-A-036000291452.png";

export const MOCK_ARCHIVE: ArchiveItem[] = [
    { id: '1', date: '2026-01-24', tag: '灵魂深潜', tagIcon: '🌊', question: '自由意志存在吗？或者我们只是复杂的生物算法？', count: 3 },
    { id: '2', date: '2026-01-22', tag: '道德困境', tagIcon: '🔥', question: '电车难题的终极解法是不做选择吗？', count: 12 },
    { id: '3', date: '2026-01-18', tag: '存在主义', tagIcon: '👁️', question: '我是谁？去掉记忆和身体后还剩什么？', count: 1 },
    { id: '4', date: '2026-01-14', tag: '混沌理论', tagIcon: '🌀', question: '蝴蝶效应与宿命论是否矛盾？', count: 7 },
    { id: '5', date: '2026-01-10', tag: '认知科学', tagIcon: '🧠', question: '缸中之脑的可能性有多大？', count: 42 },
];
