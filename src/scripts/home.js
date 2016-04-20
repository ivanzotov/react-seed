import React from 'react';
import { Link } from 'react-router';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  togglePopup(event) {
    this.setState({open: !this.state.open});
  }

  render() {
    return (
      <div>
        <span onClick={this.togglePopup.bind(this)}>Open</span>
        {this.state.open && <div className='popup'></div>}
        <img src='/images/react.svg' alt='React' />
        <Link to='/items'>Items</Link>
      </div>
    )
  }
}
