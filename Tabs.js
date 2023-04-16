import React from 'react';
import {
  View, Text, Image,
  SafeAreaView
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import { Feather, Fontisto } from '@expo/vector-icons';


//Pages
import Dashboard from './src/pages/Dashboard';
import Search from './src/pages/Search';
import Watchlist from './src/pages/Watchlist';
import Account from './src/pages/Account';
import Stock from './src/pages/Stock';
import BuySell from './src/pages/BuySell';
import Portfolio from './src/pages/Portfolio';
import Transactions from './src/pages/Transactions';


const Tab = createBottomTabNavigator();

const DashboardStack = createStackNavigator();
const WatchlistStack = createStackNavigator();
const AccountStack = createStackNavigator();
const PortfolioStack = createStackNavigator();
const TransactionStack = createStackNavigator();

const DashboardStackScreen = ({navigation}) => {
  return (
    <DashboardStack.Navigator initialRouteName='Dashboard'>
        <DashboardStack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{headerShown: false}}
        />
        <DashboardStack.Screen
          name="Search"
          component={Search}
          options={{headerShown: false}}
        />
        <DashboardStack.Screen
          name="Stock"
          component={Stock}
          options={{headerShown: false}}
        />
         <DashboardStack.Screen
          name="BuySell"
          component={BuySell}
          options={{headerShown: false}}
        />
    </DashboardStack.Navigator>
  );
};
const WatchlistStackScreen = ({navigation}) => {
    return (
      <WatchlistStack.Navigator initialRouteName='Watchlist'>
        <WatchlistStack.Screen
          name="Watchlist"
          component={Watchlist}
          options={() => ({
            headerLeft: null,
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 5,
              height: 85,
            },
            headerTintColor: "#222",
            headerTitleStyle: {
              marginLeft: 7,
              textAlign: "left",
              fontSize: 20,
              fontFamily:"Lato-Regular",
            },
         })}
        />
      </WatchlistStack.Navigator>
    );
};
const PortfolioStackScreen = ({navigation}) => {
  return (
    <PortfolioStack.Navigator initialRouteName='Dashboard'>
        <PortfolioStack.Screen
          name="Portfolio"
          component={Portfolio}
          options={{headerShown: false}}
        />
      </PortfolioStack.Navigator>
  );
};
const AccountStackScreen = ({navigation}) => {
  return (
    <AccountStack.Navigator initialRouteName='Dashboard'>
        <AccountStack.Screen
          name="Account"
          component={Account}
          options={() => ({
            headerLeft: null,
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 5,
              height: 85
            },
            headerTintColor: "#222",
            headerTitleStyle: {
            marginLeft: 7,
            textAlign: "left",
            fontSize: 20,
            },
         })}
        />
      </AccountStack.Navigator>
  );
};
const TransactionStackScreen = ({navigation}) => {
  return (
    <TransactionStack.Navigator initialRouteName='Dashboard'>
        <TransactionStack.Screen
          name="Transactions"
          component={Transactions}
          options={() => ({
            headerLeft: null,
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 5,
              height: 85,
              borderBottomWidth: 0.5
            },
            headerTintColor: "#222",
            headerTitleStyle: {
              marginLeft: 7,
              textAlign: "left",
              fontSize: 20,
              fontFamily:"Lato-Regular",
            },
         })}
        />
      </TransactionStack.Navigator>
  );
};
const Tabs = () => {
  return (
    <SafeAreaView style={{ flex: 1}}>
      <Tab.Navigator
        initialRouteName="Dashboard"
        tabBarOptions={{
          showLabel: false,
          keyboardHidesTabBar: true,
          style: {
            height: 66,
            backgroundColor: '#fff',
            width: "100%", paddingTop: 5, alignItems:"center"
          },
        }}>
          <Tab.Screen
            name="Dashboard"
            component={DashboardStackScreen}
            options={({navigation}) => ({
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <View style={{alignItems:"center", backgroundColor:"#1dcc98", padding: 11, borderRadius: 100, marginTop: -3}}>
                      <Image source={require("./assets/dashboard_white.png")} style={{height: 23, width: 23}} />
                    </View>
                  ) : (
                    <View style={{alignItems:"center"}}>
                       <Image source={require("./assets/dashboard.png")} style={{height: 24, width: 24}} />
                      <Text style={{color:"#222", fontSize: 12, marginTop: 5}}>Dashboard</Text>
                    </View>
                  ),
              })}
          />
          <Tab.Screen
            name="Watchlist"
            component={WatchlistStackScreen}
            options={({navigation}) => ({
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <View style={{alignItems:"center", backgroundColor:"#1dcc98", padding: 11, borderRadius: 100, marginTop: -3,}}>
                      <Image source={require("./assets/bookmark_white.png")} style={{height: 23, width: 23}} />
                    </View>
                  ) : (
                    <View style={{alignItems:"center"}}>
                      <Fontisto name="bookmark"  size={24} color="#222" />
                      <Text style={{color:"#222", fontSize: 12, marginTop: 5}}>Watchlist</Text>
                    </View>
                  ),
              })}
          />
          <Tab.Screen
            name="Portfolio"
            component={PortfolioStackScreen}
            options={({navigation}) => ({
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <View style={{alignItems:"center", backgroundColor:"#1dcc98", padding: 11, borderRadius: 100, marginTop: -3,}}>
                      <Image source={require("./assets/portfolio_white.png")} style={{height: 23, width: 23}} />
                    </View>
                  ) : (
                    <View style={{alignItems:"center"}}>
                       <Image source={require("./assets/portfolio.png")} style={{height: 24, width: 24}} />
                      <Text style={{color:"#222", fontSize: 12, marginTop: 5}}>Portfolio</Text>
                    </View>
                  ),
              })}
          />
          <Tab.Screen
            name="Orders"
            component={TransactionStackScreen}
            options={({navigation}) => ({
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <View style={{alignItems:"center", backgroundColor:"#1dcc98", padding: 11, borderRadius: 100, marginTop: -3,}}>
                      <Image source={require("./assets/book_white.png")} style={{height: 23, width: 23}} />
                    </View>
                  ) : (
                    <View style={{alignItems:"center"}}>
                       <Image source={require("./assets/book.png")} style={{height: 24, width: 24}} />
                      <Text style={{color:"#222", fontSize: 12, marginTop: 5}}>Transactions</Text>
                    </View>
                  ),
              })}
          />
          <Tab.Screen
            name="Workshop"
            component={AccountStackScreen}
            options={({navigation}) => ({
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <View style={{alignItems:"center", backgroundColor:"#1dcc98", padding: 11, borderRadius: 100, marginTop: -3,}}>
                      <Image source={require("./assets/user_white.png")} style={{height: 23, width: 23}} />
                    </View>
                  ) : (
                    <View style={{alignItems:"center"}}>
                       <Image source={require("./assets/user.png")} style={{height: 24, width: 24}} />
                      <Text style={{color:"#222", fontSize: 12, marginTop: 5}}>Account</Text>
                    </View>
                  ),
              })}
          />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default Tabs;