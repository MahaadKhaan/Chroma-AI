# Chroma AI Premium UI/UX Frontend

## Tech Stack Architecture
The Chroma AI frontend is a modern, highly interactive client-side application built with:
- **Next.js 14/15 App Router**: Providing robust server-side and client-side routing.
- **Tailwind CSS**: For utility-first, highly customizable styling.
- **Framer Motion**: Powering fluid, state-driven micro-animations.
- **Next-Themes**: Managing global dark/light mode context.

## Core Feature Engineering & Mechanics

### Power-User Clipboard Paste Handler
To enhance user experience, the dashboard features a universal `onPaste` capture pipeline. This handler intercepts OS clipboard actions and screens for browser or web-wrapped image objects. It extracts raw image file blocks seamlessly and automatically pushes them into the active React file state upload track, bypassing manual file selection entirely.

### Resilient Image Comparison Slider
The before-and-after image comparison component is built to guarantee structural stability:
- **ResizeObserver**: Actively monitors the wrapper's pixel dimensions to lock the underlying image aspect ratio.
- **Absolute CSS Positioning**: Employs overlapping absolute layers with a tracking clipping mask (`clip-path`).
- **Zero Distortion**: Slicing the slider between the black-and-white input and the colorized output never distorts or alters the image proportions, regardless of viewport size.

### Global Theme & Layout Synchronization
The application implements a premium aesthetic:
- **Glassmorphic Header**: Tracks scroll offsets safely via fixed/relative positioning states, dynamically applying backdrop blurs and transparency.
- **Next-Themes Synchronization**: Seamlessly switches between curated dark and light mode classes without flashing or visual bugs.

## Layout Stability & Mobile Responsiveness Strategy
To eliminate horizontal jiggle and layout thrashing (common with `w-screen` components), the application uses strict fluid container bounds:
- All core sections are constrained using `w-full max-w-7xl mx-auto`.
- The root layout implements `overflow-x-hidden` properties to prevent lateral scrolling on mobile viewports.
- Responsive design guarantees that the UI elegantly scales from massive desktop monitors down to standard mobile devices.

## Local Setup & Installation Instructions

To install dependencies and run the development tracking instance locally:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the Next.js development server
npm run dev
```

## System Integration Map

### API Communication Architecture
The Frontend communicates across local CORS networks to the Backend using a `POST` request directed at `http://localhost:8000/colorize`. It transmits payload data as a standard multi-part form data array containing the active `image` binary and the selected `model` string.

### Nginx Infrastructure Inversion
In a production deployment, traffic flows from the public interface through Nginx. Nginx acts as a reverse proxy shield, blocking oversized header requests and enforcing layer-7 network connection drops (e.g., maximum concurrent connections). Only validated, rate-limited traffic passes down into the inner, isolated Python container.
