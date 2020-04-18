export interface IMarker {
    latlng: {
        latitude: number,
        longitude: number
    },
    imageUrl: string
    color: string
    user: {
        uid: string
        name: string
    }
}