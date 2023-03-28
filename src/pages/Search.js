import React, { Component } from "react";
import { Text, View, Dimensions, Image, TouchableOpacity, TextInput} from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowHeight = Dimensions.get('window').height;


export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchHistory:"",
      searchText:"",
      searchData: []
    };
  }
    async componentDidMount(){
        NavigationBar.setBackgroundColorAsync("#fff");
        NavigationBar.setButtonStyleAsync("dark");
        this.checkSearchHistory();
    }
    handleChangeText = (data) => {
        this.setState({
            searchText: data
        })
        this.storeData(data);
        this.getSearchData(data)
    }
    storeData = async (data) => {
        await AsyncStorage.setItem('searchTerm', data);
    };
    checkSearchHistory = async () => {
        let searchTerm = await AsyncStorage.getItem('searchTerm');
        console.log("SEARCH TERM ===>", searchTerm)
        if(searchTerm){
            this.setState({
                searchHistory: searchTerm
            })
        }
    }
    getSearchData = async(searchTerm) => {

        //API DOJO
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
                'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
            }
        };
        
        await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete?q='+ searchTerm + '&region=IN', options)
            .then(response => response.json())
            .then((response) => {
                console.log(response)
                let dataSorted = []
                dataSorted = response.quotes.filter(item => item.symbol.includes('.NS'));
                console.log(dataSorted)
                this.setState({searchData: dataSorted})
                
            })
            .catch(err => console.error(err));
    }
    handleNavigation = (symbol) => {
        this.props.navigation.navigate("Stock", {symbol: symbol})
    }
  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight, minHeight: windowHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <View style={{margin: "5%", flexDirection:"row", alignItems:"center"}}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
                <Image source={require("../../assets/back_arrow.png")} style={{height: 27, width: 27}}/>
            </TouchableOpacity>
            <TextInput
                style={{
                    color: "#222",
                    fontSize: 19,
                    width: "80%",
                    marginLeft: 20,
                    backgroundColor:"#fff",
                    fontFamily:"Lato-Regular",
                }}
                value={this.state.searchText}
                placeholder="Search"
                placeholderTextColor={"#9E9E9E"}
                onChangeText={(e) =>  this.handleChangeText(e)}
            />
        </View>
        <Divider style={{height: 0.5, backgroundColor: '#ADADAD',  marginTop:0}}/>
        <View style={{margin: "5%"}}>
            {
                this.state.searchData ?
                <>
                    {
                        this.state.searchData.map((item, key) =>(
                            <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                                <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 8}}>
                                    <Image source={require("../../assets/search.png")} style={{height: 18, width: 18}} />
                                </View>
                                <View>
                                    <TouchableOpacity onPress={() => this.handleNavigation(item.symbol)}>
                                        <View>
                                            <Text style={{marginLeft: 15, fontSize: 13.5}}>{item.longname}</Text>
                                            <Text style={{marginLeft: 15, fontSize: 13.5, color:"#ADADAD", textTransform: 'uppercase'}}>{item.symbol}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    }
                </>
                :
                <></>
            }
            {
                this.state.searchHistory ?
                <TouchableOpacity onPress={() => this.handleChangeText(this.state.searchHistory)}>
                    <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                        <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 7.5}}>
                            <Image source={require("../../assets/history.png")} style={{height: 20, width: 20}} />
                        </View>
                        <View>
                            <Text style={{marginLeft: 15, fontSize: 13.5,  textTransform: 'uppercase'}}>{this.state.searchHistory}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                :
                <></>
            }
            <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 7.5}}>
                    <Image source={require("../../assets/trend.png")} style={{height: 20, width: 20}} />
                </View>
                <View>
                    <Text style={{marginLeft: 15, fontSize: 13.5}}>Adani Enterprise</Text>
                    <Text style={{marginLeft: 15, fontSize: 13.5, color:"#ADADAD"}}>ADANIENT</Text>
                </View>
            </View>
            <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 7.5}}>
                    <Image source={require("../../assets/trend.png")} style={{height: 20, width: 20}} />
                </View>
                <View>
                    <Text style={{marginLeft: 15, fontSize: 13.5}}>Zomato Ltd</Text>
                    <Text style={{marginLeft: 15, fontSize: 13.5, color:"#ADADAD"}}>ZOMATO</Text>
                </View>
            </View>
            <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 7.5}}>
                    <Image source={require("../../assets/trend.png")} style={{height: 20, width: 20}} />
                </View>
                <View>
                    <Text style={{marginLeft: 15, fontSize: 13.5}}>Tata Power</Text>
                    <Text style={{marginLeft: 15, fontSize: 13.5, color:"#ADADAD"}}>TATAPOWER</Text>
                </View>
            </View>
            <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 7.5}}>
                    <Image source={require("../../assets/trend.png")} style={{height: 20, width: 20}} />
                </View>
                <View>
                    <Text style={{marginLeft: 15, fontSize: 13.5}}>ICICI Bank</Text>
                    <Text style={{marginLeft: 15, fontSize: 13.5, color:"#ADADAD"}}>ICICIBANK</Text>
                </View>
            </View>
            <View style={{flexDirection:"row", alignItems:"center", marginBottom: 18}}>
                <View style={{ backgroundColor:"#EBEBEB", width: 35, borderRadius:100, padding: 7.5}}>
                    <Image source={require("../../assets/trend.png")} style={{height: 20, width: 20}} />
                </View>
                <View>
                    <Text style={{marginLeft: 15, fontSize: 13.5}}>FSN E-Commerce Ventures Ltd</Text>
                    <Text style={{marginLeft: 15, fontSize: 13.5, color:"#ADADAD"}}>NYKAA</Text>
                </View>
            </View>
        </View>
      </View>
    );
  }
}
