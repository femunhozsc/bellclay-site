# Claude Code Skills

A collection of custom [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills that extend Claude's capabilities for frontend development.

## Available Skills

### tailwind-ui-rules

Concrete TailwindCSS UI/UX implementation rules covering shadows, layout alignment, spacing systems, responsive patterns, and interactive states. Complements the official Anthropic `frontend-design` skill with actionable code-level guidance.

**What the Anthropic `frontend-design` skill covers:** Aesthetic direction — tone, typography choices, color philosophy, motion, spatial composition.

**What this skill covers:** Correct TailwindCSS implementation — shadow hierarchy, flush alignment, spacing consistency, responsive patterns, interactive states, and common AI-generated mistakes to avoid.

#### Reference Files

| File | Content |
|------|---------|
| `shadow-and-depth.md` | Shadow hierarchy, dark mode shadows, colored shadows, 3D hover effects, glassmorphism, neumorphism, modern gradients |
| `layout-and-spacing.md` | Container patterns, flex/grid layouts, flush alignment, spacing scale, bento grids, container queries, overflow/shadow clipping |
| `responsive-patterns.md` | Mobile-first patterns, responsive grids, typography scaling, fluid typography with clamp() |
| `interactive-states.md` | Button/input/card/toggle state patterns, focus rings, transitions, skeleton loading, prefers-reduced-motion, advanced card variants |
| `anti-patterns.md` | 12 common AI mistakes with wrong code → correct code examples, dark mode surfaces, motion accessibility |
| `design-system-analysis.md` | Scanning procedure for auto-detecting project design patterns and persisting them to `design-system.md` |

#### Design System Persistence

On first activation in a project, the skill automatically:
1. Scans your codebase for existing TailwindCSS patterns (shadows, colors, spacing, layout, etc.)
2. Generates a `design-system.md` file in the project root
3. Uses those patterns as context in all future sessions

To re-analyze: ask Claude to *"refresh design system"*.

---

### audit-design

A slash command (`/audit-design`) that audits your project's frontend code against the TailwindCSS best practice rules. Produces a structured report with:

- **Critical** issues (accessibility violations)
- **Major** issues (visual inconsistency, missing dark mode, shadow overuse)
- **Minor** issues (missing transitions, suboptimal z-index)
- **What's Good** (positive reinforcement)
- **Suggested Fixes** with copy-pasteable code snippets

```bash
# Audit entire project
/audit-design

# Audit specific file or directory
/audit-design src/components/
```

If a `design-system.md` exists, the audit also checks for **drift** between documented patterns and actual code.

---

### generate-component

A slash command (`/generate-component`) that scaffolds production-ready UI components matching your project's design system. Auto-detects the tech stack (React/TSX, Vue, Svelte, Astro, plain HTML) and applies all design rules.

```bash
/generate-component card                # Standard card with hover, dark mode, focus
/generate-component modal confirmation  # Confirmation dialog variant
/generate-component form horizontal     # Form with horizontal labels
/generate-component table striped       # Data table with striped rows
/generate-component hero                # Hero section
/generate-component nav                 # Navigation bar with mobile menu
```

Every generated component includes: dark mode, hover/focus/disabled states, transitions, responsive layout, accessibility, and motion safety — all matching the `design-system.md` if it exists.

---

### color-palette

A slash command (`/color-palette`) that analyzes, generates, and optimizes your project's color palette with dark mode mapping and WCAG contrast checking.

```bash
/color-palette                    # Analyze current color usage
/color-palette analyze            # Same as above
/color-palette generate           # Generate a new SaaS palette
/color-palette generate warm      # Warm-toned palette
/color-palette generate brand #3B82F6  # Build around a brand color
/color-palette harmonize          # Fix inconsistencies in existing colors
/color-palette export             # Output as Tailwind config / CSS variables
```

Features:
- Detects inconsistent primary colors (e.g., `blue-500` vs `blue-600` used interchangeably)
- Checks all text/bg combos against **WCAG AA** contrast ratios
- Generates complete light + dark mode color mapping
- Exports as `tailwind.config.js` or CSS custom properties
- Can update your `design-system.md` with the optimized palette

## Installation

There are several ways to install these skills in Claude Code:

### Option 1: Register as a Marketplace (recommended)

Add this repository as a plugin marketplace so Claude Code can discover and manage the skills:

```bash
# Inside Claude Code, run:
/plugin marketplace add MarkBenz/claude-code-skills
```

Then install the skill:

```bash
/plugin install claude-code-skills@claude-code-skills
```

To share with your team, install at project scope:

```bash
/plugin install claude-code-skills@claude-code-skills --scope project
```

### Option 2: Settings Configuration

Add the marketplace to your Claude Code settings file (`~/.claude/settings.json` for personal use, or `.claude/settings.json` in your project for team use):

```json
{
  "extraKnownMarketplaces": {
    "MarkBenz-claude-code-skills": {
      "source": {
        "source": "github",
        "repo": "MarkBenz/claude-code-skills"
      }
    }
  },
  "enabledPlugins": {
    "claude-code-skills@claude-code-skills": true
  }
}
```

### Option 3: Local Development / Testing

For temporary use in a single session (e.g., during development):

```bash
# Clone the repo
git clone https://github.com/MarkBenz/claude-code-skills.git

# Run Claude Code with the plugin directory
claude --plugin-dir ./claude-code-skills
```

### Verification

Once installed, the `tailwind-ui-rules` skill activates automatically whenever you work on frontend/UI tasks. Test it by asking Claude Code something like:

> "Build a card component with TailwindCSS"

The skill should load alongside the Anthropic `frontend-design` skill.

## Contributing

Feel free to open issues or PRs to suggest new rules, patterns, or additional skills.

## License

MIT
