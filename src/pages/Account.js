import React, { Component } from "react";
import { Text, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
    };
  }
  async componentDidMount(){
    NavigationBar.setBackgroundColorAsync("#fff");
    NavigationBar.setButtonStyleAsync("dark");
  }
  render() {
    return (
      <View style={{ paddingTop: "75%"}}>
        <StatusBar backgroundColor={"#fff"} style="dark" />
        <Text style={{ fontSize: 30, fontWeight:"bold", color:"gray", textAlign:"center" }}>COMMING  SOON</Text>
      </View>
    );
  }
}