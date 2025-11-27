'use client';

// Import the ThemeProvider which includes the necessary logic to render the script
import { ThemeProvider } from 'next-themes';

// This component is strictly for rendering the theme script into the document <head>.
export function ThemedScript() {
    return (
        // The `ThemeProvider` component automatically renders a <script> tag
        // when placed outside of the main layout component.
        <ThemeProvider
            attribute="class"
            enableSystem
            defaultTheme="dark"
            // The `next-themes` documentation advises using `value` as an empty object
            // when just using it to render the script tag in the head.
            value={{}}
        />
    );
}