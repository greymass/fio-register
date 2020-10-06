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
  fio_domain: '',
  new_owner_fio_public_key: '',
  max_fee: '',
  actor: '',
  tpid: 'tpid@greymass',
}

export default class MyTest extends Component {
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
    this.getAccount();
    this.getBalance();
    this.getFee();
  }
  resetData = () => this.setState({
    account: undefined,
    balance: undefined,
    errors: [],
    fee: undefined,
    fields: Object.assign({}, defaultFields, {
      fio_domain: this.props.domain.name,
    }),
  })
  getAccount = () => {
    const { ual: { activeUser } } = this.props;
    activeUser.rpc.get_account(activeUser.accountName).then((account) => {
      this.setState({
        account,
        fields: Object.assign({}, this.state.fields, {
          actor: activeUser.accountName
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
      lower_bound: '0x980f6aa5310bb851dc96f6a2d4521891',
      upper_bound: '0x980f6aa5310bb851dc96f6a2d4521891',
      limit: 1,
    }).then((results) => {
      this.setState({
        fee: results.rows[0],
        fields: Object.assign({}, this.state.fields, {
          max_fee: results.rows[0].suf_amount
        })
      });
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
          name: 'xferdomain',
          authorization: [{ actor: accountName, permission: requestPermission }],
          data: fields,
        }],
      }
      await activeUser.signTransaction(tx, { expireSeconds: 120, blocksBehind: 3 })
      this.props.onSuccess();
      this.hide();
    } catch (e) {
      console.log(e);

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
                    Domain Transfer Fee
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
                if (field === 'tpid') return false
                return (
                  <Form.Field>
                    <label style={{
                      textTransform: 'capitalize',
                    }}>
                      {field.replace(/_/g, ' ')}
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
                  content="Transfer Domain"
                  floated="right"
                  primary
                />
              </Segment>
            </Form>
          </Segment>
        )}
        header="Transfer a FIO Domain"
        open={show}
        onClose={this.hide}
        onOpen={this.onOpen}
        trigger={(
          <Button
            basic
            content={`Transfer Domain`}
            onClick={this.show}
            primary
            size="small"
          />
        )}
      />
    )
  }
}
