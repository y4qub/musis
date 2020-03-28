import React from "react";
import { Image, View, StyleSheet } from 'react-native'
import { IMarker } from "../interfaces/marker";
import { Marker } from "react-native-maps";

export function PlayerIcon(marker: IMarker, index) {
    return (
        <Marker coordinate={marker.latlng} key={index}>
            
            <View style={{ ...styles.circle, backgroundColor: marker.color, }}>
                <Image source={{
                    uri: marker.imageUrl,
                    width: 50,
                    height: 50
                }} style={{ borderRadius: 50, zIndex: 999, }}
                />
            </View>
            <View style={{ ...styles.triangle, borderBottomColor: marker.color }}></View>

        </Marker>
    )
}

const styles = StyleSheet.create({
    circle: {
        borderRadius: 50,
        width: 58,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 998
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
    }

})