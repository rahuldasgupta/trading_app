import React, { useState, useEffect } from 'react';
import { View, useWindowDimensions, Text, StyleSheet, Image, RefreshControl, TouchableOpacity} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {initializeApp} from 'firebase/app';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, addDoc  } from "firebase/firestore";
import { ScrollView } from 'react-native-gesture-handler';

const firebaseConfig = {
  apiKey: "AIzaSyAn3ZBRbTsPayK-lQ-pYKLDXFl3dpEeZMo",
  authDomain: "tradingapp-e9640.firebaseapp.com",
  projectId: "tradingapp-e9640",
  storageBucket: "tradingapp-e9640.appspot.com",
  messagingSenderId: "953809279589",
  appId: "1:953809279589:web:4dc86dca19957eb629848c",
  measurementId: "G-STVY05ZTL9"
};

const FirstRoute = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setuserData] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async() => {
    setRefreshing(true)
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
        setuserData(data)
        setWatchlist(data.watchlist)
    });
    setRefreshing(false)
  }
  const navigation = useNavigation();
  const handleNavigation = async(name, symbol) => {
    navigation.navigate("Stock", {stockName: name, symbol: symbol})
  }
  return(
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{marginBottom: 65}} showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={getUserData}
            />
        }>
        <TouchableOpacity onPress={()=> navigation.navigate("Search")}>
          <View style={{margin:"7.5%", marginTop: "6%", height: 50, backgroundColor:"#fff", borderWidth: 0.9, paddingLeft: 15, borderColor:"#BBBBBB", borderRadius: 8, flexDirection:"row", alignItems:"center"}}>
            <Feather name="search" size={19} color="#222" style={{paddingRight: 7,}}/>
            <Text style={{ color: "#222", fontSize: 18}}>Search</Text>
          </View>
        </TouchableOpacity>
        <View>
          {
            watchlist.length > 0 ?
            <>
              {
                watchlist.map((item, key) =>(
                <TouchableOpacity onPress={()=> navigation.navigate("Stock", {stockName: item.name, symbol: item.symbol})}>
                    <View key={key}>
                      <View style={{margin:"7.5%", marginTop: "0%", marginBottom:"4%", justifyContent:"space-between", flexDirection:"row", alignItems:"center"}}>
                        <View>
                          <Text style={{fontFamily:"Lato-Bold", fontSize: 16}}>{item.name}</Text>
                          <Text style={{textAlign:"left", fontSize: 13.5, marginTop:4, fontFamily:"Lato-Regular", color:"#777777"}}>{item.symbol}</Text>
                        </View>
                        <Text style={{textAlign:"right", fontFamily:"Lato-Bold",}}>₹{item.price}</Text>
                      </View>
                      <Divider style={{height: 0.4, backgroundColor: '#ADADAD', marginBottom:"4%",}}/>
                    </View>
                </TouchableOpacity>
                ))
              }
            </>
            :
            <Image source={require("../../assets/Empty.gif")} style={{height: 300, marginTop:"5%", width: 300, alignItems:"center", alignSelf:"center"}}/>
          }
            
        </View>
      </ScrollView>
     
    </View>
  )
};

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#fff' }} />
);
const ThirdRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#fff' }} />
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute
});

export default function Watchlist() {

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Watchlist 1' },
    { key: 'second', title: 'Watchlist 2' },
    { key: 'third', title: 'Watchlist 3' }
  ]);
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => <TabBar
        {...props}
        style={{ backgroundColor: '#fff', height: 50, elevation: 0 }}
        indicatorStyle={{ backgroundColor: '#BBBBBB', height: 1 }}
        renderLabel={({ route, focused, color }) => {
          return (
            <View>
              <Text style={[focused ? styles.activeTabTextColor : styles.tabTextColor]}>
                {route.title}
              </Text>
            </View>
          )
        }} />
      }
    />
  );
}

const styles = StyleSheet.create({
  activeTabTextColor: {
    color: '#222'
  },
  tabTextColor: {
    color: '#BBBBBB'
  }
})