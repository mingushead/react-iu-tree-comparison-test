// @flow
import React, { Component } from 'react';
import styles from './Home.css';

import cx from 'classnames';
import Tree from 'react-ui-tree';
import 'weaver-sdk';

type Props = {};
var model = {}

var tree = {
  get: function(prop) {
    return 'loading...';
  },
  id:'12345',
  children:[]
};

var weaver = new Weaver();
console.log(weaver.connect);
var getTreeData = function() {

  return weaver.connect('http://localhost:9487')
  .then(function() {
    console.log('yo');
    return weaver.signInWithUsername('admin','admin')
  }).then(function(res) {
    console.log('yo1');
    return weaver.Project.list()
  }).then(function(res) {
    return weaver.useProject(res[1])
  }).then(function() {
    console.log('yo2');
    return Weaver.Model.load('cmdb','1.1.9')
  }).then(function(model) {
    console.log('yo3');
    return new Weaver.ModelQuery(model)
    .class(model.PhysicalObject)
    .hasNoRelationIn('PhysicalObject.consistsOf')
    .selectOut('PhysicalObject.consistsOf', 'PhysicalObject.consistsOf', 'PhysicalObject.consistsOf')
    .order(['NamedObject.name'])
    .find()
  }).then(function(nodes) {
    console.log(nodes)
    return tree = {
      get: function() {
        return 'root';
      },
      id: 'null',
      children: nodes.map(function(node) {
        return {
          get: function() {
            return node.get('name');
          },
          name: node.get('name'),
          id: node.id(),
          children: node.relation('consistsOf').nodes.map(function(child) {
            return {
              get: function() {
                return child.get('name');
              },
              name: child.get('name'),
              id: child.id(),
              children: child.relation('consistsOf').nodes.map(function(gChild) {
                return {
                  get: function() {
                    return gChild.get('name');
                  },
                  name: gChild.get('name'),
                  id: gChild.id(),
                  children: gChild.relation('consistsOf').nodes.map(function(gG_Child) {
                    return {
                      get: function() {
                        return gG_Child.get('name');
                      },
                      name: gG_Child.get('name'),
                      id: gG_Child.id()
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }).catch(function(err){
    console.log(err);
  })
}

export default class HomePage extends Component<Props> {

  state = {
    active: {
      get: function() {
        return 'choose a node';
      },
      id: ''
    },
    tree: tree
  };

  renderNode = node => {
    return (
      <span
        className={cx('node', {
          'is-active': node === this.state.active,
          'green': node.id[16] < node.id[17],
          'red': node.id[14] < node.id[15],
          'bold': node.id[13] < node.id[12],
          'blue': node.id[11] < node.id[12]
        })}
        onClick={this.onClickNode.bind(null, node)}
      >
        {node.get('name').substr(0,25)}
      </span>
    );
  };

  componentDidMount() {
    console.log('hi');
    getTreeData().then((function(_this) {
      return function(res) {
        console.log(res);
        return _this.setState({
          tree: res
        })
      };
    })(this));
  }

  onClickNode = node => {
    this.setState({
      active: node
    });
  };

  render() {
    return (
      <div className="app">
        <div className="tree">
          <Tree
            paddingLeft={20}
            tree={this.state.tree}
            onChange={this.handleChange}
            isNodeCollapsed={this.isNodeCollapsed}
            renderNode={this.renderNode}
          />
        </div>
        <div className="inspector">
          <h1>
          </h1>
          <button onClick={this.updateTree}>update tree</button>

          <h1>{this.state.active.get('name')}</h1>
          <h3>{this.state.active.id}</h3>

          <pre>{JSON.stringify(this.state.active, null, '  ')}</pre>
        </div>
      </div>
    );
  }

  handleChange = tree => {
    this.setState({
      tree: tree
    });
  };

  updateTree = () => {
    const { tree } = this.state;
    tree.children.push({ module: 'test' });
    this.setState({
      tree: tree
    });
  };

};
