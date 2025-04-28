import { useEffect } from 'react';

export default function useSchoolColor() {
    useEffect(() => {
        const savedColor = localStorage.getItem('schoolColor');
        if (savedColor) {
            document.documentElement.style.setProperty('--school-bg', savedColor);
        }
    }, []);
}