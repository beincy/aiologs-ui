import React, { Component } from 'react';
import { Table, message, Tag, Modal, Descriptions,Button } from 'antd';
import reqwest from 'reqwest';
// import './AdvancedSearchForm.css';

function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

class LogsTable extends Component {
    constructor(props) {
        console.log("table rander")
        super(props);
        // this.state =props.dataSource
        this.state = {
            ...props.dataSource,
            pagination: {
                "current": 1,
                "pageSize": 10,
                "total": 0
            },
            loading: false,
            detailInfo: {},
            visible: false,
            dataSource:[]
        }
    };
    // shouldComponentUpdate(nextProps, nextState) {
    //     console.log(nextProps, nextState)
    //     return nextState.someData !== this.state.someData
    //   }
    getData(currentPage) {
        // if (!this.state.project) {
        //     message.error('项目必须选择');
        //     return
        // }
        this.setState({ loading: true })
        let es_index = "aiologs"  //定位es的索引
        if (this.state.beginTime && this.state.endTime) {
            // 如果选择了时间，则根据时间定位默认查询一个月内的数据
            const begin = new Date(this.state.beginTime)
            const endTime = new Date(this.state.endTime)
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
        else if (this.state.beginTime) {
            const ss = String(this.state.beginTime.getMonth() + 1)
            const dd = String(this.state.beginTime.getDate())
            es_index += `-${this.state.beginTime.getFullYear()}.${ss.length > 1 ? ss : ("0" + ss)}.${dd.length > 1 ? dd : ("0" + dd)}`
        }
        else if (this.state.endTime) {
            const ss = String(this.state.endTime.getMonth() + 1)
            const dd = String(this.state.endTime.getDate())
            es_index += `-${this.state.endTime.getFullYear()}.${ss.length > 1 ? ss : ("0" + ss)}.${dd.length > 1 ? dd : ("0" + dd)}`
        }
        else {
            es_index += '*'
        }
        if (!currentPage) {
            currentPage = 1
        }
        const req = {
            "size": 10,
            "from": (currentPage - 1) * 10,
            "sort": [
                {
                    "addtime": {
                        "order": "desc"
                    },
                    "_id": {
                        "order": "desc"
                    }
                }
            ]
        }
        //分页

        // if (this.state.affterTime || this.state.es_id) {
        //     req.search_after = []
        //     if (this.state.affterTime) {
        //         req.search_after.push(this.state.affterTime)
        //     }
        //     if (this.state.es_id) {
        //         req.search_after.push(this.state.es_id)
        //     }
        // }
        let range = undefined
        // 时间范围减少
        if (this.state.beginTime || this.state.endTime) {
            range = { "addtime": {} }
            if (this.state.beginTime) {
                range.addtime.gte = this.state.beginTime
            }
            if (this.state.endTime) {
                range.addtime.lte = this.state.endTime
            }
        }
        // 项目
        let term = []
        if (this.state.project) {
            term.push({
                "project": this.state.project
            })
        }
        if (this.state.env) {
            term.push({
                "env": this.state.env
            })
        }
        if (this.state.module) {
            term.push({
                "module": this.state.module
            })
        }
        if (this.state.category) {
            term.push({
                "category": this.state.category
            })
        }
        if (this.state.sub_category) {
            term.push({
                "sub_category": this.state.sub_category
            })
        }
        if (this.state.logLevel) {
            term.push({
                "logLevel": this.state.logLevel
            })
        }
        if (this.state.filter1) {
            term.push({
                "filter1": this.state.filter1
            })
        }
        if (this.state.filter2) {
            term.push({
                "filter2": this.state.filter2
            })
        }
        if (this.state.ip&&this.state.ip.length>0) {
            this.state.ip.forEach(element => term.push({
                "ip": element
            }));
        }
        if (term.length > 0 || range) {
            req.query = { "bool": { "filter": [] } }
            if (term.length === 1) {
                req.query.bool.filter.push({ "term": term[0] })
            }
            else if (term.length > 0) {
                term.forEach(m=>req.query.bool.filter.push({ "term": m }))
            }
            if (range) {
                req.query.bool.filter.push({ "range": range })
            }
        }
        reqwest({
            url: `/${es_index}/_search/`,
            method: 'post',
            data: JSON.stringify(req),
            type: 'json',
            contentType: 'application/json'
        }).then(data => {
            if (data.hits) {
                if (data.hits.hits && data.hits.hits.length > 0) {
                    const pager = { ...this.state.pagination };
                    pager.total = data.hits.total.value;
                    this.setState({
                        dataSource: data.hits.hits,
                        pagination: pager,
                        loading: false
                    })
                } else {
                    message.warning('查询不到数据');
                    this.setState({
                        loading: false
                    })
                }
            } else {
                message.warning('查询不到数据');
                this.setState({
                    loading: false
                })
            }
        }).catch(() => {
            message.error('接口跪了~~~~(>_<)~~~~');
            this.setState({
                loading: false
            })
        });
    };
    bookTitle() {
        return [
            {
                title: '项目标识',
                dataIndex: '_source.project',
                key: '_source.project',
                width: "8%",
                render: (text, record) => <Button type="link" onClick={() => this.openrDetail(record)}>{text}</Button>,
            },
            {
                title: '模块',
                dataIndex: '_source.module',
                key: '_source.module',
                width: "8%",
            },
            {
                title: '分类',
                dataIndex: '_source.category',
                key: '_source.category',
                width: "8%",
            },
            {
                title: '子分类',
                dataIndex: '_source.sub_category',
                key: '_source.sub_category',
                width: "8%",
            },
            {
                title: '日志内容',
                dataIndex: '_source.msg',
                key: '_source.msg',
                render: m => typeof m == 'string' ? m : JSON.stringify(m).slice(0, 60)
            },
            {
                title: '过滤',
                dataIndex: '_source.filter1',
                key: '_source.filter1',
                width: "10%",
                render: (filter1, record) =>
                    (<div>
                        <div>{filter1}</div>
                        <div>{record._source.filter2}</div>
                    </div>),
            },
            {
                title: '时间',
                dataIndex: '_source.addtime',
                key: '_source.addtime',
                width: "10%",
                render: (addtime, record) =>
                    (<div>{dateFormat("YYYY-mm-dd HH:MM:SS", new Date(addtime))}</div>),
            },
            {
                title: 'ip',
                dataIndex: '_source.ip',
                key: '_source.ip',
                width: "8%",
            },
            {
                title: '日志等级',
                dataIndex: '_source.logLevel',
                key: '_source.logLevel',
                width: "10%",
                render: (tag) => (
                    <span>
                        {(tag => {
                            let color = 'green';
                            switch (tag) {
                                case "INFO":
                                    color = 'blue'
                                    break;
                                case "WARNING":
                                    color = 'orange'
                                    break;
                                case "ERROR":
                                    color = 'red'
                                    break;
                                case "CRITICAL":
                                    color = 'purple'
                                    break;
                                case "DEBUG":
                                    color = 'gray'
                                    break;
                                default:
                                    break;
                            }
                            return (
                                <Tag color={color} key={tag}>
                                    {tag}
                                </Tag>
                            );
                        })(tag)}
                    </span>
                ),
            },
            {
                title: '操作',
                // key: 'logLevel',
                width: "10%",
                render: (text, record) => (
                    <span>
                        <Button type="link" onClick={() => this.openrDetail(record)}>查看详情</Button>
                    </span>
                ),
            },
        ];
    };
    openrDetail(detailInfo) {
        this.setState(
            {
                detailInfo: detailInfo,
                visible: true
            }
        )
    };
    handleCancel = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };
    handleTableChange = (pagination, filters, sorter) => {
        console.log(pagination)
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });
        this.getData(pager.current);
    };
    bindDetail(detailInfo) {
        if (!detailInfo || !detailInfo._source) {
            return null
        }
        return (
            <Descriptions title={null} bordered>
                <Descriptions.Item label="项目标识">{detailInfo._source.project}</Descriptions.Item>
                <Descriptions.Item label="环境">{detailInfo._source.env}</Descriptions.Item>
                <Descriptions.Item label="日志等级">{detailInfo._source.logLevel}</Descriptions.Item>
                <Descriptions.Item label="模块">{detailInfo._source.module}</Descriptions.Item>
                <Descriptions.Item label="分类">{detailInfo._source.category}</Descriptions.Item>
                <Descriptions.Item label="子分类">{detailInfo._source.sub_category}</Descriptions.Item>
                <Descriptions.Item label="ip地址">{detailInfo._source.ip}</Descriptions.Item>
                <Descriptions.Item label="记录时间" span={2}>{detailInfo._source.addtime}</Descriptions.Item>
                <Descriptions.Item label="过滤条件1">{detailInfo._source.filter1}</Descriptions.Item>
                <Descriptions.Item label="过滤条件2" span={2}>{detailInfo._source.filter2}</Descriptions.Item>
                <Descriptions.Item label="日志内容" span={3}>
                    {typeof detailInfo._source.msg == 'string' ? detailInfo._source.msg : JSON.stringify(detailInfo._source.msg, null, 4)}
                </Descriptions.Item>
                <Descriptions.Item label="扩展信息" span={3}>
                    {typeof detailInfo._source.msg == 'string' ? detailInfo._source.extra : JSON.stringify(detailInfo._source.extra, null, 4)}
                </Descriptions.Item>
            </Descriptions>
        )
    }
    componentDidMount() {
        this.getData();
    };
    render() {
        const dataSource = this.state.dataSource
        const columns = this.bookTitle()
        const bordered = true
        const detailInfo = this.state.detailInfo
        return (<div><Table columns={columns} dataSource={dataSource} bordered={bordered} rowKey={record => record._id}
            pagination={this.state.pagination}
            loading={this.state.loading}
            onChange={this.handleTableChange} />
            <Modal
                title="日志详情"
                visible={this.state.visible}
                onCancel={this.handleCancel}
                footer={null}
                width="60%"
            >
                {this.bindDetail(detailInfo)}
            </Modal></div>)
    };
}
export default LogsTable
