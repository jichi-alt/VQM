/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Space Diary 色彩系统
        space: {
          950: "#0a0a0f",    // 深空黑
          900: "#0d0d12",    // 主背景
          850: "#12121a",    // 卡片背景
          800: "#1a1a24",    // 次要背景
          700: "#272732",    // 边框
        },
        amber: {
          400: "#fbbf24",    // 琥珀色（记忆碎片）
          500: "#f59e0b",
        },
        cyan: {
          400: "#22d3ee",    // 青色（科技元素）
        },
        rust: {
          400: "#a8763e",    // 锈色
          500: "#8b5a2b",
        },
        // 保留原有颜色
        primary: "#fbbd23",
        "background-light": "#f4f4f5",
        "background-dark": "#18181b",
        "surface-dark": "#27272a",
        "border-dark": "#27272a",
        receipt: "#e8e6df",
      },
      fontFamily: {
        display: ["Space Grotesk", "Noto Sans SC", "sans-serif"],
        body: ["Noto Sans SC", "sans-serif"],
        mono: ["Space Grotesk", "monospace"],
      },
      boxShadow: {
        hard: "4px 4px 0px 0px #27272a",
        "hard-sm": "2px 2px 0px 0px #27272a",
      },
      backgroundImage: {
        striped:
          "repeating-linear-gradient(45deg, #27272a 0, #27272a 1px, transparent 0, transparent 50%)",
        "hazard-stripe":
          "repeating-linear-gradient(45deg, #fbbd23, #fbbd23 10px, #000 10px, #000 20px)",
      },
      animation: {
        scan: "scan 10s linear infinite",
        "slide-in": "slideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shake: "shake 0.1s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "star-twinkle": "starTwinkle 3s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        typewriter: "typewriter 0.5s steps(1) infinite",
        "float-gentle": "floatGentle 6s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100vh" },
        },
        slideIn: {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(-2px, 2px) rotate(-1deg)" },
          "50%": { transform: "translate(2px, -2px) rotate(1deg)" },
          "75%": { transform: "translate(-2px, -2px) rotate(-1deg)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        floatGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}
