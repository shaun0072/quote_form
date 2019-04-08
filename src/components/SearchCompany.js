import _ from 'lodash'
import React, { Component } from 'react'
//import qs from 'qs'
import axios from 'axios';
import { Search, Grid } from 'semantic-ui-react'


export default class SearchCompany extends Component {
  constructor(props) {
    super(props)

    this.state = {
      source : {}
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

  resetComponent = () => this.setState({ isLoading: false, results: [], value: ''})

  handleResultSelect = (e, {result}) => this.setState({ value: result.title })

  handleSearchChange = (e,{value}) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.title) || re.test(result.model_number)

      const filteredResults = _.reduce(
        this.state.source,
        (memo, data, name) => {
          const results = _.filter(data.results, isMatch)
          if (results.length) memo[name] = { name, results } // eslint-disable-line no-param-reassign

          return memo
        },
        {},
      )

      this.setState({
        isLoading: false,
        results: filteredResults,
      })
    }, 300)
  }

  render() {
    const { isLoading, value, results } = this.state

    return (
      <Grid>
        <Grid.Column>
          <Search
            category
            size={'large'}
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={this.handleSearchChange}
            results={results}
            value={value}
            resultRenderer={
              ({ price, title, description }) => [
                <div key='content' className='content'>
                  {price && <div className='price'>{price}</div>}
                  {title && <div className='title'>{title}</div>}
                  {description && <div className='description'>{description}</div>}
                </div>,
              ]
            }
            {...this.props}
          />
        </Grid.Column>
      </Grid>
    )
  }
}
