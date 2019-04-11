import _ from 'lodash'
import qs from 'qs'
import React, { Component } from 'react'
import { Search, Form, Segment, Divider, Header, Icon, Message } from 'semantic-ui-react'
import axios from 'axios'
import jsPDF from 'jspdf'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import update from 'immutability-helper'
import ItemFormGroup from './ItemFormGroup'
import { AddRemoveFormGroupBtns } from './AddRemoveFormGroupBtns'

const print = (company, contact="", email="", phone="", date, items, spec, bakeRequirement, genericProcess, quoter, quoteNumber, bakeFirst) => {
  var doc = new jsPDF();
  doc.addImage(imgData, 'JPEG',0,0,209,280);
  doc.setFont('courier');
  doc.setFontType('normal');
  doc.setFontSize('12');
  genericProcess = (bakeFirst) ? "Blast / " + genericProcess : genericProcess;
  var originalFormattedDate = date.toLocaleDateString("en-US");
  var newOFD = originalFormattedDate.replace(/[\u200E]/g, '');
  var newdate = new Date(date)
  var expirationDate = newdate.setDate(newdate.getDate() + 60);
  var formattedDate = new Date(expirationDate);
  var blub = formattedDate.toLocaleDateString("en-US");
  var newblub = blub.replace(/[\u200E]/g, '');
  doc.text(155, 37.1, newOFD); //Date of Quote
  doc.text(155, 44, quoteNumber); //Quote Number
  doc.text(155, 50.5, newblub);//Valid Until Date
  doc.text(43, 84.2, company); //Company
  doc.text(43, 90.44, contact); //Company Contact
  doc.text(43, 96.68, email); //Company Email
  doc.text(43, 102.92, phone); //Company Phone
  doc.text(60, 113, genericProcess); //Process
  doc.text(24, 127, spec);//Specification
  doc.text(130, 127, bakeRequirement);//Bake
  doc.text(156, 267.5, quoter);//Quoter
  var positiony = 135.5;
  for(var i=0;i<items.length;i++) {//Items
    if(items[i].partNumber) {
      var number = i + 1;
      var costUOM = '$' + parseFloat(Math.round(items[i].cost * 100) / 100).toFixed(2) + items[i].unit;
      positiony = positiony + 6.24;
      doc.text(28, positiony, number.toString())
      doc.text(41, positiony, items[i].partNumber)
      doc.text(136, positiony, items[i].qty)
      doc.text(159, positiony, costUOM)
    }
  }
  doc.save(items[0].partNumber + '.pdf')
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

export default class SearchExampleStandard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      startDate: new Date(),
      items: [
        {
          partNumber: "",
          qty: "",
          cost: "",
          unit: "/ea"
        }
      ],
      itemCount: 1,
      quoter: '',
      genericProcess: '',
      spec: '',
      bakeRequirement: 'None',
      submitDisabled: true,
      validated: false,
      blastFirst: false
    }
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount() {
    this.getCustomers()
    axios.get("http://www.tmf.party/php/get_quote_number.php")
      .then(res => {
        this.setState({
          quoteNumber : pad((parseInt(res.data) + 1), 4)
        });
      })
  }

  componentWillMount() {
    this.resetComponent()
  }

  getCustomers = () => {
    axios.get("http://www.tmf.party/php/get_customers.php")
      .then(res => {
        this.setState({
          source : res.data
        });
      })
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], companyName: '' })

  handleResultSelect = (e, { result }) => this.setState({
    companyName: result.title,
    contact: result.description ,
    email: result.email,
    phone: result.phone
  })

  handleSubmit = () => {

    var newCompany = {
      company_name: this.state.companyName,
      contact: this.state.contact,
      email: this.state.email,
      phone: this.state.phone
    }

    print(this.state.companyName, this.state.contact, this.state.email, this.state.phone, this.state.startDate, this.state.items, this.state.spec, this.state.bakeRequirement, this.state.genericProcess, this.state.quoter, this.state.quoteNumber, this.state.blastFirst)

    axios.get("http://www.tmf.party/php/generate_new_quote.php")
      .then(res => {
        this.setState({
          quoteNumber: pad(parseInt(res.data), 4),
          startDate: new Date(),
          items: [
            {
              partNumber: "",
              qty: "",
              cost: "",
              unit: ""
            }
          ],
          itemCount: 1,
          quoter: '',
          genericProcess: '',
          spec: '',
          bakeRequirement: 'None',
          submitDisabled: true,
          validated: false,
          companyName: '',
          contact: '',
          email: '',
          phone: '',
          blastFirst: false
        })
      })

      if(this.state.addToDatabase) {
        axios.post("http://www.tmf.party/php/add_customer.php",
        qs.stringify(newCompany))
          .then(res => {
            this.getCustomers()
          })
      }

  }

  validate = () => {
    if(this.state.quoter && this.state.companyName && this.state.genericProcess && this.state.spec && this.state.items[0].cost && this.state.items[0].qty && this.state.items[0].unit && this.state.items[0].partNumber) {
      this.setState({
        validated: true
      })
    } else {
      this.setState({
        validated: false
      })
    }
  }

  handleDateChange(date) {
    this.setState({
      startDate: date
    });
  }


  handleChange = (e, { name, value, groupname, index }) => {
    if(groupname) {
      var newArray = update(
        this.state[groupname],
        {
          [index]: { [name]:  {$set : value} }
        }
      )
      this.setState({ [groupname]: newArray }, () => this.validate())
    } else {
      this.setState({ [name]: value }, () => {
        this.validate()
      })
    }


  }

  handleSearchChange = (e, { value, source }) => {
    this.setState({ isLoading: true, companyName: value, source },  () => this.validate())

    setTimeout(() => {
      if (this.state.companyName.length < 1) return this.resetComponent()

      const re = new RegExp(_.escapeRegExp(this.state.companyName), 'i')
      const isMatch = result => re.test(result.title)

      this.setState({
        isLoading: false,
        results: _.filter(source, isMatch),
      },  () => this.validate())
    }, 0)

    this.validate();
  }

  renderItemFormGroup = numberOfElements => {
    let itemFormGroup = []
    for(var i=0; i < numberOfElements;i++) {
      itemFormGroup.push(
        <ItemFormGroup
          groupname="items"
          partNumber={this.state.items[i].partNumber}
          qty={this.state.items[i].qty}
          cost={this.state.items[i].cost}
          unit={this.state.items[i].unit}
          index={i}
          key={i}
          onChange={this.handleChange}
          isMultLocations = {numberOfElements > 1}
        />
      )
    }
    return itemFormGroup
  }

  addGroup = ( counter, groupname, groupnameValues ) => () => {
    this.setState(prevState => (
      { [counter] : (prevState[counter] + 1), [groupname]: [...prevState[groupname], groupnameValues]}
  ))}

  removeGroup = ( counter, groupname ) => () => {
    this.setState(prevState => (
    {
      [counter]: (prevState[counter] > 1) ? (prevState[counter] - 1) : prevState[counter],
      [groupname]: (prevState[counter] > 1) ? this.removeElement(prevState[groupname]) : prevState[groupname]
    }
  ))}

  removeElement = group => {
    const copiedArray = [...group]
    copiedArray.splice(-1,1)
    return copiedArray
  }

  getSpecs = (process) => {
    switch(process) {
      case 'Rack Zinc Plate/Clear Chromate':
        return [
          {text:'ASTM B633-19, SC1, Type V', key: 1, value: 'ASTM B633-19, SC1, Type V'},
          {text:'ASTM B633-19, SC2, Type V', key: 2, value: 'ASTM B633-19, SC2, Type V'},
          {text:'ASTM B633-19, SC3, Type V', key: 3, value: 'ASTM B633-19, SC3, Type V'},
          {text:'ASTM B633-19, SC4, Type V', key: 4, value: 'ASTM B633-19, SC4, Type V'},
          {text:'EControls E2159-001-010', key: 5, value: 'EControls E2159-001-010'},
          {text:'Eaton ES2751(K)', key: 6, value: 'Eaton ES2751(K)'},
          {text:'McElroy ES264B', key: 7, value: 'McElroy ES264B'},
          {text:'Crosby ST-359(1)', key: 8, value: 'Crosby ST-359(1)'},
          {text:'JDS 117 Fe/Zn 5-15 C', key: 9, value: 'JDS 117 Fe/Zn 5-15 C'},
          {text:'JDM F23C', key: 10, value: 'JDM F23C'}
        ];
      case 'Rack Zinc Plate/Yellow Chromate':
        return [
          {text: 'ASTM B633-19, SC1, Type VI', key: 1, value: 'ASTM B633-19, SC1, Type VI'},
          {text: 'ASTM B633-19, SC2, Type VI', key: 2, value: 'ASTM B633-19, SC2, Type VI'},
          {text: 'ASTM B633-19, SC3, Type VI', key: 3, value: 'ASTM B633-19, SC3, Type VI'},
          {text: 'ASTM B633-19, SC4, Type VI', key: 4, value: 'ASTM B633-19, SC4, Type VI'},
          {text: 'Altec MTS-0016-D', key: 5, value: 'Altec MTS-0016-D'},
          {text: 'McElroy ES264A', key: 6, value: 'McElroy ES264A'}
        ];
      case 'Barrel Zinc Plate/Clear Chromate':
        return [
          {text:'ASTM B633-19, SC1, Type V', key: 1, value: 'ASTM B633-19, SC1, Type V'},
          {text:'ASTM B633-19, SC2, Type V', key: 2, value: 'ASTM B633-19, SC2, Type V'},
          {text:'ASTM B633-19, SC3, Type V', key: 3, value: 'ASTM B633-19, SC3, Type V'},
          {text:'Deere JDS 117, Fe/Zn 5-15c C', key: 4, value: 'Deere JDS 117, Fe/Zn 5-15c C'},
          {text:'Deere JDM F23C', key: 5, value: 'Deere JDM F23C'},
          {text:'JDM F23C-2A', key: 6, value: 'JDM F23C-2A'},
          {text:'Altec MTS-0016(D)', key: 7, value: 'Altec MTS-0016(D)'}
        ];
      case 'Barrel Zinc Plate/Yellow Chromate':
        return [
          {text: 'ASTM B633-19, SC1, Type VI', key: 1, value: 'ASTM B633-19, SC1, Type VI'},
          {text: 'ASTM B633-19, SC2, Type VI', key: 2, value: 'ASTM B633-19, SC2, Type VI'},
          {text: 'ASTM B633-19, SC3, Type VI', key: 3, value: 'ASTM B633-19, SC3, Type VI'},
          {text: 'Altec MTS-0016-D', key: 4, value: 'Altec MTS-0016-D'},
        ];
      case 'Electroless Nickel Plate':
        return [
          {text: 'ASTM B733-15, Type IV, SC 1, Class 1', key: 1, value: 'ASTM B733-15, Type IV, SC 1, Class 1'},
          {text: 'ASTM B733-15, Type IV, SC 1, Class 2', key: 2, value: 'ASTM B733-15, Type IV, SC 1, Class 2'},
          {text: 'ASTM B733-15, Type IV, SC 2, Class 1', key: 3, value: 'ASTM B733-15, Type IV, SC 2, Class 1'},
          {text: 'ASTM B733-15, Type IV, SC 2, Class 2', key: 4, value: 'ASTM B733-15, Type IV, SC 2, Class 2'},
          {text: 'ASTM B733-15, Type IV, SC 3, Class 1', key: 5, value: 'ASTM B733-15, Type IV, SC 3, Class 1'},
          {text: 'ASTM B733-15, Type IV, SC 3, Class 2', key: 6, value: 'ASTM B733-15, Type IV, SC 3, Class 2'},
          {text: 'ASTM B733-15, Type IV, SC 4, Class 1', key: 7, value: 'ASTM B733-15, Type IV, SC 4, Class 1'},
          {text: 'ASTM B733-15, Type IV, SC 4, Class 2', key: 8, value: 'ASTM B733-15, Type IV, SC 4, Class 2'},
          {text: 'ENC 4E00601(B), Code C01', key: 9, value: 'ENC 4E00601(B), Code C01'},
          {text: 'MIL-C-26074(E), Class 1, Grade B', key: 10, value: 'MIL-C-26074(E), Class 1, Grade B'},
          {text: 'Mil-C-26074(E), Class 2, Grade C', key: 11, value: 'Mil-C-26074(E), Class 2, Grade C'}
        ];
      case 'Zinc Phosphate':
        return [
          {text: 'MIL-DTL-16232G, Type Z, Class 1', key: 1, value: 'MIL-DTL-16232G, Type Z, Class 1'},
          {text: 'MIL-DTL-16232G, Type Z, Class 2', key: 2, value: 'MIL-DTL-16232G, Type Z, Class 2'},
          {text: 'MIL-DTL-16232G, Type Z, Class 3', key: 3, value: 'MIL-DTL-16232G, Type Z, Class 3'},
          {text: 'MIL-DTL-16232G, Type Z, Class 4', key: 4, value: 'MIL-DTL-16232G, Type Z, Class 4'}
        ];
      case 'Manganese Phosphate':
        return [
          {text: 'MIL-DTL-16232 Type M Class 1', key: 1, value: 'MIL-DTL-16232 Type M Class 1'},
          {text: 'MIL-DTL-16232G, Type M, Class 1', key: 2, value: 'MIL-DTL-16232G, Type M, Class 1'},
          {text: 'MIL-DTL-16232G, Type M, Class 2', key: 3, value: 'MIL-DTL-16232G, Type M, Class 2'},
          {text: 'MIL-DTL-16232G, Type M, Class 3', key: 4, value: 'MIL-DTL-16232G, Type M, Class 3'},
          {text: 'MIL-DTL-16232G, Type M, Class 4', key: 5, value: 'MIL-DTL-16232G, Type M, Class 4'}
        ];
      case 'Passivate':
        return [
          {text: 'ASTM A967-05, Nitric 1', key: 1, value: 'ASTM A967-05, Nitric 1'},
          {text: 'ASTM A967-05, Nitric 2', key: 2, value: 'ASTM A967-05, Nitric 2'},
          {text: 'QQ-P-35, Type II', key: 3, value: 'QQ-P-35, Type II'},
          {text: 'QQ-P-35(C), Type VI', key: 4, value: 'QQ-P-35(C), Type VI'},
          {text: 'ASTM A967-17', key: 5, value: 'ASTM A967-17'},
          {text: 'AMS-QQ-P-35, Type II', key: 6, value: 'AMS-QQ-P-35, Type II'},
          {text: 'Weber WPS-204(J)', key: 7, value: 'Weber WPS-204(J)'},
          {text: 'AMS 2700E, Method 1, Type 6', key: 8, value: 'AMS 2700E, Method 1, Type 6'},
          {text: 'Mil-STD-171, Par. 5.4.1', key: 9, value: 'Mil-STD-171, Par. 5.4.1'}
        ];
      case 'Chemical Conversion Coat/Yellow':
        return [
          {text: 'MIL-DTL-5541F, Type I, Class 1A', key: 1, value: 'MIL-DTL-5541F, Type I, Class 1A'},
          {text: 'MIL-DTL-5541F, Type I, Class 3', key: 2, value: 'MIL-DTL-5541F, Type I, Class 3'},
          {text: 'MIL-STD-171, Finish 7.3.1', key: 3, value: 'MIL-STD-171, Finish 7.3.1'},
          {text: 'Mil-Std-171, Par. 7.3.1', key: 4, value: 'Mil-Std-171, Par. 7.3.1'}
        ];
      case 'Chemical Conversion Coat/Clear':
        return [
          {text: 'MIL-DTL-5541F, Type II, Class 1A', key: 1, value: 'MIL-DTL-5541F, Type II, Class 1A'},
          {text: 'MIL-DTL-5541F, Type II, Class 3', key: 2, value: 'MIL-DTL-5541F, Type II, Class 3'},
          {text: 'B/E Aerospace SPG-MPS-006', key: 3, value: 'B/E Aerospace SPG-MPS-006'},
          {text: 'Zodiac WPS-206(AE)', key: 4, value: 'Zodiac WPS-206(AE)'},
          {text: 'Mil-Std-171, Par. 7.3.1', key: 5, value: 'Mil-Std-171, Par. 7.3.1'},
          {text: 'ENC 4E00601(B), Code D01', key: 6, value: 'ENC 4E00601(B), Code D01'}
        ];
      case 'Hard Anodize':
        return [
          {text: 'MIL-A-8625F, Type III, Class 1', key: 1, value: 'MIL-A-8625F, Type III, Class 1'}
        ];
      case 'Clear Anodize':
        return [
          {text: 'MIL-A-8625, Type II Class 1', key: 1, value: 'MIL-A-8625, Type II Class 1'}
        ];
      case 'Rack Zinc-Nickel Plate':
        return [
          {text: 'AMS2417J, Type 2, Grade B', key: 1, value: 'AMS2417J, Type 2, Grade B'}
        ];
      case 'Barrel Zinc-Nickel Plate':
        return [
          {text: 'AMS2417H, Type 2, Grade B', key: 1, value: 'AMS2417H, Type 2, Grade B'}
        ];
      default:
        return [
          {text: 'N/A', key: 1, value: 'N/A'}
        ];
    }
  }

  render() {
    const { isLoading, companyName, results, itemCount, quoter, genericProcess, spec, bakeRequirement, addToDatabase, blastFirst} = this.state

    return (
      <div className="form-container">

        <Header as='h1' icon style={{margin: "50px auto 30px", width: "100%"}}>
          <Icon name="wpforms" />
          Generate Quote Form
        </Header>

        <Segment>
          <Message>
            <Message.Header>Quote Number</Message.Header>
            <p>{this.state.quoteNumber}</p>
          </Message>

          <Form style={{padding: "30px"}} onSubmit={this.handleSubmit}>

            <Form.Field>
              <label>Date</label>
              <DatePicker
                selected={this.state.startDate}
                onChange={this.handleDateChange}
                todayButton={"Today"}
              />
            </Form.Field>

            <Form.Group inline>
              <label>Quoter: </label>
              <Form.Field>
                <Form.Radio
                  label='Mark'
                  name='quoter'
                  value='Mark Kennedy'
                  checked={quoter === 'Mark Kennedy'}
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
               <Form.Radio
                 label='Matt'
                 name='quoter'
                 value='Matthew Kennedy'
                 checked={quoter === 'Matthew Kennedy'}
                 onChange={this.handleChange}
               />
              </Form.Field>
            </Form.Group>

            <Divider horizontal>Customer</Divider>

            <Form.Field>
              <label>Company Name</label>
              <Search
                loading={isLoading}
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                results={results}
                value={companyName}
                source={this.state.source}
                {...this.props}
              />
            </Form.Field>

            <Form.Field>
              <Form.Input
                name="contact"
                label="Contact"
                value={this.state.contact || ""}
                onChange={this.handleChange}
              />
            </Form.Field>

            <Form.Field>
              <Form.Input
                name="email"
                label="Email"
                value={this.state.email || ""}
                onChange={this.handleChange}
              />
            </Form.Field>

            <Form.Field>
              <Form.Input
                name="phone"
                label="Phone"
                value={this.state.phone || ""}
                onChange={this.handleChange}
              />
            </Form.Field>

            <Form.Field>
              <Form.Checkbox
                label="Add This Info to Database"
                checked={addToDatabase}
                onChange={() => (this.setState(prevState => ({addToDatabase : !prevState.addToDatabase})))}
              />
            </Form.Field>

            <Divider horizontal>Items and Specifications</Divider>

            <Form.Group inline>
              <label>Blast First?</label>
              <Form.Field>
                <Form.Radio
                  name="blastFirst"
                  value={true}
                  label="Yes"
                  checked={blastFirst === true}
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Form.Radio
                  name="blastFirst"
                  value={false}
                  label="No"
                  checked={blastFirst === false}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form.Group>

            <Form.Group>
              <Form.Field>
                <Form.Dropdown
                  name="genericProcess"
                  value={genericProcess}
                  onChange={this.handleChange}
                  required
                  button={true}
                  placeholder='Choose Process'
                  options={[
                    {text:'Rack Zinc Plate/Clear Chromate', value: 'Rack Zinc Plate/Clear Chromate', key: 1},
                    {text:'Rack Zinc Plate/Yellow Chromate', value: 'Rack Zinc Plate/Yellow Chromate', key: 2},
                    {text:'Barrel Zinc Plate/Clear Chromate', value: 'Barrel Zinc Plate/Clear Chromate', key: 3},
                    {text:'Barrel Zinc Plate/Yellow Chromate', value: 'Barrel Zinc Plate/Yellow Chromate', key: 4},
                    {text:'Electroless Nickel Plate', value: 'Electroless Nickel Plate', key: 5},
                    {text:'Zinc Phosphate', value: 'Zinc Phosphate', key: 6},
                    {text:'Manganese Phosphate', value: 'Manganese Phosphate', key: 7},
                    {text:'Passivate', value: 'Passivate', key: 8},
                    {text:'Chemical Conversion Coat/Yellow', value: 'Chemical Conversion Coat/Yellow', key: 9},
                    {text:'Chemical Conversion Coat/Clear', value: 'Chemical Conversion Coat/Clear', key: 10},
                    {text:'Hard Anodize', value: 'Hard Anodize', key: 11},
                    {text:'Clear Anodize', value: 'Clear Anodize', key: 12},
                    {text:'Rack Zinc-Nickel Plate', value: 'Rack Zinc-Nickel Plate', key: 13},
                    {text:'Barrel Zinc-Nickel Plate', value: 'Barrel Zinc-Nickel Plate', key: 14},
                    {text:'Strip and Oil', value: 'Strip and Oil', key: 15}
                  ]}
                />
              </Form.Field>

              <Form.Field>
              {genericProcess &&
                <Form.Dropdown
                  name="spec"
                  value={spec}
                  onChange={this.handleChange}
                  required
                  button={true}
                  placeholder='Choose Specification'
                  options={this.getSpecs(genericProcess)}
                />
              }
              </Form.Field>
            </Form.Group>

            <Form.Field>
            <Form.Dropdown
              name="bakeRequirement"
              value={bakeRequirement}
              onChange={this.handleChange}
              button={true}
              placeholder='Bake'
              label='Bake Requirement'
              options={[
                {text:'None', value: "None", key: 1},
                {text:'ASTM B850-98', value: "ASTM B850-98", key: 2},
              ]}
            />
            </Form.Field>

            {this.renderItemFormGroup(itemCount)}
            <AddRemoveFormGroupBtns
              onPlusClick={this.addGroup("itemCount", "items", {partNumber:"", qty:"", cost:"", unit:"/ea"})}
              onMinusClick={this.removeGroup("itemCount", "items")}
            />


            <Form.Field>
              <Form.Button size="huge" primary disabled={!this.state.validated}>Create Quote</Form.Button>
            </Form.Field>

          </Form>
        </Segment>
      </div>

    )
  }
}