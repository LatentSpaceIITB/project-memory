# Design Style Guide
## Inspired by VideoAsk Design Principles

> **Source**: Extracted from [VideoAsk.com](https://www.videoask.com/) for design inspiration and consistency

---

## 🎨 Color Palette

### Primary Colors
- **Primary Color**: Used for main interactive elements like buttons, links, and CTAs
  - Recommended: `#FF6B6B` (VideoAsk red accent) or `#007BFF` (Professional blue)
  - Usage: Primary buttons, active states, important highlights

- **Secondary Color**: Used for secondary actions and confirmation buttons
  - Recommended: `#6C757D` (Neutral gray) or `#28A745` (Success green)
  - Usage: Secondary buttons, supporting elements, confirmations

### Background Colors
- **Primary Background**: Clean white for main content areas
  - Light Mode: `#FFFFFF`
  - Dark Mode: `#0A0A0A` or `#1A1A1A`

- **Secondary Background**: Subtle variations for cards and sections
  - Light Mode: `#F8F9FA` or `#F5F5F5`
  - Dark Mode: `rgba(255, 255, 255, 0.05)` with backdrop blur

- **Accent Backgrounds**: For featured sections and highlights
  - Gradient: `linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(0, 123, 255, 0.1))`

### Text Colors
- **Primary Text**:
  - Light Mode: `#171717` or `#212529`
  - Dark Mode: `#EDEDED` or `#FFFFFF`

- **Secondary Text**:
  - Light Mode: `rgba(0, 0, 0, 0.7)` or `#6C757D`
  - Dark Mode: `rgba(255, 255, 255, 0.7)`

- **Muted Text**:
  - Light Mode: `rgba(0, 0, 0, 0.5)`
  - Dark Mode: `rgba(255, 255, 255, 0.5)`

### Border Colors
- **Subtle Borders**: For cards and dividers
  - Light Mode: `rgba(0, 0, 0, 0.1)` or `#E0E0E0`
  - Dark Mode: `rgba(255, 255, 255, 0.1)` or `rgba(255, 255, 255, 0.15)`

---

## ✍️ Typography

### Font Families
- **Primary Font**: Sans-serif, modern and readable
  - Recommended: `Inter`, `Poppins`, `SF Pro Display`, or `Geist Sans`
  - Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

- **Mono Font**: For code and technical content
  - Recommended: `Geist Mono`, `SF Mono`, or `Consolas`
  - Fallback: `'Courier New', monospace`

### Font Sizes & Scale
```css
/* Heading Scale */
h1: 48px / 3rem (56px line-height) - Hero titles
h2: 36px / 2.25rem (44px line-height) - Section titles
h3: 28px / 1.75rem (36px line-height) - Subsection titles
h4: 22px / 1.375rem (28px line-height) - Card titles
h5: 18px / 1.125rem (24px line-height) - Small headings
h6: 16px / 1rem (24px line-height) - Labels

/* Body Text */
Large: 20px / 1.25rem (30px line-height) - Lead paragraphs
Base: 16px / 1rem (24px line-height) - Body text
Small: 14px / 0.875rem (20px line-height) - Supporting text
XSmall: 12px / 0.75rem (16px line-height) - Captions, metadata
```

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings and CTAs

### Letter Spacing
- **Headings**: `-0.02em` to `-0.01em` (tighter)
- **Body**: `0` (normal)
- **Uppercase Labels**: `0.05em` to `0.1em` (wider)

---

## 🔘 Buttons

### Primary Button
```css
- Background: Primary color (solid)
- Text: White (#FFFFFF)
- Padding: 16px 32px (vertical horizontal)
- Border Radius: 999px (fully rounded/pill shape)
- Font Weight: 700 (Bold)
- Font Size: 18px / 1.125rem
- Shadow: Subtle shadow for depth
- Hover: Slight opacity change (0.9) or slight scale (1.02)
- Transition: 200ms ease
```

### Secondary Button
```css
- Background: Transparent or secondary color
- Border: 1px solid (subtle border color)
- Text: Primary text color
- Padding: 16px 32px
- Border Radius: 999px (pill shape)
- Font Weight: 600 (Semibold)
- Font Size: 18px / 1.125rem
- Hover: Background change to rgba(0, 0, 0, 0.05) or rgba(255, 255, 255, 0.1)
- Transition: 200ms ease
```

### Button Shape Customization
- **Fully Rounded (Pill)**: `border-radius: 999px` - Default, modern look
- **Rounded**: `border-radius: 12px` - Alternative, less playful
- **Slightly Rounded**: `border-radius: 8px` - Subtle, professional
- **Sharp**: `border-radius: 4px` - Minimal, corporate

---

## 📦 Components & UI Elements

### Cards
```css
- Background: White (light) or rgba(255, 255, 255, 0.05) (dark)
- Border: 1px solid (subtle border color)
- Border Radius: 16px / 1rem
- Padding: 24px / 1.5rem to 32px / 2rem
- Shadow: Subtle shadow (0 2px 8px rgba(0, 0, 0, 0.08))
- Hover: Slight elevation increase
```

### Badges & Tags
```css
- Background: rgba(primary-color, 0.1) or solid with opacity
- Text: Primary color
- Padding: 8px 16px
- Border Radius: 999px (pill shape)
- Font Size: 14px / 0.875rem
- Font Weight: 600
```

### Input Fields
```css
- Background: White or rgba(255, 255, 255, 0.05)
- Border: 1px solid (subtle border)
- Border Radius: 12px
- Padding: 12px 16px
- Font Size: 16px / 1rem
- Focus: Border color changes to primary color, subtle shadow
- Transition: 200ms ease
```

### Video/Media Containers
```css
- Border Radius: 12px to 16px
- Aspect Ratio: 16:9 (default for video)
- Background: Black or dark gray (#000000 or #1A1A1A)
- Overflow: hidden (for rounded corners)
```

---

## 📐 Spacing & Layout

### Spacing Scale
```css
/* Based on 4px base unit */
0.5: 2px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

### Container Widths
- **Max Content Width**: 1200px (6xl) or 1280px
- **Content Padding**: 16px (mobile) to 24px (desktop)
- **Section Spacing**: 64px to 96px vertical

### Grid System
- **Gutters**: 24px to 32px between columns
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## 🎭 Visual Effects

### Gradients
- **Hero Backgrounds**: Subtle gradients from dark to darker
  - Example: `linear-gradient(to bottom, #000000, #1A1A1A, #000000)`
- **Accent Gradients**: Colored overlays for featured sections
  - Example: `linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(0, 123, 255, 0.2))`

### Glassmorphism / Backdrop Blur
```css
- Background: rgba(255, 255, 255, 0.05) or rgba(255, 255, 255, 0.1)
- Backdrop Filter: blur(12px) saturate(180%)
- Border: 1px solid rgba(255, 255, 255, 0.1)
```

### Shadows
- **Card Shadow**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Button Shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Hover Elevation**: `0 8px 24px rgba(0, 0, 0, 0.12)`

### Transitions
- **Standard**: `200ms ease` or `300ms cubic-bezier(0.4, 0, 0.2, 1)`
- **Fast**: `150ms ease`
- **Smooth**: `400ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 🏷️ Branding Guidelines

### Logo
- **Format**: PNG, JPEG, SVG, or GIF
- **Maximum Height**: 35px (for headers)
- **Placement**: Top left in navigation
- **Padding**: Minimum 16px spacing around logo

### Favicon
- **Size**: 32x32px or 16x16px
- **Format**: ICO, PNG, or SVG
- **Display**: Browser tab icon

### Custom Domain (if applicable)
- Format: `yourbrand.yourdomain.com`
- Maintains branding consistency across URLs

---

## 📱 Responsive Design

### Mobile First Approach
- Design for mobile screens first (320px - 640px)
- Stack content vertically on mobile
- Touch-friendly targets (minimum 44x44px)
- Simplified navigation (hamburger menu)

### Tablet Considerations
- 640px - 1024px width
- 2-column layouts possible
- Maintain readability

### Desktop Enhancements
- > 1024px width
- Multi-column layouts
- Hover states and interactions
- Side navigation options

---

## ✨ Animation & Interactions

### Micro-interactions
- **Button Hover**: Slight scale (1.02) or opacity change (0.9)
- **Card Hover**: Subtle elevation increase
- **Link Hover**: Color transition or underline animation
- **Form Focus**: Border color change with subtle shadow

### Loading States
- **Skeleton Screens**: Placeholder content with shimmer effect
- **Spinners**: Simple, branded loading indicators
- **Progress Bars**: For video uploads or long processes

### Video Playback
- **Controls**: Minimal, fade on hover
- **Progress Bar**: Primary color accent
- **Play Button**: Large, centered, with backdrop blur

---

## 🌈 Color Accessibility

### Contrast Ratios
- **WCAG AA Minimum**:
  - Normal text: 4.5:1
  - Large text (18px+): 3:1
  - UI components: 3:1
- **WCAG AAA Recommended**:
  - Normal text: 7:1
  - Large text: 4.5:1

### Color Blind Considerations
- Don't rely solely on color to convey information
- Use icons, text labels, and patterns alongside color
- Test with color blindness simulators

---

## 📝 Content Guidelines

### Voice & Tone
- **Friendly**: Approachable and warm
- **Professional**: Trustworthy and reliable
- **Clear**: Direct and easy to understand
- **Encouraging**: Positive and supportive

### Error Messages
- Clear and actionable
- Use friendly language (avoid technical jargon)
- Provide next steps or solutions
- Use appropriate color (red/orange for errors)

### Success Messages
- Positive and encouraging
- Confirm what happened
- Use green color accents
- Optional celebration animation

---

## 🔗 Implementation Notes

### CSS Variables
```css
:root {
  /* Colors */
  --color-primary: #FF6B6B;
  --color-secondary: #6C757D;
  --color-background: #FFFFFF;
  --color-foreground: #171717;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Geist Mono', monospace;
  
  /* Spacing */
  --spacing-unit: 4px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-smooth: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tailwind CSS Configuration
If using Tailwind, customize `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#6C757D',
      },
      borderRadius: {
        'pill': '999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

---

## 📚 Resources & References

- **VideoAsk Website**: [https://www.videoask.com/](https://www.videoask.com/)
- **VideoAsk Help Center**: [https://www.videoask.com/help](https://www.videoask.com/help)
- **WCAG Guidelines**: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- **Color Contrast Checker**: [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)

---

## 🎯 Key Principles

1. **Simplicity**: Clean, uncluttered interfaces
2. **Clarity**: Clear visual hierarchy and readable typography
3. **Consistency**: Uniform components and patterns
4. **Accessibility**: Usable by everyone, regardless of ability
5. **Emotional Connection**: Friendly and approachable design
6. **Performance**: Fast loading and smooth interactions

---

*Last Updated: Based on VideoAsk design principles as of 2024*
*This style guide serves as a reference for maintaining design consistency across the project.*

