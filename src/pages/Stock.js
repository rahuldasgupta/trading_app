import React, { Component } from "react";
import { Text, View, ScrollView, Dimensions, TouchableOpacity, Image, RefreshControl, ActivityIndicator} from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { LineChart } from 'react-native-wagmi-charts';
import { Fontisto, Feather, Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";

  
const windowWidth = Dimensions.get('window').width;

export default class Stock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: this.props.route.params.symbol,
      chartData: [
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
    ],
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
        volume: Math.random() * 1000000,
        priceDifference: 0,
        priceDifferencePercentage: 0,
        isPricePositive: true,
        loaderModal: true,
        refreshing: false,
        currentPrice: 0,
        recommendation: "",
        analystNumber: 0,
        ebita: 0,
        debtToEquity: 0,
        rps: "",
        roe: "",
        earningsGrowth: 0,
        revenueGrowth: 0,
        beta: 0,
        ptob: 0,
        ptoe: 0,
        bookValue: 0
    };
  }
  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
    NavigationBar.setButtonStyleAsync("dark");
    this.getChart("1d", "5m");

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    };
    let range = "1y"
    let interval = "1d"
    let symbol = this.state.symbol
    await fetch('https://yh-finance.p.rapidapi.com/stock/v2/get-chart?interval=' + interval + '&symbol=' + symbol + '&range='+ range + '&region=IN', options)
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
  }
  getChart = async(range, interval) => {
    let symbol = this.state.symbol
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    };
    
    await fetch('https://yh-finance.p.rapidapi.com/stock/v2/get-chart?interval=' + interval + '&symbol=' + symbol + '&range='+ range + '&region=IN', options)
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
                chartData: finalData
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
            'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
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
            let debtToEquity = response.financialData.debtToEquity.fmt
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
                debtToEquity: debtToEquity,
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
            'X-RapidAPI-Key': 'fda68741aamshbc802fc48d29613p1c42d9jsn437ceffc7a8e',
            'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
        }
    };
    
    await fetch('https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbol=' + symbol + '&region=US', options)
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
                loaderModal: false
            })
        })
        .catch(err => console.error(err));
  }
  _onRefresh = () => {
    this.setState({refreshing: true,});
    this.getChart("1d", "5m");
    this.getStockFinancial(this.state.symbol);
    this.setState({refreshing: false});
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
                    <Image source={{uri:  "https://i.ibb.co/0GQY3cY/tata.jpg"}} style={{height: 40, width: 40}} resizeMode="cover"/>
                    <Text style={{marginTop:2, fontSize: 17, fontWeight:"600"}}>{this.state.stockName}</Text>
                    <Text style={{marginTop: 7, fontSize: 26, fontWeight:"bold"}}>₹{this.state.currentPrice}</Text>
                    <Text style={{fontSize: 13.5, fontWeight:"bold", color: this.state.isPricePositive ? "#5ecd9f" : "#da540d"}}>{this.state.priceDifference} {"("}{this.state.priceDifferencePercentage}%{")"}</Text>
                </View>
                <TouchableOpacity style={{height: 35, paddingLeft: 10, paddingRight: 10, borderWidth: 1, borderRadius: 100, borderColor:"#9E9E9E", alignItems:"center",  justifyContent:"center"}}>
                    <Text style={{textAlign:"center", color:"#838383"}}>{this.state.sector}</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginLeft: 17.5,}}>
                <LineChart.Provider data={this.state.chartData}>
                    <LineChart width={windowWidth-35} height={250}>
                        <LineChart.Path color={this.state.isCartPostive ? "#5ecd9f" : "#da540d"}>
                            <LineChart.HorizontalLine at={{ index: 0 }} />
                        </LineChart.Path>
                        <LineChart.CursorCrosshair>
                        <LineChart.Tooltip />
                        </LineChart.CursorCrosshair>
                    </LineChart>
                </LineChart.Provider>
            </View>
            <View style={{flexDirection:"row", justifyContent:"space-between", marginLeft:"5%", marginRight:"5%" ,marginTop:"1%"}}>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1D" ? "#0a77e8" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}} onPress={() => this.setRange("1d", "5m", "1D")}>
                    <Text style={{color: this.state.currentRange === "1D" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1D</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1W" ? "#0a77e8" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}} onPress={() => this.setRange("5d", "15m", "1W")}>
                    <Text style={{color: this.state.currentRange === "1W" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1W</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1M" ? "#0a77e8" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}} onPress={() => this.setRange("1mo", "60m", "1M")}>
                    <Text style={{color: this.state.currentRange === "1M" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1M</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "YTD" ? "#0a77e8" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}} onPress={() => this.setRange("ytd", "1d", "YTD")}>
                    <Text style={{color: this.state.currentRange === "YTD" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>YTD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "1Y" ? "#0a77e8" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}} onPress={() => this.setRange("1y", "1d", "1Y")}>
                    <Text style={{color: this.state.currentRange === "1Y" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>1Y</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: this.state.currentRange === "5Y" ? "#0a77e8" : "#FFF", paddingLeft: 15, paddingRight: 15, paddingTop:3, paddingBottom: 3, borderRadius: 100}} onPress={() => this.setRange("5y", "1d", "5Y")}>
                    <Text style={{color: this.state.currentRange === "5Y" ? "#fff" : "#6B6B6B", fontSize: 15, fontWeight:"600"}}>5Y</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%" ,marginTop:"7%"}}>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Today's Low</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.state.DayLow}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>Today's High</Text>
                        <Text style={{textAlign:"right", marginTop: 2, fontWeight:"bold"}}>{this.state.DayHigh}</Text>
                    </View>
                </View>
                <View style={{height: 3, backgroundColor:"#198AFE", width:"100%", marginTop:"3%", borderRadius: 10}}>
                    <Ionicons name="triangle" size={13} color="#222" style={{position:"absolute", top: 1, marginLeft:"35%"}}/>
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: "6%"}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>52 Week Low</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.state.YearLow}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>52 Week High</Text>
                        <Text style={{textAlign:"right", marginTop: 2, fontWeight:"bold"}}>{this.state.YearHigh}</Text>
                    </View>
                </View>
                <View style={{height: 3, backgroundColor:"#198AFE", width:"100%", marginTop:"3%", borderRadius: 10}}>
                    <Ionicons name="triangle" size={13} color="#222" style={{position:"absolute", top: 1, marginLeft:"65%"}}/>
                </View>
                <View style={{marginTop:"9%", flexDirection:"row", justifyContent:"space-between", marginBottom: 10}}>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Open</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.state.ope}</Text>
                    </View>
                    <View>
                        <Text style={{color:"#6B6B6B"}}>Previous Close</Text>
                        <Text style={{marginTop: 2, fontWeight:"bold"}}>{this.state.close}</Text>
                    </View>
                    <View>
                        <Text style={{textAlign:"right", color:"#6B6B6B"}}>Volume</Text>
                        <Text style={{textAlign:"right", marginTop: 2, fontWeight:"bold"}}>40,79,283</Text>
                    </View>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%", marginBottom: 20, marginTop:"7%"}}>
                <Text style={{fontSize: 17, fontWeight:"bold"}}>Financial Metrics</Text>
                <View style={{width:"100%", marginTop: 20, flexDirection:"row"}}>
                    <View style={{width:"45%", marginRight:"5%"}}>
                        <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>P/E</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.ptoe}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>P/B</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.ptob}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>Debt To Equity</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.debtToEquity}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>ROE</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.roe}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>EPS</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.eps}</Text>
                        </View>
                    </View>
                    <View style={{width:"50%", borderLeftWidth: 1, borderLeftColor:"#E7E7E7", paddingLeft:"5%"}}>
                        <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>EBITA</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.ebita}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>Revenue Growth</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.revenueGrowth}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>Profit Growth</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.earningsGrowth}</Text>
                        </View>
                        <View style={{flexDirection:"row", marginTop: 8, justifyContent:"space-between"}}>
                            <Text style={{fontSize: 13, fontWeight:"bold"}}>Book Value</Text>
                            <Text style={{textAlign:"right", fontSize: 13.5}}>{this.state.bookValue}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{marginLeft:"5%", marginRight:"5%", marginBottom: 50, marginTop:"7%"}}>
                <View style={{flexDirection:"row"}}>
                    <View style={{height: 80, width: 80, borderRadius: 150/2, backgroundColor: this.state.recommendation === "buy" ? "#5ecd9f" : "#da540d", padding: 10}}>
                        <View style={{height: "100%", width: "100%", borderRadius: 150/2, backgroundColor: "#fff", padding: 10, alignContent:"center", alignSelf:"center", justifyContent:"center"}}>
                            <Text style={{textAlign:"center", alignContent:"center", alignSelf:"center", justifyContent:"center", fontSize: 16, fontWeight:"600", color: this.state.recommendation === "buy" ? "#5ecd9f" : "#da540d"}}>{this.state.recommendation === "buy" ? "BUY" : "SELL"}</Text>
                        </View>
                    </View>
                    <View style={{marginLeft: 15, marginTop: 5}}>
                        <Text style={{fontSize: 17, fontWeight:"bold"}}>Recommendation</Text>
                        <Text style={{fontSize: 14, color:"gray"}}>Based on {this.state.analystNumber} analyst's reports.</Text>
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
