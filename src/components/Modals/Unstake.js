import React, { Component } from 'react';
import {
  Button,
  Form,
  Icon,
  Message,
  Modal,
  Segment,
  Table,
} from 'semantic-ui-react';

const defaultFields = {
  fio_address: '',
  amount: '',
  max_fee: '',
  actor: '',
  tpid: '',
}

export default class Unstake extends Component {
  state = {
    account: undefined,
    balance: undefined,
    errors: [],
    fee: undefined,
    fields: defaultFields,
    show: false,
  }
  onOpen = (e, data) => {
    this.resetData();
    this.getFIOBalanceAndAccount();
    this.getFee();
  }
  resetData = () => this.setState({
    account: undefined,
    balance: undefined,
    errors: [],
    fee: undefined,
    fields: defaultFields,
  })
  getFIOBalanceAndAccount = () => {
    const { ual: { activeUser } } = this.props;
    let owner_fio_public_key = undefined;
    activeUser.rpc.get_account(activeUser.accountName).then((account) => {
        owner_fio_public_key = account.permissions.filter((p) => p.perm_name === 'owner')[0].required_auth.keys[0].key
        this.setState({
          account,
          fields: Object.assign({}, this.state.fields, {
            actor: activeUser.accountName,
            owner_fio_public_key: owner_fio_public_key
          })
        })
        activeUser.rpc.fetch(
            "/v1/chain/get_fio_balance",
            {
                fio_public_key: owner_fio_public_key
            }
        ).then((balance) => this.setState({ balance }));
    });
  }
  getFee = () => {
    const { ual: { activeUser: { rpc } } } = this.props;
    rpc.get_table_rows({
      code: 'fio.fee',
      table: 'fiofees',
      scope: 'fio.fee',
      key_type: 'i128',
      index_position: 2,
      lower_bound: '0x85248efc2886d68989b010f21cb2f480',
      upper_bound: '0x85248efc2886d68989b010f21cb2f480',
      limit: 1,
    }).then((results) => {
      this.setState({
        fee: results.rows[0],
        fields: Object.assign({}, this.state.fields, {
          max_fee: (results.rows[0].suf_amount + 100000000) // add a little extra in case something just changed.
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
          account: 'fio.staking',
          name: 'unstakefio',
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
    const {
      balance,
      errors,
      fee,
      fields,
      show,
    } = this.state;
    let refunding = undefined;
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
                <Table.Row>
                  <Table.Cell>
                    Staking Fee
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
            <Segment>
              <text>
                <p>
                  <strong>Note:</strong> Amount and Max Fee are denominated in in SUFs or Smallest Units of FIO. To denominate in FIO, add nine zeros.<br />
                  For example, 100 FIO is 100000000000 SUF. Add nine zeros to the number of FIO you want to stake or unstake.<br />
                  If you're looking for a valid proxy to use in the Tpid field:<br />
                  Testnet: proxy@fiotestnet<br />
                  Mainnet: proxy@greymass<br />
                </p>
              </text>
            </Segment>
            <Form
              error={errors.length}
              onSubmit={this.transact}
            >
              {Object.keys(fields).map((field) => {
                const [error] = errors.filter((e) => e.name === field)
                return (
                  <Form.Field>
                    <label style={{
                      textTransform: 'capitalize',
                    }}>
                      {field.replace('fio_address', 'crypto_handle').replace(/_/g, ' ')}
                    </label>
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
                  content="Unstake FIO Tokens"
                  floated="right"
                  primary
                />
              </Segment>
            </Form>
          </Segment>
        )}
        header="Unstake FIO Tokens"
        open={show}
        onClose={this.hide}
        onOpen={this.onOpen}
        trigger={(
          <Button
            content="Unstake FIO"
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
