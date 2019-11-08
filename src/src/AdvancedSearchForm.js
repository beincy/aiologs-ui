import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Icon, message, Select, Cascader } from 'antd';
import './AdvancedSearchForm.css';
import reqwest from 'reqwest';
import { DatePicker } from 'antd';

class AdvancedSearchForm extends Component {
    constructor(props) {
        console.log("search rander")
        super(props);
        this.reprot = props.onChange
    }
    state = {
        expand: false,
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
        projectList: [],
        envList: [],
        ipList: [],
        moduleList: [],
        categoryOptions: [
        ],
        endOpen: false
    };

    getES_index() {
        let es_index = "aiologs"  //定位es的索引
        if (this.state.searchSql.beginTime && this.state.searchSql.endTime) {
            // 如果选择了时间，则根据时间定位默认查询一个月内的数据
            const begin = new Date(this.state.searchSql.beginTime)
            const endTime = new Date(this.state.searchSql.endTime)
            if (begin.getFullYear() === endTime.getFullYear()) {
                es_index += `-${begin.getFullYear()}.`
                if (begin.getMonth() === endTime.getMonth()) {
                    const ss = String(begin.getMonth() + 1)
                    es_index += `${ss.length > 1 ? ss : ("0" + ss)}.`
                    if (begin.getDate() === endTime.getDate()) {
                        const dd = String(begin.getDate())
                        es_index += `${dd.length > 1 ? dd : ("0" + dd)}`
                    }
                    else {
                        es_index += '*'
                    }
                } else {
                    es_index += '*'
                }
            } else {
                es_index += '*'
            }
        }
        else if (this.state.searchSql.beginTime) {
            const begin = new Date(this.state.searchSql.beginTime)
            const ss = String(begin.getMonth() + 1)
            const dd = String(begin.getDate())
            es_index += `-${begin.getFullYear()}.${ss.length > 1 ? ss : ("0" + ss)}.${dd.length > 1 ? dd : ("0" + dd)}`
        }
        else if (this.state.endTime) {
            const endTime = new Date(this.state.searchSql.endTime)
            const ss = String(endTime.getMonth() + 1)
            const dd = String(endTime.getDate())
            es_index += `-${this.state.endTime.getFullYear()}.${ss.length > 1 ? ss : ("0" + ss)}.${dd.length > 1 ? dd : ("0" + dd)}`
        }
        else {
            es_index += '*'
        }
        return es_index
    }

