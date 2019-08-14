import React, { Component } from 'react'
import { Form, Input, Dropdown } from 'semantic-ui-react'

export default class ItemFormGroup extends Component {

  render() {
    const { partNumber, index, onChange, qty, cost, unit, isMultLocations, groupname } = this.props

    return (
      <div style={{marginTop: "15px", marginBottom: "5px"}}>
        <Form.Group>
          <Form.Field width={5}>
            <Form.Input
              name="partNumber"
              value={partNumber}
              mykey = {index}
              index={index}
              label={(isMultLocations) ? `Part Number #${(index + 1)}` : "Part Number"}
              fluid
              placeholder="A-1234-56H"
              onChange={onChange}
              groupname={groupname}
            />
          </Form.Field>

          <Form.Field width={2}>
            <Form.Input
              name="qty"
              value={qty}
              onChange={onChange}
              mykey={index}
              index={index}
              fluid label="Quantity"
              type="text"
              groupname={groupname}
            />
          </Form.Field>

          <Form.Field width={5}>
            <label>Cost($)</label>
            <Input
              name="cost"
              value={cost}
              onChange={onChange}
              mykey={index}
              index={index}
              type="number"
              min="0"
              step={0.001}
              groupname={groupname}
              label={<Dropdown
                name="unit"
                mykey={index}
                index={index}
                groupname={groupname}
                value={unit}
                onChange={onChange}
                options={[
                  { key: '/ ea', text: 'per piece', value: '/ea' },
                  { key: '/ lb', text: 'per lb', value: '/lb' },
                  { key: '/ lot', text: 'per lot', value: '/lot' },
                  { key: '/ lineal inch', text: 'per lineal inch', value: '/lineal inch' }
                ]} />}
              labelPosition='right'
            />
          </Form.Field>

        </Form.Group>
      </div>










    )
  }
}
