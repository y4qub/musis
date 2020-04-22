import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import React from "react";
import { Tab } from "../interfaces/tab";
import Icon from 'react-native-vector-icons/Ionicons';
import { backendService } from "../services/backend";
import Colors from "../constants/Colors";

interface IProps {
    activeTab: Tab
    show: boolean
}

interface IState { }

export class BottomBar extends React.Component<IProps, IState> {

    iconSize = 28
    iconColor = 'white'

    constructor(props) {
        super(props)
    }

    render() {
        return (
            this.props.show ? this.bottomBar() : null
        )
    }

    bottomBar = () => {
        const exploreColor = this.props?.activeTab == 'explore' ? Colors.primary : '#2C2C41'
        const profileColor = this.props?.activeTab == 'chats' ? '#309EFF' : '#2C2C41'
        const tabName = this.props.activeTab.charAt(0).toUpperCase() + this.props.activeTab.substring(1)
        return (<View style={styles.tabBar}>

            <TouchableOpacity
                style={{ ...styles.tabIcon, backgroundColor: exploreColor }}
                onPress={_ => backendService.changeTab('explore')}>
                <Icon name="md-map" size={this.iconSize} color={this.iconColor} />
            </TouchableOpacity>

            <Text
                style={{
                    ...styles.tabTitle,
                    color: this.props?.activeTab == 'explore' ? exploreColor : profileColor
                }}>
                {tabName}
            </Text>

            <TouchableOpacity
                style={{ ...styles.tabIcon, backgroundColor: profileColor }}
                onPress={_ => backendService.changeTab('chats')}>
                <Icon name="md-chatbubbles" size={this.iconSize} color={this.iconColor} />
            </TouchableOpacity>

        </View>)
    }
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row', backgroundColor: Colors.primaryBg, borderRadius: 38, height: 82,
        width: 263, marginBottom: 40, justifyContent: "space-between", alignItems: 'center',
        paddingHorizontal: 15
    },
    tabTitle: {
        fontFamily: 'MavenProBold', fontSize: 19
    },
    tabIcon: {
        borderRadius: 50, height: 56, width: 56, justifyContent: "center", alignItems: 'center'
    }
})