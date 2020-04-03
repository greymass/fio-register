import React, { Component } from 'react';
import {
  Button,
  Container,
  Grid,
  Header,
  Segment,
} from 'semantic-ui-react';

export default class Account extends Component {
  render() {
    const { ual: { activeUser } } = this.props;
    if (activeUser) {
      return (
        <Segment secondary>
          <Header>
            <span>{activeUser.accountName}@{activeUser.requestPermission}</span>
            <Header.Subheader>
              <a href="" onClick={this.props.ual.logout}>Sign out</a>
            </Header.Subheader>
          </Header>
        </Segment>
      )
    }
    return (
      <Button
        content="Sign in"
        onClick={this.props.ual.showModal}
        size="large"
        primary
      />
    )
  }
}
