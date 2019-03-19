import * as React from 'react';
import Select from 'react-select';
import { Typography, TextField, Paper, MenuItem, FormControl, InputLabel, Tooltip  } from '@material-ui/core';

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      style={{
        padding: `8px 16px`,
      }}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          style: {
            display: 'flex',
            padding: 0,
          },
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <Tooltip title={props.data.description} placement="right">
      <MenuItem
        buttonRef={props.innerRef}
        selected={props.isFocused}
        style={{
          fontWeight: props.isSelected ? 500 : 400,
        }}
        {...props.innerProps}
      >
        {props.children}
      </MenuItem>
    </Tooltip>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      style={{
        position: 'absolute',
        left: 2,
        fontSize: 16,
      }}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography style={{
      fontSize: 16,
    }} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  }}>{props.children}</div>;
}


function Menu(props) {
  return (
    <Paper square style={{
      position: 'absolute',
      zIndex: 10,
      marginTop: 8,
      left: 0,
      right: 0,
    }} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};


interface IProps {
  suggestions: any,
  value: any,
  handleChange: any,
}

interface IState {
}


class IntegrationReactSelect extends React.Component<IProps, IState> {

  render() {
    const { suggestions, value, handleChange } = this.props;
    let currentValue = '';
    if (value) {
      // @ts-ignore
      currentValue = {
        label: value,
        value: value
      }
    }
    return (
      <FormControl className="jp-EodagWidget-field">
        <InputLabel
          style={{
            transform: 'translate(0, 1.5px) scale(0.75)',
            transformOrigin: 'top left'
          }}
        >
          Product type (*)
        </InputLabel>
        <div 
          style={{
            marginTop: 10
          }}
        >
          <Select
            options={suggestions}
            components={components}
            value={currentValue}
            onChange={handleChange}
            placeholder="S3_..."
            isClearable
          />
        </div>
      </FormControl>
    );
  }
}


export default IntegrationReactSelect;