import * as React from 'react';
import { View, useWindowDimensions, Text, StyleSheet, TextInput} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Feather, AntDesign } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';

const FirstRoute = () => {
  const [searchText, setsearchText] = React.useState("");
  const [randomValue, setRandomValue] = React.useState(0);
  React.useEffect(() => {
    generateRandom();
  }, []);

  const generateRandom = () => {
    setRandomValue(Math.floor(Math.random() * 100) + 1)
    setTimeout(() => {
      generateRandom();
    },1000); 
  }
  return(
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{margin:"7.5%", marginTop: "6%", height: 50, backgroundColor:"#fff", borderWidth: 0.9, paddingLeft: 15, borderColor:"#BBBBBB", borderRadius: 8, flexDirection:"row", alignItems:"center"}}>
        <Feather name="search" size={19} color="#222" style={{paddingRight: 7,}}/>
        <TextInput
          style={{
              color: "#222",
              fontSize: 18
          }}
          value={searchText}
          placeholder="Search"
          placeholderTextColor={"#9E9E9E"}
          onChangeText={(e) => setsearchText(e)}
        />
      </View>
      <View style={{margin:"7.5%", marginTop: "0%", marginBottom:"4%", justifyContent:"space-between", flexDirection:"row", alignItems:"center"}}>
        <Text>Coffee Day Enterprise</Text>
        <View>
          <Text style={{textAlign:"right"}}>₹{randomValue/2}</Text>
          <Text style={{textAlign:"right", alignItems:"center", color:"#da540d"}}><AntDesign name="caretdown" size={17} color="#da540d"/> -{randomValue%10}%</Text>
        </View>
      </View>
      <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
      <View style={{margin:"7.5%", marginTop: "4%", marginBottom:"4%", justifyContent:"space-between", flexDirection:"row", alignItems:"center"}}>
        <Text>Wipro</Text>
        <View>
          <Text style={{textAlign:"right"}}>₹{randomValue/5}</Text>
          <View style={{flexDirection:"row"}}>
            <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}}/>
            <Text style={{textAlign:"right", alignItems:"center", color:"#5ecd9f"}}> {randomValue%8}%</Text>
          </View>
        </View>
      </View>
      <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
      <View style={{margin:"7.5%", marginTop: "4%", marginBottom:"4%", justifyContent:"space-between", flexDirection:"row", alignItems:"center"}}>
        <Text>Delhivery</Text>
        <View>
          <Text style={{textAlign:"right"}}>₹{randomValue*2}</Text>
          <Text style={{textAlign:"right", alignItems:"center", color:"#da540d"}}><AntDesign name="caretdown" size={17} color="#da540d"/> -{randomValue%5}%</Text>
        </View>
      </View>
      <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
      <View style={{margin:"7.5%", marginTop: "4%", marginBottom:"4%", justifyContent:"space-between", flexDirection:"row", alignItems:"center"}}>
        <Text>Bikaji Foods International</Text>
        <View>
          <Text style={{textAlign:"right"}}>₹{randomValue*1}</Text>
          <View style={{flexDirection:"row"}}>
            <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}}/>
            <Text style={{textAlign:"right", alignItems:"center", color:"#5ecd9f"}}> {randomValue%2}%</Text>
          </View>
        </View>
      </View>
      <Divider style={{height: 0.4, backgroundColor: '#ADADAD'}}/>
      <View style={{margin:"7.5%", marginTop: "4%", marginBottom:"4%", justifyContent:"space-between", flexDirection:"row", alignItems:"center"}}>
        <Text>Union Bank of India</Text>
        <View>
          <Text style={{textAlign:"right"}}>₹{randomValue/10}</Text>
          <View style={{flexDirection:"row"}}>
            <AntDesign name="caretup" size={17} color="#5ecd9f" style={{marginTop: 3}}/>
            <Text style={{textAlign:"right", alignItems:"center", color:"#5ecd9f"}}> {randomValue%7}%</Text>
          </View>
        </View>
      </View>
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