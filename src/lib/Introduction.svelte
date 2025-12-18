<script lang="ts">
    import { X } from "lucide-svelte";
    import CobwebDiagram from "./CobwebDiagram.svelte";

    let { onClose }: { onClose: () => void } = $props();
</script>

<svelte:head>
    <link
        href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div class="intro-container">
    <header>
        <div class="header-content">
            <h2>The Edge of Chaos</h2>
            <p class="subtitle">
                How a simple equation creates an infinite universe.
            </p>
        </div>
        <button class="close-btn" onclick={onClose} aria-label="Close">
            <X size={24} />
        </button>
    </header>

    <div class="content opacity-90">
        <section class="story-section">
            <p class="lead">
                Welcome to <span class="brand"
                    >Logic<span class="highlight">Map</span></span
                >. You are about to explore one of the most famous shapes in
                mathematics: the Logistic Map.
            </p>
            <p>
                Imagine you are an ecologist studying a population of rabbits in
                a closed field. Every year, the population changes based on a
                simple balance:
                <strong>births</strong> (rabbits breeding) vs
                <strong>limits</strong> (running out of food).
            </p>
            <p>
                In 1976, biologist Robert May discovered that this simple
                balance doesn't just settle down—it can create infinite
                complexity.
            </p>

            <div class="math-block">
                x<sub>n+1</sub> = r · x<sub>n</sub> · (1 - x<sub>n</sub>)
            </div>

            <div class="variable-explanation">
                <div class="var">
                    <span class="symbol">x<sub>n</sub></span>
                    <span class="desc">Current Population (0% to 100%)</span>
                </div>
                <div class="var">
                    <span class="symbol">r</span>
                    <span class="desc">Growth Rate (The "Knob")</span>
                </div>
            </div>

            <section class="examples-section">
                <h4>Let's try a number!</h4>
                <p>
                    Suppose the growth rate <span class="highlight"
                        >r = 2.0</span
                    >
                    and we start with
                    <span class="highlight">50%</span> of the max population (<em
                        >x</em
                    > = 0.5).
                </p>
                <div class="calc-box">
                    <div class="step">
                        <span class="step-label">Year 1</span>
                        <span class="step-math"
                            >2.0 · 0.5 · (1 - 0.5) = <strong>0.5</strong></span
                        >
                    </div>
                </div>
                <p>
                    It stays at 0.5 forever. Perfect balance. But what if we
                    turn the knob up to <span class="highlight">r = 3.2</span>?
                </p>
                <div class="calc-box">
                    <div class="step">
                        <span class="step-label">Year 1</span>
                        <span class="step-math"
                            >3.2 · 0.50 · 0.50 = <strong>0.80</strong></span
                        >
                    </div>
                    <div class="step">
                        <span class="step-label">Year 2</span>
                        <span class="step-math"
                            >3.2 · 0.80 · 0.20 = <strong>0.512</strong></span
                        >
                    </div>
                    <div class="step">
                        <span class="step-label">Year 3</span>
                        <span class="step-math"
                            >3.2 · 0.51 · 0.49 = <strong>0.799...</strong></span
                        >
                    </div>
                </div>
                <p class="calc-note">
                    See how it bounces? Start with <strong>0.5</strong>, jump to
                    <strong>0.8</strong>, back down to <strong>0.51</strong>, up
                    to <strong>0.79</strong>... it's oscillating!
                </p>
            </section>

            <p>
                The math is incredibly simple. You take the current population (<em
                    >x</em
                >), multiply it by the growth rate (<em>r</em>), and then limit
                it by the remaining space (<em>1-x</em>). That gives you next
                year's population. Then you do it again. And again. Forever.
            </p>
        </section>

        <section class="visual-section">
            <h3>Visualizing the Chaos</h3>
            <p>
                What happens when we turn the "Growth Rate" knob (<em>r</em>)?
            </p>
            <p>
                <strong>At low rates (r &lt; 3.0)</strong>, nature is
                predictable. The population settles at a perfect, stable number
                and stays there. Stability.
            </p>
            <p>
                <strong>At higher rates (r > 3.0)</strong>, the stability
                breaks. The population splits into two alternating values (High,
                Low, High, Low...). This is called a <em>Bifurcation</em>. Turn
                the knob more, and it splits again: 4 values, then 8, then 16...
            </p>

            <CobwebDiagram />

            <div class="deep-dive">
                <h4>Universality & The Butterfly Effect</h4>
                <p>
                    By the time <em>r</em> reaches <strong>3.57</strong>, the
                    cycle period becomes infinite. This is the onset of
                    <strong>Chaos</strong>.
                </p>
                <p>
                    In the chaotic zone, the population jumps wildly. It never
                    repeats. Even worse (or better!), it becomes sensitive to
                    the tiniest change. If you change the starting number by
                    0.000000001, the entire future history changes completely.
                    This is the "Butterfly Effect".
                </p>
                <p>
                    Amazingly, this same structure—period doubling into
                    chaos—appears everywhere in nature: in dripping taps, in the
                    beating of the human heart, and in the convection currents
                    of the atmosphere. It is a universal law of nonlinear
                    systems.
                </p>
            </div>

            <p>
                The map you are about to explore is a drawing of this entire
                journey. It plots the history of every possible population for
                every possible growth rate at once.
            </p>

            <div class="map-explanation">
                <h3>
                    How to read <span class="brand"
                        >Logic<span class="highlight">Map</span></span
                    >
                </h3>
                <p>
                    When you close this guide, you will see a giant ghostly
                    tree.
                </p>
                <ul>
                    <li>
                        <strong>Horizontal (X-Axis)</strong>: This represents
                        <em>r</em> (Growth Rate). The further right you go, the "harder"
                        life gets for the rabbits.
                    </li>
                    <li>
                        <strong>Vertical (Y-Axis)</strong>: This represents the
                        stable population sizes (<em>x</em>).
                    </li>
                    <li>
                        <strong>Splits</strong>: When a line splits in two, it
                        means the population is alternating between two sizes
                        (boom and bust).
                    </li>
                    <li>
                        <strong>Clouds</strong>: The foggy areas are chaos. No
                        pattern. Total unpredictability.
                    </li>
                </ul>
            </div>
        </section>
    </div>

    <footer>
        <button class="primary" onclick={onClose}>Back</button>
    </footer>
