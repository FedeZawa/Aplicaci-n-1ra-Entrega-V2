/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{ts,tsx}",
        "./views/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    850: '#151f32',
                    900: '#0f172a',
                    950: '#020617',
                },
                primary: {
                    400: '#ffaf5e',
                    500: '#FF9F38',
                    600: '#e08323',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
