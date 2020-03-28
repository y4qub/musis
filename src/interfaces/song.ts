export interface ISong {
    artist: string
    name: string
    coverUrl: string
}

export interface ISpotifySong {
    name: string
    coverUrl: string
    duration: number
    progress: number
    timestamp: number
}