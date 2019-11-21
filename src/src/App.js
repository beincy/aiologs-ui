import React, { Component } from 'react';
import { Form } from 'antd';
import AdvancedSearchForm from './AdvancedSearchForm'
import LogsTable from './LogsTable'
import './App.css';


const WrappedAdvancedSearchForm = Form.create({ name: 'advanced_search' })(AdvancedSearchForm);
class App extends Component {
  state = {
    searchSql: {
      project: "",
      env: "",
      module: "",
      category: "",
      sub_category: "",
      logLevel: "",
      filter1: "",
      filter2: "",
      ip: "",
      beginTime: null,
      endTime: null,
    },
    searchKey:0
  }
  onSearchChange(v,n) {
    let searchKey=this.state.searchKey
    if(n){
      searchKey++
    }
    this.setState({
      searchSql: v,
      searchKey
    })
  }
  render() {
    const {searchSql,searchKey} = this.state
    return (
      <div className="App">
        <WrappedAdvancedSearchForm onChange={(v,n) => this.onSearchChange(v,n)} key={searchKey} />
        <div className="TableShow" ><LogsTable dataSource={searchSql} key={Math.ceil(Math.random()*1000)}/></div>
      </div>
    );
  }
}

export default App;
