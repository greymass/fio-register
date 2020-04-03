import React, { Component } from 'react';
import {
  Button,
  Header,
  Segment,
} from 'semantic-ui-react';

export default class Account extends Component {
  render() {
    const { ual: { activeUser } } = this.props;
    if (activeUser) {
      return (
        <Segment secondary stacked>
          <Header>
            <Header.Content>
              <Header.Subheader>
                Current Account
              </Header.Subheader>
              <span>{activeUser.accountName}@{activeUser.requestPermission}</span>
            </Header.Content>
            <Button
              basic
              onClick={this.props.ual.logout}
              style={{ marginLeft: '1em' }}
            >
              Sign out
            </Button>
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
