import React from "react";
import { StyleSheet, PermissionsAndroid, Alert } from "react-native";
import MapView, { Region } from 'react-native-maps';
import { PlayerIcon } from "../components/PlayerIcon";
import Geolocation from 'react-native-geolocation-service';
import mapStyle from '../map_style.json'
import { backendService } from "../services/backend";
import { IUser } from "src/interfaces/firebase/user";
import { firebase } from "@react-native-firebase/firestore";
import { ISong } from "src/interfaces/song";
import { Subscription } from 'rxjs'

interface IProps { }

interface IState {
    users: IUser[]
    location?: Region
    song?: ISong
}

export class MapScreen extends React.Component<IProps, IState> {
    _mounted = false
    watchId: number
    mapRef: MapView
    getSongSub: Subscription
    getUsersSub: Subscription
    getTabSub: Subscription
    firstGeolocEmit = true
    initialLoc: Region = {
        latitude: 49,
        longitude: 18,
        latitudeDelta: 20,
        longitudeDelta: 20
    }

    constructor(props) {
        super(props)
        this.state = {
            users: []
        }
    }

    async componentDidMount() {
        this._mounted = true
        this.getSongSub = backendService.getSong$().subscribe(song => this.setState({ song: song }))
        const permisson = await this.checkPermission()
        this.getUsersSub = backendService.user.getUsers$()
            .map(data =>
                data.docs.map(element => {
                    const user = element.data() as IUser
                    return user
                })
            ).subscribe(data => {
                this.setState({ users: data })
            })
        if (!permisson) return
        this.watchId = Geolocation.watchPosition(newLocation => {
            // Center the map after the first device location is received
            if (this.firstGeolocEmit) {
                this.centerMap(newLocation)
                this.firstGeolocEmit = false
            }
            this.updateLocation(newLocation)
        }, () => { }, { distanceFilter: 20 })
        // Center the map when user clicks on the tab
        this.getTabSub = backendService.getTab$().subscribe(tab => {
            if (tab == 'explore') this.centerMap()
        })
    }

    componentWillUnmount() {
        this._mounted = false
        Geolocation.clearWatch(this.watchId)
        this.getSongSub?.unsubscribe()
        this.getUsersSub?.unsubscribe()
        this.getTabSub?.unsubscribe()
    }

    async checkPermission() {
        // Location needs a permission from the user
        const permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        if (!permission) {
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            if (status !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Location disabled',
                    'You need to enable your location in order to use this app!')
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    updateLocation(location: Geolocation.GeoPosition) {
        if (location.coords.latitude == this.state.location?.latitude
            && location.coords.longitude == this.state.location?.longitude) return
        if (!this._mounted) return
        this.setState({
            location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta:
                    this.state.location ? this.state.location.latitudeDelta : this.initialLoc.latitudeDelta,
                longitudeDelta:
                    this.state.location ? this.state.location.longitudeDelta : this.initialLoc.longitudeDelta,
            }
        })
        backendService.user.setLocation(location)
    }

    centerMap(location?: Geolocation.GeoPosition) {
        if (location) {
            this.goToPosition(location)
        } else {
            Geolocation.getCurrentPosition(newLocation => {
                this.goToPosition(newLocation)
            })
        }
    }

    goToPosition(location: Geolocation.GeoPosition) {
        this.mapRef.animateCamera({
            center: {
                latitude: location?.coords?.latitude,
                longitude: location?.coords?.longitude
            }
        })
    }

    render() {
        return (<>
            <MapView
                ref={map => this.mapRef = map}
                style={styles.map}
                showsUserLocation={false}
                customMapStyle={mapStyle}
                provider="google"
                followsUserLocation={false}
                minZoomLevel={4}
                maxZoomLevel={15}
                toolbarEnabled={false}
                showsCompass={false}
                showsTraffic={false}
                showsBuildings={false}
                showsIndoors={false}
                rotateEnabled={false}
                initialRegion={this.initialLoc}
                cacheEnabled={true}
            >
                {/* Other users */}
                {this.state.users.map((user, index) => {
                    if (user.uid == backendService.user.getUid()) return
                    return <PlayerIcon
                        user={user}
                        color={user.color}
                        key={index} />
                })}
                {this.state.location ?
                    // Marker of the local user
                    <PlayerIcon
                        user={{
                            color: 'white',
                            location:
                                new firebase.firestore.GeoPoint(
                                    this.state.location?.latitude, this.state.location?.longitude),
                            name: '',
                            uid: backendService.user.getUid(),
                            song: this.state.song
                        }}
                        color={'white'}
                        key={-1}
                        localUser={true} />
                    : null}
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