# Cab Booking HTML Application

## Project Status

This document reflects the current implementation of the cab booking UI and the Google Maps-ready architecture that has now been added.

The project is no longer a simple static mockup. It now includes:

- a shared header and footer
- a live booking flow on the home page
- Google-map-ready pickup and drop inputs
- an automatic trip summary pipeline
- separate auth and contact pages

## Core Direction

- Build a modern cab booking interface using plain `HTML`, `CSS`, and `JavaScript`
- Keep the booking flow on `index.html` as the main user experience
- Use a real Google map preview instead of a mock map
- Keep Google Maps integration configurable so an API key can be added later without changing app logic
- Keep the UI premium, clean, and different from the original inspiration references

## Current Product Structure

### 1. Home Page

File:
- `index.html`

Current purpose:
- act as the main booking page
- provide pickup and drop inputs
- show a real Google map iframe preview
- reveal booking sections after search
- collect service, contact, payment, and driver instruction data
- show a live trip summary
- support app, offer, and driver-promotion sections lower on the same page

Current sections:
- shared header
- hero booking panel
- Google map preview
- search result booking flow
- fare mode section
- car list section
- contact details section
- payment section
- driver instruction section
- trip summary section
- confirmation section
- benefits section
- app showcase section
- partner / promotion strip
- shared footer

### 2. Contact Page

File:
- `contact-us.html`

Current purpose:
- provide support and contact information

### 3. Authentication Pages

Files:
- `login.html`
- `signup.html`

Current purpose:
- keep account access separate from the booking page
- maintain cleaner navigation in the shared top bar

## Shared Layout Approach

To avoid repeating the same header and footer across pages, the project uses a shared layout file.

### Shared Layout File

File:
- `layout.js`

Responsibilities:
- render the shared header
- render the shared footer
- highlight the active navigation item based on `data-page`
- render the dummy image logo inside `.header-brand`

### Layout Placeholders Used In All Pages

Each page includes:

- `<div id="site-header-root"></div>`
- `<div id="site-footer-root"></div>`

Each page sets one of these page keys:

- `data-page="home"`
- `data-page="contact"`
- `data-page="login"`
- `data-page="signup"`

## Google Maps Integration Strategy

The project is now prepared for Google Maps integration in a way that avoids manual JavaScript rewrites later.

### Config File

File:
- `google-maps-config.js`

Purpose:
- hold Google Maps settings in one place
- allow API key insertion later
- control map behavior without changing booking logic

Current config shape:

- `apiKey`
- `libraries`
- `region`
- `country`
- `mapMode`
- `mapId`
- `autoUseGoogleRouteSummary`

### Current Behavior Without API Key

- pickup and drop still work as normal text inputs
- the map still updates using a Google embed URL
- the trip summary uses fallback route estimation logic

### Current Behavior After Adding API Key

Once a valid Google Maps API key is added to `google-maps-config.js`:

- pickup and drop inputs automatically gain Google Places autocomplete
- selected places automatically store place metadata
- map route updates automatically using selected place coordinates
- trip summary automatically switches to Google-selected-place based route metrics

No manual code edits are required after adding the key.

## Trip Summary Architecture

The trip summary is now built through a generic pipeline instead of one hardcoded calculation block.

Main functions in `script.js`:

- `buildFallbackTripMetrics()`
- `calculateFareFromMetrics()`
- `getRouteMetricsSource()`
- `getDistanceBetweenPoints()`
- `renderTripSummary()`
- `calculateTrip()`

### Current Summary Logic

If Google-selected place coordinates are not available:

- the app uses fallback distance and duration estimation

If Google-selected place coordinates are available and `autoUseGoogleRouteSummary` is enabled:

- the app automatically uses coordinate-based route metrics

This makes the summary source switch automatically based on available map data.

## Current Front-End Files

- `index.html`
- `contact-us.html`
- `login.html`
- `signup.html`
- `styles.css`
- `script.js`
- `layout.js`
- `google-maps-config.js`
- `assets/dummy-logo.svg`

## Removed Pages

These pages are no longer part of the active project structure:

- `company-website.html`
- `fare-estimate.html`
- `fare-estimate.js`

Their navigation and footer references have already been removed.

## Visual Direction

The current UI direction includes:

- dark atmospheric background
- premium gold / amber accent styling
- rounded glass-like panels
- wider desktop layout with reduced left/right empty spacing
- real image-based dummy logo in header and footer
- booking-first page structure

## Recommended Next Improvements

### Priority 1

- replace the dummy logo with the final brand logo
- connect exact Google Directions route distance and duration once API access is ready
- refine validation and booking confirmation messaging

### Priority 2

- improve the contact page with richer content blocks
- strengthen mobile spacing and responsive polish
- add a better selected-place display state for pickup and drop

### Priority 3

- prepare hooks for payment integration
- prepare hooks for dispatch logic
- prepare hooks for email or SMS confirmations

## Summary

This project is now a focused multi-page front-end with a real booking-first home page, Google-map-ready architecture, automatic summary switching, shared layout rendering, and room for future production integrations.
