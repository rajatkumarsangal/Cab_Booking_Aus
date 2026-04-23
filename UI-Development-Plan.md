# Cab Booking HTML Application

## Project Status

This document has been updated to reflect the current implementation direction of the cab booking UI.

The project started as a planning document, but it now also serves as a simple reference for the structure that has already been created in the HTML application.

## Core Direction

- Build a modern cab booking interface using plain `HTML`, `CSS`, and `JavaScript`
- Use the reference website only for flow inspiration, not for visual copying
- Keep the UI attractive, premium, and clearly different from the reference
- Support direct navigation across separate pages instead of keeping everything on one long page

## Current Product Structure

### 1. Home Page

File:
- `index.html`

Current purpose:
- act as the landing page
- show the sketch-inspired booking hero
- provide pickup and drop search inputs
- direct users into the booking journey
- promote supporting areas like offers, app download, and driver onboarding

Current sections on the page:
- shared header
- sketch-style hero with pickup, drop, and search
- benefits section
- app showcase section
- promotion / partner strip
- shared footer

Important note:
- the earlier multi-step booking studio that was originally planned on the home page has been removed from `index.html`

### 2. Fare Estimate Page

File:
- `fare-estimate.html`

Current purpose:
- give users a separate page to estimate ride pricing
- allow pickup, destination, vehicle, and ride mode based calculation
- keep pricing flow independent from the landing page layout

Related script:
- `fare-estimate.js`

### 3. Company Page

File:
- `company-website.html`

Current purpose:
- present company-style content
- provide space for driver recruitment, app promotion, and offers

### 4. Contact Page

File:
- `contact-us.html`

Current purpose:
- provide support and contact information

### 5. Authentication Pages

Files:
- `login.html`
- `signup.html`

Current purpose:
- keep account access as separate pages
- maintain a cleaner navigation flow from the shared top bar

## Shared Layout Approach

To avoid repeating the same header and footer across multiple HTML pages, a shared layout approach has been implemented.

### Shared Layout File

File:
- `layout.js`

Responsibilities:
- render the shared header
- render the shared footer
- highlight the active navigation item based on `data-page`

### Layout Placeholders Used In All Pages

Each page includes:

- `<div id="site-header-root"></div>`
- `<div id="site-footer-root"></div>`

Each page also sets a page key using:

- `data-page="home"`
- `data-page="fare"`
- `data-page="company"`
- `data-page="contact"`
- `data-page="login"`
- `data-page="signup"`

## Header Direction

The header has been moved away from the copied white/orange reference style and aligned with the custom project theme.

Current direction:
- dark premium header
- custom navigation styling
- separate-page navigation
- logo-first branding direction instead of text-only branding

Important note:
- the visible `RouteWave` text branding has been replaced in the header direction by a logo-style placeholder mark
- the final real logo asset can be swapped in later

## Footer Direction

The footer is now shared across all pages through `layout.js`.

Current purpose:
- keep the site visually consistent
- provide quick links across booking, company, and support pages
- avoid missing footer sections on individual pages

## Visual Theme

The current UI direction stays aligned with the chosen project theme:

- dark atmospheric background
- premium gold / amber accent styling
- rounded glass-like panels
- map-inspired visual elements
- bold but clean hierarchy

## What Changed From The Original Plan

The original version of this file assumed:

- a more complete multi-step booking flow on the home page
- booking details, service selection, payment, and confirmation sections all living inside `index.html`

That direction has now been simplified.

Current reality:
- `index.html` is focused more on landing experience and entry into the booking flow
- the earlier booking studio sections were removed from the home page
- navigation now opens separate pages instead of switching within the same page
- shared header and footer are now centralized through `layout.js`

## Current Front-End Files

- `index.html`
- `fare-estimate.html`
- `company-website.html`
- `contact-us.html`
- `login.html`
- `signup.html`
- `styles.css`
- `script.js`
- `fare-estimate.js`
- `layout.js`

## Recommended Next Improvements

### Priority 1

- replace the placeholder logo mark with the final logo asset
- clean up any unused booking-flow code left in `script.js`
- make sure all pages follow the same spacing and content rhythm

### Priority 2

- refine the fare estimate page UI to match the landing-page polish
- improve the company and contact pages with richer content blocks
- add stronger mobile refinements across all screens

### Priority 3

- prepare hooks for real map integration
- prepare hooks for live fare APIs
- prepare hooks for payment, dispatch, and email confirmation

## Summary

This project is no longer just a concept plan. It is now a multi-page front-end structure with:

- a custom landing page
- separate navigation pages
- a shared layout system
- a consistent premium dark theme
- room for future real booking integrations

The next work should focus on polishing the separate pages, replacing the placeholder logo, and cleaning up leftover code from the earlier home-page booking flow.
