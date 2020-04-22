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
    location: Region
    song?: ISong
}

export class MapScreen extends React.Component<IProps, IState> {
    _mounted = false
    watchId: number
    mapRef: MapView
    getSongSub: Subscription
    getUsersSub: Subscription

    constructor(props) {
        super(props)
        this.state = {
            location: {
                latitude: 49,
                longitude: 18,
                latitudeDelta: 20,
                longitudeDelta: 20
            },
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
                    user.color = backendService.generateRandomColor()
                    return user
                })
            ).subscribe(data => {
                this.setState({ users: data })
            })
        if (!permisson) return
        this.watchId = Geolocation.watchPosition(newLocation => {
            this.updateLocation(newLocation)
        }, () => { }, { distanceFilter: 10 })
    }

    componentWillUnmount() {
        this._mounted = false
        Geolocation.clearWatch(this.watchId)
        this.getSongSub.unsubscribe()
        this.getUsersSub.unsubscribe()
    }

    async checkPermission() {
        const permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        if (!permission) {
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            if (status !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Location disabled', 'You need to enable your location in order to use this app!')
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    updateLocation(location: Geolocation.GeoPosition) {
        if (location.coords.latitude == this.state.location.latitude
            && location.coords.longitude == this.state.location.longitude) return
        if (!this._mounted) return
        this.setState({
            location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: this.state.location.latitudeDelta,
                longitudeDelta: this.state.location.longitudeDelta
            }
        })
        backendService.user.setLocation(location)
        this.centerMap()
    }

    centerMap() {
        this.mapRef.animateToRegion(this.state.location)
    }

    getMarkers() {
        return this.state.users.map((user, index) => {
            if (user.uid == backendService.user.getUid()) return
            return <PlayerIcon
                user={user}
                color={user.color}
                key={index} />
        })
    }

    render() {
        const userMarker = <PlayerIcon
            user={{
                color: 'white',
                location:
                    new firebase.firestore.GeoPoint(this.state.location.latitude, this.state.location.longitude),
                name: '',
                uid: backendService.user.getUid(),
                song: this.state.song
            }}
            color={'white'}
            key={-1}
            localUser={true} />
        return (<>
            <MapView
                ref={map => this.mapRef = map}
                style={styles.map}
                showsUserLocation={false}
                region={this.state.location}
                customMapStyle={mapStyle}
                provider="google"
                followsUserLocation={false}
                maxZoomLevel={10}
                minZoomLevel={4}
                toolbarEnabled={false}
                showsCompass={false}
                showsTraffic={false}
                showsBuildings={false}
                showsIndoors={false}
                rotateEnabled={false}
            >
                {this.getMarkers()}
                {userMarker}
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