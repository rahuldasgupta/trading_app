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
      totalInvested: 0,
      NiftyDifference: 127,
      SensexDifference: 234,
      NiftyCurrent: 0,
      SensexCurrent: 0,

      topGainersFinal: [],
      topLosersFinal: [],
      topMoversFinal: [],
      loaderModal: true,
      refreshing: false
    };
  }

  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
    NavigationBar.setButtonStyleAsync("dark");

    this.getIndexData();
    this.getUserData();
    this.marketMovers();

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.getUserData()
    });
  }
  getUserData = async() => {
    auth.onAuthStateChanged((user) => {
      if(user) {
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
    this.checkPortfolio(data.stocksOwned)
  }
  handleNavigation = (name, symbol) => {
    this.props.navigation.navigate("Stock", {stockName: name, symbol: symbol})
  }
  checkPortfolio = (stockArr) => {
    let totalInvested = 0
    for(let i=0; i<stockArr.length; i++){
      let quantity = Number(stockArr[i].quantity)
      let averagePrice = Number(stockArr[i].averagePrice)
      let totalPrice = quantity*averagePrice
      totalInvested = totalInvested + Number(totalPrice)
    }
    this.setState({totalInvested})
  }
  getIndexData = async() => {
    /*const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
        'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    };*/
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '8d1791afb6msh5cda3019aedbb08p1e849cjsnf38e83dc6b8a',
        'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    };
    
    await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-summary?region=IN', options)
      .then(response => response.json())
      .then((response) => {
        let emptyIndexArray = []

        let NSE = response.marketSummaryAndSparkResponse.result.filter(item => item.shortName === "Nifty 50");
        let sparkLengthNifty = NSE[0].spark.close.length
        let NSEOlddData = NSE[0].spark.close[sparkLengthNifty-1]
        let NSEDifference =  Number(NSEOlddData) - Number(NSE[0].regularMarketPreviousClose.raw)
        let NiftyRounded = Math.floor(NSEDifference);
        emptyIndexArray.push(NSE)

        let BSE = response.marketSummaryAndSparkResponse.result.filter(item => item.shortName === "BSE SENSEX");
        let sparkLengthSensex = BSE[0].spark.close.length
        let BSEOlddData = BSE[0].spark.close[sparkLengthSensex-1]
        let BSEDifference = Number(BSEOlddData) - Number(BSE[0].regularMarketPreviousClose.raw)
        let SensexRounded = Math.floor(BSEDifference);
        emptyIndexArray.push(BSE)

        this.setState({
          indexArray: emptyIndexArray,
          NiftyCurrent: NSEOlddData,
          SensexCurrent: BSEOlddData,
          NiftyDifference: NiftyRounded,
          SensexDifference: SensexRounded,
          loaderModal: false,
        })
      })
      .catch(err => console.error("INDEX ERROR ==>", err));
  }
  marketMovers = async() => {
    await fetch(`https://5h186oqc0c.execute-api.ap-south-1.amazonaws.com/dev/top_gainer/get_topgainer`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson === null){}
        else{
          console.log(responseJson.top_mover)
          this.setState({
            topGainersFinal: responseJson.top_gainners,
            topLosersFinal: responseJson.top_losers,
            topMoversFinal: responseJson.top_mover,
            loaderModal: false,
            refreshing: false
          })
        }
      })
      .catch((error) => {
          console.error(error);
      });
  }
  _onRefresh = () => {
    this.setState({refreshing: true});
    this.componentDidMount()
  }
  render() {
    let NiftyCurrent = this.state.NiftyCurrent;
    let totalInvested = this.state.totalInvested;
    let SensexCurrent = this.state.SensexCurrent
    const formattedInvestment = totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const formattedNiftyCurrent = NiftyCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const formattedSensexCurrent = SensexCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    return (
      <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, minHeight: windowHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <Modal isVisible={this.state.loaderModal} style={{height:160, width: 160, justifyContent:"center", alignSelf:"center"}}  useNativeDriver={true}>
            <View style={{height:160, width: 160, backgroundColor: 'transparent', justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
        </Modal>
        <View style={{margin: "5%", marginRight: 0, marginLeft: 0}}>
          <ScrollView horizontal={false} showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh}
                />
              }
          >
            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginLeft:"5%", marginRight:"5%"}}>
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
            <View style={{backgroundColor:"#03314b", width:"90%", borderRadius: 25, marginTop:"5%", padding:"5%", paddingTop:"7%", marginLeft:"5%", marginRight:"5%"}}>
              <Text style={{color:"#fff", fontFamily:"Lato-Regular", opacity: 0.7}}>Portfolio</Text>
              <Text style={{color:"#fff", fontFamily:"Lato-Regular", fontSize: 40}}>₹{formattedInvestment}</Text>
              <View style={{paddingTop: 10, paddingBottom: 10, backgroundColor:"#1ecb98", width: 138, marginTop: 15, borderRadius: 7}}>
                <Text style={{color:"#fff", fontFamily:"Lato-Regular",textAlign:"center"}}>Add Demo Money</Text>
              </View>
            </View>
            <View style={{marginTop: "5%", marginLeft:"5%", flexDirection:"row"}}>
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
                                    <Text style={{marginRight: 6}}>{formattedNiftyCurrent}</Text>
                                    <AntDesign name="caretup" size={17} color="#fff" style={{marginTop: 4}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12, marginTop: 3}}>{this.state.NiftyDifference}</Text>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12, marginTop: 3}}>
                                      ({((this.state.NiftyDifference/this.state.NiftyCurrent)*100).toFixed(2)}%)
                                    </Text>
                                  </View>
                                </View>
                              :
                                <View style={{width: "43%", backgroundColor:"#B22222", borderRadius: 10, padding: 10, paddingLeft: 15, paddingRight:15, marginRight: "3%"}}>
                                    <Text style={{fontSize: 14, fontWeight:"bold", color:"#fff"}}>{item[0].shortName}</Text>
                                  <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <Text style={{marginRight: 6, color:"#fff"}}>{formattedNiftyCurrent}</Text>
                                    <AntDesign name="caretdown" size={17} color="#fff" style={{marginTop: -3}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12}}>{this.state.NiftyDifference}</Text>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12}}>
                                      ({((this.state.NiftyDifference/this.state.NiftyCurrent)*100).toFixed(2)}%)
                                    </Text>
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
                                    <Text style={{marginRight: 6}}>{formattedSensexCurrent}</Text>
                                    <AntDesign name="caretup" size={17} color="#fff" style={{marginTop: 4}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12, marginTop: 3}}>{this.state.SensexDifference}</Text>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12, marginTop: 3}}>
                                      ({((this.state.SensexDifference/this.state.SensexCurrent)*100).toFixed(2)}%)
                                    </Text>
                                  </View>
                                </View>
                              :
                                <View style={{width: "43%", backgroundColor:"#B22222", borderRadius: 10, padding: 10, paddingLeft: 15, paddingRight:15, marginRight: "3%"}}>
                                    <Text style={{fontSize: 14, fontWeight:"bold", color:"#fff"}}>{item[0].shortName}</Text>
                                  <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <Text style={{marginRight: 6, color:"#fff"}}>{formattedSensexCurrent}</Text>
                                    <AntDesign name="caretdown" size={17} color="#fff" style={{marginTop: -3}}/>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12}}>{this.state.SensexDifference}</Text>
                                    <Text style={{marginLeft: 2, color:"#fff", fontSize: 12}}>
                                      ({((this.state.SensexDifference/this.state.SensexCurrent)*100).toFixed(2)}%)
                                    </Text>
                                  </View>
                                </View>
                            }
                          </>
                        }
                      </>
                  ))
              }
            </View>
            <View style={{marginTop: "6%"}}>
              <Text style={{fontSize: 17.5, color:"#03314b", fontFamily:"Lato-Bold", marginLeft:"5.5%"}}>Top Gainers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%",}}>
                {
                    this.state.topGainersFinal.map((item, key) =>(
                      <>
                        {
                          item.name && item.price ? 
                            <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.name, item.symbol)}>
                              <View style={key == 0 ? styles.firstTabBox : styles.tabBox}>
                                <Text style={{fontFamily:"Lato-Bold", marginTop: 5, textTransform: 'capitalize'}}>{item.name}</Text>
                                <View style={{flexDirection:"row", marginTop: 3,}}>
                                  <Text style={{marginRight: 6, color:"#1dcc98"}}>₹{item.price}</Text>
                                  <AntDesign name="caretup" size={17} color="#1dcc98" style={{marginTop: 4}} />
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
            <View style={{marginTop: "6%"}}>
              <Text style={{fontSize: 17.5,  color:"#03314b", fontFamily:"Lato-Bold", marginLeft: "5.5%"}}>Top Losers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%"}}>
                {
                  this.state.topLosersFinal.map((item, key) =>(
                    <>
                      {
                        item.name && item.price ? 
                          <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.name, item.symbol)}>
                            <View style={key == 0 ? styles.firstTabBox : styles.tabBox}>
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
            <View style={{marginTop: "6%", marginBottom: 55}}>
              <Text style={{fontSize: 17.5,  color:"#03314b", fontFamily:"Lato-Bold", marginLeft:"5.5%",}}>Most Actively Traded</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%"}}>
                {
                  this.state.topMoversFinal.map((item, key) =>(
                    <TouchableWithoutFeedback onPress={() => this.handleNavigation(item.name,item.symbol)}>
                      <View style={key == 0 ? styles.firstTabBox : styles.tabBox}>
                        <Text style={{fontFamily:"Lato-Bold", marginTop: 5, textTransform: 'capitalize'}}>{item.name}</Text>
                        <View style={{flexDirection:"row", marginTop: 3,}}>
                          <Text style={{marginRight: 6, color:"#222"}}>₹{item.price}</Text>
                          <Image source={require("../../assets/transfer.png")} style={{height: 17, width: 17, marginTop: 2}}/>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
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
    width: 140, backgroundColor:"#fff", margin: 3, 
    marginLeft: 2, borderRadius: 10, padding: 13, marginRight: 12, borderTopWidth: 0.2, borderColor:"#D0D0D0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  firstTabBox:{
    width: 140, backgroundColor:"#fff", margin: 3, 
    marginLeft: 2, borderRadius: 10, padding: 13, marginLeft: 23, marginRight: 12, borderTopWidth: 0.2, borderColor:"#D0D0D0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
})