import React from 'react'
import { Icon, Button } from 'semantic-ui-react'

export const AddRemoveFormGroupBtns = ({ onMinusClick, onPlusClick }) => (
  <div style={{cursor: "pointer", padding: "5px 0", display: "inline"}}>
    <Button.Group icon style={{marginBottom: "25px"}}>
       <Button
         onClick={(e)=>{
           e.preventDefault()
           onPlusClick()
         }}
       >
         <Icon
           name='plus'
         />
       </Button>
       <Button
         onClick={(e)=>{
           e.preventDefault()
           onMinusClick()
         }}
        >
         <Icon
           name='minus'
         />
       </Button>
     </Button.Group>
  </div>
)
