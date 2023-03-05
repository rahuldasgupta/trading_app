import React, { Component } from "react";
import { Text, View, Dimensions, Image, ScrollView, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { Feather, AntDesign } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge, Divider } from 'react-native-paper';

const windowHeight = Dimensions.get('window').height;

const firebaseConfig = {
  apiKey: "AIzaSyD5Am1-f0wOX8H7CL-rZDMi7zv4cFfxQdE",
  authDomain: "wigglycherry-5443a.firebaseapp.com",
  databaseURL: "https://wigglycherry-5443a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wigglycherry-5443a",
  storageBucket: "wigglycherry-5443a.appspot.com",
  messagingSenderId: "12034827552",
  appId: "1:12034827552:web:0a5a81fb0d7b71568f6345",
  measurementId: "G-6MT19GTMWQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: {},
      email: "",
      photoURL: "https://firebasestorage.googleapis.com/v0/b/wigglycherry-5443a.appspot.com/o/user_img.png?alt=media&token=8c3e3154-07b8-492e-bb1d-f3ce77d52eed",
      indexArray: [],
      topGainers: [],
      topLosers: [],
      topGainersFinal: [],
      topLosersFinal: [],
      loaderModal: true,
    };
  }

  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#E7E7E7");
    NavigationBar.setButtonStyleAsync("dark");

    this.getIndexData();
    this.getMarketMovers()

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          userData: user,
          email: user.email
        })
      }
    });
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
            photoURL: data.photoURL,
        })
    });
  }
  handleNavigation = (symbol) => {
    this.props.navigation.navigate("Stock", {symbol: symbol})
  }
  getIndexData = async() => {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
      }
    };
    
    fetch('https://yh-finance.p.rapidapi.com/market/v2/get-summary?region=IN', options)
      .then(response => response.json())
      .then((response) => {
        let emptyIndexArray = []
        let NSE = response.marketSummaryAndSparkResponse.result.filter(item => item.shortName === "Nifty 50");
        emptyIndexArray.push(NSE)
        let BSE = response.marketSummaryAndSparkResponse.result.filter(item => item.shortName === "BSE SENSEX");
        emptyIndexArray.push(BSE)
        this.setState({
          indexArray: emptyIndexArray
        })
        console.log("INDEX ====>", this.state.indexArray)
      })
      .catch(err => console.error("INDEX ERROR ==>", err));
  }
  getMarketMovers = async() => {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
      }
    };
    
    fetch('https://yh-finance.p.rapidapi.com/market/v2/get-movers?region=IN&lang=en-US&count=5&start=0', options)
      .then(response => response.json())
      .then((response) => {
        let emptyGainersArray = [];
        let emptyLosersArray = [];
        let gainersResponse = response.finance.result[0].quotes;
        for (let i = 0; i < gainersResponse.length; i++) {
          emptyGainersArray.push(gainersResponse[i].symbol)
        }
        
        let losersResponse = response.finance.result[1].quotes;
        for (let i = 0; i < losersResponse.length; i++) {
          emptyLosersArray.push(losersResponse[i].symbol)
        }

        let gainersSorted = emptyGainersArray.filter(item => !item.includes("-"));
        let losersSorted = emptyLosersArray.filter(item => !item.includes("-"));

        console.log("TOP GAINERS ==>", gainersSorted)
        this.setState({
          topGainers: gainersSorted,
          topLosers: losersSorted
        })
        this.renderTopGainers()
        this.renderLosersGainers()
      })
      .catch(err => console.error(err));
  }
  renderTopGainers = async() => {
    let finalData = []
    let topGainers = this.state.topGainers
    let stockName = []
    let stockPrice = []
    let deleteArray = []

    const options = {
      method: 'GET',
      eaders: {
        'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    };

    const options2 = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
      }
    };

    for (let i = 0; i < topGainers.length; i++) {
      let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'+ topGainers[i] +'/financial-data'
      console.log(url)
      await fetch(url, options)
        .then(response => response.json())
        .then((response) => {
          stockPrice.push(response.financialData.currentPrice.raw)
        })
        .catch((err) => {
          deleteArray.push(i);
        });
    }
    for(let j = 0; j < deleteArray.length; j++){
      topGainers.splice(deleteArray[j], 1);
    }
    for(let k = 0; k < topGainers.length; k++){
      await fetch('https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbol=' + topGainers[k] +'&region=IN', options2)
        .then(response => response.json())
        .then((response) => {
          stockName.push(response.quoteType.shortName)
        })
        .catch(err => console.error(err));
    }
    for(let l = 0; l < topGainers.length; l++){
      let symbol = topGainers[l];
      let price = stockPrice[l]
      let name = stockName[l];

      finalData.push(
        {
          "symbol": symbol,
          "price": price,
          "name" : name
        }
      )
    }
    console.log("FINAL DATA ===> ", finalData)
    this.setState({
      topGainersFinal: finalData
    })
  }
  renderLosersGainers = async() => {
    let finalData = []
    let topLosers = this.state.topLosers
    let stockName = []
    let stockPrice = []
    let deleteArray = []

    const options = {
      method: 'GET',
      eaders: {
        'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    };

    const options2 = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
      }
    };

    for (let i = 0; i < topLosers.length; i++) {
      let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'+ topLosers[i] +'/financial-data'
      console.log(url)
      await fetch(url, options)
        .then(response => response.json())
        .then((response) => {
          stockPrice.push(response.financialData.currentPrice.raw)
        })
        .catch((err) => {
          deleteArray.push(i);
        });
    }
    for(let j = 0; j < deleteArray.length; j++){
      topLosers.splice(deleteArray[j], 1);
    }
    for(let k = 0; k < topLosers.length; k++){
      await fetch('https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbol=' + topLosers[k] +'&region=IN', options2)
        .then(response => response.json())
        .then((response) => {
          stockName.push(response.quoteType.shortName)
        })
        .catch(err => console.error(err));
    }
    for(let l = 0; l < topLosers.length; l++){
      let symbol = topLosers[l];
      let price = stockPrice[l]
      let name = stockName[l];

      finalData.push(
        {
          "symbol": symbol,
          "price": price,
          "name" : name
        }
      )
    }
    console.log("FINAL DATA ===> ", finalData)
    this.setState({
      topLosersFinal: finalData,
      loaderModal: false
    })
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, minHeight: windowHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <Modal isVisible={this.state.loaderModal} style={{height:160, width: 160, justifyContent:"center", alignSelf:"center"}}  useNativeDriver={true}>
            <View style={{height:160, width: 160, backgroundColor: 'transparent', justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
        </Modal>
        <View style={{margin: "5%"}}>
          <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={{marginBottom: 65}}>
            <View style={{flexDirection:"row", justifyContent:"space-between"}}>
              <TouchableOpacity style={{height: 45, width: "85%", borderWidth: 0.7, borderColor:"#B6B6B6", borderRadius: 100, paddingLeft: 15,}} onPress={() => this.props.navigation.navigate("Search")}>
                <View style={{flexDirection: "row", alignItems:"center", marginTop: 9}}>
                  <Feather name="search" size={21} color="#646464" />
                  <Text style={{marginLeft: 15, color:"#646464", fontSize: 17.5 }}>Search</Text>
                </View>
              </TouchableOpacity>
              <Image source={{ uri: this.state.photoURL}} style={{height: 45, width: 45, borderRadius: 45/2}}/>
            </View>
            <View style={{marginTop: "5%", flexDirection:"row"}}>
              {
                  this.state.indexArray.map((item, key) =>(
                      <View style={{ width: "43%", borderWidth: 0.6, borderColor:"#B6B6B6", borderRadius: 10, padding: 10, paddingLeft: 15, marginRight: "3%"}}>
                        <Text style={{fontSize: 14, fontWeight:"bold"}}>{item[0].shortName}</Text>
                        <View style={{flexDirection:"row", marginTop: 3}}>
                          <Text style={{marginRight: 6}}>{item[0].regularMarketPreviousClose.fmt}</Text>
                          <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}}/>
                          <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 2}}>0.5%</Text>
                        </View>
                      </View>
                  ))
              }
            </View>
            <View style={{marginTop: "6.7%"}}>
              <Text style={{fontSize: 17.5, fontWeight: "bold"}}>Top Gainers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%",}}>
                {
                    this.state.topGainersFinal.map((item, key) =>(
                      <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.symbol)}>
                        <View style={styles.tabBox}>
                          <Image source={{uri: "https://i.ibb.co/0GQY3cY/tata.jpg"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                          <Text style={{fontWeight:"bold", marginTop: 5, textTransform: 'capitalize'}}>{item.name}</Text>
                          <View style={{flexDirection:"row", marginTop: 3,}}>
                            <Text style={{marginRight: 6}}>₹{item.price}</Text>
                            <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}} />
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    ))
                }
              </ScrollView>
            </View>
            <View style={{marginTop: "7%"}}>
              <Text style={{fontSize: 17.5, fontWeight: "bold"}}>Top Losers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%"}}>
                {
                    this.state.topLosersFinal.map((item, key) =>(
                      <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.symbol)}>
                        <View style={styles.tabBox}>
                          <Image source={{uri: "https://i.ibb.co/Qn91KTj/adani.png"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                          <Text style={{fontWeight:"bold", marginTop: 5, textTransform: 'capitalize'}}>{item.name}</Text>
                          <View style={{flexDirection:"row", marginTop: 3,}}>
                            <Text style={{marginRight: 6}}>₹{item.price}</Text>
                            <AntDesign name="caretdown" size={17} color="#da540d" style={{marginTop: 3}} />
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    ))
                }
              </ScrollView>
            </View>
            <View style={{marginTop: "7%"}}>
              <View style={{flexDirection:"row", alignItems:"center"}}>
                <Text style={{fontSize: 17.5, fontWeight: "bold", marginRight: 7}}>IPO</Text>
                <Badge style={{backgroundColor:"#5ecd9f"}}>1</Badge>
              </View>
              <View style={{ borderWidth: 0.6, borderColor:"#B6B6B6", backgroundColor:"#fff", marginTop:"3%", borderRadius: 10, paddingTop: 15, paddingBottom: 17, width: "100%"}}>
                <View style={{flexDirection:"row", paddingLeft: 15, alignItems:"center"}}>
                  <Image source={{uri: "https://i.ibb.co/ggqhk4k/mama.jpg"}} style={{height: 35, width: 35, borderRadius: 3}} resizeMode="cover"/>
                  <Text style={{fontSize: 15, marginLeft: 10, fontWeight:"bold"}}>Mama Earth</Text>
                </View>
                <Divider style={{height: 0.45, backgroundColor: '#ADADAD',  marginTop:12}}/>
                <View style={{flexDirection:"row", paddingTop: 15, paddingLeft: 15, paddingRight: 15, justifyContent:"space-between"}}>
                  <View>
                    <Text style={{fontSize: 13.5}}>To be announced</Text>
                    <Text style={{color:"#949494", fontSize: 13.5}}>Listing Date</Text>
                  </View>
                  <View>
                    <Text style={{fontSize: 13.5}}>₹510-550</Text>
                    <Text style={{color:"#949494", fontSize: 13.5}}>Price Range</Text>
                  </View>
                  <View>
                    <Text style={{fontSize: 13.5}}>1600 Cr</Text>
                    <Text style={{color:"#949494", fontSize: 13.5}}>Issue Size</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  tabBox: {
    width: 130,shadowColor: "#000", backgroundColor:"#fff", margin: 3, borderTopColor:"#CECECE", borderTopWidth: 0.2,
    marginLeft: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2, borderRadius: 10, padding: 13, marginRight: 13
  },
  tabBoxLast: {
    width: 130,shadowColor: "#000", backgroundColor:"#fff", margin: 3, borderTopColor:"#CECECE", borderTopWidth: 0.2,
    marginLeft: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2, borderRadius: 10, padding: 13, marginRight: 3
  },
  oldTabBox:{
    width: 130, borderWidth: 0.7, borderColor:"#B6B6B6", borderRadius: 10, padding: 13, marginRight: 13
  }
})