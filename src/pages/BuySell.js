import React, { Component } from "react";
import { Text, View, Dimensions, Image, TouchableOpacity, TextInput} from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { Divider } from 'react-native-paper';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwipeButton from 'rn-swipe-button';
import {
    getAuth,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
  } from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import moment from 'moment';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import Toast, { BaseToast, InfoToast } from 'react-native-toast-message';
import buy_arrow from '../../assets/buy_arrow.png';
import sell_arrow from '../../assets/sell_arrow.png';
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

const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#1dcc98' }}
        contentContainerStyle={{ paddingHorizontal: 15, borderWidth: 0.5, borderColor:"#BBBBBB"}}
        text1Style={{
          fontSize: 15,
          color:"#222",
          fontWeight:"bold"
        }}
        text2Style={{
            fontSize: 14.5,
            color:"#222"
        }}
      />
    ),
    error: (props) => (
        <BaseToast
          {...props}
          style={{ borderLeftColor: '#da540d' }}
          contentContainerStyle={{ paddingHorizontal: 15, borderWidth: 0.5, borderColor:"#BBBBBB"}}
          text1Style={{
            fontSize: 15,
            color:"#222",
            fontWeight:"bold"
          }}
          text2Style={{
              fontSize: 14.5,
              color:"#222"
          }}
        />
      ),
}
export default class BuySell extends Component {
  constructor(props) {
    super(props);
    this.state = {
        email: "",
        userData: {},
        stocksData: [],
        portfolio: {},
        symbol: this.props.route.params.symbol,
        quantity: 0,
        price: this.props.route.params.price,
        stockValue: 0,
        brokerageCharge: 0,
        exchangeCharge: 0,
        stampDuty: 0
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
                stocksData: data.stocksOwned
            })
            this.checkStockInPortfolio(data.stocksOwned)
        });
    }
    checkStockInPortfolio = (stockArr) => {
        let stock = this.props.route.params.symbol
        const isValueExists = stockArr.findIndex(item => item.symbol === stock);
        if(isValueExists != -1){
            this.setState({
                portfolio: stockArr[isValueExists]
            })
        }
    }
    increDecre = (mode) => {
        if(mode === "Add"){
            let quant = Number(this.state.quantity)
            quant = quant+1
            quant = Number(quant)
            this.setState({
                quantity: quant
            })
            console.log(this.state.quantity)
        }
    }
    handleQuantity = (data) => {
        let quant = Number(data)
        let totalStockValue = quant * Number(this.state.price)

        let brokerageCharge = (totalStockValue * 0.0003).toFixed(3);
        let exchangeCharge = (totalStockValue * 0.00035).toFixed(3);
        let stampDuty = (totalStockValue * 0.000001).toFixed(3);
        this.setState({
            quantity: data,
            stockValue: totalStockValue.toFixed(3),
            brokerageCharge: brokerageCharge,
            exchangeCharge: exchangeCharge,
            stampDuty: stampDuty
        })
    }
    buyStock = () => {
        if(this.state.portfolio != {} && this.state.portfolio.quantity >= 0){
            console.log("here")
            let oldQuantity = this.state.portfolio.quantity
            let oldAverage = this.state.portfolio.averagePrice

            let totalOld = Number(oldQuantity) * Number(oldAverage)
            let totalNew = Number(this.state.stockValue)
            let totalQuantity = Number(oldQuantity) + Number(this.state.quantity)
            let total = totalNew+totalOld
            let newAverage = Number(total)/totalQuantity
            console.log(newAverage)

            let obj = {
                quantity : oldQuantity + Number(this.state.quantity),
                averagePrice : newAverage.toFixed(2),
                symbol : this.state.symbol,
                name : this.props.route.params.name
            }
            
            let stockArr = this.state.stocksData
            let newArray = stockArr.filter(item => item.symbol !== this.state.symbol);

            newArray.push(obj)
            this.updateFirestore(newArray)
            this.appendTransactions("buy")
        }
        else{
            console.log("here2")
            let newArray = this.state.stocksData
            let obj = {
                quantity : Number(this.state.quantity),
                averagePrice : Number(this.props.route.params.price),
                symbol : this.state.symbol,
                name : this.props.route.params.name
            }
            newArray.push(obj)
            this.updateFirestore(newArray)
            this.appendTransactions("buy")
        }
    }
    sellStock = () => {
        if(this.state.portfolio != {}){
            let oldQuantity = this.state.portfolio.quantity
            let oldAverage = this.state.portfolio.averagePrice

            let totalOld = Number(oldQuantity) * Number(oldAverage)
            let totalNew = Number(this.state.stockValue)
            let totalQuantity = Number(oldQuantity) - Number(this.state.quantity)
            let total = totalOld-totalNew
            let newAverage = Number(total)/totalQuantity
            if(newAverage==0 || newAverage != NaN){
                newAverage = 0
            }

            let obj = {
                quantity : oldQuantity - Number(this.state.quantity),
                averagePrice : newAverage.toFixed(2),
                symbol : this.state.symbol,
                name : this.props.route.params.name
            }
            
            let stockArr = this.state.stocksData
            let newArray = stockArr.filter(item => item.symbol !== this.state.symbol);

            newArray.push(obj)
            this.updateFirestore(newArray)
            this.appendTransactions("sell")
        }
    }
    updateFirestore = async(obj) => {
        let email = this.state.userData.email;
        let data = {}
        let docID = ""

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            docID = doc.id
        });
        const userRef = doc(db, "users", docID);
        await setDoc(userRef, { stocksOwned: obj }, { merge: true });
        this.componentDidMount()
        if(this.props.route.params.mode === "BUY"){
            Toast.show({
                type: 'success',
                text1: "Stocks Bought",
                text2: this.state.quantity + " Shares @ ₹" + this.props.route.params.price
            });
        }
        else{
            Toast.show({
                type: 'error',
                text1: "Stocks Sold",
                text2: this.state.quantity + " Shares @ ₹" + this.props.route.params.price
            });
        }
        
    }
    appendTransactions = async(mode) => {
        let quantity = Number(this.state.quantity);
        let price = Number(this.props.route.params.price);
        let symbol = this.state.symbol;
        let name = this.props.route.params.name;
        const today = moment();
        const formattedDate = today.format('Do MMMM, YYYY');
        let formattedTime = today.format('hh:mm A');

        let data= {}

        let email = this.state.userData.email;
        let docID = ""
        let obj = {
            quantity: quantity,
            price: price,
            symbol: symbol,
            name: name,
            time: formattedTime,
            date: formattedDate,
            mode: mode
        }

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            docID = doc.id,
            data=doc.data()
        });
        let transactions = []
        if(data.transactions != []){
            transactions = data.transactions
        }
        transactions.push(obj)
        const userRef = doc(db, "users", docID);
        await setDoc(userRef, { transactions: transactions }, { merge: true });
    }
  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, minHeight: windowHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <ScrollView style={{marginBottom: 60}} showsVerticalScrollIndicator={false}>
            <View style={{margin: "5%", flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                <TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
                    <Image source={require("../../assets/back_arrow.png")} style={{height: 27, width: 27}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("Search")}>
                    <Feather name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <Divider style={{height: 0.5, backgroundColor: '#ADADAD',  marginTop:0}}/>
            <View style={{margin: "5%"}}>
                <View style={{width:"100%", backgroundColor: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d" , borderRadius: 15, padding: 15}}>
                    <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <Text style={{fontSize: 17, fontWeight:"600", color:"#fff"}}>{this.props.route.params.name}</Text>
                        {
                            this.state.portfolio != {} ?
                            <View>
                                <Text style={{fontSize: 13, fontWeight:"600", color:"#fff"}}>{this.state.portfolio.quantity} in Portfolio</Text>
                            </View>
                            :
                            <></>
                        }
                    </View>
                    <Text style={{marginTop: 1, fontSize: 17, color:"#fff", fontWeight:"bold"}}>₹{this.props.route.params.price}</Text>
                    <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                        <TextInput
                            style={{
                                color: "#222",
                                fontSize: 17,
                                width: "70%",
                                height: 45,
                                paddingLeft: 10,
                                marginTop: 10,
                                borderRadius: 7,
                                backgroundColor:"#fff"
                            }}
                            keyboardType='numeric'
                            value={this.state.quantity}
                            placeholder="Quantity"
                            placeholderTextColor={"#9E9E9E"}
                            onChangeText={this.handleQuantity}
                        />
                        <View style={{flexDirection:"row", alignItems:"center", }}>
                            <TouchableOpacity onPress={() => this.increDecre("Add")}>
                                <AntDesign name="pluscircle" size={27} color="#fff" style={{marginRight: 10}}/>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <AntDesign name="minuscircleo" size={27} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%"}}>
                <Text style={{fontSize: 17, fontWeight:"bold", color:"#03314b", marginLeft: 3, marginBottom: 10}}>Order Type</Text>
                <View style={{flexDirection:"row"}}>
                    <TouchableOpacity style={{backgroundColor: this.props.route.params.mode === "BUY" ? "#CCFFF0" : "#FFD9C5", borderColor: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d", borderWidth: 1, width: 95 ,paddingTop:5, paddingBottom: 5, borderRadius: 5}}>
                        <Text style={{color: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d", fontSize: 15, textAlign:"center", fontWeight:"600"}}>Long Term</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%",marginTop: "5%"}}>
                <Text style={{fontSize: 17, fontWeight:"bold", color:"#03314b", marginLeft: 3, marginBottom: 10}}>Market</Text>
                <View style={{flexDirection:"row"}}>
                    <TouchableOpacity style={{backgroundColor: this.props.route.params.mode === "BUY" ? "#CCFFF0" : "#FFD9C5", borderColor: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d", borderWidth: 1, width: 95 ,paddingTop:5, paddingBottom: 5, borderRadius: 5}}>
                        <Text style={{color: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d", fontSize: 15, textAlign:"center", fontWeight:"600"}}>NSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor: "#E0E0E0", borderColor:"#A2A2A2", borderWidth: 1, width: 95 ,paddingTop:5, marginLeft: 10, paddingBottom: 5, borderRadius: 5}}>
                        <Text style={{color: "#A2A2A2", fontSize: 15, textAlign:"center", fontWeight:"600"}}>BSE</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%",marginTop: "5%"}}>
                <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                <Text style={{fontSize: 17, fontWeight:"bold", color:"#03314b", marginLeft: 3}}>Tags</Text>
                    <TouchableOpacity style={{backgroundColor: this.props.route.params.mode === "BUY" ? "#CCFFF0" : "#FFD9C5", borderColor: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d", borderWidth: 1, width: 95 ,paddingTop:5, paddingBottom: 5, borderRadius: 5}}>
                        <Text style={{color: this.props.route.params.mode === "BUY" ? "#1dcc98" : "#da540d", fontSize: 15, textAlign:"center", fontWeight:"600"}}>+ Add Tags</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%",marginTop: "5%", borderRadius:15, borderWidth: 1, borderColor:"#E1E1E1", padding: 15}}>
                <Text style={{fontSize: 17, fontWeight:"600", color:"#03314b"}}>Summary</Text>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 15}}>
                    <Text>{this.state.quantity} Shares @ Rs. ₹{this.props.route.params.price}</Text>
                    <Text>₹{this.state.stockValue}</Text>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 7}}>
                    <Text>Brokerage</Text>
                    <Text>₹{this.state.brokerageCharge}</Text>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 7}}>
                    <Text>Exchange Tax</Text>
                    <Text>₹{this.state.exchangeCharge}</Text>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 7}}>
                    <Text>Stamp Duty</Text>
                    <Text>₹{this.state.stampDuty}</Text>
                </View>
            </View>
            {
                this.props.route.params.mode === "BUY" ?
                <SwipeButton
                    containerStyles={{borderRadius: 45/2, marginLeft:"5%", marginRight: "5%", marginTop: "5%"}}
                    height={50}
                    onSwipeSuccess={this.buyStock}
                    railBackgroundColor="#fff"
                    railBorderColor={"#1dcc98"}
                    railFillBackgroundColor={"#1dcc98"}
                    railFillBorderColor={"#1dcc98"}
                    railStyles={{borderRadius: 100}}
                    thumbIconBorderColor="#0465b2"
                    thumbIconImageSource={this.props.route.params.mode === "BUY" ? buy_arrow : sell_arrow}
                    thumbIconBackgroundColor="#fff"
                    thumbIconStyles={{borderRadius:100, height: 50, width:50, borderWidth: 0}}
                    thumbIconWidth={50} 
                    title="Confirm Buy"
                    titleColor={"#1dcc98"}
                    titleStyles={{
                        fontSize:16, fontWeight:"bold"
                    }}
                />
                :
                <>
                {
                     this.state.portfolio != {} && this.state.portfolio.quantity>0 ?
                     <SwipeButton
                        containerStyles={{borderRadius: 45/2, marginLeft:"5%", marginRight: "5%", marginTop: "5%"}}
                        height={50}
                        onSwipeSuccess={this.sellStock}
                        railBackgroundColor="#fff"
                        railBorderColor= "#da540d"
                        railFillBackgroundColor= "#da540d"
                        railFillBorderColor= "#da540d"
                        railStyles={{borderRadius: 100}}
                        thumbIconBorderColor="#0465b2"
                        thumbIconImageSource={sell_arrow}
                        thumbIconBackgroundColor="#fff"
                        thumbIconStyles={{borderRadius:100, height: 50, width:50, borderWidth: 0}}
                        thumbIconWidth={50} 
                        title="Confirm Sell"
                        titleColor={"#da540d"}
                        titleStyles={{
                            fontSize:16, fontWeight:"bold"
                        }}
                    />
                    :
                    <View style={{backgroundColor: "#E0E0E0", borderColor:"#A2A2A2", marginTop: "5%", borderWidth: 1, width: "90%", marginLeft:"5%", marginRight:"5%", height: 50,alignItems:"center", alignSelf:"center", justifyContent:"center",  borderRadius: 5}}>
                        <Text style={{textAlign:"center", fontSize: 16}}>No Shares Available</Text>
                    </View>
                }
                </>
            }
            
            <Toast position="bottom" visibilityTime={4500} config={toastConfig}/>
        </ScrollView>
      </View>
    );
  }
}
