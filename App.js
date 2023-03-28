
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as Font from 'expo-font';

//Pages
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Splash from './src/pages/Splash';
import Tabs from './Tabs';

const AppLoad = createStackNavigator();
let customFonts = {
  'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
  'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
};


const appStack = createStackNavigator();


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      fontsLoaded: false,
    };
  }
  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }
  async componentDidMount(){
    this._loadFontsAsync();
  }
  render() {
    if (!this.state.fontsLoaded) {
      return null;
    }
    else{
      return (
      <NavigationContainer>
        <appStack.Navigator initialRouteName='Splash'>
          <appStack.Screen name="Home" component={Home} options={{headerShown: false}}/>
          <appStack.Screen name="Login" component={Login} options={{headerShown: false}}/>
          <appStack.Screen name="Splash" component={Splash} options={{headerShown: false}}/>
          <appStack.Screen name="Tabs" component={Tabs} options={{headerShown: false}}/>
        </appStack.Navigator>
      </NavigationContainer>
    );
  }
}}