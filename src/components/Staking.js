import React, { Component } from 'react';
import {
  Button,
  Container,
  Icon,
  Header,
  Segment,
  Table,
} from 'semantic-ui-react';

import { uniqBy } from 'lodash';

import Stake from './Modals/Stake';
import Unstake from './Modals/Unstake';

export default class Staking extends Component {
  state = {
    balance: undefined,
  }
  componentDidMount() {
    const { ual: { activeUser } } = this.props;
    if (activeUser) {
      this.sync()
    }
  }
  sync = () => {
    const { ual: { activeUser } } = this.props;
    this.getFIOBalance();
  }
  onSuccess = () => {
    this.sync();
  }
  getFIOBalance = () => {
    const { ual: { activeUser } } = this.props;
    activeUser.rpc.get_account(activeUser.accountName).then((account) => {
        activeUser.rpc.fetch(
            "/v1/chain/get_fio_balance",
            {
                fio_public_key: account.permissions.filter((p) => p.perm_name === 'owner')[0].required_auth.keys[0].key
            }
        ).then((balance) => this.setState({ balance }));
    });
  }
  render() {
    const {
      balance,
    } = this.state;
    let refunding = undefined;
    return (
      <Container fluid>
        <Segment
          attached="top"
          clearing
          secondary
        >
          <Header
            floated="left"
            size="large"
          >
            FIO Token Staking
            <Header.Subheader>
              If you have voted or set a proxy, your FIO tokens can be staked.
            </Header.Subheader>
          </Header>
          <Button
            content="Refresh Data"
            floated="right"
            icon="refresh"
            onClick={this.sync}
          />
        </Segment>
        <Segment color="blue" secondary>
          <Table size="large">
            <Table.Row>
              <Table.Cell>
                FIO Staked
              </Table.Cell>
              <Table.Cell textAlign="right">
                {(balance)
                  ? (
                    <strong>{(balance.staked / 1000000000).toFixed(9)} FIO</strong>
                  )
                  : (
                    <Icon name="spinner" loading />
                  )
                }
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Unstake
                  onSuccess={this.onSuccess}
                  ual={this.props.ual}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                FIO Being Refunded
              </Table.Cell>
              <Table.Cell textAlign="right">
                {(balance)
                  ? (
                    <strong>{((balance.balance - balance.available - balance.staked) / 1000000000).toFixed(9)} FIO</strong>
                  )
                  : (
                    <Icon name="spinner" loading />
                  )
                }
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                FIO Available
              </Table.Cell>
              <Table.Cell textAlign="right">
                {(balance)
                  ? (
                    <strong>{(balance.available / 1000000000).toFixed(9)} FIO</strong>
                  )
                  : (
                    <Icon name="spinner" loading />
                  )
                }
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Stake
                  onSuccess={this.onSuccess}
                  ual={this.props.ual}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                Current FIO Balance
              </Table.Cell>
              <Table.Cell textAlign="right">
                {(balance)
                  ? (
                    <strong>{(balance.balance / 1000000000).toFixed(9)} FIO</strong>
                  )
                  : (
                    <Icon name="spinner" loading />
                  )
                }
              </Table.Cell>
            </Table.Row>
          </Table>
      </Segment>
      </Container>

    )
  }
}
