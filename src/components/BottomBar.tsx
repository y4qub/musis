import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Tab } from "../interfaces/tab";
import { backendService } from "../services/backend";
import Colors from "../constants/colors";
import { TabIcon } from "./TabIcon";

interface IProps {
    activeTab: Tab
    show: boolean
}

interface IState { }

export class BottomBar extends React.Component<IProps, IState> {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            this.props.show ? this.bottomBar() : null
        )
    }

    bottomBar = () => {
        const exploreColor = this.props.activeTab == 'explore'
            ? Colors.accent : Colors.backgroundLight
        const chatsColor = this.props.activeTab == 'chats'
            ? Colors.primary : Colors.backgroundLight
        const tabName = this.props.activeTab.charAt(0).toUpperCase()
            + this.props.activeTab.substring(1)
            
        return (<View style={styles.tabBar}>

            <TabIcon name='explore' action={_ => backendService.changeTab('explore')} backgroundColor={exploreColor} />

            <Text
                style={{
                    ...styles.tabTitle,
                    color: this.props.activeTab == 'explore'
                        ? exploreColor : chatsColor
                }}>
                {tabName}
            </Text>

            <TabIcon name='chats' action={_ => backendService.changeTab('chats')} backgroundColor={chatsColor} />

        </View>)
    }

}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 38, height: 82, width: 263, marginBottom: 40 ,justifyContent: "space-between", alignItems: 'center', paddingHorizontal: 15
    },
    tabTitle: {
        fontFamily: 'MavenProBold', fontSize: 19
    }
})