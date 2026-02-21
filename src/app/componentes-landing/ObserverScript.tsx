"use client"
import { useEffect } from "react";

export default function ObserverScript() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // observer.unobserve(entry.target); // Dejar para que anime solo 1 vez
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        const elements = document.querySelectorAll('.fade-up');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return null;
}
