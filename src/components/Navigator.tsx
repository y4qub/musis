import React from 'react';
import { MapScreen } from "../screens/MapScreen";
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import TabBarIcon from "./TabBarIcon";
import Colors from '../constants/Colors';
// import { FriendsScreen } from '../screens/FriendsScreen';

const MapStack = createStackNavigator({
    Map: {
        screen: MapScreen,
    }
}, { headerMode: 'none' })

MapStack.navigationOptions = {
    tabBarIcon: ({ focused }) => (
        <TabBarIcon focused={focused} name={'md-map'} />
    )
}

// const FriendsStack = createStackNavigator({
//     Friends: {
//         screen: FriendsScreen,
//         navigationOptions: { title: 'Friends', headerStyle: { backgroundColor: Colors.primary }, headerTitleStyle: { color: 'white' } },
//     }
// }, { headerMode: 'float' })

// FriendsStack.navigationOptions = {
//     tabBarIcon: ({ focused }) => (
//         <TabBarIcon focused={focused} name={'md-contact'} />
//     )
// }

const TabNavigator = createBottomTabNavigator({
    Discover: MapStack,
    // Friends: FriendsStack
}, { tabBarOptions: { style: { backgroundColor: Colors.primary }, activeTintColor: 'white', inactiveTintColor: '#ffd7d6' } })

export default createAppContainer(TabNavigator)