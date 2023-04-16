import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import {
    getAuth,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
  } from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Divider } from 'react-native-paper';
import { ScrollView } from "react-native-gesture-handler";

const firebaseConfig = {
    apiKey: "AIzaSyAn3ZBRbTsPayK-lQ-pYKLDXFl3dpEeZMo",
    authDomain: "tradingapp-e9640.firebaseapp.com",
    projectId: "tradingapp-e9640",
    storageBucket: "tradingapp-e9640.appspot.com",
    messagingSenderId: "953809279589",
    appId: "1:953809279589:web:4dc86dca19957eb629848c",
    measurementId: "G-STVY05ZTL9"
};

export default class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      currentView:"All",
      userData: {},
      transactions: [],
    };
  }
  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
    NavigationBar.setButtonStyleAsync("dark");
    this.getUserData()
    this.focusListener = this.props.navigation.addListener('focus', () => {
        this.getUserData()
    });
  }
  getUserData = async () => {
    let userData = await AsyncStorage.getItem('userData');
    let parsed = JSON.parse(userData);
    let email = parsed.email;
    let data = {}

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        data=doc.data()
        this.setState({
            userData: data,
            transactions: data.transactions
        })
    });
  }
  render() {
    return (
      <View style={{backgroundColor:"#fff", flex: 1}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flexDirection:"row",  padding: "3%",}}>
                <TouchableOpacity style={{backgroundColor: this.state.currentView === "All" ? "#1dcc98" : "#FFF", borderWidth:1, borderColor:"#1dcc98", marginRight: 10, width: 90, paddingTop:9, paddingBottom: 9, borderRadius: 5}} onPress={() => this.setState({currentView:"All"})}>
                    <Text style={{color: this.state.currentView === "All" ? "#fff" : "#6B6B6B", fontFamily:"Lato-Bold", fontSize: 17, textAlign:"center"}}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentView === "Buy" ? "#1dcc98" : "#FFF", borderWidth:1, borderColor:"#1dcc98", marginRight: 10, width: 90, paddingTop:9, paddingBottom: 9, borderRadius: 5}} onPress={() => this.setState({currentView:"Buy"})}>
                    <Text style={{color: this.state.currentView === "Buy" ? "#fff" : "#6B6B6B", fontFamily:"Lato-Bold", fontSize: 17, textAlign:"center"}}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentView === "Sell" ? "#1dcc98" : "#FFF", borderWidth:1, borderColor:"#1dcc98", width: 90, paddingTop:9, paddingBottom: 9, borderRadius: 5}} onPress={() => this.setState({currentView:"Sell"})}>
                    <Text style={{color: this.state.currentView === "Sell" ? "#fff" : "#6B6B6B", fontFamily:"Lato-Bold", fontSize: 17, textAlign:"center"}}>Sell</Text>
                </TouchableOpacity>
            </View>
            {
                this.state.currentView === "All" ?
                <>
                    {
                        this.state.transactions.length > 0 ?
                        <>
                            {
                                this.state.transactions.map((item, key) =>(
                                <View>
                                        <View style={{marginTop: 9, marginBottom: 9, padding: "3%",}}>
                                            {
                                                key == 0 ?
                                                <Text style={{color:"#999999", fontSize: 17, fontFamily:"Lato-Bold", marginBottom: 15}}>{item.date}</Text>
                                                :
                                                <></>
                                            }
                                            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                                                <Text style={{color:"#B2B2B2", fontSize: 13.5, fontFamily:"Lato-Regular"}}>{item.time}</Text>
                                                <Text style={{color: item.mode === "buy" ? "#1dcc98" : "#da540d", fontSize: 15, textTransform:"capitalize", fontFamily:"Lato-Bold"}}>{item.mode}</Text>
                                            </View>
                                            <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 5, alignItems:"center"}}>
                                                <Text style={{color:"#222", fontSize: 14.5, fontFamily:"Lato-Bold"}}>{item.name}</Text>
                                                <Text style={{fontFamily:"Lato-Regular"}}>{item.quantity}</Text>
                                            </View>
                                            <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 2, alignItems:"center"}}>
                                                <Text style={{color:"#777777", fontSize: 14, fontFamily:"Lato-Regular"}}>{item.symbol} / NSE</Text>
                                                <Text>Avg ₹{item.price}</Text>
                                            </View>
                                            
                                    </View>
                                    <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
                                </View>
                                ))
                            }
                        </>
                        :
                        <></>
                    }
                </>
                :
                <></>
            }
            {
                this.state.currentView === "Buy" ?
                <>
                    {
                        this.state.transactions.length > 0 ?
                        <>
                            {
                                this.state.transactions.map((item, key) =>(
                                <>
                                {
                                    item.mode === "buy" ? 
                                        <View>
                                            <View style={{marginTop: 9, marginBottom: 9, padding: "3%",}}>
                                                {
                                                    key == 0 ?
                                                    <Text style={{color:"#999999", fontSize: 17, fontFamily:"Lato-Bold", marginBottom: 15}}>{item.date}</Text>
                                                    :
                                                    <></>
                                                }
                                                <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                                                    <Text style={{color:"#B2B2B2", fontSize: 13.5, fontFamily:"Lato-Regular"}}>{item.time}</Text>
                                                    <Text style={{color: item.mode === "buy" ? "#1dcc98" : "#da540d", fontSize: 15, textTransform:"capitalize", fontFamily:"Lato-Bold"}}>{item.mode}</Text>
                                                </View>
                                                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 5, alignItems:"center"}}>
                                                    <Text style={{color:"#222", fontSize: 14.5, fontFamily:"Lato-Bold"}}>{item.name}</Text>
                                                    <Text style={{fontFamily:"Lato-Regular"}}>{item.quantity}</Text>
                                                </View>
                                                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 2, alignItems:"center"}}>
                                                    <Text style={{color:"#777777", fontSize: 14, fontFamily:"Lato-Regular"}}>{item.symbol} / NSE</Text>
                                                    <Text>Avg ₹{item.price}</Text>
                                                </View>
                                                
                                            </View>
                                            <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
                                        </View>
                                    :
                                        <></>
                                }
                                </>
                                ))
                            }
                        </>
                        :
                        <></>
                    }
                </>
                :
                <></>
            }
            {
                this.state.currentView === "Sell" ?
                <>
                    {
                        this.state.transactions.length > 0 ?
                        <>
                            {
                                this.state.transactions.map((item, key) =>(
                                <>
                                {
                                    item.mode === "sell" ? 
                                        <View>
                                            <View style={{marginTop: 9, marginBottom: 9, padding: "3%",}}>
                                                {
                                                    key == 0 ?
                                                    <Text style={{color:"#999999", fontSize: 17, fontFamily:"Lato-Bold", marginBottom: 15}}>{item.date}</Text>
                                                    :
                                                    <></>
                                                }
                                                <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                                                    <Text style={{color:"#B2B2B2", fontSize: 13.5, fontFamily:"Lato-Regular"}}>{item.time}</Text>
                                                    <Text style={{color: item.mode === "buy" ? "#1dcc98" : "#da540d", fontSize: 15, textTransform:"capitalize", fontFamily:"Lato-Bold"}}>{item.mode}</Text>
                                                </View>
                                                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 5, alignItems:"center"}}>
                                                    <Text style={{color:"#222", fontSize: 14.5, fontFamily:"Lato-Bold"}}>{item.name}</Text>
                                                    <Text style={{fontFamily:"Lato-Regular"}}>{item.quantity}</Text>
                                                </View>
                                                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 2, alignItems:"center"}}>
                                                    <Text style={{color:"#777777", fontSize: 14, fontFamily:"Lato-Regular"}}>{item.symbol} / NSE</Text>
                                                    <Text>Avg ₹{item.price}</Text>
                                                </View>
                                                
                                            </View>
                                            <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
                                        </View>
                                    :
                                        <></>
                                }
                                </>
                                ))
                            }
                        </>
                        :
                        <></>
                    }
                </>
                :
                <></>
            }
        </ScrollView>
      </View>
    );
  }
}