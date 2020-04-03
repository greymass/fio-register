import React, { Component } from 'react';
import {
  Button,
  Container,
  Form,
  Grid,
  Header,
  Icon,
  Message,
  Modal,
  Segment,
  Table,
} from 'semantic-ui-react';

const defaultFields = {
  fio_domain: '',
  owner_fio_public_key: '',
  max_fee: '',
  actor: '',
  tpid: '',
}

export default class NewDomain extends Component {
  state = {
    account: undefined,
    balance: undefined,
    errors: [],
    fee: undefined,
    fields: defaultFields,
    show: false,
  }
  onOpen = (e, data) => {
    const { ual: { activeUser } } = this.props;
    this.resetData();
    this.getAccount();
    this.getBalance();
    this.getFee();
  }
  resetData = () => this.setState({
    account: undefined,
    balance: undefined,
    errors: [],
    fee: undefined,
    fields: defaultFields,
  })
  getAccount = () => {
    const { ual: { activeUser } } = this.props;
    activeUser.rpc.get_account(activeUser.accountName).then((account) => {
      this.setState({
        account,
        fields: Object.assign({}, this.state.fields, {
          actor: activeUser.accountName,
          owner_fio_public_key: account.permissions.filter((p) => p.perm_name === 'owner')[0].required_auth.keys[0].key
        })
      })
    });
  }
  getBalance = () => {
    const { ual: { activeUser } } = this.props;
    activeUser.rpc.get_currency_balance('fio.token', activeUser.accountName, 'fio').then((balance) => this.setState({ balance }));
  }
  getFee = () => {
    const { ual: { activeUser: { rpc } } } = this.props;
    rpc.get_table_rows({
      code: 'fio.fee',
      table: 'fiofees',
      scope: 'fio.fee',
      key_type: 'i128',
      index_position: 2,
      lower_bound: '0x1a5f09714542254caaab363d520adfbd',
      upper_bound: '0x1a5f09714542254caaab363d520adfbd',
      limit: 1,
    }).then((results) => {
      this.setState({
        fee: results.rows[0],
        fields: Object.assign({}, this.state.fields, {
          max_fee: results.rows[0].suf_amount
        })
      });
      // if (results.rows.length) {
      //   results.rows.map(this.getAddresses);
      // }
    })
  }
  hide = () => this.setState({ show: false })
  show = () => this.setState({ show: true })
  onChange = (e, { name, value }) => this.setState({
    fields: Object.assign({}, this.state.fields, {
      [name]: value
    })
  })
  transact = async () => {
    const { fields } = this.state;
    const { ual: { activeUser } } = this.props
    try {
      const { accountName, requestPermission } = activeUser
      const tx = {
        actions: [{
          account: 'fio.address',
          name: 'regdomain',
          authorization: [{ actor: accountName, permission: requestPermission }],
          data: fields,
        }],
      }
      await activeUser.signTransaction(tx, { expireSeconds: 120, blocksBehind: 3 })
      this.props.onSuccess();
      this.hide();
    } catch (e) {
      this.setState({
        errors: e.cause.json.fields
      })
    }
  }
  render() {
    const { ual: { activeUser } } = this.props;
    const {
      account,
      balance,
      errors,
      fee,
      fields,
      show,
    } = this.state;
    return (
      <Modal
        closeIcon
        content={(
          <Segment
            padded
            size="large"
            style={{ marginTop: 0 }}
          >
            <Segment color="blue" secondary>
              <Table size="large">
                <Table.Row>
                  <Table.Cell>
                    Current FIO Balance
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    {(balance)
                      ? (
                        <strong>{balance[0]}</strong>
                      )
                      : (
                        <Icon name="spinner" loading />
                      )
                    }
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    Domain Registration Fee
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    {(fee)
                      ? (
                        <strong>{(fee.suf_amount / 1000000000).toFixed(9)} FIO</strong>
                      )
                      : (
                        <Icon name="spinner" loading />
                      )
                    }
                  </Table.Cell>
                </Table.Row>
              </Table>
            </Segment>
            <Form
              error={errors.length}
              onSubmit={this.transact}
            >
              {Object.keys(fields).map((field) => {
                const [error] = errors.filter((e) => e.name === field)
                return (
                  <Form.Field>
                    <label>{field}</label>
                    <Form.Input
                      error={(error)
                        ? {
                          content: error.error,
                          pointing: 'above',
                        }
                        : false
                      }
                      name={field}
                      onChange={this.onChange}
                      value={fields[field]}
                    />
                  </Form.Field>
                );
              })}
              <Message
                error
                header='An error occurred while submitting the transaction'
                content='Check the red fields above to correct the problems and try again.'
              />
              <Segment basic clearing>
                <Button
                  content="Register"
                  floated="right"
                  primary
                />
              </Segment>
            </Form>
          </Segment>
        )}
        header="Register a FIO Domain"
        open={show}
        onClose={this.hide}
        onOpen={this.onOpen}
        trigger={(
          <Button
            content="Register Domain"
            floated="right"
            icon="plus"
            onClick={this.show}
            primary
          />
        )}
      />
    )
  }
}
