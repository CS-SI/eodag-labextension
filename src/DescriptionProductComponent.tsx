import * as React from 'react';
import { Table, TableBody, TableCell, TableRow, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons'

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
      <div>
        <ExpansionPanel defaultExpanded square elevation={0}>
          <ExpansionPanelSummary expandIcon={< ExpandMore />}>
            <Typography variant="h5">
            Quicklook
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="jp-EodagWidget-quicklook-wrapper">
            <img
              src={feature.properties.quicklook}
              alt="Quicklook not available"
              className={smallQuicklook ? "jp-EodagWidget-small-quicklook" : ""}
              onClick={this.toggleQuicklookSize}
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>


        <ExpansionPanel defaultExpanded square elevation={0}>
          <ExpansionPanelSummary expandIcon={< ExpandMore />}>
            <Typography variant="h5">
              Metadata
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Table padding="dense">
              <TableBody>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell>{feature.properties.platformSerialIdentifier}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Instrument</TableCell>
                  <TableCell>{feature.properties.instrument}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Product type</TableCell>
                  <TableCell>{feature.properties.productType}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Processing level</TableCell>
                  <TableCell>{feature.properties.processingLevel}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sensor mode</TableCell>
                  <TableCell>{feature.properties.sensorMode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Start time from ascending node</TableCell>
                  <TableCell>{feature.properties.startTimeFromAscendingNode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>End time from ascending node</TableCell>
                  <TableCell>{feature.properties.completionTimeFromAscendingNode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Orbit direction</TableCell>
                  <TableCell>{feature.properties.orbitDirection}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Orbit number</TableCell>
                  <TableCell>{feature.properties.orbitNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cloud cover</TableCell>
                  <TableCell>{feature.properties.cloudCover} %</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}
