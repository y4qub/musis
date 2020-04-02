import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import React from "react";
import { Tab } from "../interfaces/tab";
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps {
    activeTab: Tab
    changeTabCallback(tab: Tab): void
}

interface IState { }

export class BottomBar extends React.Component<IProps, IState> {

    private iconSize = 32
    private iconColor = 'white'

    constructor(props) {
        super(props)
    }

    render() {

        const exploreColor = this.props?.activeTab == 'explore' ? '#FF7674' : '#2C2C41'
        const profileColor = this.props?.activeTab == 'chats' ? '#309EFF' : '#2C2C41'
        const tabName = this.props.activeTab.charAt(0).toUpperCase() + this.props.activeTab.substring(1)

        return (
            <View style={styles.tabBar}>

                <TouchableOpacity style={{ ...styles.tabIcon, backgroundColor: exploreColor }} onPress={_ => this.props.changeTabCallback('explore')}>
                    <Icon name="md-map" size={this.iconSize} color={this.iconColor} />
                </TouchableOpacity>

                <Text style={{ ...styles.tabTitle, color: this.props?.activeTab == 'explore' ? exploreColor : profileColor }}>
                    {tabName}
                </Text>

                <TouchableOpacity style={{ ...styles.tabIcon, backgroundColor: profileColor }} onPress={_ => this.props.changeTabCallback('chats')}>
                    <Icon name="md-person" size={this.iconSize} color={this.iconColor} />
                </TouchableOpacity>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row', backgroundColor: '#202030', borderRadius: 38, height: 82, width: 263, marginBottom: 40, justifyContent: "space-between", alignItems: 'center', paddingHorizontal: 15
    },
    tabTitle: {
        fontFamily: 'MavenProBold', fontSize: 19
    },
    tabIcon: {
        borderRadius: 50, height: 56, width: 56, justifyContent: "center", alignItems: 'center'
    }
})