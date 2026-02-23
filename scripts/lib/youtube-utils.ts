export function extraerVideoId(url: string): string | null {
    if (!url) return null;

    const patrones = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtu\.be\/([^?|\s]+)/,
        /youtube\.com\/shorts\/([^?]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtube\.com\/v\/([^?]+)/
    ];

    for (const patron of patrones) {
        const match = url.match(patron);
        if (match) return match[1];
    }

    // Fallback for some messy URLs found in extraction
    if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts[1]) return parts[1].split(/[?#\s]/)[0];
    }

    return null;
}

export function generarThumbnailUrl(urlVideo: string): string | null {
    const videoId = extraerVideoId(urlVideo);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function generarUrlEmbed(urlVideo: string): string | null {
    const videoId = extraerVideoId(urlVideo);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
}
