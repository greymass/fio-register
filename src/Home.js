import React, { Component } from 'react';
import {
  Container,
  Grid,
  Header,
  Message,
  Segment,
  Tab,
} from 'semantic-ui-react';

import Account from './components/Account';
import Addresses from './components/Addresses';
import Domains from './components/Domains';

export default class Home extends Component {
  render() {
    const { ual } = this.props;
    const { chains } = ual;
    const panes = [
      { menuItem: 'Address Management', render: () => <Tab.Pane><Addresses ual={ual} /></Tab.Pane> },
      { menuItem: 'Domain Management', render: () => <Tab.Pane><Domains ual={ual} /></Tab.Pane> },
    ]

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
          {(chains[0].chainId === 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e')
            ? (
              <Grid.Row columns={1}>
                <Grid.Column>
                  <Message
                    content={`This app is in developer mode and uses the FIO Testnet (${chains[0].chainId}).`}
                    header="TESTNET Mode"
                    icon="warning sign"
                    size="large"
                    warning
                  />
                </Grid.Column>
              </Grid.Row>
            )
            : (
              <Grid.Row columns={1}>
                <Grid.Column>
                  <Message
                    content={`This app is in a BETA product and is connected to the FIO Mainnet (${chains[0].chainId}).`}
                    header="FIO Mainnet"
                    icon="info circle"
                    info
                    size="large"
                  />
                </Grid.Column>
              </Grid.Row>
            )
          }
          <Grid.Row columns={1}>
            <Grid.Column>
              {(ual.activeUser)
                ? (
                  <Tab
                    menu={{
                      attached: 'top',
                      icon: 'home',
                      size: 'huge',
                      tabular: true,
                    }}
                    panes={panes}
                  />
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
