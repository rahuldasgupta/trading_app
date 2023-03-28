import React from "react";
import { Image, View, Dimensions, Text, TouchableOpacity } from "react-native";
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

const windowHeight = Dimensions.get('window').height;

export default class home extends React.Component {
    constructor(props) {
        super(props);    
        this.state = {
            email: ""
        };
    }
    handleLogin = () => {
      this.props.navigation.navigate("Login")
    }
    async componentDidMount(){
        NavigationBar.setBackgroundColorAsync("white");
        NavigationBar.setButtonStyleAsync("dark");
    }
    render(){
        return(
            <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, height: windowHeight}}>
                <StatusBar backgroundColor={"#fff"} style="dark" />
                <View style={{margin:"7%", marginTop:"20%"}}>
                    <Image source={require("../../assets/upstox.png")} style={{height: 75, width: 75, marginLeft: -10}}/>
                    <Text style={{fontSize: 40, color:"#03314b"}}>Investing</Text>
                    <Text style={{fontSize: 40, fontWeight:"bold", color:"#03314b"}}>made simple.</Text>
                    <View style={{marginTop: 20, flexDirection:"row", alignItems:"center"}}>
                        <AntDesign name="adduser" size={25} color="#464d6c" style={{padding: 10, backgroundColor:"#F4F7FF", borderRadius: 100}}/>
                        <Text style={{marginLeft: 10, color:"#03314b", fontSize: 15, fontFamily:"Lato-Regular"}}>Free Demate account opening</Text>
                    </View>
                    <View style={{marginTop: 10, flexDirection:"row", alignItems:"center"}}>
                        <AntDesign name="filetext1" size={25} color="#464d6c" style={{padding: 10, backgroundColor:"#F4F7FF", borderRadius: 100}}/>
                        <Text style={{marginLeft: 10, color:"#03314b", fontSize: 15, fontFamily:"Lato-Regular"}}>100% Paperless</Text>
                    </View>
                    <View style={{marginTop: 10, flexDirection:"row", alignItems:"center"}}>
                        <MaterialIcons name="exposure-zero" size={30} color="#464d6c" style={{padding: 7, backgroundColor:"#F4F7FF", borderRadius: 100}}/>
                        <Text style={{marginLeft: 10, color:"#03314b", fontSize: 15, fontFamily:"Lato-Regular"}}>Zero hidden charges</Text>
                    </View>
                    <View style={{marginTop: "7%", flexDirection:"row", justifyContent:"space-between", marginLeft:"4%", marginRight:"5%"}}>
                        <View
                            style={{height: 95, backgroundColor:"#fff", alignItems:"center", justifyContent:"center",}}>
                            <Image source={require("../../assets/mutualfund.png")} style={{height: 40, width: 40, marginTop: -4}}/>
                            <Text style={{color:"#03314b", marginTop: 8, fontSize: 16, fontFamily:"Lato-Bold"}}>Funds</Text>
                        </View>
                        <View
                            style={{height: 95, backgroundColor:"#fff", alignItems:"center", justifyContent:"center",}}>
                            <Image source={require("../../assets/stock.png")} style={{height: 37, width: 37}}/>
                            <Text style={{fontFamily:"Lato-Bold", color:"#03314b", marginTop: 8, fontSize: 16}}>Stocks</Text>
                        </View>
                        <View
                            style={{height: 95, backgroundColor:"#fff", alignItems:"center", justifyContent:"center"}}>
                            <Image source={require("../../assets/intraday.png")} style={{height: 37, width: 37}}/>
                            <Text style={{ fontFamily:"Lato-Bold", color:"#03314b", marginTop: 8, fontSize: 16}}>Intraday</Text>
                        </View>
                    </View>
                    
                </View>
                <View style={{position:"absolute", bottom: 10, justifyContent:"center", alignSelf:"center"}}>
                    <View>
                        <TouchableOpacity onPress={this.handleLogin} style={{borderRadius: 8,  height: 52, backgroundColor: "#1dcc98", width: "100%", justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
                            <Text style={{color: "#fff", fontSize: 17.5, marginTop: -1, fontFamily:"Lato-Bold"}}>Get started</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{marginTop: 10}}>
                        <Text style={{textAlign:"center", color:"#B1B1B1", fontSize: 13.}}>By proceeding, I accept{"\n"}Your Brand's <Text style={{fontWeight:"bold", color:"gray"}}>Privacy Policy</Text> and <Text style={{fontWeight:"bold", color:"gray"}}>Terms & Condition</Text></Text>
                    </View>
                </View>
            </View>
        );
    }
}