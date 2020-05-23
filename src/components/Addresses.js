import React, { Component } from 'react';
import {
  Button,
  Container,
  Header,
  Segment,
  Table,
} from 'semantic-ui-react';

import { partition } from 'lodash';

import NewAddress from './Modals/NewAddress';
import NewAssociation from './Modals/NewAssociation';
import RenewAddress from './Modals/RenewAddress';

export default class Addresses extends Component {
  state = {
    addresses: [],
  }
  componentDidMount() {
    const { ual: { activeUser } } = this.props;
    if (activeUser) {
      this.sync()
    }
  }
  sync = () => {
    const { ual: { activeUser } } = this.props;
    this.getAddresses(activeUser.accountName);
  }
  onSuccess = () => {
    this.sync();
  }
  getAddresses = (accountName) => {
    const { ual: { activeUser: { rpc } } } = this.props;
    rpc.get_table_rows({
      code: 'fio.address',
      table: 'fionames',
      scope: 'fio.address',
      key_type: 'name',
      index_position: 4,
      lower_bound: accountName,
      upper_bound: accountName,
      limit: 10,
    }).then((results) => {
      const partitionQuery = {
        owner_account: accountName
      };
      const [, others] = partition(this.state.addresses, partitionQuery);
      this.setState({
        addresses: [
          ...others,
          ...results.rows
        ]
      })
    })
  }
  render() {
    const {
      addresses,
    } = this.state;
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
            FIO Addresses
            <Header.Subheader>
              Manage the addresses you control and their associated keys.
            </Header.Subheader>
          </Header>
          <Button
            content="Refresh Data"
            floated="right"
            icon="refresh"
            onClick={this.sync}
          />
          <NewAddress
            basic={false}
            color="blue"
            floated="right"
            onSuccess={this.onSuccess}
            ual={this.props.ual}
          />
        </Segment>
        {(!addresses.length)
          ? (
            <Segment
              attached="bottom"
              size="large"
              textAlign="center"
            >
              <Header>
                No addresses associated to this account. Register one to get started.
              </Header>
            </Segment>
          )
          : false
        }
        {(addresses.length)
          ? (
            <Table
              attached="bottom"
              padded
              striped
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    Domain Name
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    Addresses
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {addresses.map((address) => {
                  return (
                    <Table.Row>
                      <Table.Cell collapsing verticalAlign="top">
                        <Header>
                          {address.name}
                        </Header>
                        <Table definition>
                          <Table.Body>
                            <Table.Row>
                              <Table.Cell>Bundled Txs</Table.Cell>
                              <Table.Cell>{address.bundleeligiblecountdown}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Expires</Table.Cell>
                              <Table.Cell>{(new Date(address.expiration * 1000)).toUTCString()}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Renew</Table.Cell>
                              <Table.Cell>
                                <RenewAddress
                                  address={address}
                                  onSuccess={this.onSuccess}
                                  ual={this.props.ual}
                                />
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        {(address.addresses.length)
                          ? (
                            <Table definition>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Chain</Table.HeaderCell>
                                  <Table.HeaderCell>Token</Table.HeaderCell>
                                  <Table.HeaderCell>Address</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {address.addresses.map((a) => (
                                  <Table.Row>
                                    <Table.Cell>{a.chain_code}</Table.Cell>
                                    <Table.Cell>{a.token_code}</Table.Cell>
                                    <Table.Cell>
                                      {a.public_address}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                          )
                          : (
                            <Segment textAlign="left">
                              <Header size="small">
                                No associated addresses
                                <Header.Subheader>
                                  Create a new FIO address for this domain using the button below.
                                </Header.Subheader>
                              </Header>
                            </Segment>
                          )
                        }
                        <NewAssociation
                          address={address}
                          onSuccess={this.onSuccess}
                          ual={this.props.ual}
                        />
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          )
          : false
        }
      </Container>

    )
  }
}
