import React, { Component } from "react";
import { Text, View, Dimensions, Image, ScrollView, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { Feather, AntDesign, Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge, Divider } from 'react-native-paper';

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
      NiftyDifference: 127,
      SensexDifference: 234,

      topGainers: [],
      topLosers: [],
      topGainersFinal: [],
      topLosersFinal: [],
      loaderModal: true,
      refreshing: false
    };
  }

  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
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
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    };
    
    fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-summary?region=IN', options)
      .then(response => response.json())
      .then((response) => {
        let emptyIndexArray = []

        let NSE = response.marketSummaryAndSparkResponse.result.filter(item => item.shortName === "Nifty 50");
        let NSEOlddData = NSE[0].spark.close[0]
        let NSEDifference = Number(NSE[0].regularMarketPreviousClose.raw) - Number(NSEOlddData)
        let NiftyRounded = Math.floor(NSEDifference);
        emptyIndexArray.push(NSE)

        let BSE = response.marketSummaryAndSparkResponse.result.filter(item => item.shortName === "BSE SENSEX");
        let BSEOlddData = BSE[0].spark.close[0]
        let BSEDifference = Number(BSE[0].regularMarketPreviousClose.raw) - Number(BSEOlddData)
        let SensexRounded = Math.floor(BSEDifference);
        emptyIndexArray.push(BSE)

        this.setState({
          indexArray: emptyIndexArray,
          NiftyDifference: NiftyRounded,
          SensexDifference: SensexRounded
        })
      })
      .catch(err => console.error("INDEX ERROR ==>", err));
  }
  getMarketMovers = async() => {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    };
    
    fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-movers?region=IN&lang=en-US&start=0&count=10', options)
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
        gainersSorted = gainersSorted.filter(item => item.includes(".BO"));
        let losersSorted = emptyLosersArray.filter(item => !item.includes("-"));
        losersSorted = losersSorted.filter(item => item.includes(".BO"));

        console.log("TOP GAINERS ==>", gainersSorted)
        this.setState({
          topGainers: gainersSorted,
          topLosers: losersSorted
        })
        this.renderTopGainers();
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
      headers: {
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    };

    const options2 = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    };

    for (let i = 0; i < topGainers.length; i++) {
      let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'+ topGainers[i] +'/financial-data'
      console.log(url)
      await fetch(url, options)
        .then(response => response.json())
        .then((response) => {
          if(response.financialData.currentPrice.raw){
            stockPrice.push(response.financialData.currentPrice.raw)
          }
          else{
            deleteArray.push(i);
          }
        })
        .catch((err) => {
          deleteArray.push(i);
        });
    }
    for(let j = 0; j < deleteArray.length; j++){
      topGainers.splice(deleteArray[j], 1);
    }
    for(let k = 0; k < topGainers.length; k++){
      await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=' + topGainers[k] +'&region=IN', options2)
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
      headers: {
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    };

    const options2 = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
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
      await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=' + topLosers[k] +'&region=IN', options2)
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
      loaderModal: false,
      refreshing: false
    })
  }
  _onRefresh = () => {
    this.setState({refreshing: true});
    this.componentDidMount()
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
        <View style={{margin: "5%", marginRight: 0}}>
          <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={{marginBottom: 65}}
              refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh}
                />
              }
          >
            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginRight:"5%"}}>
              <View style={{alignItems:"center", flexDirection:"row"}}>
                <Image source={{ uri: this.state.photoURL}} style={{height: 45, width: 45, borderRadius: 45/2}}/>
                <View>
                  <Text style={{color:"#03314b", fontFamily:"Lato-Bold", marginLeft: 10, fontSize: 15, opacity: 0.5, marginTop: -5}}>Welcome</Text>
                  <Text style={{color:"#03314b", fontFamily:"Lato-Bold", marginLeft: 10, fontSize: 15}}>{this.state.userData.fullName}</Text>
                </View>
              </View>
              <View style={{alignItems:"center", flexDirection:"row"}}>
                <TouchableOpacity  onPress={() => this.props.navigation.navigate("Search")}>
                  <Feather name="search" size={24} color="#03314b" style={{marginRight: 10}} />
                </TouchableOpacity>
                <Ionicons name="notifications-outline" size={24} color="#03314b" />
              </View>
            </View>
            <View style={{backgroundColor:"#03314b", width:"95%", borderRadius: 25, marginTop:"5%", padding:"5%", paddingTop:"7%", marginRight:"5%"}}>
              <Text style={{color:"#fff", fontFamily:"Lato-Regular", opacity: 0.7}}>Portfolio</Text>
              <Text style={{color:"#fff", fontFamily:"Lato-Regular", fontSize: 40}}>₹21,253.00</Text>
              <View style={{paddingTop: 10, paddingBottom: 10, backgroundColor:"#1ecb98", width: 138, marginTop: 15, borderRadius: 7}}>
                <Text style={{color:"#fff", fontFamily:"Lato-Regular",textAlign:"center"}}>Add Demo Money</Text>
              </View>
            </View>
            <View style={{marginTop: "5%", flexDirection:"row"}}>
              {
                  this.state.indexArray.map((item, key) =>(
                      <>
                        {
                          item[0].shortName === "Nifty 50" ?
                          <>
                            {
                              this.state.NiftyDifference >= 0 ?
                                <View style={{width: "43%", backgroundColor:"#1dcc98", borderRadius: 10, padding: 10, paddingLeft: 15, paddingRight:15, marginRight: "3%"}}>
                                  <Text style={{fontSize: 14, fontWeight:"bold"}}>{item[0].shortName}</Text>
                                  <View style={{flexDirection:"row", marginTop: 1}}>
                                    <Text style={{marginRight: 6}}>{item[0].regularMarketPreviousClose.fmt}</Text>
                                    <AntDesign name="caretup" size={17} color="#fff" style={{marginTop: 3}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12, marginTop: 2}}>{this.state.NiftyDifference}</Text>
                                  </View>
                                </View>
                              :
                                <View style={{width: "43%", backgroundColor:"#B22222", borderRadius: 10, padding: 10, paddingLeft: 15, paddingRight:15, marginRight: "3%"}}>
                                    <Text style={{fontSize: 14, fontWeight:"bold", color:"#fff"}}>{item[0].shortName}</Text>
                                  <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <Text style={{marginRight: 6, color:"#fff"}}>{item[0].regularMarketPreviousClose.fmt}</Text>
                                    <AntDesign name="caretdown" size={17} color="#fff" style={{marginTop: -3}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12}}>{this.state.NiftyDifference}</Text>
                                  </View>
                                </View>
                            }
                          </>
                          :
                          <>
                            {
                              this.state.SensexDifference >= 0 ?
                                <View style={{width: "43%", backgroundColor:"#1dcc98", borderRadius: 10, padding: 10, paddingLeft: 15, paddingRight:15, marginRight: "3%"}}>
                                  <Text style={{fontSize: 14, fontWeight:"bold"}}>{item[0].shortName}</Text>
                                  <View style={{flexDirection:"row", marginTop: 1}}>
                                    <Text style={{marginRight: 6}}>{item[0].regularMarketPreviousClose.fmt}</Text>
                                    <AntDesign name="caretup" size={17} color="#fff" style={{marginTop: 3}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12, marginTop: 2}}>{this.state.SensexDifference}</Text>
                                  </View>
                                </View>
                              :
                                <View style={{width: "43%", backgroundColor:"#B22222", borderRadius: 10, padding: 10, paddingLeft: 15, paddingRight:15, marginRight: "3%"}}>
                                    <Text style={{fontSize: 14, fontWeight:"bold", color:"#fff"}}>{item[0].shortName}</Text>
                                  <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <Text style={{marginRight: 6, color:"#fff"}}>{item[0].regularMarketPreviousClose.fmt}</Text>
                                    <AntDesign name="caretdown" size={17} color="#fff" style={{marginTop: -3}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12}}>{this.state.SensexDifference}</Text>
                                  </View>
                                </View>
                            }
                          </>
                        }
                      </>
                  ))
              }
            </View>
            <View style={{marginTop: "6.5%"}}>
              <Text style={{fontSize: 17.5, color:"#03314b", fontFamily:"Lato-Bold", marginLeft: 3}}>Top Gainers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%",}}>
                {
                    this.state.topGainersFinal.map((item, key) =>(
                      <>
                        {
                          item.name && item.price ? 
                            <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.symbol)}>
                              <View style={styles.tabBox}>
                                <Text style={{fontFamily:"Lato-Bold", marginTop: 5, textTransform: 'capitalize'}}>{item.name}</Text>
                                <View style={{flexDirection:"row", marginTop: 3,}}>
                                  <Text style={{marginRight: 6, color:"#1dcc98"}}>₹{item.price}</Text>
                                  <AntDesign name="caretup" size={17} color="#1dcc98" style={{marginTop: 3}} />
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                            :
                            <></>
                        }
                      </>
                    ))
                }
              </ScrollView>
            </View>
            <View style={{marginTop: "6.5%"}}>
              <Text style={{fontSize: 17.5,  color:"#03314b", fontFamily:"Lato-Bold", marginLeft: 3}}>Top Losers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%"}}>
                {
                  this.state.topLosersFinal.map((item, key) =>(
                    <>
                      {
                        item.name && item.price ? 
                          <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.symbol)}>
                            <View style={styles.tabBox}>
                              <Text style={{fontFamily:"Lato-Bold", marginTop: 5, textTransform: 'capitalize'}}>{item.name}</Text>
                              <View style={{flexDirection:"row", marginTop: 3,}}>
                                <Text style={{marginRight: 6, color:"#da540d"}}>₹{item.price}</Text>
                                <AntDesign name="caretdown" size={17} color="#da540d"/>
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        :
                        <></>
                      }
                    </>
                  ))
                }
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  tabBox: {
    width: 130, backgroundColor:"#fff", margin: 3, 
    marginLeft: 2, borderRadius: 10, padding: 13, marginRight: 13, borderWidth: 0.6, borderColor:"#D0D0D0",
  },
  oldTabBox:{
    width: 130, borderWidth: 0.7, borderColor:"#B6B6B6", borderRadius: 10, padding: 13, marginRight: 13
  },
})