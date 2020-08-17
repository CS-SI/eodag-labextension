/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
*/

import * as React from 'react';

export interface IProps {
  feature: any;
}

export interface IState {
  smallQuicklook: any;
}

export default class DescriptionProductComponent extends React.Component<IProps, IState> {
  state = {
    smallQuicklook: true
  }
  toggleQuicklookSize = () => {
    const { smallQuicklook } = this.state
    this.setState({
       smallQuicklook: !smallQuicklook,
    })
  }
  render() {
    const { feature } = this.props
    const { smallQuicklook } = this.state
    if (!feature) {
      return null;
    }
    return (
      <div className="jp-EodagWidget-product">
        <h4>Quicklook</h4>
        <div className="jp-EodagWidget-quicklook-wrapper">
          <img
            src={feature.properties.quicklook}
            alt="Quicklook not available"
            className={smallQuicklook ? "jp-EodagWidget-small-quicklook" : ""}
            onClick={this.toggleQuicklookSize}
          />
        </div>
        <h4>Metadata</h4>
        <table className="result-table">
          <tr>
            <td>Platform</td>
            <td>{feature.properties.platformSerialIdentifier}</td>
          </tr>
          <tr>
            <td>Instrument</td>
            <td>{feature.properties.instrument}</td>
          </tr>
          <tr>
            <td>Product type</td>
            <td>{feature.properties.productType}</td>
          </tr>
          <tr>
            <td>Processing level</td>
            <td>{feature.properties.processingLevel}</td>
          </tr>
          <tr>
            <td>Sensor mode</td>
            <td>{feature.properties.sensorMode}</td>
          </tr>
          <tr>
            <td>Start time from ascending node</td>
            <td>{feature.properties.startTimeFromAscendingNode}</td>
          </tr>
          <tr>
            <td>End time from ascending node</td>
            <td>{feature.properties.completionTimeFromAscendingNode}</td>
          </tr>
          <tr>
            <td>Orbit direction</td>
            <td>{feature.properties.orbitDirection}</td>
          </tr>
          <tr>
            <td>Orbit number</td>
            <td>{feature.properties.orbitNumber}</td>
          </tr>
          <tr>
            <td>Cloud cover</td>
            <td>{feature.properties.cloudCover} %</td>
          </tr>
        </table>
      </div>
    );
  }
}
