import { useTheme } from '@emotion/react';
import { DeleteOutlined } from '@mui/icons-material';
import { Box, Button, InputBase, TextField, Grid, Tooltip, Typography, styled, tooltipClasses } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridEditInputCell, GridRowEditStopReasons, GridRowModes, GridToolbarContainer, GRID_DATE_COL_DEF, useGridApiContext } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import { tokens } from '../../../theme';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CurrencyInput from './fields/CurrencyInput';

function EditToolbar(props) {
  const {setRows, rows, setRowModesModel} = props
  
  const handleClick = () =>{
    const id = rows.length + 1
    setRows((oldRows) => [...oldRows, { id , dueDate: null,  principal : '', interest : 0, numberDays : '',  bank_name : null, checkNumber: '', check_date : null, net_proceeds : 0, isNew : true}])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id] : { mode: GridRowModes.Edit, fieldToFocus: 'dueDate' }
    }))
  }

  return (
    <GridToolbarContainer>
      <Button color='secondary' onClick={handleClick}>
        Add PDC
      </Button>
    </GridToolbarContainer>
  )
}

const formatNumber = (params) =>{
  const format = Number(params.value).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
  return format
}

const StyledToolTip = styled(({className, ...props}) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));


const renderAmount = (props) => {
  const {error} = props
  return (
    <StyledToolTip open={!!error} title={error} >
      <GridEditInputCell {...props} />
    </StyledToolTip> 
  )
}

const handleAmountValidation = async (params) => {
  
  const error = new Promise((resolve) => {
    resolve(Number(params.props.value) <= 0 ? `Invalid Amount` : null)
  });
  return params.hasChanged ? {...params.props, error : await error} :  {...params.props}
}

const WrappedGridEditDateInput = (props) => {
  const {placeholder, value, ...other} = props
  return (
  <InputBase sx={{padding : '0 15px', fontSize : 'inherit'}}
    {...props.InputProps}
    placeholder={placeholder}
    value={value}
    {...other}
  />
)
}

const GridDatePicker = (params) => {
  const refApi = useGridApiContext()
  const {value, id, field} = params

  const handleChange = (newValue) => {
    refApi.current.setEditCellValue({ id, field, value: newValue })
  }

  return ( 
  <DatePicker
    value={value}
    sx={{px : 1.5}}
    onChange={handleChange}
    slots={{
      textField : WrappedGridEditDateInput
    }} 
  />)
}

const GridCurrency = (params) => {
  const refApi = useGridApiContext()
  const {value, id, field} = params
  const handleChange = (newValue) => {
    refApi.current.setEditCellValue({ id, field, value: newValue.floatValue })
  }
  return <CurrencyInput sx={{ px : 1.5}} value={value} customInput={InputBase} onValueChange={handleChange}/>
}

const CustomFooter  = (props) => {
  return (
    <Box margin={1} >
      <Box display='flex'>
        <Box display='flex' alignItems='center' width={'20%'}> 
          <Typography >Total</Typography>
        </Box>
        <Box flex={1}>
          <Box mx={1} display='flex' alignItems='center'>
            <Typography flex={1}>Check Amount</Typography>
            <Typography flex={1}>Interest</Typography>
            <Typography flex={1}>Net Proceeds</Typography>
          </Box>
          <Box mx={1} display='flex' alignItems='center'>
            <CurrencyInput displayType='text' value={props.principal_total} 
              renderText={
                (val) => <Typography flex={1}>{val}</Typography>
              } /> 
            <CurrencyInput value={props.interest_total} displayType='text' 
              renderText={
                (val) => <Typography flex={1}>{val}</Typography>
              } />
            <CurrencyInput value={props.amortization_total} displayType='text' 
              renderText={
                (val) => <Typography flex={1}>{val}</Typography>
              } />
          </Box>
        </Box>
      </Box>
    </Box>

  )
}