</div>

<style>
    .intro-container {
        width: 100%;
        color: var(--text-main);
        padding: 1rem;
        max-width: 1000px;
        margin: 0 auto;
    }

    @media (min-width: 768px) {
        .intro-container {
            padding: 2.5rem;
        }
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
    }

    h2 {
        font-size: 2.25rem;
        font-weight: 800;
        margin-bottom: 0.25rem;
        background: linear-gradient(135deg, white 0%, #38bdf8 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.05em;
    }

    h3 {
        font-size: 1.5rem;
        color: #38bdf8;
        margin: 1.5rem 0 0.75rem 0;
        font-family: "Patrick Hand", cursive;
    }

    h4 {
        color: #f472b6; /* Pink */
        margin-bottom: 0.25rem;
        font-size: 1.1rem;
    }

    .brand {
        font-weight: 800;
        letter-spacing: -0.05em;
    }
    .highlight {
        color: #38bdf8;
    }

    .subtitle {
        color: var(--text-dim);
        font-size: 1.1rem;
        font-weight: 300;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-size: 1rem;
        line-height: 1.6;
    }

    .lead {
        font-size: 1.1rem;
        font-weight: 400;
        color: white;
    }

    /* Cute Math Styling */
    .math-block {
        background: rgba(255, 255, 255, 0.03);
        padding: 1rem;
        border-radius: 16px;
        text-align: center;
        font-family: "Patrick Hand", cursive; /* Cute font */
        font-size: 2rem;
        margin: 1.5rem 0;
        border: 2px dashed rgba(255, 255, 255, 0.1);
        color: #fca5a5; /* Soft red/pink */
        transform: rotate(-1deg);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .variable-explanation {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 0.5rem;
    }

    .var {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
    }

    .symbol {
        font-family: "Patrick Hand", cursive;
        font-size: 1.25rem;
        color: #38bdf8;
    }

    .desc {
        font-size: 0.85rem;
        color: var(--text-dim);
    }

    .examples-section {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 0.5rem 0;
    }

    .calc-box {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
        margin: 0.75rem 0;
        font-family: monospace;
    }

    .step {
        display: flex;
        gap: 1rem;
    }

    .step-label {
        color: #94a3b8;
        min-width: 60px;
    }

    .step-math {
        color: #e2e8f0;
    }

    .calc-note {
        font-size: 0.9rem;
        color: var(--text-dim);
        font-style: italic;
    }

    .deep-dive {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 1.25rem;
        margin: 1rem 0;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .map-explanation {
        background: rgba(56, 189, 248, 0.1);
        padding: 1.25rem;
        border-radius: 12px;
        border-left: 4px solid #38bdf8;
    }

    .map-explanation ul {
        margin: 0;
        padding-left: 1.2rem;
    }

    .map-explanation li {
        margin-bottom: 0.25rem;
    }

    footer {
        margin-top: 3rem;
        text-align: center;
    }

    button.primary {
        background: #0ea5e9; /* Sky 500 */
        color: white;
        font-weight: 700;
        padding: 0.75rem 2.5rem;
        font-size: 1.1rem;
        border-radius: 50px;
        border: none;
        transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);
    }

    button.primary:hover {
        transform: scale(1.05);
        background: #0284c7; /* Sky 600 */
        box-shadow: 0 6px 25px rgba(14, 165, 233, 0.5);
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-dim);
        padding: 0.25rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    .close-btn:hover {
        opacity: 1;
        color: white;
    }

    strong {
        color: #38bdf8;
    }
</style>
