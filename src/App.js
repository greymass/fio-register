import React, { Component } from 'react';

import { Anchor } from 'ual-anchor'
import { Scatter } from 'ual-scatter'
import { UALProvider, withUAL } from 'ual-reactjs-renderer'

import { Segment } from 'semantic-ui-react'

import Home from './Home';

const mainnet = {
  chainId: '21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c',
  name: 'FIO',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'fio.greymass.com',
    port: 443,
  }]
}

const testnet = {
  chainId: 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e',
  name: 'FIO Testnet',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'fiotestnet.blockpane.com',
    port: 443,
  }]
}

class UALWrapper extends Component {
  render () {
    let chain = mainnet;
    if (window.location.search === '?testnet') {
      chain = testnet;
    }
    const anchor = new Anchor([chain], { appName: 'fio-register' })
    const scatter = new Scatter([chain], { appName: 'fio-register' })
    return (
      <UALProvider
        appName='FIO Registration'
        authenticators={[anchor, scatter]}
        chains={[chain]}
      >
        <TestAppConsumer />
        <Segment basic textAlign="center">
          {(chain.chainId === 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e')
            ? (
              <a href="/fio-register">Switch to use FIO Mainnet</a>
            )
            : (
              <a href="/fio-register?testnet">Switch to use FIO Testnet</a>
            )
          }
        </Segment>
      </UALProvider>
    )
  }
}

const TestAppConsumer = withUAL(Home)

const App = () => (
  <UALWrapper />
);

export default App;
