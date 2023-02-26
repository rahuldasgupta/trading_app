import React from "react";
import { Image, View, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default class splash extends React.Component {
    constructor(props) {
        super(props);    
        this.state = {
            userData: {},
        };
    }
    checkLogin = async () => {
        let user = await AsyncStorage.getItem('userData');
        let parsed = JSON.parse(user);
        if(parsed){
            this.props.navigation.navigate("Tabs")
        }
        else{
            this.props.navigation.navigate("Home");
        }
    }
    async componentDidMount(){
        NavigationBar.setBackgroundColorAsync("white");
        NavigationBar.setButtonStyleAsync("dark");
        this.checkLogin();
    }
    render(){
        return(
            <View style={{flex: 1, alignItems: "center", alignSelf:"center", justifyContent:"center", marginTop: Constants.statusBarHeight}}>
                <StatusBar backgroundColor={"#fff"} style="dark" />
                <Image
                      source={require("../../assets/splash.png")}
                      style={{
                      height: windowHeight,
                      width: windowWidth,
                      resizeMode:"cover"
                    }}
                />
            </View>
        );
    }
}