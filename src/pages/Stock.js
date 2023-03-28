import React, { Component } from "react";
import { Text, View, ScrollView, Dimensions, TouchableOpacity, Image, RefreshControl, ActivityIndicator} from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { LineChart } from 'react-native-wagmi-charts';
import { Fontisto, Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { Divider } from 'react-native-paper';


const randomNumber = Math.floor(Math.random() * 10000000);
const formattedNumber = randomNumber.toLocaleString('en-IN');
const windowWidth = Dimensions.get('window').width;

export default class Stock extends Component {
  constructor(props) {
    super(props);
    this.state = {
        symbol: this.props.route.params.symbol,
        chartData: [ { value: 0},  { value: 0},  { value: 0},  { value: 0},  { value: 0}],
        isCartPostive: true,
        currentRange: "1D",
        stockName: "",
        sector: "",
        DayHigh: 0,
        DayLow: 0,
        YearHigh: 0,
        YearLow: 0,
        open: 0,
        close: 205,
        priceDifference: 0,
        priceDifferencePercentage: 0,
        isPricePositive: true,
        loaderModal: true,
        refreshing: false,
        currentPrice: 0,
        recommendation: "",
        analystNumber: 0,
        ebita: 0,
        rps: "",
        roe: "",
        earningsGrowth: 0,
        revenueGrowth: 0,
        beta: 0,
        ptob: 0,
        ptoe: 0,
        bookValue: 0,
        holders: []
    };
  }
  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
    NavigationBar.setButtonStyleAsync("dark");
    this.getChart("1d", "5m");

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };
    let range = "1y"
    let interval = "1d"
    let symbol = this.state.symbol
    await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=' + interval + '&symbol=' + symbol + '&range='+ range + '&region=IN', options)
        .then(response => response.json())
        .then((response) => {
            let dataArr = response.chart.result[0].indicators.quote[0].close;
            let YearHigh = dataArr.reduce((acc, curr) => {
                return acc > curr ? acc : curr;
            });
            let YearLow = dataArr.reduce((acc, curr) => {
                return acc < curr ? acc : curr;
            });
            this.setState({
                YearHigh: YearHigh.toFixed(2),
                YearLow: YearLow.toFixed(2)
            })
        })
        .catch(err => console.error(err));
    this.getStockFinancial(this.state.symbol)
    this.getStockData(this.state.symbol)
    this.getHolders(this.state.symbol)
  }
  getChart = async(range, interval) => {
    let symbol = this.state.symbol
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };
    
    await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=' + interval + '&symbol=' + symbol + '&range='+ range + '&region=IN', options)
        .then(response => response.json())
        .then((response) => {
            let dataArr = response.chart.result[0].indicators.quote[0].close;
            let finalData = []
            for(let i = 0; i < dataArr.length; i++){
                finalData.push(
                  {
                    value: dataArr[i]
                  }
                )
            }
            console.log("CHART DATA ====>",finalData)
            if(dataArr[0]>dataArr[dataArr.length-1]){
                this.setState({
                    isCartPostive: false
                })
            }
            else{
                this.setState({
                    isCartPostive: true
                })
            }
            if(this.state.DayLow === 0 && this.state.DayHigh === 0 && this.state.open === 0){
                let DayHigh = dataArr.reduce((acc, curr) => {
                    return acc > curr ? acc : curr;
                });
                let DayLow = dataArr.reduce((acc, curr) => {
                    return acc < curr ? acc : curr;
                });
                let open = dataArr[0]
                let close = dataArr[1]
                this.setState({
                    DayLow: DayLow.toFixed(2),
                    DayHigh: DayHigh.toFixed(2),
                    open: open.toFixed(2),
                    close: close.toFixed(2)
                })
            }
            this.setState({
                chartData: finalData,
                refreshing: false
            })
        })
        .catch(err => console.error(err));
  }
  setRange = (range, interval, currentRange) => {
    this.getChart(range, interval)
    this.setState({
        currentRange: currentRange
    })
  }
  getStockFinancial = async(symbol) => {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
    };
    
    await fetch('https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/' + symbol + '/financial-data', options)
        .then(response => response.json())
        .then((response) => {
            let currentPrice = response.financialData.currentPrice.raw
            let recommendation = response.financialData.recommendationKey
            let analystNumber = response.financialData.numberOfAnalystOpinions.fmt
            let ebita = response.financialData.ebitda.fmt
            let rps = response.financialData.revenuePerShare.fmt
            let roe = response.financialData.returnOnEquity.fmt
            let earningsGrowth = response.financialData.earningsGrowth.fmt
            let revenueGrowth = response.financialData.revenueGrowth.fmt
            let priceDifferencePercentage = (currentPrice/this.state.close).toFixed(2)
            let ptoe = currentPrice/response.financialData.totalCashPerShare.raw
            let priceDifference = currentPrice - this.state.close

            this.setState({
                currentPrice: currentPrice,
                recommendation: recommendation,
                analystNumber: analystNumber,
                ebita: ebita,
                rps: rps,
                roe: roe,
                earningsGrowth: earningsGrowth,
                revenueGrowth: revenueGrowth,
                priceDifference: priceDifference.toFixed(2),
                priceDifferencePercentage: priceDifferencePercentage,
                ptoe: ptoe.toFixed(2)
            })
            if(this.state.close > currentPrice){
                this.setState({
                    isPricePositive: false
                })
            }
            else{
                this.setState({
                    isPricePositive: true
                })
            }
        })
        .catch(err => console.error(err));
  }
  getStockData = async(symbol) => {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };
    
    await fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=' + symbol + '&region=US', options)
        .then(response => response.json())
        .then((response) => {
            let name = response.quoteType.shortName
            let sector = response.summaryProfile.sector
            let beta = response.defaultKeyStatistics.beta.fmt
            let bookValue = response.defaultKeyStatistics.bookValue.fmt
            let ptob = response.defaultKeyStatistics.priceToBook.fmt

            this.setState({
                stockName: name,
                sector: sector,
                beta: beta,
                bookValue: bookValue,
                ptob: ptob,
                loaderModal: false,
            })
        })
        .catch(err => console.error(err));
  }
  _onRefresh = () => {
    this.setState({refreshing: true,});
    this.getChart("1d", "5m");
    this.getStockFinancial(this.state.symbol);
  }
  getHolders = () => {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e038a9c906msh11247ea41cd789ap1bff88jsn4472fd13c7b9',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
    };
    
    fetch('https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/TATAPOWER.NS/insider-holders', options)
        .then(response => response.json())
        .then((response) => {
            let holders = response.insiderHolders.holders
            this.setState({
                holders: holders
            })
        })
        .catch(err => console.error(err));
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor:"#fff", marginTop: Constants.statusBarHeight}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <Modal isVisible={this.state.loaderModal} style={{height:160, width: 160, justifyContent:"center", alignSelf:"center"}}  useNativeDriver={true}>
            <View style={{height:160, width: 160, backgroundColor: 'transparent', justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
        </Modal>
        <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={{marginBottom: 60}}
            refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh}
                />
            }
        >
            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginLeft:"5%", marginRight:"5%", marginTop:"5%"}}>
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
                    <Text style={{fontSize: 17, fontWeight:"600", color:"#03314b"}}>{this.state.stockName}</Text>
                    <Text style={{marginTop: 7, fontSize: 26, color:"#03314b", fontWeight:"bold"}}>₹{this.state.currentPrice}</Text>
                    <Text style={{fontSize: 13.5, fontWeight:"bold", color: this.state.isPricePositive ? "#1dcc98" : "#da540d"}}>{this.state.priceDifference} {"("}{this.state.priceDifferencePercentage}%{")"}</Text>
                </View>
                <TouchableOpacity style={{height: 35, paddingLeft: 10, paddingRight: 10, borderWidth: 1, borderRadius: 100, borderColor:"#9E9E9E", alignItems:"center",  justifyContent:"center"}}>
                    <Text style={{textAlign:"center", color:"#838383"}}>{this.state.sector}</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginLeft: 17.5,}}>
                <LineChart.Provider data={this.state.chartData}>
                    <LineChart width={windowWidth-35} height={250}>
                        <LineChart.Path color={this.state.isCartPostive ? "#1dcc98" : "#da540d"}>
                            <LineChart.Gradient />
                            <LineChart.HorizontalLine at={{ index: 0 }} />
                        </LineChart.Path>
                        <LineChart.CursorCrosshair>
                        <LineChart.Tooltip />
                        </LineChart.CursorCrosshair>
                    </LineChart>
                </LineChart.Provider>
            </View>
            <View style={{flexDirection:"row", justifyContent:"space-between", marginLeft:"5%", marginRight:"5%" ,marginTop:"1%"}}>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1D" ? "#1dcc98" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 5}} onPress={() => this.setRange("1d", "5m", "1D")}>
                    <Text style={{color: this.state.currentRange === "1D" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1D</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1W" ? "#1dcc98" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 5}} onPress={() => this.setRange("5d", "15m", "1W")}>
                    <Text style={{color: this.state.currentRange === "1W" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1W</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1M" ? "#1dcc98" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 5}} onPress={() => this.setRange("1mo", "60m", "1M")}>
                    <Text style={{color: this.state.currentRange === "1M" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1M</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "YTD" ? "#1dcc98" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 5}} onPress={() => this.setRange("ytd", "1d", "YTD")}>
                    <Text style={{color: this.state.currentRange === "YTD" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>YTD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1Y" ? "#1dcc98" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 5}} onPress={() => this.setRange("1y", "1d", "1Y")}>
                    <Text style={{color: this.state.currentRange === "1Y" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1Y</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "5Y" ? "#1dcc98" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 5}} onPress={() => this.setRange("5y", "1d", "5Y")}>
                    <Text style={{color: this.state.currentRange === "5Y" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>5Y</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%" ,marginTop:"7%"}}>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Today's Low</Text>
                        <Text style={{marginTop: 2, color:"#03314b", fontWeight:"bold"}}>{this.state.DayLow}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>Today's High</Text>
                        <Text style={{textAlign:"right", color:"#03314b", marginTop: 2, fontWeight:"bold"}}>{this.state.DayHigh}</Text>
                    </View>
                </View>
                <View style={{height: 3, backgroundColor: this.state.isCartPostive ? "#1dcc98" : "#da540d", width:"100%", marginTop:"3%", borderRadius: 10}}>
                    <Ionicons name="triangle" size={13} color="#222" style={{position:"absolute", top: 1, marginLeft:"35%"}}/>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: "6%"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>52 Week Low</Text>
                        <Text style={{marginTop: 2, color:"#03314b", fontWeight:"bold"}}>{this.state.YearLow}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>52 Week High</Text>
                        <Text style={{textAlign:"right", color:"#03314b", marginTop: 2, fontWeight:"bold"}}>{this.state.YearHigh}</Text>
                    </View>
                </View>
                <View style={{height: 3, backgroundColor:"#1dcc98", width:"100%", marginTop:"3%", borderRadius: 10}}>
                    <Ionicons name="triangle" size={13} color="#222" style={{position:"absolute", top: 1, marginLeft:"65%"}}/>
                </View>
                <View style={{marginTop:"9%", flexDirection:"row", justifyContent:"space-between", marginBottom: 10}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Open</Text>
                        <Text style={{marginTop: 2, color:"#03314b", fontWeight:"bold"}}>{this.state.open}</Text>
                    </View>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Previous Close</Text>
                        <Text style={{marginTop: 2, color:"#03314b", fontWeight:"bold"}}>{this.state.close}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>Volume</Text>
                        <Text style={{textAlign:"right", color:"#03314b", marginTop: 2, fontWeight:"bold"}}>{formattedNumber}</Text>
                    </View>
                </View>
            </View>
            <Divider style={{height: 0.5, backgroundColor: '#E2E2E2',  marginTop:14, marginBottom: 20}}/>
            <View style={{marginLeft:"5%", marginRight:"5%", marginBottom: 20}}>
                <Text style={{fontSize: 17, fontWeight:"bold", color:"#03314b",}}>Financial Metrics</Text>
                <View style={{width:"100%", marginTop: 20, flexDirection:"row"}}>
                    <View style={{width:"45%", marginRight:"5%"}}>
                        {
                            this.state.ptoe ?
                            <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                                <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>P/E</Text>
                                <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.ptoe}</Text>
                            </View>
                            :
                            <></>
                        }
                        {
                            this.state.ptob ?
                            <View style={{flexDirection:"row", marginTop: 12, justifyContent:"space-between"}}>
                                <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>P/B</Text>
                                <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.ptob}</Text>
                            </View>
                            :
                            <></>
                        }
                        {
                            this.state.roe ?
                            <View style={{flexDirection:"row", marginTop: 12, justifyContent:"space-between"}}>
                                <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>Return on Equity</Text>
                                <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.roe}</Text>
                            </View>
                            :
                            <></>
                        }
                        {
                            this.state.rps ?
                            <View style={{flexDirection:"row", marginTop: 12, justifyContent:"space-between"}}>
                                <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>RPS (TTM)</Text>
                                <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.rps}</Text>
                            </View>
                            :
                            <></>
                        }
                        <View style={{flexDirection:"row", marginTop: 12, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>Book Value</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.bookValue}</Text>
                        </View>
                    </View>
                    <View style={{width:"50%", borderLeftWidth: 1, borderLeftColor:"#fff", paddingLeft:"5%"}}>
                        <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>EBITA</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.ebita}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 12, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>Revenue Growth</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.revenueGrowth}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 12, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, color:"#03314b", fontWeight:"bold"}}>Profit Growth</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.earningsGrowth}</Text>
                        </View>
                        
                    </View>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%", marginBottom: 30, marginTop:"7%"}}>
                <View style={{flexDirection:"row"}}>
                    <View style={{height: 80, width: 80, borderRadius: 150/2, backgroundColor: this.state.recommendation === "buy" ? "#1dcc98" : "#da540d", padding: 10}}>
                        <View style={{height: "100%", width: "100%", borderRadius: 150/2, backgroundColor: "#fff", padding: 10, alignContent:"center", alignSelf:"center", justifyContent:"center"}}>
                            <Text style={{textAlign:"center", alignContent:"center", alignSelf:"center", justifyContent:"center", fontSize: 16, fontWeight:"600", color: this.state.recommendation === "buy" ? "#1dcc98" : "#da540d"}}>{this.state.recommendation === "buy" ? "BUY" : "SELL"}</Text>
                        </View>
                    </View>
                    <View style={{marginLeft: 15, marginTop: 5}}>
                        <Text style={{fontSize: 17, color:"#03314b", fontWeight:"bold"}}>Recommendation</Text>
                        <Text style={{fontSize: 14, color:"gray"}}>Based on {this.state.analystNumber} analyst's reports.</Text>
                    </View>

                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%", marginBottom: 20}}>
                <Text style={{fontSize: 17, fontWeight:"bold", color:"#03314b", marginBottom: 18}}>Insider Holders</Text>
                {
                  this.state.holders.map((item, key) =>(
                    <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}>
                            { item.relation === "Institution- Corporation" || item.relation === "Investment Advisor" ?
                                    <FontAwesome name="institution" size={21} color="#03314b" />
                                :
                                    <MaterialCommunityIcons name="account-tie" size={27} color="#03314b" />
                            }
                            <View style={{marginLeft: 7}}>
                                <Text style={{fontSize: 15, color:"#03314b", fontWeight:"bold"}}>{item.name}</Text>
                                <Text style={{fontSize: 14, marginTop: 2, textTransform: 'capitalize',}}>{item.relation}</Text>
                            </View>
                        </View>
                        <Divider style={{height: 0.5, backgroundColor: '#E2E2E2',  marginTop:12, marginBottom: 12}}/>
                    </View>
                  ))
                }
            </View>
        </ScrollView>
        <View style={{height:50, width: "100%", borderRadius: 13, backgroundColor:"#fff", position:"absolute", zIndex: 999999, bottom: 22, justifyContent:"space-between", paddingLeft:"5%", paddingRight:"5%"}}>
            <View style={{ marginTop: 12, flexDirection: "row", justifyContent:"space-between"}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("BuySell", {symbol: this.state.symbol, name: this.state.stockName, price: this.state.currentPrice, mode: "SELL"})} style={{borderRadius: 8,  height: 48, backgroundColor: "#da540d", width: "45%", justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
                    <Text style={{fontWeight: "bold", color: "#fff", fontSize: 17, marginTop: -3,}}>SELL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("BuySell", {symbol: this.state.symbol, name: this.state.stockName, price: this.state.currentPrice, mode: "BUY"})} style={{borderRadius: 8,  height: 48, backgroundColor: "#1dcc98", width: "45%", justifyContent:"center", alignItems:"center", alignSelf:"center"}}>
                    <Text style={{fontWeight: "bold", color: "#fff", fontSize: 17, marginTop: -3,}}>BUY</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  }
}
