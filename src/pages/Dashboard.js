import React, { Component } from "react";
import { Text, View, Dimensions, Image, ScrollView, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { Feather, AntDesign } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {initializeApp} from 'firebase/app';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
      photoURL: "https://firebasestorage.googleapis.com/v0/b/wigglycherry-5443a.appspot.com/o/user_img.png?alt=media&token=8c3e3154-07b8-492e-bb1d-f3ce77d52eed"
    };
  }

  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#E7E7E7");
    NavigationBar.setButtonStyleAsync("dark");

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
  handleNavigation = (name, image, price, positive, percentage) => {
    this.props.navigation.navigate("Stock", {name: name, image: image, price: price, positive: positive, percentage: percentage})
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, minHeight: windowHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
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
              <View style={{ width: "43%", borderWidth: 0.6, borderColor:"#B6B6B6", borderRadius: 10, padding: 10, paddingLeft: 15, marginRight: "3%"}}>
                <Text style={{fontSize: 14, fontWeight:"bold"}}>NIFTY 50</Text>
                <View style={{flexDirection:"row", marginTop: 3}}>
                  <Text style={{marginRight: 6}}>17,258.02</Text>
                  <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}}/>
                  <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 2}}>0.5%</Text>
                </View>
              </View>
              <View style={{ width: "43%", borderWidth: 0.6, borderColor:"#B6B6B6", borderRadius: 10, padding: 10, paddingLeft: 15}}>
                <Text style={{fontSize: 14, fontWeight:"bold"}}>SENSEX</Text>
                <View style={{flexDirection:"row", marginTop: 3}}>
                  <Text style={{marginRight: 6}}>60,682.37</Text>
                  <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}} />
                  <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 2}}>0.4%</Text>
                </View>
              </View>
            </View>
            <View style={{marginTop: "6.7%"}}>
              <Text style={{fontSize: 17.5, fontWeight: "bold"}}>Top Gainers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%",}}>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Tata Power", "https://i.ibb.co/0GQY3cY/tata.jpg", 207.2, true, "10.4")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/0GQY3cY/tata.jpg"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5}}>Tata Power</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹207.2</Text>
                      <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 3,}}>10.4%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Hindustan Unilever", "https://i.ibb.co/7pHCrQS/hul.jpg", 2507.8, true, "7.2")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/7pHCrQS/hul.jpg"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5}}>HUL</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹2507.8</Text>
                      <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 3,}}>7.2%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("HDFC Bank", "https://i.ibb.co/xC98MzW/hdfc.jpg", 1507.9, true, "5.7")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/xC98MzW/hdfc.jpg"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5}}>HDFC Bank</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹1507.9</Text>
                      <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3.5}} />
                      <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 3,}}>5.7%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Life Insurance Cooperation", "https://i.ibb.co/x1DDr4t/lic.jpg", 607.1, true, "3.6")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/x1DDr4t/lic.jpg"}} style={{height: 35, width: 35, borderRadius: 5}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5, }}>LIC</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹607.1</Text>
                      <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3.5}} />
                      <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 3,}}>3.6%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Bajaj Finance", "https://i.ibb.co/GJDFpb7/bajaj.jpg", 6307.2, true, "3.1")}>
                  <View style={styles.tabBoxLast}>
                    <Image source={{uri: "https://i.ibb.co/GJDFpb7/bajaj.jpg"}} style={{height: 35, width: 35, borderRadius: 5}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5, }}>Bajaj</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹6307.2</Text>
                      <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3.5}} />
                      <Text style={{marginLeft: 2, color:"#5ecd9f", fontSize: 12, marginTop: 3,}}>3.1%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </ScrollView>
            </View>
            <View style={{marginTop: "7%"}}>
              <Text style={{fontSize: 17.5, fontWeight: "bold"}}>Top Losers</Text>
              <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginTop:"3%"}}>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Adani Green", "https://i.ibb.co/Qn91KTj/adani.png", 1207.6, false, "-20")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/Qn91KTj/adani.png"}} style={{height: 35, width: 35, borderRadius: 3}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5}}>Adani Green</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹1207.6</Text>
                      <AntDesign name="caretdown" size={17} color="#da540d" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#da540d", fontSize: 12, marginTop: 3,}}>-20%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Future Retail", "https://i.ibb.co/tbStX7s/future.png", 2.02, false, "-9.2")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/tbStX7s/future.png"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5}}>Future Retail</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹2.02</Text>
                      <AntDesign name="caretdown" size={17} color="#da540d" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#da540d", fontSize: 12, marginTop: 3,}}>-9.2%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("VI India", "https://i.ibb.co/Bzmw84T/vi.jpg", 5.07, false, "-7.3")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/Bzmw84T/vi.jpg"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5}}>VI India</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹5.07</Text>
                      <AntDesign name="caretdown" size={17} color="#da540d" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#da540d", fontSize: 12, marginTop: 3,}}>-7.3%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("Adani Ports", "https://i.ibb.co/Qn91KTj/adani.png", 437.8, false, "-6.7")}>
                  <View style={styles.tabBox}>
                    <Image source={{uri: "https://i.ibb.co/Qn91KTj/adani.png"}} style={{height: 35, width: 35, borderRadius: 3}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5, }}>Adani Ports</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹437.8</Text>
                      <AntDesign name="caretdown" size={17} color="#da540d" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#da540d", fontSize: 12, marginTop: 3,}}>-6.7%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => this.handleNavigation("ICICI Bank", "https://i.ibb.co/yNzDdS9/icici.png", 807.2, false, "-2.8")}>
                  <View style={styles.tabBoxLast}>
                    <Image source={{uri: "https://i.ibb.co/yNzDdS9/icici.png"}} style={{height: 35, width: 35}} resizeMode="cover"/>
                    <Text style={{fontWeight:"bold", marginTop: 5, }}>ICICI Bank</Text>
                    <View style={{flexDirection:"row", marginTop: 3,}}>
                      <Text style={{marginRight: 6}}>₹807.2</Text>
                      <AntDesign name="caretdown" size={17} color="#da540d" style={{marginTop: 0}} />
                      <Text style={{marginLeft: 2, color:"#da540d", fontSize: 12, marginTop: 3,}}>-2.8%</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
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