export default function LoanDetailsTable({banks, rows, setRows, formValue}) {

  const theme = useTheme()
  const colors =  tokens(theme.palette.mode)
  const [rowModesModel, setRowModesModel] = useState({})
  const [pricipalTotal, setPricipalTotal] = useState(0)
  const [interestTotal, setInterestTotal] = useState(0)
  const [netProceeds, setNetProceeds] = useState(0)
  
  const handleDelete = (id) => {
    const filterRows = rows.filter((row) => row.id !== id).map((r,i) =>  ({...r, id : i + 1}) )
    setRows(filterRows)
  }

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowInputChange = (newRow) => {
    const updatedRow = { ...newRow, isNew : false}
    console.log(163, {...newRow})
    setRows(rows.map((row)=> (row.id === newRow.id ? updatedRow : row)))
    return updatedRow
  }

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
  
  useEffect(() => {
    
      setPricipalTotal(rows.reduce((acc, cur) => acc + cur.principal, 0))
      setInterestTotal(rows.reduce((acc, cur) => acc + cur.interest, 0))
      setNetProceeds(rows.reduce((acc, cur) => acc + cur.net_proceeds, 0))
    
  }, [rows])

  const columns = [
    { field: 'dueDate', headerName: 'Cleared Date', editable: true, width: 150,
      GRID_DATE_COL_DEF, 
      renderEditCell : (params) => { return <GridDatePicker {...params} />} ,
      valueFormatter : (params) => {
        if(params.value){
          return dayjs(params.value).format('MM/DD/YYYY')
        }
        return ''
      }
    },
    { field: 'check_date', headerName: 'Check Date', editable: true, width: 150,
      GRID_DATE_COL_DEF, 
      renderEditCell : (params) => { return <GridDatePicker {...params} />} ,
      valueFormatter : (params) => {
        if(params.value){
          return dayjs(params.value).format('MM/DD/YYYY')
        }
        return ''
      }
    },
    { field: 'principal', headerName: 'Check Amount', width: 150, editable: true,
      valueFormatter : (params) => {
        return formatNumber(params)
      },
      preProcessEditCellProps :  handleAmountValidation,
      renderEditCell : GridCurrency
    },
     
    { field: 'bank_name', headerName: 'Bank', width: 120, editable: true, type : 'singleSelect', valueOptions : banks.filter((b) => +b.owner == 0),
      getOptionValue: (value) => value.bank_branch,
      getOptionLabel: (value) => value.bank_branch,
    },
    { field: 'checkNumber', headerName: 'Check Number', width: 120, editable: true,},
    { field : 'numberDays', headerName : 'NO. of Days', width : 120,  editable: true,
      valueSetter : (params) => {
        if(params.row.dueDate){
          const now = dayjs()
          const dif = Math.abs(now.diff(params.row.dueDate, 'day')) + 1
          return {...params.row, numberDays: dif}
        }
        return {...params.row}
      }
    }, 
    { field: 'interest', headerName: 'Interest', width: 150, editable : true,
      valueFormatter : (params) => {
        return formatNumber(params)
      },
      preProcessEditCellProps : (params) => {  // validate
        const err = params.props.value == undefined
        return { ...params.props, error: err };
      },
      renderEditCell : GridCurrency
    },
   
    { field: 'net_proceeds', headerName: 'Net Proceeds', editable: true, width: 150,
      renderEditCell : GridCurrency,
      valueFormatter : (params) => {
        return formatNumber(params)
      },
      valueSetter : (params) => {
        const dif = +params.row.principal - +params.row.interest 
        return {...params.row, net_proceeds : dif}
      }
    },
    
   
    { field: 'action', type : 'actions',
      getActions : ({id}) => {
        if(false) {}
        return [
          <GridActionsCellItem
            icon={<DeleteOutlined/>}
            color='inherit'
            label='edit'
            sx={{color: colors.redAccent[500], cursor: 'auto'}}
            onClick={(e) => handleDelete(id)}
          />
        ]
      }
    },
  ];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onProcessRowUpdateError={(error) => {
        console.log(258, error)
      }}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={handleRowInputChange}
      slots={{
        toolbar: EditToolbar,
        footer : CustomFooter
      }}
      slotProps={{
        toolbar: {setRows, rows, setRowModesModel},
        footer : {
          principal_total : pricipalTotal,
          interest_total : interestTotal,
          amortization_total : netProceeds
        }
      }}
    />
  )
}
