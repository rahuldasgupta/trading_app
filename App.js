
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

//Pages
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Splash from './src/pages/Splash';
import Stock from './src/pages/Stock';
import Tabs from './Tabs';


const appStack = createStackNavigator();

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }
  render() {
    return (
      <NavigationContainer>
        <appStack.Navigator initialRouteName='Splash'>
          <appStack.Screen name="Home" component={Home} options={{headerShown: false}}/>
          <appStack.Screen name="Login" component={Login} options={{headerShown: false}}/>
          <appStack.Screen name="Splash" component={Splash} options={{headerShown: false}}/>
          <appStack.Screen name="Stock" component={Stock} options={{headerShown: false}}/>
          <appStack.Screen name="Tabs" component={Tabs} options={{headerShown: false}}/>
        </appStack.Navigator>
      </NavigationContainer>
    );
  }
}