    initProject() {
        const req = {
            "size": 0,
            "aggs": {
                "group_by_project": {
                    "terms": {
                        "field": "project"
                    }
                }
            }
        }
        let es_index = this.getES_index()  //定位es的索引
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.aggregations) {
                if (data.aggregations.group_by_project) {
                    if (data.aggregations.group_by_project.buckets && data.aggregations.group_by_project.buckets.length > 0) {
                        let projectList = data.aggregations.group_by_project.buckets.map(m => ({ "key": m.key }))
                        this.setState({
                            projectList
                        })
                        this.getenv(es_index);
                        this.getIp(es_index);
                        this.getModule(es_index);
                        return
                    }
                }
            }
            message.warning('没有查到项目数据');
        }).catch(() => {
            this.setState({
                projectList:[]
            })
            message.error('接口跪了~~~~(>_<)~~~~');
        });
    }

    getenv(es_index) {
        const req = {
            "size": 0,
            "aggs": {
                "group_by_project": {
                    "terms": {
                        "field": "env"
                    }
                }
            }
        }
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.aggregations) {
                if (data.aggregations.group_by_project) {
                    if (data.aggregations.group_by_project.buckets && data.aggregations.group_by_project.buckets.length > 0) {
                        let envList = data.aggregations.group_by_project.buckets.map(m => ({ "key": m.key }))
                        this.setState({
                            envList
                        })
                        return
                    }
                }
            }
            message.warning('没有查到环境数据');
        }).catch(() => {
            message.error('接口跪了~~~~(>_<)~~~~');
        });
    }

    getIp(es_index) {
        const req = {
            "size": 0,
            "aggs": {
                "group_by_project": {
                    "terms": {
                        "field": "ip"
                    }
                }
            }
        }
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.aggregations) {
                if (data.aggregations.group_by_project) {
                    if (data.aggregations.group_by_project.buckets && data.aggregations.group_by_project.buckets.length > 0) {
                        let ipList = data.aggregations.group_by_project.buckets.map(m => ({ "key": m.key }))
                        this.setState({
                            ipList
                        })
                        return
                    }
                }
            }
            message.warning('没有查到环境数据');
        }).catch(() => {
            message.error('接口跪了~~~~(>_<)~~~~');
        });
    }

    getModule(es_index) {
        const req = {
            "size": 0,
            "aggs": {
                "group_by_project": {
                    "terms": {
                        "field": "module"
                    }
                }
            }
        }
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.aggregations) {
                if (data.aggregations.group_by_project) {
                    if (data.aggregations.group_by_project.buckets && data.aggregations.group_by_project.buckets.length > 0) {
                        let moduleList = data.aggregations.group_by_project.buckets.map(m => ({ "key": m.key }))
                        this.setState({
                            moduleList
                        })
                        return
                    }
                }
            }
            message.warning('没有查到环境数据');
        }).catch(() => {
            message.error('接口跪了~~~~(>_<)~~~~');
        });
    }

    getCategory(selectedOptions) {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        const req = {
            "size": 0,
            "aggs": {
                "group_by_project": {
                    "terms": {
                        "field": "sub_category"
                    }
                }
            },
            "query": {
                "bool": {
                    "filter": {
                        "term": { "category": targetOption.label }
                    }
                }
            }
        }

        let es_index = this.getES_index()  //定位es的索引
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.aggregations) {
                if (data.aggregations.group_by_project) {
                    if (data.aggregations.group_by_project.buckets && data.aggregations.group_by_project.buckets.length > 0) {
                        targetOption.loading = false;
                        targetOption.children = data.aggregations.group_by_project.buckets.map(m => ({
                            value: m.key,
                            label: m.key
                        }))

                        this.setState({
                            categoryOptions: [...this.state.categoryOptions]
                        })
                        return
                    }
                }
            }
            message.warning('没有查到环境数据');
        }).catch(() => {
            message.error('接口跪了~~~~(>_<)~~~~');
        });
    }

    getFirstCategory(value) {
        const req = {
            "size": 0,
            "aggs": {
                "group_by_project": {
                    "terms": {
                        "field": "category"
                    }
                }
            },
            "query": {
                "bool": {
                    "filter": {
                        "term": { "module": value }
                    }
                }
            }
        }

        let es_index = this.getES_index()  //定位es的索引
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.aggregations) {
                if (data.aggregations.group_by_project) {
                    if (data.aggregations.group_by_project.buckets && data.aggregations.group_by_project.buckets.length > 0) {
                        let categoryOptions = data.aggregations.group_by_project.buckets.map(m => ({
                            value: m.key,
                            label: m.key,
                            isLeaf: false,
                        }))
                        this.setState({
                            categoryOptions
                        })
                        return
                    }
                }
            }
            message.warning('没有查到环境数据');
        }).catch(() => {
            message.error('接口跪了~~~~(>_<)~~~~');
        });
    }

    // To generate mock Form.Item
    getFields() {
        const expand = this.state.expand;
        const { Option } = Select;
        // const { getFieldDecorator } = this.props.form;
        const { endOpen, projectList, envList, ipList, moduleList } = this.state;
        const { beginTime, endTime } = this.state.searchSql;
        const children = [];
        children.push(
            <Col span={8} key={1} >
                <Form.Item label={'项目标识'}>
                    <Select
                        showSearch
                        style={{ width: "100%" }}
                        placeholder="选择一个项目"
                        optionFilterProp="children"
                        onChange={v => this.changeFiled(v, 'project')}
                        allowClear
                    >
                        {projectList ? projectList.map(m => (
                            <Option value={m.key} key={m.key}>{m.key}</Option>
                        )) : []}
                    </Select>
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={7} >
                <Form.Item label={'时间'}>
                    <div>
                        <DatePicker className="datetime-pickup-size"
                            disabledDate={this.disabledStartDate}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={beginTime}
                            placeholder="开始时间"
                            onChange={this.onStartChange}
                            onOpenChange={this.handleStartOpenChange}
                            allowClear
                        />
                        <DatePicker
                            className="datetime-pickup-size"
                            disabledDate={this.disabledEndDate}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={endTime}
                            placeholder="结束时间"
                            onChange={this.onEndChange}
                            open={endOpen}
                            onOpenChange={this.handleEndOpenChange}
                            allowClear
                        />
                    </div>
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={3}>
                <Form.Item label={'错误类型'}>
                    <Select style={{ width: "100%" }} onChange={(a) => this.changeFiled(a, "logLevel")} placeholder="可选" allowClear>
                        <Option value="INFO" >INFO</Option>
                        <Option value="WARNING" >WARNING</Option>
                        <Option value="ERROR" >ERROR</Option>
                        <Option value="CRITICAL" >CRITICAL</Option>
                        <Option value="DEBUG">DEBUG</Option>
                    </Select>
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={4}>
                <Form.Item label={'模块'}>
                    <Select style={{ width: "100%" }} onChange={(a) => this.onChangeModule(a)} placeholder="可选" allowClear>
                        {moduleList ? moduleList.map(m => (
                            <Option value={m.key} key={m.key}>{m.key}</Option>
                        )) : []}
                    </Select>
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={5}>
                <Form.Item label={'分类'}>
                    <Cascader
                        options={this.state.categoryOptions}
                        loadData={this.getCategory.bind(this)}
                        onChange={this.onCategoryChange.bind(this)}
                        changeOnSelect
                        placeholder="可选"
                    />
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={2}>
                <Form.Item label={'环境'}>
                    <Select defaultValue="product" style={{ width: "100%" }} onChange={(a) => this.changeFiled(a, "env")} placeholder="可选" allowClear>
                        {envList ? envList.map(m => (
                            <Option value={m.key} key={m.key}>{m.key}</Option>
                        )) : []}
                    </Select>
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={8} style={{ display: expand ? 'block' : 'none' }}>
                <Form.Item label={'ip'} >
                    <Select mode="multiple" style={{ width: "100%" }} onChange={(a) => this.changeFiled(a, "env")} placeholder="可选" allowClear>
                        {ipList ? ipList.map(m => (
                            <Option value={m.key} key={m.key}>{m.key}</Option>
                        )) : []}
                    </Select>
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={9} style={{ display: expand ? 'block' : 'none' }}>
                <Form.Item label={'过滤条件1'}>
                    <Input placeholder="可填" name="filter1" onChange={this.inputChange.bind(this)} allowClear />
                </Form.Item>
            </Col>,
        );
        children.push(
            <Col span={8} key={10} style={{ display: expand ? 'block' : 'none' }}>
                <Form.Item label={'过滤条件2'}>
                    <Input placeholder="可填" name="filter2" onChange={this.inputChange.bind(this)} allowClear />
                </Form.Item>
            </Col>,
        );
        // for (let i = 0; i < 10; i++) {
        //     children.push(
        //         <Col span={8} key={i} style={{ display: i < count ? 'block' : 'none' }}>
        //             <Form.Item label={`Field ${i}`}>
        //                 {getFieldDecorator(`field-${i}`, {
        //                     rules: [
        //                         {
        //                             required: true,
        //                             message: 'Input something!',
        //                         },
        //                     ],
        //                 })(<Input placeholder="placeholder" />)}
        //             </Form.Item>
        //         </Col>,
        //     );
        // }
        return children;
    }

    changeFiled(value, filed) {
        const searchSql = { ...this.state.searchSql }
        searchSql[filed] = value
        this.setState({
            searchSql
        })
    }

    inputChange(event) {
        const target = event.target;
        const name = target.name;
        this.changeFiled(target.value, name)
    }

    onChangeModule(value) {
        this.changeFiled(value, "module");
        if (value && value.length > 0) {
            this.getFirstCategory(value);
        }else{
            this.setState({
                categoryOptions:[]
            })
        }
    }

    onCategoryChange(value, selectedOptions) {
        if (value.length===0){
            this.changeFiled("", "category");
            this.changeFiled("", "sub_category");
        }
        if (value.length === 1) {
            this.changeFiled(value[0], "category");
            this.changeFiled("", "sub_category");
        }
        if (value.length > 1) {
            this.changeFiled(value[0], "category");
            this.changeFiled(value[1], "sub_category");
        }
    }

    handleSearch = e => {
        e.preventDefault();
        this.reprot(this.state.searchSql)
    };

    handleReset = () => {
        const resetData={
            expand: this.state.expand,
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
            projectList: [],
            envList: [],
            ipList: [],
            moduleList: [],
            categoryOptions: [
            ],
            endOpen: false
        }
        this.reprot(resetData,1)
    };

    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    };

    disabledStartDate = beginTime => {
        const { endtime } = this.state.searchSql;
        if (!beginTime || !endtime) {
            return false;
        }
        return beginTime.valueOf() > endtime.valueOf();
    };

    disabledEndDate = endtime => {
        const { beginTime } = this.state.searchSql;
        if (!endtime || !beginTime) {
            return false;
        }
        return endtime.valueOf() <= beginTime.valueOf();
    };

    onStartChange = value => {
        const searchSql = { ...this.state.searchSql }
        searchSql.beginTime = value
        this.setState({
            searchSql
        });
        // this.initProject()
    };

    onEndChange = value => {
        const searchSql = { ...this.state.searchSql }
        searchSql.endTime = value
        this.setState({
            searchSql
        });
        // this.initProject()
    };

    handleStartOpenChange = open => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    };

    handleEndOpenChange = open => {
        this.setState({ endOpen: open });
    };
    componentDidMount() {
        this.initProject();
    };
    render() {
        return (
            <Form className="ant-advanced-search-form" onSubmit={this.handleSearch} labelCol={{ span: 3 }}>
                <Row gutter={24}>{this.getFields()}</Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit">
                            查询
                </Button>
                        <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                            清除
                </Button>
                        <Button type="link" style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                            折叠 <Icon type={this.state.expand ? 'up' : 'down'} />
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default AdvancedSearchForm;