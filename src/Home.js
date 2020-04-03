import React, { Component } from 'react';
import {
  Button,
  Container,
  Grid,
  Header,
  Segment,
} from 'semantic-ui-react';

import Account from './components/Account';
import Domains from './components/Domains';

export default class Home extends Component {
  render() {
    const { ual } = this.props;
    return (
      <Container style={{
        margin: '3em 0',
      }}>
        <Grid relaxed>
          <Grid.Row>
            <Grid.Column width={10}>
              <Header size="large">
                FIO Registration Helper
                <Header.Subheader>
                  A tool to assist with domain and address registration.
                </Header.Subheader>
              </Header>
            </Grid.Column>
            <Grid.Column width={6} textAlign="right">
              <Account ual={ual} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {(ual.activeUser)
                ? (
                  <Domains ual={ual} />
                )
                : (
                  <Segment size="large" stacked textAlign="center">
                    <p>Login to manage domains and addresses for the FIO blockchain.</p>
                    <Account ual={ual} />
                  </Segment>
                )
              }
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}
