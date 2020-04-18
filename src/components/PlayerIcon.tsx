import React from "react";
import { Image, View, StyleSheet, Text, Button, Dimensions } from 'react-native'
import { IMarker } from "../interfaces/marker";
import { Marker, Callout } from "react-native-maps";
import { backendService } from "../services/backend";
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps { marker: IMarker, index }

interface IState {
    song?
}

export class PlayerIcon extends React.Component<IProps, IState> {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        backendService.user.getUser$(this.props.marker.user.uid)
            .subscribe(data => this.setState({ song: data.data().song }))
    }

    startChat() {
        return backendService.chat.createChat(this.props.marker.user.uid, backendService.user.getUid())
            .then(chatItem => {
                // backendService.chat.openChat(chatItem)
                console.log(chatItem)
                // backendService.user.changeTab('chats')
            })
    }

    render() {
        return (
            <Marker coordinate={this.props.marker.latlng} key={this.props.index}>

                <View style={{ ...styles.circle, backgroundColor: this.props.marker.color }}>
                    <Image source={{
                        uri: this.props.marker.imageUrl,
                        width: 50,
                        height: 50
                    }} style={{ borderRadius: 50, zIndex: 999 }}
                    />
                </View>
                <View style={{ ...styles.triangle, borderBottomColor: this.props.marker.color }}></View>

                <Callout
                    style={styles.callout}
                    tooltip={true}
                    onPress={() => this.startChat()}
                >
                    <View
                        style={styles.playerWidget}>
                        {/* <View style={{ backgroundColor: 'gray', width: 85, height: 85, borderRadius: 50 }}></View> */}
                        <Image source={{ uri: this.props.marker.imageUrl, width: 85, height: 85 }}
                            style={{ width: 85, height: 85, borderRadius: 50 }} />
                        <View>
                            <Text
                                style={{ fontFamily: 'MavenProBold', color: '#FA8359', marginBottom: 5 }}
                            >
                                NOW PLAYING
                            </Text>
                            <Text
                                style={{ fontFamily: 'MavenProRegular', color: 'white', fontSize: 18 }}
                            >
                                {this.state.song?.name}
                            </Text>
                            <Text
                                style={{ fontFamily: 'MavenProBold', color: 'white' }}
                            >
                                Dystinct
                            </Text>
                        </View>
                        <Icon name={'md-chatbubbles'} size={30} color={'#FA8359'} />
                    </View>
                </Callout>

            </Marker >
        )
    }

}

const styles = StyleSheet.create({
    playerWidget: {
        ...StyleSheet.absoluteFillObject, borderRadius: 40, backgroundColor: '#393C49', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 28
    },
    circle: {
        borderRadius: 50,
        width: 58,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 998,
    },
    triangle: {
        marginTop: -28,
        zIndex: 0,
        marginLeft: -1.3,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 30,
        borderRightWidth: 30,
        borderBottomWidth: 40,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        transform: [{ rotate: '180deg' }],
    },
    callout: {
        height: 100,
        width: Dimensions.get('screen').width * 0.8
    }
})