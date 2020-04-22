import React from "react";
import { Image, View, StyleSheet, Text, Dimensions } from 'react-native'
import { Marker, Callout } from "react-native-maps";
import { backendService } from "../services/backend";
import Icon from 'react-native-vector-icons/Ionicons';
import { IUser } from "src/interfaces/firebase/user";

interface IProps {
    user: IUser,
    color: string,
    localUser?: boolean
}

interface IState { }

export class PlayerIcon extends React.Component<IProps, IState> {

    async startChat() {
        const chatId = await backendService.chat.createChat(this.props.user.uid)
        backendService.chat.openChat(chatId)
    }

    render() {
        const imageUrl =
            `https://i.scdn.co/image/${this.props.user.song?.coverUrl?.split(':')[2]}`
        return (
            this.props.user.location ? <Marker
                coordinate={
                    {
                        latitude: this.props.user.location.latitude,
                        longitude: this.props.user.location.longitude
                    }}>

                <View style={{ ...styles.circle, backgroundColor: this.props.color }}>

                    {this.props.user.song ?
                        <Image source={{
                            uri: imageUrl,
                            width: 50,
                            height: 50
                        }} style={styles.coverImage}
                        /> : <Icon name={'md-person'} size={30} color={'gray'} />}
                </View>
                <View style={{ ...styles.triangle, borderBottomColor: this.props.color }}></View>
                {this.props.user.song ? <Callout
                    style={{
                        ...styles.callout,
                        width: this.props.localUser ?
                            Dimensions.get('screen').width * 0.7 : styles.callout.width
                    }}
                    tooltip={true}
                    onPress={() => this.props.localUser ? null : this.startChat()}
                >
                    <View
                        style={styles.playerWidget}>
                        <Image source={{
                            uri: imageUrl,
                            width: 80,
                            height: 80,
                        }} style={styles.calloutImage} resizeMode={'cover'}
                        />
                        <View>
                            <Text
                                style={{ fontFamily: 'MavenProBold', color: this.props.color, marginBottom: 5 }}
                            >
                                NOW PLAYING
                        </Text>
                            <Text
                                style={{ fontFamily: 'MavenProRegular', color: 'white', fontSize: 16 }}
                            >
                                {this.props.user.song?.name}
                            </Text>
                            <Text
                                style={{ fontFamily: 'MavenProBold', color: 'white' }}
                            >
                                {this.props.user.song?.artist}
                            </Text>
                        </View>
                        {this.props.localUser ?
                            null : <Icon name={'md-chatbubbles'} size={30} color={this.props.color} />}
                    </View>
                </Callout> : null}


            </Marker> : null

        )
    }

}

const styles = StyleSheet.create({
    calloutImage: { borderRadius: 50, zIndex: 999, marginLeft: 10 },
    coverImage: { borderRadius: 50, zIndex: 999 },
    playerWidget: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 40,
        backgroundColor: '#393C49',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 22
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
        width: Dimensions.get('screen').width * 0.9
    }
})