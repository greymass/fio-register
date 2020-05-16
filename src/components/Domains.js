import React, { Component } from 'react';
import {
  Button,
  Container,
  Header,
  Segment,
  Table,
} from 'semantic-ui-react';

import { uniqBy } from 'lodash';

import NewAddress from './Modals/NewAddress';
import NewDomain from './Modals/NewDomain';
import RenewDomain from './Modals/RenewDomain';

export default class Domains extends Component {
  state = {
    addresses: [],
    domains: [],
  }
  componentDidMount() {
    const { ual: { activeUser } } = this.props;
    if (activeUser) {
      this.sync()
    }
  }
  sync = () => {
    const { ual: { activeUser } } = this.props;
    this.getDomains(activeUser.accountName);
  }
  onSuccess = () => {
    this.sync();
  }
  getDomains = (accountName) => {
    const { ual: { activeUser: { rpc } } } = this.props;
    rpc.get_table_rows({
      code: 'fio.address',
      table: 'domains',
      scope: 'fio.address',
      key_type: 'name',
      index_position: 2,
      lower_bound: accountName,
      upper_bound: accountName,
      limit: 10,
    }).then((results) => {
      this.setState({
        domains: results.rows
      });
      if (results.rows.length) {
        results.rows.map(this.getAddresses);
      }
    })
  }
  getAddresses = (domain) => {
    const { ual: { activeUser: { rpc } } } = this.props;
    rpc.get_table_rows({
      code: 'fio.address',
      table: 'fionames',
      scope: 'fio.address',
      key_type: 'i128',
      index_position: 2,
      lower_bound: domain.domainhash,
      upper_bound: domain.domainhash,
      limit: 10,
    }).then((results) => {
      this.setState({
        addresses: uniqBy([...this.state.addresses, ...results.rows], 'id')
      })
    })
  }
  render() {
    const {
      addresses,
      domains,
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
            FIO Domains
            <Header.Subheader>
              Manage the domains you control and address associations.
            </Header.Subheader>
          </Header>
          <Button
            content="Refresh Data"
            floated="right"
            icon="refresh"
            onClick={this.sync}
          />
          <NewDomain
            onSuccess={this.onSuccess}
            ual={this.props.ual}
          />
        </Segment>
        {(!domains.length)
          ? (
            <Segment
              attached="bottom"
              size="large"
              textAlign="center"
            >
              <Header>
                No domains associated to this account. Register one to get started.
              </Header>
            </Segment>
          )
          : false
        }
        {(domains.length)
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
                {domains.map((domain) => {
                  const matching = addresses.filter((a) => a.domain === domain.name)
                  return (
                    <Table.Row>
                      <Table.Cell collapsing verticalAlign="top">
                        <Header>
                          @{domain.name}
                        </Header>
                        <Table definition>
                          <Table.Body>
                            <Table.Row>
                              <Table.Cell>Public</Table.Cell>
                              <Table.Cell>{(domain.is_public) ? 'True' : 'False'}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Expires</Table.Cell>
                              <Table.Cell>{(new Date(domain.expiration * 1000)).toUTCString()}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Renew</Table.Cell>
                              <Table.Cell>
                                <RenewDomain
                                  domain={domain}
                                  onSuccess={this.onSuccess}
                                  ual={this.props.ual}
                                />
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        {(matching.length)
                          ? (
                            <Table definition>
                              <Table.Body>
                                {matching.map((address) => (
                                  <Table.Row>
                                    <Table.Cell>{address.name}</Table.Cell>
                                    <Table.Cell>
                                      {address.addresses[0].public_address}
                                      <br />
                                      Expires: {(new Date(address.expiration * 1000)).toLocaleDateString()}
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
                        <NewAddress
                          domain={domain}
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
