import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import icons from "../constants/icons";
import { Tab } from "../interfaces/tab";
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps {
    name: Tab,
    backgroundColor: string,
    action: Function
}

export class TabIcon extends React.Component<IProps, {}> {
    render() {
        return (
        <TouchableOpacity
            style={{ ...styles.tabIcon, backgroundColor: this.props.backgroundColor }}
            onPress={_ => this.props.action()}>
            <Icon name={icons[this.props.name]} size={28} color={'white'} />
        </TouchableOpacity>)
    }
}

const styles = StyleSheet.create({
    tabIcon: {
        borderRadius: 50, height: 56, width: 56, justifyContent: "center", alignItems: 'center'
    }
})