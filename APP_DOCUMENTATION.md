# AdCraft AI: Application Documentation

This document provides a comprehensive overview of the AdCraft AI application, covering its core concepts, features, UI/UX design, and technical architecture.

## 1. Application Concept

**AdCraft AI** is a web application designed to simplify and enhance the process of creating vehicle advertisements. Leveraging generative AI, it empowers users to instantly craft compelling "for sale" or "wanted" ads. The primary goal is to provide a seamless, intuitive experience that transforms a simple user input—like a photo or a brief description—into a polished, effective advertisement ready for posting.

## 2. Core Features

The application is built around a few key functionalities:

-   **Ad Type Selection:** The user journey begins by choosing between creating an ad to **sell a vehicle** or an ad to find a **wanted vehicle**.

-   **AI-Powered Ad Generation:**
    -   **For Sale Ads:** Users can upload a single image of their vehicle. The AI analyzes the image to identify the vehicle's characteristics and generates a full ad, including a descriptive title and body content.
    -   **Wanted Ads:** Users describe the vehicle they are looking for in a text area. The AI then transforms this description into a clear and concise "wanted" ad.

-   **Ad Editor:**
    -   All generated ads are directed to a powerful editor.
    -   Users can refine the AI-generated title and content.
    -   A **Markdown Preview** tab allows users to see a styled version of their ad content in real-time.
    -   **Image Management:** Users can upload multiple photos for their ad, view them in a carousel, and remove them as needed.

-   **AI-Assisted Improvements:**
    -   **Improve with AI:** In the editor, users can trigger an AI agent that analyzes the current ad content and all associated images to provide a rewritten, improved version of the ad along with a list of specific, actionable suggestions.
    -   **Generate Title:** A dedicated AI agent can be used to regenerate the ad title at any time, focusing on creating high-impact, converting headlines based on the ad's content and images.

-   **Ad Management:**
    -   Users can save their ads, which are stored locally in the browser.
    -   The "My Saved Ads" page displays all saved ads in a card-based grid, showing a thumbnail of the primary image.
    -   From here, users can edit, copy the content of, or delete their ads.

-   **Premium Tier (Monetization Concept):** A dedicated "Go Premium" page outlines features available in a paid subscription, serving as a conceptual placeholder for future monetization.

## 3. UI/UX Design

The application's design is clean, modern, and focused on user experience.

### 3.1. Layout & Structure

-   **Main Layout:** A persistent header provides consistent navigation across the app. The main content area is fluid and responsive.
-   **Homepage (`/`):** Features a prominent hero section with a clear call-to-action and a "Key Features" section to quickly inform users of the app's capabilities.
-   **Creation Flow (`/create`):** A guided, card-based interface allows users to easily choose their ad creation path.
-   **Editor Page (`/edit/[id]`):** A two-column layout provides a focused workspace. The left column is dedicated to vehicle images (viewing and uploading), while the right column contains the text editor with tabs for editing and previewing. Action buttons for saving, deleting, and using AI tools are logically grouped and accessible.
-   **Saved Ads Page (`/saved`):** A responsive grid of cards, each representing a saved ad. Each card displays a thumbnail, title, creation date, and action buttons for quick access to core functions.

### 3.2. Color Theme & Styling

The theme is defined in `src/app/globals.css` using HSL CSS variables, consistent with `shadcn/ui` theming practices.

-   **Primary Color:** `#2962FF` (A rich, saturated blue) - Used for primary buttons, links, and key interactive elements to evoke trust and reliability.
-   **Background Color:** `#E5EAFE` (A light, desaturated blue) - Provides a clean, calm, and unobtrusive backdrop for the content.
-   **Accent Color:** `#7A00D9` (A vibrant violet) - Used for secondary calls-to-action and highlights (like the "Go Premium" and "Improve with AI" buttons) to create contrast and draw attention.
-   **Components:** The UI is built with [ShadCN UI](https://ui.shadcn.com/) components, featuring rounded corners, subtle shadows, and clean lines for a professional feel.

### 3.3. Typography

-   **Headlines:** **'Space Grotesk'** is used for major titles and headlines, giving the app a modern and distinctive feel.
-   **Body Text:** **'Inter'** is used for all body copy, paragraphs, and component text, ensuring high readability and a clean look.

## 4. Technical Stack & Architecture

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (via Google AI)
    -   Multiple AI "flows" are defined for specific tasks (generating ads from images, improving copy, generating titles).
    -   These flows are exposed as Server Actions to the frontend.
-   **State Management:**
    -   React Hooks (`useState`, `useEffect`, `useMemo`).
    -   A custom `useLocalStorage` hook is used for persisting saved ads in the browser.
    -   `sessionStorage` is used to pass temporary ad data between the creation and editing pages.
-   **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for schema validation.
-   **Icons:** [Lucide React](https://lucide.dev/)

The application follows modern React best practices, utilizing client components (`'use client'`) for interactive UIs and server components where possible. Server Actions are used to securely call the Genkit AI flows from the client.
