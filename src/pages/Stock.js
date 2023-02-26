import React, { Component } from "react";
import { Text, View, ScrollView, Dimensions, TouchableOpacity, Image} from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { LineChart } from 'react-native-wagmi-charts';
import { Fontisto, Feather, Ionicons } from '@expo/vector-icons';

const data = [
    {
      value: 23.95,
    },
    {
      value: 25.72,
    },
    {
      value: 23.95,
    },
    {
        value: 21.95,
    },
    {
        value: 19.36,
    },
    {
        value: 21.17,
    },
    {
        value: 21.95,
    },
    {
        value: 22.11,
    },
    {
        value: 23.11,
    },
    {
        value: 23.81,
    },
    {
        value: 22.95,
    },
    {
        value: 23.89,
    },
    {
        value: 23.95,
    },
    {
        value: 24.72,
    },
    {
        value: 25.17,
    },
    {
      value: 22.08,
    },
    {
        value: 25.78,
    },
    {
        value: 27.97,
    },
];
  
const windowWidth = Dimensions.get('window').width;

export default class Stock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareName: ""
    };
  }
  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
    NavigationBar.setButtonStyleAsync("dark");
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={{marginBottom: 65}}>
            <View style={{flexDirection:"row", justifyContent:"space-between", marginLeft:"5%", marginRight:"5%", marginTop:"5%"}}>
                <TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
                    <Image source={require("../../assets/back_arrow.png")} style={{height: 27, width: 27}}/>
                </TouchableOpacity>
                <View style={{flexDirection:"row"}}>
                    <TouchableOpacity style={{marginRight: 15}}>
                        <Fontisto name="bookmark" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Feather name="search" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{flexDirection:"row", justifyContent:"space-between", marginLeft:"5%", marginRight:"5%", marginTop:"7%"}}>
                <View>
                    <Image source={{uri: this.props.route.params.image}} style={{height: 40, width: 40}} resizeMode="cover"/>
                    <Text style={{marginTop:2, fontSize: 17, fontWeight:"600"}}>{this.props.route.params.name}</Text>
                    <Text style={{marginTop: 7, fontSize: 26, fontWeight:"bold"}}>₹{this.props.route.params.price}</Text>
                    <Text style={{fontSize: 13.5, fontWeight:"bold", color: this.props.route.params.positive ? "#5ecd9f" : "#da540d"}}>{this.props.route.params.positive ? "+24.78": "-21.19"} {"("}{this.props.route.params.percentage}%{")"}</Text>
                </View>
                <TouchableOpacity style={{height: 35, width: 80,borderWidth: 1, borderRadius: 100, borderColor:"#9E9E9E", alignItems:"center",  justifyContent:"center"}}>
                    <Text style={{textAlign:"center", color:"#838383"}}>NSE</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginLeft: 17.5,}}>
                <LineChart.Provider data={data}>
                    <LineChart width={windowWidth-35} height={250}>
                        <LineChart.Path color={this.props.route.params.positive ? "#5ecd9f" : "#da540d"}>
                            <LineChart.HorizontalLine at={{ index: 0 }} />
                        </LineChart.Path>
                        <LineChart.CursorCrosshair>
                        <LineChart.Tooltip />
                        </LineChart.CursorCrosshair>
                    </LineChart>
                </LineChart.Provider>
            </View>
            <View style={{flexDirection:"row", justifyContent:"space-between", marginLeft:"5%", marginRight:"5%" ,marginTop:"1%"}}>
                <TouchableOpacity style={{backgroundColor:"#0a77e8", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}}>
                    <Text style={{color:"#fff", fontSize: 15, fontWeight:"600"}}>1D</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor:"#fff", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}}>
                    <Text style={{color:"#6B6B6B", fontSize: 15, fontWeight:"600"}}>1W</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor:"#fff", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}}>
                    <Text style={{color:"#6B6B6B", fontSize: 15, fontWeight:"600"}}>1M</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor:"#fff", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}}>
                    <Text style={{color:"#6B6B6B", fontSize: 15, fontWeight:"600"}}>1Y</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor:"#fff", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}}>
                    <Text style={{color:"#6B6B6B", fontSize: 15, fontWeight:"600"}}>5Y</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor:"#fff", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}}>
                    <Text style={{color:"#6B6B6B", fontSize: 15, fontWeight:"600"}}>ALL</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%" ,marginTop:"7%"}}>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Today's Low</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.props.route.params.price-5}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>Today's High</Text>
                        <Text style={{textAlign:"right", marginTop: 2, fontWeight:"bold"}}>{this.props.route.params.price+7}</Text>
                    </View>
                </View>
                <View style={{height: 3, backgroundColor:"#198AFE", width:"100%", marginTop:"3%", borderRadius: 10}}>
                    <Ionicons name="triangle" size={13} color="#222" style={{position:"absolute", top: 1, marginLeft:"35%"}}/>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: "6%"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>52 Week Low</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.props.route.params.price-20}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>52 Week High</Text>
                        <Text style={{textAlign:"right", marginTop: 2, fontWeight:"bold"}}>{this.props.route.params.price+227}</Text>
                    </View>
                </View>
                <View style={{height: 3, backgroundColor:"#198AFE", width:"100%", marginTop:"3%", borderRadius: 10}}>
                    <Ionicons name="triangle" size={13} color="#222" style={{position:"absolute", top: 1, marginLeft:"65%"}}/>
                </View>
                <View style={{marginTop:"9%", flexDirection:"row", justifyContent:"space-between"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Open</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.props.route.params.price+7}</Text>
                    </View>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Previous Close</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.props.route.params.price+11}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>Volume</Text>
                        <Text style={{textAlign:"right", marginTop: 2, fontWeight:"bold"}}>40,79,283</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
        <View style={{height:60, width: "100%", borderRadius: 13, backgroundColor:"#fff", position:"absolute", zIndex: 999999, bottom: 22, justifyContent:"space-between", paddingLeft:"5%", paddingRight:"5%"}}>
            <View style={{ marginTop: 30, flexDirection: "row", justifyContent:"space-between"}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("Register")} style={{borderRadius: 8,  height: 48, backgroundColor: "#da540d", width: "45%", justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
                    <Text style={{fontWeight: "bold", color: "#fff", fontSize: 17, marginTop: -3,}}>SELL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onSubmit} style={{borderRadius: 8,  height: 48, backgroundColor: "#5ecd9f", width: "45%", justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
                    <Text style={{fontWeight: "bold", color: "#fff", fontSize: 17, marginTop: -3,}}>BUY</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  }
}
