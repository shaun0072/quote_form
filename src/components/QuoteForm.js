import React, { Component } from 'react'
import { Form, Segment, Search, Grid } from 'semantic-ui-react'
import axios from 'axios'
import _ from 'lodash'
import update from 'immutability-helper'
import axios from 'axios'

var source = "";

export default class QuoteForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      company_name: "",
    }
  }

  componentWillMount() {
    this.resetComponent()
  }

  componentDidMount() {
    axios.get("http://localhost:8080/quote_form/src/server/php/get_customers.php")
      .then(res => {
        this.setState({
          source : res.data
        });
        console.log(res.data)
      })
  }

  handleResultSelect = (e, { result }) => this.setState({ value: result.company_name })

  handleChange = (e, { name, value, groupname, index }) => {
    if(groupname) {
      var newArray = update(
        this.state[groupname],
        {
          [index]: { [name]:  {$set : value} }
        }
      )
      this.setState({ [groupname]: newArray })
    } else {
      this.setState({ [name]: value })
    }
  }


  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()
      console.log(e)
      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.company_name)

      this.setState({
        isLoading: false,
        results: _.filter(source, isMatch),
      })
    }, 300)
  }

  handleResultSelect = (e, { result, index }) => {
    this.setState(prevState => {
      const updatedVendors = update(
        prevState.vendors,
        {
          [index]: { vendor: {$set: result.title} }
        }
      )
      return { vendors : updatedVendors }
    })
  }

  render() {
    const { isLoading, value, results } = this.state

    return (
      <div style={{margin: "10px 100px"}}>
        <Segment inverted style={{padding: "40px", width:"400px"}}>

          <Form inverted>

            <Form.Field>
              <Form.Input
                name="date"
                type="date"
                fluid label="Date"
              />
            </Form.Field>

            <Search
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
            results={results}
            value={value}
            {...this.props}
          />

          </Form>

        </Segment>
      </div>
    )
  }
}
