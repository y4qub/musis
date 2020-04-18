import React from "react";
import { StyleSheet, PermissionsAndroid, View } from "react-native";
import MapView, { Region } from 'react-native-maps';
import { IMarker } from "../interfaces/marker";
import { PlayerIcon } from "../components/PlayerIcon";
import Geolocation, { clearWatch } from 'react-native-geolocation-service';
import mapStyle from '../map_style.json'
import { backendService } from "../services/backend";

interface IProps { }

interface IState {
    markers: IMarker[]
    myMarker: IMarker
    location: Region
}

export class MapScreen extends React.Component<IProps, IState> {

    _mounted = false
    watchId: number

    constructor(props) {
        super(props)
        this.state = {
            location: {
                latitude: 49.82476725136718,
                longitude: 18.18838957697153,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03
            },
            myMarker: {
                color: 'blue',
                latlng: {
                    latitude: 49.82476725136718,
                    longitude: 18.18838957697153,
                },
                imageUrl: 'https://www.amsterdam-dance-event.nl/img/images/artists-speakers/25152018_2081958818692755_4224981802948165640_n_206787.jpg',
                user: { name: 'hjkjh', uid: 'ghjg' }
            },
            markers: []
        }
    }

    async componentDidMount() {
        this._mounted = true
        if (await !PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)) {
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            if (status !== PermissionsAndroid.RESULTS.GRANTED) {
                throw new Error('need location enabled')
            }
        }

        backendService.user.getMarkers$().subscribe(data => {
            // data.forEach(element => console.log(element.latlng))
            this.setState({ markers: data })
        })
        this.watchId = Geolocation.watchPosition(newLocation => {
            this.updateLocation(newLocation)
        })
    }

    componentWillUnmount() {
        this._mounted = false
        // clearWatch(this.watchId)
    }

    updateLocation(newLocation: Geolocation.GeoPosition) {
        if (newLocation.coords.latitude != this.state.myMarker.latlng.latitude
            || newLocation.coords.longitude != this.state.myMarker.latlng.longitude) {

            const update: Partial<IMarker> = {
                latlng: {
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude
                }
            }
            if (this._mounted) this.setState({ myMarker: { ...this.state.myMarker, ...update } })
        }
    }

    // updateDelta(region: Region) {
    //     this.currentDelta = { latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta }
    // }

    // handleCenter() {
    //     this.map.animateToRegion(this.state.location)
    // }

    render() {
        // const selfMarker = <PlayerIcon marker={this.state.myMarker} index={-1}/>
        const markers = this.state.markers.map((value, index) => {
            return <PlayerIcon marker={value} index={index} />
        })
        return (<>
            <MapView
                style={styles.map}
                showsUserLocation={false}
                region={this.state.location}
                customMapStyle={mapStyle}
                provider="google"
                zoomTapEnabled={true}
                followsUserLocation={false}
                scrollEnabled={true}
                maxZoomLevel={6}
                // minZoomLevel={12}
                toolbarEnabled={false}
                showsCompass={false}
                showsTraffic={false}
                showsBuildings={false}
                showsIndoors={false}
            >
                {markers}
                {/* {selfMarker} */}
            </MapView>
            {this.props.children}
        </>)
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    }
})