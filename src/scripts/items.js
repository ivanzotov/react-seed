import React from 'react';
import Firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import reactMixin from 'react-mixin';
import { Link } from 'react-router';

class Items extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.refItems = new Firebase('https://react-seed.firebaseio.com/items/');
    this.state = {
      items: []
    };
  }

  componentWillMount() {
    this.bindAsArray(this.refItems, 'items');
  }

  addItem() {
    this.firebaseRefs['items'].push('Hello world');
  }

  removeItem(key) {
    refItems.child(key).remove();
  }

  render() {
    return (
      <div>
        <button onClick={this.addItem.bind(this)}>Add item</button>
        {this.state.items.length}
        {this.state.items.map((item, index) =>
          <div className='item' key={index}>
            {item['.value']}
            <a href='#' onClick={this.removeItem.bind(this, item['.key'])}>remove</a>
          </div>
        )}
      </div>
    )
  }
}

reactMixin(Items.prototype, ReactFireMixin);

export default Items
