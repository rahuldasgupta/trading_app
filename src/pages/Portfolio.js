import React, { Component } from "react";
import { Text, View, Dimensions, Image, TouchableOpacity, RefreshControl} from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Divider } from 'react-native-paper';
import {initializeApp} from 'firebase/app';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import { ScrollView } from "react-native-gesture-handler";

const windowHeight = Dimensions.get('window').height;
const firebaseConfig = {
    apiKey: "AIzaSyAn3ZBRbTsPayK-lQ-pYKLDXFl3dpEeZMo",
    authDomain: "tradingapp-e9640.firebaseapp.com",
    projectId: "tradingapp-e9640",
    storageBucket: "tradingapp-e9640.appspot.com",
    messagingSenderId: "953809279589",
    appId: "1:953809279589:web:4dc86dca19957eb629848c",
    measurementId: "G-STVY05ZTL9"
  };

export default class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
        email: "",
        userData: {},
        stocksData: [],
        portfolio: {},
        symbolArr: [],
        photoURL: "https://firebasestorage.googleapis.com/v0/b/wigglycherry-5443a.appspot.com/o/user_img.png?alt=media&token=8c3e3154-07b8-492e-bb1d-f3ce77d52eed",

        holdingsCount: 0,
        totalInvested: 0,
        currentPNL: 0,
        refreshing: false
    };
  }
    async componentDidMount(){
        NavigationBar.setBackgroundColorAsync("#fff");
        NavigationBar.setButtonStyleAsync("dark");

        this.getUserData()
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
              photoURL: data.photoURL
          })
          
      });
      this.checkStockInPortfolio(data.stocksOwned)
    }
    checkStockInPortfolio = (stockArr) => {
        let filteredStockArray = stockArr.filter(item => item.quantity !== 0);
        this.setState({
          stocksData: filteredStockArray
        })
        let holdingsCount = filteredStockArray.length;
        let totalInvested = 0
        let symbolArr = []
        for(let i=0; i<filteredStockArray.length; i++){
            let quantity = Number(filteredStockArray[i].quantity)
            let averagePrice = Number(filteredStockArray[i].averagePrice)
            let totalPrice = quantity*averagePrice
            totalInvested = totalInvested + Number(totalPrice)
            symbolArr.push(filteredStockArray[i].symbol)
        }
        this.setState({
            holdingsCount,
            totalInvested,
            symbolArr
        })
        this.checkCurrentPrice()
    }
    checkCurrentPrice = async() => {
        let symbolArr = this.state.symbolArr;
        let stocksData = this.state.stocksData;
        /*const options = {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
              'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
            }
        };*/
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'c4357b3942mshb8900c396dcdafep15c6adjsnee149812ad20',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
          }
        };
        let i = 0
        console.log(stocksData.length)
        for(i; i < stocksData.length; i++){
            let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'+ symbolArr[i] +'/financial-data'
            console.log(url)
            await fetch(url, options)
                .then(response => response.json())
                .then((response) => {
                    if(response.financialData.currentPrice.raw){
                        stocksData[i].currentPrice = response.financialData.currentPrice.raw
                    }
                })
                .catch((err) => {
                    console.log(err)
                });
        }
        this.setState({
            stocksData: stocksData
        })
        this.checkPNL(stocksData)
    }
    checkPNL= (stockArr) => {
        let totalInvested = 0
        for(let i=0; i<stockArr.length; i++){
            let quantity = Number(stockArr[i].quantity)
            let currentPrice = Number(stockArr[i].currentPrice)
            let totalPrice = quantity*currentPrice
            totalInvested = totalInvested + Number(totalPrice)
        }
        this.setState({
            currentPNL: totalInvested,
            refreshing: false
        })
    }
    _onRefresh = () => {
      this.setState({refreshing: true,});
      this.componentDidMount()
    }
    handleNavigation = (name, symbol) => {
      this.props.navigation.navigate("Stock", {stockName: name, symbol: symbol})
    }
  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, minHeight: windowHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <ScrollView style={{marginBottom: 60}} showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
              />
            }
        >
            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", margin: "5%",}}>
              <View style={{alignItems:"center", flexDirection:"row"}}>
                <Image source={{ uri: this.state.photoURL}} style={{height: 45, width: 45, borderRadius: 45/2}}/>
                <View>
                  <Text style={{color:"#03314b", fontFamily:"Lato-Bold", marginLeft: 10, fontSize: 15, opacity: 0.5, marginTop: -5}}>Welcome</Text>
                  <Text style={{color:"#03314b",  fontFamily:"Lato-Bold", marginLeft: 10, fontSize: 15}}>{this.state.userData.fullName}</Text>
                </View>
              </View>
              <View style={{alignItems:"center", flexDirection:"row"}}>
                <TouchableOpacity  onPress={() => this.props.navigation.navigate("Search")}>
                  <Feather name="search" size={24} color="#03314b" style={{marginRight: 10}} />
                </TouchableOpacity>
                <Ionicons name="notifications-outline" size={24} color="#03314b" />
              </View>
            </View>
            <View style={{backgroundColor:"#1ecb98", width:"90%", borderRadius: 25, margin:"5%", padding:"5%", paddingTop:"7%", marginTop: 0, }}>
              <View style={{justifyContent:"space-between", flexDirection:"row", flexWrap:"wrap"}}>
                <View>
                    <Text style={{color:"#fff", opacity: 0.9, textAlign:"left"}}>Invested</Text>
                    <Text style={{color:"#fff", fontSize: 25, textAlign:"left"}}>₹{(this.state.totalInvested).toFixed(1)}</Text>
                </View>
                <View>
                    <Text style={{color:"#fff", opacity: 0.9, textAlign:"right"}}>Total Returns</Text>
                    <Text style={{color:"#fff", fontSize: 25, textAlign:"right"}}>{(this.state.currentPNL-this.state.totalInvested).toFixed(1)}</Text>
                </View>
              </View>
              <View style={{justifyContent:"space-between", flexDirection:"row", flexWrap:"wrap"}}>
                <View style={{marginTop: 7}}>
                    <Text style={{color:"#fff", opacity: 0.9, textAlign:"left"}}>Current</Text>
                    <Text style={{color:"#fff", fontSize: 25, textAlign:"left"}}>₹{(this.state.currentPNL).toFixed(1)}</Text>
                </View>
                <View style={{marginTop: 7}}>
                    <Text style={{color:"#fff", opacity: 0.9, textAlign:"right"}}>Holdings</Text>
                    <Text style={{color:"#fff", fontSize: 25, textAlign:"right"}}>{this.state.holdingsCount}</Text>
                </View>
              </View>
            </View>
            <View style={{ marginTop: "2%"}}>
              {
                this.state.stocksData.length > 0 ?
                <>
                  {
                      this.state.stocksData.map((item, key) =>(
                          <>
                              <TouchableOpacity  onPress={() => this.handleNavigation(item.name, item.symbol)}>
                                <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginLeft:"7%", marginRight:"7%"}}>
                                    <View>
                                        <Text style={{fontSize: 17, fontWeight:"bold", color:"#03314b", marginBottom: 3}}>{item.name}</Text>
                                        <Text style={{fontSize: 14, color:"#03314b"}}>{item.quantity} Shares @ ₹{item.averagePrice}</Text>
                                    </View>
                                    {
                                      item.currentPrice ?
                                        <View>
                                            <Text style={{fontSize: 16, fontWeight:"bold", color:(Number(item.quantity)*Number(item.currentPrice))-(Number(item.quantity)*Number(item.averagePrice)) >= 0 ? "#1dcc98" : "#da540d", marginBottom: 3}}>{((Number(item.quantity)*Number(item.currentPrice))-(Number(item.quantity)*Number(item.averagePrice))).toFixed(1)}</Text>
                                        </View>
                                        :
                                        <View>
                                          <Text style={{fontSize: 16, fontWeight:"bold", color:"#1dcc98", marginBottom: 3}}>0.00</Text>
                                      </View>
                                    }
                                    
                                </View>
                              </TouchableOpacity>
                              <Divider style={{height: 0.8, backgroundColor: '#E2E2E2',  marginTop:12.5, marginBottom: 12.5}}/>
                          </>
                      ))
                  }
                </>
                :
                <Image source={require("../../assets/Empty.gif")} style={{height: 300, marginTop:"5%", width: 300, alignItems:"center", alignSelf:"center"}}/>
              }
                
              </View>
        </ScrollView>
      </View>
    );
  }
}
